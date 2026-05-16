# Inversiones

Bloque final del cuestionario. Empieza con dos preguntas de **inversión
en uno mismo** (educación profesional + educación financiera) que se
preguntan siempre, independiente de si la persona invierte
financieramente — la inversión más importante es uno mismo. Después el
toggle `invests` actúa como gate del resto: perfil de riesgo,
vehículos, montos y rendimientos se omiten si responde "No".

---

## Años invirtiendo · `yearsInvesting`

**Mide:** Cuánto tiempo lleva el usuario invirtiendo, contado desde la
primera inversión real. No depende de `invests`: capta el caso "joven
que no invierte" para activar el insight de interés compuesto. La
opción "Nunca" puntúa bajo aunque el usuario no se considere
inversor.

**Cuándo se muestra:** Siempre (no depende de `invests`).

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Hace cuánto invertís plata?

**Indicación auxiliar:** Desde la primera inversión real que sigue
activa o de la que aprendiste algo. Cuentas de ahorro genéricas no
cuentan.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `never` | Nunca invertí | — | 10 |
| `lt1` | Menos de 1 año | Estoy arrancando | 40 |
| `1to3` | 1 a 3 años | Empezando a ver resultados | 70 |
| `3to10` | 3 a 10 años | Ya pasé al menos un ciclo de mercado | 90 |
| `gt10` | Más de 10 años | Inversor experimentado | 100 |

**Términos del glosario referenciados:** Interés compuesto.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`compoundTimeWasted`** (a revisar). *Se muestra si:*
  `yearsInvesting ∈ [never, lt1]` **Y** `age < 30`.
  - Diagnóstico: "Sos joven y todavía no estás capturando interés
    compuesto."
  - Tip: "Cada año invertido a los 20 vale más que diez años
    invertidos a los 40, gracias al interés compuesto. Empezar tarde
    con más plata pierde contra empezar temprano con poca. No hace
    falta saber mucho: un fondo indexado básico ya activa el reloj."

---

## Inversión en formación profesional · `professionalEducationInvestment`

**Mide:** Si el usuario invirtió tiempo o dinero en formación de su
rubro durante el último año. La inversión que más mueve el ingreso a
largo plazo es la que se hace en uno mismo.

**Cuándo se muestra:** Siempre (no depende de `invests`).

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿En el último año invertiste en formarte para tu trabajo o profesión?

**Indicación auxiliar:** Cursos, certificaciones, lecturas técnicas,
mentorías, posgrado.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `no` | No | — | 10 |
| `a-bit` | Algo de lectura informal | Artículos, videos, podcasts del rubro | 40 |
| `time` | Sí, dediqué tiempo | Cursos gratuitos, autoestudio constante | 75 |
| `time-money` | Sí, tiempo y dinero | Certificación, posgrado, curso pago | 100 |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`noProfessionalEducation`** (info). *Se muestra si:*
  `professionalEducationInvestment = no`.
  - Diagnóstico: "No estás invirtiendo en formación de tu rubro."
  - Tip: "Tu mejor activo sos vos mismo. Cualquier mejora en tu
    trabajo se compone — sube el ingreso, abre puertas, da margen
    para todo lo demás. No tiene por qué ser caro: empezar con
    contenido gratuito ya cuenta."

---

## Inversión en educación financiera · `financialEducationInvestment`

**Mide:** Si el usuario invirtió tiempo o dinero en aprender sobre
finanzas personales en el último año. Saber antes de invertir reduce
el riesgo de tomar decisiones por moda o por miedo. No depende del
gate `invests` — tiene sentido preguntar incluso a quien no invierte
todavía.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿En el último año invertiste en educar tus finanzas personales?

**Indicación auxiliar:** Libros, podcasts, cursos, canales,
comunidades. Antes de invertir conviene saber en qué.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `no` | No | — | 10 |
| `a-bit` | Algo de contenido informal | Videos, posts, alguna conversación | 40 |
| `time` | Sí, dediqué tiempo | Libros, podcasts, autoestudio | 75 |
| `time-money` | Sí, tiempo y dinero | Cursos pagos, asesoría, formación formal | 100 |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`noFinancialEducation`** (info). *Se muestra si:*
  `financialEducationInvestment = no`.
  - Diagnóstico: "No estás invirtiendo en tu educación financiera."
  - Tip: "No es necesario gastar dinero — un par de podcasts o libros
    gratuitos te dan lo básico. Lo importante es saber qué estás
    haciendo antes de mover plata, no aprenderlo cuando ya cometiste
    el error."

---

## ¿Inviertes parte de tu ingreso? · `invests`

**Mide:** Puerta de entrada al bloque de inversiones financieras.
Decide si las preguntas siguientes que dependen de este gate se
muestran o se omiten en bloque. Las dos preguntas de educación
(antes de este nodo) ya se preguntaron y no dependen de la
respuesta.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** toggle (Sí / No).

**Pregunta visible:**

> ¿Inviertes parte de tu ingreso?

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
| Sí        | 100    |
| No        | 30     |

A diferencia de Deudas (donde "No" es la mejor situación), en Inversiones
"No" no es perfecto: invertir es deseable. La gate sigue siendo positiva
si se responde Sí, y modesta pero no cero si se responde No (la sección
no se completa con un castigo total). **Máximo posible:** 100.

**Diagnósticos y tips:**

- **`notInvestingButReady`** (para considerar). *Se muestra si:*
  `invests = No` **Y** el fondo de emergencia es de al menos 1 mes
  (`emergencyMonths` ∈ {1 a 3, 3 a 6, Más de 6}) **Y** (no tiene deudas
  o la magnitud es Pequeña/Mediana).
  - Diagnóstico: "No estás invirtiendo, pero tu situación lo permitiría."
  - Tip: "Con un fondo de emergencia razonable y sin deuda grande, tenés
    margen para empezar con instrumentos seguros (CDT, fondos de
    inversión) e ir escalando a medida que ganes confianza."
- **`investingActively`** (a favor). *Se muestra si:* `invests = Sí`.
  - Diagnóstico: "Estás invirtiendo, lo cual indica un hábito financiero
    saludable."
  - Tip: "Asegurate de que las tasas de tus deudas no superen el
    rendimiento de tus inversiones — si lo superan, pagar deuda es
    matemáticamente la mejor inversión."

---

## Frecuencia de trading · `tradingFrequency`

**Mide:** Cuán seguido el usuario compra o vende sus inversiones. El
backlog del video lo identifica como predictor robusto: tradear
frecuentemente correlaciona con peor rendimiento que comprar y
mantener. Capta day-trading aunque el usuario no lo declare como tal.

**Cuándo se muestra:** Solo si `invests = Sí`.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Con qué frecuencia comprás o vendés tus inversiones?

**Indicación auxiliar:** No cuenta el aporte mensual a un fondo;
cuenta cuándo decidís entrar o salir de una posición.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `never` | Casi nunca | Compré y dejé; ajusto rara vez | 100 |
| `few-year` | Pocas veces al año | — | 90 |
| `monthly` | Mensual | — | 60 |
| `weekly` | Semanal | — | 25 |
| `daily` | Diario | Sigo el mercado todos los días | 5 |

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`frequentTrading`** (a revisar). *Se muestra si:*
  `tradingFrequency ∈ [weekly, daily]`.
  - Diagnóstico: "Estás tradeando con mucha frecuencia."
  - Tip: "La evidencia es consistente: en promedio, quien tradea
    seguido rinde menos que quien compra y mantiene, después de
    comisiones e impuestos. Si tu rentabilidad neta no le está
    ganando a un fondo indexado, conviene reducir la frecuencia y
    dejar que el tiempo trabaje."

---

## Uso de fondos indexados · `usesIndexFunds`

**Mide:** Si el usuario usa fondos indexados o ETFs en su portafolio.
El backlog del video lo cita como atajo de bajo costo que
históricamente le gana a la mayoría de gestores activos en el largo
plazo.

**Cuándo se muestra:** Solo si `invests = Sí`.

**Tipo de entrada:** toggle (Sí / No).

**Pregunta visible:**

> ¿Usás fondos indexados o ETFs en tu portafolio?

**Indicación auxiliar:** Replican un índice (S&P 500, MSCI World,
etc.) a bajo costo, en vez de elegir activos uno por uno.

**Términos del glosario referenciados:** Fondo indexado.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje:** `whenTrue: 100`, `whenFalse: 30`. **Máximo posible:**
100.

**Diagnósticos y tips:**

- **`noIndexFunds`** (info). *Se muestra si:* `usesIndexFunds = No`.
  - Diagnóstico: "Tu portafolio no incluye fondos indexados."
  - Tip: "En plazos de 20 años, alrededor del 94% de los gestores
    activos profesionales no le gana a un índice básico tipo S&P
    500. Para la mayoría de inversores particulares, un fondo
    indexado de base — y construir alrededor — es la apuesta con
    mejor relación esfuerzo/resultado."

---

## Perfil de inversionista · `riskProfile`

**Mide:** Autoclasificación del usuario en su perfil de riesgo:
conservador (preservar capital), moderado (balance), agresivo (mayor
rentabilidad aceptando volatilidad). "No sé" da pocos puntos y
desencadena una pregunta de seguimiento (`riskProfileGuess`) que
sugiere un perfil basado en la edad.

**Cuándo se muestra:** Solo si `invests = Sí`.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Cuál es tu perfil de inversionista?

**Indicación auxiliar:** Conservador: preferís rentabilidad baja pero
segura. Moderado: balance entre rendimiento y riesgo. Agresivo:
aceptás volatilidad y posibles pérdidas a cambio de mayor rentabilidad
esperada.

**Opciones / configuración:**

| Valor | Etiqueta | Puntos |
| ----- | -------- | -----: |
| `conservative` | Conservador | 80 |
| `moderate` | Moderado | 90 |
| `aggressive` | Agresivo | 80 |
| `unknown` | No sé | 20 |

**Máximo posible:** 90.

**Diagnósticos y tips:**

- **`riskProfileMatchesAge`** (a favor). *Se muestra si:* la elección
  coincide con la sugerencia general por edad: `<30 → agresivo`,
  `30–49 → moderado`, `≥50 → conservador`.
  - Diagnóstico: "Tu perfil de riesgo está alineado con tu etapa de
    vida."
  - Tip: "Buena foto inicial. Igual conviene revisarlo cada 5-10 años
    — las prioridades cambian con responsabilidades, dependientes,
    salud."
- **`riskProfileUnknown`** (info). *Se muestra si:* `riskProfile =
  unknown`.
  - Diagnóstico: "No tenés claro tu perfil de inversionista."
  - Tip: "Definirlo es uno de los pasos más útiles: te dice qué
    instrumentos tienen sentido para vos y cuáles no, y te evita
    entrar en una inversión que no podés sostener cuando empiece a
    moverse."

---

## Perfil sugerido · `riskProfileGuess`

**Mide:** Pregunta de seguimiento si el usuario respondió "No sé" en
`riskProfile`. Le pedimos que elija una referencia con una guía
rápida basada en edad. La elección coincidente con la sugerencia
para su edad da un insight informativo positivo; cualquier otra
elección sigue siendo válida pero no recibe el bonus.

**Cuándo se muestra:** Solo si `invests = Sí` y `riskProfile = no
sé`.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> Sin un perfil claro, ¿cuál escogerías como referencia?

**Indicación auxiliar:** Como guía: con menos de 30 años (mucho
horizonte) suele recomendarse agresivo; entre 30 y 50, moderado; con
50 o más, conservador para preservar capital.

**Opciones / configuración:** chips conservador / moderado / agresivo,
todos con `score: 30` (porque ya perdió puntos en la pregunta padre
al responder "no sé").

**Máximo posible:** 30.

**Diagnósticos y tips:**

- **`guessMatchesAgeRecommendation`** (info). *Se muestra si:* la
  elección coincide con la sugerencia por edad (mismas bandas que
  `riskProfileMatchesAge`).
  - Diagnóstico: "Tu elección coincide con la recomendación general
    para tu edad."
  - Tip: "Es una buena referencia para empezar. Cuando tengas más
    experiencia invirtiendo conocerás mejor tu perfil real, que puede
    diferir."

---

## Vehículos de inversión · `investmentVehicles`

**Mide:** Mecanismos en los que el usuario tiene inversiones activas. La
selección define las filas que tendrán las dos grillas siguientes
(`investmentAmounts` y `investmentYields`).

**Cuándo se muestra:** Solo si `invests = Sí`.

**Tipo de entrada:** multi-chip (selección múltiple).

**Pregunta visible:**

> ¿En cuáles de estos mecanismos inviertes?

**Indicación auxiliar:** Selecciona todos los que apliquen.

**Opciones / configuración:**

| Opción         |
| -------------- |
| CDT            |
| Fondo de inversión |
| Acciones       |
| Bienes raíces  |
| Criptomonedas  |
| Bonos          |
| Otro           |

El usuario puede seleccionar cero o más opciones, pero las grillas
siguientes solo se muestran si seleccionó al menos una.

**Cálculo derivado:** ninguno.

**Términos del glosario referenciados:** CDT, Diversificación.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** cada opción aporta puntos por separado; el máximo de
la pregunta es la suma de todas. La idea es premiar diversificación.

| Vehículo            | Puntos si seleccionado |
| ------------------- | ---------------------: |
| CDT                 | 10                     |
| Fondo de inversión  | 15                     |
| Acciones            | 15                     |
| Bienes raíces       | 15                     |
| Criptomonedas       | 5                      |
| Bonos               | 15                     |
| Otro                | 10                     |

**Máximo posible:** 85 (suma de todas las opciones).

**Diagnósticos y tips:**

- **`lowDiversification`** (a revisar). *Se muestra si:* hay un solo
  vehículo seleccionado.
  - Diagnóstico: "Estás invirtiendo en un solo vehículo."
  - Tip: "Diversificá entre instrumentos con riesgos distintos. Un mal
    año en un único vehículo no debería poder destruir tu plan
    completo."
- **`cryptoOnly`** (crítico). *Se muestra si:* el único vehículo
  seleccionado es Criptomonedas.
  - Diagnóstico: "Tu única inversión es cripto."
  - Tip: "Cripto es una clase de activo de alta volatilidad. Conviene
    combinarla con instrumentos más estables (renta fija, fondos
    diversificados) para que un crash no se lleve todo."

---

## Monto por vehículo · `investmentAmounts`

**Mide:** Cuánto dinero tiene el usuario invertido en cada vehículo
seleccionado. Se contextualiza en bandas relativas al SMM para que el
usuario no tenga que recordar cifras exactas.

**Cuándo se muestra:** Solo si `invests = Sí` **Y** `investmentVehicles`
tiene al menos una opción seleccionada.

**Tipo de entrada:** grilla — una fila por vehículo seleccionado en
`investmentVehicles`; cada fila es un chip de banda + valor exacto
opcional.

**Pregunta visible:**

> ¿Cuánto tienes invertido en cada uno?

**Indicación auxiliar:** Aproximadamente, en múltiplos del salario
mínimo, o el monto exacto.

**Origen de las filas:** Una fila por cada vehículo seleccionado en
`investmentVehicles`, etiquetada con el nombre del vehículo (p. ej.
"CDT", "Acciones").

**Opciones de cada fila (chips):**

| Opción           | Banda en SMM      |
| ---------------- | ----------------- |
| Menos de 1 SMM   | < 1 × SMM         |
| 1 a 2 SMM        | 1 × SMM a 2 × SMM |
| 2 a 4 SMM        | 2 × SMM a 4 × SMM |
| Más de 4 SMM     | ≥ 4 × SMM         |

Además, en cada fila el usuario puede ingresar un **monto exacto** (sin
tope superior, paso de 1.000 unidades de la moneda local, placeholder
"Monto exacto").

**Cálculo derivado:** Cada banda se multiplica por el SMM del país
detectado para mostrar el monto en moneda local al lado de la opción
(igual que en `incomeBand`).

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** monto más alto invertido → mejor puntaje.

| Opción           | Puntos por fila |
| ---------------- | --------------: |
| Menos de 1 SMM   | 30              |
| 1 a 2 SMM        | 50              |
| 2 a 4 SMM        | 70              |
| Más de 4 SMM     | 100             |

Para valor exacto, se divide entre el SMM y se busca la banda
correspondiente. **Máximo posible por pregunta:** 100 × cantidad de
vehículos seleccionados.

**Diagnósticos y tips:**

- **`smallPositions`** (para considerar). *Se muestra si:* todas las
  posiciones son menores a 1 SMM.
  - Diagnóstico: "Tus posiciones individuales son menores a 1 SMM."
  - Tip: "Es razonable empezar pequeño para aprender, pero es el capital
    significativo el que mueve la aguja en el largo plazo. Apuntá a
    escalar a medida que ganás confianza con cada vehículo."

---

## Rendimiento por vehículo · `investmentYields`

**Mide:** Rendimiento efectivo anual aproximado de cada vehículo. Permite
distinguir inversiones que crecen del dinero estancado, e identificar
vehículos que rinden por debajo de la inflación o de las deudas activas.

**Cuándo se muestra:** Solo si `invests = Sí` **Y** `investmentVehicles`
tiene al menos una opción seleccionada.

**Tipo de entrada:** grilla — una fila por vehículo; cada celda es
chips de bandas con valor exacto opcional. Permite responder solo
con botones; quien tenga la cifra precisa puede tipear.

**Pregunta visible:**

> ¿Cuál es el rendimiento anual de cada uno?

**Indicación auxiliar:** Si no estás seguro, ingresá tu mejor
estimación (en % EA).

**Origen de las filas:** Una fila por cada vehículo seleccionado en
`investmentVehicles`.

**Opciones por celda:**

| Valor | Etiqueta | Sublabel | Puntos por fila |
| ----- | -------- | -------- | --------------: |
| `negative` | Negativo | Estoy perdiendo | 0 |
| `lt3` | 0% a 3% | Apenas inflación | 25 |
| `3to7` | 3% a 7% | Cuenta de ahorros, CDT | 55 |
| `7to15` | 7% a 15% | Renta fija con riesgo, fondos diversificados | 90 |
| `gt15` | Más de 15% | Rentabilidad alta — verificá riesgo | 100 |

Cada celda admite además un **rendimiento exacto** (rango -100% a
1000%, paso 0.1%, unidad "% EA"). Si lo ingresan, se ubica en una
banda equivalente para puntuar.

**Términos del glosario referenciados:** EA.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Máximo posible por pregunta:** 100 × cantidad de vehículos
seleccionados.

**Diagnósticos y tips:**

- **`belowInflationYield`** (a revisar). *Se muestra si:* algún
  vehículo está en banda `negative` o `lt3` (rinde por debajo de la
  inflación esperada).
  - Diagnóstico: "Al menos uno de tus vehículos rinde por debajo de
    la inflación."
  - Tip: "Si la inflación local supera ese rendimiento, ese vehículo
    te está haciendo perder poder adquisitivo. Revisá si conviene
    rotarlo a algo más productivo."
- **`unsustainableHighYield`** (a revisar). *Se muestra si:* algún
  vehículo está en banda `gt15` **O** el rendimiento exacto declarado
  supera 30%.
  - Diagnóstico: "Tenés al menos un vehículo con rendimientos muy
    altos."
  - Tip: "Rendimientos consistentemente altos casi siempre esconden
    riesgo no contabilizado o sesgo de supervivencia (ves al ganador,
    no a los que perdieron). Antes de duplicar la apuesta, verificá
    el track record en años malos — si nunca lo viste perder,
    todavía no lo conocés."
