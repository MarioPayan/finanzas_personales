# Panel lateral

El sidebar (`src/views/Diagnosis/Sidebar.tsx`) compone paneles
independientes. Cada uno decide su propia visibilidad a partir de las
respuestas y de la pregunta actual.

## Cómo se monta según viewport

- **Desktop (md+)**: `Sidebar` se renderiza como columna permanente a la
  derecha del Stepper (`renderSidebar` en `Diagnosis.tsx`).
- **Mobile (xs/sm)**: la columna permanente se oculta. El mismo `Sidebar`
  se monta dentro de `DiagnosisInfoDrawer` (FAB izquierdo, drawer
  desde la izquierda con glosario, tips y widgets). El árbol de
  decisiones se sirve aparte vía `DiagnosisTreeDrawer` (FAB derecho).
- El árbol de decisiones (panel `TreePanel`) se exporta independiente
  porque lo consume el drawer mobile; los demás paneles viven dentro
  del `Sidebar` default.

## Reglas generales

- El cuestionario queda **limpio**. Información de contexto
  (referencias monetarias, definiciones, sugerencias, categorías) vive
  en los paneles.
- Cada panel es un componente local de `Sidebar.tsx`. Si crece o se reusa, se
  saca a su propio archivo (como ya pasó con `TreePanel`).
- Cada panel define sus propias condiciones de visibilidad. El sidebar solo
  los apila en orden.

## Panel: Árbol de decisiones (siempre visible)

Muestra todos los nodos agrupados por categoría con marcas de estado.

| Estado     | Marca | Cuándo                                                                |
| ---------- | ----- | --------------------------------------------------------------------- |
| `current`  | ►     | El nodo es el que se está respondiendo ahora.                         |
| `answered` | ✓     | Ya hay respuesta guardada.                                            |
| `pending`  | ○     | Aún no se respondió y aplica.                                         |
| `skipped`  | –     | Alguna cláusula `dependsOn` se respondió y este nodo no la cumple, o un grid se quedó sin filas. |

El árbol usa el `title` del nodo (no el `prompt`) y se construye usando la
**primera cláusula** de `dependsOn` como padre visual. Si un nodo tiene
varias cláusulas, las demás siguen siendo parte del predicado de
aplicabilidad pero no afectan el ordenamiento del árbol.

## Panel: Glosario

Visible cuando hay al menos una entrada relevante. Reglas en
[[05 - Glosario y ejemplos]].

## Panel: Sugerencias (Tips)

Visible solo mientras el nodo actual tiene `tips` no vacíos. Cada tip se
renderiza como una viñeta. Se ocultan al avanzar al siguiente nodo — son
contextuales del paso, no del recorrido.

## Panel: Widgets condicionales

Cada widget se identifica con un `SidebarWidgetId` (unión en
`diagnosis.ts`). Un nodo lo activa al listarlo en `sidebarWidgets`. El sidebar
calcula el conjunto activo recorriendo las preguntas relevantes
(respondidas + actual) y mostrando los widgets que aparezcan en alguna.

### Widgets registrados

| Id                 | Cuándo se muestra                                                                      | Qué muestra                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `minimumWage`      | Hay un nodo activo con `sidebarWidgets: ['minimumWage']` Y se detectó país.            | Salario mínimo del país detectado, año y moneda local.                                            |
| `creditScoreScale` | Hay un nodo activo con `sidebarWidgets: ['creditScoreScale']`.                         | Tabla de rangos del score crediticio del país detectado (de `creditScoreBands.ts`); fallback informativo si no hay buró conocido. |

## Cómo agregar un widget nuevo

Ver [[06 - Como extender]].
