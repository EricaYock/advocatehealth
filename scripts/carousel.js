import { createOptimizedPicture } from './aem.js';
import { createTag, fetchPlaceholders } from './shared.js';

/**
 * Shared carousel engine used by the carousel-* blocks.
 * Loaded only by those blocks so it never weighs on pages without a carousel.
 *
 * Authored structure: one row per slide; cells are an optional image and
 * the slide content (heading, text, CTA). Cell order does not matter.
 *
 * All class names are prefixed with the calling block name
 * (e.g. `.carousel-hero-slide`) so each variant stays self-contained.
 */

const DEFAULT_LABELS = {
  carousel: 'Carousel',
  slide: 'Slide',
  carouselSlideControls: 'Carousel slide controls',
  previousSlide: 'Previous slide',
  nextSlide: 'Next slide',
  pauseSlides: 'Pause automatic slide show',
  playSlides: 'Start automatic slide show',
  showSlide: 'Show slide',
  of: 'of',
};

let carouselCount = 0;

function isImageCell(cell) {
  return !!cell.querySelector('picture, img') && !cell.textContent.trim();
}

function optimizeImages(cell, eager) {
  cell.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    picture.replaceWith(createOptimizedPicture(
      img.src,
      img.alt || '',
      eager,
      [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }],
    ));
  });
}

function buildSlide(row, idx, total, ctx) {
  const { name, id, labels, eagerFirstImage } = ctx;
  const slide = createTag('li', {
    class: `${name}-slide`,
    id: `${id}-slide-${idx}`,
    role: 'group',
    'aria-roledescription': labels.slide,
    'aria-label': `${idx + 1} ${labels.of} ${total}`,
  });

  const cells = [...row.children];
  cells.forEach((cell) => {
    if (isImageCell(cell)) {
      cell.className = `${name}-slide-image`;
      optimizeImages(cell, eagerFirstImage && idx === 0);
    } else if (cell.textContent.trim() || cell.children.length) {
      cell.className = `${name}-slide-content`;
    } else {
      cell.remove();
      return;
    }
    slide.append(cell);
  });

  // keep image first in DOM order regardless of authored order
  const image = slide.querySelector(`.${name}-slide-image`);
  if (image) slide.prepend(image);
  else slide.classList.add(`${name}-slide-text-only`);

  return slide;
}

/**
 * Decorate a carousel block.
 * @param {Element} block
 * @param {string} name - Block name used as class prefix
 * @param {{ eagerFirstImage?: boolean, interval?: number }} [config]
 */
export default async function decorateCarousel(block, name, config = {}) {
  const { eagerFirstImage = false, interval = 6000 } = config;
  carouselCount += 1;
  const id = `${name}-${carouselCount}`;
  const placeholders = await fetchPlaceholders();
  const labels = { ...DEFAULT_LABELS };
  Object.keys(DEFAULT_LABELS).forEach((key) => {
    if (placeholders[key]) labels[key] = placeholders[key];
  });

  const rows = [...block.children];
  const ctx = {
    name, id, labels, eagerFirstImage,
  };

  block.id = id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', labels.carousel);
  const firstHeading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (firstHeading?.id) block.setAttribute('aria-labelledby', firstHeading.id);
  else block.setAttribute('aria-label', labels.carousel);

  const slidesList = createTag('ul', { class: `${name}-slides`, id: `${id}-slides`, 'aria-live': 'off' });
  const slides = rows.map((row, idx) => buildSlide(row, idx, rows.length, ctx));
  slidesList.append(...slides);
  block.replaceChildren(slidesList);

  let active = 0;
  const setActive = (index) => {
    active = (index + slides.length) % slides.length;
    block.dataset.activeSlide = active;
    slides.forEach((slide, idx) => {
      const isActive = idx === active;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.inert = !isActive;
    });
    block.querySelectorAll(`.${name}-indicator button`).forEach((button, idx) => {
      if (idx === active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  };

  if (slides.length < 2) {
    setActive(0);
    return;
  }

  // controls: prev, pause/play, indicators, next
  const controls = createTag('div', {
    class: `${name}-controls`,
    role: 'group',
    'aria-label': labels.carouselSlideControls,
  });
  const prev = createTag('button', {
    type: 'button', class: `${name}-prev`, 'aria-label': labels.previousSlide, 'aria-controls': slidesList.id,
  });
  const next = createTag('button', {
    type: 'button', class: `${name}-next`, 'aria-label': labels.nextSlide, 'aria-controls': slidesList.id,
  });
  const toggle = createTag('button', {
    type: 'button', class: `${name}-toggle`, 'aria-controls': slidesList.id,
  });
  const indicators = createTag('ol', { class: `${name}-indicators` });
  slides.forEach((slide, idx) => {
    const button = createTag('button', {
      type: 'button',
      'aria-controls': slide.id,
      'aria-label': `${labels.showSlide} ${idx + 1} ${labels.of} ${slides.length}`,
    });
    button.addEventListener('click', () => setActive(idx));
    indicators.append(createTag('li', { class: `${name}-indicator` }, button));
  });
  controls.append(prev, toggle, indicators, next);
  block.append(controls);

  // autoplay (WCAG 2.2.2: user can pause; also pauses on hover/focus)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playing = !reducedMotion && interval > 0;
  let held = false;
  let timer;

  const schedule = () => {
    clearTimeout(timer);
    if (playing && !held) timer = setTimeout(() => { setActive(active + 1); schedule(); }, interval);
  };
  const renderToggle = () => {
    toggle.classList.toggle('paused', !playing);
    toggle.setAttribute('aria-label', playing ? labels.pauseSlides : labels.playSlides);
    slidesList.setAttribute('aria-live', playing ? 'off' : 'polite');
    block.classList.toggle('is-playing', playing);
  };

  toggle.addEventListener('click', () => {
    playing = !playing;
    renderToggle();
    schedule();
  });
  prev.addEventListener('click', () => { setActive(active - 1); schedule(); });
  next.addEventListener('click', () => { setActive(active + 1); schedule(); });
  indicators.addEventListener('click', schedule);

  const hold = () => { held = true; clearTimeout(timer); };
  const release = () => { held = false; schedule(); };
  slidesList.addEventListener('mouseenter', hold);
  slidesList.addEventListener('mouseleave', release);
  slidesList.addEventListener('focusin', hold);
  slidesList.addEventListener('focusout', (e) => {
    if (!slidesList.contains(e.relatedTarget)) release();
  });

  setActive(0);
  renderToggle();
  schedule();
}
