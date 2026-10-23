import decorateCarousel from '../../scripts/carousel.js';

/**
 * caption option: each slide is a linked photo with the linked title in a caption bar.
 * Links render as plain text links (not buttons) and, when the photo is not linked
 * itself, it reuses the title link (hidden from assistive tech to avoid a duplicate).
 * @param {Element} block
 */
function decorateCaptionSlides(block) {
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    const content = slide.querySelector('.carousel-hero-slide-content');
    content?.querySelectorAll('a.button').forEach((link) => {
      link.classList.remove('button', 'primary', 'secondary');
      link.closest('.button-container')?.classList.remove('button-container');
    });

    const picture = slide.querySelector('.carousel-hero-slide-image picture');
    const link = content?.querySelector('a[href]');
    if (!picture || !link || picture.closest('a')) return;
    const imageLink = document.createElement('a');
    imageLink.href = link.href;
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
    picture.replaceWith(imageLink);
    imageLink.append(picture);
  });
}

/**
 * carousel-hero: one row per slide (image cell optional, content cell with heading,
 * text and CTA). Control labels come from placeholders with fallbacks.
 * Options: `caption` - contained slider with the linked title in a caption bar.
 * @param {Element} block
 */
export default async function decorate(block) {
  await decorateCarousel(block, 'carousel-hero', { eagerFirstImage: true });
  if (block.classList.contains('caption')) decorateCaptionSlides(block);
}
