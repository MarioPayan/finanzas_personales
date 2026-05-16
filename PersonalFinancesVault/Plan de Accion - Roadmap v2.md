# Plan de Acción — Roadmap v2 (mayo 2026)

> Roadmap operativo para llevar la app actual (quiz de diagnóstico con 27 nodos, scoring e insights ya implementados) hacia un quiz **gamificado as fuck**, divertido de responder, con herramientas internas que den claridad total sobre la lógica.

## Antecedentes y relación con docs previos

- [[Plan de Accion - Desarrollo v1]] — versión 1.1, planteaba un modelo de **3 pirámides + árbol + misiones IRL post-quiz**. Quedó parcialmente implementada (la base técnica, los inputs low-friction, el diagnóstico) y luego el modelo evolucionó: **dejamos el componente "misiones IRL / retención semanal" y nos quedamos con un quiz one-shot de diagnóstico** que entrega scoring + insights accionables. Esta v2 reemplaza la v1 como roadmap activo.
- [[Propuesta - Modelo Ludico v1]] — filosofía lúdica original. La esencia (mascota guía, opciones-no-opiniones, inputs sin tipear) se mantiene; lo que cambia es que **el "juego" no es el seguimiento a lo largo del tiempo, es el quiz mismo**.
- [[Propuestas - Cambios desde video Algebra de Riqueza]] — backlog de contenido (6 nodos nuevos, 8 insights nuevos, 4 términos de glosario) que esta v2 absorbe como Sprint 1.
- [[Lineamientos/01 - Vision y filosofia]], [[Lineamientos/06 - Como extender]] — anclas de filosofía que el plan respeta.

---

## 0. Diagnóstico honesto del estado actual

### Lógica del quiz: sólida y consistente

- **27 nodos activos** + 4 nodos de resultado (`__sectionScore__*`, `__summary__`), distribuidos en Base (6), Deudas (6), Estabilidad (5), Inversiones (10).
- Todos los nodos tienen `prompt`, `hint`, `options`/`brackets`, `scoring`, `insights`. **Sin TODOs ni placeholders.**
- Motores (`src/utils/{scoring,insights,calculations}.ts`) cubren el 100% de los `DerivationKind` e `InsightCondition` declarados. Manejan respuestas faltantes/parciales.
- Gates (`dependsOn`) bien definidos, sin nodos huérfanos ni ciclos.
- **Conclusión**: la lógica está más cerca de "afinar" que de "construir".

### UI: spreadsheet con chips bonitos

- Funcional, accesible (ARIA labels, semántica radio), responsive (sidebar 380px desktop / column mobile).
- **Sin onboarding visible**: el usuario llega directo a la primera pregunta.
- **Sin identidad de marca**: no hay logo, mascota, ilustraciones, ícono custom. Pura skin MUI.
- **Sin animaciones de transición** entre preguntas (cambio discreto, auto-advance 250ms).
- **Sin micro-feedback** al responder: chips cambian a `filled` y nada más. Sin bounce, glow, partículas, sonidos.
- Único momento "wow": `SectionScore` (círculo grande con número + color por banda). Aparece 4 veces, estático.
- Summary final: tarjetas con dividers, insights coloreados por severidad. Informativo pero frío — sin celebración, sin carta exportable, sin plan de acción priorizado.
- `index.css`: baseline puro (system fonts, sin design tokens, sin dark mode).

### Herramientas internas: media casa

- `src/views/Debug/` ya tiene grafo gojs del cuestionario + inspector de nodo + vistas para summary/section scores.
- **Falta**:
  - Validador declarativo (lint del cuestionario).
  - Simulador de perfiles canónicos (perfil pre-cargado → resultado completo).
  - Tests de regresión de scoring contra perfiles canónicos (snapshot).
  - Inspector "live preview" en el grafo (responder un nodo desde el grafo y propagar).

### Pipeline de contenido

- Hay deuda documentada en [[Propuestas - Cambios desde video Algebra de Riqueza]]: **6 nodos nuevos**, **8 insights nuevos**, **4 términos de glosario** pendientes.

---

## 1. Principios rectores (anclados en lineamientos)

Tomados de [[Lineamientos/01 - Vision y filosofia]] y [[Lineamientos/06 - Como extender]]:

1. **Mínima fricción.** Bandas antes que precisión, defaults razonables, sin login. *Cualquier gamificación que estorbe responder rápido, fuera.*
2. **Nodos autocontenidos.** Toda la lógica vive en `diagnosis.ts` y motores, no en componentes. *La capa de juego se monta encima sin tocar el modelo.*
3. **App de diagnóstico, no libro contable.** No registramos transacciones, no proyectamos a 30 años. *La gamificación tampoco debe sugerir "save y volvé mañana" — un quiz se completa en una sentada.*
4. **Vault sincronizado.** Cualquier nodo o insight nuevo se documenta en la misma pasada (regla del `CLAUDE.md` del repo).

---

## 2. Plan en tres ejes paralelos

Los ejes se pueden adelantar en paralelo sin pisarse. La única dependencia real: ciertas fases visuales (Eje C) necesitan el contenido cerrado (Eje A).

---

### Eje A — Lógica y contenido

> *Cerrar primero. Es lo más barato y bloquea la gamificación.*

#### A1. Cerrar deuda del backlog "Algebra de Riqueza"

> **Estimado**: medio día.

- Sumar nodos: `tradingFrequency`, `householdFinancialAlignment` (+ gate `inRelationship` también nuevo), `usesIndexFunds`, `hasBudgetSystem`, `financialStressLevel`, `yearsInvesting`.
- 8 insights nuevos sobre nodos existentes (los detallados en [[Propuestas - Cambios desde video Algebra de Riqueza]]).
- 4 términos al glosario.
- **Actualizar simultáneamente** (regla del `CLAUDE.md`): archivos por categoría en `Cuestionario/`, tabla maestra en `Cuestionario/00 - Indice.md`, glosario en `Cuestionario/99 - Glosario referenciado.md`.

#### A2. Convenciones de "perfil de personaje"

> **Estimado**: medio día (contenido editorial, no código).

- Hoy el scoring es numérico por sección. Para gamificar bien, cada total debe mapear a un **perfil con nombre** (ej. "Inversor curioso", "Constructor de fortaleza", "Domador de deudas", "Equilibrista", "Apagador de incendios").
- Tabla en `diagnosis.ts` que mapea rangos de score → perfil. Documentada en `Lineamientos/` como nuevo lineamiento.
- Sin esto, la capa visual no tiene anclaje narrativo.

#### A3. Pass de copywriting al tono lúdico

> **Estimado**: 1 día.

- Revisar todos los `prompt`, `hint` e insights. Ajustar al tono **lúdico para adultos** (no infantil).
- Ejemplos:
  - Hoy: *"¿Cuánto ganás al mes, más o menos?"*
  - Después: *"Hablemos plata: ¿en qué rango cae tu ingreso mensual?"*
- Mensajes de feedback por rango ("Vas bien", "Hay margen", "Esto necesita atención") en vez de solo número.

---

### Eje B — Herramientas internas (claridad sobre el quiz)

> *Lo que pediste explícitamente. Ataca la opacidad del modelo a medida que crece.*

#### B1. Validador declarativo (lint del cuestionario)

> **Estimado**: 1 día. Vive como pestaña dentro de `/debug`.

Checks que corre y reporta:
- Insights que referencian nodos inexistentes.
- Nodos con `dependsOn` apuntando a nodos inexistentes o que vienen después en el flujo.
- Brackets/options sin scoring asignado (gaps).
- Nodos sin ningún insight (¿intencional?).
- Insights con `severity` fuera del set válido.
- Términos de glosario referenciados desde prompts pero no definidos.

Te ahorra ojo humano cada vez que tocás `diagnosis.ts`.

#### B2. Simulador de perfiles canónicos

> **Estimado**: 1-2 días. **Herramienta más alta-leverage del eje B.**

- Definir 6-10 perfiles canónicos pre-cargados, ej:
  - "Joven precarizado argentino"
  - "Asalariado clase media mexicano"
  - "Freelancer ahorrador colombiano"
  - "Rentista experimentado chileno"
  - "Estudiante con deuda educativa"
  - "Pareja con hijos clase trabajadora"
- En `/debug`: picker de perfil → rellena el quiz instantáneamente.
- Vista lado a lado: respuestas, scoring derivado, insights disparados, severidad.
- Botón "duplicar y editar": modificás una respuesta y ves qué cambia.
- Permite responder en segundos: *"si cambio el peso de X en scoring, ¿qué perfiles se ven afectados?"*

#### B3. Tests de regresión de scoring

> **Estimado**: 1 día. Cierra el loop B1 + B2 contra el código.

- Vitest + snapshot tests por cada perfil canónico de B2.
- Si tocás un nodo y cambia el resultado de un perfil sin querer, el test rompe en CI.

#### B4. Inspector "live preview" en el grafo

> **Estimado**: 1-2 días.

- Hoy el grafo de gojs es estático.
- Mejora: clickeás un nodo → ves su pregunta renderizada igual que en la app, podés responderla y propaga al resto. Nodo activo + gates abiertos se iluminan.
- Modo *"armar el quiz como product owner sin recorrerlo entero"*.

---

### Eje C — Gamificación

> *Cada paso debe aportar sin ralentizar al usuario. Capa por capa.*

#### C1. Identidad visual base

> **Estimado**: 2-3 días. **Sin esto, todo lo demás queda hueco.**

- **Design tokens centralizados** en `theme.ts` MUI: paleta, tipografía, radios, sombras, espaciado.
- Modo oscuro desde día uno (aunque arranquemos solo con claro, ya queda preparado).
- **Personaje narrador**. No necesita animación frame-by-frame: un avatar SVG con 4-5 expresiones (neutral, pensativo, celebrando, alentando, preocupado) ya da personalidad. Aparece en sidebar y transitions.
  - Decidir nombre + estética (capibara, alcancía con cara, duende verde, otro).
- Logo + favicon mínimos.

#### C2. Onboarding de 2 pantallas

> **Estimado**: 1-2 días.

- Pantalla 1: presentación del personaje + promesa (*"respondé 5 minutos, llevate tu diagnóstico"*).
- Pantalla 2: detección de país (función ya existe, hoy es silenciosa) → *"te detecté en Argentina, ¿correcto?"* con override.
- Siembra el sentimiento *"esto sabe de mí"* desde el primer touch.

#### C3. Micro-feedback en cada respuesta

> **Estimado**: 2-3 días.

- Chip seleccionado: micro-bounce + glow + check icon que aparece.
- **"+X pts" flotante** que vuela hacia el SectionScore mini-card del sidebar al responder cada nodo. *El dopamine hit clásico de quiz.*
- Sonidos sutiles **opt-in con toggle** (click, ding, fanfare al cerrar sección).
- Transición entre preguntas: **slide horizontal** (no fade — slide simula "avanzar", como un platformer).

#### C4. Progreso emocional, no lineal

> **Estimado**: 3-4 días.

- Reemplazar la barra de progreso lineal por una **ruta del quiz**: 4 estaciones (Base, Deudas, Estabilidad, Inversiones) tipo mapa. Cada nodo es un punto en la ruta. El personaje "camina" por la ruta a medida que respondés.
- Animación en `SectionScore`: contador que sube de 0 al score real, badge ganado con flip-card.
- "Skip back" sin perder respuestas — hoy ya se puede pero se siente neutro; premiarlo visualmente.

#### C5. Pantalla final con wow factor

> **Estimado**: 3-4 días. **Palanca de viralidad.**

- Score total con animación de partículas y conteo.
- **"Tu perfil financiero" como carta tipo Pokémon/RPG**: nombre del perfil (de A2), rangos por categoría como barras de stats, 3-4 badges ganados, dato curioso (*"estás mejor que el 60% en tu rango"*).
- Plan de acción priorizado: top 3 acciones derivadas de los insights más severos, accionables esta semana.
- **Exportable a PNG para compartir** (canvas API). *Si la carta se ve bien, la gente la postea.*

#### C6. Mobile-first review

> **Estimado**: 2 días.

- En mobile el sidebar hoy se esconde. Reemplazarlo por una **pestaña inferior** con tabs (árbol / glosario / tips / widgets).
- Asegurar que la "ruta del quiz" funcione en mobile (scroll horizontal con snap).
- Revisar contraste y hit areas para pulgares.

---

## 3. Orden propuesto por sprints

```
Sprint 1 (semana 1): A1 + A2 + B1 + B3
  → Contenido cerrado + validador y tests. Base firme.

Sprint 2 (semana 2): A3 + B2 + C1
  → Copywriting + simulador de perfiles + identidad visual.
  Acá ya tenés "todo listo para empezar a verse divertido".

Sprint 3 (semana 3): C2 + C3
  → Onboarding + micro-feedback. Primera versión que se siente quiz.

Sprint 4 (semana 4): C4 + B4
  → Ruta visual + inspector live. La app empieza a sentirse juego.

Sprint 5 (semana 5): C5
  → Pantalla final + carta exportable. Momento "compartible".

Sprint 6: C6 + polish + telemetría básica.
```

---

## 4. Decisiones que necesitamos antes de arrancar

1. **¿Cuál es el orden real?**
   - Cerrar lógica antes de gamificación → Sprint 1 + 2 sin tocar UI más allá de tokens.
   - Mostrar progreso visual rápido para alguien → mini-sprint 0 de identidad + onboarding antes de cerrar contenido.
2. **El personaje narrador.** ¿Tenés algo en mente (estética, nombre, animal/objeto)? Si no, propongo 3-4 direcciones con sketches descriptivos antes de comprometerme.
3. **¿Modo dark desde día uno o solo claro?** Suma poco esfuerzo si lo planifico desde C1, mucho si lo retrofiteo después.
4. **¿Querés telemetría?** Sin telemetría, los "datos comparativos" en la carta final son estimaciones desde perfiles canónicos. Con telemetría (Plausible o similar, sin PII), son reales. Cambia C5.
5. **Alcance del Debug.** ¿Solo para vos, o vista pública con autenticación simple? Cambia C5 también (la carta puede vivir bajo un usuario, no solo en localStorage).
## 4.1 Respuestas

1. 
	1. Intentemos no complicarnos con la interfaz, la idea es que la interfaz nos de una idea clara de lo que se quiere lograr, pero el core es que la lógica de la aplicación cumpla con todo lo demás
	2. Me gusta el mini sprint 0 de identidad
2. No sé si el narrador tenga sentido, pero si sí, te dejo escoger los detalles
3. Estamos en solo claro de momento porque estamos enfocados en la lógica
4. Sin telemetría, aún estamos refinando la lógica
5. El debug es solo para mí, sin embargo, esta app solo vive en local, así que de momento está bien tenerlo accesible

---

## 5. Próxima acción concreta

Cuando demos el OK, **Sprint 1**:

1. Implementar A1 nodo por nodo, actualizando vault en cada uno (regla `CLAUDE.md`).
2. Esbozar A2 — tabla de perfiles propuesta para validar antes de codificar.
3. Pasada B1 — validador como pestaña en `/debug`.
4. Definir perfiles canónicos para B3 (no implementar B2 todavía, solo definir los perfiles).

> Marcá con `?` o tachá lo que no te cuadre y ajustamos antes de arrancar.

---

## 6. Bitácora de ejecución

### Sprint 1+ (mayo 2026)

Hecho de un tirón después de las respuestas de §4.1 (foco en lógica,
mini-sprint 0 de identidad, sin telemetría, sin dark, debug accesible).

- **A1 — Backlog "Algebra de Riqueza" cerrado.** 7 nodos nuevos
  (`hasBudgetSystem`, `financialStressLevel`, `inRelationship`,
  `householdFinancialAlignment`, `yearsInvesting`, `tradingFrequency`,
  `usesIndexFunds`), 10 insights nuevos, 4 términos de glosario.
  Vault sincronizado en la misma pasada (índice, archivos por
  categoría, glosario, marca de absorción en Propuestas). Totales:
  26 → 33 nodos, 35 → 45 insights.
- **A2 — Perfiles de personaje.** Tabla en `src/content/profiles.ts`
  con 5 perfiles por sección y un perfil global por "cuello de
  botella". Lineamiento nuevo: [[Lineamientos/07 - Perfiles de personaje]].
- **B1 — Validador declarativo.** `src/utils/validator.ts` corre 7
  tipos de check sobre `diagnosis.ts` + `glossary.ts`. Pestaña
  "Validador" en `/debug`.
- **B2 — Simulador de perfiles canónicos.** Pestaña "Simulador" en
  `/debug` con picker de perfil, scores por sección, perfil global,
  insights disparados y respuestas. (Versión 1: solo lectura — la
  duplicación-y-edición queda para más adelante.)
- **B3 — Tests de regresión.** Vitest + snapshot tests sobre los 6
  perfiles canónicos definidos en `src/content/canonicalProfiles.ts`.
  `pnpm test` corre y queda lista la base de CI.
- **Mini identidad.** `src/theme.ts` con paleta teal + tipografía
  system + radios consistentes. ThemeProvider en `App.tsx`. Sin
  mascota, sin dark mode (postergados explícitamente).
- **Consolidación del vault.** Welcome.md reescrito como índice
  vigente, Plan v1 / Propuesta v1 / Rollback marcados como obsoletos
  con punteros a v2, Raw plan.md borrado, Archivo/Indice.md
  actualizado (ya no había código histórico que indexar).

### Diferido / no ejecutado en este sprint

- **A3 — Pass de copywriting al tono lúdico.** Decidido posponer:
  cuando lleguemos a la capa de gamificación visual conviene
  reescribir copy y diseño juntos.
- **B4 — Inspector live preview en el grafo.** El simulador (B2) ya
  cubre el caso de uso principal; B4 sería un nice-to-have.
- **Eje C completo (C2-C6).** Onboarding, micro-feedback, ruta visual,
  pantalla final wow, mobile-first review. Foco en lógica primero
  (decisión del usuario).

