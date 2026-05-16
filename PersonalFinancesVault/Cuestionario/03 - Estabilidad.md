# Estabilidad

Bloque dedicado a los amortiguadores ante imprevistos serios: fondo de
emergencia (tamaño y velocidad de acceso), seguro de salud, y
estabilidad laboral percibida (con la pregunta de seguimiento sobre
segunda fuente de ingreso si el horizonte es corto). No tiene gate
inicial — siempre se evalúa.

---

## Fondo de emergencia · `emergencyMonths`

**Mide:** Cuántos meses de **gastos obligatorios** tiene el usuario
guardados como colchón ante imprevistos. Se mide en meses (no en valor
absoluto) porque el costo de cubrir N meses depende del nivel de gasto del
usuario, no de su ingreso.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** chips (selección única) **+** valor exacto opcional
(en meses).

**Pregunta visible:**

> ¿Cuántos meses de gastos tienes guardados como fondo de emergencia?

**Indicación auxiliar:** Aproximadamente, o ingresá la cantidad exacta de
meses.

**Opciones / configuración:**

| Opción          | Banda (en meses de gastos obligatorios) |
| --------------- | --------------------------------------- |
| Ninguno         | 0 (sin banda numérica)                  |
| Menos de 1 mes  | < 1 mes                                 |
| 1 a 3 meses     | 1 a 3 meses                             |
| 3 a 6 meses     | 3 a 6 meses                             |
| 6 a 12 meses    | 6 a 12 meses                            |
| 12 meses o más  | ≥ 12 meses                              |

Además, el usuario puede ingresar un **valor exacto** en meses (rango 0 a
120, paso 0.5, unidad "meses", placeholder "Meses exactos").

**Cálculo derivado:** Cada banda se multiplica por el **monto mensual de
gastos obligatorios** (computado como ingreso mensual estimado ×
`obligatoryPct`) y se muestra al usuario en moneda local. Por ejemplo, "1
a 3 meses" en Colombia con ingreso medio y 50% de gastos obligatorios
(≈ $1.067.625 mensuales) se muestra como "$1.067.625 – $3.202.875".

La opción "Ninguno" no tiene banda numérica: se muestra sin monto
asociado.

**Términos del glosario referenciados:** Fondo de emergencia.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje (peso):** más meses de colchón → mejor puntaje.

| Opción          | Puntos |
| --------------- | -----: |
| Ninguno         | 0      |
| Menos de 1 mes  | 20     |
| 1 a 3 meses     | 50     |
| 3 a 6 meses     | 75     |
| 6 a 12 meses    | 95     |
| 12 meses o más  | 100    |

Para valor exacto en meses:

| Meses exactos       | Puntos |
| ------------------- | -----: |
| Menos de 1          | 20     |
| 1 a 3               | 50     |
| 3 a 6               | 75     |
| 6 a 12              | 95     |
| 12 en adelante      | 100    |

**Máximo posible:** 100. Como Estabilidad tiene una sola pregunta, su
puntaje es directamente el de esta opción.

**Diagnósticos y tips:**

- **`noEmergencyFund`** (a revisar). *Se muestra si:* la respuesta es
  "Ninguno" o "Menos de 1 mes".
  - Diagnóstico: "Tu fondo de emergencia es inexistente o muy chico."
  - Tip: "Empezá por una meta chica que sí puedas cumplir: 1 mes de
    gastos obligatorios en cuenta líquida. Las metas grandes que no
    se cumplen producen abandono; las chicas que se cumplen producen
    hábito. Cuando llegues a 1 mes, redefiní el siguiente objetivo a
    3 meses."
- **`strongEmergencyFund`** (a favor). *Se muestra si:* la respuesta
  es "6 a 12 meses" o "12 meses o más".
  - Diagnóstico: "Tu fondo de emergencia cubre 6 meses o más."
  - Tip: "Si la cifra es muy superior a 6 meses, parte del excedente
    puede ir a inversión y rendir más sin perder seguridad."

---

## Velocidad de acceso al fondo · `emergencyAccessSpeed`

**Mide:** Cuán rápido puede el usuario disponer del dinero del fondo
si lo necesita. Un fondo grande pero ilíquido (CDT bloqueado,
inversión a meses) no es realmente un fondo de emergencia. Esta
pregunta separa el fondo "nominal" del fondo "operativo".

**Cuándo se muestra:** Solo si `emergencyMonths ∈ {1 a 3 meses, 3 a 6
meses, 6 a 12 meses, 12 meses o más}` — si no hay fondo, no tiene
sentido preguntar qué tan rápido se accede a él.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Qué tan rápido podrías disponer de tu fondo si lo necesitaras hoy?

**Indicación auxiliar:** Pensalo como: si esta noche se me daña el
auto y necesito el dinero, ¿cuándo lo tengo en mi mano?

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `minutes` | En minutos | Cuenta de ahorros, billetera digital | 100 |
| `hours` | En horas | Transferencia entre bancos | 90 |
| `days` | En días | Fondo de inversión a la vista, retiro programado | 60 |
| `weeks` | En semanas | CDT, fondo con liquidación lenta | 25 |
| `months` | En meses | Inversión bloqueada, propiedad | 5 |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`illiquidEmergencyFund`** (a revisar). *Se muestra si:*
  `emergencyAccessSpeed ∈ [semanas, meses]`.
  - Diagnóstico: "Tu fondo no es realmente líquido — tarda demasiado
    en estar disponible."
  - Tip: "El propósito del fondo es cubrir lo inesperado. Si tarda
    semanas o meses, la emergencia ya pasó. Una cuenta de ahorros o
    un fondo a la vista cumplen mejor ese rol; podés mantener el
    resto a más plazo."

---

## Seguro de salud · `hasHealthInsurance`

**Mide:** Si el usuario tiene cobertura de salud (pública, privada,
o complementaria). Reduce el peor escenario donde una urgencia médica
vacía el fondo y empuja a deuda. El **riesgo** de no tenerlo crece
con la edad — los insights de este nodo se condicionan a `age`.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** toggle (Sí / No).

**Pregunta visible:**

> ¿Tienes cobertura de salud?

**Indicación auxiliar:** Cualquiera: pública (EPS, IMSS, SUS,
FONASA), privada, o seguro complementario.

**Puntaje:** `whenTrue: 100`, `whenFalse: 30`.

**Diagnósticos y tips:**

- **`noInsuranceHighRisk`** (crítico). *Se muestra si:* sin seguro y
  `age > 40`.
  - Diagnóstico: "No tenés seguro de salud y por tu edad el riesgo es
    alto."
  - Tip: "Una urgencia médica sin cobertura puede vaciar tu fondo de
    emergencia y endeudarte mucho. Un plan básico — público si está
    disponible, privado complementario si no — debería ser
    prioridad."
- **`noInsuranceModerateRisk`** (a revisar). *Se muestra si:* sin
  seguro y `age ≤ 40`.
  - Diagnóstico: "No tenés seguro de salud."
  - Tip: "Aunque tu probabilidad anual de evento médico sea baja, un
    accidente puede pasarle a cualquiera. Aunque sea un plan público
    o un seguro de accidentes mínimo cubre lo peor."

---

## Horizonte laboral · `jobHorizon`

**Mide:** Cuánto tiempo se ve el usuario en su trabajo actual. Es
proxy de la estabilidad laboral percibida. Si el horizonte es corto
(≤5 años), la pregunta siguiente sobre segunda fuente de ingreso se
muestra.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿En cuánto tiempo te ves todavía en tu trabajo actual?

**Opciones / configuración:**

| Valor | Etiqueta | Puntos |
| ----- | -------- | -----: |
| `0to1` | 0 a 1 año | 30 |
| `1to3` | 1 a 3 años | 50 |
| `3to5` | 3 a 5 años | 70 |
| `5to10` | 5 a 10 años | 85 |
| `10to20` | 10 a 20 años | 95 |
| `gt20` | Más de 20 años | 100 |

**Máximo posible:** 100.

**Diagnósticos y tips:** ninguno declarado en este nodo. La señal
relevante (estabilidad laboral baja) la captura el siguiente nodo.

---

## Segunda fuente de ingreso · `secondIncomeStream`

**Mide:** Si el horizonte laboral es corto/medio (≤5 años),
preguntamos si el usuario tiene o está construyendo una segunda
fuente de ingreso. Captura la preparación ante un cambio que el
propio usuario ya intuye. La opción "no me interesa" se incluye
porque algunos usuarios deliberadamente dependen de su empleo
principal — no es lo mismo que "todavía no" pero implica menos
preparación.

**Cuándo se muestra:** Solo si `jobHorizon ∈ [0 a 1 año, 1 a 3 años,
3 a 5 años]`.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Tienes una fuente de ingreso secundaria?

**Indicación auxiliar:** Negocio propio, freelance, ingresos pasivos,
monetización de un hobby — cualquier cosa que no sea tu trabajo
actual.

**Opciones / configuración:**

| Valor | Etiqueta | Puntos |
| ----- | -------- | -----: |
| `no` | No, todavía no | 10 |
| `no-interest` | No, no me interesa | 5 |
| `idea` | Tengo una idea | 30 |
| `working` | Estoy trabajando en ello | 60 |
| `results` | Estoy viendo resultados | 85 |
| `stable` | Sí, ya es ingreso estable | 100 |

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`noSecondIncomeShortHorizon`** (a revisar). *Se muestra si:*
  `secondIncomeStream ∈ [no, no-interest]`.
  - Diagnóstico: "Tu horizonte laboral es corto y no tenés otra
    fuente en marcha."
  - Tip: "No es urgente, pero conviene empezar a pensarlo. Una
    segunda fuente toma años en madurar; si esperás a necesitarla ya
    es tarde."

---

## Nivel de estrés financiero · `financialStressLevel`

**Mide:** Cuán seguido el usuario percibe ansiedad o malestar por la
situación financiera. Es una variable subjetiva que no aparece en
ninguna otra pregunta y que el video de Galloway identifica como
factor de daño a la salud. Va al final de Estabilidad porque acumula
el efecto de todo lo anterior.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Con qué frecuencia sentís estrés financiero?

**Indicación auxiliar:** Ansiedad cuando se acerca fin de mes, evitar
abrir cuentas, dormir mal por dinero — esas señales.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `none` | Casi nunca | La plata no me quita el sueño | 100 |
| `sometimes` | A veces | En meses puntuales o ante imprevistos | 70 |
| `frequent` | Seguido | Varias veces al mes | 30 |
| `constant` | Constante | Lo cargo casi todos los días | 10 |

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`chronicFinancialStress`** (crítico). *Se muestra si:*
  `financialStressLevel ∈ [frequent, constant]`.
  - Diagnóstico: "Estás cargando estrés financiero sostenido."
  - Tip: "La presión financiera prolongada sube presión arterial,
    deteriora el sueño y empeora decisiones. Arreglar el cash-flow no
    es solo financiero, también es salud — empezá por el rubro más
    doloroso (deuda cara, gasto fijo grande) y atacalo aunque sea con
    un primer paso chico."

---

## Convivencia económica · `inRelationship`

**Mide:** Si el usuario comparte decisiones económicas con una pareja.
Es el gate que decide si se pregunta por la alineación financiera del
hogar. No puntúa por sí solo — es informativo.

**Cuándo se muestra:** Siempre.

**Tipo de entrada:** toggle (Sí / No).

**Pregunta visible:**

> ¿Compartís decisiones económicas con una pareja?

**Indicación auxiliar:** Conviviendo o no, casados o no — lo que
importa es si las decisiones de plata grandes las negociás con alguien
más.

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Puntaje:** ninguno (pregunta informativa, no contribuye al puntaje).

**Diagnósticos y tips:** ninguno declarado en este nodo. Sirve como
gate de `householdFinancialAlignment`.

---

## Alineación financiera con la pareja · `householdFinancialAlignment`

**Mide:** Si la pareja conversa de dinero y qué tan alineados están en
gastos y ahorro. El backlog del video lo cita como predictor #1 de
divorcio. Pregunta sensible — el copy es deliberadamente neutro para
no juzgar.

**Cuándo se muestra:** Solo si `inRelationship = Sí`.

**Tipo de entrada:** chips, selección única.

**Pregunta visible:**

> ¿Cómo manejan el tema dinero entre los dos?

**Indicación auxiliar:** Sin juicio: lo importante es identificar si
hay un canal de conversación, no si son perfectos.

**Opciones / configuración:**

| Valor | Etiqueta | Sublabel | Puntos |
| ----- | -------- | -------- | -----: |
| `never-talk` | No hablamos del tema | Cada uno con su plata, sin coordinación | 10 |
| `disagree` | Hablamos pero discutimos | No estamos de acuerdo en cómo gastar o ahorrar | 30 |
| `aligned-no-plan` | Estamos alineados pero sin plan | En la misma página, sin metas escritas | 70 |
| `aligned-plan` | Alineados con plan | Metas concretas, revisión periódica | 100 |

**Términos del glosario referenciados:** ninguno.

**Widgets del panel lateral:** ninguno.

**Tips contextuales:** ninguno.

**Máximo posible:** 100.

**Diagnósticos y tips:**

- **`householdFinancialMisalignment`** (a revisar). *Se muestra si:*
  `householdFinancialAlignment ∈ [never-talk, disagree]`.
  - Diagnóstico: "No hay un canal aceitado para hablar de plata con
    tu pareja."
  - Tip: "La falta de conversación financiera es el predictor más
    fuerte de conflicto serio en una pareja, antes que el monto
    ahorrado. Probá la conversación más simple: una vez al mes, 20
    minutos, repasar lo que entró, lo que salió y un objetivo a 90
    días."
