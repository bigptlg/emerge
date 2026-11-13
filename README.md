# Emerge.js

Biblioteca leve de animações reveladas por scroll, construída sobre `IntersectionObserver` nativo, com um sistema de plugins para efeitos mais avançados (scroll ligado ao progresso, texto, SVG, pin, parallax, partículas…). Sem dependências.

**Versão:** 1.7.2 · **Código-fonte:** [github.com/bigptlg/emerge](https://github.com/bigptlg/emerge) · **CDN oficial:** [cdn.pedrodeoliveira.me](https://cdn.pedrodeoliveira.me/)

## Índice

- [Instalação](#instalação) (CDN, bundle, ficheiros separados)
- [Uso básico](#uso-básico)
- [Core](#core)
  - [Opções globais](#opções-globais)
  - [Atributos por elemento](#atributos-por-elemento)
  - [Presets de animação](#presets-de-animação-data-emerge)
  - [Combinar efeitos](#combinar-efeitos)
  - [Tokens CSS](#tokens-css)
  - [anchorPlacement](#anchorplacement)
  - [Easings](#easings)
  - [API JavaScript](#api-javascript)
  - [Eventos](#eventos)
- [Plugins](#plugins)
  - [Range](#range) · [Draw](#draw) · [Horizontal](#horizontal) · [Media](#media) · [Stack](#stack) · [Reel](#reel) · [Text](#text)
  - [Spotlight](#spotlight) · [Scene](#scene) · [Magnetic](#magnetic) · [Parallax](#parallax) · [Particles](#particles) · [Smooth](#smooth)
- [Desativar ou ativar só por dispositivo ou largura](#desativar-ou-ativar-só-por-dispositivo-ou-largura)
- [Criar um plugin](#criar-um-plugin)
- [Conteúdo dinâmico](#conteúdo-dinâmico)
- [prefers-reduced-motion](#prefers-reduced-motion)
- [Problemas comuns](#problemas-comuns)
- [Compatibilidade](#compatibilidade)
- [Licença](#licença)

---

## Instalação

Há três formas de usar a Emerge: por **CDN** (oficial ou jsDelivr), com o **bundle único** ou com **ficheiros separados**. Em todas é preciso incluir o `emerge.css`.

> **Recomendado:** usa a [CDN oficial](#cdn-oficial-recomendada). É lá que cada versão é publicada primeiro; o jsDelivr (que lê o repositório do GitHub) funciona igualmente, mas pode ficar uma versão atrás.

### CDN

Os ficheiros estão organizados nas mesmas rotas em qualquer CDN (e iguais à estrutura do zip e do repositório):

```
/css/emerge.css
/js/emerge.js                 ← core
/js/emerge.bundle.js          ← core + todos os plugins
/js/emerge/range.js           ← plugins
/js/emerge/draw.js  horizontal.js  media.js  stack.js  reel.js  text.js
/js/emerge/spotlight.js  scene.js  magnetic.js  parallax.js  particles.js
```

#### CDN oficial (recomendada)

Base: `https://cdn.pedrodeoliveira.me` — as rotas são `/css`, `/js` e `/js/emerge`, como no zip. As atualizações chegam aqui primeiro.

| Ficheiro   | URL |
| ---------- | --- |
| CSS        | `https://cdn.pedrodeoliveira.me/css/emerge.css` |
| Bundle     | `https://cdn.pedrodeoliveira.me/js/emerge.bundle.js` |
| Core       | `https://cdn.pedrodeoliveira.me/js/emerge.js` |
| Range      | `https://cdn.pedrodeoliveira.me/js/emerge/range.js` |
| Draw       | `https://cdn.pedrodeoliveira.me/js/emerge/draw.js` |
| Horizontal | `https://cdn.pedrodeoliveira.me/js/emerge/horizontal.js` |
| Media      | `https://cdn.pedrodeoliveira.me/js/emerge/media.js` |
| Stack      | `https://cdn.pedrodeoliveira.me/js/emerge/stack.js` |
| Reel       | `https://cdn.pedrodeoliveira.me/js/emerge/reel.js` |
| Text       | `https://cdn.pedrodeoliveira.me/js/emerge/text.js` |
| Spotlight  | `https://cdn.pedrodeoliveira.me/js/emerge/spotlight.js` |
| Scene      | `https://cdn.pedrodeoliveira.me/js/emerge/scene.js` |
| Magnetic   | `https://cdn.pedrodeoliveira.me/js/emerge/magnetic.js` |
| Parallax   | `https://cdn.pedrodeoliveira.me/js/emerge/parallax.js` |
| Particles  | `https://cdn.pedrodeoliveira.me/js/emerge/particles.js` |

Bundle (tudo incluído):

```html
<link rel="stylesheet" href="https://cdn.pedrodeoliveira.me/css/emerge.css">
<script src="https://cdn.pedrodeoliveira.me/js/emerge.bundle.js" data-emerge-css="false"></script>
<script>Emerge.init();</script>
```

Core + plugins à escolha (o `Range` primeiro; nada é registado automaticamente):

```html
<link rel="stylesheet" href="https://cdn.pedrodeoliveira.me/css/emerge.css">

<script src="https://cdn.pedrodeoliveira.me/js/emerge.js"></script>
<script src="https://cdn.pedrodeoliveira.me/js/emerge/range.js"></script>
<script src="https://cdn.pedrodeoliveira.me/js/emerge/spotlight.js"></script>

<script>
  Emerge.addPlugin([EmergeRange, EmergeSpotlight]);
  Emerge.init();
</script>
```

#### jsDelivr (alternativa, direto do GitHub)

O repositório oficial é [github.com/bigptlg/emerge](https://github.com/bigptlg/emerge) e o jsDelivr serve-o diretamente, sem precisares de fork. A estrutura de pastas é a mesma (`css/`, `js/`, `js/emerge/`):

```
https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest/js/
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest/css/emerge.css">

<!-- bundle -->
<script src="https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest/js/emerge.bundle.js" data-emerge-css="false"></script>

<!-- ou core + plugins -->
<script src="https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest/js/emerge.js"></script>
<script src="https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest/js/emerge/range.js"></script>
<script src="https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest/js/emerge/spotlight.js"></script>
```

Os URLs por plugin são os mesmos da tabela acima, trocando a base `https://cdn.pedrodeoliveira.me` por `https://cdn.jsdelivr.net/gh/bigptlg/emerge@latest`.

- **Prefere a CDN oficial:** é atualizada primeiro, e o jsDelivr pode demorar a refletir uma versão nova (o `@latest` e as branches têm cache).
- **Fixar versão:** a tag vai *depois do repositório* (`gh/bigptlg/emerge@1.7.2/js/emerge.js`), nunca no fim do nome do ficheiro, e exige que essa tag exista no GitHub. Evita `@main`/`@latest` em produção, para que uma alteração não parta o teu site.
- Se fizeres **fork**, troca `bigptlg/emerge` pelo teu `utilizador/repositório`, mantendo a mesma estrutura de pastas.

> Com o bundle por CDN, usa `data-emerge-css="false"` e inclui o `<link>` do CSS à mão, ou aponta o carregador para o CSS com `data-emerge-css="URL"`.

### 1. Bundle único (`emerge.bundle.js`)

Contém o core e todos os plugins. Os plugins ficam registados automaticamente e o CSS é carregado por um carregador embutido.

```html
<script src="/emerge.bundle.js"></script>
<script>
  Emerge.init();
</script>
```

O carregador de CSS procura `/css/emerge.css@1.7.2` na mesma origem do script (só funciona em `http(s)`). Para usar outro caminho, ou desligar o carregador:

```html
<!-- caminho próprio -->
<script src="/emerge.bundle.js" data-emerge-css="/assets/emerge.css"></script>

<!-- sem carregador (inclui o CSS com <link>) -->
<script src="/emerge.bundle.js" data-emerge-css="false"></script>
<link rel="stylesheet" href="/emerge.css">
```

#### Estrutura do bundle

O ficheiro está dividido em secções independentes, cada uma delimitada por `BEGIN` / `END` e separada das outras por pelo menos 3 linhas em branco:

1. **CORE** — o núcleo (obrigatório)
2. **PLUGINS** — um bloco por plugin, cada um autónomo
3. **REGISTO** — uma linha por plugin: `if (typeof EmergeX !== "undefined") Emerge.addPlugin(EmergeX);`
4. **CARREGADOR CSS** — opcional

Para **editar** um plugin, altera só o que está entre o `BEGIN` e o `END` dele. Para **remover**, apaga o bloco inteiro e a linha correspondente no REGISTO. Para **adicionar**, cola um novo bloco (formato UMD com `i.EmergeNome = d()`) entre dois plugins e acrescenta a linha de registo. O `Range` tem de ficar **antes** dos plugins que dependem dele.

### 2. Ficheiros separados

O core fica na raiz e cada plugin na pasta `emerge/`. Aqui **nada é registado nem carregado automaticamente**: incluis só os plugins que queres e registas à mão.

```
/emerge.js
/emerge.css
/emerge/range.js  draw.js  horizontal.js  media.js  stack.js  reel.js  text.js
        spotlight.js  scene.js  magnetic.js  parallax.js  particles.js  smooth.js
```

```html
<link rel="stylesheet" href="/emerge.css">

<script src="/emerge.js"></script>
<script src="/emerge/range.js"></script>
<script src="/emerge/spotlight.js"></script>

<script>
  Emerge.addPlugin([EmergeRange, EmergeSpotlight]); // Range primeiro
  Emerge.init();
</script>
```

Cada plugin expõe um global `EmergeNome` (`EmergeRange`, `EmergeDraw`, `EmergeHorizontal`, `EmergeMedia`, `EmergeStack`, `EmergeReel`, `EmergeText`, `EmergeSpotlight`, `EmergeScene`, `EmergeMagnetic`, `EmergeParallax`, `EmergeParticles`, `EmergeSmooth`).

### CommonJS / AMD

O core e cada plugin trazem UMD embutido. Em CommonJS cada ficheiro separado devolve o seu módulo:

```js
const Emerge = require('./emerge.js');
Emerge.addPlugin(require('./emerge/range.js'));
```

> No bundle único o UMD é pensado para uso no browser (globais). Para CommonJS/AMD usa os ficheiros separados.

### Dependências entre plugins

| Plugin       | Depende de                                  |
| ------------ | ------------------------------------------- |
| `Range`      | — (é a base)                                |
| `Horizontal` | Range                                       |
| `Media`      | Range                                       |
| `Stack`      | Range                                       |
| `Reel`       | Range (recomendado no lugar de Horizontal e Stack) |
| `Scene`      | Range                                       |
| `Parallax`   | Range                                       |
| `Draw`       | opcional: Range (modo ligado ao scroll)     |
| `Text`       | opcional: Range (modo ligado ao scroll)     |
| `Spotlight`  | —                                           |
| `Magnetic`   | —                                           |
| `Particles`  | — (não combinar com `data-emerge-split`)    |
| `Smooth`     | —                                           |

---

## Uso básico

```html
<div data-emerge="fade-up">Este elemento revela-se ao entrar no ecrã</div>

<script>
  Emerge.init();
</script>
```

Com opções:

```js
Emerge.init({
  duration: 600,
  easing: 'ease-out-back',
  once: true,
  offset: 150,
});
```

`Emerge.init()` devolve a lista de elementos observados (ou `[]` se a biblioteca ficou desativada).

---

# Core

## Opções globais

Passadas em `Emerge.init({ ... })`. As que têm equivalente em atributo podem ser sobrepostas por elemento (ver secção seguinte). Os plugins acrescentam as suas próprias opções globais (indicadas em cada plugin).

| Opção                      | Tipo                                               | Default              | Descrição |
| -------------------------- | -------------------------------------------------- | -------------------- | --------- |
| `offset`                   | `number`                                           | `120`                | Deslocamento em px do ponto de disparo, dentro do viewport |
| `delay`                    | `number`                                           | `0`                  | Atraso em ms antes da animação começar |
| `duration`                 | `number`                                           | `400`                | Duração em ms |
| `easing`                   | `string`                                           | `'ease'`             | Nome do easing (ver [Easings](#easings)) |
| `once`                     | `boolean`                                          | `false`              | Se `true`, anima só uma vez e não reverte ao sair do ecrã |
| `mirror`                   | `boolean`                                          | `false`              | Se `true`, desfaz a animação ao sair do ecrã (mesmo sem `once`) |
| `anchorPlacement`          | `string`                                           | `'top-bottom'`       | Ponto de disparo, `elemento-viewport` |
| `disable`                  | `boolean \| 'mobile' \| 'phone' \| 'tablet' \| fn` | `false`              | Desativa a biblioteca condicionalmente |
| `respectReducedMotion`     | `boolean`                                          | `true`               | Desativa se o utilizador preferir menos movimento |
| `animatedClassName`        | `string`                                           | `'emerge-animate'`   | Classe aplicada quando o elemento está revelado |
| `initClassName`            | `string`                                           | `'emerge-init'`      | Classe aplicada a todos os elementos observados |
| `useClassNames`            | `boolean`                                          | `true`               | Aplica também cada valor de `data-emerge` como classe CSS ao revelar |
| `disableMutationObserver`  | `boolean`                                          | `false`              | Desativa a deteção de elementos adicionados ao DOM depois do init |
| `resizeDebounce`           | `number`                                           | `80`                 | Debounce (ms) para recalcular posições no resize |

## Atributos por elemento

```html
<div
  data-emerge="fade-up"
  data-emerge-offset="200"
  data-emerge-delay="150"
  data-emerge-duration="800"
  data-emerge-easing="ease-out-back"
  data-emerge-once="true"
  data-emerge-mirror="false"
  data-emerge-anchor-placement="center-bottom"
  data-emerge-anchor="#outro-elemento"
  data-emerge-id="hero-title"
>
  Conteúdo
</div>
```

| Atributo                       | Descrição |
| ------------------------------ | --------- |
| `data-emerge`                  | **Obrigatório.** Nome(s) da animação (ver presets). Vazio ou desconhecido = `fade` |
| `data-emerge-offset`           | Sobrepõe `offset` |
| `data-emerge-delay`            | Sobrepõe `delay` |
| `data-emerge-duration`         | Sobrepõe `duration` |
| `data-emerge-easing`           | Sobrepõe `easing` |
| `data-emerge-once`             | Sobrepõe `once` |
| `data-emerge-mirror`           | Sobrepõe `mirror` |
| `data-emerge-anchor-placement` | Sobrepõe `anchorPlacement` |
| `data-emerge-anchor`           | Seletor CSS de outro elemento: o disparo passa a ser calculado a partir dele, mas a animação continua a ser aplicada a este elemento |
| `data-emerge-id`               | Identificador usado no evento `emerge:in:{id}` |
| `data-emerge-classnames`       | `false` para não aplicar o valor de `data-emerge` como classe neste elemento |
| `data-emerge-disable…`         | Desativa o efeito neste elemento por dispositivo ou largura (ver [Desativar ou ativar só por dispositivo](#desativar-ou-ativar-só-por-dispositivo-ou-largura)) |
| `data-emerge-only…`            | O inverso: o efeito só fica ativo nos dispositivos / larguras indicados |

O core escreve `--emerge-duration`, `--emerge-delay` e `--emerge-easing` inline em cada elemento.

## Presets de animação (`data-emerge`)

**Entrada com movimento**
- **Fade** (a direção é a do movimento): `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-left`, `fade-up-right`, `fade-down-left`, `fade-down-right`
- **Slide** (sem fade, percorre o próprio tamanho): `slide-up`, `slide-down`, `slide-left`, `slide-right`
- **Zoom**: `zoom-in`, `zoom-out` e as variantes `zoom-in-up/down/left/right`, `zoom-out-up/down/left/right`
- **Rotate**: `rotate-left`, `rotate-right`, `spin`
- **Flip** (3D): `flip-up`, `flip-down`, `flip-left`, `flip-right`
- **Blur**: `blur`, `blur-up`, `blur-down`, `blur-left`, `blur-right`

**Revelação por recorte (clip-path)**
- `reveal-up`, `reveal-down`, `reveal-left`, `reveal-right`
- `reveal-circle`, `reveal-diamond`

**Extras (elásticos e de atenção)**
- `pop`, `pop-in`, `pop-out`
- `bounce`, `swing`, `rubber`, `jello`
- `tada`, `pulse`, `heartbeat`
- `skew-left`, `skew-right`
- `squeeze`, `stretch`

Também podes usar `data-emerge="qualquer-nome"` e escrever o teu próprio CSS: a biblioteca só gere a classe `emerge-animate` (e, com `useClassNames`, o nome como classe). Os presets vêm do `emerge.css`.

## Combinar efeitos

O atributo aceita vários valores separados por espaço:

```html
<div data-emerge="fade-up blur">...</div>
<div data-emerge="zoom-in-up blur">...</div>
```

## Tokens CSS

Sobrepõe em `:root` (ou inline em qualquer elemento):

| Token                      | Default  | Efeito |
| -------------------------- | -------- | ------ |
| `--emerge-distance`        | `40px`   | Deslocamento dos `fade-*` e `zoom-*-direção` |
| `--emerge-slide-distance`  | `100%`   | Deslocamento dos `slide-*` |
| `--emerge-zoom-in`         | `.6`     | Escala inicial de `zoom-in-*` |
| `--emerge-zoom-out`        | `1.2`    | Escala inicial de `zoom-out-*` |
| `--emerge-blur`            | `12px`   | Desfoque inicial dos `blur-*` |
| `--emerge-perspective`     | `2500px` | Perspetiva dos `flip-*` |
| `--emerge-rotate`          | `12deg`  | Ângulo de `rotate-left/right` |
| `--emerge-pop-overshoot`   | `1.15`   | Pico de escala do `pop` |
| `--emerge-bounce-height`   | `30px`   | Altura da queda do `bounce` |
| `--emerge-swing-angle`     | `15deg`  | Amplitude do `swing` |
| `--emerge-rubber-x` / `-y` | `1.25` / `.75` | Esticar/achatar do `rubber` |
| `--emerge-jello-skew`      | `9deg`   | Amplitude do `jello` |
| `--emerge-skew`            | `18deg`  | Ângulo de `skew-left/right` |
| `--emerge-squeeze-x`       | `.4`     | Compressão horizontal do `squeeze` |
| `--emerge-stretch-y`       | `1.6`    | Alongamento vertical do `stretch` |

## anchorPlacement

Combina um ponto do **elemento** (primeira parte) com um ponto do **viewport** (segunda parte): `top`, `center` ou `bottom`.

```
top-bottom     (default) → o topo do elemento atinge a base do viewport
center-center            → o centro do elemento atinge o centro do viewport
bottom-top               → a base do elemento atinge o topo do viewport
```

Mais as restantes combinações da grelha 3×3. O cálculo é recalculado a cada resize; funciona melhor com elementos mais pequenos do que o viewport.

## Easings

`linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `ease-in-back`, `ease-out-back`, `ease-in-out-back`, `ease-in-sine`, `ease-out-sine`, `ease-in-out-sine`, `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad`, `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`, `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart`.

Um nome não reconhecido é passado tal como está ao CSS, por isso podes usar `cubic-bezier(...)` diretamente em `data-emerge-easing`.

## API JavaScript

```js
Emerge.init(options)       // inicia; devolve os elementos observados
Emerge.refresh()           // observa novos [data-emerge] e recalcula posições
Emerge.refreshHard()       // reinicia tudo do zero
Emerge.destroy()           // remove observers, listeners e classes
Emerge.addPlugin(...p)     // regista um ou vários plugins (aceita arrays)
Emerge.getPlugin('Range')  // devolve um plugin registado
Emerge.plugins             // nomes dos plugins registados
Emerge.version             // '1.7.2'
Emerge.core                // utilitários internos partilhados com os plugins
```

Cada plugin registado fica disponível em `Emerge.NomeDoPlugin` (ex.: `Emerge.Spotlight.create(...)`).

## Eventos

Disparados em `document`, com o elemento em `event.detail`:

```js
document.addEventListener('emerge:in',  (e) => console.log('revelado:', e.detail));
document.addEventListener('emerge:out', (e) => console.log('escondido:', e.detail));

// se o elemento tiver data-emerge-id="hero-title"
document.addEventListener('emerge:in:hero-title', (e) => console.log('apareceu'));
```

Os plugins disparam os seus próprios eventos (indicados em cada secção).

---

# Plugins

Todos os plugins de scroll (Range, Draw, Horizontal, Media, Stack, Reel, Text, Scene, Parallax) respeitam `prefers-reduced-motion` e as opções de [desativar ou ativar só por dispositivo](#desativar-ou-ativar-só-por-dispositivo-ou-largura).

## Range

Motor de **progresso ligado ao scroll**. Em vez de disparar uma animação ao entrar no ecrã, o elemento acompanha o scroll ao longo de uma janela (`from` → `to`). É a base de Horizontal, Media, Stack, Reel, Scene e Parallax.

```html
<!-- animação do core "scrubbed" pelo scroll -->
<div data-emerge="fade-up" data-emerge-follow
     data-emerge-from="top@100%" data-emerge-to="top@40%">...</div>

<!-- só publica --emerge-progress (0..1) -->
<div class="bar" data-emerge-follow="0.3"><i></i></div>
```

```css
.bar i { width: calc(var(--emerge-progress, 0) * 100%); }
```

| Atributo / opção          | Default   | Descrição |
| ------------------------- | --------- | --------- |
| `data-emerge-follow`      | `false`   | Liga o modo scrub. Um número suaviza o movimento (segundos de atraso) |
| `data-emerge-from`        | `enter`   | Início da janela |
| `data-emerge-to`          | `exit`    | Fim da janela |
| `data-emerge-in`          | —         | Nome de uma zona (`data-emerge-zone="nome"`) usada como referência em vez do próprio elemento |
| `data-emerge-debug`       | `false`   | Mostra linhas-guia de início e fim |

**Sintaxe de `from` / `to`:** `elemento@viewport`, onde cada ponto é `top`, `center`, `bottom`, uma percentagem ou px. Ex.: `top@100%`, `center@50%`. Atalhos: `enter` (`top@100%`), `entered` (`bottom@100%`), `center` (`center@50%`), `exit` (`bottom@0%`), `exiting` (`top@0%`). Em `to`, um valor com sinal (`+300`, `-120`) é um deslocamento em px a partir do `from`.

O Range escreve `--emerge-progress` (0 a 1) no elemento.

**Opções globais:** `follow`, `from`, `to`, `debug`.

**API** (`Emerge.Range`):

```js
const w = Emerge.Range.watch({
  on: '#alvo',                 // elemento (ou seletor)
  anchor: '#ref',              // opcional: elemento de referência
  from: 'top@80%', to: 'bottom@20%',
  follow: 0.4,                 // false = só eventos de borda; true/número = scrub
  animate: { x: [0, 200], opacity: [0, 1], target: '.filho' }, // interpola propriedades
  onProgress: (r) => console.log(r.progress),
  onEdge: ({ edge, direction }) => {},
});
w.measure(); w.pause(); w.stop();

Emerge.Range.stopAll();
Emerge.Range.of(el);           // watchers de um elemento
Emerge.Range.measure();        // remede tudo
Emerge.Range.all;              // todos os watchers
```

Em `animate`, as chaves aceites incluem `x`, `y`, `z`, `spin`, `tiltX`, `tiltY`, `scale`, `scaleX`, `scaleY`, `opacity`, qualquer propriedade CSS e variáveis `--custom`, cada uma como `[de, para, unidade?]`.

---

## Draw

Desenha os traços de um **SVG** com `stroke-dashoffset`. Os preenchimentos (sem traço) são revelados com uma máscara.

```html
<svg viewBox="0 0 400 220"
     data-emerge="fade" data-emerge-draw
     data-emerge-draw-step="250" data-emerge-duration="1400" data-emerge-draw-round>
  <path d="M20 180 C 80 20, 140 20, 200 110 S 320 200, 380 40"
        fill="none" stroke="#7cffb2" stroke-width="3"/>
</svg>
```

A animação dispara pelo `data-emerge` do SVG. Com `data-emerge-follow` (Range) o desenho acompanha o scroll.

| Atributo                    | Default  | Descrição |
| --------------------------- | -------- | --------- |
| `data-emerge-draw`          | —        | Ativa. O valor opcional é um seletor dos elementos a desenhar (default: `path, line, polyline, polygon, circle, ellipse, rect`) |
| `data-emerge-draw-step`     | `80`     | Atraso entre traços (ms) |
| `data-emerge-draw-order`    | `forward`| `forward`, `reverse`, `center`, `edges`, `random` |
| `data-emerge-draw-spread`   | `0`      | No modo scroll, quanto se sobrepõem os traços (0 a .95) |
| `data-emerge-draw-direction`| `start`  | `start` ou `end` |
| `data-emerge-draw-round`    | `false`  | Pontas e junções arredondadas |
| `data-emerge-draw-fill`     | `auto`   | `auto`, `mask` (revela preenchimentos por máscara) |
| `data-emerge-draw-fill-width` | `1`    | Espessura da máscara |
| `data-emerge-draw-delay`    | `0`      | Atraso extra (ms) |

**Opções globais:** `drawSelector`, `drawStep`, `drawOrder`, `drawSpread`, `drawDirection`, `drawRound`, `drawFillMode`, `drawFillWidth`.

**API** (`Emerge.Draw`): `draw(el, opts)`, `restore(el)`, `remeasure(el)`, `paths(el)`, `restoreAll()`, `all`.

---

## Horizontal

> **Mantido por compatibilidade — prefere o [Reel](#reel).** O Horizontal foi reimplementado (junto com o Stack) no plugin Reel, que une os dois num só. Continua incluído e funcional para os projetos que já o usam (mesmos atributos e API), mas não recebe novas funcionalidades; em projetos novos usa o Reel.

Converte o **scroll vertical em movimento horizontal** de uma faixa de painéis, com a secção fixa (pin) enquanto a faixa desliza.

```html
<section data-emerge-horizontal>
  <div class="painel">1</div>
  <div class="painel">2</div>
  <div class="painel">3</div>
  <h2 data-emerge-horizontal-exclude>Fica fora da faixa</h2>
</section>
```

```css
.painel { width: 60vw; height: 56vh; margin: 0 3vw; }
```

| Atributo                          | Default | Descrição |
| --------------------------------- | ------- | --------- |
| `data-emerge-horizontal`          | —       | Ativa (os filhos diretos entram na faixa) |
| `data-emerge-horizontal-speed`    | `1`     | Quanto scroll vertical é preciso por px de deslocamento |
| `data-emerge-horizontal-top`      | `0px`   | `top` do elemento fixo (útil com cabeçalho fixo) |
| `data-emerge-horizontal-pin`      | `true`  | `false` desliga o pin |
| `data-emerge-horizontal-reverse`  | `false` | Inverte o sentido |
| `data-emerge-horizontal-ease`     | `0`     | Suavização do progresso |
| `data-emerge-horizontal-exclude`  | —       | Num filho: não entra na faixa |

**Variáveis CSS:** `--emerge-horizontal-height` (default `100vh`), `--emerge-horizontal-gap`, `--emerge-horizontal-padding`, `--emerge-horizontal-item-width`. O progresso fica em `--emerge-horizontal-progress`.

**Opções globais:** `horizontalSpeed`, `horizontalTop`. **Eventos:** `emerge:horizontal:build`.

**API** (`Emerge.Horizontal`): `build(el)`, `destroy(el)`, `goTo(el, progresso0a1 | seletor | elemento)`, `scan()`, `measure()`, `of(el)`, `all`.

> **Importante:** nenhum ancestral do elemento fixo pode ter `overflow: hidden` ou `auto` (o `position: sticky` deixa de funcionar). Usa `overflow: clip`.

---

## Media

**Scrub** de `<video>`, `<audio>` e de **sequências de frames em `<canvas>`**: o tempo ou o frame é função do progresso do scroll. Precisa do Range para o progresso (`data-emerge-follow`, `from`/`to`).

```html
<video data-emerge-media data-emerge-follow src="clip.mp4" muted playsinline></video>

<!-- sequência de imagens: o plugin deduz os nomes entre o primeiro e o último -->
<canvas data-emerge-media data-emerge-follow
        data-emerge-media-first-frame="/frames/f_0001.jpg"
        data-emerge-media-last-frame="/frames/f_0120.jpg"></canvas>
```

| Atributo                          | Default | Descrição |
| --------------------------------- | ------- | --------- |
| `data-emerge-media`               | —       | Ativa. Valor opcional: seletor dos elementos. Em `video/audio/canvas` age sobre o próprio elemento |
| `data-emerge-media-range`         | `0,1`   | Parte do vídeo/frames usada, por ex. `0.2,0.8` |
| `data-emerge-media-precision`     | `3`     | Casas decimais do `currentTime` |
| `data-emerge-media-pause`         | `true`  | Pausa e tira o `autoplay` |
| `data-emerge-media-first-frame` / `-last-frame` | — | Primeiro e último URL da sequência (números no nome) |
| `data-emerge-media-frame-step`    | `1`     | Passo entre frames |
| `data-emerge-media-fit`           | `cover` | `cover` ou `contain` no canvas |

Os frames de um canvas são carregados de forma progressiva e o canvas dispara `emerge-media-progress` (`{ loaded, total, percent }`) e `emerge-media-ready`. Com `prefers-reduced-motion`, os vídeos ganham `controls`.

**Opções globais:** `mediaSelector`, `mediaFrom`, `mediaTo`, `mediaPrecision`, `mediaPause`.

**API** (`Emerge.Media`):

```js
Emerge.Media.scrub('#canvas', {
  frames: { urls: ['f1.jpg', 'f2.jpg', /* ... */], fit: 'cover' }, // ou { first, last, step }
  range: '0,1',
  onProgress: (el, progress, elements) => {},
});
Emerge.Media.restore(el); Emerge.Media.remeasure(el);
Emerge.Media.remeasureAll(); Emerge.Media.restoreAll();
Emerge.Media.of(el); Emerge.Media.all;
```

Para ligar uma chamada a `scrub()` ao Range, faz-a **antes** de `Emerge.init()`, num elemento com `data-emerge-follow`.

---

## Stack

> **Mantido por compatibilidade — prefere o [Reel](#reel).** O Stack foi reimplementado (junto com o Horizontal) no plugin Reel, que une os dois num só. Continua incluído e funcional para os projetos que já o usam (mesmos atributos e API), mas não recebe novas funcionalidades; em projetos novos usa o Reel.

**Painéis fixos que se trocam com o scroll.** O contentor fica preso enquanto cada painel substitui o anterior.

```html
<section data-emerge-stack
         data-emerge-stack-transition="slide-up"
         data-emerge-stack-scrub>
  <div>Painel 1</div>
  <div>Painel 2</div>
  <div>Painel 3</div>
</section>
```

Precisa de pelo menos 2 painéis.

| Atributo                          | Default | Descrição |
| --------------------------------- | ------- | --------- |
| `data-emerge-stack`               | —       | Ativa |
| `data-emerge-stack-step`          | `100`   | Quantos `vh` de scroll por painel |
| `data-emerge-stack-transition`    | `fade`  | `fade`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `zoom`/`zoom-in`, `zoom-out`, `blur`, `flip` |
| `data-emerge-stack-scrub`         | `false` | A transição é interpolada pelo próprio scroll em vez de por tempo |
| `data-emerge-stack-sticky`        | `true`  | Fixa o contentor |
| `data-emerge-stack-top`           | `0px`   | `top` do elemento fixo |
| `data-emerge-stack-exclude`       | —       | Num filho: não é painel |

**Tokens CSS:** `--emerge-stack-duration` (`.6s`), `--emerge-stack-easing`, `--emerge-stack-shift` (`12%`), `--emerge-stack-blur` (`12px`). O progresso fica em `--emerge-stack-progress`; o painel ativo recebe `.emerge-active`.

**Opções globais:** `stackStep`, `stackTransition`, `stackScrub`. **Eventos:** `emerge:stack:build`, `emerge:stack:change` (`{ el, panel, index }`, só sem scrub).

**API** (`Emerge.Stack`): `build(el)`, `destroy(el)`, `goTo(el, indice)`, `scan()`, `of(el)`, `all`.

> Mesma restrição do Horizontal: nenhum ancestral com `overflow: hidden/auto` (usa `overflow: clip`).

---

## Reel

O **Reel** é a reimplementação unificada dos plugins `Horizontal` e `Stack`: uma "bobina" de painéis presa ao ecrã e avançada pelo scroll. O eixo escolhe o movimento — o trilho translada nos eixos `x`/`y` (herança do Horizontal) ou os painéis ficam empilhados a trocar no eixo `none` (herança do Stack) — e, por cima do movimento, cada painel pode ter o seu próprio efeito de entrada, a combinação que nenhum dos dois fazia sozinho.

> **Estado dos plugins**
>
> | Plugin | Estado |
> | --- | --- |
> | **Reel** | **Recomendado.** Reimplementação unificada do Horizontal e do Stack. |
> | Horizontal / Stack | Mantidos por compatibilidade com projetos que já os utilizam — sem novas funcionalidades. |
>
> O Horizontal e o Stack são, na prática, dois plugins que fazem mais sentido serem um: um move uma faixa, o outro troca painéis. O Reel reimplementa os dois num plugin só — e ainda acrescenta o que nenhum deles tinha sozinho (o efeito de entrada por painel sobre o movimento). **Ambos continuam incluídos e funcionais**; quem já usa pode manter sem pressa, mas para projetos novos (e para migrar) **o mais recomendado é utilizar o Reel**.

Depende do plugin **Range** (registá-lo primeiro). Funciona igual em ficheiros separados ou no bundle.

```html
<!-- como o Horizontal: faixa que desliza -->
<section data-emerge-reel>
  <div>painel 1</div>
  <div>painel 2</div>
</section>

<!-- como o Stack: painéis empilhados que trocam -->
<section data-emerge-reel data-emerge-reel-motion="none" data-emerge-reel-transition="slide-up">
  ...
</section>

<!-- a união: faixa que desliza COM zoom por painel -->
<section data-emerge-reel data-emerge-reel-transition="zoom">
  ...
</section>
```

### Atributos

| Atributo                        | Default        | Descrição                                                                   |
| ------------------------------- | -------------- | --------------------------------------------------------------------------- |
| `data-emerge-reel`              | —              | Ativa a bobina no contêiner (mínimo 2 filhos; exclua com `data-emerge-reel-exclude`). |
| `data-emerge-reel-motion`       | `x`            | Eixo do movimento: `x` (trilho horizontal), `y` (vertical) ou `none` (painéis empilhados). |
| `data-emerge-reel-transition`   | auto¹          | Efeito de entrada por painel: `none`, `fade`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `zoom`/`zoom-in`, `zoom-out`, `blur`, `flip`. |
| `data-emerge-reel-scrub`        | auto²          | Força o modo de condução: presente = `scrub` (contínuo), `="false"` = `step` (discreto). |
| `data-emerge-reel-speed`        | `1`            | Multiplicador da altura do espaçador nos eixos `x`/`y` (viagem mais longa = mais lenta). |
| `data-emerge-reel-step`         | `100`          | vh de scroll por troca de painel (espaçador do eixo `none`, como o `stack-step`). |
| `data-emerge-reel-top`          | `"0px"`        | Offset do sticky (ex.: `"60px"` para ficar abaixo de um header fixo).        |
| `data-emerge-reel-pin`          | `true`         | `"false"` desliga o pin e o espaçador — a bobina anima ao atravessar o ecrã (como o `horizontal-pin`). |
| `data-emerge-reel-sticky`       | `true`         | `"false"` mantém o espaçador mas deixa de prender o contentor (como o `stack-sticky`). |
| `data-emerge-reel-reverse`      | —              | Inverte a viagem: o trilho começa no fim e volta ao início; painel ativo, `index` e eventos seguem o que é exibido (scrub e step). |
| `data-emerge-reel-ease`         | `0`            | Suavização 0–1 do movimento (inércia, via Range).                            |
| `data-emerge-reel-exclude`      | —              | No filho: não entra na bobina.                                               |

¹ Auto: `none` nos eixos `x`/`y` (comportamento Horizontal) e `fade` no eixo `none` (comportamento Stack).
² Auto: `scrub` nos eixos `x`/`y` (Horizontal era contínuo) e `step` no eixo `none` (Stack era discreto). O modo resolvido é escrito pelo JS em `data-emerge-reel-mode="scrub|step"` — é esse atributo que o CSS lê.

### Opções globais e por dispositivo

**Opções globais:** `reelMotion`, `reelTransition`, `reelScrub`, `reelSpeed`, `reelStep`, `reelTop`.

Como todos os plugins, aceita `data-emerge-reel-disable…` e `data-emerge-reel-only…` (`-mobile`, `-desktop`, `-tablet`, `-phone`, `-size`). É o caso ideal para o problema do toque: no telemóvel, deslizar para baixo e a página andar para o lado causa estranheza. Mantém a faixa só no desktop e dá ao mesmo conteúdo outro movimento (ou outro efeito) no mobile, em vez de ficar sem animação:

```html
<!-- faixa horizontal só no desktop -->
<section data-emerge-reel data-emerge-reel-only-desktop>…</section>

<!-- no telemóvel: painéis empilhados a trocar -->
<section data-emerge-reel data-emerge-reel-motion="none" data-emerge-reel-only-mobile>…</section>
```

Ver [Desativar ou ativar só por dispositivo ou largura](#desativar-ou-ativar-só-por-dispositivo-ou-largura).

### API

```js
Emerge.Reel.build(el)            // monta manualmente
Emerge.Reel.destroy(el)          // desfaz (remove classes, vars, espaçador e trilho)
Emerge.Reel.goTo(el, 2)          // scroll suave até ao painel de índice 2
Emerge.Reel.goTo(el, '.alvo')    // …ou até à posição de um elemento/painel
Emerge.Reel.scan()               // procura novos [data-emerge-reel]
Emerge.Reel.measure()            // recalcula distâncias e espaçadores
Emerge.Reel.of(el)               // estado interno da bobina (ou null)
Emerge.Reel.all                  // array com todas as bobinas
```

### Eventos

```js
document.addEventListener('emerge:reel:build',  (e) => { /* e.detail.el, .panels, .track, .axis, .mode */ });
document.addEventListener('emerge:reel:change', (e) => { /* e.detail.el, .panel, .index, .mode */ });
```

### Migração a partir do Horizontal / Stack

A migração é um mapeamento direto de atributos — e pode ser feita aos poucos: enquanto o Horizontal e o Stack continuarem incluídos, os dois estilos convivem na mesma página sem conflito.

| Horizontal                                  | Reel                                    |
| ------------------------------------------- | --------------------------------------- |
| `data-emerge-horizontal`                    | `data-emerge-reel`                      |
| `data-emerge-horizontal-speed="0.85"`       | `data-emerge-reel-speed="0.85"`         |
| `data-emerge-horizontal-top="60px"`         | `data-emerge-reel-top="60px"`           |
| `data-emerge-horizontal-pin="false"`        | `data-emerge-reel-pin="false"`          |
| `data-emerge-horizontal-reverse`            | `data-emerge-reel-reverse`              |
| `data-emerge-horizontal-ease="0.3"`         | `data-emerge-reel-ease="0.3"`           |
| `data-emerge-horizontal-exclude`            | `data-emerge-reel-exclude`              |

| Stack                                       | Reel                                                     |
| ------------------------------------------- | -------------------------------------------------------- |
| `data-emerge-stack`                         | `data-emerge-reel data-emerge-reel-motion="none"`        |
| `data-emerge-stack-step="110"`              | `data-emerge-reel-step="110"`                            |
| `data-emerge-stack-transition="slide-up"`   | `data-emerge-reel-transition="slide-up"`                 |
| `data-emerge-stack-scrub`                   | `data-emerge-reel-scrub`                                 |
| `data-emerge-stack-sticky="false"`          | `data-emerge-reel-sticky="false"`                        |
| `data-emerge-stack-top="60px"`              | `data-emerge-reel-top="60px"`                            |
| `data-emerge-stack-exclude`                 | `data-emerge-reel-exclude`                               |

Variáveis CSS equivalentes: `--emerge-stack-*` / `--emerge-horizontal-*` → `--emerge-reel-*` (`--emerge-reel-shift`, `--emerge-reel-blur`, `--emerge-reel-duration`, `--emerge-reel-easing`, `--emerge-reel-gap`, `--emerge-reel-padding`, `--emerge-reel-item-width`, `--emerge-reel-height`). Cada painel recebe `--emerge-reel-i`, `--emerge-reel-p` e `--emerge-reel-dir` (o mesmo contrato do Stack em scrub), e o contentor recebe `--emerge-reel-index`, `--emerge-reel-progress`, `--emerge-reel-local`, `--emerge-reel-count` e `--emerge-reel-distance`.

Nota: tal como no Horizontal e no Stack, nenhum antecessor do elemento preso pode usar `overflow: hidden/auto` — use `overflow: clip`.

---

## Text

Divide o texto em **letras, palavras ou linhas** e anima cada parte em cascata.

```html
<h2 data-emerge="fade-up" data-emerge-split="chars" data-emerge-step="30">Olá mundo</h2>
<p  data-emerge="blur-up" data-emerge-split="words" data-emerge-order="center">...</p>
```

O texto original fica acessível (`aria-label` no elemento e as partes ficam `aria-hidden`).

| Atributo                    | Default   | Descrição |
| --------------------------- | --------- | --------- |
| `data-emerge-split`         | `chars`   | `chars`, `words` ou `lines` |
| `data-emerge-step`          | `35`      | Atraso entre partes (ms) |
| `data-emerge-order`         | `forward` | `forward`, `reverse`, `center`, `edges`, `random` |
| `data-emerge-spread`        | `0.6`     | No modo scroll, quanto as partes se sobrepõem (0 a .95) |
| `data-emerge-text-delay`    | `0`       | Atraso extra (ms) |

O efeito vem do `data-emerge` do elemento (passa a ser aplicado a cada parte). Com `data-emerge-follow`, a cascata acompanha o scroll. No modo `lines` o texto é redividido quando a largura muda. Classes geradas: `.emerge-split`, `.emerge-word`, `.emerge-part`, `.emerge-char`, `.emerge-line`.

**Opções globais:** `splitBy`, `step`, `order`, `spread`.

**API** (`Emerge.Text`): `split(el, opts)`, `restore(el)`, `parts(el)`, `restoreAll()`.

---

## Spotlight

**Foco circular (ou de outras formas) que segue o cursor/dedo**, em três modos:

| Modo         | Efeito |
| ------------ | ------ |
| `reveal`     | Os elementos marcados com `data-emerge-spotlight-layer` só aparecem dentro do foco |
| `flashlight` | O conteúdo fica escurecido e o foco "recorta" a escuridão |
| `focus`      | O conteúdo fora do foco fica desfocado e escurecido |

```html
<div data-emerge-spotlight="reveal" data-emerge-spotlight-radius="130">
  <img src="normal.jpg">
  <img src="alternativa.jpg" data-emerge-spotlight-layer>
</div>

<div data-emerge-spotlight="flashlight" data-emerge-spotlight-shape="star">Texto</div>
```

| Atributo (`data-emerge-spotlight-…`) | Default   | Descrição |
| ------------------------------------ | --------- | --------- |
| *(valor do atributo principal)*      | `reveal`  | `reveal`, `flashlight` ou `focus` |
| `radius`                             | `100`     | Raio do foco (px) |
| `softness`                           | `30`      | Largura do bordo suave (px) |
| `easing`                             | `0.2`     | Inércia do movimento (0 = cola ao ponteiro) |
| `shape`                              | `circle`  | `circle`, `ellipse`, `square`, `rect`, `rounded`, `diamond`, `hexagon`, `triangle`, `star`, `heart`, `fluid` |
| `ratio`                              | `0.6`     | Altura/largura de `ellipse` e `rect` |
| `trigger`                            | `pointer` | `pointer`, `hover` (ignora toque) ou `manual` (controlas por API) |
| `reverse`                            | `false`   | Inverte o recorte (o efeito passa a estar fora do foco) |
| `persist`                            | `false`   | Mantém o efeito de `flashlight`/`focus` mesmo sem o ponteiro |
| `fit`                                | `cover`   | `cover` ou `contain` (media do `reveal`) |
| `opacity`                            | por modo  | Escuridão do overlay (0 a 1) |
| `blur`                               | por modo  | Desfoque (px) do modo `focus` |
| `color`                              | `#000`    | Cor do overlay |
| `disabled`                           | —         | Desativa a instância |

**Forma `fluid`:** em vez de uma forma geométrica, o foco deixa um rasto líquido que se mistura e dissolve. Opções extra: `trail` (segundos que o rasto demora a dissolver, `1.2`), `swirl` (quanto o ponteiro agita, `1`) e `wobble` (movimento ocioso, `1`).

**Toque (`touch`):** controla como o gesto é partilhado entre o foco e o scroll da página.

| Valor    | Comportamento |
| -------- | ------------- |
| `track`  | (default) o dedo move o foco; a página não faz scroll a partir do elemento |
| `pan-y`  | deslizar na vertical faz scroll; arrastar na horizontal move o foco |
| `pan-x`  | o inverso |
| `scroll` | scroll nativo; o foco aparece enquanto o dedo está pousado |
| `off`    | ignora toque (rato e caneta continuam a funcionar) |

Em alternativa, decide por eixo: `move-y="true"` permite scroll vertical, `move-x="true"` horizontal, `move="true"` ambos. Com `move-intensity="120"` (px) o scroll só arranca depois de o dedo percorrer essa distância, por isso um arrasto curto mostra o efeito e um longo faz scroll.

Enquanto um dedo ou caneta está pousado, a seleção de texto, o menu de contexto em media e o arrastar nativo de imagens ficam suprimidos (links, botões e campos continuam a funcionar).

**Opções globais:** `spotlightRadius`, `spotlightSoftness`, `spotlightEasing`, `spotlightShape`, `spotlightRatio`, `spotlightTrigger`, `spotlightTouch`, `spotlightMove`, `spotlightMoveIntensity`, `spotlightTrail`, `spotlightSwirl`, `spotlightWobble`, `spotlightReverse`, `spotlightPersist`, `spotlightFit`, `spotlightOpacity`, `spotlightBlur`, `spotlightColor`.

**Tokens CSS:** `--emerge-spotlight-z` (z-index do overlay), `--emerge-spotlight-layer-fit`, `--emerge-spotlight-layer-position`.

**API** (`Emerge.Spotlight`):

```js
const s = Emerge.Spotlight.create('#hero', { mode: 'reveal', radius: 160, trigger: 'manual' });
s.update('50%', 120);   // posição manual (px ou %)
s.show(); s.hide();
s.setOptions({ shape: 'heart' });
s.destroy();

Emerge.Spotlight.get(el); Emerge.Spotlight.refresh(); Emerge.Spotlight.destroyAll();
Emerge.Spotlight.all;
```

Em Safari/iOS o plugin aplica a máscara inline e, no modo `focus`, o desfoque do fundo degrada para escurecimento.

---

## Scene

**Hero fixa (sticky) animada pelo scroll**: enquanto fazes scroll, a cena fica presa e o conteúdo seguinte (o *painel*) chega de várias formas.

```html
<section data-emerge-scene="bloom" data-emerge-scene-distance="900">
  <div data-emerge-scene-content>Conteúdo da hero</div>
  <div data-emerge-scene-layer="a">...</div>
  <div data-emerge-scene-layer="b">...</div>
  <div data-emerge-scene-panel>
    A próxima div
    <div data-emerge-scene-cover></div>
  </div>
</section>
```

O painel (`[data-emerge-scene-panel]`) tem de ser **filho direto** da cena (a perspetiva só afeta filhos diretos). `content`, `layer` (`a`/`b`) e `cover` são opcionais.

**Presets** (`data-emerge-scene="…"`):

| Preset    | Efeito |
| --------- | ------ |
| `unfold`  | (default) o painel nasce deitado em 3D e levanta-se até cobrir o ecrã; as luzes `a`/`b` trocam |
| `fold`    | o inverso: o painel cobre o ecrã e encolhe até um cartão centrado (com `scale="0"` desaparece) |
| `bloom`   | o painel nasce pelo centro (pequeno, transparente) e cresce até cobrir |
| `zoom`    | o painel entra grande e transparente e recua até ao tamanho natural |
| `slide`   | o painel empurra pela direita, com parallax do conteúdo |
| `wheel`   | o painel gira em `rotateY` e endireita-se |
| `curtain` | revelação em íris (`clip-path` circular que abre do centro) |
| `blur`    | o painel entra desfocado e "foca" com o scroll |

| Atributo (`data-emerge-scene-…`) | Default          | Descrição |
| -------------------------------- | ---------------- | --------- |
| `distance`                       | `1000`           | px de scroll durante a animação |
| `perspective`                    | `3000`           | Perspetiva (px) |
| `origin`                         | `50% 78%`        | `perspective-origin` (nos presets `wheel`/`curtain` o default é `50% 50%`; no `curtain` é também o centro da íris) |
| `tilt`                           | por preset       | Ângulo `rotateX` (inicial do painel; final no `fold`) |
| `scale`                          | por preset       | Escala X (inicial; final no `fold`) |
| `scale-y`                        | segue `scale`    | Escala Y (`fold`, `bloom` e presets seguintes) |
| `offset`                         | por preset       | `translateY` em % |
| `radius`                         | por preset       | `border-radius` inicial (`fold`: final) |
| `spin`                           | `90`             | `rotateY` inicial do `wheel` (graus) |
| `blur`                           | `24`             | Desfoque inicial do `blur` (px; `0` desliga) |
| `smooth`                         | `2`              | Suavização do scroll (0 = sem suavização) |

Valores iniciais por preset: `unfold` tilt 90, scale .44, offset 27.7, radius 5vw · `fold` scale .5 · `bloom` scale .44 · `zoom` scale 1.6 · `wheel` scale .7 · `blur` scale 1.12 · os restantes usam `radius` 2rem. Os tokens `:root` (`--emerge-scene-perspective`, `-origin`, `-tilt`, `-scale`, `-offset`, `-radius`) só afetam o `unfold`; nos outros presets usa atributos.

A cena publica `--emerge-scene-progress` (0..1). Em `prefers-reduced-motion` ou quando desativada, fica estática: a hero e o painel aparecem em fluxo normal, sem pin nem 3D.

**Opções globais:** `sceneDistance`, `scenePerspective`, `sceneOrigin`, `sceneTilt`, `sceneScale`, `sceneOffset`, `sceneRadius`, `sceneSmooth`.

**Eventos:** `emerge:scene:build`, `emerge:scene:progress`, `emerge:scene:enter`, `emerge:scene:leave`.

**API** (`Emerge.Scene`): `build(el)`, `destroy(el)`, `destroyAll()`, `scan()`, `measure()`, `of(el)`, `all`.

> Nenhum ancestral da cena pode ter `overflow: hidden/auto` enquanto o pin estiver ativo; usa `overflow: clip`.

---

## Magnetic

Faz os elementos serem **atraídos pelo cursor** quando este se aproxima. Um único `requestAnimationFrame` partilhado trata de todos e adormece quando nada se move. Não usa `preventDefault`: o scroll nunca é afetado.

```html
<button data-emerge-magnetic>Botão</button>

<div data-emerge-magnetic="card" data-emerge-magnetic-tilt="true">
  <h3 data-emerge-magnetic-child="0.6">Título</h3>
  <p  data-emerge-magnetic-child="1.2">Acompanha com outro fator</p>
</div>
```

| Atributo (`data-emerge-magnetic-…`) | Default   | Descrição |
| ----------------------------------- | --------- | --------- |
| *(valor do atributo principal)*     | *(vazio)* | vazio = padrão; `card` = superfícies grandes (atração mais suave) |
| `strength`                          | `.3` (`card`: `.2`) | Fração da distância ao centro que o elemento acompanha |
| `radius`                            | `60` (`card`: `40`) | Distância (px) a partir da borda em que começa a atração |
| `speed`                             | `6`       | Resposta do movimento |
| `ease`                              | `linear`  | Curva de queda: `linear`, `quad`, `cubic`, `sine`, `out-quad`, `out-cubic` |
| `tilt`                              | `false`   | Inclinação 3D |
| `tilt-strength`                     | `10`      | Ângulo máximo (graus) |
| `perspective`                       | `800`     | Perspetiva do tilt (px) |
| `touch`                             | `false`   | Reage também a toque |
| `child` *(nos filhos)*              | `1`       | Fator de deslocamento do filho |

Opções por token CSS (`--emerge-magnetic-strength`, `-radius`, `-speed`, `-ease`, `-tilt`, `-tilt-strength`, `-perspective`) ou globais (`magneticStrength`, `magneticRadius`, `magneticSpeed`, `magneticEase`, `magneticTilt`, `magneticTiltStrength`, `magneticPerspective`, `magneticTouch`). O atributo ganha sempre.

Escreve a propriedade `translate` (e `transform` só com tilt), por isso compõe com o teu CSS. Sem suporte a transformações individuais, com `prefers-reduced-motion` ou sem JS, os elementos ficam na posição natural. **Eventos:** `emerge:magnetic:build`, `:engage`, `:release`, `:destroy`.

**API** (`Emerge.Magnetic`): `build(el)`, `destroy(el)`, `destroyAll()`, `scan()`, `release()`, `measure()`, `of(el)`, `all`.

---

## Parallax

**Deslocamento ligado ao scroll**, com camadas em profundidade. O deslocamento é centrado: a meio do percurso o elemento está na posição natural.

```html
<!-- elemento simples -->
<div data-emerge-parallax="0.3">...</div>

<!-- imagem que se move dentro de um contentor com overflow -->
<div class="moldura" data-emerge-parallax="-0.3" data-emerge-parallax-target="img">
  <img src="foto.jpg">
</div>

<!-- camadas -->
<div data-emerge-parallax="0">
  <div data-emerge-parallax-layer="0.6"></div>
  <div data-emerge-parallax-layer="-0.4"></div>
</div>
```

| Atributo (`data-emerge-parallax-…`) | Default | Descrição |
| ----------------------------------- | ------- | --------- |
| *(valor do atributo principal)*     | `0.3`   | Velocidade. Positiva anda à frente do scroll; negativa fica atrás (fundo clássico); `-1` congela o elemento no ecrã |
| `speed`                             | `0.3`   | Igual ao valor principal, por atributo separado |
| `axis`                              | `y`     | `y`, `x` ou `both` |
| `rotate`                            | —       | Ângulo final (graus), de 0 até ao valor |
| `scale`                             | —       | Escala final, de 1 até ao valor |
| `opacity`                           | —       | Opacidade final, de 1 até ao valor |
| `from` / `to`                       | `enter` / `exit` | Janela do Range |
| `smooth`                            | `0`     | Suavização (segundos) |
| `target`                            | —       | Seletor de um filho a animar em vez do próprio elemento |
| `layer` *(nos filhos)*              | `1`     | Fator da camada |

**Opções globais:** `parallaxSpeed`, `parallaxAxis`, `parallaxRotate`, `parallaxScale`, `parallaxOpacity`, `parallaxFrom`, `parallaxTo`, `parallaxSmooth`, `parallaxTarget`. Também existem tokens CSS `--emerge-parallax-*` com os mesmos nomes. Coexiste com `data-emerge` no mesmo elemento.

**Eventos:** `emerge:parallax:build`, `emerge:parallax:destroy`.

**API** (`Emerge.Parallax`): `build(el)`, `destroy(el)`, `destroyAll()`, `scan()`, `measure()`, `of(el)`, `all`.

---

## Particles

Transforma o texto de um elemento em **letras feitas de muitas partículas pequenas e macias**, desenhadas num canvas. O cursor (ou dedo) dispersa-as e elas regressam ao lugar em ondas. A **legibilidade em repouso é prioritária**: a maioria das partículas define a forma, e só alguns acentos luminosos e um halo discreto dão o aspeto de nuvem.

```html
<h1 data-emerge-particles="repel"
    data-emerge-particles-color="#7CFFB2,#6EA8FF,#B8FFD9">PARTÍCULAS</h1>

<h2 data-emerge-particles="swirl"
    data-emerge-particles-color="gradient(#ff7eb6,#6ea8ff)">swirl</h2>
```

O texto real continua no DOM (com `color: transparent`), por isso é selecionável, pesquisável e lido por leitores de ecrã. Não combinar com `data-emerge-split` no mesmo elemento.

| Atributo (`data-emerge-particles-…`) | Default   | Descrição |
| ------------------------------------ | --------- | --------- |
| *(valor do atributo principal)*      | `repel`   | `repel`, `attract` ou `swirl` |
| `look`                               | `legible` | `legible` (letras nítidas + acentos + halo), `cloud` (nuvem esparsa; só em títulos grandes e a negrito) ou `grid` (grelha original) |
| `contrast`                           | `0.8`     | 0..1. `1` = mais corpo e menos efeitos; `0` = mais nuvem |
| `gap`                                | auto      | Espaçamento da amostragem (px); menor = mais partículas |
| `size`                               | auto      | Tamanho base da partícula (px), limitado pela espessura do traço |
| `shape`                              | `soft`    | `soft` (gradiente radial), `circle` ou `square` |
| `color`                              | cor do texto | Cor CSS; paleta `a,b,c`; `random`; `gradient(#a,#b,…)` |
| `color-jitter`                       | `0.3`     | Variação de matiz/saturação/luminosidade (0..1) |
| `color-angle`                        | `0`       | Ângulo do `gradient()` (graus) |
| `color-weights`                      | —         | Pesos da paleta, por ex. `1,2,1` |
| `random`                             | `build`   | Quando nascem novas cores aleatórias: `build`, `resample` ou `interval:N` (segundos, com transição suave) |
| `random-hue` / `-sat` / `-light`     | `0-360` / `65-95` / `55-80` | Intervalos do modo `random` |
| `seed`                               | auto      | Semente do aleatório (a forma não "treme" no resize) |
| `density`                            | por look  | 0.1..1; só rarefaz o interior dos traços (as bordas ficam sempre completas) |
| `depth`                              | por look  | 0..1; modula sobretudo os acentos |
| `halo`                               | por look  | 0..1; poeira junto aos contornos (máx. 10% do total) |
| `glow`                               | `auto`    | `auto`, `on`, `off`. Brilho aditivo nos acentos (em fundo claro usa sombra suave) |
| `jitter`                             | por look  | 0..1; desalinhamento da grelha de amostragem |
| `drift`                              | por look  | Flutuação permanente (px); `0` deixa o motor adormecer |
| `radius`                             | `100`     | Raio de influência do ponteiro (px) |
| `strength`                           | `1`       | Intensidade da repulsão/atração |
| `return`                             | `1`       | Tempo aproximado de regresso (s) |
| `friction`                           | `0.92`    | Atrito (0..1) |
| `intro`                              | `none`    | `assemble`: nascem espalhadas e juntam-se ao entrar no ecrã |
| `max`                                | ~4000 (~2500 em mobile) | Teto de partículas, halo incluído |
| `touch`                              | `pan-y`   | `pan-y`, `track`, `scroll`, `off` |
| `sampling`                           | `organic` | `organic` ou `grid` |

Tudo também pode ser definido por token CSS (`--emerge-particles-*`) ou opção global (`particlesMode`, `particlesLook`, `particlesContrast`, `particlesColor`, `particlesRadius`, `particlesDrift`, …). Ordem de prioridade: atributo > token CSS > opção global > preset do look.

Fora do ecrã, com o separador escondido e com `prefers-reduced-motion`, o motor pára. Na impressão o texto real volta.

**Eventos:** `emerge:particles:build`, `emerge:particles:settle`, `emerge:particles:destroy`.

**API** (`Emerge.Particles`):

```js
Emerge.Particles.build(el);  Emerge.Particles.destroy(el);
Emerge.Particles.resample(el);          // volta a amostrar (após mudar o texto/opções)
Emerge.Particles.disperse(el, x, y);    // impulso manual (px relativos ao elemento)
Emerge.Particles.setColor(el, 'gradient(#f0f,#0ff)'); // muda a cor sem voltar a amostrar
Emerge.Particles.legibility(el, { dpr: 2 }); // → { score, ncc, spill, ... } (0..1)
Emerge.Particles.scan(); Emerge.Particles.measure(); Emerge.Particles.destroyAll();
Emerge.Particles.of(el); Emerge.Particles.all;
```

`legibility()` mede o quão legível é o estado assente (o look `legible` com os valores por omissão deve pontuar ≥ 0,75).

---

## Smooth

Scroll suave com inércia, ao estilo do Lenis. **Não substitui o scroll por `transform`**: intercepta a roda do rato, calcula uma posição suavizada e chama `window.scrollTo()` a cada frame. O scroll continua a ser o do browser, por isso `position: sticky`, `IntersectionObserver` e todos os plugins por scroll (Range, Reel, Scene, Parallax, Media…) funcionam sem alterações.

É **opt-in**: registado no bundle, mas só atua quando ativado. Sem ativação, nada muda no teu site.

```html
<!-- 1. declarativo: no <html> (ou no <body>) -->
<html data-emerge-smooth>

<!-- 2. com opções -->
<html data-emerge-smooth data-emerge-smooth-lerp="0.08" data-emerge-smooth-anchor-offset="-80">
```

```js
// 3. por JS
Emerge.init({ smooth: true });                     // ou { smooth: { lerp: 0.08, duration: 0 } }
Emerge.Smooth.init({ lerp: 0.08 });                // ativar/reativar à mão
```

**O que é suavizado:** roda do rato e trackpad (vertical), links `#âncora` (com `scroll-margin-top` / `scroll-padding-top` respeitados) e `Emerge.Smooth.scrollTo()`. **Fica nativo:** toque, teclado, barra de scroll, gestos horizontais, `ctrl+roda` (zoom), `<textarea>`/contentores com `overflow: auto|scroll` que ainda podem andar na direção da roda, e qualquer elemento com `data-emerge-smooth-prevent`. Scroll que não foi iniciado pelo plugin (teclado, barra, `Reel.goTo`…) é detetado e a posição interna sincroniza-se.

**Atributos** (no elemento com `data-emerge-smooth`):

| Atributo                               | Padrão | Descrição |
| -------------------------------------- | ------ | --------- |
| `data-emerge-smooth`                   | —      | Ativa o plugin (`false` desliga, mesmo com `smooth: true` no `init`) |
| `data-emerge-smooth-lerp`              | `0.1`  | Fração da distância percorrida por frame a 60 fps (0.01–1). Menor = mais suave/lento. Independente da taxa de atualização do ecrã |
| `data-emerge-smooth-duration`          | `0`    | Segundos. `> 0` troca o modo *lerp* pelo modo *duração* (tween com `easing` a cada gesto da roda) |
| `data-emerge-smooth-easing`            | `expo` | Só modo duração e `scrollTo`: `linear`, `quad`, `cubic`, `quart`, `sine`, `expo`, `in-out-cubic`, `in-out-expo` |
| `data-emerge-smooth-wheel`             | `1`    | Multiplicador do deslocamento da roda |
| `data-emerge-smooth-anchors`           | `true` | Links `#âncora` com scroll suave (e `history.pushState` + foco no destino) |
| `data-emerge-smooth-anchor-offset`     | `0`    | Pixels somados ao destino das âncoras (ex.: `-80` para uma barra fixa) |
| `data-emerge-smooth-anchor-duration`   | `1.2`  | Segundos |
| `data-emerge-smooth-prevent`           | —      | **No elemento interior:** mantém o scroll nativo por cima dele. No elemento raiz: seletor CSS extra com o mesmo efeito |
| `data-emerge-smooth-ignore`            | —      | **Num `<a>`:** deixa o browser tratar a âncora |

**Opções globais** (`Emerge.init`): `smooth` (`false` | `true` | objeto), `smoothLerp`, `smoothDuration`, `smoothEasing`, `smoothWheel`, `smoothAnchors`, `smoothAnchorOffset`, `smoothAnchorDuration`, `smoothPrevent`. Precedência: atributo > objeto `smooth` > opções planas > padrões. Aceita também `data-emerge-smooth-disable-mobile`, `-only-desktop`, etc. (ver [Desativar ou ativar só por dispositivo](#desativar-ou-ativar-só-por-dispositivo-ou-largura)).

**API** (`Emerge.Smooth`):

```js
Emerge.Smooth.init(opts);  Emerge.Smooth.destroy();      // ativar / repor o scroll nativo
Emerge.Smooth.stop();      Emerge.Smooth.start();        // pausar / retomar (modais, menus) — também bloqueia teclado e toque
Emerge.Smooth.toggle();

Emerge.Smooth.scrollTo(alvo, {          // alvo: número | elemento | seletor | 'top' | 'bottom'
  offset: 0, duration: 1.2, easing: 'expo',
  immediate: false,                     // salta sem animar
  lock: false,                          // ignora a roda até terminar
  force: false,                         // funciona mesmo com stop()
  onComplete() {}
});

const off = Emerge.Smooth.on('scroll', ({ scroll, target, limit, progress, velocity, direction }) => {});
Emerge.Smooth.on('start' | 'stop', fn);  off();          // ou Emerge.Smooth.off(nome, fn)

Emerge.Smooth.scroll;  .target;  .limit;  .progress;  .velocity;  .direction;
Emerge.Smooth.active;  .stopped;  .isScrolling;  .options;
```

Se o plugin estiver inativo (por exemplo com `prefers-reduced-motion`), `Emerge.Smooth.scrollTo()` usa `window.scrollTo` nativo, sem animação em reduced motion — o teu código não precisa de verificar.

**Eventos:** `emerge:smooth:enable` e `emerge:smooth:disable` (no `document`). **Classes no `<html>`:** `.emerge-smooth` (ativo), `.emerge-smooth-scrolling` (a animar), `.emerge-smooth-stopped` (após `stop()`).

**Notas**
- Com `prefers-reduced-motion` o core não inicializa os plugins: o scroll fica 100 % nativo.
- Enquanto ativo, o plugin aplica `scroll-behavior: auto !important` ao `<html>` (um `scroll-behavior: smooth` do site brigaria com o `scrollTo` por frame) e repõe o valor original no `destroy()`.
- `scroll-snap-type` no `<html>` não combina com scroll suave por JS — desativa o snap ou usa `data-emerge-smooth-disable`.
- `Emerge.refreshHard()` recria o plugin só com a configuração declarativa (atributos e `Emerge.init`); opções passadas só em `Emerge.Smooth.init(opts)` têm de ser repetidas.
- Os plugins Reel/Stack/Horizontal continuam a usar `scrollTo({ behavior: 'smooth' })` nativo nos seus `goTo`; funciona, mas sem o easing do Smooth.

---

## Desativar ou ativar só por dispositivo ou largura

Qualquer plugin pode ser **desativado** (`disable`) ou **ativado apenas** (`only`) por tipo de dispositivo ou largura, elemento a elemento. O prefixo é o nome do plugin: `range`, `draw`, `horizontal`, `media`, `stack`, `reel`, `split` (Text), `spotlight`, `scene`, `magnetic`, `parallax`, `particles`, `smooth`. Para o próprio efeito do core, o prefixo desaparece: `data-emerge-disable…` e `data-emerge-only…`.

O dispositivo é detetado pelo *user agent* (`mobile` = `phone` + `tablet`); a largura (`-size`) usa a janela atual.

### Desativar (`disable`)

```html
<div data-emerge-parallax="0.3" data-emerge-parallax-disable-mobile></div>
<section data-emerge-scene="bloom" data-emerge-scene-disable-size="max@768"></section>
<div data-emerge-spotlight data-emerge-spotlight-disable="phone"></div>
<div data-emerge="fade-up" data-emerge-disable="mobile"></div>
```

| Atributo                                                | Efeito |
| ------------------------------------------------------- | ------ |
| `…-disable-mobile` / `-desktop` / `-tablet` / `-phone`  | Desativa nesse tipo de dispositivo |
| `…-disable-size="max@768,min@1400"`                     | Desativa por largura (lista separada por vírgulas) |
| `…-disable="mobile\|tablet\|phone\|desktop"` (ou vazio)  | Forma compacta (vazio desativa sempre) |

### Ativar só em certos dispositivos (`only`)

O oposto do `disable`: o efeito **só** corre nos dispositivos / larguras indicados e fica desativado em todos os outros. É útil quando um efeito funciona bem num tipo de dispositivo mas não noutro, e queres **trocá-lo** por outro em vez de ficar sem animação.

O caso típico é o `Horizontal`: no telemóvel, deslizar o dedo para baixo e a página andar para o lado causa estranheza. Em vez de só desativar no mobile (e ficar sem animação), usa o Horizontal no desktop e outro efeito no mobile:

```html
<!-- faixa horizontal só no desktop -->
<section data-emerge-horizontal data-emerge-horizontal-only-desktop>…</section>

<!-- no mobile, o mesmo bloco ganha um efeito magnético -->
<button data-emerge-magnetic data-emerge-magnetic-only-mobile>Botão</button>

<!-- só em ecrãs até 768px -->
<div data-emerge-parallax="0.3" data-emerge-parallax-only-size="max@768"></div>

<!-- forma compacta, com vários valores -->
<div data-emerge-spotlight data-emerge-spotlight-only="phone,tablet"></div>
```

| Atributo                                              | Efeito |
| ----------------------------------------------------- | ------ |
| `…-only-mobile` / `-desktop` / `-tablet` / `-phone`   | Ativa só nesse tipo de dispositivo |
| `…-only-size="max@768,min@1400"`                      | Ativa só nessas larguras (lista separada por vírgulas) |
| `…-only="mobile\|tablet\|phone\|desktop"`              | Forma compacta; aceita vários valores separados por vírgula (`only="phone,tablet"`) |

Regras:

- Se um elemento tiver **vários** `only-*`, basta **um** deles corresponder para o efeito ficar ativo (é um *ou*).
- Fora dos dispositivos indicados o elemento fica desativado, exatamente como com `disable`.
- Se o mesmo elemento tiver `disable` e `only`, o **`disable` ganha**.
- Sem nenhum atributo `only`, nada muda.
- Funciona em todos os plugins e no core, porque todos passam pela mesma verificação (`Emerge.core.isDisabledFor`).

Na opção global `disable` (em `Emerge.init`) continuam a valer `true`, `'mobile'`, `'phone'`, `'tablet'` ou uma função `() => boolean`.

No Scene, desativar (ou `prefers-reduced-motion`) mantém o conteúdo visível em fluxo normal, sem pin.

> Os atributos `disable` e `only` são lidos quando o elemento é registado (no `init`, no `refresh` e ao entrar no DOM). A largura (`-size`) é reavaliada no `refresh` dos plugins que fazem pin (Horizontal, Stack, Reel, Scene…), por exemplo num `resize`; o tipo de dispositivo não muda durante a sessão.

## Criar um plugin

Um plugin é um objeto com `name`, `defaults`, `install(core)` e `hooks`. O que `install` devolve passa a ser a API pública (`Emerge.SeuPlugin`).

```js
Emerge.addPlugin({
  name: 'Wiggle',
  defaults: { wiggleIntensity: 10 },
  install(core) {
    return { wiggle(el) { /* … */ } };        // vira Emerge.Wiggle
  },
  hooks: {
    init() { /* percorre o documento */ },
    observe({ el, opts }, core) {             // para cada [data-emerge] registado
      if (core.hasAttr(el, 'wiggle') && !core.isDisabledFor(el, 'wiggle')) {
        core.claim(el, 'Wiggle');             // assume o elemento
      }
    },
    in({ el }) {},  out({ el }) {},           // entrou / saiu do viewport
    unobserve({ el }) {},  refresh() {},  teardown() {},
  },
});
```

No `core` tens: `attr` / `numAttr` / `hasAttr` (leitura de `data-emerge-*`), `dispatch`, `claim` / `release` / `isClaimed`, `isDisabledFor` (já inclui `disable` e `only` para o prefixo que passares), `device`, `prefersReducedMotion`, `resolveEasing`, `debounce` e `utils.clamp` / `utils.lerp`. Chama `core.isDisabledFor(el, 'meu-plugin')` em `observe` e em `refresh` para o teu plugin herdar de borla o `disable` / `only`. Se usares scroll, consome o `Emerge.Range` (e regista-o antes).

## Conteúdo dinâmico

Elementos `[data-emerge]` inseridos no DOM depois de `Emerge.init()` são detetados via `MutationObserver`. Os plugins Spotlight, Magnetic, Parallax e Particles mantêm um observador próprio, por isso os seus elementos também são apanhados. Nada disto é necessário chamar à mão, a menos que `disableMutationObserver: true` esteja ativo; nesse caso usa `Emerge.refresh()`.

## prefers-reduced-motion

Por omissão (`respectReducedMotion: true`), se o utilizador tiver a preferência de movimento reduzido ativa, a Emerge desativa-se: os elementos ficam visíveis, sem animação e sem configuração extra. Os plugins fazem o mesmo (Scene fica estática, Particles mostra o texto normal, Magnetic e Parallax não escrevem nada, Media mostra os controlos).

## Problemas comuns

| Sintoma | Causa provável |
| ------- | -------------- |
| Os elementos ficam invisíveis ou não animam | Falta o `emerge.css`, ou o `Emerge.init()` não foi chamado. Com o bundle por `http(s)` o CSS carrega sozinho; com `data-emerge-css="false"` tens de incluir o `<link>` |
| Um plugin não faz nada | Não foi registado (`Emerge.addPlugin(...)`) antes do `init()`, ou o `Range` foi registado depois de plugins que dependem dele |
| `Emerge` / `EmergeX` não está definido | O `<script>` do core ou do plugin está depois do código que o usa, ou o URL está errado (ver as rotas `/js`, `/js/emerge`, `/css`) |
| `Horizontal`, `Stack`, `Reel` ou `Scene` não ficam presos (sem pin) | Um ancestral tem `overflow: hidden` ou `auto`. Troca por `overflow: clip` |
| No telemóvel, a página "anda para o lado" ao deslizar | Usa `…-only-desktop` no Horizontal (e, se quiseres, outro efeito com `…-only-mobile`), em vez de `disable-mobile`, que deixa o bloco sem animação |
| Nada anima só para alguns visitantes | Têm `prefers-reduced-motion` ativo (por omissão a Emerge respeita-o) |
| A versão da CDN do jsDelivr está atrás | O jsDelivr guarda cache. Usa a [CDN oficial](#cdn-oficial-recomendada) ou fixa uma tag de versão |
| `Particles` junto com `data-emerge-split` | Não combinar no mesmo elemento |
| Elementos adicionados depois do init não animam | Só com `disableMutationObserver: true`: chama `Emerge.refresh()` |

## Compatibilidade

- **Core e plugins de scroll:** `IntersectionObserver` e `MutationObserver` nativos (todos os browsers modernos). Não há polyfill.
- **Magnetic e Parallax:** precisam de transformações individuais em CSS (`translate`, `rotate`, `scale`); sem suporte ficam inertes.
- **Particles:** precisa de canvas 2D; sem suporte mostra o texto normal.
- **Spotlight:** usa `mask-image`; Safari/WebKit tem tratamento próprio (máscara inline, `focus` sem desfoque de fundo).

## Licença

MIT
