/*! Emerge.js v1.10.0 — plugin Pointer (global: EmergePointer) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergePointer = d());
  })(this, function () {
    "use strict";
    // Pointer — interactividade por camadas controlada pela posição do rato
    // DENTRO de uma área (v1.11.0).
    // Marcação:
    //   data-emerge-pointer              anfitrião (a área por omissão é ele)
    //   data-emerge-pointer-layer="0.5"  filhos com factor próprio de
    //                                    profundidade (negativo = sentido oposto)
    // Conceito: o plugin normaliza a posição do ponteiro na área para
    // [-1, 1] nos dois eixos (centro = 0) e deriva dela deslocamento (px) e
    // inclinação 3D (graus). Diferença para o Magnetic: este atrai UM
    // elemento por proximidade à sua borda; o Pointer lê uma ÁREA e compõe
    // várias camadas. Diferença para o Parallax: o driver é o ponteiro, não
    // o scroll.
    // Motor: UM único rAF partilhado, que só corre com instâncias activas ou
    // a regressar ao repouso e adormece quando tudo assentou (primeiro TODAS
    // as leituras de layout, depois TODAS as escritas; getBoundingClientRect
    // apenas quando algo mudou, nunca por frame). Valores iguais aos já
    // escritos não voltam a tocar no DOM.
    // Propriedades que o plugin controla (e como preserva as do autor):
    //   canal "translate" (por omissão): `translate` inline do elemento
    //   canal "transform": `transform` inline, com translate3d à frente e o
    //     transform inline do autor preservado no fim
    //   inclinação 3D do anfitrião: `transform` (perspective + rotateX/Y)
    // O canal "auto" escolhe "transform" em elementos que já têm outro
    // escritor de `translate` (data-emerge, parallax, magnetic), para que
    // Pointer + Parallax/Magnetic compõem em vez de se esmagarem (o CSS
    // aplica translate → rotate → scale → transform). O valor inline que o
    // elemento tinha é guardado antes da primeira escrita e reposto no fim.
    // Nunca há preventDefault; apontadores tácteis são ignorados por omissão.
    // Sem JS, com o plugin desactivado, com prefers-reduced-motion, sem
    // ponteiro preciso (a menos que -touch) ou sem transformações
    // individuais, nada é escrito.
    // Prioridade das opções: atributo > token CSS (--emerge-pointer-*) >
    // opção global do Emerge.init > default.
    let core = null;
    const HOST = "[data-emerge-pointer]",
      LAYER = "[data-emerge-pointer-layer]",
      SELECTOR = HOST + ", " + LAYER,
      // elementos que já têm outro escritor de `translate`
      FOREIGN =
        "[data-emerge], [data-emerge-parallax], [data-emerge-parallax-layer], [data-emerge-magnetic], [data-emerge-magnetic-child]";
    const instances = new Map(), // host -> instância
      running = new Set(); // instâncias no motor (activas ou a regressar)
    const ptr = { x: 0, y: 0, has: !1, moved: !1, touch: !1 };
    let rafId = 0,
      lastTime = 0,
      sharedOn = !1,
      dirty = !1,
      touchCount = 0,
      observer = null,
      io = null,
      ro = null,
      mq = null;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const canTranslate =
      typeof CSS != "undefined" &&
      CSS.supports &&
      CSS.supports("translate", "0px");
    // dispositivo com ponteiro preciso e hover (rato, trackpad, caneta)
    const finePointer = () =>
      !!window.matchMedia &&
      window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;

    /* ---- Opções: atributo > token CSS > opção global > default ------------ */

    function cssToken(el, name) {
      try {
        const v = getComputedStyle(el)
          .getPropertyValue("--emerge-pointer-" + name)
          .trim();
        return v === "" ? null : v;
      } catch (e) {
        return null;
      }
    }

    function numOption(el, name, globalKey, fallback) {
      const a = core.numAttr(el, "pointer-" + name, NaN);
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
      const no = (v) => v === "false" || v === !1 || v === "0" || v === "no";
      if (core.hasAttr(el, "pointer-" + name))
        return !no(core.attr(el, "pointer-" + name, ""));
      const t = cssToken(el, name);
      if (t !== null) return !no(t);
      const g = core.options[globalKey];
      if (g !== null && g !== undefined && g !== "") return !no(g);
      return fallback;
    }

    // "xy" (omissão) | "x" | "y"
    function axisOf(raw, fallback) {
      const a = String(raw == null ? "" : raw).trim().toLowerCase();
      return a === "x" ? [1, 0] : a === "y" ? [0, 1] : a === "xy" ? [1, 1] : fallback;
    }

    // factor de camada: vazio/inválido = 1
    function layerFactor(el) {
      const raw = el.getAttribute("data-emerge-pointer-layer");
      const f = raw === null || raw.trim() === "" ? 1 : Number(raw);
      return Number.isNaN(f) ? 1 : f;
    }

    // `smooth` 0..1 -> taxa de resposta (1/s) do alisamento exponencial.
    // 0 = instantâneo; 0.5 ≈ 125 ms; 1 ≈ 670 ms. Exponencial: sem oscilação.
    function rateOf(smooth) {
      const s = clamp(smooth, 0, 1);
      return s <= 0 ? Infinity : 1.5 + 26 * (1 - s) * (1 - s);
    }

    // canal de escrita: "translate" | "transform"
    function channelOf(el) {
      const c = String(core.attr(el, "pointer-channel", "auto")).trim().toLowerCase();
      if (c === "translate" || c === "transform") return c;
      return el.matches(FOREIGN) ? "transform" : "translate";
    }

    /* ---- Escrita com restauro --------------------------------------------- */

    // Um escritor por (elemento, propriedade): guarda o valor inline do autor
    // antes da primeira escrita, evita escritas repetidas e repõe tudo.
    class Out {
      constructor(el, prop) {
        this.el = el;
        this.prop = prop; // "translate" | "transform"
        this.saved = null;
        this.last = null;
      }
      set(str) {
        if (this.last === null) this.saved = this.el.style[this.prop] || "";
        const v =
          this.prop === "transform" && this.saved ? str + " " + this.saved : str;
        if (v === this.last) return;
        this.last = v;
        this.el.style[this.prop] = v;
      }
      clear() {
        if (this.last === null) return;
        this.el.style[this.prop] = this.saved || "";
        this.saved = this.last = null;
      }
    }

    /* ---- Motor partilhado ------------------------------------------------- */

    function frame(now) {
      rafId = 0;
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.7;
      lastTime = now;
      if (dirty || ptr.moved) {
        // 1) todas as leituras de layout (só se algo mudou)
        if (dirty) instances.forEach((inst) => inst.measure());
        dirty = !1;
        ptr.moved = !1;
        // 2) cálculo dos alvos (sem tocar no DOM)
        instances.forEach((inst) => {
          ptr.has ? inst.retarget() : inst.release();
        });
      }
      // 3) todas as escritas
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

    function markDirty() {
      if (!ptr.has && !running.size) return;
      dirty = !0;
      kick();
    }

    function onMove(e) {
      const touch = e.pointerType === "touch";
      // táctil: por omissão o plugin não interfere com o scroll da página
      if (touch && !touchCount) return;
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.has = !0;
      ptr.moved = !0;
      ptr.touch = touch;
      kick();
    }

    function onUp(e) {
      e.pointerType === "touch" && onLeave();
    }

    function onOut(e) {
      e.relatedTarget || onLeave();
    }

    function onLeave() {
      if (!ptr.has) return;
      ptr.has = !1;
      ptr.moved = !1;
      instances.forEach((inst) => inst.release());
      kick();
    }

    function wire() {
      if (sharedOn) return;
      sharedOn = !0;
      window.addEventListener("pointermove", onMove, { passive: !0 });
      window.addEventListener("pointerdown", onMove, { passive: !0 });
      window.addEventListener("pointerup", onUp, { passive: !0 });
      window.addEventListener("pointerout", onOut, { passive: !0 });
      window.addEventListener("pointercancel", onLeave, { passive: !0 });
      document.addEventListener("pointerleave", onLeave, { passive: !0 });
      window.addEventListener("blur", onLeave);
      window.addEventListener("scroll", markDirty, { capture: !0, passive: !0 });
      window.addEventListener("resize", markDirty, { passive: !0 });
      window.addEventListener("orientationchange", markDirty, { passive: !0 });
      if (typeof IntersectionObserver != "undefined")
        io = new IntersectionObserver(onIntersect, { rootMargin: "100px" });
      if (typeof ResizeObserver != "undefined")
        ro = new ResizeObserver(() => {
          dirty = !0;
          ptr.has && kick();
        });
      if (window.matchMedia) {
        mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        mq.addEventListener && mq.addEventListener("change", onMotionPref);
      }
    }

    function unwire() {
      if (!sharedOn) return;
      sharedOn = !1;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointercancel", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", markDirty, { capture: !0 });
      window.removeEventListener("resize", markDirty);
      window.removeEventListener("orientationchange", markDirty);
      io && (io.disconnect(), (io = null));
      ro && (ro.disconnect(), (ro = null));
      mq && mq.removeEventListener && mq.removeEventListener("change", onMotionPref);
      mq = null;
    }

    // Preferência de movimento reduzido mudou em runtime.
    function onMotionPref() {
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        destroyAll();
      else scan(document);
    }

    // visibilidade da área: fora do viewport não se mede nem se anima
    function onIntersect(entries) {
      for (const en of entries) {
        const inst = en.target.__emergePointer;
        if (!inst) continue;
        inst.visible = en.isIntersecting;
        if (!inst.visible) inst.release();
        else if (ptr.has) {
          dirty = !0;
          kick();
        }
      }
    }

    // O core só vigia nós [data-emerge]: UM observer próprio e partilhado
    // (padrão do Magnetic/Spotlight), que respeita disableMutationObserver.
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
      // após o loop: nós apenas movidos não são destruídos e recriados
      instances.forEach((inst, el) => {
        el.isConnected ? inst.syncLayers(!1) : destroy(el);
      });
    }

    function onAdded(node) {
      if (node.nodeType !== 1 || !node.matches) return;
      node.matches(SELECTOR) && ensure(node);
      node.querySelectorAll && node.querySelectorAll(SELECTOR).forEach(ensure);
    }

    function ensure(el) {
      if (el.hasAttribute("data-emerge-pointer")) build(el);
      if (el.hasAttribute("data-emerge-pointer-layer")) {
        const host = el.parentElement && el.parentElement.closest(HOST);
        const inst = host && instances.get(host);
        inst && inst.attachLayer(el);
      }
    }

    /* ---- Instância -------------------------------------------------------- */

    class PointerInstance {
      constructor(el) {
        this.el = el;
        this.layers = []; // [{ el, factor, axis, out }]
        this.touch = !1;
        this.visible = !0;
        this.areaEl = null;
        this.rect = null;
        this.cx = this.cy = this.w = this.h = 0;
        this.sx = this.sy = 0; // normalizado actual [-1, 1]
        this.tx = this.ty = 0; // normalizado alvo
        this.engaged = !1;
        this.tOut = null; // escritor do transform do anfitrião
        this.pOut = null; // escritor do translate do anfitrião
        this.varsOn = !1;
        this.configure();
      }

      // (re)lê opções e área
      configure() {
        const el = this.el;
        this.move = numOption(el, "move", "pointerMove", 20);
        this.rate = rateOf(numOption(el, "smooth", "pointerSmooth", 0.5));
        this.tilt = boolOption(el, "tilt", "pointerTilt", !1);
        this.tiltStrength = clamp(
          numOption(el, "tilt-strength", "pointerTiltStrength", 12),
          -89,
          89,
        );
        this.perspective = numOption(el, "perspective", "pointerPerspective", 900);
        this.sign = boolOption(el, "invert", "pointerInvert", !1) ? -1 : 1;
        this.axis = axisOf(core.attr(el, "pointer-axis", "xy"), [1, 1]);
        this.vars = boolOption(el, "vars", "pointerVars", !1);
        this.channel = channelOf(el);
        const t = boolOption(el, "touch", "pointerTouch", !1);
        if (t !== this.touch) {
          this.touch = t;
          this.registered && (t ? touchCount++ : touchCount--);
        }
        this.setArea();
        this.updateReach();
      }

      setArea() {
        const raw = String(core.attr(this.el, "pointer-area", "self")).trim();
        let area = this.el,
          win = !1;
        if (raw === "window") win = !0;
        else if (raw === "parent") area = this.el.parentElement || this.el;
        else if (raw && raw !== "self" && raw !== "true") {
          try {
            area = document.querySelector(raw) || this.el;
          } catch (e) {}
        }
        this.win = win;
        if (this.areaEl && this.areaEl !== area) this.unobserveArea();
        this.areaEl = win ? null : area;
        if (this.areaEl && this.registered) this.observeArea();
      }

      observeArea() {
        const a = this.areaEl;
        if (!a) return;
        a.__emergePointer = this;
        io && io.observe(a);
        ro && ro.observe(a);
      }

      unobserveArea() {
        const a = this.areaEl;
        if (!a) return;
        io && io.unobserve(a);
        ro && ro.unobserve(a);
        a.__emergePointer === this && delete a.__emergePointer;
      }

      // factor máximo de camada e distância de referência para o "assentou"
      updateReach() {
        let f = this.layers.length ? 0 : 1;
        for (const l of this.layers) f = Math.max(f, Math.abs(l.factor));
        const selfF = this.selfFactor();
        this.reach = Math.max(this.move * Math.max(f, Math.abs(selfF)), this.tilt ? Math.abs(this.tiltStrength) : 0, 1);
      }

      // factor de deslocamento do próprio anfitrião: 1 sem camadas, 0 com
      selfFactor() {
        const raw = this.el.getAttribute("data-emerge-pointer-self");
        if (raw !== null) {
          const n = raw.trim() === "" ? 1 : Number(raw);
          return Number.isNaN(n) ? 0 : n;
        }
        return this.layers.length || this.tilt ? 0 : 1;
      }

      attachLayer(el) {
        if (this.layers.some((l) => l.el === el)) return;
        const channel = channelOf(el);
        this.layers.push({
          el,
          factor: layerFactor(el),
          axis: axisOf(core.attr(el, "pointer-layer-axis", ""), this.axis),
          out: new Out(el, channel),
          channel,
        });
        el.classList.add("emerge-pointer-layer");
        el.hasAttribute("data-emerge") || core.claim(el, "Pointer");
        this.updateReach();
        (this.x || this.y || this.sx || this.sy || this.engaged) && wake(this);
      }

      detachLayer(el) {
        const n = this.layers.findIndex((l) => l.el === el);
        if (n < 0) return;
        const l = this.layers.splice(n, 1)[0];
        l.out.clear();
        el.classList.remove("emerge-pointer-layer");
        el.hasAttribute("data-emerge") || core.release(el);
        this.updateReach();
      }

      // alinha as camadas com o DOM: novas camadas entram; as que saíram ou
      // mudaram de anfitrião são largadas (e repostas)
      syncLayers(addNew) {
        for (let n = this.layers.length - 1; n >= 0; n--) {
          const el = this.layers[n].el;
          if (
            !el.isConnected ||
            !el.hasAttribute("data-emerge-pointer-layer") ||
            !el.parentElement ||
            el.parentElement.closest(HOST) !== this.el
          )
            this.detachLayer(el);
        }
        if (addNew)
          this.el.querySelectorAll(LAYER).forEach((c) => {
            c.parentElement.closest(HOST) === this.el && this.attachLayer(c);
          });
      }

      // Leitura de layout. O rect inclui o deslocamento/inclinação que o
      // próprio plugin escreveu no anfitrião: compensa-se o deslocamento e,
      // com tilt, usa-se o tamanho de layout (offsetWidth/Height), que as
      // transformações não alteram.
      measure() {
        if (this.win) {
          this.cx = window.innerWidth / 2;
          this.cy = window.innerHeight / 2;
          this.w = window.innerWidth;
          this.h = window.innerHeight;
          this.rect = { left: 0, top: 0, right: this.w, bottom: this.h };
          return;
        }
        const a = this.areaEl,
          r = a.getBoundingClientRect();
        let ox = 0,
          oy = 0,
          w = r.width,
          h = r.height;
        if (a === this.el) {
          ox = this.dx || 0;
          oy = this.dy || 0;
          if (this.tilt && a.offsetWidth) {
            w = a.offsetWidth;
            h = a.offsetHeight;
          }
        }
        this.cx = (r.left + r.right) / 2 - ox;
        this.cy = (r.top + r.bottom) / 2 - oy;
        this.w = w;
        this.h = h;
        this.rect = {
          left: this.cx - w / 2,
          right: this.cx + w / 2,
          top: this.cy - h / 2,
          bottom: this.cy + h / 2,
        };
      }

      // Alvos a partir do cursor (sem tocar no DOM).
      retarget() {
        if (
          !ptr.has ||
          !this.visible ||
          !this.rect ||
          (ptr.touch && !this.touch)
        )
          return this.release();
        const r = this.rect;
        if (ptr.x < r.left || ptr.x > r.right || ptr.y < r.top || ptr.y > r.bottom)
          return this.release();
        this.tx = clamp((ptr.x - this.cx) / (this.w / 2 || 1), -1, 1);
        this.ty = clamp((ptr.y - this.cy) / (this.h / 2 || 1), -1, 1);
        if (!this.engaged) {
          this.engaged = !0;
          this.el.classList.add("emerge-pointer-active");
          core.dispatch("emerge:pointer:enter", { el: this.el });
        }
        wake(this);
        return !0;
      }

      // Alvos a zero: regressa suavemente ao repouso.
      release() {
        if (this.engaged) {
          this.engaged = !1;
          this.tx = this.ty = 0;
          core.dispatch("emerge:pointer:leave", { el: this.el });
        } else this.tx = this.ty = 0;
        (this.sx || this.sy || this.written) && wake(this);
        return !1;
      }

      // Um passo do motor: alisa na direcção dos alvos e escreve.
      // Devolve false quando pode adormecer.
      step(dt) {
        const k = this.rate === Infinity ? 1 : 1 - Math.exp((-dt / 1e3) * this.rate);
        this.sx += (this.tx - this.sx) * k;
        this.sy += (this.ty - this.sy) * k;
        const eps = 0.02 / this.reach;
        if (Math.abs(this.tx - this.sx) < eps && Math.abs(this.ty - this.sy) < eps) {
          this.sx = this.tx;
          this.sy = this.ty;
          if (this.engaged) {
            this.write();
          } else this.reset();
          return !1; // assentou: dorme até ao próximo evento
        }
        this.write();
        return !0;
      }

      write() {
        this.written = !0;
        const s = this.sign,
          nx = this.sx * s,
          ny = this.sy * s,
          m = this.move;
        // anfitrião
        const f = this.selfFactor();
        this.dx = f ? nx * m * f * this.axis[0] : 0;
        this.dy = f ? ny * m * f * this.axis[1] : 0;
        let tr = "";
        if (f) {
          if (this.channel === "transform")
            tr += "translate3d(" + this.dx.toFixed(2) + "px," + this.dy.toFixed(2) + "px,0) ";
          else
            (this.pOut || (this.pOut = new Out(this.el, "translate"))).set(
              this.dx.toFixed(2) + "px " + this.dy.toFixed(2) + "px",
            );
        }
        if (this.tilt) {
          const p = this.perspective > 0 ? "perspective(" + this.perspective + "px) " : "";
          tr +=
            p +
            "rotateX(" + (-ny * this.tiltStrength).toFixed(2) + "deg) rotateY(" +
            (nx * this.tiltStrength).toFixed(2) + "deg)";
        }
        if (tr) (this.tOut || (this.tOut = new Out(this.el, "transform"))).set(tr.trim());
        // camadas
        for (const l of this.layers) {
          const x = nx * m * l.factor * l.axis[0],
            y = ny * m * l.factor * l.axis[1];
          l.out.set(
            l.channel === "transform"
              ? "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)"
              : x.toFixed(2) + "px " + y.toFixed(2) + "px",
          );
        }
        if (this.vars) {
          this.varsOn = !0;
          this.el.style.setProperty("--emerge-pointer-x", this.sx.toFixed(3));
          this.el.style.setProperty("--emerge-pointer-y", this.sy.toFixed(3));
        }
      }

      // Repouso: remove tudo o que o plugin escreveu e repõe o do autor.
      reset() {
        this.sx = this.sy = this.tx = this.ty = 0;
        this.dx = this.dy = 0;
        this.written = !1;
        this.pOut && this.pOut.clear();
        this.tOut && this.tOut.clear();
        for (const l of this.layers) l.out.clear();
        if (this.varsOn) {
          this.el.style.removeProperty("--emerge-pointer-x");
          this.el.style.removeProperty("--emerge-pointer-y");
          this.varsOn = !1;
        }
        this.el.classList.remove("emerge-pointer-active");
      }

      destroy() {
        this.reset();
        this.el.classList.remove("emerge-pointer");
        this.el.hasAttribute("data-emerge") || core.release(this.el);
        for (const l of this.layers.slice()) this.detachLayer(l.el);
        this.unobserveArea();
        this.touch && touchCount--;
        this.registered = !1;
        running.delete(this);
        instances.delete(this.el);
        core.dispatch("emerge:pointer:destroy", { el: this.el });
        instances.size || unwire();
      }
    }

    /* ---- Ciclo de vida ---------------------------------------------------- */

    function toEl(t) {
      return typeof t == "string" ? document.querySelector(t) : t;
    }

    function build(el) {
      if (!core || !canTranslate) return null;
      el = toEl(el);
      if (
        !el ||
        el.nodeType !== 1 ||
        !el.hasAttribute ||
        !el.hasAttribute("data-emerge-pointer")
      )
        return null;
      if (instances.has(el)) return instances.get(el);
      if (core.isDisabledFor(el, "pointer")) return null;
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        return null;
      const inst = new PointerInstance(el);
      // sem ponteiro preciso (telemóvel/tablet) só com -touch
      if (!inst.touch && !finePointer()) return null;
      instances.set(el, inst);
      inst.registered = !0;
      inst.touch && touchCount++;
      el.hasAttribute("data-emerge") || core.claim(el, "Pointer");
      el.classList.add("emerge-pointer");
      wire();
      inst.observeArea();
      inst.syncLayers(!0);
      inst.measure();
      watch();
      ptr.has && inst.retarget();
      core.dispatch("emerge:pointer:build", { el: el });
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
      if (!core || !canTranslate) return;
      (root || document).querySelectorAll(HOST).forEach((el) => {
        instances.has(el) || build(el);
      });
    }

    // Relê opções, camadas e rects (após mudanças do autor).
    function refresh() {
      instances.forEach((inst, el) => {
        if (
          !el.isConnected ||
          core.isDisabledFor(el, "pointer") ||
          (core.options.respectReducedMotion && core.prefersReducedMotion())
        )
          return destroy(el);
        inst.configure();
        inst.syncLayers(!0);
      });
      scan(document);
      dirty = !0;
      kick();
    }

    /* ---- API programática (Emerge.Pointer) -------------------------------- */

    return {
      name: "Pointer",
      defaults: {
        pointerMove: null,
        pointerSmooth: null,
        pointerTilt: null,
        pointerTiltStrength: null,
        pointerPerspective: null,
        pointerInvert: null,
        pointerVars: null,
        pointerTouch: !1,
      },
      install: (c) => (
        (core = c),
        {
          build,
          destroy,
          destroyAll,
          scan,
          refresh,
          of: (t) => {
            const el = toEl(t);
            return (el && instances.get(el)) || null;
          },
          // força todas as instâncias a regressarem ao repouso
          release: () => {
            ptr.has = !1;
            instances.forEach((inst) => inst.release());
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
          c.hasAttr(el, "pointer") && build(el);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && inst.destroy();
        },
        init() {
          scan(document);
          watch();
        },
        refresh() {
          refresh();
        },
        teardown() {
          destroyAll();
          observer && (observer.disconnect(), (observer = null));
          rafId && (cancelAnimationFrame(rafId), (rafId = 0));
          lastTime = 0;
          dirty = !1;
          touchCount = 0;
          unwire();
        },
      },
    };
});
