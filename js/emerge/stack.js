/*! Emerge.js v1.7.2 — plugin Stack (global: EmergeStack) */
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
