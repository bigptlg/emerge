/*! Emerge.js v1.7.2 — plugin Scene (global: EmergeScene) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeScene = d());
  })(this, function () {
    "use strict";
    // Scene — hero fixa (sticky) animada pelo scroll.
    // Preset "unfold": replica a timeline GSAP do original (tabela 2.7) sem GSAP.
    // Preset "fold" (v1.2.0): o inverso — o painel começa a cobrir a cena e
    // encolhe até um cartão centrado (estilo landonorris.com); com
    // data-emerge-scene-scale="0" (v1.3.0) encolhe até desaparecer por inteiro.
    // Preset "bloom" (v1.3.0): a div seguinte não vem de baixo — nasce PELO
    // CENTRO (scale pequeno → 1, opacity 0 → 1, raio → 0) e cresce até cobrir.
    // Presets v1.4.0 — mais formas de a div seguinte chegar:
    //   "zoom"    — entra GRANDE (scale > 1) e transparente e RECUA até ao
    //               tamanho natural (dolly-out; o oposto do bloom);
    //   "slide"   — empurra pela DIREITA (translateX 100% → 0), opaco, com
    //               parallax do content para o lado oposto;
    //   "wheel"   — gira em rotateY (spin → 0) com scale pequeno → 1;
    //   "curtain" — revelação em ÍRIS: clip-path circle() abre do centro
    //               (raio 0 → metade da diagonal da cena), sem movimento;
    //   "blur"    — entra DESFOCADO (filter blur → 0) e ligeiramente maior,
    //               "focando" ao scroll; o content esvanece desfocando.
    // O progresso e o suavizado ("scrub") vêm do plugin Range, como no
    // Horizontal/Stack; a avaliação dos steps é local:
    //   p = clamp((P - start) / (end - start)),  e = 1 - (1 - p)^2 (power1.out),
    //   valor = from + (to - from) * e.
    let core = null;
    const instances = new Map();
    const TOTAL = 3.5; // duração total da timeline original (unidades GSAP)
    let lastWidth = 0;
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const easeOut = (p) => 1 - (1 - p) * (1 - p);
    const f4 = (n) => n.toFixed(4);

    function toEl(x) {
      return typeof x == "string" ? document.querySelector(x) : x;
    }

    // ---- opções: atributo no elemento > token CSS > default -----------------
    // O fold inverte o papel de tilt/scale/offset/radius (passam a ser os
    // valores FINAIS do painel) e por isso tem defaults próprios; com
    // scale 0 (ou quase 0) o painel encolhe até desaparecer por inteiro.
    // O bloom tem defaults próprios pelo mesmo motivo: as quatro opções
    // descrevem o estado INICIAL do painel, "nascendo pelo centro".
    // Nos presets v1.4.0 as quatro opções descrevem igualmente o estado
    // INICIAL do painel (no zoom/blur é scale > 1: "vem de muito perto");
    // o wheel/curtain têm perspective-origin própria (centro) e ganham duas
    // opções novas: "spin" (ângulo rotateY inicial do wheel) e "blur" (raio
    // de desfoque inicial do blur), ambas com token CSS homónimo.
    const PRESET_DEFAULTS = {
      fold: { sceneTilt: 0, sceneScale: 0.5, sceneOffset: 0, sceneRadius: "2rem" },
      bloom: { sceneTilt: 0, sceneScale: 0.44, sceneOffset: 0, sceneRadius: "2rem" },
      zoom: { sceneTilt: 0, sceneScale: 1.6, sceneOffset: 0, sceneRadius: "2rem" },
      slide: { sceneTilt: 0, sceneScale: 1, sceneOffset: 0, sceneRadius: "2rem" },
      wheel: { sceneTilt: 0, sceneScale: 0.7, sceneOffset: 0, sceneRadius: "2rem", sceneOrigin: "50% 50%", spin: 90 },
      curtain: { sceneTilt: 0, sceneScale: 1, sceneOffset: 0, sceneRadius: "2rem", sceneOrigin: "50% 50%" },
      blur: { sceneTilt: 0, sceneScale: 1.12, sceneOffset: 0, sceneRadius: "2rem", blur: 24 },
    };
    function num(v, d) {
      const n = parseFloat(v);
      return Number.isNaN(n) ? d : n;
    }
    function resolveOptions(el, preset) {
      const base = (preset && PRESET_DEFAULTS[preset]) || {};
      const o = { ...core.options, ...base };
      const cs = getComputedStyle(el);
      // Em todos os presets menos o unfold, tilt/scale/offset/radius mudam de
      // papel (descrevem o estado INICIAL do painel, não o do unfold) e por
      // isso ignoram os tokens :root da folha de estilos — a personalização
      // faz-se por atributos. No wheel/curtain o origin também é próprio
      // (centro: a fuga "50% 78%" do unfold não serve para o giro/íris).
      const noToken =
        preset === "unfold"
          ? null
          : preset === "wheel" || preset === "curtain"
            ? { tilt: 1, scale: 1, offset: 1, radius: 1, origin: 1 }
            : { tilt: 1, scale: 1, offset: 1, radius: 1 };
      const read = (name, d) => {
        const a = el.getAttribute(`data-emerge-scene-${name}`);
        if (a != null && String(a).trim() !== "") return String(a).trim();
        if (noToken && noToken[name]) return d;
        const t = (cs.getPropertyValue(`--emerge-scene-${name}`) || "").trim();
        return t !== "" ? t : d;
      };
      return {
        distance: Math.max(0, num(read("distance", o.sceneDistance), o.sceneDistance)),
        perspective: num(read("perspective", o.scenePerspective), o.scenePerspective),
        origin: read("origin", o.sceneOrigin),
        tilt: num(read("tilt", o.sceneTilt), o.sceneTilt),
        scale: num(read("scale", o.sceneScale), o.sceneScale),
        scaleY: read("scale-y", null), // só no fold/bloom; null = segue o scale
        offset: num(read("offset", o.sceneOffset), o.sceneOffset),
        radius: read("radius", o.sceneRadius),
        spin: num(read("spin", base.spin != null ? base.spin : 0), base.spin != null ? base.spin : 0), // rotateY inicial (wheel)
        blur: num(read("blur", base.blur != null ? base.blur : 0), base.blur != null ? base.blur : 0), // raio do desfoque (blur)
        smooth: Math.max(0, num(read("smooth", o.sceneSmooth), o.sceneSmooth)),
      };
    }
    // O border-radius animado é a exceção combinada: converte o valor inicial
    // (p. ex. "5vw") para px uma única vez por measure, para interpolar números.
    function radiusToPx(panel, value) {
      if (!panel) return 0;
      const prev = panel.style.borderRadius;
      panel.style.borderRadius = String(value);
      const n = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0;
      panel.style.borderRadius = prev;
      return n;
    }

    // ---- tabela 2.7 como steps {target, prop, from, to, start, end} ---------
    // start/end já normalizados (divididos por TOTAL). A ordem importa: para o
    // mesmo alvo+propriedade, o último step começado é que ganha. A estrutura é
    // genérica — expor mais presets/API pública depois não exige reescrita.
    function buildSteps(o) {
      return [
        // 1: luz secundária nasce              0.0000 – 0.2857
        { target: "layerB", prop: "opacity", from: 0, to: 1, start: 0, end: 1 / TOTAL },
        // 2: luz primária apaga-se             0.0000 – 0.2857
        { target: "layerA", prop: "opacity", from: 1, to: 0, start: 0, end: 1 / TOTAL },
        // 3: conteúdo da hero desaparece       0.1143 – 0.4000
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0.4 / TOTAL, end: 1.4 / TOTAL },
        // 4: luz secundária apaga-se (pisca)   0.2857 – 0.3429
        { target: "layerB", prop: "opacity", from: 1, to: 0, start: 1 / TOTAL, end: 1.2 / TOTAL },
        // 5: painel aparece                    0.2857 – 0.4000
        { target: "panel", prop: "opacity", from: 0, to: 1, start: 1 / TOTAL, end: 1.4 / TOTAL },
        // 6a/6b/6c: o painel levanta-se        0.3143 – 0.8857
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: 1.1 / TOTAL, end: 3.1 / TOTAL },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: 1.1 / TOTAL, end: 3.1 / TOTAL },
        // translateY em % (da altura do próprio painel) == animar "top" no
        // original, porque o painel mede 100% da altura do contentor.
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: 1.1 / TOTAL, end: 3.1 / TOTAL },
        // 7: cantos perdem o raio              0.3143 – 0.6000
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 1.1 / TOTAL, end: 2.1 / TOTAL },
        // 8: cobertura revela o vídeo          0.4571 – 0.7429
        { target: "cover", prop: "opacity", from: 1, to: 0, start: 1.6 / TOTAL, end: 2.6 / TOTAL },
        // 9: pausa final 0.8857 – 1.0 (sem steps: o estado mantém-se)
      ];
    }

    // ---- preset "fold": o inverso do unfold — o painel começa a cobrir a
    // cena (plano, opaco, sem raio) e encolhe até um cartão centrado, com
    // escala X/Y independentes (cartão "retrato" num ecrã panorâmico).
    // Janelas já normalizadas (0–1). cover/layers não são animados; o
    // content ganha um leve zoom-out para dar profundidade.
    function syEndOf(o) {
      return o.scaleY != null ? num(o.scaleY, o.scale) : o.scale;
    }
    function buildStepsFold(o) {
      const syEnd = syEndOf(o);
      // scale 0 (ou quase 0): o painel encolhe até DESAPARECER por inteiro —
      // a janela estica um pouco e a opacity cai no fim (evita subpixel).
      const gone = o.scale <= 0.05 && syEnd <= 0.05;
      const sEnd = gone ? 0.78 : 0.7;
      const steps = [
        { target: "content", prop: "scale", from: 1.15, to: 1, start: 0, end: gone ? sEnd : 1 },
        { target: "panel", prop: "scaleX", from: 1, to: o.scale, start: 0, end: sEnd },
        { target: "panel", prop: "scaleY", from: 1, to: syEnd, start: 0, end: sEnd },
        // configuráveis (defaults 0 = sem efeito visual)
        { target: "panel", prop: "rotateX", from: 0, to: o.tilt, start: 0, end: sEnd },
        { target: "panel", prop: "translateY", from: 0, to: o.offset, start: 0, end: sEnd },
        // os cantos ganham o raio
        { target: "panel", prop: "radius", from: 0, to: o.radiusPx, start: 0.1, end: gone ? 0.62 : 0.6 },
      ];
      // só no modo "desaparecer": o painel esvanece antes de chegar a scale 0
      if (gone)
        steps.push({ target: "panel", prop: "opacity", from: 1, to: 0, start: 0.62, end: 0.76 });
      return steps;
    }

    // ---- preset "bloom" (v1.3.0): a div seguinte não vem de baixo — nasce
    // PELO CENTRO: começa pequena (scale), transparente e com raio, e cresce
    // até cobrir a cena. tilt e offset continuam disponíveis (defaults 0 =
    // crescimento puro a partir do centro); o content, se existir, cede o
    // lugar cedo. Janelas já normalizadas (0–1).
    function buildStepsBloom(o) {
      const syEnd = syEndOf(o);
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.25 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: 0.08, end: 0.45 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: 0.08, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEnd, to: 1, start: 0.08, end: 0.85 },
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: 0.08, end: 0.85 },
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: 0.08, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 0.08, end: 0.7 },
        // pausa final 0.85 – 1.0 (sem steps: o estado mantém-se)
      ];
    }

    // ---- presets v1.4.0 — mais formas de a div seguinte chegar. Todos são
    // "de entrada" como o bloom: o content da cena cede cedo e o painel
    // cresce até cobrir. As janelas seguem o padrão do bloom (pausa final
    // 0.85–1.0) e os defaults de pintura no paint() coincidem com os "from"
    // destas tabelas (continuidade garantida ao entrar na janela).

    // "zoom" — dolly-out, o oposto do bloom: o painel começa GRANDE
    // (scale > 1, default 1.6) e transparente, como se estivesse à frente da
    // câmara, e RECUA até ao tamanho natural enquanto ganha corpo. O content
    // afasta-se para trás (scale up) enquanto esvanece — profundidade.
    function buildStepsZoom(o) {
      const s0 = 0.04;
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.25 },
        { target: "content", prop: "scale", from: 1, to: 1.18, start: 0, end: 0.5 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: s0, end: 0.4 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEndOf(o), to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: s0, end: 0.65 },
      ];
    }

    // "slide" — empurrão lateral: o painel entra pela DIREITA (translateX
    // 100% → 0), opaco do princípio ao fim, plano; o content desliza uns
    // percentuais para o lado oposto (parallax). offset (translateY) continua
    // disponível — com offset ≠ 0 o empurrão fica diagonal.
    function buildStepsSlide(o) {
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.5 },
        { target: "content", prop: "translateX", from: 0, to: -12, start: 0, end: 0.6 },
        { target: "panel", prop: "translateX", from: 100, to: 0, start: 0, end: 0.85 },
        { target: "panel", prop: "translateY", from: o.offset, to: 0, start: 0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 0.15, end: 0.6 },
      ];
    }

    // "wheel" — giro de cartão em 3D: o painel entra rodado em rotateY
    // (opção "spin", default 90°) e pequeno (scale 0.7), ganha opacidade cedo
    // e endireita-se até cobrir. A perspective da cena (origin no centro
    // neste preset) dá a profundidade; o raio fecha durante o giro.
    function buildStepsWheel(o) {
      const s0 = 0.04;
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.25 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: s0, end: 0.4 },
        { target: "panel", prop: "rotateY", from: o.spin, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "rotateX", from: o.tilt, to: 0, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEndOf(o), to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: s0, end: 0.65 },
      ];
    }

    // "curtain" — revelação em íris: o painel está lá todo desde o primeiro
    // frame mas tapado por um clip-path circular que ABRE DO CENTRO (raio 0 →
    // metade da diagonal da cena, medida no measure). Sem movimento nem
    // escala — só o círculo a crescer; o centro do círculo é o "origin". O
    // raio do painel fecha no início da abertura para o estado final ficar a
    // 0 (cantos retos a cobrir o ecrã).
    function buildStepsCurtain(o) {
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.2 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: 0.03, end: 0.5 },
        { target: "panel", prop: "clip", from: 0, to: o.irisTo, start: 0.03, end: 0.85 },
      ];
    }

    // "blur" — foco de profundidade: o painel entra DESFOCADO (filter blur,
    // default 24px) e ligeiramente maior (scale 1.12) e "foca" ao scroll; o
    // content esvanece desfocando por sua vez (blur 0 → 10px). filter é
    // caro em ecrãs grandes: o raio é configurável (0 desliga o desfoque).
    function buildStepsBlur(o) {
      const s0 = 0.03;
      return [
        { target: "content", prop: "opacity", from: 1, to: 0, start: 0, end: 0.3 },
        { target: "content", prop: "blur", from: 0, to: 10, start: 0, end: 0.45 },
        { target: "panel", prop: "opacity", from: 0, to: 1, start: s0, end: 0.4 },
        { target: "panel", prop: "blur", from: o.blur, to: 0, start: s0, end: 0.8 },
        { target: "panel", prop: "scaleX", from: o.scale, to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "scaleY", from: syEndOf(o), to: 1, start: s0, end: 0.85 },
        { target: "panel", prop: "radius", from: o.radiusPx, to: 0, start: s0, end: 0.6 },
      ];
    }

    // Lista oficial de presets (whitelist do build) e o respetivo construtor
    // de steps — acrescentar um preset novo daqui para a frente é uma linha
    // aqui e o respetivo buildStepsX.
    const PRESETS = ["unfold", "fold", "bloom", "zoom", "slide", "wheel", "curtain", "blur"];
    const BUILDERS = {
      unfold: buildSteps,
      fold: buildStepsFold,
      bloom: buildStepsBloom,
      zoom: buildStepsZoom,
      slide: buildStepsSlide,
      wheel: buildStepsWheel,
      curtain: buildStepsCurtain,
      blur: buildStepsBlur,
    };

    // ---- pintura: um ciclo de escrita por frame, sem leituras intercaladas ---
    function paint(inst, p) {
      const mode = inst.preset; // ver PRESETS
      const flat = mode !== "unfold"; // todos menos o unfold: sem luzes/capa, com scaleY
      // presets em que o painel é opaco "por natureza" (o default de opacity
      // é 1): o fold começa a cobrir, o slide entra pela direita e o curtain
      // é tapado pelo clip-path (a opacity não faz parte da sua timeline).
      const opaque = mode === "fold" || mode === "slide" || mode === "curtain";
      const v = {};
      for (const s of inst.steps) {
        if (p < s.start) continue; // ainda não começou; o último começado ganha
        const k = clamp((p - s.start) / (s.end - s.start), 0, 1);
        v[s.prop + "@" + s.target] = s.from + (s.to - s.from) * easeOut(k);
      }
      const set = (el, key, value, fmt) => {
        if (!el || value == null) return;
        const s = fmt ? fmt(value) : String(value);
        if (inst.last[key] === s) return;
        inst.last[key] = s;
        el.style[key.slice(key.indexOf(".") + 1)] = s; // "panel.opacity" -> "opacity"
      };
      const t = inst.targets;
      set(t.content, "content.opacity", v["opacity@content"] != null ? v["opacity@content"] : 1, f4);
      if (mode === "fold" && t.content)
        set(t.content, "content.scale", v["scale@content"] != null ? v["scale@content"] : 1.15, f4);
      // content transform/filter genéricos (zoom: afasta-se para trás; slide:
      // parallax lateral; blur: esvanece desfocando). O fold mantém o seu
      // caminho próprio (acima, via propriedade CSS "scale").
      if (t.content && (mode === "zoom" || mode === "slide")) {
        const cScale = v["scale@content"] != null ? v["scale@content"] : 1;
        const cTx = v["translateX@content"] != null ? v["translateX@content"] : 0;
        const ctr =
          cScale !== 1 || cTx !== 0 ? `translateX(${cTx.toFixed(3)}%) scale(${f4(cScale)})` : "";
        if (ctr) {
          if (inst.last.ctr !== ctr) {
            inst.last.ctr = ctr;
            t.content.style.transform = ctr;
          }
        } else if (inst.last.ctr) {
          inst.last.ctr = "";
          t.content.style.removeProperty("transform");
        }
      }
      if (t.content && mode === "blur") {
        const cBlur = v["blur@content"] != null ? v["blur@content"] : 0;
        const cf = cBlur > 0 ? `blur(${cBlur.toFixed(2)}px)` : "";
        if (cf) {
          if (inst.last.cf !== cf) {
            inst.last.cf = cf;
            t.content.style.filter = cf;
          }
        } else if (inst.last.cf) {
          inst.last.cf = "";
          t.content.style.removeProperty("filter");
        }
      }
      // no fold/bloom e nos presets v1.4.0, layers/cover não fazem parte da
      // timeline: ficam com o estilo do autor (o layer-b só começa com
      // opacity 0 no unfold)
      if (!flat) {
        set(t.layerA, "layerA.opacity", v["opacity@layerA"] != null ? v["opacity@layerA"] : 1, f4);
        set(t.layerB, "layerB.opacity", v["opacity@layerB"] != null ? v["opacity@layerB"] : 0, f4);
        set(t.cover, "cover.opacity", v["opacity@cover"] != null ? v["opacity@cover"] : 1, f4);
      }
      if (t.panel) {
        // fold/slide/curtain: o painel é opaco; restantes: começa invisível
        set(t.panel, "panel.opacity", v["opacity@panel"] != null ? v["opacity@panel"] : opaque ? 1 : 0, f4);
        // translateY antes de rotateX/rotateY/scale: a translação fica "por
        // fora" da rotação em torno do centro (equivale ao `top` animado do
        // original). Os defaults coincidem com os "from" das tabelas de steps
        // de cada preset (continuidade ao entrar na janela).
        const d = inst.opts;
        const ty = v["translateY@panel"] != null ? v["translateY@panel"] : mode === "fold" ? 0 : d.offset;
        const tx = v["translateX@panel"] != null ? v["translateX@panel"] : 0;
        const rx = v["rotateX@panel"] != null ? v["rotateX@panel"] : mode === "fold" ? 0 : d.tilt;
        const ry = v["rotateY@panel"] != null ? v["rotateY@panel"] : d.spin; // wheel
        const sx = v["scaleX@panel"] != null ? v["scaleX@panel"] : mode === "fold" ? 1 : d.scale;
        // fold/unfold não usam scaleY; nos restantes o default é o estado
        // inicial do eixo Y (o "scale" do preset, ou o "scale-y" se existir)
        const sy =
          v["scaleY@panel"] != null ? v["scaleY@panel"] : mode === "unfold" || mode === "fold" ? 1 : syEndOf(d);
        // fold/bloom acrescentaram scaleY (v1.3.0); v1.4.0 acrescenta
        // translateX (slide) e rotateY (wheel) à mesma cadeia.
        const tr = flat
          ? `translateY(${ty}%) translateX(${tx}%) rotateX(${rx}deg) rotateY(${ry}deg) scaleX(${sx}) scaleY(${sy})`
          : `translateY(${ty}%) rotateX(${rx}deg) scaleX(${sx})`;
        if (inst.last.transform !== tr) {
          inst.last.transform = tr;
          t.panel.style.transform = tr;
        }
        const rd = v["radius@panel"] != null ? v["radius@panel"] : mode === "fold" ? 0 : inst.radiusFrom;
        set(t.panel, "panel.borderRadius", rd, (n) => n.toFixed(2) + "px");
        // curtain: clip-path circular (íris) — raio 0 → metade da diagonal.
        // Formato estável para o guard de escrita (mesma string = sem write).
        const cl = v["clip@panel"] != null ? v["clip@panel"] : mode === "curtain" ? 0 : null;
        if (cl != null) {
          const cs = `circle(${cl.toFixed(1)}px at ${d.origin})`;
          if (inst.last.clip !== cs) {
            inst.last.clip = cs;
            t.panel.style.clipPath = cs;
          }
        } else if (inst.last.clip) {
          inst.last.clip = "";
          t.panel.style.removeProperty("clip-path");
        }
        // blur: filter blur no painel (só este preset escreve filter)
        const pb = v["blur@panel"] != null ? v["blur@panel"] : mode === "blur" ? d.blur : 0;
        const pf = pb > 0 ? `blur(${pb.toFixed(2)}px)` : "";
        if (pf) {
          if (inst.last.pf !== pf) {
            inst.last.pf = pf;
            t.panel.style.filter = pf;
          }
        } else if (inst.last.pf) {
          inst.last.pf = "";
          t.panel.style.removeProperty("filter");
        }
      }
      const prog = f4(p);
      if (inst.last.progress !== prog) {
        inst.last.progress = prog;
        inst.el.style.setProperty("--emerge-scene-progress", prog);
        core.dispatch("emerge:scene:progress", { el: inst.el, progress: p });
      }
      // will-change só enquanto a cena está efetivamente a ser animada.
      const live = p > 0 && p < 1;
      if (live !== inst.live) {
        inst.live = live;
        inst.el.classList.toggle("emerge-scene-live", live);
      }
    }

    // ---- alvos e espaçador ---------------------------------------------------
    function collect(el) {
      const t = {};
      t.content = el.querySelector("[data-emerge-scene-content]");
      t.layerA = el.querySelector('[data-emerge-scene-layer="a"]');
      t.layerB = el.querySelector('[data-emerge-scene-layer="b"]');
      // O painel tem de ser filho DIRETO do elemento com perspective; se vier
      // aninhado mais fundo, avisamos (debug) em vez de falhar em silêncio.
      t.panel =
        el.querySelector(":scope > [data-emerge-scene-panel]") ||
        el.querySelector("[data-emerge-scene-panel]");
      t.cover = t.panel
        ? t.panel.querySelector("[data-emerge-scene-cover]") ||
          el.querySelector("[data-emerge-scene-cover]")
        : el.querySelector("[data-emerge-scene-cover]");
      return t;
    }

    function wrap(el) {
      const parent = el.parentElement;
      if (
        parent &&
        parent.classList.contains("emerge-scene-space") &&
        parent.dataset.emergeSceneSpaceFor === ""
      )
        return parent;
      const spacer = document.createElement("div");
      spacer.className = "emerge-scene-space";
      parent.insertBefore(spacer, el);
      spacer.appendChild(el);
      return spacer;
    }
    function unwrap(spacer, el) {
      if (!spacer || !spacer.classList.contains("emerge-scene-space")) return;
      const parent = spacer.parentElement;
      parent && parent.insertBefore(el, spacer);
      spacer.remove();
    }

    // ---- medida ---------------------------------------------------------------
    function measure(inst) {
      if (inst.static) return;
      const el = inst.el;
      inst.opts = resolveOptions(el, inst.preset); // relê tokens: apanha overrides em @media
      inst.radiusFrom = radiusToPx(inst.targets.panel, inst.opts.radius);
      // curtain: raio final da íris = metade da diagonal da cena (+2px de
      // folga) — cobre os cantos em qualquer aspecto; medido do próprio el,
      // que não leva transform (os transforms ficam no painel).
      const r = el.getBoundingClientRect();
      const h = r.height || window.innerHeight;
      inst.irisTo = Math.ceil(Math.hypot(r.width, h) / 2) + 2;
      inst.steps = BUILDERS[inst.preset]({ ...inst.opts, radiusPx: inst.radiusFrom, irisTo: inst.irisTo });
      el.style.perspective = inst.opts.perspective + "px";
      el.style.perspectiveOrigin = inst.opts.origin;
      inst.spacer && (inst.spacer.style.height = Math.ceil(h + inst.opts.distance) + "px");
      inst.range && inst.range.measure();
    }

    // ---- construção ------------------------------------------------------------
    function build(x) {
      const el = toEl(x);
      if (!el || instances.has(el)) return instances.get(el) || null;
      const preset = String(el.getAttribute("data-emerge-scene") || "").trim() || "unfold";
      const debug = !!core.attr(el, "debug", !1); // padrão Range: data-emerge-debug
      if (PRESETS.indexOf(preset) < 0) {
        debug &&
          console.warn(`[Emerge Scene] preset "${preset}" desconhecido; presets: ${PRESETS.join(", ")}.`);
        return null;
      }
      const targets = collect(el);
      if (!targets.panel) {
        debug && console.warn("[Emerge Scene] falta [data-emerge-scene-panel]; cena ignorada.", el);
        return null;
      }
      targets.panel.parentElement !== el &&
        debug &&
        console.warn(
          "[Emerge Scene] o painel deve ser filho direto do elemento com perspective (a perspective só afeta filhos diretos).",
          el,
        );
      const staticMode = core.isDisabledFor(el, "scene") || core.prefersReducedMotion();
      const inst = {
        el,
        preset,
        targets,
        spacer: null,
        range: null,
        steps: [],
        opts: null,
        radiusFrom: 0,
        last: {},
        live: false,
        static: staticMode,
        debug,
        layers: [],
      };
      core.claim(el, "Scene");
      core.claim(targets.panel, "Scene");
      el.classList.add("emerge-scene", "emerge-scene-" + preset);
      targets.panel.classList.add("emerge-scene-panel");
      targets.content && targets.content.classList.add("emerge-scene-content");
      targets.cover && targets.cover.classList.add("emerge-scene-cover");
      targets.layerA && inst.layers.push([targets.layerA, "emerge-scene-layer", "emerge-scene-layer-a"]);
      targets.layerB && inst.layers.push([targets.layerB, "emerge-scene-layer", "emerge-scene-layer-b"]);
      inst.layers.forEach(([n, a, b]) => n.classList.add(a, b));
      if (staticMode) {
        // reduced motion / disable: sem pin e sem 3D — a hero fica estática e o
        // painel plano, em fluxo normal, logo abaixo (CSS .emerge-scene-static).
        el.classList.add("emerge-scene-static");
      } else {
        inst.spacer = wrap(el);
        inst.spacer.dataset.emergeSceneSpaceFor = "";
        el.style.position = "sticky";
        el.style.top = "0px";
        measure(inst);
        wire(inst);
        paint(inst, 0); // estado inicial inline logo no build (sem flash)
      }
      instances.set(el, inst);
      core.dispatch("emerge:scene:build", {
        el,
        panel: targets.panel,
        spacer: inst.spacer,
        static: staticMode,
      });
      return inst;
    }

    function wire(inst) {
      const range = core.range; // Scene depende do Range (incluído no bundle)
      if (!range) return;
      inst.range = range.watch({
        on: inst.spacer,
        anchor: inst.spacer,
        from: "top@0%", // começa quando o topo da cena toca o topo do viewport
        to: "bottom@100%", // termina distance px depois
        // "scrub: 2" do original: aproximação exponencial com τ = smooth * 0.2 s
        // (o Range faz exatamente progresso += (alvo − progresso) · (1 − e^(−dt/τ)),
        // para o rAF quando assenta e só escreve quando o valor muda).
        follow: inst.opts.smooth > 0 ? inst.opts.smooth * 0.2 : !1,
        cssFollow: !1,
        debug: inst.debug,
        onProgress(r) {
          paint(inst, clamp(r.progress, 0, 1));
        },
        onEdge(e) {
          // from+descendo→enter · from+subindo(−1)→leave · to+descendo→leave · to+subindo→enter
          const k = e.direction > 0 ? "enter" : "leave";
          const name = e.edge === "from" ? k : e.direction > 0 ? "leave" : "enter";
          core.dispatch(`emerge:scene:${name}`, { el: inst.el, direction: e.direction });
        },
      });
    }

    function destroy(x) {
      const el = toEl(x);
      const inst = el && instances.get(el);
      if (!inst) return !1;
      inst.range && inst.range.stop();
      unwrap(inst.spacer, inst.el);
      el.classList.remove("emerge-scene", "emerge-scene-static", "emerge-scene-live");
      PRESETS.forEach((p) => el.classList.remove("emerge-scene-" + p));
      el.style.removeProperty("perspective");
      el.style.removeProperty("perspective-origin");
      el.style.removeProperty("position");
      el.style.removeProperty("top");
      el.style.removeProperty("--emerge-scene-progress");
      const t = inst.targets;
      t.panel &&
        (t.panel.classList.remove("emerge-scene-panel"),
        t.panel.style.removeProperty("opacity"),
        t.panel.style.removeProperty("transform"),
        t.panel.style.removeProperty("border-radius"),
        t.panel.style.removeProperty("clip-path"),
        t.panel.style.removeProperty("filter"));
      t.content &&
        (t.content.classList.remove("emerge-scene-content"),
        t.content.style.removeProperty("opacity"),
        t.content.style.removeProperty("scale"),
        t.content.style.removeProperty("transform"),
        t.content.style.removeProperty("filter"));
      t.cover &&
        (t.cover.classList.remove("emerge-scene-cover"), t.cover.style.removeProperty("opacity"));
      inst.layers.forEach(([n, a, b]) => {
        n.classList.remove(a, b);
        n.style.removeProperty("opacity");
      });
      core.release(el);
      t.panel && core.release(t.panel);
      instances.delete(el);
      return !0;
    }

    function scan(root) {
      (root || document).querySelectorAll("[data-emerge-scene]").forEach((el) => {
        instances.has(el) || build(el);
      });
    }
    function measureAll() {
      instances.forEach((inst) => measure(inst));
    }
    function destroyAll() {
      Array.from(instances.keys()).forEach(destroy);
    }

    return {
      name: "Scene",
      defaults: {
        sceneDistance: 1000,
        scenePerspective: 3000,
        sceneOrigin: "50% 78%",
        sceneTilt: 90,
        sceneScale: 0.44,
        sceneOffset: 27.7,
        sceneRadius: "5vw",
        sceneSmooth: 2,
      },
      install: (c) => (
        (core = c),
        Object.getOwnPropertyDescriptor(core, "range") ||
          Object.defineProperty(core, "range", {
            configurable: !0,
            get: () => (typeof Emerge != "undefined" ? Emerge.Range : void 0),
          }),
        {
          build,
          destroy,
          destroyAll,
          scan,
          measure: measureAll,
          of: (x) => instances.get(toEl(x)) || null,
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }) {
          core.hasAttr(el, "scene") && build(el);
        },
        init() {
          lastWidth = window.innerWidth;
          scan(document);
        },
        refresh({ reason }) {
          // cleanup: elementos removidos ou que passaram a/deixaram de estar
          // desativados (mudança de breakpoint → alterna pin <-> estático)
          const gone = [],
            rebuild = [];
          instances.forEach((inst, el) => {
            document.body.contains(el)
              ? core.isDisabledFor(el, "scene") !== inst.static && rebuild.push(el)
              : gone.push(el);
          });
          gone.forEach(destroy);
          rebuild.forEach((el) => {
            destroy(el);
            build(el);
          });
          scan(document);
          const w = window.innerWidth;
          instances.forEach((inst) => {
            if (inst.static) return;
            // Só a barra de endereço mobile mudou (largura igual, altura difere)?
            // O 100svh já absorve; basta re-medir o Range em vez de refazer tudo.
            reason === "resize" && w === lastWidth
              ? inst.range && inst.range.measure()
              : measure(inst);
          });
          lastWidth = w;
        },
        unobserve({ el }) {
          destroy(el);
        },
        teardown() {
          destroyAll();
        },
      },
    };
});
