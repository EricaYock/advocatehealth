/* eslint-disable */
/* global WebImporter */

/*
 * Builds the DA library page template "health-conditions" from a real condition page:
 * same sections, section styles and default content, with lorem ipsum text, "#" links
 * and placehold.co images. Output: /docs/library/templates/health-conditions
 */

import advocatehealthConditionTransformer from './transformers/advocatehealth-condition.js';
import advocatehealthSectionsTransformer from './transformers/advocatehealth-sections.js';
import advocatehealthCleanupTransformer from './transformers/advocatehealth-cleanup.js';
import libraryTemplateTransformer from './transformers/library-template.js';

const PAGE_TEMPLATE = {
  "name": "health-conditions",
  "urls": [
    "https://www.advocatehealth.com/health-services/advocate-heart-institute/conditions/high-blood-pressure"
  ],
  "representativeUrl": "https://www.advocatehealth.com/health-services/advocate-heart-institute/conditions/high-blood-pressure",
  "description": "Advocate Health Care condition page (health-services/*/conditions/*)",
  "blocks": [],
  "urlPattern": "/health-services/advocate-heart-institute/conditions/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Left navigation",
      "selector": [
        "main [class*=\"left-nav-navigation-column_\"]"
      ],
      "style": "left-nav",
      "blocks": [],
      "defaultContent": [
        "[class*=\"left-navigation-desktop_\"]"
      ]
    },
    {
      "id": "section-2",
      "name": "Intro: title, CTA, overview",
      "selector": [
        "main [class*=\"left-nav-content-column_\"] > div:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h1",
        "a.r-btn",
        "p",
        "h2"
      ]
    },
    {
      "id": "section-3",
      "name": "Need care? CTA box",
      "selector": [
        "main [class*=\"left-nav-content-column_\"] > [class*=\"bg-white-smoke_\"][class*=\"multi-button-base_\"]"
      ],
      "style": "light-grey, centered",
      "blocks": [],
      "defaultContent": [
        "h2",
        "p",
        "a.r-btn"
      ]
    },
    {
      "id": "section-4",
      "name": "Condition body copy",
      "selector": [
        "main [class*=\"left-nav-content-column_\"] > div:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h2",
        "h3",
        "p",
        "ul"
      ]
    },
    {
      "id": "section-5",
      "name": "Get care",
      "selector": [
        "main [class*=\"left-nav-content-column_\"] > [class*=\"bg-white_\"][class*=\"multi-button-base_\"]"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "h2",
        "p",
        "a.r-btn"
      ]
    }
  ]
};

const parsers = {};

const transformers = [
  advocatehealthConditionTransformer,
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

    libraryTemplateTransformer('afterMetadata', main, payload);

    const path = '/docs/library/templates/health-conditions';

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
