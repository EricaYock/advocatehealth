/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-article.
 * Source: [class*="cards-grid_"].
 * Items: direct children [class*="content-feed-for-health-news-card_"].
 * Rows: [image, title link + description].
 *
 * Also handles the health enews article "Related Posts" list:
 * Source: #content ul.related-posts > li (.entry_image > a > img, .entry_title > a).
 * Rows: [linked image, linked title paragraph]. No description on source.
 */
function parseRelatedPosts(element, document) {
  const cells = [];

  Array.from(element.querySelectorAll(':scope > li')).forEach((item) => {
    const srcImg = item.querySelector('.entry_image img');
    const imageLink = item.querySelector('.entry_image a[href]');
    const titleLink = item.querySelector('.entry_title a[href]') || imageLink;

    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = srcImg.getAttribute('alt') || '';
      if (imageLink) {
        const a = document.createElement('a');
        a.href = imageLink.getAttribute('href');
        a.append(img);
        imageCell = a;
      } else {
        imageCell = img;
      }
    }

    const content = [];
    const titleEl = item.querySelector('.entry_title');
    const titleText = ((titleEl && titleEl.textContent.trim())
      || (srcImg && srcImg.getAttribute('alt')) || '').trim();
    if (titleText) {
      const p = document.createElement('p');
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        a.textContent = titleText;
        p.append(a);
      } else {
        p.textContent = titleText;
      }
      content.push(p);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });

  return cells;
}

export default function parse(element, { document }) {
  if (element.matches('ul.related-posts')) {
    const relatedCells = parseRelatedPosts(element, document);
    const relatedBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells: relatedCells });
    element.replaceWith(relatedBlock);
    return;
  }

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
