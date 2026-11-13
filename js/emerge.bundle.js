/*! Emerge.js v1.7.2 — bundle organizado: core + 13 plugins + registo + carregador de CSS */

/* ######################################################################## */
/*  COMO ESTE FICHEIRO ESTÁ ORGANIZADO  (LEIA ANTES DE EDITAR)
/*
/*  O ficheiro é composto por SECÇÕES independentes, separadas por pelo menos
/*  3 linhas em branco e delimitadas por marcadores BEGIN / END:
/*
/*    1. CORE ............ Emerge (núcleo, obrigatório)
/*    2. PLUGINS ......... um bloco por plugin, cada um autónomo:
/*                         Range, Draw, Horizontal, Media, Stack, Reel,
/*                         Text, Spotlight, Scene, Magnetic, Parallax, Particles, Smooth
/*    3. REGISTO ......... uma linha por plugin (Emerge.addPlugin)
/*    4. CARREGADOR CSS .. carrega emerge.css automaticamente
/*
/*  EDITAR   : altere só o que está entre BEGIN e END do plugin.
/*  REMOVER  : apague o bloco inteiro (do BEGIN ao END) e a linha
/*             correspondente na secção REGISTO. O resto continua a funcionar
/*             (as linhas do REGISTO estão protegidas com typeof).
/*  ADICIONAR: cole um novo bloco (IIFE no mesmo formato UMD, com
/*             i.EmergeNome = d()) entre dois plugins, com 3+ linhas em branco
/*             de cada lado, e acrescente uma linha na secção REGISTO.
/*  ORDEM    : o Range deve ficar ANTES dos plugins que dependem dele
/*             (Horizontal, Media, Stack, Reel, Scene, Parallax); a ordem das linhas
/*             do REGISTO é a ordem de registo.
/*
/*  >>> NOTA PARA FUTURAS GERAÇÕES (IA / ferramentas) <<<
/*  Ao regenerar, atualizar ou editar este bundle, MANTENHA esta estrutura:
/*   - cada parte (core, cada plugin, registo, carregador CSS) em secção própria,
/*     com banner "BEGIN ..." e rodapé "END ..." como abaixo;
/*   - pelo menos 3 linhas em branco entre secções, incluindo as que ficam
/*     fora do core (registo e carregador CSS);
/*   - cada plugin autónomo (apagar o bloco não pode quebrar os restantes);
/*   - uma linha de registo protegida por typeof por plugin;
/*   - ao adicionar um plugin novo, criar o bloco + a linha de registo +
/*     atualizar o índice acima, e preservar este comentário.
/* ######################################################################## */



/* ======================================================================== */
/*  BEGIN CORE: Emerge (núcleo)
/*  Obrigatório. Define o global "Emerge" (init, refresh, destroy, addPlugin, ...).
/* ======================================================================== */
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
/* ------------------------------------------------------------------------ */
/*  END CORE: Emerge (núcleo)  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Range  (global: EmergeRange)
/*  Motor de progresso ligado ao scroll (follow / from / to). Base de vários plugins.
/*  Depende de: Nenhuma (é a base)
/* ======================================================================== */
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
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Range  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Draw  (global: EmergeDraw)
/*  Desenho de traços SVG (data-emerge-draw).
/*  Depende de: Opcional: Range (modo ligado ao scroll)
/* ======================================================================== */
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
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Draw  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Horizontal  (global: EmergeHorizontal)
/*  Scroll vertical convertido em faixa horizontal fixa (data-emerge-horizontal).
/*  Depende de: Range
/* ======================================================================== */
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
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Horizontal  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Media  (global: EmergeMedia)
/*  Scrub de <video> / <canvas> com frames pelo scroll (data-emerge-media).
/*  Depende de: Range
/* ======================================================================== */
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
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Media  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Stack  (global: EmergeStack)
/*  Painéis fixos que trocam com o scroll (data-emerge-stack).
/*  Depende de: Range
/* ======================================================================== */
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
                      // scrub + transition: cada painel recebe o progresso
                      // contínuo de entrada (--emerge-stack-p, 0..1) e o lado
                      // relativo ao painel ativo (--emerge-stack-dir, -1/0/1),
                      // para o CSS interpolar o efeito escolhido em
                      // data-emerge-stack-transition pelo próprio scroll.
                      // fade continua idêntico: opacity = 1 - |d|.
                      (a.panels.forEach((E, C) => {
                        const o = C - (l + u),
                          ad = o < 0 ? -o : o,
                          I = ad < 1 ? 1 - ad : 0,
                          e = o > 0 ? 1 : o < 0 ? -1 : 0;
                        ((E.style.opacity = I),
                          E.style.setProperty("--emerge-stack-p", I.toFixed(4)),
                          E.style.setProperty("--emerge-stack-dir", e),
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
            p.style.removeProperty("--emerge-stack-p"),
            p.style.removeProperty("--emerge-stack-dir"),
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
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Stack  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Reel  (global: EmergeReel)
/*  Faixa presa ao ecrã avançada pelo scroll — sucessor unificado do
/*  Horizontal (trilho que translada nos eixos x/y) e do Stack (painéis
/*  empilhados que trocam no eixo none), com um efeito de entrada por
/*  painel por cima do movimento (data-emerge-reel + data-emerge-reel-*).
/*  Depende de: Range
/* ======================================================================== */
/*! Emerge.js v1.7.2 — plugin Reel (global: EmergeReel) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeReel = d());
  })(this, function () {
    "use strict";
    // Reel — o sucessor unificado dos plugins Horizontal e Stack.
    // Uma "bobina": contentor preso ao ecrã (sticky) com N painéis avançados
    // pelo scroll, através de um espaçador alto — tal como nos dois originais.
    //
    //   eixo x / y  → o trilho TRANSLADA entre painéis   (herda do Horizontal)
    //   eixo none   → painéis EMPILHADOS que trocam      (herda do Stack)
    //   transition  → efeito de entrada POR painel (fade/slide/zoom/blur/flip)
    //                 aplicado POR CIMA do movimento — é aqui que os dois
    //                 mundos se combinam (ex.: faixa horizontal com zoom).
    //   reverse     → inverte a viagem (scrub e step): o trilho começa no fim
    //                 e volta ao início; o painel ativo, o index, o local, o
    //                 p/dir e os eventos seguem o que está VISÍVEL, não o
    //                 progresso bruto do scroll.
    //
    // O modo de condução é resolvido pelo JS e escrito em
    // data-emerge-reel-mode="scrub|step" (é este atributo que o CSS lê):
    //   scrub (contínuo) — o JS escreve por frame o transform do trilho e, em
    //                      cada painel, --emerge-reel-p (entrada 0..1) e
    //                      --emerge-reel-dir (-1 antes / +1 depois do ativo).
    //   step  (discreto) — o JS troca .emerge-active e escreve as variáveis
    //                      uma vez por troca; a transição CSS faz a animação.
    // Sem data-emerge-reel-scrub o modo é automático, herdando o default do
    // plugin que o Reel substitui: eixos x/y → scrub (como no Horizontal),
    // eixo none → step (como no Stack sem scrub).
    // O progresso vem do plugin Range (obrigatório), como nos dois originais.
    let i = null;
    const d = new Map(),
      M = (y, p, j) => (y < p ? p : y > j ? j : y);
    function z(y) {
      // measure — recalcula a distância de viagem e a altura do espaçador
      const p = y.el,
        j = y.track,
        b = y.spacer,
        h = y.pin,
        S = y.axis;
      if (S === "none") {
        const D = p.getBoundingClientRect().height || window.innerHeight;
        h &&
          b &&
          (b.style.height = `calc(${Math.ceil(D)}px + ${(y.panels.length - 1) * y.step}vh)`);
      } else {
        const D = Math.max(
          0,
          Math.ceil(
            S === "y"
              ? j.scrollHeight - p.clientHeight
              : j.scrollWidth - p.clientWidth,
          ),
        );
        ((y.distance = D),
          p.style.setProperty("--emerge-reel-distance", `${D}px`),
          h &&
            b &&
            (b.style.height = `${Math.ceil(
              (p.getBoundingClientRect().height || window.innerHeight) +
                D * y.speed,
            )}px`));
      }
      var c;
      (c = y.range) == null || c.measure();
    }
    function Y(y) {
      // watch — liga a bobina ao plugin Range
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
          A(y, b.progress);
        },
      });
    }
    function A(y, S) {
      // aplica o progresso 0..1 no modo resolvido
      const $ = M(S, 0, 1);
      (y.el.style.setProperty("--emerge-reel-progress", $.toFixed(4)),
        y.mode === "scrub" ? N(y, $) : P(y, $));
    }
    function N(y, S) {
      // modo scrub — contínuo (como o Stack com scrub, e o Horizontal)
      const p = y.panels,
        j = p.length - 1,
        // progresso VISUAL — com reverse o trilho é visto de trás para a frente
        v = y.reverse && y.axis !== "none" ? 1 - M(S, 0, 1) : M(S, 0, 1),
        b = v * j,
        h = M(Math.floor(b), 0, Math.max(0, j - 1)),
        S2 = M(b - h, 0, 1),
        c = S2 < 0.5 ? h : h + 1,
        g = y.transition !== "none";
      // efeito por painel: p = proximidade do painel ativo, dir = lado relativo
      p.forEach((E, C) => {
        const o = C - (h + S2),
          ad = o < 0 ? -o : o,
          I = ad < 1 ? 1 - ad : 0,
          e = o > 0 ? 1 : o < 0 ? -1 : 0;
        (g && (E.style.opacity = I),
          E.style.setProperty("--emerge-reel-p", I.toFixed(4)),
          E.style.setProperty("--emerge-reel-dir", e),
          E.classList.toggle("emerge-active", I > 0.001));
      });
      ((y.active = c),
        y.el.style.setProperty("--emerge-reel-index", c),
        y.el.style.setProperty("--emerge-reel-local", S2.toFixed(4)),
        c !== y.lastIndex &&
          ((y.lastIndex = c),
          i.dispatch("emerge:reel:change", {
            el: y.el,
            panel: p[c],
            index: c,
            mode: "scrub",
          })),
        y.axis !== "none" &&
          (function () {
            const E = y.reverse ? -y.distance + y.distance * S : -y.distance * S;
            y.track.style.transform =
              y.axis === "y"
                ? `translate3d(0, ${E.toFixed(1)}px, 0)`
                : `translate3d(${E.toFixed(1)}px, 0, 0)`;
          })());
    }
    function P(y, S) {
      // modo step — discreto (como o Stack sem scrub): troca por evento
      const p = y.panels,
        j = p.length - 1,
        b = M(S, 0, 1) * j,
        h = M(Math.floor(b), 0, Math.max(0, j - 1)),
        S2 = M(b - h, 0, 1),
        c0 = M(S2 < 0.5 ? h : h + 1, 0, j),
        // reverse espelha o painel ativo: a viagem começa no último
        c = y.reverse && y.axis !== "none" ? j - c0 : c0;
      if (y.initDone && c === y.lastIndex) return;
      ((y.initDone = !0),
        (y.lastIndex = c),
        (y.active = c),
        p.forEach((E, C) => {
          const o = C - c,
            e = o > 0 ? 1 : o < 0 ? -1 : 0;
          (E.style.setProperty("--emerge-reel-p", C === c ? "1" : "0"),
            E.style.setProperty("--emerge-reel-dir", e),
            E.classList.toggle("emerge-active", C === c));
        }),
        y.el.style.setProperty("--emerge-reel-index", c),
        y.axis !== "none" &&
          (function () {
            const E = y.panels[c],
              C = y.panels[0],
              g =
                y.axis === "y"
                  ? E.offsetTop - C.offsetTop
                  : E.offsetLeft - C.offsetLeft,
              I = M(g, 0, y.distance);
            y.track.style.transform =
              y.axis === "y"
                ? `translate3d(0, ${(-I).toFixed(1)}px, 0)`
                : `translate3d(${(-I).toFixed(1)}px, 0, 0)`;
          })(),
        i.dispatch("emerge:reel:change", {
          el: y.el,
          panel: p[c],
          index: c,
          mode: "step",
        }));
    }
    function H(y) {
      // build — monta a bobina num contentor [data-emerge-reel]
      var m;
      if (d.has(y)) return d.get(y);
      const p =
          i.numAttr(y, "reel-speed", (m = i.options.reelSpeed) != null ? m : 1) || 1,
        j = i.attr(y, "reel-top", (m = i.options.reelTop) != null ? m : "0px"),
        b = !!i.attr(y, "reel-pin", !0),
        h = !!i.attr(y, "reel-sticky", !0),
        S = !!i.attr(y, "reel-reverse", !1),
        c = i.numAttr(y, "reel-ease", 0),
        g = i.numAttr(y, "reel-step", (m = i.options.reelStep) != null ? m : 100),
        E = (i.attr(y, "reel-motion", (m = i.options.reelMotion) != null ? m : "x") || "x").toLowerCase(),
        C = ["x", "y", "none"].indexOf(E) < 0 ? "x" : E,
        // transição: attr por elemento > opção global > auto por eixo
        I = (function () {
          const e = i.attr(y, "reel-transition", null);
          if (e != null && e !== "" && typeof e != "boolean") return e;
          const o = i.options.reelTransition;
          return o != null ? o : C === "none" ? "fade" : "none";
        })(),
        // modo: "scrub"/true → scrub, "step"/false → step, senão auto por eixo
        e = (function () {
          const o = i.attr(y, "reel-scrub", i.options.reelScrub);
          return o === !0 || o === "scrub"
            ? "scrub"
            : o === !1 || o === "step"
              ? "step"
              : C === "none"
                ? "step"
                : "scrub";
        })(),
        // painéis: filhos diretos (eixo none) ou itens do trilho (eixos x/y)
        o =
          C === "none"
            ? Array.from(y.children).filter(
                (T2) =>
                  T2.nodeType === 1 && !T2.hasAttribute("data-emerge-reel-exclude"),
              )
            : (function () {
                let T2 = y.querySelector(":scope > .emerge-reel-track");
                if (!T2) {
                  T2 = document.createElement("div");
                  T2.className = "emerge-reel-track";
                  Array.from(y.children)
                    .filter(
                      (B2) =>
                        B2.nodeType === 1 &&
                        !B2.hasAttribute("data-emerge-reel-exclude"),
                    )
                    .forEach((B2) => T2.appendChild(B2));
                  y.appendChild(T2);
                }
                return Array.from(T2.children).filter(
                  (B2) => B2.nodeType === 1,
                );
              })();
      if (o.length < 2) return null;
      const ad = b
        ? (function () {
            const T2 = y.parentElement;
            if (
              T2 &&
              T2.classList.contains("emerge-reel-space") &&
              T2.dataset.emergeReelSpaceFor === ""
            )
              return T2;
            const W2 = document.createElement("div");
            return (
              (W2.className = "emerge-reel-space"),
              T2.insertBefore(W2, y),
              W2.appendChild(y),
              W2
            );
          })()
        : null;
      ad && (ad.dataset.emergeReelSpaceFor = "");
      y.classList.add("emerge-reel", `emerge-reel-axis-${C}`);
      b && h && ((y.style.position = "sticky"), (y.style.top = j));
      y.setAttribute("data-emerge-reel-mode", e);
      y.style.setProperty("--emerge-reel-count", o.length);
      o.forEach((T2, W2) => {
        (T2.classList.add("emerge-reel-item", I),
          T2.style.setProperty("--emerge-reel-i", W2),
          i.claim(T2, "Reel"));
      });
      const T2 = {
        el: y,
        track: C === "none" ? null : y.querySelector(":scope > .emerge-reel-track"),
        spacer: ad,
        panels: o,
        axis: C,
        transition: I,
        mode: e,
        pin: b,
        sticky: h,
        speed: p,
        reverse: S,
        ease: c,
        step: g,
        active: 0,
        lastIndex: -1,
        initDone: !1,
        distance: 0,
        range: null,
      };
      return (
        d.set(y, T2),
        z(T2),
        Y(T2),
        A(T2, 0),
        i.dispatch("emerge:reel:build", {
          el: y,
          panels: o,
          track: T2.track,
          axis: C,
          mode: e,
        }),
        T2
      );
    }
    function O(y) {
      // destroy — desfaz tudo o que o build fez
      var j;
      const p = typeof y == "string" ? d.get(document.querySelector(y)) : d.get(y);
      if (!p) return;
      ((j = p.range) == null || j.stop(),
        p.panels.forEach((E) => {
          (E.classList.remove(
            "emerge-reel-item",
            p.transition,
            "emerge-active",
          ),
            (E.style.opacity = ""),
            E.style.removeProperty("--emerge-reel-i"),
            E.style.removeProperty("--emerge-reel-p"),
            E.style.removeProperty("--emerge-reel-dir"),
            i.release(E));
        }),
        p.el.classList.remove("emerge-reel", `emerge-reel-axis-${p.axis}`),
        (p.el.style.position = ""),
        (p.el.style.top = ""),
        p.el.removeAttribute("data-emerge-reel-mode"),
        [
          "--emerge-reel-count",
          "--emerge-reel-index",
          "--emerge-reel-progress",
          "--emerge-reel-local",
          "--emerge-reel-distance",
        ].forEach((E) => p.el.style.removeProperty(E)),
        i.release(p.el),
        p.track &&
          ((p.track.style.transform = ""),
          (function (E, C) {
            E &&
              E.parentElement &&
              (Array.from(E.children).forEach((g) => {
                (g.classList.remove("emerge-reel-item"), C.insertBefore(g, E));
              }),
              E.remove());
          })(p.track, p.el)),
        p.spacer &&
          (function (E, C) {
            if (!E || !E.classList.contains("emerge-reel-space")) return;
            const g = E.parentElement;
            g && (g.insertBefore(C, E), E.remove());
          })(p.spacer, p.el),
        d.delete(p.el));
    }
    function R(y, p) {
      // goTo — scroll suave até a um painel (número, elemento ou seletor)
      const j = typeof y == "string" ? document.querySelector(y) : y,
        b = j && d.get(j);
      if (!b || !b.range) return;
      const h = b.panels.length - 1;
      let S;
      if (typeof p != "number") {
        const E = typeof p == "string" ? (b.track || b.el).querySelector(p) : p;
        if (!E) return;
        if (((S = b.panels.indexOf(E)), S < 0)) return;
        if (b.axis !== "none" && b.distance) {
          const C = b.panels[S],
            g = b.panels[0],
            I =
              b.axis === "y"
                ? C.offsetTop - g.offsetTop
                : C.offsetLeft - g.offsetLeft;
          S = M(I / b.distance, 0, 1) * h; // posição real no trilho (Horizontal)
        }
      } else S = M(p, 0, h);
      const c = h ? M(S, 0, h) / h : 0,
        g = b.reverse && b.axis !== "none" ? 1 - c : c,
        E = b.range.from + g * b.range.span;
      window.scrollTo({ top: E, behavior: "smooth" });
    }
    function W(y = document) {
      y.querySelectorAll("[data-emerge-reel]").forEach((p) => {
        d.has(p) || i.isDisabledFor(p, "reel") || H(p);
      });
    }
    return {
      name: "Reel",
      defaults: {
        reelStep: 100,
        reelMotion: "x",
        reelTransition: null,
        reelSpeed: 1,
        reelTop: "0px",
        reelScrub: null,
      },
      install: (y) => (
        (i = y),
        Object.defineProperty(i, "range", {
          configurable: !0,
          get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
        }),
        {
          build: H,
          destroy: O,
          goTo: R,
          scan: W,
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
          p.hasAttr(y, "reel") &&
            (p.isDisabledFor(y, "reel") || (p.claim(y, "Reel"), H(y)));
        },
        init() {
          W();
        },
        refresh() {
          (Array.from(d.keys())
            .filter(
              (y) => !document.body.contains(y) || i.isDisabledFor(y, "reel"),
            )
            .forEach(O),
            W(),
            d.forEach(z));
        },
        teardown() {
          Array.from(d.keys()).forEach(O);
        },
      },
    };
  });
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Reel  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Text  (global: EmergeText)
/*  Divisão de texto em letras / palavras / linhas (data-emerge-split).
/*  Depende de: Opcional: Range (modo ligado ao scroll)
/* ======================================================================== */
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
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Text  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Spotlight  (global: EmergeSpotlight)
/*  Foco que segue o cursor: reveal / flashlight / focus (data-emerge-spotlight).
/*  Depende de: Nenhuma
/* ======================================================================== */
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
     * Page movement (touch scrolling) can also be decided per axis, which is
     * usually what a full-screen (100dvh) hero needs so the visitor can still
     * swipe down to the rest of the page:
     *
     *   data-emerge-spotlight-move-y="true"   vertical swipes scroll the page
     *   data-emerge-spotlight-move-x="true"   horizontal swipes scroll the page
     *   data-emerge-spotlight-move="true"     shortcut: both axes scroll
     *
     * Axes that scroll are left to the browser (touch-action pan-*); the
     * other axes keep driving the spot. move-x / move-y override move, so
     * move="true" move-y="false" scrolls horizontally only. "false" (or no
     * attribute at all) keeps the data-emerge-spotlight-touch behaviour.
     * When any of the three is present they take over from -touch, except
     * touch="off". API options: moveX, moveY, move. Global: spotlightMove.
     *
     * Intensity: data-emerge-spotlight-move-intensity="120" (px, default 0)
     * is how far the finger must travel along the free axis before the page
     * starts to move. Until then the spot follows the finger and the page
     * stays still, so a short drag shows the effect and a longer one scrolls.
     * It only applies together with move / move-x / move-y. Implemented with
     * a non-passive touchmove that cancels the scroll below the threshold
     * (two-finger pinch is never blocked). API: moveIntensity. Global:
     * spotlightMoveIntensity.
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
        "-move",
        "-move-x",
        "-move-y",
        "-move-intensity",
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
        "-only",
        "-only-mobile",
        "-only-desktop",
        "-only-tablet",
        "-only-phone",
        "-only-size",
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
        "mask",
      ].map((s) => `--emerge-spotlight-${s}`),
      // Safari / WebKit: needs a fully resolved mask gradient (no nested var())
      // and cannot combine backdrop-filter with mask-image on one element.
      IS_WEBKIT =
        typeof navigator !== "undefined" &&
        /AppleWebKit/i.test(navigator.userAgent) &&
        !/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(navigator.userAgent);

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
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="-75 -75 150 150" preserveAspectRatio="none">${body}</svg>`;
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
          allowed.indexOf(v) > -1 ? v : fallback,
        // true / false when set, null when not set at all
        tri = (key, name, fallback) => {
          if (given(key)) return !!ex[key];
          const v = core.attr(el, name, null);
          if (v === null) return fallback;
          return v !== false && v !== "0" && v !== "off";
        };

      // Page movement per axis: move sets both, move-x / move-y override it.
      const moveAll = tri("move", "spotlight-move", typeof o.spotlightMove == "boolean" ? o.spotlightMove : null),
        moveX = tri("moveX", "spotlight-move-x", moveAll),
        moveY = tri("moveY", "spotlight-move-y", moveAll);

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
        touch: (() => {
          const t = choice(
            "touch",
            "spotlight-touch",
            valid(o.spotlightTouch, TOUCH_MODES, "track"),
            TOUCH_MODES,
          );
          if (t === "off" || (moveX === null && moveY === null)) return t;
          if (moveX && moveY) return "scroll";
          return moveY ? "pan-y" : moveX ? "pan-x" : "track";
        })(),
        moveX: moveX === true,
        moveY: moveY === true,
        // px of finger travel before the page is allowed to move (0 = off)
        moveIntensity: Math.max(
          0,
          number(
            "moveIntensity",
            "spotlight-move-intensity",
            toNumber(o.spotlightMoveIntensity, 0),
          ),
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
        this.ov = null; // WebKit only: real overlay element (flashlight / focus)
        this.wk = new WeakMap(); // WebKit only: last inline mask written per element
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
        this.fmBusy = false; // WebKit: fluid mask is being decoded
        this.fmNext = null; // WebKit: latest fluid mask waiting to be applied
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
        this._tstart = (e) => this._onTouchStart(e);
        this._tmove = (e) => this._onTouchMove(e);
        this.tx = this.ty = 0; // where the current touch started
        this.tOpen = false; // drag already went past the move-intensity
        this.tBound = false;

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
        this.fmNext = null;
        this._dropOverlay();
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
        this._cls("emerge-spotlight-webkit", IS_WEBKIT);
        // touch-action lives in the CSS (one class per touch mode). It is only
        // applied while this instance actually listens to touch pointers, so a
        // "hover" / "manual" / touch="off" host keeps native gestures untouched.
        const touchOn = cfg.trigger === "pointer" && cfg.touch !== "off";
        TOUCH_MODES.forEach((m) =>
          this._cls(`emerge-spotlight-touch-${m}`, touchOn && m === cfg.touch),
        );
        this._syncLayers();
        this._syncOverlay();

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

        if (
          !prev ||
          prev.trigger !== cfg.trigger ||
          prev.touch !== cfg.touch ||
          prev.moveIntensity !== cfg.moveIntensity ||
          prev.moveX !== cfg.moveX ||
          prev.moveY !== cfg.moveY
        )
          this._bind();
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
        if (live || alive) this._fluidMask(url);
        else {
          this.fmNext = null;
          this._set("--emerge-spotlight-shape-img", EMPTY_MASK);
          IS_WEBKIT &&
            this._paintWebkit(this.last["--emerge-spotlight-strength"]);
        }
        return live || alive;
      }

      // Fluid mask. Safari / iOS decode a changed mask-image URL
      // asynchronously: swapping a new data URI every frame means the
      // previous one is replaced before it is ready, so the mask stays empty
      // and the spot never shows. On WebKit the mask is therefore applied
      // only once decoded, one at a time, always the latest one.
      _fluidMask(url) {
        const prop = "--emerge-spotlight-shape-img";
        if (!IS_WEBKIT) return this._set(prop, `url("${url}")`);
        this.fmNext = url;
        if (this.fmBusy) return;
        const run = () => {
          const u = this.fmNext;
          this.fmNext = null;
          if (!u || instances.get(this.el) !== this) return;
          this.fmBusy = true;
          let fired = false;
          const done = () => {
            if (fired) return;
            fired = true;
            this.fmBusy = false;
            if (this.fl && instances.get(this.el) === this) {
              this._set(prop, `url("${u}")`);
              // repaint now: the engine may already be asleep
              this._paintWebkit(this.last["--emerge-spotlight-strength"]);
            }
            this.fmNext && run();
          };
          const img = new Image();
          img.onload = img.onerror = done;
          img.src = u;
          img.decode && img.decode().then(done, done);
        };
        run();
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
        // Resolved radial mask (Safari does not reliably resolve the nested
        // var() gradient of the CSS fallback). Inline on the host, so it wins.
        {
          const insideOpaque = (c.mode === "reveal") !== c.reverse,
            inner = `${round(((c.radius - c.softness) / c.radius) * 100, 100)}%`,
            c0 = insideOpaque ? "#000" : "transparent",
            c1 = insideOpaque ? "transparent" : "#000",
            sz =
              c.shape === "ellipse"
                ? `${round(rx, 100)}px ${round(ry, 100)}px`
                : `${round(rx, 100)}px`,
            cx = this.w ? `${round(this.x, 100)}px` : "50%",
            cy = this.w ? `${round(this.y, 100)}px` : "50%";
          this._set(
            "--emerge-spotlight-mask",
            `radial-gradient(${c.shape === "ellipse" ? "ellipse" : "circle"} ${sz} at ${cx} ${cy}, ${c0} 0%, ${c0} ${inner}, ${c1} 100%)`,
          );
        }
        // Opacity of the flashlight / focus overlay. "persist" keeps the
        // effect on the content even when the pointer is away.
        const strength = String(
          c.persist && c.mode !== "reveal" ? 1 : round(this.k, 1000),
        );
        this._set("--emerge-spotlight-strength", strength);
        if (IS_WEBKIT) this._paintWebkit(strength);
      }

      // Safari / WebKit: a mask-image that reads a custom property
      // (var(--emerge-spotlight-mask)) is NOT repainted when only that
      // property changes, so the mask stays frozen at its first value (a
      // 0.01px spot: reveal shows nothing, flashlight / focus cut no hole).
      // Workaround: write the resolved mask straight onto the masked
      // elements (the layers, or a real overlay element, since a
      // pseudo-element cannot take inline style). Other browsers keep the
      // pure-CSS path untouched.
      _syncOverlay() {
        if (!IS_WEBKIT) return;
        if (this.cfg.mode !== "reveal") {
          if (!this.ov) {
            const o = document.createElement("span");
            o.className = "emerge-spotlight-overlay";
            o.setAttribute("aria-hidden", "true");
            this.el.appendChild(o);
            this.ov = o;
          }
        } else this._dropOverlay();
      }

      _dropOverlay() {
        if (!this.ov) return;
        this.ov.remove();
        this.ov = null;
      }

      // Inline mask for one element. Mirrors the CSS rules for radial,
      // shaped, shaped + outside and fluid masks.
      _paintWebkit(strength) {
        const c = this.cfg,
          els = c.mode === "reveal" ? this.layers : this.ov ? [this.ov] : [];
        if (!els.length) return;
        let img, size, pos, comp;
        if (isRadial(c.shape)) {
          img = this.last["--emerge-spotlight-mask"];
          size = pos = comp = "";
        } else {
          const shapeImg = this.last["--emerge-spotlight-shape-img"] || "none",
            insideOpaque = (c.mode === "reveal") !== c.reverse,
            outside = !insideOpaque,
            fluid = c.shape === "fluid";
          let tw = 0,
            th = 0;
          if (!fluid) {
            const rx = Math.max(c.radius * this.k, 0.01),
              wide = c.shape === "rect";
            tw = round(rx * 3, 100);
            th = round(Math.max(rx * (wide ? c.ratio : 1), 0.01) * 3, 100);
          }
          const one = fluid
              ? "0 0"
              : `${round(this.x - tw / 2, 100)}px ${round(this.y - th / 2, 100)}px`,
            sz = fluid ? "100% 100%" : `${tw}px ${th}px`;
          img = outside ? `${shapeImg}, linear-gradient(#000, #000)` : shapeImg;
          size = outside ? `${sz}, 100% 100%` : sz;
          pos = outside ? `${one}, 0 0` : one;
          comp = outside ? "xor" : "";
        }
        const key = [img, size, pos, comp, strength].join("|");
        els.forEach((el) => {
          if (this.wk.get(el) === key) return;
          this.wk.set(el, key);
          const s = el.style;
          s.webkitMaskImage = img || "";
          s.webkitMaskSize = size;
          s.webkitMaskPosition = pos;
          s.webkitMaskRepeat = size ? "no-repeat" : "";
          s.webkitMaskComposite = comp;
          if (el === this.ov) s.opacity = strength;
        });
      }

      _clearWebkit(el) {
        const s = el.style;
        s.removeProperty("-webkit-mask-image");
        s.removeProperty("-webkit-mask-size");
        s.removeProperty("-webkit-mask-position");
        s.removeProperty("-webkit-mask-repeat");
        s.removeProperty("-webkit-mask-composite");
        this.wk.delete(el);
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
        IS_WEBKIT && this._clearWebkit(l);
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
        // move-intensity: the page may only scroll after a long enough drag.
        // touchmove has to be non-passive to be able to cancel the scroll.
        const c = this.cfg;
        if (c.moveIntensity > 0 && (c.moveX || c.moveY) && c.touch !== "off") {
          el.addEventListener("touchstart", this._tstart, opts);
          el.addEventListener("touchmove", this._tmove, { passive: false });
          this.tBound = true;
        }
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
          if (this.tBound) {
            el.removeEventListener("touchstart", this._tstart);
            el.removeEventListener("touchmove", this._tmove);
            this.tBound = false;
          }
          this.bound = false;
        }
        if (this.hasPointer) {
          this.hasPointer = false;
          this.kt = 0;
        }
        this._press(false);
      }

      // move-intensity: remember where a one-finger touch started.
      _onTouchStart(e) {
        const t = e.touches;
        this.tOpen = false;
        if (t.length !== 1) return (this.tOpen = true); // pinch: never block
        this.tx = t[0].clientX;
        this.ty = t[0].clientY;
      }

      // Below the threshold the scroll is cancelled and only the spot moves;
      // past it the browser takes over and scrolls the page.
      _onTouchMove(e) {
        if (this.tOpen || !e.cancelable) return;
        const t = e.touches;
        if (t.length !== 1) return (this.tOpen = true);
        const c = this.cfg,
          dx = t[0].clientX - this.tx,
          dy = t[0].clientY - this.ty,
          dist =
            c.moveX && c.moveY
              ? Math.hypot(dx, dy)
              : c.moveY
                ? Math.abs(dy)
                : Math.abs(dx);
        if (dist >= c.moveIntensity) this.tOpen = true;
        else e.preventDefault();
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
        spotlightMove: null,
        spotlightMoveIntensity: 0,
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
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Spotlight  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Scene  (global: EmergeScene)
/*  Hero fixa animada pelo scroll: unfold, fold, bloom, zoom, slide, wheel, curtain, blur (data-emerge-scene).
/*  Depende de: Range
/* ======================================================================== */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeScene = d());
  })(this, function () {
    "use strict";
    // Scene — hero fixa (sticky) animada pelo scroll.
    // Preset "unfold": replica a timeline GSAP do original (tabela 2.7) sem GSAP.
    // Preset "fold" (v1.2.0): o inverso — o painel começa a cobrir a cena e
    // encolhe até um cartão centrado (estilo landonorris.com); com
    // data-emerge-scene-scale="0" (v1.3.0) encolhe até desaparecer por inteiro.
    // Preset "bloom" (v1.3.0): a div seguinte não vem de baixo — nasce PELO
    // CENTRO (scale pequeno → 1, opacity 0 → 1, raio → 0) e cresce até cobrir.
    // Presets v1.4.0 — mais formas de a div seguinte chegar:
    //   "zoom"    — entra GRANDE (scale > 1) e transparente e RECUA até ao
    //               tamanho natural (dolly-out; o oposto do bloom);
    //   "slide"   — empurra pela DIREITA (translateX 100% → 0), opaco, com
    //               parallax do content para o lado oposto;
    //   "wheel"   — gira em rotateY (spin → 0) com scale pequeno → 1;
    //   "curtain" — revelação em ÍRIS: clip-path circle() abre do centro
    //               (raio 0 → metade da diagonal da cena), sem movimento;
    //   "blur"    — entra DESFOCADO (filter blur → 0) e ligeiramente maior,
    //               "focando" ao scroll; o content esvanece desfocando.
    // O progresso e o suavizado ("scrub") vêm do plugin Range, como no
    // Horizontal/Stack; a avaliação dos steps é local:
    //   p = clamp((P - start) / (end - start)),  e = 1 - (1 - p)^2 (power1.out),
    //   valor = from + (to - from) * e.
    let core = null;
    const instances = new Map();
    const TOTAL = 3.5; // duração total da timeline original (unidades GSAP)
    let lastWidth = 0;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const easeOut = (p) => 1 - (1 - p) * (1 - p);
    const f4 = (n) => n.toFixed(4);

    function toEl(x) {
      return typeof x == "string" ? document.querySelector(x) : x;
    }

    // ---- opções: atributo no elemento > token CSS > default -----------------
    // O fold inverte o papel de tilt/scale/offset/radius (passam a ser os
    // valores FINAIS do painel) e por isso tem defaults próprios; com
    // scale 0 (ou quase 0) o painel encolhe até desaparecer por inteiro.
    // O bloom tem defaults próprios pelo mesmo motivo: as quatro opções
    // descrevem o estado INICIAL do painel, "nascendo pelo centro".
    // Nos presets v1.4.0 as quatro opções descrevem igualmente o estado
    // INICIAL do painel (no zoom/blur é scale > 1: "vem de muito perto");
    // o wheel/curtain têm perspective-origin própria (centro) e ganham duas
    // opções novas: "spin" (ângulo rotateY inicial do wheel) e "blur" (raio
    // de desfoque inicial do blur), ambas com token CSS homónimo.
    const PRESET_DEFAULTS = {
      fold: { sceneTilt: 0, sceneScale: 0.5, sceneOffset: 0, sceneRadius: "2rem" },
      bloom: { sceneTilt: 0, sceneScale: 0.44, sceneOffset: 0, sceneRadius: "2rem" },
      zoom: { sceneTilt: 0, sceneScale: 1.6, sceneOffset: 0, sceneRadius: "2rem" },
      slide: { sceneTilt: 0, sceneScale: 1, sceneOffset: 0, sceneRadius: "2rem" },
      wheel: { sceneTilt: 0, sceneScale: 0.7, sceneOffset: 0, sceneRadius: "2rem", sceneOrigin: "50% 50%", spin: 90 },
      curtain: { sceneTilt: 0, sceneScale: 1, sceneOffset: 0, sceneRadius: "2rem", sceneOrigin: "50% 50%" },
      blur: { sceneTilt: 0, sceneScale: 1.12, sceneOffset: 0, sceneRadius: "2rem", blur: 24 },
    };
    function num(v, d) {
      const n = parseFloat(v);
      return Number.isNaN(n) ? d : n;
    }
    function resolveOptions(el, preset) {
      const base = (preset && PRESET_DEFAULTS[preset]) || {};
      const o = { ...core.options, ...base };
      const cs = getComputedStyle(el);
      // Em todos os presets menos o unfold, tilt/scale/offset/radius mudam de
      // papel (descrevem o estado INICIAL do painel, não o do unfold) e por
      // isso ignoram os tokens :root da folha de estilos — a personalização
      // faz-se por atributos. No wheel/curtain o origin também é próprio
      // (centro: a fuga "50% 78%" do unfold não serve para o giro/íris).
      const noToken =
        preset === "unfold"
          ? null
          : preset === "wheel" || preset === "curtain"
            ? { tilt: 1, scale: 1, offset: 1, radius: 1, origin: 1 }
            : { tilt: 1, scale: 1, offset: 1, radius: 1 };
      const read = (name, d) => {
        const a = el.getAttribute(`data-emerge-scene-${name}`);
        if (a != null && String(a).trim() !== "") return String(a).trim();
        if (noToken && noToken[name]) return d;
        const t = (cs.getPropertyValue(`--emerge-scene-${name}`) || "").trim();
        return t !== "" ? t : d;
      };
      return {
        distance: Math.max(0, num(read("distance", o.sceneDistance), o.sceneDistance)),
        perspective: num(read("perspective", o.scenePerspective), o.scenePerspective),
        origin: read("origin", o.sceneOrigin),
        tilt: num(read("tilt", o.sceneTilt), o.sceneTilt),
        scale: num(read("scale", o.sceneScale), o.sceneScale),
        scaleY: read("scale-y", null), // só no fold/bloom; null = segue o scale
        offset: num(read("offset", o.sceneOffset), o.sceneOffset),
        radius: read("radius", o.sceneRadius),
        spin: num(read("spin", base.spin != null ? base.spin : 0), base.spin != null ? base.spin : 0), // rotateY inicial (wheel)
        blur: num(read("blur", base.blur != null ? base.blur : 0), base.blur != null ? base.blur : 0), // raio do desfoque (blur)
        smooth: Math.max(0, num(read("smooth", o.sceneSmooth), o.sceneSmooth)),
      };
    }
    // O border-radius animado é a exceção combinada: converte o valor inicial
    // (p. ex. "5vw") para px uma única vez por measure, para interpolar números.
    function radiusToPx(panel, value) {
      if (!panel) return 0;
      const prev = panel.style.borderRadius;
      panel.style.borderRadius = String(value);
      const n = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0;
      panel.style.borderRadius = prev;
      return n;
    }

    // ---- tabela 2.7 como steps {target, prop, from, to, start, end} ---------
    // start/end já normalizados (divididos por TOTAL). A ordem importa: para o
    // mesmo alvo+propriedade, o último step começado é que ganha. A estrutura é
    // genérica — expor mais presets/API pública depois não exige reescrita.
    function buildSteps(o) {
      return [
        // 1: luz secundária nasce              0.0000 – 0.2857
        { target: "layerB", prop: "opacity", from: 0, to: 1, start: 0, end: 1 / TOTAL },
        // 2: luz primária apaga-se             0.0000 – 0.2857
        { target: "layerA", prop: "opacity", from: 1, to: 0, start: 0, end: 1 / TOTAL },
        // 3: conteúdo da hero desaparece       0.1143 – 0.4000
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0.4 / TOTAL, end: 1.4 / TOTAL },
        // 4: luz secundária apaga-se (pisca)   0.2857 – 0.3429
        { target: "layerB", prop: "opacity", from: 1, to: 0, start: 1 / TOTAL, end: 1.2 / TOTAL },
        // 5: painel aparece                    0.2857 – 0.4000
        { target: "panel", prop: "opacity", from: 0, to: 1, start: 1 / TOTAL, end: 1.4 / TOTAL },
        // 6a/6b/6c: o painel levanta-se        0.3143 – 0.8857
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: 1.1 / TOTAL, end: 3.1 / TOTAL },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: 1.1 / TOTAL, end: 3.1 / TOTAL },
        // translateY em % (da altura do próprio painel) == animar "top" no
        // original, porque o painel mede 100% da altura do contentor.
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: 1.1 / TOTAL, end: 3.1 / TOTAL },
        // 7: cantos perdem o raio              0.3143 – 0.6000
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 1.1 / TOTAL, end: 2.1 / TOTAL },
        // 8: cobertura revela o vídeo          0.4571 – 0.7429
        { target: "cover", prop: "opacity", from: 1, to: 0, start: 1.6 / TOTAL, end: 2.6 / TOTAL },
        // 9: pausa final 0.8857 – 1.0 (sem steps: o estado mantém-se)
      ];
    }

    // ---- preset "fold": o inverso do unfold — o painel começa a cobrir a
    // cena (plano, opaco, sem raio) e encolhe até um cartão centrado, com
    // escala X/Y independentes (cartão "retrato" num ecrã panorâmico).
    // Janelas já normalizadas (0–1). cover/layers não são animados; o
    // content ganha um leve zoom-out para dar profundidade.
    function syEndOf(o) {
      return o.scaleY != null ? num(o.scaleY, o.scale) : o.scale;
    }
    function buildStepsFold(o) {
      const syEnd = syEndOf(o);
      // scale 0 (ou quase 0): o painel encolhe até DESAPARECER por inteiro —
      // a janela estica um pouco e a opacity cai no fim (evita subpixel).
      const gone = o.scale <= 0.05 && syEnd <= 0.05;
      const sEnd = gone ? 0.78 : 0.7;
      const steps = [
        { target: "content", prop: "scale", from: 1.15, to: 1, start: 0, end: gone ? sEnd : 1 },
        { target: "panel", prop: "scaleX", from: 1, to: o.scale, start: 0, end: sEnd },
        { target: "panel", prop: "scaleY", from: 1, to: syEnd, start: 0, end: sEnd },
        // configuráveis (defaults 0 = sem efeito visual)
        { target: "panel", prop: "rotateX", from: 0, to: o.tilt, start: 0, end: sEnd },
        { target: "panel", prop: "translateY", from: 0, to: o.offset, start: 0, end: sEnd },
        // os cantos ganham o raio
        { target: "panel", prop: "radius", from: 0, to: o.radiusPx, start: 0.1, end: gone ? 0.62 : 0.6 },
      ];
      // só no modo "desaparecer": o painel esvanece antes de chegar a scale 0
      if (gone)
        steps.push({ target: "panel", prop: "opacity", from: 1, to: 0, start: 0.62, end: 0.76 });
      return steps;
    }

    // ---- preset "bloom" (v1.3.0): a div seguinte não vem de baixo — nasce
    // PELO CENTRO: começa pequena (scale), transparente e com raio, e cresce
    // até cobrir a cena. tilt e offset continuam disponíveis (defaults 0 =
    // crescimento puro a partir do centro); o content, se existir, cede o
    // lugar cedo. Janelas já normalizadas (0–1).
    function buildStepsBloom(o) {
      const syEnd = syEndOf(o);
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.25 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: 0.08, end: 0.45 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: 0.08, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEnd, to: 1, start: 0.08, end: 0.85 },
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: 0.08, end: 0.85 },
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: 0.08, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 0.08, end: 0.7 },
        // pausa final 0.85 – 1.0 (sem steps: o estado mantém-se)
      ];
    }

    // ---- presets v1.4.0 — mais formas de a div seguinte chegar. Todos são
    // "de entrada" como o bloom: o content da cena cede cedo e o painel
    // cresce até cobrir. As janelas seguem o padrão do bloom (pausa final
    // 0.85–1.0) e os defaults de pintura no paint() coincidem com os "from"
    // destas tabelas (continuidade garantida ao entrar na janela).

    // "zoom" — dolly-out, o oposto do bloom: o painel começa GRANDE
    // (scale > 1, default 1.6) e transparente, como se estivesse à frente da
    // câmara, e RECUA até ao tamanho natural enquanto ganha corpo. O content
    // afasta-se para trás (scale up) enquanto esvanece — profundidade.
    function buildStepsZoom(o) {
      const s0 = 0.04;
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.25 },
        { target: "content", prop: "scale", from: 1, to: 1.18, start: 0, end: 0.5 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: s0, end: 0.4 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEndOf(o), to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: s0, end: 0.65 },
      ];
    }

    // "slide" — empurrão lateral: o painel entra pela DIREITA (translateX
    // 100% → 0), opaco do princípio ao fim, plano; o content desliza uns
    // percentuais para o lado oposto (parallax). offset (translateY) continua
    // disponível — com offset ≠ 0 o empurrão fica diagonal.
    function buildStepsSlide(o) {
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.5 },
        { target: "content", prop: "translateX", from: 0, to: -12, start: 0, end: 0.6 },
        { target: "panel", prop: "translateX", from: 100, to: 0, start: 0, end: 0.85 },
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: 0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 0.15, end: 0.6 },
      ];
    }

    // "wheel" — giro de cartão em 3D: o painel entra rodado em rotateY
    // (opção "spin", default 90°) e pequeno (scale 0.7), ganha opacidade cedo
    // e endireita-se até cobrir. A perspective da cena (origin no centro
    // neste preset) dá a profundidade; o raio fecha durante o giro.
    function buildStepsWheel(o) {
      const s0 = 0.04;
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.25 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: s0, end: 0.4 },
        { target: "panel", prop: "rotateY", from: o.spin, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEndOf(o), to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: s0, end: 0.65 },
      ];
    }

    // "curtain" — revelação em íris: o painel está lá todo desde o primeiro
    // frame mas tapado por um clip-path circular que ABRE DO CENTRO (raio 0 →
    // metade da diagonal da cena, medida no measure). Sem movimento nem
    // escala — só o círculo a crescer; o centro do círculo é o "origin". O
    // raio do painel fecha no início da abertura para o estado final ficar a
    // 0 (cantos retos a cobrir o ecrã).
    function buildStepsCurtain(o) {
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.2 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 0.03, end: 0.5 },
        { target: "panel", prop: "clip", from: 0, to: o.irisTo, start: 0.03, end: 0.85 },
      ];
    }

    // "blur" — foco de profundidade: o painel entra DESFOCADO (filter blur,
    // default 24px) e ligeiramente maior (scale 1.12) e "foca" ao scroll; o
    // content esvanece desfocando por sua vez (blur 0 → 10px). filter é
    // caro em ecrãs grandes: o raio é configurável (0 desliga o desfoque).
    function buildStepsBlur(o) {
      const s0 = 0.03;
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.3 },
        { target: "content", prop: "blur", from: 0, to: 10, start: 0, end: 0.45 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: s0, end: 0.4 },
        { target: "panel", prop: "blur", from: o.blur, to: 0, start: s0, end: 0.8 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEndOf(o), to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: s0, end: 0.6 },
      ];
    }

    // Lista oficial de presets (whitelist do build) e o respetivo construtor
    // de steps — acrescentar um preset novo daqui para a frente é uma linha
    // aqui e o respetivo buildStepsX.
    const PRESETS = ["unfold", "fold", "bloom", "zoom", "slide", "wheel", "curtain", "blur"];
    const BUILDERS = {
      unfold: buildSteps,
      fold: buildStepsFold,
      bloom: buildStepsBloom,
      zoom: buildStepsZoom,
      slide: buildStepsSlide,
      wheel: buildStepsWheel,
      curtain: buildStepsCurtain,
      blur: buildStepsBlur,
    };

    // ---- pintura: um ciclo de escrita por frame, sem leituras intercaladas ---
    function paint(inst, p) {
      const mode = inst.preset; // ver PRESETS
      const flat = mode !== "unfold"; // todos menos o unfold: sem luzes/capa, com scaleY
      // presets em que o painel é opaco "por natureza" (o default de opacity
      // é 1): o fold começa a cobrir, o slide entra pela direita e o curtain
      // é tapado pelo clip-path (a opacity não faz parte da sua timeline).
      const opaque = mode === "fold" || mode === "slide" || mode === "curtain";
      const v = {};
      for (const s of inst.steps) {
        if (p < s.start) continue; // ainda não começou; o último começado ganha
        const k = clamp((p - s.start) / (s.end - s.start), 0, 1);
        v[s.prop + "@" + s.target] = s.from + (s.to - s.from) * easeOut(k);
      }
      const set = (el, key, value, fmt) => {
        if (!el || value == null) return;
        const s = fmt ? fmt(value) : String(value);
        if (inst.last[key] === s) return;
        inst.last[key] = s;
        el.style[key.slice(key.indexOf(".") + 1)] = s; // "panel.opacity" -> "opacity"
      };
      const t = inst.targets;
      set(t.content, "content.opacity", v["opacity@content"] != null ? v["opacity@content"] : 1, f4);
      if (mode === "fold" && t.content)
        set(t.content, "content.scale", v["scale@content"] != null ? v["scale@content"] : 1.15, f4);
      // content transform/filter genéricos (zoom: afasta-se para trás; slide:
      // parallax lateral; blur: esvanece desfocando). O fold mantém o seu
      // caminho próprio (acima, via propriedade CSS "scale").
      if (t.content && (mode === "zoom" || mode === "slide")) {
        const cScale = v["scale@content"] != null ? v["scale@content"] : 1;
        const cTx = v["translateX@content"] != null ? v["translateX@content"] : 0;
        const ctr =
          cScale !== 1 || cTx !== 0 ? `translateX(${cTx.toFixed(3)}%) scale(${f4(cScale)})` : "";
        if (ctr) {
          if (inst.last.ctr !== ctr) {
            inst.last.ctr = ctr;
            t.content.style.transform = ctr;
          }
        } else if (inst.last.ctr) {
          inst.last.ctr = "";
          t.content.style.removeProperty("transform");
        }
      }
      if (t.content && mode === "blur") {
        const cBlur = v["blur@content"] != null ? v["blur@content"] : 0;
        const cf = cBlur > 0 ? `blur(${cBlur.toFixed(2)}px)` : "";
        if (cf) {
          if (inst.last.cf !== cf) {
            inst.last.cf = cf;
            t.content.style.filter = cf;
          }
        } else if (inst.last.cf) {
          inst.last.cf = "";
          t.content.style.removeProperty("filter");
        }
      }
      // no fold/bloom e nos presets v1.4.0, layers/cover não fazem parte da
      // timeline: ficam com o estilo do autor (o layer-b só começa com
      // opacity 0 no unfold)
      if (!flat) {
        set(t.layerA, "layerA.opacity", v["opacity@layerA"] != null ? v["opacity@layerA"] : 1, f4);
        set(t.layerB, "layerB.opacity", v["opacity@layerB"] != null ? v["opacity@layerB"] : 0, f4);
        set(t.cover, "cover.opacity", v["opacity@cover"] != null ? v["opacity@cover"] : 1, f4);
      }
      if (t.panel) {
        // fold/slide/curtain: o painel é opaco; restantes: começa invisível
        set(t.panel, "panel.opacity", v["opacity@panel"] != null ? v["opacity@panel"] : opaque ? 1 : 0, f4);
        // translateY antes de rotateX/rotateY/scale: a translação fica "por
        // fora" da rotação em torno do centro (equivale ao `top` animado do
        // original). Os defaults coincidem com os "from" das tabelas de steps
        // de cada preset (continuidade ao entrar na janela).
        const d = inst.opts;
        const ty = v["translateY@panel"] != null ? v["translateY@panel"] : mode === "fold" ? 0 : d.offset;
        const tx = v["translateX@panel"] != null ? v["translateX@panel"] : 0;
        const rx = v["rotateX@panel"] != null ? v["rotateX@panel"] : mode === "fold" ? 0 : d.tilt;
        const ry = v["rotateY@panel"] != null ? v["rotateY@panel"] : d.spin; // wheel
        const sx = v["scaleX@panel"] != null ? v["scaleX@panel"] : mode === "fold" ? 1 : d.scale;
        // fold/unfold não usam scaleY; nos restantes o default é o estado
        // inicial do eixo Y (o "scale" do preset, ou o "scale-y" se existir)
        const sy =
          v["scaleY@panel"] != null ? v["scaleY@panel"] : mode === "unfold" || mode === "fold" ? 1 : syEndOf(d);
        // fold/bloom acrescentaram scaleY (v1.3.0); v1.4.0 acrescenta
        // translateX (slide) e rotateY (wheel) à mesma cadeia.
        const tr = flat
          ? `translateY(${ty}%) translateX(${tx}%) rotateX(${rx}deg) rotateY(${ry}deg) scaleX(${sx}) scaleY(${sy})`
          : `translateY(${ty}%) rotateX(${rx}deg) scaleX(${sx})`;
        if (inst.last.transform !== tr) {
          inst.last.transform = tr;
          t.panel.style.transform = tr;
        }
        const rd = v["radius@panel"] != null ? v["radius@panel"] : mode === "fold" ? 0 : inst.radiusFrom;
        set(t.panel, "panel.borderRadius", rd, (n) => n.toFixed(2) + "px");
        // curtain: clip-path circular (íris) — raio 0 → metade da diagonal.
        // Formato estável para o guard de escrita (mesma string = sem write).
        const cl = v["clip@panel"] != null ? v["clip@panel"] : mode === "curtain" ? 0 : null;
        if (cl != null) {
          const cs = `circle(${cl.toFixed(1)}px at ${d.origin})`;
          if (inst.last.clip !== cs) {
            inst.last.clip = cs;
            t.panel.style.clipPath = cs;
          }
        } else if (inst.last.clip) {
          inst.last.clip = "";
          t.panel.style.removeProperty("clip-path");
        }
        // blur: filter blur no painel (só este preset escreve filter)
        const pb = v["blur@panel"] != null ? v["blur@panel"] : mode === "blur" ? d.blur : 0;
        const pf = pb > 0 ? `blur(${pb.toFixed(2)}px)` : "";
        if (pf) {
          if (inst.last.pf !== pf) {
            inst.last.pf = pf;
            t.panel.style.filter = pf;
          }
        } else if (inst.last.pf) {
          inst.last.pf = "";
          t.panel.style.removeProperty("filter");
        }
      }
      const prog = f4(p);
      if (inst.last.progress !== prog) {
        inst.last.progress = prog;
        inst.el.style.setProperty("--emerge-scene-progress", prog);
        core.dispatch("emerge:scene:progress", { el: inst.el, progress: p });
      }
      // will-change só enquanto a cena está efetivamente a ser animada.
      const live = p > 0 && p < 1;
      if (live !== inst.live) {
        inst.live = live;
        inst.el.classList.toggle("emerge-scene-live", live);
      }
    }

    // ---- alvos e espaçador ---------------------------------------------------
    function collect(el) {
      const t = {};
      t.content = el.querySelector("[data-emerge-scene-content]");
      t.layerA = el.querySelector('[data-emerge-scene-layer="a"]');
      t.layerB = el.querySelector('[data-emerge-scene-layer="b"]');
      // O painel tem de ser filho DIRETO do elemento com perspective; se vier
      // aninhado mais fundo, avisamos (debug) em vez de falhar em silêncio.
      t.panel =
        el.querySelector(":scope > [data-emerge-scene-panel]") ||
        el.querySelector("[data-emerge-scene-panel]");
      t.cover = t.panel
        ? t.panel.querySelector("[data-emerge-scene-cover]") ||
          el.querySelector("[data-emerge-scene-cover]")
        : el.querySelector("[data-emerge-scene-cover]");
      return t;
    }

    function wrap(el) {
      const parent = el.parentElement;
      if (
        parent &&
        parent.classList.contains("emerge-scene-space") &&
        parent.dataset.emergeSceneSpaceFor === ""
      )
        return parent;
      const spacer = document.createElement("div");
      spacer.className = "emerge-scene-space";
      parent.insertBefore(spacer, el);
      spacer.appendChild(el);
      return spacer;
    }
    function unwrap(spacer, el) {
      if (!spacer || !spacer.classList.contains("emerge-scene-space")) return;
      const parent = spacer.parentElement;
      parent && parent.insertBefore(el, spacer);
      spacer.remove();
    }

    // ---- medida ---------------------------------------------------------------
    function measure(inst) {
      if (inst.static) return;
      const el = inst.el;
      inst.opts = resolveOptions(el, inst.preset); // relê tokens: apanha overrides em @media
      inst.radiusFrom = radiusToPx(inst.targets.panel, inst.opts.radius);
      // curtain: raio final da íris = metade da diagonal da cena (+2px de
      // folga) — cobre os cantos em qualquer aspecto; medido do próprio el,
      // que não leva transform (os transforms ficam no painel).
      const r = el.getBoundingClientRect();
      const h = r.height || window.innerHeight;
      inst.irisTo = Math.ceil(Math.hypot(r.width, h) / 2) + 2;
      inst.steps = BUILDERS[inst.preset]({ ...inst.opts, radiusPx: inst.radiusFrom, irisTo: inst.irisTo });
      el.style.perspective = inst.opts.perspective + "px";
      el.style.perspectiveOrigin = inst.opts.origin;
      inst.spacer && (inst.spacer.style.height = Math.ceil(h + inst.opts.distance) + "px");
      inst.range && inst.range.measure();
    }

    // ---- construção ------------------------------------------------------------
    function build(x) {
      const el = toEl(x);
      if (!el || instances.has(el)) return instances.get(el) || null;
      const preset = String(el.getAttribute("data-emerge-scene") || "").trim() || "unfold";
      const debug = !!core.attr(el, "debug", !1); // padrão Range: data-emerge-debug
      if (PRESETS.indexOf(preset) < 0) {
        debug &&
          console.warn(`[Emerge Scene] preset "${preset}" desconhecido; presets: ${PRESETS.join(", ")}.`);
        return null;
      }
      const targets = collect(el);
      if (!targets.panel) {
        debug && console.warn("[Emerge Scene] falta [data-emerge-scene-panel]; cena ignorada.", el);
        return null;
      }
      targets.panel.parentElement !== el &&
        debug &&
        console.warn(
          "[Emerge Scene] o painel deve ser filho direto do elemento com perspective (a perspective só afeta filhos diretos).",
          el,
        );
      const staticMode = core.isDisabledFor(el, "scene") || core.prefersReducedMotion();
      const inst = {
        el,
        preset,
        targets,
        spacer: null,
        range: null,
        steps: [],
        opts: null,
        radiusFrom: 0,
        last: {},
        live: false,
        static: staticMode,
        debug,
        layers: [],
      };
      core.claim(el, "Scene");
      core.claim(targets.panel, "Scene");
      el.classList.add("emerge-scene", "emerge-scene-" + preset);
      targets.panel.classList.add("emerge-scene-panel");
      targets.content && targets.content.classList.add("emerge-scene-content");
      targets.cover && targets.cover.classList.add("emerge-scene-cover");
      targets.layerA && inst.layers.push([targets.layerA, "emerge-scene-layer", "emerge-scene-layer-a"]);
      targets.layerB && inst.layers.push([targets.layerB, "emerge-scene-layer", "emerge-scene-layer-b"]);
      inst.layers.forEach(([n, a, b]) => n.classList.add(a, b));
      if (staticMode) {
        // reduced motion / disable: sem pin e sem 3D — a hero fica estática e o
        // painel plano, em fluxo normal, logo abaixo (CSS .emerge-scene-static).
        el.classList.add("emerge-scene-static");
      } else {
        inst.spacer = wrap(el);
        inst.spacer.dataset.emergeSceneSpaceFor = "";
        el.style.position = "sticky";
        el.style.top = "0px";
        measure(inst);
        wire(inst);
        paint(inst, 0); // estado inicial inline logo no build (sem flash)
      }
      instances.set(el, inst);
      core.dispatch("emerge:scene:build", {
        el,
        panel: targets.panel,
        spacer: inst.spacer,
        static: staticMode,
      });
      return inst;
    }

    function wire(inst) {
      const range = core.range; // Scene depende do Range (incluído no bundle)
      if (!range) return;
      inst.range = range.watch({
        on: inst.spacer,
        anchor: inst.spacer,
        from: "top@0%", // começa quando o topo da cena toca o topo do viewport
        to: "bottom@100%", // termina distance px depois
        // "scrub: 2" do original: aproximação exponencial com τ = smooth * 0.2 s
        // (o Range faz exatamente progresso += (alvo − progresso) · (1 − e^(−dt/τ)),
        // para o rAF quando assenta e só escreve quando o valor muda).
        follow: inst.opts.smooth > 0 ? inst.opts.smooth * 0.2 : !1,
        cssFollow: !1,
        debug: inst.debug,
        onProgress(r) {
          paint(inst, clamp(r.progress, 0, 1));
        },
        onEdge(e) {
          // from+descendo→enter · from+subindo(−1)→leave · to+descendo→leave · to+subindo→enter
          const k = e.direction > 0 ? "enter" : "leave";
          const name = e.edge === "from" ? k : e.direction > 0 ? "leave" : "enter";
          core.dispatch(`emerge:scene:${name}`, { el: inst.el, direction: e.direction });
        },
      });
    }

    function destroy(x) {
      const el = toEl(x);
      const inst = el && instances.get(el);
      if (!inst) return !1;
      inst.range && inst.range.stop();
      unwrap(inst.spacer, inst.el);
      el.classList.remove("emerge-scene", "emerge-scene-static", "emerge-scene-live");
      PRESETS.forEach((p) => el.classList.remove("emerge-scene-" + p));
      el.style.removeProperty("perspective");
      el.style.removeProperty("perspective-origin");
      el.style.removeProperty("position");
      el.style.removeProperty("top");
      el.style.removeProperty("--emerge-scene-progress");
      const t = inst.targets;
      t.panel &&
        (t.panel.classList.remove("emerge-scene-panel"),
        t.panel.style.removeProperty("opacity"),
        t.panel.style.removeProperty("transform"),
        t.panel.style.removeProperty("border-radius"),
        t.panel.style.removeProperty("clip-path"),
        t.panel.style.removeProperty("filter"));
      t.content &&
        (t.content.classList.remove("emerge-scene-content"),
        t.content.style.removeProperty("opacity"),
        t.content.style.removeProperty("scale"),
        t.content.style.removeProperty("transform"),
        t.content.style.removeProperty("filter"));
      t.cover &&
        (t.cover.classList.remove("emerge-scene-cover"), t.cover.style.removeProperty("opacity"));
      inst.layers.forEach(([n, a, b]) => {
        n.classList.remove(a, b);
        n.style.removeProperty("opacity");
      });
      core.release(el);
      t.panel && core.release(t.panel);
      instances.delete(el);
      return !0;
    }

    function scan(root) {
      (root || document).querySelectorAll("[data-emerge-scene]").forEach((el) => {
        instances.has(el) || build(el);
      });
    }
    function measureAll() {
      instances.forEach((inst) => measure(inst));
    }
    function destroyAll() {
      Array.from(instances.keys()).forEach(destroy);
    }

    return {
      name: "Scene",
      defaults: {
        sceneDistance: 1000,
        scenePerspective: 3000,
        sceneOrigin: "50% 78%",
        sceneTilt: 90,
        sceneScale: 0.44,
        sceneOffset: 27.7,
        sceneRadius: "5vw",
        sceneSmooth: 2,
      },
      install: (c) => (
        (core = c),
        Object.getOwnPropertyDescriptor(core, "range") ||
          Object.defineProperty(core, "range", {
            configurable: !0,
            get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
          }),
        {
          build,
          destroy,
          destroyAll,
          scan,
          measure: measureAll,
          of: (x) => instances.get(toEl(x)) || null,
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }) {
          core.hasAttr(el, "scene") && build(el);
        },
        init() {
          lastWidth = window.innerWidth;
          scan(document);
        },
        refresh({ reason }) {
          // cleanup: elementos removidos ou que passaram a/deixaram de estar
          // desativados (mudança de breakpoint → alterna pin <-> estático)
          const gone = [],
            rebuild = [];
          instances.forEach((inst, el) => {
            document.body.contains(el)
              ? core.isDisabledFor(el, "scene") !== inst.static && rebuild.push(el)
              : gone.push(el);
          });
          gone.forEach(destroy);
          rebuild.forEach((el) => {
            destroy(el);
            build(el);
          });
          scan(document);
          const w = window.innerWidth;
          instances.forEach((inst) => {
            if (inst.static) return;
            // Só a barra de endereço mobile mudou (largura igual, altura difere)?
            // O 100svh já absorve; basta re-medir o Range em vez de refazer tudo.
            reason === "resize" && w === lastWidth
              ? inst.range && inst.range.measure()
              : measure(inst);
          });
          lastWidth = w;
        },
        unobserve({ el }) {
          destroy(el);
        },
        teardown() {
          destroyAll();
        },
      },
    };
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Scene  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Magnetic  (global: EmergeMagnetic)
/*  Atração magnética ao cursor (data-emerge-magnetic).
/*  Depende de: Nenhuma
/* ======================================================================== */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeMagnetic = d());
  })(this, function () {
    "use strict";
    // Magnetic — atracção magnética ao cursor (v1.5.0).
    // Marcação: data-emerge-magnetic ("" = padrão | "card" = superfícies
    // grandes) e data-emerge-magnetic-child="0.5" nos filhos que acompanham
    // o movimento com um factor próprio.
    // Motor: UM único rAF partilhado para todas as instâncias, que anima
    // apenas as activas e adormece quando nada se move (padrão do Spotlight:
    // primeiro TODAS as leituras de layout, depois TODAS as escritas).
    // Escrita: a propriedade individual `translate` — compõe com o
    // `transform` do autor e com os efeitos dos outros plugins — e, com o
    // tilt 3D activo, `transform` (perspective + rotateX/rotateY), guardado
    // e restaurado no fim. Nunca há preventDefault: o scroll nunca é
    // afectado (apontadores tácteis são ignorados por omissão).
    // Prioridade das opções: atributo no elemento > token CSS
    // (--emerge-magnetic-*) > opção global do Emerge.init > preset do modo
    // (o mesmo critério do Scene).
    // Elementos adicionados/removidos dinamicamente: o MutationObserver do
    // core só vigia nós [data-emerge] (ver o comentário do Spotlight), por
    // isso o Magnetic mantém UM observer próprio e partilhado, que respeita
    // a opção disableMutationObserver do core. Sem JS, com o plugin
    // desactivado, com prefers-reduced-motion ou em browsers sem
    // transformações individuais, nada é escrito: o elemento fica na
    // posição natural, sem qualquer alteração de layout.
    let core = null;
    const instances = new Map(), // el -> instância
      running = new Set(), // instâncias no motor (activas ou a regressar)
      MAG_SELECTOR = "[data-emerge-magnetic], [data-emerge-magnetic-child]";
    const ptr = { x: 0, y: 0, has: !1, moved: !1, touch: !1 };
    let rafId = 0,
      lastTime = 0,
      sharedOn = !1,
      dirty = !1,
      touchCount = 0,
      observer = null;
    // transformações individuais (translate/rotate) — necessárias para não
    // esmagar o transform do autor; sem suporte, o plugin fica inerte.
    const canTranslate =
      typeof CSS != "undefined" &&
      CSS.supports &&
      CSS.supports("translate", "0px") &&
      CSS.supports("rotate", "1deg");
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

    // Curvas de queda ("ease"): moldam a proximidade 1→0 à medida que o
    // cursor se afasta da borda do elemento (f(0)=0 e f(1)=1 em todas).
    const CURVES = {
      linear: (t) => t,
      quad: (t) => t * t,
      cubic: (t) => t * t * t,
      sine: (t) => Math.sin((t * Math.PI) / 2),
      "out-quad": (t) => 1 - (1 - t) * (1 - t),
      "out-cubic": (t) => 1 - Math.pow(1 - t, 3),
    };

    // Presets por modo ("card" = superfícies grandes: atracção mais suave).
    const PRESETS = {
      default: { strength: .3, radius: 60 },
      card: { strength: .2, radius: 40 },
    };

    /* ---- Opções: atributo > token CSS > opção global > preset do modo ---- */

    function cssToken(el, name) {
      try {
        const v = getComputedStyle(el)
          .getPropertyValue("--emerge-magnetic-" + name)
          .trim();
        return v === "" ? null : v;
      } catch (e) {
        return null;
      }
    }

    function numOption(el, name, globalKey, fallback) {
      const a = core.numAttr(el, "magnetic-" + name, NaN);
      if (!Number.isNaN(a)) return a;
      const t = parseFloat(cssToken(el, name));
      if (!Number.isNaN(t)) return t;
      const g = core.options[globalKey];
      if (g !== null && g !== undefined && g !== "") {
        const n = Number(g);
        if (!Number.isNaN(n)) return n;
      }
      return fallback;
    }

    function boolOption(el, name, globalKey, fallback) {
      if (core.hasAttr(el, "magnetic-" + name)) {
        const v = core.attr(el, "magnetic-" + name, "");
        return !(v === "false" || v === "0" || v === "no");
      }
      const t = cssToken(el, name);
      if (t !== null) return !(t === "false" || t === "0" || t === "no");
      const g = core.options[globalKey];
      if (g !== null && g !== undefined && g !== "")
        return !(g === "false" || g === !1 || g === "0" || g === "no");
      return fallback;
    }

    function easeOption(el) {
      const raw = core.hasAttr(el, "magnetic-ease")
        ? String(core.attr(el, "magnetic-ease", "linear")).trim()
        : cssToken(el, "ease") || String(core.options.magneticEase || "linear");
      return CURVES[raw] || CURVES.linear;
    }

    /* ---- Motor partilhado ------------------------------------------------ */

    // Um ciclo para todas as instâncias: primeiro TODAS as leituras de
    // layout (só quando algo mudou), depois TODAS as escritas.
    function frame(now) {
      rafId = 0;
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.7;
      lastTime = now;
      if (dirty || ptr.moved) {
        if (dirty) instances.forEach((inst) => inst.measure());
        dirty = !1;
        ptr.moved = !1;
        instances.forEach((inst) => {
          ptr.has ? inst.retarget() : inst.release();
        });
      }
      running.forEach((inst) => {
        inst.step(dt) || running.delete(inst);
      });
      if (running.size) rafId = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    function kick() {
      if (!rafId && instances.size) rafId = requestAnimationFrame(frame);
    }

    function wake(inst) {
      running.add(inst);
      kick();
    }

    // Mover a página sob um cursor parado muda as coordenadas locais.
    function onScroll() {
      if (!ptr.has && !running.size) return;
      dirty = !0;
      kick();
    }

    function onResize() {
      if (!ptr.has && !running.size) return;
      dirty = !0;
      kick();
    }

    function onMove(e) {
      const touch = e.pointerType === "touch";
      // táctil: por omissão o plugin não interfere com o scroll da página
      if (touch && !touchCount) return;
      ((ptr.x = e.clientX),
        (ptr.y = e.clientY),
        (ptr.has = !0),
        (ptr.moved = !0),
        (ptr.touch = touch),
        kick());
    }

    function onOut(e) {
      e.relatedTarget || onLeave();
    }

    function onLeave() {
      if (!ptr.has) return;
      ((ptr.has = !1), (ptr.moved = !1), instances.forEach((inst) => inst.release()), kick());
    }

    // Navegação por teclado: o foco devolve o elemento ao repouso.
    function onFocus(e) {
      const t = e.target;
      if (!t || !t.closest) return;
      const host = t.closest("[data-emerge-magnetic]");
      const inst = host && instances.get(host);
      inst && inst.release();
    }

    function wire() {
      if (sharedOn) return;
      sharedOn = !0;
      window.addEventListener("pointermove", onMove, { passive: !0 });
      window.addEventListener("pointerdown", onMove, { passive: !0 });
      window.addEventListener("pointerout", onOut, { passive: !0 });
      window.addEventListener("pointercancel", onLeave, { passive: !0 });
      document.addEventListener("pointerleave", onLeave, { passive: !0 });
      window.addEventListener("blur", onLeave);
      window.addEventListener("scroll", onScroll, { capture: !0, passive: !0 });
      window.addEventListener("resize", onResize, { passive: !0 });
      window.addEventListener("orientationchange", onResize, { passive: !0 });
      document.addEventListener("focusin", onFocus, { passive: !0 });
    }

    function unwire() {
      if (!sharedOn) return;
      sharedOn = !1;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointercancel", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: !0 });
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("focusin", onFocus);
    }

    // O core só vigia nós [data-emerge] — o Magnetic mantém UM observer
    // próprio e partilhado (padrão do Spotlight), respeitando
    // disableMutationObserver, para gerir adições/remoções dinâmicas.
    function watch() {
      if (
        observer ||
        core.options.disableMutationObserver ||
        typeof MutationObserver == "undefined"
      )
        return;
      observer = new MutationObserver(onMutations);
      observer.observe(document.body || document.documentElement, {
        childList: !0,
        subtree: !0,
      });
    }

    function onMutations(recs) {
      for (const rec of recs) rec.addedNodes.forEach(onAdded);
      // Hosts que saíram do documento (após o loop, para nós apenas movidos
      // não serem destruídos e recriados — padrão do Spotlight).
      instances.forEach((inst, el) => {
        el.isConnected || destroy(el);
      });
      // Filhos magnéticos cujo host mudou ou que saíram do documento.
      instances.forEach((inst) => {
        for (let n = inst.children.length - 1; n >= 0; n--)
          inst.children[n].el.closest("[data-emerge-magnetic]") !== inst.el &&
            detachChild(inst, inst.children[n].el);
      });
    }

    function onAdded(node) {
      if (node.nodeType !== 1 || !node.matches) return;
      node.matches(MAG_SELECTOR) && ensure(node);
      node.querySelectorAll &&
        node.querySelectorAll(MAG_SELECTOR).forEach((n) => ensure(n));
    }

    function ensure(el) {
      if (el.hasAttribute("data-emerge-magnetic")) return build(el);
      // filho magnético: liga ao host mais próximo, se este já existir
      const host = el.closest("[data-emerge-magnetic]");
      const inst = host && instances.get(host);
      return inst ? (attachChild(inst, el), inst) : null;
    }

    /* ---- Instância -------------------------------------------------------- */

    class MagneticInstance {
      constructor(el) {
        const mode =
          String(core.attr(el, "magnetic", "")).trim().toLowerCase() === "card"
            ? "card"
            : "default";
        const preset = PRESETS[mode];
        this.el = el;
        this.mode = mode;
        this.strength = numOption(el, "strength", "magneticStrength", preset.strength);
        this.radius = Math.max(0, numOption(el, "radius", "magneticRadius", preset.radius));
        this.speed = Math.max(.5, numOption(el, "speed", "magneticSpeed", 6));
        this.ease = easeOption(el);
        this.tilt = boolOption(el, "tilt", "magneticTilt", !1);
        this.tiltStrength = clamp(
          numOption(el, "tilt-strength", "magneticTiltStrength", 10),
          -89,
          89,
        );
        this.perspective = numOption(el, "perspective", "magneticPerspective", 800);
        this.touch = boolOption(el, "touch", "magneticTouch", !1);
        this.children = []; // [{ el, factor }]
        // rect "base" (sem o translate magnético) e centro
        this.rect = null;
        this.cx = 0;
        this.cy = 0;
        this.x = 0;
        this.y = 0; // offset actual
        this.tx = 0;
        this.ty = 0; // offset alvo
        this.rx = 0;
        this.ry = 0; // tilt actual (deg)
        this.grx = 0;
        this.gry = 0; // tilt alvo
        this.engaged = !1;
        this.transformSaved = null; // transform inline do autor (tilt)
        this.transformWritten = !1;
      }

      // rect base: compensa o translate já aplicado, que o rect inclui
      measure() {
        const r = this.el.getBoundingClientRect();
        this.rect = {
          left: r.left - this.x,
          top: r.top - this.y,
          right: r.right - this.x,
          bottom: r.bottom - this.y,
          width: r.width,
          height: r.height,
        };
        this.cx = (this.rect.left + this.rect.right) / 2;
        this.cy = (this.rect.top + this.rect.bottom) / 2;
      }

      // Calcula os alvos a partir do cursor; devolve true se ficou engajado
      // (dentro do raio) e false se libertou.
      retarget() {
        if (!ptr.has || (ptr.touch && !this.touch)) return this.release();
        const r = this.rect;
        const dx =
          ptr.x < r.left ? r.left - ptr.x : ptr.x > r.right ? ptr.x - r.right : 0;
        const dy =
          ptr.y < r.top ? r.top - ptr.y : ptr.y > r.bottom ? ptr.y - r.bottom : 0;
        const edge = Math.hypot(dx, dy);
        if (edge > this.radius) return this.release();
        const fall = this.ease(clamp(1 - edge / (this.radius || 1), 0, 1));
        const vx = ptr.x - this.cx;
        const vy = ptr.y - this.cy;
        this.tx = vx * this.strength * fall;
        this.ty = vy * this.strength * fall;
        if (this.tilt) {
          const nx = clamp(vx / (r.width / 2 || 1), -1, 1);
          const ny = clamp(vy / (r.height / 2 || 1), -1, 1);
          this.gry = nx * this.tiltStrength * fall;
          this.grx = -ny * this.tiltStrength * fall;
        }
        if (!this.engaged) {
          this.engaged = !0;
          this.el.classList.add("emerge-magnetic-active");
          core.dispatch("emerge:magnetic:engage", { el: this.el });
        }
        wake(this);
        return !0;
      }

      // Alvos a zero; o elemento regressa suavemente ao repouso.
      release() {
        this.hasPointer = !1;
        if (this.engaged) {
          this.engaged = !1;
          this.tx = 0;
          this.ty = 0;
          this.grx = 0;
          this.gry = 0;
          core.dispatch("emerge:magnetic:release", { el: this.el });
        }
        (this.x || this.y || this.rx || this.ry) && wake(this);
        return !1;
      }

      // Um passo do motor: suaviza na direcção dos alvos e escreve os
      // estilos. Devolve false quando pode adormecer (assentou).
      step(dt) {
        const k = 1 - Math.exp((-dt / 1e3) * this.speed);
        this.x += (this.tx - this.x) * k;
        this.y += (this.ty - this.y) * k;
        if (this.tilt) {
          this.rx += (this.grx - this.rx) * k;
          this.ry += (this.gry - this.ry) * k;
        }
        const settled =
          Math.abs(this.tx - this.x) < .05 &&
          Math.abs(this.ty - this.y) < .05 &&
          (!this.tilt ||
            (Math.abs(this.grx - this.rx) < .05 &&
              Math.abs(this.gry - this.ry) < .05));
        if (settled) {
          this.engaged || this.reset();
          return !1; // assentou: dorme até ao próximo evento
        }
        this.write();
        return !0;
      }

      write() {
        this.el.style.translate =
          this.x.toFixed(2) + "px " + this.y.toFixed(2) + "px";
        if (this.tilt) {
          this.transformWritten ||
            ((this.transformSaved = this.el.style.transform || ""),
              (this.transformWritten = !0));
          const p =
            this.perspective > 0
              ? "perspective(" + this.perspective + "px) "
              : "";
          this.el.style.transform =
            p +
            "rotateX(" +
            this.rx.toFixed(2) +
            "deg) rotateY(" +
            this.ry.toFixed(2) +
            "deg)";
        }
        for (const c of this.children)
          c.el.style.translate =
            (this.x * c.factor).toFixed(2) +
            "px " +
            (this.y * c.factor).toFixed(2) +
            "px";
      }

      // Repouso: remove tudo o que o plugin escreveu (sem alteração de layout).
      reset() {
        this.x = this.y = this.tx = this.ty = 0;
        this.rx = this.ry = this.grx = this.gry = 0;
        this.el.style.translate = "";
        this.transformWritten &&
          ((this.el.style.transform = this.transformSaved || ""),
            (this.transformWritten = !1),
            (this.transformSaved = null));
        for (const c of this.children) c.el.style.translate = "";
        this.el.classList.remove("emerge-magnetic-active");
      }

      destroy() {
        this.reset();
        this.el.classList.remove("emerge-magnetic");
        this.el.hasAttribute("data-emerge") || core.release(this.el);
        for (const c of this.children.slice()) detachChild(this, c.el);
        this.children.length = 0;
        this.touch && touchCount--;
        running.delete(this);
        instances.delete(this.el);
        core.dispatch("emerge:magnetic:destroy", { el: this.el });
        instances.size || unwire();
      }
    }

    /* ---- Filhos magnéticos ------------------------------------------------ */

    function attachChild(inst, child) {
      if (inst.children.some((c) => c.el === child)) return inst;
      const f = Number(core.attr(child, "magnetic-child", NaN));
      inst.children.push({ el: child, factor: Number.isNaN(f) ? 1 : f });
      child.classList.add("emerge-magnetic-child");
      child.hasAttribute("data-emerge") || core.claim(child, "Magnetic");
      return inst;
    }

    function detachChild(inst, child) {
      const n = inst.children.findIndex((c) => c.el === child);
      if (n < 0) return inst;
      const c = inst.children.splice(n, 1)[0];
      c.el.classList.remove("emerge-magnetic-child");
      c.el.style.translate = "";
      c.el.hasAttribute("data-emerge") || core.release(c.el);
      return inst;
    }

    /* ---- Ciclo de vida ---------------------------------------------------- */

    function build(el) {
      if (!core || !canTranslate) return null;
      if (typeof el == "string") el = document.querySelector(el);
      if (
        !el ||
        el.nodeType !== 1 ||
        !el.hasAttribute ||
        !el.hasAttribute("data-emerge-magnetic")
      )
        return null;
      if (instances.has(el)) return instances.get(el);
      if (core.isDisabledFor(el, "magnetic")) return null;
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        return null;
      const inst = new MagneticInstance(el);
      instances.set(el, inst);
      // não reclamar elementos do pipeline core ([data-emerge] + magnetic)
      el.hasAttribute("data-emerge") || core.claim(el, "Magnetic");
      el.classList.add("emerge-magnetic");
      el.querySelectorAll("[data-emerge-magnetic-child]").forEach((child) => {
        child.closest("[data-emerge-magnetic]") === el &&
          attachChild(inst, child);
      });
      inst.measure();
      inst.touch && touchCount++;
      wire();
      watch();
      ptr.has && inst.retarget();
      core.dispatch("emerge:magnetic:build", { el: el });
      return inst;
    }

    function destroy(target) {
      const el =
        typeof target == "string" ? document.querySelector(target) : target;
      const inst = el && instances.get(el);
      return inst ? (inst.destroy(), !0) : !1;
    }

    function destroyAll() {
      Array.from(instances.keys()).forEach(destroy);
      running.clear();
    }

    function scan(root) {
      if (!core || !canTranslate) return;
      (root || document)
        .querySelectorAll("[data-emerge-magnetic]")
        .forEach((el) => {
          instances.has(el) || build(el);
        });
    }

    /* ---- API programática (Emerge.Magnetic) ------------------------------- */

    return {
      name: "Magnetic",
      defaults: {
        magneticStrength: null,
        magneticRadius: null,
        magneticSpeed: null,
        magneticEase: null,
        magneticTilt: null,
        magneticTiltStrength: null,
        magneticPerspective: null,
        magneticTouch: !1,
      },
      install: (c) => (
        (core = c),
        {
          build: build,
          destroy: destroy,
          scan: scan,
          destroyAll: destroyAll,
          of: (target) => {
            const el =
              typeof target == "string" ? document.querySelector(target) : target;
            return (el && instances.get(el)) || null;
          },
          // força todos os elementos a regressarem ao repouso
          release: () => {
            (ptr.has = !1),
              instances.forEach((inst) => inst.release()),
              kick();
          },
          // marca os rects como sujos (após mudanças de layout do autor)
          measure: () => {
            dirty = !0;
            kick();
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }, c) {
          c.hasAttr(el, "magnetic") && build(el);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && inst.destroy();
        },
        init() {
          scan(document);
        },
        refresh() {
          // instâncias fora do documento, novos elementos e rects alterados
          instances.forEach((inst, el) => {
            el.isConnected || destroy(el);
          });
          scan(document);
          dirty = !0;
          kick();
        },
        teardown() {
          destroyAll();
          observer && (observer.disconnect(), (observer = null));
          rafId && (cancelAnimationFrame(rafId), (rafId = 0));
          lastTime = 0;
          dirty = !1;
          unwire();
        },
      },
    };
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Magnetic  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Parallax  (global: EmergeParallax)
/*  Parallax ligado ao scroll (data-emerge-parallax).
/*  Depende de: Range
/* ======================================================================== */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeParallax = d());
  })(this, function () {
    "use strict";
    // Parallax — deslocamento ligado ao scroll (v1.6.0).
    // Marcação: data-emerge-parallax="0.3" no elemento (o valor é a velocidade;
    // vazio = padrão) e data-emerge-parallax-layer="0.5" nos filhos de um
    // contentor, para parallax em profundidade (cada camada com o seu factor).
    // Motor: o plugin Range (core.range.watch), como no Horizontal/Stack/Scene
    // — nenhum listener de scroll próprio. O progresso do Range (janela
    // data-emerge-parallax-from/to, por omissão "enter"→"exit") é mapeado para
    // um deslocamento CENTRADO: t = -speed · (p − .5) · span. No meio do
    // percurso o elemento está exactamente na posição natural e as zonas de
    // repouso (p=0 e p=1) acontecem fora do viewport, por isso não há "saltos"
    // nem pausas visíveis. O sinal negativo faz com que speed positivo "ande à
    // frente" do scroll (aparenta percorrer mais de 100% do trajeto — primeiro
    // plano) e speed negativo "fique atrás" (menos de 100% — fundo clássico);
    // speed −1 congela o elemento no ecrã enquanto a janela atravessa.
    // Escrita: as propriedades individuais `translate`/`rotate`/`scale` (e
    // `opacity`) — compõem com o `transform` do autor e com os efeitos dos
    // outros plugins; sem suporte do browser, o plugin fica inerte (padrão
    // Magnetic). Um ciclo de escrita por frame com guarda "só escreve se o
    // valor mudou" (padrão `last` do Scene). will-change só enquanto o
    // elemento atravessa o viewport (classe .emerge-parallax-live, gerida pelo
    // JS como .emerge-scene-live). prefers-reduced-motion e isDisabledFor:
    // nada é escrito — o elemento fica na posição natural, sem alterações de
    // layout. data-emerge no mesmo elemento continua a funcionar (fade-in do
    // Emerge + parallax): só se "reclama" (core.claim) quem não está no
    // pipeline do core. O Range publica --emerge-progress (0..1) no elemento.
    // Prioridade das opções: atributo no elemento > token CSS
    // (--emerge-parallax-*) > opção global do Emerge.init > default do plugin
    // (o mesmo critério do Scene/Magnetic).
    // Elementos adicionados/removidos dinamicamente: o observer do core só
    // vigia nós [data-emerge], por isso o Parallax mantém UM observer próprio
    // e partilhado (padrão do Spotlight/Magnetic), respeitando a opção
    // disableMutationObserver do core. O resize/orientationchange são tratados
    // pelo core (hooks.refresh) e pelo próprio Range (re-measure), incluindo a
    // mudança de altura do viewport (barra de endereço mobile).
    let core = null;
    const instances = new Map(), // el -> instância
      HOST = "[data-emerge-parallax]",
      LAYER = "[data-emerge-parallax-layer]",
      // propriedades que o plugin escreve — limpas no destroy
      CLEAN = ["translate", "rotate", "scale", "opacity"],
      DEFAULT_SPEED = 0.3;
    // transformações individuais — necessárias para não esmagar o transform
    // do autor; sem suporte, o plugin fica inerte (nada é escrito).
    const canParallax =
      typeof CSS != "undefined" &&
      CSS.supports &&
      CSS.supports("translate", "0px") &&
      CSS.supports("rotate", "1deg") &&
      CSS.supports("scale", "2");
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const toEl = (x) => (typeof x == "string" ? document.querySelector(x) : x);

    /* ---- Opções: atributo no elemento > token CSS > global > default ---- */

    function cssToken(el, name) {
      try {
        const v = getComputedStyle(el)
          .getPropertyValue("--emerge-parallax-" + name)
          .trim();
        return v === "" ? null : v;
      } catch (e) {
        return null;
      }
    }

    function globalOption(key) {
      const g = core.options[key];
      return g === null || g === undefined || g === "" ? null : g;
    }

    function numOption(el, name, key, fallback) {
      if (core.hasAttr(el, "parallax-" + name)) {
        const n = Number(String(core.attr(el, "parallax-" + name, "")).trim());
        if (!Number.isNaN(n)) return n;
      }
      const t = parseFloat(cssToken(el, name));
      if (!Number.isNaN(t)) return t;
      const g = globalOption(key);
      if (g !== null) {
        const n = Number(g);
        if (!Number.isNaN(n)) return n;
      }
      return fallback;
    }

    function strOption(el, name, key, fallback) {
      if (core.hasAttr(el, "parallax-" + name)) {
        const v = String(core.attr(el, "parallax-" + name, "")).trim();
        if (v !== "") return v;
      }
      const t = cssToken(el, name);
      if (t !== null && t !== "") return t;
      const g = globalOption(key);
      if (g !== null && String(g).trim() !== "") return String(g).trim();
      return fallback;
    }

    function axisOption(el) {
      const v = strOption(el, "axis", "parallaxAxis", "y").toLowerCase();
      return v === "x" || v === "both" ? v : "y";
    }

    // data-emerge-parallax="" (vazio) = padrão; "0.3" = velocidade 0.3;
    // o atributo data-emerge-parallax-speed segue a cadeia normal de opções.
    function mainSpeed(el) {
      const raw = el.getAttribute("data-emerge-parallax");
      if (raw !== null && String(raw).trim() !== "") {
        const n = Number(String(raw).trim());
        if (!Number.isNaN(n)) return n;
      }
      return numOption(el, "speed", "parallaxSpeed", DEFAULT_SPEED);
    }

    // data-emerge-parallax-layer="0.5" — factor da camada (vazio/inválido = 1).
    function layerFactor(layer) {
      const raw = layer.getAttribute("data-emerge-parallax-layer");
      if (raw !== null && String(raw).trim() !== "") {
        const n = Number(String(raw).trim());
        if (!Number.isNaN(n)) return n;
      }
      return 1;
    }

    function resolveOptions(el) {
      return {
        speed: mainSpeed(el),
        axis: axisOption(el),
        // valores FINAIS ligados ao progresso (rotate/scale partem do estado
        // natural 0deg/1; opacity desce de 1 para o valor); null = desligado
        rotate: numOption(el, "rotate", "parallaxRotate", null),
        scale: numOption(el, "scale", "parallaxScale", null),
        opacity: numOption(el, "opacity", "parallaxOpacity", null),
        // janela do Range (sintaxe existente: "enter", "top@50%", "+300"…)
        from: strOption(el, "from", "parallaxFrom", "enter"),
        to: strOption(el, "to", "parallaxTo", "exit"),
        // suavização em segundos, mapeada para o "follow" do Range
        smooth: Math.max(0, numOption(el, "smooth", "parallaxSmooth", 0)),
        // seletor de um filho a animar em vez do próprio elemento
        target: strOption(el, "target", "parallaxTarget", "") || null,
        debug: !!core.attr(el, "debug", !1), // padrão Range: data-emerge-debug
      };
    }

    /* ---- Escrita: um ciclo por frame, guarda "só escreve se mudou" ---- */

    function write(el, memo, prop, value) {
      if (memo[prop] === value) return;
      memo[prop] = value;
      el.style[prop] = value;
    }

    function paint(inst, p) {
      if (!inst.range) return;
      const o = inst.opts;
      // deslocamento centrado no progresso (ver o comentário do cabeçalho)
      const travel = -o.speed * (p - 0.5) * inst.range.span;
      const tx = o.axis === "y" ? 0 : travel;
      const ty = o.axis === "x" ? 0 : travel;
      write(
        inst.target,
        inst.last,
        "translate",
        tx.toFixed(2) + "px " + ty.toFixed(2) + "px",
      );
      // rotate/scale/opacity: do estado natural ao valor final no fim do percurso
      if (o.rotate !== null)
        write(inst.target, inst.last, "rotate", (o.rotate * p).toFixed(3) + "deg");
      if (o.scale !== null)
        write(inst.target, inst.last, "scale", (1 + (o.scale - 1) * p).toFixed(4));
      if (o.opacity !== null)
        write(
          inst.target,
          inst.last,
          "opacity",
          clamp(1 + (o.opacity - 1) * p, 0, 1).toFixed(4),
        );
      // camadas: o mesmo progresso, cada uma com o seu factor
      for (const l of inst.layers) {
        const lx = o.axis === "y" ? 0 : travel * l.factor;
        const ly = o.axis === "x" ? 0 : travel * l.factor;
        write(
          l.el,
          l.last,
          "translate",
          lx.toFixed(2) + "px " + ly.toFixed(2) + "px",
        );
      }
      // will-change só enquanto atravessa o viewport (padrão .emerge-scene-live)
      const live = p > 0 && p < 1;
      if (live !== inst.live) {
        inst.live = live;
        inst.el.classList.toggle("emerge-parallax-live", live);
      }
    }

    /* ---- Camadas (data-emerge-parallax-layer) ----------------------------- */

    function attachLayer(inst, layer) {
      const existing = inst.layers.find((l) => l.el === layer);
      if (existing) {
        existing.factor = layerFactor(layer); // relê o factor (pode ter mudado)
        return inst;
      }
      // um contentor parallax aninhado é o dono das suas próprias camadas
      if (layer.closest(HOST) !== inst.el) return inst;
      inst.layers.push({ el: layer, factor: layerFactor(layer), last: {} });
      layer.classList.add("emerge-parallax-layer");
      layer.hasAttribute("data-emerge") || core.claim(layer, "Parallax");
      return inst;
    }

    function detachLayer(inst, layer) {
      const i = inst.layers.findIndex((l) => l.el === layer);
      if (i < 0) return inst;
      const l = inst.layers.splice(i, 1)[0];
      l.el.classList.remove("emerge-parallax-layer");
      CLEAN.forEach((p) => l.el.style.removeProperty(p));
      l.el.hasAttribute("data-emerge") || core.release(l.el);
      return inst;
    }

    function collectLayers(inst) {
      inst.el.querySelectorAll(LAYER).forEach((layer) => attachLayer(inst, layer));
    }

    /* ---- Alvo (data-emerge-parallax-target) -------------------------------- */

    // troca o elemento escrito; limpa o que o plugin tinha escrito no anterior
    function setTarget(inst, next) {
      const t = inst.target;
      if (t && t !== inst.el) {
        t.classList.remove("emerge-parallax-target");
        CLEAN.forEach((p) => t.style.removeProperty(p));
        t.hasAttribute("data-emerge") || core.release(t);
      }
      inst.target = next || inst.el;
      inst.last = {};
      if (inst.target !== inst.el) {
        inst.target.classList.add("emerge-parallax-target");
        inst.target.hasAttribute("data-emerge") || core.claim(inst.target, "Parallax");
      }
      return inst;
    }

    function resolveTarget(inst) {
      if (!inst.opts.target) return setTarget(inst, inst.el);
      const t = inst.el.querySelector(inst.opts.target);
      if (!t) {
        inst.debug &&
          console.warn(
            "[Emerge Parallax] target não encontrado:",
            inst.opts.target,
            inst.el,
          );
        return setTarget(inst, inst.el);
      }
      return setTarget(inst, t);
    }

    /* ---- Ciclo de vida ------------------------------------------------------ */

    function build(x) {
      if (!core || !canParallax) return null;
      const el = toEl(x);
      if (
        !el ||
        el.nodeType !== 1 ||
        !el.hasAttribute ||
        !el.hasAttribute("data-emerge-parallax")
      )
        return null;
      if (instances.has(el)) return instances.get(el);
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        return null;
      if (core.isDisabledFor(el, "parallax")) return null;
      const inst = {
        el,
        target: el,
        layers: [],
        opts: resolveOptions(el),
        range: null,
        last: {},
        live: !1,
        debug: !!core.attr(el, "debug", !1),
      };
      instances.set(el, inst);
      resolveTarget(inst);
      // não reclamar elementos do pipeline core ([data-emerge] + parallax)
      el.hasAttribute("data-emerge") || core.claim(el, "Parallax");
      el.classList.add("emerge-parallax");
      collectLayers(inst);
      wire(inst);
      paint(inst, 0); // estado inicial inline logo no build (sem flash)
      core.dispatch("emerge:parallax:build", {
        el,
        target: inst.target !== el ? inst.target : null,
        layers: inst.layers.map((l) => l.el),
      });
      return inst;
    }

    function wire(inst) {
      const range = core.range; // Parallax depende do Range (incluído no bundle)
      if (!range) return;
      inst.range = range.watch({
        on: inst.el,
        from: inst.opts.from,
        to: inst.opts.to,
        // "smooth" (segundos) mapeado para o follow do Range, como o scrub do Scene
        follow: inst.opts.smooth > 0 ? inst.opts.smooth : !1,
        cssFollow: !1,
        debug: inst.debug,
        onProgress(r) {
          paint(inst, clamp(r.progress, 0, 1));
        },
      });
    }

    function destroy(x) {
      const el = toEl(x);
      const inst = el && instances.get(el);
      if (!inst) return !1;
      inst.range && inst.range.stop();
      inst.layers.slice().forEach((l) => detachLayer(inst, l.el));
      setTarget(inst, null);
      inst.el.classList.remove("emerge-parallax", "emerge-parallax-live");
      // o Range (follow: false) adiciona a classe animada do core ao cruzar o
      // início da janela — comportamento normal de qualquer watch com follow
      // off (o mesmo que acontece com data-emerge-follow); em elementos fora
      // do pipeline do core não tem efeito visual, mas limpamos no destroy
      inst.el.hasAttribute("data-emerge") ||
        inst.el.classList.remove(core.options.animatedClassName);
      CLEAN.forEach((p) => inst.el.style.removeProperty(p));
      inst.el.hasAttribute("data-emerge") || core.release(inst.el);
      instances.delete(inst.el);
      core.dispatch("emerge:parallax:destroy", { el: inst.el });
      return !0;
    }

    function destroyAll() {
      Array.from(instances.keys()).forEach(destroy);
    }

    function scan(root) {
      if (!core || !canParallax) return;
      (root || document).querySelectorAll(HOST).forEach((el) => {
        instances.has(el) || build(el);
      });
    }

    // relê as opções (apanha tokens alterados em @media), troca o alvo se o
    // nó mudou, reconstrói quando a janela do Range mudou e re-medir o resto.
    function watchKey(o) {
      return [o.from, o.to, o.smooth, o.target || ""].join("|");
    }

    function measure() {
      const rebuild = [];
      instances.forEach((inst, el) => {
        const before = watchKey(inst.opts);
        inst.opts = resolveOptions(el);
        resolveTarget(inst);
        collectLayers(inst);
        if (watchKey(inst.opts) !== before || !inst.range) {
          rebuild.push(el);
          return;
        }
        inst.range.progress != null &&
          paint(inst, clamp(inst.range.progress, 0, 1));
        inst.range.measure();
      });
      rebuild.forEach((el) => {
        destroy(el);
        build(el);
      });
    }

    /* ---- Observer próprio (elementos dinâmicos) ----------------------------- */

    let observer = null;

    // O core só vigia nós [data-emerge] — o Parallax mantém UM observer
    // próprio e partilhado (padrão do Spotlight/Magnetic), respeitando
    // disableMutationObserver, para gerir adições/remoções dinâmicas.
    function watch() {
      if (
        observer ||
        core.options.disableMutationObserver ||
        typeof MutationObserver == "undefined"
      )
        return;
      observer = new MutationObserver(onMutations);
      observer.observe(document.body || document.documentElement, {
        childList: !0,
        subtree: !0,
      });
    }

    function attachToHost(layer) {
      const host = layer.closest(HOST);
      const inst = host && instances.get(host);
      inst && attachLayer(inst, layer);
    }

    function onAdded(node) {
      if (node.nodeType !== 1 || !node.matches) return;
      node.matches(HOST) && build(node);
      node.matches(LAYER) && attachToHost(node);
      node.querySelectorAll &&
        node.querySelectorAll(HOST + "," + LAYER).forEach((n) => {
          n.matches(LAYER) ? attachToHost(n) : build(n);
        });
    }

    function onMutations(recs) {
      for (const rec of recs) rec.addedNodes.forEach(onAdded);
      // instâncias cujo host saiu do documento (após o loop, para nós apenas
      // movidos não serem destruídos e recriados — padrão do Spotlight)
      instances.forEach((inst, el) => {
        el.isConnected || destroy(el);
      });
      // camadas que saíram do documento ou trocaram de contentor
      instances.forEach((inst) => {
        for (let i = inst.layers.length - 1; i >= 0; i--) {
          const l = inst.layers[i];
          (!l.el.isConnected || l.el.closest(HOST) !== inst.el) &&
            detachLayer(inst, l.el);
        }
        // alvo que saiu do documento: volta ao próprio elemento
        inst.target !== inst.el &&
          !inst.target.isConnected &&
          resolveTarget(inst);
      });
      // repõe o deslocamento actual nas instâncias afectadas
      instances.forEach((inst) => {
        inst.range && paint(inst, clamp(inst.range.progress, 0, 1));
      });
    }

    /* ---- API programática (Emerge.Parallax) -------------------------------- */

    return {
      name: "Parallax",
      defaults: {
        parallaxSpeed: DEFAULT_SPEED,
        parallaxAxis: "y",
        parallaxRotate: null,
        parallaxScale: null,
        parallaxOpacity: null,
        parallaxFrom: "enter",
        parallaxTo: "exit",
        parallaxSmooth: 0,
        parallaxTarget: null,
      },
      install: (c) => (
        (core = c),
        Object.getOwnPropertyDescriptor(core, "range") ||
          Object.defineProperty(core, "range", {
            configurable: !0,
            get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
          }),
        {
          build,
          destroy,
          destroyAll,
          scan,
          measure,
          of: (x) => {
            const el = toEl(x);
            return (el && instances.get(el)) || null;
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }) {
          core.hasAttr(el, "parallax") && build(el);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && destroy(el);
        },
        init() {
          scan(document);
          watch();
        },
        refresh() {
          // instâncias fora do documento ou que passaram a estar desativadas
          // (mudança de breakpoint/dispositivo), novos elementos e opções
          // relidas — simétrico do Scene/Magnetic.
          const gone = [];
          instances.forEach((inst, el) => {
            (!el.isConnected ||
              core.isDisabledFor(el, "parallax") ||
              (core.options.respectReducedMotion && core.prefersReducedMotion())) &&
              gone.push(el);
          });
          gone.forEach(destroy);
          scan(document);
          measure();
        },
        teardown() {
          destroyAll();
          observer && (observer.disconnect(), (observer = null));
        },
      },
    };
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Parallax  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Particles  (global: EmergeParticles)
/*  Texto feito de partículas luminosas (data-emerge-particles).
/*  Depende de: Nenhuma
/* ======================================================================== */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeParticles = d());
  })(this, function () {
    "use strict";
    // Particles — o texto transforma-se em LETRAS NÍTIDAS feitas de muitas
    // partículas pequenas, redondas e macias, com alguns acentos luminosos e
    // um halo discreto (v1.7.2). A legibilidade em repouso é prioritária: a
    // estética de nuvem é um ACENTO sobre uma base legível, nunca a
    // população principal. Marcação: data-emerge-particles no elemento
    // ("repel" | "attract" | "swirl"; vazio = repel). O texto é amostrado
    // para um canvas colocado por cima; o ponteiro dispersa as partículas,
    // que regressam ao lugar em ondas suaves.
    //
    // Três CAMADAS com orçamentos fixos (fração do total de partículas):
    //   • CORPO (≥ ~80%) — define as letras: denso, pequeno e quase
    //     uniforme (tamanho 0,8×..1,3× o base, alpha 0,6..1, nunca abaixo
    //     de 0,45). Desenhado sempre em source-over, para a forma nunca
    //     saturar para branco.
    //   • ACENTOS (~6%..12%) — maiores (até ~2× o base) e mais brilhantes,
    //     com glow aditivo: é aqui que vive a profundidade e o aspeto de
    //     "luzes" da referência.
    //   • HALO (~4%..10%) — poeira pequena e pouco opaca, com desvio máximo
    //     ~0,28× a altura da fonte, que só nasce JUNTO aos contornos: a
    //     posição candidata é testada contra a máscara amostrada (a
    //     vizinhança imediata tem de ter tinta), por isso nunca aparece
    //     dentro dos contadores (o interior de a, o, ç, ã) nem no espaço
    //     entre palavras. O halo conta para o teto.
    // O `depth` passa a modular sobretudo os ACENTOS e só ligeiramente o
    // corpo — nada de partículas "de fundo" quase invisíveis: o z deixou de
    // ser enviesado para longe.
    //
    // Amostragem consciente da forma: a espessura de traço é ESTIMADA a
    // partir da máscara (razão área/perímetro) e o espaçamento automático
    // passa a ter isso em conta (≥ ~5 partículas a atravessar o traço, sem
    // ultrapassar o teto). O tamanho de cada partícula é limitado pela
    // espessura: corpo ≤ ~0,4× o traço, acentos ≤ ~0,9× — nenhuma partícula
    // do corpo é mais larga que o traço, mesmo em fontes finas. A
    // `density` (<1) só rarefaz o INTERIOR dos traços grossos; as BORDAS
    // (píxeis com vizinhos sem tinta) mantêm sempre densidade total, para
    // os contornos ficarem contínuos. A amostragem é estratificada com
    // `jitter` limitado a ½ célula (quebra a grelha sem criar buracos) e o
    // aleatório vem de um gerador com SEMENTE por elemento (`seed`): voltar
    // a amostrar no resize não "treme". Ao passar o teto `max`, a redução
    // segue a ordem: primeiro o halo, depois os acentos, depois a densidade
    // do interior — as bordas nunca.
    //
    // Escala adaptativa: as intensidades escalam com o tamanho da fonte,
    // k = clamp((fs − 24) / 72, 0, 1) — abaixo de ~32 px quase só corpo
    // nítido; a partir de ~96 px o efeito completo (acentos, halo e depth
    // multiplicados por k).
    //
    // Presets: data-emerge-particles-look = "legible" (NOVO PADRÃO: o
    // equilíbrio descrito acima) | "cloud" (o aspeto esparso da nuvem — só
    // é legível em fontes grandes e a negrito) | "grid" (grelha original,
    // sem camadas nem luz). A opção `contrast` (0..1, padrão 0.8) empurra o
    // equilíbrio: 1 = mais corpo e menos efeitos; 0 = mais nuvem. As opções
    // individuais (density, depth, halo, drift, jitter…) definidas no
    // elemento/token/global GANHAM ao preset.
    //
    // Forma e luz: shape="soft" (padrão) desenha círculos com gradiente
    // radial (núcleo claro, borda difusa); "circle" é o círculo duro e
    // "square" mantém o quadradinho. Todos os sprites são PRÉ-DESENHADOS e
    // ficam em cache por cor × balde de tamanho (8) × balde de brilho (3) —
    // nenhum arc() nem gradiente por partícula por frame. O glow aditivo
    // ("lighter") aplica-se SÓ aos acentos (com alpha limitado para a cor
    // nunca saturar); o corpo e o halo são sempre source-over. Em fundos
    // claros a mistura aditiva não funciona: em glow="auto" o plugin detecta
    // a luminância do fundo e usa source-over com uma sombra suave cozida
    // nos sprites.
    //
    // Cores (data-emerge-particles-color / token --emerge-particles-color /
    // opção global particlesColor): "text" ou vazio = cor calculada do texto
    // (spans com cores diferentes mantêm-se); uma cor CSS; uma paleta
    // separada por vírgulas (com pesos opcionais em `color-weights`);
    // "random" = HSL aleatório por partícula dentro de `random-hue`,
    // `random-sat` e `random-light`, quantizado em ≤24 cores; e
    // "gradient(#a,#b,…)" interpolado ao longo do texto (eixo horizontal;
    // `color-angle` em graus). `color-jitter` (0..1) varia matiz,
    // saturação e luminosidade à volta da cor base. `random="build|
    // resample|interval:N"` decide quando nasce uma cor aleatória nova: só
    // na construção (padrão, com semente), a cada nova amostragem, ou a cada
    // N segundos com uma transição suave (crossfade de ~0,9 s). As
    // partículas ficam agrupadas por cor E camada para mudar de sprite/
    // fillStyle o menor número de vezes por frame.
    //
    // Vida: `drift` é uma flutuação subtil permanente — fase e frequência
    // próprias por partícula, sem ruído de Perlin. A amplitude do CORPO é
    // limitada a ~0,25× o espaçamento (máx. ~0,6 px) para o contorno não
    // vazar; acentos e halo podem flutuar mais. Com drift > 0 o motor não
    // adormece enquanto o elemento está visível, mas desacelera para
    // ~30 fps; pára fora do viewport, com o separador escondido e com
    // prefers-reduced-motion (drift="0" repõe o adormecer). A rigidez da
    // mola, o atrito e o atraso de regresso variam ligeiramente por
    // partícula: o regresso acontece em ondas, não em bloco.
    //
    // Dinâmica nítido/aéreo: em repouso acentos e halo ficam discretos; ao
    // interagir (ponteiro, disperse) ganham energia e brilho — uma factor
    // interno "energy" sobe depressa e desce devagar — e voltam ao normal
    // quando as partículas assentam (evento emerge:particles:settle).
    //
    // Medida de legibilidade: Emerge.Particles.legibility(el, {dpr}) rende o
    // estado assente, compara-o com a máscara de referência do texto (ambas
    // ligeiramente desfocadas) e devolve {score, ncc, spill, …} — score 0..1
    // (correlação normalizada com penalização da tinta fora da forma). O
    // preset "legible" com os defaults deve pontuar ≥ 0,75.
    //
    // Estruturas: Float32Array (posição, casa, velocidade, z, fase, rigidez,
    // atraso) + Uint8Array (alpha, baldes, camada, flags) + Uint16Array
    // (índice de cor) — nenhum objeto por partícula. DPR limitado a 2. A
    // amostragem espera document.fonts.ready e repete-se no resize (com
    // debounce, via hooks.refresh do core) e quando a largura/altura do
    // elemento muda.
    //
    // Física: mola até à casa (constante (2π/return)², sub-amortecida para o
    // regresso "elástico") + atrito exponencial estável em qualquer dt +
    // força do ponteiro com queda quadrática dentro do radius (repel empurra,
    // attract puxa, swirl acrescenta a componente tangencial). O passo de
    // tempo é limitado (dt ≤ 64 ms) e a constante da mola é travada em
    // frames lentos (a integração é sempre estável).
    //
    // Motor: UM único rAF partilhado por todas as instâncias, que só corre
    // enquanto há algo a animar e adormece quando todas as partículas
    // assentam e o ponteiro saiu (padrão do Spotlight/Magnetic: primeiro
    // TODAS as leituras de layout, depois TODAS as escritas). Instâncias
    // fora do viewport não gastam frames (IntersectionObserver próprio e
    // partilhado).
    //
    // Acessibilidade: o texto real fica no DOM — o plugin escreve
    // `color: transparent` (inline, e nunca display: none) apenas nos
    // elementos que contêm o texto amostrado, por isso continua selecionável,
    // pesquisável e lido por leitores de ecrã; a cor original é reposta no
    // destroy e antes da impressão. Com prefers-reduced-motion, isDisabledFor,
    // sem JS ou sem suporte a canvas: texto normal, sem canvas e sem
    // alterações de layout.
    //
    // Toque: só Pointer Events (sem listeners de mouse/touch duplicados). O
    // touch-action vive no CSS (uma classe por modo, ao estilo do
    // data-emerge-spotlight-touch) e aplica-se só ao host. Nenhum
    // preventDefault: links, botões e controlos de formulário dentro do host
    // continuam a funcionar e o scroll nunca fica bloqueado por omissão
    // (pan-y por omissão: o scroll vertical continua e o toque dispersa as
    // partículas).
    //
    // Integração: coexiste com data-emerge no mesmo elemento — só se
    // "reclama" (core.claim) quem não está no pipeline do core, e nenhum
    // estilo inline do plugin toca no próprio host além da cor (o canvas é
    // um filho), por isso o estado inicial .emerge-init do core não é
    // anulado. NÃO combinar com data-emerge-split (plugin Text) no mesmo
    // elemento: o build recusa e avisa em modo debug. O observer do core só
    // vigia nós [data-emerge], por isso o Particles mantém UM observer
    // próprio e partilhado (padrão do Spotlight/Magnetic), que respeita
    // disableMutationObserver e ignora os nós .emerge-word e .emerge-part.
    // Sem will-change (o canvas redesenha-se por si; nada é transformado por
    // CSS). Prioridade das opções: atributo no elemento > token CSS
    // (--emerge-particles-*) > opção global do Emerge.init > preset
    // (look + contrast) > default do plugin (o mesmo critério dos outros
    // plugins).
    let core = null;
    const instances = new Map(), // el -> instância
      HOST = "[data-emerge-particles]",
      MODES = ["repel", "attract", "swirl"],
      SHAPES = ["soft", "circle", "square"],
      GLOWS = ["auto", "on", "off"],
      TOUCH_MODES = ["pan-y", "track", "scroll", "off"],
      INTROS = ["none", "assemble"],
      LOOKS = ["legible", "cloud", "grid"],
      SB = 8, // baldes de tamanho dos sprites (0,45×..2× o tamanho base)
      BR = 3, // baldes de brilho (a alpha fina fica para o globalAlpha)
      SPR_FACTORS = [0.45, 0.65, 0.85, 1.05, 1.25, 1.5, 1.75, 2],
      GRAD_STEPS = 24, // cores quantizadas do gradient() e do random
      // perfis do equilíbrio corpo↔nuvem: [nuvem (contrast 0), corpo
      // (contrast 1)] — o look escolhe o contrast por omissão e as opções
      // explícitas ganham sempre ao blend
      PROFILE = {
        density: [0.55, 0.95],
        depth: [0.75, 0.3],
        halo: [0.3, 0.1],
        drift: [1.6, 0.3],
        jitter: [0.85, 0.45],
      },
      // orçamentos das camadas (fração do corpo): acentos 6%..12%, halo
      // limitado a 10% do total — a "nuvem" é um acento, nunca a população
      ACC_FRAC = [0.06, 0.06], // + 0.06 × depthEff (limitado a 12%)
      HALO_CAP = 0.1, // teto do halo em fração do total
      // nós gerados pelo plugin Text (split) — nunca amostrados nem observados
      SPLIT_NODES = ".emerge-word, .emerge-part",
      // classe de estado nos elementos que contêm o texto amostrado
      TEXT_CLASS = "emerge-particles-text";
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const toEl = (x) => (typeof x == "string" ? document.querySelector(x) : x);
    // Detecção de suporte: canvas 2D (o resto degrada para o texto normal,
    // sem canvas e sem alterações de layout).
    const canParticles =
      typeof window != "undefined" &&
      typeof document != "undefined" &&
      (function () {
        try {
          const c = document.createElement("canvas");
          return !!(c.getContext && c.getContext("2d"));
        } catch (e) {
          return !1;
        }
      })();

    /* ---- Opções: atributo no elemento > token CSS > global > preset > default ---- */

    function cssToken(el, name) {
      try {
        const v = getComputedStyle(el)
          .getPropertyValue("--emerge-particles-" + name)
          .trim();
        return v === "" ? null : v;
      } catch (e) {
        return null;
      }
    }

    function globalOption(key) {
      const g = core.options[key];
      return g === null || g === undefined || g === "" ? null : g;
    }

    function numOption(el, name, key, fallback) {
      if (core.hasAttr(el, "particles-" + name)) {
        const n = Number(String(core.attr(el, "particles-" + name, "")).trim());
        if (!Number.isNaN(n)) return n;
      }
      const t = parseFloat(cssToken(el, name));
      if (!Number.isNaN(t)) return t;
      const g = globalOption(key);
      if (g !== null) {
        const n = Number(g);
        if (!Number.isNaN(n)) return n;
      }
      return fallback;
    }

    // a opção foi DEFINIDA em algum canal (attr/token/global)? — serve para
    // as opções do preset: definidas, ganham; sem definir, vêm do blend do
    // look com o contrast
    function optSet(el, name, key) {
      if (core.hasAttr(el, "particles-" + name)) return !0;
      const t = cssToken(el, name);
      if (t !== null && t !== "" && !Number.isNaN(parseFloat(t))) return !0;
      const g = globalOption(key);
      return (
        g !== null &&
        g !== undefined &&
        g !== "" &&
        !Number.isNaN(Number(String(g).trim()))
      );
    }

    function strOption(el, name, key, fallback) {
      if (core.hasAttr(el, "particles-" + name)) {
        const v = String(core.attr(el, "particles-" + name, "")).trim();
        if (v !== "") return v;
      }
      const t = cssToken(el, name);
      if (t !== null && t !== "") return t;
      const g = globalOption(key);
      if (g !== null && String(g).trim() !== "") return String(g).trim();
      return fallback;
    }

    function choiceOption(el, name, key, fallback, list) {
      const v = strOption(el, name, key, fallback).toLowerCase();
      return list.indexOf(v) < 0 ? fallback : v;
    }

    function resolveOptions(el) {
      // o valor do atributo principal É o modo ("" = default)
      const raw = el.getAttribute("data-emerge-particles");
      const mode =
        raw !== null && String(raw).trim() !== ""
          ? String(raw).trim().toLowerCase()
          : choiceOption(el, "mode", "particlesMode", "repel", MODES);
      const sampling = choiceOption(el, "sampling", "particlesSampling", "organic", [
        "organic",
        "grid",
      ]);
      // look: legible (novo padrão) | cloud | grid; sampling="grid" força
      // look="grid" (compatibilidade com a v1.7.1)
      let look = strOption(el, "look", "particlesLook", "").toLowerCase();
      if (LOOKS.indexOf(look) < 0) look = "";
      if (sampling === "grid") look = "grid";
      if (!look) look = "legible";
      // contrast: 1 = mais corpo e menos efeitos, 0 = mais nuvem. Sem valor
      // explícito, cada look traz o seu por omissão.
      const contrast = optSet(el, "contrast", "particlesContrast")
        ? clamp(numOption(el, "contrast", "particlesContrast", 0.8), 0, 1)
        : look === "cloud"
          ? 0.15
          : look === "grid"
            ? 1
            : 0.8;
      // tunáveis do preset: definidos explicitamente ganham; sem definir,
      // interpolam entre o perfil "nuvem" (contrast 0) e o "corpo" (1)
      const blend = (name, key, lo, hi) =>
        optSet(el, name, key)
          ? numOption(el, name, key, (lo + hi) / 2)
          : lo + (hi - lo) * contrast;
      const o = {
        mode: MODES.indexOf(mode) < 0 ? "repel" : mode,
        sampling: look === "grid" ? "grid" : sampling,
        look,
        contrast,
        // gap/size/color/max/seed vazios = automáticos (resolvidos na amostragem)
        gap: numOption(el, "gap", "particlesGap", 0),
        size: numOption(el, "size", "particlesSize", 0),
        shape: choiceOption(el, "shape", "particlesShape", "soft", SHAPES),
        color: strOption(el, "color", "particlesColor", ""),
        colorJitter: clamp(numOption(el, "color-jitter", "particlesColorJitter", 0.3), 0, 1),
        colorAngle: numOption(el, "color-angle", "particlesColorAngle", 0),
        colorWeights: strOption(el, "color-weights", "particlesColorWeights", ""),
        random: strOption(el, "random", "particlesRandom", "build"),
        randomHue: strOption(el, "random-hue", "particlesRandomHue", "0-360"),
        randomSat: strOption(el, "random-sat", "particlesRandomSat", "65-95"),
        randomLight: strOption(el, "random-light", "particlesRandomLight", "55-80"),
        seed: numOption(el, "seed", "particlesSeed", 0),
        density: clamp(blend("density", "particlesDensity", PROFILE.density[0], PROFILE.density[1]), 0.1, 1),
        depth: clamp(blend("depth", "particlesDepth", PROFILE.depth[0], PROFILE.depth[1]), 0, 1),
        halo: clamp(blend("halo", "particlesHalo", PROFILE.halo[0], PROFILE.halo[1]), 0, 1),
        glow: choiceOption(el, "glow", "particlesGlow", "auto", GLOWS),
        jitter: clamp(blend("jitter", "particlesJitter", PROFILE.jitter[0], PROFILE.jitter[1]), 0, 1),
        drift: Math.max(0, blend("drift", "particlesDrift", PROFILE.drift[0], PROFILE.drift[1])),
        radius: Math.max(1, numOption(el, "radius", "particlesRadius", 100)),
        strength: numOption(el, "strength", "particlesStrength", 1),
        return: Math.max(0.05, numOption(el, "return", "particlesReturn", 1)),
        friction: clamp(
          numOption(el, "friction", "particlesFriction", 0.92),
          0.05,
          0.999,
        ),
        intro: choiceOption(el, "intro", "particlesIntro", "none", INTROS),
        max: Math.round(numOption(el, "max", "particlesMax", 0)),
        touch: choiceOption(el, "touch", "particlesTouch", "pan-y", TOUCH_MODES),
        debug: !!core.attr(el, "debug", !1), // padrão Range: data-emerge-debug
      };
      // look="grid" repõe o comportamento antigo: grelha regular, sem
      // profundidade, sem halo, sem jitter, sem drift e densidade cheia —
      // só a aparência escolhida (shape, cor…) é que fica.
      if (look === "grid") {
        o.sampling = "grid";
        o.depth = 0;
        o.halo = 0;
        o.jitter = 0;
        o.drift = 0;
        o.density = 1;
      }
      return o;
    }

    /* ---- Gerador pseudoaleatório com semente ------------------------------- */

    // mulberry32: pequeno, rápido e determinístico — a MESMA semente devolve
    // a MESMA sequência, por isso voltar a amostrar no resize não "treme".
    function mulberry32(a) {
      return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // gaussiana padrão (Box-Muller) a partir do gerador com semente — serve
    // para o desvio das partículas do halo
    function gauss(rnd) {
      const u = Math.max(1e-9, rnd());
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
    }

    /* ---- Motor partilhado ------------------------------------------------ */

    const running = new Set(); // instâncias no motor (activas ou a regressar)
    let rafId = 0,
      lastTime = 0,
      lastSlow = 0; // cadência reduzida do drift (~30 fps)
    const ptr = { x: 0, y: 0, has: !1, touch: !1 };

    // Um ciclo para todas as instâncias: primeiro TODAS as leituras de layout
    // pendentes, depois TODAS as escritas (canvas).
    function frame(now) {
      rafId = 0;
      // passo de tempo limitado: sem saltos ao voltar ao separador
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.7;
      lastTime = now;
      instances.forEach((inst) => inst.dirty && inst.measure());
      // drift: com reduced-motion o flutuar pára (a instância torna a adormecer)
      const rm = core.options.respectReducedMotion && core.prefersReducedMotion();
      let disturbed = !1;
      running.forEach((inst) => {
        inst.driftAmp = rm ? 0 : inst.opts.drift > 0 ? inst.opts.drift : 0;
        if (inst.disturbed) disturbed = !0;
      });
      // Só o drift vivo → cadência reduzida (~30 fps): o rAF continua, mas o
      // passo físico só corre a cada ~30 ms. Nada distinguido → passo normal.
      if (!disturbed && now - lastSlow < 30) {
        rafId = requestAnimationFrame(frame);
        return;
      }
      lastSlow = now;
      running.forEach((inst) => {
        inst.step(dt, now) || running.delete(inst);
      });
      if (running.size) rafId = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    function kick() {
      if (!rafId && instances.size) rafId = requestAnimationFrame(frame);
    }

    function wake(inst) {
      if (inst.dead) return;
      running.add(inst);
      kick();
    }

    /* ---- Ponteiro (só Pointer Events, ao estilo do Magnetic) -------------- */

    function onMove(e) {
      ptr.touch = e.pointerType === "touch";
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.has = !0;
      // acorda as instâncias vizinhas; se nada for influenciado, tornam a
      // adormecer no primeiro passo (custo: um frame)
      instances.forEach((inst) => {
        inst.nearPointer() && wake(inst);
      });
    }

    function onOut(e) {
      e.relatedTarget || onLeave();
    }

    function onLeave() {
      ptr.has = !1; // as partículas regressam sós (a mola segue no motor)
    }

    // Mover a página sob um ponteiro parado muda as coordenadas locais.
    function onScroll() {
      if (!ptr.has || !instances.size) return;
      instances.forEach((inst) => {
        inst.nearPointer() && ((inst.dirty = !0), wake(inst));
      });
    }

    /* ---- Impressão: o texto real volta (o canvas não imprime bem) --------- */

    function onBeforePrint() {
      instances.forEach((inst) => inst.hideInk(!1));
    }

    function onAfterPrint() {
      instances.forEach((inst) => inst.hideInk(!0));
    }

    /* ---- Ligação partilhada ------------------------------------------------ */

    let sharedOn = !1;

    function wire() {
      if (sharedOn) return;
      sharedOn = !0;
      window.addEventListener("pointermove", onMove, { passive: !0 });
      window.addEventListener("pointerdown", onMove, { passive: !0 });
      window.addEventListener("pointerout", onOut, { passive: !0 });
      window.addEventListener("pointercancel", onLeave, { passive: !0 });
      document.addEventListener("pointerleave", onLeave, { passive: !0 });
      window.addEventListener("blur", onLeave);
      window.addEventListener("scroll", onScroll, { capture: !0, passive: !0 });
      window.addEventListener("beforeprint", onBeforePrint);
      window.addEventListener("afterprint", onAfterPrint);
      document.addEventListener("emerge:in", onCoreIn, !0);
      document.fonts &&
        typeof document.fonts.addEventListener == "function" &&
        document.fonts.addEventListener("loadingdone", onFontsDone);
    }

    function unwire() {
      if (!sharedOn) return;
      sharedOn = !1;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointercancel", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: !0 });
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.removeEventListener("emerge:in", onCoreIn, !0);
      document.fonts &&
        typeof document.fonts.removeEventListener == "function" &&
        document.fonts.removeEventListener("loadingdone", onFontsDone);
    }

    // intro="assemble": sincronizado com o evento emerge:in do core (quando o
    // host também tem data-emerge). Para hosts fora do pipeline do core serve
    // o IntersectionObserver próprio (ver inst.onEnter).
    function onCoreIn(e) {
      const inst = e.detail && instances.get(e.detail);
      inst && inst.opts.intro === "assemble" && inst.assembleNow();
    }

    // uma fonte terminou de carregar: o texto pode ter mudado de feitio
    let fontsTimer = 0;
    function onFontsDone() {
      clearTimeout(fontsTimer);
      fontsTimer = setTimeout(() => {
        instances.forEach((inst) => inst.sampled && inst.resample());
      }, 120);
    }

    /* ---- Visibilidade (IntersectionObserver próprio e partilhado) ---------- */

    let io = null;

    function watchVisibility() {
      if (io || typeof IntersectionObserver == "undefined") return;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            const inst = instances.get(en.target);
            if (!inst) return;
            inst.visible = en.isIntersecting;
            en.isIntersecting && inst.onEnter();
          });
        },
        { rootMargin: "80px 0px", threshold: 0 },
      );
    }

    /* ---- Observer próprio (elementos dinâmicos) ----------------------------- */

    let observer = null;
    const resampleTimers = new Map();

    // O core só vigia nós [data-emerge] — o Particles mantém UM observer
    // próprio e partilhado (padrão do Spotlight/Magnetic), respeitando
    // disableMutationObserver, para gerir adições/remoções dinâmicas e
    // re-amostrar hosts cujo texto mudou. Ignora os nós do plugin Text.
    function watch() {
      if (
        observer ||
        core.options.disableMutationObserver ||
        typeof MutationObserver == "undefined"
      )
        return;
      observer = new MutationObserver(onMutations);
      observer.observe(document.body || document.documentElement, {
        childList: !0,
        subtree: !0,
      });
    }

    function scheduleResample(el) {
      const inst = instances.get(el);
      if (!inst || inst.dead || !inst.sampled || resampleTimers.has(el)) return;
      resampleTimers.set(
        el,
        setTimeout(() => {
          resampleTimers.delete(el);
          inst.el.isConnected && inst.resample();
        }, 120),
      );
    }

    function onAdded(node) {
      if (node.nodeType !== 1 || !node.matches) return;
      // canvas próprio e nós do split (Text) não são marcação do Particles
      if (
        node.classList.contains("emerge-particles-canvas") ||
        node.matches(SPLIT_NODES)
      )
        return;
      node.matches(HOST) && build(node);
      node.querySelectorAll &&
        node.querySelectorAll(HOST).forEach((n) => {
          instances.has(n) || build(n);
        });
      // conteúdo adicionado dentro de um host existente → nova amostragem
      const host = node.closest(HOST);
      host && instances.has(host) && scheduleResample(host);
    }

    function onMutations(recs) {
      let touched = null;
      for (const rec of recs) {
        rec.addedNodes.forEach(onAdded);
        // texto/elementos mudados dentro de um host → re-amostrar esse host
        const t = rec.target;
        const root =
          t && t.nodeType === 1
            ? t
            : t && t.parentElement
              ? t.parentElement
              : null;
        const host = root && root.closest && root.closest(HOST);
        if (host && instances.has(host))
          (touched = touched || new Set()).add(host);
      }
      // Hosts que saíram do documento (após o loop, para nós apenas movidos
      // não serem destruídos e recriados — padrão do Spotlight).
      instances.forEach((inst, el) => {
        el.isConnected || destroy(el);
      });
      touched && touched.forEach(scheduleResample);
    }

    /* ---- Amostragem ---------------------------------------------------------- */

    // alpha de uma cor CSS qualquer (inclui oklch/lab): prova num canvas 1×1
    // (criado à primeira utilização — o módulo tem de carregar sem DOM, SSR)
    let probe = null;
    function probeCtx() {
      try {
        probe || (probe = document.createElement("canvas").getContext("2d"));
        return probe;
      } catch (e) {
        return null;
      }
    }

    function alphaOf(color) {
      const c = probeCtx();
      if (!c) return 255;
      try {
        c.clearRect(0, 0, 1, 1);
        c.fillStyle = color;
        c.fillRect(0, 0, 1, 1);
        return c.getImageData(0, 0, 1, 1).data[3];
      } catch (e) {
        return 255;
      }
    }

    // cor CSS qualquer → [r,g,b] 0..255. Em vez de confiar na serialização
    // do fillStyle (que varia entre hex/rgb()/hsl()/color()…), pinta a cor
    // num píxel de prova e lê-o com getImageData — a verdade do canvas.
    // Invalidade detetada com DUAS sentinelas (uma cor inválida deixa o
    // píxel anterior; uma válida nunca coincide com ambas).
    function cssToRgb(color) {
      const c = probeCtx();
      if (!c) return null;
      try {
        c.clearRect(0, 0, 1, 1);
        c.fillStyle = "#123456";
        c.fillRect(0, 0, 1, 1);
        const ref = c.getImageData(0, 0, 1, 1).data;
        c.fillStyle = color;
        c.fillRect(0, 0, 1, 1);
        let d = c.getImageData(0, 0, 1, 1).data;
        if (
          d[0] === ref[0] &&
          d[1] === ref[1] &&
          d[2] === ref[2] &&
          d[3] === ref[3]
        ) {
          // pode ser inválida — segunda sentinela para confirmar
          c.fillStyle = "#654321";
          c.fillRect(0, 0, 1, 1);
          const ref2 = c.getImageData(0, 0, 1, 1).data;
          c.fillStyle = color;
          c.fillRect(0, 0, 1, 1);
          d = c.getImageData(0, 0, 1, 1).data;
          if (
            d[0] === ref2[0] &&
            d[1] === ref2[1] &&
            d[2] === ref2[2] &&
            d[3] === ref2[3]
          )
            return null; // inválida (não pintou)
        }
        if (d[3] === 0) return null; // válida mas totalmente transparente
        return [d[0], d[1], d[2]];
      } catch (e) {}
      return null;
    }

    /* ---- Conversões HSL (para color-jitter e random) ------------------------ */

    function hsl2rgb(h, s, l) {
      h = ((h % 360) + 360) % 360;
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      return [
        Math.round(255 * f(0)),
        Math.round(255 * f(8)),
        Math.round(255 * f(4)),
      ];
    }

    function rgb2hsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const mx = Math.max(r, g, b),
        mn = Math.min(r, g, b);
      const l = (mx + mn) / 2;
      let h = 0,
        s = 0;
      if (mx !== mn) {
        const dd = mx - mn;
        s = dd / (1 - Math.abs(2 * l - 1));
        if (mx === r) h = 60 * (((g - b) / dd) % 6);
        else if (mx === g) h = 60 * ((b - r) / dd + 2);
        else h = 60 * ((r - g) / dd + 4);
      }
      return [((h % 360) + 360) % 360, s * 100, l * 100];
    }

    // "100-160" | "160" → [a, b]; inválido → [defA, defB]
    function parseRange(v, defA, defB) {
      const m = /^\s*(-?\d+(?:\.\d+)?)\s*(?:-\s*(-?\d+(?:\.\d+)?))?\s*$/.exec(
        String(v),
      );
      if (!m) return [defA, defB];
      const a = Number(m[1]);
      return [a, m[2] === undefined ? a : Number(m[2])];
    }

    // variante quantizada de uma cor base: matiz/saturação/luminosidade
    // desviam até `j` (0..1). A referência visual usa 1 matiz com variação de
    // luminosidade, por isso o desvio de matiz é o mais estreito dos três.
    function jitterColor(rgb, rnd, j) {
      const hsl = rgb2hsl(rgb[0], rgb[1], rgb[2]);
      const h = hsl[0] + (rnd() - 0.5) * 56 * j;
      const s = clamp(hsl[1] * (1 + (rnd() - 0.5) * 0.6 * j), 0, 100);
      const l = clamp(hsl[2] * (1 + (rnd() - 0.5) * 0.85 * j), 4, 96);
      return hsl2rgb(h, s, l);
    }

    // interpolação linear numa lista de paragens [[r,g,b]…], t 0..1
    function sampleStops(stops, t) {
      const m = stops.length - 1;
      const x = clamp(t, 0, 1) * m;
      const k = Math.min(m - 1, Math.floor(x));
      const f = x - k;
      const a = stops[k],
        b = stops[k + 1];
      return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
      ];
    }

    // especificação da opção color → {kind: text|single|palette|random|
    // gradient, colors?} — a validação das cores fica para o applyColors
    // O split respeita parênteses: "rgb(255,0,0),#fff" são DUAS cores, não
    // três fragmentos partidos dentro de rgb()
    function splitColors(s) {
      const out = [];
      let depth = 0,
        cur = "";
      for (const ch of s) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
          out.push(cur.trim());
          cur = "";
        } else cur += ch;
      }
      if (cur.trim() !== "" || out.length) out.push(cur.trim());
      return out.filter(Boolean);
    }

    function parseColorSpec(v) {
      const s = String(v == null ? "" : v).trim();
      const low = s.toLowerCase();
      if (s === "" || low === "text") return { kind: "text" };
      if (low === "random") return { kind: "random" };
      const mg = /^gradient\s*\((.*)\)$/i.exec(s);
      if (mg)
        return { kind: "gradient", colors: splitColors(mg[1]) };
      const parts = splitColors(s);
      return parts.length > 1
        ? { kind: "palette", colors: parts }
        : { kind: "single", colors: parts };
    }

    // luminância do primeiro fundo opaco do elemento para cima — decide se a
    // mistura aditiva é segura (fundo escuro) ou tem de cair para source-over
    // com sombra (fundo claro)
    function bgLumaOf(el) {
      let n = el;
      for (let i = 0; n && n.nodeType === 1 && i < 10; i++) {
        let bg = "";
        try {
          bg = getComputedStyle(n).backgroundColor;
        } catch (e) {
          return 0;
        }
        const m = /rgba?\(([^)]+)\)/.exec(bg);
        if (m) {
          const p = m[1].split(/[\s,/]+/).map(Number);
          const a = p.length > 3 ? p[3] : 1;
          if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite) && a > 0.05)
            return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
        }
        n = n.parentElement;
      }
      return 0; // transparente até ao topo: assume-se escuro
    }

    /* ---- Fragmentos de texto (posições fiéis ao CSS) ------------------------ */

    function applyTransform(text, tt) {
      if (tt === "uppercase") return text.toUpperCase();
      if (tt === "lowercase") return text.toLowerCase();
      if (tt === "capitalize")
        return text.replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase());
      return text;
    }

    // fragmentos de um nó de texto: [{ text, rect, perChar }] — a posição de
    // cada palavra vem de Range + getClientRects() (multilinha, text-align e
    // spans com cores diferentes funcionam sem alterar o DOM)
    function fragmentsFor(node) {
      const text = node.nodeValue;
      const parent = node.parentElement;
      if (!text || !text.trim() || !parent) return [];
      if (parent.closest(SPLIT_NODES) || parent.closest("svg")) return [];
      let cs;
      try {
        cs = getComputedStyle(parent);
      } catch (e) {
        return [];
      }
      if (cs.display === "none" || cs.visibility === "hidden") return [];
      const tt = cs.textTransform;
      const tokens = text.match(/\S+|\s+/g) || [];
      const out = [];
      let offset = 0;
      for (const token of tokens) {
        const start = offset;
        offset += token.length;
        if (!token.trim()) continue; // espaços não têm tinta
        const word = applyTransform(token, tt);
        const range = document.createRange();
        try {
          range.setStart(node, start);
          range.setEnd(node, start + token.length);
        } catch (e) {
          continue;
        }
        const rects = range.getClientRects();
        if (!rects.length) continue;
        if (rects.length === 1) {
          out.push({ text: word, rect: rects[0], perChar: !1 });
        } else {
          // palavra partida pelo wrap (overflow-wrap/hífen): desenha
          // carácter a carácter nas rect exactas, sem letter-spacing
          for (let i = 0; i < token.length; i++) {
            try {
              range.setStart(node, start + i);
              range.setEnd(node, start + i + 1);
            } catch (e) {
              continue;
            }
            const cr = range.getClientRects();
            cr.length &&
              out.push({
                text: applyTransform(token[i], tt),
                rect: cr[0],
                perChar: !0,
              });
          }
        }
      }
      return out;
    }

    function autoGap(el, dpr, org) {
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      // ecrãs densos representam melhor amostragem mais fina; no modo nuvem
      // a amostragem é mais larga (o look cloud é esparso por desígnio — só
      // é legível em fontes grandes e a negrito)
      const k = org ? (dpr >= 2 ? 22 : 16) : dpr >= 2 ? 16 : 11;
      return clamp(Math.round(fs / k), 2, 10);
    }

    // varre a imagem amostrada e devolve [x, y, r, g, b, a, …] em px de
    // dispositivo — o caminho antigo (look="grid"): grelha regular, corte em
    // ordem de varrimento ao passar do teto, sem camadas nem halo.
    function collectPoints(data, cw, ch, step, cap) {
      const out = [];
      for (let py = 0; py < ch; py += step) {
        for (let px = 0; px < cw; px += step) {
          const xi = px < cw - 1 ? px : cw - 1;
          const yi = py < ch - 1 ? py : ch - 1;
          const o = (yi * cw + xi) * 4;
          if (data[o + 3] < 120) continue; // só tinta
          out.push(px, py, data[o], data[o + 1], data[o + 2], data[o + 3]);
          if (out.length >= cap * 6) return out;
        }
      }
      return out;
    }

    // recolha ORGÂNICA consciente da forma: grelha estratificada com jitter
    // limitado a ½ célula (quebra a grelha sem criar buracos) e DETECÇÃO DE
    // BORDA — cada ponto fica marcado como borda (vizinhos sem tinta a ~½
    // célula) ou interior; as bordas nunca são rarefeitas, por isso os
    // contornos das letras ficam contínuos. Devolve {pts, edge}.
    function collectOrganic(data, cw, ch, step, cap, rnd, jitter) {
      const jmax = step * Math.min(jitter, 0.5); // ≤ ½ célula (B)
      const nb = Math.max(1, step >> 1); // raio do teste de borda
      const pts = [];
      const edge = [];
      const aAt = (x, y) => data[(y * cw + x) * 4 + 3];
      for (let py = 0; py < ch; py += step) {
        for (let px = 0; px < cw; px += step) {
          const sx = px + rnd() * jmax;
          const sy = py + rnd() * jmax;
          const xi = sx < cw - 1 ? sx | 0 : cw - 1;
          const yi = sy < ch - 1 ? sy | 0 : ch - 1;
          const o = (yi * cw + xi) * 4;
          if (data[o + 3] < 120) continue; // só tinta
          const xl = xi - nb < 0,
            xr = xi + nb >= cw,
            yt = yi - nb < 0,
            yb = yi + nb >= ch;
          const isEdge =
            (!xl && aAt(xi - nb, yi) < 120) ||
            (!xr && aAt(xi + nb, yi) < 120) ||
            (!yt && aAt(xi, yi - nb) < 120) ||
            (!yb && aAt(xi, yi + nb) < 120);
          pts.push(sx, sy, data[o], data[o + 1], data[o + 2], data[o + 3]);
          edge.push(isEdge ? 1 : 0);
          if (pts.length >= cap * 6) return { pts, edge }; // guarda de memória
        }
      }
      return { pts, edge };
    }

    // rarefação que preserva a forma: a `density` (<1) só largura pontos do
    // INTERIOR; as bordas mantêm SEMPRE densidade total (contornos
    // contínuos). Reescreve os arrays no próprio sítio (sem memória nova).
    function rarefyInterior(pts, edge, n, density, rnd) {
      if (density >= 1 || n <= 32) return n;
      let m = 0;
      for (let i = 0; i < n; i++) {
        // borda fica sempre; interior larga com probabilidade (1 - density)
        if (!edge[i] && rnd() > density) continue;
        if (m !== i) {
          const a = m * 6,
            b = i * 6;
          for (let k = 0; k < 6; k++) pts[a + k] = pts[b + k];
          edge[m] = edge[i];
        }
        m++;
      }
      return m;
    }

    // teto com proteção: reduz primeiro o INTERIOR (aceitação sequencial —
    // uniforme e determinística com a semente); as bordas só se for
    // impossível caber (teto < nº de bordas) — nunca em ordem de varrimento,
    // que apagava o fundo do texto. Reescreve os arrays no próprio sítio.
    function thinProtectEdges(pts, edge, n, keep, rnd) {
      if (keep >= n) return n;
      let nEdge = 0;
      for (let i = 0; i < n; i++) nEdge += edge[i];
      const nInt = n - nEdge;
      // teto impossível (menor que o nº de bordas): subamostra tudo
      const protect = keep >= nEdge;
      let leftInt = protect ? keep - nEdge : Math.round((keep / n) * nInt);
      let leftE = protect ? nEdge : keep - leftInt;
      let m = 0,
        seenInt = 0,
        seenE = 0;
      for (let i = 0; i < n; i++) {
        const isE = edge[i] === 1;
        let take;
        if (isE) {
          take = leftE > 0 && rnd() * (nEdge - seenE) < leftE;
          if (take) leftE--;
          seenE++;
        } else {
          take = leftInt > 0 && rnd() * (nInt - seenInt) < leftInt;
          if (take) leftInt--;
          seenInt++;
        }
        if (!take) continue;
        if (m !== i) {
          const a = m * 6,
            b = i * 6;
          for (let k = 0; k < 6; k++) pts[a + k] = pts[b + k];
          edge[m] = edge[i];
        }
        m++;
      }
      return m;
    }

    /* ---- Instância ----------------------------------------------------------- */

    class ParticlesInstance {
      constructor(el, opts) {
        this.el = el;
        this.opts = opts;
        this.canvas = null;
        this.vctx = null;
        this.rect = null;
        this.margin = 80; // folga do canvas para além do host (partículas ao vento)
        this.cwCss = 0;
        this.chCss = 0;
        this.edpr = 1;
        this.count = 0;
        this.sizeCss = 2;
        this.gap = 4; // espaçamento usado na amostragem (px CSS)
        this.swCss = 4; // espessura de traço estimada (px CSS)
        this.depthEff = opts.depth; // depth já escalado pela fonte (k)
        this.hx = null; // casa
        this.hy = null;
        this.x = null;
        this.y = null;
        this.vx = null;
        this.vy = null;
        this.al = null; // alpha final por partícula (0..255)
        this.alPix = null; // alpha amostrado da tinta (recalculado no refit)
        this.z = null; // profundidade 0..1 (uniforme no corpo; alto nos acentos)
        this.ph = null; // fase própria (drift e variação de atrito)
        this.km = null; // multiplicador de rigidez/massa da mola
        this.dl = null; // atraso de regresso, em segundos
        this.ly = null; // camada: 0 = corpo, 1 = acento, 2 = halo
        this.sb = null; // balde de tamanho (sprite)
        this.bb = null; // balde de brilho (sprite)
        this.gl = null; // 1 = desenha também o halo de glow (só acentos)
        this.hl = null; // 1 = partícula do halo (poeira solta)
        this.ci = null; // índice de cor (Uint16)
        this.pal = null; // [{rgb, style}] — cores distintas da instância
        this.groups = []; // [{style, rgb, b, a, h, sprites, glow}] — cor × camada
        this.tblBody = null; // tamanho desenhado por balde (px CSS)
        this.tblGlow = null; // tamanho do halo de glow por balde
        this.seed = 0; // semente do gerador (fixada no build)
        this.rsCount = 0; // gerador avança em random="resample"/interval
        this.colorSpec = null; // especificação de cor em vigor
        this.additive = !1; // acentos em mistura aditiva ("lighter")?
        this.glowEff = !1; // sprites de glow activos?
        this.bgLuma = 0;
        this.bgLight = !1;
        this.energy = 0; // 0 = em repouso (discreto) .. 1 = a interagir (aéreo)
        this.driftAmp = 0; // px de drift (0 = desligado/adormece)
        this.relT = 0; // instante em que o ponteiro soltou (atrasos de regresso)
        this.wasPin = !1;
        this.xf = null; // crossfade do random="interval:N" {groups, t0}
        this.colorTimer = 0; // temporizador do interval:N
        this.sampled = !1;
        this.sampling = !1;
        this.dead = !1;
        this.visible = void 0;
        this.disturbed = !1;
        this.dirty = !1;
        this.lastW = 0;
        this.lastH = 0;
        this.textEls = new Set(); // elementos com o texto amostrado
        this.savedInline = new Map(); // el -> { color, fill }
        this.colorCache = new Map(); // el -> cor visível (pré-transparência)
        // mola: ω = 2π / return → k = ω² ; atrito exponencial por segundo
        this.springK = Math.pow((2 * Math.PI) / opts.return, 2);
        this.dampPerSec = -Math.log(opts.friction) * 60;
      }

      /* ---- montagem / geometria ---- */

      mount() {
        const canvas = document.createElement("canvas");
        canvas.className = "emerge-particles-canvas";
        canvas.setAttribute("aria-hidden", "true");
        this.canvas = canvas;
        this.vctx = canvas.getContext("2d");
        this.el.appendChild(canvas); // depois do texto → pinta por cima
        this.rect = this.el.getBoundingClientRect();
        this.scheduleSample();
      }

      // espera document.fonts.ready antes de amostrar (a fonte tem de estar
      // madura para medir e desenhar bem; ready resolve logo se já estiver)
      scheduleSample() {
        if (this.dead || this.sampling) return;
        this.sampling = !0;
        const go = () => {
          this.sampling = !1;
          !this.dead && this.resample();
        };
        if (document.fonts && document.fonts.ready && document.fonts.ready.then)
          document.fonts.ready.then(go, go);
        else go();
      }

      // leitura de layout (fase de leitura do motor); re-amostra se o
      // tamanho do elemento mudou
      measure() {
        this.dirty = !1;
        if (this.dead || !this.el.isConnected) return;
        const r = this.el.getBoundingClientRect();
        this.rect = r;
        this.sampled &&
          (Math.abs(r.width - this.lastW) > 0.5 ||
            Math.abs(r.height - this.lastH) > 0.5) &&
          this.resample();
      }

      nearPointer() {
        if (
          !this.rect ||
          !this.count ||
          this.dead ||
          (ptr.touch && this.opts.touch === "off")
        )
          return !1;
        const r = this.rect,
          m = this.margin + this.opts.radius;
        return (
          ptr.x > r.left - m &&
          ptr.x < r.right + m &&
          ptr.y > r.top - m &&
          ptr.y < r.bottom + m
        );
      }

      /* ---- amostragem completa ---- */

      resample() {
        if (this.dead || this.sampling || !this.el.isConnected) return;
        try {
          this.sampleNow();
        } catch (e) {
          this.sampled = !1;
        }
      }

      sampleNow() {
        const st = buildState(this.el, this.opts, this.seed, null, this);
        if (!st) {
          this.sampled = !1;
          return;
        }
        // adopta o estado amostrado (os arrays são partilhados, sem cópias)
        this.rect = st.rect;
        this.edpr = st.edpr;
        this.count = st.count;
        this.sizeCss = st.sizeCss;
        this.gap = st.gap;
        this.swCss = st.swCss;
        this.depthEff = st.depthEff;
        this.cwCss = st.cwCss;
        this.chCss = st.chCss;
        this.hx = st.hx;
        this.hy = st.hy;
        this.x = st.x;
        this.y = st.y;
        this.vx = st.vx;
        this.vy = st.vy;
        this.al = st.al;
        this.alPix = st.alPix;
        this.z = st.z;
        this.ph = st.ph;
        this.km = st.km;
        this.dl = st.dl;
        this.ly = st.ly;
        this.sb = st.sb;
        this.bb = st.bb;
        this.gl = st.gl;
        this.hl = st.hl;
        this.baseRGB = st.baseRGB;
        this.ci = st.ci;
        this.bgLuma = st.bgLuma;
        this.bgLight = st.bgLight;
        this.additive = st.additive;
        this.glowEff = st.glowEff;
        this.bbox = st.bbox; // caixa da tinta (usada pela legibilidade)
        this.sampled = !0;
        this.lastW = st.lastW;
        this.lastH = st.lastH;

        /* cores → factores por partícula → grupos → sprites */
        String(this.opts.random).trim().toLowerCase() !== "build" && this.rsCount++;
        this.applyColors();
        this.refit();
        this.scheduleRandom();

        /* geometria do canvas visível (folga M em todas as direções) */
        const M = this.margin,
          canvas = this.canvas;
        canvas.style.left = -M + "px";
        canvas.style.top = -M + "px";
        canvas.style.width = this.cwCss + "px";
        canvas.style.height = this.chCss + "px";
        canvas.width = Math.min(4096, Math.ceil(this.cwCss * this.edpr));
        canvas.height = Math.min(4096, Math.ceil(this.chCss * this.edpr));
        this.vctx.setTransform(this.edpr, 0, 0, this.edpr, 0, 0);

        /* intro="assemble": nasce espalhada e junta-se ao entrar no viewport */
        if (this.opts.intro === "assemble") this.assembleNow();
        else this.draw(0); // estado estático inicial (letras em repouso)
      }

      /* ---- cores: atribui um índice de cor a cada partícula ------------------- */

      applyColors() {
        applyColorsTo(this);
      }

      /* ---- factores por partícula (camada/z) + grupos + sprites ---------------- */

      // Recalcula o que depende de depth/glow (sem voltar a amostrar): alpha,
      // baldes de sprite, rigidez/atrito/atraso. Usado no build e quando a
      // cor ou o depth mudam em runtime (setColor / sliders da demo).
      refit() {
        factorsTo(this);
        this.regroup();
        this.buildSprites();
      }

      // agrupa por cor × camada (menos mudanças de sprite/fillStyle/composite
      // por frame: cada passada desenha uma camada inteira de uma cor)
      regroup() {
        regroupTo(this);
      }

      // sprites PRÉ-DESENHADOS em cache por cor × balde de tamanho × balde
      // de brilho — nenhum arc()/gradiente por partícula por frame.
      buildSprites() {
        buildSpritesTo(this);
      }

      /* ---- cores aleatórias por intervalo (random="interval:N") ---------------- */

      scheduleRandom() {
        clearTimeout(this.colorTimer);
        this.colorTimer = 0;
        const m = /^interval:(\d+(?:\.\d+)?)$/i.exec(
          String(this.opts.random).trim(),
        );
        if (!m || !this.colorSpec || this.colorSpec.kind !== "random") return;
        const ms = Math.max(1, Number(m[1])) * 1000;
        const tick = () => {
          if (this.dead) return;
          const again = /^interval:/i.test(String(this.opts.random).trim());
          if (!again || !this.colorSpec || this.colorSpec.kind !== "random")
            return;
          // fora do viewport ou com o separador escondido: salta esta rodada
          if (this.visible !== !1 && !document.hidden) this.transitionColors();
          this.colorTimer = setTimeout(tick, ms);
        };
        this.colorTimer = setTimeout(tick, ms);
      }

      // nova atribuição aleatória com transição suave: os grupos antigos
      // (sprites em cache) cruzam-se com os novos num crossfade de ~0,9 s —
      // cada partícula é desenhada duas vezes só durante a transição
      transitionColors() {
        if (this.dead || !this.count || !this.sampled) return;
        this.xf = { groups: this.groups, t0: performance.now() };
        this.rsCount++;
        this.applyColors();
        this.refit();
        wake(this);
      }

      /* ---- tinta original (cor) ------------------------------------------------ */

      // esconde (on) ou repõe a cor dos elementos que contêm o texto
      // amostrado — inline, só nesses elementos, nunca display: none
      hideInk(on) {
        if (on) {
          this.collectTextEls();
          for (const p of this.textEls) {
            if (!p.isConnected) continue;
            if (!this.savedInline.has(p)) {
              this.savedInline.set(p, {
                color: p.style.color || "",
                fill: p.style.webkitTextFillColor || "",
              });
            }
            p.style.color = "transparent";
            "webkitTextFillColor" in p.style &&
              (p.style.webkitTextFillColor = "transparent");
            p.classList.add(TEXT_CLASS);
          }
        } else {
          this.restoreText();
        }
      }

      collectTextEls() {
        const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_TEXT, {
          acceptNode(n) {
            if (!n.nodeValue || !n.nodeValue.trim())
              return NodeFilter.FILTER_REJECT;
            const p = n.parentElement;
            if (
              !p ||
              p.closest(SPLIT_NODES) ||
              p.closest("svg") ||
              p.closest("script, style")
            )
              return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        while (walker.nextNode())
          this.textEls.add(walker.currentNode.parentElement);
      }

      restoreText() {
        for (const p of this.textEls) {
          if (!p.isConnected) continue;
          const s = this.savedInline.get(p);
          if (s) {
            s.color ? (p.style.color = s.color) : p.style.removeProperty("color");
            if ("webkitTextFillColor" in p.style)
              s.fill
                ? (p.style.webkitTextFillColor = s.fill)
                : p.style.removeProperty("-webkit-text-fill-color");
          }
          p.classList.remove(TEXT_CLASS);
        }
        this.textEls.clear();
        this.savedInline.clear();
      }

      /* ---- intro="assemble" ----------------------------------------------------- */

      onEnter() {
        if (!this.sampled) this.scheduleSample(); // a 1.ª amostragem falhou
        if (this.opts.intro === "assemble") this.assembleNow();
        else this.disturbed && wake(this); // retoma a física a meio do regresso
      }

      // nasce espalhada numa coroa em torno do elemento; junta-se quando o
      // elemento entra no viewport (emerge:in do core ou o observer próprio).
      // O relT dá a cada partícula o seu atraso: a montagem entra em ondas.
      assembleNow() {
        if (!this.count || this.dead || !this.sampled) return;
        const cx = this.cwCss / 2,
          cy = this.chCss / 2;
        const R = Math.max(this.cwCss, this.chCss) * 0.75;
        const { x, y, vx, vy } = this;
        for (let i = 0; i < this.count; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = R * (0.35 + 0.65 * Math.random());
          x[i] = clamp(cx + Math.cos(a) * r, 0, this.cwCss);
          y[i] = clamp(cy + Math.sin(a) * r, 0, this.chCss);
          vx[i] = vy[i] = 0;
        }
        this.relT = performance.now();
        if (this.visible === !1) return; // fora do viewport: junta-se ao entrar
        this.disturbed = !0;
        this.energy = Math.max(this.energy, 0.9); // a montagem também acende
        wake(this);
      }

      /* ---- impulso manual (API) -------------------------------------------------- */

      // px/py relativos ao canto superior esquerdo do elemento (null =
      // centro da TINTA — a caixa do texto, não a do elemento: em hosts
      // largos com texto curto o centro do elemento fica longe das
      // partículas e o impulso não chegava a nada)
      disperse(px, py) {
        if (!this.count || this.dead || !this.sampled) return;
        const bb = this.bbox,
          edpr = this.edpr || 1;
        const cx =
          (px == null
            ? bb
              ? (bb.x0 + bb.x1) / 2 / edpr
              : this.lastW / 2
            : px) + this.margin;
        const cy =
          (py == null
            ? bb
              ? (bb.y0 + bb.y1) / 2 / edpr
              : this.lastH / 2
            : py) + this.margin;
        const R = this.opts.radius * 2;
        const boost = 900 * Math.max(0.4, this.opts.strength);
        const dep = this.opts.depth;
        const { x, y, vx, vy, z } = this;
        for (let i = 0; i < this.count; i++) {
          const dx = x[i] - cx,
            dy = y[i] - cy;
          const d = Math.hypot(dx, dy) || 1;
          const f = Math.pow(Math.max(0, 1 - d / R), 1.5);
          if (!f) continue;
          // os acentos (z alto) sentem o impulso um pouco mais
          const fz = f * (1 + (0.35 + 0.65 * z[i] - 1) * dep);
          vx[i] += (dx / d) * boost * fz + (Math.random() - 0.5) * 40 * fz;
          vy[i] += (dy / d) * boost * fz + (Math.random() - 0.5) * 40 * fz;
        }
        this.relT = performance.now();
        this.disturbed = !0;
        this.energy = Math.max(this.energy, 0.9); // a luz acende no impulso
        wake(this);
      }

      /* ---- passo do motor -------------------------------------------------------- */

      // Um passo: física + escrita no canvas. Devolve false quando pode
      // adormecer (tudo assentou, sem drift, sem crossfade e o ponteiro não
      // está a influenciar).
      step(dt, now) {
        if (this.dead || !this.sampled || !this.count || this.visible === !1)
          return !1;
        if (this.dirty) this.measure();
        const o = this.opts;
        const s = dt / 1000;
        // estabilidade: em frames lentos trava a constante da mola
        const k = Math.min(this.springK, 0.2 / (s * s));
        const mult = Math.exp(-this.dampPerSec * s);

        // ponteiro em coordenadas locais (rect fresco — onScroll marca dirty)
        let lx = 0,
          ly0 = 0,
          pin = !1;
        if (ptr.has && this.rect && !(ptr.touch && o.touch === "off")) {
          lx = ptr.x - this.rect.left + this.margin;
          ly0 = ptr.y - this.rect.top + this.margin;
          pin =
            lx > -o.radius &&
            lx < this.cwCss + o.radius &&
            ly0 > -o.radius &&
            ly0 < this.chCss + o.radius;
        }
        const R2 = o.radius * o.radius;
        const F = 3600 * o.strength;
        const mode = o.mode;
        const dep = this.depthEff;
        const { hx, hy, x, y, vx, vy, z, km, dl, ph } = this;
        pin && (this.disturbed = !0);
        // o ponteiro acabou de soltar: arranca a contagem dos atrasos
        if (!pin && this.wasPin) this.relT = now;
        this.wasPin = pin;
        const relS = this.relT ? (now - this.relT) / 1000 : 99;
        let active = !1;

        for (let i = 0; i < this.count; i++) {
          const zi = z[i];
          // mola por partícula (rigidez/massa) + atraso de regresso: solto o
          // ponteiro, cada partícula só "acorda" depois do seu dl[i] — o
          // regresso espalha-se em ondas. Durante o atraso a mola fica quase
          // solta (0,12) e a partícula vagueia com o drift.
          const eng =
            pin || relS >= 0.6 || relS >= dl[i] ? 1 : 0.12;
          let ax = (hx[i] - x[i]) * k * km[i] * eng;
          let ay = (hy[i] - y[i]) * k * km[i] * eng;
          if (pin) {
            const dx = x[i] - lx,
              dy = y[i] - ly0;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 0.001;
              const t = 1 - d / o.radius;
              // queda suave (quadrática); os acentos (z alto) reagem mais
              const f = t * t * F * (1 + (0.35 + 0.65 * zi - 1) * dep);
              const ux = dx / d,
                uy = dy / d;
              if (mode === "attract") {
                ax -= ux * f;
                ay -= uy * f;
              } else if (mode === "swirl") {
                // componente tangencial + um empurrão para fora (não colapsa)
                ax += -uy * f * 0.9 + ux * f * 0.35;
                ay += ux * f * 0.9 + uy * f * 0.35;
              } else {
                ax += ux * f;
                ay += uy * f;
              }
            }
          }
          // atrito exponencial estável, com pequena variação por partícula
          const mI =
            1 -
            (1 - mult) *
              (1 + (0.88 + 0.24 * (ph[i] / 6.28318) - 1) * dep);
          vx[i] = (vx[i] + ax * s) * mI;
          vy[i] = (vy[i] + ay * s) * mI;
          x[i] += vx[i] * s;
          y[i] += vy[i] * s;
          if (
            !active &&
            (Math.abs(x[i] - hx[i]) > 0.08 ||
              Math.abs(y[i] - hy[i]) > 0.08 ||
              Math.abs(vx[i]) > 3 ||
              Math.abs(vy[i]) > 3)
          )
            active = !0;
        }
        // energia da interação: sobe depressa enquanto o ponteiro está em
        // cima (a luz acende), desce devagar quando sai — e apaga ao
        // assentar. disperse/assemble também a acendem (ver adiante).
        const eT = pin ? 1 : 0;
        if (eT > this.energy)
          this.energy += (eT - this.energy) * Math.min(1, dt / 160);
        else this.energy += (eT - this.energy) * Math.min(1, dt / 620);
        if (!eT && this.energy < 0.005) this.energy = 0;
        this.draw(now);
        if (!active && !this.driftAmp && !this.xf && this.energy <= 0) {
          this.settle(now);
          return !1;
        }
        return !0;
      }

      // tudo no lugar: estado final escrito uma última vez e motor adormece
      // (só é chamado sem drift e sem crossfade — com drift a nuvem nunca
      // assenta por completo, por isso o motor desacelera em vez de dormir)
      settle(now) {
        const { hx, hy, x, y, vx, vy } = this;
        for (let i = 0; i < this.count; i++) {
          x[i] = hx[i];
          y[i] = hy[i];
          vx[i] = vy[i] = 0;
        }
        this.assembling = !1;
        this.relT = 0;
        this.energy = 0; // luz apaga: acentos e halo voltam ao discreto
        this.draw(now);
        if (this.disturbed) {
          this.disturbed = !1;
          core.dispatch("emerge:particles:settle", { el: this.el });
        }
      }

      /* ---- escrita (canvas) ------------------------------------------------------- */

      draw(now) {
        paintCloud(this.vctx, this, now);
      }

      /* ---- destruição --------------------------------------------------------------- */

      destroy() {
        this.dead = !0;
        running.delete(this);
        io && io.unobserve(this.el);
        const t = resampleTimers.get(this.el);
        t && (clearTimeout(t), resampleTimers.delete(this.el));
        clearTimeout(this.colorTimer);
        this.colorTimer = 0;
        this.xf = null;
        this.canvas && this.canvas.remove();
        this.canvas = this.vctx = null;
        this.restoreText();
        // liberta os buffers grandes (a instância pode viver noutra variável)
        this.hx = this.hy = this.x = this.y = this.vx = this.vy = null;
        this.al = this.alPix = this.z = this.ph = this.km = this.dl = null;
        this.sb = this.bb = this.gl = this.hl = this.ly = this.ci = null;
        this.baseRGB = null;
        this.pal = null;
        this.groups = [];
        this.tblBody = this.tblGlow = null;
        this.count = 0;
        this.el.classList.remove(
          "emerge-particles",
          "emerge-particles-touch-pan-y",
          "emerge-particles-touch-track",
        );
        this.el.hasAttribute("data-emerge") || core.release(this.el);
        instances.delete(this.el);
        core.dispatch("emerge:particles:destroy", { el: this.el });
        instances.size || unwire();
      }
    }

    /* ---- estado amostrado (partilhado pela instância e pela medida de
       legibilidade com DPR próprio) ------------------------------------------- */

    // Desenha o texto do elemento num canvas fora do ecrã (a MÁSCARA) — a
    // mesma rotina serve para amostrar e para a referência da medida de
    // legibilidade. inst = instância viva (cache de cores) ou null.
    // Devolve {canvas, ctx, data}.
    function drawTextMask(el, rect, M, cw, ch, edpr, inst) {
      const off = document.createElement("canvas");
      off.width = cw;
      off.height = ch;
      const ctx = off.getContext("2d", { willReadFrequently: !0 });
      ctx.setTransform(edpr, 0, 0, edpr, 0, 0);
      ctx.textBaseline = "alphabetic";
      const canLS = "letterSpacing" in ctx;
      const styles = new Map(); // el -> computedStyle
      const colors = new Map(); // el -> fillStyle
      const styleOf = (p) => {
        let c = styles.get(p);
        if (!c) ((c = getComputedStyle(p)), styles.set(p, c));
        return c;
      };
      // nas re-amostras o texto já está transparente: usa a cache ou a
      // ascendente visível (a cor é lida ANTES de esconder a tinta)
      const colorCache = new Map();
      const colorOf = (p) => {
        if (inst && inst.opts.color) return inst.opts.color;
        if (colors.has(p)) return colors.get(p);
        let c = inst ? inst.colorCache.get(p) : colorCache.get(p);
        if (!c || alphaOf(c) === 0) {
          const live = visibleColor(p);
          live && (inst ? inst.colorCache.set(p, live) : colorCache.set(p, live));
          c = live || c || "#000";
        }
        colors.set(p, c);
        return c;
      };
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (!n.nodeValue || !n.nodeValue.trim())
            return NodeFilter.FILTER_REJECT;
          const p = n.parentElement;
          if (
            !p ||
            p.closest(SPLIT_NODES) ||
            p.closest("svg") ||
            p.closest("script, style")
          )
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const frags = fragmentsFor(node);
        if (!frags.length) continue;
        const p = node.parentElement;
        const cs = styleOf(p);
        ctx.font =
          cs.fontStyle +
          " " +
          cs.fontVariant +
          " " +
          cs.fontWeight +
          " " +
          cs.fontSize +
          " " +
          cs.fontFamily;
        ctx.fillStyle = colorOf(p);
        const ls = parseFloat(cs.letterSpacing) || 0;
        for (const f of frags) {
          const x = f.rect.left - rect.left + M;
          // linha de base: a caixa inline tem a altura das métricas da
          // fonte (fontBoundingBox); sem suporte, rácio típico de 0,8
          const m = ctx.measureText(f.text);
          const base =
            f.rect.top -
            rect.top +
            M +
            (m.fontBoundingBoxAscent || f.rect.height * 0.8);
          if (f.perChar) {
            // palavra partida pelo wrap: posições exactas por carácter
            for (const ch2 of f.text) {
              ctx.fillText(ch2, x, base);
              break; // um carácter só — a posição já vem do DOM
            }
          } else if (ls && !canLS) {
            // sem ctx.letterSpacing: avanço manual carácter a carácter
            let cx2 = x;
            for (const ch2 of f.text) {
              ctx.fillText(ch2, cx2, base);
              cx2 += ctx.measureText(ch2).width + ls;
            }
          } else {
            canLS && (ctx.letterSpacing = ls + "px");
            ctx.fillText(f.text, x, base);
          }
        }
      }
      canLS && (ctx.letterSpacing = "0px");
      return { canvas: off, ctx, data: ctx.getImageData(0, 0, cw, ch).data };
    }

    // espessura de traço estimada pela razão área/perímetro sobre a máscara
    // (dentro da caixa da tinta, por isso é barata): um traço w×L tem
    // área ≈ wL e perímetro ≈ 2L → w ≈ 2·área/perímetro. Devolve px CSS.
    function strokeFromMask(data, cw, ch, x0, y0, x1, y1, edpr) {
      let n = 0,
        e = 0;
      const aAt = (x, y) => data[(y * cw + x) * 4 + 3];
      for (let y = y0; y <= y1; y++) {
        const row = y * cw;
        for (let x = x0; x <= x1; x++) {
          if (data[(row + x) * 4 + 3] < 120) continue;
          n++;
          if (
            (x <= x0 || aAt(x - 1, y) < 120) ||
            (x >= x1 || aAt(x + 1, y) < 120) ||
            (y <= y0 || aAt(x, y - 1) < 120) ||
            (y >= y1 || aAt(x, y + 1) < 120)
          )
            e++;
        }
      }
      if (!n) return Math.max(1, 2 / edpr);
      // traços finos: o perímetro inclui os topos, por isso 2n/e subestima um
      // pouco — o clamp inferior (1 px) e o teto (½ da altura da caixa)
      // mantêm a estimativa sensata
      const w = (2 * n) / Math.max(1, e);
      return clamp(w / edpr, 0.8, (y1 - y0 + 1) / edpr / 2);
    }

    // há tinta perto do ponto (px de dispositivo)? — o teste do halo: a
    // vizinhança imediata tem de tocar a forma, por isso o halo nunca nasce
    // dentro dos contadores nem no espaço entre palavras
    function nearInk(data, cw, ch, x, y, r) {
      const aAt = (px, py) => {
        const xi = clamp(Math.round(px), 0, cw - 1);
        const yi = clamp(Math.round(py), 0, ch - 1);
        return data[(yi * cw + xi) * 4 + 3];
      };
      if (aAt(x, y) >= 120) return !0;
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        if (aAt(x + Math.cos(a) * r, y + Math.sin(a) * r) >= 120) return !0;
      }
      return !1;
    }

    // amostragem completa num objeto de estado novo. Usado pela instância
    // (edpr próprio do ecrã) e pela medida de legibilidade (dpr imposto).
    // inst = instância viva (para a cache de cores) ou null (medida).
    function buildState(el, o, seed, dprForce, inst) {
      if (!el.isConnected) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 2) return null;
      const dpr = clamp(
        dprForce || window.devicePixelRatio || 1,
        0.5,
        3,
      );
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      // folga do canvas: raio do ponteiro + espaço para o halo (agora curto:
      // desvio máximo ~0,28× a altura da fonte) e para o drift
      const haloSlack = o.halo > 0 ? Math.ceil(fs * 0.5) : 0;
      const M = clamp(o.radius, 40, 160) + haloSlack;
      const w = rect.width,
        h = rect.height;
      const fullW = w + 2 * M,
        fullH = h + 2 * M;
      // canvas fora do ecrã (limite de segurança de memória)
      const cw = Math.min(4096, Math.ceil(fullW * dpr));
      const ch = Math.min(4096, Math.ceil(fullH * dpr));
      const edpr = Math.min(dpr, cw / fullW, ch / fullH);
      const st = {
        el,
        opts: o,
        seed,
        edpr,
        margin: M,
        rect,
        cwCss: fullW,
        chCss: fullH,
        lastW: rect.width,
        lastH: rect.height,
        mask: null, // só a medida de legibilidade precisa da máscara
        legacy: o.look === "grid",
        energy: 0,
        xf: null,
        driftAmp: o.drift > 0 ? o.drift : 0,
      };

      /* 1) máscara do texto (leitura de layout + desenho; as cores são
         lidas aqui — a tinta só é escondida no fim) */
      const mask = drawTextMask(el, rect, M, cw, ch, edpr, inst);
      const data = mask.data;

      /* 2) caixa da tinta + espessura de traço estimada (área/perímetro) */
      let x0 = cw,
        y0 = ch,
        x1 = -1,
        y1 = -1;
      for (let y = 0; y < ch; y++) {
        const row = y * cw;
        for (let x = 0; x < cw; x++) {
          if (data[(row + x) * 4 + 3] >= 120) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      const hasInk = x1 >= 0;
      if (!hasInk) {
        x0 = y0 = 0;
        x1 = cw - 1;
        y1 = ch - 1;
      }
      const swCss = hasInk
        ? strokeFromMask(data, cw, ch, x0, y0, x1, y1, edpr)
        : 2;
      st.swCss = swCss;
      st.bbox = { x0, y0, x1, y1 };

      /* 3) recolha dos pontos (orgânica consciente da forma | grelha antiga) */
      const limit = o.max > 0 ? o.max : core.device.mobile() ? 2500 : 4000;
      const org = o.sampling !== "grid";
      const rnd = org ? mulberry32(seed) : null;
      // gap automático: no look legible é escolhido pela ESPESSURA do traço
      // (≥ ~5 partículas a atravessá-lo), não só pelo tamanho da fonte
      let gap =
        o.gap > 0
          ? o.gap
          : !org
            ? autoGap(el, dpr, !1)
            : o.look === "cloud"
              ? autoGap(el, dpr, !0)
              : clamp(Math.round(swCss / 5), 2, 12);
      // teto bruto de recolha: o limite corrigido pelos orçamentos de acentos
      // e halo (a redução final respeita a ordem halo → acentos → interior)
      const rawCap = org ? Math.min(40000, Math.ceil(limit / 1.24)) : limit;
      let pts, edge;
      if (org) {
        const r1 = collectOrganic(
          data,
          cw,
          ch,
          Math.max(1, Math.round(gap * edpr)),
          rawCap,
          rnd,
          o.jitter,
        );
        pts = r1.pts;
        edge = r1.edge;
        while (pts.length >= rawCap * 6 && gap < 48) {
          gap += 1;
          const r2 = collectOrganic(
            data,
            cw,
            ch,
            Math.max(1, Math.round(gap * edpr)),
            rawCap,
            rnd,
            o.jitter,
          );
          pts = r2.pts;
          edge = r2.edge;
        }
      } else {
        pts = collectPoints(
          data,
          cw,
          ch,
          Math.max(1, Math.round(gap * edpr)),
          rawCap,
        );
        edge = null;
        while (pts.length >= rawCap * 6 && gap < 48) {
          gap += 1;
          pts = collectPoints(
            data,
            cw,
            ch,
            Math.max(1, Math.round(gap * edpr)),
            rawCap,
          );
        }
      }
      let n = Math.floor(pts.length / 6);
      // densidade: só rarefaz o INTERIOR — as bordas (contornos das letras)
      // mantêm densidade total; o teto também protege as bordas primeiro
      if (org) {
        n = rarefyInterior(pts, edge, n, o.density, rnd);
        if (n > limit) n = thinProtectEdges(pts, edge, n, limit, rnd);
      }

      /* 4) orçamentos das camadas: corpo (tudo o que há) + acentos + halo */
      // escala adaptativa pela fonte (E): abaixo de ~32px quase só corpo
      const k = clamp((fs - 24) / 72, 0, 1);
      const depthEff = o.depth * (0.35 + 0.65 * k);
      const accFrac =
        clamp(0.06 + 0.06 * depthEff, 0.06, 0.12) * (0.3 + 0.7 * k);
      const haloFrac = o.halo * (0.35 + 0.65 * k);
      let accN = 0,
        haloN = 0;
      if (org) {
        accN = Math.min(Math.round(n * accFrac), Math.round(n * 0.12));
        haloN = Math.min(
          Math.round(n * haloFrac),
          Math.round(n * HALO_CAP),
          Math.max(0, limit - n - accN),
        );
        if (accN + haloN > limit - n) {
          // teto apertado: reduz primeiro o halo, depois os acentos
          haloN = Math.max(0, Math.min(haloN, limit - n - accN));
          accN = Math.max(0, Math.min(accN, limit - n - haloN));
        }
      }
      const total = n + accN + haloN;
      st.count = total;
      st.gap = gap;
      st.depthEff = depthEff;
      // tamanho automático: limitado pela espessura do traço (o corpo nunca
      // é mais largo que ele) — corpo ≤ ~0,4× o traço, acentos ≤ ~0,9×
      st.sizeCss =
        o.size > 0
          ? o.size
          : clamp(
              Math.min(gap * 0.62, Math.max(0.9, swCss * 0.4)),
              0.8,
              org ? 5 : 4,
            );

      /* 5) arrays tipados (nenhum objeto por partícula) */
      const hx = new Float32Array(total),
        hy = new Float32Array(total),
        x = new Float32Array(total),
        y = new Float32Array(total),
        vx = new Float32Array(total),
        vy = new Float32Array(total),
        al = new Uint8Array(total),
        alPix = new Uint8Array(total),
        z = new Float32Array(total),
        ph = new Float32Array(total),
        km = new Float32Array(total),
        dl = new Float32Array(total),
        ly = new Uint8Array(total), // 0 corpo · 1 acento · 2 halo
        sb = new Uint8Array(total),
        bb = new Uint8Array(total),
        gl = new Uint8Array(total),
        hl = new Uint8Array(total),
        baseRGB = new Uint32Array(total),
        ci = new Uint16Array(total);

      /* 6) camadas: acentos por aceitação sequencial (uniformes no espaço e
         determinísticos com a semente); z uniforme — nada de partículas
         "de fundo" quase invisíveis */
      let accLeft = accN,
        rem = n;
      for (let i = 0; i < n; i++) {
        if (accLeft > 0 && rnd() * rem < accLeft) {
          ly[i] = 1;
          accLeft--;
        }
        rem--;
      }
      for (let i = 0; i < n; i++) {
        const b = i * 6;
        // coordenadas no espaço do CANVAS (0..fullW): o desenho, o ponteiro
        // (ptr − rect + margem) e o impulso manual trabalham todos neste
        // espaço — a casa fica onde o píxel foi amostrado
        hx[i] = x[i] = pts[b] / edpr;
        hy[i] = y[i] = pts[b + 1] / edpr;
        alPix[i] = pts[b + 5];
        baseRGB[i] = (pts[b + 2] << 16) | (pts[b + 3] << 8) | pts[b + 4];
        // z uniforme (nada de partículas "de fundo" quase invisíveis);
        // acentos vivem no topo da escala; grelha antiga: z = 0
        z[i] = !org
          ? 0
          : ly[i] === 1
            ? 0.55 + 0.45 * rnd()
            : rnd();
        ph[i] = org ? rnd() * 6.28318 : 0;
      }
      // halo: nasce só JUNTO aos contornos (fonte = ponto de borda) e a
      // posição candidata é testada contra a máscara — nunca dentro dos
      // contadores nem no espaço entre palavras
      if (haloN > 0) {
        const edgeIdx = [];
        for (let i = 0; i < n; i++) edge[i] === 1 && edgeIdx.push(i);
        const srcPool = edgeIdx.length ? edgeIdx : null;
        for (let j = 0; j < haloN; j++) {
          const i = n + j;
          const si = srcPool
            ? srcPool[(rnd() * srcPool.length) | 0]
            : (rnd() * n) | 0;
          const sx = pts[si * 6] / edpr,
            sy = pts[si * 6 + 1] / edpr;
          // desvio gaussiano curto: máx. ~0,28× a altura da fonte
          let mag = clamp(
            fs * (0.05 + Math.abs(gauss(rnd)) * 0.09),
            0.6,
            fs * 0.28,
          );
          let ax = 0,
            ay = 0,
            ok = !1;
          for (let tente = 0; tente < 4 && !ok; tente++) {
            const ang = rnd() * 6.28318;
            ax = sx + Math.cos(ang) * mag;
            ay = sy + Math.sin(ang) * mag;
            ok = nearInk(data, cw, ch, ax * edpr, ay * edpr, Math.max(2, fs * 0.08 * edpr));
            ok || (mag *= 0.45); // aproxima do contorno e tenta de novo
          }
          if (!ok) {
            ax = sx;
            ay = sy; // rende-se: cola ao contorno (é sempre "junto")
          }
          hx[i] = x[i] = clamp(ax, 0, fullW);
          hy[i] = y[i] = clamp(ay, 0, fullH);
          alPix[i] = pts[si * 6 + 5];
          baseRGB[i] =
            (pts[si * 6 + 2] << 16) |
            (pts[si * 6 + 3] << 8) |
            pts[si * 6 + 4];
          z[i] = 0.2 + 0.5 * rnd();
          ph[i] = rnd() * 6.28318;
          ly[i] = 2;
          hl[i] = 1;
        }
      }
      st.hx = hx;
      st.hy = hy;
      st.x = x; // estado assente: x = casa
      st.y = y;
      st.vx = vx;
      st.vy = vy;
      st.al = al;
      st.alPix = alPix;
      st.z = z;
      st.ph = ph;
      st.km = km;
      st.dl = dl;
      st.ly = ly;
      st.sb = sb;
      st.bb = bb;
      st.gl = gl;
      st.hl = hl;
      st.baseRGB = baseRGB;
      st.ci = ci;

      /* fundo e luz: o glow aditivo é dos ACENTOS e só é seguro em fundo escuro */
      st.bgLuma = bgLumaOf(el);
      st.bgLight = st.bgLuma > 0.55;
      st.additive =
        o.glow === "on" ? !0 : o.glow === "off" ? !1 : !st.bgLight;
      st.glowEff = o.glow !== "off" && o.shape !== "square" && !st.bgLight;

      if (inst) {
        // esconder a tinta DEPOIS de amostrar (a instância faz a gestão)
        inst.hideInk(!0);
        inst.margin = M;
      }
      if (dprForce) {
        // a medida de legibilidade reuse-a (dados prontos — sem novo getImageData)
        st.maskData = mask.data;
      }
      return st;
    }

    /* ---- cores (módulo — partilhado pela instância e pelo estado sombra) ----- */

    function applyColorsTo(S) {
      const o = S.opts,
        n = S.count;
      if (!n || !S.ci) return;
      const spec = parseColorSpec(o.color);
      S.colorSpec = spec;
      // stream determinístico por (semente, geração): "build" é estável,
      // "resample"/"interval:N" avançam a geração e nascem cores novas
      const rnd = mulberry32(
        (S.seed ^ Math.imul((S.rsCount || 0) + 1, 0x9e3779b1)) | 0,
      );
      const ci = S.ci;
      const mk = (rgb) => ({
        rgb,
        style: "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")",
      });
      // cor exacta do píxel amostrado (modo "text": spans com cores
      // diferentes mantêm-se) — também é o fallback de cores inválidas
      const textPath = () => {
        const map = new Map();
        const pal = [];
        for (let i = 0; i < n; i++) {
          const key = S.baseRGB[i];
          let k = map.get(key);
          if (k === undefined) {
            k = pal.length;
            map.set(key, k);
            pal.push(
              mk([(key >> 16) & 255, (key >> 8) & 255, key & 255]),
            );
          }
          ci[i] = k;
        }
        return pal;
      };

      let pal = null;
      if (spec.kind === "text") {
        pal = textPath();
      } else if (spec.kind === "random") {
        const hue = parseRange(o.randomHue, 0, 360);
        const sat = parseRange(o.randomSat, 65, 95);
        const lit = parseRange(o.randomLight, 55, 80);
        // ≤24 cores quantizadas (menos mudanças de sprite por frame); o
        // intervalo de matiz pode dar a volta ("350-30")
        const span = hue[1] >= hue[0] ? hue[1] - hue[0] : hue[1] + 360 - hue[0];
        pal = [];
        for (let k = 0; k < GRAD_STEPS; k++) {
          const h = hue[0] + (span * (k + 0.5)) / GRAD_STEPS;
          const s = Math.round(sat[0] + (sat[1] - sat[0]) * rnd());
          const l = Math.round(lit[0] + (lit[1] - lit[0]) * rnd());
          pal.push(mk(hsl2rgb(h, s, l)));
        }
        for (let i = 0; i < n; i++) ci[i] = (rnd() * GRAD_STEPS) | 0;
      } else {
        // single / palette / gradient: validam as cores primeiro — se
        // nenhuma for válida, caem para a cor do texto
        let cols = null;
        if (spec.kind === "single" || spec.kind === "palette")
          cols = spec.colors.map(cssToRgb).filter(Boolean);
        else if (spec.kind === "gradient") {
          cols = spec.colors.map(cssToRgb).filter(Boolean);
          if (cols.length < 2) cols = cols.length === 1 ? cols : null;
        }
        if (!cols || !cols.length) {
          pal = textPath(); // cor pedida não é válida → cor do texto
        } else if (spec.kind === "single") {
          const j = o.colorJitter;
          const V = j > 0 ? clamp(Math.round(6 + j * 8), 2, 12) : 1;
          pal = [];
          for (let v = 0; v < V; v++)
            pal.push(mk(V > 1 ? jitterColor(cols[0], rnd, j) : cols[0]));
          for (let i = 0; i < n; i++) ci[i] = V > 1 ? (rnd() * V) | 0 : 0;
        } else if (spec.kind === "palette") {
          const L = cols.length;
          // pesos opcionais "1,2,1" — mesma ordem da paleta
          const wRaw = String(o.colorWeights || "")
            .split(",")
            .map((s) => Number(String(s).trim()));
          const w = [];
          let wSum = 0;
          for (let c = 0; c < L; c++) {
            const num =
              wRaw.length === L && Number.isFinite(wRaw[c]) && wRaw[c] > 0
                ? wRaw[c]
                : 1;
            wSum += num;
            w.push(wSum);
          }
          const j = o.colorJitter;
          // teto de grupos: variantes de jitter repartidas pela paleta
          const V = j > 0 ? clamp(Math.floor(30 / L), 1, 12) : 1;
          pal = [];
          for (let c = 0; c < L; c++)
            for (let v = 0; v < V; v++)
              pal.push(
                mk(V > 1 ? jitterColor(cols[c], rnd, j) : cols[c]),
              );
          for (let i = 0; i < n; i++) {
            const r = rnd() * wSum;
            let c = 0;
            while (c < L - 1 && w[c] < r) c++;
            ci[i] = V > 1 ? c * V + ((rnd() * V) | 0) : c;
          }
        } else {
          // gradient: interpolado ao longo do TEXTO (caixa da tinta), no
          // eixo dado por color-angle (0° = horizontal)
          const ang = (o.colorAngle * Math.PI) / 180;
          const cA = Math.cos(ang),
            sA = Math.sin(ang);
          let p0 = Infinity,
            p1 = -Infinity;
          for (let i = 0; i < n; i++) {
            const p = S.hx[i] * cA + S.hy[i] * sA;
            p < p0 && (p0 = p);
            p > p1 && (p1 = p);
          }
          const ext = p1 - p0 || 1;
          pal = [];
          for (let k = 0; k < GRAD_STEPS; k++)
            pal.push(mk(sampleStops(cols, (k + 0.5) / GRAD_STEPS)));
          const jt = o.colorJitter * 0.22;
          for (let i = 0; i < n; i++) {
            let t = (S.hx[i] * cA + S.hy[i] * sA - p0) / ext;
            if (jt) t += (rnd() - 0.5) * jt;
            ci[i] = (clamp(t, 0, 0.9999) * GRAD_STEPS) | 0;
          }
        }
      }
      S.pal = pal;
    }

    /* ---- factores por partícula: camada + z → tamanho/alpha/brush ------------- */

    // mapeamentos por camada (A):
    //   corpo:   tamanho 0,8..1,3× o base (variação suave, quase uniforme),
    //            alpha 0,6..1 — NUNCA abaixo de 0,45 da tinta local
    //   acentos: tamanho 1,25..2× o base (limitado a ~0,9× o traço),
    //            alpha 0,82..1, com glow
    //   halo:    tamanho 0,45..0,8× o base, alpha 0,10..0,26
    function factorsTo(S) {
      const o = S.opts,
        n = S.count;
      if (!n || !S.z) return;
      const dep = S.depthEff != null ? S.depthEff : o.depth;
      const { z, ph, hl, ly, alPix, al, km, dl, sb, bb, gl } = S;
      const base = Math.max(0.5, S.sizeCss);
      // teto pela espessura do traço: nenhuma partícula mais larga que ele
      const capBody = Math.max(1, (S.swCss * 0.4) / base);
      const capAcc = Math.max(1, (S.swCss * 0.9) / base);
      const capHalo = Math.max(1, (S.swCss * 0.35) / base);
      const legacy = S.legacy;
      const S5 = SB - 1;
      const f0 = SPR_FACTORS[0],
        f1 = SPR_FACTORS[S5];
      for (let i = 0; i < n; i++) {
        const v = z[i]; // uniforme no corpo, alto nos acentos
        const isA = ly[i] === 1,
          isH = hl[i] === 1;
        let sf, af;
        if (legacy) {
          sf = 1; // grelha antiga: tudo igual
          af = 1;
        } else if (isH) {
          sf = Math.min(0.45 + 0.35 * v, capHalo);
          af = 0.1 + 0.16 * v;
        } else if (isA) {
          sf = Math.min(1.25 + 0.75 * v, capAcc);
          af = 0.82 + 0.18 * v;
        } else {
          sf = Math.min(0.8 + 0.5 * v * (0.6 + 0.4 * dep), capBody);
          af = 0.62 + 0.38 * v * (0.5 + 0.5 * dep);
        }
        let a = alPix[i] * af;
        // corpo nunca invisível (mínimo 0,45× a tinta local do píxel)
        if (!isH && !legacy) a = Math.max(a, alPix[i] * 0.45);
        al[i] = a > 255 ? 255 : a < 6 ? 6 : Math.round(a);
        // baldes de tamanho (8) e de brilho (3) → sprites pré-desenhados
        const bkt = Math.round(((sf - f0) / (f1 - f0)) * S5);
        sb[i] = bkt < 0 ? 0 : bkt > S5 ? S5 : bkt;
        const br = al[i] / 255;
        bb[i] = br > 0.72 ? 2 : br > 0.42 ? 1 : 0;
        // glow aditivo SÓ nos acentos (as "luzes" da referência)
        gl[i] = S.glowEff && isA ? 1 : 0;
        // mola/massa/atraso ligeiramente diferentes por partícula: o
        // regresso acontece em ondas, não em bloco (o depth e o z dão a
        // variação; a grelha antiga fica uniforme)
        const r2 = ph[i] / 6.28318;
        km[i] = legacy
          ? 1
          : 1 +
            dep *
              (0.45 * v + (0.92 + 0.16 * r2 - 1) * 0.6) *
              (isA ? 1.6 : isH ? 1.2 : 1);
        dl[i] = legacy ? 0 : dep * 0.38 * r2 * (0.35 + 0.65 * (1 - v)) * (isA ? 1.5 : 1);
      }
      S.driftAmp = o.drift > 0 ? o.drift : 0;
    }

    // agrupa por cor × camada: três listas de índices por cor (corpo,
    // acentos, halo) — cada passada de desenho percorre uma camada inteira
    // de uma cor, sem mudar de fillStyle/sprite dentro dela
    function regroupTo(S) {
      const n = S.count,
        ci = S.ci,
        ly = S.ly,
        pal = S.pal;
      if (!n || !ci) {
        S.groups = [];
        return;
      }
      const buckets = new Map();
      for (let i = 0; i < n; i++) {
        const k = ci[i];
        let list = buckets.get(k);
        if (!list) buckets.set(k, (list = [[], [], []]));
        // camada: 0 corpo · 1 acento · 2 halo
        list[ly[i] === 1 ? 1 : S.hl && S.hl[i] ? 2 : 0].push(i);
      }
      const groups = [];
      for (const [k, lists] of buckets)
        groups.push({
          style: pal[k].style,
          rgb: pal[k].rgb,
          b: Uint32Array.from(lists[0]),
          a: Uint32Array.from(lists[1]),
          h: Uint32Array.from(lists[2]),
          sprites: null,
          glow: null,
        });
      S.groups = groups;
    }

    // sprites PRÉ-DESENHADOS em cache por cor × balde de tamanho × balde
    // de brilho. Os tamanhos são guardados em px de DISPOSITIVO (W/edpr no
    // desenho): o drawImage faz sempre escala 1.0 e, com a posição
    // quantizada ao píxel de dispositivo, o rasterizador usa o caminho
    // rápido de blit.
    function buildSpritesTo(S) {
      const o = S.opts,
        edpr = S.edpr;
      const tblBody = new Float32Array(SB),
        tblGlow = new Float32Array(SB);
      const wBody = new Int32Array(SB),
        wGlow = new Int32Array(SB);
      for (let b = 0; b < SB; b++) {
        const sd = Math.max(1.1, S.sizeCss * SPR_FACTORS[b]);
        // o soft estica o sprite: o canvas inclui a borda difusa
        const sbCss = o.shape === "soft" ? sd * 1.45 : sd;
        wBody[b] = Math.max(3, Math.round(sbCss * edpr));
        tblBody[b] = wBody[b] / edpr;
        wGlow[b] = Math.max(4, Math.round(sd * 2.6 * edpr));
        tblGlow[b] = wGlow[b] / edpr;
      }
      S.tblBody = tblBody;
      S.tblGlow = tblGlow;
      if (o.shape === "square") {
        // quadradinhos: fillStyle + fillRect, sem sprites (caminho antigo)
        for (const g of S.groups) {
          g.sprites = null;
          g.glow = null;
        }
        return;
      }
      const soft = o.shape === "soft";
      for (const g of S.groups) {
        const spr = new Array(SB * BR);
        for (let b = 0; b < SB; b++)
          for (let br = 0; br < BR; br++)
            spr[b * BR + br] = makeSprite(
              g.rgb,
              wBody[b],
              soft,
              br,
              S.bgLight && o.glow !== "off",
            );
        g.sprites = spr;
        if (S.glowEff) {
          const glw = new Array(SB);
          for (let b = 0; b < SB; b++) glw[b] = makeGlow(g.rgb, wGlow[b]);
          g.glow = glw;
        }
      }
    }

    /* ---- escrita (canvas) — partilhada pela instância e pela medida ---------- */

    // P é a instância ou um estado de sombra: {count, x, y, al, sb, bb, gl,
    // hl, ly, z, ph, groups, tblBody, tblGlow, additive, glowEff, driftAmp,
    // edpr, cwCss, chCss, opts, energy, xf}.
    // Camadas: CORPO sempre em source-over (a forma nunca satura), ACENTOS
    // em aditivo (quando seguro) com glow, HALO por cima em source-over com
    // alpha baixo. A energia da interação acende acentos e halo.
    function paintCloud(ctx, P, now) {
      if (!ctx || !P.count) return;
      if (now == null) now = performance.now();
      // crossfade do random="interval:N": expira aqui, com o tempo do motor
      let xfE = 1;
      if (P.xf) {
        xfE = (now - P.xf.t0) / 900;
        if (xfE >= 1) P.xf = null;
      }
      ctx.clearRect(0, 0, P.cwCss, P.chCss);
      const soft = P.opts.shape !== "square";
      const { x, y, al, sb, bb, gl, z, ph, hl, ly } = P;
      const drift = P.driftAmp || 0;
      const en = P.energy || 0;
      const t = drift > 0 ? now / 1000 : 0;
      const gap = P.gap || 4;
      const tbl = P.tblBody,
        tblG = P.tblGlow;
      const edpr = P.edpr;
      // posições quantizadas ao píxel de dispositivo: com sprites de
      // tamanho exacto (escala 1.0) e coordenadas inteiras, o drawImage usa
      // o caminho rápido de blit em vez do caminho filtrado/escalado
      const Q = (v) => Math.round(v * edpr) / edpr;
      const dxy = [0, 0];
      // desvio do drift: fase/frequência próprias. A amplitude do CORPO é
      // limitada a ~0,25× o espaçamento (máx. 0,6 px) para o contorno não
      // vazar; acentos e halo podem flutuar mais e ganham amplitude com a
      // energia da interação
      const dOff = (i, out) => {
        const isA = ly[i] === 1,
          isH = hl[i] === 1;
        const amp =
          (isA
            ? Math.min(drift, 2)
            : isH
              ? Math.min(drift * 1.7, 2.2)
              : Math.min(drift, gap * 0.25, 0.6)) *
          (isA || isH ? 1 + 1.4 * en : 1);
        const w = 0.5 + 0.7 * z[i];
        out[0] = amp * Math.sin(t * w + ph[i]);
        out[1] = amp * 0.8 * Math.sin(t * w * 0.83 + ph[i] * 1.71 + 1.3);
      };

      // uma camada de um grupo; devolve-se o último globalAlpha para
      // poupar mudanças de estado
      const passLayer = (groups, aMul, layer) => {
        for (let gi = 0; gi < groups.length; gi++) {
          const g = groups[gi];
          const idx = layer === 1 ? g.a : layer === 2 ? g.h : g.b;
          if (!idx || !idx.length) continue;
          // luz: aditivo SÓ na camada dos acentos (e só em fundo escuro);
          // corpo e halo são sempre source-over
          ctx.globalCompositeOperation =
            layer === 1 && P.additive ? "lighter" : "source-over";
          let lastA = -1;
          if (soft) {
            const spr = g.sprites,
              glw = g.glow;
            for (let j = 0; j < idx.length; j++) {
              const i = idx[j];
              let a = (al[i] / 255) * aMul;
              if (layer === 1) a = Math.min(1, a * (0.8 + 0.4 * en));
              else if (layer === 2) a = Math.min(0.6, a * (0.8 + 0.7 * en));
              if (a < 0.012) continue;
              if (drift) dOff(i, dxy);
              else ((dxy[0] = 0), (dxy[1] = 0));
              const px = Q(x[i] + dxy[0]),
                py = Q(y[i] + dxy[1]);
              // halo de glow nos acentos: acende com a energia
              if (layer === 1 && glw && gl[i] && a > 0.05) {
                const sg = tblG[sb[i]];
                ctx.globalAlpha = a * (0.16 + 0.3 * en);
                ctx.drawImage(
                  glw[sb[i]],
                  px - sg / 2,
                  py - sg / 2,
                  sg,
                  sg,
                );
                lastA = -1; // o glow mexeu no globalAlpha: o corpo reescreve
              }
              const sd = tbl[sb[i]];
              if (a !== lastA) ctx.globalAlpha = lastA = a;
              ctx.drawImage(
                spr[sb[i] * BR + bb[i]],
                px - sd / 2,
                py - sd / 2,
                sd,
                sd,
              );
            }
          } else {
            ctx.fillStyle = g.style;
            for (let j = 0; j < idx.length; j++) {
              const i = idx[j];
              let a = (al[i] / 255) * aMul;
              if (layer === 1) a = Math.min(1, a * (0.8 + 0.4 * en));
              else if (layer === 2) a = Math.min(0.6, a * (0.8 + 0.7 * en));
              if (a !== lastA) ctx.globalAlpha = lastA = a;
              if (drift) dOff(i, dxy);
              else ((dxy[0] = 0), (dxy[1] = 0));
              const sd = tbl[sb[i]];
              ctx.fillRect(x[i] + dxy[0] - sd / 2, y[i] + dxy[1] - sd / 2, sd, sd);
            }
          }
        }
      };
      const allPass = (groups, aMul) => {
        passLayer(groups, aMul, 0); // corpo — source-over, letras nítidas
        passLayer(groups, aMul, 1); // acentos — aditivo + glow (as "luzes")
        passLayer(groups, aMul, 2); // halo — source-over, por cima, discreto
      };

      if (P.xf) {
        // random="interval:N": atribuição antiga a sair, nova a entrar
        const e = xfE * xfE * (3 - 2 * xfE); // smoothstep
        allPass(P.xf.groups, 1 - e);
        allPass(P.groups, e);
      } else {
        allPass(P.groups, 1);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    /* ---- sprites (módulo) -------------------------------------------------------- */

    // corpo da partícula: círculo com gradiente radial (soft — núcleo sólido
    // e borda curta, para as letras ficarem nítidas) ou círculo duro
    // (circle). Baldes de brilho mudam a força do núcleo; a alpha fina fica
    // para o globalAlpha no draw. W chega em px de DISPOSITIVO (canvas W×W,
    // sem transform).
    // shadow=true (fundo claro): sombra suave cozida no sprite — a mistura
    // aditiva não funciona aí, por isso a luz vem deste contorno.
    function makeSprite(rgb, W, soft, bright, shadow) {
      const px = W;
      const c = document.createElement("canvas");
      c.width = px;
      c.height = px;
      const g = c.getContext("2d");
      const r = px / 2;
      const R = rgb[0],
        G = rgb[1],
        B = rgb[2];
      if (shadow) {
        g.shadowColor = "rgba(10,14,22,0.4)";
        g.shadowBlur = px * 0.22;
        g.shadowOffsetY = px * 0.05;
      }
      if (soft) {
        // núcleo sólido (misturado com branco) e borda CURTA: a partícula
        // lê-se como bola macia mas a forma acumula tinta como um disco
        const k = bright === 2 ? 1 : bright === 1 ? 0.85 : 0.7;
        const gr = g.createRadialGradient(r, r, 0, r, r, r);
        gr.addColorStop(
          0,
          "rgba(" +
            Math.round(R + (255 - R) * 0.45) +
            "," +
            Math.round(G + (255 - G) * 0.45) +
            "," +
            Math.round(B + (255 - B) * 0.45) +
            "," +
            k +
            ")",
        );
        gr.addColorStop(0.32, "rgba(" + R + "," + G + "," + B + "," + 0.96 * k + ")");
        gr.addColorStop(0.64, "rgba(" + R + "," + G + "," + B + "," + 0.82 * k + ")");
        gr.addColorStop(0.88, "rgba(" + R + "," + G + "," + B + "," + 0.28 * k + ")");
        gr.addColorStop(1, "rgba(" + R + "," + G + "," + B + ",0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, px, px);
      } else {
        g.fillStyle = "rgb(" + R + "," + G + "," + B + ")";
        g.beginPath();
        g.arc(r, r, r, 0, Math.PI * 2);
        g.fill();
      }
      return c;
    }

    // segundo halo, maior e muito transparente — SÓ nos acentos (as "luzes");
    // desenhado em mistura aditiva. W em px de dispositivo.
    function makeGlow(rgb, W) {
      const px = W;
      const c = document.createElement("canvas");
      c.width = px;
      c.height = px;
      const g = c.getContext("2d");
      const r = px / 2;
      const gr = g.createRadialGradient(r, r, 0, r, r, r);
      gr.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.3)");
      gr.addColorStop(0.45, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.11)");
      gr.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, px, px);
      return c;
    }

    // cor calculada do texto; se o próprio elemento já estiver transparente
    // (p. ex. background-clip: text), procura a primeira ascendente visível
    function visibleColor(el) {
      let n = el;
      for (let i = 0; n && n.nodeType === 1 && i < 6; i++) {
        const c = getComputedStyle(n).color;
        if (alphaOf(c) > 0) return c;
        n = n.parentElement;
      }
      return "";
    }

    /* ---- medida de legibilidade ------------------------------------------------ */

    // desfocagem de caixa 3×3 (separável), n iterações — leve e sem filtros
    // de canvas (que nem todos os contextos suportam)
    function blurGray(g, w, h, it) {
      const tmp = new Float32Array(g.length);
      for (let it2 = 0; it2 < it; it2++) {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const l = x > 0 ? g[i - 1] : g[i],
              r = x < w - 1 ? g[i + 1] : g[i];
            tmp[i] = (l + g[i] + r) / 3;
          }
        }
        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            const i = y * w + x;
            const u = y > 0 ? tmp[i - w] : tmp[i],
              d = y < h - 1 ? tmp[i + w] : tmp[i];
            g[i] = (u + tmp[i] + d) / 3;
          }
        }
      }
      return g;
    }

    // correlação normalizada (0..1) entre duas imagens cinzentas
    function nccOf(a, b) {
      let sa = 0,
        sb = 0;
      const n = a.length;
      for (let i = 0; i < n; i++) {
        sa += a[i];
        sb += b[i];
      }
      const ma = sa / n,
        mb = sb / n;
      let cov = 0,
        va = 0,
        vb = 0;
      for (let i = 0; i < n; i++) {
        const da = a[i] - ma,
          db = b[i] - mb;
        cov += da * db;
        va += da * da;
        vb += db * db;
      }
      return va > 1e-6 && vb > 1e-6 ? cov / Math.sqrt(va * vb) : 0;
    }

    // dilatação (máximo numa vizinhança (2r+1)×(2r+1)) — usada para a zona
    // "dentro da forma" da medida de legibilidade
    function dilateMax(g, w, h, r) {
      const out = new Float32Array(g.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let m = 0;
          for (let dy = -r; dy <= r; dy++) {
            const yy = y + dy;
            if (yy < 0 || yy >= h) continue;
            const row = yy * w;
            for (let dx = -r; dx <= r; dx++) {
              const xx = x + dx;
              if (xx < 0 || xx >= w) continue;
              const v = g[row + xx];
              if (v > m) m = v;
            }
          }
          out[y * w + x] = m;
        }
      }
      return out;
    }

    // amostragem em caixa: reduz a região [x0..x0+bw)×[y0..y0+bh) dos dados
    // da máscara (alpha da tinta) para dw×dh cinzentos 0..1 — sem canvas
    // intermédio (o raster por software falha drawImage de canvases grandes)
    function downsampleGray(data, cw, ch, x0, y0, bw, bh, dw, dh) {
      const g = new Float32Array(dw * dh);
      const sx = bw / dw,
        sy = bh / dh;
      for (let dy = 0; dy < dh; dy++) {
        const yA = y0 + dy * sy,
          yB = y0 + (dy + 1) * sy;
        for (let dx = 0; dx < dw; dx++) {
          const xA = x0 + dx * sx,
            xB = x0 + (dx + 1) * sx;
          let sum = 0,
            n = 0;
          for (let y = Math.floor(yA); y < Math.min(ch, Math.ceil(yB)); y++) {
            const row = y * cw;
            for (let x = Math.floor(xA); x < Math.min(cw, Math.ceil(xB)); x++) {
              sum += data[(row + x) * 4 + 3];
              n++;
            }
          }
          g[dy * dw + dx] = n ? sum / (n * 255) : 0;
        }
      }
      return g;
    }

    // Medida de legibilidade do estado assente (0..1): rende as partículas
    // no lugar, compara com a máscara de referência do texto — ambas
    // ligeiramente desfocadas — por correlação normalizada, e penaliza a
    // tinta que fugiu à forma (spill: halo, poeira, dispersão).
    // op = {dpr: medida com DPR imposto (re-amostragem offscreen)}.
    // O preset "legible" com defaults deve pontuar ≥ 0,75.
    function measureLegibility(S, op) {
      if (!S || !S.count || !S.el) return null;
      const dpr = S.edpr;
      const cw = Math.min(4096, Math.ceil(S.cwCss * dpr));
      const ch = Math.min(4096, Math.ceil(S.chCss * dpr));
      // 1) máscara de referência: os PÍXEIS (nunca blit de canvas grande)
      const mdata = S.maskData
        ? S.maskData
        : drawTextMask(
            S.el,
            S.el.getBoundingClientRect(),
            S.margin,
            cw,
            ch,
            dpr,
            S.colorCache ? S : null,
          ).data;
      // 2) caixa da tinta (da máscara) com uma folga curta
      const bb0 = S.bbox || { x0: 0, y0: 0, x1: cw - 1, y1: ch - 1 };
      const pad = 4;
      const x0 = Math.max(0, bb0.x0 - pad),
        y0 = Math.max(0, bb0.y0 - pad);
      const x1 = Math.min(cw - 1, bb0.x1 + pad),
        y1 = Math.min(ch - 1, bb0.y1 + pad);
      const bw = x1 - x0 + 1,
        bh = y1 - y0 + 1;
      if (bw < 8 || bh < 8) return null;
      // 3) reduz as duas para ≤ ~240 px no lado maior (compara à escala da
      // leitura, não ao píxel): a MÁSCARA por amostragem em caixa dos dados
      // (sem canvas intermédio — o raster por software falha blits de
      // canvases grandes); as partículas em resolução nativa (canvas novo,
      // ainda sem leituras) e recorte por drawImage
      const sc = Math.min(1, 240 / Math.max(bw, bh));
      const dw = Math.max(8, Math.round(bw * sc)),
        dh = Math.max(8, Math.round(bh * sc));
      const ga = downsampleGray(mdata, cw, ch, x0, y0, bw, bh, dw, dh);
      const res = document.createElement("canvas");
      res.width = cw;
      res.height = ch;
      const rctx = res.getContext("2d");
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const P = Object.create(S);
      P.driftAmp = 0;
      P.xf = null;
      P.energy = 0;
      paintCloud(rctx, P, 0);
      const crop = document.createElement("canvas");
      crop.width = dw;
      crop.height = dh;
      const cctx = crop.getContext("2d", { willReadFrequently: !0 });
      cctx.drawImage(res, x0, y0, bw, bh, 0, 0, dw, dh);
      const dB = cctx.getImageData(0, 0, dw, dh).data;
      const gb = new Float32Array(dw * dh);
      for (let i = 0; i < dw * dh; i++)
        gb[i] =
          (0.2126 * dB[i * 4] + 0.7152 * dB[i * 4 + 1] + 0.0722 * dB[i * 4 + 2]) /
          255;
      // 4) desfoca ligeiramente AMBOS (a leitura humana não é ao píxel)
      blurGray(ga, dw, dh, 2);
      blurGray(gb, dw, dh, 2);
      // 5) NCC + penalização da tinta fora da forma (spill). A zona "dentro"
      // é DILATADA: a franja dos contornos e o glow dos acentos, que beijam
      // a forma, não contam como fuga — só a poeira que foge de vez (espaço
      // entre palavras, contadores abertos). Zona morta: um halo discreto
      // não pune; a fuga grande sim.
      const ncc = nccOf(ga, gb);
      const gad = dilateMax(ga, dw, dh, 2);
      let inSum = 0,
        outSum = 0;
      for (let i = 0; i < dw * dh; i++) {
        if (gad[i] > 0.12) inSum += gb[i];
        else outSum += gb[i];
      }
      const raw = outSum / (outSum + inSum + 1e-6);
      const spill = clamp((raw - 0.22) / 0.5, 0, 1);
      const score = clamp(ncc * (1 - 0.45 * spill), 0, 1);
      const r3 = (v) => Math.round(v * 1000) / 1000;
      return {
        score: r3(score),
        ncc: r3(ncc),
        spill: r3(spill),
        count: S.count,
        dpr: Math.round(dpr * 100) / 100,
        sizeCss: Math.round(S.sizeCss * 100) / 100,
        gap: S.gap,
        swCss: Math.round(S.swCss * 100) / 100,
      };
    }

    // estado sombra: re-amostragem OFFSCREEN completa (mesma seed e opções)
    // com DPR imposto — serve para medir legibilidade a DPR 1 e 2 sem tocar
    // na instância viva nem no DOM
    function shadowState(inst, dpr) {
      try {
        const st = buildState(inst.el, inst.opts, inst.seed, dpr, null);
        if (!st) return null;
        st.rsCount = inst.rsCount;
        applyColorsTo(st);
        factorsTo(st);
        regroupTo(st);
        buildSpritesTo(st);
        return st;
      } catch (e) {
        return null;
      }
    }

    /* ---- Ciclo de vida --------------------------------------------------------- */

    function build(x) {
      if (!core || !canParticles) return null;
      const el = toEl(x);
      if (
        !el ||
        el.nodeType !== 1 ||
        !el.hasAttribute ||
        !el.hasAttribute("data-emerge-particles")
      )
        return null;
      if (instances.has(el)) return instances.get(el);
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        return null;
      if (core.isDisabledFor(el, "particles")) return null;
      // NÃO combinar com data-emerge-split (plugin Text): o texto tem de
      // estar intacto para ser amostrado — recusa e avisa em modo debug.
      if (el.hasAttribute("data-emerge-split") || el.querySelector(SPLIT_NODES)) {
        core.attr(el, "debug", !1) &&
          console.warn(
            "[Emerge Particles] data-emerge-split no mesmo elemento não é suportado — partículas ignoradas:",
            el,
          );
        return null;
      }
      const inst = new ParticlesInstance(el, resolveOptions(el));
      // semente do gerador: fixada no build — o resize volta a amostrar com a
      // mesma semente e a nuvem não "treme"
      inst.seed =
        inst.opts.seed > 0 ? Math.round(inst.opts.seed) : (Math.random() * 0x7fffffff) | 0;
      instances.set(el, inst);
      // não reclamar elementos do pipeline core ([data-emerge] + particles)
      el.hasAttribute("data-emerge") || core.claim(el, "Particles");
      el.classList.add("emerge-particles");
      // touch-action vive no CSS (uma classe por modo); scroll/off = nativo
      (inst.opts.touch === "pan-y" || inst.opts.touch === "track") &&
        el.classList.add("emerge-particles-touch-" + inst.opts.touch);
      inst.mount();
      watchVisibility();
      io && io.observe(el);
      wire();
      watch();
      core.dispatch("emerge:particles:build", { el });
      return inst;
    }

    function destroy(target) {
      const el = toEl(target);
      const inst = el && instances.get(el);
      return inst ? (inst.destroy(), !0) : !1;
    }

    function destroyAll() {
      Array.from(instances.keys()).forEach(destroy);
      running.clear();
    }

    function scan(root) {
      if (!core || !canParticles) return;
      (root || document).querySelectorAll(HOST).forEach((el) => {
        instances.has(el) || build(el);
      });
    }

    // instância de um elemento (ou null) — usada pela API e por resample/disperse
    function of(x) {
      const el = toEl(x);
      return (el && instances.get(el)) || null;
    }

    // volta a amostrar um elemento (ou todos, se x for omitido) — p. ex.
    // depois de mudar o texto ou as opções via JS
    function resample(x) {
      if (x == null) {
        instances.forEach((inst) => inst.resample());
        return;
      }
      const inst = of(x);
      inst && inst.resample();
    }

    // leituras de layout actualizadas (após mudanças do autor); re-amostra
    // quem mudou de tamanho
    function measure() {
      instances.forEach((inst) => inst.measure());
    }

    /* ---- API programática (Emerge.Particles) -------------------------------- */

    return {
      name: "Particles",
      defaults: {
        particlesMode: "repel",
        particlesGap: null, // automático (espessura do traço + DPR)
        particlesSize: null, // automático (limitado pela espessura do traço)
        particlesShape: "soft", // soft | circle | square
        particlesColor: null, // automático (cor calculada do texto)
        particlesRadius: 100,
        particlesStrength: 1,
        particlesReturn: 1,
        particlesFriction: 0.92,
        particlesIntro: "none",
        particlesMax: null, // automático (~4000 desktop / ~2500 mobile)
        particlesTouch: "pan-y",
        // novos na v1.7.2 (legibilidade primeiro):
        particlesLook: "legible", // legible (padrão) | cloud | grid (legado)
        particlesContrast: null, // 0..1 — 1 = mais corpo, 0 = mais nuvem
        particlesSampling: "organic", // organic | grid (o grid força look=grid)
        particlesSeed: null, // semente do aleatório (0/nulo = automática)
        particlesDensity: null, // 0.1..1 — explícito ganha ao blend do look
        particlesDepth: null, // 0..1 — modula sobretudo os acentos
        particlesHalo: null, // 0..1 — teto: 10% do total, junto aos contornos
        particlesGlow: "auto", // auto | on | off — glow aditivo (só acentos)
        particlesJitter: null, // 0..1 — efetivo ≤ 0,5 (½ célula)
        particlesDrift: null, // px — corpo ≤ ~0,6 px na prática
        particlesColorJitter: 0.3, // 0..1 — variação HSL à volta da cor
        particlesColorAngle: 0, // ângulo do gradient(), em graus
        particlesColorWeights: null, // pesos da paleta, "1,2,1"
        particlesRandom: "build", // build | resample | interval:N
        particlesRandomHue: "0-360", // intervalo de matiz do random
        particlesRandomSat: "65-95", // intervalo de saturação do random
        particlesRandomLight: "55-80", // intervalo de luminosidade do random
      },
      install: (c) => (
        (core = c),
        {
          build,
          destroy,
          destroyAll,
          scan,
          resample,
          measure,
          of,
          // impulso manual: dispersa as partículas a partir de um ponto
          // (px/py em px relativos ao elemento; omitidos = centro)
          disperse: (x, px, py) => {
            const inst = of(x);
            inst && inst.disperse(px, py);
          },
          // muda a cor em runtime SEM voltar a amostrar: aceita tudo o que a
          // opção color aceita ("text", cor CSS, paleta "a,b,c", "random",
          // "gradient(#a,#b,…)") — recalcula cores, grupos e sprites
          setColor: (x, value) => {
            const inst = of(x);
            if (!inst || inst.dead || !inst.sampled) return !1;
            inst.opts.color = value == null ? "" : String(value);
            parseColorSpec(inst.opts.color).kind === "random" && inst.rsCount++;
            inst.applyColors();
            inst.refit();
            inst.scheduleRandom();
            inst.draw();
            return !0;
          },
          // medida de legibilidade do estado assente (0..1): {score, ncc,
          // spill, count, dpr, …}. op = {dpr: 1|2} mede com um DPR imposto
          // (re-amostragem offscreen, sem tocar na instância).
          legibility: (x, op) => {
            const inst = of(x);
            if (!inst || inst.dead || !inst.sampled || !inst.count) return null;
            const dpr = op && Number(op.dpr);
            if (dpr && Math.abs(dpr - inst.edpr) > 0.05) {
              const st = shadowState(inst, clamp(dpr, 0.5, 3));
              return st ? measureLegibility(st, op) : null;
            }
            return measureLegibility(inst, op);
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }) {
          core.hasAttr(el, "particles") && build(el);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && destroy(el);
        },
        init() {
          scan(document);
          watchVisibility();
          watch();
        },
        refresh() {
          // instâncias fora do documento ou que passaram a estar desativadas
          // (mudança de breakpoint/dispositivo/reduced-motion), novos
          // elementos e re-amostragem de quem mudou de tamanho — o core
          // chama este hook com debounce no resize/orientationchange.
          const gone = [];
          instances.forEach((inst, el) => {
            (!el.isConnected ||
              core.isDisabledFor(el, "particles") ||
              (core.options.respectReducedMotion && core.prefersReducedMotion())) &&
              gone.push(el);
          });
          gone.forEach(destroy);
          scan(document);
          measure();
        },
        teardown() {
          destroyAll();
          observer && (observer.disconnect(), (observer = null));
          io && (io.disconnect(), (io = null));
          rafId && (cancelAnimationFrame(rafId), (rafId = 0));
          lastTime = 0;
          lastSlow = 0;
          ptr.has = !1;
          clearTimeout(fontsTimer);
          unwire();
        },
      },
    };
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Particles  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN PLUGIN: Smooth  (global: EmergeSmooth)
/*  Scroll suave tipo Lenis (data-emerge-smooth no <html>). Desligado por omissão.
/*  Depende de: Nenhuma
/* ======================================================================== */
(function (i, d) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = d())
    : typeof define == "function" && define.amd
      ? define(d)
      : (i.EmergeSmooth = d());
})(this, function () {
  "use strict";

  /* ------------------------------------------------------------------------
   * Smooth — scroll suave "à Lenis".
   *
   * Em vez de substituir o scroll nativo por transform (o que parte
   * position:sticky, IntersectionObserver e todos os plugins baseados em
   * scroll), o plugin intercepta a roda do rato, calcula uma posição suave
   * e chama window.scrollTo() a cada frame. O scroll continua a ser o do
   * browser: Range, Reel, Scene, Parallax, Media… funcionam sem alterações.
   *
   * Desligado por omissão. Ativa-se com:
   *   <html data-emerge-smooth>            (ou no <body>)
   *   Emerge.init({ smooth: true })        (ou { smooth: { lerp: .08 } })
   *   Emerge.Smooth.init({ ... })
   * ---------------------------------------------------------------------- */

  const LINE_PX = 33; // 1 "linha" da roda (deltaMode 1) ≈ 33px → 3 linhas ≈ 100px
  const FRAME = 1000 / 60;

  const EASINGS = {
    linear: (t) => t,
    quad: (t) => 1 - (1 - t) * (1 - t),
    cubic: (t) => 1 - Math.pow(1 - t, 3),
    quart: (t) => 1 - Math.pow(1 - t, 4),
    sine: (t) => Math.sin((t * Math.PI) / 2),
    // igual ao easing por omissão do Lenis
    expo: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    "in-out-cubic": (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    "in-out-expo": (t) =>
      t <= 0
        ? 0
        : t >= 1
          ? 1
          : t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2,
  };

  const BASE = {
    lerp: 0.1, // fração da distância percorrida por frame a 60fps (0.01–1)
    duration: 0, // > 0 (s): modo "duração" — cada gesto da roda faz um tween
    easing: "expo", // nome ou função (só modo duração e scrollTo)
    wheel: 1, // multiplicador do deslocamento da roda
    anchors: true, // links #âncora com scroll suave
    anchorOffset: 0, // px somados ao destino das âncoras
    anchorDuration: 1.2, // s
    prevent: "", // seletor extra que mantém o scroll nativo
  };

  let core = null;
  let cfg = null; // configuração ativa; null = plugin inativo
  let stopped = false;
  let raf = 0;
  let lastTime = 0;
  let anim = null; // { type: "lerp" } | { type: "tween", ... }
  let current = 0; // posição animada (px)
  let target = 0; // destino da roda (px)
  let lastSet = 0; // último scrollY que escrevemos (para ignorar o nosso evento)
  let velocity = 0;
  let direction = 0;
  let scrolling = false;
  let savedInline = null; // estilos inline do <html> antes de ativar
  let wired = false;
  let lockUntilDone = false; // scrollTo({ lock: true }) em curso
  let onDone = null;
  const listeners = { scroll: new Set(), start: new Set(), stop: new Set() };

  const root = () => document.documentElement;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const getY = () => window.scrollY || window.pageYOffset || 0;
  const getLimit = () =>
    Math.max(0, root().scrollHeight - root().clientHeight);

  function resolveEasing(e) {
    if (typeof e === "function") return e;
    return EASINGS[e] || EASINGS.expo;
  }

  function emit(name, payload) {
    listeners[name].forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        if (core && core.options && core.options.logs !== false)
          console.warn("[Emerge.Smooth] erro num listener:", err);
      }
    });
  }

  function state() {
    const limit = getLimit();
    return {
      scroll: current,
      target,
      limit,
      progress: limit ? current / limit : 0,
      velocity,
      direction,
    };
  }

  /* ----------------------------- configuração ---------------------------- */

  function findRoot() {
    const h = root();
    const b = document.body;
    if (h.hasAttribute("data-emerge-smooth")) return h;
    if (b && b.hasAttribute("data-emerge-smooth")) return b;
    return null;
  }

  function resolveConfig(manual) {
    const o = (core && core.options) || {};
    const fromInit = o.smooth && typeof o.smooth == "object" ? o.smooth : {};
    const flat = {
      lerp: o.smoothLerp,
      duration: o.smoothDuration,
      easing: o.smoothEasing,
      wheel: o.smoothWheel,
      anchors: o.smoothAnchors,
      anchorOffset: o.smoothAnchorOffset,
      anchorDuration: o.smoothAnchorDuration,
      prevent: o.smoothPrevent,
    };
    const el = findRoot();
    const attrs = {};
    if (el) {
      const num = (n, k) => {
        const v = core.attr(el, "smooth-" + n, null);
        if (v === null) return;
        const x = Number(v);
        if (!Number.isNaN(x)) attrs[k] = x;
      };
      num("lerp", "lerp");
      num("duration", "duration");
      num("wheel", "wheel");
      num("anchor-offset", "anchorOffset");
      num("anchor-duration", "anchorDuration");
      const easing = core.attr(el, "smooth-easing", null);
      if (typeof easing == "string") attrs.easing = easing;
      const anchors = core.attr(el, "smooth-anchors", null);
      if (anchors !== null) attrs.anchors = anchors === true || anchors === "true";
      const prevent = core.attr(el, "smooth-prevent", null);
      if (typeof prevent == "string") attrs.prevent = prevent;
    }
    const merged = { ...BASE };
    [flat, fromInit, attrs, manual || {}].forEach((src) => {
      Object.keys(src).forEach((k) => {
        if (src[k] !== undefined) merged[k] = src[k];
      });
    });
    merged.lerp = clamp(Number(merged.lerp) || BASE.lerp, 0.005, 1);
    merged.duration = Math.max(0, Number(merged.duration) || 0);
    merged.wheel = Number(merged.wheel) || 1;
    merged.easing = resolveEasing(merged.easing);
    return merged;
  }

  /* ------------------------------ animação ------------------------------- */

  function setClass(name, on) {
    root().classList.toggle(name, !!on);
  }

  function setScrolling(on) {
    if (scrolling === on) return;
    scrolling = on;
    setClass("emerge-smooth-scrolling", on);
  }

  function schedule() {
    if (!raf && cfg) {
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function cancelAnim() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    anim = null;
    lockUntilDone = false;
    setScrolling(false);
  }

  function finish() {
    const cb = onDone;
    onDone = null;
    lockUntilDone = false;
    anim = null;
    setScrolling(false);
    if (typeof cb == "function") cb();
  }

  function tick(now) {
    raf = 0;
    if (!cfg || !anim) return;
    const dt = Math.min(100, Math.max(1, now - lastTime));
    lastTime = now;
    const limit = getLimit();
    const prev = current;
    let done = false;

    if (anim.type === "tween") {
      anim.t = Math.min(1, anim.t + dt / 1000 / anim.duration);
      current = anim.from + (anim.to - anim.from) * anim.ease(anim.t);
      done = anim.t >= 1;
    } else {
      // lerp independente da taxa de atualização (equivale a `lerp` por frame a 60fps)
      const k = 1 - Math.pow(1 - cfg.lerp, dt / FRAME);
      current += (target - current) * k;
      done = Math.abs(target - current) < 0.05;
    }

    if (done) current = anim.type === "tween" ? anim.to : target;
    current = clamp(current, 0, limit);

    window.scrollTo({ top: current, behavior: "instant" });
    lastSet = getY();

    velocity = ((current - prev) / dt) * FRAME;
    direction = current === prev ? 0 : current > prev ? 1 : -1;
    emit("scroll", state());

    if (done) {
      target = current;
      velocity = 0;
      finish();
      emit("scroll", state());
    } else {
      raf = requestAnimationFrame(tick);
    }
  }

  /* ------------------------------- scrollTo ------------------------------ */

  function resolveTarget(t, offset) {
    if (typeof t == "number") return t + offset;
    if (t === "top") return 0 + offset;
    if (t === "bottom") return getLimit() + offset;
    const el = typeof t == "string" ? document.querySelector(t) : t;
    if (!el || !el.getBoundingClientRect) return null;
    const cs = getComputedStyle(el);
    const margin = parseFloat(cs.scrollMarginTop) || 0;
    const padding = parseFloat(getComputedStyle(root()).scrollPaddingTop) || 0;
    return el.getBoundingClientRect().top + getY() + offset - margin - padding;
  }

  function scrollTo(t, opts) {
    const o = opts || {};
    if (!cfg) {
      // plugin inativo (ex.: prefers-reduced-motion): usa o scroll nativo
      const y = resolveTarget(t, Number(o.offset) || 0);
      if (y === null) return false;
      const calm = o.immediate || (core && core.prefersReducedMotion());
      window.scrollTo({ top: Math.max(0, y), behavior: calm ? "instant" : "smooth" });
      if (typeof o.onComplete == "function") setTimeout(o.onComplete, calm ? 0 : 600);
      return true;
    }
    if (stopped && !o.force) return false;
    if (lockUntilDone && !o.force) return false;
    const y = resolveTarget(t, Number(o.offset) || 0);
    if (y === null) return false;
    const to = clamp(y, 0, getLimit());

    if (!anim) current = getY();
    const dur = o.duration === undefined ? cfg.anchorDuration : Number(o.duration);

    if (o.immediate || !(dur > 0)) {
      cancelAnim();
      current = target = to;
      window.scrollTo({ top: to, behavior: "instant" });
      lastSet = getY();
      emit("scroll", state());
      if (typeof o.onComplete == "function") o.onComplete();
      return true;
    }

    target = to;
    onDone = typeof o.onComplete == "function" ? o.onComplete : null;
    lockUntilDone = !!o.lock;
    anim = {
      type: "tween",
      prog: true, // vindo de scrollTo(): a roda cancela-o (salvo lock)
      from: current,
      to,
      t: 0,
      duration: dur,
      ease: o.easing ? resolveEasing(o.easing) : cfg.easing,
    };
    setScrolling(true);
    schedule();
    return true;
  }

  /* ------------------------------- eventos ------------------------------- */

  function wheelShouldBeNative(e, dy) {
    const sel = cfg.prevent;
    const path = e.composedPath ? e.composedPath() : [];
    const html = root();
    for (let n = 0; n < path.length; n++) {
      const el = path[n];
      if (el === html || el === document.body || el === document || el === window)
        break;
      if (!el.getAttribute) continue;
      if (el.hasAttribute("data-emerge-smooth-prevent")) return true;
      if (sel && el.matches && el.matches(sel)) return true;
      // contentor com scroll próprio que ainda pode andar nesta direção
      if (el.scrollHeight > el.clientHeight + 1) {
        const oy = getComputedStyle(el).overflowY;
        if (oy === "auto" || oy === "scroll" || oy === "overlay") {
          const max = el.scrollHeight - el.clientHeight;
          if (dy < 0 ? el.scrollTop > 0 : el.scrollTop < max - 1) return true;
        }
      }
    }
    return false;
  }

  function onWheel(e) {
    if (!cfg || e.defaultPrevented || e.ctrlKey) return; // ctrl+roda = zoom
    if (stopped) {
      e.preventDefault();
      return;
    }
    let dx = e.deltaX;
    let dy = e.deltaY;
    if (e.deltaMode === 1) {
      dx *= LINE_PX;
      dy *= LINE_PX;
    } else if (e.deltaMode === 2) {
      dx *= window.innerHeight;
      dy *= window.innerHeight;
    }
    if (!dy || Math.abs(dx) > Math.abs(dy)) return; // gesto horizontal: nativo
    if (wheelShouldBeNative(e, dy)) return;

    e.preventDefault();
    if (lockUntilDone) return;

    const limit = getLimit();
    if (anim && anim.prog) {
      anim = null;
      onDone = null;
    }
    if (!anim) current = target = getY();
    target = clamp(target + dy * cfg.wheel, 0, limit);

    if (cfg.duration > 0) {
      anim = {
        type: "tween",
        from: current,
        to: target,
        t: 0,
        duration: cfg.duration,
        ease: cfg.easing,
      };
    } else {
      anim = { type: "lerp" };
    }
    onDone = null;
    setScrolling(true);
    schedule();
  }

  // Scroll que não foi nosso (teclado, barra de scroll, hash, Reel.goTo…).
  function onScroll() {
    if (!cfg) return;
    const y = getY();
    if (Math.abs(y - lastSet) < 1) return; // eco do nosso scrollTo
    if (anim) cancelAnim();
    const prev = current;
    current = target = y;
    lastSet = y;
    velocity = y - prev;
    direction = velocity === 0 ? 0 : velocity > 0 ? 1 : -1;
    emit("scroll", state());
  }

  function focusTarget(el) {
    if (!el || !el.focus) return;
    const natural = el.matches("a[href],button,input,select,textarea,[tabindex]");
    if (!natural) {
      el.setAttribute("tabindex", "-1");
      el.addEventListener(
        "blur",
        () => el.removeAttribute("tabindex"),
        { once: true },
      );
    }
    el.focus({ preventScroll: true });
  }

  function onClick(e) {
    if (!cfg || !cfg.anchors || e.defaultPrevented) return;
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("download") || a.hasAttribute("data-emerge-smooth-ignore"))
      return;
    if (a.target && a.target !== "_self") return;
    let url;
    try {
      url = new URL(a.href, location.href);
    } catch (err) {
      return;
    }
    if (
      !url.hash ||
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search
    )
      return;
    const id = decodeURIComponent(url.hash.slice(1));
    let el = id ? document.getElementById(id) : null;
    if (!el && id) el = document.getElementsByName(id)[0] || null;
    if (!el && id.toLowerCase() !== "top") return; // deixa o browser decidir
    if (stopped) return;
    e.preventDefault();
    scrollTo(el || 0, {
      offset: cfg.anchorOffset,
      duration: cfg.anchorDuration,
      onComplete: () => focusTarget(el),
    });
    if (location.hash !== url.hash) history.pushState(null, "", url.hash);
  }

  /* ------------------------------ ciclo de vida -------------------------- */

  function wire() {
    if (wired) return;
    wired = true;
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
  }

  function unwire() {
    if (!wired) return;
    wired = false;
    window.removeEventListener("wheel", onWheel, { passive: false });
    window.removeEventListener("scroll", onScroll, { passive: true });
    document.removeEventListener("click", onClick);
  }

  function applyInline() {
    const s = root().style;
    savedInline = {
      behavior: s.getPropertyValue("scroll-behavior"),
      behaviorPrio: s.getPropertyPriority("scroll-behavior"),
      overflow: s.getPropertyValue("overflow"),
      overflowPrio: s.getPropertyPriority("overflow"),
    };
    // evita que um `scroll-behavior: smooth` do site brigue com o scrollTo por frame
    s.setProperty("scroll-behavior", "auto", "important");
    setClass("emerge-smooth", true);
  }

  function restoreInline() {
    const s = root().style;
    if (savedInline) {
      if (savedInline.behavior)
        s.setProperty("scroll-behavior", savedInline.behavior, savedInline.behaviorPrio);
      else s.removeProperty("scroll-behavior");
    }
    restoreOverflow();
    savedInline = null;
    setClass("emerge-smooth", false);
    setClass("emerge-smooth-stopped", false);
    setClass("emerge-smooth-scrolling", false);
  }

  function restoreOverflow() {
    const s = root().style;
    if (savedInline && savedInline.overflow)
      s.setProperty("overflow", savedInline.overflow, savedInline.overflowPrio);
    else s.removeProperty("overflow");
  }

  function enable(manual) {
    if (cfg) destroy();
    if (core && core.prefersReducedMotion() && core.options.respectReducedMotion)
      return false;
    const el = findRoot() || root();
    if (core.isDisabledFor(el, "smooth")) return false;
    cfg = resolveConfig(manual);
    stopped = false;
    current = target = lastSet = getY();
    velocity = 0;
    direction = 0;
    applyInline();
    wire();
    core.dispatch("emerge:smooth:enable", { options: cfg });
    return true;
  }

  function destroy() {
    if (!cfg) return;
    cancelAnim();
    unwire();
    restoreInline();
    cfg = null;
    stopped = false;
    onDone = null;
    core.dispatch("emerge:smooth:disable", {});
  }

  function stop() {
    if (!cfg || stopped) return;
    stopped = true;
    cancelAnim();
    target = current = getY();
    setClass("emerge-smooth-stopped", true);
    // bloqueia também teclado/toque/barra (útil com modais, menus abertos…)
    root().style.setProperty("overflow", "hidden");
    emit("stop", state());
  }

  function start() {
    if (!cfg || !stopped) return;
    stopped = false;
    setClass("emerge-smooth-stopped", false);
    restoreOverflow();
    current = target = lastSet = getY();
    emit("start", state());
  }

  function on(name, fn) {
    if (!listeners[name] || typeof fn != "function") return () => {};
    listeners[name].add(fn);
    return () => listeners[name].delete(fn);
  }

  function off(name, fn) {
    if (listeners[name]) listeners[name].delete(fn);
  }

  /* -------------------------------- plugin ------------------------------- */

  return {
    name: "Smooth",
    defaults: {
      smooth: false,
      smoothLerp: BASE.lerp,
      smoothDuration: BASE.duration,
      smoothEasing: BASE.easing,
      smoothWheel: BASE.wheel,
      smoothAnchors: BASE.anchors,
      smoothAnchorOffset: BASE.anchorOffset,
      smoothAnchorDuration: BASE.anchorDuration,
      smoothPrevent: BASE.prevent,
    },
    install(c) {
      core = c;
      return {
        init: enable,
        enable,
        destroy,
        disable: destroy,
        start,
        stop,
        toggle: () => (stopped ? start() : stop()),
        scrollTo,
        on,
        off,
        easings: EASINGS,
        get active() {
          return !!cfg;
        },
        get stopped() {
          return stopped;
        },
        get isScrolling() {
          return scrolling;
        },
        get scroll() {
          return cfg ? current : getY();
        },
        get target() {
          return cfg ? target : getY();
        },
        get limit() {
          return getLimit();
        },
        get progress() {
          const l = getLimit();
          return l ? (cfg ? current : getY()) / l : 0;
        },
        get velocity() {
          return velocity;
        },
        get direction() {
          return direction;
        },
        get options() {
          return cfg;
        },
      };
    },
    hooks: {
      init(info, c) {
        if (cfg) return; // idempotente (addPlugin tardio volta a chamar init)
        const o = c.options;
        if (!(o.smooth || findRoot())) return;
        const el = findRoot();
        // data-emerge-smooth="false" desliga mesmo com Emerge.init({ smooth: true })
        if (el && c.attr(el, "smooth", true) === false) return;
        enable();
      },
      refresh() {
        if (!cfg) return;
        if (!anim) current = target = lastSet = getY();
        else {
          const l = getLimit();
          target = clamp(target, 0, l);
        }
      },
      teardown() {
        destroy();
      },
    },
  };
});
/* ------------------------------------------------------------------------ */
/*  END PLUGIN: Smooth  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN REGISTO: Registo dos plugins
/*  Uma linha por plugin. A ordem importa: o Range primeiro.
/*  Linha protegida: se apagar o bloco do plugin, esta linha não dá erro.
/* ======================================================================== */
if (typeof EmergeRange !== "undefined") Emerge.addPlugin(EmergeRange);
if (typeof EmergeDraw !== "undefined") Emerge.addPlugin(EmergeDraw);
if (typeof EmergeHorizontal !== "undefined") Emerge.addPlugin(EmergeHorizontal);
if (typeof EmergeMedia !== "undefined") Emerge.addPlugin(EmergeMedia);
if (typeof EmergeStack !== "undefined") Emerge.addPlugin(EmergeStack);
if (typeof EmergeReel !== "undefined") Emerge.addPlugin(EmergeReel);
if (typeof EmergeText !== "undefined") Emerge.addPlugin(EmergeText);
if (typeof EmergeSpotlight !== "undefined") Emerge.addPlugin(EmergeSpotlight);
if (typeof EmergeScene !== "undefined") Emerge.addPlugin(EmergeScene);
if (typeof EmergeMagnetic !== "undefined") Emerge.addPlugin(EmergeMagnetic);
if (typeof EmergeParallax !== "undefined") Emerge.addPlugin(EmergeParallax);
if (typeof EmergeParticles !== "undefined") Emerge.addPlugin(EmergeParticles);
if (typeof EmergeSmooth !== "undefined") Emerge.addPlugin(EmergeSmooth);
/* ------------------------------------------------------------------------ */
/*  END REGISTO: Registo dos plugins  */
/* ------------------------------------------------------------------------ */



/* ======================================================================== */
/*  BEGIN CARREGADOR CSS: Carregador automático de emerge.css
/*  Opcional. Apague esta secção para incluir o CSS manualmente com <link>.
/*  Usa data-emerge-css="caminho" (ou "false" para desligar) na tag <script>.
/* ======================================================================== */
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
    cssURL = `${url.origin}/css/emerge.css@1.7.2`;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssURL;
  link.dataset.emergeStylesheet = "";
  document.head.appendChild(link);
})();
/* ------------------------------------------------------------------------ */
/*  END CARREGADOR CSS: Carregador automático de emerge.css  */
/* ------------------------------------------------------------------------ */
