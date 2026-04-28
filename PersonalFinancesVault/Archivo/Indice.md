# Archivo — Originales preservados

Esta carpeta guarda el estado del proyecto **antes de la Fase 0 de la reescritura**, para no perder de vista de dónde venimos y poder rescatar contenido si algo se necesita más adelante.

## Qué hay aquí

- `README original.md` — la guía narrativa con William y los 3 bloques (Deudas, Presupuestos, Inversiones). El contenido educativo central.
- `App.tsx` — el shell de la app antes de la limpieza.
- `steps.ts` — el motor que recorría los nodos del diagrama drawio para producir tabs/preguntas.
- `components/` — los componentes originales (`AppContainer`, `ContentContainer`, `Score`, `Slide`, `Tabs`, `TabContent`).
- `hooks/` — `smoothScore` (animación del score) y `useMobile` (responsive).
- `utils/` — `colors` (gradiente del fondo según score) y `tabs` (helpers del modelo de tabs).
- `scripts/` — el pipeline drawio → json:
  - `drawio.xml` — el diagrama fuente del cuestionario.
  - `data.json` — JSON resultado de la conversión.
  - `xml_to_json.py` — script Python de conversión.

## Para qué pueden servir luego

- El **README original** es la fuente del contenido de la biblioteca y de buena parte de las misiones de las 3 pirámides.
- El **drawio + data.json** contienen las preguntas y la lógica de clasificación de deuda (mala/buena/subsistencia/ahorro), útiles cuando aterricemos las misiones del Nivel 2 de la Pirámide de Deuda.
- `useMobile` y la idea de animación con `Slide` se pueden volver a usar.
- `colors.ts` queda obsoleto (era para el score lineal -100/100) pero ilustra la idea del feedback visual cromático.

## Qué NO se rescata

- El score lineal -100/100. Reemplazado por nivel + stats.
- El pipeline drawio → json. Reemplazado por contenido tipado en TS/MDX.
- "William" como guía de la app. Reemplazado por la mascota Pataco. William sobrevive como narrador en la biblioteca.
