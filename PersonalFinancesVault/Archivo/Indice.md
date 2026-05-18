# Archivo — Referencia histórica

> **Mayo 2026.** Esta carpeta agrupa contenido editorial y planes que
> ya no son hoja de ruta vigente pero sirven para entender la
> genealogía del proyecto.

## Contenido editorial original

- `README original.md` — la guía narrativa con **William** y los 3
  bloques (Deudas, Presupuestos, Inversiones). Fuente del contenido
  educativo original que inspiró el cuestionario actual y los textos
  de los insights.

## Planes y propuestas pasadas

Cada doc tiene un banner "OBSOLETO" o "absorbido" al inicio, con
puntero al sucesor:

- `Plan de Accion - Desarrollo v1.md` — plan extenso (3 pirámides +
  árbol + misiones IRL + mascota Pataco). Se construyó hasta Fase 6 y
  luego se hizo rollback. Reemplazado por
  [[../Plan de Accion - Roadmap v2]].
- `Propuesta - Modelo Ludico v1.md` — propuesta original del modelo
  lúdico (5 niveles + stats múltiples + William como guía). Inspiró el
  plan v1.
- `Rollback - Estado minimo.md` — decisión de descartar lo construido
  en v1 y volver al mínimo. Punto de partida del v2.
- `Propuestas - Cambios desde video Algebra de Riqueza.md` — backlog
  de contenido derivado del video de Scott Galloway. **Absorbido en
  mayo 2026**: nodos, insights y términos están implementados en
  `diagnosis.ts`.
- `Plan - Stepper generico.md` — plan del refactor que separó el
  Stepper genérico de la lógica de diagnosis. **Completado de un
  tirón** (fases A-E todas hechas). Se conserva como referencia de
  diseño del Stepper.

## Qué se borró (y dónde recuperarlo)

El código antiguo (`App.tsx`, `steps.ts`, `components/`, `hooks/`,
`utils/`, `scripts/drawio.xml`, `scripts/data.json`,
`scripts/xml_to_json.py`) se eliminó del repo. Si alguna pieza vuelve
a ser necesaria, está en el historial de git: `git log -- <path>`
recupera los commits que lo tocaron, y `git show <sha>:<path>` saca el
archivo del momento exacto.

Lo que NO se rescata del enfoque viejo:

- El score lineal -100/100 → reemplazado por score 0-100 por sección +
  insights.
- El pipeline drawio → json → reemplazado por
  `src/content/diagnosis.ts` (TypeScript tipado).
- "William" como guía obligatoria de la app → la idea de mascota/guía
  quedó diferida (decisión del usuario en el roadmap v2).
