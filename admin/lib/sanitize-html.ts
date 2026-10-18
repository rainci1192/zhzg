import sanitizeHtml from 'sanitize-html';

// Keep common Word/WPS/Excel formatting while excluding active CSS (URLs,
// expressions and arbitrary layout rules). Both admin preview and public site
// use the same allowlist so an approved article looks the same in both places.
const size = /^(?:auto|0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i;
const color = /^(?:#[0-9a-f]{3,8}|[a-z]+|rgba?\(\s*[\d.%,\s]+\)|hsla?\(\s*[\d.%,\s]+\))$/i;
const border = /^(?:none|(?:\d+(?:\.\d+)?(?:px|pt))\s+(?:solid|dashed|dotted|double)\s+(?:#[0-9a-f]{3,8}|[a-z]+))$/i;

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'figure', 'figcaption', 'img', 'iframe', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col', 'caption', 'u', 's', 'sub', 'sup'],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: [...(sanitizeHtml.defaults.allowedAttributes.a || []), 'rel', 'style'],
    p: ['style'], div: ['style'], span: ['style'],
    h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'style'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy', 'sandbox'],
    table: ['width', 'border', 'cellpadding', 'cellspacing', 'align', 'style'],
    tr: ['style'], col: ['span', 'width', 'style'], colgroup: ['span', 'width', 'style'],
    th: ['colspan', 'rowspan', 'scope', 'width', 'height', 'align', 'valign', 'bgcolor', 'style'],
    td: ['colspan', 'rowspan', 'width', 'height', 'align', 'valign', 'bgcolor', 'style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(?:left|right|center|justify|start|end)$/i],
      'vertical-align': [/^(?:top|middle|bottom|baseline)$/i],
      color: [color],
      'background-color': [color],
      'font-family': [/^[\p{L}\p{N}\s,\-'"()]+$/u],
      'font-size': [size],
      'font-weight': [/^(?:normal|bold|bolder|lighter|[1-9]00)$/i],
      'font-style': [/^(?:normal|italic|oblique)$/i],
      'text-decoration': [/^(?:none|underline|line-through|overline)(?:\s+(?:underline|line-through|overline))*$/i],
      'white-space': [/^(?:normal|pre|pre-wrap|nowrap)$/i],
      'line-height': [size, /^\d+(?:\.\d+)?$/],
      'text-indent': [size],
      width: [size], height: [size],
      'min-width': [size], 'max-width': [size, /^none$/i],
      border: [border], 'border-top': [border], 'border-right': [border],
      'border-bottom': [border], 'border-left': [border],
      'border-collapse': [/^(?:collapse|separate)$/i],
      'table-layout': [/^(?:fixed|auto)$/i],
      'border-spacing': [size, /^\d+(?:\.\d+)?(?:px|pt) \d+(?:\.\d+)?(?:px|pt)$/i],
      padding: [size, /^(?:\d+(?:\.\d+)?(?:px|pt|em|rem)\s+){1,3}\d+(?:\.\d+)?(?:px|pt|em|rem)$/i],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  allowIframeRelativeUrls: false,
  transformTags: {
    a: (tagName, attributes) => ({ tagName, attribs: { ...attributes, rel: 'noopener noreferrer' } }),
    iframe: (tagName, attributes) => ({ tagName, attribs: { ...attributes, sandbox: 'allow-scripts allow-same-origin allow-presentation', referrerpolicy: 'strict-origin-when-cross-origin' } }),
  },
};

/** Sanitize CMS rich text before inserting it into the admin preview DOM. */
export function sanitizeRichHtml(value: unknown): string {
  return sanitizeHtml(typeof value === 'string' ? value : '', OPTIONS);
}
