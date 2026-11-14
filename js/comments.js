/* Antiphon — comment providers (one active at a time) */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var PUBLIC_APP_ID = "SykuVs4qcWMkl4RUtKEUlmog-gzGzoHsz";
  var PUBLIC_APP_KEY = "0jowkR4ct0lJbWcvocymEkKw";
  var disqusLoaded = false;

  /* The comment provider wants a plain code; A.lang is a BCP-47 tag, so this
     reads the tag rather than comparing against the old language names — which
     would have sent every non-English, non-Japanese visitor to "zh-CN".
     zh-Hans/zh-Hant are CLDR-valid but the Chinese exchanges still expect the
     region form, so only Chinese is remapped. Every other tag (pt, es, ru, ar,
     …) is passed through unchanged: Valine and Waline both accept full BCP-47,
     and narrowing fr-CA to fr would throw away information they can use. */
  function langCode() {
    var tag = A.lang || "en";
    if (tag.indexOf("zh-Hant") === 0) return "zh-TW";
    if (tag.indexOf("zh") === 0) return "zh-CN";
    return tag;
  }

  function pathFor(kind, filename) {
    var base = window.location.origin + window.location.pathname;
    return "domain=" + base + ";" + (kind === "page" ? "page=" : "article=") + filename;
  }

  function note(container, text) {
    container.innerHTML = '<p class="comment-note">' + A.esc(text) + "</p>";
  }

  function hasValue(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  /* The v2 terracotta (--signal in css/tokens.css). Rustaline takes a literal
     colour, not a CSS variable, so the hex is repeated here; it must stay in
     step with the token layer. */
  var ACCENT = "#C2663C";

  /* Live comment instances, so applyMode() can push a palette change into an
     already-mounted widget instead of leaving it on the theme it booted with.
     Waline exposes a documented update()/destroy() pair. Rustaline has no
     setter, but it drives its own palette through the `rs-dark` class on the
     element it was given, which is the contract its stylesheet uses. */
  var mounted = null;

  function nightNow() {
    return document.body.getAttribute("data-mode") === "night";
  }

  function syncTheme(mode) {
    var night = mode ? mode === "night" : nightNow();
    if (!mounted) return;
    mounted.mode = night ? "night" : "day";
    if (mounted.kind === "waline" && mounted.instance && typeof mounted.instance.update === "function") {
      try {
        mounted.instance.update({ dark: night });
      } catch (error) {
        console.warn("[Antiphon] Waline 主题同步失败：", error);
      }
    } else if (mounted.kind === "rustaline") {
      var root = (mounted.instance && mounted.instance.el) || document.getElementById("comments");
      if (root && root.classList) root.classList.toggle("rs-dark", night);
    }
  }

  function mount(main, context) {
    var container = main.querySelector("#comments");
    if (!container) return;
    /* A new route means the previous widget's DOM is gone. Drop the reference
       first so a stale instance can never be themed into nodes that no longer
       exist. Waline's destroy() is safe to call on an unmounted app. */
    if (mounted && mounted.kind === "waline" && mounted.instance && typeof mounted.instance.destroy === "function") {
      try {
        mounted.instance.destroy();
      } catch (error) {}
    }
    mounted = null;
    var comment = A.state.blog["全局评论设置"] || {};
    var valine = comment["valine设置"] || {};
    var waline = comment["waline设置"] || {};
    var rustaline = comment["rustaline设置"] || {};
    var disqus = comment["disqus设置"] || {};
    var kind = context.kind === "page" ? "page" : "article";
    var path = pathFor(kind, context.filename);

    if (comment["启用valine评论"] === true) {
      var publicService = valine["是否使用bbg公共评论服务"] === true;
      var appId = publicService ? PUBLIC_APP_ID : valine["leancloud_appid"];
      var appKey = publicService ? PUBLIC_APP_KEY : valine["leancloud_appkey"];
      if (!hasValue(appId) || !hasValue(appKey)) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      if (publicService && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        note(container, A.t("COMMENTS_PREVIEW"));
        return;
      }
      A.loadScript(A.cdn("valine@1.5.1/dist/Valine.min.js"))
        .then(function () {
          if (!window.Valine) throw new Error("Valine 未就绪");
          new window.Valine({
            el: "#comments",
            appId: appId,
            appKey: appKey,
            path: path,
            placeholder: String(valine["评论区占位符（提示文字）"] || A.t("COMMENTS")),
            enableQQ: valine["评论者填写邮箱为qq邮箱时使用qq昵称和头像代替gravatar头像"] === true,
            lang: langCode(),
            recordIP: valine["记录评论者ip"] === true
          });
        })
        .catch(function (error) {
          console.error("[Antiphon] Valine 加载失败：", error);
          note(container, A.t("COMMENTS_LOAD_FAILED"));
        });
      return;
    }

    if (comment["启用waline评论"] === true) {
      if (!hasValue(waline["serverurl"])) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      Promise.all([
        A.loadStyle(A.cdn("@waline/client@3.16.2/dist/waline.css")),
        A.loadScript(A.cdn("@waline/client@3.16.2/dist/waline.umd.js"))
      ])
        .then(function () {
          if (!window.Waline || !window.Waline.init) throw new Error("Waline 未就绪");
          var night = nightNow();
          var instance = window.Waline.init({
            el: "#comments",
            serverURL: String(waline["serverurl"]).replace(/\/$/, ""),
            path: path,
            lang: langCode(),
            dark: night
          });
          mounted = { kind: "waline", instance: instance, mode: night ? "night" : "day" };
        })
        .catch(function (error) {
          console.error("[Antiphon] Waline 加载失败：", error);
          note(container, A.t("COMMENTS_LOAD_FAILED"));
        });
      return;
    }

    if (comment["启用rustaline评论"] === true) {
      if (!hasValue(rustaline["serverurl"])) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      var server = String(rustaline["serverurl"]).replace(/\/$/, "");
      A.loadScript(server + "/sdk/rustaline.js")
        .then(function () {
          if (!window.Rustaline) throw new Error("Rustaline SDK 未就绪");
          /* darkMode used to be "auto", which follows the OS preference and
             therefore ignored the theme's own Day/Night switch. The theme owns
             the palette, so the value is passed explicitly from body[data-mode]. */
          var night = nightNow();
          var instance = new window.Rustaline({
            el: "#comments",
            server: server,
            url: path,
            lang: langCode(),
            colorPattern: ACCENT,
            darkMode: night ? "dark" : "light"
          });
          mounted = { kind: "rustaline", instance: instance, mode: night ? "night" : "day" };
        })
        .catch(function (error) {
          console.error("[Antiphon] Rustaline 加载失败：", error);
          note(container, A.t("COMMENTS_LOAD_FAILED"));
        });
      return;
    }

    if (comment["启用disqus评论"] === true) {
      if (!hasValue(disqus["shortname"])) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      var shortname = String(disqus["shortname"]).trim();
      /* embed.js and DISQUS.reset() both resolve the mount point by id, and
         V.commentsBlock renders it. Recreate it defensively if a caller ever
         hands us a bare #comments container: appending the script without a
         target is the silent failure this guards against. */
      if (!document.getElementById("disqus_thread")) {
        var thread = document.createElement("div");
        thread.id = "disqus_thread";
        container.appendChild(thread);
      }
      window.disqus_config = function () {
        this.page.identifier = path;
        this.page.url = window.location.href;
      };
      if (window.DISQUS && disqusLoaded) {
        window.DISQUS.reset({ reload: true, config: window.disqus_config });
        return;
      }
      disqusLoaded = true;
      var script = document.createElement("script");
      script.src = "https://" + shortname + ".disqus.com/embed.js";
      script.setAttribute("data-timestamp", String(Date.now()));
      script.onerror = function () { note(container, A.t("COMMENTS_LOAD_FAILED")); };
      document.body.appendChild(script);
      return;
    }

    note(container, A.t("COMMENTS_UNAVAILABLE"));
  }

  A.comments = { mount: mount, syncTheme: syncTheme };
})(window.Antiphon);
