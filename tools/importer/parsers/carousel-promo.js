/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-promo.
 * Source: main > [class*="bg-wellness-blue_"]:has(.swiper-slide img) > .swiper.
 * Slides: .swiper-wrapper > .swiper-slide (swiper duplicates skipped).
 * Rows: [image, content (heading, text, CTA)].
 */
export default function parse(element, { document }) {
  const cells = [];

  const slides = Array.from(element.querySelectorAll('.swiper-wrapper > .swiper-slide'))
    .filter((slide) => !slide.classList.contains('swiper-slide-duplicate'));

  slides.forEach((slide) => {
    // Image cell
    const imgSrc = slide.querySelector('[class*="image-wrapper_"] img');
    let imageCell = '';
    if (imgSrc && imgSrc.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = imgSrc.getAttribute('src');
      img.alt = imgSrc.getAttribute('alt') || '';
      imageCell = img;
    }

    // Content cell
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

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-promo', cells });
  element.replaceWith(block);
}
