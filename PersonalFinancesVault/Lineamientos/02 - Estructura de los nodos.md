# Estructura de los nodos

Un "nodo" es una pregunta del diagnóstico. Vive en
`src/content/diagnosis.ts` dentro de `DIAGNOSIS_QUESTIONS`. Cada nodo es un
objeto autocontenido — sin lógica externa hardcodeada — analizable como JSON.

## Campos comunes a todo nodo

| Campo            | Tipo                          | Obligatorio | Para qué sirve                                                                 |
| ---------------- | ----------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `storageKey`     | `string`                      | sí          | Identificador único. La respuesta se guarda bajo esta clave en `Answers`.      |
| `title`          | `string`                      | sí          | Etiqueta corta del paso (1–3 palabras). Se usa en el árbol del sidebar y para análisis externo. |
| `description`    | `string`                      | sí          | Contexto largo (1–2 oraciones) sobre qué mide el nodo y por qué importa. No se renderiza en la UI; sirve para análisis fuera de la app. |
| `prompt`         | `string`                      | sí          | La pregunta visible al usuario.                                                |
| `hint`           | `string`                      | no          | Texto auxiliar bajo el prompt. Aclaraciones cortas.                            |
| `category`       | `DiagnosisCategoryId`         | sí          | A qué bloque pertenece (`base`, `debt`, `stability`, `investment`).            |
| `glossaryTerms`  | `readonly string[]`           | no          | Ids de entradas en `glossary.ts`. Solo se muestran si el término aparece literalmente en el texto del nodo. |
| `sidebarWidgets` | `readonly SidebarWidgetId[]`  | no          | Componentes auxiliares del panel lateral que este nodo activa.                 |
| `tips`           | `readonly string[]`           | no          | Indicaciones contextuales que el sidebar muestra mientras el nodo es el actual. Ver [[03 - Panel lateral]]. |
| `dependsOn`      | `readonly DependencyClause[]` | no          | Cláusulas de aplicabilidad. AND entre cláusulas.                               |
| `derivation`     | `Derivation`                  | no          | Estrategia para contextualizar opciones/slider con respuestas previas.          |
| `type`           | `'chips' \| 'slider' \| 'toggle' \| 'number' \| 'multiChips' \| 'grid'` | sí | Discriminante de la unión.                                                     |

## Tipos de pregunta

### `chips` — selección única (con valor exacto opcional)

| Campo        | Tipo                       | Para qué sirve                                                              |
| ------------ | -------------------------- | --------------------------------------------------------------------------- |
| `options`    | `readonly ChipOption[]`    | Bandas/categorías de respuesta.                                              |
| `exactInput` | `ExactInput` (opcional)    | Si está presente, el usuario también puede escribir un número exacto.        |

Respuesta: `string` (el `value` de la opción seleccionada) o `number` (el valor
exacto). El renderer prioriza la última interacción.

### `slider`

`min`, `max`, `step`, `defaultValue`, `unit?`, `marks?`. Respuesta: `number`.

### `toggle`

`trueLabel?`, `falseLabel?`. Respuesta: `boolean`.

### `number` — entrada numérica directa

`min?`, `max?`, `step?`, `unit?`, `defaultValue?`, `placeholder?`. Respuesta:
`number`.

### `multiChips` — selección múltiple

`options: readonly ChipOption[]`. Respuesta: `readonly string[]` con los
`value` seleccionados. Vacío permitido (ver `dependsOn` con `nonEmpty`).

### `grid` — celda repetida por fila

| Campo       | Tipo                | Para qué sirve                                                          |
| ----------- | ------------------- | ----------------------------------------------------------------------- |
| `rowSource` | `GridRowSource`     | De dónde salen las filas. Ver abajo.                                    |
| `cell`      | `GridCell`          | Tipo de celda repetido por fila. Hoy: `chips` (con `exactInput?`) o `number`. |

`GridRowSource`:
- `{ kind: 'count', storageKey, labelTemplate }` — N filas según un nodo
  `number` previo. `labelTemplate` admite `{n}` (1-indexed).
- `{ kind: 'multiSelectLabels', storageKey }` — una fila por cada opción
  seleccionada en un nodo `multiChips` previo. Las etiquetas salen del `label`
  de la opción.

Respuesta: `readonly (string | number | null)[]` indexada por posición de
fila. `null` significa fila pendiente.

## `ChipOption`

| Campo      | Tipo                  | Para qué sirve                                                                       |
| ---------- | --------------------- | ------------------------------------------------------------------------------------ |
| `value`    | `string`              | Identificador único de la opción dentro del nodo.                                    |
| `label`    | `string`              | Texto principal del chip.                                                            |
| `sublabel` | `string` (opcional)   | Texto secundario estático bajo el label. Se sobrescribe si la derivación produce uno calculado. |
| `examples` | `readonly string[]` (opcional) | Ejemplos asociados a esta opción. Se muestran inline dentro del chip.            |
| `bracket`  | `OptionBracket` (opcional) | `{min?, max?}` numérico. Se combina con la `derivation` del nodo para producir un valor real. Ver [[04 - Derivaciones y formulas]]. |

## `ExactInput`

`{ min?, max?, step?, unit?, placeholder? }`. Configura el input numérico que
puede acompañar a una pregunta `chips` o ser la celda de un `grid`.

## `DependencyClause`

Cláusula declarativa. AND entre cláusulas en un mismo `dependsOn`. Cada
cláusula admite un solo operador:

| Operador      | Significado                                                |
| ------------- | ---------------------------------------------------------- |
| `equals`      | Igualdad escalar.                                          |
| `in`          | Pertenencia a un conjunto de escalares.                    |
| `greaterThan` | Mayor estricto. Para respuestas `number`.                  |
| `nonEmpty`    | Para arrays (`multiChips`, `grid`): hay al menos un valor. |

## Reglas

- **Los ejemplos viven solo dentro de las opciones.** No hay un campo
  `examples` a nivel del nodo.
- **Los tips son contextuales del paso, no del recorrido.** Solo se muestran
  cuando el nodo es el actual; al pasar al siguiente, los tips se ocultan.
- **El `description` es para análisis, no para la UI.**
- **`storageKey` es estable.** Cambiarlo invalida respuestas guardadas y rompe
  `dependsOn`/`derivation`/`rowSource` que lo referencian. Si renombras,
  hacelo intencional y propaga.

## Renderizado uniforme

La representación visual de un nodo está partida en dos capas:

1. **Cuerpo del input** — `src/views/Diagnosis/DiagnosisQuestionBody.tsx`.
   Función pura que recibe el nodo y renderiza el input correspondiente
   (chips, toggle, slider, number, multiChips, grid) sin chrome.
2. **Chrome del paso** — el `Stepper` genérico
   (`src/components/Stepper/`). Envuelve cada paso en una `Card` y delega
   el header (prompt + hint) a `DefaultHeader` y la navegación
   (atrás / siguiente) a `DefaultNavigation`. El adaptador
   `buildDiagnosisSteps.tsx` traduce `DIAGNOSIS_QUESTIONS` + los nodos
   de resultado (`SECTION_SCORE_NODES`, `SUMMARY_NODE`) a `Step<AnswerValue>[]`
   con la propiedad `render: ctx => <DiagnosisQuestionBody ... />`.

Así se cumple el principio de "una sola representación visual" sin que
el Stepper sepa nada de finanzas: cualquier nodo aplica el mismo marco
porque vive como `Step`, y cualquier input aplica el mismo layout
porque pasa por `DiagnosisQuestionBody`.

### Avance del cuestionario

Los inputs decisivos (chip click en `chips`, click en una opción de `toggle`)
llaman a `ctx.commit()` para auto-avanzar tras un debounce
(`autoAdvanceMs`, default 250 ms). Inputs sin un fin claro de interacción
(slider, número exacto tipeado, multi-chip, grid) **nunca** auto-avanzan:
el usuario presiona Siguiente.

El botón Siguiente/Terminar se renderiza al pie del paso **solo cuando es
necesario**. La regla: si toda interacción posible del nodo commitea, el
botón es redundante y se oculta; si existe al menos una vía no-commit
(escribir un valor exacto, mover un slider, marcar varios chips, completar
un grid), el botón se muestra deshabilitado hasta que `isAnswerComplete`
devuelve `true`.

Resultado por tipo:

| Tipo                                         | Auto-avanza | Botón Siguiente |
| -------------------------------------------- | ----------- | ----------------|
| `toggle`                                     | sí          | oculto          |
| `chips` sin `exactInput`                     | sí          | oculto          |
| `chips` con `exactInput`                     | chip click sí, exacto no | visible |
| `slider`, `number`, `multiChips`, `grid`     | no          | visible         |

La inconsistencia que evita la regla: un nodo nunca pide *dos* clicks para
una misma decisión (chip + Siguiente). Si todos los caminos al "completo"
son single-click, no hay botón. Si alguno requiere escritura o múltiples
elecciones, el botón aparece para confirmar.

### Puntaje por sección

Cada sección del diagnóstico (`base`, `debt`, `stability`, `investment`)
arroja un puntaje de 0 a 100 que se calcula a partir de las respuestas de
las preguntas aplicables y completas en esa categoría. La función vive en
`src/utils/scoring.ts` (`computeSectionScore`).

#### Dónde declarar el puntaje

| Tipo de pregunta                        | Campo                                                                |
| --------------------------------------- | -------------------------------------------------------------------- |
| `chips` (cada opción)                   | `option.score: number` (0–100). Default 0.                           |
| `chips` con `exactInput` (valor exacto) | `question.exactScore: ValueScoring`; si falta, se intenta ubicar el valor en algún `bracket` y se usa el `score` de esa opción. |
| `multiChips` (cada opción)              | `option.score: number`. La pregunta acumula la suma de los seleccionados. |
| `toggle`                                | `question.score: {whenTrue, whenFalse}`.                             |
| `slider`                                | `question.score: ValueScoring` — bandas `[{min?, max?, score}]`.     |
| `number`                                | `question.score: ValueScoring`.                                      |
| `grid` con `cell.kind === 'chips'`     | `cell.options[i].score`; `cell.exactScore` para el valor exacto.     |
| `grid` con `cell.kind === 'number'`    | `cell.score: ValueScoring`.                                          |

`ValueScoring` es un array de `ScoreBand`. Cada banda matchea con
intervalos `[min, max)` (min inclusivo, max exclusivo). Sin `min` significa
"hasta `max`"; sin `max` significa "desde `min` en adelante". El primer
match gana.

#### Cómo se compone el puntaje de la sección

Por cada pregunta aplicable y completa de la categoría:

- **`max`**: el máximo absoluto que esa pregunta puede aportar.
  - chips: `max(option.score)` (se elige una sola).
  - chips con `exactScore`: `max(max chip score, max exactScore band)`.
  - multiChips: `Σ option.score` (todas seleccionables).
  - toggle: `max(whenTrue, whenFalse)`.
  - slider/number: `max band score`.
  - grid: `(per-row max) × filas`.

- **`earned`**: lo que la respuesta otorgó.
  - chips/grid chip: `option.score` de la opción seleccionada (o lookup
    por bandas/bracket si fue valor exacto).
  - multiChips: suma de scores de las opciones seleccionadas.
  - toggle: `whenTrue` o `whenFalse` según el valor.
  - slider/number/grid number: lookup por bandas.

Puntaje de la sección: `Σ earned / Σ max × 100`, redondeado.

Preguntas omitidas por dependencia (`hasDebt = false` apaga el resto del
bloque de deuda) **no se cuentan**. La pregunta gate sí se cuenta y aporta
su `whenFalse` — por eso "no tengo deudas" da naturalmente 100 en Deudas:
la única aplicable es `hasDebt = false → 100`.

Preguntas sin scoring (`max = 0`) tampoco se cuentan, así una pregunta
informativa no tiene que penalizar el total.

### Insights (diagnóstico + tip por nodo)

Cada nodo puede declarar `insights: readonly Insight[]`. Cada insight es
un par diagnóstico + tip que aparece en la pantalla final del diagnóstico
**solo si su condición se cumple**. La función vive en
`src/utils/insights.ts` (`collectInsights`).

```ts
type Insight = {
  id: string                    // único dentro del nodo
  diagnostic: string            // descripción del estado del usuario
  tip: string                   // recomendación accionable
  when: InsightCondition        // condición declarativa
  severity?: 'positive' | 'info' | 'warning' | 'critical'  // default 'info'
}
```

#### Condiciones (`InsightCondition`)

Árbol JSON-puro que se evalúa contra `answers`. Sin funciones embebidas —
así un sistema externo puede analizar qué se va a recomendar sin
ejecutar el código de la app.

**Composición:**

| `kind` | Significado                                |
| ------ | ------------------------------------------ |
| `all`  | AND lógico sobre `of: InsightCondition[]`. |
| `any`  | OR lógico sobre `of: InsightCondition[]`.  |
| `not`  | Negación de `of: InsightCondition`.        |

**Átomos sobre la respuesta de un nodo (`key: storageKey`):**

| `kind`                      | Aplica a            | Significado                                                |
| --------------------------- | ------------------- | ---------------------------------------------------------- |
| `equals`                    | escalar             | `answers[key] === value`.                                   |
| `in`                        | escalar             | `answers[key] ∈ values`.                                    |
| `numberAbove` / `numberBelow` / `numberAtLeast` / `numberAtMost` | número | Comparaciones numéricas estrictas / no estrictas.           |
| `multiHas`                  | multiChips          | Una opción específica está seleccionada.                   |
| `multiCountAtLeast` / `AtMost` | multiChips       | Cantidad de seleccionadas.                                  |
| `gridAnyIn` / `gridEveryIn` | grid (chips)        | Alguna fila / todas las filas tienen valor en `values`.     |
| `gridCountInAtLeast`        | grid (chips)        | Hay al menos `count` filas con valor en `values`.           |
| `gridAnyNumberAbove` / `gridAnyNumberBelow` / `gridEveryNumberBelow` | grid (number) | Umbrales por fila. |

**Átomos derivados (no necesitan `key`):**

| `kind`                                  | Significado                                              |
| --------------------------------------- | -------------------------------------------------------- |
| `incomeBelowSmmTimes`                   | Ingreso mensual estimado < `multiplier × SMM`. Resuelve banda + valor exacto. |
| `incomeAboveSmmTimes`                   | Análogo, `>`.                                            |
| `incomeBelowCountryAverageTimes`        | Ingreso mensual estimado < `multiplier × media nacional`. La media viene de WID (`src/content/incomeBenchmarks.ts`); cae a `false` si el país no tiene benchmark o si la moneda del benchmark no coincide con la del SMM. |
| `incomeAboveCountryAverageTimes`        | Análogo, `>`.                                            |
| `obligatoryAbsoluteBelowSmmTimes`       | `obligatoryPct × monthlyIncome / 100 < multiplier × SMM`. Sirve para validar que el porcentaje obligatorio se interprete contra un piso absoluto: si el monto efectivo no supera ese piso, el `%` no es comparable entre países y refleja otra realidad (vivienda familiar, subsidios). |
| `obligatoryAbsoluteAboveSmmTimes`       | Análogo, `>`. Útil como guard de `numberAbove(obligatoryPct, ...)` para que el warning de "porcentaje alto" solo dispare cuando el monto efectivo sí pase el piso. |

#### Cómo se eligen y muestran

El recolector recorre los nodos aplicables y completos, evalúa cada
insight, y devuelve los que matched, ordenados por severidad
(`critical → warning → info → positive`). El render agrupa por
categoría en la pantalla final del diagnóstico.

Insights de un nodo cuya pregunta fue **omitida por dependencia** o
**no completada** no se evalúan — así un usuario que respondió "no
tengo deudas" no recibe insights del bloque de deudas (excepto el del
gate `hasDebt`, que sí aplica con su rama `whenFalse`).

Las condiciones pueden referenciar **cualquier** nodo, no solo el
propio. Eso habilita insights compuestos del tipo "no estás invirtiendo,
pero tu situación lo permitiría" → vive en `invests`, lee
`emergencyMonths` y `debtMagnitude` para condicionarse.

### Nodos de resultado (`SectionScoreNode`, `SummaryNode`)

Las dos pantallas que el usuario ve **entre** y **después** del flujo
de preguntas — el puntaje de sección (`SectionScore.tsx`) y el
diagnóstico final (`Summary.tsx`) — también son **nodos**, declarados
en `src/content/diagnosis.ts`. No están en `DIAGNOSIS_QUESTIONS`
(no son preguntas), pero siguen el mismo principio: **toda la
información que les pertenece vive dentro del objeto del nodo**, y
todos los consumidores (UI del diagnóstico, vista de debug, scoring)
leen del mismo objeto.

#### `SectionScoreNode`

Uno por categoría, en `SECTION_SCORE_NODES`. Su `storageKey` sigue
el patrón `__sectionScore__{cat}`.

| Campo            | Tipo                       | Para qué sirve |
| ---------------- | -------------------------- | --------------- |
| `storageKey`     | `string`                   | Id estable del paso (`__sectionScore__{cat}`). |
| `kind`           | `'sectionScore'`           | Discriminante. |
| `category`       | `DiagnosisCategoryId`      | Categoría que resume. |
| `title`          | `string`                   | Etiqueta del paso para grafo y debug. |
| `description`    | `string`                   | Texto largo: qué muestra y cuándo aparece. |
| `formula`        | `string`                   | Fórmula declarativa del cálculo. La implementación es `computeSectionScore` en `src/utils/scoring.ts`. |
| `inclusionRules` | `readonly string[]`        | Reglas humanas que decide qué preguntas aportan. |
| `toneBands`      | `readonly ToneBand[]`      | Bandas que mapean `score` → color y mensaje al usuario. |

`ToneBand`: `{min?, max?, color, message}`. Intervalos `[min, max)`,
similar a `ScoreBand` del scoring. `color` es un token semántico
(`success`/`warning`/`error`/`info`/`primary`); el render decide
cómo mapearlo a CSS. `message` es el texto literal que ve el usuario.

`SectionScore.tsx` consume el nodo: hace lookup con
`findSectionScoreNode(category)`, calcula el score, y resuelve la
banda con `resolveToneBand(node.toneBands, score)` (helper en
`scoring.ts`). El componente queda como render puro — no contiene
las bandas hardcoded.

#### `SummaryNode`

Único, en `SUMMARY_NODE`. `storageKey: '__summary__'`.

| Campo            | Tipo                                         | Para qué sirve |
| ---------------- | -------------------------------------------- | --------------- |
| `storageKey`     | `string`                                     | Id estable. |
| `kind`           | `'summary'`                                  | Discriminante. |
| `title`          | `string`                                     | Etiqueta para grafo y debug. |
| `userHeading`    | `string`                                     | `<h1>` que ve el usuario. |
| `description`    | `string`                                     | Texto largo. |
| `components`     | `readonly SummaryComponent[]`                | Piezas de la pantalla, en orden. |
| `severityOrder`  | `readonly InsightSeverity[]`                 | Orden global del listado de insights. **Fuente única**: `insights.ts` lo lee para ordenar `collectInsights`. |
| `severityLabels` | `Record<InsightSeverity, SeverityLabel>`     | Por severidad, `{label, color}`. Lo consumen `Summary.tsx` (render) y la vista de debug. |

`SummaryComponent`: `{id, title, description, userHeading?}`. La UI
usa `userHeading` cuando quiere un encabezado visible al usuario;
`title` y `description` son para análisis y debug.

`SeverityLabel`: `{label, color}` — `color` es un token semántico
de MUI.

#### Reglas para los nodos de resultado

- **Toda la información del nodo vive en el nodo.** Si la UI del
  diagnóstico, la vista de debug, o el scoring necesitan un texto,
  banda, color, fórmula u orden — viene del nodo. No se duplica en
  los componentes.
- **Lo derivable se calcula con helpers**, no se duplica en el dato:
  `resolveToneBand`, `computeQuestionMax`, `computeSectionScore`,
  `collectInsights`. Cada helper consume el nodo correspondiente.
- **`storageKey` estable.** Cambiar `__sectionScore__{cat}` o
  `__summary__` rompe los lookups del grafo y de los Drawers.

### Vista de debug (`/debug`)

Visualización **interna** del cuestionario, montada sobre **GoJS**
(`gojs`, sin wrapper React). Pensada para entender el flujo y la
estructura de los nodos del cuestionario sin leer código —
deliberadamente no se libera al público porque GoJS tiene licencia
comercial. La página se carga lazy: GoJS solo entra al chunk de
`/debug`, no al bundle del diagnóstico.

Composición:

1. **Grafo vertical** (`src/views/Debug/DebugGraph.tsx`):
   `LayeredDigraphLayout` con `direction: 90` (DOWN). El flujo del
   cuestionario corre de arriba hacia abajo.

   Las cuatro categorías financieras (`base`, `debt`, `stability`,
   `investment`) son **Groups** con su propio `LayeredDigraphLayout`
   interno, también vertical. Cada Group tiene fondo tintado del
   color de la categoría y un header con su `label` largo, así la
   identidad de categoría no necesita repetirse en cada nodo. El
   orden cronológico del cuestionario coincide con el orden vertical
   de los Groups en `CATEGORY_ORDER`.

   Hay **cuatro templates de nodo** (`nodeCategoryProperty: 'kind'`
   en el modelo, para no chocar con la `category` financiera):

   - **`question`** (default) — rounded rectangle compacto. Título +
     `storageKey` monospace + chip con el `type`. Sin descripción,
     prompt, scoring ni insights inline.
   - **`gate`** — figura `Diamond`. Se aplica a los nodos cuyo
     `storageKey` es source de al menos una arista de salto en
     `buildEdges` (es decir: gates donde la rama negativa es
     alcanzable — toggles y chips con dependientes). Imita el patrón
     de flowchart clásico.
   - **`sectionScore`** — capsule (RoundedRectangle con `parameter1`
     alto) en color sólido de la categoría con texto blanco. Es un
     nodo **sintético** (no existe en `DIAGNOSIS_QUESTIONS`) que
     representa la pantalla `<SectionScore>` que el usuario ve
     cuando termina las preguntas de una categoría. Vive dentro del
     Group de su categoría y siempre queda al final por construcción
     de aristas. Key: `__sectionScore__{cat}`. Es seleccionable: al
     clickearlo, el Drawer explica cómo se calcula el puntaje.
   - **`summary`** — rectángulo prominente en `#0f172a` con texto
     blanco, fuera de cualquier Group. Es otro nodo sintético, que
     representa la pantalla `<Summary>` final. Key: `__summary__`.
     Es seleccionable: el Drawer explica cómo se compone la
     pantalla final.

2. **Drawer derecho**: el contenido depende del tipo de nodo
   seleccionado, despachado por `Debug.tsx`:

   - **Pregunta normal** (`question` / `gate`) →
     `src/views/Debug/DebugDetail.tsx`. Muestra la ficha completa:
     identidad, aplicabilidad (`dependsOn` + `rowSource` para
     grids), derivación, glosario, sidebar widgets, tips,
     configuración (todas las opciones con `score`, `bracket`,
     `sublabel`, `examples`), scoring e insights con su árbol
     `when` expandido. Función pura sobre la `DiagnosisQuestion`.
   - **`sectionScore`** →
     `src/views/Debug/DebugDetailSection.tsx`. Recibe el
     `SectionScoreNode` correspondiente y renderiza directamente
     sus campos: `description`, `formula`, `inclusionRules`,
     `toneBands` con sus mensajes y colores. Lo derivable (qué
     preguntas aportan al puntaje y cuánto puede aportar cada
     una) se calcula con `computeQuestionMax(q)` de
     `scoring.ts`. No duplica nada del nodo.
   - **`summary`** →
     `src/views/Debug/DebugDetailSummary.tsx`. Recibe el
     `SummaryNode` y renderiza sus campos: `description`,
     `components` (cada uno con su `title` / `description` y
     `userHeading` cuando lo tiene), `severityOrder`,
     `severityLabels`. Agrega un inventario derivado: matriz
     "categoría × severidad" con el conteo de insights
     declarados en `DIAGNOSIS_QUESTIONS`.

   El despacho del Drawer en `Debug.tsx` se hace con
   `findResultNode(key)` de `diagnosis.ts`: si devuelve un
   nodo, despacha al detalle correspondiente; si no, busca en
   `DIAGNOSIS_QUESTIONS`.

Aristas. Las primarias salen de `buildEdges` en
`src/views/Debug/edges.ts`:

| Tipo            | Origen en los datos                                                                 | Etiqueta por defecto                            |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Flujo**       | `q_i → q_{i+1}` siempre. Si `q_{i+1}.dependsOn` incluye `q_i`, etiqueta = el valor que habilita la transición (`Sí` / opción / `> 0` / etc). | Vacía o el valor del gate. |
| **Salto**       | Para gates `toggle` o `chips` (donde la negación es alcanzable): del gate al primer nodo posterior que **no** depende de él. | Negación (`No` para toggles, `otro valor` para chips). |
| **Derivación**  | Una por cada `derivation.input`.                                                     | El `kind` (`multiplyMinimumWage`, etc.).        |
| **rowSource**   | Una por cada `grid.rowSource.storageKey`.                                            | `filas (count)` o `filas (selección)`.          |
| **Insight**     | Una por cada referencia dentro de un `insight.when`. La arista va del **nodo dueño** del insight al **nodo cuya respuesta** se consulta. | El `id` del insight.    |

Los gates `number` con `greaterThan: 0` o `multiChips` con
`nonEmpty: true` no generan flecha de salto porque el `min` y la
regla de "respuesta completa" hacen la negación inalcanzable.

**Reruteo por sectionScore** (`transformEdges` en
`DebugGraph.tsx`): los `flow` y `skip` que cruzan de una categoría
a otra se reencaminan a través del `sectionScore` del lado origen,
porque eso es lo que ocurre en la app — la pantalla
`<SectionScore>` se interpone siempre que se cruza categoría o se
termina la última. Concretamente:

  - Un `flow` `q ∈ catA → q' ∈ catB` se corta en dos:
    `q → __sectionScore__catA` (con la etiqueta original) y
    `__sectionScore__catA → q'` (sin etiqueta).
  - Un `skip` `q ∈ catA → q' ∈ catB` se redirige a
    `q → __sectionScore__catA`, conservando su etiqueta de negación.
  - La última pregunta del cuestionario se conecta con flow a su
    `sectionScore` (no la genera `buildEdges` porque no hay `q_{i+1}`).
  - El `sectionScore` de la última categoría presente se conecta con
    flow a `__summary__`.

Las aristas `derivation`, `rowSource` e `insight` no se rerutean —
su semántica (consumo de un valor previo) no pasa por el resumen.

Selección y highlight: el listener `ChangedSelection` marca
`isHighlighted = true` en cada `Link` incidente al nodo
seleccionado. Bindings `.ofObject()` engrosan el borde del nodo y
los strokes de las aristas. La selección es bidireccional con el
estado React: cerrar el Drawer deselecciona en el grafo, y
clickear un nodo `question` o `gate` abre el Drawer con su ficha.

La página es función pura sobre los datos — no ejecuta el
cuestionario, no calcula puntajes, no evalúa insights. Si un campo
de un nodo no aparece en la vista, es porque el render no lo
soporta (no porque el dato no exista).

Acceso: link discreto `debug` fijado en la esquina superior
derecha de la página principal del diagnóstico, además de la URL
directa `/debug`.

### Render del `grid`

| Caso                                | Render                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `cell.kind === 'number'`            | Filas apiladas (label + input). Un layout tabular no aporta nada.       |
| `cell.kind === 'chips'` en desktop  | Matriz fila × opción con radios. Etiquetas y sublabels en el header.    |
| `cell.kind === 'chips'` en mobile   | Apilado clásico (un `ChipGroup` por fila).                              |

En el render tabular, los `examples` de cada opción pasan a tooltip sobre el
header de la columna porque no caben inline. Ver [[05 - Glosario y ejemplos]].

## Cómo agregar un nodo nuevo

Ver [[06 - Como extender]].
