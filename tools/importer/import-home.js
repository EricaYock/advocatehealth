/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import tabsFinderParser from './parsers/tabs-finder.js';
import cardsIconLinksParser from './parsers/cards-icon-links.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import cardsArticleParser from './parsers/cards-article.js';
import carouselCalloutParser from './parsers/carousel-callout.js';
import advocatehealthSectionsTransformer from './transformers/advocatehealth-sections.js';
import advocatehealthCleanupTransformer from './transformers/advocatehealth-cleanup.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.advocatehealth.com/"
  ],
  "representativeUrl": "https://www.advocatehealth.com/",
  "description": "Advocate Health Care homepage: hero carousel, finder tabs, quick links, promo and callout carousels, featured services, news cards",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        "main > [class*=\"hero-banner-carousel_\"]"
      ]
    },
    {
      "name": "tabs-finder",
      "instances": [
        "main > [class*=\"tabbed-container_\"]"
      ]
    },
    {
      "name": "cards-icon-links",
      "instances": [
        "[class*=\"column-grid_\"]:has(> [class*=\"icon-cta-simplified-card_\"])"
      ]
    },
    {
      "name": "carousel-promo",
      "instances": [
        "main > [class*=\"bg-wellness-blue_\"]:has(.swiper-slide img) > .swiper"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        "[class*=\"cards-grid_\"]"
      ]
    },
    {
      "name": "carousel-callout",
      "instances": [
        "main > [class*=\"bg-wellness-blue_\"]:not(:has(.swiper-slide img)) > .swiper"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero carousel",
      "selector": [
        "main > [class*=\"hero-banner-carousel_\"]"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Find a doctor / Find a location finder",
      "selector": [
        "main > [class*=\"tabbed-container_\"]"
      ],
      "style": null,
      "blocks": [
        "tabs-finder"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Quick links icon grid",
      "selector": [
        "main > section:has([class*=\"icon-cta-simplified-card_\"])"
      ],
      "style": null,
      "blocks": [
        "cards-icon-links"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Promo banner carousel",
      "selector": [
        "main > [class*=\"bg-wellness-blue_\"]:has(.swiper-slide img)"
      ],
      "style": "dark-blue",
      "blocks": [
        "carousel-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "Featured services",
      "selector": [
        "main > [class*=\"contained-small_\"]:has(> div > h2)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "h2",
        "[class*=\"column-grid_\"]",
        "[class*=\"content-container-cta_\"]"
      ]
    },
    {
      "id": "section-6",
      "name": "News for you",
      "selector": [
        "main > [class*=\"bg-white-smoke_\"]"
      ],
      "style": "light-grey, centered",
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        "h2",
        "[class*=\"support-copy_\"]",
        "[class*=\"content-container-cta_\"]"
      ]
    },
    {
      "id": "section-7",
      "name": "Callout carousel",
      "selector": [
        "main > [class*=\"bg-wellness-blue_\"]:not(:has(.swiper-slide img))"
      ],
      "style": "dark-blue",
      "blocks": [
        "carousel-callout"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'carousel-hero': carouselHeroParser,
  'tabs-finder': tabsFinderParser,
  'cards-icon-links': cardsIconLinksParser,
  'carousel-promo': carouselPromoParser,
  'cards-article': cardsArticleParser,
  'carousel-callout': carouselCalloutParser,
};

const transformers = [
  advocatehealthSectionsTransformer,
  advocatehealthCleanupTransformer,
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

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
