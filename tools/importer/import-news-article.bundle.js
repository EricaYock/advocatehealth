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

  // tools/importer/import-news-article.js
  var import_news_article_exports = {};
  __export(import_news_article_exports, {
    default: () => import_news_article_default
  });

  // tools/importer/parsers/cards-article.js
  function parseRelatedPosts(element, document) {
    const cells = [];
    Array.from(element.querySelectorAll(":scope > li")).forEach((item) => {
      const srcImg = item.querySelector(".entry_image img");
      const imageLink = item.querySelector(".entry_image a[href]");
      const titleLink = item.querySelector(".entry_title a[href]") || imageLink;
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = srcImg.getAttribute("alt") || "";
        if (imageLink) {
          const a = document.createElement("a");
          a.href = imageLink.getAttribute("href");
          a.append(img);
          imageCell = a;
        } else {
          imageCell = img;
        }
      }
      const content = [];
      const titleEl = item.querySelector(".entry_title");
      const titleText = (titleEl && titleEl.textContent.trim() || srcImg && srcImg.getAttribute("alt") || "").trim();
      if (titleText) {
        const p = document.createElement("p");
        if (titleLink) {
          const a = document.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = titleText;
          p.append(a);
        } else {
          p.textContent = titleText;
        }
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    return cells;
  }
  function parse(element, { document }) {
    if (element.matches("ul.related-posts")) {
      const relatedCells = parseRelatedPosts(element, document);
      const relatedBlock = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells: relatedCells });
      element.replaceWith(relatedBlock);
      return;
    }
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

  // tools/importer/parsers/cards-thumb-list.js
  function parse2(element, { document }) {
    const cells = [];
    const items = Array.from(element.querySelectorAll(":scope > li"));
    items.forEach((item) => {
      const img = item.querySelector(".entry_image img") || item.querySelector("img");
      let imageCell = "";
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || "";
        imageCell = image;
      }
      const content = [];
      const titleEl = item.querySelector(".entry_title");
      const titleLink = item.querySelector(".entry_title a[href]") || item.querySelector(".entry_image a[href]");
      const titleText = (titleEl && titleEl.textContent.trim() || img && img.getAttribute("alt") || "").trim();
      if (titleText) {
        const p = document.createElement("p");
        if (titleLink) {
          const a = document.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = titleText;
          p.append(a);
        } else {
          p.textContent = titleText;
        }
        content.push(p);
      }
      const dateEl = item.querySelector(".entry_meta li") || item.querySelector(".entry_meta");
      const dateText = dateEl ? dateEl.textContent.trim() : "";
      if (dateText) {
        const p = document.createElement("p");
        p.textContent = dateText;
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-thumb-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ahchealthenews-article.js
  var FIND_A_DOCTOR_LABELS = [
    { match: "aurorahealthcare.org", label: "Find a doctor in Wisconsin" },
    { match: "advocatehealth.com", label: "Find a doctor in Illinois" }
  ];
  function boldLinkParagraph(doc, href, text) {
    const p = doc.createElement("p");
    const strong = doc.createElement("strong");
    const a = doc.createElement("a");
    a.href = href;
    a.textContent = text;
    strong.append(a);
    p.append(strong);
    return p;
  }
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const doc = element.ownerDocument || payload.document;
    element.querySelectorAll("h3.titlebg").forEach((h3) => {
      if (h3.textContent.trim().toLowerCase() === "comments") h3.remove();
    });
    WebImporter.DOMUtils.remove(element, [
      "#breadcrumbs",
      "#comments",
      "#respond",
      "#commentform",
      ".navigation.page-navigation",
      "div.line",
      ".author-extras .fright",
      ".sgr-main",
      ".g-recaptcha-response",
      ".g-recaptcha-bubble-arrow",
      'iframe[src*="recaptcha"]',
      ".postcontent .sociable"
    ]);
    const pageTitle = element.querySelector("#page_title");
    const byline = element.querySelector("#page_author");
    if (pageTitle && byline) {
      const h1 = pageTitle.querySelector("h1");
      const authorLink = byline.querySelector("a");
      if (h1) {
        const p = doc.createElement("p");
        if (authorLink) {
          const prefix = byline.textContent.replace(authorLink.textContent, "").replace(/\s+/g, " ").trim();
          if (prefix) p.append(doc.createTextNode(`${prefix} `));
          const a = doc.createElement("a");
          a.href = authorLink.getAttribute("href");
          a.textContent = authorLink.textContent.trim();
          p.append(a);
        } else {
          p.textContent = byline.textContent.replace(/\s+/g, " ").trim();
        }
        if (p.textContent.trim()) h1.after(p);
      }
      byline.remove();
    }
    element.querySelectorAll(".postcontent .entry_c > h5").forEach((h5) => {
      const h2 = doc.createElement("h2");
      const only = h5.children.length === 1 ? h5.firstElementChild : null;
      const src = only && only.tagName === "STRONG" && only.textContent.trim() === h5.textContent.trim() ? only : h5;
      h2.innerHTML = src.innerHTML.trim();
      h5.replaceWith(h2);
    });
    element.querySelectorAll("h3.titlebg").forEach((h3) => {
      const next = h3.nextElementSibling;
      if (next && next.matches("ul.related-posts")) {
        const h2 = doc.createElement("h2");
        h2.textContent = h3.textContent.trim();
        h3.replaceWith(h2);
      }
    });
    const extraBox = element.querySelector(".single-extra-box");
    if (extraBox) {
      let heading = extraBox.previousElementSibling;
      if (!heading || heading.tagName !== "H4") heading = null;
      const box = doc.createElement("div");
      box.className = "hen-author-box";
      if (heading) {
        const h2 = doc.createElement("h2");
        h2.textContent = heading.textContent.trim();
        box.append(h2);
      }
      const photo = extraBox.querySelector(".author-image img");
      if (photo) {
        const p = doc.createElement("p");
        p.append(photo);
        box.append(p);
      }
      const desc = extraBox.querySelector(".author-desc");
      const name = desc ? desc.textContent.replace(/\s+/g, " ").trim() : "";
      if (name) {
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        strong.textContent = name;
        p.append(strong);
        box.append(p);
      }
      extraBox.querySelectorAll(":scope > p").forEach((bio) => {
        if (bio.textContent.trim()) box.append(bio);
      });
      extraBox.querySelectorAll(".author-extras a").forEach((link) => {
        if (!link.textContent.trim()) return;
        const p = doc.createElement("p");
        const a = doc.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.trim();
        p.append(a);
        box.append(p);
      });
      const sidebar = element.querySelector("#content > .sidebar");
      const anchor = sidebar || extraBox;
      anchor.after(box);
      if (heading) heading.remove();
      extraBox.remove();
    }
    element.querySelectorAll(".find-a-doctor-widget").forEach((widget) => {
      const mapImg = widget.querySelector(".find-a-doctor-img img");
      if (mapImg && !mapImg.hasAttribute("alt")) mapImg.setAttribute("alt", "");
      const links = widget.querySelector(".find-a-doctor-links");
      if (!links) return;
      const buttons = [];
      links.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        const img = a.querySelector("img");
        let label = (img && (img.getAttribute("alt") || img.getAttribute("title")) || "").trim() || a.textContent.trim();
        if (!label) {
          const known = FIND_A_DOCTOR_LABELS.find((k) => href.includes(k.match));
          label = known ? known.label : "";
        }
        if (label) buttons.push(boldLinkParagraph(doc, href, label));
      });
      links.replaceChildren(...buttons);
    });
    element.querySelectorAll("#livewell_widget-2, .livewell-widget").forEach((widget) => {
      widget.querySelectorAll("img").forEach((img) => {
        if (!(img.getAttribute("alt") || "").trim()) img.setAttribute("alt", "LiveWell");
      });
      widget.querySelectorAll("a[href]").forEach((a) => {
        if (a.closest("p, h1, h2, h3, h4, h5, h6, li")) return;
        a.replaceWith(boldLinkParagraph(doc, a.getAttribute("href"), a.textContent.trim()));
      });
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

  // tools/importer/transformers/ahchealthenews-cleanup.js
  var SUBSCRIBE_URL = "https://www.ahchealthenews.com/subscribe/";
  function transform3(hookName, element, payload) {
    const doc = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#header",
        "#topsearchform",
        "#footer_all",
        "#gotoTop",
        '[id^="fancybox-"]',
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[class*="consent"]',
        "#onetrust-consent-sdk",
        ".adsbygoogle",
        '[id^="div-gpt-ad"]',
        "script",
        "style",
        "noscript",
        "link"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".news-slider-pag",
        ".news-slider-prev",
        ".news-slider-next",
        ".sociable",
        ".clear"
      ]);
      element.querySelectorAll(".entry_format").forEach((span) => {
        const a = span.closest("a");
        span.remove();
        if (a && !a.textContent.trim() && !a.querySelector("img, picture")) a.remove();
      });
      element.querySelectorAll(
        ".todays-news > h3.titlebg, .recipe-feed > h3.titlebg, .featured-stories .post-list > h3.titlebg"
      ).forEach((h3) => {
        const group = h3.parentElement;
        const label = h3.querySelector("span");
        const viewAll = h3.querySelector("a.viewall");
        const h2 = doc.createElement("h2");
        let text = label ? label.textContent : h3.textContent;
        if (!label && viewAll) text = text.replace(viewAll.textContent, "");
        h2.textContent = text.trim();
        group.before(h2);
        if (viewAll) {
          const p = doc.createElement("p");
          const a = doc.createElement("a");
          a.href = viewAll.getAttribute("href");
          a.textContent = viewAll.textContent.trim();
          p.append(a);
          group.before(p);
        }
        h3.remove();
      });
      element.querySelectorAll(".sidebar h4.widget-title").forEach((h4) => {
        const label = h4.querySelector("span");
        const h3 = doc.createElement("h3");
        h3.textContent = (label ? label.textContent : h4.textContent).trim();
        h4.replaceWith(h3);
      });
      element.querySelectorAll(
        "#healthenewssubscribe_widget-5 form, .hen-subscribe form"
      ).forEach((form) => {
        const control = form.querySelector('button, input[type="submit"], input.btn, input');
        const labelText = control && (control.getAttribute("value") || control.textContent || "").trim() || "Subscribe Now";
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        const a = doc.createElement("a");
        a.href = SUBSCRIBE_URL;
        a.textContent = labelText;
        strong.append(a);
        p.append(strong);
        form.replaceWith(p);
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#header",
        "#footer_all",
        "#gotoTop",
        '[id^="fancybox-"]',
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
          if (n.startsWith("data-") || n.startsWith("on")) el.removeAttribute(n);
        });
      });
    }
  }

  // tools/importer/import-news-article.js
  var PAGE_TEMPLATE = {
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
  function articlePath(sourcePath) {
    const m = sourcePath.match(/^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/);
    return m ? `/en/news-center/${m[1]}` : null;
  }
  var parsers = {
    "cards-article": parse,
    "cards-thumb-list": parse2
  };
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
  var import_news_article_default = {
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
      const sourcePath = new URL(params.originalURL).pathname;
      const rawPath = articlePath(sourcePath) || sourcePath.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_news_article_exports);
})();
