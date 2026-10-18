'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const ARTICLE_UID = 'api::article.article';

async function publishedVersions(strapi, slug) {
  if (typeof slug !== 'string' || !slug || slug.length > 180 || slug.includes('/')) return null;
  const query = strapi.db.query(ARTICLE_UID);
  const published = await query.findOne({
    where: { slug, review_status: 'published', publishedAt: { $notNull: true } },
    select: ['id', 'documentId', 'view_count'],
  });
  if (!published) return null;
  const versions = published.documentId
    ? await query.findMany({ where: { documentId: published.documentId }, select: ['id', 'view_count'] })
    : [published];
  return { published, versions };
}

function maxViews(versions) {
  return Math.max(0, ...versions.map((version) => Number(version.view_count) || 0));
}

module.exports = createCoreController(ARTICLE_UID, ({ strapi }) => ({
  async count(ctx) {
    const article = await publishedVersions(strapi, ctx.params.slug);
    if (!article) return ctx.notFound('文章不存在或尚未发布。');
    ctx.set('Cache-Control', 'no-store');
    ctx.body = { data: { view_count: maxViews(article.versions) } };
  },

  async record(ctx) {
    const article = await publishedVersions(strapi, ctx.params.slug);
    if (!article) return ctx.notFound('文章不存在或尚未发布。');
    const ids = article.versions.map((version) => version.id);
    // The row lock makes simultaneous opens count correctly. Keep every
    // draft/published version of a Strapi document on the same total.
    const count = await strapi.db.connection.transaction(async (trx) => {
      const rows = await trx('articles').whereIn('id', ids).orderBy('id').forUpdate()
        .select('id', 'view_count', 'review_status', 'published_at');
      const live = rows.find((row) => Number(row.id) === Number(article.published.id));
      if (!live || live.review_status !== 'published' || !live.published_at) return null;
      const next = maxViews(rows) + 1;
      await trx('articles').whereIn('id', rows.map((row) => row.id)).update({ view_count: next });
      return next;
    });
    if (count === null) return ctx.notFound('文章不存在或尚未发布。');
    ctx.set('Cache-Control', 'no-store');
    ctx.body = { data: { view_count: count } };
  },
}));
