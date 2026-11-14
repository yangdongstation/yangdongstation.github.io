/* Antiphon — query router (BBG-compatible URLs) */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var renderToken = 0;

  A.parseRoute = function (search) {
    var params = new URLSearchParams(search || "");
    var type = params.get("type");
    var page = parseInt(params.get("page"), 10);
    if (!isFinite(page) || page < 1) page = 1;

    if (type === "article") {
      return { view: "article", filename: params.get("filename") || "", page: 1 };
    }
    if (type === "page") {
      return { view: "page", filename: params.get("filename") || "", page: 1 };
    }
    if (type === "internal") {
      var fn = params.get("function");
      if (fn === "archive_and_tags") return { view: "archive", page: 1 };
      if (fn === "friendbook") return { view: "friends", page: 1 };
      if (fn === "tag") return { view: "tag", tag: params.get("argument") || "", page: 1 };
      return { view: "home", page: page };
    }
    return { view: "home", page: page };
  };

  function errorResult(error) {
    console.error("[Antiphon] 视图渲染失败：", error);
    return {
      title: A.t("LOAD_ERROR"),
      html: A.views.panel(
        '<div class="not-found">' +
          '<p class="not-found-code">!</p>' +
          '<p class="not-found-text">' + A.esc(A.t("LOAD_ERROR")) + "</p>" +
          '<p class="not-found-text">' + A.esc(String(error && error.message ? error.message : error)) + "</p>" +
        "</div>"
      )
    };
  }

  /* Per-route document metadata. applyMetadata() owns the <meta> writes and
     falls back to the blog root when a view has nothing to say; this function
     only decides *which* view facts to hand it. Article descriptions come from
     the (already localised) excerpt so a shared link previews the piece rather
     than the homepage subtitle. Home has no title of its own, so it falls back
     to the site name — exactly the pre-existing behaviour. */
  function viewMetadata(route, result) {
    var view = {
      title: result && result.title ? String(result.title) : "",
      description: "",
      url: window.location.href,
      /* Authoritative-title flag: see the title branch in applyMetadata. */
      route: true
    };
    if (route.view === "article" && A.getArticle) {
      var article = A.getArticle(route.filename);
      if (article) {
        if (!view.title) view.title = article.title;
        view.description = String(article.excerpt || "");
      }
    } else if (route.view === "page" && A.getPage) {
      var page = A.getPage(route.filename);
      if (page && !view.title) view.title = page.title;
    } else if (route.view === "tag") {
      /* The tag route's title already carries the localised label. */
      view.description = "";
    }
    return view;
  }

  async function renderRoute() {
    var token = ++renderToken;
    var route = A.parseRoute(window.location.search);
    A.route = route;
    A.views.updateNavActive(route);

    /* Unlock the document before the new view paints. With the search sheet or
       image viewer open, body overflow is "hidden"; leaving it set through a
       Back/Forward jump would present the new page scroll-locked under a modal
       that no longer has anything open to it. */
    if (A.closeOverlays) A.closeOverlays();

    var result;
    try {
      if (route.view === "article") {
        result = await A.views.article(route.filename);
      } else if (route.view === "page") {
        result = await A.views.page(route.filename);
      } else if (route.view === "archive") {
        result = await A.views.archive();
      } else if (route.view === "tag") {
        result = await A.views.tag(route.tag);
      } else if (route.view === "friends") {
        result = await A.views.friends();
      } else {
        result = await A.views.home(route.page);
      }
      if (!result) result = await A.views.notFound();
    } catch (error) {
      result = errorResult(error);
    }

    if (token !== renderToken) return;

    var main = document.getElementById("main");
    main.innerHTML = result.html;

    /* Motion is opted into per paint: the class starts the staggered reveal in
       css/motion.css, and removing it before the swap means a second visit to
       the same view replays the animation instead of staying inert.
       reflow-reading `offsetWidth` restarts the animation cleanly. */
    main.classList.remove("motion-reveal");
    void main.offsetWidth;
    main.classList.add("motion-reveal");
    if (typeof result.after === "function") {
      try {
        await result.after(main);
      } catch (error) {
        console.error("[Antiphon] 视图后处理失败：", error);
      }
    }
    if (token !== renderToken) return;

    /* Metadata is part of the paint, not a boot-time side effect: a shared
       article must advertise its own title/excerpt, and og:url has to follow
       the route the reader is actually on. applyMetadata() owns the <title>
       and keeps the blog-root fallback for views with no title of their own,
       which is the same value the old hand-composed line produced. */
    if (A.applyMetadata) {
      A.applyMetadata(A.state.blog, viewMetadata(route, result));
    } else {
      /* Defensive only: app.js defines applyMetadata before boot() runs. */
      var siteTitle = A.views && A.views.siteName ? A.views.siteName() : "Antiphon";
      document.title = result.title ? result.title + " - " + siteTitle : siteTitle;
    }

    window.scrollTo(0, 0);
    /* Recompute the rail against the freshly painted height: scrollTo(0, 0)
       fires the listener before layout settles, so without this a jump from a
       long article to a short page can strand a partially filled bar. */
    if (A.refreshProgress) A.refreshProgress();
    if (A.runExtensions) A.runExtensions();
    if (A.app && A.app.afterRoute) A.app.afterRoute();
  }

  A.renderRoute = renderRoute;

  A.navigate = function (url, options) {
    if (!url) return;
    try {
      if (options && options.replace) {
        window.history.replaceState({}, "", url);
      } else {
        window.history.pushState({}, "", url);
      }
    } catch (error) {
      window.location.href = url;
      return;
    }
    renderRoute();
  };

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[data-internal]") : null;
    if (!link) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.getAttribute("target") === "_blank"
    ) {
      return;
    }
    event.preventDefault();
    A.navigate(link.getAttribute("href"));
  });

  window.addEventListener("popstate", function () {
    renderRoute();
  });
})(window.Antiphon);
