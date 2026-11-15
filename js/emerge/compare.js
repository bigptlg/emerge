/*! Emerge.js v1.10.0 — plugin Compare (global: EmergeCompare) */
(function (i, d) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = d())
    : typeof define == "function" && define.amd
      ? define(d)
      : (i.EmergeCompare = d());
})(this, function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Compare — comparação visual (antes/depois) com divisor interactivo.

     Marcação:
       <div data-emerge-compare>
         <img src="antes.jpg"  alt="Antes">   ← 1.º filho: lado esquerdo / topo
         <img src="depois.jpg" alt="Depois">  ← 2.º filho: lado direito / base
       </div>
     Os dois primeiros filhos são as camadas (imagens ou qualquer HTML). O
     plugin acrescenta UM elemento: o divisor (role="slider").

     Como funciona (sem rAF, sem motor de animação, sem ler layout por frame):
       - o estado é UMA variável CSS (--emerge-compare-pos, em %) escrita no
         contentor; a camada de cima é revelada por clip-path que a lê, e o
         divisor posiciona-se com a mesma variável → acompanham-se sempre;
       - Pointer Events (rato, caneta e toque) com setPointerCapture; clicar
         numa posição desloca o divisor; o toque nunca bloqueia o scroll da
         página (touch-action: pan-y / pan-x conforme a orientação);
       - teclado: setas, Home/End, PageUp/PageDown, no divisor (role=slider).
     Modo "segurar" (data-emerge-compare-mode="hold"): sem divisor; enquanto
     se segura (rato, toque ou Espaço/Enter no botão) vê-se a 1.ª camada, ao
     largar volta a 2.ª. Reutiliza a mesma variável de estado (0 = repouso,
     100 = a segurar), por isso o clip-path é o mesmo e a transição é CSS.
     Não é uma animação de entrada: não usa data-emerge nem depende do Range,
     e funciona com prefers-reduced-motion (não há movimento próprio).
     Sem JS (ou desactivado) as camadas ficam empilhadas na mesma célula de
     grelha — o mesmo tamanho do estado activo — e vê-se a imagem "depois".
     ------------------------------------------------------------------------ */

  const ATTR = "data-emerge-compare";
  const SELECTOR = "[" + ATTR + "]";
  const NS = "compare";
  const HANDLE_ATTR = ATTR + "-handle";
  const EDGE_TOLERANCE = 6; // px de movimento antes de um toque virar arrasto

  let core = null;
  const instances = new Map(); // el -> CompareInstance
  let observer = null;
  let domReadyBound = false;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // "25" ou "25%" -> número; inválido -> null
  function parsePct(raw) {
    if (raw == null) return null;
    const m = /^\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*%?\s*$/.exec(String(raw));
    return m ? clamp(parseFloat(m[1]), 0, 100) : null;
  }

  function attrOf(el, name) {
    return el.getAttribute(ATTR + "-" + name);
  }

  // camadas: os dois primeiros filhos elemento que não sejam o divisor nem o
  // handle personalizado
  function layersOf(el) {
    const out = [];
    for (let n = 0; n < el.children.length && out.length < 2; n++) {
      const c = el.children[n];
      if (c.classList.contains("emerge-compare-divider")) continue;
      if (c.classList.contains("emerge-compare-hold-btn")) continue;
      if (c.hasAttribute(HANDLE_ATTR)) continue;
      out.push(c);
    }
    return out;
  }

  function emit(el, type, detail) {
    el.dispatchEvent(
      new CustomEvent("emerge:compare:" + type, {
        detail: Object.assign({ el: el }, detail),
        bubbles: true,
      }),
    );
  }

  /* ---- Instância -------------------------------------------------------- */

  class CompareInstance {
    constructor(el) {
      this.el = el;
      this.vertical =
        String(attrOf(el, "orientation") || "").trim().toLowerCase() === "vertical";
      const step = parseFloat(attrOf(el, "step"));
      this.step = isFinite(step) && step > 0 ? clamp(step, 0.1, 50) : 2;
      const start = parsePct(attrOf(el, "position"));
      this.hold =
        String(attrOf(el, "mode") || "").trim().toLowerCase() === "hold";
      this.holding = false;
      this.pos = this.hold ? 0 : start == null ? 50 : start;
      this.layers = layersOf(el);
      this.divider = null;
      this.btn = null;
      this.handleHost = null;
      this.customHandle = null;
      this.drag = null; // { id, touch, started, sx, sy, offset, rect }
      this.added = []; // [el, attr] escritos por nós, para limpar no destroy
      this.onDown = this.onDown.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onUp = this.onUp.bind(this);
      this.onKey = this.onKey.bind(this);
      this.onHoldDown = this.onHoldDown.bind(this);
      this.onHoldUp = this.onHoldUp.bind(this);
      this.onBtnKeyDown = this.onBtnKeyDown.bind(this);
      this.onBtnKeyUp = this.onBtnKeyUp.bind(this);
      this.onBtnBlur = () => this.holding && this.setHold(false);
      this.onContext = (e) => e.preventDefault();
      this.onDragStart = (e) => e.preventDefault();
      // o mousedown nativo tiraria o foco ao divisor (e iniciaria selecção);
      // o foco é dado por nós no pointerdown. O toque não é afectado.
      this.onMouseDown = (e) => e.preventDefault();
      this.build();
    }

    build() {
      const el = this.el;
      el.classList.add("emerge-compare");
      el.classList.toggle("emerge-compare-vertical", this.vertical);
      this.layers.forEach((l, n) => {
        l.classList.add(
          "emerge-compare-layer",
          n === 0 ? "emerge-compare-before" : "emerge-compare-after",
        );
      });

      if (this.hold) return this.buildHold();

      // divisor (slider acessível) + linha + handle
      const dv = document.createElement("div");
      dv.className = "emerge-compare-divider";
      dv.setAttribute("role", "slider");
      dv.setAttribute("tabindex", "0");
      dv.setAttribute("aria-orientation", this.vertical ? "vertical" : "horizontal");
      dv.setAttribute("aria-valuemin", "0");
      dv.setAttribute("aria-valuemax", "100");
      dv.setAttribute(
        "aria-label",
        attrOf(el, "label") || "Comparar: mover o divisor",
      );
      const line = document.createElement("span");
      line.className = "emerge-compare-line";
      const handle = document.createElement("span");
      handle.className = "emerge-compare-handle";
      // handle personalizado: <span data-emerge-compare-handle>…</span>
      const custom = el.querySelector(":scope > [" + HANDLE_ATTR + "]");
      if (custom) {
        this.customHandle = custom;
        handle.classList.add("emerge-compare-handle-custom");
        handle.appendChild(custom);
      }
      dv.appendChild(line);
      dv.appendChild(handle);
      el.appendChild(dv);
      this.divider = dv;

      el.addEventListener("pointerdown", this.onDown);
      el.addEventListener("dragstart", this.onDragStart);
      el.addEventListener("mousedown", this.onMouseDown);
      dv.addEventListener("keydown", this.onKey);

      this.render(false);
    }

    // modo "segurar": um botão focável (Espaço/Enter) + premir em qualquer ponto
    buildHold() {
      const el = this.el;
      el.classList.add("emerge-compare-hold-mode");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "emerge-compare-hold-btn";
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = attrOf(el, "label") || "Segurar para ver o original";
      el.appendChild(btn);
      this.btn = btn;

      el.addEventListener("pointerdown", this.onHoldDown);
      el.addEventListener("dragstart", this.onDragStart);
      el.addEventListener("mousedown", this.onMouseDown);
      el.addEventListener("contextmenu", this.onContext); // sem menu no toque longo
      btn.addEventListener("keydown", this.onBtnKeyDown);
      btn.addEventListener("keyup", this.onBtnKeyUp);
      btn.addEventListener("blur", this.onBtnBlur);
      this.render(false);
    }

    setHold(on, notify) {
      on = !!on;
      if (on === this.holding) return;
      this.holding = on;
      this.pos = on ? 100 : 0;
      this.el.classList.toggle("emerge-compare-holding", on);
      this.btn && this.btn.setAttribute("aria-pressed", on ? "true" : "false");
      this.render(false);
      notify !== false && emit(this.el, "hold", { holding: on, position: this.pos });
    }

    onHoldDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (this.drag || !e.isPrimary) return;
      this.drag = { id: e.pointerId };
      try {
        this.el.setPointerCapture(e.pointerId);
      } catch (err) {}
      this.el.addEventListener("pointerup", this.onHoldUp);
      this.el.addEventListener("pointercancel", this.onHoldUp);
      this.el.addEventListener("lostpointercapture", this.onHoldUp);
      this.setHold(true);
    }

    onHoldUp(e) {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      const el = this.el;
      el.removeEventListener("pointerup", this.onHoldUp);
      el.removeEventListener("pointercancel", this.onHoldUp);
      el.removeEventListener("lostpointercapture", this.onHoldUp);
      try {
        el.hasPointerCapture(d.id) && el.releasePointerCapture(d.id);
      } catch (err) {}
      this.drag = null;
      this.setHold(false);
    }

    onBtnKeyDown(e) {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault(); // sem "click" nativo
      e.repeat || this.setHold(true);
    }

    onBtnKeyUp(e) {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      this.drag || this.setHold(false);
    }

    // escreve o estado (uma variável CSS + ARIA) e, se pedido, emite o evento
    render(notify) {
      const p = Math.round(this.pos * 100) / 100;
      this.el.style.setProperty("--emerge-compare-pos", p + "%");
      const dv = this.divider;
      if (!dv) return;
      const r = Math.round(p);
      dv.setAttribute("aria-valuenow", String(r));
      dv.setAttribute("aria-valuetext", r + "%");
      notify && emit(this.el, "change", { position: p });
    }

    set(value, notify) {
      if (this.hold) return false; // no modo "segurar" usa hold(el, true|false)
      const v = parsePct(value);
      if (v == null) return false;
      if (v !== this.pos) {
        this.pos = v;
        this.render(notify !== false);
      }
      return true;
    }

    // posição (0..100) do ponteiro em relação ao contentor
    pointerPos(e, rect) {
      const size = this.vertical ? rect.height : rect.width;
      if (!size) return this.pos;
      const off = this.vertical ? e.clientY - rect.top : e.clientX - rect.left;
      return clamp((off / size) * 100, 0, 100);
    }

    onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (this.drag || !e.isPrimary) return;
      const rect = this.el.getBoundingClientRect();
      const onDivider = this.divider.contains(e.target);
      const touch = e.pointerType === "touch";
      this.drag = {
        id: e.pointerId,
        touch: touch,
        started: false,
        sx: e.clientX,
        sy: e.clientY,
        offset: 0,
        rect: rect,
      };
      // agarrar o divisor mantém o desvio; clicar noutro ponto salta para lá
      if (onDivider) {
        this.drag.offset = this.pos - this.pointerPos(e, rect);
        this.begin(e);
      } else if (!touch) {
        this.begin(e);
        this.set(this.pointerPos(e, rect));
      }
      // toque fora do divisor: espera (toque curto salta; arrasto no eixo move)
      this.el.addEventListener("pointermove", this.onMove);
      this.el.addEventListener("pointerup", this.onUp);
      this.el.addEventListener("pointercancel", this.onUp);
      this.divider.focus({ preventScroll: true });
    }

    begin(e) {
      const d = this.drag;
      d.started = true;
      try {
        this.el.setPointerCapture(e.pointerId);
      } catch (err) {}
      this.el.classList.add("emerge-compare-dragging");
    }

    onMove(e) {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      if (!d.started) {
        const dx = Math.abs(e.clientX - d.sx);
        const dy = Math.abs(e.clientY - d.sy);
        const main = this.vertical ? dy : dx;
        const cross = this.vertical ? dx : dy;
        if (main < EDGE_TOLERANCE || main < cross) return;
        this.begin(e);
      }
      this.set(this.pointerPos(e, d.rect) + d.offset);
    }

    onUp(e) {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      // toque curto sem arrasto = clicar numa posição
      if (d.touch && !d.started && e.type === "pointerup") {
        this.set(this.pointerPos(e, d.rect));
      }
      this.endDrag(e.pointerId);
    }

    endDrag(id) {
      const el = this.el;
      el.removeEventListener("pointermove", this.onMove);
      el.removeEventListener("pointerup", this.onUp);
      el.removeEventListener("pointercancel", this.onUp);
      try {
        el.hasPointerCapture(id) && el.releasePointerCapture(id);
      } catch (err) {}
      el.classList.remove("emerge-compare-dragging");
      this.drag = null;
    }

    onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const big = this.step * 5;
      const s = e.shiftKey ? big : this.step;
      let next = null;
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          next = this.pos - s;
          break;
        case "ArrowRight":
        case "ArrowDown":
          next = this.pos + s;
          break;
        case "PageUp":
          next = this.pos - big;
          break;
        case "PageDown":
          next = this.pos + big;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = 100;
          break;
        default:
          return;
      }
      e.preventDefault();
      this.set(clamp(next, 0, 100));
    }

    destroy() {
      const el = this.el;
      if (this.hold) {
        this.drag && this.onHoldUp({ pointerId: this.drag.id });
        el.removeEventListener("pointerdown", this.onHoldDown);
        el.removeEventListener("contextmenu", this.onContext);
        this.btn.removeEventListener("keydown", this.onBtnKeyDown);
        this.btn.removeEventListener("keyup", this.onBtnKeyUp);
        this.btn.removeEventListener("blur", this.onBtnBlur);
        this.btn.remove();
      } else {
        this.drag && this.endDrag(this.drag.id);
        el.removeEventListener("pointerdown", this.onDown);
        this.divider.removeEventListener("keydown", this.onKey);
        // devolve o handle personalizado ao sítio original
        if (this.customHandle && this.customHandle.parentNode)
          el.appendChild(this.customHandle);
        this.divider.remove();
      }
      el.removeEventListener("dragstart", this.onDragStart);
      el.removeEventListener("mousedown", this.onMouseDown);
      el.style.removeProperty("--emerge-compare-pos");
      el.classList.remove(
        "emerge-compare",
        "emerge-compare-vertical",
        "emerge-compare-dragging",
        "emerge-compare-hold-mode",
        "emerge-compare-holding",
      );
      this.layers.forEach((l) =>
        l.classList.remove(
          "emerge-compare-layer",
          "emerge-compare-before",
          "emerge-compare-after",
        ),
      );
      instances.delete(el);
      emit(el, "destroy", {});
    }
  }

  /* ---- Ciclo de vida ---------------------------------------------------- */

  function build(target) {
    const el = typeof target == "string" ? document.querySelector(target) : target;
    if (!core || !el || el.nodeType !== 1 || !el.hasAttribute || !el.hasAttribute(ATTR))
      return null;
    if (instances.has(el)) return instances.get(el);
    if (core.isDisabledFor(el, NS)) return null;
    if (layersOf(el).length < 2) return null; // precisa de duas camadas
    const inst = new CompareInstance(el);
    instances.set(el, inst);
    watch();
    emit(el, "build", { position: inst.pos });
    return inst;
  }

  function destroy(target) {
    const el = typeof target == "string" ? document.querySelector(target) : target;
    const inst = el && instances.get(el);
    return inst ? (inst.destroy(), true) : false;
  }

  function destroyAll() {
    Array.from(instances.values()).forEach((i) => i.destroy());
  }

  function scan(root) {
    if (!core) return;
    (root || document).querySelectorAll(SELECTOR).forEach((el) => {
      instances.has(el) || build(el);
    });
  }

  // O core só vigia nós [data-emerge]: o Compare mantém UM observer próprio e
  // partilhado (padrão do Spotlight/Magnetic), que respeita disableMutationObserver.
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
    });
  }

  function onMutations(recs) {
    for (const rec of recs) {
      rec.addedNodes.forEach((n) => {
        if (n.nodeType !== 1 || !n.matches) return;
        // o próprio divisor/handle que criámos não conta
        n.matches(SELECTOR) && !instances.has(n) && build(n);
        n.querySelectorAll &&
          n.querySelectorAll(SELECTOR).forEach((c) => instances.has(c) || build(c));
      });
    }
    // contentores removidos do documento (nós apenas movidos mantêm-se)
    instances.forEach((inst, el) => {
      el.isConnected || inst.destroy();
    });
  }

  // O Compare é um componente, não uma animação: arranca mesmo que o core
  // não inicialize (ex.: prefers-reduced-motion), assim que o DOM está pronto.
  function bootstrap() {
    if (domReadyBound || typeof document == "undefined") return;
    if (document.readyState === "loading") {
      domReadyBound = true;
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          domReadyBound = false;
          scan(document);
        },
        { once: true },
      );
    } else {
      scan(document);
    }
  }

  /* ---- Plugin ----------------------------------------------------------- */

  return {
    name: "Compare",
    install: (c) => (
      (core = c),
      bootstrap(),
      {
        build,
        destroy,
        scan,
        destroyAll,
        of: (target) => {
          const el = typeof target == "string" ? document.querySelector(target) : target;
          return (el && instances.get(el)) || null;
        },
        // modo "segurar": mostra (true) ou larga (false) a outra versão
        hold: (target, on) => {
          const el = typeof target == "string" ? document.querySelector(target) : target;
          const inst = el && instances.get(el);
          return inst && inst.hold ? (inst.setHold(on !== false), true) : false;
        },
        // define/lê a posição (0..100) de um comparador
        set: (target, value) => {
          const el = typeof target == "string" ? document.querySelector(target) : target;
          const inst = el && instances.get(el);
          return inst ? inst.set(value) : false;
        },
        get: (target) => {
          const el = typeof target == "string" ? document.querySelector(target) : target;
          const inst = el && instances.get(el);
          return inst ? inst.pos : null;
        },
        get all() {
          return Array.from(instances.values());
        },
      }
    ),
    hooks: {
      observe({ el }, c) {
        c.hasAttr(el, "compare") && build(el);
      },
      unobserve({ el }) {
        const inst = instances.get(el);
        inst && !el.isConnected && inst.destroy();
      },
      init() {
        scan(document);
      },
      refresh() {
        instances.forEach((inst, el) => {
          el.isConnected || inst.destroy();
        });
        scan(document);
      },
      teardown() {
        destroyAll();
        observer && (observer.disconnect(), (observer = null));
      },
    },
  };
});
