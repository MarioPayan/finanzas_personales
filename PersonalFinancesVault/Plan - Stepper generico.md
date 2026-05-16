# Plan — Stepper genérico + capa de UI atractiva

> Plan para introducir un **componente Stepper** que orqueste el flujo del
> diagnóstico sin saber nada de finanzas, y empezar a construir una capa
> visual atractiva por encima. Pre-implementación: documento de
> alineación antes de empezar.

Relacionado: [[Plan de Accion - Roadmap v2]] (este plan materializa la
parte de "desacoplar UI de lógica" que estaba implícita en C1-C5).

---

## 1. Por qué

`src/views/Diagnosis/Diagnosis.tsx` hoy (231 líneas) mezcla 6
responsabilidades:

1. Estado del flujo (índice actual, respuestas, intersticiales, done).
2. Lógica de navegación (`goNext`, applicability, skip).
3. Auto-advance y debouncing.
4. Detección de país / SMM.
5. Render del nodo activo (`QuestionStep`).
6. Render de pantallas especiales (`SectionScore`, `Summary`).

Y `QuestionStep.tsx` (336 líneas) tiene un *registry implícito* de
renderers en sus `if (question.type === 'chips')` ... etc.

**Consecuencia**: cualquier cambio de UI (animaciones, layout
gamificado, navegación distinta) toca código que también sabe de
`DIAGNOSIS_QUESTIONS` y de cómo se computa `isApplicable`. Eso bloquea
gamificar sin romper.

---

## 2. Idea central

Separar en **tres capas**:

```
┌─────────────────────────────────────────────┐
│ Capa 3 · Diagnosis (adaptador)              │  Conoce diagnosis.ts
│  - convierte DIAGNOSIS_QUESTIONS a Step[]   │  Conoce scoring/insights
│  - decide qué renderer usar por type        │
│  - sabe de intersticiales (sectionScore...) │
└─────────────────────────────────────────────┘
                    ▼ steps: Step<TAnswer>[]
┌─────────────────────────────────────────────┐
│ Capa 2 · Stepper (UI pura, genérica)        │  No conoce finanzas
│  - estado de navegación + respuestas        │  No conoce DIAGNOSIS_QUESTIONS
│  - skip lógico, progreso, auto-advance      │  Reutilizable en otros quizzes
│  - render: delega al step.render            │
│  - transiciones, layout                     │
└─────────────────────────────────────────────┘
                    ▼ ChipOption[], etc.
┌─────────────────────────────────────────────┐
│ Capa 1 · Inputs (átomos)                    │  No conocen nada
│  - ChipGroup, Toggle, RangeSlider, ...      │  Hoy ya están aislados
└─────────────────────────────────────────────┘
```

El Stepper recibe **steps tipados**, sabe ejecutar el flujo, **no sabe**
qué hay dentro. Si los objetos cumplen el contrato `Step<TAnswer>`, los
ejecuta.

> Nota sobre "clase": el resto del repo usa function components con
> hooks. Recomendamos seguir esa convención — `Stepper` es un function
> component + types, no `class extends`. Si más adelante necesitamos
> control imperativo (ej. ".reset()", ".goTo(id)"), exponemos via
> `useImperativeHandle` con un ref. Avisame si preferís class literal.

---

## 3. Contratos

### Tipos núcleo (`src/components/Stepper/types.ts`)

```ts
/**
 * Un paso es autocontenido: sabe cuándo aplica, cuándo está completo,
 * y cómo se renderiza dada una respuesta + el state completo de
 * respuestas. El Stepper no inspecciona el contenido — solo orquesta.
 */
export type Step<TAnswer = unknown> = {
  /** Identificador estable. Sirve como key de React y de answers. */
  id: string

  /** Etiqueta corta para barra de progreso / debug. */
  title?: string

  /**
   * Si devuelve false, el paso se omite del flujo (cuenta como
   * "resuelto" para la barra de progreso pero no se renderiza).
   */
  isApplicable: (answers: Record<string, TAnswer>) => boolean

  /**
   * Si devuelve true, el botón Siguiente se habilita. Para pasos
   * intersticiales (sin pregunta), siempre devuelve true.
   */
  isComplete: (answers: Record<string, TAnswer>) => boolean

  /**
   * Renderiza el cuerpo del paso. El Stepper se encarga del marco
   * (header con prompt, footer con navegación, transiciones).
   */
  render: (ctx: StepRenderCtx<TAnswer>) => ReactNode

  /**
   * Si true, una interacción del cuerpo puede pedir auto-avance vía
   * `ctx.commit()`. Por default false (el usuario debe presionar
   * Siguiente). Por ejemplo: chips de selección única → true.
   */
  allowsAutoAdvance?: boolean

  /**
   * Marca el paso como "intersticial" (sin respuesta esperada). El
   * Stepper lo trata como pantalla informativa: sin botón Siguiente
   * deshabilitado por completeness, con un CTA propio (ej. "Continuar"
   * en SectionScore, "Reiniciar" en Summary).
   */
  kind?: 'question' | 'interstitial'

  /** Header opcional: prompt/hint que el Stepper renderiza arriba del body. */
  header?: {prompt: string; hint?: string}
}

export type StepRenderCtx<TAnswer> = {
  answer: TAnswer | undefined
  answers: Record<string, TAnswer>
  setAnswer: (value: TAnswer) => void
  commit: () => void
}
```

### Props del Stepper

```ts
export type StepperProps<TAnswer> = {
  steps: readonly Step<TAnswer>[]
  initialAnswers?: Record<string, TAnswer>
  initialStepId?: string

  // Callbacks (todos opcionales)
  onAnswersChange?: (answers: Record<string, TAnswer>) => void
  onStepChange?: (stepId: string) => void
  onComplete?: (answers: Record<string, TAnswer>) => void

  // Personalización visual (todos opcionales — el Stepper trae defaults)
  renderProgress?: (state: StepperState) => ReactNode
  renderNavigation?: (state: StepperState, actions: StepperActions) => ReactNode
  renderSidebar?: (state: StepperState) => ReactNode

  // Comportamiento
  autoAdvanceMs?: number // default 250
}
```

### API interna expuesta (vía hook + context)

```ts
// Hijos del Stepper pueden suscribirse al estado actual:
useStepperState() → StepperState
useStepperActions() → StepperActions

type StepperState = {
  currentIndex: number
  currentStep: Step | null
  visibleSteps: Step[]      // los aplicables
  totalCount: number        // de los originales (no skipped)
  resolvedCount: number     // completos + saltados
  progress: number          // 0..100
  answers: Record<string, unknown>
  isFirst: boolean
  isLast: boolean
  done: boolean
}

type StepperActions = {
  setAnswer: (id: string, value: unknown) => void
  goNext: () => void
  goBack: () => void
  goTo: (id: string) => void
  reset: () => void
  commit: () => void  // dispara goNext con debounce de autoAdvanceMs
}
```

---

## 4. Migración paso a paso

### Fase A · Stepper genérico (sin tocar la app)

1. Crear `src/components/Stepper/` con:
   - `types.ts` — los tipos de arriba.
   - `Stepper.tsx` — function component + hooks. Maneja todo el
     state interno.
   - `StepperContext.tsx` — context + provider para que partes
     internas/hijos accedan al state.
   - `defaults/` — implementaciones default de Progress y Navigation
     (suficientemente básicas, fáciles de override).
2. Tests Vitest (`Stepper.test.tsx`): cubrir aplicabilidad, skip,
   navegación, auto-advance, completeness, callbacks. **Sin React Testing
   Library todavía** — testeamos la lógica del Stepper con un mock
   simple de Step. Si después queremos test de render, sumamos `@testing-library/react`.
3. Verificar typecheck + tests.

### Fase B · Adapter de diagnosis (paridad)

1. `src/views/Diagnosis/diagnosisStepRegistry.ts` — registry
   `{ chips, toggle, slider, number, multiChips, grid }` → renderers
   tipados. Migra el contenido de `QuestionStep.tsx` desarmado.
2. `src/views/Diagnosis/buildDiagnosisSteps.ts` — función pura:
   ```
   buildDiagnosisSteps({ smm, countryCode }) → Step<AnswerValue>[]
   ```
   Itera por `DIAGNOSIS_QUESTIONS` y los nodos de resultado
   (`SECTION_SCORE_NODES`, `SUMMARY_NODE`), produciendo `Step` con
   `kind: 'question' | 'interstitial'` y `render` apuntando al registry.
3. `Diagnosis.tsx` se simplifica a algo así:
   ```tsx
   <Stepper
     steps={steps}
     onComplete={() => {}}
     renderSidebar={state => <Sidebar ... />}
   />
   ```
4. Mantener feature-parity total: auto-advance, skip, sidebar
   actualizable, SectionScore intersticial, Summary final. Si algo
   regresa, lo arreglamos antes de seguir.

### Fase C · Estética básica (los "huesos" gamificados)

1. **Transiciones de paso**: slide horizontal (entrada desde derecha,
   salida hacia izquierda). Lib: ver decisión §6.
2. **Progreso animado**: la barra crece smooth, no salta. Indicadores
   por sección (4 segmentos coloreados, completados → pintados).
3. **Cards de paso**: cada paso vive en una Card centrada con sombra
   suave, padding generoso. Limita ancho útil de lectura (~640px).
4. **Header del paso**: prompt en `h4`, hint en `body2 text.secondary`,
   chip de categoría con color del bloque (base/debt/stability/investment).
5. **Footer del paso**: botones Atrás / Siguiente con jerarquía clara
   (primary filled vs ghost). En último paso → "Ver resultados".

### Fase D · Micro-interacciones (lo que vuelve "as fuck")

1. Chip seleccionado: scale 1.0 → 1.05 → 1.0 + check icon que aparece.
2. **Floating "+X pts"** al responder, dirigido al mini-scorecard del
   sidebar. Aparece, vuela, desaparece.
3. Slider con feedback en vivo: el monto derivado pulsa suave al
   cambiar.
4. Toggle con animación de switch (no el MUI default cuadrado).
5. Hover y focus consistentes en todos los inputs.
6. Reducción de movimiento respetada (`prefers-reduced-motion`).

### Fase E · SectionScore y Summary repensados

1. **SectionScore**: ya es el momento "wow" de hoy. Sumar contador
   animado (0 → score), badge del perfil de la sección (de `profiles.ts`),
   fondo de la card teñido del color de banda.
2. **Summary**: card con score global + perfil global del usuario
   (del `getOverallProfile`), insights agrupados por severidad con
   animación de entrada escalonada. CTA "Reiniciar".

---

## 5. Tratamiento de pasos especiales

### Intersticiales (`__sectionScore__*`, `__summary__`)

Modelados como `Step<AnswerValue>` con:

- `kind: 'interstitial'`
- `isApplicable` = ¿la sección anterior está completa?
- `isComplete` = siempre `true` (no espera respuesta)
- `render(ctx)` = renderiza la pantalla y un CTA que llama a
  `ctx.commit()` para avanzar
- `header` ausente (la pantalla tiene su propio título grande)

El Stepper no necesita saber nada especial — la lógica de "pasar entre
secciones" sale del `isApplicable` puro.

### Grids con filas dinámicas (`debtAmounts`, `investmentAmounts`)

La complejidad de "cuántas filas tiene este grid" sigue viviendo en el
adapter (`buildDiagnosisSteps` consulta `getGridRows`). El Stepper solo
ve un `Step` y un `render`.

---

## 6. Decisiones que necesito de vos

### 6.1 — Animation library

| Opción | Pros | Contras | Tamaño aprox |
| --- | --- | --- | --- |
| **Framer Motion** (recomendado) | DX excelente, control fino, gestures, layout animations, comunidad enorme | Dep adicional | ~50 KB gzip |
| CSS Transitions + `clsx` | Cero dep, simple | Mucho menos potente; orquestar enter/exit es manual | 0 KB |
| `react-spring` | Físicas reales, performante | DX más áspera que Framer | ~30 KB gzip |

→ Mi propuesta: **Framer Motion**. Si querés mantener cero deps
extra, vamos con CSS y aceptamos que las transiciones son más
modestas. El v1 anterior tenía Framer en su plan.

### 6.2 — Alcance de este sprint

| Opción | Descripción |
| --- | --- |
| **A — Fases A+B solamente** (refactor puro) | Stepper genérico + paridad. UI sigue visualmente igual. Sprint corto. |
| **B — A+B+C** (refactor + estética básica) | Lo anterior + cards, header, footer, transiciones simples. La app se ve diferente sin micro-interacciones todavía. |
| **C — A hasta E** (todo de un tirón) | Todo el plan. Sprint largo. |

→ Mi propuesta: **B**. Cierra una experiencia completa visualmente más
trabajada sin entrar a las micro-interacciones (que se afinan mejor
viendo el resultado de la fase C en pantalla).

### 6.3 — Persistencia del Stepper

Hoy las respuestas viven en memoria; si recargás, perdés todo. ¿Querés
que el Stepper persista en `localStorage` o lo mantenemos volátil?

→ Mi propuesta: **volátil** por ahora (alineado con [[Rollback - Estado minimo]]).
Cuando lleguemos a la pantalla final con carta compartible, se decide
de nuevo.

### 6.4 — Tests del Stepper

Solo lógica con Vitest (sin renderizar React), o con
`@testing-library/react` para cubrir interacción real?

→ Mi propuesta: arrancar **solo Vitest puro** (state machine del
Stepper con un Step mock). RTL se suma en Fase D cuando entren las
animaciones — ahí sí necesitamos validar interacción visual.

### 6.5 — Naming

Hoy "Stepper" choca con `MUI Stepper` (componente distinto, lineal con
checkpoints). ¿Te parece mejor un nombre que no colisione?

| Opción | Notas |
| --- | --- |
| `Stepper` | Lo que pediste. Importaríamos como `import {Stepper} from '../components/Stepper'` (no MUI). |
| `Flow` / `Quiz` | Más expresivos pero "Flow" choca con XState; "Quiz" cierra el dominio. |
| `Walkthrough` | Largo. |

→ Mi propuesta: **mantener `Stepper`** + aliasing claro en imports. El
namespace está bajo nuestro `src/components/Stepper/`, no se mezcla con
MUI.

---

## 7. Riesgos identificados

1. **Regresión de UX**: feature-parity es la red de seguridad. Si después
   de la Fase B algo se siente distinto que ahora, lo arreglamos antes
   de empezar la Fase C.
2. **Tipos genéricos**: parametrizar `Step<TAnswer>` puede dar fricción
   con `AnswerValue` que es una unión. Riesgo bajo — si TS molesta,
   simplificamos a `Step` no genérico y casteamos en el adapter.
3. **Framer Motion + MUI**: hay casos conocidos de jitter cuando
   animás `Box` MUI con motion. Mitigación: usar `motion.div` puro
   dentro de `Box`, no spreadear sx por encima.
4. **Sidebar acoplado a estado**: hoy el Sidebar lee de `Diagnosis.tsx`
   varios bits. Necesita un hook propio (`useStepperState`) o recibir
   props directos del adapter. Lo resolvemos en Fase B.

---

## 8. Qué NO está en este plan

- Onboarding (C2 del roadmap). El Stepper habilita onboarding como
  steps adicionales pre-quiz, pero el contenido editorial se diseña
  aparte.
- Personaje narrador / mascota.
- Modo oscuro.
- Carta exportable a PNG.
- Mobile-first review (cuando el rediseño esté maduro).

---

## 9. Aprobación

Necesito tu visto bueno explícito en:

1. § 6.1 — animation library
2. § 6.2 — alcance del sprint
3. § 6.3 — persistencia
4. § 6.4 — tests
5. § 6.5 — naming

Marcá tu opción al lado o respondé en chat. Cuando esté aprobado,
arranco con la Fase A.

---

## 10. Bitácora de ejecución (mayo 2026)

Plan ejecutado de un tirón con las recomendaciones del §6:

- §6.1 → Framer Motion ✅
- §6.2 → Todas las fases A-E ✅
- §6.3 → Volátil ✅
- §6.4 → Vitest + RTL para hooks (renderHook) ✅
- §6.5 → `Stepper` (sin colisión con MUI) ✅

### Fase A · Stepper genérico ✅

- `src/components/Stepper/` con `types.ts`, `useStepper.ts`,
  `StepperContext.tsx`, `Stepper.tsx`, `defaults/`.
- `Step<TAnswer>` con `isApplicable`, `isComplete`, `render(ctx)`,
  `kind: 'question' | 'interstitial'`, header opcional, tag/tagColor.
- 22 tests + 1 skipped cubren navegación, skip dinámico, auto-advance
  con debounce + cancel, callbacks, reset, intersticiales.
- Deps sumadas: `vitest` (ya estaba), `@testing-library/react`, `jsdom`.

### Fase B · Adapter de diagnóstico ✅

- `DiagnosisQuestionBody.tsx`: extrae el render del input
  (chips/toggle/slider/grid/etc) sin chrome.
- `buildDiagnosisSteps.tsx`: convierte DIAGNOSIS_QUESTIONS + 4 SectionScore
  + 1 Summary en `Step<AnswerValue>[]`. Los nodos de resultado se modelan
  como `kind: 'interstitial'` con `isComplete: () => true`.
- `Diagnosis.tsx` simplificado a ~80 líneas (vs. 231 originales).
- `QuestionStep.tsx` borrado (su contenido se distribuyó).

### Fase C · Card layout + transiciones + progreso segmentado ✅

- Stepper envuelve el body en una `<Card>` con barra de acento superior
  coloreada según el `tagColor`. Animación slide horizontal entre pasos
  con `AnimatePresence`. Respeta `prefers-reduced-motion`.
- `DefaultHeader` refinado: chip outlined arriba, prompt h4 con
  letter-spacing negativo.
- `DefaultNavigation` refinado: botones large con flechas, texto cambia
  a "Ver resultado" en el último paso.
- `DiagnosisProgress.tsx`: 4 segmentos coloreados (teal/amber/blue/
  emerald) que se rellenan animados según el progreso por sección.
- `theme.ts` refinado: tipografía con jerarquía marcada, cards con
  doble sombra para sensación editorial.
- Dep sumada: `framer-motion`.

### Fase D · Micro-interacciones ✅

- ChipGroup: bounce spring (`scale 1 → 1.06 → 1`) al seleccionar,
  check glyph inline animado, badge flotante "+X pts" cuando la opción
  tiene score positivo.
- Toggle: reemplaza `ToggleButtonGroup` por dos Buttons con animación
  de bounce y `whileTap` para feedback táctil.

### Fase E · SectionScore y Summary repensados ✅

- SectionScore: contador animado 0 → score (easeOutCubic), círculo
  200px con fondo teñido, card del perfil de sección (de
  `profiles.ts`), insights con stagger entrance.
- Summary: hero con perfil global (`getOverallProfile`) sobre
  gradient sutil, mini-grid horizontal de scores por sección con
  stagger, insights agrupados con animación escalonada, card de
  respuestas más sobria.

### Verificación final

- `npm run typecheck` ✅
- `npm run test` ✅ (22 + 1 skipped, snapshots de perfiles canónicos
  intactos)
- `npm run build` ✅

Commits (8 en este sprint):
- `28c9e97` feat(stepper): Stepper genérico
- `c7004ed` refactor(diagnosis): adaptar al Stepper
- `f262260` feat(ui): card + transición + progress segmentado
- `5fd5948` feat(ui): micro-interacciones chips/toggle
- `770a6a6` feat(ui): SectionScore y Summary repensados
