'use strict';

const crypto = require('crypto');
let pinyin;
try {
  ({ pinyin } = require('pinyin-pro'));
} catch (_error) {
  // Existing installations can still generate safe ASCII slugs before npm install.
}

const ARTICLE_UID = 'api::article.article';

function buildBaseSlug(title) {
  const source = String(title || '');
  const romanized = pinyin ? pinyin(source, { toneType: 'none', type: 'string' }) : source;
  const readable = String(romanized).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 72).replace(/-+$/g, '');
  return readable || `article-${crypto.createHash('sha256').update(source).digest('hex').slice(0, 10)}`;
}

async function uniqueArticleSlug(strapi, title) {
  const base = buildBaseSlug(title);
  // A random suffix keeps simultaneous creations with the same title distinct.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${base}-${crypto.randomBytes(5).toString('hex')}`;
    const existing = await strapi.db.query(ARTICLE_UID).findOne({ where: { slug: candidate }, select: ['id'] });
    if (!existing) return candidate;
  }
  throw new Error('无法生成唯一的文章链接，请重试。');
}

// Draft and published versions share a documentId in Strapi 5. Repair them
// together so the public list and detail endpoint resolve the same slug.
async function repairArticleDocumentSlug(strapi, article) {
  const query = strapi.db.query(ARTICLE_UID);
  const versions = article.documentId
    ? await query.findMany({ where: { documentId: article.documentId }, select: ['id', 'documentId', 'slug', 'title'] })
    : [article];
  const slug = versions.find((version) => typeof version.slug === 'string' && version.slug.trim())?.slug
    || await uniqueArticleSlug(strapi, article.title);
  for (const version of versions) {
    if (version.slug && version.slug.trim()) continue;
    await query.update({ where: { id: version.id }, data: { slug } });
  }
  return slug;
}

async function repairMissingArticleSlugs(strapi) {
  const missing = await strapi.db.query(ARTICLE_UID).findMany({
    where: { $or: [{ slug: { $null: true } }, { slug: '' }] },
    select: ['id', 'documentId', 'slug', 'title'],
  });
  const visited = new Set();
  for (const article of missing) {
    const key = article.documentId || `id:${article.id}`;
    if (visited.has(key)) continue;
    await repairArticleDocumentSlug(strapi, article);
    visited.add(key);
  }
  return missing.length;
}

module.exports = { uniqueArticleSlug, repairArticleDocumentSlug, repairMissingArticleSlugs };
