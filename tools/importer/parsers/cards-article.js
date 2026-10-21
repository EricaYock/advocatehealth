/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-article.
 * Source: [class*="cards-grid_"].
 * Items: direct children [class*="content-feed-for-health-news-card_"].
 * Rows: [image, title link + description].
 */
export default function parse(element, { document }) {
  const cells = [];

  const cards = Array.from(element.children)
    .filter((el) => /content-feed-for-health-news-card_/.test(el.className || ''));

  cards.forEach((card) => {
    // Image cell
    const imgSrc = card.querySelector('img');
    let imageCell = '';
    if (imgSrc && imgSrc.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = imgSrc.getAttribute('src');
      img.alt = imgSrc.getAttribute('alt') || '';
      imageCell = img;
    }

    // Content cell: linked title + description
    const content = [];
    const titleLink = card.querySelector('a[class*="card-title-link_"]');
    if (titleLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = titleLink.getAttribute('href');
      a.textContent = titleLink.textContent.trim();
      p.append(a);
      content.push(p);
    }

    const excerpt = card.querySelector('[class*="card-excerpt_"]');
    if (excerpt) {
      const paras = excerpt.querySelectorAll('p');
      if (paras.length) {
        paras.forEach((p) => { if (p.textContent.trim()) content.push(p); });
      } else if (excerpt.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = excerpt.textContent.trim();
        content.push(p);
      }
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
