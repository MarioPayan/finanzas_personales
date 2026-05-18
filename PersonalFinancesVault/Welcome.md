# PersonalFinancesVault

Vault que documenta la **app de diagnóstico financiero** del repo
`finanzas_personales`. Es **AI-first**: las tablas maestras de
`Cuestionario/00 - Indice` y los lineamientos están escritos para que
un agente entienda la estructura sin ejecutar la app.

## Por dónde empezar

1. **Estado y plan actual** → [[Plan de Accion - Roadmap v2]]
   Hoja de ruta vigente (mayo 2026): qué está hecho (ejes A y B
   cerrados, eje C parcial: identidad mínima + micro-feedback +
   mobile-first) y qué queda pendiente (onboarding, ruta del quiz,
   carta exportable).
2. **Estructura del cuestionario** → [[Cuestionario/00 - Indice|Cuestionario]]
   Tabla maestra de los **37 nodos + 45 insights** + árbol de flujo
   completo. Fuente de verdad: `src/content/diagnosis.ts`.
3. **Filosofía y reglas** → [[Lineamientos/00 - Indice|Lineamientos]]
   Visión, estructura de nodos, panel lateral, derivaciones,
   glosario, receta para extender, perfiles de personaje.

## Cómo está organizado

```
PersonalFinancesVault/
├── Welcome.md                          ← acá estás
├── Plan de Accion - Roadmap v2.md      ← plan vigente
├── Cuestionario/                       ← documentación del quiz
│   ├── 00 - Indice.md                  ← entrada AI-first
│   ├── 01-04 - <categoria>.md          ← detalle por nodo
│   └── 99 - Glosario referenciado.md
├── Lineamientos/                       ← filosofía y reglas
│   ├── 00 - Indice.md
│   └── 01-07 - <tema>.md
└── Archivo/                            ← referencia histórica
    ├── Indice.md                       ← índice del archivo
    ├── README original.md              ← guía narrativa con William
    ├── Plan de Accion - Desarrollo v1.md
    ├── Propuesta - Modelo Ludico v1.md
    ├── Rollback - Estado minimo.md
    ├── Propuestas - Cambios desde video Algebra de Riqueza.md
    └── Plan - Stepper generico.md
```

## Convención sobre planes y ejecución

- Los **planes** en este vault documentan **decisiones y alcance**.
- La **ejecución por paso** vive en commits (`git log --oneline`), no
  en bitácoras dentro del vault.
- Cuando un plan termina su alcance completo, pasa a `Archivo/` con
  un banner que apunta al sucesor.

## Regla de oro

`src/content/diagnosis.ts` es la fuente de verdad. Si este vault y el TS
divergen, **el vault está equivocado y se corrige en la misma pasada**.
Detalle en el `CLAUDE.md` del root del repo.
