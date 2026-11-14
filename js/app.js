/* Antiphon — boot, appearance, light and extensions */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var MODE_KEY = "antiphon:mode";
  var LIGHT_KEY = "antiphon:light";
  var VISITOR_KEY = "antiphon:visitor";
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var reducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  function isSafeColor(value) {
    if (!value) return false;
    var text = String(value).trim();
    if (!text || /[;{}<>]/.test(text)) return false;
    try {
      return window.CSS && CSS.supports && CSS.supports("color", text);
    } catch (error) {
      return false;
    }
  }

  function isSafeUrl(value) {
    var text = String(value || "").trim();
    if (!text || /["'<>]/.test(text)) return false;
    return /^(https?:)?\/\//i.test(text) || /^\.?\//.test(text);
  }

  /* The favicon config is a path hint, never a requirement: index.html ships the
     theme's own sigil as an inline data URI, and tools/build.sh packs only
     index.html, css/, js/ and themecfg/, so the theme cannot ship a separate
     icon file. Build the candidate defensively before probing it. */
  function staticIconPath(stat) {
    var dir = String((stat && stat["资源目录"]) || "").trim();
    var file = String((stat && stat["网页图标文件名"]) || "").trim();
    if (!dir || !file) return "";
    /* Reject a configured value that names a host before normalizing anything:
       "https://elsewhere" or "//elsewhere" must never become a path here. */
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(dir) || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(file)) {
      return "";
    }
    /* Normalize the rest: a leading "./" is redundant, a trailing "/" would
       double the separator, and a leading "/" would silently retarget the icon
       at the domain root instead of the configured directory. */
    dir = dir.replace(/^(?:\.\/)+/, "").replace(/^\/+/, "").replace(/\/+$/, "");
    file = file.replace(/^(?:\.\/)+/, "").replace(/^\/+/, "").replace(/\/+$/, "");
    if (!dir || !file) return "";
    /* A configured value must stay inside the site: no parent-directory climb. */
    if (dir.split("/").indexOf("..") !== -1 || file.split("/").indexOf("..") !== -1) return "";
    var path = "./" + dir + "/" + file;
    if (!isSafeUrl(path)) return "";
    /* isSafeUrl accepts any relative URL, so resolve it against the document
       base and require the result to stay under the site root. */
    var resolved, root;
    try {
      resolved = new URL(path, document.baseURI);
      root = new URL("./", document.baseURI);
    } catch (error) {
      return "";
    }
    if (resolved.origin !== window.location.origin) return "";
    if (resolved.pathname.indexOf(root.pathname) !== 0) return "";
    return path;
  }

  /* Probe before swapping. The <link href> keeps pointing at the inline sigil
     until the candidate has actually decoded, so a missing file costs one
     background request instead of a 404 tab icon, and a site that does host the
     file only replaces the sigil once the replacement is known to work. */
  function applySiteIcon(stat) {
    var icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;
    var path = staticIconPath(stat);
    if (!path) return;

    var probe = new Image();
    var settled = false;
    var timer = setTimeout(function () {
      finish(false, "3 秒内未加载完成");
    }, 3000);

    function finish(ok, reason) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      probe.onload = null;
      probe.onerror = null;
      if (ok) {
        icon.href = path;
      } else {
        console.warn(
          "[Antiphon] 站点配置的网页图标不可用，保留主题内置图标：",
          path,
          "（" + reason + "）"
        );
      }
    }

    probe.onload = function () { finish(true); };
    probe.onerror = function () { finish(false, "文件不存在或不是可解码的图片"); };
    probe.src = path;
  }

  /* The per-language defaults live in css/tokens.css as body[data-script] rules.
     applyCfg() only intervenes when the blog owner asks for something different:
     外观.版心宽度（rem） wins outright, and the 使版心宽度更窄 switch narrows
     whatever language default is in force. Writing on <body> (not <html>) is
     deliberate: the token layer declares --measure there too, so an inline value
     on <body> is the only thing that reliably wins over it. */
  /* 使版心宽度更窄 subtracts 4rem from whichever language default is in force,
     matching how the switch behaved before the language scale was introduced.
     Keyed on the resolved script rather than a language name, because there are
     now more than three languages: every Latin/Cyrillic/Arabic language takes
     the narrow end of the western measure, Japanese the CJK-minus-4 value, and
     the CJK/Hangul scripts fall in between. */
  function narrowMeasure() {
    var script = A.script || (A.scriptOf ? A.scriptOf(A.lang) : "cjk");
    if (script === "latin" || script === "cyrillic" || script === "arabic") return 30;
    if (script === "ja") return 34;
    return 36;
  }

  function applyCfg() {
    var blog = A.state.blog;
    var cfg = A.state.cfg || {};

    var width = Number(cfg["外观"] && cfg["外观"]["版心宽度（rem）"]);
    if (isFinite(width) && width > 0) {
      document.body.style.setProperty("--measure", A.clamp(width, 32, 44) + "rem");
    } else if (blog["使版心宽度更窄（提高左右页边距）"] === true) {
      document.body.style.setProperty("--measure", narrowMeasure() + "rem");
    } else {
      /* fall through to the data-script default in css/tokens.css */
      document.body.style.removeProperty("--measure");
    }

    var serifSetting = cfg["外观"] ? cfg["外观"]["界面使用衬线"] : null;
    var useSerif =
      serifSetting === true ||
      (serifSetting === null && blog["优先使用衬线字体"] === true);
    /* Written on <body>, not <html>: --font-serif is per-language (Japanese leads
       with a Mincho), and a custom property resolves var() on the element that
       declares it. On <html> the Japanese stack would never be picked up. */
    document.body.style.setProperty(
      "--font-ui",
      useSerif ? "var(--font-serif)" : "var(--font-ui-sans)"
    );

    var dayColor = cfg["外观"] ? cfg["外观"]["链接颜色"] : "";
    var nightColor = cfg["外观"] ? cfg["外观"]["链接颜色（暗色）"] : "";
    var linkStyle = document.getElementById("antiphon-link-override");
    if ((isSafeColor(dayColor) || isSafeColor(nightColor)) ) {
      if (!linkStyle) {
        linkStyle = document.createElement("style");
        linkStyle.id = "antiphon-link-override";
        document.head.appendChild(linkStyle);
      }
      linkStyle.textContent =
        (isSafeColor(dayColor) ? 'body[data-mode="day"]{--link:' + dayColor + ";}" : "") +
        (isSafeColor(nightColor) ? 'body[data-mode="night"]{--link:' + nightColor + ";}" : "");
    } else if (linkStyle) {
      linkStyle.textContent = "";
    }

    var theme = blog["全局主题设置"] || {};
    var hasImage = false;
    if (theme["是否使用纯色背景（优先级高于背景图像）"] === true && isSafeColor(theme["若使用纯色背景，颜色为"])) {
      document.body.style.setProperty("--wall", String(theme["若使用纯色背景，颜色为"]).trim());
    } else if (theme["是否使用背景图像"] === true) {
      var set = theme["若使用背景图像，设置为"] || {};
      var url = "";
      if (set["将网站根目录下的background.webp作为背景图像"] === true) {
        url = "./background.webp";
      } else if (set["将某个url作为背景图像"] === true) {
        url = set["若将某个url作为背景图像，这个url是"] || "";
      }
      if (isSafeUrl(url)) {
        hasImage = true;
        document.body.style.setProperty("--wall-image", 'url("' + String(url).replace(/"/g, "%22") + '")');
      }
    }
    document.body.classList.toggle("has-wall-image", hasImage);

    var stat = blog["静态资源"] || {};
    applySiteIcon(stat);
    applyMetadata(blog);
  }

  /* Document metadata follows the shell, not just the site config. The title
     and description are authored content and are never translated here — the
     theme cannot know what a Chinese subtitle should say in German — but the
     resolved locale must reach the document so the page declares the language
     of its own chrome, and og:locale has to agree with html[lang] or social
     cards advertise the wrong language to every non-Chinese visitor.

     `view` is the optional per-route overlay, supplied by the router after a
     view paints: { title, description, url }. Without it the function behaves
     exactly as before (site title + subtitle), which is what boot() and the
     locale switcher need. With it, a shared article advertises the article's
     own title and excerpt instead of the homepage's, while og:site_name keeps
     naming the blog itself. */
  function applyMetadata(blog, view) {
    blog = blog || A.state.blog || {};
    view = view || {};
    var localized = A.state.langMeta || {};
    var siteTitle = A.contentText("博客标题", blog["博客标题"]).trim() || "Antiphon";
    var siteDescription = String((localized.description) || A.contentText("博客描述（副标题）", blog["博客描述（副标题）"]) || "");
    var viewTitle = String(view.title || "").trim();
    var viewDescription = String(view.description || "").trim();
    var title = viewTitle || siteTitle;
    var description = viewDescription || siteDescription;
    var info = A.localeInfo(A.lang);
    var descriptionNode = document.querySelector('meta[name="description"]');
    if (descriptionNode) descriptionNode.setAttribute("content", description);

    ["og:title", "og:description", "og:locale", "og:site_name", "og:url"].forEach(function (name) {
      var node = document.querySelector('meta[property="' + name + '"]');
      if (!node) return;
      if (name === "og:title") node.setAttribute("content", title);
      else if (name === "og:site_name") node.setAttribute("content", siteTitle);
      else if (name === "og:description") node.setAttribute("content", description);
      else if (name === "og:url") node.setAttribute("content", view.url || window.location.href);
      else node.setAttribute("content", info.htmlLang.replace("-", "_"));
    });
    var localeNode = document.querySelector('meta[http-equiv="content-language"]');
    if (localeNode) localeNode.setAttribute("content", info.htmlLang);

    /* The document title carries the site name, which is itself localised. A
       rendered route writes "page — site", so the site half must be refreshed
       on every language change rather than only when the title is still the
       bare placeholder; otherwise switching locales leaves a stale brand in
       the tab.

       `view.route` marks a route render, where the title is *authoritative*:
       a view with no title of its own (home, and any listing view that leaves
       it blank) must reset to the bare site name rather than inherit the
       prefix the previous view wrote — otherwise leaving an article for the
       index leaves "论静默 — 对经" in the tab. Without that flag (boot, locale
       switch) the prefix the route chose is kept and only the suffix is
       rebuilt, which is the pre-existing behaviour. */
    var current = String(document.title || "");
    var sep = " - ";
    if (viewTitle) {
      document.title = viewTitle + sep + siteTitle;
    } else if (view.route) {
      document.title = siteTitle;
    } else if (current === siteTitle || current === "Antiphon" || current === "" || current.indexOf(sep) === -1) {
      document.title = siteTitle;
    } else {
      document.title = current.slice(0, current.indexOf(sep)) + sep + siteTitle;
    }
  }

  A.applyMetadata = applyMetadata;

  /* ——— route transitions ———
     A SPA route swap must not leave the previous view's chrome behind. Two
     pieces of state outlive #main.innerHTML today: an open overlay (search
     sheet, image viewer, the two masthead popovers) and the reading-progress
     bar. Closing through the exact functions the close buttons call matters:
     they are the ones that restore document.body.style.overflow, so a Back
     press with the search sheet open no longer scroll-locks the page under a
     modal that has nothing left to search.

     Focus is restored here rather than inside those functions because it is
     only wrong to strand it when a route change is what dismissed the dialog:
     the close *buttons* deliberately leave focus where the reader put it, but
     a Back press replaces the view the focused element lived in. Focus moves
     only when an overlay was actually open, so ordinary navigation never
     steals it. */
  function closeOverlays() {
    var search = document.getElementById("search-overlay");
    var viewer = document.getElementById("image-viewer");
    var fontMenu = document.getElementById("font-menu");
    var langMenu = document.getElementById("lang-menu");
    /* Read the open state before mutating it: the close helpers below flip
       `hidden`, so this is the only moment the answer is still available. */
    var hadSearch = !!(search && !search.hidden);
    var hadViewer = !!(viewer && !viewer.hidden);
    var hadFont = !!(fontMenu && !fontMenu.hidden);
    var hadLang = !!(langMenu && !langMenu.hidden);

    if (A.views && A.views.closeSearch) A.views.closeSearch();
    closeViewer();
    setFontMenuOpen(false);
    setLangMenuOpen(false);

    if (hadFont || hadLang) {
      /* A popover is anchored to its own button, so focus returns there — the
         same destination the Escape handler picks. */
      var owner = document.getElementById(hadFont ? "font-btn" : "lang-btn");
      if (owner) owner.focus();
    } else if (hadSearch) {
      var searchBtn = document.getElementById("search-btn");
      if (searchBtn) searchBtn.focus();
    } else if (hadViewer) {
      /* The viewer is opened from an image that the route swap just removed;
         focus goes to the new document body instead of nowhere. */
      var main = document.getElementById("main");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus();
      }
    }
  }

  /* The progress rail is derived from scroll position over the *current*
     document height. A history jump scrolls to the top before the new view has
     painted, so the scroll listener either does not fire or fires against the
     old height; recomputing it here keeps the rail honest until the next real
     scroll. */
  function refreshProgress() {
    var progress = document.querySelector("#progress > span");
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.width = (ratio * 100).toFixed(2) + "%";
  }

  A.closeOverlays = closeOverlays;
  A.refreshProgress = refreshProgress;

  function randomVisitor() {
    var bytes = null;
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        bytes = new Uint8Array(2);
        window.crypto.getRandomValues(bytes);
      }
    } catch (error) {}
    if (bytes) {
      var hex = "";
      for (var i = 0; i < bytes.length; i++) {
        hex += (bytes[i] + 0x100).toString(16).slice(1);
      }
      return hex.toUpperCase();
    }
    return (Math.floor(Math.random() * 0x10000) + 0x10000).toString(16).slice(1).toUpperCase();
  }

  function ensureVisitor() {
    var value = null;
    try { value = localStorage.getItem(VISITOR_KEY); } catch (error) {}
    if (!/^[0-9A-F]{4}$/.test(String(value || ""))) {
      value = randomVisitor();
      try { localStorage.setItem(VISITOR_KEY, value); } catch (error) {}
    }
    A.visitor = value;
  }

  function storedMode() {
    var value = null;
    try { value = localStorage.getItem(MODE_KEY); } catch (error) {}
    return value === "day" || value === "night" || value === "auto" ? value : null;
  }

  function resolveMode() {
    var pref = storedMode();
    if (pref === "day" || pref === "night") return pref;
    if (pref === "auto") return media && media.matches ? "night" : "day";
    var fallback = A.getCfg("外观.默认模式", "auto");
    if (fallback === "day" || fallback === "night") return fallback;
    return media && media.matches ? "night" : "day";
  }

  function updateModeButton(mode) {
    var button = document.getElementById("mode-btn");
    if (!button) return;
    button.innerHTML = A.views.icon(mode === "day" ? "moon" : "sun");
    button.setAttribute("aria-label", A.t(mode === "day" ? "THEME_NIGHT" : "THEME_DAY"));
  }

  function applyMode() {
    var mode = resolveMode();
    document.body.setAttribute("data-mode", mode);
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", mode === "night" ? "#121110" : "#EDEAE0");
    updateModeButton(mode);
    if (A.light && A.light.setTheme) A.light.setTheme(mode === "night");
    if (A.views && A.views.renderFooter) A.views.renderFooter();
    /* Comment widgets are mounted once and keep their own palette, so a mode
       toggle has to push the new state into the live instance. */
    if (A.comments && A.comments.syncTheme) A.comments.syncTheme(mode);
  }

  function toggleMode() {
    var next = resolveMode() === "day" ? "night" : "day";
    try { localStorage.setItem(MODE_KEY, next); } catch (error) {}
    applyMode();
  }

  function lightEnabledByCfg() {
    var cfg = A.getCfg("窗光", {});
    return cfg["启用"] !== false;
  }

  function updateLightButton(on) {
    var button = document.getElementById("light-btn");
    if (!button) return;
    button.setAttribute("aria-label", A.t(on ? "LIGHT_OFF" : "LIGHT_ON"));
  }

  function initLight() {
    var cfg = A.getCfg("窗光", {});
    if (cfg["启用"] === false) {
      document.body.setAttribute("data-light", "off");
      return;
    }
    var stored = null;
    try { stored = localStorage.getItem(LIGHT_KEY); } catch (error) {}
    var on = stored === null ? cfg["默认开启"] !== false : stored === "on";
    var options = {
      intensity: A.clamp(cfg["强度"], 0, 1),
      dust: A.clamp(cfg["粒子密度"], 0, 1),
      fps: [30, 45, 60].indexOf(Number(cfg["帧率上限"])) !== -1 ? Number(cfg["帧率上限"]) : 60,
      dark: document.body.getAttribute("data-mode") === "night",
      enabled: on
    };
    if (A.light && A.light.start) {
      A.light.start(document.getElementById("light-canvas"), options);
    }
    updateLightButton(on);
  }

  function toggleLight() {
    if (!lightEnabledByCfg()) return;
    var on = document.body.getAttribute("data-light") === "on";
    var next = !on;
    try { localStorage.setItem(LIGHT_KEY, next ? "on" : "off"); } catch (error) {}
    if (A.light && A.light.setEnabled) A.light.setEnabled(next);
    updateLightButton(next);
    if (A.views && A.views.renderFooter) A.views.renderFooter();
  }

  function openViewer(src, caption) {
    var viewer = document.getElementById("image-viewer");
    var image = document.getElementById("viewer-img");
    if (!viewer || !image) return;
    image.src = src;
    image.alt = caption || "";
    document.getElementById("viewer-caption").textContent = caption || "";
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    var viewer = document.getElementById("image-viewer");
    if (!viewer) return;
    viewer.hidden = true;
    document.getElementById("viewer-img").src = "";
    document.body.style.overflow = "";
  }

  A.openViewer = openViewer;
  A.closeViewer = closeViewer;

  /* ——— typeface choice ———
     Four presets, persisted per device. `antiphon` is the absence of a
     data-font attribute: the token layer's own stack, unchanged. The others are
     pure CSS overrides in css/fonts.css, so this function only decides which
     attribute to wear — no font strings are duplicated in JS. */
  var FONT_KEY = "antiphon:font";
  var FONTS = ["antiphon", "humanist", "grotesk", "mono"];

  A.getFont = function () {
    var stored = null;
    try { stored = localStorage.getItem(FONT_KEY); } catch (error) {}
    return FONTS.indexOf(stored) >= 0 ? stored : "antiphon";
  };

  function applyFont(name) {
    var font = FONTS.indexOf(name) >= 0 ? name : "antiphon";
    if (font === "antiphon") document.body.removeAttribute("data-font");
    else document.body.setAttribute("data-font", font);
    var menu = document.getElementById("font-menu");
    if (menu) {
      Array.prototype.forEach.call(
        menu.querySelectorAll("[data-font-choice]"),
        function (item) {
          item.setAttribute("aria-checked", item.getAttribute("data-font-choice") === font ? "true" : "false");
        }
      );
    }
    return font;
  }

  A.setFont = function (name) {
    var font = applyFont(name);
    try { localStorage.setItem(FONT_KEY, font); } catch (error) {}
    return font;
  };

  /* Focus follows the menu in both directions. Opening moves into the list of
     faces; closing returns to the trigger, but only when focus is actually
     inside the menu — a close triggered by clicking somewhere else on the page
     must not pull focus back to a button the reader has moved away from. */
  function restoreMenuFocus(menu, button) {
    var active = document.activeElement;
    if (active && menu.contains(active) && button) button.focus();
  }

  function setFontMenuOpen(open) {
    var button = document.getElementById("font-btn");
    var menu = document.getElementById("font-menu");
    if (!button || !menu) return;
    if (!open) restoreMenuFocus(menu, button);
    menu.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) focusFirstMenuItem(menu);
  }

  /* Arrow keys inside a masthead popover. Both menus are role="menu" with
     role="menuitemradio" rows, so the expected contract is roving arrow
     movement, Enter/Space to choose, Home/End to the ends and Escape back to
     the trigger. Menu rows are <button>s, so Enter and Space already activate
     the focused row; this only supplies movement and the initial focus, which
     a pointer-only implementation never needed but a keyboard user does. */
  function menuButtons(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll("button")).filter(function (button) {
      return !button.hidden;
    });
  }

  function focusFirstMenuItem(menu) {
    var buttons = menuButtons(menu);
    if (!buttons.length) return;
    var checked = buttons.filter(function (button) {
      return button.getAttribute("aria-checked") === "true";
    })[0];
    (checked || buttons[0]).focus();
  }

  function bindMenuKeys(menuId) {
    document.addEventListener("keydown", function (event) {
      var menu = document.getElementById(menuId);
      if (!menu || menu.hidden) return;
      if (!menu.contains(event.target)) return;
      var buttons = menuButtons(menu);
      if (!buttons.length) return;
      var index = buttons.indexOf(event.target);
      var next = -1;
      if (event.key === "ArrowDown") next = index < 0 ? 0 : (index + 1) % buttons.length;
      else if (event.key === "ArrowUp") next = index <= 0 ? buttons.length - 1 : index - 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
    });
  }

  /* ——— masthead popovers ———
     V.renderShell() rebuilds the whole masthead from a string, and chooseLocale()
     calls it after every pick, so any listener attached to #font-btn,
     #font-menu, #lang-btn or #lang-menu is destroyed with the node it was
     attached to. Both popovers therefore delegate from the document and resolve
     the live button and menu by id at event time; no node reference survives a
     repaint, so the shell can be re-rendered any number of times. */
  function bindFontMenu() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      if (target.closest("#font-btn")) {
        var menu = document.getElementById("font-menu");
        if (menu) setFontMenuOpen(menu.hidden);
        return;
      }

      var item = target.closest("[data-font-choice]");
      if (item && target.closest("#font-menu")) {
        A.setFont(item.getAttribute("data-font-choice"));
        setFontMenuOpen(false);
        /* Return focus to the button that owns the popover: dismissing a menu
           must not strand keyboard focus on a row that is now hidden. */
        var button = document.getElementById("font-btn");
        if (button) button.focus();
        return;
      }

      /* Clicking anywhere else closes it. Registered on the document rather than
         with a backdrop so it composes with the search overlay, which uses the
         same dismissal gesture. */
      var openMenu = document.getElementById("font-menu");
      if (openMenu && !openMenu.hidden && !openMenu.contains(target)) setFontMenuOpen(false);
    });
  }

  /* ——— language choice ———
     The masthead picker is the only thing that writes an explicit locale.
     Selecting a language persists the tag and re-renders immediately; the theme
     does not reload the page, because every string and every number on screen
     is already reachable through A.t() — only the shell's own inline copy
     needs re-reading, which V.renderShell() does.

     "auto" is not a language: it clears the stored key so A.resolveLocale falls
     back to 网站语言 (if the author set one) and then to navigator.languages. */
  function setLangMenuOpen(open) {
    var button = document.getElementById("lang-btn");
    var menu = document.getElementById("lang-menu");
    if (!button || !menu) return;
    if (!open) restoreMenuFocus(menu, button);
    menu.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) focusFirstMenuItem(menu);
  }

  function chooseLocale(value) {
    if (value === "auto") {
      try { localStorage.removeItem("antiphon:lang"); } catch (error) {}
      A.setLang(A.resolveLocale((A.authoredBlog() || {})["网站语言"], null));
    } else {
      A.storeLocale(value);
      A.setLang(value);
    }
    /* Re-derive every authored string for the new locale before repainting.
       This is the step that makes the switch global rather than skin-deep:
       the shell, footer, route and all list views read the same rebuilt state. */
    if (A.rebuildLocalized) A.rebuildLocalized();
    A.applyDomText();
    applyCfg();
    applyMetadata(A.state.blog);
    A.views.renderShell();
    updateModeButton(document.body.getAttribute("data-mode") === "night" ? "night" : "day");
    updateLightButton(document.body.getAttribute("data-light") === "on");
    if (A.views.renderFooter) A.views.renderFooter();
    /* The current view is already in the DOM with its strings baked in, so re-run
       the route rather than asking the reader to reload. Route state lives in the
       URL, so renderRoute() reproduces exactly the view they were reading. */
    if (A.renderRoute) A.renderRoute();
  }

  A.chooseLocale = chooseLocale;

  function bindLangMenu() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      if (target.closest("#lang-btn")) {
        var menu = document.getElementById("lang-menu");
        if (menu) setLangMenuOpen(menu.hidden);
        return;
      }

      var item = target.closest("[data-lang-choice]");
      if (item && target.closest("#lang-menu")) {
        chooseLocale(item.getAttribute("data-lang-choice"));
        /* chooseLocale() re-renders the masthead, so the menu that was clicked
           is already gone — the fresh one is rendered closed, and the button
           that owns it is the live node to hand focus back to. */
        var button = document.getElementById("lang-btn");
        if (button) button.focus();
        return;
      }

      var openMenu = document.getElementById("lang-menu");
      if (openMenu && !openMenu.hidden && !openMenu.contains(target)) setLangMenuOpen(false);
    });
  }

  var shellBound = false;

  function bindShell() {
    if (shellBound) return;
    shellBound = true;
    /* Every control bound here lives inside the masthead, which renderShell()
       replaces wholesale, so the bindings delegate from the document and look
       their node up by id per event. bindShell() itself stays idempotent anyway
       — it also owns the document-level Escape handler and the search/viewer
       plumbing, and a second call must not stack those. */
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (target.closest("#search-btn")) {
        if (A.views.openSearch) A.views.openSearch();
      } else if (target.closest("#mode-btn")) {
        toggleMode();
      } else if (target.closest("#light-btn")) {
        toggleLight();
      }
    });
    bindFontMenu();
    bindLangMenu();
    bindMenuKeys("font-menu");
    bindMenuKeys("lang-menu");

    document.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key === "Escape") {
        var search = document.getElementById("search-overlay");
        var viewer = document.getElementById("image-viewer");
        if (search && !search.hidden && A.views.closeSearch) A.views.closeSearch();
        if (viewer && !viewer.hidden) closeViewer();
        /* Escape also dismisses the type popover and hands focus back to its
           button, so the keyboard path matches the pointer one. */
        var fontMenu = document.getElementById("font-menu");
        if (fontMenu && !fontMenu.hidden) {
          setFontMenuOpen(false);
          var fontBtn = document.getElementById("font-btn");
          if (fontBtn) fontBtn.focus();
        }
        var langMenu = document.getElementById("lang-menu");
        if (langMenu && !langMenu.hidden) {
          setLangMenuOpen(false);
          var langBtn = document.getElementById("lang-btn");
          if (langBtn) langBtn.focus();
        }
        return;
      }
      if (key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        var target = event.target;
        var typing =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);
        if (!typing && A.views.openSearch) {
          event.preventDefault();
          A.views.openSearch();
        }
      }
    });

    var searchOverlay = document.getElementById("search-overlay");
    if (searchOverlay) {
      searchOverlay.addEventListener("click", function (event) {
        if (event.target === searchOverlay && A.views.closeSearch) A.views.closeSearch();
      });
    }
    var searchClose = document.getElementById("search-close");
    if (searchClose && A.views.closeSearch) {
      searchClose.addEventListener("click", function () { A.views.closeSearch(); });
    }

    var viewer = document.getElementById("image-viewer");
    if (viewer) {
      viewer.addEventListener("click", function (event) {
        if (event.target === viewer) closeViewer();
      });
    }
    var viewerClose = document.getElementById("viewer-close");
    if (viewerClose) viewerClose.addEventListener("click", closeViewer);

    document.addEventListener("click", function (event) {
      var image = event.target && event.target.closest ? event.target.closest("img[data-viewer]") : null;
      if (!image) return;
      var figure = image.closest("figure");
      var captionNode = figure ? figure.querySelector("figcaption") : null;
      var caption = (captionNode && captionNode.textContent) || image.getAttribute("alt") || "";
      openViewer(image.currentSrc || image.src, caption.trim());
    });

    var backToTop = document.getElementById("back-to-top");
    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
      });
    }
    var progress = document.querySelector("#progress > span");
    window.addEventListener(
      "scroll",
      function () {
        if (backToTop) {
          var show = window.scrollY > window.innerHeight * 1.5;
          backToTop.hidden = !show;
        }
        if (progress) {
          var doc = document.documentElement;
          var max = doc.scrollHeight - window.innerHeight;
          var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          progress.style.width = (ratio * 100).toFixed(2) + "%";
        }
      },
      { passive: true }
    );
  }

  /* ——— extensions ———
     自定义JS and 插件列表 are boot scripts: they attach document-level listeners,
     start timers and sometimes inject third-party widgets. runExtensions() is
     called on every route render (and on every locale switch), and it used to
     window.eval() both unconditionally, so a reader who clicked through ten
     articles accumulated ten copies of every listener and timer.

     They are now keyed by identity *and* by source text: an unchanged script
     runs exactly once per document, while editing the string in the site
     config still re-runs it on the next navigation. The CSS branch has always
     worked this way through the #antiphon-custom-css guard.

     Plugins that genuinely need per-route work should opt in with
     A.onRoute(handler) rather than relying on the eval being replayed; the
     handler receives the route object and is unregistered by the returned
     function. Both the guard and the hook are additive: a plugin written
     against the old behaviour keeps running, just once. */
  var executedExtensions = {};
  var routeListeners = [];

  function extensionRan(key, source) {
    if (Object.prototype.hasOwnProperty.call(executedExtensions, key) && executedExtensions[key] === source) {
      return true;
    }
    executedExtensions[key] = source;
    return false;
  }

  A.onRoute = function (handler) {
    if (typeof handler !== "function") return function () {};
    routeListeners.push(handler);
    var registered = handler;
    return function () {
      var at = routeListeners.indexOf(registered);
      if (at !== -1) routeListeners.splice(at, 1);
    };
  };

  A.routeChanged = function (route) {
    var current = route || A.route || null;
    routeListeners.slice().forEach(function (handler) {
      try {
        handler(current);
      } catch (error) {
        console.error("[Antiphon] 路由钩子执行失败：", error);
      }
    });
  };

  function runExtensions() {
    var blog = A.state.blog;
    if (!blog) return;
    if (blog["启用自定义CSS"] === true && !document.getElementById("antiphon-custom-css")) {
      var style = document.createElement("style");
      style.id = "antiphon-custom-css";
      style.textContent = String(blog["自定义CSS"] || "");
      document.head.appendChild(style);
    }
    if (blog["启用自定义JS"] === true && blog["自定义JS"]) {
      var customSource = String(blog["自定义JS"]);
      if (!extensionRan("custom-js", customSource)) {
        try {
          window.eval(customSource);
        } catch (error) {
          console.error("[Antiphon] 自定义 JS 执行失败：", error);
        }
      }
    }
    if (blog["是否启用插件功能"] === true) {
      (blog["插件列表"] || []).forEach(function (plugin, index) {
        if (!plugin || plugin["是否启用此插件"] !== true) return;
        var source = String(plugin["插件内容"] || "");
        if (!source) return;
        /* Identity is the configured name so reordering the list cannot re-run
           an unchanged plugin; an unnamed slot falls back to its position. The
           source string is compared as well, so editing a plugin re-runs it. */
        var name = String(plugin["插件名称"] || "").trim();
        var key = "plugin:" + (name || "@" + index);
        if (extensionRan(key, source)) return;
        try {
          window.eval(source);
        } catch (error) {
          console.error("[Antiphon] 插件执行失败：", plugin["插件名称"] || "", error);
        }
      });
    }
  }

  A.runExtensions = runExtensions;

  async function boot() {
    try {
      await A.loadThemeConfig();
      await A.loadBlog();
      /* The optional content sidecar must land before the first render: the
         shell, the footer and the route all resolve authored strings through
         it, and a late load would paint the authored language first and then
         visibly swap. A site without the file resolves in one tick. */
      await A.loadContent();
    } catch (error) {
      console.error("[Antiphon] 站点数据加载失败：", error);
      A.views.showError(String(error && error.message ? error.message : error));
      return;
    }

    /* Language resolution, in priority order: the visitor's stored choice, then
       网站语言 when the author wrote something other than auto/blank, then
       navigator.languages, then English. `auto` hands control back to the system,
       which is the default and what an unset config means. resolveLocale owns
       that whole chain, including the en fallback, so boot() must not second-
       guess it. */
    A.setLang(A.resolveLocale(A.state.blog["网站语言"]));
    /* A.setLang sets data-script too; asserted here so the token layer is resolved
       before applyCfg() and before the first view paints — no post-render jump. */
    A.setScript(A.lang);
    /* Overlay the content sidecar onto the authored config and records now that
       both the site data and the locale are known. Everything downstream reads
       A.state.blog / articles / pages, so this single call localises the whole
       page rather than just its interface chrome. */
    A.rebuildLocalized();
    A.applyInterfaceText(A.state.blog);
    /* The static shell in index.html carries English copy so it reads without
       JS and so a crawler that does not run scripts sees the documented
       fallback language; rewrite its placeholder and aria-label attributes
       from the resolved pack before anything paints. */
    A.applyDomText();
    window.blog = A.state.blog;

    applyCfg();
    applyMode();
    applyFont(A.getFont());
    ensureVisitor();
    /* initLight() runs before the shell renders: the footer reads the WebGL
       state at paint time, so a shell built first would print "LUX OFF" even
       on a GL-capable browser until the next toggle. */
    initLight();
    A.views.renderShell();
    bindShell();

    A.ensureMarked()
      .then(function () { A.views.renderFooter(); })
      .catch(function (error) { console.warn("[Antiphon] Markdown 渲染器未加载：", error.message); });

    A.renderRoute();
  }

  A.app = {
    boot: boot,
    applyMode: applyMode,
    toggleMode: toggleMode,
    toggleLight: toggleLight,
    appliedMode: function () { return document.body.getAttribute("data-mode"); },
    afterRoute: function () {
      if (A.light && A.light.setTheme) A.light.setTheme(document.body.getAttribute("data-mode") === "night");
      /* Documented opt-in for plugins that need per-route work: they register
         once via A.onRoute() instead of being re-evaluated on every render. */
      if (A.routeChanged) A.routeChanged(A.route);
    }
  };

  if (media && media.addEventListener) {
    media.addEventListener("change", function () {
      var pref = storedMode();
      if (pref === "auto" || (pref === null && A.getCfg("外观.默认模式", "auto") === "auto")) {
        applyMode();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Antiphon);
