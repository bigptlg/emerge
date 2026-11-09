/*! Emerge.js v1.7.2 — plugin Range (global: EmergeRange) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeRange = d());
  })(this, function () {
    "use strict";
    const d = { top: 0, center: 0.5, middle: 0.5, bottom: 1 },
      M = {
        enter: "top@100%",
        entered: "bottom@100%",
        center: "center@50%",
        exit: "bottom@0%",
        exiting: "top@0%",
      },
      z = {
        x: "px",
        y: "px",
        z: "px",
        spin: "deg",
        tiltX: "deg",
        tiltY: "deg",
        scale: "",
        scaleX: "",
        scaleY: "",
      },
      Y = {
        x: (t) => `translateX(${t}px)`,
        y: (t) => `translateY(${t}px)`,
        z: (t) => `translateZ(${t}px)`,
        spin: (t) => `rotate(${t}deg)`,
        tiltX: (t) => `rotateX(${t}deg)`,
        tiltY: (t) => `rotateY(${t}deg)`,
        scale: (t) => `scale(${t})`,
        scaleX: (t) => `scaleX(${t})`,
        scaleY: (t) => `scaleY(${t})`,
      };
    let H = null;
    const O = new Set();
    let N = 0,
      P = 0,
      y = null,
      p = !0,
      j = !1;
    function b(t, v) {
      if (t == null || t === "") return 0;
      const w = String(t).trim();
      return Object.prototype.hasOwnProperty.call(d, w)
        ? d[w] * v
        : w.endsWith("%")
          ? (v * parseFloat(w)) / 100
          : parseFloat(w) || 0;
    }
    function h(t, v, w, F) {
      let e = String(t != null ? t : v).trim();
      M[e] && (e = M[e]);
      const [o, f] = e.split("@");
      return b(o, w) - b(f != null ? f : "100%", F);
    }
    function S(t) {
      const v = t.anchor.getBoundingClientRect(),
        w = v.top + window.scrollY,
        F = v.height,
        e = window.innerHeight;
      var o;
      ((t.from = w + h(t.fromSpec, "enter", F, e)),
        (t.to =
          typeof (o = t.toSpec) == "string" && /^[+-]\s*[\d.]+/.test(o.trim())
            ? t.from + parseFloat(String(t.toSpec).replace(/\s/g, ""))
            : w + h(t.toSpec, "exit", F, e)),
        t.to < t.from && (t.to = t.from),
        (t.span = Math.max(1, t.to - t.from)),
        t.debug &&
          (function (f) {
            if (!f.guides) {
              const L = f.id ? ` \xB7 ${f.id}` : "";
              f.guides = {
                from: $(`from${L}`, "#3ad29f"),
                to: $(`to${L}`, "#ff6b6b"),
              };
            }
            ((f.guides.from.style.top = `${f.from}px`),
              (f.guides.to.style.top = `${f.to}px`));
          })(t));
    }
    function $(t, v) {
      const w = document.createElement("div");
      return (
        (w.className = "emerge-guide"),
        (w.textContent = t),
        Object.assign(w.style, {
          position: "absolute",
          left: "0",
          width: "100%",
          borderTop: `1px dashed ${v}`,
          color: v,
          font: "11px/1.4 ui-monospace, Menlo, monospace",
          padding: "2px 4px",
          pointerEvents: "none",
          zIndex: "99999",
        }),
        document.body.appendChild(w),
        w
      );
    }
    function D(t) {
      t.shown ||
        ((t.shown = !0), t.el.classList.add(H.options.animatedClassName));
    }
    function s(t) {
      t.shown &&
        ((t.shown = !1), t.el.classList.remove(H.options.animatedClassName));
    }
    function m(t, v, w) {
      var F;
      ((F = t.onEdge) == null || F.call(t, { range: t, edge: v, direction: w }),
        t.follow === !1 &&
          (v === "from"
            ? w > 0
              ? D(t)
              : !t.once && s(t)
            : t.mirror && (w > 0 ? s(t) : D(t))));
    }
    function A(t, v) {
      const w =
        ((F = (N - t.from) / t.span), (o = 1), F < (e = 0) ? e : F > o ? o : F);
      var F, e, o;
      const f = t.target;
      ((t.target = w),
        (t.direction = w >= f ? 1 : -1),
        f <= 0 && w > 0 && m(t, "from", 1),
        f < 1 && w >= 1 && m(t, "to", 1),
        f >= 1 && w < 1 && m(t, "to", -1),
        f > 0 && w <= 0 && m(t, "from", -1));
      let L = !0;
      if (t.lag > 0) {
        const k = 1 - Math.exp(-v / (1e3 * t.lag));
        ((t.progress += (w - t.progress) * k),
          Math.abs(w - t.progress) < 5e-4 ? (t.progress = w) : (L = !1));
      } else t.progress = w;
      return (
        (function (k) {
          var W;
          const q = k.progress;
          q !== k.painted &&
            ((k.painted = q),
            k.cssFollow === null &&
              (k.cssFollow = k.el.hasAttribute("data-emerge")),
            k.el.style.setProperty("--emerge-progress", q.toFixed(4)),
            k.follow !== !1 &&
              k.cssFollow &&
              (k.el.style.animationDelay = -q * 1e3 + "ms"),
            (function (X, V) {
              X &&
                X.targets.forEach((_) => {
                  if (!_) return;
                  let K = "";
                  (X.props.forEach((B) => {
                    const U = B.a + (B.b - B.a) * V;
                    B.transform
                      ? (K += ` ${Y[B.name](U)}`)
                      : B.variable
                        ? _.style.setProperty(B.name, `${U}${B.unit}`)
                        : (_.style[B.name] = `${U}${B.unit}`);
                  }),
                    K && (_.style.transform = K.trim()));
                });
            })(k.motion, q),
            (W = k.onProgress) == null || W.call(k, k));
        })(t),
        L
      );
    }
    function c(t) {
      const v = Math.min(64, t - P || 16);
      ((P = t), (N = window.scrollY || window.pageYOffset));
      let w = !0;
      (O.forEach((F) => {
        F.paused || A(F, v) || (w = !1);
      }),
        !w || p ? ((p = !1), (y = requestAnimationFrame(c))) : (y = null));
    }
    function g() {
      ((p = !0),
        y === null &&
          ((P = performance.now()), (y = requestAnimationFrame(c))));
    }
    let x = null;
    function T() {
      (clearTimeout(x), (x = setTimeout(n, 100)));
    }
    function R() {
      j &&
        ((j = !1),
        window.removeEventListener("scroll", g),
        window.removeEventListener("resize", T),
        window.removeEventListener("orientationchange", T),
        y !== null && cancelAnimationFrame(y),
        (y = null));
    }
    function n() {
      (O.forEach(S), g());
    }
    function r(t) {
      return t
        ? document.querySelector(
            `[data-emerge-zone="${(function (v) {
              return typeof CSS != "undefined" && CSS.escape
                ? CSS.escape(v)
                : String(v).replace(/["\\]/g, "\\$&");
            })(t)}"]`,
          )
        : null;
    }
    function a(t) {
      return t ? (typeof t == "string" ? document.querySelector(t) : t) : null;
    }
    function l(t = {}) {
      var o, f, L, k, q, W, X, V, _, K;
      const v = a(t.on);
      if (!v) return null;
      const w = (function (B) {
          if (B == null || B === !1 || B === "false") return !1;
          if (B === !0 || B === "" || B === "true") return !0;
          const U = Number(B);
          return !!Number.isNaN(U) || U;
        })(t.follow),
        F = H ? H.options : {},
        e = {
          el: v,
          anchor: a(t.anchor) || v,
          id: (o = t.id) != null ? o : null,
          fromSpec:
            (L = (f = t.from) != null ? f : F.from) != null ? L : "enter",
          toSpec: (q = (k = t.to) != null ? k : F.to) != null ? q : "exit",
          follow: w,
          lag: typeof w == "number" ? Math.max(0, w) : 0,
          once: (X = (W = t.once) != null ? W : F.once) != null ? X : !1,
          mirror: (_ = (V = t.mirror) != null ? V : F.mirror) != null ? _ : !1,
          debug: !!((K = t.debug) != null ? K : F.debug),
          cssFollow: t.cssFollow !== !1 && null,
          onProgress: t.onProgress,
          onEdge: t.onEdge,
          progress: 0,
          target: 0,
          painted: -1,
          direction: 1,
          shown: !1,
          paused: !1,
          from: 0,
          to: 0,
          span: 1,
        };
      return (
        (e.motion = (function (B, U) {
          if (!B) return null;
          const Z = B.target;
          let ee;
          ee = Z
            ? typeof Z == "string"
              ? Array.from(document.querySelectorAll(Z))
              : Z instanceof Element
                ? [Z]
                : Array.from(Z)
            : [U];
          const J = [];
          return (
            Object.keys(B).forEach((G) => {
              var re;
              if (G === "target") return;
              const Q = B[G];
              if (!Array.isArray(Q)) return;
              const [ne, oe, te] = Q;
              J.push({
                name: G,
                a: Number(ne),
                b: Number(oe),
                unit:
                  (re = te != null ? te : z[G]) != null
                    ? re
                    : G.startsWith("--") || G === "opacity"
                      ? ""
                      : "px",
                transform: !!Y[G],
                variable: G.startsWith("--"),
              });
            }),
            J.length ? { targets: ee, props: J } : null
          );
        })(t.animate, v)),
        e.follow !== !1 &&
          e.cssFollow !== !1 &&
          (v.classList.add("emerge-follow"),
          v.style.setProperty("--emerge-clock", "1000ms")),
        (e.measure = () => {
          (S(e), g());
        }),
        (e.stop = () => u(e)),
        (e.pause = (B = !0) => {
          ((e.paused = B), B || g());
        }),
        O.add(e),
        S(e),
        j ||
          ((j = !0),
          window.addEventListener("scroll", g, { passive: !0 }),
          window.addEventListener("resize", T),
          window.addEventListener("orientationchange", T)),
        g(),
        e
      );
    }
    function u(t) {
      t &&
        (O.delete(t),
        (function (v) {
          v.guides &&
            (v.guides.from.remove(), v.guides.to.remove(), (v.guides = null));
        })(t),
        t.el.classList.remove("emerge-follow"),
        (t.el.style.animationDelay = ""),
        t.el.style.removeProperty("--emerge-progress"),
        O.size || R());
    }
    function E() {
      Array.from(O).forEach(u);
    }
    function C(t, v, w) {
      const F = w.attr(t, "in", null),
        e = F ? r(F) : null;
      return l({
        on: t,
        anchor: e,
        from: w.attr(t, "from", e ? w.attr(e, "from", void 0) : void 0),
        to: w.attr(t, "to", e ? w.attr(e, "to", void 0) : void 0),
        follow: w.attr(t, "follow", void 0),
        debug: w.attr(
          t,
          "debug",
          e ? w.attr(e, "debug", w.options.debug) : w.options.debug,
        ),
        once: v == null ? void 0 : v.once,
        mirror: v == null ? void 0 : v.mirror,
        id: v == null ? void 0 : v.id,
      });
    }
    function I(t = document) {
      t.querySelectorAll(
        "[data-emerge-from], [data-emerge-to], [data-emerge-follow], [data-emerge-in]",
      ).forEach((v) => {
        var F;
        if (
          Array.from(O).some((e) => e.el === v) ||
          H.isDisabledFor(v, "range")
        )
          return;
        const w = (F = H.registry.get(v)) == null ? void 0 : F.opts;
        C(v, w, H);
      });
    }
    return {
      name: "Range",
      defaults: { follow: !1, from: "enter", to: "exit", debug: !1 },
      install: (t) => (
        (H = t),
        {
          watch: l,
          stop: u,
          stopAll: E,
          of: (v) => {
            const w = a(v);
            return Array.from(O).filter((F) => F.el === w);
          },
          measure: n,
          get all() {
            return Array.from(O);
          },
          zoneNamed: r,
          point: b,
          CLOCK: 1e3,
        }
      ),
      hooks: {
        observe({ el: t, opts: v }, w) {
          (function (e, o) {
            return !!(
              o.attr(e, "in", null) ||
              o.hasAttr(e, "from") ||
              o.hasAttr(e, "to") ||
              o.hasAttr(e, "follow")
            );
          })(t, w) &&
            (w.isDisabledFor(t, "range") || (w.claim(t, "Range"), C(t, v, w)));
        },
        unobserve({ el: t }) {
          Array.from(O)
            .filter((v) => v.el === t)
            .forEach(u);
        },
        init() {
          (I(), n());
        },
        refresh() {
          (Array.from(O)
            .filter(
              (t) =>
                !document.body.contains(t.el) || H.isDisabledFor(t.el, "range"),
            )
            .forEach(u),
            I(),
            n());
        },
        teardown() {
          (E(), R());
        },
      },
    };
});
