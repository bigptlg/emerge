/*! Emerge.js v1.7.2 — plugin Horizontal (global: EmergeHorizontal) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeHorizontal = d());
  })(this, function () {
    "use strict";
    let i = null;
    const d = new Map(),
      M = (y, p, j) => (y < p ? p : y > j ? j : y);
    function z(y) {
      var D;
      const { el: p, track: j, spacer: b, pin: h, speed: S } = y,
        $ = Math.max(0, Math.ceil(j.scrollWidth - p.clientWidth));
      if (
        ((y.distance = $),
        p.style.setProperty("--emerge-horizontal-distance", `${$}px`),
        h && b)
      ) {
        const s = p.getBoundingClientRect().height || window.innerHeight;
        b.style.height = `${Math.ceil(s + $ * S)}px`;
      }
      (D = y.range) == null || D.measure();
    }
    function Y(y) {
      const p = i.range;
      if (!p) return;
      const j = !(y.ease > 0) || y.ease;
      y.range = p.watch({
        on: y.pin ? y.spacer : y.el,
        anchor: y.pin ? y.spacer : y.el,
        from: y.pin ? "top@0%" : "enter",
        to: y.pin ? "bottom@100%" : "exit",
        follow: j,
        cssFollow: !1,
        onProgress(b) {
          (function (h, S) {
            const $ = M(S, 0, 1),
              D = h.reverse ? -h.distance + h.distance * $ : -h.distance * $;
            ((h.track.style.transform = `translate3d(${D.toFixed(1)}px, 0, 0)`),
              h.el.style.setProperty(
                "--emerge-horizontal-progress",
                $.toFixed(4),
              ));
          })(y, b.progress);
        },
      });
    }
    function H(y) {
      var m, A;
      if (d.has(y)) return d.get(y);
      const p =
          i.numAttr(
            y,
            "horizontal-speed",
            (m = i.options.horizontalSpeed) != null ? m : 1,
          ) || 1,
        j = i.attr(
          y,
          "horizontal-top",
          (A = i.options.horizontalTop) != null ? A : "0px",
        ),
        b = !!i.attr(y, "horizontal-pin", !0),
        h = !!i.attr(y, "horizontal-reverse", !1),
        S = i.numAttr(y, "horizontal-ease", 0),
        $ = (function (c) {
          const g = c.querySelector(":scope > .emerge-horizontal-track");
          if (g) return g;
          const x = document.createElement("div");
          return (
            (x.className = "emerge-horizontal-track"),
            Array.from(c.children)
              .filter(
                (T) =>
                  T.nodeType === 1 &&
                  !T.hasAttribute("data-emerge-horizontal-exclude"),
              )
              .forEach((T) => {
                (T.classList.add("emerge-horizontal-item"), x.appendChild(T));
              }),
            c.appendChild(x),
            x
          );
        })(y),
        D = b
          ? (function (c) {
              const g = c.parentElement;
              if (
                g &&
                g.classList.contains("emerge-horizontal-space") &&
                g.dataset.emergeHorizontalSpaceFor === ""
              )
                return g;
              const x = document.createElement("div");
              return (
                (x.className = "emerge-horizontal-space"),
                g.insertBefore(x, c),
                x.appendChild(c),
                x
              );
            })(y)
          : null;
      (D && (D.dataset.emergeHorizontalSpaceFor = ""),
        y.classList.add("emerge-horizontal"),
        b && ((y.style.position = "sticky"), (y.style.top = j)));
      const s = {
        el: y,
        track: $,
        spacer: D,
        pin: b,
        speed: p,
        reverse: h,
        ease: S,
        distance: 0,
        range: null,
      };
      return (
        d.set(y, s),
        z(s),
        Y(s),
        i.dispatch("emerge:horizontal:build", { el: y, track: $ }),
        s
      );
    }
    function O(y) {
      var j;
      const p =
        typeof y == "string" ? d.get(document.querySelector(y)) : d.get(y);
      p &&
        ((j = p.range) == null || j.stop(),
        (p.track.style.transform = ""),
        p.el.classList.remove("emerge-horizontal"),
        (p.el.style.position = ""),
        (p.el.style.top = ""),
        p.el.style.removeProperty("--emerge-horizontal-progress"),
        p.el.style.removeProperty("--emerge-horizontal-distance"),
        (function (b, h) {
          b &&
            b.parentElement &&
            (Array.from(b.children).forEach((S) => {
              (S.classList.remove("emerge-horizontal-item"),
                h.insertBefore(S, b));
            }),
            b.remove());
        })(p.track, p.el),
        p.spacer &&
          (function (b, h) {
            if (!b || !b.classList.contains("emerge-horizontal-space")) return;
            const S = b.parentElement;
            S && (S.insertBefore(h, b), b.remove());
          })(p.spacer, p.el),
        d.delete(p.el));
    }
    function N(y, p) {
      const j = typeof y == "string" ? document.querySelector(y) : y,
        b = j && d.get(j);
      if (!b || !b.range) return;
      let h = p;
      if (typeof p != "number") {
        const $ = typeof p == "string" ? b.track.querySelector(p) : p;
        if (!$ || !b.distance) return;
        h = M($.offsetLeft / b.distance, 0, 1);
      }
      h = b.reverse ? 1 - M(h, 0, 1) : M(h, 0, 1);
      const S = b.range.from + h * b.range.span;
      window.scrollTo({ top: S, behavior: "smooth" });
    }
    function P(y = document) {
      y.querySelectorAll("[data-emerge-horizontal]").forEach((p) => {
        d.has(p) || i.isDisabledFor(p, "horizontal") || H(p);
      });
    }
    return {
      name: "Horizontal",
      defaults: { horizontalSpeed: 1, horizontalTop: "0px" },
      install: (y) => (
        (i = y),
        Object.defineProperty(i, "range", {
          configurable: !0,
          get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
        }),
        {
          build: H,
          destroy: O,
          goTo: N,
          scan: P,
          measure: () => d.forEach(z),
          of: (p) => {
            const j = typeof p == "string" ? document.querySelector(p) : p;
            return d.get(j) || null;
          },
          get all() {
            return Array.from(d.values());
          },
        }
      ),
      hooks: {
        observe({ el: y }, p) {
          p.hasAttr(y, "horizontal") &&
            (p.isDisabledFor(y, "horizontal") ||
              (p.claim(y, "Horizontal"), H(y)));
        },
        init() {
          P();
        },
        refresh() {
          (Array.from(d.keys())
            .filter(
              (y) =>
                !document.body.contains(y) || i.isDisabledFor(y, "horizontal"),
            )
            .forEach(O),
            P(),
            d.forEach(z));
        },
        teardown() {
          Array.from(d.keys()).forEach(O);
        },
      },
    };
});
