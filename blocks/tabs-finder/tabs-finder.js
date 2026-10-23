import { toClassName } from '../../scripts/aem.js';
import { createTag, fetchPlaceholders } from '../../scripts/shared.js';

let tabsFinderCount = 0;

function selectTab(tabs, panels, index, focus = false) {
  tabs.forEach((tab, idx) => {
    const selected = idx === index;
    tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    tab.tabIndex = selected ? 0 : -1;
    panels[idx].hidden = !selected;
  });
  if (focus) tabs[index].focus();
}

/*
 * Code-owned finder: tabs, copy and links are defined here and are NOT authored on the page.
 * Wording/URLs can be changed site-wide (and localized) via placeholders, e.g. keys
 * "finder-doctor-tab", "finder-doctor-text", "finder-doctor-link", "finder-doctor-url".
 */
const FINDER_TABS = [
  {
    key: 'finderDoctor',
    tab: 'Find a doctor',
    text: 'Search for a doctor by name, specialty or location.',
    link: 'Find a doctor',
    url: '/doctors',
  },
  {
    key: 'finderLocation',
    tab: 'Find a location',
    text: 'Search for a hospital, clinic or care location near you.',
    link: 'Find a location',
    url: '/locations',
  },
];

function getTabConfig(defaults, placeholders) {
  const value = (field) => placeholders[`${defaults.key}${field[0].toUpperCase()}${field.slice(1)}`] || defaults[field];
  return {
    tab: value('tab'), text: value('text'), link: value('link'), url: value('url'),
  };
}

function buildPanelContent(config) {
  const text = createTag('p', {}, config.text);
  const link = createTag('a', { href: config.url, title: config.link, class: 'button primary' }, config.link);
  const strong = createTag('strong');
  strong.append(link);
  const cta = createTag('p', { class: 'button-container' });
  cta.append(strong);
  return [text, cta];
}

/**
 * tabs-finder: authors place an empty block; everything inside it is rendered from code.
 * @param {Element} block
 */
export default async function decorate(block) {
  tabsFinderCount += 1;
  const id = `tabs-finder-${tabsFinderCount}`;
  const placeholders = await fetchPlaceholders();
  const configs = FINDER_TABS.map((defaults) => getTabConfig(defaults, placeholders));

  const tablist = createTag('div', { class: 'tabs-finder-list', role: 'tablist' });
  const panelsWrapper = createTag('div', { class: 'tabs-finder-panels' });
  const tabs = [];
  const panels = [];

  configs.forEach((config, idx) => {
    const slug = toClassName(config.tab) || `tab-${idx + 1}`;
    const tabId = `${id}-tab-${slug}`;
    const panelId = `${id}-panel-${slug}`;

    const tab = createTag('button', {
      type: 'button',
      class: 'tabs-finder-tab',
      id: tabId,
      role: 'tab',
      'aria-controls': panelId,
    }, config.tab);

    const panel = createTag('div', {
      class: 'tabs-finder-panel',
      id: panelId,
      role: 'tabpanel',
      'aria-labelledby': tabId,
      tabindex: '0',
    });
    panel.append(...buildPanelContent(config));

    tab.addEventListener('click', () => selectTab(tabs, panels, idx));
    tabs.push(tab);
    panels.push(panel);
    tablist.append(tab);
    panelsWrapper.append(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const keys = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    selectTab(tabs, panels, (keys[e.key] + tabs.length) % tabs.length, true);
  });

  block.replaceChildren(tablist, panelsWrapper);
  selectTab(tabs, panels, 0);
}
