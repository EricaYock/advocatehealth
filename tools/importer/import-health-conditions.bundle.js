/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-health-conditions.js
  var import_health_conditions_exports = {};
  __export(import_health_conditions_exports, {
    default: () => import_health_conditions_default
  });

  // tools/importer/transformers/advocatehealth-condition.js
  function svgSource(img) {
    const src = img.getAttribute("src") || "";
    try {
      if (src.startsWith("data:image/svg+xml;base64,")) return atob(src.split(",")[1]);
      if (src.startsWith("data:image/svg+xml")) return decodeURIComponent(src.split(",")[1]);
      if (src.startsWith("blob:")) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", src, false);
        xhr.send();
        return xhr.responseText;
      }
    } catch (e) {
    }
    return "";
  }
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const doc = element.ownerDocument || payload.document;
    WebImporter.DOMUtils.remove(element, [
      'nav[aria-label="breadcrumb"]',
      '[class*="breadcrumb"]',
      '[class*="left-navigation-mobile_"]',
      '[class*="anchor-back_"]'
    ]);
    element.querySelectorAll('[class*="left-navigation-desktop_"]').forEach((nav) => {
      const frag = doc.createDocumentFragment();
      const back = nav.querySelector('[class*="left-navigation-title_"], a');
      if (back) {
        const p = doc.createElement("p");
        const a = doc.createElement("a");
        a.href = back.getAttribute("href");
        a.textContent = back.textContent.trim();
        p.append(a);
        frag.append(p);
      }
      const links = [...nav.querySelectorAll('[class*="drop-down-menu-item_"] a')];
      if (links.length) {
        const ul = doc.createElement("ul");
        links.forEach((link) => {
          const li = doc.createElement("li");
          const a = doc.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = link.textContent.trim();
          li.append(a);
          ul.append(li);
        });
        frag.append(ul);
      }
      const wrapper = doc.createElement("div");
      wrapper.append(frag);
      nav.replaceWith(wrapper);
    });
    element.querySelectorAll(":is(h1, h2, h3) :is(svg, img)").forEach((icon) => {
      const markup = icon.tagName === "IMG" ? svgSource(icon) : icon.outerHTML;
      const m = markup.match(/data-icon="([a-z0-9-]+)"/);
      if (m) icon.replaceWith(doc.createTextNode(`:${m[1]}: `));
    });
  }

  // tools/importer/transformers/advocatehealth-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionEl(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionEl(element, section);
        if (!el) continue;
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!marker) continue;
        let last = marker;
        let next = marker.nextElementSibling;
        while (next && next.tagName !== "HR" && !next.querySelector("hr")) {
          last = next;
          next = next.nextElementSibling;
        }
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        last.after(meta);
        if (marker.hasAttribute("data-excat-first")) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/transformers/advocatehealth-cleanup.js
  function transform3(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        'header[class*="header_"]',
        'footer[class*="footer_"]',
        "#__next > header",
        "#__next > footer",
        "#__next > nav",
        '[class*="sentinel_"]',
        "next-route-announcer",
        "#__next-route-announcer__",
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[class*="consent"]',
        '[role="dialog"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        '[class*="controls-absolute_"]',
        '[class*="carousel-controls_"]',
        ".swiper-pagination",
        '[class*="pagination_"]',
        ".swiper-notification",
        ".swiper-button-prev",
        ".swiper-button-next",
        ".swiper-slide-duplicate"
      ]);
      element.querySelectorAll("a.r-btn").forEach((a) => {
        if (a.closest("strong, b")) return;
        const strong = (element.ownerDocument || payload.document).createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
      });
      const groups = /* @__PURE__ */ new Set();
      element.querySelectorAll("strong > a.r-btn").forEach((a) => {
        const group = a.parentElement.parentElement;
        if (!group || group.tagName === "P") return;
        const kids = [...group.children];
        if (kids.length > 1 && kids.every((k) => k.tagName === "STRONG")) groups.add(group);
      });
      groups.forEach((group) => {
        [...group.children].forEach((strong) => {
          const p = (element.ownerDocument || payload.document).createElement("p");
          strong.replaceWith(p);
          p.append(strong);
        });
      });
      const doc = element.ownerDocument || payload.document;
      element.querySelectorAll('[class*="column-grid_"]').forEach((grid) => {
        const kids = [...grid.children];
        if (!kids.length || !kids.every((k) => k.tagName === "A")) return;
        const ul = doc.createElement("ul");
        kids.forEach((a) => {
          const li = doc.createElement("li");
          li.append(a);
          ul.append(li);
        });
        grid.replaceWith(ul);
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        'header[class*="header_"]',
        'footer[class*="footer_"]',
        'nav[class*="navigation-menu-base_"]',
        "link",
        "script",
        "style",
        "noscript",
        "iframe",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-") || n.startsWith("on") || n === "jsx") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/import-health-conditions.js
  var PAGE_TEMPLATE = {
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
          'main [class*="left-nav-navigation-column_"]'
        ],
        "style": "left-nav",
        "blocks": [],
        "defaultContent": [
          '[class*="left-navigation-desktop_"]'
        ]
      },
      {
        "id": "section-2",
        "name": "Intro: title, CTA, overview",
        "selector": [
          'main [class*="left-nav-content-column_"] > div:nth-of-type(1)'
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
          'main [class*="left-nav-content-column_"] > [class*="bg-white-smoke_"][class*="multi-button-base_"]'
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
          'main [class*="left-nav-content-column_"] > div:nth-of-type(4)'
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
          'main [class*="left-nav-content-column_"] > [class*="bg-white_"][class*="multi-button-base_"]'
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
  var parsers = {};
  var transformers = [
    transform,
    transform2,
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_health_conditions_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_health_conditions_exports);
})();
