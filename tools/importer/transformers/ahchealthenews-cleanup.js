/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for ahchealthenews.com (WordPress, "news-center" template).
 * - Removes non-authorable chrome: header/search/nav, footer, back-to-top,
 *   fancybox overlays, consent/cookie/ad widgets, slider controls, share icons,
 *   format-icon spans, .clear spacers, scripts/styles.
 * - Lifts listing-group headings (h3.titlebg) out of the groups that the
 *   cards-teaser-list parser replaces, as <h2> + "View All" link paragraph.
 * - Converts sidebar widget titles (h4.widget-title) to <h3> in place.
 * - Replaces the Subscribe widget form with a bold lone link (primary button).
 */
const SUBSCRIBE_URL = 'https://www.ahchealthenews.com/subscribe/';

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    // Site chrome, overlays, consent/ads, scripts
    WebImporter.DOMUtils.remove(element, [
      '#header',
      '#topsearchform',
      '#footer_all',
      '#gotoTop',
      '[id^="fancybox-"]',
      '[id*="cookie"]',
      '[class*="cookie"]',
      '[class*="consent"]',
      '#onetrust-consent-sdk',
      '.adsbygoogle',
      '[id^="div-gpt-ad"]',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Slider controls/pagination, share icon lists, spacers
    WebImporter.DOMUtils.remove(element, [
      '.news-slider-pag',
      '.news-slider-prev',
      '.news-slider-next',
      '.sociable',
      '.clear',
    ]);

    // Format-icon spans; drop wrapper links left empty by the removal
    element.querySelectorAll('.entry_format').forEach((span) => {
      const a = span.closest('a');
      span.remove();
      if (a && !a.textContent.trim() && !a.querySelector('img, picture')) a.remove();
    });

    // Listing-group headings -> <h2>label</h2><p><a>View All</a></p> before the group
    element.querySelectorAll(
      '.todays-news > h3.titlebg, .recipe-feed > h3.titlebg, .featured-stories .post-list > h3.titlebg',
    ).forEach((h3) => {
      const group = h3.parentElement;
      const label = h3.querySelector('span');
      const viewAll = h3.querySelector('a.viewall');
      const h2 = doc.createElement('h2');
      // the importer may unwrap the <span>, so derive the label without the View All link text
      let text = label ? label.textContent : h3.textContent;
      if (!label && viewAll) text = text.replace(viewAll.textContent, '');
      h2.textContent = text.trim();
      group.before(h2);
      if (viewAll) {
        const p = doc.createElement('p');
        const a = doc.createElement('a');
        a.href = viewAll.getAttribute('href');
        a.textContent = viewAll.textContent.trim();
        p.append(a);
        group.before(p);
      }
      h3.remove();
    });

    // Sidebar widget titles -> <h3>label</h3> in place
    element.querySelectorAll('.sidebar h4.widget-title').forEach((h4) => {
      const label = h4.querySelector('span');
      const h3 = doc.createElement('h3');
      h3.textContent = (label ? label.textContent : h4.textContent).trim();
      h4.replaceWith(h3);
    });

    // Subscribe widget: form -> bold lone link (primary button)
    element.querySelectorAll(
      '#healthenewssubscribe_widget-5 form, .hen-subscribe form',
    ).forEach((form) => {
      const control = form.querySelector('button, input[type="submit"], input.btn, input');
      const labelText = (control && (
        control.getAttribute('value') || control.textContent || ''
      ).trim()) || 'Subscribe Now';
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      const a = doc.createElement('a');
      a.href = SUBSCRIBE_URL;
      a.textContent = labelText;
      strong.append(a);
      p.append(strong);
      form.replaceWith(p);
    });
  }

  if (hookName === 'afterTransform') {
    // Final non-authorable leftovers (HTML comments intentionally preserved)
    WebImporter.DOMUtils.remove(element, [
      '#header',
      '#footer_all',
      '#gotoTop',
      '[id^="fancybox-"]',
      'link',
      'script',
      'style',
      'noscript',
      'iframe',
      'source',
    ]);

    // Strip tracking / event-handler attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (n.startsWith('data-') || n.startsWith('on')) el.removeAttribute(n);
      });
    });
  }
}
