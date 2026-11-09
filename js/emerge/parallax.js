/*! Emerge.js v1.7.2 — plugin Parallax (global: EmergeParallax) */
(function (i, d) {
    typeof exports == "object" && typeof module != "undefined"
      ? (module.exports = d())
      : typeof define == "function" && define.amd
        ? define(d)
        : (i.EmergeParallax = d());
  })(this, function () {
    "use strict";
    // Parallax — deslocamento ligado ao scroll (v1.6.0).
    // Marcação: data-emerge-parallax="0.3" no elemento (o valor é a velocidade;
    // vazio = padrão) e data-emerge-parallax-layer="0.5" nos filhos de um
    // contentor, para parallax em profundidade (cada camada com o seu factor).
    // Motor: o plugin Range (core.range.watch), como no Horizontal/Stack/Scene
    // — nenhum listener de scroll próprio. O progresso do Range (janela
    // data-emerge-parallax-from/to, por omissão "enter"→"exit") é mapeado para
    // um deslocamento CENTRADO: t = -speed · (p − .5) · span. No meio do
    // percurso o elemento está exactamente na posição natural e as zonas de
    // repouso (p=0 e p=1) acontecem fora do viewport, por isso não há "saltos"
    // nem pausas visíveis. O sinal negativo faz com que speed positivo "ande à
    // frente" do scroll (aparenta percorrer mais de 100% do trajeto — primeiro
    // plano) e speed negativo "fique atrás" (menos de 100% — fundo clássico);
    // speed −1 congela o elemento no ecrã enquanto a janela atravessa.
    // Escrita: as propriedades individuais `translate`/`rotate`/`scale` (e
    // `opacity`) — compõem com o `transform` do autor e com os efeitos dos
    // outros plugins; sem suporte do browser, o plugin fica inerte (padrão
    // Magnetic). Um ciclo de escrita por frame com guarda "só escreve se o
    // valor mudou" (padrão `last` do Scene). will-change só enquanto o
    // elemento atravessa o viewport (classe .emerge-parallax-live, gerida pelo
    // JS como .emerge-scene-live). prefers-reduced-motion e isDisabledFor:
    // nada é escrito — o elemento fica na posição natural, sem alterações de
    // layout. data-emerge no mesmo elemento continua a funcionar (fade-in do
    // Emerge + parallax): só se "reclama" (core.claim) quem não está no
    // pipeline do core. O Range publica --emerge-progress (0..1) no elemento.
    // Prioridade das opções: atributo no elemento > token CSS
    // (--emerge-parallax-*) > opção global do Emerge.init > default do plugin
    // (o mesmo critério do Scene/Magnetic).
    // Elementos adicionados/removidos dinamicamente: o observer do core só
    // vigia nós [data-emerge], por isso o Parallax mantém UM observer próprio
    // e partilhado (padrão do Spotlight/Magnetic), respeitando a opção
    // disableMutationObserver do core. O resize/orientationchange são tratados
    // pelo core (hooks.refresh) e pelo próprio Range (re-measure), incluindo a
    // mudança de altura do viewport (barra de endereço mobile).
    let core = null;
    const instances = new Map(), // el -> instância
      HOST = "[data-emerge-parallax]",
      LAYER = "[data-emerge-parallax-layer]",
      // propriedades que o plugin escreve — limpas no destroy
      CLEAN = ["translate", "rotate", "scale", "opacity"],
      DEFAULT_SPEED = 0.3;
    // transformações individuais — necessárias para não esmagar o transform
    // do autor; sem suporte, o plugin fica inerte (nada é escrito).
    const canParallax =
      typeof CSS != "undefined" &&
      CSS.supports &&
      CSS.supports("translate", "0px") &&
      CSS.supports("rotate", "1deg") &&
      CSS.supports("scale", "2");
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const toEl = (x) => (typeof x == "string" ? document.querySelector(x) : x);

    /* ---- Opções: atributo no elemento > token CSS > global > default ---- */

    function cssToken(el, name) {
      try {
        const v = getComputedStyle(el)
          .getPropertyValue("--emerge-parallax-" + name)
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
      if (core.hasAttr(el, "parallax-" + name)) {
        const n = Number(String(core.attr(el, "parallax-" + name, "")).trim());
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

    function strOption(el, name, key, fallback) {
      if (core.hasAttr(el, "parallax-" + name)) {
        const v = String(core.attr(el, "parallax-" + name, "")).trim();
        if (v !== "") return v;
      }
      const t = cssToken(el, name);
      if (t !== null && t !== "") return t;
      const g = globalOption(key);
      if (g !== null && String(g).trim() !== "") return String(g).trim();
      return fallback;
    }

    function axisOption(el) {
      const v = strOption(el, "axis", "parallaxAxis", "y").toLowerCase();
      return v === "x" || v === "both" ? v : "y";
    }

    // data-emerge-parallax="" (vazio) = padrão; "0.3" = velocidade 0.3;
    // o atributo data-emerge-parallax-speed segue a cadeia normal de opções.
    function mainSpeed(el) {
      const raw = el.getAttribute("data-emerge-parallax");
      if (raw !== null && String(raw).trim() !== "") {
        const n = Number(String(raw).trim());
        if (!Number.isNaN(n)) return n;
      }
      return numOption(el, "speed", "parallaxSpeed", DEFAULT_SPEED);
    }

    // data-emerge-parallax-layer="0.5" — factor da camada (vazio/inválido = 1).
    function layerFactor(layer) {
      const raw = layer.getAttribute("data-emerge-parallax-layer");
      if (raw !== null && String(raw).trim() !== "") {
        const n = Number(String(raw).trim());
        if (!Number.isNaN(n)) return n;
      }
      return 1;
    }

    function resolveOptions(el) {
      return {
        speed: mainSpeed(el),
        axis: axisOption(el),
        // valores FINAIS ligados ao progresso (rotate/scale partem do estado
        // natural 0deg/1; opacity desce de 1 para o valor); null = desligado
        rotate: numOption(el, "rotate", "parallaxRotate", null),
        scale: numOption(el, "scale", "parallaxScale", null),
        opacity: numOption(el, "opacity", "parallaxOpacity", null),
        // janela do Range (sintaxe existente: "enter", "top@50%", "+300"…)
        from: strOption(el, "from", "parallaxFrom", "enter"),
        to: strOption(el, "to", "parallaxTo", "exit"),
        // suavização em segundos, mapeada para o "follow" do Range
        smooth: Math.max(0, numOption(el, "smooth", "parallaxSmooth", 0)),
        // seletor de um filho a animar em vez do próprio elemento
        target: strOption(el, "target", "parallaxTarget", "") || null,
        debug: !!core.attr(el, "debug", !1), // padrão Range: data-emerge-debug
      };
    }

    /* ---- Escrita: um ciclo por frame, guarda "só escreve se mudou" ---- */

    function write(el, memo, prop, value) {
      if (memo[prop] === value) return;
      memo[prop] = value;
      el.style[prop] = value;
    }

    function paint(inst, p) {
      if (!inst.range) return;
      const o = inst.opts;
      // deslocamento centrado no progresso (ver o comentário do cabeçalho)
      const travel = -o.speed * (p - 0.5) * inst.range.span;
      const tx = o.axis === "y" ? 0 : travel;
      const ty = o.axis === "x" ? 0 : travel;
      write(
        inst.target,
        inst.last,
        "translate",
        tx.toFixed(2) + "px " + ty.toFixed(2) + "px",
      );
      // rotate/scale/opacity: do estado natural ao valor final no fim do percurso
      if (o.rotate !== null)
        write(inst.target, inst.last, "rotate", (o.rotate * p).toFixed(3) + "deg");
      if (o.scale !== null)
        write(inst.target, inst.last, "scale", (1 + (o.scale - 1) * p).toFixed(4));
      if (o.opacity !== null)
        write(
          inst.target,
          inst.last,
          "opacity",
          clamp(1 + (o.opacity - 1) * p, 0, 1).toFixed(4),
        );
      // camadas: o mesmo progresso, cada uma com o seu factor
      for (const l of inst.layers) {
        const lx = o.axis === "y" ? 0 : travel * l.factor;
        const ly = o.axis === "x" ? 0 : travel * l.factor;
        write(
          l.el,
          l.last,
          "translate",
          lx.toFixed(2) + "px " + ly.toFixed(2) + "px",
        );
      }
      // will-change só enquanto atravessa o viewport (padrão .emerge-scene-live)
      const live = p > 0 && p < 1;
      if (live !== inst.live) {
        inst.live = live;
        inst.el.classList.toggle("emerge-parallax-live", live);
      }
    }

    /* ---- Camadas (data-emerge-parallax-layer) ----------------------------- */

    function attachLayer(inst, layer) {
      const existing = inst.layers.find((l) => l.el === layer);
      if (existing) {
        existing.factor = layerFactor(layer); // relê o factor (pode ter mudado)
        return inst;
      }
      // um contentor parallax aninhado é o dono das suas próprias camadas
      if (layer.closest(HOST) !== inst.el) return inst;
      inst.layers.push({ el: layer, factor: layerFactor(layer), last: {} });
      layer.classList.add("emerge-parallax-layer");
      layer.hasAttribute("data-emerge") || core.claim(layer, "Parallax");
      return inst;
    }

    function detachLayer(inst, layer) {
      const i = inst.layers.findIndex((l) => l.el === layer);
      if (i < 0) return inst;
      const l = inst.layers.splice(i, 1)[0];
      l.el.classList.remove("emerge-parallax-layer");
      CLEAN.forEach((p) => l.el.style.removeProperty(p));
      l.el.hasAttribute("data-emerge") || core.release(l.el);
      return inst;
    }

    function collectLayers(inst) {
      inst.el.querySelectorAll(LAYER).forEach((layer) => attachLayer(inst, layer));
    }

    /* ---- Alvo (data-emerge-parallax-target) -------------------------------- */

    // troca o elemento escrito; limpa o que o plugin tinha escrito no anterior
    function setTarget(inst, next) {
      const t = inst.target;
      if (t && t !== inst.el) {
        t.classList.remove("emerge-parallax-target");
        CLEAN.forEach((p) => t.style.removeProperty(p));
        t.hasAttribute("data-emerge") || core.release(t);
      }
      inst.target = next || inst.el;
      inst.last = {};
      if (inst.target !== inst.el) {
        inst.target.classList.add("emerge-parallax-target");
        inst.target.hasAttribute("data-emerge") || core.claim(inst.target, "Parallax");
      }
      return inst;
    }

    function resolveTarget(inst) {
      if (!inst.opts.target) return setTarget(inst, inst.el);
      const t = inst.el.querySelector(inst.opts.target);
      if (!t) {
        inst.debug &&
          console.warn(
            "[Emerge Parallax] target não encontrado:",
            inst.opts.target,
            inst.el,
          );
        return setTarget(inst, inst.el);
      }
      return setTarget(inst, t);
    }

    /* ---- Ciclo de vida ------------------------------------------------------ */

    function build(x) {
      if (!core || !canParallax) return null;
      const el = toEl(x);
      if (
        !el ||
        el.nodeType !== 1 ||
        !el.hasAttribute ||
        !el.hasAttribute("data-emerge-parallax")
      )
        return null;
      if (instances.has(el)) return instances.get(el);
      if (core.options.respectReducedMotion && core.prefersReducedMotion())
        return null;
      if (core.isDisabledFor(el, "parallax")) return null;
      const inst = {
        el,
        target: el,
        layers: [],
        opts: resolveOptions(el),
        range: null,
        last: {},
        live: !1,
        debug: !!core.attr(el, "debug", !1),
      };
      instances.set(el, inst);
      resolveTarget(inst);
      // não reclamar elementos do pipeline core ([data-emerge] + parallax)
      el.hasAttribute("data-emerge") || core.claim(el, "Parallax");
      el.classList.add("emerge-parallax");
      collectLayers(inst);
      wire(inst);
      paint(inst, 0); // estado inicial inline logo no build (sem flash)
      core.dispatch("emerge:parallax:build", {
        el,
        target: inst.target !== el ? inst.target : null,
        layers: inst.layers.map((l) => l.el),
      });
      return inst;
    }

    function wire(inst) {
      const range = core.range; // Parallax depende do Range (incluído no bundle)
      if (!range) return;
      inst.range = range.watch({
        on: inst.el,
        from: inst.opts.from,
        to: inst.opts.to,
        // "smooth" (segundos) mapeado para o follow do Range, como o scrub do Scene
        follow: inst.opts.smooth > 0 ? inst.opts.smooth : !1,
        cssFollow: !1,
        debug: inst.debug,
        onProgress(r) {
          paint(inst, clamp(r.progress, 0, 1));
        },
      });
    }

    function destroy(x) {
      const el = toEl(x);
      const inst = el && instances.get(el);
      if (!inst) return !1;
      inst.range && inst.range.stop();
      inst.layers.slice().forEach((l) => detachLayer(inst, l.el));
      setTarget(inst, null);
      inst.el.classList.remove("emerge-parallax", "emerge-parallax-live");
      // o Range (follow: false) adiciona a classe animada do core ao cruzar o
      // início da janela — comportamento normal de qualquer watch com follow
      // off (o mesmo que acontece com data-emerge-follow); em elementos fora
      // do pipeline do core não tem efeito visual, mas limpamos no destroy
      inst.el.hasAttribute("data-emerge") ||
        inst.el.classList.remove(core.options.animatedClassName);
      CLEAN.forEach((p) => inst.el.style.removeProperty(p));
      inst.el.hasAttribute("data-emerge") || core.release(inst.el);
      instances.delete(inst.el);
      core.dispatch("emerge:parallax:destroy", { el: inst.el });
      return !0;
    }

    function destroyAll() {
      Array.from(instances.keys()).forEach(destroy);
    }

    function scan(root) {
      if (!core || !canParallax) return;
      (root || document).querySelectorAll(HOST).forEach((el) => {
        instances.has(el) || build(el);
      });
    }

    // relê as opções (apanha tokens alterados em @media), troca o alvo se o
    // nó mudou, reconstrói quando a janela do Range mudou e re-medir o resto.
    function watchKey(o) {
      return [o.from, o.to, o.smooth, o.target || ""].join("|");
    }

    function measure() {
      const rebuild = [];
      instances.forEach((inst, el) => {
        const before = watchKey(inst.opts);
        inst.opts = resolveOptions(el);
        resolveTarget(inst);
        collectLayers(inst);
        if (watchKey(inst.opts) !== before || !inst.range) {
          rebuild.push(el);
          return;
        }
        inst.range.progress != null &&
          paint(inst, clamp(inst.range.progress, 0, 1));
        inst.range.measure();
      });
      rebuild.forEach((el) => {
        destroy(el);
        build(el);
      });
    }

    /* ---- Observer próprio (elementos dinâmicos) ----------------------------- */

    let observer = null;

    // O core só vigia nós [data-emerge] — o Parallax mantém UM observer
    // próprio e partilhado (padrão do Spotlight/Magnetic), respeitando
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

    function attachToHost(layer) {
      const host = layer.closest(HOST);
      const inst = host && instances.get(host);
      inst && attachLayer(inst, layer);
    }

    function onAdded(node) {
      if (node.nodeType !== 1 || !node.matches) return;
      node.matches(HOST) && build(node);
      node.matches(LAYER) && attachToHost(node);
      node.querySelectorAll &&
        node.querySelectorAll(HOST + "," + LAYER).forEach((n) => {
          n.matches(LAYER) ? attachToHost(n) : build(n);
        });
    }

    function onMutations(recs) {
      for (const rec of recs) rec.addedNodes.forEach(onAdded);
      // instâncias cujo host saiu do documento (após o loop, para nós apenas
      // movidos não serem destruídos e recriados — padrão do Spotlight)
      instances.forEach((inst, el) => {
        el.isConnected || destroy(el);
      });
      // camadas que saíram do documento ou trocaram de contentor
      instances.forEach((inst) => {
        for (let i = inst.layers.length - 1; i >= 0; i--) {
          const l = inst.layers[i];
          (!l.el.isConnected || l.el.closest(HOST) !== inst.el) &&
            detachLayer(inst, l.el);
        }
        // alvo que saiu do documento: volta ao próprio elemento
        inst.target !== inst.el &&
          !inst.target.isConnected &&
          resolveTarget(inst);
      });
      // repõe o deslocamento actual nas instâncias afectadas
      instances.forEach((inst) => {
        inst.range && paint(inst, clamp(inst.range.progress, 0, 1));
      });
    }

    /* ---- API programática (Emerge.Parallax) -------------------------------- */

    return {
      name: "Parallax",
      defaults: {
        parallaxSpeed: DEFAULT_SPEED,
        parallaxAxis: "y",
        parallaxRotate: null,
        parallaxScale: null,
        parallaxOpacity: null,
        parallaxFrom: "enter",
        parallaxTo: "exit",
        parallaxSmooth: 0,
        parallaxTarget: null,
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
          measure,
          of: (x) => {
            const el = toEl(x);
            return (el && instances.get(el)) || null;
          },
          get all() {
            return Array.from(instances.values());
          },
        }
      ),
      hooks: {
        observe({ el }) {
          core.hasAttr(el, "parallax") && build(el);
        },
        unobserve({ el }) {
          const inst = instances.get(el);
          inst && !el.isConnected && destroy(el);
        },
        init() {
          scan(document);
          watch();
        },
        refresh() {
          // instâncias fora do documento ou que passaram a estar desativadas
          // (mudança de breakpoint/dispositivo), novos elementos e opções
          // relidas — simétrico do Scene/Magnetic.
          const gone = [];
          instances.forEach((inst, el) => {
            (!el.isConnected ||
              core.isDisabledFor(el, "parallax") ||
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
        },
      },
    };
});
