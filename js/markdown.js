/* Antiphon — markdown pipeline */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var M = (A.markdown = {});
  var configured = false;
  var currentBaseurl = "./";
  var katexPromise = null;
  var highlightPromise = null;

  function absoluteSrc(src) {
    var href = String(src || "");
    if (/^(https?:|data:|blob:|\/)/i.test(href)) return href;
    return currentBaseurl + href;
  }

  function configure() {
    if (configured || !window.marked) return;
    configured = true;
    var renderer = new window.marked.Renderer();
    renderer.image = function (href, title, text) {
      var blog = A.state.blog || {};
      var md = blog["Markdown渲染配置"] || {};
      var responsive = md["根据用户屏幕尺寸渲染图片尺寸"] === true;
      var viewer = md["在用户点击图片时显示图片查看器"] === true;
      var caption = title || text || "";
      var src = absoluteSrc(href);
      var figureClass = responsive ? " is-responsive" : "";
      var viewerAttr = viewer ? ' data-viewer="1"' : "";
      return (
        '<figure class="prose-figure' + figureClass + '">' +
        '<img loading="lazy" src="' + A.esc(src) + '" alt="' + A.esc(text || "") + '"' + viewerAttr + " />" +
        (caption ? "<figcaption>" + A.esc(caption) + "</figcaption>" : "") +
        "</figure>"
      );
    };
    window.marked.setOptions({ gfm: true, breaks: false, headerIds: false, renderer: renderer });
  }

  M.render = async function (text, baseurl) {
    try {
      /* Loading and configuring marked can itself fail — a blocked CDN leaves
         window.marked undefined and A.ensureMarked() rejects. These calls
         therefore live inside the same try as parse(), so the plain-text
         fallback below still runs and the article body is never lost. */
      await A.ensureMarked();
      configure();
      currentBaseurl = baseurl || "./";
      return window.marked.parse(text);
    } catch (error) {
      console.error("[Antiphon] Markdown 渲染失败：", error);
      return "<p>" + A.esc(text) + "</p>";
    }
  };

  /* Heading anchors used to survive only for Latin letters, digits and
     Simplified-Chinese ideographs. A heading in Japanese kana, Korean hangul,
     Russian, Arabic or accented Latin collapsed to "section" (and then
     "section-2", "section-3"), which made every such heading share an
     unresolvable anchor and broke the marginalia table of contents for the
     theme's own ja, ko, ru and ar locales. \p{L} covers every script's letters,
     \p{N} the digits, and \p{M} keeps combining marks (Arabic vowel points,
     accented Latin) attached instead of turning them into a hyphen break. The
     existing punctuation list is now redundant — anything outside the letter
     class falls through to the hyphen — so it is gone rather than maintained
     twice. Uniqueness is still enforced by the caller's `used` map. */
  function slugify(text, used) {
    var base = String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[\s\u3000]+/g, "-")
      .replace(/[^\p{L}\p{N}\p{M}-]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!base) base = "section";
    var slug = base;
    var count = 2;
    while (used[slug]) {
      slug = base + "-" + count;
      count += 1;
    }
    used[slug] = true;
    return slug;
  }

  M.headings = function (root) {
    return Array.from(root.querySelectorAll("h2, h3"))
      .filter(function (heading) { return !heading.closest(".reference-list"); })
      .map(function (heading) {
        var text = heading.dataset.antiphonTitle || heading.textContent;
        return {
          level: heading.tagName === "H2" ? 2 : 3,
          text: String(text).replace(/^§\s*\d+\s*/, "").trim(),
          id: heading.id
        };
      });
  };

  function addSectionIndices(root) {
    var index = 0;
    root.querySelectorAll("h2").forEach(function (heading) {
      if (heading.closest(".reference-list")) return;
      if (heading.querySelector(".section-index")) return;
      index += 1;
      heading.dataset.antiphonTitle = heading.textContent.trim();
      var label = document.createElement("span");
      label.className = "section-index";
      label.textContent = "§ " + String(index).padStart(2, "0");
      heading.insertBefore(label, heading.firstChild);
    });
  }

  function addHeadingIds(root) {
    var used = {};
    root.querySelectorAll("h2, h3").forEach(function (heading) {
      if (!heading.id) heading.id = slugify(heading.textContent, used);
      else used[heading.id] = true;
    });
  }

  function addRefs(root) {
    var refs = Array.from(root.querySelectorAll("ref"));
    if (!refs.length) return;
    var list = document.createElement("div");
    list.className = "reference-list";
    list.id = "references";
    var title = document.createElement("h3");
    title.textContent = A.t("REFERENCES");
    list.appendChild(title);

    refs.forEach(function (ref, index) {
      var number = index + 1;
      var name = ref.textContent.trim();
      var url = ref.getAttribute("url") || "";
      var sup = document.createElement("sup");
      sup.className = "ref";
      var link = document.createElement("a");
      link.href = "#ref-" + number;
      link.textContent = "[" + number + "]";
      sup.appendChild(link);
      ref.textContent = "";
      ref.appendChild(sup);
      ref.id = "ref-src-" + number;

      var item = document.createElement("div");
      item.className = "reference-item";
      item.id = "ref-" + number;
      var back = document.createElement("a");
      back.href = "#ref-src-" + number;
      back.textContent = number + ".";
      var text = document.createElement("span");
      if (url) {
        var target = document.createElement("a");
        target.href = url;
        target.target = "_blank";
        target.rel = "noopener";
        target.textContent = name;
        text.appendChild(target);
      } else {
        text.textContent = name;
      }
      item.appendChild(back);
      item.appendChild(text);
      list.appendChild(item);
    });
    root.appendChild(list);
  }

  function addHints(root) {
    [
      ["info-hint", "INFO"],
      ["warning-hint", "WARNING"],
      ["success-hint", "SUCCESS"],
      ["danger-hint", "DANGER"]
    ].forEach(function (pair) {
      root.querySelectorAll(pair[0]).forEach(function (hint) {
        var label = document.createElement("span");
        label.className = "hint-heading";
        label.textContent = A.t(pair[1]);
        hint.insertBefore(label, hint.firstChild);
      });
    });
  }

  function addDropcap(root) {
    if (A.getCfg("外观.首字下沉", true) === false) return;
    var paragraph = root.querySelector("p");
    if (!paragraph) return;
    var node = paragraph.firstChild;
    if (!node || node.nodeType !== 3) return;
    var text = node.nodeValue || "";
    if (!text) return;
    var first = Array.from(text)[0];
    /* CJK only, and only where the script layer asks for one. A 3em Songti
       initial dropped into English reads as pastiche; Latin opens with a
       small-caps first line instead. Korean and Arabic have no initial-letter
       treatment at all — Hangul is caseless and Arabic is joined — so the script
       class gates the insertion rather than the character test alone. The
       character test still matters: an English article quoted inside a Chinese
       site must not take a Chinese drop cap. */
    var script = A.script || (A.scriptOf ? A.scriptOf(A.lang) : "cjk");
    if (script === "latin" || script === "cyrillic" || script === "arabic" || script === "ko") return;
    /* The character test asks "does this glyph take a drop cap", so it must
       cover the three scripts that set one — Han, Hiragana, Katakana — and
       nothing else. The previous range test was a block sweep
       (\u2E80-\u9FFF, \uF900-\uFAFF, \uFF00-\uFFEF, \u3000-\u303F): it
       admitted CJK punctuation, so an article opening with 「 got a 3em
       initial on the bracket (the manual's rule is 标点开头不下沉), and it
       admitted the fullwidth Latin block (Ａ), while a Japanese paragraph
       opening with kana was decided by luck of the block rather than by
       script. The property escapes name the scripts the design actually
       drops, and the gate above still excludes the scripts with no
       initial-letter treatment. */
    var isCjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(first);
    if (!isCjk) return;
    var span = document.createElement("span");
    span.className = "dropcap";
    span.textContent = first;
    node.nodeValue = text.slice(first.length);
    paragraph.insertBefore(span, node);
  }

  function addCopyButtons(root) {
    root.querySelectorAll("pre").forEach(function (pre) {
      if (pre.querySelector(".code-copy")) return;
      var code = pre.querySelector("code");
      if (!code) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = A.t("COPY_CODE");
      button.setAttribute("aria-label", A.t("COPY_CODE"));
      button.addEventListener("click", function () {
        var text = code.textContent || "";
        var original = A.t("COPY_CODE");
        /* Copy goes through A.copyText(), which already owns the
           clipboard-API-with-<textarea>-fallback path used by the article
           actions. Calling navigator.clipboard.writeText() directly meant a
           browser that denies the async API (insecure origin, permission
           prompt dismissed, older WebView) reported "Copied" for a no-op.
           The label now follows the promise: success says COPIED, a rejected
           copy says COPY_FAILED, and both revert to the initial label. */
        var done = function (ok) {
          button.textContent = A.t(ok ? "COPIED" : "COPY_FAILED");
          setTimeout(function () { button.textContent = original; }, 1200);
        };
        /* A.copyText() resolves to true/false rather than rejecting, so the
           resolved value — not the mere fact of resolution — decides the
           label. Reading only the fulfilment channel would still print
           COPIED for a clipboard that refused the write and whose <textarea>
           fallback also failed. */
        A.copyText(text).then(function (ok) {
          done(ok === true);
        }, function () {
          done(false);
        });
      });
      pre.appendChild(button);
    });
  }

  /* Section count for the catalog card. `##` inside a fenced code block is
     part of the sample code, not a heading, so the fences are removed before
     counting. This handles the ``` and ~~~ forms, keeps an unclosed fence
     removed to the end of the file (the same way Markdown parsers treat it),
     and ignores the optional leading indent CommonMark allows on a fence and
     the closing fence's longer run of the same character. */
  M.sectionCount = function (markdown) {
    var text = String(markdown || "");
    var lines = text.split(/\r?\n/);
    var inFence = false;
    var fenceChar = "";
    var inHtml = false;
    var count = 0;
    lines.forEach(function (line, index) {
      /* A CommonMark HTML block (type 6) runs from a line that opens a
         block-level tag to the next blank line, and its contents are not
         parsed as Markdown — `## note` inside a <div> is text, not a heading.
         Glossing over this counted sections the page never numbered. Markdown
         inside <details>/<figure> still works because authors leave a blank
         line after the summary, which ends the block here just as it does in
         the parser. */
      if (inHtml) {
        if (!/\S/.test(line)) inHtml = false;
        return;
      }
      if (/^\s{0,3}<(address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(\s|\/?>|$)/i.test(line)) {
        inHtml = true;
        return;
      }
      var fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (fence) {
        var marker = fence[1].charAt(0);
        if (!inFence) {
          inFence = true;
          fenceChar = marker;
        } else if (marker === fenceChar && !/\S/.test(line.slice(fence[0].length))) {
          inFence = false;
        }
        return;
      }
      if (inFence) return;
      /* Level-2 ATX headings, matching CAT_SECTIONS: the catalog counts the
         article's own sections, exactly what addSectionIndices() numbers. */
      if (/^\s{0,3}##\s+/.test(line)) {
        count += 1;
        return;
      }
      /* Setext headings. A paragraph line followed immediately by a `---`
         underline is an <h2> to every Markdown parser, and the previous
         counter missed them entirely, so a setext-written article reported
         zero sections while the page clearly numbered them. `===` is an <h1>
         and is not counted. A `---` with no paragraph above it is a thematic
         break, which is why the previous line has to be non-empty text. */
      if (/^\s{0,3}-{3,}\s*$/.test(line) && index > 0) {
        var above = lines[index - 1];
        if (above && !/^\s*$/.test(above) && !/^\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||`{3,}|~{3,}|<)/.test(above)) {
          count += 1;
        }
      }
    });
    return count;
  };

  M.ensureMath = function () {
    if (!katexPromise) {
      /* A rejected promise is evicted so a transient CDN failure cannot poison
         the cache for the session: the next article that needs math retries
         instead of inheriting the failure. The same applies to the highlight
         script below and to the marked loader in js/data.js. */
      katexPromise = A.loadStyle(A.cdn("katex@0.16.11/dist/katex.min.css"))
        .then(function () { return A.loadScript(A.cdn("katex@0.16.11/dist/katex.min.js")); })
        .then(function () { return A.loadScript(A.cdn("katex@0.16.11/dist/contrib/auto-render.min.js")); })
        .catch(function (error) {
          katexPromise = null;
          throw error;
        });
    }
    return katexPromise;
  };

  M.ensureHighlight = function () {
    if (!highlightPromise) {
      highlightPromise = A.loadScript(A.cdn("@highlightjs/cdn-assets@11.9.0/highlight.min.js"))
        .catch(function (error) {
          highlightPromise = null;
          throw error;
        });
    }
    return highlightPromise;
  };

  M.renderMath = function (root) {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    } catch (error) {
      console.error("[Antiphon] 数学公式渲染失败：", error);
    }
  };

  /* Highlight only the block just rendered. highlightAll() walks the entire
     document, which re-highlights every earlier article's <pre> on each route
     change and grows the work with the number of views already visited. The
     scoped form touches exactly the new subtree; callers still pass the root,
     and the document fallback keeps a zero-argument call harmless. */
  M.highlight = function (root) {
    if (!window.hljs) return;
    try {
      var scope = root && root.querySelectorAll ? root : document;
      scope.querySelectorAll("pre code").forEach(function (block) {
        if (typeof window.hljs.highlightElement === "function") window.hljs.highlightElement(block);
      });
    } catch (error) {
      console.warn("[Antiphon] 代码高亮失败：", error);
    }
  };

  M.postProcess = async function (root) {
    if (!root) return;
    addHeadingIds(root);
    addSectionIndices(root);
    addRefs(root);
    addHints(root);
    addDropcap(root);
    addCopyButtons(root);

    var needsMath = /\$|\\\(|\\\[/.test(root.textContent || "");
    if (needsMath) {
      M.ensureMath()
        .then(function () { M.renderMath(root); })
        .catch(function (error) { console.warn("[Antiphon] KaTeX 未加载：", error.message); });
    }
    if (root.querySelector("pre code")) {
      M.ensureHighlight()
        .then(function () { M.highlight(root); })
        .catch(function (error) { console.warn("[Antiphon] highlight.js 未加载：", error.message); });
    }
  };
})(window.Antiphon);
