/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-links.
 * Source: [class*="column-grid_"]:has(> [class*="icon-cta-simplified-card_"]).
 * Items: direct children [class*="icon-cta-simplified-card_"].
 * Rows: [icon image, label paragraph + link].
 */
export default function parse(element, { document }) {
  const cells = [];

  const cards = Array.from(element.children)
    .filter((el) => /icon-cta-simplified-card_/.test(el.className || ''));

  cards.forEach((card) => {
    // Icon cell: inline Font Awesome SVG data URIs become :icon-name: references
    // (SVGs are stored in /icons/{data-icon}.svg); other images are kept as images.
    const iconSrc = card.querySelector('[class*="icon-cta-simplified-card-icon_"] img, [class*="icon-cta-simplified-card-icon_"] svg');
    let iconCell = '';
    let iconName = iconSrc && iconSrc.getAttribute('data-icon');
    const src = iconSrc && iconSrc.getAttribute('src');
    if (!iconName && src && (src.startsWith('data:image/svg+xml') || src.startsWith('blob:'))) {
      try {
        let svg;
        if (src.startsWith('blob:')) {
          // the importer converts base64 images to blob URLs before parsing
          const xhr = new XMLHttpRequest();
          xhr.open('GET', src, false);
          xhr.send();
          svg = xhr.responseText || '';
        } else {
          svg = src.includes(';base64,') ? atob(src.split(',')[1]) : decodeURIComponent(src.split(',')[1]);
        }
        const m = svg.match(/data-icon="([^"]+)"/);
        if (m) [, iconName] = m;
      } catch (e) {
        // fall through to image handling
      }
    }
    if (iconName) {
      iconCell = document.createElement('p');
      iconCell.textContent = `:${iconName}:`;
    } else if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      const img = document.createElement('img');
      img.src = iconSrc.getAttribute('src');
      img.alt = iconSrc.getAttribute('alt') || '';
      iconCell = img;
    }

    // Content cell: label + link
    const content = [];
    const copy = card.querySelector('[class*="icon-cta-simplified-card-support-copy_"]');
    if (copy) {
      const paras = copy.querySelectorAll('p');
      if (paras.length) {
        paras.forEach((p) => { if (p.textContent.trim()) content.push(p); });
      } else if (copy.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = copy.textContent.trim();
        content.push(p);
      }
    }

    const linkSrc = card.querySelector('[class*="icon-cta-simplified-card-anchor-wrapper_"] a[href]');
    if (linkSrc) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = linkSrc.getAttribute('href');
      a.textContent = linkSrc.textContent.trim();
      p.append(a);
      content.push(p);
    }

    if (!iconCell && !content.length) return;
    cells.push([iconCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-links', cells });
  element.replaceWith(block);
}
