import decorateCarousel from '../../scripts/carousel.js';

/**
 * carousel-callout: one row per slide (image cell optional, content cell with heading,
 * text and CTA). Control labels come from placeholders with fallbacks.
 * @param {Element} block
 */
export default async function decorate(block) {
  await decorateCarousel(block, 'carousel-callout', { eagerFirstImage: false });
}
