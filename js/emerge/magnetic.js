/*! Emerge.js v1.7.2 — plugin Magnetic (global: EmergeMagnetic) */
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
