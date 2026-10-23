import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

function isMediaCell(cell) {
  return !!cell.querySelector('picture, img') && !cell.textContent.trim();
}

/**
 * A line right after the title is the date when it parses as a date or when
 * more text follows it (title, date, excerpt). Otherwise it is the excerpt.
 * @param {Element} body
 */
function markParts(body) {
  const parts = [...body.children].filter((el) => el.textContent.trim());
  const [title, second] = parts;
  if (!title) return;
  title.classList.add('cards-teaser-list-title');
  if (!second) return;
  const text = second.textContent.trim();
  const looksLikeDate = /\d/.test(text) && !Number.isNaN(Date.parse(text));
  if (looksLikeDate || (parts.length > 2 && text.length < 40)) {
    second.classList.add('cards-teaser-list-date');
  }
}

/**
 * cards-teaser-list: vertical list of article teasers. One row per teaser:
 * image cell + text cell (linked title, optional date line, excerpt).
 * Cell order does not matter; empty cells and rows are ignored.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = createTag('ul');

  [...block.children].forEach((row) => {
    const item = createTag('li', { class: 'cards-teaser-list-item' });
    [...row.children].forEach((cell) => {
      if (isMediaCell(cell)) {
        cell.className = 'cards-teaser-list-image';
        item.prepend(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-teaser-list-body';
        markParts(cell);
        item.append(cell);
      }
    });
    if (!item.children.length) return;
    if (!item.querySelector('.cards-teaser-list-image')) item.classList.add('cards-teaser-list-text-only');

    // links render as text links, not buttons
    item.querySelectorAll('a.button').forEach((link) => {
      link.classList.remove('button', 'primary', 'secondary');
      link.closest('.button-container')?.classList.remove('button-container');
    });

    list.append(item);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    // rendition params only exist on the EDS media bus (same-origin images);
    // keep external image sources untouched
    if (new URL(img.src, window.location.href).origin !== window.location.origin) {
      img.loading = 'lazy';
      return;
    }
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(list);
}
