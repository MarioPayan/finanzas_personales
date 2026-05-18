# Rollback — Estado mínimo (cuestionario + resumen)

> **Documento histórico (mayo 2026).** Registra la decisión de
> descartar lo construido en [[Plan de Accion - Desarrollo v1]] y
> volver al mínimo. Este rollback es el **punto de partida** desde el
> cual se construye [[Plan de Accion - Roadmap v2]] (que ya superó este
> "estado mínimo": agregó motor de scoring, insights, vista Debug,
> validador, simulador, etc.).
>
> Se conserva porque explica de dónde viene la arquitectura actual
> ("nodos fuertes", quiz one-shot, sin persistencia, sin mascota).

> Decisión tomada después de tener implementadas las Fases 0-6 del plan: **rehacer todo desde un estado mínimo**. La app se reduce al cuestionario y una pantalla de resumen final con las respuestas. Todo lo demás (motor, persistencia, pirámides, árbol, mascota, eventos, logros, biblioteca, PWA) se elimina del código pero queda documentado.

---

## Qué quedó en el código

- **El cuestionario** (`src/content/diagnosis.ts`): preguntas tipadas, dependencias entre preguntas, opciones.
- **Componentes de input low-friction** (`src/components/inputs/`): `ChipGroup`, `RangeSlider`, `Toggle`.
- **View de diagnóstico** (`src/views/Diagnosis/Diagnosis.tsx`): recorrido podado, auto-avance, y al finalizar muestra una pantalla de **resumen con las respuestas** del usuario.
- Stack: React + Vite + TypeScript + MUI. Persistencia: ninguna (las respuestas viven en memoria mientras la sesión está abierta).

## Qué se quitó del código

| Bloque | Estado |
| ------ | ------ |
| Motor (`engine/leveling`, `stats`, `gating`, `currency`, `events`, `rewards`, `nextMission`) | Borrado |
| Store Zustand persistido (`state/profile`, `state/importExport`) | Borrado |
| Tipos del dominio extendido (`types/index.ts`) | Reducido a tipos del cuestionario |
| Mascota Pataco (`components/Mascot`, `content/mascotLines`) | Borrado |
| Árbol SVG (`components/Tree/TreeArt`) | Borrado |
| OptionsPanel y "opciones, no opiniones" | Borrado |
| Pirámides (Deuda, Estabilidad, Inversión) y misiones | Borrado |
| Biblioteca (`content/library/*`) | Borrado |
| Eventos aleatorios, logros, inventario, rachas | Borrado |
| Views: Tree, Pyramid, Mission, Profile, Settings, Event, Onboarding | Borrado |
| Theme MUI personalizado | Borrado |
| PWA (manifest, service worker, iconos personalizados) | Borrado |
| Tests del motor y del store | Borrado |
| Tabla SMM por país | Borrado |
| Carpeta `src/legacy/` | Borrado |

## Por qué

El usuario decidió que el alcance se redujera. La razón explícita: empezar de nuevo desde una base mínima funcional, en lugar de iterar sobre un sistema ya complejo. La idea es construir desde aquí lo que realmente sirva.

## Dónde encontrar lo borrado si lo necesitamos de vuelta

- **Git history**: las Fases 0-6 vivieron en commits. El historial de `git log` y `git show` recupera cualquier archivo borrado.
- **`PersonalFinancesVault/Archivo/`**: contiene el README y código original previos a la Fase 0 (drawio, steps.ts, components/hooks/utils antiguos). Ese archivo sigue intacto.
- **`PersonalFinancesVault/Plan de Accion - Desarrollo v1.md`**: el plan de las 7 fases queda como documento de referencia para la siguiente iteración.
- **`PersonalFinancesVault/Propuesta - Modelo Ludico v1.md`**: la propuesta original con las 3 pirámides + árbol.
- **`PersonalFinancesVault/Raw plan.md`**: las anotaciones que dieron pie a los cambios.

## Dependencias

Se quitaron del `package.json`:
- `zustand` (no hay store)
- `framer-motion` (no hay animaciones)
- `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/*` (no hay tests)

Las que quedan están actualizadas a su última versión:
- React, ReactDOM
- Vite, @vitejs/plugin-react
- TypeScript
- MUI (`@mui/material`, `@emotion/*`)
- ESLint y plugins
- Prettier

## Estado final

App de una sola pantalla:
1. Carga directo en la primera pregunta del cuestionario.
2. El usuario responde (chips/sliders/toggles, sin teclear cifras).
3. Al final ve un resumen formateado de sus respuestas.
4. Puede reiniciar y empezar de nuevo.

Nada se persiste, nada se manda a un servidor, nada se interpreta.
