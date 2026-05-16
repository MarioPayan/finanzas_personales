# Base · Salario y gastos

Bloque inicial del cuestionario. Captura ingreso, edad, estabilidad
laboral, gastos (obligatorios y discrecionales) y conocimiento del score
crediticio. Es el ancla numérica que usan los bloques siguientes para
contextualizar deudas, fondo de emergencia y montos de inversión, y
también define datos demográficos (edad) que insights de otras
categorías referencian.

---

## Ingresos mensuales · `incomeBand`

**Mide:** Banda aproximada del ingreso mensual, expresada en múltiplos del
salario mínimo del país (SMM). Es la referencia base de toda la aplicación:
toda derivación posterior parte de un ingreso estimado calculado a partir
de esta banda (o del valor exacto si el usuario lo ingresó).

**Cuándo se muestra:** Siempre. Es la primera pregunta del cuestionario.

**Tipo de entrada:** chips (selección única) **+** valor exacto opcional.

**Pregunta visible:**

> ¿Cuánto ganas al mes, más o menos?

**Indicación auxiliar:** En múltiplos del salario mínimo de tu país, o
ingresá el valor exacto.

**Opciones / configuración:**

| Opción           | Banda en SMM      |
| ---------------- | ----------------- |
| Menos de 1 SMM   | < 1 × SMM         |
| 1 a 2 SMM        | 1 × SMM a 2 × SMM |
| 2 a 4 SMM        | 2 × SMM a 4 × SMM |
| 4 a 8 SMM        | 4 × SMM a 8 × SMM |
| Más de 8 SMM     | ≥ 8 × SMM         |

Además, el usuario puede ingresar un **valor exacto** en lugar de elegir
una banda. Sin tope superior, paso de 1.000 unidades de la moneda local,
placeholder "Valor exacto".

**Cálculo derivado:** Cada banda se multiplica por el SMM del país detectado
para mostrar el monto en moneda local al lado de la opción. Por ejemplo, en
Colombia (SMM 2025 = $1.423.500 COP), la banda "1 a 2 SMM" se muestra como
"$1.423.500 – $2.847.000".

A partir de esta respuesta se computa el **ingreso mensual estimado** que
usan las preguntas siguientes:
- Si el usuario eligió banda, se toma el punto medio del rango × SMM
  (p. ej. "2 a 4 SMM" → 3 × SMM). Para "Más de 8 SMM" se toma 12 × SMM
  (1.5 × el mínimo de la banda) como aproximación.
- Si ingresó valor exacto, se toma ese.

**Términos del glosario referenciados:** SMM.

**Widgets del panel lateral:** Salario mínimo del país detectado (nombre,
monto, año, moneda).

**Tips contextuales:**

- Un valor exacto te dará un diagnóstico más fino que la banda. La banda
  sirve si no recordás la cifra exacta.

**Puntaje (peso):** asume que ingreso más alto da mayor margen para
absorber imprevistos y deudas, así que pondera positivamente al subir de
banda.

| Banda            | Puntos |
| ---------------- | -----: |
| Menos de 1 SMM   | 30     |
| 1 a 2 SMM        | 50     |
| 2 a 4 SMM        | 70     |
| 4 a 8 SMM        | 90     |
| Más de 8 SMM     | 100    |

Para valor exacto, la app divide el monto por el SMM del país y busca en
qué banda cae para usar su puntaje. **Máximo posible:** 100.

**Diagnósticos y tips:**

- **`incomeBelowMinimum`** (crítico). *Se muestra si:* el ingreso
  estimado es menor a 1 SMM.
  - Diagnóstico: "Tu ingreso está por debajo del salario mínimo de tu
    país."
  - Tip: "Buscar fuentes complementarias de ingreso, o invertir en
    formación que abra mejores oportunidades en tu campo, debería ser la
    prioridad antes que cualquier otra recomendación financiera."
- **`incomeWellBelowAverage`** (a revisar). *Se muestra si:* el ingreso
  estimado es menor a 0.5× la media nacional **y** no está debajo del
  SMM (para no duplicar con el insight crítico). La media viene del
  benchmark WID por país.
  - Diagnóstico: "Tu salario está muy por debajo de la media nacional."
  - Tip: "Estás más cerca del piso que del centro de la distribución.
    Si la situación es estable, conviene priorizar formación o cambios
    laborales que muevan el ingreso antes que optimizar gastos."
- **`incomeBelowAverage`** (info). *Se muestra si:* el ingreso estimado
  está entre 0.5× y 1× la media nacional.
  - Diagnóstico: "Tu salario está por debajo de la media nacional."
  - Tip: "Es la situación de buena parte de la población — no es
    alarmante por sí mismo, pero tenelo presente al decidir cuánto
    destinar a ahorro e inversión."
- **`incomeAboveAverage`** (a favor). *Se muestra si:* el ingreso
  estimado es mayor a 1.5× la media nacional.
  - Diagnóstico: "Tu salario está por encima de la media nacional."
  - Tip: "Tenés margen real para construir fondo de emergencia y
    destinar a inversión sin recortar calidad de vida."
- **`incomeHigh`** (info). *Se muestra si:* el ingreso estimado es mayor
  a 8 SMM.
  - Diagnóstico: "Tu ingreso está claramente por encima del promedio."
  - Tip: "Asegurate de que la mayor parte esté trabajando para vos:
    revisá diversificación y rendimiento de tus inversiones. Un ingreso
    alto sin inversión es ahorro estancado."

Los insights de "comparación contra la media nacional" no se disparan
si el país detectado no tiene benchmark WID, o si la moneda del
benchmark no coincide con la moneda del SMM (caso Venezuela).

---

## Edad · `age`

**Mide:** Edad del usuario en años. Información de perfil — no
contribuye al puntaje, pero la consumen insights de otras categorías
para condicionar mensajes (riesgo de no tener seguro a edad >40,
sugerencia de perfil de inversionista por banda etaria).

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** entrada numérica directa.

**Pregunta visible:**

> ¿Qué edad tienes?

**Indicación auxiliar:** ninguna.

**Opciones / configuración:**

- Rango: 14 a 100.
- Paso: 1.
- Valor por defecto: 30.
- Unidad: `años`.

**Cálculo derivado:** ninguno (la edad no se contextualiza con SMM ni
ingreso).

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje:** ninguno (pregunta informativa, `max = 0`).

**Diagnósticos y tips:** ninguno declarado en este nodo. Otros nodos
(`hasHealthInsurance`, `riskProfile`, `riskProfileGuess`) usan la
edad en sus condiciones.

---

## Estabilidad del ingreso · `incomeStability`

**Mide:** Naturaleza del ingreso del usuario. Sueldo fijo, mixto o
variable (freelance, comisiones, ventas) son perfiles muy distintos —
el variable necesita un fondo de emergencia más grueso y tolera peor
los gastos obligatorios cercanos al 100%.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Cómo es tu ingreso mes a mes?

**Indicación auxiliar:** ninguna (los `sublabel` de cada opción
explican).

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `fixed` | Sueldo fijo | El mismo monto cada mes | 100 |
| `mixed` | Mixto | Sueldo + comisiones, freelances ocasionales | 70 |
| `variable` | Variable | Freelance, comisiones, ventas, autoempleo | 40 |

**Máximo posible:** 100.

**Diagnósticos y tips:** ninguno por ahora — se usa solo como peso de
puntaje y como contexto para diagnósticos compuestos a futuro.

---

## Gastos obligatorios · `obligatoryPct`

**Mide:** Porcentaje del ingreso mensual que se va en gastos sin los cuales
el usuario no puede pasar el mes (vivienda, comida, transporte, servicios,
salud). Combinado con el ingreso, da el **monto mensual de gastos
obligatorios**, que se usa después para dimensionar el fondo de emergencia.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** slider continuo (porcentaje).

**Pregunta visible:**

> ¿Qué porcentaje de tu ingreso se va en gastos obligatorios?

**Indicación auxiliar:** Comida, vivienda, transporte, servicios. Lo que no
podrías dejar de pagar este mes. Incluí también los gastos anuales
(impuestos, matrículas, seguros) divididos por 12.

**Opciones / configuración:**

- Rango: 0% a 100%.
- Paso: 5%.
- Valor por defecto: 50%.
- Marcas visibles en el slider: 0%, 50%, 100%.
- Unidad: `%`.

**Cálculo derivado:** El valor del slider se aplica al ingreso mensual
estimado (de `incomeBand`) y se muestra en vivo bajo el slider como monto
en moneda local. Por ejemplo, "50% de tu ingreso" en Colombia con
`incomeBand = 1 a 2 SMM` (punto medio 1.5 × SMM ≈ $2.135.250) se muestra
como aproximadamente $1.067.625.

**Términos del glosario referenciados:** Gastos obligatorios.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** menos % de ingreso comprometido en lo obligatorio
implica más holgura → mejor puntaje.

| Banda del slider | Puntos |
| ---------------- | -----: |
| 0% a 30%         | 100    |
| 30% a 50%        | 80     |
| 50% a 70%        | 50     |
| 70% a 90%        | 20     |
| 90% a 100%       | 5      |

**Máximo posible:** 100.

**Diagnósticos y tips:**

El porcentaje obligatorio se interpreta contra un **piso absoluto** (`0.4
× SMM` del país). Si el monto efectivo no supera ese piso, el `%` no es
comparable entre países y los warnings/positives habituales no
disparan; en su lugar aplica `obligatoryBelowSubsistence`.

- **`obligatoryBelowSubsistence`** (info). *Se muestra si:*
  `obligatoryPct × ingreso mensual / 100 < 0.4 × SMM` del país.
  - Diagnóstico: "Tu gasto absoluto en obligatorios está por debajo del
    mínimo de subsistencia."
  - Tip: "Probablemente tengas apoyos externos (vivienda familiar,
    subsidios) o no estés contando todo. Revisá si tu cifra incluye
    realmente comida, vivienda, transporte y servicios."
- **`highObligatorySpending`** (a revisar). *Se muestra si:*
  `obligatoryPct > 70%` **y** el monto absoluto supera `0.4 × SMM`.
  - Diagnóstico: "Más del 70% de tu ingreso se va en gastos
    obligatorios."
  - Tip: "Empezá por reducir o renegociar el rubro más grande (vivienda,
    transporte, servicios) o por aumentar ingresos. Con ese margen tan
    apretado, cualquier imprevisto se vuelve crisis."
- **`lowObligatorySpending`** (a favor). *Se muestra si:*
  `obligatoryPct < 30%` **y** el monto absoluto supera `0.4 × SMM` (es
  decir: el % bajo es real, no un artefacto de ingresos demasiado
  bajos).
  - Diagnóstico: "Más del 70% de tu ingreso queda libre después de tus
    obligaciones."
  - Tip: "Buen punto de partida para fortalecer el fondo de emergencia y
    dirigir el resto a inversiones diversificadas."

---

## Gastos discrecionales · `discretionaryPct`

**Mide:** Porcentaje del ingreso que se va en gastos no esenciales —
salidas, hobbies, ropa, comer fuera, viajes — y gastos anuales
prorrateados como vacaciones, regalos y suscripciones. Junto con
`obligatoryPct` define cuánto queda libre para ahorro e inversión.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** slider continuo (porcentaje).

**Pregunta visible:**

> ¿Qué porcentaje de tu ingreso se va en gastos discrecionales?

**Indicación auxiliar:** Salidas, hobbies, ropa, comer fuera, viajes.
Incluí también los gastos anuales (vacaciones, regalos,
suscripciones) divididos por 12.

**Opciones / configuración:**

- Rango: 0% a 100%. Paso: 5%. Valor por defecto: 25%.
- Marcas visibles: 0%, 50%, 100%.
- Unidad: `%`.

**Cálculo derivado:** El valor del slider se aplica al ingreso mensual
estimado y se muestra como monto en moneda local bajo el slider, igual
que en `obligatoryPct`.

**Términos del glosario referenciados:** ninguno (a evaluar agregar
"gastos discrecionales").

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje:**

| Banda del slider | Puntos |
| ---------------- | -----: |
| 0% a 15%         | 100    |
| 15% a 30%        | 80     |
| 30% a 45%        | 50     |
| 45% a 60%        | 20     |
| 60% a 100%       | 5      |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`highDiscretionarySpending`** (a revisar). *Se muestra si:*
  `discretionaryPct > 45%`.
  - Diagnóstico: "Estás gastando una parte muy alta de tu ingreso en
    lo discrecional."
  - Tip: "No se trata de cohibirte, sino de saber adónde va. Anotá un
    mes lo que gastás en lo no esencial; suele sorprender. Ese margen
    es el que después permite invertir o construir fondo de
    emergencia."
- **`discretionaryHoursOfLife`** (info). *Se muestra si:*
  `discretionaryPct > 45%`.
  - Diagnóstico: "Probá medir tus gastos discrecionales en horas de
    tu vida."
  - Tip: "Dividí tu ingreso mensual por tus horas trabajadas: ese es
    tu ingreso por hora. Cuando dudes con un gasto grande, dividilo
    por esa cifra — te dice cuántas horas de tu vida cuesta. Es un
    filtro más honesto que pensar en dinero."

---

## Sistema de cubetas · `hasBudgetSystem`

**Mide:** Cómo el usuario distribuye su ingreso entrante: en cabeza, en
cuentas separadas, o automatizado por el banco. El "sistema de cubetas"
predice mejor el cumplimiento del ahorro que el monto ahorrado.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Tenés un sistema para repartir tu ingreso cuando entra?

**Indicación auxiliar:** Hablamos de cómo decidís cuánto va a
obligatorios, ahorro, inversión y gusto — no del monto, sino del
método.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `no` | No tengo método | Gasto y veo qué queda al final del mes | 10 |
| `mental` | Mental | Tengo una idea de cuánto va a cada cosa, pero todo en una sola cuenta | 40 |
| `accounts` | Cuentas separadas | Una cuenta para gastos, otra para ahorro, otra para inversión | 80 |
| `automated` | Automatizado | El banco o una app reparte automáticamente cuando llega el ingreso | 100 |

**Términos del glosario referenciados:** Sistema de cubetas.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`noBudgetSystem`** (a revisar). *Se muestra si:*
  `hasBudgetSystem = no`.
  - Diagnóstico: "No tenés un sistema para repartir tu ingreso."
  - Tip: "Lo que sobra al final del mes nunca alcanza. Probá la regla
    más simple: cuando entra el ingreso, mové primero un porcentaje
    fijo a ahorro/inversión, y vivir con lo que queda. Mental, en
    cuentas separadas o automatizado — cualquier sistema le gana a no
    tener."
- **`automatedBudget`** (a favor). *Se muestra si:*
  `hasBudgetSystem = automated`.
  - Diagnóstico: "Tu reparto está automatizado."
  - Tip: "Es la versión más sólida del sistema: el ahorro no depende
    de tu disciplina mensual. Verificá una vez al año que los
    porcentajes sigan haciendo sentido para tu ingreso y tus metas."

---

## Conocimiento del score · `knowsCreditScore`

**Mide:** Si el usuario conoce su puntaje crediticio (Datacrédito en
Colombia, Buró en México, Boa Vista/Serasa en Brasil, Equifax en
otros países). Conocerlo es indicador básico de educación
financiera. Si responde "No", la pregunta siguiente sobre la banda
del score se omite.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** toggle (Sí / No).

**Pregunta visible:**

> ¿Conoces tu puntaje crediticio?

**Puntaje:** `whenTrue: 100`, `whenFalse: 30`.

**Diagnósticos y tips:** ninguno por ahora.

---

## Banda del score · `creditScoreBand`

**Mide:** Banda aproximada del puntaje crediticio. Las escalas varían
por país (Datacrédito 150–950, Buró 300–850, Serasa 0–1000) pero
todas tienen rangos comparables: malo, regular, bueno, excelente.
Pedimos la banda autoreportada para no obligar al usuario a recordar
la cifra exacta.

**Cuándo se muestra:** Si `knowsCreditScore = Sí`.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿En qué banda dirías que está tu puntaje?

**Indicación auxiliar:** Como referencia: malo (te niegan crédito),
regular (te lo dan con tasas altas), bueno (tasas estándar),
excelente (mejores tasas y tarjetas premium). Mirá el panel lateral
(`creditScoreScale`) para ver los rangos numéricos exactos del país
detectado.

**Widgets del panel lateral:** `creditScoreScale` — muestra los
rangos absolutos del buró de cada país (FICO en US, Datacrédito en
CO, Serasa en BR, etc.). Los datos viven en
`src/content/creditScoreBands.ts`.

**Opciones / configuración:**

| Valor | Etiqueta | Puntos |
| ----- | -------- | -----: |
| `bad` | Malo | 20 |
| `regular` | Regular | 50 |
| `good` | Bueno | 80 |
| `excellent` | Excelente | 100 |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`badCreditScore`** (a revisar). *Se muestra si:* `creditScoreBand
  ∈ [malo, regular]`.
  - Diagnóstico: "Tu puntaje crediticio no está en buen rango."
  - Tip: "Revisá tus deudas activas, paga puntual aunque sean montos
    chicos, y evitá pedir múltiples créditos en poco tiempo. Subir un
    score toma meses, no días."
