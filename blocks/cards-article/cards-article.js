import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

function isMediaCell(cell) {
  return !!cell.querySelector('picture, img, .icon') && !cell.textContent.trim();
}

/**
 * cards-article: one row per card. Image cell and title link + description cell per article.
 * Cell order does not matter; empty cells are ignored.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = createTag('ul');

  [...block.children].forEach((row) => {
    const item = createTag('li', { class: 'cards-article-item' });
    [...row.children].forEach((cell) => {
      if (isMediaCell(cell)) {
        cell.className = 'cards-article-image';
        item.prepend(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-article-body';
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
    // The ?width/&format=webply rendition params only exist on the EDS media bus
    // (same-origin images). External images (e.g. the health enews CDN) would get
    // a <source type="image/webp"> pointing at a JPEG plus unsupported params, so
    // keep their authored src untouched.
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
