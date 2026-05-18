# Cómo extender

Recetas concretas. Si lo que vas a hacer no encaja en ninguna, lee primero
[[02 - Estructura de los nodos]] y [[03 - Panel lateral]].

## Agregar una pregunta nueva

1. En `src/content/diagnosis.ts`, agregar un objeto al array
   `DIAGNOSIS_QUESTIONS` con todos los campos obligatorios (`storageKey`,
   `title`, `description`, `prompt`, `category`, `type` y los específicos del
   tipo).
2. Si depende de respuestas previas, agregar `dependsOn` con cláusulas
   (`equals`, `in`, `greaterThan`, `nonEmpty`).
3. Si las opciones tienen un valor monetario derivable, agregar `derivation`
   en el nodo y `bracket` en cada opción.
4. Si el nodo introduce un término nuevo, registrarlo en `glossary.ts` y
   listarlo en `glossaryTerms`.
5. Si el nodo necesita un componente auxiliar a la derecha, listarlo en
   `sidebarWidgets`.
6. Si el paso necesita una indicación contextual (p. ej. "puedes ingresar el
   valor exacto"), agregar `tips: [...]`.
7. Si el nodo es numérico y conviene también un valor exacto, agregar
   `exactInput` (en `chips`) o usar `type: 'number'`.
8. Si la pregunta aporta al puntaje de la sección, agregarle scoring:
   - chips/multiChips/grid chip: `score: number` por opción.
   - chips con exactInput: `exactScore` (banda) si tiene sentido, o se
     deja al fallback por `bracket`.
   - toggle: `score: {whenTrue, whenFalse}`.
   - slider/number/grid number: `score: ValueScoring` (bandas).
   - Si la pregunta es informativa (sin valor positivo/negativo
     financiero), dejala sin scoring — quedará con `max = 0` y se
     descartará del cálculo. Ver [[02 - Estructura de los nodos]] para la
     mecánica completa.
9. Si el nodo justifica diagnósticos en la pantalla final, agregar
   `insights: [...]`. Cada insight tiene `id`, `diagnostic`, `tip`,
   `when` (condición declarativa) y `severity`. Las condiciones pueden
   mirar respuestas de cualquier nodo, no solo del propio. Ver
   [[02 - Estructura de los nodos]] para la lista de tipos de condición.
   Si el insight necesita un tipo de condición que no existe, hay que
   tocar **tres** lugares (TypeScript marca los dos primeros vía switch
   exhaustivo): (a) ampliar `InsightCondition` en `diagnosis.ts`, (b)
   manejar el `case` en `evaluate` y `extractReferencedKeys` de
   `src/utils/insights.ts`, (c) agregar el `case` en `renderAtom` de
   `src/views/Debug/Debug.tsx` para que la vista de debug muestre el
   nuevo tipo correctamente.
10. **Documentar el nodo en `PersonalFinancesVault/Cuestionario/`** — agregar
    una sección con la plantilla estándar (mide / cuándo se muestra / tipo /
    pregunta visible / opciones / cálculo derivado / glosario / widgets /
    tips / **puntaje** / **diagnósticos y tips** / `storageKey`) en el
    archivo de la categoría correspondiente. Esa carpeta es la fuente que
    usa un revisor financiero para verificar el cuestionario sin leer
    código.

## Agregar un tipo de pregunta nuevo

1. En `diagnosis.ts`, agregar un nuevo `*Question` a la unión
   `DiagnosisQuestion` con sus campos propios y discriminante `type`.
2. Agregar la rama de render en `DiagnosisQuestionBody.tsx` (función
   `renderBody`). El componente del input lo escribes en
   `src/components/inputs/`.
3. Agregar la rama en `formatAnswer` y `formatAnswerVerbose`. TypeScript
   marcará lo que falte.
4. Definir la política de avance del input: si la interacción es un click
   único y decisivo (como `chips` o `toggle`), el input llama a
   `ctx.commit()` (provisto por `StepRenderCtx` del Stepper) para
   disparar auto-avance. Si no hay un "fin" claro de la interacción
   (slider, escritura libre, multi-selección), no commitea y el usuario
   avanza con el botón Siguiente.
5. Si el tipo cambia el shape de `AnswerValue`, ampliar la unión en
   `diagnosis.ts` y revisar `isAnswerComplete`.
6. Documentar en [[02 - Estructura de los nodos]].

## Agregar un widget al panel lateral

1. En `diagnosis.ts`, ampliar la unión `SidebarWidgetId`.
2. En `Sidebar.tsx`, agregar un componente local para el panel y meterlo al
   render principal con la condición `widgets.has('xxx') && <Panel/>`.
3. Marcar los nodos que lo necesitan con `sidebarWidgets: ['xxx']`.
4. Documentar el widget en [[03 - Panel lateral]].

## Agregar tips a un nodo

1. En el nodo, agregar `tips: ['…']`.
2. No hacen falta cambios en código — el sidebar los renderiza
   automaticamente cuando el nodo es el actual.

## Agregar una regla de derivación

1. Ampliar `DerivationKind` en `diagnosis.ts`.
2. Manejar el nuevo `case` en `getDerivationBase` (`utils/calculations.ts`).
   Si necesita un cálculo nuevo, agregar la función ahí.
3. Documentar el nuevo `kind` en [[04 - Derivaciones y formulas]].

## Convertir una pregunta de "promedio" a "por cada uno"

Patrón que se usó para el bloque de deudas e inversiones.

1. Agregar (o reutilizar) un nodo previo que defina el conjunto:
   - `type: 'number'` para "cuántos" → fila por contador.
   - `type: 'multiChips'` para "cuáles" → fila por opción seleccionada.
2. Crear un nodo `type: 'grid'` con `rowSource` apuntando al anterior.
3. Definir la `cell` con el tipo de respuesta por fila.
4. Agregar `dependsOn` con `greaterThan: 0` (count) o `nonEmpty: true`
   (multiChips) para que la pregunta se omita si no hay filas.

## Agregar un país (salario mínimo)

1. En `src/content/minimumWages.ts`, agregar una entrada con `countryName`,
   `amount`, `currency`, `year`. El símbolo y el formato salen automaticos vía
   `Intl.NumberFormat`.
2. Si la zona horaria del país no está en `TIMEZONE_TO_COUNTRY` de
   `src/utils/detectCountry.ts`, agregarla.

## Agregar un término al glosario

1. En `src/content/glossary.ts`, agregar una entrada al mapa con `id`, `term`
   y `definition`.
2. Listar el `id` en `glossaryTerms` de los nodos donde aplica.
3. Asegurarse de que la palabra (o variante) aparece en el texto del nodo —
   si no, la regla de integridad lo va a filtrar (ver
   [[05 - Glosario y ejemplos]]).

## Después de cualquier cambio

- Verificar `npx tsc --noEmit -p tsconfig.app.json`.
- **Actualizar el lineamiento** que se haya tocado. Si no aplica ninguno,
  agregar uno nuevo y referenciarlo desde [[00 - Indice]].
