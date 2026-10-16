'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const ARTICLE_UID = 'api::article.article';
const ADMIN_UID = 'api::backend-admin.backend-admin';
const REVIEW_LOG_UID = 'api::review-log.review-log';

const LEVEL1_ROLE_NAMES = new Set([
  'article_level1_reviewer',
  'level1_reviewer',
  'reviewer_level1',
]);
const LEVEL2_ROLE_NAMES = new Set([
  'article_level2_reviewer',
  'level2_reviewer',
  'reviewer_level2',
]);
const SUPER_ADMIN_ROLE = 'super_admin';

const WORKFLOW_FIELDS = new Set([
  'review_status',
  'created_by_admin',
  'created_by_user',
  'level1_reviewer',
  'level2_reviewer',
  'level1_review_comment',
  'level1_review_date',
  'level2_review_comment',
  'level2_review_date',
  'publish_time',
  'published_by_admin',
  'rejection_reason',
  'reviewed_by_admin',
  'reviewed_by_leader',
  'admin_review_comment',
  'admin_review_date',
  'leader_review_comment',
  'leader_review_date',
]);

const ARTICLE_POPULATE = [
  'created_by_admin',
  'level1_reviewer',
  'level2_reviewer',
  'created_by_user',
  'primary_category',
  'secondary_category',
  'cover',
];

function roleName(admin) {
  const role = admin?.backend_role?.data || admin?.backend_role;
  return String(role?.name || '').trim().toLowerCase();
}

function roleDisplayName(admin) {
  const role = admin?.backend_role?.data || admin?.backend_role;
  return role?.display_name || role?.name || '';
}

function uniqueAdmins(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const key = String(item?.email || item?.documentId || item?.id || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isSuperAdmin(admin) {
  return roleName(admin) === SUPER_ADMIN_ROLE;
}

function isLevel1(admin) {
  return isSuperAdmin(admin) || LEVEL1_ROLE_NAMES.has(roleName(admin));
}

function isLevel2(admin) {
  return isSuperAdmin(admin) || LEVEL2_ROLE_NAMES.has(roleName(admin));
}

function asId(value) {
  if (value && typeof value === 'object') {
    return value.id ?? value.documentId ?? value.data?.id ?? value.data?.documentId;
  }
  return value;
}

function relationId(value) {
  const id = asId(value);
  return id === undefined || id === null ? null : String(id);
}

function hasProtectedField(data) {
  return Object.keys(data || {}).some((field) => WORKFLOW_FIELDS.has(field));
}

async function hasArticleAction(strapi, admin, actionName) {
  if (isSuperAdmin(admin)) return true;

  const roleId = relationId(admin?.backend_role);
  if (!roleId) {
    const legacyPermissions = admin.backend_role?.permissions;
    if (Array.isArray(legacyPermissions)) {
      if (actionName === 'review') return legacyPermissions.includes('manage_review');
      return ['create', 'update', 'delete', 'publish', 'unpublish'].includes(actionName)
        && legacyPermissions.includes('manage_articles');
    }
    if (actionName === 'review') return isLevel1(admin) || isLevel2(admin);
    return ['editor', 'admin'].includes(roleName(admin));
  }

  const module = await strapi.db.query('api::permission-module.permission-module').findOne({
    where: { name: 'articles' },
  });
  const articleGrants = module
    ? await strapi.db.query('api::role-permission.role-permission').findMany({
        where: {
          backend_role: Number(roleId) || roleId,
          permission_module: module.id,
        },
        populate: ['allowed_actions'],
      })
    : [];

  // Older installations may only have the coarse role permission list. Keep
  // that list as a compatibility fallback only when no article-module grant
  // exists for this role.

  if (articleGrants.length === 0) {
    const legacyPermissions = admin.backend_role?.permissions;
    if (!Array.isArray(legacyPermissions)) {
      if (actionName === 'review') return isLevel1(admin) || isLevel2(admin);
      return ['editor', 'admin'].includes(roleName(admin));
    }
    if (actionName === 'review') return legacyPermissions.includes('manage_review');
    return ['create', 'update', 'delete', 'publish', 'unpublish'].includes(actionName)
      && legacyPermissions.includes('manage_articles');
  }

  return articleGrants.some((grant) => {
    const actions = grant.allowed_actions?.data || grant.allowed_actions || [];
    return actions.some((action) => (action?.name || action?.data?.name) === actionName);
  });
}

const EDITABLE_STATUSES = new Set([
  'draft',
  'rejected_level1',
  'rejected_level2',
  'rejected_republish',
  'rejected_admin',
  'rejected_leader',
  'unpublished',
  'published',
]);

async function findBackendAdmin(strapi, key, populate = ['backend_role']) {
  const value = String(key ?? '').trim();
  if (!value) return null;

  const where = /^\d+$/.test(value)
    ? { id: Number(value) }
    : { documentId: value };

  let admin = await strapi.db.query(ADMIN_UID).findOne({ where, populate });
  if (!admin && value.includes('@')) {
    admin = await strapi.db.query(ADMIN_UID).findOne({
      where: { email: { $eqi: value } },
      populate,
    });
  }
  return admin;
}

async function getCurrentAdmin(ctx, strapi) {
  const identity = ctx.state.user;
  const email = typeof identity?.email === 'string' ? identity.email.trim().toLowerCase() : '';
  if (!identity || !email) {
    ctx.unauthorized('请先登录后台管理系统。');
    return null;
  }

  const admin = await strapi.db.query(ADMIN_UID).findOne({
    where: { email: { $eqi: email } },
    populate: ['backend_role'],
  });

  if (!admin || admin.is_active !== true || !admin.backend_role) {
    ctx.forbidden('当前账号没有有效的后台管理员资料或角色。');
    return null;
  }

  return admin;
}

function ownerMatches(article, admin, identity) {
  const relation = article?.created_by_admin;
  const owner = relation?.data || relation;
  if (owner) {
    const ownerId = relationId(owner);
    const attributes = owner.attributes || owner;
    const ownerEmail = String(attributes.email || '').trim().toLowerCase();
    const adminEmail = String(admin.email || '').trim().toLowerCase();
    return (
      ownerId === String(admin.id) ||
      ownerId === String(admin.documentId) ||
      Boolean(ownerEmail && adminEmail && ownerEmail === adminEmail)
    );
  }

  const legacyOwner = article?.created_by_user;
  return Boolean(legacyOwner && identity?.id && String(asId(legacyOwner)) === String(identity.id));
}

function assignedReviewerMatches(article, admin, field) {
  const reviewerId = relationId(article?.[field]);
  return reviewerId === String(admin.id) || reviewerId === String(admin.documentId);
}

function canManageLegacyUnownedArticle(article, admin) {
  return (
    !article?.created_by_admin &&
    new Set(['editor', 'admin', SUPER_ADMIN_ROLE]).has(roleName(admin)) &&
    new Set(['draft', 'rejected_level1', 'rejected_level2', 'rejected_admin', 'rejected_leader', 'rejected_republish', 'unpublished']).has(article.review_status)
  );
}

const STATUS_LABELS = {
  draft: '草稿',
  pending_level1: '一级审核中',
  rejected_level1: '一级审核退回',
  pending_level2: '二级审核中',
  rejected_level2: '二级审核退回',
  pending_republish: '修改待二级审核',
  rejected_republish: '修改审核退回',
  approved_pending_publish: '待发布',
  published: '已发布',
  unpublished: '已取消发布',
  pending_admin: '一级审核中',
  rejected_admin: '一级审核退回',
  pending_leader: '二级审核中',
  rejected_leader: '二级审核退回',
  approved: '待发布',
};

function adminSummary(admin) {
  if (!admin) return null;
  return {
    id: admin.id,
    documentId: admin.documentId,
    name: admin.name || admin.username || admin.email,
    email: admin.email,
    role: roleName(admin),
    role_display_name: roleDisplayName(admin),
  };
}

function makeTask(article, type, title, admin, extra = {}) {
  return {
    id: `article:${article.documentId || article.id}:${type}`,
    type,
    title,
    article_id: article.id,
    article_document_id: article.documentId,
    article_title: String(article.title || '未命名文章'),
    slug: article.slug,
    status: article.review_status,
    status_label: STATUS_LABELS[article.review_status] || article.review_status,
    updatedAt: article.updatedAt,
    createdAt: article.createdAt,
    submitter: adminSummary(article.created_by_admin),
    reviewer: adminSummary(admin),
    ...extra,
  };
}

function buildTasks(articles, admin, identity) {
  const tasks = [];
  const superAdmin = isSuperAdmin(admin);
  const level1 = isLevel1(admin);
  const level2 = isLevel2(admin);

  for (const article of articles || []) {
    const mine = ownerMatches(article, admin, identity);
    const status = article.review_status;

    // Super administrators can publish directly and do not need to enter the
    // two-level review queue. Keep one actionable task for that shortcut so
    // the workbench does not incorrectly present review tasks to them.
    if (superAdmin && status !== 'published') {
      tasks.push(makeTask(article, 'admin_publish', '超级管理员可直接发布', admin, {
        action_required: true,
        actions: ['preview', 'edit', 'publish'],
      }));
      continue;
    }

    if (level1 && (status === 'pending_level1' || status === 'pending_admin') &&
      (superAdmin || status === 'pending_admin' || assignedReviewerMatches(article, admin, 'level1_reviewer'))) {
      tasks.push(makeTask(article, 'review_level1', '处理一级审核', admin, {
        action_required: true,
        actions: ['preview', 'approve', 'reject'],
      }));
    }

    if (level2 && (status === 'pending_level2' || status === 'pending_leader' || status === 'pending_republish') &&
      (superAdmin || !article.level2_reviewer || assignedReviewerMatches(article, admin, 'level2_reviewer'))) {
      tasks.push(makeTask(article, 'review_level2', status === 'pending_republish' ? '处理修改后的二级审核' : '处理二级审核', admin, {
        action_required: true,
        actions: ['preview', 'approve', 'reject'],
      }));
    }

    if (!mine) continue;

    if (status === 'draft' || status === 'unpublished') {
      tasks.push(makeTask(article, 'author_submit', status === 'unpublished' ? '取消发布后重新提交' : '完善草稿并提交审核', admin, {
        action_required: true, actions: ['preview', 'edit', 'submit'],
      }));
    } else if (status === 'rejected_level1' || status === 'rejected_admin') {
      tasks.push(makeTask(article, 'author_revision_level1', '处理一级审核退回', admin, {
        action_required: true, actions: ['preview', 'edit', 'submit'],
        comment: article.rejection_reason || article.level1_review_comment || article.admin_review_comment || '',
      }));
    } else if (status === 'rejected_level2' || status === 'rejected_leader' || status === 'rejected_republish') {
      tasks.push(makeTask(article, 'author_revision_level2', '处理二级审核退回', admin, {
        action_required: true, actions: ['preview', 'edit', 'submit'],
        comment: article.rejection_reason || article.level2_review_comment || article.leader_review_comment || '',
      }));
    } else if (status === 'approved_pending_publish' || status === 'approved') {
      tasks.push(makeTask(article, 'author_publish', '审核通过，确认发布', admin, {
        action_required: true, actions: ['preview', 'publish'],
      }));
    } else if (status === 'pending_level1' || status === 'pending_admin' || status === 'pending_level2' || status === 'pending_leader' || status === 'pending_republish') {
      tasks.push(makeTask(article, 'author_tracking', '查看审核进度', admin, {
        action_required: false, actions: ['preview'],
      }));
    } else if (status === 'published') {
      tasks.push(makeTask(article, 'author_published', '已发布文章', admin, {
        action_required: false, actions: ['preview', 'edit', 'unpublish'],
      }));
    }
  }

  return tasks.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
}

async function findArticle(strapi, key) {
  const value = String(key ?? '').trim();
  if (!value) return null;
  const where = /^\d+$/.test(value)
    ? { id: Number(value) }
    : { documentId: value };
  return strapi.db.query(ARTICLE_UID).findOne({
    where,
    populate: ARTICLE_POPULATE,
  });
}

async function updateArticle(strapi, article, data) {
  return strapi.db.query(ARTICLE_UID).update({
    where: { id: article.id },
    data,
    populate: ARTICLE_POPULATE,
  });
}

async function writeReviewLog(strapi, { article, reviewer, action, fromStatus, toStatus, comment }) {
  try {
    await strapi.db.query(REVIEW_LOG_UID).create({
      data: {
        article: article.id,
        reviewer_admin: reviewer?.id || null,
        reviewer_role: roleName(reviewer),
        action,
        from_status: fromStatus,
        to_status: toStatus,
        comment: comment || null,
        review_date: new Date().toISOString(),
      },
    });
  } catch (error) {
    strapi.log.warn(`文章审核日志写入失败: ${error.message}`);
  }
}

function normalizeDecision(body) {
  const decision = String(body?.decision || '').trim().toLowerCase();
  if (decision === 'approve' || decision === 'approved' || decision === '通过') return 'approve';
  if (decision === 'reject' || decision === 'rejected' || decision === '退回') return 'reject';
  return '';
}

module.exports = createCoreController(ARTICLE_UID, ({ strapi }) => ({
  async create(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!(await hasArticleAction(strapi, admin, 'create'))) {
      return ctx.forbidden('当前角色没有创建文章的权限。');
    }

    const input = ctx.request.body?.data || {};
    const data = { ...input };
    const requestedOwner = input.created_by_admin;
    for (const field of WORKFLOW_FIELDS) delete data[field];

    data.review_status = 'draft';
    if (isSuperAdmin(admin) && requestedOwner !== undefined) {
      const owner = await findBackendAdmin(strapi, requestedOwner, ['backend_role']);
      if (!owner || owner.is_active !== true) {
        return ctx.badRequest('请选择有效的文章发布者。');
      }
      data.created_by_admin = owner.id;
    } else {
      data.created_by_admin = admin.id;
    }

    const result = await strapi.db.query(ARTICLE_UID).create({
      data,
      populate: ARTICLE_POPULATE,
    });
    await writeReviewLog(strapi, {
      article: result,
      reviewer: admin,
      action: 'create',
      fromStatus: '',
      toStatus: 'draft',
      comment: '',
    });
    ctx.body = { data: result };
  },

  async update(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!(await hasArticleAction(strapi, admin, 'update'))) {
      return ctx.forbidden('当前角色没有修改文章的权限。');
    }

    const input = ctx.request.body?.data || {};
    const protectedFields = Object.keys(input).filter(
      (field) => WORKFLOW_FIELDS.has(field) && !(isSuperAdmin(admin) && field === 'created_by_admin')
    );
    if (protectedFields.length > 0) {
      return ctx.badRequest('审核状态、审核人和发布时间只能通过文章审核流程操作。');
    }
    if (Object.prototype.hasOwnProperty.call(input, 'created_by_admin') && !isSuperAdmin(admin)) {
      return ctx.forbidden('只有超级管理员可以修改文章发布者。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');

    const isOwner = ownerMatches(article, admin, ctx.state.user);
    const allowed = isOwner || isSuperAdmin(admin);
    if (!allowed) return ctx.forbidden('只有文章发布者可以编辑这篇文章。');
    if (!isSuperAdmin(admin) && !EDITABLE_STATUSES.has(article.review_status)) {
      return ctx.forbidden('当前文章正在审核中，暂不能修改。');
    }

    const updateData = { ...input };
    const requestedOwner = updateData.created_by_admin;
    for (const field of WORKFLOW_FIELDS) delete updateData[field];
    if (isSuperAdmin(admin) && requestedOwner !== undefined) {
      const owner = await findBackendAdmin(strapi, requestedOwner, ['backend_role']);
      if (!owner || owner.is_active !== true) {
        return ctx.badRequest('请选择有效的文章发布者。');
      }
      updateData.created_by_admin = owner.id;
    }
    if (!article.created_by_admin && requestedOwner === undefined) updateData.created_by_admin = admin.id;
    // Editing a published article creates a new version that must pass the
    // second review before it replaces the published content.
    const wasPublished = article.review_status === 'published';
    if (wasPublished) {
      // A published article is withdrawn from the public channel while its
      // edited version goes through the complete first and second review
      // flow again.
      updateData.review_status = 'draft';
      updateData.publishedAt = null;
      updateData.level1_reviewer = null;
      updateData.level2_reviewer = null;
      updateData.level2_review_comment = null;
      updateData.level2_review_date = null;
      updateData.rejection_reason = null;
    }
    const result = await updateArticle(strapi, article, updateData);
    await writeReviewLog(strapi, {
      article: result,
      reviewer: admin,
      action: 'edit',
      fromStatus: article.review_status,
      toStatus: result.review_status || (wasPublished ? 'draft' : article.review_status),
      comment: wasPublished ? '修改已发布文章，重新进入两级审核。' : '',
    });
    ctx.body = { data: result };
  },

  async listLevel1Reviewers(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const allAdmins = await strapi.db.query(ADMIN_UID).findMany({
      where: { is_active: true },
      populate: ['backend_role'],
      orderBy: { name: 'asc' },
    });

    const reviewers = uniqueAdmins(allAdmins.filter((item) => LEVEL1_ROLE_NAMES.has(roleName(item))))
      .map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        email: item.email,
        role: roleName(item),
        role_display_name: roleDisplayName(item),
      }));

    ctx.body = { data: reviewers };
  },

  async listLevel2Reviewers(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const allAdmins = await strapi.db.query(ADMIN_UID).findMany({
      where: { is_active: true },
      populate: ['backend_role'],
      orderBy: { name: 'asc' },
    });

    const reviewers = uniqueAdmins(allAdmins.filter((item) => LEVEL2_ROLE_NAMES.has(roleName(item))))
      .map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        email: item.email,
        role: roleName(item),
        role_display_name: roleDisplayName(item),
      }));

    ctx.body = { data: reviewers };
  },

  async listPublishers(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const allAdmins = await strapi.db.query(ADMIN_UID).findMany({
      where: { is_active: true },
      populate: ['backend_role'],
      orderBy: { name: 'asc' },
    });

    ctx.body = {
      data: uniqueAdmins(allAdmins).map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        email: item.email,
        role: roleName(item),
        role_display_name: roleDisplayName(item),
      })),
    };
  },

  // Admin article lists must include draft and published Strapi documents.
  // The generated REST find endpoint defaults to the published content view,
  // which hides documents whose Strapi `publishedAt` is null even when the
  // custom workflow status says `published`.
  async adminList(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const query = ctx.query || {};
    const page = Math.max(1, Number(query.pagination?.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pagination?.pageSize || 10)));
    const filters = query.filters || {};
    const where = {};

    const relationFilter = (name) => {
      const relation = filters[name];
      const id = relation?.id?.$eq;
      if (id !== undefined && id !== '') where[name] = { id: Number(id) || id };
    };
    relationFilter('created_by_admin');
    relationFilter('primary_category');
    relationFilter('secondary_category');

    const status = filters.review_status?.$eq;
    if (status) where.review_status = status;
    for (const field of ['publish_time', 'updatedAt']) {
      const range = filters[field];
      if (range && (range.$gte || range.$lte)) {
        where[field] = {};
        if (range.$gte) where[field].$gte = range.$gte;
        if (range.$lte) where[field].$lte = range.$lte;
      }
    }

    const queriedRows = await strapi.db.query(ARTICLE_UID).findMany({
      where,
      populate: ARTICLE_POPULATE,
      orderBy: { createdAt: 'desc' },
    });
    // Strapi 5 can keep draft and published variants under one documentId.
    // The admin list represents a document once, using its most recently
    // updated variant (which is also the current custom-workflow state).
    const documents = new Map();
    for (const row of queriedRows || []) {
      const key = String(row.documentId || row.id);
      const current = documents.get(key);
      if (!current || String(row.updatedAt || '') > String(current.updatedAt || '')) {
        documents.set(key, row);
      }
    }
    const rows = Array.from(documents.values());

    const sortPath = String(query.sort || 'createdAt:desc').split(':');
    const sortField = sortPath[0];
    const sortDirection = sortPath[1] === 'asc' ? 1 : -1;
    const sortableFields = new Set([
      'title', 'created_by_admin.name', 'primary_category.name',
      'secondary_category.name', 'review_status', 'publish_time', 'updatedAt', 'createdAt',
    ]);
    const pathValue = (record, path) => path.split('.').reduce((value, key) => value?.[key], record);
    const safeSortField = sortableFields.has(sortField) ? sortField : 'createdAt';
    rows.sort((left, right) => {
      const a = pathValue(left, safeSortField);
      const b = pathValue(right, safeSortField);
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      const aValue = a instanceof Date ? a.getTime() : String(a).toLocaleLowerCase();
      const bValue = b instanceof Date ? b.getTime() : String(b).toLocaleLowerCase();
      const result = typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue), 'zh-CN', { numeric: true });
      return result * sortDirection;
    });

    const total = rows.length;
    const pageCount = Math.ceil(total / pageSize);
    const safePage = pageCount > 0 ? Math.min(page, pageCount) : 1;
    ctx.body = {
      data: rows.slice((safePage - 1) * pageSize, safePage * pageSize),
      meta: { pagination: { page: safePage, pageSize, pageCount, total } },
    };
  },

  async stats(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const rows = await strapi.db.query(ARTICLE_UID).findMany({
      select: ['id', 'documentId', 'review_status', 'updatedAt'],
      orderBy: { updatedAt: 'desc' },
    });
    const latestByDocument = new Map();
    for (const row of rows || []) {
      const key = String(row.documentId || row.id);
      if (!latestByDocument.has(key)) latestByDocument.set(key, row);
    }
    const articles = Array.from(latestByDocument.values());
    const published = articles.filter((article) => article.review_status === 'published').length;
    const pendingStatuses = new Set(['pending_level1', 'pending_level2', 'pending_admin', 'pending_leader', 'pending_republish']);
    const pending = articles.filter((article) => pendingStatuses.has(article.review_status)).length;
    ctx.body = { data: { published, pending } };
  },

  async submit(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!(await hasArticleAction(strapi, admin, 'update'))) {
      return ctx.forbidden('当前角色没有提交文章审核的权限。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    const isOwner = ownerMatches(article, admin, ctx.state.user);

    const allowedStatuses = new Set([
      'draft',
      'rejected_level1',
      'rejected_level2',
      'rejected_admin',
      'rejected_leader',
      'rejected_republish',
      'unpublished',
    ]);
    if (!allowedStatuses.has(article.review_status)) {
      return ctx.badRequest('当前文章状态不能提交审核。');
    }

    const canSubmit = isOwner || isSuperAdmin(admin);
    if (!canSubmit) return ctx.forbidden('只有文章发布者可以提交审核。');

    // A changed published article goes straight back to the second review.
    if (article.review_status === 'rejected_republish') {
      const updated = await updateArticle(strapi, article, {
        review_status: 'pending_republish',
        level2_review_comment: null,
        level2_review_date: null,
        rejection_reason: null,
      });
      await writeReviewLog(strapi, {
        article,
        reviewer: admin,
        action: 'submit_republish',
        fromStatus: article.review_status,
        toStatus: 'pending_republish',
        comment: '',
      });
      ctx.body = { data: updated };
      return;
    }

    const allReviewers = await strapi.db.query(ADMIN_UID).findMany({
      where: { is_active: true },
      populate: ['backend_role'],
      orderBy: { name: 'asc' },
    });
    const reviewers = uniqueAdmins(allReviewers.filter((item) => LEVEL1_ROLE_NAMES.has(roleName(item))));
    if (reviewers.length === 0) {
      return ctx.badRequest('系统中还没有启用的一级审核角色账号，请先配置角色和用户。');
    }

    const requested = ctx.request.body?.level1_reviewer_id ?? ctx.request.body?.data?.level1_reviewer_id;
    let reviewer = requested ? await findBackendAdmin(strapi, requested) : null;
    if (!reviewer && reviewers.length === 1) reviewer = reviewers[0];
    if (!reviewer || !LEVEL1_ROLE_NAMES.has(roleName(reviewer)) || reviewer.is_active !== true) {
      return ctx.badRequest('请选择有效的一级审核人员。');
    }

    const fromStatus = article.review_status;
    const updated = await updateArticle(strapi, article, {
      review_status: 'pending_level1',
      created_by_admin: admin.id,
      level1_reviewer: reviewer.id,
      level2_reviewer: null,
      level1_review_comment: null,
      level1_review_date: null,
      level2_review_comment: null,
      level2_review_date: null,
      rejection_reason: null,
      admin_review_comment: null,
      admin_review_date: null,
      leader_review_comment: null,
      leader_review_date: null,
    });

    await writeReviewLog(strapi, {
      article,
      reviewer: admin,
      action: 'submit',
      fromStatus,
      toStatus: 'pending_level1',
      comment: '',
    });

    ctx.body = { data: updated };
  },

  async level1Review(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!isLevel1(admin)) return ctx.forbidden('当前账号不是一级审核人员。');
    if (!(await hasArticleAction(strapi, admin, 'review'))) {
      return ctx.forbidden('当前角色没有一级审核权限。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    if (article.review_status !== 'pending_level1' && article.review_status !== 'pending_admin') {
      return ctx.badRequest('当前文章不在一级审核状态。');
    }
    if (article.review_status === 'pending_level1' && !isSuperAdmin(admin) && !assignedReviewerMatches(article, admin, 'level1_reviewer')) {
      return ctx.forbidden('这篇文章已指定其他一级审核人员。');
    }

    const decision = normalizeDecision(ctx.request.body);
    const comment = String(ctx.request.body?.comment || '').trim();
    if (!decision) return ctx.badRequest('审核决定只能是 approve 或 reject。');
    if (decision === 'reject' && !comment) return ctx.badRequest('退回时必须填写原因。');

    let level2Reviewer = null;
    if (decision === 'approve') {
      const allReviewers = await strapi.db.query(ADMIN_UID).findMany({
        where: { is_active: true },
        populate: ['backend_role'],
        orderBy: { name: 'asc' },
      });
      const reviewers = uniqueAdmins(allReviewers.filter((item) => LEVEL2_ROLE_NAMES.has(roleName(item))));
      const requested = ctx.request.body?.level2_reviewer_id ?? ctx.request.body?.data?.level2_reviewer_id;
      level2Reviewer = requested ? await findBackendAdmin(strapi, requested) : null;
      if (!level2Reviewer && reviewers.length === 1) level2Reviewer = reviewers[0];
      if (reviewers.length === 0) return ctx.badRequest('系统中还没有启用的二级审核角色账号，请先配置角色和用户。');
      if (!level2Reviewer || !LEVEL2_ROLE_NAMES.has(roleName(level2Reviewer)) || level2Reviewer.is_active !== true) {
        return ctx.badRequest('请选择有效的二级审核人员。');
      }
    }

    const nextStatus = decision === 'approve' ? 'pending_level2' : 'rejected_level1';
    const updated = await updateArticle(strapi, article, {
      review_status: nextStatus,
      level1_reviewer: admin.id,
      level1_review_comment: comment || null,
      level1_review_date: new Date().toISOString(),
      level2_reviewer: level2Reviewer?.id || null,
      rejection_reason: decision === 'reject' ? comment : null,
    });

    await writeReviewLog(strapi, {
      article,
      reviewer: admin,
      action: decision === 'approve' ? 'approve_level1' : 'reject_level1',
      fromStatus: article.review_status,
      toStatus: nextStatus,
      comment,
    });

    ctx.body = { data: updated };
  },

  async level2Review(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!isLevel2(admin)) return ctx.forbidden('当前账号不是二级审核人员。');
    if (!(await hasArticleAction(strapi, admin, 'review'))) {
      return ctx.forbidden('当前角色没有二级审核权限。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    if (article.review_status !== 'pending_level2' && article.review_status !== 'pending_leader' && article.review_status !== 'pending_republish') {
      return ctx.badRequest('当前文章不在二级审核状态。');
    }
    if (article.level2_reviewer && !isSuperAdmin(admin) && !assignedReviewerMatches(article, admin, 'level2_reviewer')) {
      return ctx.forbidden('这篇文章已指定其他二级审核人员。');
    }

    const decision = normalizeDecision(ctx.request.body);
    const comment = String(ctx.request.body?.comment || '').trim();
    if (!decision) return ctx.badRequest('审核决定只能是 approve 或 reject。');
    if (decision === 'reject' && !comment) return ctx.badRequest('退回时必须填写原因。');

    const isRepublish = article.review_status === 'pending_republish';
    const nextStatus = decision === 'approve'
      ? (isRepublish ? 'published' : 'approved_pending_publish')
      : (isRepublish ? 'rejected_republish' : 'rejected_level2');
    const updated = await updateArticle(strapi, article, {
      review_status: nextStatus,
      level2_reviewer: admin.id,
      level2_review_comment: comment || null,
      level2_review_date: new Date().toISOString(),
      rejection_reason: decision === 'reject' ? comment : null,
      ...(isRepublish && decision === 'approve' ? { publishedAt: new Date().toISOString(), publish_time: new Date().toISOString() } : {}),
    });

    await writeReviewLog(strapi, {
      article,
      reviewer: admin,
      action: isRepublish
        ? (decision === 'approve' ? 'approve_republish' : 'reject_republish')
        : (decision === 'approve' ? 'approve_level2' : 'reject_level2'),
      fromStatus: article.review_status,
      toStatus: nextStatus,
      comment,
    });

    ctx.body = { data: updated };
  },

  async publish(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!(await hasArticleAction(strapi, admin, 'publish'))) {
      return ctx.forbidden('当前角色没有发布文章的权限。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    if (!isSuperAdmin(admin) && article.review_status !== 'approved_pending_publish' && article.review_status !== 'approved') {
      return ctx.badRequest('文章必须先通过二级审核才能发布。');
    }

    const canPublish =
      ownerMatches(article, admin, ctx.state.user) ||
      isSuperAdmin(admin);
    if (!canPublish) return ctx.forbidden('只有文章发布者可以最终发布。');

    const updated = await updateArticle(strapi, article, {
      review_status: 'published',
      publish_time: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    });

    await writeReviewLog(strapi, {
      article,
      reviewer: admin,
      action: 'publish',
      fromStatus: article.review_status,
      toStatus: 'published',
      comment: '',
    });

    ctx.body = { data: updated };
  },

  async unpublish(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!(await hasArticleAction(strapi, admin, 'unpublish'))) {
      return ctx.forbidden('当前角色没有取消发布文章的权限。');
    }
    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    if (article.review_status !== 'published') return ctx.badRequest('只有已发布文章可以取消发布。');

    const canUnpublish = ownerMatches(article, admin, ctx.state.user) || isSuperAdmin(admin);
    if (!canUnpublish) return ctx.forbidden('只有文章发布者或超级管理员可以取消发布。');

    const comment = String(ctx.request.body?.comment || '').trim();
    const updated = await updateArticle(strapi, article, {
      review_status: 'unpublished',
      publishedAt: null,
      rejection_reason: comment || null,
    });
    await writeReviewLog(strapi, {
      article,
      reviewer: admin,
      action: 'unpublish',
      fromStatus: article.review_status,
      toStatus: 'unpublished',
      comment,
    });
    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    if (!(await hasArticleAction(strapi, admin, 'delete'))) {
      return ctx.forbidden('当前角色没有删除文章的权限。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    const isOwner = ownerMatches(article, admin, ctx.state.user);
    if (!isSuperAdmin(admin) && !isOwner) {
      return ctx.forbidden('只有文章发布者可以删除这篇文章。');
    }
    if (!isSuperAdmin(admin) && !EDITABLE_STATUSES.has(article.review_status)) {
      return ctx.forbidden('当前文章正在审核中，暂不能删除。');
    }

    await strapi.db.query(ARTICLE_UID).delete({ where: { id: article.id } });
    ctx.status = 204;
  },

  // Admin preview endpoint. It deliberately avoids the public
  // `/api/articles/:slug` route, whose parameter is reserved for published
  // website pages and may be intercepted by the public router.
  async preview(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;
    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    ctx.body = { data: article };
  },

  async history(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const limit = Math.min(Math.max(Number(ctx.query?.limit || 100), 1), 200);
    const logs = await strapi.db.query(REVIEW_LOG_UID).findMany({
      where: { reviewer_admin: admin.id },
      populate: ['article', 'reviewer_admin'],
      orderBy: { review_date: 'desc' },
      limit,
    });

    ctx.body = {
      data: (logs || []).map((log) => ({
        id: log.id,
        action: log.action,
        action_label: {
          create: '创建文章',
          edit: '修改文章',
          submit: '提交一级审核',
          submit_republish: '提交修改审核',
          approve_level1: '通过一级审核',
          reject_level1: '退回一级审核',
          approve_level2: '通过二级审核',
          reject_level2: '退回二级审核',
          approve_republish: '通过修改审核',
          reject_republish: '退回修改审核',
          publish: '发布文章',
          unpublish: '取消发布',
        }[log.action] || log.action,
        article: log.article ? {
          id: log.article.id,
          documentId: log.article.documentId,
          title: log.article.title,
          slug: log.article.slug,
        } : null,
        from_status: log.from_status,
        to_status: log.to_status,
        comment: log.comment || '',
        review_date: log.review_date || log.createdAt,
      })),
      meta: { total: logs?.length || 0, generatedAt: new Date().toISOString() },
    };
  },

  async tasks(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const articles = await strapi.db.query(ARTICLE_UID).findMany({
      populate: ARTICLE_POPULATE,
      orderBy: { updatedAt: 'desc' },
      limit: 200,
    });
    const tasks = buildTasks(articles, admin, ctx.state.user);
    const actionable = tasks.filter((task) => task.action_required);
    const byType = tasks.reduce((result, task) => {
      result[task.type] = (result[task.type] || 0) + 1;
      return result;
    }, {});
    ctx.body = {
      data: tasks,
      meta: {
        total: tasks.length,
        actionable: actionable.length,
        byType,
        generatedAt: new Date().toISOString(),
      },
    };
  },
}));
