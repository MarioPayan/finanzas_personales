# Finanzas Personales

Una app para entender dónde estás parado en tu salud financiera y qué hacer ahora — no en general, sino tú, hoy.

Tres pirámides (Deuda, Estabilidad, Inversión) que confluyen en un árbol. Diagnóstico corto, misiones concretas, mascota acompañante. Sin servidor, sin cuentas, sin recolectar nada — todo vive en tu navegador.

## Probar localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm test` — corre la suite de tests con Vitest
- `npm run typecheck` — chequeo estricto de TypeScript
- `npm run build` — build de producción
- `npm run preview` — sirve el build de producción localmente

## Estructura

```
src/
  content/             contenido declarativo (misiones, biblioteca, eventos, achievements)
  engine/              motor puro: leveling, stats, gating, currency, events, rewards
  state/               store Zustand persistido en localStorage
  views/               pantallas (Onboarding, Diagnosis, Tree, Pyramid, Mission, Profile, Settings, Event)
  components/          componentes reutilizables (Mascot, TreeArt, OptionsPanel, inputs)
  types/               tipos centrales del dominio
  theme/               theme MUI
PersonalFinancesVault/
  documentos de planeación + archivo del proyecto original
```

## Diseño

- **Patacoin** = unidad de moneda local del usuario, 1:1 con su moneda real (un peso es un patacoin).
- **País y SMM** se infieren del navegador con `Intl.Locale`. Tabla de SMM por país en `src/content/smm.ts`, ajustable en Ajustes.
- **Tres pirámides de 5 niveles** con misiones cortas, accionables y verificables por el usuario (no por la app).
- **Filosofía de inputs**: chips, sliders y toggles antes que tipear cifras. El diagnóstico se completa en menos de 3 minutos sin teclear ningún número.
- **Filosofía de contenido**: opciones, no opiniones. Donde hay decisión, mostramos tradeoffs.
- **Sin servidor, sin auth**: persistencia local; export/import a JSON desde Ajustes.

## Estado del proyecto

App funcional que cubre las Fases 0 a 6 del plan en `PersonalFinancesVault/Plan de Accion - Desarrollo v1.md`. PWA instalable con caché offline básico.

Pendiente (Fase 7, iteración con feedback): telemetría opt-in, ampliar tabla de SMM con países adicionales, ajustar contenido de misiones según uso real, considerar monetización.

## Créditos

El contenido educativo de la biblioteca y la voz de William vienen del README original de este proyecto, conservado en `PersonalFinancesVault/Archivo/`.
