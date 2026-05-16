# Instrucciones del proyecto — finanzas_personales

> Esta aplicación es **AI-first**: la documentación está pensada para que un
> agente pueda entender la estructura del diagnóstico, gates, scoring e
> insights sin tener que ejecutar la app ni leer prosa larga. Si encontrás
> algo que no se puede responder consultando este archivo + el índice del
> cuestionario + `diagnosis.ts`, **es un bug de documentación** — anotarlo
> y corregirlo en la misma pasada.

## Puntos de entrada (en este orden)

1. **`src/content/diagnosis.ts`** — fuente de verdad estructural.
   Define los 26 nodos del cuestionario, gates (`dependsOn`),
   derivaciones, scoring e insights. Cualquier afirmación sobre el
   comportamiento del diagnóstico se valida acá.
2. **`PersonalFinancesVault/Cuestionario/00 - Indice.md`** — vista
   AI-first del cuestionario. Contiene la **tabla maestra de nodos** y
   la **tabla maestra de insights**, el árbol de flujo completo con
   gates, los nodos de resultado y las convenciones de scoring.
   Empezar acá para preguntas estructurales antes de abrir los
   archivos por categoría.
3. **`PersonalFinancesVault/Lineamientos/`** — filosofía, panel
   lateral, derivaciones y cómo extender. Leer antes de cualquier
   cambio que toque la estructura, los nodos o las convenciones de UI.
4. **`PersonalFinancesVault/Cuestionario/01-04 - *.md`** — detalle por
   nodo (texto literal de prompt/hint, sublabels, scoring desglosado,
   insights completos). Abrir cuando hace falta el contenido legible
   por un revisor financiero, no para preguntas estructurales.

## Reglas de consistencia (no negociables)

- **`diagnosis.ts` manda.** Si el TS y la doc divergen, la doc está
  equivocada. Corregir la doc en la misma pasada.
- **Cualquier cambio en `diagnosis.ts`** (nodo nuevo, prompt, opciones,
  brackets, gates, derivaciones, insights) **exige actualizar en la
  misma pasada**:
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
  índice y el TS son la versión legible por la IA. Las tres tienen que
  estar alineadas.

## Cómo trabajar con cambios al cuestionario

Receta concreta para extender o modificar nodos:
`PersonalFinancesVault/Lineamientos/06 - Como extender.md`.

Para tareas exploratorias o de scoping (ej. "¿este insight ya existe?",
"¿qué nodos hay en Inversiones?", "¿cuál es el gate de X?") basta con
las tablas maestras del índice. No es necesario abrir
`diagnosis.ts` salvo para verificar la fuente o para implementar el
cambio.
