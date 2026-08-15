/*!
 * Emerge.js (v1.0.0)
 * Biblioteca leve de animações reveladas por scroll, baseada em
 * IntersectionObserver nativo.
 *
 * MIT License
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.Emerge = factory());
})(this, function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Config por omissão
  // ---------------------------------------------------------------------
  const defaults = {
    offset: 120,
    delay: 0,
    easing: 'ease',
    duration: 400,
    disable: false, // true | 'mobile' | 'phone' | 'tablet' | function
    once: false,
    mirror: false,
    anchorPlacement: 'top-bottom',
    animatedClassName: 'emerge-animate',
    initClassName: 'emerge-init',
    useClassNames: false,
    disableMutationObserver: false,
    resizeDebounce: 80,
    respectReducedMotion: true,
  };

  let options = { ...defaults };

  // node -> { el, opts, animated, io, observedNode }
  const registry = new Map();
  // agrupa observers por rootMargin para não criar um IntersectionObserver
  // por elemento quando vários partilham o mesmo cálculo de posição
  const observersByMargin = new Map();

  let mutationObserver = null;
  let started = false;

  // ---------------------------------------------------------------------
  // Deteção de dispositivo
  // ---------------------------------------------------------------------
  const uaMatch = (re) => re.test(navigator.userAgent || navigator.vendor || window.opera || '');
  const device = {
    phone: () => uaMatch(/iphone|ipod|android.*mobile|windows phone|blackberry|bb10|iemobile/i),
    tablet: () => uaMatch(/ipad|android(?!.*mobile)|tablet|kindle|playbook/i),
    mobile: () => device.phone() || device.tablet(),
  };

  function isDisabled(disable) {
    if (disable === true) return true;
    if (disable === 'mobile') return device.mobile();
    if (disable === 'phone') return device.phone();
    if (disable === 'tablet') return device.tablet();
    if (typeof disable === 'function') return !!disable();
    if (options.respectReducedMotion) {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  // ---------------------------------------------------------------------
  // Eventos custom (emerge:in / emerge:out / emerge:in:id)
  // ---------------------------------------------------------------------
  function dispatch(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }

  // ---------------------------------------------------------------------
  // Leitura de atributos data-emerge-*
  // ---------------------------------------------------------------------
  function attr(el, name, fallback) {
    const v = el.getAttribute(`data-emerge-${name}`);
    if (v === null) return fallback;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }

  function numAttr(el, name, fallback) {
    const v = attr(el, name, fallback);
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  }

  // ---------------------------------------------------------------------
  // Mapa de nomes de easing para cubic-bezier (nomes como "ease-in-back"
  // não são keywords CSS válidas, por isso resolvemos aqui e injetamos
  // o valor já pronto como custom property)
  // ---------------------------------------------------------------------
  const EASING_MAP = {
    linear: 'cubic-bezier(.25,.25,.75,.75)',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'ease-in-back': 'cubic-bezier(.6,-.28,.735,.045)',
    'ease-out-back': 'cubic-bezier(.175,.885,.32,1.275)',
    'ease-in-out-back': 'cubic-bezier(.68,-.55,.265,1.55)',
    'ease-in-sine': 'cubic-bezier(.47,0,.745,.715)',
    'ease-out-sine': 'cubic-bezier(.39,.575,.565,1)',
    'ease-in-out-sine': 'cubic-bezier(.445,.05,.55,.95)',
    'ease-in-quad': 'cubic-bezier(.55,.085,.68,.53)',
    'ease-out-quad': 'cubic-bezier(.25,.46,.45,.94)',
    'ease-in-out-quad': 'cubic-bezier(.455,.03,.515,.955)',
    'ease-in-cubic': 'cubic-bezier(.55,.085,.68,.53)',
    'ease-out-cubic': 'cubic-bezier(.25,.46,.45,.94)',
    'ease-in-out-cubic': 'cubic-bezier(.455,.03,.515,.955)',
    'ease-in-quart': 'cubic-bezier(.55,.085,.68,.53)',
    'ease-out-quart': 'cubic-bezier(.25,.46,.45,.94)',
    'ease-in-out-quart': 'cubic-bezier(.455,.03,.515,.955)',
  };

  function resolveEasing(name) {
    return EASING_MAP[name] || name;
  }

  // ---------------------------------------------------------------------
  // Cálculo do rootMargin para IntersectionObserver a partir do
  // anchorPlacement e offset configurados.
  //
  // Por omissão, o IntersectionObserver dispara quando o topo do elemento
  // cruza a base do viewport — isso já corresponde ao placement
  // "top-bottom". Para os restantes 8 placements e o offset, encolhemos o
  // root pela quantidade necessária para o ponto de deteção coincidir com
  // o ponto desejado:
  //
  //   yFactor = posição alvo no viewport (top=0, center=.5, bottom=1)
  //   xFactor = ponto de referência no elemento (top=0, center=.5, bottom=1)
  //   shrink  = (viewportHeight - (viewportHeight*yFactor - offset)) + elHeight*xFactor
  // ---------------------------------------------------------------------
  const FACTORS = { top: 0, center: 0.5, bottom: 1 };

  function computeRootMargin(el, placement, offset) {
    const [xKey, yKey] = placement.split('-');
    const xFactor = FACTORS[xKey] ?? 0;
    const yFactor = FACTORS[yKey] ?? 1;

    const viewportHeight = window.innerHeight;
    const elHeight = el.getBoundingClientRect().height;

    const targetY = viewportHeight * yFactor - offset;
    const shrink = Math.max(0, viewportHeight - targetY + elHeight * xFactor);

    return `0px 0px -${Math.round(shrink)}px 0px`;
  }

  // ---------------------------------------------------------------------
  // Aplica / remove estado animado
  // ---------------------------------------------------------------------
  function applyIn(entryData) {
    const { el, opts } = entryData;
    if (entryData.animated) return;

    const classNames = [opts.animatedClassName];
    if (opts.useClassNames) {
      const custom = el.getAttribute('data-emerge');
      if (custom) classNames.push(...custom.split(' '));
    }
    classNames.forEach((c) => el.classList.add(c));

    entryData.animated = true;
    dispatch('emerge:in', el);
    if (opts.id) dispatch(`emerge:in:${opts.id}`, el);
  }

  function applyOut(entryData) {
    const { el, opts } = entryData;
    if (!entryData.animated) return;

    const classNames = [opts.animatedClassName];
    if (opts.useClassNames) {
      const custom = el.getAttribute('data-emerge');
      if (custom) classNames.push(...custom.split(' '));
    }
    classNames.forEach((c) => el.classList.remove(c));

    entryData.animated = false;
    dispatch('emerge:out', el);
  }

  // ---------------------------------------------------------------------
  // Cria (ou reaproveita) um IntersectionObserver para um dado rootMargin
  // ---------------------------------------------------------------------
  function getObserverFor(rootMargin) {
    if (observersByMargin.has(rootMargin)) return observersByMargin.get(rootMargin);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const data = registry.get(entry.target);
          if (!data) return;

          if (entry.isIntersecting) {
            applyIn(data);
            data.everIntersected = true;
          } else if (data.animated && !data.opts.once && (data.opts.mirror || data.everIntersected)) {
            applyOut(data);
          }
        });
      },
      { root: null, rootMargin, threshold: 0 }
    );

    observersByMargin.set(rootMargin, io);
    return io;
  }

  // ---------------------------------------------------------------------
  // Observa um elemento [data-emerge]
  // ---------------------------------------------------------------------
  function observeElement(el) {
    if (registry.has(el)) return;

    const opts = {
      offset: numAttr(el, 'offset', options.offset),
      delay: numAttr(el, 'delay', options.delay),
      duration: numAttr(el, 'duration', options.duration),
      easing: attr(el, 'easing', options.easing),
      once: attr(el, 'once', options.once),
      mirror: attr(el, 'mirror', options.mirror),
      anchorPlacement: attr(el, 'anchor-placement', options.anchorPlacement),
      id: attr(el, 'id', null),
      animatedClassName: options.animatedClassName,
      useClassNames: options.useClassNames,
    };

    if (options.initClassName) el.classList.add(options.initClassName);

    el.style.setProperty('--emerge-duration', `${opts.duration}ms`);
    el.style.setProperty('--emerge-delay', `${opts.delay}ms`);
    el.style.setProperty('--emerge-easing', resolveEasing(opts.easing));

    const anchorSelector = attr(el, 'anchor', null);
    const anchorEl = anchorSelector ? document.querySelector(anchorSelector) : el;
    const targetForObserving = anchorEl || el;

    const rootMargin = computeRootMargin(targetForObserving, opts.anchorPlacement, opts.offset);
    const io = getObserverFor(rootMargin);

    const data = { el, opts, animated: false, everIntersected: false, io, observedNode: targetForObserving };
    registry.set(targetForObserving, data);
    if (targetForObserving !== el) registry.set(el, data);

    io.observe(targetForObserving);
  }

  function unobserveElement(el) {
    const data = registry.get(el);
    if (!data) return;
    data.io.unobserve(data.observedNode);
    registry.delete(el);
    if (data.observedNode !== el) registry.delete(data.observedNode);
  }

  // ---------------------------------------------------------------------
  // Scan inicial + MutationObserver para elementos adicionados depois
  // ---------------------------------------------------------------------
  function scanAndObserve(root = document) {
    root.querySelectorAll('[data-emerge]').forEach(observeElement);
  }

  function watchDom() {
    if (options.disableMutationObserver || mutationObserver) return;

    mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.('[data-emerge]')) observeElement(node);
          node.querySelectorAll?.('[data-emerge]').forEach(observeElement);
        });
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.('[data-emerge]')) unobserveElement(node);
          node.querySelectorAll?.('[data-emerge]').forEach(unobserveElement);
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------------
  // Recalcula rootMargins no resize (offsets e alturas podem ter mudado)
  // ---------------------------------------------------------------------
  function debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  function reconnectAll() {
    observersByMargin.forEach((io) => io.disconnect());
    observersByMargin.clear();

    const entries = Array.from(new Set(registry.values()));
    entries.forEach((data) => {
      const rootMargin = computeRootMargin(data.observedNode, data.opts.anchorPlacement, data.opts.offset);
      const io = getObserverFor(rootMargin);
      data.io = io;
      io.observe(data.observedNode);
    });
  }

  const handleResize = debounce(() => {
    if (started) reconnectAll();
  }, options.resizeDebounce);

  // ---------------------------------------------------------------------
  // Remove tudo (usado quando "disable" é verdadeiro para o dispositivo)
  // ---------------------------------------------------------------------
  function teardown() {
    observersByMargin.forEach((io) => io.disconnect());
    observersByMargin.clear();

    registry.forEach((data) => {
      data.el.removeAttribute('data-emerge');
      if (options.initClassName) data.el.classList.remove(options.initClassName);
      if (options.animatedClassName) data.el.classList.remove(options.animatedClassName);
    });
    registry.clear();

    mutationObserver?.disconnect();
    mutationObserver = null;
    started = false;
  }

  // ---------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------
  function init(userOptions = {}) {
    options = { ...defaults, ...userOptions };

    if (isDisabled(options.disable)) {
      teardown();
      return [];
    }

    scanAndObserve();
    watchDom();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    started = true;
    return Array.from(new Set(registry.values())).map((d) => d.el);
  }

  function refresh() {
    if (!started) return;
    scanAndObserve();
    reconnectAll();
  }

  function refreshHard() {
    teardown();
    init(options);
  }

  return { init, refresh, refreshHard };
});
