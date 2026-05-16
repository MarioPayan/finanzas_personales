# Archivo — Referencia histórica

> **Mayo 2026.** El código histórico (drawio, steps.ts, hooks, utils,
> componentes pre-rollback) fue **borrado** en el cleanup posterior al
> [[Rollback - Estado minimo|rollback]]. En esta carpeta solo queda el
> contenido editorial valioso.

## Qué hay aquí

- `README original.md` — la guía narrativa con **William** y los 3
  bloques (Deudas, Presupuestos, Inversiones). Es la fuente del
  contenido educativo original que inspiró el cuestionario actual y
  los textos de los insights.

## Qué se borró (y dónde recuperarlo)

Todo el código antiguo (`App.tsx`, `steps.ts`, `components/`, `hooks/`,
`utils/`, `scripts/drawio.xml`, `scripts/data.json`,
`scripts/xml_to_json.py`) se eliminó del repo. Si alguna pieza vuelve a
ser necesaria, está en el historial de git: `git log -- "PersonalFinancesVault/Archivo/"`
recupera los commits que lo tocaron, y `git show <sha>:<path>` saca el
archivo del momento exacto.

Lo que NO se rescata del enfoque viejo:

- El score lineal -100/100 → reemplazado por score 0-100 por sección +
  insights.
- El pipeline drawio → json → reemplazado por
  `src/content/diagnosis.ts` (TypeScript tipado).
- "William" como guía obligatoria de la app → la idea de mascota/guía
  quedó diferida (decisión del usuario en el roadmap v2).
