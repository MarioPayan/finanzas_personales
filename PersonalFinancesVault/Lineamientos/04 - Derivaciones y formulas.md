# Derivaciones y fórmulas

## Por qué existe esto

Las opciones del cuestionario se expresan en términos relativos ("Menos de 1
SMM", "1 a 6 meses de ingreso", "100% de mi ingreso") pero el usuario piensa
en pesos / dólares / soles concretos. El nodo declara una **derivación** y
cada opción declara un **bracket** numérico; el render combina ambos con las
respuestas previas para mostrar el valor real al lado.

Toda la matemática vive en `src/utils/calculations.ts`. La UI no calcula
nada por su cuenta.

## Esquema

En el nodo:
```ts
derivation?: {
  kind: DerivationKind
  inputs: readonly string[]  // storageKeys consumidos. Documenta el flujo.
}
```

En cada opción (`ChipOption`):
```ts
bracket?: { min?: number; max?: number }
```

## `DerivationKind` registrados

| Kind                       | Base                                            | Cómo se aplica al `bracket`                                       | Ejemplo de uso         |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| `multiplyMinimumWage`      | Salario mínimo del país detectado               | `min × SMM`, `max × SMM`                                           | `incomeBand`           |
| `multiplyMonthlyIncome`    | Ingreso mensual estimado (banda × SMM)          | `min × ingreso`, `max × ingreso`                                   | `debtMagnitude`        |
| `multiplyMonthlyExpenses`  | Gastos mensuales = ingreso × `obligatoryPct`    | `min × gastos`, `max × gastos`                                     | `emergencyMonths`      |
| `shareOfMonthlyIncome`     | Ingreso mensual                                 | Para sliders: `(value / 100) × ingreso` (no usa `bracket`)         | `obligatoryPct`        |

## Ingreso estimado: por qué un punto medio

`getMonthlyIncome` toma la banda elegida en `incomeBand` y usa el **punto
medio** del `bracket` de esa opción multiplicado por el SMM. Para bandas
abiertas hacia arriba (`>8 SMM`) usa `1.5 × min`. La fuente de verdad son los
brackets del propio nodo `incomeBand`: si esos cambian, el cálculo se
recompone solo, no hay que actualizar tablas de midpoints.

Es una **estimación representativa**, no un dato preciso. Los valores
contextualizados se prefijan con `~` cuando aplica.

## `formatBracket`

Convierte `{min?, max?}` y un `base` en texto:

- `{max: 1}` con base $X → `Menos de $X`
- `{min: 1, max: 2}` con base $X → `$X – $2X`
- `{min: 8}` con base $X → `Más de $8X`

Para opciones sin `bracket` (p. ej. "Ninguno", "No sé"), no se calcula nada
y se mantiene el `sublabel` estático si lo hay.

## Reglas

- Si agregás un `DerivationKind`, agregalo a la unión en `diagnosis.ts` **y**
  a `getDerivationBase` en `utils/calculations.ts`. TypeScript marcará el
  `switch` exhaustivo si olvidás uno.
- `derivation.inputs` es **documental**: lista los `storageKey` que la fórmula
  consume. Sirve para análisis externo (¿qué nodo bloquea cuál?), no afecta el
  comportamiento. Manténelo correcto.
- Si la derivación no puede calcularse (falta SMM, falta una respuesta
  previa), las opciones caen al `sublabel` estático. Nunca a un valor
  intermedio inventado.

## Benchmark de ingreso por país (WID)

Aparte del SMM (cada país define su mínimo legal), el cuestionario también
consume **el ingreso medio mensual por adulto** del país, usado por los
átomos `incomeBelowCountryAverageTimes` / `incomeAboveCountryAverageTimes`
para comparar el salario del usuario contra la media nacional.

Fuente: [WID — World Inequality Database](https://wid.world). Variable
`aptinc_p0p100_992_j` (pre-tax national income, average per adult,
equal-split). Los datos viven en `src/content/incomeBenchmarks.ts` y se
generan corriendo:

```
node scripts/fetch-wid-data.mjs
```

El script descarga vía la misma API HTTP que usa el paquete oficial `wid`
de R, toma el último año disponible para cada país soportado por el
cuestionario, y reescribe `incomeBenchmarks.ts`. Lo refrescamos a mano
(WID actualiza una vez al año).

Reglas:

- La moneda del benchmark debe coincidir con la del SMM del país. Si no
  (caso Venezuela, donde WID sigue en VEF y el SMM está en VES), las
  comparaciones contra la media simplemente no disparan en lugar de
  comparar montos en monedas distintas.
- `extrapolated: true` indica que WID no tiene observación directa para
  ese año — para nuestro uso (benchmark informativo, no análisis
  académico) preferimos un valor reciente extrapolado sobre uno real
  de hace 40 años.
- No usar el benchmark para cálculos de derivación (`brackets`,
  `sublabels`). Solo para insights — la pérdida de precisión por la
  extrapolación importa menos en una recomendación que en un valor
  visible al lado de cada opción.
