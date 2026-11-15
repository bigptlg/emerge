/*! Emerge.js v1.10.0 — plugin Motion (global: EmergeMotion) */
(function (i, d) {
  typeof exports == "object" && typeof module != "undefined"
    ? (module.exports = d())
    : typeof define == "function" && define.amd
      ? define(d)
      : (i.EmergeMotion = d());
})(this, function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Motion — estado INICIAL (e, opcionalmente, FINAL) personalizado para a
     animação de entrada.

     Por omissão (igual ao resto do Emerge) o Motion só descreve o ponto de
     PARTIDA e o estado final é o estilo natural do elemento. Quando indicas
     um estado final (prefixo to-: to-x, to-opacity… ou data-emerge-motion-to),
     o elemento CHEGA e FICA nesse estado. Tempo, atraso, easing, once e mirror
     continuam a ser do Core (data-emerge-duration / -delay / -easing / …).

     Como funciona (sem keyframes novos, sem rAF, sem listeners):
       - opacity / translate / rotate / scale  → escreve as variáveis
         --emerge-from-* que o Core já usa (pré-estado + keyframe emerge-in);
       - rotate-x/y, skew-x/y                  → slot de transform do Core
         (--emerge-from/to-transform + keyframe emerge-flip);
       - blur, brightness, saturate, grayscale → slot de filter do Core
         (--emerge-from-filter + keyframe emerge-blur).
     Estado final (to-*): o plugin escreve --emerge-to-* e uma classe por canal
     (.emerge-motion-to-opacity, …). O CSS fixa esse valor enquanto o elemento
     está .emerge-animate / .emerge-follow; como os keyframes do Core só têm
     "from", a animação interpola até ao valor final.
     Como é tudo CSS do Core, o modo "follow" do Range (scroll-linked) e o
     split de texto funcionam sem código extra.
     ------------------------------------------------------------------------ */

  const ATTR = "data-emerge-motion";
  const NS = "motion";
  const CLS = "emerge-motion";
  const CLS_TF = "emerge-motion-transform";
  const CLS_FX = "emerge-motion-filter";
  const CLS_LOOP = "emerge-motion-loop";
  const CLS_TO = "emerge-motion-to";
  const TO_CH = ["opacity", "translate", "rotate", "scale", "transform", "filter"];
  const CLS_TO_CH = TO_CH.map((c) => CLS_TO + "-" + c);
  const CLS_HOLD = "emerge-motion-hold";
  const ALL_CLS = [CLS, CLS_TF, CLS_FX, CLS_LOOP, CLS_TO, CLS_HOLD].concat(CLS_TO_CH);

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
  const FILTER_ID = { blur: "0px", brightness: "1", saturate: "1", grayscale: "0" };
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

  // "10" ou "10%" -> número em [min,max] (min exclusivo quando incl=false)
  function parsePercent(raw, min, max, incl) {
    const m = /^([+-]?(?:\d+\.?\d*|\.\d+))%?$/.exec(String(raw).trim());
    if (!m) return null;
    const n = parseFloat(m[1]);
    if (!isFinite(n) || n > max || n < min || (!incl && n === min)) return null;
    return n;
  }

  function parseDirection(raw) {
    const s = String(raw).trim().toLowerCase();
    return s === "normal" || s === "alternate" ? s : null;
  }

  // Lê data-emerge-motion="x:-60 to-x:0 …", data-emerge-motion-<prop>="…",
  // data-emerge-motion-to-<prop>="…" e os grupos data-emerge-motion-from|to="x:0 …".
  // Prioridade (menor → maior): shorthand < grupos from/to < atributos individuais.
  function read(el) {
    const raw = { from: {}, to: {} };
    const invalid = [];

    // O prefixo from-/to- na chave escolhe a fase; sem prefixo vale a fase por omissão.
    function put(key, value, phase, strict) {
      let k = String(key).toLowerCase();
      const m = /^(from|to)[-_](.+)$/.exec(k);
      if (m) {
        phase = m[1];
        k = m[2];
      }
      const canon = ALIAS[k.replace(/[-_]/g, "")];
      if (canon) raw[phase][canon] = value;
      else if (!m && /^(repeat|direction|hold|hold[-_]at)$/.test(k))
        raw[k.replace("_", "-")] = value;
      else if (strict) invalid.push(key);
    }

    function tokens(str, phase) {
      String(str)
        .split(/[;,\s]+/)
        .filter(Boolean)
        .forEach((tok) => {
          const ix = tok.indexOf(":");
          if (ix < 1) return invalid.push(tok);
          put(tok.slice(0, ix), tok.slice(ix + 1), phase, true);
        });
    }

    const shorthand = el.getAttribute(ATTR);
    if (shorthand) tokens(shorthand, "from");

    ["from", "to"].forEach((ph) => {
      const g = el.getAttribute(ATTR + "-" + ph);
      if (g) tokens(g, ph);
    });

    const pre = ATTR + "-";
    for (let a = 0; a < el.attributes.length; a++) {
      const at = el.attributes[a];
      if (at.name.indexOf(pre) !== 0) continue;
      const key = at.name.slice(pre.length);
      // disable-* / only-* pertencem ao core.isDisabledFor, não são propriedades
      if (/^(disable|only)(-|$)/.test(key)) continue;
      if (key === "from" || key === "to") continue; // grupos: já lidos acima
      put(key, at.value, "from", false);
    }

    const props = {};
    const to = {};
    [
      ["from", props],
      ["to", to],
    ].forEach((pair) => {
      const ph = pair[0];
      Object.keys(raw[ph]).forEach((k) => {
        const v = parseValue(PROPS[k], raw[ph][k]);
        if (v == null) invalid.push((ph === "to" ? "to-" : "") + k);
        else pair[1][k] = v;
      });
    });

    let repeat = raw.repeat != null ? parseRepeat(raw.repeat) : null;
    if (raw.repeat != null && repeat == null) invalid.push("repeat");
    let direction = raw.direction != null ? parseDirection(raw.direction) : null;
    if (raw.direction != null && direction == null) invalid.push("direction");

    // hold: pausa no ponto de repouso (estado natural) entre o inicial e o final
    let hold = null;
    if (raw.hold != null) {
      const hn = parsePercent(raw.hold, 0, 100, false);
      const at = raw["hold-at"] != null ? parsePercent(raw["hold-at"], 0, 100, true) : 50;
      if (hn == null) invalid.push("hold");
      else if (at == null) invalid.push("hold-at");
      else if (!Object.keys(to).length) invalid.push("hold (precisa de to-)");
      else hold = { size: hn, at };
    } else if (raw["hold-at"] != null) invalid.push("hold-at (precisa de hold)");

    // ping-pong sem repetição não faz nada: assume infinito
    if (direction === "alternate" && repeat == null) repeat = "infinite";
    // alternate com contagem par terminaria no estado inicial; força ímpar
    if (direction === "alternate" && typeof repeat === "number" && repeat % 2 === 0)
      repeat += 1;

    const has =
      Object.keys(props).length > 0 ||
      Object.keys(to).length > 0 ||
      repeat != null ||
      direction != null ||
      hold != null;
    return { has, props, to, repeat, direction, hold, invalid };
  }

  /* ---- CSS ------------------------------------------------------------- */

  // @keyframes dinâmicos (as percentagens não aceitam var()): um por configuração
  let kfSheet = null;
  const kfCache = {};
  function keyframesFor(body) {
    if (kfCache[body]) return kfCache[body];
    try {
      if (!kfSheet) {
        const st = document.createElement("style");
        st.setAttribute("data-emerge-motion-keyframes", "");
        document.head.appendChild(st);
        kfSheet = st.sheet;
      }
      let h = 5381;
      for (let i = 0; i < body.length; i++) h = ((h << 5) + h + body.charCodeAt(i)) | 0;
      const name = "emerge-motion-hold-" + (h >>> 0).toString(36);
      kfSheet.insertRule("@keyframes " + name + "{" + body + "}", kfSheet.cssRules.length);
      return (kfCache[body] = name);
    } catch (e) {
      return null;
    }
  }

  function translateOf(p, withZ) {
    if (p.x == null && p.y == null && p.z == null) return null;
    return (p.x || "0px") + " " + (p.y || "0px") + (withZ ? " " + (p.z || "0px") : "");
  }

  function scaleOf(p) {
    if (p.scale == null && p["scale-x"] == null && p["scale-y"] == null) return null;
    const sx = p["scale-x"] != null ? p["scale-x"] : p.scale != null ? p.scale : "1";
    const sy = p["scale-y"] != null ? p["scale-y"] : p.scale != null ? p.scale : "1";
    return p["scale-x"] == null && p["scale-y"] == null ? sx : sx + " " + sy;
  }

  // Converte a configuração em { vars:{--x:valor}, classes:[…] }
  function compile(cfg) {
    const p = cfg.props; // estado inicial (from)
    const q = cfg.to; // estado final (to), opcional
    const vars = {};
    const classes = [CLS];
    const frames = []; // [propriedade, from, repouso, to] — só usado com hold

    // define from e/ou to de um canal simples (opacity, translate, rotate, scale)
    function channel(ch, from, to, rest) {
      if (from != null) vars["--emerge-from-" + ch] = from;
      if (to != null) {
        vars["--emerge-to-" + ch] = to;
        classes.push(CLS_TO + "-" + ch);
      }
      if (from != null || to != null)
        frames.push([
          ch,
          "var(--emerge-from-" + ch + ")",
          rest,
          to != null ? "var(--emerge-to-" + ch + ")" : rest,
        ]);
    }

    channel("opacity", p.opacity, q.opacity, "1");

    const withZ = p.z != null || q.z != null;
    channel("translate", translateOf(p, withZ), translateOf(q, withZ), "0px 0px");
    channel("rotate", p.rotate, q.rotate, "0deg");
    channel("scale", scaleOf(p), scaleOf(q), "1");

    const tf = TRANSFORM_ORDER.filter((k) => p[k] != null || q[k] != null);
    if (tf.length) {
      const persp = tf.some((k) => k === "rotate-x" || k === "rotate-y")
        ? "perspective(var(--emerge-perspective, 2500px)) "
        : "";
      const build = (s) =>
        persp + tf.map((k) => CSS_FN[k] + "(" + (s[k] != null ? s[k] : "0deg") + ")").join(" ");
      vars["--emerge-from-transform"] = build(p);
      vars["--emerge-to-transform"] = build(q);
      vars["--emerge-a-transform"] = "emerge-flip";
      classes.push(CLS_TF);
      const hasToTf = tf.some((k) => q[k] != null);
      if (hasToTf) classes.push(CLS_TO + "-transform");
      frames.push([
        "transform",
        "var(--emerge-from-transform)",
        build({}),
        hasToTf ? "var(--emerge-to-transform)" : build({}),
      ]);
    }

    const fx = FILTER_ORDER.filter((k) => p[k] != null || q[k] != null);
    if (fx.length) {
      const hasTo = fx.some((k) => q[k] != null);
      // com estado final, as duas listas têm de ter as mesmas funções (valores neutros no resto)
      const build = (s) =>
        fx
          .filter((k) => hasTo || s[k] != null)
          .map((k) => k + "(" + (s[k] != null ? s[k] : FILTER_ID[k]) + ")")
          .join(" ");
      vars["--emerge-from-filter"] = build(p);
      vars["--emerge-a-filter"] = "emerge-blur";
      classes.push(CLS_FX);
      if (hasTo) {
        vars["--emerge-to-filter"] = build(q);
        classes.push(CLS_TO + "-filter");
      }
      const restFx = fx.map((k) => k + "(" + FILTER_ID[k] + ")").join(" ");
      frames.push([
        "filter",
        "var(--emerge-from-filter)",
        restFx,
        hasTo ? "var(--emerge-to-filter)" : restFx,
      ]);
    }

    if (classes.some((c) => c.indexOf(CLS_TO + "-") === 0)) classes.push(CLS_TO);

    if (cfg.hold && frames.length) {
      const a = Math.max(0, cfg.hold.at - cfg.hold.size / 2);
      const b = Math.min(100, cfg.hold.at + cfg.hold.size / 2);
      const at = (i) => frames.map((f) => f[0] + ":" + f[i] + ";").join("");
      const body =
        "0%{" + at(1) + "}" + num(a) + "%," + num(b) + "%{" + at(2) + "}100%{" + at(3) + "}";
      const name = keyframesFor(body);
      if (name) {
        vars["--emerge-a-hold"] = name;
        classes.push(CLS_HOLD);
      }
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
      ALL_CLS.forEach((c) => t.classList.remove(c));
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
      // (excepto se indicares to-opacity: aí o elemento faz fade até esse valor)
      if (
        vars["--emerge-from-opacity"] == null &&
        vars["--emerge-to-opacity"] == null &&
        (t.getAttribute("data-emerge") || "").trim() === ""
      )
        vars["--emerge-from-opacity"] = "1";

      const prev = rec.written.get(t) || [];
      const names = Object.keys(vars);
      prev.forEach((n) => {
        if (names.indexOf(n) < 0) t.style.removeProperty(n);
      });
      names.forEach((n) => t.style.setProperty(n, vars[n]));
      ALL_CLS.forEach((c) =>
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
