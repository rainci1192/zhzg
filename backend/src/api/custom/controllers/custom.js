// @ts-nocheck
'use strict';

module.exports = {
  async categoryTree(ctx) {
    const categories = await strapi.entityService.findMany('api::category.category', {
      filters: { is_visible: true },
      fields: ['id', 'name', 'slug', 'sort_order'],
      populate: { parent: { fields: ['id'] } },
      sort: [{ sort_order: 'asc' }, { id: 'asc' }],
    });

    const map = new Map();
    categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const tree = [];
    categories.forEach((c) => {
      const node = map.get(c.id);
      const parentId = c.parent?.id;
      if (parentId && map.has(parentId)) map.get(parentId).children.push(node);
      else tree.push(node);
    });

    ctx.body = { data: tree };
  },

  async search(ctx) {
    const q = (ctx.query.q || '').trim();
    const page = Math.max(parseInt(ctx.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(ctx.query.pageSize || '10', 10), 1), 50);

    if (!q) {
      ctx.body = { data: [], meta: { pagination: { page, pageSize, total: 0, pageCount: 0 } } };
      return;
    }

    const start = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      strapi.entityService.findMany('api::article.article', {
        filters: {
          review_status: 'published',
          $or: [{ title: { $containsi: q } }, { summary: { $containsi: q } }],
        },
        fields: ['id', 'title', 'slug', 'summary', 'publish_time'],
        sort: [{ publish_time: 'desc' }, { id: 'desc' }],
        start,
        limit: pageSize,
      }),
      strapi.entityService.count('api::article.article', {
        filters: {
          review_status: 'published',
          $or: [{ title: { $containsi: q } }, { summary: { $containsi: q } }],
        },
      }),
    ]);

    ctx.body = {
      data: rows,
      meta: { pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } },
    };
  },
    async download(ctx) {
    const { id } = ctx.params;

    const attachment = await strapi.entityService.findOne('api::attachment.attachment', id, {
      populate: { file: true },
      fields: ['id', 'title', 'download_count', 'is_active'],
    });

    if (!attachment) return ctx.notFound('Attachment not found');
    if (attachment.is_active === false) return ctx.forbidden('Attachment is inactive');

    const nextCount = (attachment.download_count || 0) + 1;

    await strapi.entityService.update('api::attachment.attachment', id, {
      data: { download_count: nextCount },
    });

    const fileUrl = attachment.file?.url;
    if (!fileUrl) return ctx.notFound('File not found');

    // 兼容相对地址
    const finalUrl = fileUrl.startsWith('http')
      ? fileUrl
      : `${strapi.config.get('server.url', 'http://localhost:1337')}${fileUrl}`;

    ctx.status = 302;
    ctx.redirect(finalUrl);
  },
    async homeNews(ctx) {
  const limit = Math.min(Math.max(parseInt(ctx.query.limit || '6', 10), 1), 20);

  const rows = await strapi.entityService.findMany('api::article.article', {
    filters: {
      review_status: 'published',
      primary_category: { slug: 'news' },
    },
    fields: ['id', 'title', 'slug', 'summary', 'publish_time', 'is_top'],
    populate: {
      cover: true,
      primary_category: true,
      secondary_category: true,
    },
    sort: [{ is_top: 'desc' }, { publish_time: 'desc' }, { id: 'desc' }],
    limit,
  });

  ctx.body = { data: rows };
},

async homeNotices(ctx) {
  const limit = Math.min(Math.max(parseInt(ctx.query.limit || '6', 10), 1), 20);

  const rows = await strapi.entityService.findMany('api::article.article', {
    filters: {
      review_status: 'published',
      primary_category: { slug: 'notices' },
    },
    fields: ['id', 'title', 'slug', 'summary', 'publish_time', 'is_top'],
    populate: {
      cover: true,
      primary_category: true,
      secondary_category: true,
    },
    sort: [{ is_top: 'desc' }, { publish_time: 'desc' }, { id: 'desc' }],
    limit,
  });

  ctx.body = { data: rows };
},
  // 文章详情：按 slug
  async articleBySlug(ctx) {
    const { slug } = ctx.params;
    if (!slug) return ctx.badRequest('slug is required');

    const rows = await strapi.entityService.findMany('api::article.article', {
      filters: {
        slug,
        review_status: 'published',
      },
      fields: ['id', 'title', 'slug', 'summary', 'content', 'publish_time', 'is_top'],
      populate: {
        cover: true,
        primary_category: true,
        secondary_category: true,
      },
      limit: 1,
    });

    const article = rows?.[0];
    if (!article) return ctx.notFound('Article not found');

    ctx.body = { data: article };
  },

  // 栏目文章列表：按栏目 slug
  async categoryArticles(ctx) {
    const { slug } = ctx.params;
    const page = Math.max(parseInt(ctx.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(ctx.query.pageSize || '10', 10), 1), 50);

    // 先确认栏目存在
    const categoryRows = await strapi.entityService.findMany('api::category.category', {
      filters: { slug, is_visible: true },
      fields: ['id', 'name', 'slug'],
      limit: 1,
    });

    const category = categoryRows?.[0];
    if (!category) return ctx.notFound('Category not found');

    const start = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      strapi.entityService.findMany('api::article.article', {
        filters: {
          review_status: 'published',
          $or: [
            { primary_category: { id: category.id } },
            { secondary_category: { id: category.id } },
          ],
        },
        fields: ['id', 'title', 'slug', 'summary', 'publish_time', 'is_top'],
        populate: {
          cover: true,
          primary_category: true,
          secondary_category: true,
        },
        sort: [{ is_top: 'desc' }, { publish_time: 'desc' }, { id: 'desc' }],
        start,
        limit: pageSize,
      }),
      strapi.entityService.count('api::article.article', {
        filters: {
          review_status: 'published',
          $or: [
            { primary_category: { id: category.id } },
            { secondary_category: { id: category.id } },
          ],
        },
      }),
    ]);

    ctx.body = {
      data: rows,
      meta: {
        category,
        pagination: {
          page,
          pageSize,
          total,
          pageCount: Math.ceil(total / pageSize),
        },
      },
    };
  },

};
