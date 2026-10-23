/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-finder.
 * Source: main > [class*="tabbed-container_"] (radix tabs hosting a third-party provider finder).
 * The tabs-finder block is code-owned: its tabs, copy and links are rendered by
 * blocks/tabs-finder/tabs-finder.js (overridable via placeholders), not authored on the page.
 * The parser therefore emits an empty block table that only marks where the finder goes.
 */
export default function parse(element, { document }) {
  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-finder', cells: [] });
  element.replaceWith(block);
}
