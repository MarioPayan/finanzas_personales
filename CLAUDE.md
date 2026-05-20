# Instrucciones del proyecto — finanzas_personales

> Esta aplicación es **AI-first**: la documentación está pensada para que un
> agente pueda entender la estructura del diagnóstico, gates, scoring e
> insights sin tener que ejecutar la app ni leer prosa larga. Si encontrás
> algo que no se puede responder consultando este archivo + el índice del
> cuestionario + los archivos en `src/content/`, **es un bug de
> documentación** — anotarlo y corregirlo en la misma pasada.

## Arquitectura de contenido (importante)

El contenido del cuestionario y de los datos de soporte está **separado
del código**:

- **Datos puros** (preguntas, opciones, scoring, insights, perfiles,
  glosario, benchmarks, salarios mínimos): viven en JSON bajo
  `src/content/data/`. Esto es lo que se edita para cambiar copy, sumar
  un insight, ajustar un bracket, agregar un perfil, etc.
- **Shape (validación + tipos)**: vive en `src/content/schemas/` como
  schemas zod. Los tipos TS se derivan vía `z.infer<>`.
- **Helpers e interpretadores**: viven en `src/content/*.ts` (cargadores
  + helpers) y `src/utils/*.ts` (insights, scoring, calculations,
  validator). No tienen contenido hardcodeado.

Cada `src/content/*.ts` importa su JSON, lo valida con su schema en dev
(`import.meta.env.DEV`) o lo castea en prod (ya validado en
`prebuild`), y expone los helpers existentes.

### Validación

```sh
pnpm validate:content
```

Corre `scripts/validate-content.ts` que parsea cada JSON con su schema
y falla con código ≠0 al primer error. Está enganchado a `prebuild` y
`pretest`, así que `pnpm build` y `pnpm test` lo gatillan
automáticamente.

## Puntos de entrada (en este orden)

1. **`src/content/schemas/`** — fuente de verdad del **shape** del
   contenido. Tipos públicos (`DiagnosisQuestion`, `InsightCondition`,
   `ProfileBand`, etc.) se derivan acá. Si el shape de un nodo cambia,
   el schema cambia y los JSONs tienen que reflejarlo.
2. **`src/content/data/diagnosis/<categoryId>.json`** — los 26 nodos del
   cuestionario, splitteados por categoría
   (`profile / income / expenses / habits / debt / stability /
   protection / investment`). Cualquier afirmación sobre el
   comportamiento del diagnóstico se valida acá + en `schemas/`.
3. **`PersonalFinancesVault/Cuestionario/00 - Indice.md`** — vista
   AI-first del cuestionario. Contiene la **tabla maestra de nodos** y
   la **tabla maestra de insights**, el árbol de flujo completo con
   gates, los nodos de resultado y las convenciones de scoring.
   Empezar acá para preguntas estructurales antes de abrir los
   archivos por categoría.
4. **`PersonalFinancesVault/Lineamientos/`** — filosofía, panel
   lateral, derivaciones y cómo extender. Leer antes de cualquier
   cambio que toque la estructura, los nodos o las convenciones de UI.
5. **`PersonalFinancesVault/Cuestionario/01-04 - *.md`** — detalle por
   nodo (texto literal de prompt/hint, sublabels, scoring desglosado,
   insights completos). Abrir cuando hace falta el contenido legible
   por un revisor financiero, no para preguntas estructurales.
6. **`src/content/diagnosis.ts`** — solo cuando hace falta entender un
   interpretador (`isQuestionApplicable`, `cleanOrphanAnswers`,
   `getGridRows`, `formatAnswerVerbose`) o las constantes que viven en
   TS (`CATEGORIES`, `CATEGORY_ORDER`, `FOUNDATION_CATEGORIES`,
   `SECTION_SCORE_NODES`). El contenido en sí está en los JSONs.

## Reglas de consistencia (no negociables)

- **JSON + schema mandan.** Si los `.json` en `data/` o los schemas
  divergen de la doc, la doc está equivocada. Corregir la doc en la
  misma pasada.
- **Cualquier cambio al contenido** (texto de un prompt, opciones,
  brackets, gates, derivaciones, insights, score) se hace **editando
  el JSON correspondiente en `src/content/data/`** y corriendo
  `pnpm validate:content`. NO se editan inline literales en los `.ts`
  — los `.ts` solo importan los JSONs.
- **Cualquier cambio al shape** (nuevo `kind` de `InsightCondition`,
  nuevo tipo de pregunta, nuevo campo opcional en `ChipOption`, etc.)
  exige actualizar el schema en `src/content/schemas/` y validar.
- Cualquier cambio (contenido o shape) **exige actualizar en la misma
  pasada**:
  - el archivo de categoría correspondiente en `Cuestionario/`
    (`01 - Base...`, `02 - Deudas`, `03 - Estabilidad`,
    `04 - Inversiones`),
  - la tabla maestra de nodos y/o de insights en
    `Cuestionario/00 - Indice.md`,
  - el glosario en `Cuestionario/99 - Glosario referenciado.md` si
    suma o cambia un término,
  - el lineamiento correspondiente en `Lineamientos/` si introduce un
    patrón nuevo (tipo de input, derivación, convención de UI).
- Si un cambio no encaja en ningún lineamiento existente, agregar uno
  nuevo y referenciarlo desde `Lineamientos/00 - Indice.md`.
- Los archivos por categoría son la versión legible por humanos; el
  índice, los JSONs y los schemas son la versión legible por la IA.
  Las cuatro fuentes tienen que estar alineadas.

## Cómo trabajar con cambios al cuestionario

Receta concreta para extender o modificar nodos:
`PersonalFinancesVault/Lineamientos/06 - Como extender.md`.

Para tareas exploratorias o de scoping (ej. "¿este insight ya existe?",
"¿qué nodos hay en Inversiones?", "¿cuál es el gate de X?") basta con
las tablas maestras del índice. No es necesario abrir los JSONs salvo
para verificar la fuente o para implementar el cambio.

## Notas operativas

- Vite hace **full-reload** ante cambios en `.json` (no HMR caliente).
  Editar copy en un nodo del cuestionario reinicia el estado de la
  sesión en dev — guardar la respuesta antes si se necesita.
- El bundle inline incluye los JSONs (~120KB total). No hay
  code-splitting automático por categoría; si crece más, considerar
  `import()` dinámico por categoría.
- En CI/CD, `prebuild` ya gatilla `validate:content` antes de
  `tsc -b && vite build`. No hace falta agregar un step separado.
