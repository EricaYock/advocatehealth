/* eslint-disable */
/* global WebImporter */

/**
 * Turns an imported page into a DA library page template: keeps the page's sections,
 * section metadata, blocks and default-content structure, and replaces the real copy
 * with placeholders, like the existing library templates:
 * - text -> lorem ipsum with the same word count; capitals, sentence breaks and final
 *   punctuation kept; :icon: shorthand and "|" separators are kept; the site name in
 *   the metadata title is kept
 * - link hrefs -> "#"
 * - images -> placehold.co images of the same size (1200x630 for the metadata image)
 * - long lists are shortened
 * Section Metadata tables are left as-is; in the Metadata table only the values change.
 * Runs on the custom 'afterMetadata' hook: call it after WebImporter.rules.createMetadata().
 */
const LOREM = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor '
  + 'incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud '
  + 'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure '
  + 'dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur '
  + 'excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt '
  + 'mollit anim id est laborum').split(' ');

const MAX_LIST_ITEMS = 4;

function blockName(table) {
  const first = table.querySelector('tr');
  return first ? first.textContent.trim().toLowerCase() : '';
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterMetadata') return;
  const main = element;
  const document = element.ownerDocument || payload.document;
  let w = 0;
  // lorem ipsum with the same number of words; sentence breaks (. ? !) are kept and
  // start a capitalised word, other punctuation only at the end of the text
  const lorem = (text, { reset = false } = {}) => {
    if (reset) w = 0;
    const tokens = text.split(/(\s+)/);
    const lastWord = tokens.reduce((last, tok, i) => (/[\p{L}\p{N}]/u.test(tok) ? i : last), -1);
    let capitalize = /^\s*\p{Lu}/u.test(text);
    return tokens.map((tok, i) => {
      if (!tok || /^\s+$/.test(tok)) return tok;
      if (/^:[a-z0-9-]+:$/.test(tok) || !/[\p{L}\p{N}]/u.test(tok)) return tok;
      let word = LOREM[w % LOREM.length];
      w += 1;
      if (capitalize) word = word[0].toUpperCase() + word.slice(1);
      const punct = (tok.match(/[.?!:,;]+$/) || [''])[0].slice(-1);
      capitalize = /[.?!]/.test(punct);
      if (capitalize || (punct && i === lastWord)) return `${word}${punct}`;
      return word;
    }).join('');
  };

  const tables = [...main.querySelectorAll('table')];
  const skip = new Set();
  tables.forEach((table) => {
    const name = blockName(table);
    if (name === 'section metadata') {
      skip.add(table);
    } else if (name === 'metadata') {
      // keep the keys (first cells) and the header row
      table.querySelectorAll('tr').forEach((tr, i) => {
        if (i === 0) { skip.add(tr); return; }
        if (tr.cells[0]) skip.add(tr.cells[0]);
        const key = tr.cells[0] ? tr.cells[0].textContent.trim().toLowerCase() : '';
        if (key === 'title' && tr.cells[1]) {
          const [page, ...site] = tr.cells[1].textContent.split(' | ');
          tr.cells[1].textContent = [lorem(page, { reset: true }), ...site].join(' | ');
          skip.add(tr.cells[1]);
        }
        if (key === 'image' && tr.cells[1]) {
          tr.cells[1].querySelectorAll('img').forEach((img) => {
            img.setAttribute('src', 'https://placehold.co/1200x630');
            img.setAttribute('alt', '');
          });
        }
      });
    } else {
      // other blocks: keep the block name header row
      const first = table.querySelector('tr');
      if (first) skip.add(first);
    }
  });
  const isSkipped = (node) => {
    for (let el = node.parentElement; el && el !== main; el = el.parentElement) {
      if (skip.has(el)) return true;
    }
    return false;
  };

  // shorten long lists
  main.querySelectorAll('ul, ol').forEach((list) => {
    if (isSkipped(list)) return;
    [...list.children].slice(MAX_LIST_ITEMS).forEach((li) => li.remove());
  });

  // text
  const walker = document.createTreeWalker(main, 4 /* NodeFilter.SHOW_TEXT */);
  const texts = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) texts.push(n);
  texts.forEach((node) => {
    if (!node.textContent.trim() || isSkipped(node)) return;
    const reset = !!node.parentElement.closest('h1, h2, h3, h4, h5, h6, a, td');
    node.textContent = lorem(node.textContent, { reset });
  });

  // links and images
  main.querySelectorAll('a[href]').forEach((a) => {
    if (!isSkipped(a)) a.setAttribute('href', '#');
  });
  main.querySelectorAll('img').forEach((img) => {
    if (isSkipped(img) || (img.getAttribute('src') || '').startsWith('https://placehold.co/')) return;
    const width = img.getAttribute('width') || img.naturalWidth || 600;
    const height = img.getAttribute('height') || img.naturalHeight || 400;
    img.setAttribute('src', `https://placehold.co/${width}x${height}`);
    img.setAttribute('alt', lorem(img.getAttribute('alt') || 'Lorem ipsum'));
    img.removeAttribute('srcset');
  });
}
