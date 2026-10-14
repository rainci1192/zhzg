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
  return String(admin?.backend_role?.name || '').trim().toLowerCase();
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
  const owner = article?.created_by_admin;
  if (owner) {
    const ownerId = relationId(owner);
    return ownerId === String(admin.id) || ownerId === String(admin.documentId);
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
    new Set(['draft', 'rejected_level1', 'rejected_level2', 'rejected_admin', 'rejected_leader']).has(article.review_status)
  );
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

    const input = ctx.request.body?.data || {};
    const data = { ...input };
    for (const field of WORKFLOW_FIELDS) delete data[field];

    data.review_status = 'draft';
    data.created_by_admin = admin.id;

    const result = await strapi.db.query(ARTICLE_UID).create({
      data,
      populate: ARTICLE_POPULATE,
    });
    ctx.body = { data: result };
  },

  async update(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const input = ctx.request.body?.data || {};
    if (hasProtectedField(input)) {
      return ctx.badRequest('审核状态、审核人和发布时间只能通过文章审核流程操作。');
    }

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');

    const allowed = ownerMatches(article, admin, ctx.state.user) || canManageLegacyUnownedArticle(article, admin) || isSuperAdmin(admin);
    if (!allowed) return ctx.forbidden('只有文章发布者可以编辑这篇文章。');

    const updateData = { ...input };
    if (!article.created_by_admin) updateData.created_by_admin = admin.id;
    const result = await updateArticle(strapi, article, updateData);
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

    const reviewers = allAdmins
      .filter((item) => LEVEL1_ROLE_NAMES.has(roleName(item)))
      .map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        email: item.email,
        role: item.backend_role?.name,
        role_display_name: item.backend_role?.display_name,
      }));

    ctx.body = { data: reviewers };
  },

  async submit(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');

    const allowedStatuses = new Set([
      'draft',
      'rejected_level1',
      'rejected_level2',
      'rejected_admin',
      'rejected_leader',
    ]);
    if (!allowedStatuses.has(article.review_status)) {
      return ctx.badRequest('当前文章状态不能提交审核。');
    }

    const canSubmit = ownerMatches(article, admin, ctx.state.user) || canManageLegacyUnownedArticle(article, admin) || isSuperAdmin(admin);
    if (!canSubmit) return ctx.forbidden('只有文章发布者可以提交审核。');

    const allReviewers = await strapi.db.query(ADMIN_UID).findMany({
      where: { is_active: true },
      populate: ['backend_role'],
      orderBy: { name: 'asc' },
    });
    const reviewers = allReviewers.filter((item) => LEVEL1_ROLE_NAMES.has(roleName(item)));
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

    const nextStatus = decision === 'approve' ? 'pending_level2' : 'rejected_level1';
    const updated = await updateArticle(strapi, article, {
      review_status: nextStatus,
      level1_reviewer: admin.id,
      level1_review_comment: comment || null,
      level1_review_date: new Date().toISOString(),
      level2_reviewer: null,
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

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    if (article.review_status !== 'pending_level2' && article.review_status !== 'pending_leader') {
      return ctx.badRequest('当前文章不在二级审核状态。');
    }

    const decision = normalizeDecision(ctx.request.body);
    const comment = String(ctx.request.body?.comment || '').trim();
    if (!decision) return ctx.badRequest('审核决定只能是 approve 或 reject。');
    if (decision === 'reject' && !comment) return ctx.badRequest('退回时必须填写原因。');

    const nextStatus = decision === 'approve' ? 'approved_pending_publish' : 'rejected_level2';
    const updated = await updateArticle(strapi, article, {
      review_status: nextStatus,
      level2_reviewer: admin.id,
      level2_review_comment: comment || null,
      level2_review_date: new Date().toISOString(),
      rejection_reason: decision === 'reject' ? comment : null,
    });

    await writeReviewLog(strapi, {
      article,
      reviewer: admin,
      action: decision === 'approve' ? 'approve_level2' : 'reject_level2',
      fromStatus: article.review_status,
      toStatus: nextStatus,
      comment,
    });

    ctx.body = { data: updated };
  },

  async publish(ctx) {
    const admin = await getCurrentAdmin(ctx, strapi);
    if (!admin) return;

    const article = await findArticle(strapi, ctx.params.id);
    if (!article) return ctx.notFound('文章不存在。');
    if (article.review_status !== 'approved_pending_publish' && article.review_status !== 'approved') {
      return ctx.badRequest('文章必须先通过二级审核才能发布。');
    }

    const canPublish =
      ownerMatches(article, admin, ctx.state.user) ||
      isSuperAdmin(admin) ||
      (!article.created_by_admin && new Set(['editor', 'admin']).has(roleName(admin)));
    if (!canPublish) return ctx.forbidden('只有文章发布者可以最终发布。');

    const updated = await updateArticle(strapi, article, {
      review_status: 'published',
      publish_time: new Date().toISOString(),
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
}));
