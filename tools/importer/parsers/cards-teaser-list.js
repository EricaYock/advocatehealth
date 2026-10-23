/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-teaser-list (ahchealthenews.com listing groups).
 * Instances:
 *   .postcontent > .todays-news        (div.hcategory-first items, with date)
 *   .postcontent > .recipe-feed        (div.hcategory-first items, no date)
 *   .featured-stories .post-list       (div.post items, with date)
 * Each item: .entry_image (a > img), .entry_c with .entry_title a,
 * optional .entry_meta li (date), .entry_content .entry_excert.
 * Group headings (h3.titlebg) and share lists are removed by the cleanup transformer.
 * Rows: [image, text cell: linked title paragraph, optional date paragraph, excerpt paragraph].
 */
export default function parse(element, { document }) {
  const cells = [];

  let items = Array.from(element.querySelectorAll(':scope > .hcategory-first, :scope > .post'));
  if (!items.length) {
    items = Array.from(element.children)
      .filter((child) => child.querySelector('.entry_title, .entry_image'));
  }

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
    const titleText = ((titleEl && titleEl.textContent.trim())
      || (titleLink && titleLink.getAttribute('title')) || '').trim();
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

    const excerptEl = item.querySelector('.entry_excert');
    const excerptText = excerptEl ? excerptEl.textContent.trim() : '';
    if (excerptText) {
      const p = document.createElement('p');
      p.textContent = excerptText;
      content.push(p);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser-list', cells });
  element.replaceWith(block);
}
