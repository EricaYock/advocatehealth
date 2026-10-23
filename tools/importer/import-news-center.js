/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import cardsTeaserListParser from './parsers/cards-teaser-list.js';
import cardsThumbListParser from './parsers/cards-thumb-list.js';
import advocatehealthSectionsTransformer from './transformers/advocatehealth-sections.js';
import ahchealthenewsCleanupTransformer from './transformers/ahchealthenews-cleanup.js';

const PAGE_TEMPLATE = {
  "name": "news-center",
  "urls": [
    "https://www.ahchealthenews.com/"
  ],
  "representativeUrl": "https://www.ahchealthenews.com/",
  "description": "Health enews (ahchealthenews.com) homepage migrated as /en/news-center",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        "#news-slider"
      ]
    },
    {
      "name": "cards-teaser-list",
      "instances": [
        ".postcontent > .todays-news",
        ".postcontent > .recipe-feed",
        ".featured-stories .post-list:has(.post)"
      ]
    },
    {
      "name": "cards-thumb-list",
      "instances": [
        "#recent-posts-2 .sposts-list"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "section-1",
      "name": "Featured news slider",
      "selector": [
        "#news-slider"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "News listings (main column)",
      "selector": [
        "#content > .postcontent"
      ],
      "style": null,
      "blocks": [
        "cards-teaser-list"
      ],
      "defaultContent": [
        "h3.titlebg"
      ]
    },
    {
      "id": "section-3",
      "name": "Sidebar: Recent Posts and Subscribe",
      "selector": [
        "#content > .sidebar"
      ],
      "style": "sidebar",
      "blocks": [
        "cards-thumb-list"
      ],
      "defaultContent": [
        "h4.widget-title",
        ".hen-subscribe"
      ]
    }
  ]
};

/* source URL path -> target document path in this project */
const PATH_MAP = {
  '/': '/en/news-center',
};

const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-teaser-list': cardsTeaserListParser,
  'cards-thumb-list': cardsThumbListParser,
};

const transformers = [
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
    const rawPath = PATH_MAP[sourcePath] || sourcePath
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
