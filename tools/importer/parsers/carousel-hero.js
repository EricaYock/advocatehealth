/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero.
 * Source: main > [class*="hero-banner-carousel_"] (swiper).
 * Each .swiper-slide contains a desktop and a mobile copy of the same content;
 * only the desktop copy ([class*="hero-banner-desktop_"]) is used.
 * Rows: [image, content (heading, text, CTA)]. First slide heading is H1, rest H2.
 */
export default function parse(element, { document }) {
  const cells = [];

  const slides = Array.from(element.querySelectorAll('.swiper-wrapper > .swiper-slide'))
    .filter((slide) => !slide.classList.contains('swiper-slide-duplicate'));

  slides.forEach((slide, index) => {
    const scope = slide.querySelector('[class*="hero-banner-desktop_"]') || slide;

    // Image cell
    const picture = scope.querySelector('[class*="bg-img_"] picture') || scope.querySelector('picture');
    const img = picture ? picture.querySelector('img') : scope.querySelector('img');
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || '';
      imageCell = image;
    }

    // Content cell
    const content = [];
    const textScope = scope.querySelector('[class*="content-wrapper_"]') || scope;
    const headingSrc = textScope.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingSrc) {
      const heading = document.createElement(index === 0 ? 'h1' : 'h2');
      heading.textContent = headingSrc.textContent.trim();
      content.push(heading);
    }

    const richText = textScope.querySelector('[class*="rich-text_"]');
    if (richText) {
      const paras = richText.querySelectorAll('p');
      if (paras.length) {
        paras.forEach((p) => content.push(p));
      } else if (richText.textContent.trim()) {
        const p = document.createElement('p');
        p.innerHTML = richText.innerHTML;
        content.push(p);
      }
    }

    const ctaSrc = textScope.querySelector('[class*="cta-wrapper_"] a');
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
