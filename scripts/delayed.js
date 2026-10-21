// Delayed functionality – analytics and the optional social share dock
import {
  buildBlock, decorateBlock, getMetadata, loadBlock, loadScript,
} from './aem.js';
import { createTag } from './shared.js';

/**
 * The social share dock is opt-in per page: add `social-share: on` to the
 * page metadata to show it. advocatehealth.com has no share widget, so it is
 * off by default.
 */
async function injectSocialShareBlock() {
  if (!/^(on|true|yes)$/i.test(getMetadata('social-share').trim())) return;
  const main = document.querySelector('main');
  if (!main || main.querySelector('.social-share')) return;

  const section = createTag('div', {
    class: 'section',
    'data-section-status': 'initialized',
  });
  section.style.display = null;

  const wrapper = createTag('div');
  const block = buildBlock('social-share', [[]]);
  wrapper.append(block);
  section.append(wrapper);

  main.append(section);

  decorateBlock(block);
  await loadBlock(block);
}

async function loadCloudflareAnalytics() {
  if (!window.location.hostname.includes('bbird.live')) return;

  return loadScript('https://static.cloudflareinsights.com/beacon.min.js', {
    defer: true,
    'data-cf-beacon': '{"token": "6e52f24c204942e89f9b897c49e769d6"}',
  });
}

async function init() {
  await loadCloudflareAnalytics();
  await injectSocialShareBlock();
}

init();
