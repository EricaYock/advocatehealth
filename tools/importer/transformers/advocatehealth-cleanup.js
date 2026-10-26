/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for advocatehealth.com (Next.js, CSS-module hashed classes).
 * Removes non-authorable chrome: header/footer/nav, sticky sentinel, carousel
 * controls/pagination/notifications, route announcer, consent banners, scripts.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global chrome and consent/cookie widgets (affects block matching)
    // NOTE: plain 'header' is NOT used — the tabs-finder content inside <main>
    // contains authorable <header> elements (doctor-finder titles, accordions).
    WebImporter.DOMUtils.remove(element, [
      'header[class*="header_"]',
      'footer[class*="footer_"]',
      '#__next > header',
      '#__next > footer',
      '#__next > nav',
      '[class*="sentinel_"]',
      'next-route-announcer',
      '#__next-route-announcer__',
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '[id*="cookie"]',
      '[class*="cookie"]',
      '[class*="consent"]',
      '[role="dialog"]',
    ]);

    // Carousel chrome: prev/pause/next buttons, dots, pagination, a11y live region
    WebImporter.DOMUtils.remove(element, [
      '[class*="controls-absolute_"]',
      '[class*="carousel-controls_"]',
      '.swiper-pagination',
      '[class*="pagination_"]',
      '.swiper-notification',
      '.swiper-button-prev',
      '.swiper-button-next',
      '.swiper-slide-duplicate',
    ]);

    // Source buttons (.r-btn) in default content: wrap in <strong> so EDS renders
    // them as primary buttons; plain lone links stay text links.
    element.querySelectorAll('a.r-btn').forEach((a) => {
      if (a.closest('strong, b')) return;
      const strong = (element.ownerDocument || payload.document).createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });

    // Button groups (several buttons side by side): one paragraph per button,
    // otherwise the adjacent <strong>s merge into a single paragraph
    const groups = new Set();
    element.querySelectorAll('strong > a.r-btn').forEach((a) => {
      const group = a.parentElement.parentElement;
      if (!group || group.tagName === 'P') return;
      const kids = [...group.children];
      if (kids.length > 1 && kids.every((k) => k.tagName === 'STRONG')) groups.add(group);
    });
    groups.forEach((group) => {
      [...group.children].forEach((strong) => {
        const p = (element.ownerDocument || payload.document).createElement('p');
        strong.replaceWith(p);
        p.append(strong);
      });
    });

    // Link-only column grids (e.g. Featured services) become an authorable list
    const doc = element.ownerDocument || payload.document;
    element.querySelectorAll('[class*="column-grid_"]').forEach((grid) => {
      const kids = [...grid.children];
      if (!kids.length || !kids.every((k) => k.tagName === 'A')) return;
      const ul = doc.createElement('ul');
      kids.forEach((a) => {
        const li = doc.createElement('li');
        li.append(a);
        ul.append(li);
      });
      grid.replaceWith(ul);
    });
  }

  if (hookName === 'afterTransform') {
    // Final non-authorable leftovers (do NOT remove HTML comments here)
    WebImporter.DOMUtils.remove(element, [
      'header[class*="header_"]',
      'footer[class*="footer_"]',
      'nav[class*="navigation-menu-base_"]',
      'link',
      'script',
      'style',
      'noscript',
      'iframe',
      'source',
    ]);

    // Strip tracking / framework attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (
          n.startsWith('data-')
          || n.startsWith('on')
          || n === 'jsx'
        ) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
