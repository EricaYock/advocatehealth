import { toClassName } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

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

/**
 * tabs-finder: one row per tab. Cell 1 = tab label, cell 2 = panel content
 * (e.g. intro text and a link to the doctor/location finder).
 * @param {Element} block
 */
export default function decorate(block) {
  tabsFinderCount += 1;
  const id = `tabs-finder-${tabsFinderCount}`;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const tablist = createTag('div', { class: 'tabs-finder-list', role: 'tablist' });
  const panelsWrapper = createTag('div', { class: 'tabs-finder-panels' });
  const tabs = [];
  const panels = [];

  rows.forEach((row, idx) => {
    const [labelCell, contentCell] = row.children;
    const label = labelCell?.textContent.trim() || '';
    const slug = toClassName(label) || `tab-${idx + 1}`;
    const tabId = `${id}-tab-${slug}`;
    const panelId = `${id}-panel-${slug}`;

    const tab = createTag('button', {
      type: 'button',
      class: 'tabs-finder-tab',
      id: tabId,
      role: 'tab',
      'aria-controls': panelId,
    });
    // keep authored inline formatting (e.g. icons) in the label
    tab.append(...(labelCell ? [...labelCell.childNodes] : []));
    const onlyChild = tab.children.length === 1 && tab.firstElementChild;
    if (onlyChild && onlyChild.tagName === 'P') onlyChild.replaceWith(...onlyChild.childNodes);

    const panel = createTag('div', {
      class: 'tabs-finder-panel',
      id: panelId,
      role: 'tabpanel',
      'aria-labelledby': tabId,
      tabindex: '0',
    });
    if (contentCell) panel.append(...contentCell.childNodes);

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
