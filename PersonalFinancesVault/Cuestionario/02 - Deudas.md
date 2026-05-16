# Deudas

Bloque destinado a entender la carga de deuda del usuario. Empieza con un
toggle de entrada (`hasDebt`); si la respuesta es "No", todo el bloque se
omite. Si es "Sí", se profundiza en magnitud, cantidad, tasa y naturaleza,
una deuda a la vez (sin promediar artificialmente entre deudas).

---

## ¿Tienes deudas activas? · `hasDebt`

**Mide:** Puerta de entrada al bloque de deuda. Decide si las preguntas
siguientes de la categoría se muestran u se omiten en bloque.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** toggle (Sí / No).

**Pregunta visible:**

> ¿Tienes deudas activas?

**Opciones / configuración:**

- Sí
- No

**Cálculo derivado:** ninguno.

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):**

| Respuesta | Puntos |
| --------- | -----: |
| No        | 100    |
| Sí        | 0      |

Si el usuario responde "No", todo el bloque siguiente se omite y la
sección Deudas queda con un puntaje natural de 100 (la única pregunta
aplicable es esta). Si responde "Sí", su 0 entra al promedio junto al
resto de las preguntas y el puntaje refleja la severidad real de la
deuda. **Máximo posible:** 100.

**Diagnósticos y tips:**

- **`noDebt`** (a favor). *Se muestra si:* `hasDebt = No`.
  - Diagnóstico: "No tienes deudas activas — buena posición de partida."
  - Tip: "Si tu fondo de emergencia ya cubre 3 meses o más, considerá
    dirigir el excedente del ingreso a inversiones diversificadas en vez
    de dejarlo quieto."

---

## Cuota mensual de deudas · `debtMonthlyPct`

**Mide:** Porcentaje del ingreso que se va en cuotas mensuales de las
deudas activas. Es el indicador real de presión de cash-flow: un saldo
grande con cuota chica duele menos mes a mes que un saldo modesto con
cuota grande.

**Cuándo se muestra:** Solo si `hasDebt = Sí`.

**Tipo de entrada:** slider continuo (porcentaje).

**Pregunta visible:**

> ¿Qué porcentaje de tu ingreso se va en cuotas mensuales de tus
> deudas?

**Indicación auxiliar:** Suma de todas las cuotas mensuales (tarjetas,
créditos, hipoteca, vehículo). Si una deuda es a meses sin intereses,
contá igual la cuota.

**Opciones / configuración:**

- Rango: 0% a 100%. Paso: 5%. Valor por defecto: 30%.
- Marcas visibles: 0%, 50%, 100%.
- Unidad: `%`.

**Cálculo derivado:** El valor del slider se aplica al ingreso mensual
estimado y se muestra como monto en moneda local.

**Puntaje:**

| Banda del slider | Puntos |
| ---------------- | -----: |
| 0% a 15%         | 100    |
| 15% a 30%        | 70     |
| 30% a 45%        | 40     |
| 45% a 100%       | 10     |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`debtPaymentPressure`** (a revisar). *Se muestra si:*
  `debtMonthlyPct > 30%`.
  - Diagnóstico: "Más del 30% de tu ingreso se va en cuotas de deuda."
  - Tip: "Con esa presión de cash-flow, cualquier imprevisto se vuelve
    crisis. Considerá compra de cartera con otra entidad para bajar la
    tasa, abonar al capital de la deuda con peor tasa, o renegociar
    plazos."

---

## Cantidad de deudas · `debtCount`

**Mide:** Número de deudas activas que el usuario maneja. Sirve para
preguntar después, una por una, su tasa de interés y su naturaleza, sin
promediar artificialmente.

**Cuándo se muestra:** Solo si `hasDebt = Sí`.

**Tipo de entrada:** número entero directo.

**Pregunta visible:**

> ¿Cuántas deudas tienes activas?

**Indicación auxiliar:** Si tenés muchas deudas similares, podés
agruparlas (p. ej. todas las tarjetas como una sola).

**Opciones / configuración:**

- Mínimo: 1.
- Máximo: 20.
- Paso: 1.
- Valor por defecto: 1.
- Placeholder: "Cantidad".

**Cálculo derivado:** ninguno (la respuesta no se contextualiza con otras
respuestas; solo se usa para definir cuántas filas tendrán las grillas
siguientes).

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** muchas deudas implican más complejidad de manejo →
peor puntaje a mayor cantidad.

| Cantidad de deudas | Puntos |
| ------------------ | -----: |
| 1                  | 90     |
| 2                  | 70     |
| 3                  | 50     |
| 4 a 6              | 30     |
| 7 o más            | 10     |

**Máximo posible:** 90.

**Diagnósticos y tips:**

- **`tooManyDebts`** (a revisar). *Se muestra si:* `debtCount > 5`.
  - Diagnóstico: "Manejas más de 5 deudas activas."
  - Tip: "Considerá consolidar las más caras en una sola con tasa menor
    para simplificar pagos y reducir intereses totales."

---

## Monto de cada deuda · `debtAmounts`

**Mide:** Tamaño relativo de cada deuda comparado con el salario
mínimo del país. Reemplaza la pregunta única "magnitud total" — el
saldo agregado oculta deudas individuales muy distintas (una hipoteca
grande convive con tarjetas chicas). Las bandas cubren desde compras
chicas hasta vivienda (200+ SMM).

**Cuándo se muestra:** Solo si `hasDebt = Sí` y `debtCount > 0`.

**Tipo de entrada:** grid de filas (una por deuda) con celda chips
(con monto exacto opcional).

**Pregunta visible:**

> ¿De cuánto es cada deuda?

**Indicación auxiliar:** Comparada con el salario mínimo del país, o
ingresá el monto exacto.

**Filas:** una por deuda — las filas vienen de `debtCount` con la
plantilla "Deuda #{n}".

**Opciones por celda:**

| Valor | Etiqueta | Banda (en SMM) | Puntos |
| ----- | -------- | -------------- | -----: |
| `lt1` | Menos de 1 SMM | < 1 | 100 |
| `1to3` | 1 a 3 SMM | 1–3 | 80 |
| `3to10` | 3 a 10 SMM | 3–10 | 60 |
| `10to50` | 10 a 50 SMM | 10–50 | 40 |
| `50to200` | 50 a 200 SMM | 50–200 | 20 |
| `gt200` | Más de 200 SMM (vivienda) | ≥ 200 | 5 |

Cada celda admite además un **monto exacto** (paso 10.000, sin tope
superior).

**Cálculo derivado:** Cada banda se multiplica por el SMM del país y
se muestra como rango en moneda local en el sublabel del chip.

**Puntaje:** suma de las puntuaciones por fila / total filas. Una
hipoteca grande convive con tarjetas chicas en el promedio.

**Diagnósticos y tips:**

- **`oneVeryLargeDebt`** (a revisar). *Se muestra si:* alguna fila
  está en `50to200` o `gt200`.
  - Diagnóstico: "Tenés al menos una deuda muy grande."
  - Tip: "Si es vivienda u otra deuda buena, el riesgo está acotado a
    la cuota mensual y la tasa. Si es consumo, el plan tiene que ser
    bajarla con prioridad — son las deudas que más asfixian."
- **`manyMediumDebts`** (a revisar). *Se muestra si:* hay al menos 3
  filas en bandas medias (`3to10` o `10to50`).
  - Diagnóstico: "Acumulás varias deudas de tamaño medio."
  - Tip: "Aunque cada una sea manejable por separado, el problema
    suele ser la suma de cuotas. Considerá compra de cartera para
    consolidar y bajar la presión mensual."

---

## Tasa de cada deuda · `debtRates`

**Mide:** Tasa de interés efectiva anual aproximada de cada una de las
deudas activas. Permite identificar deudas tóxicas individuales y
priorizar pagos.

**Cuándo se muestra:** Solo si `hasDebt = Sí` **Y** `debtCount > 0`. Si
no hay deudas declaradas, la grilla se omite.

**Tipo de entrada:** grilla (matriz) — una fila por deuda; cada fila es un
chip de banda + valor exacto opcional.

**Pregunta visible:**

> ¿Cuál es la tasa de interés de cada deuda?

**Indicación auxiliar:** Aproximadamente. Si no estás seguro, escoge una
banda o ingresá el valor exacto.

**Origen de las filas:** Una fila por cada deuda declarada en `debtCount`,
etiquetadas "Deuda #1", "Deuda #2", etc.

**Opciones de cada fila (chips):**

| Opción      | Banda EA       | Ejemplos típicos                                          |
| ----------- | -------------- | --------------------------------------------------------- |
| Baja        | < 10% EA       | Crédito hipotecario subsidiado, algunos créditos de libranza |
| Media       | 10% a 25% EA   | Crédito educativo, crédito de vehículo                    |
| Alta        | 25% a 50% EA   | Tarjeta de crédito, crédito de libre inversión            |
| Muy alta    | > 50% EA       | Avances en efectivo, préstamos rotativos informales       |
| No sé       | (sin banda)    | Asumiremos lo peor                                        |

Además, en cada fila el usuario puede ingresar un **valor exacto** de la
tasa (rango 0% a 200%, paso 0.5%, unidad "% EA", placeholder "EA exacta").

**Cálculo derivado:** ninguno; las bandas son intervalos directos de tasa.

**Términos del glosario referenciados:** EA.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** tasa más baja → mejor puntaje. "No sé" se trata como
una tasa media (asumimos lo peor con cierto descuento por la
incertidumbre).

| Opción      | Puntos por fila |
| ----------- | --------------: |
| Baja        | 100             |
| Media       | 70              |
| Alta        | 30              |
| Muy alta    | 5               |
| No sé       | 30              |

Para valor exacto:

| EA exacta              | Puntos |
| ---------------------- | -----: |
| Menos de 10%           | 100    |
| 10% a 25%              | 70     |
| 25% a 50%              | 30     |
| 50% en adelante        | 5      |

**Máximo posible por pregunta:** 100 × cantidad de deudas.

**Diagnósticos y tips:**

- **`toxicRates`** (crítico). *Se muestra si:* alguna deuda tiene tasa
  Alta o Muy alta.
  - Diagnóstico: "Al menos una de tus deudas tiene tasa alta o muy alta."
  - Tip: "Esa es la primera que conviene atacar. Cualquier ahorro o
    inversión que rinda menos que esa tasa, en la práctica, te está
    restando dinero."

---

## Naturaleza de cada deuda · `debtKinds`

**Mide:** Si cada deuda produce dinero, reemplaza un gasto recurrente, o
solo financió consumo. Define el orden de pago en el plan de salida y
distingue deuda priorizable de deuda urgente.

**Cuándo se muestra:** Solo si `hasDebt = Sí` **Y** `debtCount > 0`.

**Tipo de entrada:** grilla — una fila por deuda; cada fila es un chip
(selección única).

**Pregunta visible:**

> ¿Qué tipo de deuda es cada una?

**Origen de las filas:** Una fila por cada deuda declarada en `debtCount`,
etiquetadas "Deuda #1", "Deuda #2", etc.

**Opciones de cada fila (chips):**

| Opción          | Sublabel                | Definición                                                                |
| --------------- | ----------------------- | ------------------------------------------------------------------------- |
| Una inversión   | p. ej. local, negocio   | Deuda tomada para producir más dinero del que cuesta el interés.          |
| Un ahorro       | p. ej. casa, carro      | Deuda que reemplaza un gasto recurrente por un activo que se conserva.    |
| Una deuda mala  | p. ej. concierto, vacación | Deuda tomada para gastos que no producen ingreso ni evitan otro gasto. |

**Cálculo derivado:** ninguno.

**Términos del glosario referenciados:** Deuda de inversión, Deuda de
ahorro, Deuda mala.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** una deuda que produce o conserva valor pesa más
positivo que una de consumo.

| Opción          | Puntos por fila |
| --------------- | --------------: |
| Una inversión   | 90              |
| Un ahorro       | 70              |
| Una deuda mala  | 10              |

**Máximo posible por pregunta:** 90 × cantidad de deudas.

**Diagnósticos y tips:**

- **`allBadDebt`** (a revisar). *Se muestra si:* todas las deudas son de
  consumo ("Una deuda mala").
  - Diagnóstico: "Todas tus deudas son de consumo."
  - Tip: "Pagar deuda mala libera ingreso futuro. Antes de invertir,
    prioriza eliminar este tipo de deuda — los intereses te cuestan más
    de lo que cualquier inversión segura te puede dar."
- **`hasGoodDebt`** (a favor). *Se muestra si:* alguna deuda es "Una
  inversión" o "Un ahorro".
  - Diagnóstico: "Parte de tu deuda está produciendo o conservando
    valor."
  - Tip: "No es la deuda en sí lo que daña — es la que solo financia
    consumo. Revisá si las tasas son razonables comparadas con el
    rendimiento que te dan."
- **`leverageAgainstAssets`** (info). *Se muestra si:* alguna deuda
  es "Una inversión".
  - Diagnóstico: "Tu deuda productiva opera como apalancamiento
    contra activos."
  - Tip: "Es la misma mecánica que usan los patrimonios grandes:
    pedir prestado contra activos en vez de venderlos. Conservan el
    activo, evitan el impuesto a la ganancia, y pagan la tasa.
    Mientras el activo rinda más que la tasa de la deuda, la
    estructura suma."
