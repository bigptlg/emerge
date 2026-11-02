/*! Emerge.js v1.0.0 — bundle: core + Range, Draw, Horizontal, Media, Stack, Text, Spotlight plugins + CSS auto-loader */ ((function (
  i,
  d,
) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = d())
    : typeof define == "function" && define.amd
      ? define(d)
      : (i.Emerge = d());
})(this, function () {
  "use strict";
  const i = "1.0.0",
    d = {
      offset: 120,
      delay: 0,
      easing: "ease",
      duration: 400,
      disable: !1,
      once: !1,
      mirror: !1,
      anchorPlacement: "top-bottom",
      animatedClassName: "emerge-animate",
      initClassName: "emerge-init",
      useClassNames: !0,
      disableMutationObserver: !1,
      resizeDebounce: 80,
      respectReducedMotion: !0,
    };
  let M = { ...d },
    z = { ...M };
  const Y = new Map(),
    H = new Map(),
    O = new WeakMap();
  let N = null,
    P = !1;
  const y = (e) =>
      e.test(navigator.userAgent || navigator.vendor || window.opera || ""),
    p = {
      phone: () =>
        y(
          /iphone|ipod|android.*mobile|windows phone|blackberry|bb10|iemobile/i,
        ),
      tablet: () => y(/ipad|android(?!.*mobile)|tablet|kindle|playbook/i),
      mobile: () => p.phone() || p.tablet(),
    };
  function j() {
    return !(
      !window.matchMedia ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }
  const b = /^(min|max)@(\d+)(?:px)?$/i;
  function h(e) {
    const o = b.exec(String(e).trim());
    if (!o) return !1;
    const f = o[1].toLowerCase(),
      L = Number(o[2]),
      k = window.innerWidth;
    return f === "min" ? k >= L : k <= L;
  }
  function S(e, o) {
    let f;
    return (...L) => {
      (clearTimeout(f), (f = setTimeout(() => e(...L), o)));
    };
  }
  function $(e, o) {
    document.dispatchEvent(new CustomEvent(e, { detail: o, bubbles: !0 }));
  }
  function D(e, o, f) {
    const L = e.getAttribute(`data-emerge-${o}`);
    return L === null ? f : L === "" || L === "true" || (L !== "false" && L);
  }
  function s(e, o, f) {
    const L = D(e, o, f),
      k = Number(L);
    return Number.isNaN(k) ? f : k;
  }
  const m = {
    linear: "cubic-bezier(.25,.25,.75,.75)",
    ease: "ease",
    "ease-in": "ease-in",
    "ease-out": "ease-out",
    "ease-in-out": "ease-in-out",
    "ease-in-back": "cubic-bezier(.6,-.28,.735,.045)",
    "ease-out-back": "cubic-bezier(.175,.885,.32,1.275)",
    "ease-in-out-back": "cubic-bezier(.68,-.55,.265,1.55)",
    "ease-in-sine": "cubic-bezier(.47,0,.745,.715)",
    "ease-out-sine": "cubic-bezier(.39,.575,.565,1)",
    "ease-in-out-sine": "cubic-bezier(.445,.05,.55,.95)",
    "ease-in-quad": "cubic-bezier(.55,.085,.68,.53)",
    "ease-out-quad": "cubic-bezier(.25,.46,.45,.94)",
    "ease-in-out-quad": "cubic-bezier(.455,.03,.515,.955)",
    "ease-in-cubic": "cubic-bezier(.55,.085,.68,.53)",
    "ease-out-cubic": "cubic-bezier(.25,.46,.45,.94)",
    "ease-in-out-cubic": "cubic-bezier(.455,.03,.515,.955)",
    "ease-in-quart": "cubic-bezier(.55,.085,.68,.53)",
    "ease-out-quart": "cubic-bezier(.25,.46,.45,.94)",
    "ease-in-out-quart": "cubic-bezier(.455,.03,.515,.955)",
  };
  function A(e) {
    return m[e] || e;
  }
  const c = new Map();
  function g(e, o) {
    c.forEach((f) => {
      const L = f.hooks && f.hooks[e];
      if (typeof L == "function")
        try {
          L.call(f, o, R);
        } catch {}
    });
  }
  function x(e) {
    return O.has(e);
  }
  function T(e) {
    O.delete(e);
  }
  const R = {
      version: i,
      get options() {
        return z;
      },
      get defaults() {
        return M;
      },
      get started() {
        return P;
      },
      registry: Y,
      attr: D,
      numAttr: s,
      hasAttr: function (e, o) {
        return e.hasAttribute(`data-emerge-${o}`);
      },
      dispatch: $,
      debounce: S,
      resolveEasing: A,
      device: p,
      prefersReducedMotion: j,
      isDisabledFor: function (e, o) {
        if (!e || !o) return !1;
        if (
          (e.hasAttribute(`data-emerge-${o}-disable-mobile`) && p.mobile()) ||
          (e.hasAttribute(`data-emerge-${o}-disable-desktop`) && !p.mobile()) ||
          (e.hasAttribute(`data-emerge-${o}-disable-tablet`) && p.tablet()) ||
          (e.hasAttribute(`data-emerge-${o}-disable-phone`) && p.phone())
        )
          return !0;
        const f = e.getAttribute(`data-emerge-${o}-disable-size`);
        if (
          f &&
          f
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
            .some(h)
        )
          return !0;
        const L = D(e, `${o}-disable`, !1);
        return (
          L === !0 ||
          (L === "mobile"
            ? p.mobile()
            : L === "tablet"
              ? p.tablet()
              : L === "phone"
                ? p.phone()
                : L === "desktop" && !p.mobile())
        );
      },
      claim: function (e, o) {
        O.set(e, o || !0);
      },
      isClaimed: x,
      release: T,
      utils: {
        clamp: (e, o, f) => (e < o ? o : e > f ? f : e),
        lerp: (e, o, f) => e + (o - e) * f,
      },
      addAnimatedClass: (e) => e.classList.add(z.animatedClassName),
      removeAnimatedClass: (e) => e.classList.remove(z.animatedClassName),
    },
    n = { top: 0, center: 0.5, bottom: 1 };
  function r(e, o, f) {
    var B, U;
    const [L, k] = String(o).split("-"),
      q = (B = n[L]) != null ? B : 0,
      W = (U = n[k]) != null ? U : 1,
      X = window.innerHeight,
      V = e.getBoundingClientRect().height,
      _ = X * W - f,
      K = Math.max(0, X - _ + V * q);
    return `0px 0px -${Math.round(K)}px 0px`;
  }
  function a(e) {
    const { el: o, opts: f } = e,
      L = [f.animatedClassName];
    return (
      f.useClassNames &&
        L.push(
          ...(function (k) {
            const q = k.getAttribute("data-emerge");
            return q ? q.split(/\s+/).filter(Boolean) : [];
          })(o),
        ),
      L
    );
  }
  function l(e) {
    if (H.has(e)) return H.get(e);
    const o = new IntersectionObserver(
      (f) => {
        f.forEach((L) => {
          const k = Y.get(L.target);
          k &&
            (L.isIntersecting
              ? ((function (q) {
                  if (q.animated) return;
                  const { el: W, opts: X } = q;
                  (a(q).forEach((V) => W.classList.add(V)),
                    (q.animated = !0),
                    $("emerge:in", W),
                    X.id && $(`emerge:in:${X.id}`, W),
                    g("in", q));
                })(k),
                (k.everIntersected = !0))
              : k.animated &&
                !k.opts.once &&
                (k.opts.mirror || k.everIntersected) &&
                (function (q) {
                  if (!q.animated) return;
                  const { el: W } = q;
                  (a(q).forEach((X) => W.classList.remove(X)),
                    (q.animated = !1),
                    $("emerge:out", W),
                    g("out", q));
                })(k));
        });
      },
      { root: null, rootMargin: e, threshold: 0 },
    );
    return (H.set(e, o), o);
  }
  function u(e) {
    if (Y.has(e) || x(e)) return;
    const o = (function (W) {
      return {
        offset: s(W, "offset", z.offset),
        delay: s(W, "delay", z.delay),
        duration: s(W, "duration", z.duration),
        easing: D(W, "easing", z.easing),
        once: D(W, "once", z.once),
        mirror: D(W, "mirror", z.mirror),
        anchorPlacement: D(W, "anchor-placement", z.anchorPlacement),
        id: D(W, "id", null),
        animatedClassName: z.animatedClassName,
        useClassNames: D(W, "classnames", z.useClassNames),
      };
    })(e);
    if (
      (z.initClassName && e.classList.add(z.initClassName),
      e.style.setProperty("--emerge-duration", `${o.duration}ms`),
      e.style.setProperty("--emerge-delay", `${o.delay}ms`),
      e.style.setProperty("--emerge-easing", A(o.easing)),
      g("observe", { el: e, opts: o }),
      x(e))
    )
      return;
    const f = D(e, "anchor", null),
      L = (f ? document.querySelector(f) : e) || e,
      k = l(r(L, o.anchorPlacement, o.offset)),
      q = {
        el: e,
        opts: o,
        animated: !1,
        everIntersected: !1,
        io: k,
        observedNode: L,
      };
    (Y.set(L, q), L !== e && Y.set(e, q), k.observe(L));
  }
  function E(e) {
    (g("unobserve", { el: e }), T(e));
    const o = Y.get(e);
    o &&
      (o.io.unobserve(o.observedNode),
      Y.delete(e),
      o.observedNode !== e && Y.delete(o.observedNode));
  }
  function C(e = document) {
    e.querySelectorAll("[data-emerge]").forEach(u);
  }
  function I() {
    (H.forEach((e) => e.disconnect()),
      H.clear(),
      Array.from(new Set(Y.values())).forEach((e) => {
        const o = l(r(e.observedNode, e.opts.anchorPlacement, e.opts.offset));
        ((e.io = o), o.observe(e.observedNode));
      }));
  }
  let t = S(() => {
    P && (I(), g("refresh", { reason: "resize" }));
  }, d.resizeDebounce);
  function v() {
    (g("teardown", {}),
      H.forEach((e) => e.disconnect()),
      H.clear(),
      Y.forEach((e) => {
        (e.el.removeAttribute("data-emerge"),
          z.initClassName && e.el.classList.remove(z.initClassName),
          z.animatedClassName && e.el.classList.remove(z.animatedClassName));
      }),
      Y.clear(),
      N == null || N.disconnect(),
      (N = null),
      window.removeEventListener("resize", t),
      window.removeEventListener("orientationchange", t),
      (P = !1));
  }
  function w(e = {}) {
    return (
      (z = { ...M, ...e }),
      (o = z.disable) === !0 ||
      (o === "mobile"
        ? p.mobile()
        : o === "phone"
          ? p.phone()
          : o === "tablet"
            ? p.tablet()
            : typeof o == "function"
              ? o()
              : z.respectReducedMotion && j())
        ? (v(), [])
        : ((t = S(() => {
            P && (I(), g("refresh", { reason: "resize" }));
          }, z.resizeDebounce)),
          C(),
          z.disableMutationObserver ||
            N ||
            ((N = new MutationObserver((f) => {
              for (const L of f)
                (L.addedNodes.forEach((k) => {
                  var q, W;
                  // ignora nós gerados pelo split (já "claimed" pelo plugin Text)
                  if (
                    k.nodeType === 1 &&
                    k.classList &&
                    (k.classList.contains("emerge-word") ||
                      k.classList.contains("emerge-part"))
                  )
                    return;
                  k.nodeType === 1 &&
                    ((q = k.matches) != null &&
                      q.call(k, "[data-emerge]") &&
                      u(k),
                    (W = k.querySelectorAll) == null ||
                      W.call(k, "[data-emerge]").forEach(u));
                }),
                  L.removedNodes.forEach((k) => {
                    var q, W;
                    k.nodeType === 1 &&
                      ((q = k.matches) != null &&
                        q.call(k, "[data-emerge]") &&
                        E(k),
                      (W = k.querySelectorAll) == null ||
                        W.call(k, "[data-emerge]").forEach(E));
                  }));
            })),
            N.observe(document.body, { childList: !0, subtree: !0 })),
          window.addEventListener("resize", t),
          window.addEventListener("orientationchange", t),
          (P = !0),
          g("init", { options: z }),
          Array.from(new Set(Y.values())).map((f) => f.el))
    );
    var o;
  }
  const F = {
    version: i,
    init: w,
    refresh: function () {
      P && (C(), I(), g("refresh", { reason: "manual" }));
    },
    refreshHard: function () {
      const e = { ...z };
      (v(), w(e));
    },
    destroy: v,
    addPlugin: function (...e) {
      return (
        e.flat().forEach((o) => {
          if (o && o.name && !c.has(o.name)) {
            (c.set(o.name, o),
              o.defaults &&
                ((M = { ...M, ...o.defaults }), (z = { ...o.defaults, ...z })));
            try {
              const f = o.install && o.install(R);
              f && (F[o.name] = f);
            } catch {}
            P && g("init", { late: o.name });
          }
        }),
        F
      );
    },
    getPlugin: (e) => c.get(e),
    get plugins() {
      return Array.from(c.keys());
    },
    core: R,
  };
  return F;
}),
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
  }),
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
  }),
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
  }),
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
  }),
  (function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeStack = d());
  })(this, function () {
    "use strict";
    let i = null;
    const d = new Map(),
      M = (N, P, y) => (N < P ? P : N > y ? y : N);
    function z(N) {
      var s, m, A;
      if (d.has(N)) return d.get(N);
      const P = (function (c) {
        return Array.from(c.children).filter(
          (g) =>
            g.nodeType === 1 && !g.hasAttribute("data-emerge-stack-exclude"),
        );
      })(N);
      if (P.length < 2) return null;
      const y = i.numAttr(
          N,
          "stack-step",
          (s = i.options.stackStep) != null ? s : 100,
        ),
        p = i.attr(
          N,
          "stack-transition",
          (m = i.options.stackTransition) != null ? m : "fade",
        ),
        j = i.attr(
          N,
          "stack-scrub",
          (A = i.options.stackScrub) != null ? A : !1,
        ),
        b = i.attr(N, "stack-sticky", !0),
        h = i.attr(N, "stack-top", "0px"),
        S = i.attr(N, "stack-loop", !1),
        $ = (function (c) {
          const g = c.parentElement;
          if (
            g &&
            g.classList.contains("emerge-stack-space") &&
            g.dataset.emergeStackSpaceFor === ""
          )
            return g;
          const x = document.createElement("div");
          return (
            (x.className = "emerge-stack-space"),
            g.insertBefore(x, c),
            x.appendChild(c),
            x
          );
        })(N);
      (($.dataset.emergeStackSpaceFor = ""),
        ($.style.height = `calc(100vh + ${(P.length - 1) * y}vh)`),
        N.classList.add("emerge-stack"),
        b && ((N.style.position = "sticky"), (N.style.top = h)),
        N.style.setProperty("--emerge-stack-count", P.length),
        P.forEach((c, g) => {
          (c.classList.add("emerge-stack-item", p),
            c.style.setProperty("--emerge-stack-i", g),
            i.claim(c, "Stack"));
        }),
        P[0].classList.add("emerge-active"));
      const D = {
        el: N,
        spacer: $,
        panels: P,
        step: y,
        transition: p,
        scrub: j,
        loop: S,
        active: 0,
        range: null,
      };
      return (
        d.set(N, D),
        (function (c) {
          const g = i.range;
          if (!g) return;
          const x = c.panels.length - 1;
          c.range = g.watch({
            on: c.spacer,
            from: "top@0%",
            to: "bottom@100%",
            follow: !0,
            cssFollow: !1,
            onProgress(T) {
              const R = M(T.progress, 0, 1) * x,
                n = M(Math.floor(R), 0, x - 1),
                r = M(R - n, 0, 1);
              (c.el.style.setProperty(
                "--emerge-stack-progress",
                (R / x).toFixed(4),
              ),
                c.el.style.setProperty("--emerge-stack-local", r.toFixed(4)),
                c.scrub
                  ? (function (a, l, u) {
                      (a.panels.forEach((E, C) => {
                        let I = 0;
                        (C === l ? (I = 1 - u) : C === l + 1 && (I = u),
                          (E.style.opacity = I),
                          E.classList.toggle("emerge-active", I > 0.001));
                      }),
                        (a.active = u < 0.5 ? l : l + 1));
                    })(c, n, r)
                  : (function (a, l) {
                      ((l = M(l, 0, a.panels.length - 1)),
                        !(
                          a.active === l &&
                          a.panels[l].classList.contains("emerge-active")
                        ) &&
                          (a.panels.forEach((u) =>
                            u.classList.remove("emerge-active"),
                          ),
                          a.panels[l].classList.add("emerge-active"),
                          (a.active = l),
                          a.el.style.setProperty("--emerge-stack-index", l),
                          i.dispatch("emerge:stack:change", {
                            el: a.el,
                            panel: a.panels[l],
                            index: l,
                          })));
                    })(c, r < 0.5 ? n : n + 1));
            },
          });
        })(D),
        i.dispatch("emerge:stack:build", { el: N, panels: P }),
        D
      );
    }
    function Y(N, P) {
      const y = typeof N == "string" ? document.querySelector(N) : N,
        p = y && d.get(y);
      if (!p || !p.range) return;
      const j = p.panels.length - 1,
        b = M(P, 0, j) / j,
        h = p.range.from + b * p.range.span;
      window.scrollTo({ top: h, behavior: "smooth" });
    }
    function H(N) {
      var y;
      const P =
        typeof N == "string" ? d.get(document.querySelector(N)) : d.get(N);
      P &&
        ((y = P.range) == null || y.stop(),
        P.panels.forEach((p) => {
          (p.classList.remove(
            "emerge-stack-item",
            P.transition,
            "emerge-active",
          ),
            (p.style.opacity = ""),
            p.style.removeProperty("--emerge-stack-i"),
            i.release(p));
        }),
        P.el.classList.remove("emerge-stack"),
        (P.el.style.position = ""),
        (P.el.style.top = ""),
        P.el.style.removeProperty("--emerge-stack-count"),
        P.el.style.removeProperty("--emerge-stack-progress"),
        P.el.style.removeProperty("--emerge-stack-local"),
        P.el.style.removeProperty("--emerge-stack-index"),
        (function (p, j) {
          if (!p || !p.classList.contains("emerge-stack-space")) return;
          const b = p.parentElement;
          b && (b.insertBefore(j, p), p.remove());
        })(P.spacer, P.el),
        d.delete(P.el));
    }
    function O(N = document) {
      N.querySelectorAll("[data-emerge-stack]").forEach((P) => {
        d.has(P) || i.isDisabledFor(P, "stack") || z(P);
      });
    }
    return {
      name: "Stack",
      defaults: { stackStep: 100, stackTransition: "fade", stackScrub: !1 },
      install: (N) => (
        (i = N),
        Object.defineProperty(i, "range", {
          configurable: !0,
          get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
        }),
        {
          build: z,
          destroy: H,
          goTo: Y,
          scan: O,
          of: (P) => {
            const y = typeof P == "string" ? document.querySelector(P) : P;
            return d.get(y) || null;
          },
          get all() {
            return Array.from(d.values());
          },
        }
      ),
      hooks: {
        observe({ el: N }, P) {
          P.hasAttr(N, "stack") &&
            (P.isDisabledFor(N, "stack") || (P.claim(N, "Stack"), z(N)));
        },
        init() {
          O();
        },
        refresh() {
          (Array.from(d.keys())
            .filter(
              (N) => !document.body.contains(N) || i.isDisabledFor(N, "stack"),
            )
            .forEach(H),
            O(),
            d.forEach((N) => {
              var P;
              return (P = N.range) == null ? void 0 : P.measure();
            }));
        },
        teardown() {
          Array.from(d.keys()).forEach(H);
        },
      },
    };
  }),
  (function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeText = d());
  })(this, function () {
    "use strict";
    let i = null;
    const d = new Map(),
      M = (b, h, S) => (b < h ? h : b > S ? S : b);
    function z(b, h) {
      const S = document.createElement("span");
      return (
        (S.className = b),
        S.setAttribute("aria-hidden", "true"),
        h != null && (S.textContent = h),
        S
      );
    }
    // Templates clonados em vez de createElement + setAttribute por caractere.
    // Os chars ficam dentro de .emerge-word[aria-hidden], por isso não precisam
    // de aria-hidden próprio.
    let wordTpl = null,
      charTpl = null;
    function Y(b, h, S, $) {
      wordTpl ||
        ((wordTpl = z("emerge-word")),
        (charTpl = document.createElement("span")),
        (charTpl.className = "emerge-part emerge-char"));
      Array.from(b.childNodes).forEach((D) => {
        if (D.nodeType === 3) {
          const s = D.textContent.split(/(\s+)/),
            m = document.createDocumentFragment();
          s.forEach((A) => {
            if (!A) return;
            if (/^\s+$/.test(A)) {
              m.appendChild(document.createTextNode(A));
              return;
            }
            const c = wordTpl.cloneNode(!1);
            if (h === "chars") {
              for (const g of A) {
                const x = charTpl.cloneNode(!1);
                x.textContent = g;
                $.push(x);
                c.appendChild(x);
              }
            } else {
              c.classList.add("emerge-part");
              c.textContent = A;
            }
            S.push(c);
            m.appendChild(c);
          });
          D.parentNode.replaceChild(m, D);
        } else D.nodeType === 1 && Y(D, h, S, $);
      });
    }
    function H(b, h = {}) {
      const S = typeof b == "string" ? document.querySelector(b) : b;
      if (!S) return null;
      d.has(S) && O(S);
      const $ = (function (n, r = {}) {
          var l, u, E, C, I, t, v, w, F, e;
          const a = i ? i.options : {};
          return {
            by:
              (u = r.by) != null
                ? u
                : i == null
                  ? void 0
                  : i.attr(n, "split", (l = a.splitBy) != null ? l : "chars"),
            step: Number(
              (C = r.step) != null
                ? C
                : i == null
                  ? void 0
                  : i.numAttr(n, "step", (E = a.step) != null ? E : 35),
            ),
            order:
              (t = r.order) != null
                ? t
                : i == null
                  ? void 0
                  : i.attr(n, "order", (I = a.order) != null ? I : "forward"),
            spread: Number(
              (w = r.spread) != null
                ? w
                : i == null
                  ? void 0
                  : i.numAttr(n, "spread", (v = a.spread) != null ? v : 0.6),
            ),
            animation:
              (e =
                (F = r.animation) != null
                  ? F
                  : n.getAttribute("data-emerge")) != null
                ? e
                : null,
            delay:
              Number(
                r.delay != null
                  ? r.delay
                  : i
                    ? i.numAttr(n, "text-delay", 0)
                    : 0,
              ) || 0,
          };
        })(S, h),
        D = ["chars", "words", "lines"].includes($.by) ? $.by : "chars",
        s = S.innerHTML,
        m = S.textContent.replace(/\s+/g, " ").trim(),
        A = [],
        c = [];
      let g;
      (Y(S, D === "chars" ? "chars" : "words", A, c),
        (g =
          D === "chars"
            ? c
            : D === "words"
              ? A
              : (function (n, r) {
                  if (r.some((E) => E.parentNode !== n)) return null;
                  const a = [];
                  let l = null,
                    u = null;
                  return (
                    r.forEach((E) => {
                      const C = Math.round(E.offsetTop);
                      ((u === null || Math.abs(C - u) > 2) &&
                        ((l = { top: C, nodes: [] }), a.push(l), (u = C)),
                        l.nodes.push(E));
                    }),
                    a.map((E) => {
                      const C = z("emerge-part emerge-line");
                      n.insertBefore(C, E.nodes[0]);
                      let I = E.nodes[0];
                      const t = E.nodes[E.nodes.length - 1];
                      for (; I; ) {
                        const v = I === t ? null : I.nextSibling;
                        (C.appendChild(I), (I = v));
                      }
                      return C;
                    })
                  );
                })(S, A) || A),
        m && S.setAttribute("aria-label", m),
        S.classList.add("emerge-split"),
        S.setAttribute("data-emerge-parts", g.length));
      const x = $.animation;
      x && S.removeAttribute("data-emerge");
      const T = (function (n, r) {
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
      })(g.length, $.order);
      g.forEach((n, r) => {
        (i == null || i.claim(n, "Text"),
          (n.style.cssText = `--emerge-index:${T[r]};--emerge-delay:${T[r] * $.step + $.delay}ms`),
          x && n.setAttribute("data-emerge", x));
      });
      const R = {
        html: s,
        label: m,
        parts: g,
        by: D,
        config: $,
        stagger: T,
        animation: x,
        followed: !1,
      };
      return (d.set(S, R), { parts: g, by: D, restore: () => O(S) });
    }
    function O(b) {
      const h = typeof b == "string" ? document.querySelector(b) : b,
        S = h && d.get(h);
      S &&
        ((h.innerHTML = S.html),
        h.classList.remove("emerge-split"),
        h.removeAttribute("aria-label"),
        h.removeAttribute("data-emerge-parts"),
        S.animation && h.setAttribute("data-emerge", S.animation),
        d.delete(h));
    }
    function N(b) {
      const h = d.get(b);
      if (!h || h.followed) return;
      const S = i.options.animatedClassName;
      h.parts.forEach(($) => $.classList.add(S));
    }
    function P(b) {
      const h = d.get(b);
      if (!h || h.followed) return;
      const S = i.options.animatedClassName;
      h.parts.forEach(($) => $.classList.remove(S));
    }
    function y() {
      const b = i && i.range;
      b &&
        d.forEach((h, S) => {
          if (h.wired) return;
          const $ = b.of(S)[0];
          $ &&
            ((h.wired = !0),
            $.follow !== !1
              ? (function (D, s) {
                  const m = d.get(D);
                  if (!m) return;
                  const A = m.parts.length,
                    c = M(m.config.spread, 0, 0.95),
                    g = 1 - c;
                  ((m.followed = !0),
                    m.parts.forEach((x) => {
                      (x.classList.add("emerge-follow"),
                        x.style.setProperty("--emerge-clock", "1000ms"),
                        x.style.removeProperty("--emerge-delay"));
                    }),
                    (s.cssFollow = !1),
                    (s.onProgress = (x) => {
                      const T = x.progress;
                      for (let R = 0; R < A; R++) {
                        const n = A > 1 ? (m.stagger[R] / (A - 1)) * c : 0,
                          r = M((T - n) / g, 0, 1);
                        m.parts[R].style.animationDelay = 1e3 * -r + "ms";
                      }
                    }),
                    (s.painted = -1));
                })(S, $)
              : (function (D, s) {
                  const m = s.onEdge;
                  s.onEdge = (A) => {
                    (A.edge === "from"
                      ? A.direction > 0
                        ? N(D)
                        : s.once || P(D)
                      : s.mirror && (A.direction > 0 ? P(D) : N(D)),
                      m == null || m(A));
                  };
                })(S, $));
        });
    }
    function p(b = document) {
      b.querySelectorAll("[data-emerge-split]").forEach((h) => {
        d.has(h) || i.isDisabledFor(h, "split") || H(h);
      });
    }
    let j = typeof window != "undefined" ? window.innerWidth : 0;
    return {
      name: "Text",
      defaults: { splitBy: "chars", step: 35, order: "forward", spread: 0.6 },
      install: (b) => (
        (i = b),
        Object.defineProperty(i, "range", {
          configurable: !0,
          get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
        }),
        {
          split: H,
          restore: O,
          parts: (h) => {
            var S, $;
            return ($ =
              (S = d.get(
                typeof h == "string" ? document.querySelector(h) : h,
              )) == null
                ? void 0
                : S.parts) != null
              ? $
              : [];
          },
          restoreAll: () => Array.from(d.keys()).forEach(O),
        }
      ),
      hooks: {
        observe({ el: b }, h) {
          h.hasAttr(b, "split") && (h.isDisabledFor(b, "split") || H(b));
        },
        init() {
          (p(), y());
        },
        in({ el: b }) {
          N(b);
        },
        out({ el: b }) {
          P(b);
        },
        refresh({ reason: b }) {
          (Array.from(d.keys())
            .filter(
              (h) => !document.body.contains(h) || i.isDisabledFor(h, "split"),
            )
            .forEach(O),
            p(),
            b === "resize" &&
              window.innerWidth !== j &&
              ((j = window.innerWidth),
              Array.from(d.entries())
                .filter(([, h]) => h.by === "lines")
                .forEach(([h, S]) => {
                  const $ = { ...S.config };
                  (O(h), H(h, $));
                })),
            y());
        },
        unobserve({ el: b }) {
          O(b);
        },
        teardown() {
          Array.from(d.keys()).forEach(O);
        },
      },
    };
  }),
  (function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeSpotlight = d());
  })(this, function () {
    "use strict";

    /* ------------------------------------------------------------------
     * Emerge Spotlight — pointer-following circular / elliptical spotlight.
     *
     *   data-emerge-spotlight="reveal"       top layer visible inside the spot
     *   data-emerge-spotlight="flashlight"   content darkened outside the spot
     *   data-emerge-spotlight="focus"        content blurred / dimmed outside
     *
     * All three modes share one engine: per-instance state (position,
     * visibility) is eased by a single shared requestAnimationFrame loop and
     * written to CSS custom properties (--emerge-spotlight-*) on the host.
     * The visuals themselves are pure CSS (radial-gradient + mask), see the
     * "Emerge Spotlight" section of emerge.css.
     *
     * Reveal framing: data-emerge-spotlight-fit="cover | contain" (default
     * cover). The CSS gives the base media and the layers one shared frame and
     * one object-fit, so they always line up; this option only chooses the fit.
     *
     * Shapes: data-emerge-spotlight-shape="circle | ellipse | square | rect |
     * rounded | diamond | hexagon | triangle | star | heart | fluid" (default
     * circle).
     * circle / ellipse use a radial-gradient mask; every other shape is an SVG
     * mask image generated here (one data URI per instance, regenerated only
     * when the shape or the softness change) so all of them share the same
     * radius, soft edge, reverse / persist behaviour and animation.
     * data-emerge-spotlight-ratio (height / width, default 0.6) applies to
     * ellipse and rect; the other shapes keep their natural proportions.
     *
     * Fluid: shape="fluid" replaces the geometric spot with a liquid trail. A
     * small stable-fluids solver (coarse grid, plain JS, no WebGL) is stirred
     * by the pointer; its density becomes the mask, so the trail swirls, merges
     * and dissolves by itself. Works in reveal / flashlight / focus and with
     * reverse. `radius` is the size of the blob, `softness` the edge of the
     * liquid, and two extra options tune it:
     *   data-emerge-spotlight-trail="1.2"   seconds the trail takes to dissolve
     *   data-emerge-spotlight-swirl="1"     how strongly the pointer stirs it
     *   data-emerge-spotlight-wobble="1"    idle liquid motion while the pointer
     *                                       is still (0 = off, up to 3)
     *
     * Touch / pen: only Pointer Events are used (no separate mouse / touch
     * listeners, so nothing fires twice). Without help, the browser takes over
     * a touch drag to scroll the page and sends `pointercancel`, which hides
     * the spot. data-emerge-spotlight-touch chooses how the gesture is shared
     * between the spot and the page (applied through `touch-action` on the
     * host only, never on the document):
     *
     *   track    (default) the finger drives the spot; pinch-zoom still works,
     *            the page does not pan when a touch starts on the host
     *   pan-y    vertical swipes scroll the page, horizontal drags drive the spot
     *   pan-x    horizontal swipes scroll, vertical drags drive the spot
     *   scroll   native scrolling untouched; the spot shows while the finger is
     *            down and hides when the browser starts scrolling
     *   off      touch is ignored (mouse and pen keep working)
     *
     * While a finger / pen is down, text selection, the long-press callout /
     * context menu on media and native image dragging are suppressed on the
     * host (links, buttons and form controls keep working).
     * ------------------------------------------------------------------ */
    const SELECTOR = "[data-emerge-spotlight]",
      LAYER_SELECTOR = "[data-emerge-spotlight-layer]",
      MODES = ["reveal", "flashlight", "focus"],
      SHAPES = [
        "circle",
        "ellipse",
        "square",
        "rect",
        "rounded",
        "diamond",
        "hexagon",
        "triangle",
        "star",
        "heart",
        "fluid",
      ],
      TRIGGERS = ["pointer", "hover", "manual"],
      FITS = ["cover", "contain"],
      TOUCH_MODES = ["track", "pan-y", "pan-x", "scroll", "off"],
      // Replaced content whose native drag / long-press menu would break the effect.
      MEDIA_SELECTOR = "img, picture, video, canvas, svg",
      // Never intercepted by the touch protections.
      INTERACTIVE_SELECTOR =
        "a[href], button, input, textarea, select, summary, label, [contenteditable]",
      // Per-mode defaults for the options that only make sense in some modes.
      MODE_DEFAULTS = {
        reveal: { opacity: 1, blur: 0 },
        flashlight: { opacity: 0.85, blur: 0 },
        focus: { opacity: 0.3, blur: 6 },
      },
      // Attributes whose change at runtime re-configures the instance.
      WATCHED_ATTRS = [
        "",
        "-layer",
        "-radius",
        "-softness",
        "-easing",
        "-shape",
        "-ratio",
        "-trail",
        "-swirl",
        "-wobble",
        "-trigger",
        "-touch",
        "-reverse",
        "-persist",
        "-fit",
        "-opacity",
        "-blur",
        "-color",
        "-disabled",
        "-disable",
        "-disable-mobile",
        "-disable-desktop",
        "-disable-tablet",
        "-disable-phone",
        "-disable-size",
      ].map((s) => `data-emerge-spotlight${s}`),
      // Inline custom properties the plugin writes (restored on destroy).
      VARS = [
        "x",
        "y",
        "size",
        "shape",
        "inner",
        "c0",
        "c1",
        "strength",
        "dim",
        "color",
        "blur",
        "fit",
        "shape-img",
        "tw",
        "th",
      ].map((s) => `--emerge-spotlight-${s}`);

    let core = null,
      rafId = 0,
      lastTime = 0,
      observer = null,
      sizeObserver = null,
      sharedOn = false;
    const instances = new Map(), // host element -> SpotlightInstance
      running = new Set(); // instances that currently need animation frames

    const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n),
      round = (n, p) => Math.round(n * p) / p,
      toNumber = (v, fallback) => {
        const n = parseFloat(v);
        return isNaN(n) ? fallback : n;
      },
      toElement = (t) => (typeof t == "string" ? document.querySelector(t) : t);

    /* ---- Shapes ------------------------------------------------------- */

    // circle / ellipse keep the radial-gradient mask; the rest are SVG images.
    const isRadial = (s) => s === "circle" || s === "ellipse";

    // Shapes drawn around (0, 0) with a half-size of 50 units. The tile that
    // carries them is 150 units wide, the extra 25 units on every side leave
    // room for the soft edge (see shapeImage) so it is never clipped.
    const STAR = (() => {
      const p = [];
      for (let i = 0; i < 10; i++) {
        const a = ((-90 + i * 36) * Math.PI) / 180,
          r = i % 2 ? 21 : 50;
        p.push(`${round(r * Math.cos(a), 100)},${round(r * Math.sin(a), 100)}`);
      }
      return p.join(" ");
    })();
    const BOX = '<rect x="-50" y="-50" width="100" height="100"',
      SHAPE_BODY = {
        square: `${BOX}/>`,
        rect: `${BOX}/>`,
        rounded: `${BOX} rx="24"/>`,
        diamond: '<polygon points="0,-50 50,0 0,50 -50,0"/>',
        hexagon:
          '<polygon points="50,0 25,43.3 -25,43.3 -50,0 -25,-43.3 25,-43.3"/>',
        triangle: '<polygon points="0,-50 50,35 -50,35"/>',
        star: `<polygon points="${STAR}"/>`,
        heart:
          '<path d="M0 42 C-52 6 -50 -36 -26 -44 C-12 -48 0 -38 0 -28 C0 -38 12 -48 26 -44 C50 -36 52 6 0 42Z"/>',
      };

    // The mask image of a shape. `f` is softness / radius (0 = hard edge,
    // 1 = fully soft). The soft edge is a Gaussian blur; the shape is shrunk a
    // little so the blurred edge stays inside the nominal radius, like the
    // gradient of the circle does. The image is stretched to the tile with
    // preserveAspectRatio="none", which is how "rect" gets its ratio.
    function shapeImage(shape, f) {
      f = clamp(f, 0, 1);
      const sigma = f * 10,
        scale = 1 - f / 2,
        inner = `<g transform="scale(${round(scale, 1000)})">${SHAPE_BODY[shape]}</g>`,
        body =
          sigma > 0.05
            ? `<defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(sigma, 100)}"/></filter></defs><g fill="#000" filter="url(#b)">${inner}</g>`
            : `<g fill="#000">${inner}</g>`,
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-75 -75 150 150" preserveAspectRatio="none">${body}</svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    /* ---- Fluid -------------------------------------------------------- */

    // Mask shown while the fluid holds no ink (fully transparent).
    const EMPTY_MASK = "linear-gradient(transparent, transparent)",
      FLUID_GRID = 96, // simulation cells along the longest side of the host
      FLUID_SCALE = 2; // mask resolution = grid * 2 (bilinear upsampled)

    // Stable fluids (semi-Lagrangian advection + pressure projection) on a
    // coarse grid. It only keeps two things: velocity (cells / second) and
    // density ("ink"). The density is upsampled, pushed through a smoothstep
    // and written as the alpha channel of a small canvas, which becomes the
    // mask image. All fields are flat Float32Arrays, index = i + j * gw.
    class Fluid {
      constructor(w, h) {
        const k = FLUID_GRID / Math.max(w, h);
        this.w = w;
        this.h = h;
        this.gw = Math.max(8, Math.round(w * k));
        this.gh = Math.max(8, Math.round(h * k));
        this.ow = this.gw * FLUID_SCALE;
        this.oh = this.gh * FLUID_SCALE;
        const n = this.gw * this.gh;
        this.d = new Float32Array(n);
        this.d2 = new Float32Array(n);
        this.u = new Float32Array(n);
        this.u2 = new Float32Array(n);
        this.v = new Float32Array(n);
        this.v2 = new Float32Array(n);
        this.p = new Float32Array(n);
        this.div = new Float32Array(n);
        this.max = 0; // highest density after the last render
        this.cv = document.createElement("canvas");
        this.cv.width = this.ow;
        this.cv.height = this.oh;
        this.cx = this.cv.getContext("2d");
        this.img = this.cx.createImageData(this.ow, this.oh); // RGB stays black
        // bilinear sampling columns of the upsampling pass
        this.xi = new Int32Array(this.ow);
        this.xf = new Float32Array(this.ow);
        for (let x = 0; x < this.ow; x++) {
          const s = clamp(((x + 0.5) * this.gw) / this.ow - 0.5, 0, this.gw - 1.001);
          this.xi[x] = s | 0;
          this.xf[x] = s - (s | 0);
        }
      }

      // A gaussian blob of ink with a push of velocity (grid units).
      splat(x, y, vx, vy, sigma, amount) {
        const { gw, gh, d, u, v } = this,
          r = Math.ceil(sigma * 3),
          i0 = Math.max(0, Math.floor(x) - r),
          i1 = Math.min(gw - 1, Math.ceil(x) + r),
          j0 = Math.max(0, Math.floor(y) - r),
          j1 = Math.min(gh - 1, Math.ceil(y) + r),
          inv = 1 / (sigma * sigma);
        for (let j = j0; j <= j1; j++)
          for (let i = i0; i <= i1; i++) {
            const dx = i - x,
              dy = j - y,
              g = Math.exp(-(dx * dx + dy * dy) * inv),
              k = i + j * gw;
            d[k] = 1 - (1 - d[k]) * (1 - amount * g);
            u[k] += vx * g;
            v[k] += vy * g;
          }
      }

      // Move `src` along the velocity field (backtrace + bilinear lookup).
      _advect(dst, src, dt, keep) {
        const { gw, gh, u, v } = this,
          mx = gw - 1.001,
          my = gh - 1.001;
        for (let j = 0; j < gh; j++)
          for (let i = 0; i < gw; i++) {
            const k = i + j * gw;
            let x = i - dt * u[k],
              y = j - dt * v[k];
            x = x < 0 ? 0 : x > mx ? mx : x;
            y = y < 0 ? 0 : y > my ? my : y;
            const i0 = x | 0,
              j0 = y | 0,
              fx = x - i0,
              fy = y - j0,
              a = i0 + j0 * gw;
            dst[k] =
              keep *
              ((src[a] * (1 - fx) + src[a + 1] * fx) * (1 - fy) +
                (src[a + gw] * (1 - fx) + src[a + gw + 1] * fx) * fy);
          }
      }

      // Remove the divergence of the velocity (Gauss-Seidel on the pressure).
      _project() {
        const { gw, gh, u, v, p, div } = this;
        for (let j = 0; j < gh; j++)
          for (let i = 0; i < gw; i++) {
            const k = i + j * gw,
              l = i > 0 ? k - 1 : k,
              r = i < gw - 1 ? k + 1 : k,
              t = j > 0 ? k - gw : k,
              b = j < gh - 1 ? k + gw : k;
            div[k] = -0.5 * (u[r] - u[l] + v[b] - v[t]);
            p[k] = 0;
          }
        for (let n = 0; n < 18; n++)
          for (let j = 0; j < gh; j++)
            for (let i = 0; i < gw; i++) {
              const k = i + j * gw,
                l = i > 0 ? k - 1 : k,
                r = i < gw - 1 ? k + 1 : k,
                t = j > 0 ? k - gw : k,
                b = j < gh - 1 ? k + gw : k;
              p[k] = (div[k] + p[l] + p[r] + p[t] + p[b]) * 0.25;
            }
        for (let j = 0; j < gh; j++)
          for (let i = 0; i < gw; i++) {
            const k = i + j * gw,
              l = i > 0 ? k - 1 : k,
              r = i < gw - 1 ? k + 1 : k,
              t = j > 0 ? k - gw : k,
              b = j < gh - 1 ? k + gw : k;
            u[k] -= 0.5 * (p[r] - p[l]);
            v[k] -= 0.5 * (p[b] - p[t]);
          }
      }

      // One simulation step. `dissolve` is the density decay rate (1 / second).
      step(dt, dissolve) {
        const slow = Math.exp(-dt * 2.2); // the push of the pointer fades quickly
        this._advect(this.u2, this.u, dt, slow);
        this._advect(this.v2, this.v, dt, slow);
        let t = this.u;
        this.u = this.u2;
        this.u2 = t;
        t = this.v;
        this.v = this.v2;
        this.v2 = t;
        this._project();
        this._advect(this.d2, this.d, dt, Math.exp(-dt * dissolve));
        t = this.d;
        this.d = this.d2;
        this.d2 = t;
      }

      // Density -> alpha mask. Returns the PNG data URI of the canvas.
      render(lo, hi) {
        const { gw, gh, ow, oh, d, xi, xf } = this,
          data = this.img.data,
          span = 1 / (hi - lo);
        let max = 0;
        for (let y = 0; y < oh; y++) {
          const s = clamp(((y + 0.5) * gh) / oh - 0.5, 0, gh - 1.001),
            j0 = s | 0,
            fy = s - j0,
            row = j0 * gw;
          for (let x = 0; x < ow; x++) {
            const a = row + xi[x],
              fx = xf[x],
              q =
                (d[a] * (1 - fx) + d[a + 1] * fx) * (1 - fy) +
                (d[a + gw] * (1 - fx) + d[a + gw + 1] * fx) * fy;
            q > max && (max = q);
            let t = (q - lo) * span;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            data[(y * ow + x) * 4 + 3] = (t * t * (3 - 2 * t) * 255 + 0.5) | 0;
          }
        }
        this.max = max;
        this.cx.putImageData(this.img, 0, 0);
        return this.cv.toDataURL("image/png");
      }
    }

    /* ---- Configuration ------------------------------------------------ */

    // Precedence: explicit instance options (API) > data-emerge-spotlight-*
    // attributes > global options (Emerge.init({ spotlight... })) > defaults.
    function readConfig(el, ex) {
      const o = core.options,
        given = (k) => ex[k] !== undefined && ex[k] !== null,
        number = (key, name, fallback) => {
          if (given(key)) {
            const n = parseFloat(ex[key]);
            if (!isNaN(n)) return n;
          }
          const v = core.attr(el, name, null);
          return typeof v == "string" ? toNumber(v, fallback) : fallback;
        },
        choice = (key, name, fallback, allowed) => {
          let v = given(key) ? ex[key] : core.attr(el, name, null);
          v = typeof v == "string" ? v.trim().toLowerCase() : "";
          return allowed.indexOf(v) > -1 ? v : fallback;
        },
        flag = (key, name, fallback) => {
          if (given(key)) return !!ex[key];
          const v = core.attr(el, name, null);
          return v === null ? fallback : v !== false && v !== "0" && v !== "off";
        },
        valid = (v, allowed, fallback) =>
          allowed.indexOf(v) > -1 ? v : fallback;

      let mode = given("mode") ? ex.mode : core.attr(el, "spotlight", null);
      mode = typeof mode == "string" ? mode.trim().toLowerCase() : "reveal";
      if (MODES.indexOf(mode) < 0) mode = "reveal";

      const base = MODE_DEFAULTS[mode],
        radius = Math.max(
          1,
          number("radius", "spotlight-radius", toNumber(o.spotlightRadius, 100)),
        );
      let color = given("color")
        ? ex.color
        : core.attr(el, "spotlight-color", null);
      if (typeof color != "string" || !color.trim())
        color = o.spotlightColor || "#000";

      const cfg = {
        mode,
        radius,
        softness: clamp(
          number(
            "softness",
            "spotlight-softness",
            toNumber(o.spotlightSoftness, 30),
          ),
          0,
          radius,
        ),
        easing: clamp(
          number(
            "easing",
            "spotlight-easing",
            toNumber(o.spotlightEasing, 0.2),
          ),
          0,
          1,
        ),
        shape: choice(
          "shape",
          "spotlight-shape",
          valid(o.spotlightShape, SHAPES, "circle"),
          SHAPES,
        ),
        ratio: clamp(
          number("ratio", "spotlight-ratio", toNumber(o.spotlightRatio, 0.6)),
          0.1,
          10,
        ),
        trigger: choice(
          "trigger",
          "spotlight-trigger",
          valid(o.spotlightTrigger, TRIGGERS, "pointer"),
          TRIGGERS,
        ),
        touch: choice(
          "touch",
          "spotlight-touch",
          valid(o.spotlightTouch, TOUCH_MODES, "track"),
          TOUCH_MODES,
        ),
        // fluid only: seconds the trail takes to dissolve, and how much the
        // pointer stirs it
        trail: clamp(
          number("trail", "spotlight-trail", toNumber(o.spotlightTrail, 1.2)),
          0.1,
          10,
        ),
        swirl: clamp(
          number("swirl", "spotlight-swirl", toNumber(o.spotlightSwirl, 1)),
          0,
          5,
        ),
        wobble: clamp(
          number("wobble", "spotlight-wobble", toNumber(o.spotlightWobble, 1)),
          0,
          3,
        ),
        reverse: flag("reverse", "spotlight-reverse", !!o.spotlightReverse),
        persist: flag("persist", "spotlight-persist", !!o.spotlightPersist),
        // null = not chosen: the CSS default (cover, or a user-defined
        // --emerge-spotlight-layer-fit) applies.
        fit: choice("fit", "spotlight-fit", valid(o.spotlightFit, FITS, null), FITS),
        opacity: clamp(
          number(
            "opacity",
            "spotlight-opacity",
            toNumber(o.spotlightOpacity, base.opacity),
          ),
          0,
          1,
        ),
        blur: Math.max(
          0,
          number("blur", "spotlight-blur", toNumber(o.spotlightBlur, base.blur)),
        ),
        color: color.trim(),
      };
      // Reduced motion: no inertia / fade, the spot sticks to the pointer.
      cfg.tau =
        o.respectReducedMotion !== false && core.prefersReducedMotion()
          ? 0
          : cfg.easing * 0.5;
      return cfg;
    }

    // The elements that sit on top in "reveal" mode. Layers of nested hosts
    // belong to the nested host, not to this one.
    function findLayers(host) {
      return Array.from(host.querySelectorAll(LAYER_SELECTOR)).filter(
        (n) => n.closest(SELECTOR) === host,
      );
    }

    function isActive(el) {
      if (core.attr(el, "spotlight", null) === false) return false;
      if (
        core.hasAttr(el, "spotlight-disabled") &&
        core.attr(el, "spotlight-disabled", true) !== false
      )
        return false;
      return !core.isDisabledFor(el, "spotlight");
    }

    // "120" -> 120 (px), "50%" -> 50% of `size`
    function coord(v, size) {
      if (typeof v == "string" && v.trim().slice(-1) === "%")
        return (parseFloat(v) / 100) * size || 0;
      return parseFloat(v) || 0;
    }

    /* ---- Shared engine ------------------------------------------------ */

    // One loop for every instance: all layout reads first, then all writes.
    function frame(now) {
      rafId = 0;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = now;
      running.forEach((inst) => inst.measure());
      running.forEach((inst) => {
        inst.step(dt) || running.delete(inst);
      });
      if (running.size) rafId = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    function wake(inst) {
      running.add(inst);
      if (!rafId) rafId = requestAnimationFrame(frame);
    }

    // Moving the page under a still pointer changes the local coordinates.
    function onScroll() {
      instances.forEach((inst) => {
        inst.dirty = true;
        inst.hasPointer && wake(inst);
      });
    }

    function onResize(entries) {
      entries.forEach((en) => {
        const inst = instances.get(en.target);
        if (!inst) return;
        inst.dirty = true;
        (inst.k > 0 || inst.kt > 0) && wake(inst);
      });
    }

    function attachShared() {
      if (sharedOn) return;
      sharedOn = true;
      window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    }

    function detachShared() {
      if (!sharedOn) return;
      sharedOn = false;
      window.removeEventListener("scroll", onScroll, { capture: true });
      sizeObserver && sizeObserver.disconnect();
      sizeObserver = null;
    }

    /* ---- Instance ----------------------------------------------------- */

    class SpotlightInstance {
      constructor(el, options) {
        this.el = el;
        this.explicit = Object.assign({}, options);
        this.cfg = null;
        this.layers = [];
        this.owned = new Set(); // classes added to the host by the plugin
        this.ownedLayers = new Set(); // layers that received the layer class
        this.layerNoClass = new Set(); // ...and had no class attribute before
        this.saved = new Map(); // inline values to restore on destroy
        this.last = {}; // last value written for each custom property
        this.hadClassAttr = el.hasAttribute("class");
        this.hadStyleAttr = el.hasAttribute("style");
        VARS.forEach((p) =>
          this.saved.set(p, [
            el.style.getPropertyValue(p),
            el.style.getPropertyPriority(p),
          ]),
        );
        // Current / target state. Coordinates are px inside the host's
        // padding box; k is the visibility (0 hidden .. 1 fully shown).
        this.x = this.y = 0;
        this.k = this.kt = 0;
        this.px = this.py = 0; // last pointer position (client coordinates)
        this.mx = this.my = "50%"; // last manual position (update())
        this.src = "center"; // where the spot is aimed: center | pointer | manual
        this.hasPointer = false;
        this.fl = null; // fluid simulation (shape "fluid"), created on demand
        this.flPrev = null; // last spot position in grid units, for the trail
        this.pointerType = ""; // type of the pointer currently driving the spot
        this.pressing = false; // a finger / pen is in contact with the host
        this.snap = true; // jump to the target instead of easing towards it
        this.dirty = true; // host rectangle needs to be measured again
        this.left = this.top = this.w = this.h = 0;
        this.sx = this.sy = 1;
        this.bound = false;
        this.declarative = false; // true when found through the HTML attribute
        this._enter = (e) => this._onEnter(e);
        this._down = (e) => this._onDown(e);
        this._move = (e) => this._onMove(e);
        this._up = (e) => this._onUp(e);
        this._leave = (e) => this._onLeave(e);
        this._select = (e) => this._onSelect(e);
        this._drag = (e) => this._onDrag(e);
        this._menu = (e) => this._onMenu(e);

        instances.set(el, this);
        attachShared();
        if (typeof ResizeObserver != "undefined") {
          sizeObserver = sizeObserver || new ResizeObserver(onResize);
          sizeObserver.observe(el);
        }
        this.configure();
      }

      /* -- public ------------------------------------------------------ */

      get options() {
        return Object.assign({}, this.cfg);
      }

      // Position of the spot, in px (or "50%") relative to the host's top-left.
      update(x, y) {
        this.src = "manual";
        this.mx = x;
        this.my = y;
        if (this.kt === 0) this.snap = true;
        wake(this);
        return this;
      }

      show() {
        if (this.k < 0.001) this.snap = true;
        this.kt = 1;
        this._cls("emerge-spotlight-active", true);
        wake(this);
        return this;
      }

      hide() {
        this.kt = 0;
        wake(this);
        return this;
      }

      setOptions(options) {
        Object.assign(this.explicit, options);
        this.configure();
        return this;
      }

      destroy() {
        if (instances.get(this.el) !== this) return;
        const el = this.el;
        this._unbind();
        running.delete(this);
        sizeObserver && sizeObserver.unobserve(el);
        instances.delete(el);
        this.owned.forEach((c) => el.classList.remove(c));
        this.owned.clear();
        Array.from(this.ownedLayers).forEach((l) => this._unlayer(l));
        this.ownedLayers.clear();
        this.layerNoClass.clear();
        this.saved.forEach(([value, priority], prop) =>
          value
            ? el.style.setProperty(prop, value, priority)
            : el.style.removeProperty(prop),
        );
        if (!this.hadClassAttr && !el.getAttribute("class"))
          el.removeAttribute("class");
        if (!this.hadStyleAttr && !el.getAttribute("style"))
          el.removeAttribute("style");
        instances.size || detachShared();
      }

      /* -- internals --------------------------------------------------- */

      configure() {
        const el = this.el,
          prev = this.cfg,
          cfg = (this.cfg = readConfig(el, this.explicit));
        this.tau = cfg.tau;

        MODES.forEach((m) => this._cls(`emerge-spotlight-${m}`, m === cfg.mode));
        this._cls("emerge-spotlight", true);
        this._cls("emerge-spotlight-ellipse", cfg.shape === "ellipse");
        this._cls("emerge-spotlight-reverse", cfg.reverse);
        this._cls(
          "emerge-spotlight-blurred",
          cfg.mode !== "reveal" && cfg.blur > 0,
        );
        // touch-action lives in the CSS (one class per touch mode). It is only
        // applied while this instance actually listens to touch pointers, so a
        // "hover" / "manual" / touch="off" host keeps native gestures untouched.
        const touchOn = cfg.trigger === "pointer" && cfg.touch !== "off";
        TOUCH_MODES.forEach((m) =>
          this._cls(`emerge-spotlight-touch-${m}`, touchOn && m === cfg.touch),
        );
        this._syncLayers();

        // Reveal shows its layer inside the spot; flashlight / focus put the
        // effect outside of it. "reverse" swaps both.
        const insideOpaque = (cfg.mode === "reveal") !== cfg.reverse;
        // Every shape but circle / ellipse is an SVG mask image: the CSS swaps
        // the radial gradient for it (.emerge-spotlight-shaped) and, when the
        // effect sits outside the spot, punches it out of a solid layer
        // (.emerge-spotlight-outside).
        const shaped = !isRadial(cfg.shape),
          fluid = cfg.shape === "fluid";
        this._cls("emerge-spotlight-shaped", shaped);
        this._cls("emerge-spotlight-fluid", fluid);
        this._cls("emerge-spotlight-outside", shaped && !insideOpaque);
        this._set(
          "--emerge-spotlight-shape",
          cfg.shape === "ellipse" ? "ellipse" : "circle",
        );
        if (fluid) {
          // the mask is rewritten every frame by _flow(); until there is ink
          // it must be an empty mask, never "no mask" (that shows everything)
          this.fl || this._set("--emerge-spotlight-shape-img", EMPTY_MASK);
        } else {
          this.fl = this.flPrev = null;
          this._set(
            "--emerge-spotlight-shape-img",
            shaped ? shapeImage(cfg.shape, cfg.softness / cfg.radius) : null,
          );
        }
        if (!shaped || fluid) {
          this._set("--emerge-spotlight-tw", null);
          this._set("--emerge-spotlight-th", null);
        }
        this._set(
          "--emerge-spotlight-inner",
          `${round(((cfg.radius - cfg.softness) / cfg.radius) * 100, 100)}%`,
        );
        this._set("--emerge-spotlight-c0", insideOpaque ? "#000" : "transparent");
        this._set("--emerge-spotlight-c1", insideOpaque ? "transparent" : "#000");
        this._set("--emerge-spotlight-color", cfg.color);
        this._set("--emerge-spotlight-dim", `${round(cfg.opacity * 100, 100)}%`);
        this._set("--emerge-spotlight-blur", `${cfg.blur}px`);
        this._set("--emerge-spotlight-fit", cfg.mode === "reveal" ? cfg.fit : null);

        if (!prev || prev.trigger !== cfg.trigger) this._bind();
        // touch was just switched off / to hover while a finger is down
        if (this.hasPointer && !this._allows(this.pointerType)) this._end();
        this.dirty = true;
        this.paint();
        (this.k > 0 || this.kt > 0) && wake(this);
      }

      // Read phase: one layout read, only when something moved or resized.
      measure() {
        if (!this.dirty) return;
        this.dirty = false;
        const el = this.el,
          r = el.getBoundingClientRect(),
          ow = el.offsetWidth,
          oh = el.offsetHeight;
        this.sx = ow ? r.width / ow : 1;
        this.sy = oh ? r.height / oh : 1;
        this.left = r.left + el.clientLeft * this.sx;
        this.top = r.top + el.clientTop * this.sy;
        this.w = el.clientWidth || r.width / this.sx;
        this.h = el.clientHeight || r.height / this.sy;
      }

      // Write phase. Returns true while it still needs more frames.
      step(dt) {
        let tx, ty;
        if (this.src === "pointer") {
          tx = (this.px - this.left) / this.sx;
          ty = (this.py - this.top) / this.sy;
        } else if (this.src === "manual") {
          tx = coord(this.mx, this.w);
          ty = coord(this.my, this.h);
        } else {
          tx = this.w / 2;
          ty = this.h / 2;
        }
        const a = this.tau > 0 ? 1 - Math.exp(-dt / this.tau) : 1;
        if (this.snap) {
          this.x = tx;
          this.y = ty;
          this.snap = false;
        } else {
          this.x += (tx - this.x) * a;
          this.y += (ty - this.y) * a;
        }
        this.k += (this.kt - this.k) * a;
        const settled =
          Math.abs(tx - this.x) < 0.05 &&
          Math.abs(ty - this.y) < 0.05 &&
          Math.abs(this.kt - this.k) < 0.003;
        if (settled) {
          this.x = tx;
          this.y = ty;
          this.k = this.kt;
        }
        const flowing = this.cfg.shape === "fluid" && this._flow(dt);
        this.paint();
        settled &&
          this.kt === 0 &&
          !flowing &&
          this._cls("emerge-spotlight-active", false);
        return !settled || flowing;
      }

      // Fluid shape: stir the simulation with the spot, advance it and publish
      // its density as the mask. Returns true while there is still something
      // to animate (the spot is shown, or ink is still dissolving).
      _flow(dt) {
        const c = this.cfg;
        if (!this.w || !this.h) return false;
        let f = this.fl;
        if (!f || f.w !== this.w || f.h !== this.h) {
          f = this.fl = new Fluid(this.w, this.h); // new size: start clean
          this.flPrev = null;
        }
        dt = Math.min(dt, 1 / 30);
        const live = this.kt > 0,
          cell = f.gw / this.w, // grid cells per px
          dissolve = 3 / c.trail, // ~5% of the ink left after `trail` seconds
          amount = 0.6,
          // The blob that builds up under a still pointer stops growing when
          // the ink added per frame balances what dissolves; pick sigma so that
          // blob ends up with the requested radius.
          sigma =
            (c.radius * cell) /
            Math.sqrt(Math.max(Math.log(amount / (dt * dissolve)), 1));
        if (live) {
          const gx = this.x * cell,
            gy = this.y * cell,
            prev = this.flPrev;
          if (prev) {
            const dx = gx - prev[0],
              dy = gy - prev[1],
              n = Math.min(24, Math.max(1, Math.ceil(Math.hypot(dx, dy) / (sigma * 0.7)))),
              // cells / second, limited so a jump cannot blow the field up
              s = (c.swirl * 0.5) / Math.max(dt, 1 / 120),
              vx = clamp(dx * s, -60, 60),
              vy = clamp(dy * s, -60, 60);
            for (let i = 1; i <= n; i++)
              f.splat(prev[0] + (dx * i) / n, prev[1] + (dy * i) / n, vx, vy, sigma, amount);
          } else f.splat(gx, gy, 0, 0, sigma, amount);
          // Idle motion: two invisible stirrers orbit inside the blob at
          // different speeds. They add no ink, only velocity, so the edge
          // keeps rippling like a liquid even when the pointer is still.
          if (c.wobble > 0) {
            const t = (this.ft = (this.ft || 0) + dt),
              R = c.radius * cell,
              w = c.wobble;
            for (let k = 0; k < 2; k++) {
              const a = t * (k ? -2.1 : 1.5) + k * 2.4,
                o = R * (k ? 0.3 : 0.38),
                sp = R * w * dt * (k ? 5.6 : 4.4); // tangential push per frame
              f.splat(
                gx + Math.cos(a) * o,
                gy + Math.sin(a) * o,
                -Math.sin(a) * sp * (k ? -1 : 1),
                Math.cos(a) * sp * (k ? -1 : 1),
                sigma * 1.1,
                0,
              );
            }
          }
          this.flPrev = [gx, gy];
        } else this.flPrev = null;
        f.step(dt, dissolve);
        const e = 0.04 + 0.4 * clamp(c.softness / c.radius, 0, 1),
          url = f.render(0.5 - e, 0.5 + e),
          alive = f.max > 0.5 - e;
        if (!live && !alive) f.d.fill(0), f.u.fill(0), f.v.fill(0);
        this._set(
          "--emerge-spotlight-shape-img",
          live || alive ? `url("${url}")` : EMPTY_MASK,
        );
        return live || alive;
      }

      paint() {
        const c = this.cfg,
          rx = Math.max(c.radius * this.k, 0.01),
          wide = c.shape === "ellipse" || c.shape === "rect",
          ry = Math.max(rx * (wide ? c.ratio : 1), 0.01);
        this._set("--emerge-spotlight-x", this.w ? `${round(this.x, 100)}px` : "50%");
        this._set("--emerge-spotlight-y", this.w ? `${round(this.y, 100)}px` : "50%");
        this._set(
          "--emerge-spotlight-size",
          c.shape === "ellipse"
            ? `${round(rx, 100)}px ${round(ry, 100)}px`
            : `${round(rx, 100)}px`,
        );
        if (!isRadial(c.shape) && c.shape !== "fluid") {
          // size of the SVG mask tile: 1.5x the shape (room for the soft edge)
          this._set("--emerge-spotlight-tw", `${round(rx * 3, 100)}px`);
          this._set("--emerge-spotlight-th", `${round(ry * 3, 100)}px`);
        }
        // Opacity of the flashlight / focus overlay. "persist" keeps the
        // effect on the content even when the pointer is away.
        this._set(
          "--emerge-spotlight-strength",
          String(c.persist && c.mode !== "reveal" ? 1 : round(this.k, 1000)),
        );
      }

      // `null` removes a property this instance wrote earlier; one it never
      // wrote (e.g. set by the author in a style attribute) is left alone.
      _set(prop, value) {
        if (this.last[prop] === value) return;
        const wrote = this.last[prop] !== undefined && this.last[prop] !== null;
        this.last[prop] = value;
        if (value === null) wrote && this.el.style.removeProperty(prop);
        else this.el.style.setProperty(prop, value);
      }

      _cls(name, on) {
        const list = this.el.classList;
        if (on) {
          if (!list.contains(name)) {
            list.add(name);
            this.owned.add(name);
          }
        } else if (this.owned.has(name)) {
          list.remove(name);
          this.owned.delete(name);
        }
      }

      _syncLayers() {
        const want = this.cfg.mode === "reveal" ? findLayers(this.el) : [];
        this.layers.forEach((l) => {
          if (want.indexOf(l) < 0 && this.ownedLayers.has(l)) this._unlayer(l);
        });
        want.forEach((l) => {
          if (!l.classList.contains("emerge-spotlight-layer")) {
            // remember layers that had no class attribute, to leave none behind
            l.hasAttribute("class") || this.layerNoClass.add(l);
            l.classList.add("emerge-spotlight-layer");
            this.ownedLayers.add(l);
          }
        });
        this.layers = want;
      }

      _unlayer(l) {
        l.classList.remove("emerge-spotlight-layer");
        this.ownedLayers.delete(l);
        if (this.layerNoClass.delete(l) && !l.getAttribute("class"))
          l.removeAttribute("class");
      }

      _bind() {
        this._unbind();
        if (this.cfg.trigger === "manual") return;
        // Pointer Events only: one set of listeners covers mouse, touch and
        // pen, and the browser never replays them as extra mouse / touch
        // events. Touch pointers are implicitly captured by the element they
        // started on, so no setPointerCapture() is needed (and capturing would
        // retarget `click` away from links and buttons inside the host).
        const el = this.el,
          opts = { passive: true };
        el.addEventListener("pointerenter", this._enter, opts);
        el.addEventListener("pointerdown", this._down, opts);
        el.addEventListener("pointermove", this._move, opts);
        el.addEventListener("pointerup", this._up, opts);
        el.addEventListener("pointerleave", this._leave, opts);
        el.addEventListener("pointercancel", this._leave, opts);
        // These three call preventDefault(), so they are not passive.
        el.addEventListener("selectstart", this._select);
        el.addEventListener("dragstart", this._drag);
        el.addEventListener("contextmenu", this._menu);
        this.bound = true;
      }

      _unbind() {
        if (this.bound) {
          const el = this.el;
          el.removeEventListener("pointerenter", this._enter);
          el.removeEventListener("pointerdown", this._down);
          el.removeEventListener("pointermove", this._move);
          el.removeEventListener("pointerup", this._up);
          el.removeEventListener("pointerleave", this._leave);
          el.removeEventListener("pointercancel", this._leave);
          el.removeEventListener("selectstart", this._select);
          el.removeEventListener("dragstart", this._drag);
          el.removeEventListener("contextmenu", this._menu);
          this.bound = false;
        }
        if (this.hasPointer) {
          this.hasPointer = false;
          this.kt = 0;
        }
        this._press(false);
      }

      // Touch pointers are ignored by "hover" and by touch="off".
      _allows(type) {
        return (
          type !== "touch" ||
          (this.cfg.trigger !== "hover" && this.cfg.touch !== "off")
        );
      }

      // Only the primary pointer is tracked.
      _accepts(e) {
        return e.isPrimary !== false && this._allows(e.pointerType);
      }

      // A finger / pen is in contact: lock selection through a class (CSS).
      _press(on) {
        if (this.pressing === on) return;
        this.pressing = on;
        this._cls("emerge-spotlight-touching", on);
      }

      // The gesture ended (finger lifted, leave or cancel): hide the spot.
      _end() {
        this.hasPointer = false;
        this.kt = 0;
        this._press(false);
        wake(this);
      }

      _onEnter(e) {
        if (!this._accepts(e)) return;
        this.pointerType = e.pointerType || "mouse";
        this.px = e.clientX;
        this.py = e.clientY;
        this.src = "pointer";
        if (!this.hasPointer && this.k < 0.001) this.snap = true;
        this.hasPointer = true;
        this.dirty = true;
        this.kt = 1;
        this._cls("emerge-spotlight-active", true);
        wake(this);
      }

      _onDown(e) {
        if (!this._accepts(e)) return;
        if (!this.hasPointer) this._onEnter(e);
        else {
          this.pointerType = e.pointerType || "mouse";
          this.px = e.clientX;
          this.py = e.clientY;
          this.dirty = true;
          wake(this);
        }
        // A mouse keeps its normal text selection; touch / pen contact does not.
        e.pointerType !== "mouse" && this._press(true);
      }

      _onMove(e) {
        if (!this._accepts(e)) return;
        if (!this.hasPointer) return this._onEnter(e);
        this.px = e.clientX;
        this.py = e.clientY;
        wake(this);
      }

      _onUp(e) {
        if (e.isPrimary === false || e.pointerType === "mouse") return;
        this._press(false);
        // A lifted finger is gone; a pen may still hover, and pointerleave
        // will hide the spot when it moves away.
        e.pointerType === "touch" && this._end();
      }

      _onLeave(e) {
        if (e.isPrimary === false) return;
        this._end();
      }

      // Blocks the text selection started by a touch / pen press on the host.
      _onSelect(e) {
        this.pressing && e.preventDefault();
      }

      // Native drag of images / media would cancel the pointer stream.
      _onDrag(e) {
        const t = e.target;
        if (!(this.pressing || this.cfg.mode === "reveal")) return;
        t && t.nodeType === 1 && t.closest(MEDIA_SELECTOR) && e.preventDefault();
      }

      // Long-press menu on media (Android) would also cancel the gesture.
      // Links, buttons and form controls keep their menu.
      _onMenu(e) {
        const t = e.target;
        if (!this.pressing || !t || t.nodeType !== 1) return;
        t.closest(MEDIA_SELECTOR) &&
          !t.closest(INTERACTIVE_SELECTOR) &&
          e.preventDefault();
      }
    }

    /* ---- Discovery ---------------------------------------------------- */

    // Declarative discovery: creates the instance for a [data-emerge-spotlight]
    // host unless it is disabled.
    function ensure(el) {
      const existing = instances.get(el);
      if (existing || !isActive(el)) return existing || null;
      const inst = new SpotlightInstance(el, {});
      inst.declarative = true;
      return inst;
    }

    function scan(root) {
      (root || document).querySelectorAll(SELECTOR).forEach((el) => ensure(el));
    }

    // Brings instances in line with the DOM: drops detached / disabled ones,
    // re-reads configuration and picks up new hosts.
    function sync(reason) {
      instances.forEach((inst, el) => {
        if (!el.isConnected || !isActive(el)) return inst.destroy();
        reason !== "resize" && inst.configure();
        inst.dirty = true;
        (inst.k > 0 || inst.kt > 0) && wake(inst);
      });
      scan(document);
    }

    function onAttribute(target) {
      const inst = instances.get(target);
      if (inst) {
        // Instances created through the API do not depend on the attribute.
        if (
          (inst.declarative && !target.hasAttribute("data-emerge-spotlight")) ||
          !isActive(target)
        )
          inst.destroy();
        else inst.configure();
        return;
      }
      if (target.hasAttribute("data-emerge-spotlight")) return ensure(target);
      const host = target.closest(SELECTOR),
        parent = host && instances.get(host);
      parent && parent.configure(); // a layer was (un)marked inside a host
    }

    function onAdded(node) {
      if (node.nodeType !== 1) return;
      // Nodes generated by the Text plugin are never Spotlight hosts.
      const cl = node.classList;
      if (cl && (cl.contains("emerge-word") || cl.contains("emerge-part"))) return;
      node.matches(SELECTOR) && ensure(node);
      node.querySelectorAll(SELECTOR).forEach((el) => ensure(el));
      if (node.matches(LAYER_SELECTOR) || node.querySelector(LAYER_SELECTOR)) {
        const host = node.closest(SELECTOR),
          inst = host && host !== node && instances.get(host);
        inst && inst.configure();
      }
    }

    function onMutations(records) {
      for (const rec of records) {
        if (rec.type === "attributes") onAttribute(rec.target);
        else rec.addedNodes.forEach(onAdded);
      }
      // Hosts that left the document (done after the loop so that a node that
      // was merely moved is not destroyed and recreated).
      instances.forEach((inst, el) => {
        el.isConnected || inst.destroy();
      });
    }

    // The Core only watches [data-emerge] nodes, so Spotlight keeps one
    // observer of its own (shared by every instance), honouring the Core's
    // disableMutationObserver option.
    function watch() {
      if (
        observer ||
        core.options.disableMutationObserver ||
        typeof MutationObserver == "undefined"
      )
        return;
      observer = new MutationObserver(onMutations);
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: WATCHED_ATTRS,
      });
    }

    /* ---- Programmatic API (Emerge.Spotlight) -------------------------- */

    function create(target, options) {
      const el = toElement(target);
      if (!el || el.nodeType !== 1) return null;
      const existing = instances.get(el);
      if (existing) return options ? existing.setOptions(options) : existing;
      return new SpotlightInstance(el, options);
    }

    function destroyOne(target) {
      const inst = instances.get(toElement(target));
      inst && inst.destroy();
      return !!inst;
    }

    function destroyAll() {
      Array.from(instances.values()).forEach((inst) => inst.destroy());
    }

    return {
      name: "Spotlight",
      defaults: {
        spotlightRadius: 100,
        spotlightSoftness: 30,
        spotlightEasing: 0.2,
        spotlightShape: "circle",
        spotlightRatio: 0.6,
        spotlightTrigger: "pointer",
        spotlightTouch: "track",
        spotlightTrail: 1.2,
        spotlightSwirl: 1,
        spotlightWobble: 1,
        spotlightReverse: false,
        spotlightPersist: false,
        spotlightFit: null,
        spotlightOpacity: null,
        spotlightBlur: null,
        spotlightColor: "#000",
      },
      install: (c) => (
        (core = c),
        {
          create,
          destroy: destroyOne,
          destroyAll,
          get: (target) => instances.get(toElement(target)) || null,
          refresh: (target) => {
            if (target === undefined) return sync("manual");
            const el = toElement(target),
              inst = el && instances.get(el);
            if (inst) inst.configure();
            else el && el.nodeType === 1 && ensure(el);
            return instances.get(el) || null;
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }, c) {
          c.hasAttr(el, "spotlight") && ensure(el);
        },
        init() {
          scan(document);
          watch();
        },
        refresh({ reason }) {
          sync(reason);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && inst.destroy();
        },
        teardown() {
          destroyAll();
          running.clear();
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
          lastTime = 0;
          detachShared();
        },
      },
    };
  }),
  Emerge.addPlugin([
    EmergeRange,
    EmergeDraw,
    EmergeHorizontal,
    EmergeMedia,
    EmergeStack,
    EmergeText,
    EmergeSpotlight,
  ])); /* . Emerge.js — Automatic CSS loader */

(function () {
  "use strict";
  if (typeof document === "undefined") {
    return;
  }
  const script = document.currentScript;
  if (!script) {
    return;
  }
  const customCSS = script.getAttribute("data-emerge-css");
  if (customCSS === "false") {
    return;
  }
  let cssURL;
  if (customCSS !== null && customCSS.trim() !== "") {
    cssURL = new URL(customCSS, document.baseURI).href;
  } else {
    const scriptURL = script.src;
    if (!scriptURL || !/^https?:\/\//i.test(scriptURL)) {
      return;
    }
    const url = new URL(scriptURL);
    cssURL = `${url.origin}/css/emerge.css`;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssURL;
  link.dataset.emergeStylesheet = "";
  document.head.appendChild(link);
})();
