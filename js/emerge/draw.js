/*! Emerge.js v1.7.2 — plugin Draw (global: EmergeDraw) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeDraw = d());
  })(this, function () {
    "use strict";
    const i = "http://www.w3.org/2000/svg",
      d = "path, line, polyline, polygon, circle, ellipse, rect";
    let M = null;
    const z = new Map();
    let Y = 0;
    const H = (n, r, a) => (n < r ? r : n > a ? a : n);
    function O(n) {
      return !!n && typeof n.getTotalLength == "function";
    }
    function N(n) {
      try {
        return n.getTotalLength();
      } catch {
        return 0;
      }
    }
    function P(n) {
      if (!n || n === "transparent") return !0;
      const r =
        /rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*([\d.]+))?\)/i.exec(
          n,
        );
      return r && r[1] !== void 0 ? parseFloat(r[1]) === 0 : !1;
    }
    function y(n) {
      try {
        const r = getComputedStyle(n),
          a = parseFloat(r.strokeWidth),
          l = r.strokeOpacity ? parseFloat(r.strokeOpacity) : 1;
        return !r.stroke ||
          r.stroke === "none" ||
          P(r.stroke) ||
          (!Number.isNaN(l) && l <= 0)
          ? !1
          : !Number.isNaN(a) && a > 0;
      } catch {
        return !0;
      }
    }
    function p(n) {
      return n.ownerSVGElement || (n.closest ? n.closest("svg") : null);
    }
    function j(n) {
      let r = n.querySelector(":scope > defs");
      return (
        r ||
          ((r = document.createElementNS(i, "defs")),
          n.insertBefore(r, n.firstChild)),
        r
      );
    }
    function b(n, r) {
      const a = p(n);
      if (!a) return null;
      let l;
      try {
        l = n.getBBox();
      } catch {
        l = { width: 0, height: 0 };
      }
      const u = Math.max(l.width, l.height, 1) * (r || 1),
        E = n.cloneNode(!0);
      (E.removeAttribute("id"),
        E.removeAttribute("class"),
        E.removeAttribute("style"),
        E.setAttribute("fill", "none"),
        E.setAttribute("stroke", "#fff"),
        E.setAttribute("stroke-width", String(u)),
        (E.style.strokeLinecap = "round"),
        (E.style.strokeLinejoin = "round"));
      const C = `emerge-draw-mask-${++Y}`,
        I = document.createElementNS(i, "mask");
      (I.setAttribute("id", C),
        I.setAttribute("maskUnits", "userSpaceOnUse"),
        I.appendChild(E));
      const t = j(a);
      t.appendChild(I);
      const v = n.getAttribute("mask");
      return (
        n.setAttribute("mask", `url(#${C})`),
        {
          maskId: C,
          maskEl: I,
          defs: t,
          clone: E,
          prevMask: v,
          strokeWidth: u,
          bbox: l,
        }
      );
    }
    function h(n, r) {
      r &&
        (r.prevMask
          ? n.setAttribute("mask", r.prevMask)
          : n.removeAttribute("mask"),
        r.maskEl.remove());
    }
    function S(n, r = {}) {
      var u, E, C, I, t, v, w, F, e, o, f, L, k, q, W, X, V, _;
      const a = M ? M.options : {},
        l =
          (u = r.selector) != null
            ? u
            : M == null
              ? void 0
              : M.attr(n, "draw", void 0);
      return {
        selector:
          l === void 0 || l === !0 ? ((E = a.drawSelector) != null ? E : d) : l,
        step: Number(
          (I = r.step) != null
            ? I
            : M == null
              ? void 0
              : M.numAttr(n, "draw-step", (C = a.drawStep) != null ? C : 80),
        ),
        order:
          (v = r.order) != null
            ? v
            : M == null
              ? void 0
              : M.attr(
                  n,
                  "draw-order",
                  (t = a.drawOrder) != null ? t : "forward",
                ),
        spread: Number(
          (F = r.spread) != null
            ? F
            : M == null
              ? void 0
              : M.numAttr(n, "draw-spread", (w = a.drawSpread) != null ? w : 0),
        ),
        direction:
          (o = r.direction) != null
            ? o
            : M == null
              ? void 0
              : M.attr(
                  n,
                  "draw-direction",
                  (e = a.drawDirection) != null ? e : "start",
                ),
        round: !!((L = r.round) != null
          ? L
          : M != null &&
            M.attr(n, "draw-round", (f = a.drawRound) != null ? f : !1)),
        fillMode:
          (q = r.fillMode) != null
            ? q
            : M == null
              ? void 0
              : M.attr(
                  n,
                  "draw-fill",
                  (k = a.drawFillMode) != null ? k : "auto",
                ),
        fillWidth: Number(
          (X = r.fillWidth) != null
            ? X
            : M == null
              ? void 0
              : M.numAttr(
                  n,
                  "draw-fill-width",
                  (W = a.drawFillWidth) != null ? W : 1,
                ),
        ),
        animation:
          (_ = (V = r.animation) != null ? V : n.getAttribute("data-emerge")) !=
          null
            ? _
            : null,
        delay:
          Number(
            r.delay != null ? r.delay : M ? M.numAttr(n, "draw-delay", 0) : 0,
          ) || 0,
      };
    }
    function $(n, r) {
      if (r === "self") return O(n) ? [n] : [];
      let a = [];
      try {
        a = Array.from(n.querySelectorAll(r)).filter(O);
      } catch {
        a = [];
      }
      return a.length ? a : O(n) ? [n] : [];
    }
    function D(n, r) {
      const a = Array.from({ length: n }, (l, u) => u);
      if (r === "reverse") return a.map((l, u) => n - 1 - u);
      if (r === "center") {
        const l = (n - 1) / 2;
        return a.map((u) => Math.round(Math.abs(u - l)));
      }
      if (r === "edges") {
        const l = (n - 1) / 2;
        return a.map((u) => Math.round(l - Math.abs(u - l)));
      }
      if (r === "random") {
        const l = a.slice();
        for (let u = l.length - 1; u > 0; u--) {
          const E = Math.floor(Math.random() * (u + 1));
          [l[u], l[E]] = [l[E], l[u]];
        }
        return l;
      }
      return a;
    }
    function s(n, r, a) {
      const l = new IntersectionObserver(
        (u) => {
          u.forEach((E) => {
            const C = M.options.animatedClassName;
            E.isIntersecting
              ? (r.classList.add(C), a.once && l.unobserve(n))
              : !a.once && !a.mirrorOff && r.classList.remove(C);
          });
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0 },
      );
      return (l.observe(n), l);
    }
    function m(n, r = {}) {
      const a = typeof n == "string" ? document.querySelector(n) : n;
      if (!a) return null;
      z.has(a) && A(a);
      const l = S(a, r),
        u = $(a, l.selector);
      if (!u.length) return null;
      (a.classList.add("emerge-draw"),
        a.setAttribute("data-emerge-draw-count", u.length));
      const E = l.animation;
      E && a.removeAttribute("data-emerge");
      const C = D(u.length, l.order),
        I = l.direction === "end",
        t = [],
        v = [],
        w = [],
        F = [];
      u.forEach((o, f) => {
        M == null || M.claim(o, "Draw");
        const L = N(o);
        let k = l.fillMode === "mask";
        l.fillMode === "auto" && (k = !y(o));
        let q = null,
          W = o;
        (k && ((q = b(o, l.fillWidth)), q && (W = q.clone)),
          W.classList.add("emerge-draw-path"),
          W.style.setProperty("--emerge-draw-length", String(L)),
          I
            ? W.style.setProperty("--emerge-draw-offset", String(-L))
            : W.style.removeProperty("--emerge-draw-offset"),
          l.round &&
            ((W.style.strokeLinecap = "round"),
            (W.style.strokeLinejoin = "round")),
          W.style.setProperty("--emerge-index", C[f]),
          W.style.setProperty(
            "--emerge-delay",
            C[f] * l.step + l.delay + "ms",
          ));
        let X = null;
        (E &&
          (q
            ? (X = s(o, W, { once: l.once }))
            : o.setAttribute("data-emerge", E)),
          t.push(W),
          v.push(q),
          w.push(!!q),
          F.push(X));
      });
      const e = {
        el: a,
        paths: u,
        targets: t,
        masks: v,
        useMask: w,
        observers: F,
        config: l,
        stagger: C,
        animation: E,
        followed: !1,
        wired: !1,
      };
      return (
        z.set(a, e),
        { paths: u, restore: () => A(a), remeasure: () => c(a) }
      );
    }
    function A(n) {
      const r = typeof n == "string" ? document.querySelector(n) : n,
        a = r && z.get(r);
      if (!a) return;
      const l = M == null ? void 0 : M.options.animatedClassName;
      (a.paths.forEach((u, E) => {
        const C = a.targets[E];
        (M == null || M.release(u),
          C.classList.remove("emerge-draw-path", "emerge-draw-follow"),
          l && C.classList.remove(l),
          C.style.removeProperty("--emerge-draw-length"),
          C.style.removeProperty("--emerge-draw-offset"),
          C.style.removeProperty("--emerge-index"),
          C.style.removeProperty("--emerge-delay"),
          (C.style.strokeDashoffset = ""),
          (C.style.strokeLinecap = ""),
          (C.style.strokeLinejoin = ""),
          a.observers[E] && a.observers[E].disconnect(),
          a.masks[E] && h(u, a.masks[E]),
          a.animation && u.removeAttribute("data-emerge"));
      }),
        a.animation && r.setAttribute("data-emerge", a.animation),
        r.classList.remove("emerge-draw"),
        r.removeAttribute("data-emerge-draw-count"),
        z.delete(r));
    }
    function c(n) {
      const r = typeof n == "string" ? document.querySelector(n) : n,
        a = r && z.get(r);
      if (!a) return;
      const l = a.config.direction === "end";
      a.paths.forEach((u, E) => {
        const C = a.targets[E],
          I = N(u);
        (C.style.setProperty("--emerge-draw-length", String(I)),
          l && C.style.setProperty("--emerge-draw-offset", String(-I)));
        const t = a.masks[E];
        if (t) {
          let v;
          try {
            v = u.getBBox();
          } catch {
            v = t.bbox;
          }
          const w = Math.max(v.width, v.height, 1) * (a.config.fillWidth || 1);
          t.clone.setAttribute("stroke-width", String(w));
        }
      });
    }
    function g(n) {
      const r = z.get(n);
      if (!r || r.followed) return;
      const a = M.options.animatedClassName;
      r.targets.forEach((l) => l.classList.add(a));
    }
    function x(n) {
      const r = z.get(n);
      if (!r || r.followed) return;
      const a = M.options.animatedClassName;
      r.targets.forEach((l) => l.classList.remove(a));
    }
    function T() {
      const n = M && M.range;
      n &&
        z.forEach((r, a) => {
          if (r.wired) return;
          const l = n.of(a)[0];
          if (l)
            if (((r.wired = !0), l.follow !== !1)) {
              const u = r.targets.length,
                E = H(r.config.spread, 0, 0.95),
                C = 1 - E,
                I = r.config.direction === "end" ? -1 : 1;
              ((r.followed = !0),
                r.targets.forEach((t) => t.classList.add("emerge-draw-follow")),
                (l.cssFollow = !1),
                (l.onProgress = (t) => {
                  const v = t.progress;
                  for (let w = 0; w < u; w++) {
                    const F = r.targets[w],
                      e =
                        parseFloat(
                          F.style.getPropertyValue("--emerge-draw-length"),
                        ) || 0,
                      o = u > 1 ? (r.stagger[w] / (u - 1)) * E : 0,
                      f = H((v - o) / C, 0, 1);
                    F.style.strokeDashoffset = "" + I * e * (1 - f);
                  }
                }),
                (l.painted = -1));
            } else {
              const u = l.onEdge;
              l.onEdge = (E) => {
                (E.edge === "from"
                  ? E.direction > 0
                    ? g(a)
                    : l.once || x(a)
                  : l.mirror && (E.direction > 0 ? x(a) : g(a)),
                  u == null || u(E));
              };
            }
        });
    }
    function R(n = document) {
      n.querySelectorAll("[data-emerge-draw]").forEach((r) => {
        z.has(r) || M.isDisabledFor(r, "draw") || m(r);
      });
    }
    return {
      name: "Draw",
      defaults: {
        drawSelector: d,
        drawStep: 80,
        drawOrder: "forward",
        drawSpread: 0,
        drawDirection: "start",
        drawRound: !1,
        drawFillMode: "auto",
        drawFillWidth: 1,
      },
      install: (n) => (
        (M = n),
        Object.defineProperty(M, "range", {
          configurable: !0,
          get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
        }),
        {
          draw: m,
          restore: A,
          remeasure: c,
          paths: (r) => {
            var a, l;
            return (l =
              (a = z.get(
                typeof r == "string" ? document.querySelector(r) : r,
              )) == null
                ? void 0
                : a.paths) != null
              ? l
              : [];
          },
          restoreAll: () => Array.from(z.keys()).forEach(A),
          get all() {
            return Array.from(z.values());
          },
        }
      ),
      hooks: {
        observe({ el: n }, r) {
          r.hasAttr(n, "draw") && (r.isDisabledFor(n, "draw") || m(n));
        },
        init() {
          (R(), T());
        },
        in({ el: n }) {
          g(n);
        },
        out({ el: n }) {
          x(n);
        },
        refresh() {
          (Array.from(z.keys())
            .filter(
              (n) => !document.body.contains(n) || M.isDisabledFor(n, "draw"),
            )
            .forEach(A),
            R(),
            T());
        },
        unobserve({ el: n }) {
          A(n);
        },
        teardown() {
          Array.from(z.keys()).forEach(A);
        },
      },
    };
});
