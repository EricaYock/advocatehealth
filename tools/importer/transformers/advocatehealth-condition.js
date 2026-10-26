/* eslint-disable */
/* global WebImporter */

/**
 * Condition page transformer for advocatehealth.com
 * (health-services/{service}/conditions/{condition}, "health-conditions" template).
 * - Removes the breadcrumb bar, the mobile "Page navigation" copy of the left
 *   navigation and the "Jump to Start of Content" link.
 * - Rewrites the desktop left navigation as default content:
 *   <p><a>Back link</a></p><ul><li><a>Page</a></li>…</ul>
 * - Replaces heading SVG icons (Font Awesome; inline <svg> or the importer's
 *   data:/blob: <img> copy of it) with :icon-name: shorthand.
 */
function svgSource(img) {
  const src = img.getAttribute('src') || '';
  try {
    if (src.startsWith('data:image/svg+xml;base64,')) return atob(src.split(',')[1]);
    if (src.startsWith('data:image/svg+xml')) return decodeURIComponent(src.split(',')[1]);
    if (src.startsWith('blob:')) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', src, false);
      xhr.send();
      return xhr.responseText;
    }
  } catch (e) {
    // unreadable image: keep it
  }
  return '';
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const doc = element.ownerDocument || payload.document;

  WebImporter.DOMUtils.remove(element, [
    'nav[aria-label="breadcrumb"]',
    '[class*="breadcrumb"]',
    '[class*="left-navigation-mobile_"]',
    '[class*="anchor-back_"]',
  ]);

  element.querySelectorAll('[class*="left-navigation-desktop_"]').forEach((nav) => {
    const frag = doc.createDocumentFragment();
    const back = nav.querySelector('[class*="left-navigation-title_"], a');
    if (back) {
      const p = doc.createElement('p');
      const a = doc.createElement('a');
      a.href = back.getAttribute('href');
      a.textContent = back.textContent.trim();
      p.append(a);
      frag.append(p);
    }
    const links = [...nav.querySelectorAll('[class*="drop-down-menu-item_"] a')];
    if (links.length) {
      const ul = doc.createElement('ul');
      links.forEach((link) => {
        const li = doc.createElement('li');
        const a = doc.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = link.textContent.trim();
        li.append(a);
        ul.append(li);
      });
      frag.append(ul);
    }
    const wrapper = doc.createElement('div');
    wrapper.append(frag);
    nav.replaceWith(wrapper);
  });

  element.querySelectorAll(':is(h1, h2, h3) :is(svg, img)').forEach((icon) => {
    const markup = icon.tagName === 'IMG' ? svgSource(icon) : icon.outerHTML;
    const m = markup.match(/data-icon="([a-z0-9-]+)"/);
    if (m) icon.replaceWith(doc.createTextNode(`:${m[1]}: `));
  });
}
