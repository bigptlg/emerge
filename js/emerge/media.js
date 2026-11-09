/*! Emerge.js v1.7.2 — plugin Media (global: EmergeMedia) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeMedia = d());
  })(this, function () {
    "use strict";
    let i = null;
    const d = new Map(),
      M = (s, m, A) => (s < m ? m : s > A ? A : s);
    function z(s) {
      return s ? (typeof s == "string" ? document.querySelector(s) : s) : null;
    }
    function Y(s) {
      return (
        !!s &&
        typeof HTMLMediaElement != "undefined" &&
        s instanceof HTMLMediaElement
      );
    }
    function H(s) {
      return (
        !!s &&
        typeof HTMLCanvasElement != "undefined" &&
        s instanceof HTMLCanvasElement
      );
    }
    function O(s) {
      return Y(s) || H(s);
    }
    function N(s, m) {
      const A = String(m).padStart(s.padWidth, "0");
      return s.prefix + A + s.middleSuffix + s.extension;
    }
    function P(s) {
      if (Array.isArray(s.urls) && s.urls.length) return s.urls.slice();
      if (!s.first || !s.last) return null;
      const m = (function (x, T) {
        const R = x.lastIndexOf("."),
          n = T.lastIndexOf(".");
        if (R === -1 || n === -1) return null;
        const r = x.slice(R),
          a = T.slice(n),
          l = x.slice(0, R),
          u = T.slice(0, n);
        let E = 0;
        for (; E < l.length && E < u.length && l[E] === u[E]; ) E++;
        let C = l.length,
          I = u.length;
        for (; C > E && I > E && l[C - 1] === u[I - 1]; ) (C--, I--);
        const t = l.slice(E, C),
          v = u.slice(E, I);
        if (!/^\d+$/.test(t) || !/^\d+$/.test(v)) return null;
        const w = parseInt(t, 10),
          F = parseInt(v, 10);
        return F < w
          ? null
          : {
              prefix: l.slice(0, E),
              middleSuffix: l.slice(C),
              extension: r || a,
              padWidth: t.length,
              start: w,
              end: F,
            };
      })(s.first, s.last);
      if (!m) return [s.first];
      const A = Math.max(1, Math.round(s.step || 1)),
        c = Math.floor((m.end - m.start) / A) + 1,
        g = new Array(c);
      for (let x = 0; x < c; x++) g[x] = N(m, m.start + x * A);
      return g;
    }
    function y(s, m = {}) {
      var I, t, v, w, F, e, o, f, L, k, q, W, X, V, _, K, B, U;
      const A = i ? i.options : {},
        c =
          (I = m.selector) != null
            ? I
            : i == null
              ? void 0
              : i.attr(s, "media", void 0),
        g =
          c === void 0 || c === !0
            ? O(s)
              ? "self"
              : (t = A.mediaSelector) != null
                ? t
                : "video, audio, canvas"
            : c,
        x =
          (v = m.range) != null
            ? v
            : i == null
              ? void 0
              : i.attr(s, "media-range", void 0),
        [T, R] = (function (Z, ee, J) {
          if (Z == null) return [ee, J];
          const G = String(Z)
            .split(",")
            .map((Q) => parseFloat(Q.trim()));
          return G.length === 2 && G.every((Q) => !Number.isNaN(Q))
            ? [M(G[0], 0, 1), M(G[1], 0, 1)]
            : [ee, J];
        })(
          x,
          (F = (w = m.from) != null ? w : A.mediaFrom) != null ? F : 0,
          (o = (e = m.to) != null ? e : A.mediaTo) != null ? o : 1,
        ),
        n = m.frames || {},
        r =
          (f = n.first) != null
            ? f
            : i == null
              ? void 0
              : i.attr(s, "media-first-frame", void 0),
        a =
          (L = n.last) != null
            ? L
            : i == null
              ? void 0
              : i.attr(s, "media-last-frame", void 0),
        l =
          Number(
            (q =
              (k = n.step) != null
                ? k
                : i == null
                  ? void 0
                  : i.numAttr(s, "media-frame-step", 1)) != null
              ? q
              : 1,
          ) || 1,
        u =
          (X =
            (W = n.fit) != null
              ? W
              : i == null
                ? void 0
                : i.attr(s, "media-fit", "cover")) != null
            ? X
            : "cover",
        E = (V = n.urls) != null ? V : null,
        C = !!(E || (r && a));
      return {
        selector: g,
        from: T,
        to: R,
        precision: Number(
          (K = m.precision) != null
            ? K
            : i == null
              ? void 0
              : i.numAttr(
                  s,
                  "media-precision",
                  (_ = A.mediaPrecision) != null ? _ : 3,
                ),
        ),
        pause: !!((U = m.pause) != null
          ? U
          : i != null &&
            i.attr(s, "media-pause", (B = A.mediaPause) != null ? B : !0)),
        onProgress: m.onProgress,
        frames: C ? { urls: E, first: r, last: a, step: l, fit: u } : null,
      };
    }
    function p(s, m, A) {
      const c = {
        el: s,
        ready: !1,
        disabled: !1,
        lastTime: null,
        targetTime: null,
        awaitingSeek: !1,
        pendingProgress: 0,
      };
      if (A)
        return (
          s.setAttribute("controls", ""),
          (c.disabled = !0),
          (c.update = (T) => {
            c.pendingProgress = T;
          }),
          (c.destroy = () => s.removeAttribute("controls")),
          c
        );
      if (m.pause) {
        try {
          s.pause();
        } catch {}
        ((s.autoplay = !1), s.removeAttribute("autoplay"));
      }
      function g(T) {
        if (((c.pendingProgress = T), c.disabled || !c.ready)) return;
        const R = s.duration;
        if (!isFinite(R) || R <= 0) return;
        const n = m.to - m.from,
          r = M(m.from + n * T, 0, 1) * R,
          a = Number(r.toFixed(m.precision));
        a !== c.lastTime &&
          ((c.lastTime = a), (c.targetTime = a), c.awaitingSeek || x());
      }
      function x() {
        const T = c.targetTime;
        if (
          ((c.targetTime = null),
          T === null || Math.abs(s.currentTime - T) < 0.001)
        )
          return;
        c.awaitingSeek = !0;
        const R = () => {
          (s.removeEventListener("seeked", R),
            (c.awaitingSeek = !1),
            c.targetTime !== null && x());
        };
        s.addEventListener("seeked", R);
        try {
          s.currentTime = T;
        } catch {
          c.awaitingSeek = !1;
        }
      }
      if (
        ((s.hasAttribute("preload") && s.preload === "none") ||
          (s.preload = "metadata"),
        (c.ready = s.readyState >= 1),
        !c.ready)
      ) {
        const T = () => {
          ((c.ready = !0),
            s.removeEventListener("loadedmetadata", T),
            g(c.pendingProgress));
        };
        s.addEventListener("loadedmetadata", T);
      }
      return (
        (c.update = (T) => g(T)),
        (c.remeasure = () => {
          ((c.ready = s.readyState >= 1), (c.lastTime = null));
        }),
        (c.destroy = () => {}),
        c
      );
    }
    function j(s, m, A) {
      const c = P(m.frames);
      if (!c || !c.length) return null;
      const g = c.length,
        x = new Array(g).fill(null),
        T = new Set(),
        R = s.getContext("2d"),
        n = m.frames.fit === "contain" ? "contain" : "cover",
        r = {
          el: s,
          ready: !1,
          disabled: A,
          lastIndex: -1,
          pendingProgress: 0,
          total: g,
        };
      let a = 0;
      function l(e, o) {
        s.dispatchEvent(new CustomEvent(e, { detail: o }));
      }
      function u(e) {
        return x[e] || T.has(e)
          ? Promise.resolve(!!x[e])
          : (T.add(e),
            new Promise((o) => {
              const f = new Image();
              f.decoding = "async";
              const L = (k) => {
                (T.delete(e),
                  k &&
                    ((x[e] = f),
                    a++,
                    l("emerge-media-progress", {
                      loaded: a,
                      total: g,
                      percent: Math.round((a / g) * 100),
                    })),
                  o(k));
              };
              ((f.onload = () => {
                f.decode
                  ? f
                      .decode()
                      .then(() => L(!0))
                      .catch(() => L(!0))
                  : L(!0);
              }),
                (f.onerror = () => L(!1)),
                (f.src = c[e]));
            }));
      }
      function E(e) {
        e < 0 && (e = 0);
        for (let o = 0; o < g; o++) {
          if (e - o >= 0 && x[e - o]) return x[e - o];
          if (e + o < g && x[e + o]) return x[e + o];
        }
        return null;
      }
      function C() {
        const e = s.clientWidth || s.width,
          o = s.clientHeight || s.height;
        e &&
          o &&
          (s.width !== e || s.height !== o) &&
          ((s.width = e), (s.height = o));
      }
      function I(e) {
        if (!e || !e.naturalWidth) return;
        C();
        const o = s.width,
          f = s.height,
          L =
            n === "contain"
              ? Math.min(o / e.naturalWidth, f / e.naturalHeight)
              : Math.max(o / e.naturalWidth, f / e.naturalHeight),
          k = e.naturalWidth * L,
          q = e.naturalHeight * L;
        (R.clearRect(0, 0, o, f),
          R.drawImage(e, (o - k) / 2, (f - q) / 2, k, q),
          (r.ready = !0));
      }
      function t(e) {
        if (((r.pendingProgress = e), r.disabled)) return;
        const o = M(Math.round(e * (g - 1)), 0, g - 1);
        (o === r.lastIndex && r.ready) ||
          ((r.lastIndex = o),
          x[o]
            ? I(x[o])
            : (I(E(o)),
              u(o).then((f) => {
                f && o === r.lastIndex && I(x[o]);
              })));
      }
      const v =
        typeof window.requestIdleCallback == "function"
          ? (e) => window.requestIdleCallback(e, { timeout: 300 })
          : (e) => setTimeout(() => e({ timeRemaining: () => 0 }), 60);
      function w(e, o, f) {
        o >= e.length ||
          v(() => {
            const L = e.slice(o, o + f);
            Promise.all(L.map(u)).finally(() => w(e, o + L.length, f));
          });
      }
      (function () {
        if (A) {
          const k = Math.floor((g - 1) / 2);
          return void u(k).then(() => {
            (I(x[k]), l("emerge-media-ready", {}));
          });
        }
        const e = g > 60 ? [10, 1] : [1],
          o = (function (k) {
            const q = [],
              W = new Set();
            return (
              k.forEach((X) => {
                for (let V = 0; V < g; V += X)
                  W.has(V) || (q.push(V), W.add(V));
              }),
              q
            );
          })(e),
          f = Math.max(1, Math.ceil(g / e[0])),
          L = o.slice(0, f).map(u);
        Promise.all(L).then(() => {
          (t(r.pendingProgress),
            l("emerge-media-ready", {}),
            w(o.slice(f), 0, 6));
        });
      })();
      let F = null;
      return (
        typeof ResizeObserver != "undefined" &&
          ((F = new ResizeObserver(() => {
            (C(), I(x[r.lastIndex] || E(r.lastIndex)));
          })),
          F.observe(s)),
        (r.update = (e) => t(e)),
        (r.remeasure = () => {
          (C(), I(x[r.lastIndex] || E(r.lastIndex)));
        }),
        (r.destroy = () => {
          F == null || F.disconnect();
        }),
        r
      );
    }
    function b(s, m = {}) {
      const A = z(s);
      if (!A) return null;
      d.has(A) && h(A);
      const c = y(A, m),
        g = (function (R, n) {
          if (n === "self") return O(R) ? [R] : [];
          let r = [];
          try {
            r = Array.from(R.querySelectorAll(n)).filter(O);
          } catch {
            r = [];
          }
          return r.length ? r : O(R) ? [R] : [];
        })(A, c.selector);
      if (!g.length) return null;
      const x = !(!i || !i.prefersReducedMotion()),
        T = g
          .map(
            (R) => (
              R !== A && (i == null || i.claim(R, "Media")),
              R.classList.add("emerge-media"),
              (function (n, r, a) {
                return H(n) && r.frames ? j(n, r, a) : Y(n) ? p(n, r, a) : null;
              })(R, c, x)
            ),
          )
          .filter(Boolean);
      return T.length
        ? (d.set(A, { el: A, elements: g, players: T, config: c, wired: !1 }),
          {
            media: T.length === 1 ? g[0] : g,
            restore: () => h(A),
            remeasure: () => S(A),
          })
        : null;
    }
    function h(s) {
      const m = z(s),
        A = m && d.get(m);
      A &&
        (A.players.forEach((c) => {
          var g;
          (c.el !== m && (i == null || i.release(c.el)),
            c.el.classList.remove("emerge-media"),
            (g = c.destroy) == null || g.call(c));
        }),
        d.delete(m));
    }
    function S(s) {
      var A;
      const m = z(s);
      (A = m && d.get(m)) == null ||
        A.players.forEach((c) => {
          var g;
          return (g = c.remeasure) == null ? void 0 : g.call(c);
        });
    }
    function $() {
      const s = i && i.range;
      s &&
        d.forEach((m, A) => {
          if (m.wired) return;
          const c = s.of(A)[0];
          if (!c) return;
          ((m.wired = !0), (c.cssFollow = !1));
          const g = c.onProgress;
          ((c.onProgress = (x) => {
            var T, R;
            (m.players.forEach((n) => n.update(x.progress)),
              (R = (T = m.config).onProgress) == null ||
                R.call(T, m.el, x.progress, m.elements),
              g == null || g(x));
          }),
            (c.painted = -1));
        });
    }
    function D(s = document) {
      s.querySelectorAll("[data-emerge-media]").forEach((m) => {
        d.has(m) || i.isDisabledFor(m, "media") || b(m);
      });
    }
    return {
      name: "Media",
      defaults: {
        mediaSelector: "video, audio, canvas",
        mediaFrom: 0,
        mediaTo: 1,
        mediaPrecision: 3,
        mediaPause: !0,
      },
      install: (s) => (
        (i = s),
        Object.getOwnPropertyDescriptor(i, "range") ||
          Object.defineProperty(i, "range", {
            configurable: !0,
            get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
          }),
        {
          scrub: b,
          restore: h,
          remeasure: S,
          remeasureAll: () => d.forEach((m, A) => S(A)),
          restoreAll: () => Array.from(d.keys()).forEach(h),
          of: (m) => {
            var A;
            return (A = d.get(z(m))) != null ? A : null;
          },
          get all() {
            return Array.from(d.values());
          },
        }
      ),
      hooks: {
        observe({ el: s }, m) {
          m.hasAttr(s, "media") && !m.isDisabledFor(s, "media") && b(s);
        },
        init() {
          (D(), $());
        },
        refresh() {
          (Array.from(d.keys())
            .filter(
              (s) => !document.body.contains(s) || i.isDisabledFor(s, "media"),
            )
            .forEach(h),
            D(),
            $(),
            d.forEach((s) => S(s.el)));
        },
        unobserve({ el: s }) {
          h(s);
        },
        teardown() {
          Array.from(d.keys()).forEach(h);
        },
      },
    };
});
