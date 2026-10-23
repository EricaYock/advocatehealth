import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/*
 * Turn ":icon-name:" shorthand that the content pipeline has not converted (e.g. local
 * preview) into a decorated icon. Icons already converted by the pipeline are decorated
 * by decorateMain, so they are left alone to avoid duplicate icon images.
 */
function convertIconShorthand(cell) {
  const match = cell.textContent.trim().match(/^:([a-z0-9-]+):$/);
  if (!match) return;
  cell.replaceChildren(createTag('span', { class: `icon icon-${match[1]}` }));
  decorateIcons(cell);
}

function isMediaCell(cell) {
  return !!cell.querySelector('picture, img, .icon') && !cell.textContent.trim();
}

/**
 * cards-icon-links: one row per card. Icon/image cell and label + link cell per item.
 * Cell order does not matter; empty cells are ignored.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = createTag('ul');

  [...block.children].forEach((row) => {
    const item = createTag('li', { class: 'cards-icon-links-item' });
    [...row.children].forEach((cell) => {
      convertIconShorthand(cell);
      if (isMediaCell(cell)) {
        cell.className = 'cards-icon-links-icon';
        item.prepend(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-icon-links-body';
        item.append(cell);
      }
    });
    if (!item.children.length) return;

    // card links render as text links, not buttons
    item.querySelectorAll('a.button').forEach((link) => {
      link.classList.remove('button', 'primary', 'secondary');
      link.closest('.button-container')?.classList.remove('button-container');
    });

    list.append(item);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]),
    );
  });

  block.replaceChildren(list);
}
