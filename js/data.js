/* Antiphon — data loading, normalisation and small utilities */
window.Antiphon = window.Antiphon || {};

(function (A) {
  A.state = {
    blog: null,
    themeCfg: {},
    cfg: {},
    articles: [],
    pages: [],
    visible: [],
    lang: "en",
    markedPromise: null,
    scriptPromises: {},
    stylePromises: {}
  };

  A.DEFAULT_THEME_CFG = {
    "外观": {
      "默认模式": "auto",
      "链接颜色": "",
      "链接颜色（暗色）": "",
      "版心宽度（rem）": 0,
      "首字下沉": true,
      "显示页边目录": true,
      "界面使用衬线": null,
      "档案标记": true,
      "显示访客编号": true
    },
    "窗光": {
      "启用": true,
      "强度": 0.55,
      "粒子密度": 0.5,
      "帧率上限": 60,
      "默认开启": true
    },
    "阅读": {
      "显示阅读时长": true
    }
  };

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  /* Depth-capped merge (cap 8, generous vs the ≤3-level theme cfg): at the cap
     the extra value wins outright, which is also the least surprising outcome
     for a config merge — and it keeps a circular config object from recursing
     into a RangeError. */
  function deepMerge(base, extra, depth) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!isPlainObject(extra)) return out;
    if (depth > 8) {
      Object.keys(extra).forEach(function (key) {
        if (extra[key] !== undefined) out[key] = extra[key];
      });
      return out;
    }
    Object.keys(extra).forEach(function (key) {
      var value = extra[key];
      if (isPlainObject(value) && isPlainObject(out[key])) {
        out[key] = deepMerge(out[key], value, depth + 1);
      } else if (value !== undefined) {
        out[key] = value;
      }
    });
    return out;
  }

  A.deepMerge = function (base, extra) { return deepMerge(base, extra, 0); };

  function parseLegacyTime(value) {
    if (typeof value === "number" && isFinite(value) && value > 0) return value;
    if (typeof value === "string" && value.trim() !== "") {
      var parsed = Date.parse(value.trim().replace(/\./g, "-"));
      if (isFinite(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }

  function normalizeTime(raw, primaryKey, legacyKey) {
    var primary = Number(raw[primaryKey]);
    if (isFinite(primary) && primary > 0) return primary;
    return parseLegacyTime(raw[legacyKey]);
  }

  function normalizeArticle(raw, index) {
    if (!raw || typeof raw !== "object") return null;
    var filename = String(raw["文件名"] || "").trim();
    if (!filename) return null;
    var tags = Array.isArray(raw["标签"]) ? raw["标签"] : [];
    tags = tags
      .map(function (tag) { return String(tag == null ? "" : tag).trim(); })
      .filter(function (tag) { return tag !== ""; });
    return {
      index: index,
      title: String(raw["文章标题"] || filename),
      filename: filename,
      tags: tags,
      excerpt: String(raw["摘要"] || ""),
      created: normalizeTime(raw, "创建时间（时间戳）", "创建日期"),
      modified: normalizeTime(raw, "修改时间（时间戳）", "修改日期"),
      pinned: raw["是否置顶"] === true,
      hidden: raw["是否隐藏"] === true,
      comments: raw["启用评论"] === true,
      encrypted: raw["是否加密"] === true
    };
  }

  function normalizePage(raw, index) {
    if (!raw || typeof raw !== "object") return null;
    var filename = String(raw["文件名"] || "").trim();
    if (!filename) return null;
    var title = String(raw["页面标题"] || filename);
    return {
      index: index,
      title: title,
      filename: filename,
      inMenu: raw["是否显示在菜单中"] === true,
      menuLabel: String(raw["若显示在菜单中，则在菜单中显示为"] || title),
      newTab: raw["是否在新标签页打开"] === true,
      fullHtml: raw["这是一个完整的html"] === true,
      comments: raw["启用评论"] === true
    };
  }

  function ensureShape(blog) {
    blog["文章列表"] = Array.isArray(blog["文章列表"]) ? blog["文章列表"] : [];
    blog["页面列表"] = Array.isArray(blog["页面列表"]) ? blog["页面列表"] : [];
    blog["友人帐"] = Array.isArray(blog["友人帐"]) ? blog["友人帐"] : [];
    blog["菜单中的外部链接"] = Array.isArray(blog["菜单中的外部链接"]) ? blog["菜单中的外部链接"] : [];
    blog["全局主题设置"] = isPlainObject(blog["全局主题设置"]) ? blog["全局主题设置"] : {};
    blog["全局评论设置"] = isPlainObject(blog["全局评论设置"]) ? blog["全局评论设置"] : {};
    blog["Markdown渲染配置"] = isPlainObject(blog["Markdown渲染配置"]) ? blog["Markdown渲染配置"] : {};
    blog["自定义界面文本"] = isPlainObject(blog["自定义界面文本"]) ? blog["自定义界面文本"] : { "启用": false, "列表": [] };
    blog["一言设置"] = isPlainObject(blog["一言设置"]) ? blog["一言设置"] : { "启用一言": false, "范围设置": {} };
    blog["静态资源"] = isPlainObject(blog["静态资源"]) ? blog["静态资源"] : {};
    return blog;
  }

  A.loadBlog = async function () {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (controller) {
      timer = setTimeout(function () { controller.abort(); }, 8000);
    }
    try {
      var response = await fetch("./data/index.json?t=" + Date.now(), {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var blog = ensureShape(await response.json());
      var articles = (blog["文章列表"] || [])
        .map(normalizeArticle)
        .filter(function (item) { return item !== null; });
      var pages = (blog["页面列表"] || [])
        .map(normalizePage)
        .filter(function (item) { return item !== null; });
      articles.forEach(function (article, i) { article.index = i; });
      pages.forEach(function (page, i) { page.index = i; });

      A.state.blog = blog;
      A.state.raw.blog = blog;
      A.state.raw.articles = articles;
      A.state.raw.pages = pages;
      A.state.articles = articles;
      A.state.pages = pages;
      A.state.visible = articles.filter(function (article) { return !article.hidden; });
      return blog;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  A.loadThemeConfig = async function () {
    var defaults = JSON.parse(JSON.stringify(A.DEFAULT_THEME_CFG));
    try {
      var response = await fetch("./themecfg/themecfg.json?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var parsed = await response.json();
      A.state.themeCfg = parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      A.state.themeCfg = {};
      if (String(error && error.message).indexOf("JSON") !== -1) {
        console.warn("[Antiphon] themecfg.json 解析失败，使用默认配置：", error);
      }
    }
    A.state.cfg = deepMerge(defaults, A.state.themeCfg);
    return A.state.cfg;
  };

  /* ——— derived state, rebuilt per locale ———
     Every view reads A.state.articles / A.state.pages / A.state.visible,
     which are normalised from data/index.json. Re-running normalisation on
     the authored records and then overlaying the content sidecar is what
     makes a language switch *global*: instead of patching fifteen call sites
     that print an authored title, one rebuild gives every downstream view
     (home, archive, tags, search, prev/next, marginalia, comments) the
     localised record at once.

     The authored records are kept pristine in `raw` so repeated switches
     never compound an overlay onto a previous overlay, and the localised
     config is published on A.state.local rather than written into
     A.state.blog: 网站语言 and the other resolution inputs must stay authored,
     or the switcher would end up reading its own output. */
  A.state.raw = { blog: null, articles: [], pages: [] };
  A.state.local = { blog: null, articles: [], pages: [], visible: [] };

  var LOCALIZED_BLOG_FIELDS = [
    "博客标题",
    "博客描述（副标题）",
    "网站公告",
    "底部信息（格式为markdown）",
    "全站内容授权说明",
    "友人帐页面附加信息"
  ];

  A.rebuildLocalized = function () {
    var authored = A.state.raw;
    if (!authored || !authored.blog) return;
    var blog = authored.blog;

    /* Config overlay: copy the authored config, then replace only the prose
       fields the sidecar names. The copy keeps 网站语言, the feature flags and
       the comment/theme blocks identical by reference. */
    var localBlog = Object.assign({}, blog);
    if (A.contentText) {
      LOCALIZED_BLOG_FIELDS.forEach(function (field) {
        if (blog[field] === undefined && !A.content(field, null)) return;
        localBlog[field] = A.contentText(field, blog[field]);
      });
      if (Array.isArray(blog["菜单中的外部链接"])) {
        localBlog["菜单中的外部链接"] = A.contentList("菜单中的外部链接", blog["菜单中的外部链接"], "url");
      }
    }

    var articles = authored.articles.map(function (article) {
      return A.localizeArticle ? A.localizeArticle(article, blog) : article;
    });
    var pages = authored.pages.map(function (page) {
      return A.localizePage ? A.localizePage(page, blog) : page;
    });

    A.state.local.blog = localBlog;
    A.state.local.articles = articles;
    A.state.local.pages = pages;
    A.state.local.visible = articles.filter(function (article) { return !article.hidden; });

    A.state.blog = localBlog;
    A.state.articles = articles;
    A.state.pages = pages;
    A.state.visible = A.state.local.visible;
  };

  /* The authored config, for anything that must not be localised (language
     resolution reads 网站语言 from here). */
  A.authoredBlog = function () {
    return A.state.raw.blog || A.state.blog;
  };

  A.getArticle = function (filename) {
    return A.state.articles.find(function (article) { return article.filename === filename; }) || null;
  };

  A.getPage = function (filename) {
    return A.state.pages.find(function (page) { return page.filename === filename; }) || null;
  };

  A.homeOrder = function () {
    var visible = A.state.visible;
    return visible
      .filter(function (article) { return article.pinned; })
      .concat(visible.filter(function (article) { return !article.pinned; }));
  };

  A.visibleAround = function (filename) {
    var list = A.state.visible;
    var index = list.findIndex(function (article) { return article.filename === filename; });
    return {
      prev: index > 0 ? list[index - 1] : null,
      next: index >= 0 && index < list.length - 1 ? list[index + 1] : null
    };
  };

  A.cdn = function (path) {
    var blog = A.state.blog || {};
    var base = blog["CDN路径"] || "https://unpkg.com";
    return String(base).replace(/\/$/, "") + "/" + String(path).replace(/^\//, "");
  };

  A.loadScript = function (src) {
    if (A.state.scriptPromises[src]) return A.state.scriptPromises[src];
    A.state.scriptPromises[src] = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () { resolve(script); };
      script.onerror = function () {
        /* A failed load must not stay cached. Keeping the rejected promise
           meant one network blip poisoned every later view for the session,
           because loadScript() handed the same rejection back forever and no
           caller could retry. Evict on failure so a later navigation gets a
           second chance; the <script> node is also dropped so the dead tag
           does not linger in <head>. */
        delete A.state.scriptPromises[src];
        if (script.parentNode) script.parentNode.removeChild(script);
        reject(new Error("无法加载脚本：" + src));
      };
      document.head.appendChild(script);
    });
    return A.state.scriptPromises[src];
  };

  A.loadStyle = function (href) {
    if (A.state.stylePromises[href]) return A.state.stylePromises[href];
    A.state.stylePromises[href] = new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = function () { resolve(link); };
      link.onerror = function () {
        /* Same eviction rule as loadScript(): a stylesheet that fails once
           (offline, CDN flake) must be retryable, not permanently poisoned. */
        delete A.state.stylePromises[href];
        if (link.parentNode) link.parentNode.removeChild(link);
        reject(new Error("无法加载样式：" + href));
      };
      document.head.appendChild(link);
    });
    return A.state.stylePromises[href];
  };

  A.ensureMarked = function () {
    if (window.marked) return Promise.resolve(window.marked);
    if (A.state.markedPromise) return A.state.markedPromise;
    A.state.markedPromise = A.loadScript(A.cdn("marked@4.3.0/marked.min.js")).then(function () {
      if (!window.marked) throw new Error("marked 未就绪");
      return window.marked;
    })
      .catch(function (error) {
        A.state.markedPromise = null;
        throw error;
      });
    return A.state.markedPromise;
  };

  A.fetchText = async function (url) {
    var response = await fetch(url + (url.indexOf("?") === -1 ? "?t=" + Date.now() : "&t=" + Date.now()), {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.text();
  };

  A.articleUrl = function (filename, withCacheBust) {
    var url = "./data/articles/" + encodeURIComponent(filename);
    return withCacheBust === false ? url : url + "?t=" + Date.now();
  };

  A.pageUrl = function (filename) {
    return "./data/pages/" + encodeURIComponent(filename);
  };

  A.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  /* Date and number formatting follow the resolved locale, not a fixed zh/en
     pattern. The old formatter printed "2026.11.13" for every visitor, which is
     an unambiguous but foreign convention in most of the locales the theme
     ships; Intl gives each one its own order and month name.
     `Intl` accepts the theme's BCP-47 tags directly (verified in Chrome: zh-Hans
     and zh-Hant both resolve to their own CLDR data rather than collapsing to
     zh), so no tag remapping is needed. A missing or partial Intl — old WebViews
     and a few embedded browser shells — falls back to the previous numeric
     pattern rather than throwing inside a render. */
  var tagCache = null;
  var tagCacheSource = null;

  /* The BCP-47 tag handed to Intl. `A.lang` is already a tag Intl accepts
     (verified against this Chrome and Node's ICU: zh-Hans and zh-Hant reach
     their own CLDR data, and neither collapses to the other), so the only job
     here is to normalise the value and memoise it per language. Exposed as a
     public helper because pluralisation and any future formatter must agree
     with the formatters below on which tag is in force. */
  function intlTag() {
    var lang = (A && A.lang) || "en";
    if (lang !== tagCacheSource) {
      tagCacheSource = lang;
      tagCache = (A && A.tagOrFallback ? A.tagOrFallback(lang) : lang);
    }
    return tagCache;
  }

  A.intlTag = intlTag;

  function formatter(Ctor, options) {
    if (typeof Intl === "undefined" || typeof Intl[Ctor] !== "function") return null;
    try {
      return new Intl[Ctor](intlTag(), options);
    } catch (error) {
      return null;
    }
  }

  /* Singular vs base-form selection for counted nouns.
     The packs store one form per key ("{n} years", "{n} subjects"), which reads
     correctly for every count except one — "1 years" is wrong in English,
     German, French, Spanish and Portuguese, and Arabic. `<key>_ONE` carries the
     singular; when a pack has no singular variant the base form is used, which
     is correct for Chinese, Japanese and Korean because those languages do not
     inflect nouns for number at all.
     INVARIANT: the {n} token is optional in a singular. Arabic's natural form
     for "one year" is »سنة واحدة« — a complete phrase with no numeral, because
     Arabic does not append the count to a singular noun the way the other packs
     do. Callers must therefore never assume a number is present in the result:
     compose around the string, do not concatenate a bare separator onto it
     (see joinMeta above) and never try to read the digit back out of it.
     Only the CLDR "one" category is distinguished. Russian and Arabic have
     additional categories (few/many) that would each need their own key; the
     visible defect is the "1 <plural>" case, and adding six forms per noun is
     a translation burden this pass deliberately does not take on. */
  A.plural = function (key, count, replace) {
    var n = Number(count);
    /* Resolve the pack the same way A.t does, which means falling through to en
       when A.lang names something we do not ship. Selecting the singular out of
       an empty pack would otherwise drop through to the base key and print the
       plural for a count of one — "1 years" — which is exactly the defect this
       helper exists to remove. */
    var lang = A.lang;
    if (!A.I18N[lang]) lang = A.tagOrFallback ? A.tagOrFallback(lang) : "en";
    if (!A.I18N[lang]) lang = "en";
    var pluralRule = null;
    if (typeof Intl !== "undefined" && typeof Intl.PluralRules === "function") {
      try {
        pluralRule = new Intl.PluralRules(A.tagOrFallback ? A.tagOrFallback(lang) : lang);
      } catch (error) {
        pluralRule = null;
      }
    }
    var singular = pluralRule ? pluralRule.select(n) === "one" : n === 1;
    var pack = A.I18N[lang] || {};
    var candidate = singular ? key + "_ONE" : key;
    if (pack[candidate] === undefined && A.overrides[candidate] === undefined) {
      candidate = key;
    }
    return A.t(candidate, replace);
  };

  A.num = function (value, pad) {
    var number = Number(value);
    if (!isFinite(number)) return "—";
    var text;
    var format = formatter("NumberFormat", { maximumFractionDigits: 0 });
    try {
      text = format ? format.format(number) : String(Math.round(number));
    } catch (error) {
      text = String(Math.round(number));
    }
    /* The ledger's fixed-width columns (file numbers, entry numbers) are a
       typographic device, not a locale preference, so zero-padding is applied
       after locale grouping and only when the caller asks for it. */
    if (pad) {
      /* Zero-padded columns are a fixed typographic device, so the requested
         width is clamped the same way every other numeric knob in this file is
         (A.clamp): a caller handing in a huge pad would otherwise run an
         unbounded "0"-prepending loop to OOM on the main thread. Non-integer
         pads (2.5) floor to 2 and pad one char, as before. */
      pad = A.clamp(Math.floor(Number(pad) || 0), 0, 16);
      var plain = Math.round(number).toString();
      while (plain.length < pad) plain = "0" + plain;
      text = plain;
    }
    return text;
  };

  A.fmtDate = function (ms) {
    if (!ms || !isFinite(ms)) return "—";
    var date = new Date(ms);
    var format = formatter("DateTimeFormat", { year: "numeric", month: "long", day: "numeric" });
    if (format) {
      try {
        return format.format(date);
      } catch (error) {}
    }
    return (
      date.getFullYear() +
      "." +
      String(date.getMonth() + 1).padStart(2, "0") +
      "." +
      String(date.getDate()).padStart(2, "0")
    );
  };

  /* Compact column date for the ledger and archive rows, where the full
     "13 November 2026" would break the fixed-width grid. Month name plus day
     keeps the locale's own month vocabulary without the year, which the row
     already carries in its own column. */
  A.fmtDateShort = function (ms) {
    if (!ms || !isFinite(ms)) return { year: "—", monthday: "—", full: "—" };
    var date = new Date(ms);
    var full = A.fmtDate(ms);
    var short = formatter("DateTimeFormat", { month: "short", day: "2-digit" });
    var monthday;
    try {
      monthday = short ? short.format(date) : String(date.getMonth() + 1).padStart(2, "0") + "." + String(date.getDate()).padStart(2, "0");
    } catch (error) {
      monthday = String(date.getMonth() + 1).padStart(2, "0") + "." + String(date.getDate()).padStart(2, "0");
    }
    return { year: String(date.getFullYear()), monthday: monthday, full: full };
  };

  A.dateParts = function (ms) {
    return A.fmtDateShort(ms);
  };

  /* Month heading in the archive. Built from a fixed reference year so leap
     years and time zones cannot shift the month; only the name is used. */
  A.monthName = function (month) {
    var index = Number(month);
    if (!isFinite(index) || index < 1 || index > 12) return "—";
    var format = formatter("DateTimeFormat", { month: "long" });
    if (format) {
      try {
        return format.format(new Date(2020, index - 1, 15));
      } catch (error) {}
    }
    return String(index).padStart(2, "0");
  };

  /* Direction-aware arrow glyphs. HTML's U+2192 is not mirrored by the bidi
     algorithm, so in Arabic "next" would still point right — away from the
     direction the text actually advances. Picking the glyph from the resolved
     locale keeps the chrome honest without a second stylesheet. */
  A.arrow = function (which) {
    var rtl = false;
    try {
      rtl = A.localeInfo(A.lang).dir === "rtl";
    } catch (error) {}
    if (which === "back") return rtl ? "→" : "←";
    return rtl ? "←" : "→";
  };

  A.roman = function (number) {
    var n = Math.floor(Number(number));
    if (!isFinite(n) || n <= 0) return "—";
    if (n >= 4000) return String(n);
    var map = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    var out = "";
    for (var i = 0; i < map.length; i++) {
      while (n >= map[i][0]) {
        out += map[i][1];
        n -= map[i][0];
      }
    }
    return out;
  };

  /* Reading time. The old counter recognised Han ideographs and ASCII Latin
     words only, so a Russian, Arabic, Korean or Japanese article scored zero on
     both counts and reported the one-minute floor no matter how long it was.
     The theme ships eleven locales; a Japanese article is kana + kanji and a
     Korean one is hangul, which are the two most affected by that gap.

     Rates are per unit of reading, not per codepoint:
       • Han ideographs — 300/min (unchanged from the original);
       • kana — 400/min, because a kana is a mora and Japanese prose carries
         more information per glyph than a Latin word;
       • words — 220/min. "Word" here means a whitespace-delimited token that
         contains at least one letter from a space-separated script: Latin,
         Cyrillic, Greek, Arabic, accented Latin, or Hangul. Han/kana glyphs
         are stripped before that test, so a Chinese sentence with no spaces
         does not count as one word, and a mixed token ("用Node构建") counts
         once as a word on top of its counted ideographs.
     Script-group counting keeps each script priced at its own rate instead of
     pretending every locale reads like English. */
  A.readingMinutes = function (text) {
    var content = String(text || "");
    var han = (content.match(/\p{Script=Han}/gu) || []).length;
    var kana = (content.match(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
    var words = 0;
    content.split(/\s+/).forEach(function (token) {
      if (!token) return;
      var stripped = token.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, "");
      if (/[\p{L}\p{M}]/u.test(stripped)) words += 1;
    });
    var minutes = Math.ceil(han / 300 + kana / 400 + words / 220);
    return Math.max(1, minutes);
  };

  A.stripHtml = function (html) {
    var div = document.createElement("div");
    div.innerHTML = String(html || "");
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  };

  A.getCfg = function (path, fallback) {
    var value = A.state.cfg;
    var parts = String(path).split(".");
    for (var i = 0; i < parts.length; i++) {
      if (value == null || typeof value !== "object") return fallback;
      value = value[parts[i]];
    }
    return value === undefined || value === null ? fallback : value;
  };

  A.clamp = function (value, min, max) {
    var number = Number(value);
    if (!isFinite(number)) number = min;
    return Math.min(max, Math.max(min, number));
  };

  /* Resolves with a boolean: true when the text reached the clipboard, false
     when both the async Clipboard API and the <textarea>/execCommand fallback
     failed. It never rejects, so a caller can print a truthful "Copied" or
     "Copy failed" label without an unhandled-rejection path. The previous
     version swallowed execCommand's return value and always looked successful,
     which is how the code-block button could claim success over a no-op. */
  A.copyText = function (text) {
    var value = String(text == null ? "" : text);
    function fallback() {
      var area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy") === true; } catch (error) { ok = false; }
      document.body.removeChild(area);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).then(
        function () { return true; },
        function () { return fallback(); }
      );
    }
    return Promise.resolve(fallback());
  };
})(window.Antiphon);
