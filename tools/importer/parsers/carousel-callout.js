/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-callout.
 * Source: main > [class*="bg-wellness-blue_"]:not(:has(.swiper-slide img)) > .swiper.
 * Slides: .swiper-wrapper > .swiper-slide (swiper duplicates skipped). Slides have no image.
 * Rows: [content (heading, text, CTA)] - single column.
 */
export default function parse(element, { document }) {
  const cells = [];

  const slides = Array.from(element.querySelectorAll('.swiper-wrapper > .swiper-slide'))
    .filter((slide) => !slide.classList.contains('swiper-slide-duplicate'));

  slides.forEach((slide) => {
    const content = [];
    const textScope = slide.querySelector('[class*="text-wrapper_"]') || slide;

    const headingSrc = textScope.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingSrc) {
      const heading = document.createElement('h3');
      heading.textContent = headingSrc.textContent.trim();
      content.push(heading);
    }

    const copy = textScope.querySelector('[class*="supporting-copy_"]');
    if (copy) {
      const paras = copy.querySelectorAll('p');
      if (paras.length) {
        paras.forEach((p) => { if (p.textContent.trim()) content.push(p); });
      } else if (copy.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = copy.textContent.trim();
        content.push(p);
      }
    }

    const ctaSrc = textScope.querySelector('[class*="anchor-wrapper_"] a[href]');
    if (ctaSrc) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaSrc.getAttribute('href');
      a.textContent = ctaSrc.textContent.trim();
      // bold lone link = primary button (EDS authoring convention)
      const strong = document.createElement('strong');
      strong.append(a);
      p.append(strong);
      content.push(p);
    }

    if (!content.length) return;
    cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-callout', cells });
  element.replaceWith(block);
}
