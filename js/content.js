/* Antiphon — content localisation.
   The packs in js/i18n.js translate the theme's own interface. They cannot
   translate what the author wrote: the blog title, the subtitle, the
   announcement, page menu labels, article titles, summaries and tags. Those
   live in data/index.json, which is authored content.

   Scope, stated plainly because it decides what this module may and may not
   touch:
     • the theme chrome is translated by js/i18n.js — navigation labels,
       section heads, rubrics, dates, reading time, pagination, error pages;
     • the *metadata* of authored content is translated here — the site title,
       its subtitle, the announcement, footer copy, menu labels, and the
       title/summary/tags of an article or page, when the site supplies them;
     • the *body* of an article or page is never translated. It is the author's
       prose in the author's language, and the theme has no way to know what it
       should say in another one. A post's body is served from its single
       .md file regardless of the interface locale.

   This module adds the metadata layer via an optional sidecar at
   data/i18n.json whose shape mirrors the site config, keyed by locale:

     {
       "zh-Hans": {
         "博客标题": "对经",
         "博客描述（副标题）": "在纸与光之间，抄写每一次呼吸。",
         "网站公告": "本季主题为「光」。",
         "底部信息（格式为markdown）": "对经 · 以字为灯。",
         "菜单中的外部链接": [{ "url": "https://example.com", "显示名称": "工坊" }],
         "页面列表": [{ "文件名": "about.md", "页面标题": "关于" }],
         "文章列表": [{ "文件名": "08-psalm.md", "文章标题": "诗篇", "摘要": "…", "标签": ["诗"] }],
         "标签名称": { "光": "Light" },
         "友人帐": [{ "链接": "https://example.com", "名称": "…", "简介": "…" }]
       },
       "en": { … }
     }

   Resolution for every field is: content[locale][field] -> content["en"]
   [field] -> the authored value in data/index.json. Falling back through en
   mirrors the interface layer (FALLBACK_TAG), so a site that only ships its
   English copy still reads correctly in every other locale, and a site with
   no sidecar at all behaves exactly as it did before this module existed.

   Strings are resolved at render time, never at load time: choosing a
   language rebuilds the shell, the footer and the active route, so every
   overridden string is picked up by the same re-render that already handles
   the interface strings. */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var CONTENT_URL = "./data/i18n.json";
  var state = { raw: null, loaded: false, promise: null };

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  /* Same normalisation as A.matchTag so a sidecar keyed "zh_Hans", "ZH-CN" or
     "zh-CN" all land on the canonical tag. */
  function canonical(tag) {
    if (!tag) return null;
    return A.matchTag ? A.matchTag(tag) : String(tag);
  }

  function blockFor(tag) {
    if (!state.raw || !isPlainObject(state.raw)) return null;
    var wanted = canonical(tag) || tag;
    if (isPlainObject(state.raw[wanted])) return state.raw[wanted];
    var keys = Object.keys(state.raw);
    for (var i = 0; i < keys.length; i++) {
      if (isPlainObject(state.raw[keys[i]]) && canonical(keys[i]) === wanted) return state.raw[keys[i]];
    }
    return null;
  }

  /* Ordered candidate blocks, most specific first.

     The fallback through "en" is deliberately conditional. It exists for the
     common case where a site is authored in one language and ships translations
     for the rest: a German visitor reading an untranslated field must not fall
     back to the authored Chinese, because that is exactly the leak this layer
     removes. But when the active locale *is* the language the site was authored
     in (网站语言), "en" must not win — otherwise a Chinese blog shows its own
     English translation to its Chinese readers, which is its own kind of
     non-global adaptation. In that case the authored text is the right answer
     and the chain stops there. */
  A.contentBlocks = function () {
    var tags = [];
    var active = canonical(A.lang) || A.lang;
    if (active) tags.push(active);
    if (A.lang && A.lang !== active) tags.push(A.lang);

    /* Traditional Chinese borrows the Simplified pack, exactly as A.t() does
       for the interface layer: the two scripts are mutually legible, while
       English is not. This is a nearest-neighbour step, not the en fallback,
       so it only runs for zh-Hant. */
    if (active === "zh-Hant" && tags.indexOf("zh-Hans") === -1) tags.push("zh-Hans");

    /* The en fallback runs whenever the active locale is not the language the
       site was authored in — including a zh-Hans or zh-Hant visitor on a blog
       authored in ja, de or anything else non-Chinese, whose metadata ships
       "en". The only exception is a zh-Hant reader on a zh-Hans-authored site,
       which is already covered by the nearest-neighbour borrow above; there
       the authored copy is the right answer and the chain stops. */
    if (!isAuthoredLocale(active) && !(active === "zh-Hant" && isAuthoredLocale("zh-Hans"))) {
      var fallback = canonical("en") || "en";
      if (tags.indexOf(fallback) === -1) tags.push(fallback);
    }

    var blocks = [];
    tags.forEach(function (tag) {
      var block = blockFor(tag);
      if (block) blocks.push(block);
    });
    return blocks;
  };

  /* True when the active locale is the one the site says it is written in.
     Resolution mirrors A.tagOf so 网站语言 values like "简体中文" or "zh_CN"
     compare correctly against the canonical tag. */
  function isAuthoredLocale(active) {
    if (!active) return false;
    var authored = A.state && A.state.raw && A.state.raw.blog ? A.state.raw.blog["网站语言"] : null;
    if (authored === undefined || authored === null || authored === "") {
      // No declared language: the authored copy is the default for whoever reads it.
      return false;
    }
    if (A.isAuto && A.isAuto(authored)) return false;
    var tag = A.tagOf ? A.tagOf(authored) : null;
    return tag === active;
  }

  /* Read one field with the documented fallback chain. `authored` is the value
     already read from data/index.json and is the last resort, so callers keep
     their current behaviour when no sidecar exists.

     opts.index:   merge the value as an array keyed by a field on the items
                   (used for 文章列表 / 页面列表 / 菜单中的外部链接), so a
                   translation may provide only the fields it changes.
     opts.itemKey: the field used to match items across locales. */
  A.content = function (field, authored, opts) {
    opts = opts || {};
    var blocks = A.contentBlocks();
    for (var i = 0; i < blocks.length; i++) {
      var raw = blocks[i][field];
      if (raw === undefined || raw === null) continue;
      if (opts.index) {
        var merged = mergeIndexed(raw, authored, opts.itemKey);
        if (merged) return merged;
        continue;
      }
      if (typeof raw === "string") {
        if (raw.trim() === "") continue;
        return raw;
      }
      return raw;
    }
    return authored;
  };

  /* Item-level merge: the translated array supplies titles/labels, the authored
     array supplies everything the translation did not mention (filenames,
     timestamps, hidden flags). Matching is by filename for articles and pages,
     by url for external links. Items present only in the authored array are
     inserted untouched, so a partial translation can never drop a post. */
  function mergeIndexed(translated, authored, key) {
    if (!Array.isArray(translated)) return null;
    if (!Array.isArray(authored)) return translated;
    var byKey = {};
    authored.forEach(function (item, i) {
      if (!isPlainObject(item)) return;
      var id = String(item[key] == null ? "" : item[key]).trim();
      if (id) byKey[id] = { item: item, position: i };
    });
    var seen = {};
    var out = [];
    translated.forEach(function (item) {
      if (!isPlainObject(item)) return;
      var id = String(item[key] == null ? "" : item[key]).trim();
      var base = id && byKey[id] ? byKey[id].item : null;
      var merged = base ? Object.assign({}, base, item) : item;
      if (!merged[key] && id) merged[key] = id;
      if (id) seen[id] = true;
      out.push(merged);
    });
    authored.forEach(function (item, i) {
      if (!isPlainObject(item)) return;
      var id = String(item[key] == null ? "" : item[key]).trim();
      if (id && seen[id]) return;
      out.splice(Math.min(i, out.length), 0, item);
    });
    return out;
  }

  /* Convenience readers for the shapes the views need most often. They keep
     the call sites short and put the fallback chain in one place. */
  A.contentText = function (field, authored) {
    var value = A.content(field, authored);
    return value == null ? "" : String(value);
  };

  A.contentList = function (field, authored, itemKey) {
    var value = A.content(field, authored, { index: true, itemKey: itemKey });
    return Array.isArray(value) ? value : authored || [];
  };

  /* The raw translated record for one item, before the authored base is merged
     in. Callers need this when the difference between "the translation left
     this field alone" and "the translation set it to the authored value"
     matters — a page whose 页面标题 was translated but whose menu label was not
     must take its label from the translated title, not from the authored one. */
  A.contentRawItem = function (field, itemKey, id) {
    if (!id) return null;
    var blocks = A.contentBlocks();
    for (var i = 0; i < blocks.length; i++) {
      var list = blocks[i][field];
      if (!Array.isArray(list)) continue;
      for (var j = 0; j < list.length; j++) {
        var item = list[j];
        if (!isPlainObject(item)) continue;
        if (String(item[itemKey] == null ? "" : item[itemKey]).trim() === String(id)) return item;
      }
    }
    return null;
  };

  /* Tag names are authored (they come from 文章列表["标签"]), so they get their
     own translation map rather than an item overlay: a sidecar block may carry

       "标签名称": { "光": "Light", "诗": "Poetry" }

     and every tag surface — the tag index, the kicker links, the tag route's
     heading and its <title> — reads through this one function. Tags are also
     the *argument* of ?function=tag, so the canonical (authored) name stays the
     routing key: translating the label must never change the URL, or a shared
     link would land on "not found" in another language. */
  A.tagLabel = function (tag) {
    var name = String(tag == null ? "" : tag);
    var blocks = A.contentBlocks();
    for (var i = 0; i < blocks.length; i++) {
      var map = blocks[i]["标签名称"];
      if (!isPlainObject(map)) continue;
      var hit = map[name];
      if (hit === undefined || hit === null || String(hit).trim() === "") continue;
      return String(hit);
    }
    return name;
  };

  /* Reverse lookup, used when a route carries a translated tag. It lets a
     ?argument=Light link still resolve to the authored tag "光" so the article
     list matches. Returns the input unchanged when no mapping applies. */
  A.tagCanonical = function (tag) {
    var name = String(tag == null ? "" : tag);
    var blocks = A.contentBlocks();
    for (var i = 0; i < blocks.length; i++) {
      var map = blocks[i]["标签名称"];
      if (!isPlainObject(map)) continue;
      for (var key in map) {
        if (!Object.prototype.hasOwnProperty.call(map, key)) continue;
        if (String(map[key]) === name) return key;
      }
    }
    return name;
  };

  /* The active locale's overlay for one article: only the fields the sidecar
     names are replaced, every other authored field survives. `blog` may be
     passed for the rebuild path; otherwise the live config is used. */
  A.localizeArticle = function (article, blog) {
    if (!article) return article;
    blog = blog || A.state.blog || {};
    var list = A.contentList("文章列表", blog["文章列表"], "文件名");
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && String(list[i]["文件名"] || "") === article.filename) {
        hit = list[i];
        break;
      }
    }
    if (!hit) return article;
    var out = Object.assign({}, article);
    if (hit["文章标题"]) out.title = String(hit["文章标题"]);
    if (hit["摘要"] !== undefined) out.excerpt = String(hit["摘要"]);
    if (Array.isArray(hit["标签"])) out.tags = hit["标签"].map(String);
    return out;
  };

  A.localizePage = function (page, blog) {
    if (!page) return page;
    blog = blog || A.state.blog || {};
    var list = A.contentList("页面列表", blog["页面列表"], "文件名");
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && String(list[i]["文件名"] || "") === page.filename) {
        hit = list[i];
        break;
      }
    }
    if (!hit) return page;
    var out = Object.assign({}, page);
    if (hit["页面标题"]) out.title = String(hit["页面标题"]);
    /* The sidecar may translate only 页面标题. mergeIndexed then carries the
       authored menu label over from the base record, which would keep the
       Chinese label in the German menu. An explicit menu-label translation
       wins; otherwise the label follows the localised title. */
    var raw = A.contentRawItem("页面列表", "文件名", page.filename) || {};
    var explicit = raw["若显示在菜单中，则在菜单中显示为"];
    out.menuLabel = String(explicit || out.title);
    return out;
  };

  /* The body of an article is authorial prose, not interface copy. It deliberately
     stays in whatever language the author wrote it: the theme localises its own
     chrome (navigation, section heads, rubrics, dates, pagination) and the
     metadata of a post (title, summary, tags) when the site supplies a
     translation, but it never invents a translation of the text itself. */

  A.loadContent = function () {
    if (state.promise) return state.promise;
    state.promise = (async function () {
      try {
        var response = await fetch(CONTENT_URL + "?t=" + Date.now(), { cache: "no-store" });
        if (!response.ok) {
          state.loaded = true;
          return null;
        }
        state.raw = await response.json();
      } catch (error) {
        state.raw = null;
      }
      state.loaded = true;
      return state.raw;
    })();
    return state.promise;
  };

  A.hasContentLocale = function (tag) {
    return blockFor(tag || A.lang) !== null;
  };

  A.contentLocales = function () {
    if (!state.raw || !isPlainObject(state.raw)) return [];
    return Object.keys(state.raw).map(canonical).filter(Boolean);
  };

  A.contentReady = function () {
    return state.loaded;
  };

  A.CONTENT_URL = CONTENT_URL;
})(window.Antiphon);
