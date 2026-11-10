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
