# Cuestionario del diagnóstico — índice

> **Fuente de verdad:** `src/content/diagnosis.ts`. Cualquier divergencia
> entre este índice y el TS es un bug a corregir en la misma pasada.
> Esta página es la **entrada AI-first** al cuestionario: si necesitas
> verificar estructura, gates, scoring o insights existentes, consulta
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
| 3 | `hasDependents` | base | number | — | 0 | 0 | — | — |
| 4 | `formalEmployment` | base | chips | — | 100 | 0 | — | — |
| 5 | `incomeStability` | base | chips | — | 100 | 0 | — | — |
| 6 | `obligatoryPct` | base | slider | — | 100 | 3 | — | — |
| 7 | `obligatoryAnnualItems` | base | multiChips | — | 0 | 0 | — | — |
| 8 | `obligatoryAnnualAmounts` | base | grid | `obligatoryAnnualItems ≠ ∅` | 0 | 0 | — | — |
| 9 | `discretionaryPct` | base | slider | — | 100 | 3 | — | — |
| 10 | `discretionaryAnnualItems` | base | multiChips | — | 0 | 0 | — | — |
| 11 | `discretionaryAnnualAmounts` | base | grid | `discretionaryAnnualItems ≠ ∅` | 0 | 0 | — | — |
| 12 | `hasBudgetSystem` | base | chips | — | 100 | 2 | — | — |
| 13 | `usesAutomation` | base | toggle | — | 100 | 2 | — | — |
| 14 | `knowsCreditScore` | base | toggle | — | 100 | 0 | — | — |
| 15 | `creditScoreBand` | base | chips | `knowsCreditScore = true` | 100 | 1 | — | creditScoreScale |
| 16 | `hasDebt` | debt | toggle | — | 100 | 1 | — | — |
| 17 | `debtMonthlyPct` | debt | slider | `hasDebt = true` | 100 | 3 | — | — |
| 18 | `debtCount` | debt | number | `hasDebt = true` | 90 | 2 | — | — |
| 19 | `debtAmounts` | debt | grid | `hasDebt = true ∧ debtCount > 0` | 100 × filas | 2 | — | — |
| 20 | `debtRates` | debt | grid | `hasDebt = true ∧ debtCount > 0` | 100 × filas | 1 | ea, tasaUsura, nmvVsEa | usuryRate |
| 21 | `debtKinds` | debt | grid | `hasDebt = true ∧ debtCount > 0` | 90 × filas | 3 | debtKindInvestment, debtKindSavings, debtKindBad | — |
| 22 | `creditCardPaymentBehavior` | debt | chips | `hasDebt = true` | 100 | 3 | tasaUsura | — |
| 23 | `emergencyMonths` | stability | chips | — | 100 | 2 | fondoEmergencia | — |
| 24 | `emergencyAccessSpeed` | stability | chips | `emergencyMonths ∈ {1to3, 3to6, 6to12, gt12}` | 100 | 1 | — | — |
| 25 | `jobHorizon` | stability | chips | — | 100 | 0 | — | — |
| 26 | `secondIncomeStream` | stability | chips | `jobHorizon ∈ {0to1, 1to3, 3to5}` | 100 | 1 | — | — |
| 27 | `financialStressLevel` | stability | chips | — | 100 | 1 | — | — |
| 28 | `inRelationship` | stability | toggle | — | 0 | 0 | — | — |
| 29 | `householdFinancialAlignment` | stability | chips | `inRelationship = true` | 100 | 1 | — | — |
| 30 | `coupleFinancialStructure` | stability | chips | `inRelationship = true` | 100 | 1 | — | — |
| 31 | `talksAboutMoneyWithPartner` | stability | chips | `inRelationship = true` | 100 | 1 | — | — |
| 32 | `ownsHome` | protection | chips | — | 100 | 0 | — | — |
| 33 | `hasARL` | protection | toggle | `formalEmployment ∈ {independent, mixed}` | 100 | 1 | arl | — |
| 34 | `hasLifeInsurance` | protection | toggle | `hasDependents > 0` | 100 | 1 | — | — |
| 35 | `hasHealthCoverage` | protection | chips | — | 100 | 2 | — | — |
| 36 | `hasHomeInsurance` | protection | toggle | `ownsHome ∈ {mortgaged, owned}` | 100 | 1 | — | — |
| 37 | `yearsInvesting` | investment | chips | — | 100 | 1 | regla72 | — |
| 38 | `professionalEducationInvestment` | investment | chips | — | 100 | 1 | — | — |
| 39 | `financialEducationInvestment` | investment | chips | — | 100 | 1 | — | — |
| 40 | `invests` | investment | toggle | `yearsInvesting ∈ {lt1, 1to3, 3to10, gt10}` | 100 | 3 | — | — |
| 41 | `tradingFrequency` | investment | chips | `invests = true` | 100 | 1 | — | — |
| 42 | `usesIndexFunds` | investment | toggle | `invests = true` | 100 | 1 | fondoIndexado | — |
| 43 | `riskProfile` | investment | chips | `invests = true` | 90 | 2 | — | ageBasedRiskAllocation |
| 44 | `riskProfileGuess` | investment | chips | `invests = true ∧ riskProfile = unknown` | 30 | 1 | — | — |
| 45 | `investmentVehicles` | investment | multiChips | `invests = true` | 85 | 2 | cdt | — |
| 46 | `currencyDiversification` | investment | toggle | `invests = true` | 100 | 1 | — | — |
| 47 | `investmentAmounts` | investment | grid | `invests = true ∧ investmentVehicles ≠ ∅` | 100 × filas | 1 | — | — |
| 48 | `investmentYields` | investment | grid | `invests = true ∧ investmentVehicles ≠ ∅` | 100 × filas | 2 | ea | — |

Notas:
- **`max`** = puntaje máximo que la pregunta puede aportar al promedio
  de la sección si el usuario responde la mejor opción. Para `grid`,
  el máximo por fila × cantidad de filas (que viene de `rowSource`).
- **`max = 0`** significa "pregunta informativa, no entra al promedio".
  Los nodos con `max = 0` son `age`, `hasDependents` (gatea
  `hasLifeInsurance`), `inRelationship` (gatea preguntas de pareja),
  `ownsHome` (gatea seguro de hogar), y los cuatro nodos de captura
  de gastos anuales (`obligatoryAnnualItems`, `obligatoryAnnualAmounts`,
  `discretionaryAnnualItems`, `discretionaryAnnualAmounts`).
- **`hasHealthInsurance` (toggle stability) fue eliminado** en mayo
  2026 — su rol lo cubre `hasHealthCoverage` (chips) en la nueva
  sección Protección con más granularidad.
- Para detalle por opción (etiquetas, sublabels, bracket, score), abrir
  el archivo de categoría correspondiente:
  - `01 - Base (salario y gastos).md` — Base
  - `02 - Deudas.md` — Deudas
  - `03 - Estabilidad.md` — Estabilidad
  - `04 - Inversiones.md` — Inversiones
  - `05 - Proteccion.md` — Protección (nueva sección, mayo 2026)

---

## Tabla maestra de insights

~58 insights repartidos por nodo. Algunos nodos no declaran ninguno
(`age`, `hasDependents`, `formalEmployment`, `incomeStability`,
`knowsCreditScore`, `jobHorizon`, `inRelationship`, `ownsHome`).
Ordenados por nodo (orden del flujo) y luego por severidad
(`critical → warning → info → positive`).

> Nota (mayo 2026): la lista completa por id se mantiene en
> `src/content/diagnosis.ts` como fuente de verdad. La tabla que sigue
> documenta los más relevantes; agregamos nuevos insights en esta
> pasada (`automationHabit`, `noAutomation`, `minimumPaymentTrap`,
> `creditCardInDefault`, `creditCardPayInFull`,
> `debtPaymentPressureModerate`, `debtPaymentPressureSevere`,
> `consolidationCandidate`, `unequalSplit5050`, `silentMoneyCouple`,
> `lifestyleInflation`, `investingBeforeEmergency`,
> `noCurrencyDiversification`, `noARLIndependent`,
> `noLifeInsuranceWithDependents`, `noHealthCoverage`,
> `minimumHealthCoverageOlder`, `noHomeInsuranceOwned`). Los
> existentes (`toxicRates`, `frequentTrading`, `noIndexFunds`,
> `lowDiversification`, `chronicFinancialStress`, `noBudgetSystem`,
> `compoundTimeWasted`, `badCreditScore`,
> `highDiscretionarySpending`) fueron refinados con cifras
> citables.

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
| `discretionaryHoursOfLife` | `discretionaryPct` | info | `discretionaryPct > 45` |
| `noBudgetSystem` | `hasBudgetSystem` | warning | `hasBudgetSystem = no` |
| `autómatedBudget` | `hasBudgetSystem` | positive | `hasBudgetSystem = autómated` |
| `badCreditScore` | `creditScoreBand` | warning | `creditScoreBand ∈ {bad, regular}` |
| `noDebt` | `hasDebt` | positive | `hasDebt = false` |
| `debtPaymentPressure` | `debtMonthlyPct` | warning | `debtMonthlyPct > 30` |
| `tooManyDebts` | `debtCount` | warning | `debtCount > 5` |
| `oneVeryLargeDebt` | `debtAmounts` | warning | alguna fila ∈ `{50to200, gt200}` |
| `manyMediumDebts` | `debtAmounts` | warning | ≥3 filas ∈ `{3to10, 10to50}` |
| `toxicRates` | `debtRates` | critical | alguna fila ∈ `{high, veryHigh}` |
| `allBadDebt` | `debtKinds` | warning | todas las filas = `bad` |
| `hasGoodDebt` | `debtKinds` | positive | alguna fila ∈ `{investment, savings}` |
| `leverageAgainstAssets` | `debtKinds` | info | alguna fila = `investment` |
| `noEmergencyFund` | `emergencyMonths` | warning | `emergencyMonths ∈ {none, lt1}` |
| `strongEmergencyFund` | `emergencyMonths` | positive | `emergencyMonths ∈ {6to12, gt12}` |
| `illiquidEmergencyFund` | `emergencyAccessSpeed` | warning | `emergencyAccessSpeed ∈ {weeks, months}` |
| `noInsuranceHighRisk` | `hasHealthInsurance` | critical | `hasHealthInsurance = false` **y** `age > 40` |
| `noInsuranceModerateRisk` | `hasHealthInsurance` | warning | `hasHealthInsurance = false` **y** `age ≤ 40` |
| `noSecondIncomeShortHorizon` | `secondIncomeStream` | warning | `secondIncomeStream ∈ {no, no-interest}` |
| `chronicFinancialStress` | `financialStressLevel` | critical | `financialStressLevel ∈ {frequent, constant}` |
| `householdFinancialMisalignment` | `householdFinancialAlignment` | warning | `householdFinancialAlignment ∈ {never-talk, disagree}` |
| `compoundTimeWasted` | `yearsInvesting` | warning | `yearsInvesting ∈ {never, lt1}` **y** `age < 30` |
| `noProfessionalEducation` | `professionalEducationInvestment` | info | `professionalEducationInvestment = no` |
| `noFinancialEducation` | `financialEducationInvestment` | info | `financialEducationInvestment = no` |
| `investingActively` | `invests` | positive | `invests = true` |
| `notInvestingButReady` | `invests` | info | `invests = false` **y** `emergencyMonths ∈ {1to3, 3to6, 6to12, gt12}` **y** (`¬hasDebt` ∨ ninguna fila de `debtAmounts` ∈ `{10to50, 50to200, gt200}`) |
| `frequentTrading` | `tradingFrequency` | warning | `tradingFrequency ∈ {weekly, daily}` |
| `noIndexFunds` | `usesIndexFunds` | info | `usesIndexFunds = false` |
| `riskProfileMatchesAge` | `riskProfile` | positive | (`age<30 ∧ aggressive`) ∨ (`30≤age<50 ∧ moderate`) ∨ (`age≥50 ∧ conservative`) |
| `riskProfileUnknown` | `riskProfile` | info | `riskProfile = unknown` |
| `guessMatchesAgeRecommendation` | `riskProfileGuess` | info | mismas bandas etarias que `riskProfileMatchesAge`, evaluadas sobre `riskProfileGuess` |
| `cryptoOnly` | `investmentVehicles` | critical | seleccionado **solo** `crypto` |
| `lowDiversification` | `investmentVehicles` | warning | ≤1 vehículo seleccionado |
| `smallPositions` | `investmentAmounts` | info | todas las filas = `lt1` |
| `belowInflationYield` | `investmentYields` | warning | alguna fila ∈ `{negative, lt3}` |
| `unsustainableHighYield` | `investmentYields` | warning | alguna fila = `gt15` **o** algún valor exacto > 30% |

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
├── hasDependents                           number    — siempre
├── formalEmployment                        chips     — siempre
├── incomeStability                         chips     — siempre
├── obligatoryPct                           slider    — siempre
├── obligatoryAnnualItems                   multiChips — siempre
│   └── obligatoryAnnualAmounts             grid (1 fila / item) — si obligatoryAnnualItems ≠ ∅
├── discretionaryPct                        slider    — siempre
├── discretionaryAnnualItems                multiChips — siempre
│   └── discretionaryAnnualAmounts          grid (1 fila / item) — si discretionaryAnnualItems ≠ ∅
├── hasBudgetSystem                         chips     — siempre
├── usesAutomation                          toggle    — siempre
├── knowsCreditScore                        toggle    — siempre
└── creditScoreBand                         chips     — si knowsCreditScore = Sí

Deudas
└── hasDebt                                 toggle    — siempre
    └── (si hasDebt = Sí)
        ├── debtMonthlyPct                  slider
        ├── debtCount                       number
        ├── (si debtCount > 0)
        │   ├── debtAmounts                 grid (1 fila / deuda)
        │   ├── debtRates                   grid (1 fila / deuda)
        │   └── debtKinds                   grid (1 fila / deuda)
        └── creditCardPaymentBehavior       chips     — siempre que hasDebt = Sí

Estabilidad
├── emergencyMonths                         chips     — siempre
├── emergencyAccessSpeed                    chips     — si emergencyMonths ∈ {1to3, 3to6, 6to12, gt12}
├── jobHorizon                              chips     — siempre
├── secondIncomeStream                      chips     — si jobHorizon ∈ {0to1, 1to3, 3to5}
├── financialStressLevel                    chips     — siempre
└── inRelationship                          toggle    — siempre
    ├── householdFinancialAlignment         chips     — si inRelationship = Sí
    ├── coupleFinancialStructure            chips     — si inRelationship = Sí
    └── talksAboutMoneyWithPartner          chips     — si inRelationship = Sí

Protección  (nueva sección, mayo 2026)
├── ownsHome                                chips     — siempre
├── hasARL                                  toggle    — si formalEmployment ∈ {independent, mixed}
├── hasLifeInsurance                        toggle    — si hasDependents > 0
├── hasHealthCoverage                       chips     — siempre
└── hasHomeInsurance                        toggle    — si ownsHome ∈ {mortgaged, owned}

Inversiones
├── yearsInvesting                          chips     — siempre
├── professionalEducationInvestment         chips     — siempre
├── financialEducationInvestment            chips     — siempre
└── invests                                 toggle    — si yearsInvesting ≠ never
    └── (si invests = Sí)
        ├── tradingFrequency                chips
        ├── usesIndexFunds                  toggle
        ├── riskProfile                     chips
        ├── riskProfileGuess                chips     — si además riskProfile = unknown
        ├── investmentVehicles              multiChips
        ├── currencyDiversification         toggle
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
| `__sectionScore__protection` | sectionScore | Idem Protección (mayo 2026). |
| `__sectionScore__investment` | sectionScore | Idem Inversiones. |
| `__summary__` | summary | Pantalla final. Agrega insights, "Tu próximo paso", meta FIRE, perfil global, y frase de cierre. No calcula un score global numérico. |

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

## Widgets de sidebar / popover

`SidebarWidgetId` actual:

| id | qué muestra | dónde |
|---|---|---|
| `minimumWage` | SMM del país detectado (lectura) | `incomeBand` |
| `creditScoreScale` | tabla de bandas del buró por país | `creditScoreBand` |
| `usuryRate` | tope legal vigente Colombia (28,17% EA mayo 2026) | `debtRates` |
| `ageBasedRiskAllocation` | regla 100/110/120 menos edad → % en RV | `riskProfile` |
| `fireGoal` | meta FIRE = gastos × 25 (×28,5 LatAm) calculada del Summary | `__summary__` (insight global, no widget de nodo) |

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
de la tabla maestra): `smm`, `ea`, `fondoEmergencia`, `cdt`,
`debtKindInvestment`, `debtKindSavings`, `debtKindBad`, `fondoIndexado`,
`tasaUsura`, `nmvVsEa`, `arl`, `regla72`. Existen otras entradas en
`glossary.ts` sin referencia activa (`dca`, `fire`, `fogafin`,
`compraDeCartera`) — se citan en tips/insights, no en `glossaryTerms`.
Detalle en `99 - Glosario referenciado.md`. El criterio para incluir
un término es estricto: el glosario es para **términos no triviales
asumidos como conocidos** dentro del prompt/hint/options de la
pregunta; si la hint ya explica el término, el glosario sobra.

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

Si necesitas detalle por nodo (texto literal de prompt/hint, sublabels
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
