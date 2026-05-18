# PersonalFinancesVault

Vault que documenta la **app de diagnóstico financiero** del repo
`finanzas_personales`. Es **AI-first**: las tablas maestras de
`Cuestionario/00 - Indice` y los lineamientos están escritos para que
un agente entienda la estructura sin ejecutar la app.

> **Mayo 2026 — sin plan activo.** El Roadmap v2 cerró su alcance y
> está en `Archivo/`. El proyecto entra en una siguiente fase que
> redefinirá prioridades; cuando empiece, vivirá como nuevo doc en
> esta carpeta. Mientras tanto, sólo Cuestionario y Lineamientos
> son docs vivos.

## Por dónde empezar

1. **Estructura del cuestionario** → [[Cuestionario/00 - Indice|Cuestionario]]
   Tabla maestra de los **37 nodos + 45 insights** + árbol de flujo
   completo. Fuente de verdad: `src/content/diagnosis.ts`.
2. **Filosofía y reglas** → [[Lineamientos/00 - Indice|Lineamientos]]
   Visión, estructura de nodos, panel lateral, derivaciones,
   glosario, receta para extender, perfiles de personaje.
3. **Histórico** → [[Archivo/Indice|Archivo]]
   Planes y propuestas cerrados, README narrativo original con
   William, decisiones de rollback.

## Cómo está organizado

```
PersonalFinancesVault/
├── Welcome.md                ← acá estás
├── Cuestionario/             ← documentación del quiz (live)
│   ├── 00 - Indice.md        ← entrada AI-first
│   ├── 01-04 - <categoria>.md
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
