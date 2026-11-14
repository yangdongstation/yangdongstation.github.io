/* Antiphon — shell, panels and views */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var V = (A.views = A.views || {});

  V.icon = function (name) {
    var paths = {
      search:
        '<circle cx="7" cy="7" r="4.4"/><path d="M10.4 10.4 14 14"/>',
      moon:
        '<path d="M12.6 3.2a6.2 6.2 0 1 0 4.4 10.6 7 7 0 0 1-4.4-10.6Z"/>',
      sun:
        '<circle cx="8" cy="8" r="3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/>',
      candle:
        '<path d="M8 2.2c1.6 1.4 2.4 2.4 2.4 3.7a2.4 2.4 0 0 1-4.8 0c0-1.3.8-2.3 2.4-3.7Z"/><path d="M5 8.6h6v5.2H5z"/>',
      /* A capital A with a baseline rule underneath — the archetypal type
         specimen mark, and legible at 16px where a serif/sans pair would not be. */
      type:
        '<path d="M4.2 12.4 8 3.6l3.8 8.8"/><path d="M5.9 9.4h4.2"/><path d="M2.6 13.6h10.8"/>',
      /* A meridian globe: the conventional glyph for "interface language",
         drawn to the same 16px hairline grid as the other icons. */
      locale:
        '<circle cx="8" cy="8" r="5.3"/><path d="M2.9 8h10.2"/><path d="M8 2.7c1.5 1.7 2.2 3.4 2.2 5.3S9.5 11.6 8 13.3M8 2.7C6.5 4.4 5.8 6.1 5.8 8s.7 3.6 2.2 5.3"/>'
    };
    return (
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="square" aria-hidden="true">' +
      (paths[name] || "") +
      "</svg>"
    );
  };

  /* The type tab's popover. Rendered once into the masthead at shell paint so
     the button's aria-controls has a real target; bindShell toggles `hidden`.
     Every row carries its own sample line in its own face, which is the point of
     a type chooser — the label alone would be a list of words. */
  V.fontMenu = function () {
    var current = A.getFont ? A.getFont() : "antiphon";
    /* Preset names stay as they are: Humanist/Grotesk/Mono are the specimen
       labels a type chooser would print, and translating them would name a
       face that does not exist. The sample line is prose about the face, so it
       is translated — set in the face it advertises, the sample is only useful
       if the reader can read it. */
    var rows = [
      { id: "antiphon", label: "Antiphon", sample: A.t("FONT_SAMPLE_ANTIPHON") },
      { id: "humanist", label: "Humanist", sample: A.t("FONT_SAMPLE_HUMANIST") },
      { id: "grotesk", label: "Grotesk", sample: A.t("FONT_SAMPLE_GROTESK") },
      { id: "mono", label: "Mono", sample: A.t("FONT_SAMPLE_MONO") }
    ];
    var items = rows
      .map(function (row) {
        var checked = row.id === current;
        return (
          '<button class="font-item" type="button" role="menuitemradio" data-font-choice="' + row.id +
          '" aria-checked="' + (checked ? "true" : "false") + '">' +
          '<span class="font-item-mark" aria-hidden="true">◆</span>' +
          "<span>" +
          '<span class="font-item-name">' + A.esc(row.label) + "</span>" +
          '<span class="font-item-sample font-sample-' + row.id + '">' + A.esc(row.sample) + "</span>" +
          "</span>" +
          "</button>"
        );
      })
      .join("");
    return (
      '<div id="font-menu" role="menu" aria-label="' + A.esc(A.t("FONT_LABEL")) + '" hidden>' +
      '<span class="font-menu-label">' + A.esc(A.t("FONT_LABEL")) + "</span>" +
      items +
      "</div>"
    );
  };

  /* The locale tab's popover, built from the registry in js/i18n.js so the
     offered list and the resolvable list can never drift apart. Rows mirror the
     type menu's markup and semantics (roled radiogroup, aria-checked), because
     both are "pick one of N" popovers that sit in the same masthead cluster. */
  V.langMenu = function () {
    var current = A.lang;
    var stored = A.readStoredLocale();
    var auto = !stored || A.isAuto(stored);
    /* The auto row reports what auto actually resolved to. "Follow system" on
       its own is a promise the reader cannot check, and a visitor whose OS is
       in a language they did not expect has no way to tell whether the theme
       obeyed them or ignored them. The detected endonym appears as the row's
       sample line; it is the same string the matching locale row shows. */
    var detected = A.localeInfo(A.lang);
    var rows = [
      { id: "auto", label: A.t("LANG_AUTO"), hint: A.t("LANG_AUTO_NOW", { name: detected.endonym }) }
    ].concat(
      A.LOCALE_ORDER.map(function (tag) {
        var info = A.LOCALES[tag];
        return { id: tag, label: info.endonym, hint: info.code };
      })
    );
    var items = rows
      .map(function (row) {
        var checked = row.id === "auto" ? auto : row.id === current;
        return (
          '<button class="font-item" type="button" role="menuitemradio" data-lang-choice="' + A.esc(row.id) +
          '" aria-checked="' + (checked ? "true" : "false") +
          '" lang="' + (row.id === "auto" ? A.localeInfo(A.lang).htmlLang : A.esc(row.id)) + '">' +
          '<span class="font-item-mark" aria-hidden="true">◆</span>' +
          "<span>" +
          '<span class="font-item-name">' + A.esc(row.label) + "</span>" +
          (row.hint
            ? '<span class="font-item-sample">' + A.esc(row.hint) + "</span>"
            : '<span class="font-item-sample">' + A.esc(A.t("LANG_LABEL")) + "</span>") +
          "</span>" +
          "</button>"
        );
      })
      .join("");
    return (
      '<div id="lang-menu" class="font-menu" role="menu" aria-label="' + A.esc(A.t("LANG_LABEL")) + '" hidden>' +
      '<span class="font-menu-label">' + A.esc(A.t("LANG_LABEL")) + "</span>" +
      items +
      "</div>"
    );
  };

  V.sigil = function (size) {
    size = size || 18;
    return (
      '<svg class="sigil" viewBox="0 0 80 80" width="' + size + '" height="' + size + '" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1">' +
      '<circle cx="40" cy="40" r="34" opacity=".18" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="26" opacity=".3" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="18" opacity=".5" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="3" fill="currentColor" stroke="none"/>' +
      "</svg>"
    );
  };

  V.ornament = function () {
    return (
      '<div class="signal-divider" aria-hidden="true">' +
      '<span class="line"></span>' +
      '<span class="node">●</span>' +
      '<span class="line line--right"></span>' +
      "</div>"
    );
  };

  V.panel = function (inner, meta) {
    meta = meta || {};
    var classification = meta.classification || A.t("CLASS_INDEX");
    var fileNo = meta.fileNo === undefined || meta.fileNo === null ? "—" : meta.fileNo;
    var leaf = meta.leaf === undefined || meta.leaf === null ? "" : meta.leaf;
    return (
      '<section class="panel">' +
      '<span class="panel-top" aria-hidden="true"></span>' +
      '<span class="panel-edge panel-edge--left" aria-hidden="true"></span>' +
      '<span class="panel-edge panel-edge--right" aria-hidden="true"></span>' +
      '<div class="panel-status">' +
      '<span class="status-kind"><span class="led" aria-hidden="true"></span>' + A.esc(classification) + "</span>" +
      "<span>" + A.esc(A.t("FILE_LABEL")) + " " + A.esc(fileNo) + "</span>" +
      (leaf ? "<span>" + A.esc(leaf) + "</span>" : "") +
      "<span>" + A.esc(A.fmtDate(Date.now())) + "</span>" +
      "</div>" +
      '<div class="panel-inner">' + inner + "</div>" +
      "</section>"
    );
  };

  /* Section metadata is composed from fragments, and one of those fragments may
     legitimately be empty: Arabic's singular for "one year" is the complete
     phrase »سنة واحدة« and carries no {n} token, so the count can come back as
     nothing at all. Joining with " · " would then leave an orphaned separator or
     a doubled space. This drops empty fragments before joining and trims the
     result, which keeps the rule independent of what each locale returns. */
  function joinMeta(parts) {
    return parts
      .map(function (part) { return String(part == null ? "" : part).replace(/\s+/g, " ").trim(); })
      .filter(Boolean)
      .join(" · ");
  }

  /* a ruled section head: LABEL ————— METADATA */
  V.secHead = function (label, meta) {
    return (
      '<header class="sec-head">' +
      '<h2 class="sec-head-title">' + A.esc(label) + "</h2>" +
      '<span class="sec-head-rule" aria-hidden="true"></span>' +
      (meta ? '<p class="sec-head-meta">' + A.esc(meta) + "</p>" : "") +
      "</header>"
    );
  };

  V.navItems = function () {
    var blog = A.state.blog;
    var items = [
      { key: "home", label: A.t("NAV_ARTICLES"), href: "./index.html?type=internal&function=article_list" }
    ];
    if (blog["在菜单中添加归档和标签的入口"] !== false) {
      items.push({
        key: "archive",
        label: A.t("NAV_ARCHIVE"),
        href: "./index.html?type=internal&function=archive_and_tags"
      });
    }
    A.state.pages.forEach(function (page) {
      if (!page.inMenu) return;
      var localized = A.localizePage(page);
      items.push({
        key: "page:" + page.filename,
        label: localized.menuLabel || localized.title,
        href: "./index.html?type=page&filename=" + encodeURIComponent(page.filename),
        blank: page.newTab
      });
    });
    if (blog["启用内建友人帐页面"] === true) {
      items.push({
        key: "friends",
        label: A.t("NAV_FRIENDS"),
        href: "./index.html?type=internal&function=friendbook"
      });
    }
    /* External links are authored, so their display names come from the
     content sidecar when it names this locale, matched by url. The url itself
     is never translated — it is the identity of the link, not its label. */
    var externalLinks = A.contentList("菜单中的外部链接", blog["菜单中的外部链接"], "url");
    externalLinks.forEach(function (link) {
      if (!link || !link["url"]) return;
      items.push({
        key: null,
        label: String(link["显示名称"] || link["url"]),
        href: String(link["url"]),
        blank: link["是否在新标签页打开"] === true,
        external: true
      });
    });
    return items;
  };

  /* The site's own name, with a language-neutral fallback.
     The old fallback was the literal Chinese "对经", which leaked a Chinese
     string into the masthead, the footer, the <title> and every untitled
     page for readers in all ten other locales. The brand name is not a
     translatable interface string (the theme cannot know what an author's
     blog is called in German), so the fallback is the theme's own Latin name
     rather than a translation — the same choice js/app.js makes for the
     placeholder <title> and og:title.

     When data/i18n.json names this locale's title, that string wins: a site
     that really does publish "The Antiphon" in German must be able to say so,
     and the brand is the single most visible string on the page. */
  V.siteName = function () {
    var blog = A.state.blog || {};
    var authored = String(blog["博客标题"] || "").trim();
    var localized = A.contentText("博客标题", authored).trim();
    return localized || authored || "Antiphon";
  };

  V.renderShell = function () {
    var blog = A.state.blog;
    var mode = document.body.getAttribute("data-mode") === "night" ? "night" : "day";
    var subtitle = A.contentText("博客描述（副标题）", blog["博客描述（副标题）"]);
    var masthead = document.getElementById("masthead");
    var nav = V.navItems()
      .map(function (item) {
        var attrs =
          (item.blank ? ' target="_blank" rel="noopener"' : "") +
          (item.external ? "" : " data-internal") +
          (item.key ? ' data-nav-key="' + A.esc(item.key) + '"' : "");
        return '<a href="' + A.esc(item.href) + '"' + attrs + ">" + A.esc(item.label) + "</a>";
      })
      .join("");

    masthead.innerHTML =
      '<div class="masthead-top">' +
      '<p class="sys-line"><span class="led" aria-hidden="true"></span>' +
      "<strong>" + A.esc(A.t("SYS_STATUS")) + "</strong>" +
      '<span class="protocol">' + A.esc(A.t("SYS_PROTOCOL")) + "</span></p>" +
      '<div class="masthead-actions">' +
      '<button class="icon-btn" id="search-btn" type="button" aria-label="' + A.esc(A.t("SEARCH")) + '">' + V.icon("search") + "</button>" +
      '<button class="icon-btn" id="mode-btn" type="button" aria-label="' + A.esc(A.t(mode === "day" ? "THEME_NIGHT" : "THEME_DAY")) + '">' + V.icon(mode === "day" ? "moon" : "sun") + "</button>" +
      (A.state.cfg && A.state.cfg["窗光"] && A.state.cfg["窗光"]["启用"] !== false
        ? '<button class="icon-btn" id="light-btn" type="button" aria-label="' + A.esc(A.t("LIGHT_ON")) + '">' + V.icon("candle") + "</button>"
        : "") +
      /* The type tab. aria-expanded/aria-controls are set here so the popover
         below is a labelled region from the first paint; bindShell only flips
         the state. It sits outside the action buttons' own order but inside the
         same flex cluster, so it stays visually last. */
      '<button class="icon-btn" id="font-btn" type="button" aria-label="' + A.esc(A.t("FONT_LABEL")) +
      '" aria-expanded="false" aria-controls="font-menu">' + V.icon("type") + "</button>" +
      /* The language tab. Same popover contract as the type tab above: the
         button owns aria-expanded, the menu is its aria-controls target, and
         bindShell flips the state. It is rendered from the locale registry, so
         a locale added there appears here without further markup. */
      '<button class="icon-btn" id="lang-btn" type="button" aria-label="' + A.esc(A.t("LANG_LABEL")) +
      '" aria-expanded="false" aria-controls="lang-menu" lang="' + A.esc(A.localeInfo(A.lang).htmlLang) +
      '">' + V.icon("locale") + "</button>" +
      V.fontMenu() +
      V.langMenu() +
      "</div>" +
      "</div>" +
      '<div class="masthead-brand">' +
      '<div>' +
      '<h1 class="blog-title"><a href="./index.html?type=internal&function=article_list" data-internal data-nav-key="home">' +
      A.esc(V.siteName()) +
      "</a></h1>" +
      (subtitle
        ? '<p class="blog-subtitle">' + A.esc(subtitle) + "</p>"
        : "") +
      "</div>" +
      '<div class="masthead-mark" aria-hidden="true">' + V.sigil(30) +
      '<span class="mark-rule"></span>' +
      "<span>INSTITVTUM · MMXXVI</span>" +
      "<span>SECTIO " + A.roman(A.state.visible.length || 1) + "</span>" +
      "</div>" +
      "</div>" +
      '<nav class="masthead-nav" aria-label="' + A.esc(A.t("NAV_LABEL")) + '">' + nav +
      '<span class="nav-tail" aria-hidden="true">ANTIPHON</span>' +
      "</nav>";

    V.renderFooter();
  };

  V.licenseText = function () {
    var blog = A.state.blog;
    if (blog["不使用全站内容授权协议"] === true) return "";
    /* 全站内容授权说明 is authored prose, so the content sidecar may translate
       it. The licence id itself is a proper name and is never translated. */
    var note = A.contentText("全站内容授权说明", blog["全站内容授权说明"]).trim();
    if (note) return note;
    var license = String(blog["全站内容授权协议"] || "").trim();
    if (!license) return "";
    /* The two preset values used to render a bilingual parenthetical that was
       Chinese in both cases, so an English or Arabic visitor read a licence
       notice in a language they had not chosen. They are interface strings, not
       authored content, so they come from the pack now; a real licence id is
       passed through untouched because "CC BY-NC-SA 4.0" is a proper name. */
    if (license === "reserved") return A.t("LICENSE_RESERVED");
    if (license === "unlicensed") return A.t("LICENSE_UNLICENSED");
    if (license === "cc-by-nc-sa-4.0") return "CC BY-NC-SA 4.0";
    return license;
  };

  V.renderFooter = function () {
    var blog = A.state.blog;
    if (!blog) return;
    var footer = document.getElementById("footer");
    var year = new Date().getFullYear();
    var license = V.licenseText();
    var bottomText = A.contentText("底部信息（格式为markdown）", blog["底部信息（格式为markdown）"]).trim();
    var bottomHtml = "";
    if (bottomText) {
      try {
        bottomHtml = window.marked ? window.marked.parse(bottomText) : A.esc(bottomText).replace(/\n/g, "<br />");
      } catch (error) {
        bottomHtml = A.esc(bottomText);
      }
    }
    var atom =
      String(blog["网站域名（包括https://）"] || "").trim() !== ""
        ? '<p class="footer-brand"><a href="./atom.xml">' + A.esc(A.t("ATOM_FEED")) + "</a></p>"
        : "";
    var showVisitor = A.getCfg("外观.显示访客编号", true) !== false;
    var count = (A.state.visible || []).length;
    footer.innerHTML =
      '<div class="footer-inner">' +
      '<div class="footer-grid">' +
      '<p class="footer-brand footer-colophon">' + V.sigil(13) + "<span>" + A.esc(A.t("COLOPHON")) + "</span></p>" +
      '<p class="footer-license">© ' + year + " " + A.esc(V.siteName()) + (license ? " · " + A.esc(license) : "") + "</p>" +
      '<p class="footer-brand">ANNO ' + A.roman(year) + "</p>" +
      (showVisitor && A.visitor ? '<p class="visitor">' + A.esc(A.t("VISITOR", { id: A.visitor })) + "</p>" : "") +
      '<p class="footer-brand">' + A.esc(A.t("FOOTER_CREDIT")) + "</p>" +
      atom +
      (bottomHtml ? '<div class="footer-bottom prose">' + bottomHtml + "</div>" : "") +
      '<p class="log-line">' +
      "<span>FOLIA " + A.roman(count) + " (" + A.esc(A.num(count)) + ")</span>" +
      "<span>SYS " + A.esc((A.app && A.app.appliedMode && A.app.appliedMode()) === "night" ? "NOCT" : "DIURN") + "</span>" +
      "<span>LUX " + A.esc(bodyLightLabel()) + "</span>" +
      "<span>MMXXVI · ANTIPHON</span>" +
      "</p>" +
      "</div>" +
      "</div>";
  };

  function bodyLightLabel() {
    var mode = document.body.getAttribute("data-light");
    if (mode === "on") return "ON";
    if (mode === "fallback") return "STATIC";
    return "OFF";
  }

  V.updateNavActive = function (route) {
    var key = null;
    if (!route || route.view === "home") key = "home";
    else if (route.view === "archive") key = "archive";
    else if (route.view === "friends") key = "friends";
    else if (route.view === "page") key = "page:" + route.filename;
    document.querySelectorAll(".masthead-nav a[data-nav-key]").forEach(function (link) {
      var active = link.getAttribute("data-nav-key") === key;
      link.classList.toggle("is-active", active);
    });
  };

  V.showLoading = function () {
    var main = document.getElementById("main");
    main.innerHTML =
      '<div id="loading" role="status" aria-live="polite" aria-label="' + A.esc(A.t("LOADING")) + '">' +
      '<svg class="loading-sigil" viewBox="0 0 80 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1">' +
      '<circle cx="40" cy="40" r="34" opacity=".18" vector-effect="non-scaling-stroke"/><circle cx="40" cy="40" r="26" opacity=".3" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="18" opacity=".5" vector-effect="non-scaling-stroke"/><circle cx="40" cy="40" r="3" fill="currentColor" stroke="none"/></svg>' +
      "<p>" + A.esc(A.t("SYS_BOOT")) + "</p></div>";
  };

  V.showError = function (reason) {
    var main = document.getElementById("main");
    main.innerHTML = V.panel(
      '<div class="not-found">' +
        '<p class="not-found-code">!</p>' +
        '<p class="not-found-text">' + A.esc(A.t("LOAD_ERROR")) + "</p>" +
        '<p class="not-found-text">' + A.esc(reason || "") + "</p>" +
        '<p class="not-found-text">' + A.esc(A.t("LOAD_ERROR_HINT")) + "</p>" +
      "</div>"
    );
  };

  V.announcement = async function () {
    var blog = A.state.blog;
    if (blog["启用网站公告"] !== true) return "";
    var text = A.contentText("网站公告", blog["网站公告"]).trim();
    if (!text) return "";
    var body;
    try {
      await A.ensureMarked();
      body = window.marked.parse(text);
    } catch (error) {
      body = "<p>" + A.esc(text) + "</p>";
    }
    return (
      '<aside class="announcement">' +
      '<span class="announcement-label">' + A.esc(A.t("ANNOUNCEMENT")) + "</span>" +
      '<div class="prose">' + body + "</div>" +
      "</aside>"
    );
  };

  var HITOKOTO_CATEGORIES = [
    ["范围包括动画分类下的一言", "a"],
    ["范围包括漫画分类下的一言", "b"],
    ["范围包括游戏分类下的一言", "c"],
    ["范围包括文学分类下的一言", "d"],
    ["范围包括原创分类下的一言", "e"],
    ["范围包括非原创分类下的一言", "f"],
    ["范围包括其他分类下的一言", "g"],
    ["范围包括影视分类下的一言", "h"],
    ["范围包括诗词分类下的一言", "i"],
    ["范围包括网易云分类下的一言（不建议）", "j"],
    ["范围包括哲学分类下的一言", "k"],
    ["范围包括抖机灵分类下的一言", "l"]
  ];

  V.verse = async function () {
    var blog = A.state.blog;
    var cfg = blog["一言设置"] || {};
    if (cfg["启用一言"] !== true) return "";
    var range = cfg["范围设置"] || {};
    var cats = HITOKOTO_CATEGORIES.filter(function (item) {
      return range[item[0]] === true;
    }).map(function (item) { return "c=" + item[1]; });
    var url = "https://v1.hitokoto.cn/?encode=json" + (cats.length ? "&" + cats.join("&") : "");
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 5000) : null;
    try {
      var response = await fetch(url, { signal: controller ? controller.signal : undefined });
      if (!response.ok) return "";
      var data = await response.json();
      if (!data || !data.hitokoto) return "";
      var source = data.from || data.creator || "";
      return (
        '<blockquote class="verse">' +
        A.esc(data.hitokoto) +
        (source ? '<span class="verse-source">—— ' + A.esc(source) + "</span>" : "") +
        "</blockquote>"
      );
    } catch (error) {
      return "";
    } finally {
      clearTimeout(timer);
    }
  };

  V.tagLinks = function (tags) {
    return (tags || [])
      .map(function (tag) {
        return (
          '<a class="tag-link" data-internal href="./index.html?type=internal&function=tag&argument=' +
          encodeURIComponent(tag) +
          '">' + A.esc(A.tagLabel(tag)) + "</a>"
        );
      })
      .join("");
  };

  V.leadEntry = function (article) {
    var date = A.dateParts(article.created);
    var entryNo = String(article.index + 1).padStart(3, "0");
    return (
      '<article class="lead">' +
      '<div class="lead-fig" aria-hidden="true">' +
      '<span class="lead-no">' + A.esc(entryNo) + "</span>" +
      '<span class="lead-glyph">' + V.sigil(46) + "</span>" +
      "</div>" +
      '<div class="lead-body">' +
      '<p class="lead-kicker">' +
      '<span class="lead-flag">' + A.esc(A.t("PINNED")) + "</span>" +
      "<span>" + A.esc(A.t("FEATURED_FILE")) + "</span>" +
      '<span class="sep" aria-hidden="true">·</span>' +
      "<span>" + A.esc(date.full) + "</span>" +
      "</p>" +
      '<h2 class="lead-title"><a data-internal href="./index.html?type=article&amp;filename=' +
      encodeURIComponent(article.filename) + '">' + A.esc(article.title) + "</a></h2>" +
      (article.excerpt ? '<p class="lead-dek">' + A.esc(article.excerpt) + "</p>" : "") +
      '<div class="lead-foot">' +
      (article.tags.length ? '<span class="entry-tags">' + V.tagLinks(article.tags) + "</span>" : "") +
      '<span class="lead-read">' + A.esc(A.t("ACCEDE")) + " " + A.arrow("forward") + "</span>" +
      "</div>" +
      "</div></article>"
    );
  };

  V.entryRow = function (article) {
    var date = A.dateParts(article.created);
    var entryNo = String(article.index + 1).padStart(3, "0");
    return (
      '<article class="entry">' +
      '<div class="entry-no">' + A.esc(A.t("ENTRY_NO", { n: entryNo })) + "</div>" +
      '<div class="entry-body">' +
      '<h2 class="entry-title"><a data-internal href="./index.html?type=article&amp;filename=' +
      encodeURIComponent(article.filename) + '">' + A.esc(article.title) + "</a>" +
      (article.pinned ? '<span class="pinned-mark">' + A.esc(A.t("PINNED")) + "</span>" : "") +
      "</h2>" +
      (article.excerpt
        ? '<p class="entry-excerpt">' + A.esc(article.excerpt) + "</p>"
        : "") +
      '<div class="entry-foot">' +
      (article.tags.length ? '<span class="entry-tags">' + V.tagLinks(article.tags) + "</span>" : "") +
      (article.encrypted ? '<span class="sep" aria-hidden="true">·</span><span>' + A.esc(A.t("SEALED")) + "</span>" : "") +
      (article.comments ? '<span class="sep" aria-hidden="true">·</span><span>' + A.esc(A.t("DISCUSSION_OPEN")) + "</span>" : "") +
      "</div>" +
      "</div>" +
      '<div class="entry-side"><span class="side-year">' + A.esc(date.year) + "</span><br>" +
      A.esc(date.monthday) + "</div>" +
      "</article>"
    );
  };

  V.pagination = function (page, totalPages) {
    /* Arrows are text, not icons: in RTL the browser mirrors "→" to point at
       the leading edge of the reading direction, but an explicit U+2192 in the
       markup does not get that treatment. Emitting the bidi-safe pair keeps
       "previous" pointing backwards and "next" pointing forwards in both
       directions without a second stylesheet. */
    var arrowBack = A.arrow("back");
    var arrowForward = A.arrow("forward");
    var prev =
      page > 1
        ? '<a class="page-link" data-internal href="./index.html?type=internal&amp;function=article_list&amp;page=' + (page - 1) + '">' + arrowBack + " " + A.esc(A.t("PAGE_PREV")) + "</a>"
        : '<span class="page-link is-disabled">' + arrowBack + " " + A.esc(A.t("PAGE_PREV")) + "</span>";
    var next =
      page < totalPages
        ? '<a class="page-link" data-internal href="./index.html?type=internal&amp;function=article_list&amp;page=' + (page + 1) + '">' + A.esc(A.t("PAGE_NEXT")) + " " + arrowForward + "</a>"
        : '<span class="page-link is-disabled">' + A.esc(A.t("PAGE_NEXT")) + " " + arrowForward + "</span>";
    return (
      '<nav class="pagination" aria-label="' + A.esc(A.t("PAGINATION_LABEL")) + '">' +
      prev +
      '<span class="page-count">' + A.roman(page) + " / " + A.roman(totalPages) + "</span>" +
      next +
      "</nav>"
    );
  };

  V.home = async function (page) {
    var blog = A.state.blog;
    var list = A.homeOrder();
    var size = A.clamp(parseInt(blog["文章列表中每页的文章数为"], 10) || 10, 1, 50);
    var totalPages = Math.max(1, Math.ceil(list.length / size));
    var current = A.clamp(page || 1, 1, totalPages);
    var items = list.slice((current - 1) * size, current * size);

    var announcement = await V.announcement();
    var verse = await V.verse();

    /* page one leads with the newest pinned file; the rest become the ledger */
    var lead = null;
    var rest = items;
    if (current === 1 && items.length > 1) {
      var pinnedIndex = items.findIndex(function (item) { return item.pinned; });
      if (pinnedIndex === 0 || pinnedIndex > 0) {
        lead = items[pinnedIndex >= 0 ? pinnedIndex : 0];
        rest = items.filter(function (item) { return item !== lead; });
      }
    }
    var rows = rest.map(V.entryRow).join("");
    var range = "";
    var dated = list.filter(function (item) { return item.created; });
    if (dated.length) {
      var oldest = dated.reduce(function (a, b) { return b.created < a.created ? b : a; });
      var newest = dated.reduce(function (a, b) { return b.created > a.created ? b : a; });
      range = A.fmtDate(oldest.created) + " → " + A.fmtDate(newest.created);
    }
    var head = V.secHead(
      A.t("HEAD_INDEX"),
      "FOLIA " + A.roman(list.length) + " / " + A.roman(totalPages) + (range ? " · " + range : "")
    );
    var body =
      '<section class="home">' +
      head +
      announcement +
      verse +
      (lead ? V.leadEntry(lead) : "") +
      '<div class="entry-list">' +
      (rows || (lead ? "" : '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>")) +
      "</div>" +
      (totalPages > 1 ? V.pagination(current, totalPages) : "") +
      "</section>";

    return { title: "", html: V.panel(body, { classification: A.t("CLASS_INDEX"), fileNo: "—", leaf: "FOLIA " + A.roman(items.length) }) };
  };

  V.articleCatalog = function (article, minutes, encrypted, sectionCount) {
    var cells = [];
    function cell(key, value, signal) {
      cells.push(
        '<div class="catalog-cell"><span class="catalog-key">' + A.esc(key) + "</span>" +
        '<span class="catalog-val' + (signal ? " is-signal" : "") + '">' + A.esc(value) + "</span></div>"
      );
    }
    cell(A.t("CAT_RECORDED"), A.fmtDate(article.created));
    if (article.modified && article.modified - article.created > 86400000) {
      cell(A.t("REVISED"), A.fmtDate(article.modified));
    }
    if (!encrypted && minutes > 0) cell(A.t("CAT_EXTENT"), A.num(minutes) + " " + A.t("MINUTES"));
    if (sectionCount > 0) cell(A.t("CAT_SECTIONS"), A.num(sectionCount, 2));
    if (article.tags.length) cell(A.t("RUBRIC"), article.tags.map(function (tag) { return A.tagLabel(tag); }).join(" · "), true);
    if (!cells.length) return "";
    return '<div class="article-catalog">' + cells.join("") + "</div>";
  };

  /* The read-time line. Dates already live in the catalog card above, so this
     carries only the one fact the catalog cannot: how long the piece takes.
     阅读.显示阅读时长 (true by default) hides it for owners who would rather
     not claim a number, and an encrypted article has no readable body to time.

     Both this and the catalog's extent cell are re-rendered from the decrypted
     plaintext by V.bindPassword once the reader unlocks an article: before
     decryption there is no body to measure, and the pre-unlock markup
     deliberately omits the extent. `refresh` rewrites the two nodes in place
     rather than repainting the header, so the stamp, kicker and title keep
     their motion state and the scroll position does not jump. */
  V.articleMeta = function (article, minutes, encrypted) {
    if (encrypted) return "";
    if (A.getCfg("阅读.显示阅读时长", true) === false) return "";
    var count = Number(minutes);
    if (!isFinite(count) || count <= 0) return "";
    return (
      '<div class="article-meta">' +
      "<span>" + A.esc(A.t("READ_TIME", { n: A.num(count) })) + "</span>" +
      "</div>"
    );
  };

  V.refreshArticleStats = function (main, article, minutes, sectionCount) {
    var catalog = main.querySelector(".article-catalog");
    if (catalog) {
      var fresh = V.articleCatalog(article, minutes, false, sectionCount);
      if (fresh) {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = fresh;
        var next = wrapper.firstElementChild;
        if (next) catalog.parentNode.replaceChild(next, catalog);
      }
    }
    var meta = main.querySelector(".article-meta");
    var freshMeta = V.articleMeta(article, minutes, false);
    if (freshMeta) {
      if (meta) {
        var metaWrap = document.createElement("div");
        metaWrap.innerHTML = freshMeta;
        meta.parentNode.replaceChild(metaWrap.firstElementChild, meta);
      } else {
        var anchor = main.querySelector(".article-catalog");
        if (anchor) anchor.parentNode.insertBefore(
          (function () { var w = document.createElement("div"); w.innerHTML = freshMeta; return w.firstElementChild; })(),
          anchor.nextSibling
        );
      }
    } else if (meta) {
      meta.parentNode.removeChild(meta);
    }
  };

  V.licenseBlock = function () {
    var text = V.licenseText();
    if (!text) return "";
    return (
      '<div class="license-block"><span class="license-label">' + A.esc(A.t("LICENSE")) + "</span>" +
      A.esc(text) +
      "</div>"
    );
  };

  V.actionRow = function (item, kind) {
    var blog = A.state.blog;
    var actions = [];
    if (blog["提供文章文件下载"] === true) {
      var sourceUrl = kind === "page" ? A.pageUrl(item.filename) : A.articleUrl(item.filename, false);
      actions.push(
        '<a class="action-link" href="' + A.esc(sourceUrl) + '" download="' +
        A.esc(item.title) + '.md">' + A.esc(A.t("DOWNLOAD")) + "</a>"
      );
    }
    if (blog["提供复制全文到剪贴板的选项"] === true) {
      actions.push('<button class="action-link" type="button" data-action="copy">' + A.esc(A.t("COPY")) + "</button>");
    }
    if (blog["在文章或页面的底部添加分享按钮，以便复制直链url"] === true) {
      actions.push('<button class="action-link" type="button" data-action="share">' + A.esc(A.t("SHARE")) + "</button>");
    }
    if (!actions.length) return "";
    return '<div class="article-actions">' + actions.join("") + "</div>";
  };

  V.prevNext = function (article) {
    var blog = A.state.blog;
    if (blog["文章页面显示上一篇下一篇文章导航按钮"] !== true) return "";
    var around = A.visibleAround(article.filename);
    function item(label, target, className) {
      if (!target) {
        return '<div class="prevnext-item ' + className + ' prevnext-empty"><span class="prevnext-label">' + A.esc(label) + "</span><span class=\"prevnext-title\">—</span></div>";
      }
      return (
        '<div class="prevnext-item ' + className + '">' +
        '<span class="prevnext-label">' + A.esc(label) + "</span>" +
        '<span class="prevnext-title"><a data-internal href="./index.html?type=article&amp;filename=' +
        encodeURIComponent(target.filename) + '">' + A.esc(target.title) + "</a></span></div>"
      );
    }
    return (
      '<nav class="prevnext" aria-label="' + A.esc(A.t("ARTICLE_NAV_LABEL")) + '">' +
      item(A.t("PREV"), around.prev, "prevnext-item--prev") +
      item(A.t("NEXT"), around.next, "prevnext-item--next") +
      "</nav>"
    );
  };

  V.commentsBlock = function (enabled, title) {
    if (!enabled) return "";
    /* #disqus_thread is Disqus' own mount contract: embed.js looks it up by id
       and DISQUS.reset() reuses it. Valine/Waline mount on #comments and
       replace its children, so the extra node is inert for them. */
    return (
      '<section class="comment-area"><h2 class="comment-title">' + A.esc(A.t("COMMENTS")) + "</h2>" +
      '<div id="comments" data-comments-title="' + A.esc(title || "") + '">' +
      '<div id="disqus_thread"></div></div></section>'
    );
  };

  V.bindActions = function (main) {
    main.querySelectorAll('[data-action="copy"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var prose = main.querySelector("#article-prose, #page-prose") || main.querySelector(".article-body .prose");
        var text = prose ? prose.innerText : "";
        var original = button.textContent;
        A.copyText(text).then(function (ok) {
          button.textContent = A.t(ok ? "COPIED" : "COPY_FAILED");
          setTimeout(function () { button.textContent = original; }, 1400);
        });
      });
    });
    main.querySelectorAll('[data-action="share"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var original = button.textContent;
        A.copyText(window.location.href).then(function (ok) {
          button.textContent = A.t(ok ? "LINK_COPIED" : "COPY_FAILED");
          setTimeout(function () { button.textContent = original; }, 1400);
        });
      });
    });
  };

  /* The margin note (>=1340px) and the inline <details> contents below the
     catalog card (<1340px, where the CSS hides .marginalia) are two renderings
     of one heading list, so they are built together and share the click and
     scroll-spy behaviour. Both are appended by the caller into the layout. */
  V.buildToc = function (main) {
    /* Disconnect the previous route's scroll-spy before anything else: #main
       is reused across routes, so a TOC-capable article followed by a view
       without one (or with fewer than three headings) left the old observer
       watching detached headings. watchHeadings() re-disconnects when it takes
       over, and closeOverlays() has no DOM signal for "leaving an article",
       so this is the one point every article render passes through. */
    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = null;
    }
    if (A.getCfg("外观.显示页边目录", true) === false) return;
    var layout = main.querySelector(".article-layout");
    if (!layout) return;
    var prose = layout.querySelector("#article-prose") || layout.querySelector(".article-body .prose");
    if (!prose) return;
    var headings = A.markdown.headings(prose);
    if (headings.length < 3) return;

    function jump(id) {
      var target = document.getElementById(id);
      if (!target) return;
      var behavior = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      target.scrollIntoView({ behavior: behavior, block: "start" });
    }

    var aside = document.createElement("aside");
    aside.className = "marginalia";
    /* The visible heading is the archive's house word for a margin note, but
       the region's accessible name should say what it is: a table of contents. */
    aside.setAttribute("aria-label", A.t("TOC"));
    var title = document.createElement("h2");
    title.className = "marginalia-title";
    title.textContent = A.t("MARGINALIA");
    aside.appendChild(title);
    var spyLinks = [];
    headings.forEach(function (heading) {
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.text;
      link.setAttribute("data-toc-target", heading.id);
      if (heading.level === 3) link.classList.add("is-sub");
      link.addEventListener("click", function (event) {
        event.preventDefault();
        jump(heading.id);
      });
      spyLinks.push(link);
      aside.appendChild(link);
    });
    layout.appendChild(aside);

    /* The inline contents for narrow viewports. A <details> keeps it out of the
       way until asked for, needs no JS to open, and reads as a disclosure to
       assistive tech without an ARIA patch. */
    var details = document.createElement("details");
    details.className = "toc-inline";
    var summary = document.createElement("summary");
    summary.textContent = A.t("TOC");
    details.appendChild(summary);
    var list = document.createElement("ol");
    headings.forEach(function (heading) {
      var item = document.createElement("li");
      if (heading.level === 3) item.className = "is-sub";
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.text;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        jump(heading.id);
        details.open = false;
      });
      item.appendChild(link);
      list.appendChild(item);
    });
    details.appendChild(list);
    /* Placed after the catalog/meta block so it reads as part of the header
       apparatus rather than splitting the extent line from the card above it. */
    var anchorNode = main.querySelector(".article-meta") || main.querySelector(".article-catalog");
    if (anchorNode && anchorNode.parentNode) anchorNode.parentNode.insertBefore(details, anchorNode.nextSibling);
    else {
      var header = main.querySelector(".article-header");
      if (header) header.appendChild(details);
    }

    V.watchHeadings(main, prose, spyLinks);
  };

  /* Scroll-spy for the marginalia. An IntersectionObserver with a narrow band
     near the top of the viewport marks the heading currently being read; the
     band is what makes the choice stable — a plain isIntersecting test flips
     between two headings whenever both are on screen. When no heading is in
     the band (long sections, or the reader is above the first one) the last
     heading that crossed it stays marked, which is the behaviour a table of
     contents should have.

     #main is reused across routes, so the previous observer is disconnected
     explicitly: a stale one would keep watching headings that are no longer
     in the document and its callbacks would reference detached links. */
  var tocObserver = null;

  V.watchHeadings = function (main, prose, links) {
    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = null;
    }
    if (!links || !links.length) return;
    if (typeof IntersectionObserver !== "function") return;

    var byId = {};
    links.forEach(function (link) { byId[link.getAttribute("data-toc-target")] = link; });

    function mark(id) {
      links.forEach(function (link) {
        var active = link.getAttribute("data-toc-target") === id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    tocObserver = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible.length) {
        mark(visible[0].target.id);
        return;
      }
      /* Nothing in the band: keep the reader oriented by marking the nearest
         heading above the band, if one exists. */
      var above = null;
      prose.querySelectorAll("h2[id], h3[id]").forEach(function (heading) {
        if (heading.getBoundingClientRect().top <= 96) above = heading;
      });
      if (above && byId[above.id]) mark(above.id);
    }, { rootMargin: "-96px 0px -70% 0px", threshold: 0 });

    prose.querySelectorAll("h2[id], h3[id]").forEach(function (heading) {
      if (byId[heading.id]) tocObserver.observe(heading);
    });
  };

  V.bindPassword = function (main, article, raw, baseurl) {
    var input = main.querySelector("#password-input");
    var submit = main.querySelector("#password-submit");
    var error = main.querySelector("#password-error");
    if (!input || !submit) return;

    async function attempt() {
      var password = input.value;
      if (!password) return;
      submit.disabled = true;
      if (error) error.hidden = true;
      try {
        await A.loadScript(A.cdn("sjcl@1.0.8/sjcl.js"));
        if (!window.sjcl) throw new Error("sjcl 未就绪");
        var plain = window.sjcl.decrypt(password, raw);
        var body = await A.markdown.render(plain, baseurl);
        var holder = main.querySelector(".article-body");
        holder.innerHTML = '<div class="prose" id="article-prose">' + body + "</div>";
        /* Marks the revealed sheet for css/motion.css: the unlock reveal is a
           deeper lift on the same curve, so the reader feels the seal come
           off. Class-only — no timers, no extra state. */
        holder.classList.add("is-unlocked");
        await A.markdown.postProcess(holder.querySelector(".prose"));
        /* The header card was rendered against the ciphertext, so its extent
           and section count describe the sealed blob, not the article. They
           are recomputed here from the plaintext, and the comments mount (the
           render path returns early for sealed articles, so #comments was
           never filled) and the action row (copy / share buttons were bound to
           a body that did not exist yet, and postProcess() has since replaced
           it) are re-established after the body lands. */
        var minutes = A.readingMinutes(plain);
        var sectionCount = A.markdown.sectionCount ? A.markdown.sectionCount(plain) : 0;
        V.refreshArticleStats(main, article, minutes, sectionCount);
        V.buildToc(main);
        V.bindActions(main);
        if (article.comments && A.comments && A.comments.mount) {
          A.comments.mount(main, {
            kind: "article",
            filename: article.filename,
            title: article.title
          });
        }
      } catch (decryptError) {
        if (error) {
          error.hidden = false;
          error.textContent = A.t("PASSWORD_WRONG");
        }
      } finally {
        submit.disabled = false;
      }
    }

    submit.addEventListener("click", attempt);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") attempt();
    });
  };

  V.article = async function (filename) {
    var article = A.getArticle(filename);
    if (!article) return V.notFound();
    /* Localise the authored record before anything reads it, so the title,
       dek, tags and the <title> all come from one consistent overlay. */
    article = A.localizeArticle(article);

    var blog = A.state.blog;
    var md = blog["Markdown渲染配置"] || {};
    var baseurl = md["使用markdown文件所在目录作为baseurl"] === true ? "./data/articles/" : "./";
    var raw = await A.fetchText(A.articleUrl(filename));
    var minutes = A.readingMinutes(raw);
    var fileNo = String((article.index || 0) + 1).padStart(3, "0");
    /* Count headings on the source structure, not with a regex over the raw
       text: a `##` line inside a fenced code block used to be counted as a
       section, which inflated CAT_SECTIONS on exactly the posts that show
       sample Markdown. For a sealed article the ciphertext has no headings at
       all, so the count starts at zero and is filled in after decryption. */
    var sectionCount = article.encrypted ? 0 : (A.markdown.sectionCount ? A.markdown.sectionCount(raw) : 0);

    var announcement = "";
    if (blog["启用网站公告"] === true && blog["网站公告仅在首页显示"] !== true) {
      announcement = await V.announcement();
    }

    var bodyHtml;
    if (article.encrypted) {
      bodyHtml =
        '<div class="article-body"><div class="password-box">' +
        '<label class="license-label" for="password-input">' + A.esc(A.t("PASSWORD_PROMPT")) + "</label>" +
        '<input class="password-input" id="password-input" type="password" autocomplete="off" />' +
        '<button class="action-link password-submit" id="password-submit" type="button">' + A.esc(A.t("PASSWORD_SUBMIT")) + "</button>" +
        '<p class="password-error" id="password-error" hidden></p>' +
        "</div></div>";
    } else {
      var rendered = await A.markdown.render(raw, baseurl);
      bodyHtml = '<div class="article-body"><div class="prose" id="article-prose">' + rendered + "</div></div>";
    }

    var inner =
      "<article>" +
      announcement +
      '<header class="article-header">' +
      (A.getCfg("外观.档案标记", true) !== false ? '<span class="stamp">' + A.esc(A.t("CLASSIFIED")) + "</span>" : "") +
      '<div class="article-kicker"><span class="file-no">' + A.esc(A.t("FILE_NO", { n: fileNo })) + "</span>" +
      (article.tags.length ? V.tagLinks(article.tags) : '<span class="kicker-sub">' + A.esc(A.t("UNFILED")) + "</span>") +
      "</div>" +
      '<h1 class="article-title">' + A.esc(article.title) + "</h1>" +
      (article.excerpt ? '<p class="article-dek">' + A.esc(article.excerpt) + "</p>" : "") +
      V.articleCatalog(article, minutes, article.encrypted, sectionCount) +
      V.articleMeta(article, minutes, article.encrypted) +
      V.ornament() +
      "</header>" +
      bodyHtml +
      V.licenseBlock() +
      V.actionRow(article, "article") +
      V.prevNext(article) +
      V.commentsBlock(article.comments, article.title) +
      "</article>";

    return {
      title: article.title,
      html: '<div class="article-layout">' + V.panel(inner, { classification: A.t("CLASSIFIED"), fileNo: fileNo }) + "</div>",
      after: async function (main) {
        /* Bound before the encrypted early-return: the action row (copy link,
           share) exists on the sealed card too, and binding only after unlock
           left it inert until the password landed. bindPassword() rebinds the
           row against the revealed body. */
        V.bindActions(main);
        if (article.encrypted) {
          V.bindPassword(main, article, raw, baseurl);
          return;
        }
        var prose = main.querySelector("#article-prose");
        if (prose) await A.markdown.postProcess(prose);
        V.buildToc(main);
        V.bindActions(main);
        if (article.comments && A.comments && A.comments.mount) {
          A.comments.mount(main, {
            kind: "article",
            filename: article.filename,
            title: article.title
          });
        }
      }
    };
  };

  V.page = async function (filename) {
    var page = A.getPage(filename);
    if (!page) return V.notFound();
    page = A.localizePage(page);
    var pageNo = String((page.index || 0) + 1).padStart(3, "0");

    if (page.fullHtml) {
      var target = A.pageUrl(filename);
      return {
        title: page.title,
        html: V.panel(
          '<div class="not-found"><p class="not-found-text">' + A.esc(page.title) + "</p>" +
          '<a class="not-found-link" href="' + A.esc(target) + '">' + A.esc(A.t("NAV_ARTICLES")) + "</a></div>",
          { classification: A.t("CLASS_RECORD"), fileNo: pageNo }
        ),
        after: function () { window.location.href = target; }
      };
    }

    var blog = A.state.blog;
    var md = blog["Markdown渲染配置"] || {};
    var baseurl = md["使用markdown文件所在目录作为baseurl"] === true ? "./data/pages/" : "./";
    var raw = await A.fetchText(A.pageUrl(filename));
    var rendered = await A.markdown.render(raw, baseurl);

    var announcement = "";
    if (blog["启用网站公告"] === true && blog["网站公告仅在首页显示"] !== true) {
      announcement = await V.announcement();
    }

    var inner =
      "<article>" +
      announcement +
      '<header class="article-header">' +
      '<div class="article-kicker"><span class="file-no">' + A.esc(A.t("FILE_RECORD", { n: pageNo })) + "</span>" +
      '<span class="kicker-sub">' + A.esc(A.t("STANDING_PAGE")) + "</span></div>" +
      '<h1 class="article-title">' + A.esc(page.title) + "</h1>" +
      V.ornament() +
      "</header>" +
      '<div class="article-body"><div class="prose" id="page-prose">' + rendered + "</div></div>" +
      V.licenseBlock() +
      V.actionRow(page, "page") +
      V.commentsBlock(page.comments, page.title) +
      "</article>";

    return {
      title: page.title,
      html: V.panel(inner, { classification: A.t("CLASS_RECORD"), fileNo: pageNo }),
      after: async function (main) {
        var prose = main.querySelector("#page-prose");
        if (prose) await A.markdown.postProcess(prose);
        V.bindActions(main);
        if (page.comments && A.comments && A.comments.mount) {
          A.comments.mount(main, { kind: "page", filename: page.filename, title: page.title });
        }
      }
    };
  };

  V.archive = function () {
    var list = A.state.visible.slice().sort(function (a, b) { return b.created - a.created; });
    var groups = [];
    var currentYear = null;
    var currentGroup = null;
    var archiveIndex = 0;
    list.forEach(function (article) {
      var year = article.created ? new Date(article.created).getFullYear() : "—";
      if (!currentGroup || currentGroup.year !== year) {
        currentGroup = { year: year, months: [] };
        groups.push(currentGroup);
        currentYear = year;
      }
      var month = article.created ? new Date(article.created).getMonth() + 1 : "—";
      var monthGroup = currentGroup.months.find(function (item) { return item.month === month; });
      if (!monthGroup) {
        monthGroup = { month: month, items: [] };
        currentGroup.months.push(monthGroup);
      }
      monthGroup.items.push(article);
    });

    var archiveHtml = groups
      .map(function (group) {
        var yearLabel = String(group.year);
        var romanYear = group.year === "—" ? "—" : A.roman(group.year);
        var months = group.months
          .map(function (month) {
            var rows = month.items
              .map(function (article) {
                var parts = A.dateParts(article.created);
                /* The reveal ladder is driven by this counter rather than by
                   :nth-child: each month's rows follow a year header and a
                   month header, so no row is ever the first child of
                   .archive-block. Counting across the whole page keeps the
                   ladder monotonic instead of restarting per month. */
                var index = archiveIndex++;
                return (
                  '<div class="archive-row" style="--i:' + index + '">' +
                  '<span class="archive-date">' + A.esc(parts.monthday) + "</span>" +
                  '<span class="archive-title"><a data-internal href="./index.html?type=article&amp;filename=' +
                  encodeURIComponent(article.filename) + '">' + A.esc(article.title) + "</a></span>" +
                  "</div>"
                );
              })
              .join("");
            var monthLabel = month.month === "—" ? "—" : A.monthName(month.month);
            return '<div class="archive-month">' + monthLabel + "</div>" + rows;
          })
          .join("");
        var yearCount = group.months.reduce(function (sum, month) { return sum + month.items.length; }, 0);
        return (
          '<div class="archive-year"><span class="archive-year-roman">' + romanYear + "</span>" +
          '<span class="archive-year-line" aria-hidden="true"></span>' +
          '<span class="archive-year-arabic">' + A.esc(yearLabel) + " · FOLIA " + A.roman(yearCount) + "</span></div>" + months
        );
      })
      .join("");

    var counts = {};
    A.state.visible.forEach(function (article) {
      article.tags.forEach(function (tag) { counts[tag] = (counts[tag] || 0) + 1; });
    });
    var tags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
    var max = tags.length ? counts[tags[0]] : 1;
    var tagHtml = tags
      .map(function (tag) {
        var size = counts[tag] >= max * 0.66 ? "lg" : counts[tag] >= max * 0.34 ? "md" : "sm";
        return (
          '<a class="tag-index-item tag-index-item--' + size + '" data-internal href="./index.html?type=internal&amp;function=tag&amp;argument=' +
          encodeURIComponent(tag) + '"><span class="name">' + A.esc(A.tagLabel(tag)) + '</span><span class="count">' + counts[tag] + "</span></a>"
        );
      })
      .join("");

    var inner =
      '<section class="archive-block">' +
      V.secHead(A.t("HEAD_ARCHIVE"), joinMeta([
        A.plural("ARCHIVE_YEARS", groups.length, { n: A.num(groups.length) }),
        "FOLIA " + A.roman(list.length)
      ])) +
      (archiveHtml || '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>") +
      '<div class="tag-index">' +
      V.secHead(A.t("HEAD_TAGS"), A.plural("TAG_SUBJECTS", tags.length, { n: A.num(tags.length) })) +
      '<div class="tag-index-list">' + tagHtml + "</div></div>" +
      "</section>";

    return { title: A.t("NAV_ARCHIVE"), html: V.panel(inner, { classification: A.t("CLASS_ARCHIVE"), fileNo: "—", leaf: A.t("RUBRIC") }) };
  };

  V.tag = function (tagName) {
    /* The URL argument is the authored tag, which is the routing key. Resolve
       it back to the canonical name (so a translated ?argument=Light link still
       filters correctly), then render the label for the active locale. */
    var canonical = A.tagCanonical(String(tagName || ""));
    var label = A.tagLabel(canonical);
    var list = A.state.visible.filter(function (article) {
      return article.tags.indexOf(canonical) !== -1;
    });
    var rows = list.map(V.entryRow).join("");
    var inner =
      '<section class="home">' +
      V.secHead(A.t("HEAD_TOPIC"), "FOLIA " + A.roman(list.length)) +
      '<h1 class="article-title">' + A.esc(label) + "</h1>" +
      V.ornament() +
      '<div class="entry-list">' + (rows || '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>") + "</div>" +
      "</section>";
    return { title: A.t("TAG_TITLE", { tag: label }), html: V.panel(inner, { classification: A.t("RUBRIC"), fileNo: "—", leaf: label }) };
  };

  V.friends = async function () {
    var blog = A.state.blog;
    var entries = blog["友人帐"] || [];
    if (blog["友人帐来自json文件"] === true && blog["若友人帐来自json文件，则地址为"]) {
      try {
        var response = await fetch(blog["若友人帐来自json文件，则地址为"], { cache: "no-store" });
        if (response.ok) {
          var data = await response.json();
          entries = Array.isArray(data["友人帐"]) ? data["友人帐"] : [];
        }
      } catch (error) {
        console.warn("[Antiphon] 友人帐 JSON 加载失败：", error);
      }
    }

    /* Friend entries are authored records. A sidecar may translate 名称 and 简介
       per entry, matched by 链接 (the url is the stable identity). */
    entries = A.contentList("友人帐", entries, "链接");
    var cards = entries
      .map(function (friend, index) {
        if (!friend) return "";
        var name = String(friend["名称"] || "");
        var url = String(friend["链接"] || "");
        var icon = String(friend["图标"] || "");
        var description = String(friend["简介"] || "");
        var initial = Array.from(name)[0] || "·";
        var iconHtml = icon
          ? '<img class="friend-icon" src="' + A.esc(icon) + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'" />' +
            '<span class="friend-icon friend-icon--empty" style="display:none">' + A.esc(initial) + "</span>"
          : '<span class="friend-icon friend-icon--empty">' + A.esc(initial) + "</span>";
        return (
          /* --i feeds the same 40ms reveal ladder the archive rows use, so the
             two listing views move at one rhythm. */
          '<div class="friend" style="--i:' + index + '">' +
          iconHtml +
          '<div class="friend-body"><a class="friend-name" href="' + A.esc(url) + '" target="_blank" rel="noopener">' +
          A.esc(name) + '</a><p class="friend-desc">' + A.esc(description) + "</p></div>" +
          "</div>"
        );
      })
      .join("");

    var noteHtml = "";
    var note = A.contentText("友人帐页面附加信息", blog["友人帐页面附加信息"]).trim();
    if (note) {
      try {
        await A.ensureMarked();
        noteHtml = '<div class="friend-note prose">' + window.marked.parse(note) + "</div>";
      } catch (error) {
        noteHtml = '<p class="friend-note">' + A.esc(note) + "</p>";
      }
    }

    var inner =
      '<section class="friends-block">' +
      V.secHead(A.t("NAV_FRIENDS"), entries.length ? A.plural("TAG_SUBJECTS", entries.length, { n: A.num(entries.length) }) : "") +
      '<h1 class="article-title">' + A.esc(A.t("NAV_FRIENDS")) + "</h1>" +
      V.ornament() +
      '<div class="friends">' + (cards || '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>") + "</div>" +
      noteHtml +
      V.commentsBlock(blog["友人帐页面允许评论"] === true, A.t("NAV_FRIENDS")) +
      "</section>";

    return {
      title: A.t("NAV_FRIENDS"),
      html: V.panel(inner, { classification: A.t("CLASS_AFFILIATES"), fileNo: "—", leaf: A.plural("TAG_SUBJECTS", entries.length, { n: A.num(entries.length) }) }),
      after: function (main) {
        if (blog["友人帐页面允许评论"] === true && A.comments && A.comments.mount) {
          A.comments.mount(main, { kind: "page", filename: "friendbook", title: A.t("NAV_FRIENDS") });
        }
      }
    };
  };

  V.notFound = function () {
    return {
      title: A.t("NOT_FOUND"),
      html: V.panel(
        '<div class="not-found">' +
        '<p class="not-found-code">404</p>' +
        '<p class="not-found-text">' + A.esc(A.t("RECORD_NOT_FOUND")) + "</p>" +
        '<p class="not-found-text"><small>' + A.esc(A.t("NOT_FOUND")) + "</small></p>" +
        '<a class="not-found-link" data-internal href="./index.html?type=internal&amp;function=article_list">' +
        A.esc(A.t("RETURN_TO_INDEX")) + "</a></div>",
        { classification: A.t("CLASS_MISSING"), fileNo: "—" }
      )
    };
  };

  /* search */

  var searchBound = false;

  /* Search index. Built once per locale rather than on every keystroke: the
     records are rebuilt by A.rebuildLocalized() on a language switch, so the
     cache is keyed on the array identity of A.state.visible. A missing or
     replaced array invalidates it, and the cost of a rebuild is one map over
     the visible set. */
  var searchCache = { source: null, items: [] };

  function searchIndex() {
    if (searchCache.source === A.state.visible) return searchCache.items;
    searchCache.source = A.state.visible;
    searchCache.items = A.state.visible.map(function (article) {
      return {
        article: article,
        haystack: (article.title + " " + article.excerpt + " " + article.tags.join(" ")).toLowerCase()
      };
    });
    return searchCache.items;
  }

  function searchRows(query) {
    var keyword = String(query || "").trim().toLowerCase();
    if (!keyword) return [];
    return searchIndex()
      .filter(function (item) { return item.haystack.indexOf(keyword) !== -1; })
      .slice(0, 20);
  }

  V.renderSearch = function (query) {
    var results = document.getElementById("search-results");
    if (!results) return;
    var keyword = String(query || "").trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = "";
      return;
    }
    var matches = searchRows(keyword);
    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">' + A.esc(A.t("NO_RESULTS")) + "</p>";
      return;
    }
    results.innerHTML = matches
      .map(function (item) {
        var article = item.article;
        var resultNo = String((article.index || 0) + 1).padStart(3, "0");
        return (
          '<a class="search-result" data-search-result href="./index.html?type=article&amp;filename=' +
          encodeURIComponent(article.filename) + '"><h3 class="search-result-title"><span class="result-no">' +
          A.esc(A.t("ENTRY_NO", { n: resultNo })) + "</span>" + A.esc(article.title) +
          '</h3><p class="search-result-excerpt">' + A.esc(article.excerpt) + "</p></a>"
        );
      })
      .join("");
  };

  V.openSearch = function () {
    var overlay = document.getElementById("search-overlay");
    var input = document.getElementById("search-input");
    if (!overlay || !input) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    V.renderSearch("");
    if (!searchBound) {
      searchBound = true;
      input.addEventListener("input", function () { V.renderSearch(input.value); });
      var results = document.getElementById("search-results");
      results.addEventListener("click", function (event) {
        var result = event.target.closest ? event.target.closest("[data-search-result]") : null;
        if (!result) return;
        /* A modified or middle click means "open in a new tab" in every
           browser; preventing the default would swallow that intent. This
           mirrors the a[data-internal] handler in js/router.js. */
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        V.closeSearch();
        A.navigate(result.getAttribute("href"));
      });
      /* Arrow keys move a highlight through the result list and Enter opens
         the highlighted row. Without this the overlay is usable only with a
         pointer: the input holds focus, so nothing in the list is reachable
         from the keyboard. */
      input.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") return;
        var rows = Array.prototype.slice.call(results.querySelectorAll("[data-search-result]"));
        if (!rows.length) return;
        var current = rows.findIndex(function (row) { return row.classList.contains("is-active"); });
        if (event.key === "Enter") {
          if (current === -1) return;
          event.preventDefault();
          var href = rows[current].getAttribute("href");
          V.closeSearch();
          A.navigate(href);
          return;
        }
        event.preventDefault();
        var next = event.key === "ArrowDown"
          ? Math.min(rows.length - 1, current + 1)
          : (current <= 0 ? 0 : current - 1);
        rows.forEach(function (row, i) { row.classList.toggle("is-active", i === next); });
        rows[next].scrollIntoView({ block: "nearest" });
      });
    }
    setTimeout(function () { input.focus(); }, 30);
  };

  V.closeSearch = function () {
    var overlay = document.getElementById("search-overlay");
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    /* Hand focus back to the control that opened the overlay; a dialog that
       dumps focus on <body> strands keyboard users at the top of the page. */
    var trigger = document.getElementById("search-btn");
    if (trigger) trigger.focus();
  };
})(window.Antiphon);
