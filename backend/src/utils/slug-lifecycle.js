'use strict';

const crypto = require('crypto');
let pinyin;
try {
  ({ pinyin } = require('pinyin-pro'));
} catch (_error) {
  // Keep the server bootable before dependencies are reinstalled; the ASCII
  // hash fallback below remains safe until pinyin-pro is available.
}

const SLUG_MODELS = {
  'api::article.article': { prefix: 'article', sourceFields: ['title'] },
  'api::category.category': { prefix: 'category', sourceFields: ['name'] },
  'api::page.page': { prefix: 'page', sourceFields: ['title'] },
  'api::supervisor.supervisor': { prefix: 'supervisor', sourceFields: ['name'] },
  'api::student-document.student-document': { prefix: 'student-document', sourceFields: ['title'] },
  'api::policy-document.policy-document': { prefix: 'policy-document', sourceFields: ['title'] },
  'api::research-institution.research-institution': { prefix: 'research-institution', sourceFields: ['name'] },
  'api::research-transfer.research-transfer': { prefix: 'research-transfer', sourceFields: ['title'] },
};

function asciiPart(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
    .replace(/-+$/g, '');
}

function buildBaseSlug(source, prefix) {
  const romanized = pinyin
    ? pinyin(String(source || ''), { toneType: 'none', type: 'string' })
    : source;
  const readable = asciiPart(romanized);
  if (readable) return readable;

  // Keep slugs ASCII even for punctuation-only titles or when transliteration
  // is unavailable; the hash makes repeated source text deterministic.
  const digest = crypto.createHash('sha256').update(String(source || `${Date.now()}-${Math.random()}`)).digest('hex').slice(0, 10);
  return `${prefix}-${digest}`;
}

function sourceText(data, existing, fields, prefix) {
  for (const field of fields) {
    const value = data?.[field] ?? existing?.[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return `${prefix}-${Date.now()}`;
}

module.exports = function registerSlugMiddleware(strapi) {
  strapi.documents.use(async (context, next) => {
    const model = SLUG_MODELS[context.uid];
    if (!model || !['create', 'update'].includes(context.action)) return next();

    const data = context.params.data || (context.params.data = {});
    let existing = null;
    if (context.action === 'update' && context.params.documentId) {
      existing = await strapi.documents(context.uid).findOne(context.params.documentId, {
        status: 'draft',
        fields: [...model.sourceFields, 'slug'],
      });
    }

    const sourceChanged = existing && model.sourceFields.some(
      (field) => Object.prototype.hasOwnProperty.call(data, field) && String(data[field] ?? '') !== String(existing[field] ?? ''),
    );
    const suppliedSlugChanged = data.slug != null && data.slug !== existing?.slug;
    const invalidExistingSlug = existing && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(existing.slug || '');
    const shouldGenerate = context.action === 'create' || sourceChanged || suppliedSlugChanged || invalidExistingSlug;

    if (shouldGenerate) {
      const base = buildBaseSlug(sourceText(data, existing, model.sourceFields, model.prefix), model.prefix);
      let candidate = base;
      let suffix = 2;
      while (true) {
        const matches = await strapi.documents(context.uid).findMany({
          filters: { slug: { $eq: candidate } },
          fields: ['slug'],
          pagination: { page: 1, pageSize: 100 },
          status: 'draft',
        });
        const collision = matches.some((item) => item.documentId !== context.params.documentId);
        if (!collision) break;
        candidate = `${base}-${suffix++}`;
      }
      data.slug = candidate;
    }

    return next();
  });
};
