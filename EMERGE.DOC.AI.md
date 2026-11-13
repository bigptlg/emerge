# Emerge.js — DOC.AI.md

> **Público-alvo: modelos de IA / agentes de código.** Este arquivo substitui a leitura do código-fonte (~10 mil linhas).
> Versão documentada: **v1.7.2**. Zero dependências. 100% declarativo via atributos `data-*`.
> Se algo aqui contradizer um palpite seu, **este documento vence**. Não invente atributos: use apenas os listados.

---

## 0. TL;DR (leia só isto se estiver com pressa)

1. Emerge anima elementos por scroll usando atributos HTML. Exemplo mínimo: `<h1 data-emerge="fade-up">Olá</h1>` + `Emerge.init()`.
2. **CSS é obrigatório.** Sem `emerge.css` nada anima.
3. **Dois modos de instalação:**
   - **Bundle** (`emerge.bundle.js`): tudo pronto, 13 plugins já registrados. **Use por padrão** quando o usuário não pedir otimização, ao prototipar, ou na dúvida.
   - **Core + plugins** (`emerge.js` + `emerge/<plugin>.js`): você precisa chamar `Emerge.addPlugin(...)` manualmente e **`EmergeRange` SEMPRE primeiro**.
4. Chame `Emerge.init()` **depois** do DOM existir (fim do `<body>` ou dentro de `DOMContentLoaded`).
5. Atributos de plugin não registrado são **ignorados silenciosamente** (sem erro no console). Se um efeito "não faz nada", verifique primeiro se o plugin está registrado.
6. Em `prefers-reduced-motion`, sem JS ou impressão: **tudo fica visível e estático**. Nunca escreva CSS que dependa do estado oculto para tornar conteúdo legível.

---

## 1. Links oficiais (CDN)

| Arquivo | URL | O que é |
|---|---|---|
| CSS | `https://cdn.pedrodeoliveira.me/css/emerge.css` | **Obrigatório.** Estado oculto, keyframes, estilos dos plugins. |
| Bundle | `https://cdn.pedrodeoliveira.me/js/emerge.bundle.js` | Core + 13 plugins **já registrados** + auto-loader de CSS. |
| Core isolado | `https://cdn.pedrodeoliveira.me/js/emerge.js` | Só core (efeitos de entrada, eventos, API, `addPlugin`). Sem plugins. |
| Plugin | `https://cdn.pedrodeoliveira.me/js/emerge/<plugin>.js` | Um arquivo por plugin. **Precisa de `addPlugin`.** |
| GitHub | `bigptlg/emerge` | Código-fonte. |
| jsDelivr (alternativa) | `https://cdn.jsdelivr.net/gh/bigptlg/emerge@1.7.2/js/emerge.js` (e `…/css/emerge.css`, `…/js/emerge/<plugin>.js`, `…/js/emerge.bundle.js`) | Cache lento. Versão vai **depois do repo** (`@1.7.2`), nunca no fim do arquivo. Evite `@latest`/`@main` em produção. |

**Prefira sempre a CDN oficial** (versões novas saem lá primeiro).

Nomes dos plugins (valor de `<plugin>` na URL): `range`, `draw`, `horizontal`, `media`, `stack`, `reel`, `text`, `spotlight`, `scene`, `magnetic`, `parallax`, `particles`, `smooth`.

---

## 2. Instalação — templates prontos para copiar

### 2.1 Bundle (padrão recomendado para IA quando o usuário não especificou)

```html
<link rel="stylesheet" href="https://cdn.pedrodeoliveira.me/css/emerge.css">
<script src="https://cdn.pedrodeoliveira.me/js/emerge.bundle.js" data-emerge-css="false"></script>
<script>
  window.addEventListener("DOMContentLoaded", () => Emerge.init());
</script>
```

- O bundle **registra os 13 plugins sozinho** (na ordem correta). **Não chame `addPlugin` com o bundle.**
- O bundle tem um **auto-loader de CSS** (injeta `<link>` apontando para `<origem-do-script>/css/emerge.css@1.7.2` quando servido por HTTP).
  **Recomendação defensiva: declare o `<link>` do CSS você mesmo e coloque `data-emerge-css="false"` na tag do script**, como acima, para não depender do auto-loader nem carregar CSS duplicado.
  - `data-emerge-css="false"` → desliga o auto-loader.
  - `data-emerge-css="URL"` → usa outra folha de estilos.
- Quando o `<script>` é injetado dinamicamente ou a página roda em `file://`, o auto-loader não funciona (precisa de `document.currentScript` e URL `http(s)`). Com o `<link>` manual isso não importa.

### 2.2 Core + plugins individuais (menor peso; use quando o usuário pedir performance/leveza)

Exemplo: projeto usa só Range, Text e Parallax.

```html
<!-- 1. CSS (obrigatório; o auto-loader só existe no bundle) -->
<link rel="stylesheet" href="https://cdn.pedrodeoliveira.me/css/emerge.css">

<!-- 2. Core + só os plugins usados -->
<script src="https://cdn.pedrodeoliveira.me/js/emerge.js"></script>
<script src="https://cdn.pedrodeoliveira.me/js/emerge/range.js"></script>
<script src="https://cdn.pedrodeoliveira.me/js/emerge/text.js"></script>
<script src="https://cdn.pedrodeoliveira.me/js/emerge/parallax.js"></script>

<script>
  // 3. Registre (Range PRIMEIRO) e inicie
  Emerge.addPlugin(EmergeRange, EmergeText, EmergeParallax);
  Emerge.init();
</script>
```

**Regras de registro:**
- `Emerge.addPlugin(...)` **antes** de `Emerge.init()`. Aceita plugins soltos ou arrays.
- **`EmergeRange` deve ser o primeiro plugin registrado.** Os demais podem vir em qualquer ordem depois dele.
- Pode registrar em chamadas separadas, mantendo a ordem.
- Ordem errada (Range por último) **quebra os modos `follow`/scrub** sem lançar erro.
- Como UMD/CommonJS: `Emerge.addPlugin(require('./emerge/range.js'))`.
- Core + plugins: carregue todos os `<script>` de plugin **depois** de `emerge.js` e **antes** do `addPlugin`.

**Tabela global ↔ plugin (nome exato da variável global que o `<script>` do plugin cria):**

| Plugin | Global | Depende do Range? |
|---|---|---|
| Range | `EmergeRange` | — (**registrar 1º**) |
| Draw | `EmergeDraw` | só nos modos `follow` |
| Horizontal | `EmergeHorizontal` | sim |
| Media | `EmergeMedia` | sim |
| Stack | `EmergeStack` | sim |
| Reel | `EmergeReel` | sim |
| Text | `EmergeText` | só nos modos `follow` |
| Spotlight | `EmergeSpotlight` | não |
| Scene | `EmergeScene` | sim |
| Magnetic | `EmergeMagnetic` | não |
| Parallax | `EmergeParallax` | sim |
| Particles | `EmergeParticles` | não |
| Smooth | `EmergeSmooth` | não |

**Lista completa na ordem canônica (copie e remova o que não usa, mantendo Range primeiro):**
```js
Emerge.addPlugin(EmergeRange, EmergeDraw, EmergeHorizontal, EmergeMedia, EmergeStack, EmergeReel, EmergeText, EmergeSpotlight, EmergeScene, EmergeMagnetic, EmergeParallax, EmergeParticles, EmergeSmooth);
```
**Se registrar qualquer plugin que usa Range, inclua o Range.** Na dúvida, inclua.

### 2.3 Só o core
`emerge.css` + `emerge.js` já dão todos os efeitos de entrada (fade, zoom, slide, flip, blur, reveal, extras), eventos, easings, `once`/`mirror`, `anchorPlacement`. Atributos de plugin são ignorados.

### 2.4 Migração
O antigo `emerge.js` "tudo em um" agora é `emerge.bundle.js`. O `emerge.js` atual é **só o core**. Se o usuário tem código antigo que usa plugins com `emerge.js`, troque a URL pelo bundle ou registre os plugins.

### 2.5 Requisitos do ambiente
- Navegadores modernos: `IntersectionObserver`, CSS custom properties, Pointer Events (Spotlight, Magnetic, Particles).
- Magnetic exige propriedades individuais `translate`/`rotate`/`scale`. Particles usa `<canvas>`.
- Scene usa `position: sticky` e unidades `svh`.
- **Plugins com pin (Horizontal, Stack, Reel, Scene): nenhum ancestral pode ter `overflow: hidden` ou `overflow: auto`.** Use `overflow: clip` (no `body`, se precisar).
- Não há plugin Counter. `[data-emerge-counter]` só aplica `font-variant-numeric: tabular-nums`. Contadores = `onProgress` do Range (veja receita 8.9).

---

## 3. Árvore de decisão: qual recurso usar?

| O usuário quer… | Use | Seção |
|---|---|---|
| Elemento aparece/entra ao rolar (fade, slide, zoom…) | **Core** `data-emerge` | 4 |
| Animação que avança/retrocede junto com o scroll (scrub) | **Range** (`data-emerge-follow`) | 5.1 |
| Progresso 0→1 para JS, barras, contadores | **Range** `watch({onProgress})` | 5.1 |
| Desenhar traços SVG (assinatura, logo, linha) | **Draw** | 5.2 |
| Galeria horizontal controlada pelo scroll vertical | **Reel** (novo) — Horizontal só p/ legado | 5.5 |
| Painéis em tela cheia que se substituem ao rolar | **Reel** `motion="none"` — Stack só p/ legado | 5.5 |
| Scrub de vídeo ou sequência de frames em canvas | **Media** | 5.4 |
| Texto dividido por letra/palavra/linha com stagger | **Text** | 5.6 |
| Luz/lanterna/revelação que segue o cursor | **Spotlight** | 5.7 |
| Hero que "prende" e revela um painel (unfold, zoom…) | **Scene** | 5.8 |
| Botão/card atraído pelo cursor (+ tilt 3D) | **Magnetic** | 5.9 |
| Parallax por scroll (velocidade, camadas) | **Parallax** | 5.10 |
| Texto que vira partículas e reage ao cursor | **Particles** | 5.11 |
| Scroll suave com inércia (tipo Lenis), âncoras suaves, `scrollTo` | **Smooth** (opt-in: `data-emerge-smooth` no `<html>`) | 5.13 |
| Stagger simples em lista | `data-emerge-delay` incremental (0,100,200…) | 4.4 |

**Horizontal e Stack:** continuam funcionando e mantidos, mas **não recebem novidades**. Para código novo, **gere Reel**. Só use Horizontal/Stack se o projeto do usuário já os usa.

---

## 4. Core — efeitos de entrada

### 4.1 Uso básico
```html
<div data-emerge="fade-up">…</div>
<div data-emerge="zoom-in" data-emerge-duration="700" data-emerge-delay="200" data-emerge-easing="ease-out-back">…</div>
<div data-emerge="fade-left blur">efeitos combinados (separados por espaço)</div>
<div data-emerge>valor vazio = fade simples</div>
```

Ciclo: `Emerge.init()` adiciona `.emerge-init` (estado oculto) → ao cruzar a viewport recebe `.emerge-animate` → animação roda (CSS, thread de composição).

### 4.2 Catálogo de valores de `data-emerge` (combináveis por espaço)

| Família | Valores |
|---|---|
| **Fade** | `fade` (ou vazio), `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-left`, `fade-up-right`, `fade-down-left`, `fade-down-right` |
| **Slide** (sem fade, percorre 100% do próprio tamanho) | `slide-up`, `slide-down`, `slide-left`, `slide-right` |
| **Zoom** | `zoom-in`, `zoom-in-up`, `zoom-in-down`, `zoom-in-left`, `zoom-in-right`, `zoom-out`, `zoom-out-up`, `zoom-out-down`, `zoom-out-left`, `zoom-out-right` |
| **Rotate / Flip** | `rotate-left`, `rotate-right`, `spin`, `flip-up`, `flip-down`, `flip-left`, `flip-right` |
| **Blur** | `blur`, `blur-up`, `blur-down`, `blur-left`, `blur-right` |
| **Reveal** (wipe `clip-path`, sem fade) | `reveal-up`, `reveal-down`, `reveal-left`, `reveal-right` |
| **Extras: pop** | `pop`, `pop-in`, `pop-out` |
| **Extras: personalidade** | `bounce`, `swing`, `rubber`, `jello`, `skew-left`, `skew-right`, `squeeze`, `stretch` |
| **Extras: atenção** | `tada`, `pulse`, `heartbeat` |
| **Extras: reveal geométrico** | `reveal-circle`, `reveal-diamond` |

Direção: o sufixo (`-up`, `-left`…) indica de onde o elemento **vem**. Blur combina com direção ou com outros efeitos (`fade-up blur`).

### 4.3 `Emerge.init(options)` — opções globais

| Opção | Padrão | Significado |
|---|---|---|
| `offset` | `120` | px antes do elemento cruzar a viewport para animar. Negativo = espera entrar de fato. |
| `delay` | `0` | atraso global (ms). |
| `duration` | `400` | duração global (ms). |
| `easing` | `"ease"` | curva padrão. |
| `disable` | `false` | `true`, `"mobile"`, `"phone"`, `"tablet"` ou função `() => boolean`. |
| `once` | `false` | `true` = anima uma vez e nunca reverte. |
| `mirror` | `false` | anima de volta ao sair da viewport. |
| `anchorPlacement` | `"top-bottom"` | `"<ponto do elemento>-<ponto da viewport>"`, pontos: `top`, `center`, `bottom`. |
| `animatedClassName` | `"emerge-animate"` | classe de "animado". |
| `initClassName` | `"emerge-init"` | classe de init (estado oculto). |
| `useClassNames` | `true` | copia as palavras do `data-emerge` como classes (ex.: `.fade-up.emerge-animate`). |
| `disableMutationObserver` | `false` | desliga detecção automática de novos `[data-emerge]` no DOM. |
| `resizeDebounce` | `80` | debounce (ms) do recálculo no resize. |
| `respectReducedMotion` | `true` | com `prefers-reduced-motion`, não inicia e nada é escondido. |

Opções de plugin também entram em `init()` (ex.: `sceneDistance`, `spotlightRadius`, `magneticStrength`, `parallaxSpeed`, `particlesX…`). Veja cada plugin.

`Emerge.init()` retorna `Element[]` e é **reexecutável** (novos elementos são incorporados).

### 4.4 Atributos por elemento (core)

| Atributo | Exemplo | Efeito |
|---|---|---|
| `data-emerge` | `"fade-up"` | efeito(s). |
| `data-emerge-offset` | `"200"` | offset individual (px). |
| `data-emerge-delay` | `"250"` | atraso individual (ms) — stagger manual. |
| `data-emerge-duration` | `"900"` | duração individual (ms). |
| `data-emerge-easing` | `"ease-out-back"` | curva individual (nome ou `cubic-bezier(...)`). |
| `data-emerge-once` | `"true"` | só uma vez. |
| `data-emerge-mirror` | `"true"` | reverte ao sair. |
| `data-emerge-anchor-placement` | `"center-bottom"` | gatilho individual. |
| `data-emerge-anchor` | `"#secao-1"` | usa outro elemento como âncora de observação (anima junto com ele). |
| `data-emerge-id` | `"hero"` | além de `emerge:in`, emite `emerge:in:hero`. |
| `data-emerge-classnames` | `"false"` | desativa cópia de nomes como classes neste elemento. |
| `data-emerge-disable` | `"mobile"` | desativa neste elemento (veja seção 6). |
| `data-emerge-only` | `"desktop"` | só ativa nesses dispositivos (veja seção 6). |

**Stagger manual numa lista:**
```html
<li data-emerge="fade-up" data-emerge-delay="0">A</li>
<li data-emerge="fade-up" data-emerge-delay="100">B</li>
<li data-emerge="fade-up" data-emerge-delay="200">C</li>
```
Para stagger automático por caractere/palavra/linha use o plugin **Text**.

### 4.5 Easings
Básicos: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`.
Famílias (cada uma com `ease-in-X`, `ease-out-X`, `ease-in-out-X`): `back` (overshoot), `sine`, `quad`, `cubic`, `quart`.
Qualquer `cubic-bezier(...)` CSS também é aceito: `data-emerge-easing="cubic-bezier(.68,-.55,.265,1.55)"`.

### 4.6 Tokens CSS (sobrescreva em `:root` ou em um elemento)
```css
:root {
  --emerge-distance: 40px;        /* deslocamento fade-* / zoom-*-direção */
  --emerge-slide-distance: 100%;  /* percurso dos slide-* */
  --emerge-zoom-in: .6;           /* escala inicial zoom-in-* */
  --emerge-zoom-out: 1.2;         /* escala inicial zoom-out-* */
  --emerge-blur: 12px;
  --emerge-perspective: 2500px;   /* flip-* */
  --emerge-rotate: 12deg;         /* rotate-left/right */
  --emerge-pop-overshoot: 1.15;
  --emerge-bounce-height: 30px;
  --emerge-swing-angle: 15deg;
  --emerge-rubber-x: 1.25;  --emerge-rubber-y: .75;
  --emerge-jello-skew: 9deg;
  --emerge-skew: 18deg;
  --emerge-squeeze-x: .4;   --emerge-stretch-y: 1.6;
}
.card-hero { --emerge-distance: 90px; } /* override local */
```

### 4.7 Eventos (CustomEvents, borbulham pelo DOM)

| Evento | Quando |
|---|---|
| `emerge:in` / `emerge:out` | elemento entrou (começou a animar) / saiu e foi revertido. `e.detail` disponível. |
| `emerge:in:{id}` | variante com `data-emerge-id`. |
| `emerge:stack:build` `{el,panels}` / `emerge:stack:change` `{el,panel,index}` | Stack. |
| `emerge:reel:build` `{el,panels,track,axis,mode}` / `emerge:reel:change` `{el,panel,index,mode}` | Reel. |
| `emerge:horizontal:build` | Horizontal. |
| `emerge-media-ready` / `emerge-media-progress` `{loaded,total,percent}` | Media (no elemento). |
| `emerge:magnetic:build` / `:engage` / `:release` / `:destroy` | Magnetic. |
| `emerge:parallax:build` / `:destroy` | Parallax. |
| `emerge:particles:build` / `:destroy` / `:settle` | Particles. |
| `emerge:scene:build` `{el,panel,spacer,static}` / `:progress` `{el,progress}` / `:enter` `:leave` `{el,direction}` | Scene (no `document`). |

```js
document.addEventListener("emerge:in", (e) => console.log(e.detail));
document.addEventListener("emerge:in:hero", () => startHeroVideo());
```

### 4.8 API do core

| Membro | Retorno / função |
|---|---|
| `Emerge.init(options?)` | `Element[]`. Inicializa/observa todos os `[data-emerge]`. Reexecutável. |
| `Emerge.refresh()` | reescaneia e recalcula posições (após mudar layout). |
| `Emerge.refreshHard()` | desmonta tudo e reinicializa com as opções atuais. |
| `Emerge.destroy()` | remove observers, classes e atributos; página volta ao natural. |
| `Emerge.addPlugin(...p)` | registra plugin(s); retorna `Emerge`. |
| `Emerge.getPlugin(name)` | plugin registrado ou `undefined`. |
| `Emerge.plugins` | `string[]` com nomes ativos em ordem de registro. **Use para depurar** (`console.log(Emerge.plugins)`). |
| `Emerge.version` | `"1.7.2"`. |
| `Emerge.options` / `Emerge.defaults` | opções ativas / padrões (inclui os dos plugins). |
| `Emerge.core` | utilitários internos para autores de plugin. |
| `Emerge.Range` … `Emerge.Particles` | API de cada plugin. |

**Conteúdo dinâmico (SPA, listas infinitas):** um `MutationObserver` embutido registra novos `[data-emerge]` automaticamente. Para elementos de plugin inseridos depois, chame `Emerge.refresh()` ou o `scan()` do plugin (ex.: `Emerge.Scene.scan()`).

---

## 5. Plugins

Convenções que valem para **todos** os plugins:
- Ativação por atributo no **elemento hospedeiro** (`data-emerge-<plugin>`).
- Opções por atributo `data-emerge-<plugin>-<opção>`, opções globais em `Emerge.init({ <plugin><Opção> })`, tokens CSS `--emerge-<plugin>-*`.
- Cada plugin expõe `Emerge.<Plugin>` com `build(el)`, `destroy(el)`, `scan()`, `measure()`, `of(el)`, `all` (variações por plugin abaixo).
- Desativar/ativar por dispositivo: sufixos descritos na seção 6.

### 5.1 Range — motor scroll-linked (**registrar 1º**)

Mede o progresso 0→1 do elemento entre `from` e `to` e o entrega à animação CSS (scrub), a propriedades animadas ou a callbacks.

| Atributo | Exemplo | Significado |
|---|---|---|
| `data-emerge-from` | `"enter"` | início (progresso 0). Padrão `enter`. |
| `data-emerge-to` | `"exit"` | fim (progresso 1). Padrão `exit`. |
| `data-emerge-follow` | `""` ou `"0.2"` | scrub contínuo da animação CSS. Número = suavização (0–1; maior = mais "atrasado"). |
| `data-emerge-in` | `"hero"` | usa a zona `data-emerge-zone="hero"` como âncora (herda `from/to`). |
| `data-emerge-zone` | `"hero"` | marca contêiner como zona compartilhada de progresso. |

**Sintaxe `from`/`to`:** `"<ponto no elemento>@<posição na viewport>"`. Pontos: `top`, `center`, `bottom`, `%` (ex. `"25%"`) ou px.

| Palavra-chave | Equivale a | Significado |
|---|---|---|
| `enter` | `top@100%` | topo do elemento toca a base da viewport (começa a entrar). |
| `entered` | `bottom@100%` | elemento totalmente visível. |
| `center` | `center@50%` | centro do elemento no centro da tela. |
| `exit` | `bottom@0%` | base do elemento toca o topo da viewport (terminou de sair). |
| `exiting` | `top@0%` | topo do elemento alcança o topo da tela (começa a sair). |

**Três modos:**
```html
<!-- 1) Scrub CSS: o efeito core é percorrido pelo scroll (avança e volta) -->
<h2 data-emerge="fade-up" data-emerge-from="enter" data-emerge-to="center" data-emerge-follow>Título</h2>

<!-- 2) Por eventos: dispara ao cruzar from/to (sem follow) -->
<div data-emerge-from="enter" data-emerge-to="exit" data-emerge-once>…</div>

<!-- 3) Zonas: um contêiner compartilha o progresso entre vários elementos -->
<section data-emerge-zone="cap-1" data-emerge-from="enter" data-emerge-to="exit">
  <img data-emerge-in="cap-1" data-emerge="fade-up" data-emerge-follow src="a.jpg" alt="">
  <p   data-emerge-in="cap-1" data-emerge="fade-up" data-emerge-follow>…</p>
</section>
```

**API JS:**
```js
const w = Emerge.Range.watch({
  on: "#secao",              // elemento medido
  anchor: "#secao",          // opcional: outro elemento como referência
  from: "enter", to: "exit",
  follow: true,              // true = scrub · número = lag · false = eventos
  cssFollow: false,          // não dirigir a animação CSS do elemento
  debug: false,              // true desenha guias from/to
  once: false, mirror: false, id: "minha-secao",
  animate: {                 // interpolação imperativa (opcional)
    target: ".parallax-img", // seletor | Element | lista; omitido = o próprio elemento
    y: [-60, 60],            // px
    spin: [0, 360, "deg"],   // unidade explícita
    scale: [.8, 1],          // sem unidade
    opacity: [0, 1],
    "--emerge-progress": [0, 1]   // custom property unitless
  },
  onProgress({ progress }) { /* 0..1 a cada frame */ },
  onEdge({ edge, direction }) { /* "from"/"to" cruzados, ±1 */ }
});
Emerge.Range.of(el);      // watches do elemento
Emerge.Range.measure();   // re-medir tudo (após mudar layout)
Emerge.Range.stop(w);  Emerge.Range.stopAll();
Emerge.Range.all;         // watches ativos
Emerge.Range.CLOCK;       // 1000 ms — duração do scrub CSS
```
Props de `animate`: `x y z spin tiltX tiltY scale scaleX scaleY` viram `transform`; `opacity` e nomes iniciados por `--` são unitless; **qualquer outra propriedade CSS recebe `px`** por padrão.

**Gotcha:** `follow` + efeito core só faz sentido com o **Range registrado**. Sem ele o atributo não faz nada.

---

### 5.2 Draw — desenho de traços SVG
Anima `stroke-dasharray/dashoffset`. Suporta `path, line, polyline, polygon, circle, ellipse, rect`.

| Atributo | Padrão | Significado |
|---|---|---|
| `data-emerge-draw` | seletor padrão | Seletor dos traços dentro do host. Vazio = todas as formas acima; `"self"` = o próprio elemento. |
| `-draw-step` | `80` | ms entre o início de cada traço. |
| `-draw-order` | `forward` | `forward · reverse · center · edges · random`. |
| `-draw-direction` | `start` | `start` desenha do início, `end` do fim. |
| `-draw-delay` | `0` | atraso extra (ms). |
| `-draw-round` | — | pontas arredondadas (`stroke-linecap: round`). |
| `-draw-fill` | `auto` | `auto` aplica máscara de preenchimento em formas sem traço visível; `mask` força; outro valor desliga. |
| `-draw-fill-width` | `1` | multiplicador da máscara (formas grossas: `1.2`+). |
| `-draw-spread` | `0` | modo follow: fração (0–0.95) do progresso ocupada pelo stagger. |

```html
<!-- ao entrar em cena -->
<svg data-emerge="fade" data-emerge-draw data-emerge-draw-step="120" data-emerge-draw-order="center" data-emerge-draw-round>
  <path d="M10 80 C 40 20, 120 20, 150 80 S 260 140, 290 80"/>
  <circle cx="150" cy="80" r="40"/>
</svg>

<!-- dirigido pelo scroll (Range registrado 1º) -->
<svg data-emerge="fade" data-emerge-draw data-emerge-from="enter" data-emerge-to="exit" data-emerge-follow data-emerge-draw-spread="0.6">…</svg>
```
API: `Emerge.Draw.draw(sel, {step, order})`, `.paths(sel)`, `.remeasure(sel)` (após mudar o path), `.restore(sel)`.

---

### 5.3 Horizontal — **legado** (prefira Reel)
Faixa horizontal pinada: filhos diretos viram itens de um `track` flex.

| Atributo | Padrão | Significado |
|---|---|---|
| `data-emerge-horizontal` | — | ativa no contêiner. |
| `-horizontal-speed` | `1` | multiplicador da altura do espaçador (maior = mais lento). |
| `-horizontal-top` | `"0px"` | offset do sticky (ex.: header fixo). |
| `-horizontal-pin` | `true` | `"false"` desliga o pin. |
| `-horizontal-reverse` | — | inverte o sentido. |
| `-horizontal-ease` | `0` | suavização 0–1. |
| `-horizontal-exclude` | — | no filho: fora do track. |

Tokens CSS (no contêiner): `--emerge-horizontal-gap`, `--emerge-horizontal-item-width`, `--emerge-horizontal-height`. Progresso em `--emerge-horizontal-progress`.
API: `Emerge.Horizontal.goTo(el, indexOuSeletor)`, `.measure()`, `.of(el)`, `.all`.

---

### 5.4 Media — scrub de vídeo / sequência de frames
**Requer atributos do Range no elemento** (`data-emerge-from/to`).

```html
<!-- vídeo dirigido pelo scroll -->
<video data-emerge-media data-emerge-from="enter" data-emerge-to="exit"
       data-emerge-media-range="0.1,1" src="tour.mp4" muted playsinline></video>

<!-- sequência de frames em canvas (numeração zero-padded) -->
<div data-emerge-media="canvas" data-emerge-from="enter" data-emerge-to="exit"
     data-emerge-media-first-frame="frames/f_001.webp"
     data-emerge-media-last-frame="frames/f_120.webp"
     data-emerge-media-frame-step="2">
  <canvas></canvas>
</div>
```

| Atributo | Padrão | Significado |
|---|---|---|
| `data-emerge-media` | `"video, audio, canvas"` | seletor da mídia no host; vazio = o próprio elemento se for mídia. |
| `-media-range` | `"0,1"` | faixa da duração usada, `"de,até"` em fração 0–1. |
| `-media-pause` | `true` | pausa e remove `autoplay` (scroll manda). |
| `-media-precision` | `3` | casas decimais do `currentTime` (menos = menos seeks). |
| `-media-first-frame` / `-last-frame` | — | delimitam a sequência (prefixo + contador zero-padded detectados automaticamente). |
| `-media-frame-step` | `1` | pula frames (1 = todos). |
| `-media-fit` | `cover` | `cover` ou `contain` no canvas. |

Frames por JS: `Emerge.Media.scrub("#demo", { frames: { urls: [...] } })`.
Eventos no elemento: `emerge-media-ready`, `emerge-media-progress` `{loaded,total,percent}`. Com reduced motion, só o frame central é exibido.
Dica: use `muted playsinline` em vídeos (autoplay/mobile).

---

### 5.5 Reel — **bobina unificada (recomendado para novos projetos)**
Substitui Horizontal + Stack, com efeito de entrada por painel. O **eixo** (`motion`) escolhe o movimento.

```html
<!-- como o Horizontal: faixa que desliza -->
<section data-emerge-reel>
  <div>painel 1</div><div>painel 2</div>
</section>

<!-- como o Stack: painéis empilhados que trocam -->
<section data-emerge-reel data-emerge-reel-motion="none" data-emerge-reel-transition="slide-up">…</section>

<!-- a união: faixa que desliza COM zoom por painel -->
<section data-emerge-reel data-emerge-reel-transition="zoom">…</section>
```
Mínimo **2 filhos** diretos. Cada filho direto é um painel (exceto os com `data-emerge-reel-exclude`).

| Atributo | Padrão | Significado |
|---|---|---|
| `data-emerge-reel` | — | ativa no contêiner. |
| `-reel-motion` | `x` | `x` (trilho horizontal), `y` (vertical), `none` (painéis empilhados). |
| `-reel-transition` | auto¹ | efeito por painel: `none · fade · slide-up · slide-down · slide-left · slide-right · zoom/zoom-in · zoom-out · blur · flip`. |
| `-reel-scrub` | auto² | presente = scrub contínuo; `="false"` = step discreto. |
| `-reel-speed` | `1` | multiplicador do espaçador nos eixos `x/y` (maior = mais lento). |
| `-reel-step` | `100` | `vh` de scroll por troca de painel (eixo `none`). |
| `-reel-top` | `"0px"` | offset do sticky (ex.: `"60px"` sob header fixo). |
| `-reel-pin` | `true` | `"false"` desliga pin e espaçador (anima ao atravessar a tela). |
| `-reel-sticky` | `true` | `"false"` mantém espaçador mas não prende (o CSS da página fixa). |
| `-reel-reverse` | — | inverte a viagem. |
| `-reel-ease` | `0` | suavização 0–1. |
| `-reel-exclude` | — | no filho: não entra na bobina. |

¹ Auto de `transition`: `none` nos eixos `x`/`y`; `fade` no eixo `none`.
² Auto de `scrub`: scrub nos eixos `x`/`y`; step no eixo `none`. O modo resolvido vai em `data-emerge-reel-mode="scrub|step"` (o CSS lê isso).

Eventos: `emerge:reel:build`, `emerge:reel:change`.
Variáveis expostas — contêiner: `--emerge-reel-progress`, `-index`, `-local`, `-count`, `-distance`; painel: `--emerge-reel-i`, `-p`, `-dir`.
Tokens: `--emerge-reel-duration`, `-easing`, `-shift`, `-blur`, `-gap`, `-padding`, `-item-width`, `-height`.
API: `Emerge.Reel.goTo(el, indexOuSeletor)`, `.build(el)`, `.destroy(el)`, `.scan()`, `.measure()`, `.of(el)`, `.all`.

**Migração Horizontal/Stack → Reel (mapeamento direto):**
| Antigo | Reel |
|---|---|
| `data-emerge-horizontal` | `data-emerge-reel` |
| `-horizontal-speed/-top/-pin/-reverse/-ease/-exclude` | `-reel-speed/-top/-pin/-reverse/-ease/-exclude` |
| `data-emerge-stack` | `data-emerge-reel data-emerge-reel-motion="none"` |
| `-stack-step/-transition/-scrub/-sticky/-top/-exclude` | `-reel-step/-transition/-scrub/-sticky/-top/-exclude` |

Horizontal/Stack e Reel convivem na mesma página.

**Gotcha:** nenhum ancestral com `overflow: hidden|auto` (use `overflow: clip`).

---

### 5.6 Stack — **legado** (prefira Reel `motion="none"`)
Contêiner vira palco `100vh` sticky; cada filho é um painel (mín. 2).

| Atributo | Padrão | Significado |
|---|---|---|
| `data-emerge-stack` | — | ativa. |
| `-stack-step` | `100` | `vh` de scroll por painel. |
| `-stack-transition` | `fade` | `fade · slide-up · slide-down · slide-left · slide-right · zoom · zoom-in · zoom-out · blur · flip`. |
| `-stack-scrub` | — | liga a transição ao scroll (`--emerge-stack-p`, `--emerge-stack-dir`). |
| `-stack-sticky` | `true` | `"false"` desativa o pin. |
| `-stack-top` | `"0px"` | offset do sticky. |
| `-stack-exclude` | — | no filho: não é painel. |

Eventos `emerge:stack:build` / `:change`. Variáveis: `--emerge-stack-progress/-local/-index/-i/-count`; tokens `--emerge-stack-duration/-easing/-shift/-blur`.
API: `Emerge.Stack.goTo(el, i)`, `.of(el)`, `.build(el)`, `.destroy(el)`.

---

### 5.7 Text — texto dividido com stagger
Divide em `chars`, `words` ou `lines`, replica o efeito do host em cada parte com atraso incremental. Acessibilidade preservada (`aria-label` no original; partes `aria-hidden`). Recalcula linhas no resize.

```html
<h1 data-emerge="fade-up"
    data-emerge-split="chars"        <!-- chars | words | lines -->
    data-emerge-step="30"            <!-- ms entre partes -->
    data-emerge-order="center"       <!-- forward · reverse · center · edges · random -->
    data-emerge-easing="ease-out-cubic">
  Design em movimento
</h1>
```
Notas:
- O elemento **perde o próprio `data-emerge`** durante o split; o efeito passa para cada parte.
- Com Range (`data-emerge-follow` + `from/to`), o stagger é dirigido pelo scroll via `data-emerge-spread` (0–0.95, padrão `0.6`).
- API: `Emerge.Text.split(el, opts)`, `.parts(el)`, `.restore(el)`, `.restoreAll()`.
- **Não use em textos longos**: cada caractere vira um `<span>` animado. Prefira `words`/`lines` para parágrafos.
- **Não combine com `data-emerge-particles`** no mesmo elemento.
- Atributo de desativação por dispositivo usa o prefixo **`split`** (`data-emerge-split-disable-mobile`, etc.).

---

### 5.8 Spotlight — foco de luz que segue o ponteiro
Três modos: `reveal` (mostra camada superior só dentro do foco), `flashlight` (escurece fora), `focus` (desfoca + escurece o entorno). Visual em CSS (máscaras radiais). **Hosts são contêineres — `<img>` não aceita o overlay** (envolva em `<figure>`/`<div>`).

| Atributo `data-emerge-spotlight-*` | Padrão | Significado |
|---|---|---|
| `data-emerge-spotlight` | `"reveal"` | modo: `reveal · flashlight · focus` (`"false"` desativa). |
| `-radius` | `100` | raio do foco (px). |
| `-softness` | `30` | borda suave (0–raio). |
| `-easing` | `0.2` | inércia (0–1). |
| `-shape` | `circle` | `circle · ellipse · square · rect · rounded · diamond · hexagon · triangle · star · heart · fluid`. |
| `-ratio` | `0.6` | proporção altura/largura (elipse/rect/rounded). |
| `-trigger` | `pointer` | `pointer · hover · manual` (manual = só via API). |
| `-touch` | `track` | `track · pan-y · pan-x · scroll · off`. |
| `-move`, `-move-x`, `-move-y`, `-move-intensity` | — | conteúdo se desloca com o ponteiro (parallax interno). |
| `-trail`, `-swirl`, `-wobble` | `1.2 · 1 · 1` | só na forma `fluid`. |
| `-reverse` | `false` | efeito fica **fora** do foco. |
| `-persist` | `false` | mantém ativo sem ponteiro. |
| `-fit` | `cover` | `cover · contain` (mídia/camadas no reveal). |
| `-opacity` | `1 / .85 / .30` | intensidade do overlay (flashlight/focus). |
| `-blur` | `0 / 0 / 60` | desfoque do fundo no modo `focus` (px). |
| `-color` | `#0000` | cor do overlay. |

```html
<!-- reveal: imagem base + camada que aparece dentro do foco -->
<figure data-emerge-spotlight="reveal" data-emerge-spotlight-radius="140">
  <img src="preto-e-branco.jpg" alt="">
  <img data-emerge-spotlight-layer src="colorida.jpg" alt="">
</figure>

<!-- flashlight sobre um bloco de conteúdo -->
<section data-emerge-spotlight="flashlight" data-emerge-spotlight-radius="180">…</section>
```
```js
const sp = Emerge.Spotlight.create("#hero", { mode: "flashlight", radius: 160, trigger: "manual" });
sp.update("50%", "40%");  sp.show();  sp.hide();  sp.setOptions({ radius: 220 });
Emerge.Spotlight.destroy("#hero");   // também: get / refresh / destroyAll / all
```
Opções globais em `init()`: `spotlightRadius, spotlightSoftness, spotlightEasing, spotlightShape, spotlightRatio, spotlightMove, spotlightMoveIntensity, spotlightTrail, spotlightSwirl, spotlightWobble, spotlightTrigger, spotlightTouch, spotlightReverse, spotlightPersist, spotlightFit, spotlightOpacity, spotlightBlur, spotlightColor`.

---

### 5.9 Scene — hero pinada com painel (8 presets)
A seção **prende** (sticky + espaçador) e o scroll conduz um painel. O **valor** de `data-emerge-scene` é o preset. **Requer Range registrado antes.**

**Presets:** `unfold` (padrão), `fold`, `bloom`, `zoom`, `slide`, `wheel`, `curtain`, `blur`.

| Preset | O painel… |
|---|---|
| `unfold` | nasce deitado em 3D (rotateX 90°, escala .44, translateY 27.7%) e desdobra até cobrir. Único que usa `content`, camadas de luz e `cover`, e o único que lê os **tokens `:root`**. |
| `fold` | já cobre a cena e encolhe até um cartão centrado (`scale 0` = some). Opaco; `-scale-y` independente. |
| `bloom` | nasce pelo centro, pequeno e transparente, e cresce. Pura escala. |
| `zoom` | entra grande (scale 1.6) e recua ao tamanho natural. O `content` ganha scale. |
| `slide` | empurra pela direita (translateX 100% → 0), opaco, plano. `-offset ≠ 0` = empurrão diagonal. |
| `wheel` | gira em rotateY (spin 90° → 0), pequeno (scale .7). Opção `-spin`. |
| `curtain` | revelado por íris `clip-path: circle()` do centro; sem movimento. |
| `blur` | entra desfocado (24px) e ligeiramente maior, "foca" ao rolar. Opção `-blur`. |

**Anatomia da marcação:**
```html
<section class="hero" data-emerge-scene="unfold" data-emerge-scene-distance="1000">
  <div data-emerge-scene-content>… conteúdo da hero (opcional) …</div>
  <div data-emerge-scene-layer="a" aria-hidden="true"></div>   <!-- luzes: só unfold -->
  <div data-emerge-scene-layer="b" aria-hidden="true"></div>
  <div data-emerge-scene-panel>                                 <!-- OBRIGATÓRIO · filho DIRETO da cena -->
    … cor, tipografia e conteúdo ficam no SEU CSS …
    <div data-emerge-scene-cover></div>                         <!-- opcional (unfold) -->
  </div>
</section>
```
| Elemento | Obrigatório | Papel |
|---|---|---|
| `data-emerge-scene` | sim | raiz; valor = preset. |
| `-scene-content` | não | conteúdo da hero; cede lugar ao painel no início. |
| `-scene-layer="a"/"b"` | não | luzes do `unfold` (`b` "pisca"). |
| `-scene-panel` | **sim, filho direto** | painel animado (opacity, transform, border-radius; clip-path/filter no curtain/blur). |
| `-scene-cover` | não | cobertura que some durante o unfold. |

**Duas regras do pin:** (1) o painel deve ser **filho direto** da cena (a `perspective` só afeta filhos diretos); (2) **nenhum ancestral** da cena pode ter `overflow: hidden/auto` — use `overflow: clip`.

**Opções `data-emerge-scene-*`** (prioridade: atributo > token CSS > opção do `init` > default):

| Atributo | Default | Descrição |
|---|---|---|
| `data-emerge-scene` | `unfold` | preset. |
| `-distance` | `1000` | px de scroll durante o pin. |
| `-perspective` | `3000` | perspectiva 3D (px). |
| `-origin` | `50% 78%` | `perspective-origin`. Wheel/curtain: `50% 50%` (no curtain = centro da íris). |
| `-tilt` | `90` (unfold) / `0` | rotateX do painel em graus. Unfold: inicial. Fold: final. |
| `-scale` | `0.44` | escala do painel. Unfold: scaleX inicial. Fold: **final** (`0` = desaparece). Bloom .44 · zoom 1.6 · slide 1 · wheel .7 · curtain 1 · blur 1.12. |
| `-scale-y` | segue `-scale` | escala vertical independente. |
| `-offset` | `27.7%` (unfold) / `0` | translateY em % da altura do painel. |
| `-radius` | `5vw` (unfold) / `2rem` | border-radius do painel. |
| `-spin` | `90` | **só wheel**: rotateY inicial (graus). |
| `-blur` | `24` | **só blur**: raio em px (`0` desliga). |
| `-smooth` | `2` | suavização do scrub (s); `0` = direto no scroll. |

Tokens `:root` (**só o unfold lê**): `--emerge-scene-perspective`, `-origin`, `-tilt`, `-scale`, `-offset`, `-radius`. Nos outros presets personalize **por atributo**. `distance` e `smooth` não têm token.
```css
@media (max-width: 768px) { :root { --emerge-scene-scale: .70; } } /* tokens são relidos a cada measure */
```
Opções globais em `init()`: `sceneDistance, sceneSmooth, scenePerspective, sceneOrigin, sceneTilt, sceneScale, sceneOffset, sceneRadius`.

**Sequência clássica:** cena `fold` com `data-emerge-scene-scale="0"` encolhe a página até sumir; a cena `bloom` seguinte faz a próxima `div` renascer de lá.

Eventos (no `document`): `emerge:scene:build/progress/enter/leave` (veja 4.7). CSS puro: o progresso também fica em `--emerge-scene-progress` na raiz da cena (`opacity: calc(1 - var(--emerge-scene-progress, 0))`).

**API:**
```js
Emerge.Scene.build(el);  Emerge.Scene.destroy(el);  Emerge.Scene.destroyAll();
Emerge.Scene.scan();     // cenas inseridas depois do load (ou Emerge.refresh())
Emerge.Scene.measure();  // relê tokens/atributos, reconstrói steps + espaçador
Emerge.Scene.of(el);     // instância ou null
Emerge.Scene.all;
// trocar preset em runtime:
el.setAttribute("data-emerge-scene", "bloom"); Emerge.Scene.destroy(el); Emerge.Scene.build(el); // ou Emerge.refreshHard()
```
**Desativação:** `data-emerge-scene-disable` (`true · mobile · tablet · phone · desktop`), `-disable-mobile/-tablet/-phone/-desktop`, `-disable-size="max@768,min@1024"`, e o inverso `-only-*`. Desligada, ou em reduced motion/print, entra em **modo estático** (`.emerge-scene-static`): sem pin, sem 3D, painel plano em fluxo normal, tudo visível.
Debug: `data-emerge-debug` na cena liga avisos `[Emerge Scene]` e guias do Range. O resize só re-mede quando a **largura** muda.

---

### 5.10 Magnetic — elementos puxados pelo cursor
Escreve só `translate` (e `transform` com tilt) em um rAF compartilhado. Toque é ignorado por padrão.

| Atributo `data-emerge-magnetic-*` | Padrão | Significado |
|---|---|---|
| `data-emerge-magnetic` | `""` | ativa. Valor `"card"` = defaults de card (strength .2, radius 40). |
| `-strength` | `.3` | fração da distância ao ponteiro que o elemento percorre. |
| `-radius` | `60` | distância (px) além da borda em que a atração começa. |
| `-speed` | `6` | velocidade do seguimento. |
| `-ease` | `linear` | `linear · quad · cubic · sine · out-quad · out-cubic`. |
| `-tilt` | `false` | inclinação 3D. |
| `-tilt-strength` | `10` | ângulo máximo em graus (limitado a ±89). |
| `-perspective` | `800` | perspectiva do tilt (px). |
| `-touch` | `false` | permite efeito por toque. |
| `data-emerge-magnetic-child` | — | **em filhos**: fator de deslocamento extra (ex.: `0.5`) para profundidade. |

Tokens: `--emerge-magnetic-speed/-ease/-tilt/-tilt-strength/-perspective`. Globais: `magneticStrength/Radius/Speed/Ease/Tilt/TiltStrength/Perspective/Touch`. Classes: `emerge-magnetic`, `emerge-magnetic-active`, `emerge-magnetic-child`.
```html
<a class="cta" data-emerge-magnetic data-emerge-magnetic-strength="0.4">Falar comigo</a>
```
API: `Emerge.Magnetic.build/destroy(el)`, `.scan()`, `.destroyAll()`, `.of(el)`, `.release(el)`, `.measure()`, `.all`.

---

### 5.11 Parallax — deslocamento por scroll
O **valor do atributo é a velocidade**: positivo anda à frente do scroll, negativo fica para trás, `-1` congela. Usa Range; convive com `data-emerge`. Mapeamento centrado: `t = −speed · (p − .5) · span`. Publica `--emerge-progress`.

| Atributo `data-emerge-parallax-*` | Padrão | Significado |
|---|---|---|
| `data-emerge-parallax` | `0.3` | ativa; valor = velocidade. |
| `-axis` | `y` | `y · x · both`. |
| `-rotate`, `-scale`, `-opacity` | — | valores **finais** ao longo do percurso. |
| `-from`, `-to` | `enter → exit` | janela de scroll (sintaxe do Range). |
| `-smooth` | — | suavização em segundos (vira `follow` do Range). |
| `-target` | — | seletor de um filho que recebe o movimento. |
| `data-emerge-parallax-layer` | — | **em filhos**: camada com velocidade própria (ex.: `0.5`). |
| `-debug` | — | guias de from/to. |

Globais: `parallaxSpeed/Axis/Rotate/Scale/Opacity/From/To/Smooth/Target`. Classes: `emerge-parallax`, `-live`, `-target`, `-layer`.
```html
<img data-emerge-parallax="0.4" data-emerge-parallax-smooth="0.6" src="fundo.jpg" alt="">
<div data-emerge-parallax="0.2"><span data-emerge-parallax-layer="0.5">camada rápida</span></div>
```
API: `Emerge.Parallax.build/destroy(el)`, `.scan()`, `.measure()`, `.of(el)`, `.all()`, `.destroyAll()`.

---

### 5.12 Particles — texto em partículas (canvas)
O texto é amostrado e vira partículas em 3 camadas (corpo ≥80%, acentos 6–12%, halo ≤10%) que reagem ao ponteiro. O texto real **permanece no DOM** com `color: transparent` (acessível/selecionável). **Não combine com `data-emerge-split`.**

| Atributo `data-emerge-particles-*` | Padrão | Significado |
|---|---|---|
| `data-emerge-particles` | `repel` | interação: `repel · attract · swirl`. |
| `-look` | `legível` | `legível · cloud · grid`; `-contrast` (.8), `-sampling` (`organic · grid`). |
| `-gap`, `-size`, `-shape` | — | espaçamento, tamanho, forma (`soft · circle · square`). |
| `-color` | `text` | `text`, cor CSS, paleta `"a,b,c"`, `random` ou `gradient(#a,#b)`. |
| `-color-jitter`, `-color-angle`, `-color-weights` | `.3` | variação, ângulo do gradiente, pesos da paleta. |
| `-random` | — | `build · resample · interval:N`; `-random-hue/-sat/-light` (0–360, 65–95, 55–80). |
| `-seed`, `-density`, `-depth`, `-halo` | — | reprodutibilidade, densidade, profundidade, halo. |
| `-glow` | `auto` | `auto · on · off`. |
| `-jitter`, `-drift` | — | tremor / deriva ambiente. |
| `-radius`, `-strength`, `-return`, `-friction` | `100 · 1 · 1 · .92` | física da interação. |
| `-intro` | `none` | `none · assemble`. |
| `-max` | `~4000 / 2500` | limite de partículas (desktop / mobile). |
| `-touch` | `pan-y` | `pan-y · track · scroll · off` (em `pan-y` o gesto vertical continua rolando a página). |

Globais: opções `particles*` no `init()`; tokens `--emerge-particles-*`. Classes: `emerge-particles`, `-canvas`, `-text`, `-touch-pan-y|track`.
```html
<h1 data-emerge-particles="swirl" data-emerge-particles-color="#4da3ff,#5fd4f5,#d7e5ff">Olá</h1>
```
```js
Emerge.Particles.build(el); Emerge.Particles.destroy(el);
Emerge.Particles.resample(el); Emerge.Particles.disperse(el, x, y);
Emerge.Particles.setColor(el, "gradient(#f00,#00f)");
Emerge.Particles.legibility(el, { dpr: 2 });
Emerge.Particles.scan(); Emerge.Particles.measure(); Emerge.Particles.of(el); Emerge.Particles.all(); Emerge.Particles.destroyAll();
```
Use em textos **curtos** (título/hero).

### 5.13 Smooth — scroll suave tipo Lenis (**opt-in**)
Intercepta a roda do rato e chama `window.scrollTo()` a cada frame com uma posição suavizada. **O scroll continua nativo**: sticky, IntersectionObserver e todos os plugins por scroll funcionam sem mudanças. **Não faz nada até ser ativado** (o bundle só o registra). Não depende do Range. **Não** use transform em `body`/wrapper para "smooth scroll" — use este plugin.

Ativação (uma das três):
```html
<html data-emerge-smooth>                                  <!-- ou no <body> -->
<html data-emerge-smooth data-emerge-smooth-lerp="0.08">   <!-- com opções -->
```
```js
Emerge.init({ smooth: true });          // ou { smooth: { lerp: 0.08 } }
Emerge.Smooth.init({ lerp: 0.08 });     // à mão
```
Suaviza: roda/trackpad vertical, links `#âncora`, `Emerge.Smooth.scrollTo()`. Fica nativo: toque, teclado, barra de scroll, gesto horizontal, ctrl+roda, contentores com scroll próprio que ainda andam na direção, e `data-emerge-smooth-prevent`.

| Atributo (no elemento raiz) | Padrão | Efeito |
|---|---|---|
| `data-emerge-smooth` | — | ativa (`false` desliga mesmo com `smooth: true`) |
| `-lerp` | `0.1` | fração/frame a 60fps (0.01–1); menor = mais suave |
| `-duration` | `0` | s; `>0` troca lerp por tween com `-easing` |
| `-easing` | `expo` | `linear, quad, cubic, quart, sine, expo, in-out-cubic, in-out-expo` (modo duração e `scrollTo`) |
| `-wheel` | `1` | multiplicador da roda |
| `-anchors` | `true` | `#âncora` suave (+ `pushState` e foco) |
| `-anchor-offset` | `0` | px somados ao destino (ex. `-80` com header fixo); `scroll-margin-top` é respeitado |
| `-anchor-duration` | `1.2` | s |
| `-prevent` | — | **no elemento interior:** scroll nativo ali; no raiz: seletor extra |
| `-ignore` | — | **num `<a>`:** o browser trata a âncora |

Globais: `smooth` (`false`/`true`/objeto), `smoothLerp, smoothDuration, smoothEasing, smoothWheel, smoothAnchors, smoothAnchorOffset, smoothAnchorDuration, smoothPrevent`. Precedência: atributo > objeto `smooth` > opções planas > padrão. `disable`/`only` por dispositivo com prefixo `smooth` (ex. `data-emerge-smooth-disable-mobile`).

API `Emerge.Smooth`: `init(opts)`/`enable`, `destroy`/`disable`, `start()`, `stop()` (pausa, também bloqueia teclado/toque; use em modais), `toggle()`, `scrollTo(alvo, { offset, duration, easing, immediate, lock, force, onComplete })` (alvo = número, elemento, seletor, `"top"`, `"bottom"`), `on("scroll"|"start"|"stop", fn)` → devolve `off`, `off(nome, fn)`; getters `scroll, target, limit, progress, velocity, direction, active, stopped, isScrolling, options`. Payload de `scroll`: `{ scroll, target, limit, progress, velocity, direction }`. Eventos: `emerge:smooth:enable|disable`. Classes no `<html>`: `emerge-smooth`, `-scrolling`, `-stopped`.

Regras: com `prefers-reduced-motion` fica inativo (`scrollTo` cai para o nativo); aplica `scroll-behavior:auto !important` ao `<html>` enquanto ativo; **não combine com `scroll-snap-type` no `<html>`**; `Emerge.refreshHard()` perde opções passadas só por `Emerge.Smooth.init(opts)`.
```html
<html data-emerge-smooth data-emerge-smooth-anchor-offset="-80">
…
<a href="#contacto">Contacto</a>
<div class="menu-scroll" data-emerge-smooth-prevent>…</div>
<script>
  Emerge.init();
  openModalBtn.onclick = () => Emerge.Smooth.stop();
  closeModalBtn.onclick = () => Emerge.Smooth.start();
</script>
```

---

## 6. Ativar/desativar por dispositivo ou largura (vale para core e todos os plugins)

O dispositivo vem do user agent (`mobile` = `phone` + `tablet`). Prefixos por feature: core = `data-emerge-`; plugins = `data-emerge-<feature>-` onde `<feature>` ∈ `range, draw, horizontal, media, stack, reel, split, spotlight, scene, magnetic, parallax, particles, smooth` (**atenção:** o plugin Text usa `split`).

**Desativar (`disable`):**
```html
<div data-emerge="fade-up" data-emerge-disable="mobile">…</div>                          <!-- core -->
<div data-emerge-from="enter" data-emerge-to="exit"
     data-emerge-range-disable-phone data-emerge-range-disable-size="max@768px">…</div>  <!-- range -->
```
Sufixos: `-disable` (valor: `true · mobile · tablet · phone · desktop`) · `-disable-mobile` · `-disable-desktop` · `-disable-tablet` · `-disable-phone` · `-disable-size="min@1024px"` (≥) / `"max@768px"` (≤), combináveis por vírgula.

**Ativar só em certos dispositivos (`only`)** — o inverso; serve para **trocar** um efeito por outro:
```html
<section data-emerge-horizontal data-emerge-horizontal-only-desktop>…</section>
<button data-emerge-magnetic data-emerge-magnetic-only-mobile>Botão</button>
<div data-emerge-parallax="0.3" data-emerge-parallax-only-size="max@768">…</div>
<div data-emerge-spotlight data-emerge-spotlight-only="phone,tablet">…</div>
```
Regras: com vários `only-*` basta um casar (OU) · fora dos dispositivos indicados o elemento fica desativado · **`disable` + `only` no mesmo elemento: `disable` vence** · sem nenhum `only`, nada muda.

Global: `Emerge.init({ disable: "mobile" })`.

**Recomendação:** faixa horizontal em celular costuma estranhar (dedo desce, página vai para o lado). Use `data-emerge-reel-only-desktop` e, no celular, outro efeito (ex.: Reel com `motion="none"` + `only-mobile`).

---

## 7. Variáveis e classes úteis para CSS do usuário
- `.emerge-init` — presente depois que o JS iniciou o elemento (estado oculto).
- `.emerge-animate` — elemento já animou.
- `html.emerge-reduced` — o JS pulou as animações (reduced motion); a folha neutraliza escondimentos.
- Com `useClassNames: true`, os valores de `data-emerge` viram classes: estilize `.fade-up.emerge-animate`.
- Variáveis de progresso (para CSS puro): `--emerge-progress` (Range/Parallax), `--emerge-scene-progress`, `--emerge-reel-progress`, `--emerge-horizontal-progress`, `--emerge-stack-progress`.

---

## 8. Receitas (copie e adapte)

### 8.1 Página básica com entrada em cascata
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <link rel="stylesheet" href="https://cdn.pedrodeoliveira.me/css/emerge.css">
  <script defer src="https://cdn.pedrodeoliveira.me/js/emerge.bundle.js" data-emerge-css="false"></script>
</head>
<body>
  <h1 data-emerge="fade-up">Olá, Emerge!</h1>
  <p  data-emerge="fade-up" data-emerge-delay="150">Entrei depois.</p>
  <div data-emerge="zoom-in" data-emerge-duration="800" data-emerge-easing="ease-out-back">Zoom com rebote</div>
  <script>
    // com defer o script roda antes do DOMContentLoaded → inicialize dentro do evento
    window.addEventListener("DOMContentLoaded", () => Emerge.init({ offset: 120, duration: 500, once: true }));
  </script>
</body>
</html>
```
> Com `<script defer>`, inicialize dentro de `DOMContentLoaded`. Isso garante DOM pronto e que a primeira dobra anima na carga.

### 8.2 Título que acompanha o scroll (scrub)
```html
<h2 data-emerge="fade-up" data-emerge-from="enter" data-emerge-to="center" data-emerge-follow="0.2">Título</h2>
```

### 8.3 Título com letras entrando em stagger
```html
<h1 data-emerge="fade-up" data-emerge-split="chars" data-emerge-step="25" data-emerge-order="center">Design em movimento</h1>
```

### 8.4 Galeria horizontal pinada (Reel) + fallback mobile
```html
<section data-emerge-reel data-emerge-reel-only-desktop data-emerge-reel-speed="1" style="--emerge-reel-item-width:60vw; --emerge-reel-gap:24px">
  <article>1</article><article>2</article><article>3</article>
</section>
<section data-emerge-reel data-emerge-reel-motion="none" data-emerge-reel-transition="slide-up" data-emerge-reel-only-mobile>
  <article>1</article><article>2</article><article>3</article>
</section>
```

### 8.5 Painéis tela cheia que se substituem (Reel `none`)
```html
<section data-emerge-reel data-emerge-reel-motion="none" data-emerge-reel-transition="zoom" data-emerge-reel-step="110">
  <div style="height:100vh">A</div><div style="height:100vh">B</div><div style="height:100vh">C</div>
</section>
```

### 8.6 Hero pinada com preset
```html
<section data-emerge-scene="bloom" data-emerge-scene-distance="1200">
  <div data-emerge-scene-content><h1>Título</h1></div>
  <div data-emerge-scene-panel>…conteúdo que cresce pelo centro…</div>
</section>
<style> body { overflow-x: clip; } </style>
```

### 8.7 Botão magnético com tilt
```html
<button data-emerge-magnetic data-emerge-magnetic-strength="0.4" data-emerge-magnetic-tilt>Clique</button>
```

### 8.8 Parallax com camadas
```html
<div data-emerge-parallax="0.15" data-emerge-parallax-smooth="0.5">
  <img src="bg.jpg" alt="">
  <h2 data-emerge-parallax-layer="0.5">Texto à frente</h2>
</div>
```

### 8.9 Barra de progresso e contador com Range (não há plugin Counter)
```html
<div id="alvo" style="height:200vh"></div>
<span id="n" data-emerge-counter>0</span>
<script>
  Emerge.Range.watch({
    on: "#alvo", from: "enter", to: "exit", follow: true,
    onProgress({ progress }) {
      document.getElementById("n").textContent = Math.round(progress * 1000);
    }
  });
</script>
```

### 8.10 Assinatura SVG que se desenha ao entrar
```html
<svg viewBox="0 0 300 160" data-emerge="fade" data-emerge-draw data-emerge-draw-step="120" data-emerge-draw-round fill="none" stroke="currentColor" stroke-width="3">
  <path d="M10 80 C 40 20, 120 20, 150 80 S 260 140, 290 80"/>
</svg>
```

### 8.11 Lanterna sobre seção
```html
<section data-emerge-spotlight="flashlight" data-emerge-spotlight-radius="180" data-emerge-spotlight-opacity=".85">…</section>
```

### 8.12 Reagir a eventos
```js
document.addEventListener("emerge:in:hero", () => heroVideo.play());
document.addEventListener("emerge:scene:progress", ({ detail }) => bar.style.transform = `scaleX(${detail.progress})`);
document.addEventListener("emerge:reel:change", ({ detail }) => console.log("painel", detail.index));
```

---

## 9. Erros comuns & diagnóstico

| Sintoma | Causa provável | Correção |
|---|---|---|
| Nada anima / elementos ficam invisíveis | CSS não carregado, ou `init()` não chamado | Confirme `<link>` do `emerge.css` e `Emerge.init()` após o DOM. |
| Nada anima, mas sem erro | `prefers-reduced-motion` ativo (comportamento esperado) | Teste com o ajuste do SO desligado; não é bug. |
| Atributo de plugin ignorado | Plugin não registrado (core isolado) | `console.log(Emerge.plugins)`; registre com `addPlugin`. |
| `EmergeX is not defined` | `<script>` do plugin ausente ou depois do `addPlugin` | Carregue o arquivo do plugin **antes** de registrar. |
| `follow`/scrub/parallax/scene "travam" ou não acompanham | Range ausente ou registrado depois | `addPlugin(EmergeRange, …)` com Range **primeiro**. |
| `Emerge.addPlugin` chamado com o bundle | desnecessário (e pode duplicar) | Com o bundle, não registre nada. |
| Pin (Reel/Scene/Horizontal/Stack) não prende | Ancestral com `overflow: hidden/auto` | Troque por `overflow: clip`. |
| Scene não funciona | Painel não é filho direto da cena, ou falta `[data-emerge-scene-panel]` | Painel obrigatório e filho direto. |
| Scene/Reel com layout quebrado após mudar conteúdo | Medidas desatualizadas | `Emerge.refresh()` ou `Emerge.<Plugin>.measure()`. |
| Conteúdo inserido depois não anima (plugins) | Plugin precisa re-escanear | `Emerge.refresh()` ou `Emerge.<Plugin>.scan()`. |
| Efeito Text sumiu o `data-emerge` do host | comportamento esperado do split | O efeito passa para cada parte. |
| Texto longo trava | `split="chars"` em parágrafo grande | Use `words`/`lines` ou outro efeito. |
| Particles não aparecem / conflita com Text | `split` e `particles` no mesmo elemento | Use apenas um. |
| Spotlight não funciona em `<img>` | Hosts são contêineres | Envolva em `<figure>`/`<div>` e use `data-emerge-spotlight-layer`. |
| Magnetic não responde no celular | Toque ignorado por padrão | `data-emerge-magnetic-touch="true"` se realmente quiser. |
| Vídeo do Media não "scrubba" | Faltam `data-emerge-from/to` ou vídeo sem `muted playsinline` | Adicione-os; confira `-media-range`. |
| CSS carregado duas vezes | `<link>` manual + auto-loader do bundle | `data-emerge-css="false"` no `<script>` do bundle. |
| Auto-loader não injeta CSS | Script dinâmico, `file://`, ou `document.currentScript` nulo | Use `<link>` manual. |
| jsDelivr com versão antiga | Cache | Fixe `@1.7.2` depois do repo (nunca no fim do arquivo) ou use a CDN oficial. |
| Efeito repete ao rolar para cima/baixo e o usuário não quer | `once` é `false` por padrão | `Emerge.init({ once: true })` ou `data-emerge-once="true"`. |

**Depuração rápida:**
```js
console.log(Emerge.version, Emerge.plugins);     // plugins realmente ativos, em ordem
Emerge.Range.all;                                 // watches ativos
Emerge.Scene.all; Emerge.Reel.all;                // instâncias montadas
// atributos from/to visíveis: data-emerge-debug (scene) / data-emerge-parallax-debug / watch({debug:true})
```

---

## 10. Acessibilidade & resiliência (garantidas pela lib — não "conserte" por conta própria)

| Cenário | Comportamento |
|---|---|
| `prefers-reduced-motion` | Com `respectReducedMotion: true` (padrão), `init()` não esconde nada: conteúdo visível e estático. Pode forçar com `class="emerge-reduced"` no `<html>`. |
| JS desabilitado | Nada é escondido (o estado oculto só existe com `.emerge-init`, aplicada pelo JS). |
| Impressão | A folha força tudo visível em `@media print`. |
| Text | Original vira `aria-label`; partes são `aria-hidden`. |
| Scene | Desligada/reduced motion → modo estático, tudo visível. |
| Magnetic | Toque ignorado; reduced motion e print: nada se move. |
| Parallax | Sem JS/reduced motion: posição natural. |
| Particles | Texto real no DOM (`color: transparent`); canvas removido em reduced motion/print. |
| Media | Reduced motion: só o frame central. |
| Performance | Anima `opacity`, `translate`, `scale`, `rotate`, `filter` (composição), sem layout thrashing. |

**Não** esconda conteúdo importante via CSS próprio dependendo de `.emerge-init`; não use animações como único meio de transmitir informação.

---

## 11. Criando um plugin próprio

Um plugin é um objeto com `name`, `defaults`, `install(core)` e `hooks`. O retorno de `install` vira a API pública (`Emerge.SeuPlugin`).

```js
Emerge.addPlugin({
  name: "Wiggle",
  defaults: { wiggleIntensity: 10 },
  install(core) {
    return { wiggle(el) { /* … */ } };            // vira Emerge.Wiggle
  },
  hooks: {
    init() { /* escaneie o documento aqui */ },
    observe({ el, opts }, core) {                 // chamado para cada [data-emerge] registrado
      if (core.hasAttr(el, "wiggle")) core.claim(el, "Wiggle");   // assume o elemento
    },
    in({ el }) {}, out({ el }) {},                // entrou / saiu da viewport
    unobserve({ el }) {}, refresh() {}, teardown() {}
  }
});
```
`core` oferece: `attr / numAttr / hasAttr` (leitura de `data-emerge-*`), `dispatch`, `claim / release / isClaimed`, `isDisabledFor(el, prefixo)` (já aplica `disable` e `only`), `device`, `prefersReducedMotion`, `resolveEasing`, `utils.clamp / lerp`. Se o plugin usa scroll, consuma `Emerge.Range` e **registre o Range antes dele**.

---

## 12. Checklist antes de entregar código ao usuário

1. [ ] `<link>` do `emerge.css` presente (CDN oficial).
2. [ ] Escolhi **bundle** (padrão) ou **core + plugins**? Se core: todos os `<script>` de plugin carregados e `addPlugin(EmergeRange, …)` com **Range primeiro**, **antes** de `init()`.
3. [ ] Se bundle: **sem** `addPlugin`; `data-emerge-css="false"` + `<link>` manual.
4. [ ] `Emerge.init()` chamado depois do DOM (`DOMContentLoaded` ou fim do `<body>`).
5. [ ] Só usei atributos/valores listados neste documento (nada inventado).
6. [ ] Para scrub (`follow`), Media, Parallax, Scene, Reel: Range registrado (automático no bundle).
7. [ ] Para pins (Reel, Scene, Horizontal, Stack): sem ancestral com `overflow: hidden/auto` (use `overflow: clip`).
8. [ ] Scene: `data-emerge-scene-panel` é **filho direto** da cena.
9. [ ] Reel: ≥ 2 filhos diretos.
10. [ ] Text/Particles não estão no mesmo elemento; textos longos não usam `chars`.
11. [ ] Para novos projetos usei **Reel** em vez de Horizontal/Stack.
12. [ ] Contadores feitos com `Emerge.Range.watch({ onProgress })` (não existe plugin Counter).
13. [ ] Conteúdo continua legível sem JS / reduced motion / impressão.

---

## 13. Referência rápida de prefixos de atributo

| Feature | Ativador | Prefixo de opções |
|---|---|---|
| Core | `data-emerge="<efeito>"` | `data-emerge-*` |
| Range | `data-emerge-from` / `-to` / `-follow` / `-in` / `-zone` | `data-emerge-range-*` (só disable/only) |
| Draw | `data-emerge-draw` | `data-emerge-draw-*` |
| Horizontal | `data-emerge-horizontal` | `data-emerge-horizontal-*` |
| Media | `data-emerge-media` | `data-emerge-media-*` |
| Stack | `data-emerge-stack` | `data-emerge-stack-*` |
| Reel | `data-emerge-reel` | `data-emerge-reel-*` |
| Text | `data-emerge-split` | `data-emerge-split-*` (disable/only) · `data-emerge-step`, `-order`, `-spread` |
| Spotlight | `data-emerge-spotlight` | `data-emerge-spotlight-*` |
| Scene | `data-emerge-scene` | `data-emerge-scene-*` |
| Magnetic | `data-emerge-magnetic` | `data-emerge-magnetic-*` |
| Parallax | `data-emerge-parallax` | `data-emerge-parallax-*` |
| Particles | `data-emerge-particles` | `data-emerge-particles-*` |
| Smooth | `data-emerge-smooth` (no `<html>`/`<body>`) | `data-emerge-smooth-*` |
