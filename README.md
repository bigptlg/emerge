# Emerge.js

Biblioteca leve de animações reveladas por scroll, construída sobre `IntersectionObserver` nativo. Sem dependências, sem listener de `scroll`, sem cálculo de posição a cada frame.

## Instalação

Copia os dois ficheiros para o projeto e inclui-os no HTML:

```html
<link rel="stylesheet" href="emerge.css">
<script src="emerge.js"></script>
```

Também funciona como módulo CommonJS ou AMD (UMD embutido):

```js
const Emerge = require('./emerge.js');
```

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

## Opções globais

Passadas em `Emerge.init({ ... })`. Todas podem ser sobrepostas por elemento através dos atributos `data-emerge-*` (ver secção seguinte).

| Opção                     | Tipo                                              | Default        | Descrição                                                                 |
| -------------------------- | -------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| `offset`                   | `number`                                            | `120`          | Deslocamento em px do ponto de disparo, dentro do viewport                  |
| `delay`                    | `number`                                            | `0`            | Atraso em ms antes da animação começar                                     |
| `duration`                 | `number`                                            | `400`          | Duração da transição em ms                                                 |
| `easing`                   | `string`                                            | `'ease'`       | Nome do easing (ver tabela abaixo)                                         |
| `once`                     | `boolean`                                           | `false`        | Se `true`, anima só uma vez e não reverte ao sair do ecrã                   |
| `mirror`                   | `boolean`                                           | `false`        | Se `true`, desfaz a animação ao sair do ecrã (mesmo sem `once`)             |
| `anchorPlacement`          | `string`                                            | `'top-bottom'` | Ponto de disparo — combinação `elemento-viewport` (ver secção própria)      |
| `disable`                  | `boolean \| 'mobile' \| 'phone' \| 'tablet' \| fn`  | `false`        | Desativa a biblioteca condicionalmente                                     |
| `respectReducedMotion`     | `boolean`                                           | `true`         | Desativa automaticamente se o utilizador preferir menos animações           |
| `animatedClassName`        | `string`                                            | `'emerge-animate'` | Classe aplicada quando o elemento está revelado                        |
| `initClassName`            | `string`                                            | `'emerge-init'`    | Classe aplicada a todos os elementos observados desde o início         |
| `useClassNames`            | `boolean`                                           | `false`        | Se `true`, aplica também o valor de `data-emerge` como classe CSS           |
| `disableMutationObserver`  | `boolean`                                           | `false`        | Desativa a deteção automática de elementos adicionados ao DOM depois do init |
| `resizeDebounce`           | `number`                                            | `80`           | Debounce em ms para recalcular posições no resize                          |

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

| Atributo                        | Descrição                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| `data-emerge`                    | **Obrigatório.** Nome da animação (ver presets disponíveis)             |
| `data-emerge-offset`             | Sobrepõe `offset` para este elemento                                    |
| `data-emerge-delay`              | Sobrepõe `delay`                                                        |
| `data-emerge-duration`           | Sobrepõe `duration`                                                     |
| `data-emerge-easing`             | Sobrepõe `easing`                                                       |
| `data-emerge-once`               | Sobrepõe `once`                                                         |
| `data-emerge-mirror`             | Sobrepõe `mirror`                                                       |
| `data-emerge-anchor-placement`   | Sobrepõe `anchorPlacement`                                              |
| `data-emerge-anchor`             | Seletor CSS de outro elemento — a posição de disparo passa a ser calculada a partir dele, mas a animação continua a ser aplicada a este elemento |
| `data-emerge-id`                 | Identificador usado no evento `emerge:in:{id}`                          |

## Presets de animação (`data-emerge`)

- **Fade**: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-up-left`, `fade-up-right`, `fade-down-left`, `fade-down-right`
- **Zoom**: `zoom-in`, `zoom-out`, `zoom-in-up`, `zoom-in-down`, `zoom-in-left`, `zoom-in-right`, `zoom-out-up`, `zoom-out-down`, `zoom-out-left`, `zoom-out-right`
- **Slide**: `slide-up`, `slide-down`, `slide-left`, `slide-right`
- **Flip**: `flip-up`, `flip-down`, `flip-left`, `flip-right`

Também é possível usar `data-emerge="qualquer-nome"` e definir o próprio CSS para esse nome — a biblioteca só gere a classe `emerge-animate`, os presets acima vêm do `emerge.css` mas não são obrigatórios.

## `anchorPlacement`

Define o ponto de disparo combinando um ponto de referência do **elemento** (primeira parte) com um ponto do **viewport** (segunda parte): `top`, `center` ou `bottom`.

```
top-bottom   (default) → topo do elemento atinge a base do viewport
center-center           → centro do elemento atinge o centro do viewport
bottom-top               → base do elemento atinge o topo do viewport
```

E as restantes 6 combinações da grelha 3×3 (`top-top`, `top-center`, `center-top`, `center-bottom`, `bottom-center`, `bottom-bottom`).

> Nota técnica: para `top-bottom` o cálculo é exato (é o comportamento nativo do `IntersectionObserver`). Para os outros placements é uma aproximação geométrica, recalculada a cada resize — funciona bem para elementos mais pequenos que o viewport, que é o caso comum.

## Nomes de easing suportados

`linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `ease-in-back`, `ease-out-back`, `ease-in-out-back`, `ease-in-sine`, `ease-out-sine`, `ease-in-out-sine`, `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad`, `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`, `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart`.

Um nome não reconhecido é passado tal como está para o CSS (permite usar qualquer `cubic-bezier(...)` diretamente em `data-emerge-easing`).

## API JavaScript

```js
Emerge.init(options)     // inicia a biblioteca, devolve os elementos observados
Emerge.refresh()         // reobserva novos [data-emerge] adicionados ao DOM
Emerge.refreshHard()      // reinicia tudo do zero (remove classes e observers, reinicializa)
```

## Eventos

Disparados em `document`, com o elemento no `event.detail`:

```js
document.addEventListener('emerge:in', (e) => {
  console.log('revelado:', e.detail);
});

document.addEventListener('emerge:out', (e) => {
  console.log('escondido:', e.detail);
});

// se o elemento tiver data-emerge-id="hero-title"
document.addEventListener('emerge:in:hero-title', (e) => {
  console.log('o título apareceu');
});
```

## Conteúdo adicionado dinamicamente

Elementos `[data-emerge]` inseridos no DOM depois de `Emerge.init()` são detetados automaticamente via `MutationObserver` — não é preciso chamar `refresh()` manualmente, a menos que `disableMutationObserver: true` esteja ativo.

## `prefers-reduced-motion`

Por omissão (`respectReducedMotion: true`), se o sistema do utilizador tiver a preferência de movimento reduzido ativa, a Emerge desativa-se automaticamente — os elementos ficam visíveis sem animação, sem necessidade de configuração extra.

## Compatibilidade

Requer `IntersectionObserver` e `MutationObserver` nativos — suportados em todos os browsers modernos (Chrome, Firefox, Safari, Edge). Não há polyfill incluído.

## Licença

MIT
