/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero.
 * Source: main > [class*="hero-banner-carousel_"] (swiper).
 * Each .swiper-slide contains a desktop and a mobile copy of the same content;
 * only the desktop copy ([class*="hero-banner-desktop_"]) is used.
 * Rows: [image, content (heading, text, CTA)]. First slide heading is H1, rest H2.
 *
 * Also handles the ahchealthenews.com news slider (#news-slider:
 * ul.news-slider-wrap > .slides_control > li with .news-slider-image (a > img)
 * and .news-slider-content (h2 > a)). That markup is emitted as the
 * `caption` variant: rows [linked image, linked title heading (H1 first, H2 rest)].
 */
function parseNewsSlider(element, document) {
  const cells = [];
  const seen = new Set();

  const slides = Array.from(element.querySelectorAll('li'))
    .filter((li) => li.querySelector(':scope > .news-slider-image, :scope > .news-slider-content'));

  slides.forEach((slide) => {
    const titleLink = slide.querySelector('.news-slider-content h1 a, .news-slider-content h2 a, .news-slider-content h3 a')
      || slide.querySelector('.news-slider-content a[href]');
    const imageLink = slide.querySelector('.news-slider-image a[href]');
    const img = slide.querySelector('.news-slider-image img');
    const href = (titleLink && titleLink.getAttribute('href'))
      || (imageLink && imageLink.getAttribute('href')) || '';
    const title = titleLink ? titleLink.textContent.trim() : '';

    // slider plugins may clone slides; keep each article once
    const key = href || title;
    if (key && seen.has(key)) return;
    if (key) seen.add(key);

    // Image cell (linked to the article when possible)
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || title;
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.append(image);
        imageCell = a;
      } else {
        imageCell = image;
      }
    }

    // Content cell: linked title heading
    const content = [];
    if (title) {
      const heading = document.createElement(cells.length === 0 ? 'h1' : 'h2');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        heading.append(a);
      } else {
        heading.textContent = title;
      }
      content.push(heading);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel Hero (caption)', cells });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  if (element.matches('#news-slider, .news-slider-wrap') || element.querySelector('.news-slider-wrap, .news-slider-content')) {
    parseNewsSlider(element, document);
    return;
  }

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
