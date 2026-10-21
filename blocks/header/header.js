/*
 * Header block
 * Nav fragment (nav.plain.html) sections, in order:
 *   1. utility links (ul; a <strong> link renders as a CTA button)
 *   2. brand (logo link)
 *   3. main sections (ul of links)
 *   4. tools: search link (label + form action) and placeholder paragraph
 */

import { decorateIcons } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/shared.js';

const DESKTOP = window.matchMedia('(width >= 900px)');
const SECTION_NAMES = ['utility', 'brand', 'sections', 'tools'];

/* metadata-independent: /content first (local preview), then root (DA/EDS) */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  return { html, base: new URL(resp.url, window.location.href) };
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function iconSpan(name) {
  return el('span', { class: `icon icon-${name}`, 'aria-hidden': 'true' });
}

function linkList(section, className) {
  const list = section?.querySelector('ul');
  if (!list) return null;
  list.className = className;
  list.querySelectorAll(':scope > li').forEach((li) => {
    li.className = `${className}-item`;
    const strong = li.querySelector('strong');
    if (strong?.querySelector('a')) {
      const link = strong.querySelector('a');
      link.classList.add(`${className}-cta`);
      strong.replaceWith(link);
    }
  });
  return list;
}

function buildSearch(tools, nav) {
  const link = tools?.querySelector('a');
  if (!link) return null;
  const label = link.textContent.trim();
  const placeholder = [...tools.querySelectorAll('p')]
    .find((p) => !p.querySelector('a'))?.textContent.trim() || label;
  const action = link.getAttribute('href');

  const panelId = 'nav-search-panel';
  const toggle = el(
    'button',
    {
      type: 'button', class: 'nav-search-toggle', 'aria-expanded': 'false', 'aria-controls': panelId,
    },
    el('span', { class: 'nav-search-label' }, label),
    iconSpan('search'),
  );

  const input = el('input', {
    type: 'search', name: 'q', placeholder, 'aria-label': placeholder, autocomplete: 'off',
  });
  const submit = el('button', { type: 'submit', class: 'nav-search-submit', 'aria-label': label }, iconSpan('search'));
  const form = el('form', {
    class: 'nav-search-form', action, method: 'get', role: 'search',
  }, input, submit);
  const panel = el('div', { class: 'nav-search-panel', id: panelId, hidden: '' }, form);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    nav.classList.toggle('search-open', open);
    if (open) input.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });

  return { toggle, panel, close: () => setOpen(false) };
}


function buildMobileTools(utilityList, placeholders) {
  const tools = el('div', { class: 'nav-mobile-tools' });
  const tel = utilityList?.querySelector('a[href^="tel:"]');
  if (tel) {
    const callLabel = placeholders.call || 'Call';
    tools.append(el(
      'a',
      { class: 'nav-mobile-call', href: tel.getAttribute('href'), 'aria-label': callLabel },
      iconSpan('phone'),
    ));
  }
  const toggle = el(
    'button',
    {
      type: 'button', class: 'nav-menu-toggle', 'aria-expanded': 'false', 'aria-controls': 'nav-drawer',
      'aria-label': placeholders.menu || 'Menu',
    },
    iconSpan('bars'),
    iconSpan('xmark'),
  );
  tools.append(toggle);
  return { tools, toggle };
}

/** @param {Element} block */
export default async function decorate(block) {
  const [fragment, placeholders] = await Promise.all([fetchNav(), fetchPlaceholders()]);
  block.textContent = '';
  if (!fragment) return;

  const tpl = document.createElement('div');
  tpl.innerHTML = fragment.html;
  // resolve fragment-relative image paths against the fragment location
  tpl.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
  });
  const sections = {};
  [...tpl.children].forEach((section, i) => {
    if (SECTION_NAMES[i]) sections[SECTION_NAMES[i]] = section;
  });

  const nav = el('div', { class: 'nav-container' });
  const header = block.closest('header');

  // utility links (desktop: top bar; mobile: inside menu drawer)
  const utilityList = linkList(sections.utility, 'nav-utility-list');
  const utility = utilityList ? el(
    'nav',
    { class: 'nav-utility', 'aria-label': placeholders.utilityNavigation || 'Utility Navigation' },
    utilityList,
  ) : null;
  const utilityBar = el('div', { class: 'nav-utility-bar' });
  nav.append(utilityBar);

  // main row
  const main = el('nav', { class: 'nav-main', 'aria-label': placeholders.mainNavigation || 'Main Navigation' });
  const brandLink = sections.brand?.querySelector('a');
  if (brandLink) {
    brandLink.className = 'nav-brand';
    const img = brandLink.querySelector('img');
    if (img) {
      img.setAttribute('width', img.getAttribute('width') || '360');
      img.setAttribute('height', img.getAttribute('height') || '45');
      img.loading = 'eager';
    }
    main.append(brandLink);
  }
  const sectionList = linkList(sections.sections, 'nav-sections-list') || el('ul', { class: 'nav-sections-list' });
  const search = buildSearch(sections.tools, nav);
  if (search) sectionList.append(el('li', { class: 'nav-sections-list-item nav-search-item' }, search.toggle));
  const { tools: mobileTools, toggle: menuToggle } = buildMobileTools(utilityList, placeholders);
  main.append(sectionList, mobileTools);
  nav.append(el('div', { class: 'nav-main-bar' }, main));

  // mobile menu drawer
  const drawer = el('div', { class: 'nav-drawer', id: 'nav-drawer', hidden: '' });
  nav.append(drawer);

  const setMenuOpen = (open) => {
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? (placeholders.close || 'Close') : (placeholders.menu || 'Menu'));
    drawer.hidden = !open;
    header?.classList.toggle('menu-open', open);
    document.body.style.overflowY = open ? 'hidden' : '';
  };
  menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  // place shared pieces for the current breakpoint
  const layout = () => {
    if (DESKTOP.matches) {
      setMenuOpen(false);
      if (utility) utilityBar.append(utility);
      mobileTools.before(sectionList);
      if (search) nav.append(search.panel);
    } else {
      search?.close();
      if (search) drawer.append(search.panel);
      drawer.append(sectionList);
      if (utility) drawer.append(utility);
    }
  };
  layout();
  DESKTOP.addEventListener('change', layout);

  // sticky header: compact state once the page scrolls
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  block.append(nav);
  decorateIcons(nav);
}
