# Cuestionario del diagnóstico — índice

> **Fuente de verdad:** `src/content/diagnosis.ts`. Cualquier divergencia
> entre este índice y el TS es un bug a corregir en la misma pasada.
> Esta página es la **entrada AI-first** al cuestionario: si necesitás
> verificar estructura, gates, scoring o insights existentes, consultá
> primero las tablas maestras de abajo antes de abrir los archivos por
> categoría.

---

## Tabla maestra de nodos

Ordenada por el orden real de presentación en el flujo (índice del array
`DIAGNOSIS_QUESTIONS`). Columnas: `#` posición, `storageKey`, bloque,
tipo de input, gate (condición `dependsOn`), `max` puntaje aportable
por la pregunta, `#ins` cantidad de insights declarados, glosario
referenciado, widgets del panel lateral.

| # | storageKey | bloque | tipo | gate | max | #ins | glossary | sidebar |
|---|---|---|---|---|---:|---:|---|---|
| 1 | `incomeBand` | base | chips | — | 100 | 5 | smm | minimumWage |
| 2 | `age` | base | number | — | 0 | 0 | — | — |
| 3 | `incomeStability` | base | chips | — | 100 | 0 | — | — |
| 4 | `obligatoryPct` | base | slider | — | 100 | 3 | gastosObligatorios | — |
| 5 | `discretionaryPct` | base | slider | — | 100 | 1 | — | — |
| 6 | `knowsCreditScore` | base | toggle | — | 100 | 0 | — | — |
| 7 | `creditScoreBand` | base | chips | `knowsCreditScore = true` | 100 | 1 | — | creditScoreScale |
| 8 | `hasDebt` | debt | toggle | — | 100 | 1 | — | — |
| 9 | `debtMonthlyPct` | debt | slider | `hasDebt = true` | 100 | 1 | — | — |
| 10 | `debtCount` | debt | number | `hasDebt = true` | 90 | 1 | — | — |
| 11 | `debtAmounts` | debt | grid | `hasDebt = true ∧ debtCount > 0` | 100 × filas | 2 | — | — |
| 12 | `debtRates` | debt | grid | `hasDebt = true ∧ debtCount > 0` | 100 × filas | 1 | ea | — |
| 13 | `debtKinds` | debt | grid | `hasDebt = true ∧ debtCount > 0` | 90 × filas | 2 | debtKindInvestment, debtKindSavings, debtKindBad | — |
| 14 | `emergencyMonths` | stability | chips | — | 100 | 2 | fondoEmergencia | — |
| 15 | `emergencyAccessSpeed` | stability | chips | `emergencyMonths ∈ {1to3, 3to6, 6to12, gt12}` | 100 | 1 | — | — |
| 16 | `hasHealthInsurance` | stability | toggle | — | 100 | 2 | — | — |
| 17 | `jobHorizon` | stability | chips | — | 100 | 0 | — | — |
| 18 | `secondIncomeStream` | stability | chips | `jobHorizon ∈ {0to1, 1to3, 3to5}` | 100 | 1 | — | — |
| 19 | `professionalEducationInvestment` | investment | chips | — | 100 | 1 | — | — |
| 20 | `financialEducationInvestment` | investment | chips | — | 100 | 1 | — | — |
| 21 | `invests` | investment | toggle | — | 100 | 2 | — | — |
| 22 | `riskProfile` | investment | chips | `invests = true` | 90 | 2 | — | — |
| 23 | `riskProfileGuess` | investment | chips | `invests = true ∧ riskProfile = unknown` | 30 | 1 | — | — |
| 24 | `investmentVehicles` | investment | multiChips | `invests = true` | 85 | 2 | cdt, diversificacion | — |
| 25 | `investmentAmounts` | investment | grid | `invests = true ∧ investmentVehicles ≠ ∅` | 100 × filas | 1 | — | — |
| 26 | `investmentYields` | investment | grid | `invests = true ∧ investmentVehicles ≠ ∅` | 100 × filas | 1 | ea | — |

Notas:
- **`max`** = puntaje máximo que la pregunta puede aportar al promedio
  de la sección si el usuario responde la mejor opción. Para `grid`,
  el máximo por fila × cantidad de filas (que viene de `rowSource`).
- **`max = 0`** significa "pregunta informativa, no entra al promedio".
  El único nodo con `max = 0` es `age`. Los demás nodos con cero insights
  (`incomeStability`, `knowsCreditScore`, `jobHorizon`) sí entran al
  promedio de su sección.
- Para detalle por opción (etiquetas, sublabels, bracket, score), abrir
  el archivo de categoría correspondiente:
  - `01 - Base (salario y gastos).md` — nodos 1-7
  - `02 - Deudas.md` — nodos 8-13
  - `03 - Estabilidad.md` — nodos 14-18
  - `04 - Inversiones.md` — nodos 19-26

---

## Tabla maestra de insights

35 insights distribuidos en 22 nodos. Cuatro nodos no declaran ninguno
(`age`, `incomeStability`, `knowsCreditScore`, `jobHorizon`).
Ordenados por nodo y luego por severidad (`critical → warning → info →
positive`).

| insightId | nodo dueño | severidad | condición |
|---|---|---|---|
| `incomeBelowMinimum` | `incomeBand` | critical | `ingreso < 1 × SMM` |
| `incomeWellBelowAverage` | `incomeBand` | warning | `ingreso < 0.5 × media nacional` **y** no se cumple `incomeBelowMinimum` |
| `incomeAboveAverage` | `incomeBand` | positive | `ingreso > 1.5 × media nacional` |
| `incomeBelowAverage` | `incomeBand` | info | `0.5× ≤ ingreso < 1× media nacional` |
| `incomeHigh` | `incomeBand` | info | `ingreso > 8 × SMM` |
| `highObligatorySpending` | `obligatoryPct` | warning | `obligatoryPct > 70` **y** `gasto absoluto > 0.4 × SMM` |
| `lowObligatorySpending` | `obligatoryPct` | positive | `obligatoryPct < 30` **y** `gasto absoluto > 0.4 × SMM` |
| `obligatoryBelowSubsistence` | `obligatoryPct` | info | `gasto absoluto < 0.4 × SMM` (% no comparable) |
| `highDiscretionarySpending` | `discretionaryPct` | warning | `discretionaryPct > 45` |
| `badCreditScore` | `creditScoreBand` | warning | `creditScoreBand ∈ {bad, regular}` |
| `noDebt` | `hasDebt` | positive | `hasDebt = false` |
| `debtPaymentPressure` | `debtMonthlyPct` | warning | `debtMonthlyPct > 30` |
| `tooManyDebts` | `debtCount` | warning | `debtCount > 5` |
| `oneVeryLargeDebt` | `debtAmounts` | warning | alguna fila ∈ `{50to200, gt200}` |
| `manyMediumDebts` | `debtAmounts` | warning | ≥3 filas ∈ `{3to10, 10to50}` |
| `toxicRates` | `debtRates` | critical | alguna fila ∈ `{high, veryHigh}` |
| `allBadDebt` | `debtKinds` | warning | todas las filas = `bad` |
| `hasGoodDebt` | `debtKinds` | positive | alguna fila ∈ `{investment, savings}` |
| `noEmergencyFund` | `emergencyMonths` | warning | `emergencyMonths ∈ {none, lt1}` |
| `strongEmergencyFund` | `emergencyMonths` | positive | `emergencyMonths ∈ {6to12, gt12}` |
| `illiquidEmergencyFund` | `emergencyAccessSpeed` | warning | `emergencyAccessSpeed ∈ {weeks, months}` |
| `noInsuranceHighRisk` | `hasHealthInsurance` | critical | `hasHealthInsurance = false` **y** `age > 40` |
| `noInsuranceModerateRisk` | `hasHealthInsurance` | warning | `hasHealthInsurance = false` **y** `age ≤ 40` |
| `noSecondIncomeShortHorizon` | `secondIncomeStream` | warning | `secondIncomeStream ∈ {no, no-interest}` |
| `noProfessionalEducation` | `professionalEducationInvestment` | info | `professionalEducationInvestment = no` |
| `noFinancialEducation` | `financialEducationInvestment` | info | `financialEducationInvestment = no` |
| `investingActively` | `invests` | positive | `invests = true` |
| `notInvestingButReady` | `invests` | info | `invests = false` **y** `emergencyMonths ∈ {1to3, 3to6, 6to12, gt12}` **y** (`¬hasDebt` ∨ ninguna fila de `debtAmounts` ∈ `{10to50, 50to200, gt200}`) |
| `riskProfileMatchesAge` | `riskProfile` | positive | (`age<30 ∧ aggressive`) ∨ (`30≤age<50 ∧ moderate`) ∨ (`age≥50 ∧ conservative`) |
| `riskProfileUnknown` | `riskProfile` | info | `riskProfile = unknown` |
| `guessMatchesAgeRecommendation` | `riskProfileGuess` | info | mismas bandas etarias que `riskProfileMatchesAge`, evaluadas sobre `riskProfileGuess` |
| `cryptoOnly` | `investmentVehicles` | critical | seleccionado **solo** `crypto` |
| `lowDiversification` | `investmentVehicles` | warning | ≤1 vehículo seleccionado |
| `smallPositions` | `investmentAmounts` | info | todas las filas = `lt1` |
| `belowInflationYield` | `investmentYields` | warning | alguna fila ∈ `{negative, lt3}` |

**Reglas de evaluación** (resumen — implementación en `src/utils/insights.ts`):

- Un insight solo se evalúa si su nodo dueño está aplicable
  (`dependsOn` se cumple) **y** completo (`isAnswerComplete = true`).
- Las condiciones pueden referenciar **cualquier** `storageKey`, no
  solo el del nodo dueño (insights compuestos). Ej: `noInsuranceHighRisk`
  vive en `hasHealthInsurance` pero lee `age`.
- Si la condición no se cumple, el insight no aparece — silencio
  intencional, no bug.

---

## Árbol de flujo

Todas las dependencias explícitas. Indentación marca gate: cada nivel
se omite si su padre no se cumple.

```
Base
├── incomeBand                              chips     — siempre
├── age                                     number    — siempre
├── incomeStability                         chips     — siempre
├── obligatoryPct                           slider    — siempre
├── discretionaryPct                        slider    — siempre
├── knowsCreditScore                        toggle    — siempre
└── creditScoreBand                         chips     — si knowsCreditScore = Sí

Deudas
└── hasDebt                                 toggle    — siempre
    └── (si hasDebt = Sí)
        ├── debtMonthlyPct                  slider
        ├── debtCount                       number
        └── (si debtCount > 0)
            ├── debtAmounts                 grid (1 fila / deuda)
            ├── debtRates                   grid (1 fila / deuda)
            └── debtKinds                   grid (1 fila / deuda)

Estabilidad
├── emergencyMonths                         chips     — siempre
├── emergencyAccessSpeed                    chips     — si emergencyMonths ∈ {1to3, 3to6, 6to12, gt12}
├── hasHealthInsurance                      toggle    — siempre
├── jobHorizon                              chips     — siempre
└── secondIncomeStream                      chips     — si jobHorizon ∈ {0to1, 1to3, 3to5}

Inversiones
├── professionalEducationInvestment         chips     — siempre
├── financialEducationInvestment            chips     — siempre
└── invests                                 toggle    — siempre
    └── (si invests = Sí)
        ├── riskProfile                     chips
        ├── riskProfileGuess                chips     — si además riskProfile = unknown
        ├── investmentVehicles              multiChips
        └── (si investmentVehicles ≠ ∅)
            ├── investmentAmounts           grid (1 fila / vehículo)
            └── investmentYields            grid (1 fila / vehículo)
```

Una pregunta se considera **saltada** (cuenta como resuelta para la
barra de progreso) cuando alguna `dependsOn` se respondió con un valor
que no la cumple, o cuando un `grid` se quedó sin filas por
`rowSource` vacío. Lógica en
`isQuestionApplicable` / `isQuestionSkipped` (diagnosis.ts).

---

## Nodos de resultado (no preguntas)

El flujo intercala **4 pantallas de puntaje por sección** y **1
pantalla de diagnóstico final**. Viven en `diagnosis.ts` como nodos
independientes; no aparecen en la tabla maestra porque no son
preguntas.

| storageKey | tipo | descripción |
|---|---|---|
| `__sectionScore__base` | sectionScore | Pantalla intersticial al terminar el bloque Base. |
| `__sectionScore__debt` | sectionScore | Idem Deudas. |
| `__sectionScore__stability` | sectionScore | Idem Estabilidad. |
| `__sectionScore__investment` | sectionScore | Idem Inversiones. |
| `__summary__` | summary | Pantalla final. Agrega insights y respuestas. No calcula un score global. |

Cada `sectionScore` aplica las mismas **toneBands** por defecto:

| rango | color | mensaje |
|---|---|---|
| `[80, 100]` | success | Estás en muy buena posición en esta área. |
| `[60, 80)` | success | Vas bien; hay espacio para optimizar. |
| `[40, 60)` | warning | Hay aspectos importantes para revisar. |
| `[20, 40)` | warning | Esta área necesita atención. |
| `[0, 20)` | error | Hay problemas serios que conviene priorizar. |

El `summary` ordena los insights por severidad en este orden fijo:
`critical → warning → info → positive`, con etiquetas visibles:
**Crítico** / **A revisar** / **Para considerar** / **A favor**.

---

## Convenciones de scoring

Fórmula de puntaje de sección:

```
score = round(Σ earned / Σ max × 100)
```

Reglas de inclusión:

1. Solo entran preguntas **aplicables** (`dependsOn` se cumple).
2. Solo entran preguntas **completas** (`isAnswerComplete = true`).
3. Preguntas con `max = 0` (informativas) no se cuentan — no penalizan.

Donde vive el `score`:

| tipo de pregunta | dónde vive el score |
|---|---|
| `chips` (única) | `score` en cada `ChipOption` |
| `chips` con `exactInput` | `exactScore: ValueScoring` (bandas `[min, max)`) o se ubica el valor exacto en el `bracket` de las opciones |
| `slider` | `score: ValueScoring` (bandas `[min, max)`) |
| `toggle` | `score: {whenTrue, whenFalse}` |
| `number` | `score: ValueScoring` (bandas `[min, max)`) |
| `multiChips` | `score` en cada opción; total = suma de las seleccionadas; max = suma de todas |
| `grid` con celdas `chips` | `score` en cada opción; total fila = el score de la celda elegida; max pregunta = max fila × cantidad de filas |
| `grid` con celdas `number` | `score: ValueScoring` en la celda |

Convención de bandas (`ScoreBand`):

- Intervalos `[min, max)` — `min` inclusivo, `max` exclusivo.
- Sin `min` → "hasta `max`". Sin `max` → "desde `min` en adelante".
- Primer match gana — el orden importa solo si las bandas se solapan.

---

## Derivaciones de bandas

Cómo se contextualizan los `bracket` y los valores exactos con la
moneda local. Implementación en `src/utils/calculations.ts`.

| `derivation.kind` | qué hace | inputs típicos |
|---|---|---|
| `multiplyMinimumWage` | multiplica `bracket.min/max` por el SMM del país para mostrar rangos en moneda local. | — |
| `multiplyMonthlyIncome` | multiplica por el ingreso mensual estimado del usuario. | `['incomeBand']` |
| `multiplyMonthlyExpenses` | multiplica por el gasto obligatorio mensual (ingreso × `obligatoryPct`). | `['incomeBand', 'obligatoryPct']` |
| `shareOfMonthlyIncome` | aplica el `%` del slider al ingreso mensual para mostrar el monto en moneda local. | `['incomeBand']` |
| `creditScoreBands` | resuelve cada `option.value` al rango absoluto del buró del país (lookup en `creditScoreBands.ts`). | — |

El ingreso mensual estimado se calcula así (consumido por
condiciones `incomeBelow*` / `incomeAbove*`):

- Si `incomeBand` es un chip: punto medio del `bracket` × SMM
  (`gt8` → 12 × SMM como aproximación).
- Si el usuario ingresó valor exacto: ese.

Los insights que comparan contra la media nacional
(`incomeBelowCountryAverageTimes` / `incomeAboveCountryAverageTimes`)
se silencian si el país detectado no tiene benchmark WID o si la
moneda del benchmark no coincide con la del SMM (caso Venezuela).

---

## Glosario y panel lateral

Términos del glosario referenciados por algún nodo (columna `glossary`
de la tabla maestra): `smm`, `gastosObligatorios`, `ea`,
`fondoEmergencia`, `cdt`, `diversificacion`, `debtKindInvestment`,
`debtKindSavings`, `debtKindBad`. Detalle en
`99 - Glosario referenciado.md`.

Widgets del panel lateral usados: `minimumWage` (SMM del país detectado),
`creditScoreScale` (rangos absolutos del buró del país). Lista en
`SidebarWidgetId` (diagnosis.ts).

---

## Cómo se ven las cifras al usuario

El cuestionario evita pedir cifras: las opciones se expresan en bandas
relativas al SMM o en proporciones del ingreso. Cuando una opción dice
"1 a 2 SMM" y el usuario es de Colombia, se muestra al lado el monto
en pesos colombianos. La fórmula vive en `src/utils/calculations.ts`
y está descrita en `../Lineamientos/04 - Derivaciones y formulas.md`.

---

## Por dónde leer más

Si necesitás detalle por nodo (texto literal de prompt/hint, sublabels
y examples por opción, scoring por banda y por valor exacto, insights
con texto completo de `diagnostic` y `tip`), abrir el archivo de
categoría:

- `01 - Base (salario y gastos).md`
- `02 - Deudas.md`
- `03 - Estabilidad.md`
- `04 - Inversiones.md`
- `99 - Glosario referenciado.md`

Para filosofía, estructura, panel lateral y reglas de extensión:
`../Lineamientos/`.
