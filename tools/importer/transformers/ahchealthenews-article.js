/* eslint-disable */
/* global WebImporter */

/**
 * Article transformer for ahchealthenews.com single posts ("news-article" template).
 * Runs BEFORE advocatehealth-sections.js and ahchealthenews-cleanup.js, so all
 * restructuring (incl. creating .hen-author-box for section-3) happens in beforeTransform
 * and does not depend on cleanup having run.
 *
 * Note: the importer unwraps <span> elements before transformers run, so labels are
 * derived from element text rather than span wrappers.
 */

const FIND_A_DOCTOR_LABELS = [
  { match: 'aurorahealthcare.org', label: 'Find a doctor in Wisconsin' },
  { match: 'advocatehealth.com', label: 'Find a doctor in Illinois' },
];

function boldLinkParagraph(doc, href, text) {
  const p = doc.createElement('p');
  const strong = doc.createElement('strong');
  const a = doc.createElement('a');
  a.href = href;
  a.textContent = text;
  strong.append(a);
  p.append(strong);
  return p;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const doc = element.ownerDocument || payload.document;

  // 1. Article chrome
  element.querySelectorAll('h3.titlebg').forEach((h3) => {
    if (h3.textContent.trim().toLowerCase() === 'comments') h3.remove();
  });
  WebImporter.DOMUtils.remove(element, [
    '#breadcrumbs',
    '#comments',
    '#respond',
    '#commentform',
    '.navigation.page-navigation',
    'div.line',
    '.author-extras .fright',
    '.sgr-main',
    '.g-recaptcha-response',
    '.g-recaptcha-bubble-arrow',
    'iframe[src*="recaptcha"]',
    '.postcontent .sociable',
  ]);

  // 2. Byline -> <p>By: <a>author</a></p> right after the H1
  const pageTitle = element.querySelector('#page_title');
  const byline = element.querySelector('#page_author');
  if (pageTitle && byline) {
    const h1 = pageTitle.querySelector('h1');
    const authorLink = byline.querySelector('a');
    if (h1) {
      const p = doc.createElement('p');
      if (authorLink) {
        const prefix = byline.textContent.replace(authorLink.textContent, '').replace(/\s+/g, ' ').trim();
        if (prefix) p.append(doc.createTextNode(`${prefix} `));
        const a = doc.createElement('a');
        a.href = authorLink.getAttribute('href');
        a.textContent = authorLink.textContent.trim();
        p.append(a);
      } else {
        p.textContent = byline.textContent.replace(/\s+/g, ' ').trim();
      }
      if (p.textContent.trim()) h1.after(p);
    }
    byline.remove();
  }

  // 3. Body sub-headings h5 -> h2
  element.querySelectorAll('.postcontent .entry_c > h5').forEach((h5) => {
    const h2 = doc.createElement('h2');
    // drop a redundant <strong> wrapping the whole heading text
    const only = h5.children.length === 1 ? h5.firstElementChild : null;
    const src = only && only.tagName === 'STRONG'
      && only.textContent.trim() === h5.textContent.trim() ? only : h5;
    h2.innerHTML = src.innerHTML.trim();
    h5.replaceWith(h2);
  });

  // 4. Related Posts heading -> h2
  element.querySelectorAll('h3.titlebg').forEach((h3) => {
    const next = h3.nextElementSibling;
    if (next && next.matches('ul.related-posts')) {
      const h2 = doc.createElement('h2');
      h2.textContent = h3.textContent.trim();
      h3.replaceWith(h2);
    }
  });

  // 5. About the Author -> div.hen-author-box moved after the sidebar
  const extraBox = element.querySelector('.single-extra-box');
  if (extraBox) {
    let heading = extraBox.previousElementSibling;
    if (!heading || heading.tagName !== 'H4') heading = null;

    const box = doc.createElement('div');
    box.className = 'hen-author-box';

    if (heading) {
      const h2 = doc.createElement('h2');
      h2.textContent = heading.textContent.trim();
      box.append(h2);
    }

    const photo = extraBox.querySelector('.author-image img');
    if (photo) {
      const p = doc.createElement('p');
      p.append(photo);
      box.append(p);
    }

    const desc = extraBox.querySelector('.author-desc');
    const name = desc ? desc.textContent.replace(/\s+/g, ' ').trim() : '';
    if (name) {
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      strong.textContent = name;
      p.append(strong);
      box.append(p);
    }

    extraBox.querySelectorAll(':scope > p').forEach((bio) => {
      if (bio.textContent.trim()) box.append(bio);
    });

    extraBox.querySelectorAll('.author-extras a').forEach((link) => {
      if (!link.textContent.trim()) return;
      const p = doc.createElement('p');
      const a = doc.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      p.append(a);
      box.append(p);
    });

    const sidebar = element.querySelector('#content > .sidebar');
    const anchor = sidebar || extraBox;
    anchor.after(box);
    if (heading) heading.remove();
    extraBox.remove();
  }

  // 6. Find a Doctor widget: decorative map + text buttons instead of image-of-text links
  element.querySelectorAll('.find-a-doctor-widget').forEach((widget) => {
    const mapImg = widget.querySelector('.find-a-doctor-img img');
    if (mapImg && !mapImg.hasAttribute('alt')) mapImg.setAttribute('alt', '');
    const links = widget.querySelector('.find-a-doctor-links');
    if (!links) return;
    const buttons = [];
    links.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const img = a.querySelector('img');
      let label = (img && (img.getAttribute('alt') || img.getAttribute('title')) || '').trim()
        || a.textContent.trim();
      if (!label) {
        const known = FIND_A_DOCTOR_LABELS.find((k) => href.includes(k.match));
        label = known ? known.label : '';
      }
      if (label) buttons.push(boldLinkParagraph(doc, href, label));
    });
    links.replaceChildren(...buttons);
  });

  // 7. LiveWell widget: logo alt, bold "Download the app" button
  element.querySelectorAll('#livewell_widget-2, .livewell-widget').forEach((widget) => {
    widget.querySelectorAll('img').forEach((img) => {
      if (!(img.getAttribute('alt') || '').trim()) img.setAttribute('alt', 'LiveWell');
    });
    widget.querySelectorAll('a[href]').forEach((a) => {
      if (a.closest('p, h1, h2, h3, h4, h5, h6, li')) return;
      a.replaceWith(boldLinkParagraph(doc, a.getAttribute('href'), a.textContent.trim()));
    });
  });
}
