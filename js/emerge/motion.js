/*! Emerge.js v1.7.2 — plugin Motion (global: EmergeMotion) */
(function (i, d) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = d())
    : typeof define == "function" && define.amd
      ? define(d)
      : (i.EmergeMotion = d());
})(this, function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Motion — estado INICIAL personalizado para a animação de entrada.

     Princípio (igual ao resto do Emerge): o Motion só descreve o ponto de
     PARTIDA; o estado final é sempre o estilo natural do elemento. Tempo,
     atraso, easing, once e mirror continuam a ser do Core
     (data-emerge-duration / -delay / -easing / -once / -mirror).

     Como funciona (sem keyframes novos, sem rAF, sem listeners):
       - opacity / translate / rotate / scale  → escreve as variáveis
         --emerge-from-* que o Core já usa (pré-estado + keyframe emerge-in);
       - rotate-x/y, skew-x/y                  → slot de transform do Core
         (--emerge-from/to-transform + keyframe emerge-flip);
       - blur, brightness, saturate, grayscale → slot de filter do Core
         (--emerge-from-filter + keyframe emerge-blur).
     Como é tudo CSS do Core, o modo "follow" do Range (scroll-linked) e o
     split de texto funcionam sem código extra.
     ------------------------------------------------------------------------ */

  const ATTR = "data-emerge-motion";
  const NS = "motion";
  const CLS = "emerge-motion";
  const CLS_TF = "emerge-motion-transform";
  const CLS_FX = "emerge-motion-filter";
  const CLS_LOOP = "emerge-motion-loop";

  const LEN_UNITS = ["px", "%", "em", "rem", "vw", "vh", "vmin", "vmax"];
  const SIZE_UNITS = ["px", "em", "rem", "vw", "vh", "vmin", "vmax"];
  const ANG_UNITS = ["deg", "rad", "grad", "turn"];
  const NUM_RE = /^([+-]?(?:\d+\.?\d*|\.\d+))(px|%|em|rem|vw|vh|vmin|vmax|deg|rad|grad|turn)?$/i;

  // nome canónico -> definição. "names" = nomes aceites (atributo e shorthand).
  const PROPS = {
    x: { names: ["x", "translate-x"], ch: "translate", t: "len" },
    y: { names: ["y", "translate-y"], ch: "translate", t: "len" },
    z: { names: ["z", "translate-z"], ch: "translate", t: "len" },
    rotate: { names: ["rotate"], ch: "rotate", t: "ang" },
    "rotate-x": { names: ["rotate-x"], ch: "transform", t: "ang" },
    "rotate-y": { names: ["rotate-y"], ch: "transform", t: "ang" },
    "skew-x": { names: ["skew-x"], ch: "transform", t: "ang" },
    "skew-y": { names: ["skew-y"], ch: "transform", t: "ang" },
    scale: { names: ["scale"], ch: "scale", t: "num" },
    "scale-x": { names: ["scale-x"], ch: "scale", t: "num" },
    "scale-y": { names: ["scale-y"], ch: "scale", t: "num" },
    opacity: { names: ["opacity"], ch: "opacity", t: "num", min: 0, max: 1 },
    blur: { names: ["blur"], ch: "filter", t: "size", min: 0 },
    brightness: { names: ["brightness"], ch: "filter", t: "num", min: 0 },
    saturate: { names: ["saturate"], ch: "filter", t: "num", min: 0 },
    grayscale: { names: ["grayscale"], ch: "filter", t: "num", min: 0, max: 1 },
  };

  // alias de nome (normalizado: minúsculas, sem - nem _) -> nome canónico
  const ALIAS = {};
  Object.keys(PROPS).forEach((k) => {
    PROPS[k].names.forEach((n) => (ALIAS[n.replace(/[-_]/g, "")] = k));
  });
  ALIAS.rotatez = "rotate";

  const FILTER_ORDER = ["blur", "brightness", "saturate", "grayscale"];
  const TRANSFORM_ORDER = ["rotate-x", "rotate-y", "skew-x", "skew-y"];
  const CSS_FN = {
    "rotate-x": "rotateX",
    "rotate-y": "rotateY",
    "skew-x": "skewX",
    "skew-y": "skewY",
  };

  let core = null;
  const state = new Map(); // el -> { el, targets:[], written: Map<target, string[]> }

  /* ---- parsing ---------------------------------------------------------- */

  function num(n) {
    return String(Math.round(n * 10000) / 10000);
  }

  // Devolve a string CSS válida ou null (valores inválidos nunca chegam ao CSS).
  function parseValue(def, raw) {
    const m = NUM_RE.exec(String(raw).trim());
    if (!m) return null;
    let n = parseFloat(m[1]);
    const u = (m[2] || "").toLowerCase();
    if (!isFinite(n)) return null;
    let out;
    if (def.t === "len" || def.t === "size") {
      const allowed = def.t === "len" ? LEN_UNITS : SIZE_UNITS;
      if (u && allowed.indexOf(u) < 0) return null;
      if (def.min != null && n < def.min) n = def.min;
      out = num(n) + (u || "px");
    } else if (def.t === "ang") {
      if (u && ANG_UNITS.indexOf(u) < 0) return null;
      out = num(n) + (u || "deg");
    } else {
      if (u && u !== "%") return null;
      if (u === "%") n /= 100;
      if (def.min != null && n < def.min) n = def.min;
      if (def.max != null && n > def.max) n = def.max;
      out = num(n);
    }
    return out;
  }

  function parseRepeat(raw) {
    const s = String(raw).trim().toLowerCase();
    if (s === "infinite" || s === "loop") return "infinite";
    const n = Number(s);
    return isFinite(n) && n > 0 ? Math.floor(n) || 1 : null;
  }

  function parseDirection(raw) {
    const s = String(raw).trim().toLowerCase();
    return s === "normal" || s === "alternate" ? s : null;
  }

  // Lê data-emerge-motion="x:-60 rotate:8 …" e data-emerge-motion-<prop>="…".
  // Os atributos individuais têm prioridade sobre o shorthand.
  function read(el) {
    const raw = {};
    const invalid = [];

    function put(key, value, from) {
      const k = ALIAS[String(key).toLowerCase().replace(/[-_]/g, "")];
      if (k) {
        raw[k] = value;
      } else if (/^(repeat|direction)$/i.test(key)) {
        raw[key.toLowerCase()] = value;
      } else if (from === "shorthand") {
        invalid.push(key);
      }
    }

    const shorthand = el.getAttribute(ATTR);
    if (shorthand) {
      shorthand
        .split(/[;,\s]+/)
        .filter(Boolean)
        .forEach((tok) => {
          const ix = tok.indexOf(":");
          if (ix < 1) return invalid.push(tok);
          put(tok.slice(0, ix), tok.slice(ix + 1), "shorthand");
        });
    }

    const pre = ATTR + "-";
    for (let a = 0; a < el.attributes.length; a++) {
      const at = el.attributes[a];
      if (at.name.indexOf(pre) !== 0) continue;
      const key = at.name.slice(pre.length);
      // disable-* / only-* pertencem ao core.isDisabledFor, não são propriedades
      if (/^(disable|only)(-|$)/.test(key)) continue;
      put(key, at.value, "attr");
    }

    const props = {};
    Object.keys(raw).forEach((k) => {
      if (k === "repeat" || k === "direction") return;
      const v = parseValue(PROPS[k], raw[k]);
      if (v == null) invalid.push(k);
      else props[k] = v;
    });

    let repeat = raw.repeat != null ? parseRepeat(raw.repeat) : null;
    if (raw.repeat != null && repeat == null) invalid.push("repeat");
    let direction = raw.direction != null ? parseDirection(raw.direction) : null;
    if (raw.direction != null && direction == null) invalid.push("direction");

    // ping-pong sem repetição não faz nada: assume infinito
    if (direction === "alternate" && repeat == null) repeat = "infinite";
    // alternate com contagem par terminaria no estado inicial; força ímpar
    if (direction === "alternate" && typeof repeat === "number" && repeat % 2 === 0)
      repeat += 1;

    const has = Object.keys(props).length > 0 || repeat != null || direction != null;
    return { has, props, repeat, direction, invalid };
  }

  /* ---- CSS ------------------------------------------------------------- */

  // Converte a configuração em { vars:{--x:valor}, classes:[…] }
  function compile(cfg) {
    const p = cfg.props;
    const vars = {};
    const classes = [CLS];

    if (p.opacity != null) vars["--emerge-from-opacity"] = p.opacity;

    if (p.x != null || p.y != null || p.z != null) {
      vars["--emerge-from-translate"] =
        (p.x || "0px") + " " + (p.y || "0px") + (p.z != null ? " " + p.z : "");
    }

    if (p.rotate != null) vars["--emerge-from-rotate"] = p.rotate;

    if (p.scale != null || p["scale-x"] != null || p["scale-y"] != null) {
      const sx = p["scale-x"] != null ? p["scale-x"] : p.scale != null ? p.scale : "1";
      const sy = p["scale-y"] != null ? p["scale-y"] : p.scale != null ? p.scale : "1";
      vars["--emerge-from-scale"] =
        p["scale-x"] == null && p["scale-y"] == null ? sx : sx + " " + sy;
    }

    const tf = TRANSFORM_ORDER.filter((k) => p[k] != null);
    if (tf.length) {
      const persp = tf.some((k) => k === "rotate-x" || k === "rotate-y")
        ? "perspective(var(--emerge-perspective, 2500px)) "
        : "";
      vars["--emerge-from-transform"] =
        persp + tf.map((k) => CSS_FN[k] + "(" + p[k] + ")").join(" ");
      vars["--emerge-to-transform"] =
        persp + tf.map((k) => CSS_FN[k] + "(0deg)").join(" ");
      vars["--emerge-a-transform"] = "emerge-flip";
      classes.push(CLS_TF);
    }

    const fx = FILTER_ORDER.filter((k) => p[k] != null);
    if (fx.length) {
      vars["--emerge-from-filter"] = fx.map((k) => k + "(" + p[k] + ")").join(" ");
      vars["--emerge-a-filter"] = "emerge-blur";
      classes.push(CLS_FX);
    }

    if (cfg.repeat != null) {
      vars["--emerge-motion-repeat"] = String(cfg.repeat);
      classes.push(CLS_LOOP);
    }
    if (cfg.direction != null) {
      vars["--emerge-motion-direction"] = cfg.direction;
      if (classes.indexOf(CLS_LOOP) < 0) classes.push(CLS_LOOP);
    }
    return { vars, classes };
  }

  /* ---- alvos (elemento ou partes do split de texto) --------------------- */

  function targetsOf(el) {
    if (el.hasAttribute("data-emerge-split")) {
      const parts = Array.from(el.querySelectorAll("[data-emerge].emerge-part")).filter(
        (n) => n.closest("[data-emerge-split]") === el,
      );
      if (parts.length) return parts;
    }
    return el.hasAttribute("data-emerge") ? [el] : [];
  }

  function wipe(rec) {
    rec.written.forEach((names, t) => {
      names.forEach((n) => t.style.removeProperty(n));
      t.classList.remove(CLS, CLS_TF, CLS_FX, CLS_LOOP);
    });
    rec.written.clear();
  }

  function paint(rec, cfg) {
    const out = compile(cfg);
    const targets = targetsOf(rec.el);

    // alvos que já não existem (ex.: re-split por linhas)
    rec.written.forEach((names, t) => {
      if (targets.indexOf(t) < 0) {
        names.forEach((n) => t.style.removeProperty(n));
        rec.written.delete(t);
      }
    });

    targets.forEach((t) => {
      const vars = Object.assign({}, out.vars);
      // sem preset no data-emerge → animação "pura": não faz fade por omissão
      if (
        vars["--emerge-from-opacity"] == null &&
        (t.getAttribute("data-emerge") || "").trim() === ""
      )
        vars["--emerge-from-opacity"] = "1";

      const prev = rec.written.get(t) || [];
      const names = Object.keys(vars);
      prev.forEach((n) => {
        if (names.indexOf(n) < 0) t.style.removeProperty(n);
      });
      names.forEach((n) => t.style.setProperty(n, vars[n]));
      [CLS, CLS_TF, CLS_FX, CLS_LOOP].forEach((c) =>
        t.classList.toggle(c, out.classes.indexOf(c) >= 0),
      );
      rec.written.set(t, names);
    });
  }

  /* ---- ciclo de vida ---------------------------------------------------- */

  function blocked(el) {
    if (core.isDisabledFor(el, NS)) return true;
    return !!(core.options.respectReducedMotion && core.prefersReducedMotion());
  }

  function clear(target) {
    const el = typeof target == "string" ? document.querySelector(target) : target;
    const rec = el && state.get(el);
    if (!rec) return false;
    wipe(rec);
    state.delete(el);
    return true;
  }

  function apply(target) {
    const el = typeof target == "string" ? document.querySelector(target) : target;
    if (!el || !core) return false;
    const cfg = read(el);
    if (!cfg.has || blocked(el)) {
      clear(el);
      return false;
    }
    let rec = state.get(el);
    if (!rec) {
      rec = { el, written: new Map() };
      state.set(el, rec);
    }
    paint(rec, cfg);
    return true;
  }

  function registered() {
    return Array.from(new Set(Array.from(core.registry.values()).map((s) => s.el)));
  }

  function resync(manual) {
    registered().forEach((el) => {
      if (manual || !state.has(el)) apply(el);
    });
    state.forEach((rec, el) => {
      if (!el.isConnected) return clear(el);
      if (el.hasAttribute("data-emerge-split")) apply(el);
    });
  }

  return {
    name: "Motion",
    install: (c) => (
      (core = c),
      {
        apply,
        clear,
        read,
        props: Object.keys(PROPS),
        get all() {
          return Array.from(state.keys());
        },
      }
    ),
    hooks: {
      observe({ el }) {
        apply(el);
      },
      unobserve({ el }) {
        clear(el);
      },
      init() {
        resync(false);
      },
      refresh({ reason }) {
        resync(reason === "manual");
      },
      teardown() {
        Array.from(state.keys()).forEach(clear);
      },
    },
  };
});
