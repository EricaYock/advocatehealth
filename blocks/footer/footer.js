/*
 * Footer block
 * Footer fragment (footer.plain.html) sections, in order:
 *   1. main: logo paragraph, then link columns. Each heading starts a column; the
 *      lists that follow belong to it. A list whose links are image-only renders
 *      as an icon row (social links).
 *   2+. bottom: an intro paragraph, then inline link rows (links separated by "|")
 *       and fine-print text paragraphs, in any order.
 * A divider is rendered between consecutive fragment sections.
 */

/* metadata-independent: /content first (local preview), then root (DA/EDS) */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  return { html, base: new URL(resp.url, window.location.href) };
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

/* external hosts open in a new tab */
function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    if (url.protocol.startsWith('http') && url.hostname !== window.location.hostname) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

function isIconList(list) {
  const links = [...list.querySelectorAll('a')];
  return links.length > 0 && links.every((a) => a.querySelector('img') && !a.textContent.trim());
}

/* swap svg <img> for inline svg so icons can follow the link color */
async function inlineSvgIcon(img) {
  const link = img.closest('a');
  if (link && img.alt) link.setAttribute('aria-label', img.alt);
  if (!/\.svg($|\?)/.test(new URL(img.src).pathname)) return;
  try {
    const resp = await fetch(img.src);
    if (!resp.ok) return;
    const svg = new DOMParser().parseFromString(await resp.text(), 'image/svg+xml').querySelector('svg');
    if (!svg) return;
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    img.replaceWith(document.importNode(svg, true));
  } catch {
    /* keep the image */
  }
}

function buildMain(section) {
  const main = el('div', { class: 'footer-section footer-main' });
  const columns = el('div', { class: 'footer-columns' });
  let column = null;
  const icons = [];

  [...section.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      column = el('div', { class: 'footer-column' });
      child.classList.add('footer-column-title');
      column.append(child);
      columns.append(column);
      return;
    }
    if (!column) {
      // content before the first heading: brand logo
      child.classList.add('footer-brand');
      child.querySelectorAll('img').forEach((img) => {
        img.loading = 'lazy';
        if (!img.getAttribute('width')) img.setAttribute('width', '415');
        if (!img.getAttribute('height')) img.setAttribute('height', '82');
      });
      main.append(child);
      return;
    }
    if (child.tagName === 'UL' && isIconList(child)) {
      child.classList.add('footer-social');
      icons.push(...child.querySelectorAll('img'));
    } else if (child.tagName === 'UL' || child.tagName === 'OL') {
      child.classList.add('footer-links');
    }
    column.append(child);
  });

  main.append(columns);
  return { main, icons };
}

/* keep "|" separators attached to neighbouring links, as authored inline */
function normalizeSeparators(p) {
  [...p.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && /^\s*\|\s*$/.test(node.textContent)) {
      node.textContent = '\u00a0|\u00a0';
    }
  });
}

function buildBottom(section) {
  const bottom = el('div', { class: 'footer-section footer-bottom' });
  const paras = [...section.children];
  paras.forEach((p, i) => {
    if (p.querySelector('a')) {
      p.classList.add('footer-link-row');
      normalizeSeparators(p);
    } else if (i === 0) {
      p.classList.add('footer-intro');
    } else {
      p.classList.add('footer-fine-print');
    }
    bottom.append(p);
  });
  return bottom;
}

const divider = () => el('div', { class: 'footer-section footer-divider' }, el('hr'));

/** @param {Element} block */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const tpl = document.createElement('div');
  tpl.innerHTML = fragment.html;
  // resolve fragment-relative image paths against the fragment location
  tpl.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
  });

  const [first, ...rest] = [...tpl.children];
  if (!first) return;
  const { main, icons } = buildMain(first);
  const parts = [main];
  rest.forEach((section) => parts.push(divider(), buildBottom(section)));

  parts.forEach((part) => decorateLinks(part));
  await Promise.all(icons.map(inlineSvgIcon));
  block.append(...parts);
}
