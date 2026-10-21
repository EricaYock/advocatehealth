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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const cells = [];
    const slides = Array.from(element.querySelectorAll(".swiper-wrapper > .swiper-slide")).filter((slide) => !slide.classList.contains("swiper-slide-duplicate"));
    slides.forEach((slide, index) => {
      const scope = slide.querySelector('[class*="hero-banner-desktop_"]') || slide;
      const picture = scope.querySelector('[class*="bg-img_"] picture') || scope.querySelector("picture");
      const img = picture ? picture.querySelector("img") : scope.querySelector("img");
      let imageCell = "";
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        imageCell = image;
      }
      const content = [];
      const textScope = scope.querySelector('[class*="content-wrapper_"]') || scope;
      const headingSrc = textScope.querySelector("h1, h2, h3, h4, h5, h6");
      if (headingSrc) {
        const heading = document.createElement(index === 0 ? "h1" : "h2");
        heading.textContent = headingSrc.textContent.trim();
        content.push(heading);
      }
      const richText = textScope.querySelector('[class*="rich-text_"]');
      if (richText) {
        const paras = richText.querySelectorAll("p");
        if (paras.length) {
          paras.forEach((p) => content.push(p));
        } else if (richText.textContent.trim()) {
          const p = document.createElement("p");
          p.innerHTML = richText.innerHTML;
          content.push(p);
        }
      }
      const ctaSrc = textScope.querySelector('[class*="cta-wrapper_"] a');
      if (ctaSrc) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaSrc.getAttribute("href");
        a.textContent = ctaSrc.textContent.trim();
        const strong = document.createElement("strong");
        strong.append(a);
        p.append(strong);
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-finder.js
  var FINDERS = [
    { match: /doctor|provider/i, href: "/doctors", text: "Search for a doctor by name, specialty or location." },
    { match: /location/i, href: "/locations", text: "Search for a hospital, clinic or care location near you." }
  ];
  function parse2(element, { document }) {
    const cells = [];
    const triggers = Array.from(element.querySelectorAll('[class*="tab-list_"] > button'));
    triggers.forEach((trigger) => {
      const label = trigger.textContent.trim();
      if (!label) return;
      const content = [];
      const finder = FINDERS.find((f) => f.match.test(label));
      if (finder) {
        const text = document.createElement("p");
        text.textContent = finder.text;
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = finder.href;
        a.textContent = label;
        const strong = document.createElement("strong");
        strong.append(a);
        p.append(strong);
        content.push(text, p);
      }
      cells.push([label, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-finder", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-links.js
  function parse3(element, { document }) {
    const cells = [];
    const cards = Array.from(element.children).filter((el) => /icon-cta-simplified-card_/.test(el.className || ""));
    cards.forEach((card) => {
      const iconSrc = card.querySelector('[class*="icon-cta-simplified-card-icon_"] img, [class*="icon-cta-simplified-card-icon_"] svg');
      let iconCell = "";
      let iconName = iconSrc && iconSrc.getAttribute("data-icon");
      const src = iconSrc && iconSrc.getAttribute("src");
      if (!iconName && src && (src.startsWith("data:image/svg+xml") || src.startsWith("blob:"))) {
        try {
          let svg;
          if (src.startsWith("blob:")) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", src, false);
            xhr.send();
            svg = xhr.responseText || "";
          } else {
            svg = src.includes(";base64,") ? atob(src.split(",")[1]) : decodeURIComponent(src.split(",")[1]);
          }
          const m = svg.match(/data-icon="([^"]+)"/);
          if (m) [, iconName] = m;
        } catch (e) {
        }
      }
      if (iconName) {
        iconCell = document.createElement("p");
        iconCell.textContent = `:${iconName}:`;
      } else if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
        const img = document.createElement("img");
        img.src = iconSrc.getAttribute("src");
        img.alt = iconSrc.getAttribute("alt") || "";
        iconCell = img;
      }
      const content = [];
      const copy = card.querySelector('[class*="icon-cta-simplified-card-support-copy_"]');
      if (copy) {
        const paras = copy.querySelectorAll("p");
        if (paras.length) {
          paras.forEach((p) => {
            if (p.textContent.trim()) content.push(p);
          });
        } else if (copy.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = copy.textContent.trim();
          content.push(p);
        }
      }
      const linkSrc = card.querySelector('[class*="icon-cta-simplified-card-anchor-wrapper_"] a[href]');
      if (linkSrc) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = linkSrc.getAttribute("href");
        a.textContent = linkSrc.textContent.trim();
        p.append(a);
        content.push(p);
      }
      if (!iconCell && !content.length) return;
      cells.push([iconCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-promo.js
  function parse4(element, { document }) {
    const cells = [];
    const slides = Array.from(element.querySelectorAll(".swiper-wrapper > .swiper-slide")).filter((slide) => !slide.classList.contains("swiper-slide-duplicate"));
    slides.forEach((slide) => {
      const imgSrc = slide.querySelector('[class*="image-wrapper_"] img');
      let imageCell = "";
      if (imgSrc && imgSrc.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = imgSrc.getAttribute("src");
        img.alt = imgSrc.getAttribute("alt") || "";
        imageCell = img;
      }
      const content = [];
      const textScope = slide.querySelector('[class*="text-wrapper_"]') || slide;
      const headingSrc = textScope.querySelector("h1, h2, h3, h4, h5, h6");
      if (headingSrc) {
        const heading = document.createElement("h3");
        heading.textContent = headingSrc.textContent.trim();
        content.push(heading);
      }
      const copy = textScope.querySelector('[class*="supporting-copy_"]');
      if (copy) {
        const paras = copy.querySelectorAll("p");
        if (paras.length) {
          paras.forEach((p) => {
            if (p.textContent.trim()) content.push(p);
          });
        } else if (copy.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = copy.textContent.trim();
          content.push(p);
        }
      }
      const ctaSrc = textScope.querySelector('[class*="anchor-wrapper_"] a[href]');
      if (ctaSrc) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaSrc.getAttribute("href");
        a.textContent = ctaSrc.textContent.trim();
        const strong = document.createElement("strong");
        strong.append(a);
        p.append(strong);
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse5(element, { document }) {
    const cells = [];
    const cards = Array.from(element.children).filter((el) => /content-feed-for-health-news-card_/.test(el.className || ""));
    cards.forEach((card) => {
      const imgSrc = card.querySelector("img");
      let imageCell = "";
      if (imgSrc && imgSrc.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = imgSrc.getAttribute("src");
        img.alt = imgSrc.getAttribute("alt") || "";
        imageCell = img;
      }
      const content = [];
      const titleLink = card.querySelector('a[class*="card-title-link_"]');
      if (titleLink) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = titleLink.getAttribute("href");
        a.textContent = titleLink.textContent.trim();
        p.append(a);
        content.push(p);
      }
      const excerpt = card.querySelector('[class*="card-excerpt_"]');
      if (excerpt) {
        const paras = excerpt.querySelectorAll("p");
        if (paras.length) {
          paras.forEach((p) => {
            if (p.textContent.trim()) content.push(p);
          });
        } else if (excerpt.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = excerpt.textContent.trim();
          content.push(p);
        }
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-callout.js
  function parse6(element, { document }) {
    const cells = [];
    const slides = Array.from(element.querySelectorAll(".swiper-wrapper > .swiper-slide")).filter((slide) => !slide.classList.contains("swiper-slide-duplicate"));
    slides.forEach((slide) => {
      const content = [];
      const textScope = slide.querySelector('[class*="text-wrapper_"]') || slide;
      const headingSrc = textScope.querySelector("h1, h2, h3, h4, h5, h6");
      if (headingSrc) {
        const heading = document.createElement("h3");
        heading.textContent = headingSrc.textContent.trim();
        content.push(heading);
      }
      const copy = textScope.querySelector('[class*="supporting-copy_"]');
      if (copy) {
        const paras = copy.querySelectorAll("p");
        if (paras.length) {
          paras.forEach((p) => {
            if (p.textContent.trim()) content.push(p);
          });
        } else if (copy.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = copy.textContent.trim();
          content.push(p);
        }
      }
      const ctaSrc = textScope.querySelector('[class*="anchor-wrapper_"] a[href]');
      if (ctaSrc) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaSrc.getAttribute("href");
        a.textContent = ctaSrc.textContent.trim();
        const strong = document.createElement("strong");
        strong.append(a);
        p.append(strong);
        content.push(p);
      }
      if (!content.length) return;
      cells.push([content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-callout", cells });
    element.replaceWith(block);
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
  function transform(hookName, element, payload) {
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
        while (next && next.tagName !== "HR") {
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
  function transform2(hookName, element, payload) {
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
          'main > [class*="hero-banner-carousel_"]'
        ]
      },
      {
        "name": "tabs-finder",
        "instances": [
          'main > [class*="tabbed-container_"]'
        ]
      },
      {
        "name": "cards-icon-links",
        "instances": [
          '[class*="column-grid_"]:has(> [class*="icon-cta-simplified-card_"])'
        ]
      },
      {
        "name": "carousel-promo",
        "instances": [
          'main > [class*="bg-wellness-blue_"]:has(.swiper-slide img) > .swiper'
        ]
      },
      {
        "name": "cards-article",
        "instances": [
          '[class*="cards-grid_"]'
        ]
      },
      {
        "name": "carousel-callout",
        "instances": [
          'main > [class*="bg-wellness-blue_"]:not(:has(.swiper-slide img)) > .swiper'
        ]
      }
    ],
    "urlPattern": "/",
    "sections": [
      {
        "id": "section-1",
        "name": "Hero carousel",
        "selector": [
          'main > [class*="hero-banner-carousel_"]'
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
          'main > [class*="tabbed-container_"]'
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
          'main > section:has([class*="icon-cta-simplified-card_"])'
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
          'main > [class*="bg-wellness-blue_"]:has(.swiper-slide img)'
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
          'main > [class*="contained-small_"]:has(> div > h2)'
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          "h2",
          '[class*="column-grid_"]',
          '[class*="content-container-cta_"]'
        ]
      },
      {
        "id": "section-6",
        "name": "News for you",
        "selector": [
          'main > [class*="bg-white-smoke_"]'
        ],
        "style": "light-grey, centered",
        "blocks": [
          "cards-article"
        ],
        "defaultContent": [
          "h2",
          '[class*="support-copy_"]',
          '[class*="content-container-cta_"]'
        ]
      },
      {
        "id": "section-7",
        "name": "Callout carousel",
        "selector": [
          'main > [class*="bg-wellness-blue_"]:not(:has(.swiper-slide img))'
        ],
        "style": "dark-blue",
        "blocks": [
          "carousel-callout"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "tabs-finder": parse2,
    "cards-icon-links": parse3,
    "carousel-promo": parse4,
    "cards-article": parse5,
    "carousel-callout": parse6
  };
  var transformers = [
    transform,
    transform2
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
