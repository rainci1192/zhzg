import sanitizeHtml from 'sanitize-html';

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'figure', 'figcaption', 'img', 'iframe', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'u', 's', 'sub', 'sup'],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: [...(sanitizeHtml.defaults.allowedAttributes.a || []), 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy', 'sandbox'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  allowIframeRelativeUrls: false,
  transformTags: {
    a: (tagName, attributes) => ({ tagName, attribs: { ...attributes, rel: 'noopener noreferrer' } }),
    iframe: (tagName, attributes) => ({ tagName, attribs: { ...attributes, sandbox: 'allow-scripts allow-same-origin allow-presentation', referrerpolicy: 'strict-origin-when-cross-origin' } }),
  },
};

/** Sanitize CMS rich text before inserting it into the public website DOM. */
export function sanitizeRichHtml(value: unknown): string {
  return sanitizeHtml(typeof value === 'string' ? value : '', OPTIONS);
}
