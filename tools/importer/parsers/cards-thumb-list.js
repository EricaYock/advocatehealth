/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-thumb-list (ahchealthenews.com sidebar "Recent Posts").
 * Source: #recent-posts-2 ul.sposts-list > li, each with .entry_image (a > img)
 * and .entry_c (.entry_title a, .entry_meta li date).
 * Rows: [thumbnail image, text cell: linked title paragraph, date paragraph].
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = Array.from(element.querySelectorAll(':scope > li'));

  items.forEach((item) => {
    // Image cell
    const img = item.querySelector('.entry_image img') || item.querySelector('img');
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell = image;
    }

    // Text cell
    const content = [];
    const titleEl = item.querySelector('.entry_title');
    const titleLink = item.querySelector('.entry_title a[href]')
      || item.querySelector('.entry_image a[href]');
    const titleText = ((titleEl && titleEl.textContent.trim()) || (img && img.getAttribute('alt')) || '').trim();
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

    const dateEl = item.querySelector('.entry_meta li') || item.querySelector('.entry_meta');
    const dateText = dateEl ? dateEl.textContent.trim() : '';
    if (dateText) {
      const p = document.createElement('p');
      p.textContent = dateText;
      content.push(p);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-thumb-list', cells });
  element.replaceWith(block);
}
