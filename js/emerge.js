/*! Emerge.js v1.7.2 — core */
(function (
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
  const i = "1.7.2",
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
        if (!e) return !1;
        // o vazio = o próprio core: data-emerge-disable… / data-emerge-only…
        const pf = o ? `${o}-` : "";
        if (
          (e.hasAttribute(`data-emerge-${pf}disable-mobile`) && p.mobile()) ||
          (e.hasAttribute(`data-emerge-${pf}disable-desktop`) && !p.mobile()) ||
          (e.hasAttribute(`data-emerge-${pf}disable-tablet`) && p.tablet()) ||
          (e.hasAttribute(`data-emerge-${pf}disable-phone`) && p.phone())
        )
          return !0;
        const f = e.getAttribute(`data-emerge-${pf}disable-size`);
        if (
          f &&
          f
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
            .some(h)
        )
          return !0;
        const L = D(e, `${pf}disable`, !1);
        if (
          L === !0 ||
          (L === "mobile"
            ? p.mobile()
            : L === "tablet"
              ? p.tablet()
              : L === "phone"
                ? p.phone()
                : L === "desktop" && !p.mobile())
        )
          return !0;
        // "only": ativa SÓ nos dispositivos indicados (OR entre eles); fora
        // deles o elemento fica desativado. Complementa o "disable".
        //   data-emerge-<plugin>-only-mobile | -only-desktop | -only-tablet
        //   | -only-phone | -only-size="max@768" | -only="mobile"
        const ow = (n) => e.hasAttribute(`data-emerge-${pf}only-${n}`),
          oa = D(e, `${pf}only`, !1),
          os = e.getAttribute(`data-emerge-${pf}only-size`);
        if (!(ow("mobile") || ow("desktop") || ow("tablet") || ow("phone") || os || oa))
          return !1;
        const om = (n) =>
            n === "mobile"
              ? p.mobile()
              : n === "tablet"
                ? p.tablet()
                : n === "phone"
                  ? p.phone()
                  : n === "desktop"
                    ? !p.mobile()
                    : !1,
          oy =
            (ow("mobile") && p.mobile()) ||
            (ow("desktop") && !p.mobile()) ||
            (ow("tablet") && p.tablet()) ||
            (ow("phone") && p.phone()) ||
            (!!os &&
              os
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
                .some(h)) ||
            (typeof oa == "string" &&
              oa
                .split(",")
                .map((k) => k.trim().toLowerCase())
                .some(om));
        return !oy;
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
    if (Y.has(e) || x(e) || R.isDisabledFor(e, "")) return;
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
});
