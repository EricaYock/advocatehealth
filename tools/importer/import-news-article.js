/* eslint-disable */
/* global WebImporter */

import cardsArticleParser from './parsers/cards-article.js';
import cardsThumbListParser from './parsers/cards-thumb-list.js';
import ahchealthenewsArticleTransformer from './transformers/ahchealthenews-article.js';
import advocatehealthSectionsTransformer from './transformers/advocatehealth-sections.js';
import ahchealthenewsCleanupTransformer from './transformers/ahchealthenews-cleanup.js';

const PAGE_TEMPLATE = {
  "name": "news-article",
  "urls": [
    "https://www.ahchealthenews.com/2026/10/16/can-an-air-purifier-actually-help-your-allergy-symptoms/"
  ],
  "representativeUrl": "https://www.ahchealthenews.com/2026/10/16/can-an-air-purifier-actually-help-your-allergy-symptoms/",
  "description": "health enews article page (ahchealthenews.com/YYYY/MM/DD/slug/) migrated under /en/news-center/{slug}",
  "blocks": [
    {
      "name": "cards-article",
      "instances": [
        "#content ul.related-posts"
      ]
    },
    {
      "name": "cards-thumb-list",
      "instances": [
        "#content .widget_recent_entries .sposts-list"
      ]
    }
  ],
  "urlPattern": "/2026/10/16/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Article (main column)",
      "selector": [
        "#content > .postcontent"
      ],
      "style": null,
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        "#page_title",
        ".entry_image",
        ".entry_c > p",
        ".entry_c > h5",
        ".entry_c > ul",
        "h3.titlebg"
      ]
    },
    {
      "id": "section-2",
      "name": "Sidebar: LiveWell, Find a Doctor, Recent Posts, Subscribe",
      "selector": [
        "#content > .sidebar"
      ],
      "style": "sidebar",
      "blocks": [
        "cards-thumb-list"
      ],
      "defaultContent": [
        "#livewell_widget-2",
        ".find-a-doctor-widget",
        "h4.widget-title",
        ".hen-subscribe"
      ]
    },
    {
      "id": "section-3",
      "name": "About the Author",
      "selector": [
        ".hen-author-box"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        "h4",
        ".single-extra-box"
      ]
    }
  ]
};

/* health enews article URL (/YYYY/MM/DD/slug/) -> /en/news-center/slug */
function articlePath(sourcePath) {
  const m = sourcePath.match(/^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/);
  return m ? `/en/news-center/${m[1]}` : null;
}

const parsers = {
  'cards-article': cardsArticleParser,
  'cards-thumb-list': cardsThumbListParser,
};

const transformers = [
  ahchealthenewsArticleTransformer,
  advocatehealthSectionsTransformer,
  ahchealthenewsCleanupTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const sourcePath = new URL(params.originalURL).pathname;
    const rawPath = articlePath(sourcePath) || sourcePath
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath || '/index');

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
