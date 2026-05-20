# Glosario y ejemplos

## Glosario

Vive en `src/content/data/glossary.json` como un mapa `id → entrada` (cargado y validado por `src/content/glossary.ts`). Cada entrada
tiene `term` y `definition` — sin ejemplos, sin variantes.

### Cómo se decide qué mostrar

Un nodo declara `glossaryTerms: [...]` con los ids relevantes. El sidebar:

1. Toma todos los nodos activos (current + respondidos) y une sus `glossaryTerms`.
2. Construye un "haystack" con todo el texto visible de esos nodos
   (`prompt`, `hint`, opciones: `label`, `sublabel`, `examples`, y labels de
   `toggle`).
3. **Filtra:** solo entran las entradas cuyo `term` aparece literalmente en
   el haystack (comparación normalizada: `lowercase` + sin diacríticos).

El efecto: si un nodo lista `'diversificacion'` en `glossaryTerms` pero la
palabra "Diversificación" no aparece en su texto, la entrada **no se
muestra**. Es una regla de integridad: no se define lo que no se mencionó.

### Qué hacer si una entrada se filtra y quieres que aparezca

Dos caminos:

- Cambiar el `term` en `glossary.json` para que coincida con lo que sí aparece
  en el texto (p. ej. `term: 'inversión'` en vez de `'Diversificación'`).
- Editar el nodo para que el texto incluya el término (en `prompt`, `hint`,
  `label`, `sublabel` o `examples`).

## Ejemplos

### Dónde viven

- **Dentro de cada `ChipOption`**, en el campo `examples`. Punto.
- **No** existen ejemplos a nivel del nodo. No hay campo `examples` en
  `BaseQuestion`.
- **No** hay panel separado que liste ejemplos agrupados por opción.

### Cómo se muestran

En la opción correspondiente, dentro del chip, debajo del `sublabel`, como
texto pequeño (`caption`/`text.disabled`) separado por ` · `.

En el render tabular del `grid` (matriz fila × opción en desktop), los
ejemplos no caben inline. Pasan a tooltip sobre el header de la columna,
señalizado con un texto "ejemplos" en gris claro debajo del sublabel.

### Cuándo agregar ejemplos

Cuando la diferencia entre opciones no es evidente solo con `label` y
`sublabel`. Ejemplo: en "Tasa de interés / Alta", el sublabel "25–50% EA"
puede no significar nada para alguien sin contexto; el ejemplo "Tarjeta de
crédito" lo aterriza.

### Cuándo NO agregar ejemplos

Cuando el `sublabel` ya conduce sin ambigüedad. Ejemplo: en "Tipo de deuda /
Una inversión" el sublabel `p. ej. local, negocio` es suficiente; agregar una
lista larga de ejemplos sería ruido redundante.
