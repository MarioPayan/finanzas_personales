# Perfiles de personaje

Cada bloque del diagnóstico mapea el puntaje de su sección a un **perfil
con personalidad**: un nombre y una descripción que reemplazan al número
en las pantallas finales. Es la capa que vuelve gamificable el scoring
sin tocar la lógica que lo produce.

> Fuente de verdad del contenido: `src/content/data/foundationProfiles.json` y `src/content/data/sectionProfiles.json` (validados por `src/content/schemas/profiles.ts`; helpers en `src/content/profiles.ts`).

---

## Por qué perfiles

Un puntaje de 47/100 informa pero no engancha. Un perfil
("Equilibrista", "En modo supervivencia", "Inversor activo") engancha,
se recuerda y se comparte. La lógica subyacente sigue siendo numérica
para que sea testeable y refinable; los perfiles son el envoltorio
narrativo.

Reglas:

1. **El perfil no reemplaza al score, lo acompaña.** En las pantallas
   intersticiales y en la pantalla final se ve el número y el perfil
   juntos.
2. **El perfil no juzga.** Las palabras son descriptivas, no morales.
   "En modo supervivencia" es un estado, no un fracaso.
3. **El nombre del perfil es estable mientras el score no cambia de
   banda.** Cinco bandas por sección (`[0,20)`, `[20,40)`, `[40,60)`,
   `[60,80)`, `[80,100]`) alineadas con las `toneBands` de
   `__sectionScore__`.

---

## Bandas por sección

Cada `DiagnosisCategoryId` tiene 5 perfiles definidos en
`SECTION_PROFILES`:

### Base · `base`

| Banda      | Perfil                | Lectura                                          |
| ---------- | --------------------- | ------------------------------------------------ |
| `[0,20)`   | En modo supervivencia | El ingreso no alcanza ni los obligatorios.       |
| `[20,40)`  | Apretado              | Llega justo, sin margen.                         |
| `[40,60)`  | Equilibrista          | Balance sin colchón.                             |
| `[60,80)`  | Con margen            | Diferencia clara entre ingreso y gasto.          |
| `[80,100]` | Cómodo                | Base sólida, energía libre para optimizar.       |

### Deudas · `debt`

| Banda      | Perfil                |
| ---------- | --------------------- |
| `[0,20)`   | Atrapado en la deuda  |
| `[20,40)`  | Bajo presión de deuda |
| `[40,60)`  | Manejando la deuda    |
| `[60,80)`  | Casi sin lastre       |
| `[80,100]` | Sin lastre            |

### Estabilidad · `stability`

| Banda      | Perfil                  |
| ---------- | ----------------------- |
| `[0,20)`   | Sin red                 |
| `[20,40)`  | Construyendo el colchón |
| `[40,60)`  | Resiliencia parcial     |
| `[60,80)`  | Bien protegido          |
| `[80,100]` | Fortaleza               |

### Inversiones · `investment`

| Banda      | Perfil                 |
| ---------- | ---------------------- |
| `[0,20)`   | Sin inversión          |
| `[20,40)`  | Curioso del mercado    |
| `[40,60)`  | Inversor en formación  |
| `[60,80)`  | Inversor activo        |
| `[80,100]` | Inversor maduro        |

Las descripciones largas viven en el TS — están escritas para leerse en
la pantalla final, no para resumir acá.

---

## Perfil global (composite)

`getOverallProfile(sectionScores)` resuelve un **único** perfil que
representa al usuario en su totalidad. Lógica:

1. Si **todas** las secciones superan un umbral cómodo (`70` por
   defecto), el perfil es "Equilibrado".
2. Si no, el perfil global es el de la sección con peor puntaje.

Razón: el quiz busca decirle al usuario **qué hacer ahora**. Su sección
más débil es la palanca con mejor relación esfuerzo/beneficio — atacarla
sube el promedio total más rápido que pulir la fortaleza.

---

## Cómo extender

Si el scoring cambia (rebalanceo de bandas, nodos nuevos), los perfiles
existentes **no** tienen que renombrarse — son resilientes a cambios de
peso. Solo se actualizan si:

- Se agrega una nueva categoría (`DiagnosisCategoryId`).
- Las bandas de toneBand del `__sectionScore__` cambian (5 → 4 o 6).
- Una palabra envejece mal según feedback de usuarios.

En esos casos: editar `src/content/data/sectionProfiles.json` (o `foundationProfiles.json`) y reflejar en este
archivo. Los perfiles son contenido editorial — no requieren cambios en
motores de scoring.

---

## Relación con [[Plan de Accion - Roadmap v2]]

Este lineamiento materializa el ítem **A2 — Convenciones de "perfil de
personaje"** del roadmap. La capa visual posterior (carta tipo
Pokémon/RPG en la pantalla final — ítem C5) consume estos perfiles como
ancla narrativa.
