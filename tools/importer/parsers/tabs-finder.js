/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-finder.
 * Source: main > [class*="tabbed-container_"] (radix tabs).
 * Tab labels: [class*="tab-list_"] > button (one row per tab, in document order).
 * The source panels host a third-party provider-finder widget (sp-provider-finder) or are
 * rendered client-side (empty), so each panel is authored as a short text + link to the
 * finder app (/doctors or /locations). Widget content is intentionally not migrated.
 * Rows: [tab label, panel content].
 */
const FINDERS = [
  { match: /doctor|provider/i, href: '/doctors', text: 'Search for a doctor by name, specialty or location.' },
  { match: /location/i, href: '/locations', text: 'Search for a hospital, clinic or care location near you.' },
];

export default function parse(element, { document }) {
  const cells = [];

  const triggers = Array.from(element.querySelectorAll('[class*="tab-list_"] > button'));

  triggers.forEach((trigger) => {
    const label = trigger.textContent.trim();
    if (!label) return;

    const content = [];
    const finder = FINDERS.find((f) => f.match.test(label));
    if (finder) {
      const text = document.createElement('p');
      text.textContent = finder.text;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = finder.href;
      a.textContent = label;
      // bold lone link = primary button (EDS authoring convention)
      const strong = document.createElement('strong');
      strong.append(a);
      p.append(strong);
      content.push(text, p);
    }

    cells.push([label, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-finder', cells });
  element.replaceWith(block);
}
