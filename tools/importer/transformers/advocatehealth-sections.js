/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for advocatehealth.com.
 * beforeTransform: inserts <hr> section breaks (marked for styled sections)
 * while the source section elements still exist.
 * afterTransform: appends Section Metadata blocks for styled sections.
 */
const MARKER = 'data-excat-section-id';

function findSectionEl(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this environment; try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionEl(element, section);
      if (!el) continue;
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;

      // Section content runs from marker to the next <hr> (or end of parent)
      let last = marker;
      let next = marker.nextElementSibling;
      while (next && next.tagName !== 'HR') {
        last = next;
        next = next.nextElementSibling;
      }

      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      last.after(meta);

      if (marker.hasAttribute('data-excat-first')) {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
      }
    }
  }
}
