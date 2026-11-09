/*! Emerge.js v1.7.2 — plugin Text (global: EmergeText) */
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
