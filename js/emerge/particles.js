/*! Emerge.js v1.7.2 — plugin Particles (global: EmergeParticles) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeParticles = d());
  })(this, function () {
    "use strict";
    // Particles — o texto transforma-se em LETRAS NÍTIDAS feitas de muitas
    // partículas pequenas, redondas e macias, com alguns acentos luminosos e
    // um halo discreto (v1.7.2). A legibilidade em repouso é prioritária: a
    // estética de nuvem é um ACENTO sobre uma base legível, nunca a
    // população principal. Marcação: data-emerge-particles no elemento
    // ("repel" | "attract" | "swirl"; vazio = repel). O texto é amostrado
    // para um canvas colocado por cima; o ponteiro dispersa as partículas,
    // que regressam ao lugar em ondas suaves.
    //
    // Três CAMADAS com orçamentos fixos (fração do total de partículas):
    //   • CORPO (≥ ~80%) — define as letras: denso, pequeno e quase
    //     uniforme (tamanho 0,8×..1,3× o base, alpha 0,6..1, nunca abaixo
    //     de 0,45). Desenhado sempre em source-over, para a forma nunca
    //     saturar para branco.
    //   • ACENTOS (~6%..12%) — maiores (até ~2× o base) e mais brilhantes,
    //     com glow aditivo: é aqui que vive a profundidade e o aspeto de
    //     "luzes" da referência.
    //   • HALO (~4%..10%) — poeira pequena e pouco opaca, com desvio máximo
    //     ~0,28× a altura da fonte, que só nasce JUNTO aos contornos: a
    //     posição candidata é testada contra a máscara amostrada (a
    //     vizinhança imediata tem de ter tinta), por isso nunca aparece
    //     dentro dos contadores (o interior de a, o, ç, ã) nem no espaço
    //     entre palavras. O halo conta para o teto.
    // O `depth` passa a modular sobretudo os ACENTOS e só ligeiramente o
    // corpo — nada de partículas "de fundo" quase invisíveis: o z deixou de
    // ser enviesado para longe.
    //
    // Amostragem consciente da forma: a espessura de traço é ESTIMADA a
    // partir da máscara (razão área/perímetro) e o espaçamento automático
    // passa a ter isso em conta (≥ ~5 partículas a atravessar o traço, sem
    // ultrapassar o teto). O tamanho de cada partícula é limitado pela
    // espessura: corpo ≤ ~0,4× o traço, acentos ≤ ~0,9× — nenhuma partícula
    // do corpo é mais larga que o traço, mesmo em fontes finas. A
    // `density` (<1) só rarefaz o INTERIOR dos traços grossos; as BORDAS
    // (píxeis com vizinhos sem tinta) mantêm sempre densidade total, para
    // os contornos ficarem contínuos. A amostragem é estratificada com
    // `jitter` limitado a ½ célula (quebra a grelha sem criar buracos) e o
    // aleatório vem de um gerador com SEMENTE por elemento (`seed`): voltar
    // a amostrar no resize não "treme". Ao passar o teto `max`, a redução
    // segue a ordem: primeiro o halo, depois os acentos, depois a densidade
    // do interior — as bordas nunca.
    //
    // Escala adaptativa: as intensidades escalam com o tamanho da fonte,
    // k = clamp((fs − 24) / 72, 0, 1) — abaixo de ~32 px quase só corpo
    // nítido; a partir de ~96 px o efeito completo (acentos, halo e depth
    // multiplicados por k).
    //
    // Presets: data-emerge-particles-look = "legible" (NOVO PADRÃO: o
    // equilíbrio descrito acima) | "cloud" (o aspeto esparso da nuvem — só
    // é legível em fontes grandes e a negrito) | "grid" (grelha original,
    // sem camadas nem luz). A opção `contrast` (0..1, padrão 0.8) empurra o
    // equilíbrio: 1 = mais corpo e menos efeitos; 0 = mais nuvem. As opções
    // individuais (density, depth, halo, drift, jitter…) definidas no
    // elemento/token/global GANHAM ao preset.
    //
    // Forma e luz: shape="soft" (padrão) desenha círculos com gradiente
    // radial (núcleo claro, borda difusa); "circle" é o círculo duro e
    // "square" mantém o quadradinho. Todos os sprites são PRÉ-DESENHADOS e
    // ficam em cache por cor × balde de tamanho (8) × balde de brilho (3) —
    // nenhum arc() nem gradiente por partícula por frame. O glow aditivo
    // ("lighter") aplica-se SÓ aos acentos (com alpha limitado para a cor
    // nunca saturar); o corpo e o halo são sempre source-over. Em fundos
    // claros a mistura aditiva não funciona: em glow="auto" o plugin detecta
    // a luminância do fundo e usa source-over com uma sombra suave cozida
    // nos sprites.
    //
    // Cores (data-emerge-particles-color / token --emerge-particles-color /
    // opção global particlesColor): "text" ou vazio = cor calculada do texto
    // (spans com cores diferentes mantêm-se); uma cor CSS; uma paleta
    // separada por vírgulas (com pesos opcionais em `color-weights`);
    // "random" = HSL aleatório por partícula dentro de `random-hue`,
    // `random-sat` e `random-light`, quantizado em ≤24 cores; e
    // "gradient(#a,#b,…)" interpolado ao longo do texto (eixo horizontal;
    // `color-angle` em graus). `color-jitter` (0..1) varia matiz,
    // saturação e luminosidade à volta da cor base. `random="build|
    // resample|interval:N"` decide quando nasce uma cor aleatória nova: só
    // na construção (padrão, com semente), a cada nova amostragem, ou a cada
    // N segundos com uma transição suave (crossfade de ~0,9 s). As
    // partículas ficam agrupadas por cor E camada para mudar de sprite/
    // fillStyle o menor número de vezes por frame.
    //
    // Vida: `drift` é uma flutuação subtil permanente — fase e frequência
    // próprias por partícula, sem ruído de Perlin. A amplitude do CORPO é
    // limitada a ~0,25× o espaçamento (máx. ~0,6 px) para o contorno não
    // vazar; acentos e halo podem flutuar mais. Com drift > 0 o motor não
    // adormece enquanto o elemento está visível, mas desacelera para
    // ~30 fps; pára fora do viewport, com o separador escondido e com
    // prefers-reduced-motion (drift="0" repõe o adormecer). A rigidez da
    // mola, o atrito e o atraso de regresso variam ligeiramente por
    // partícula: o regresso acontece em ondas, não em bloco.
    //
    // Dinâmica nítido/aéreo: em repouso acentos e halo ficam discretos; ao
    // interagir (ponteiro, disperse) ganham energia e brilho — uma factor
    // interno "energy" sobe depressa e desce devagar — e voltam ao normal
    // quando as partículas assentam (evento emerge:particles:settle).
    //
    // Medida de legibilidade: Emerge.Particles.legibility(el, {dpr}) rende o
    // estado assente, compara-o com a máscara de referência do texto (ambas
    // ligeiramente desfocadas) e devolve {score, ncc, spill, …} — score 0..1
    // (correlação normalizada com penalização da tinta fora da forma). O
    // preset "legible" com os defaults deve pontuar ≥ 0,75.
    //
    // Estruturas: Float32Array (posição, casa, velocidade, z, fase, rigidez,
    // atraso) + Uint8Array (alpha, baldes, camada, flags) + Uint16Array
    // (índice de cor) — nenhum objeto por partícula. DPR limitado a 2. A
    // amostragem espera document.fonts.ready e repete-se no resize (com
    // debounce, via hooks.refresh do core) e quando a largura/altura do
    // elemento muda.
    //
    // Física: mola até à casa (constante (2π/return)², sub-amortecida para o
    // regresso "elástico") + atrito exponencial estável em qualquer dt +
    // força do ponteiro com queda quadrática dentro do radius (repel empurra,
    // attract puxa, swirl acrescenta a componente tangencial). O passo de
    // tempo é limitado (dt ≤ 64 ms) e a constante da mola é travada em
    // frames lentos (a integração é sempre estável).
    //
    // Motor: UM único rAF partilhado por todas as instâncias, que só corre
    // enquanto há algo a animar e adormece quando todas as partículas
    // assentam e o ponteiro saiu (padrão do Spotlight/Magnetic: primeiro
    // TODAS as leituras de layout, depois TODAS as escritas). Instâncias
    // fora do viewport não gastam frames (IntersectionObserver próprio e
    // partilhado).
    //
    // Acessibilidade: o texto real fica no DOM — o plugin escreve
    // `color: transparent` (inline, e nunca display: none) apenas nos
    // elementos que contêm o texto amostrado, por isso continua selecionável,
    // pesquisável e lido por leitores de ecrã; a cor original é reposta no
    // destroy e antes da impressão. Com prefers-reduced-motion, isDisabledFor,
    // sem JS ou sem suporte a canvas: texto normal, sem canvas e sem
    // alterações de layout.
    //
    // Toque: só Pointer Events (sem listeners de mouse/touch duplicados). O
    // touch-action vive no CSS (uma classe por modo, ao estilo do
    // data-emerge-spotlight-touch) e aplica-se só ao host. Nenhum
    // preventDefault: links, botões e controlos de formulário dentro do host
    // continuam a funcionar e o scroll nunca fica bloqueado por omissão
    // (pan-y por omissão: o scroll vertical continua e o toque dispersa as
    // partículas).
    //
    // Integração: coexiste com data-emerge no mesmo elemento — só se
    // "reclama" (core.claim) quem não está no pipeline do core, e nenhum
    // estilo inline do plugin toca no próprio host além da cor (o canvas é
    // um filho), por isso o estado inicial .emerge-init do core não é
    // anulado. NÃO combinar com data-emerge-split (plugin Text) no mesmo
    // elemento: o build recusa e avisa em modo debug. O observer do core só
    // vigia nós [data-emerge], por isso o Particles mantém UM observer
    // próprio e partilhado (padrão do Spotlight/Magnetic), que respeita
    // disableMutationObserver e ignora os nós .emerge-word e .emerge-part.
    // Sem will-change (o canvas redesenha-se por si; nada é transformado por
    // CSS). Prioridade das opções: atributo no elemento > token CSS
    // (--emerge-particles-*) > opção global do Emerge.init > preset
    // (look + contrast) > default do plugin (o mesmo critério dos outros
    // plugins).
    let core = null;
    const instances = new Map(), // el -> instância
      HOST = "[data-emerge-particles]",
      MODES = ["repel", "attract", "swirl"],
      SHAPES = ["soft", "circle", "square"],
      GLOWS = ["auto", "on", "off"],
      TOUCH_MODES = ["pan-y", "track", "scroll", "off"],
      INTROS = ["none", "assemble"],
      LOOKS = ["legible", "cloud", "grid"],
      SB = 8, // baldes de tamanho dos sprites (0,45×..2× o tamanho base)
      BR = 3, // baldes de brilho (a alpha fina fica para o globalAlpha)
      SPR_FACTORS = [0.45, 0.65, 0.85, 1.05, 1.25, 1.5, 1.75, 2],
      GRAD_STEPS = 24, // cores quantizadas do gradient() e do random
      // perfis do equilíbrio corpo↔nuvem: [nuvem (contrast 0), corpo
      // (contrast 1)] — o look escolhe o contrast por omissão e as opções
      // explícitas ganham sempre ao blend
      PROFILE = {
        density: [0.55, 0.95],
        depth: [0.75, 0.3],
        halo: [0.3, 0.1],
        drift: [1.6, 0.3],
        jitter: [0.85, 0.45],
      },
      // orçamentos das camadas (fração do corpo): acentos 6%..12%, halo
      // limitado a 10% do total — a "nuvem" é um acento, nunca a população
      ACC_FRAC = [0.06, 0.06], // + 0.06 × depthEff (limitado a 12%)
      HALO_CAP = 0.1, // teto do halo em fração do total
      // nós gerados pelo plugin Text (split) — nunca amostrados nem observados
      SPLIT_NODES = ".emerge-word, .emerge-part",
      // classe de estado nos elementos que contêm o texto amostrado
      TEXT_CLASS = "emerge-particles-text";
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const toEl = (x) => (typeof x == "string" ? document.querySelector(x) : x);
    // Detecção de suporte: canvas 2D (o resto degrada para o texto normal,
    // sem canvas e sem alterações de layout).
    const canParticles =
      typeof window != "undefined" &&
      typeof document != "undefined" &&
      (function () {
        try {
          const c = document.createElement("canvas");
          return !!(c.getContext && c.getContext("2d"));
        } catch (e) {
          return !1;
        }
      })();

    /* ---- Opções: atributo no elemento > token CSS > global > preset > default ---- */

    function cssToken(el, name) {
      try {
        const v = getComputedStyle(el)
          .getPropertyValue("--emerge-particles-" + name)
          .trim();
        return v === "" ? null : v;
      } catch (e) {
        return null;
      }
    }

    function globalOption(key) {
      const g = core.options[key];
      return g === null || g === undefined || g === "" ? null : g;
    }

    function numOption(el, name, key, fallback) {
      if (core.hasAttr(el, "particles-" + name)) {
        const n = Number(String(core.attr(el, "particles-" + name, "")).trim());
        if (!Number.isNaN(n)) return n;
      }
      const t = parseFloat(cssToken(el, name));
      if (!Number.isNaN(t)) return t;
      const g = globalOption(key);
      if (g !== null) {
        const n = Number(g);
        if (!Number.isNaN(n)) return n;
      }
      return fallback;
    }

    // a opção foi DEFINIDA em algum canal (attr/token/global)? — serve para
    // as opções do preset: definidas, ganham; sem definir, vêm do blend do
    // look com o contrast
    function optSet(el, name, key) {
      if (core.hasAttr(el, "particles-" + name)) return !0;
      const t = cssToken(el, name);
      if (t !== null && t !== "" && !Number.isNaN(parseFloat(t))) return !0;
      const g = globalOption(key);
      return (
        g !== null &&
        g !== undefined &&
        g !== "" &&
        !Number.isNaN(Number(String(g).trim()))
      );
    }

    function strOption(el, name, key, fallback) {
      if (core.hasAttr(el, "particles-" + name)) {
        const v = String(core.attr(el, "particles-" + name, "")).trim();
        if (v !== "") return v;
      }
      const t = cssToken(el, name);
      if (t !== null && t !== "") return t;
      const g = globalOption(key);
      if (g !== null && String(g).trim() !== "") return String(g).trim();
      return fallback;
    }

    function choiceOption(el, name, key, fallback, list) {
      const v = strOption(el, name, key, fallback).toLowerCase();
      return list.indexOf(v) < 0 ? fallback : v;
    }

    function resolveOptions(el) {
      // o valor do atributo principal É o modo ("" = default)
      const raw = el.getAttribute("data-emerge-particles");
      const mode =
        raw !== null && String(raw).trim() !== ""
          ? String(raw).trim().toLowerCase()
          : choiceOption(el, "mode", "particlesMode", "repel", MODES);
      const sampling = choiceOption(el, "sampling", "particlesSampling", "organic", [
        "organic",
        "grid",
      ]);
      // look: legible (novo padrão) | cloud | grid; sampling="grid" força
      // look="grid" (compatibilidade com a v1.7.1)
      let look = strOption(el, "look", "particlesLook", "").toLowerCase();
      if (LOOKS.indexOf(look) < 0) look = "";
      if (sampling === "grid") look = "grid";
      if (!look) look = "legible";
      // contrast: 1 = mais corpo e menos efeitos, 0 = mais nuvem. Sem valor
      // explícito, cada look traz o seu por omissão.
      const contrast = optSet(el, "contrast", "particlesContrast")
        ? clamp(numOption(el, "contrast", "particlesContrast", 0.8), 0, 1)
        : look === "cloud"
          ? 0.15
          : look === "grid"
            ? 1
            : 0.8;
      // tunáveis do preset: definidos explicitamente ganham; sem definir,
      // interpolam entre o perfil "nuvem" (contrast 0) e o "corpo" (1)
      const blend = (name, key, lo, hi) =>
        optSet(el, name, key)
          ? numOption(el, name, key, (lo + hi) / 2)
          : lo + (hi - lo) * contrast;
      const o = {
        mode: MODES.indexOf(mode) < 0 ? "repel" : mode,
        sampling: look === "grid" ? "grid" : sampling,
        look,
        contrast,
        // gap/size/color/max/seed vazios = automáticos (resolvidos na amostragem)
        gap: numOption(el, "gap", "particlesGap", 0),
        size: numOption(el, "size", "particlesSize", 0),
        shape: choiceOption(el, "shape", "particlesShape", "soft", SHAPES),
        color: strOption(el, "color", "particlesColor", ""),
        colorJitter: clamp(numOption(el, "color-jitter", "particlesColorJitter", 0.3), 0, 1),
        colorAngle: numOption(el, "color-angle", "particlesColorAngle", 0),
        colorWeights: strOption(el, "color-weights", "particlesColorWeights", ""),
        random: strOption(el, "random", "particlesRandom", "build"),
        randomHue: strOption(el, "random-hue", "particlesRandomHue", "0-360"),
        randomSat: strOption(el, "random-sat", "particlesRandomSat", "65-95"),
        randomLight: strOption(el, "random-light", "particlesRandomLight", "55-80"),
        seed: numOption(el, "seed", "particlesSeed", 0),
        density: clamp(blend("density", "particlesDensity", PROFILE.density[0], PROFILE.density[1]), 0.1, 1),
        depth: clamp(blend("depth", "particlesDepth", PROFILE.depth[0], PROFILE.depth[1]), 0, 1),
        halo: clamp(blend("halo", "particlesHalo", PROFILE.halo[0], PROFILE.halo[1]), 0, 1),
        glow: choiceOption(el, "glow", "particlesGlow", "auto", GLOWS),
        jitter: clamp(blend("jitter", "particlesJitter", PROFILE.jitter[0], PROFILE.jitter[1]), 0, 1),
        drift: Math.max(0, blend("drift", "particlesDrift", PROFILE.drift[0], PROFILE.drift[1])),
        radius: Math.max(1, numOption(el, "radius", "particlesRadius", 100)),
        strength: numOption(el, "strength", "particlesStrength", 1),
        return: Math.max(0.05, numOption(el, "return", "particlesReturn", 1)),
        friction: clamp(
          numOption(el, "friction", "particlesFriction", 0.92),
          0.05,
          0.999,
        ),
        intro: choiceOption(el, "intro", "particlesIntro", "none", INTROS),
        max: Math.round(numOption(el, "max", "particlesMax", 0)),
        touch: choiceOption(el, "touch", "particlesTouch", "pan-y", TOUCH_MODES),
        debug: !!core.attr(el, "debug", !1), // padrão Range: data-emerge-debug
      };
      // look="grid" repõe o comportamento antigo: grelha regular, sem
      // profundidade, sem halo, sem jitter, sem drift e densidade cheia —
      // só a aparência escolhida (shape, cor…) é que fica.
      if (look === "grid") {
        o.sampling = "grid";
        o.depth = 0;
        o.halo = 0;
        o.jitter = 0;
        o.drift = 0;
        o.density = 1;
      }
      return o;
    }

    /* ---- Gerador pseudoaleatório com semente ------------------------------- */

    // mulberry32: pequeno, rápido e determinístico — a MESMA semente devolve
    // a MESMA sequência, por isso voltar a amostrar no resize não "treme".
    function mulberry32(a) {
      return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // gaussiana padrão (Box-Muller) a partir do gerador com semente — serve
    // para o desvio das partículas do halo
    function gauss(rnd) {
      const u = Math.max(1e-9, rnd());
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
    }

    /* ---- Motor partilhado ------------------------------------------------ */

    const running = new Set(); // instâncias no motor (activas ou a regressar)
    let rafId = 0,
      lastTime = 0,
      lastSlow = 0; // cadência reduzida do drift (~30 fps)
    const ptr = { x: 0, y: 0, has: !1, touch: !1 };

    // Um ciclo para todas as instâncias: primeiro TODAS as leituras de layout
    // pendentes, depois TODAS as escritas (canvas).
    function frame(now) {
      rafId = 0;
      // passo de tempo limitado: sem saltos ao voltar ao separador
      const dt = lastTime ? Math.min(now - lastTime, 64) : 16.7;
      lastTime = now;
      instances.forEach((inst) => inst.dirty && inst.measure());
      // drift: com reduced-motion o flutuar pára (a instância torna a adormecer)
      const rm = core.options.respectReducedMotion && core.prefersReducedMotion();
      let disturbed = !1;
      running.forEach((inst) => {
        inst.driftAmp = rm ? 0 : inst.opts.drift > 0 ? inst.opts.drift : 0;
        if (inst.disturbed) disturbed = !0;
      });
      // Só o drift vivo → cadência reduzida (~30 fps): o rAF continua, mas o
      // passo físico só corre a cada ~30 ms. Nada distinguido → passo normal.
      if (!disturbed && now - lastSlow < 30) {
        rafId = requestAnimationFrame(frame);
        return;
      }
      lastSlow = now;
      running.forEach((inst) => {
        inst.step(dt, now) || running.delete(inst);
      });
      if (running.size) rafId = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    function kick() {
      if (!rafId && instances.size) rafId = requestAnimationFrame(frame);
    }

    function wake(inst) {
      if (inst.dead) return;
      running.add(inst);
      kick();
    }

    /* ---- Ponteiro (só Pointer Events, ao estilo do Magnetic) -------------- */

    function onMove(e) {
      ptr.touch = e.pointerType === "touch";
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.has = !0;
      // acorda as instâncias vizinhas; se nada for influenciado, tornam a
      // adormecer no primeiro passo (custo: um frame)
      instances.forEach((inst) => {
        inst.nearPointer() && wake(inst);
      });
    }

    function onOut(e) {
      e.relatedTarget || onLeave();
    }

    function onLeave() {
      ptr.has = !1; // as partículas regressam sós (a mola segue no motor)
    }

    // Mover a página sob um ponteiro parado muda as coordenadas locais.
    function onScroll() {
      if (!ptr.has || !instances.size) return;
      instances.forEach((inst) => {
        inst.nearPointer() && ((inst.dirty = !0), wake(inst));
      });
    }

    /* ---- Impressão: o texto real volta (o canvas não imprime bem) --------- */

    function onBeforePrint() {
      instances.forEach((inst) => inst.hideInk(!1));
    }

    function onAfterPrint() {
      instances.forEach((inst) => inst.hideInk(!0));
    }

    /* ---- Ligação partilhada ------------------------------------------------ */

    let sharedOn = !1;

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
      window.addEventListener("beforeprint", onBeforePrint);
      window.addEventListener("afterprint", onAfterPrint);
      document.addEventListener("emerge:in", onCoreIn, !0);
      document.fonts &&
        typeof document.fonts.addEventListener == "function" &&
        document.fonts.addEventListener("loadingdone", onFontsDone);
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
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.removeEventListener("emerge:in", onCoreIn, !0);
      document.fonts &&
        typeof document.fonts.removeEventListener == "function" &&
        document.fonts.removeEventListener("loadingdone", onFontsDone);
    }

    // intro="assemble": sincronizado com o evento emerge:in do core (quando o
    // host também tem data-emerge). Para hosts fora do pipeline do core serve
    // o IntersectionObserver próprio (ver inst.onEnter).
    function onCoreIn(e) {
      const inst = e.detail && instances.get(e.detail);
      inst && inst.opts.intro === "assemble" && inst.assembleNow();
    }

    // uma fonte terminou de carregar: o texto pode ter mudado de feitio
    let fontsTimer = 0;
    function onFontsDone() {
      clearTimeout(fontsTimer);
      fontsTimer = setTimeout(() => {
        instances.forEach((inst) => inst.sampled && inst.resample());
      }, 120);
    }

    /* ---- Visibilidade (IntersectionObserver próprio e partilhado) ---------- */

    let io = null;

    function watchVisibility() {
      if (io || typeof IntersectionObserver == "undefined") return;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            const inst = instances.get(en.target);
            if (!inst) return;
            inst.visible = en.isIntersecting;
            en.isIntersecting && inst.onEnter();
          });
        },
        { rootMargin: "80px 0px", threshold: 0 },
      );
    }

    /* ---- Observer próprio (elementos dinâmicos) ----------------------------- */

    let observer = null;
    const resampleTimers = new Map();

    // O core só vigia nós [data-emerge] — o Particles mantém UM observer
    // próprio e partilhado (padrão do Spotlight/Magnetic), respeitando
    // disableMutationObserver, para gerir adições/remoções dinâmicas e
    // re-amostrar hosts cujo texto mudou. Ignora os nós do plugin Text.
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

    function scheduleResample(el) {
      const inst = instances.get(el);
      if (!inst || inst.dead || !inst.sampled || resampleTimers.has(el)) return;
      resampleTimers.set(
        el,
        setTimeout(() => {
          resampleTimers.delete(el);
          inst.el.isConnected && inst.resample();
        }, 120),
      );
    }

    function onAdded(node) {
      if (node.nodeType !== 1 || !node.matches) return;
      // canvas próprio e nós do split (Text) não são marcação do Particles
      if (
        node.classList.contains("emerge-particles-canvas") ||
        node.matches(SPLIT_NODES)
      )
        return;
      node.matches(HOST) && build(node);
      node.querySelectorAll &&
        node.querySelectorAll(HOST).forEach((n) => {
          instances.has(n) || build(n);
        });
      // conteúdo adicionado dentro de um host existente → nova amostragem
      const host = node.closest(HOST);
      host && instances.has(host) && scheduleResample(host);
    }

    function onMutations(recs) {
      let touched = null;
      for (const rec of recs) {
        rec.addedNodes.forEach(onAdded);
        // texto/elementos mudados dentro de um host → re-amostrar esse host
        const t = rec.target;
        const root =
          t && t.nodeType === 1
            ? t
            : t && t.parentElement
              ? t.parentElement
              : null;
        const host = root && root.closest && root.closest(HOST);
        if (host && instances.has(host))
          (touched = touched || new Set()).add(host);
      }
      // Hosts que saíram do documento (após o loop, para nós apenas movidos
      // não serem destruídos e recriados — padrão do Spotlight).
      instances.forEach((inst, el) => {
        el.isConnected || destroy(el);
      });
      touched && touched.forEach(scheduleResample);
    }

    /* ---- Amostragem ---------------------------------------------------------- */

    // alpha de uma cor CSS qualquer (inclui oklch/lab): prova num canvas 1×1
    // (criado à primeira utilização — o módulo tem de carregar sem DOM, SSR)
    let probe = null;
    function probeCtx() {
      try {
        probe || (probe = document.createElement("canvas").getContext("2d"));
        return probe;
      } catch (e) {
        return null;
      }
    }

    function alphaOf(color) {
      const c = probeCtx();
      if (!c) return 255;
      try {
        c.clearRect(0, 0, 1, 1);
        c.fillStyle = color;
        c.fillRect(0, 0, 1, 1);
        return c.getImageData(0, 0, 1, 1).data[3];
      } catch (e) {
        return 255;
      }
    }

    // cor CSS qualquer → [r,g,b] 0..255. Em vez de confiar na serialização
    // do fillStyle (que varia entre hex/rgb()/hsl()/color()…), pinta a cor
    // num píxel de prova e lê-o com getImageData — a verdade do canvas.
    // Invalidade detetada com DUAS sentinelas (uma cor inválida deixa o
    // píxel anterior; uma válida nunca coincide com ambas).
    function cssToRgb(color) {
      const c = probeCtx();
      if (!c) return null;
      try {
        c.clearRect(0, 0, 1, 1);
        c.fillStyle = "#123456";
        c.fillRect(0, 0, 1, 1);
        const ref = c.getImageData(0, 0, 1, 1).data;
        c.fillStyle = color;
        c.fillRect(0, 0, 1, 1);
        let d = c.getImageData(0, 0, 1, 1).data;
        if (
          d[0] === ref[0] &&
          d[1] === ref[1] &&
          d[2] === ref[2] &&
          d[3] === ref[3]
        ) {
          // pode ser inválida — segunda sentinela para confirmar
          c.fillStyle = "#654321";
          c.fillRect(0, 0, 1, 1);
          const ref2 = c.getImageData(0, 0, 1, 1).data;
          c.fillStyle = color;
          c.fillRect(0, 0, 1, 1);
          d = c.getImageData(0, 0, 1, 1).data;
          if (
            d[0] === ref2[0] &&
            d[1] === ref2[1] &&
            d[2] === ref2[2] &&
            d[3] === ref2[3]
          )
            return null; // inválida (não pintou)
        }
        if (d[3] === 0) return null; // válida mas totalmente transparente
        return [d[0], d[1], d[2]];
      } catch (e) {}
      return null;
    }

    /* ---- Conversões HSL (para color-jitter e random) ------------------------ */

    function hsl2rgb(h, s, l) {
      h = ((h % 360) + 360) % 360;
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      return [
        Math.round(255 * f(0)),
        Math.round(255 * f(8)),
        Math.round(255 * f(4)),
      ];
    }

    function rgb2hsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const mx = Math.max(r, g, b),
        mn = Math.min(r, g, b);
      const l = (mx + mn) / 2;
      let h = 0,
        s = 0;
      if (mx !== mn) {
        const dd = mx - mn;
        s = dd / (1 - Math.abs(2 * l - 1));
        if (mx === r) h = 60 * (((g - b) / dd) % 6);
        else if (mx === g) h = 60 * ((b - r) / dd + 2);
        else h = 60 * ((r - g) / dd + 4);
      }
      return [((h % 360) + 360) % 360, s * 100, l * 100];
    }

    // "100-160" | "160" → [a, b]; inválido → [defA, defB]
    function parseRange(v, defA, defB) {
      const m = /^\s*(-?\d+(?:\.\d+)?)\s*(?:-\s*(-?\d+(?:\.\d+)?))?\s*$/.exec(
        String(v),
      );
      if (!m) return [defA, defB];
      const a = Number(m[1]);
      return [a, m[2] === undefined ? a : Number(m[2])];
    }

    // variante quantizada de uma cor base: matiz/saturação/luminosidade
    // desviam até `j` (0..1). A referência visual usa 1 matiz com variação de
    // luminosidade, por isso o desvio de matiz é o mais estreito dos três.
    function jitterColor(rgb, rnd, j) {
      const hsl = rgb2hsl(rgb[0], rgb[1], rgb[2]);
      const h = hsl[0] + (rnd() - 0.5) * 56 * j;
      const s = clamp(hsl[1] * (1 + (rnd() - 0.5) * 0.6 * j), 0, 100);
      const l = clamp(hsl[2] * (1 + (rnd() - 0.5) * 0.85 * j), 4, 96);
      return hsl2rgb(h, s, l);
    }

    // interpolação linear numa lista de paragens [[r,g,b]…], t 0..1
    function sampleStops(stops, t) {
      const m = stops.length - 1;
      const x = clamp(t, 0, 1) * m;
      const k = Math.min(m - 1, Math.floor(x));
      const f = x - k;
      const a = stops[k],
        b = stops[k + 1];
      return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
      ];
    }

    // especificação da opção color → {kind: text|single|palette|random|
    // gradient, colors?} — a validação das cores fica para o applyColors
    // O split respeita parênteses: "rgb(255,0,0),#fff" são DUAS cores, não
    // três fragmentos partidos dentro de rgb()
    function splitColors(s) {
      const out = [];
      let depth = 0,
        cur = "";
      for (const ch of s) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
          out.push(cur.trim());
          cur = "";
        } else cur += ch;
      }
      if (cur.trim() !== "" || out.length) out.push(cur.trim());
      return out.filter(Boolean);
    }

    function parseColorSpec(v) {
      const s = String(v == null ? "" : v).trim();
      const low = s.toLowerCase();
      if (s === "" || low === "text") return { kind: "text" };
      if (low === "random") return { kind: "random" };
      const mg = /^gradient\s*\((.*)\)$/i.exec(s);
      if (mg)
        return { kind: "gradient", colors: splitColors(mg[1]) };
      const parts = splitColors(s);
      return parts.length > 1
        ? { kind: "palette", colors: parts }
        : { kind: "single", colors: parts };
    }

    // luminância do primeiro fundo opaco do elemento para cima — decide se a
    // mistura aditiva é segura (fundo escuro) ou tem de cair para source-over
    // com sombra (fundo claro)
    function bgLumaOf(el) {
      let n = el;
      for (let i = 0; n && n.nodeType === 1 && i < 10; i++) {
        let bg = "";
        try {
          bg = getComputedStyle(n).backgroundColor;
        } catch (e) {
          return 0;
        }
        const m = /rgba?\(([^)]+)\)/.exec(bg);
        if (m) {
          const p = m[1].split(/[\s,/]+/).map(Number);
          const a = p.length > 3 ? p[3] : 1;
          if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite) && a > 0.05)
            return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
        }
        n = n.parentElement;
      }
      return 0; // transparente até ao topo: assume-se escuro
    }

    /* ---- Fragmentos de texto (posições fiéis ao CSS) ------------------------ */

    function applyTransform(text, tt) {
      if (tt === "uppercase") return text.toUpperCase();
      if (tt === "lowercase") return text.toLowerCase();
      if (tt === "capitalize")
        return text.replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase());
      return text;
    }

    // fragmentos de um nó de texto: [{ text, rect, perChar }] — a posição de
    // cada palavra vem de Range + getClientRects() (multilinha, text-align e
    // spans com cores diferentes funcionam sem alterar o DOM)
    function fragmentsFor(node) {
      const text = node.nodeValue;
      const parent = node.parentElement;
      if (!text || !text.trim() || !parent) return [];
      if (parent.closest(SPLIT_NODES) || parent.closest("svg")) return [];
      let cs;
      try {
        cs = getComputedStyle(parent);
      } catch (e) {
        return [];
      }
      if (cs.display === "none" || cs.visibility === "hidden") return [];
      const tt = cs.textTransform;
      const tokens = text.match(/\S+|\s+/g) || [];
      const out = [];
      let offset = 0;
      for (const token of tokens) {
        const start = offset;
        offset += token.length;
        if (!token.trim()) continue; // espaços não têm tinta
        const word = applyTransform(token, tt);
        const range = document.createRange();
        try {
          range.setStart(node, start);
          range.setEnd(node, start + token.length);
        } catch (e) {
          continue;
        }
        const rects = range.getClientRects();
        if (!rects.length) continue;
        if (rects.length === 1) {
          out.push({ text: word, rect: rects[0], perChar: !1 });
        } else {
          // palavra partida pelo wrap (overflow-wrap/hífen): desenha
          // carácter a carácter nas rect exactas, sem letter-spacing
          for (let i = 0; i < token.length; i++) {
            try {
              range.setStart(node, start + i);
              range.setEnd(node, start + i + 1);
            } catch (e) {
              continue;
            }
            const cr = range.getClientRects();
            cr.length &&
              out.push({
                text: applyTransform(token[i], tt),
                rect: cr[0],
                perChar: !0,
              });
          }
        }
      }
      return out;
    }

    function autoGap(el, dpr, org) {
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      // ecrãs densos representam melhor amostragem mais fina; no modo nuvem
      // a amostragem é mais larga (o look cloud é esparso por desígnio — só
      // é legível em fontes grandes e a negrito)
      const k = org ? (dpr >= 2 ? 22 : 16) : dpr >= 2 ? 16 : 11;
      return clamp(Math.round(fs / k), 2, 10);
    }

    // varre a imagem amostrada e devolve [x, y, r, g, b, a, …] em px de
    // dispositivo — o caminho antigo (look="grid"): grelha regular, corte em
    // ordem de varrimento ao passar do teto, sem camadas nem halo.
    function collectPoints(data, cw, ch, step, cap) {
      const out = [];
      for (let py = 0; py < ch; py += step) {
        for (let px = 0; px < cw; px += step) {
          const xi = px < cw - 1 ? px : cw - 1;
          const yi = py < ch - 1 ? py : ch - 1;
          const o = (yi * cw + xi) * 4;
          if (data[o + 3] < 120) continue; // só tinta
          out.push(px, py, data[o], data[o + 1], data[o + 2], data[o + 3]);
          if (out.length >= cap * 6) return out;
        }
      }
      return out;
    }

    // recolha ORGÂNICA consciente da forma: grelha estratificada com jitter
    // limitado a ½ célula (quebra a grelha sem criar buracos) e DETECÇÃO DE
    // BORDA — cada ponto fica marcado como borda (vizinhos sem tinta a ~½
    // célula) ou interior; as bordas nunca são rarefeitas, por isso os
    // contornos das letras ficam contínuos. Devolve {pts, edge}.
    function collectOrganic(data, cw, ch, step, cap, rnd, jitter) {
      const jmax = step * Math.min(jitter, 0.5); // ≤ ½ célula (B)
      const nb = Math.max(1, step >> 1); // raio do teste de borda
      const pts = [];
      const edge = [];
      const aAt = (x, y) => data[(y * cw + x) * 4 + 3];
      for (let py = 0; py < ch; py += step) {
        for (let px = 0; px < cw; px += step) {
          const sx = px + rnd() * jmax;
          const sy = py + rnd() * jmax;
          const xi = sx < cw - 1 ? sx | 0 : cw - 1;
          const yi = sy < ch - 1 ? sy | 0 : ch - 1;
          const o = (yi * cw + xi) * 4;
          if (data[o + 3] < 120) continue; // só tinta
          const xl = xi - nb < 0,
            xr = xi + nb >= cw,
            yt = yi - nb < 0,
            yb = yi + nb >= ch;
          const isEdge =
            (!xl && aAt(xi - nb, yi) < 120) ||
            (!xr && aAt(xi + nb, yi) < 120) ||
            (!yt && aAt(xi, yi - nb) < 120) ||
            (!yb && aAt(xi, yi + nb) < 120);
          pts.push(sx, sy, data[o], data[o + 1], data[o + 2], data[o + 3]);
          edge.push(isEdge ? 1 : 0);
          if (pts.length >= cap * 6) return { pts, edge }; // guarda de memória
        }
      }
      return { pts, edge };
    }

    // rarefação que preserva a forma: a `density` (<1) só largura pontos do
    // INTERIOR; as bordas mantêm SEMPRE densidade total (contornos
    // contínuos). Reescreve os arrays no próprio sítio (sem memória nova).
    function rarefyInterior(pts, edge, n, density, rnd) {
      if (density >= 1 || n <= 32) return n;
      let m = 0;
      for (let i = 0; i < n; i++) {
        // borda fica sempre; interior larga com probabilidade (1 - density)
        if (!edge[i] && rnd() > density) continue;
        if (m !== i) {
          const a = m * 6,
            b = i * 6;
          for (let k = 0; k < 6; k++) pts[a + k] = pts[b + k];
          edge[m] = edge[i];
        }
        m++;
      }
      return m;
    }

    // teto com proteção: reduz primeiro o INTERIOR (aceitação sequencial —
    // uniforme e determinística com a semente); as bordas só se for
    // impossível caber (teto < nº de bordas) — nunca em ordem de varrimento,
    // que apagava o fundo do texto. Reescreve os arrays no próprio sítio.
    function thinProtectEdges(pts, edge, n, keep, rnd) {
      if (keep >= n) return n;
      let nEdge = 0;
      for (let i = 0; i < n; i++) nEdge += edge[i];
      const nInt = n - nEdge;
      // teto impossível (menor que o nº de bordas): subamostra tudo
      const protect = keep >= nEdge;
      let leftInt = protect ? keep - nEdge : Math.round((keep / n) * nInt);
      let leftE = protect ? nEdge : keep - leftInt;
      let m = 0,
        seenInt = 0,
        seenE = 0;
      for (let i = 0; i < n; i++) {
        const isE = edge[i] === 1;
        let take;
        if (isE) {
          take = leftE > 0 && rnd() * (nEdge - seenE) < leftE;
          if (take) leftE--;
          seenE++;
        } else {
          take = leftInt > 0 && rnd() * (nInt - seenInt) < leftInt;
          if (take) leftInt--;
          seenInt++;
        }
        if (!take) continue;
        if (m !== i) {
          const a = m * 6,
            b = i * 6;
          for (let k = 0; k < 6; k++) pts[a + k] = pts[b + k];
          edge[m] = edge[i];
        }
        m++;
      }
      return m;
    }

    /* ---- Instância ----------------------------------------------------------- */

    class ParticlesInstance {
      constructor(el, opts) {
        this.el = el;
        this.opts = opts;
        this.canvas = null;
        this.vctx = null;
        this.rect = null;
        this.margin = 80; // folga do canvas para além do host (partículas ao vento)
        this.cwCss = 0;
        this.chCss = 0;
        this.edpr = 1;
        this.count = 0;
        this.sizeCss = 2;
        this.gap = 4; // espaçamento usado na amostragem (px CSS)
        this.swCss = 4; // espessura de traço estimada (px CSS)
        this.depthEff = opts.depth; // depth já escalado pela fonte (k)
        this.hx = null; // casa
        this.hy = null;
        this.x = null;
        this.y = null;
        this.vx = null;
        this.vy = null;
        this.al = null; // alpha final por partícula (0..255)
        this.alPix = null; // alpha amostrado da tinta (recalculado no refit)
        this.z = null; // profundidade 0..1 (uniforme no corpo; alto nos acentos)
        this.ph = null; // fase própria (drift e variação de atrito)
        this.km = null; // multiplicador de rigidez/massa da mola
        this.dl = null; // atraso de regresso, em segundos
        this.ly = null; // camada: 0 = corpo, 1 = acento, 2 = halo
        this.sb = null; // balde de tamanho (sprite)
        this.bb = null; // balde de brilho (sprite)
        this.gl = null; // 1 = desenha também o halo de glow (só acentos)
        this.hl = null; // 1 = partícula do halo (poeira solta)
        this.ci = null; // índice de cor (Uint16)
        this.pal = null; // [{rgb, style}] — cores distintas da instância
        this.groups = []; // [{style, rgb, b, a, h, sprites, glow}] — cor × camada
        this.tblBody = null; // tamanho desenhado por balde (px CSS)
        this.tblGlow = null; // tamanho do halo de glow por balde
        this.seed = 0; // semente do gerador (fixada no build)
        this.rsCount = 0; // gerador avança em random="resample"/interval
        this.colorSpec = null; // especificação de cor em vigor
        this.additive = !1; // acentos em mistura aditiva ("lighter")?
        this.glowEff = !1; // sprites de glow activos?
        this.bgLuma = 0;
        this.bgLight = !1;
        this.energy = 0; // 0 = em repouso (discreto) .. 1 = a interagir (aéreo)
        this.driftAmp = 0; // px de drift (0 = desligado/adormece)
        this.relT = 0; // instante em que o ponteiro soltou (atrasos de regresso)
        this.wasPin = !1;
        this.xf = null; // crossfade do random="interval:N" {groups, t0}
        this.colorTimer = 0; // temporizador do interval:N
        this.sampled = !1;
        this.sampling = !1;
        this.dead = !1;
        this.visible = void 0;
        this.disturbed = !1;
        this.dirty = !1;
        this.lastW = 0;
        this.lastH = 0;
        this.textEls = new Set(); // elementos com o texto amostrado
        this.savedInline = new Map(); // el -> { color, fill }
        this.colorCache = new Map(); // el -> cor visível (pré-transparência)
        // mola: ω = 2π / return → k = ω² ; atrito exponencial por segundo
        this.springK = Math.pow((2 * Math.PI) / opts.return, 2);
        this.dampPerSec = -Math.log(opts.friction) * 60;
      }

      /* ---- montagem / geometria ---- */

      mount() {
        const canvas = document.createElement("canvas");
        canvas.className = "emerge-particles-canvas";
        canvas.setAttribute("aria-hidden", "true");
        this.canvas = canvas;
        this.vctx = canvas.getContext("2d");
        this.el.appendChild(canvas); // depois do texto → pinta por cima
        this.rect = this.el.getBoundingClientRect();
        this.scheduleSample();
      }

      // espera document.fonts.ready antes de amostrar (a fonte tem de estar
      // madura para medir e desenhar bem; ready resolve logo se já estiver)
      scheduleSample() {
        if (this.dead || this.sampling) return;
        this.sampling = !0;
        const go = () => {
          this.sampling = !1;
          !this.dead && this.resample();
        };
        if (document.fonts && document.fonts.ready && document.fonts.ready.then)
          document.fonts.ready.then(go, go);
        else go();
      }

      // leitura de layout (fase de leitura do motor); re-amostra se o
      // tamanho do elemento mudou
      measure() {
        this.dirty = !1;
        if (this.dead || !this.el.isConnected) return;
        const r = this.el.getBoundingClientRect();
        this.rect = r;
        this.sampled &&
          (Math.abs(r.width - this.lastW) > 0.5 ||
            Math.abs(r.height - this.lastH) > 0.5) &&
          this.resample();
      }

      nearPointer() {
        if (
          !this.rect ||
          !this.count ||
          this.dead ||
          (ptr.touch && this.opts.touch === "off")
        )
          return !1;
        const r = this.rect,
          m = this.margin + this.opts.radius;
        return (
          ptr.x > r.left - m &&
          ptr.x < r.right + m &&
          ptr.y > r.top - m &&
          ptr.y < r.bottom + m
        );
      }

      /* ---- amostragem completa ---- */

      resample() {
        if (this.dead || this.sampling || !this.el.isConnected) return;
        try {
          this.sampleNow();
        } catch (e) {
          this.sampled = !1;
        }
      }

      sampleNow() {
        const st = buildState(this.el, this.opts, this.seed, null, this);
        if (!st) {
          this.sampled = !1;
          return;
        }
        // adopta o estado amostrado (os arrays são partilhados, sem cópias)
        this.rect = st.rect;
        this.edpr = st.edpr;
        this.count = st.count;
        this.sizeCss = st.sizeCss;
        this.gap = st.gap;
        this.swCss = st.swCss;
        this.depthEff = st.depthEff;
        this.cwCss = st.cwCss;
        this.chCss = st.chCss;
        this.hx = st.hx;
        this.hy = st.hy;
        this.x = st.x;
        this.y = st.y;
        this.vx = st.vx;
        this.vy = st.vy;
        this.al = st.al;
        this.alPix = st.alPix;
        this.z = st.z;
        this.ph = st.ph;
        this.km = st.km;
        this.dl = st.dl;
        this.ly = st.ly;
        this.sb = st.sb;
        this.bb = st.bb;
        this.gl = st.gl;
        this.hl = st.hl;
        this.baseRGB = st.baseRGB;
        this.ci = st.ci;
        this.bgLuma = st.bgLuma;
        this.bgLight = st.bgLight;
        this.additive = st.additive;
        this.glowEff = st.glowEff;
        this.bbox = st.bbox; // caixa da tinta (usada pela legibilidade)
        this.sampled = !0;
        this.lastW = st.lastW;
        this.lastH = st.lastH;

        /* cores → factores por partícula → grupos → sprites */
        String(this.opts.random).trim().toLowerCase() !== "build" && this.rsCount++;
        this.applyColors();
        this.refit();
        this.scheduleRandom();

        /* geometria do canvas visível (folga M em todas as direções) */
        const M = this.margin,
          canvas = this.canvas;
        canvas.style.left = -M + "px";
        canvas.style.top = -M + "px";
        canvas.style.width = this.cwCss + "px";
        canvas.style.height = this.chCss + "px";
        canvas.width = Math.min(4096, Math.ceil(this.cwCss * this.edpr));
        canvas.height = Math.min(4096, Math.ceil(this.chCss * this.edpr));
        this.vctx.setTransform(this.edpr, 0, 0, this.edpr, 0, 0);

        /* intro="assemble": nasce espalhada e junta-se ao entrar no viewport */
        if (this.opts.intro === "assemble") this.assembleNow();
        else this.draw(0); // estado estático inicial (letras em repouso)
      }

      /* ---- cores: atribui um índice de cor a cada partícula ------------------- */

      applyColors() {
        applyColorsTo(this);
      }

      /* ---- factores por partícula (camada/z) + grupos + sprites ---------------- */

      // Recalcula o que depende de depth/glow (sem voltar a amostrar): alpha,
      // baldes de sprite, rigidez/atrito/atraso. Usado no build e quando a
      // cor ou o depth mudam em runtime (setColor / sliders da demo).
      refit() {
        factorsTo(this);
        this.regroup();
        this.buildSprites();
      }

      // agrupa por cor × camada (menos mudanças de sprite/fillStyle/composite
      // por frame: cada passada desenha uma camada inteira de uma cor)
      regroup() {
        regroupTo(this);
      }

      // sprites PRÉ-DESENHADOS em cache por cor × balde de tamanho × balde
      // de brilho — nenhum arc()/gradiente por partícula por frame.
      buildSprites() {
        buildSpritesTo(this);
      }

      /* ---- cores aleatórias por intervalo (random="interval:N") ---------------- */

      scheduleRandom() {
        clearTimeout(this.colorTimer);
        this.colorTimer = 0;
        const m = /^interval:(\d+(?:\.\d+)?)$/i.exec(
          String(this.opts.random).trim(),
        );
        if (!m || !this.colorSpec || this.colorSpec.kind !== "random") return;
        const ms = Math.max(1, Number(m[1])) * 1000;
        const tick = () => {
          if (this.dead) return;
          const again = /^interval:/i.test(String(this.opts.random).trim());
          if (!again || !this.colorSpec || this.colorSpec.kind !== "random")
            return;
          // fora do viewport ou com o separador escondido: salta esta rodada
          if (this.visible !== !1 && !document.hidden) this.transitionColors();
          this.colorTimer = setTimeout(tick, ms);
        };
        this.colorTimer = setTimeout(tick, ms);
      }

      // nova atribuição aleatória com transição suave: os grupos antigos
      // (sprites em cache) cruzam-se com os novos num crossfade de ~0,9 s —
      // cada partícula é desenhada duas vezes só durante a transição
      transitionColors() {
        if (this.dead || !this.count || !this.sampled) return;
        this.xf = { groups: this.groups, t0: performance.now() };
        this.rsCount++;
        this.applyColors();
        this.refit();
        wake(this);
      }

      /* ---- tinta original (cor) ------------------------------------------------ */

      // esconde (on) ou repõe a cor dos elementos que contêm o texto
      // amostrado — inline, só nesses elementos, nunca display: none
      hideInk(on) {
        if (on) {
          this.collectTextEls();
          for (const p of this.textEls) {
            if (!p.isConnected) continue;
            if (!this.savedInline.has(p)) {
              this.savedInline.set(p, {
                color: p.style.color || "",
                fill: p.style.webkitTextFillColor || "",
              });
            }
            p.style.color = "transparent";
            "webkitTextFillColor" in p.style &&
              (p.style.webkitTextFillColor = "transparent");
            p.classList.add(TEXT_CLASS);
          }
        } else {
          this.restoreText();
        }
      }

      collectTextEls() {
        const walker = document.createTreeWalker(this.el, NodeFilter.SHOW_TEXT, {
          acceptNode(n) {
            if (!n.nodeValue || !n.nodeValue.trim())
              return NodeFilter.FILTER_REJECT;
            const p = n.parentElement;
            if (
              !p ||
              p.closest(SPLIT_NODES) ||
              p.closest("svg") ||
              p.closest("script, style")
            )
              return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        while (walker.nextNode())
          this.textEls.add(walker.currentNode.parentElement);
      }

      restoreText() {
        for (const p of this.textEls) {
          if (!p.isConnected) continue;
          const s = this.savedInline.get(p);
          if (s) {
            s.color ? (p.style.color = s.color) : p.style.removeProperty("color");
            if ("webkitTextFillColor" in p.style)
              s.fill
                ? (p.style.webkitTextFillColor = s.fill)
                : p.style.removeProperty("-webkit-text-fill-color");
          }
          p.classList.remove(TEXT_CLASS);
        }
        this.textEls.clear();
        this.savedInline.clear();
      }

      /* ---- intro="assemble" ----------------------------------------------------- */

      onEnter() {
        if (!this.sampled) this.scheduleSample(); // a 1.ª amostragem falhou
        if (this.opts.intro === "assemble") this.assembleNow();
        else this.disturbed && wake(this); // retoma a física a meio do regresso
      }

      // nasce espalhada numa coroa em torno do elemento; junta-se quando o
      // elemento entra no viewport (emerge:in do core ou o observer próprio).
      // O relT dá a cada partícula o seu atraso: a montagem entra em ondas.
      assembleNow() {
        if (!this.count || this.dead || !this.sampled) return;
        const cx = this.cwCss / 2,
          cy = this.chCss / 2;
        const R = Math.max(this.cwCss, this.chCss) * 0.75;
        const { x, y, vx, vy } = this;
        for (let i = 0; i < this.count; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = R * (0.35 + 0.65 * Math.random());
          x[i] = clamp(cx + Math.cos(a) * r, 0, this.cwCss);
          y[i] = clamp(cy + Math.sin(a) * r, 0, this.chCss);
          vx[i] = vy[i] = 0;
        }
        this.relT = performance.now();
        if (this.visible === !1) return; // fora do viewport: junta-se ao entrar
        this.disturbed = !0;
        this.energy = Math.max(this.energy, 0.9); // a montagem também acende
        wake(this);
      }

      /* ---- impulso manual (API) -------------------------------------------------- */

      // px/py relativos ao canto superior esquerdo do elemento (null =
      // centro da TINTA — a caixa do texto, não a do elemento: em hosts
      // largos com texto curto o centro do elemento fica longe das
      // partículas e o impulso não chegava a nada)
      disperse(px, py) {
        if (!this.count || this.dead || !this.sampled) return;
        const bb = this.bbox,
          edpr = this.edpr || 1;
        const cx =
          (px == null
            ? bb
              ? (bb.x0 + bb.x1) / 2 / edpr
              : this.lastW / 2
            : px) + this.margin;
        const cy =
          (py == null
            ? bb
              ? (bb.y0 + bb.y1) / 2 / edpr
              : this.lastH / 2
            : py) + this.margin;
        const R = this.opts.radius * 2;
        const boost = 900 * Math.max(0.4, this.opts.strength);
        const dep = this.opts.depth;
        const { x, y, vx, vy, z } = this;
        for (let i = 0; i < this.count; i++) {
          const dx = x[i] - cx,
            dy = y[i] - cy;
          const d = Math.hypot(dx, dy) || 1;
          const f = Math.pow(Math.max(0, 1 - d / R), 1.5);
          if (!f) continue;
          // os acentos (z alto) sentem o impulso um pouco mais
          const fz = f * (1 + (0.35 + 0.65 * z[i] - 1) * dep);
          vx[i] += (dx / d) * boost * fz + (Math.random() - 0.5) * 40 * fz;
          vy[i] += (dy / d) * boost * fz + (Math.random() - 0.5) * 40 * fz;
        }
        this.relT = performance.now();
        this.disturbed = !0;
        this.energy = Math.max(this.energy, 0.9); // a luz acende no impulso
        wake(this);
      }

      /* ---- passo do motor -------------------------------------------------------- */

      // Um passo: física + escrita no canvas. Devolve false quando pode
      // adormecer (tudo assentou, sem drift, sem crossfade e o ponteiro não
      // está a influenciar).
      step(dt, now) {
        if (this.dead || !this.sampled || !this.count || this.visible === !1)
          return !1;
        if (this.dirty) this.measure();
        const o = this.opts;
        const s = dt / 1000;
        // estabilidade: em frames lentos trava a constante da mola
        const k = Math.min(this.springK, 0.2 / (s * s));
        const mult = Math.exp(-this.dampPerSec * s);

        // ponteiro em coordenadas locais (rect fresco — onScroll marca dirty)
        let lx = 0,
          ly0 = 0,
          pin = !1;
        if (ptr.has && this.rect && !(ptr.touch && o.touch === "off")) {
          lx = ptr.x - this.rect.left + this.margin;
          ly0 = ptr.y - this.rect.top + this.margin;
          pin =
            lx > -o.radius &&
            lx < this.cwCss + o.radius &&
            ly0 > -o.radius &&
            ly0 < this.chCss + o.radius;
        }
        const R2 = o.radius * o.radius;
        const F = 3600 * o.strength;
        const mode = o.mode;
        const dep = this.depthEff;
        const { hx, hy, x, y, vx, vy, z, km, dl, ph } = this;
        pin && (this.disturbed = !0);
        // o ponteiro acabou de soltar: arranca a contagem dos atrasos
        if (!pin && this.wasPin) this.relT = now;
        this.wasPin = pin;
        const relS = this.relT ? (now - this.relT) / 1000 : 99;
        let active = !1;

        for (let i = 0; i < this.count; i++) {
          const zi = z[i];
          // mola por partícula (rigidez/massa) + atraso de regresso: solto o
          // ponteiro, cada partícula só "acorda" depois do seu dl[i] — o
          // regresso espalha-se em ondas. Durante o atraso a mola fica quase
          // solta (0,12) e a partícula vagueia com o drift.
          const eng =
            pin || relS >= 0.6 || relS >= dl[i] ? 1 : 0.12;
          let ax = (hx[i] - x[i]) * k * km[i] * eng;
          let ay = (hy[i] - y[i]) * k * km[i] * eng;
          if (pin) {
            const dx = x[i] - lx,
              dy = y[i] - ly0;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 0.001;
              const t = 1 - d / o.radius;
              // queda suave (quadrática); os acentos (z alto) reagem mais
              const f = t * t * F * (1 + (0.35 + 0.65 * zi - 1) * dep);
              const ux = dx / d,
                uy = dy / d;
              if (mode === "attract") {
                ax -= ux * f;
                ay -= uy * f;
              } else if (mode === "swirl") {
                // componente tangencial + um empurrão para fora (não colapsa)
                ax += -uy * f * 0.9 + ux * f * 0.35;
                ay += ux * f * 0.9 + uy * f * 0.35;
              } else {
                ax += ux * f;
                ay += uy * f;
              }
            }
          }
          // atrito exponencial estável, com pequena variação por partícula
          const mI =
            1 -
            (1 - mult) *
              (1 + (0.88 + 0.24 * (ph[i] / 6.28318) - 1) * dep);
          vx[i] = (vx[i] + ax * s) * mI;
          vy[i] = (vy[i] + ay * s) * mI;
          x[i] += vx[i] * s;
          y[i] += vy[i] * s;
          if (
            !active &&
            (Math.abs(x[i] - hx[i]) > 0.08 ||
              Math.abs(y[i] - hy[i]) > 0.08 ||
              Math.abs(vx[i]) > 3 ||
              Math.abs(vy[i]) > 3)
          )
            active = !0;
        }
        // energia da interação: sobe depressa enquanto o ponteiro está em
        // cima (a luz acende), desce devagar quando sai — e apaga ao
        // assentar. disperse/assemble também a acendem (ver adiante).
        const eT = pin ? 1 : 0;
        if (eT > this.energy)
          this.energy += (eT - this.energy) * Math.min(1, dt / 160);
        else this.energy += (eT - this.energy) * Math.min(1, dt / 620);
        if (!eT && this.energy < 0.005) this.energy = 0;
        this.draw(now);
        if (!active && !this.driftAmp && !this.xf && this.energy <= 0) {
          this.settle(now);
          return !1;
        }
        return !0;
      }

      // tudo no lugar: estado final escrito uma última vez e motor adormece
      // (só é chamado sem drift e sem crossfade — com drift a nuvem nunca
      // assenta por completo, por isso o motor desacelera em vez de dormir)
      settle(now) {
        const { hx, hy, x, y, vx, vy } = this;
        for (let i = 0; i < this.count; i++) {
          x[i] = hx[i];
          y[i] = hy[i];
          vx[i] = vy[i] = 0;
        }
        this.assembling = !1;
        this.relT = 0;
        this.energy = 0; // luz apaga: acentos e halo voltam ao discreto
        this.draw(now);
        if (this.disturbed) {
          this.disturbed = !1;
          core.dispatch("emerge:particles:settle", { el: this.el });
        }
      }

      /* ---- escrita (canvas) ------------------------------------------------------- */

      draw(now) {
        paintCloud(this.vctx, this, now);
      }

      /* ---- destruição --------------------------------------------------------------- */

      destroy() {
        this.dead = !0;
        running.delete(this);
        io && io.unobserve(this.el);
        const t = resampleTimers.get(this.el);
        t && (clearTimeout(t), resampleTimers.delete(this.el));
        clearTimeout(this.colorTimer);
        this.colorTimer = 0;
        this.xf = null;
        this.canvas && this.canvas.remove();
        this.canvas = this.vctx = null;
        this.restoreText();
        // liberta os buffers grandes (a instância pode viver noutra variável)
        this.hx = this.hy = this.x = this.y = this.vx = this.vy = null;
        this.al = this.alPix = this.z = this.ph = this.km = this.dl = null;
        this.sb = this.bb = this.gl = this.hl = this.ly = this.ci = null;
        this.baseRGB = null;
        this.pal = null;
        this.groups = [];
        this.tblBody = this.tblGlow = null;
        this.count = 0;
        this.el.classList.remove(
          "emerge-particles",
          "emerge-particles-touch-pan-y",
          "emerge-particles-touch-track",
        );
        this.el.hasAttribute("data-emerge") || core.release(this.el);
        instances.delete(this.el);
        core.dispatch("emerge:particles:destroy", { el: this.el });
        instances.size || unwire();
      }
    }

    /* ---- estado amostrado (partilhado pela instância e pela medida de
       legibilidade com DPR próprio) ------------------------------------------- */

    // Desenha o texto do elemento num canvas fora do ecrã (a MÁSCARA) — a
    // mesma rotina serve para amostrar e para a referência da medida de
    // legibilidade. inst = instância viva (cache de cores) ou null.
    // Devolve {canvas, ctx, data}.
    function drawTextMask(el, rect, M, cw, ch, edpr, inst) {
      const off = document.createElement("canvas");
      off.width = cw;
      off.height = ch;
      const ctx = off.getContext("2d", { willReadFrequently: !0 });
      ctx.setTransform(edpr, 0, 0, edpr, 0, 0);
      ctx.textBaseline = "alphabetic";
      const canLS = "letterSpacing" in ctx;
      const styles = new Map(); // el -> computedStyle
      const colors = new Map(); // el -> fillStyle
      const styleOf = (p) => {
        let c = styles.get(p);
        if (!c) ((c = getComputedStyle(p)), styles.set(p, c));
        return c;
      };
      // nas re-amostras o texto já está transparente: usa a cache ou a
      // ascendente visível (a cor é lida ANTES de esconder a tinta)
      const colorCache = new Map();
      const colorOf = (p) => {
        if (inst && inst.opts.color) return inst.opts.color;
        if (colors.has(p)) return colors.get(p);
        let c = inst ? inst.colorCache.get(p) : colorCache.get(p);
        if (!c || alphaOf(c) === 0) {
          const live = visibleColor(p);
          live && (inst ? inst.colorCache.set(p, live) : colorCache.set(p, live));
          c = live || c || "#000";
        }
        colors.set(p, c);
        return c;
      };
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (!n.nodeValue || !n.nodeValue.trim())
            return NodeFilter.FILTER_REJECT;
          const p = n.parentElement;
          if (
            !p ||
            p.closest(SPLIT_NODES) ||
            p.closest("svg") ||
            p.closest("script, style")
          )
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const frags = fragmentsFor(node);
        if (!frags.length) continue;
        const p = node.parentElement;
        const cs = styleOf(p);
        ctx.font =
          cs.fontStyle +
          " " +
          cs.fontVariant +
          " " +
          cs.fontWeight +
          " " +
          cs.fontSize +
          " " +
          cs.fontFamily;
        ctx.fillStyle = colorOf(p);
        const ls = parseFloat(cs.letterSpacing) || 0;
        for (const f of frags) {
          const x = f.rect.left - rect.left + M;
          // linha de base: a caixa inline tem a altura das métricas da
          // fonte (fontBoundingBox); sem suporte, rácio típico de 0,8
          const m = ctx.measureText(f.text);
          const base =
            f.rect.top -
            rect.top +
            M +
            (m.fontBoundingBoxAscent || f.rect.height * 0.8);
          if (f.perChar) {
            // palavra partida pelo wrap: posições exactas por carácter
            for (const ch2 of f.text) {
              ctx.fillText(ch2, x, base);
              break; // um carácter só — a posição já vem do DOM
            }
          } else if (ls && !canLS) {
            // sem ctx.letterSpacing: avanço manual carácter a carácter
            let cx2 = x;
            for (const ch2 of f.text) {
              ctx.fillText(ch2, cx2, base);
              cx2 += ctx.measureText(ch2).width + ls;
            }
          } else {
            canLS && (ctx.letterSpacing = ls + "px");
            ctx.fillText(f.text, x, base);
          }
        }
      }
      canLS && (ctx.letterSpacing = "0px");
      return { canvas: off, ctx, data: ctx.getImageData(0, 0, cw, ch).data };
    }

    // espessura de traço estimada pela razão área/perímetro sobre a máscara
    // (dentro da caixa da tinta, por isso é barata): um traço w×L tem
    // área ≈ wL e perímetro ≈ 2L → w ≈ 2·área/perímetro. Devolve px CSS.
    function strokeFromMask(data, cw, ch, x0, y0, x1, y1, edpr) {
      let n = 0,
        e = 0;
      const aAt = (x, y) => data[(y * cw + x) * 4 + 3];
      for (let y = y0; y <= y1; y++) {
        const row = y * cw;
        for (let x = x0; x <= x1; x++) {
          if (data[(row + x) * 4 + 3] < 120) continue;
          n++;
          if (
            (x <= x0 || aAt(x - 1, y) < 120) ||
            (x >= x1 || aAt(x + 1, y) < 120) ||
            (y <= y0 || aAt(x, y - 1) < 120) ||
            (y >= y1 || aAt(x, y + 1) < 120)
          )
            e++;
        }
      }
      if (!n) return Math.max(1, 2 / edpr);
      // traços finos: o perímetro inclui os topos, por isso 2n/e subestima um
      // pouco — o clamp inferior (1 px) e o teto (½ da altura da caixa)
      // mantêm a estimativa sensata
      const w = (2 * n) / Math.max(1, e);
      return clamp(w / edpr, 0.8, (y1 - y0 + 1) / edpr / 2);
    }

    // há tinta perto do ponto (px de dispositivo)? — o teste do halo: a
    // vizinhança imediata tem de tocar a forma, por isso o halo nunca nasce
    // dentro dos contadores nem no espaço entre palavras
    function nearInk(data, cw, ch, x, y, r) {
      const aAt = (px, py) => {
        const xi = clamp(Math.round(px), 0, cw - 1);
        const yi = clamp(Math.round(py), 0, ch - 1);
        return data[(yi * cw + xi) * 4 + 3];
      };
      if (aAt(x, y) >= 120) return !0;
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        if (aAt(x + Math.cos(a) * r, y + Math.sin(a) * r) >= 120) return !0;
      }
      return !1;
    }

    // amostragem completa num objeto de estado novo. Usado pela instância
    // (edpr próprio do ecrã) e pela medida de legibilidade (dpr imposto).
    // inst = instância viva (para a cache de cores) ou null (medida).
    function buildState(el, o, seed, dprForce, inst) {
      if (!el.isConnected) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 2) return null;
      const dpr = clamp(
        dprForce || window.devicePixelRatio || 1,
        0.5,
        3,
      );
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      // folga do canvas: raio do ponteiro + espaço para o halo (agora curto:
      // desvio máximo ~0,28× a altura da fonte) e para o drift
      const haloSlack = o.halo > 0 ? Math.ceil(fs * 0.5) : 0;
      const M = clamp(o.radius, 40, 160) + haloSlack;
      const w = rect.width,
        h = rect.height;
      const fullW = w + 2 * M,
        fullH = h + 2 * M;
      // canvas fora do ecrã (limite de segurança de memória)
      const cw = Math.min(4096, Math.ceil(fullW * dpr));
      const ch = Math.min(4096, Math.ceil(fullH * dpr));
      const edpr = Math.min(dpr, cw / fullW, ch / fullH);
      const st = {
        el,
        opts: o,
        seed,
        edpr,
        margin: M,
        rect,
        cwCss: fullW,
        chCss: fullH,
        lastW: rect.width,
        lastH: rect.height,
        mask: null, // só a medida de legibilidade precisa da máscara
        legacy: o.look === "grid",
        energy: 0,
        xf: null,
        driftAmp: o.drift > 0 ? o.drift : 0,
      };

      /* 1) máscara do texto (leitura de layout + desenho; as cores são
         lidas aqui — a tinta só é escondida no fim) */
      const mask = drawTextMask(el, rect, M, cw, ch, edpr, inst);
      const data = mask.data;

      /* 2) caixa da tinta + espessura de traço estimada (área/perímetro) */
      let x0 = cw,
        y0 = ch,
        x1 = -1,
        y1 = -1;
      for (let y = 0; y < ch; y++) {
        const row = y * cw;
        for (let x = 0; x < cw; x++) {
          if (data[(row + x) * 4 + 3] >= 120) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      const hasInk = x1 >= 0;
      if (!hasInk) {
        x0 = y0 = 0;
        x1 = cw - 1;
        y1 = ch - 1;
      }
      const swCss = hasInk
        ? strokeFromMask(data, cw, ch, x0, y0, x1, y1, edpr)
        : 2;
      st.swCss = swCss;
      st.bbox = { x0, y0, x1, y1 };

      /* 3) recolha dos pontos (orgânica consciente da forma | grelha antiga) */
      const limit = o.max > 0 ? o.max : core.device.mobile() ? 2500 : 4000;
      const org = o.sampling !== "grid";
      const rnd = org ? mulberry32(seed) : null;
      // gap automático: no look legible é escolhido pela ESPESSURA do traço
      // (≥ ~5 partículas a atravessá-lo), não só pelo tamanho da fonte
      let gap =
        o.gap > 0
          ? o.gap
          : !org
            ? autoGap(el, dpr, !1)
            : o.look === "cloud"
              ? autoGap(el, dpr, !0)
              : clamp(Math.round(swCss / 5), 2, 12);
      // teto bruto de recolha: o limite corrigido pelos orçamentos de acentos
      // e halo (a redução final respeita a ordem halo → acentos → interior)
      const rawCap = org ? Math.min(40000, Math.ceil(limit / 1.24)) : limit;
      let pts, edge;
      if (org) {
        const r1 = collectOrganic(
          data,
          cw,
          ch,
          Math.max(1, Math.round(gap * edpr)),
          rawCap,
          rnd,
          o.jitter,
        );
        pts = r1.pts;
        edge = r1.edge;
        while (pts.length >= rawCap * 6 && gap < 48) {
          gap += 1;
          const r2 = collectOrganic(
            data,
            cw,
            ch,
            Math.max(1, Math.round(gap * edpr)),
            rawCap,
            rnd,
            o.jitter,
          );
          pts = r2.pts;
          edge = r2.edge;
        }
      } else {
        pts = collectPoints(
          data,
          cw,
          ch,
          Math.max(1, Math.round(gap * edpr)),
          rawCap,
        );
        edge = null;
        while (pts.length >= rawCap * 6 && gap < 48) {
          gap += 1;
          pts = collectPoints(
            data,
            cw,
            ch,
            Math.max(1, Math.round(gap * edpr)),
            rawCap,
          );
        }
      }
      let n = Math.floor(pts.length / 6);
      // densidade: só rarefaz o INTERIOR — as bordas (contornos das letras)
      // mantêm densidade total; o teto também protege as bordas primeiro
      if (org) {
        n = rarefyInterior(pts, edge, n, o.density, rnd);
        if (n > limit) n = thinProtectEdges(pts, edge, n, limit, rnd);
      }

      /* 4) orçamentos das camadas: corpo (tudo o que há) + acentos + halo */
      // escala adaptativa pela fonte (E): abaixo de ~32px quase só corpo
      const k = clamp((fs - 24) / 72, 0, 1);
      const depthEff = o.depth * (0.35 + 0.65 * k);
      const accFrac =
        clamp(0.06 + 0.06 * depthEff, 0.06, 0.12) * (0.3 + 0.7 * k);
      const haloFrac = o.halo * (0.35 + 0.65 * k);
      let accN = 0,
        haloN = 0;
      if (org) {
        accN = Math.min(Math.round(n * accFrac), Math.round(n * 0.12));
        haloN = Math.min(
          Math.round(n * haloFrac),
          Math.round(n * HALO_CAP),
          Math.max(0, limit - n - accN),
        );
        if (accN + haloN > limit - n) {
          // teto apertado: reduz primeiro o halo, depois os acentos
          haloN = Math.max(0, Math.min(haloN, limit - n - accN));
          accN = Math.max(0, Math.min(accN, limit - n - haloN));
        }
      }
      const total = n + accN + haloN;
      st.count = total;
      st.gap = gap;
      st.depthEff = depthEff;
      // tamanho automático: limitado pela espessura do traço (o corpo nunca
      // é mais largo que ele) — corpo ≤ ~0,4× o traço, acentos ≤ ~0,9×
      st.sizeCss =
        o.size > 0
          ? o.size
          : clamp(
              Math.min(gap * 0.62, Math.max(0.9, swCss * 0.4)),
              0.8,
              org ? 5 : 4,
            );

      /* 5) arrays tipados (nenhum objeto por partícula) */
      const hx = new Float32Array(total),
        hy = new Float32Array(total),
        x = new Float32Array(total),
        y = new Float32Array(total),
        vx = new Float32Array(total),
        vy = new Float32Array(total),
        al = new Uint8Array(total),
        alPix = new Uint8Array(total),
        z = new Float32Array(total),
        ph = new Float32Array(total),
        km = new Float32Array(total),
        dl = new Float32Array(total),
        ly = new Uint8Array(total), // 0 corpo · 1 acento · 2 halo
        sb = new Uint8Array(total),
        bb = new Uint8Array(total),
        gl = new Uint8Array(total),
        hl = new Uint8Array(total),
        baseRGB = new Uint32Array(total),
        ci = new Uint16Array(total);

      /* 6) camadas: acentos por aceitação sequencial (uniformes no espaço e
         determinísticos com a semente); z uniforme — nada de partículas
         "de fundo" quase invisíveis */
      let accLeft = accN,
        rem = n;
      for (let i = 0; i < n; i++) {
        if (accLeft > 0 && rnd() * rem < accLeft) {
          ly[i] = 1;
          accLeft--;
        }
        rem--;
      }
      for (let i = 0; i < n; i++) {
        const b = i * 6;
        // coordenadas no espaço do CANVAS (0..fullW): o desenho, o ponteiro
        // (ptr − rect + margem) e o impulso manual trabalham todos neste
        // espaço — a casa fica onde o píxel foi amostrado
        hx[i] = x[i] = pts[b] / edpr;
        hy[i] = y[i] = pts[b + 1] / edpr;
        alPix[i] = pts[b + 5];
        baseRGB[i] = (pts[b + 2] << 16) | (pts[b + 3] << 8) | pts[b + 4];
        // z uniforme (nada de partículas "de fundo" quase invisíveis);
        // acentos vivem no topo da escala; grelha antiga: z = 0
        z[i] = !org
          ? 0
          : ly[i] === 1
            ? 0.55 + 0.45 * rnd()
            : rnd();
        ph[i] = org ? rnd() * 6.28318 : 0;
      }
      // halo: nasce só JUNTO aos contornos (fonte = ponto de borda) e a
      // posição candidata é testada contra a máscara — nunca dentro dos
      // contadores nem no espaço entre palavras
      if (haloN > 0) {
        const edgeIdx = [];
        for (let i = 0; i < n; i++) edge[i] === 1 && edgeIdx.push(i);
        const srcPool = edgeIdx.length ? edgeIdx : null;
        for (let j = 0; j < haloN; j++) {
          const i = n + j;
          const si = srcPool
            ? srcPool[(rnd() * srcPool.length) | 0]
            : (rnd() * n) | 0;
          const sx = pts[si * 6] / edpr,
            sy = pts[si * 6 + 1] / edpr;
          // desvio gaussiano curto: máx. ~0,28× a altura da fonte
          let mag = clamp(
            fs * (0.05 + Math.abs(gauss(rnd)) * 0.09),
            0.6,
            fs * 0.28,
          );
          let ax = 0,
            ay = 0,
            ok = !1;
          for (let tente = 0; tente < 4 && !ok; tente++) {
            const ang = rnd() * 6.28318;
            ax = sx + Math.cos(ang) * mag;
            ay = sy + Math.sin(ang) * mag;
            ok = nearInk(data, cw, ch, ax * edpr, ay * edpr, Math.max(2, fs * 0.08 * edpr));
            ok || (mag *= 0.45); // aproxima do contorno e tenta de novo
          }
          if (!ok) {
            ax = sx;
            ay = sy; // rende-se: cola ao contorno (é sempre "junto")
          }
          hx[i] = x[i] = clamp(ax, 0, fullW);
          hy[i] = y[i] = clamp(ay, 0, fullH);
          alPix[i] = pts[si * 6 + 5];
          baseRGB[i] =
            (pts[si * 6 + 2] << 16) |
            (pts[si * 6 + 3] << 8) |
            pts[si * 6 + 4];
          z[i] = 0.2 + 0.5 * rnd();
          ph[i] = rnd() * 6.28318;
          ly[i] = 2;
          hl[i] = 1;
        }
      }
      st.hx = hx;
      st.hy = hy;
      st.x = x; // estado assente: x = casa
      st.y = y;
      st.vx = vx;
      st.vy = vy;
      st.al = al;
      st.alPix = alPix;
      st.z = z;
      st.ph = ph;
      st.km = km;
      st.dl = dl;
      st.ly = ly;
      st.sb = sb;
      st.bb = bb;
      st.gl = gl;
      st.hl = hl;
      st.baseRGB = baseRGB;
      st.ci = ci;

      /* fundo e luz: o glow aditivo é dos ACENTOS e só é seguro em fundo escuro */
      st.bgLuma = bgLumaOf(el);
      st.bgLight = st.bgLuma > 0.55;
      st.additive =
        o.glow === "on" ? !0 : o.glow === "off" ? !1 : !st.bgLight;
      st.glowEff = o.glow !== "off" && o.shape !== "square" && !st.bgLight;

      if (inst) {
        // esconder a tinta DEPOIS de amostrar (a instância faz a gestão)
        inst.hideInk(!0);
        inst.margin = M;
      }
      if (dprForce) {
        // a medida de legibilidade reuse-a (dados prontos — sem novo getImageData)
        st.maskData = mask.data;
      }
      return st;
    }

    /* ---- cores (módulo — partilhado pela instância e pelo estado sombra) ----- */

    function applyColorsTo(S) {
      const o = S.opts,
        n = S.count;
      if (!n || !S.ci) return;
      const spec = parseColorSpec(o.color);
      S.colorSpec = spec;
      // stream determinístico por (semente, geração): "build" é estável,
      // "resample"/"interval:N" avançam a geração e nascem cores novas
      const rnd = mulberry32(
        (S.seed ^ Math.imul((S.rsCount || 0) + 1, 0x9e3779b1)) | 0,
      );
      const ci = S.ci;
      const mk = (rgb) => ({
        rgb,
        style: "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")",
      });
      // cor exacta do píxel amostrado (modo "text": spans com cores
      // diferentes mantêm-se) — também é o fallback de cores inválidas
      const textPath = () => {
        const map = new Map();
        const pal = [];
        for (let i = 0; i < n; i++) {
          const key = S.baseRGB[i];
          let k = map.get(key);
          if (k === undefined) {
            k = pal.length;
            map.set(key, k);
            pal.push(
              mk([(key >> 16) & 255, (key >> 8) & 255, key & 255]),
            );
          }
          ci[i] = k;
        }
        return pal;
      };

      let pal = null;
      if (spec.kind === "text") {
        pal = textPath();
      } else if (spec.kind === "random") {
        const hue = parseRange(o.randomHue, 0, 360);
        const sat = parseRange(o.randomSat, 65, 95);
        const lit = parseRange(o.randomLight, 55, 80);
        // ≤24 cores quantizadas (menos mudanças de sprite por frame); o
        // intervalo de matiz pode dar a volta ("350-30")
        const span = hue[1] >= hue[0] ? hue[1] - hue[0] : hue[1] + 360 - hue[0];
        pal = [];
        for (let k = 0; k < GRAD_STEPS; k++) {
          const h = hue[0] + (span * (k + 0.5)) / GRAD_STEPS;
          const s = Math.round(sat[0] + (sat[1] - sat[0]) * rnd());
          const l = Math.round(lit[0] + (lit[1] - lit[0]) * rnd());
          pal.push(mk(hsl2rgb(h, s, l)));
        }
        for (let i = 0; i < n; i++) ci[i] = (rnd() * GRAD_STEPS) | 0;
      } else {
        // single / palette / gradient: validam as cores primeiro — se
        // nenhuma for válida, caem para a cor do texto
        let cols = null;
        if (spec.kind === "single" || spec.kind === "palette")
          cols = spec.colors.map(cssToRgb).filter(Boolean);
        else if (spec.kind === "gradient") {
          cols = spec.colors.map(cssToRgb).filter(Boolean);
          if (cols.length < 2) cols = cols.length === 1 ? cols : null;
        }
        if (!cols || !cols.length) {
          pal = textPath(); // cor pedida não é válida → cor do texto
        } else if (spec.kind === "single") {
          const j = o.colorJitter;
          const V = j > 0 ? clamp(Math.round(6 + j * 8), 2, 12) : 1;
          pal = [];
          for (let v = 0; v < V; v++)
            pal.push(mk(V > 1 ? jitterColor(cols[0], rnd, j) : cols[0]));
          for (let i = 0; i < n; i++) ci[i] = V > 1 ? (rnd() * V) | 0 : 0;
        } else if (spec.kind === "palette") {
          const L = cols.length;
          // pesos opcionais "1,2,1" — mesma ordem da paleta
          const wRaw = String(o.colorWeights || "")
            .split(",")
            .map((s) => Number(String(s).trim()));
          const w = [];
          let wSum = 0;
          for (let c = 0; c < L; c++) {
            const num =
              wRaw.length === L && Number.isFinite(wRaw[c]) && wRaw[c] > 0
                ? wRaw[c]
                : 1;
            wSum += num;
            w.push(wSum);
          }
          const j = o.colorJitter;
          // teto de grupos: variantes de jitter repartidas pela paleta
          const V = j > 0 ? clamp(Math.floor(30 / L), 1, 12) : 1;
          pal = [];
          for (let c = 0; c < L; c++)
            for (let v = 0; v < V; v++)
              pal.push(
                mk(V > 1 ? jitterColor(cols[c], rnd, j) : cols[c]),
              );
          for (let i = 0; i < n; i++) {
            const r = rnd() * wSum;
            let c = 0;
            while (c < L - 1 && w[c] < r) c++;
            ci[i] = V > 1 ? c * V + ((rnd() * V) | 0) : c;
          }
        } else {
          // gradient: interpolado ao longo do TEXTO (caixa da tinta), no
          // eixo dado por color-angle (0° = horizontal)
          const ang = (o.colorAngle * Math.PI) / 180;
          const cA = Math.cos(ang),
            sA = Math.sin(ang);
          let p0 = Infinity,
            p1 = -Infinity;
          for (let i = 0; i < n; i++) {
            const p = S.hx[i] * cA + S.hy[i] * sA;
            p < p0 && (p0 = p);
            p > p1 && (p1 = p);
          }
          const ext = p1 - p0 || 1;
          pal = [];
          for (let k = 0; k < GRAD_STEPS; k++)
            pal.push(mk(sampleStops(cols, (k + 0.5) / GRAD_STEPS)));
          const jt = o.colorJitter * 0.22;
          for (let i = 0; i < n; i++) {
            let t = (S.hx[i] * cA + S.hy[i] * sA - p0) / ext;
            if (jt) t += (rnd() - 0.5) * jt;
            ci[i] = (clamp(t, 0, 0.9999) * GRAD_STEPS) | 0;
          }
        }
      }
      S.pal = pal;
    }

    /* ---- factores por partícula: camada + z → tamanho/alpha/brush ------------- */

    // mapeamentos por camada (A):
    //   corpo:   tamanho 0,8..1,3× o base (variação suave, quase uniforme),
    //            alpha 0,6..1 — NUNCA abaixo de 0,45 da tinta local
    //   acentos: tamanho 1,25..2× o base (limitado a ~0,9× o traço),
    //            alpha 0,82..1, com glow
    //   halo:    tamanho 0,45..0,8× o base, alpha 0,10..0,26
    function factorsTo(S) {
      const o = S.opts,
        n = S.count;
      if (!n || !S.z) return;
      const dep = S.depthEff != null ? S.depthEff : o.depth;
      const { z, ph, hl, ly, alPix, al, km, dl, sb, bb, gl } = S;
      const base = Math.max(0.5, S.sizeCss);
      // teto pela espessura do traço: nenhuma partícula mais larga que ele
      const capBody = Math.max(1, (S.swCss * 0.4) / base);
      const capAcc = Math.max(1, (S.swCss * 0.9) / base);
      const capHalo = Math.max(1, (S.swCss * 0.35) / base);
      const legacy = S.legacy;
      const S5 = SB - 1;
      const f0 = SPR_FACTORS[0],
        f1 = SPR_FACTORS[S5];
      for (let i = 0; i < n; i++) {
        const v = z[i]; // uniforme no corpo, alto nos acentos
        const isA = ly[i] === 1,
          isH = hl[i] === 1;
        let sf, af;
        if (legacy) {
          sf = 1; // grelha antiga: tudo igual
          af = 1;
        } else if (isH) {
          sf = Math.min(0.45 + 0.35 * v, capHalo);
          af = 0.1 + 0.16 * v;
        } else if (isA) {
          sf = Math.min(1.25 + 0.75 * v, capAcc);
          af = 0.82 + 0.18 * v;
        } else {
          sf = Math.min(0.8 + 0.5 * v * (0.6 + 0.4 * dep), capBody);
          af = 0.62 + 0.38 * v * (0.5 + 0.5 * dep);
        }
        let a = alPix[i] * af;
        // corpo nunca invisível (mínimo 0,45× a tinta local do píxel)
        if (!isH && !legacy) a = Math.max(a, alPix[i] * 0.45);
        al[i] = a > 255 ? 255 : a < 6 ? 6 : Math.round(a);
        // baldes de tamanho (8) e de brilho (3) → sprites pré-desenhados
        const bkt = Math.round(((sf - f0) / (f1 - f0)) * S5);
        sb[i] = bkt < 0 ? 0 : bkt > S5 ? S5 : bkt;
        const br = al[i] / 255;
        bb[i] = br > 0.72 ? 2 : br > 0.42 ? 1 : 0;
        // glow aditivo SÓ nos acentos (as "luzes" da referência)
        gl[i] = S.glowEff && isA ? 1 : 0;
        // mola/massa/atraso ligeiramente diferentes por partícula: o
        // regresso acontece em ondas, não em bloco (o depth e o z dão a
        // variação; a grelha antiga fica uniforme)
        const r2 = ph[i] / 6.28318;
        km[i] = legacy
          ? 1
          : 1 +
            dep *
              (0.45 * v + (0.92 + 0.16 * r2 - 1) * 0.6) *
              (isA ? 1.6 : isH ? 1.2 : 1);
        dl[i] = legacy ? 0 : dep * 0.38 * r2 * (0.35 + 0.65 * (1 - v)) * (isA ? 1.5 : 1);
      }
      S.driftAmp = o.drift > 0 ? o.drift : 0;
    }

    // agrupa por cor × camada: três listas de índices por cor (corpo,
    // acentos, halo) — cada passada de desenho percorre uma camada inteira
    // de uma cor, sem mudar de fillStyle/sprite dentro dela
    function regroupTo(S) {
      const n = S.count,
        ci = S.ci,
        ly = S.ly,
        pal = S.pal;
      if (!n || !ci) {
        S.groups = [];
        return;
      }
      const buckets = new Map();
      for (let i = 0; i < n; i++) {
        const k = ci[i];
        let list = buckets.get(k);
        if (!list) buckets.set(k, (list = [[], [], []]));
        // camada: 0 corpo · 1 acento · 2 halo
        list[ly[i] === 1 ? 1 : S.hl && S.hl[i] ? 2 : 0].push(i);
      }
      const groups = [];
      for (const [k, lists] of buckets)
        groups.push({
          style: pal[k].style,
          rgb: pal[k].rgb,
          b: Uint32Array.from(lists[0]),
          a: Uint32Array.from(lists[1]),
          h: Uint32Array.from(lists[2]),
          sprites: null,
          glow: null,
        });
      S.groups = groups;
    }

    // sprites PRÉ-DESENHADOS em cache por cor × balde de tamanho × balde
    // de brilho. Os tamanhos são guardados em px de DISPOSITIVO (W/edpr no
    // desenho): o drawImage faz sempre escala 1.0 e, com a posição
    // quantizada ao píxel de dispositivo, o rasterizador usa o caminho
    // rápido de blit.
    function buildSpritesTo(S) {
      const o = S.opts,
        edpr = S.edpr;
      const tblBody = new Float32Array(SB),
        tblGlow = new Float32Array(SB);
      const wBody = new Int32Array(SB),
        wGlow = new Int32Array(SB);
      for (let b = 0; b < SB; b++) {
        const sd = Math.max(1.1, S.sizeCss * SPR_FACTORS[b]);
        // o soft estica o sprite: o canvas inclui a borda difusa
        const sbCss = o.shape === "soft" ? sd * 1.45 : sd;
        wBody[b] = Math.max(3, Math.round(sbCss * edpr));
        tblBody[b] = wBody[b] / edpr;
        wGlow[b] = Math.max(4, Math.round(sd * 2.6 * edpr));
        tblGlow[b] = wGlow[b] / edpr;
      }
      S.tblBody = tblBody;
      S.tblGlow = tblGlow;
      if (o.shape === "square") {
        // quadradinhos: fillStyle + fillRect, sem sprites (caminho antigo)
        for (const g of S.groups) {
          g.sprites = null;
          g.glow = null;
        }
        return;
      }
      const soft = o.shape === "soft";
      for (const g of S.groups) {
        const spr = new Array(SB * BR);
        for (let b = 0; b < SB; b++)
          for (let br = 0; br < BR; br++)
            spr[b * BR + br] = makeSprite(
              g.rgb,
              wBody[b],
              soft,
              br,
              S.bgLight && o.glow !== "off",
            );
        g.sprites = spr;
        if (S.glowEff) {
          const glw = new Array(SB);
          for (let b = 0; b < SB; b++) glw[b] = makeGlow(g.rgb, wGlow[b]);
          g.glow = glw;
        }
      }
    }

    /* ---- escrita (canvas) — partilhada pela instância e pela medida ---------- */

    // P é a instância ou um estado de sombra: {count, x, y, al, sb, bb, gl,
    // hl, ly, z, ph, groups, tblBody, tblGlow, additive, glowEff, driftAmp,
    // edpr, cwCss, chCss, opts, energy, xf}.
    // Camadas: CORPO sempre em source-over (a forma nunca satura), ACENTOS
    // em aditivo (quando seguro) com glow, HALO por cima em source-over com
    // alpha baixo. A energia da interação acende acentos e halo.
    function paintCloud(ctx, P, now) {
      if (!ctx || !P.count) return;
      if (now == null) now = performance.now();
      // crossfade do random="interval:N": expira aqui, com o tempo do motor
      let xfE = 1;
      if (P.xf) {
        xfE = (now - P.xf.t0) / 900;
        if (xfE >= 1) P.xf = null;
      }
      ctx.clearRect(0, 0, P.cwCss, P.chCss);
      const soft = P.opts.shape !== "square";
      const { x, y, al, sb, bb, gl, z, ph, hl, ly } = P;
      const drift = P.driftAmp || 0;
      const en = P.energy || 0;
      const t = drift > 0 ? now / 1000 : 0;
      const gap = P.gap || 4;
      const tbl = P.tblBody,
        tblG = P.tblGlow;
      const edpr = P.edpr;
      // posições quantizadas ao píxel de dispositivo: com sprites de
      // tamanho exacto (escala 1.0) e coordenadas inteiras, o drawImage usa
      // o caminho rápido de blit em vez do caminho filtrado/escalado
      const Q = (v) => Math.round(v * edpr) / edpr;
      const dxy = [0, 0];
      // desvio do drift: fase/frequência próprias. A amplitude do CORPO é
      // limitada a ~0,25× o espaçamento (máx. 0,6 px) para o contorno não
      // vazar; acentos e halo podem flutuar mais e ganham amplitude com a
      // energia da interação
      const dOff = (i, out) => {
        const isA = ly[i] === 1,
          isH = hl[i] === 1;
        const amp =
          (isA
            ? Math.min(drift, 2)
            : isH
              ? Math.min(drift * 1.7, 2.2)
              : Math.min(drift, gap * 0.25, 0.6)) *
          (isA || isH ? 1 + 1.4 * en : 1);
        const w = 0.5 + 0.7 * z[i];
        out[0] = amp * Math.sin(t * w + ph[i]);
        out[1] = amp * 0.8 * Math.sin(t * w * 0.83 + ph[i] * 1.71 + 1.3);
      };

      // uma camada de um grupo; devolve-se o último globalAlpha para
      // poupar mudanças de estado
      const passLayer = (groups, aMul, layer) => {
        for (let gi = 0; gi < groups.length; gi++) {
          const g = groups[gi];
          const idx = layer === 1 ? g.a : layer === 2 ? g.h : g.b;
          if (!idx || !idx.length) continue;
          // luz: aditivo SÓ na camada dos acentos (e só em fundo escuro);
          // corpo e halo são sempre source-over
          ctx.globalCompositeOperation =
            layer === 1 && P.additive ? "lighter" : "source-over";
          let lastA = -1;
          if (soft) {
            const spr = g.sprites,
              glw = g.glow;
            for (let j = 0; j < idx.length; j++) {
              const i = idx[j];
              let a = (al[i] / 255) * aMul;
              if (layer === 1) a = Math.min(1, a * (0.8 + 0.4 * en));
              else if (layer === 2) a = Math.min(0.6, a * (0.8 + 0.7 * en));
              if (a < 0.012) continue;
              if (drift) dOff(i, dxy);
              else ((dxy[0] = 0), (dxy[1] = 0));
              const px = Q(x[i] + dxy[0]),
                py = Q(y[i] + dxy[1]);
              // halo de glow nos acentos: acende com a energia
              if (layer === 1 && glw && gl[i] && a > 0.05) {
                const sg = tblG[sb[i]];
                ctx.globalAlpha = a * (0.16 + 0.3 * en);
                ctx.drawImage(
                  glw[sb[i]],
                  px - sg / 2,
                  py - sg / 2,
                  sg,
                  sg,
                );
                lastA = -1; // o glow mexeu no globalAlpha: o corpo reescreve
              }
              const sd = tbl[sb[i]];
              if (a !== lastA) ctx.globalAlpha = lastA = a;
              ctx.drawImage(
                spr[sb[i] * BR + bb[i]],
                px - sd / 2,
                py - sd / 2,
                sd,
                sd,
              );
            }
          } else {
            ctx.fillStyle = g.style;
            for (let j = 0; j < idx.length; j++) {
              const i = idx[j];
              let a = (al[i] / 255) * aMul;
              if (layer === 1) a = Math.min(1, a * (0.8 + 0.4 * en));
              else if (layer === 2) a = Math.min(0.6, a * (0.8 + 0.7 * en));
              if (a !== lastA) ctx.globalAlpha = lastA = a;
              if (drift) dOff(i, dxy);
              else ((dxy[0] = 0), (dxy[1] = 0));
              const sd = tbl[sb[i]];
              ctx.fillRect(x[i] + dxy[0] - sd / 2, y[i] + dxy[1] - sd / 2, sd, sd);
            }
          }
        }
      };
      const allPass = (groups, aMul) => {
        passLayer(groups, aMul, 0); // corpo — source-over, letras nítidas
        passLayer(groups, aMul, 1); // acentos — aditivo + glow (as "luzes")
        passLayer(groups, aMul, 2); // halo — source-over, por cima, discreto
      };

      if (P.xf) {
        // random="interval:N": atribuição antiga a sair, nova a entrar
        const e = xfE * xfE * (3 - 2 * xfE); // smoothstep
        allPass(P.xf.groups, 1 - e);
        allPass(P.groups, e);
      } else {
        allPass(P.groups, 1);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    /* ---- sprites (módulo) -------------------------------------------------------- */

    // corpo da partícula: círculo com gradiente radial (soft — núcleo sólido
    // e borda curta, para as letras ficarem nítidas) ou círculo duro
    // (circle). Baldes de brilho mudam a força do núcleo; a alpha fina fica
    // para o globalAlpha no draw. W chega em px de DISPOSITIVO (canvas W×W,
    // sem transform).
    // shadow=true (fundo claro): sombra suave cozida no sprite — a mistura
    // aditiva não funciona aí, por isso a luz vem deste contorno.
    function makeSprite(rgb, W, soft, bright, shadow) {
      const px = W;
      const c = document.createElement("canvas");
      c.width = px;
      c.height = px;
      const g = c.getContext("2d");
      const r = px / 2;
      const R = rgb[0],
        G = rgb[1],
        B = rgb[2];
      if (shadow) {
        g.shadowColor = "rgba(10,14,22,0.4)";
        g.shadowBlur = px * 0.22;
        g.shadowOffsetY = px * 0.05;
      }
      if (soft) {
        // núcleo sólido (misturado com branco) e borda CURTA: a partícula
        // lê-se como bola macia mas a forma acumula tinta como um disco
        const k = bright === 2 ? 1 : bright === 1 ? 0.85 : 0.7;
        const gr = g.createRadialGradient(r, r, 0, r, r, r);
        gr.addColorStop(
          0,
          "rgba(" +
            Math.round(R + (255 - R) * 0.45) +
            "," +
            Math.round(G + (255 - G) * 0.45) +
            "," +
            Math.round(B + (255 - B) * 0.45) +
            "," +
            k +
            ")",
        );
        gr.addColorStop(0.32, "rgba(" + R + "," + G + "," + B + "," + 0.96 * k + ")");
        gr.addColorStop(0.64, "rgba(" + R + "," + G + "," + B + "," + 0.82 * k + ")");
        gr.addColorStop(0.88, "rgba(" + R + "," + G + "," + B + "," + 0.28 * k + ")");
        gr.addColorStop(1, "rgba(" + R + "," + G + "," + B + ",0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, px, px);
      } else {
        g.fillStyle = "rgb(" + R + "," + G + "," + B + ")";
        g.beginPath();
        g.arc(r, r, r, 0, Math.PI * 2);
        g.fill();
      }
      return c;
    }

    // segundo halo, maior e muito transparente — SÓ nos acentos (as "luzes");
    // desenhado em mistura aditiva. W em px de dispositivo.
    function makeGlow(rgb, W) {
      const px = W;
      const c = document.createElement("canvas");
      c.width = px;
      c.height = px;
      const g = c.getContext("2d");
      const r = px / 2;
      const gr = g.createRadialGradient(r, r, 0, r, r, r);
      gr.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.3)");
      gr.addColorStop(0.45, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.11)");
      gr.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, px, px);
      return c;
    }

    // cor calculada do texto; se o próprio elemento já estiver transparente
    // (p. ex. background-clip: text), procura a primeira ascendente visível
    function visibleColor(el) {
      let n = el;
      for (let i = 0; n && n.nodeType === 1 && i < 6; i++) {
        const c = getComputedStyle(n).color;
        if (alphaOf(c) > 0) return c;
        n = n.parentElement;
      }
      return "";
    }

    /* ---- medida de legibilidade ------------------------------------------------ */

    // desfocagem de caixa 3×3 (separável), n iterações — leve e sem filtros
    // de canvas (que nem todos os contextos suportam)
    function blurGray(g, w, h, it) {
      const tmp = new Float32Array(g.length);
      for (let it2 = 0; it2 < it; it2++) {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const l = x > 0 ? g[i - 1] : g[i],
              r = x < w - 1 ? g[i + 1] : g[i];
            tmp[i] = (l + g[i] + r) / 3;
          }
        }
        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            const i = y * w + x;
            const u = y > 0 ? tmp[i - w] : tmp[i],
              d = y < h - 1 ? tmp[i + w] : tmp[i];
            g[i] = (u + tmp[i] + d) / 3;
          }
        }
      }
      return g;
    }

    // correlação normalizada (0..1) entre duas imagens cinzentas
    function nccOf(a, b) {
      let sa = 0,
        sb = 0;
      const n = a.length;
      for (let i = 0; i < n; i++) {
        sa += a[i];
        sb += b[i];
      }
      const ma = sa / n,
        mb = sb / n;
      let cov = 0,
        va = 0,
        vb = 0;
      for (let i = 0; i < n; i++) {
        const da = a[i] - ma,
          db = b[i] - mb;
        cov += da * db;
        va += da * da;
        vb += db * db;
      }
      return va > 1e-6 && vb > 1e-6 ? cov / Math.sqrt(va * vb) : 0;
    }

    // dilatação (máximo numa vizinhança (2r+1)×(2r+1)) — usada para a zona
    // "dentro da forma" da medida de legibilidade
    function dilateMax(g, w, h, r) {
      const out = new Float32Array(g.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let m = 0;
          for (let dy = -r; dy <= r; dy++) {
            const yy = y + dy;
            if (yy < 0 || yy >= h) continue;
            const row = yy * w;
            for (let dx = -r; dx <= r; dx++) {
              const xx = x + dx;
              if (xx < 0 || xx >= w) continue;
              const v = g[row + xx];
              if (v > m) m = v;
            }
          }
          out[y * w + x] = m;
        }
      }
      return out;
    }

    // amostragem em caixa: reduz a região [x0..x0+bw)×[y0..y0+bh) dos dados
    // da máscara (alpha da tinta) para dw×dh cinzentos 0..1 — sem canvas
    // intermédio (o raster por software falha drawImage de canvases grandes)
    function downsampleGray(data, cw, ch, x0, y0, bw, bh, dw, dh) {
      const g = new Float32Array(dw * dh);
      const sx = bw / dw,
        sy = bh / dh;
      for (let dy = 0; dy < dh; dy++) {
        const yA = y0 + dy * sy,
          yB = y0 + (dy + 1) * sy;
        for (let dx = 0; dx < dw; dx++) {
          const xA = x0 + dx * sx,
            xB = x0 + (dx + 1) * sx;
          let sum = 0,
            n = 0;
          for (let y = Math.floor(yA); y < Math.min(ch, Math.ceil(yB)); y++) {
            const row = y * cw;
            for (let x = Math.floor(xA); x < Math.min(cw, Math.ceil(xB)); x++) {
              sum += data[(row + x) * 4 + 3];
              n++;
            }
          }
          g[dy * dw + dx] = n ? sum / (n * 255) : 0;
        }
      }
      return g;
    }

    // Medida de legibilidade do estado assente (0..1): rende as partículas
    // no lugar, compara com a máscara de referência do texto — ambas
    // ligeiramente desfocadas — por correlação normalizada, e penaliza a
    // tinta que fugiu à forma (spill: halo, poeira, dispersão).
    // op = {dpr: medida com DPR imposto (re-amostragem offscreen)}.
    // O preset "legible" com defaults deve pontuar ≥ 0,75.
    function measureLegibility(S, op) {
      if (!S || !S.count || !S.el) return null;
      const dpr = S.edpr;
      const cw = Math.min(4096, Math.ceil(S.cwCss * dpr));
      const ch = Math.min(4096, Math.ceil(S.chCss * dpr));
      // 1) máscara de referência: os PÍXEIS (nunca blit de canvas grande)
      const mdata = S.maskData
        ? S.maskData
        : drawTextMask(
            S.el,
            S.el.getBoundingClientRect(),
            S.margin,
            cw,
            ch,
            dpr,
            S.colorCache ? S : null,
          ).data;
      // 2) caixa da tinta (da máscara) com uma folga curta
      const bb0 = S.bbox || { x0: 0, y0: 0, x1: cw - 1, y1: ch - 1 };
      const pad = 4;
      const x0 = Math.max(0, bb0.x0 - pad),
        y0 = Math.max(0, bb0.y0 - pad);
      const x1 = Math.min(cw - 1, bb0.x1 + pad),
        y1 = Math.min(ch - 1, bb0.y1 + pad);
      const bw = x1 - x0 + 1,
        bh = y1 - y0 + 1;
      if (bw < 8 || bh < 8) return null;
      // 3) reduz as duas para ≤ ~240 px no lado maior (compara à escala da
      // leitura, não ao píxel): a MÁSCARA por amostragem em caixa dos dados
      // (sem canvas intermédio — o raster por software falha blits de
      // canvases grandes); as partículas em resolução nativa (canvas novo,
      // ainda sem leituras) e recorte por drawImage
      const sc = Math.min(1, 240 / Math.max(bw, bh));
      const dw = Math.max(8, Math.round(bw * sc)),
        dh = Math.max(8, Math.round(bh * sc));
      const ga = downsampleGray(mdata, cw, ch, x0, y0, bw, bh, dw, dh);
      const res = document.createElement("canvas");
      res.width = cw;
      res.height = ch;
      const rctx = res.getContext("2d");
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const P = Object.create(S);
      P.driftAmp = 0;
      P.xf = null;
      P.energy = 0;
      paintCloud(rctx, P, 0);
      const crop = document.createElement("canvas");
      crop.width = dw;
      crop.height = dh;
      const cctx = crop.getContext("2d", { willReadFrequently: !0 });
      cctx.drawImage(res, x0, y0, bw, bh, 0, 0, dw, dh);
      const dB = cctx.getImageData(0, 0, dw, dh).data;
      const gb = new Float32Array(dw * dh);
      for (let i = 0; i < dw * dh; i++)
        gb[i] =
          (0.2126 * dB[i * 4] + 0.7152 * dB[i * 4 + 1] + 0.0722 * dB[i * 4 + 2]) /
          255;
      // 4) desfoca ligeiramente AMBOS (a leitura humana não é ao píxel)
      blurGray(ga, dw, dh, 2);
      blurGray(gb, dw, dh, 2);
      // 5) NCC + penalização da tinta fora da forma (spill). A zona "dentro"
      // é DILATADA: a franja dos contornos e o glow dos acentos, que beijam
      // a forma, não contam como fuga — só a poeira que foge de vez (espaço
      // entre palavras, contadores abertos). Zona morta: um halo discreto
      // não pune; a fuga grande sim.
      const ncc = nccOf(ga, gb);
      const gad = dilateMax(ga, dw, dh, 2);
      let inSum = 0,
        outSum = 0;
      for (let i = 0; i < dw * dh; i++) {
        if (gad[i] > 0.12) inSum += gb[i];
        else outSum += gb[i];
      }
      const raw = outSum / (outSum + inSum + 1e-6);
      const spill = clamp((raw - 0.22) / 0.5, 0, 1);
      const score = clamp(ncc * (1 - 0.45 * spill), 0, 1);
      const r3 = (v) => Math.round(v * 1000) / 1000;
      return {
        score: r3(score),
        ncc: r3(ncc),
        spill: r3(spill),
        count: S.count,
        dpr: Math.round(dpr * 100) / 100,
        sizeCss: Math.round(S.sizeCss * 100) / 100,
        gap: S.gap,
        swCss: Math.round(S.swCss * 100) / 100,
      };
    }

    // estado sombra: re-amostragem OFFSCREEN completa (mesma seed e opções)
    // com DPR imposto — serve para medir legibilidade a DPR 1 e 2 sem tocar
    // na instância viva nem no DOM
    function shadowState(inst, dpr) {
      try {
        const st = buildState(inst.el, inst.opts, inst.seed, dpr, null);
        if (!st) return null;
        st.rsCount = inst.rsCount;
        applyColorsTo(st);
        factorsTo(st);
        regroupTo(st);
        buildSpritesTo(st);
        return st;
      } catch (e) {
        return null;
      }
    }

    /* ---- Ciclo de vida --------------------------------------------------------- */

    function build(x) {
      if (!core || !canParticles) return null;
      const el = toEl(x);
      if (
        !el ||
        el.nodeType !== 1 ||
        !el.hasAttribute ||
        !el.hasAttribute("data-emerge-particles")
      )
        return null;
      if (instances.has(el)) return instances.get(el);
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        return null;
      if (core.isDisabledFor(el, "particles")) return null;
      // NÃO combinar com data-emerge-split (plugin Text): o texto tem de
      // estar intacto para ser amostrado — recusa e avisa em modo debug.
      if (el.hasAttribute("data-emerge-split") || el.querySelector(SPLIT_NODES)) {
        core.attr(el, "debug", !1) &&
          console.warn(
            "[Emerge Particles] data-emerge-split no mesmo elemento não é suportado — partículas ignoradas:",
            el,
          );
        return null;
      }
      const inst = new ParticlesInstance(el, resolveOptions(el));
      // semente do gerador: fixada no build — o resize volta a amostrar com a
      // mesma semente e a nuvem não "treme"
      inst.seed =
        inst.opts.seed > 0 ? Math.round(inst.opts.seed) : (Math.random() * 0x7fffffff) | 0;
      instances.set(el, inst);
      // não reclamar elementos do pipeline core ([data-emerge] + particles)
      el.hasAttribute("data-emerge") || core.claim(el, "Particles");
      el.classList.add("emerge-particles");
      // touch-action vive no CSS (uma classe por modo); scroll/off = nativo
      (inst.opts.touch === "pan-y" || inst.opts.touch === "track") &&
        el.classList.add("emerge-particles-touch-" + inst.opts.touch);
      inst.mount();
      watchVisibility();
      io && io.observe(el);
      wire();
      watch();
      core.dispatch("emerge:particles:build", { el });
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
      if (!core || !canParticles) return;
      (root || document).querySelectorAll(HOST).forEach((el) => {
        instances.has(el) || build(el);
      });
    }

    // instância de um elemento (ou null) — usada pela API e por resample/disperse
    function of(x) {
      const el = toEl(x);
      return (el && instances.get(el)) || null;
    }

    // volta a amostrar um elemento (ou todos, se x for omitido) — p. ex.
    // depois de mudar o texto ou as opções via JS
    function resample(x) {
      if (x == null) {
        instances.forEach((inst) => inst.resample());
        return;
      }
      const inst = of(x);
      inst && inst.resample();
    }

    // leituras de layout actualizadas (após mudanças do autor); re-amostra
    // quem mudou de tamanho
    function measure() {
      instances.forEach((inst) => inst.measure());
    }

    /* ---- API programática (Emerge.Particles) -------------------------------- */

    return {
      name: "Particles",
      defaults: {
        particlesMode: "repel",
        particlesGap: null, // automático (espessura do traço + DPR)
        particlesSize: null, // automático (limitado pela espessura do traço)
        particlesShape: "soft", // soft | circle | square
        particlesColor: null, // automático (cor calculada do texto)
        particlesRadius: 100,
        particlesStrength: 1,
        particlesReturn: 1,
        particlesFriction: 0.92,
        particlesIntro: "none",
        particlesMax: null, // automático (~4000 desktop / ~2500 mobile)
        particlesTouch: "pan-y",
        // novos na v1.7.2 (legibilidade primeiro):
        particlesLook: "legible", // legible (padrão) | cloud | grid (legado)
        particlesContrast: null, // 0..1 — 1 = mais corpo, 0 = mais nuvem
        particlesSampling: "organic", // organic | grid (o grid força look=grid)
        particlesSeed: null, // semente do aleatório (0/nulo = automática)
        particlesDensity: null, // 0.1..1 — explícito ganha ao blend do look
        particlesDepth: null, // 0..1 — modula sobretudo os acentos
        particlesHalo: null, // 0..1 — teto: 10% do total, junto aos contornos
        particlesGlow: "auto", // auto | on | off — glow aditivo (só acentos)
        particlesJitter: null, // 0..1 — efetivo ≤ 0,5 (½ célula)
        particlesDrift: null, // px — corpo ≤ ~0,6 px na prática
        particlesColorJitter: 0.3, // 0..1 — variação HSL à volta da cor
        particlesColorAngle: 0, // ângulo do gradient(), em graus
        particlesColorWeights: null, // pesos da paleta, "1,2,1"
        particlesRandom: "build", // build | resample | interval:N
        particlesRandomHue: "0-360", // intervalo de matiz do random
        particlesRandomSat: "65-95", // intervalo de saturação do random
        particlesRandomLight: "55-80", // intervalo de luminosidade do random
      },
      install: (c) => (
        (core = c),
        {
          build,
          destroy,
          destroyAll,
          scan,
          resample,
          measure,
          of,
          // impulso manual: dispersa as partículas a partir de um ponto
          // (px/py em px relativos ao elemento; omitidos = centro)
          disperse: (x, px, py) => {
            const inst = of(x);
            inst && inst.disperse(px, py);
          },
          // muda a cor em runtime SEM voltar a amostrar: aceita tudo o que a
          // opção color aceita ("text", cor CSS, paleta "a,b,c", "random",
          // "gradient(#a,#b,…)") — recalcula cores, grupos e sprites
          setColor: (x, value) => {
            const inst = of(x);
            if (!inst || inst.dead || !inst.sampled) return !1;
            inst.opts.color = value == null ? "" : String(value);
            parseColorSpec(inst.opts.color).kind === "random" && inst.rsCount++;
            inst.applyColors();
            inst.refit();
            inst.scheduleRandom();
            inst.draw();
            return !0;
          },
          // medida de legibilidade do estado assente (0..1): {score, ncc,
          // spill, count, dpr, …}. op = {dpr: 1|2} mede com um DPR imposto
          // (re-amostragem offscreen, sem tocar na instância).
          legibility: (x, op) => {
            const inst = of(x);
            if (!inst || inst.dead || !inst.sampled || !inst.count) return null;
            const dpr = op && Number(op.dpr);
            if (dpr && Math.abs(dpr - inst.edpr) > 0.05) {
              const st = shadowState(inst, clamp(dpr, 0.5, 3));
              return st ? measureLegibility(st, op) : null;
            }
            return measureLegibility(inst, op);
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }) {
          core.hasAttr(el, "particles") && build(el);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && destroy(el);
        },
        init() {
          scan(document);
          watchVisibility();
          watch();
        },
        refresh() {
          // instâncias fora do documento ou que passaram a estar desativadas
          // (mudança de breakpoint/dispositivo/reduced-motion), novos
          // elementos e re-amostragem de quem mudou de tamanho — o core
          // chama este hook com debounce no resize/orientationchange.
          const gone = [];
          instances.forEach((inst, el) => {
            (!el.isConnected ||
              core.isDisabledFor(el, "particles") ||
              (core.options.respectReducedMotion && core.prefersReducedMotion())) &&
              gone.push(el);
          });
          gone.forEach(destroy);
          scan(document);
          measure();
        },
        teardown() {
          destroyAll();
          observer && (observer.disconnect(), (observer = null));
          io && (io.disconnect(), (io = null));
          rafId && (cancelAnimationFrame(rafId), (rafId = 0));
          lastTime = 0;
          lastSlow = 0;
          ptr.has = !1;
          clearTimeout(fontsTimer);
          unwire();
        },
      },
    };
});
