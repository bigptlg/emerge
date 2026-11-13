/*! Emerge.js v1.7.2 — plugin Smooth (global: EmergeSmooth) */
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
