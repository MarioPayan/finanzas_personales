# PersonalFinancesVault

Vault que documenta la **app de diagnóstico financiero** del repo
`finanzas_personales`. Es **AI-first**: las tablas maestras de
`Cuestionario/00 - Indice` y los lineamientos están escritos para que
un agente entienda la estructura sin ejecutar la app.

> **Mayo 2026 — fase de exploración.** El Roadmap v2 cerró y está en
> `Archivo/`. La siguiente fase está en construcción: ver
> [[Investigacion/00 - Indice|Investigacion]] (recursos + propuestas de
> implementación). Cuando se decida el alcance, sale un plan nuevo.

## Por dónde empezar

1. **Investigación y propuestas (fase actual)** → [[Investigacion/00 - Indice|Investigacion]]
   Recursos de finanzas personales LatAm + propuestas de implementación
   mapeadas al formato del cuestionario. Acá se decide qué se ejecuta a
   continuación.
2. **Estructura del cuestionario** → [[Cuestionario/00 - Indice|Cuestionario]]
   Tabla maestra de los **48 nodos + ~58 insights** en 5 secciones
   (Base / Deudas / Estabilidad / Protección / Inversiones). Fuente
   de verdad: `src/content/diagnosis.ts`.
3. **Filosofía y reglas** → [[Lineamientos/00 - Indice|Lineamientos]]
   Visión, estructura de nodos, panel lateral, derivaciones,
   glosario, receta para extender, perfiles de personaje.
4. **Histórico** → [[Archivo/Indice|Archivo]]
   Planes y propuestas cerrados, README narrativo original con
   William, decisiones de rollback.

## Cómo está organizado

```
PersonalFinancesVault/
├── Welcome.md                ← acá estás
├── Investigacion/            ← fase de exploración (live)
│   ├── 00 - Indice.md
│   ├── 01 - Recursos finanzas personales LatAm.md
│   └── 02 - Propuestas de implementacion.md
├── Cuestionario/             ← documentación del quiz (live)
│   ├── 00 - Indice.md        ← entrada AI-first
│   ├── 01-05 - <categoria>.md (Base / Deudas / Estabilidad / Inversiones / Protección)
│   └── 99 - Glosario referenciado.md
├── Lineamientos/             ← filosofía y reglas (live)
│   ├── 00 - Indice.md
│   └── 01-07 - <tema>.md
└── Archivo/                  ← referencia histórica
    ├── Indice.md
    └── README original / planes y propuestas cerrados
```

## Convención sobre planes y ejecución

- Los **planes** documentan **decisiones y alcance**. Cuando cierran,
  se mueven a `Archivo/` con banner final.
- La **ejecución por paso** vive en commits (`git log --oneline`), no
  en bitácoras dentro del vault.

## Regla de oro

`src/content/diagnosis.ts` es la fuente de verdad. Si este vault y el TS
divergen, **el vault está equivocado y se corrige en la misma pasada**.
Detalle en el `CLAUDE.md` del root del repo.
