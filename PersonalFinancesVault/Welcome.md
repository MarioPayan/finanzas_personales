# PersonalFinancesVault

Vault que documenta la **app de diagnóstico financiero** del repo
`finanzas_personales`. Es **AI-first**: las tablas maestras de
`Cuestionario/00 - Indice` y los lineamientos están escritos para que
un agente entienda la estructura sin ejecutar la app.

## Por dónde empezar

1. **Estado y plan actual** → [[Plan de Accion - Roadmap v2]]
   La hoja de ruta vigente (mayo 2026): cerrar lógica, herramientas
   internas, capa de gamificación. Refleja tus respuestas a las
   decisiones de §4.
2. **Estructura del cuestionario** → [[Cuestionario/00 - Indice|Cuestionario]]
   Tabla maestra de los 33 nodos + 45 insights + árbol de flujo
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
├── Archivo/                            ← referencia histórica
│   ├── Indice.md
│   └── README original.md              ← guía narrativa con "William"
└── (docs obsoletos marcados explícitamente)
```

## Documentos histórico-no-vigentes

Quedan en el vault como contexto para entender de dónde viene el modelo
actual. Cada uno tiene un banner "OBSOLETO" al inicio:

- [[Plan de Accion - Desarrollo v1]] — plan extenso (pirámides + árbol +
  misiones IRL + mascota Pataco) que se construyó hasta Fase 6 y luego
  se hizo rollback. Reemplazado por v2.
- [[Propuesta - Modelo Ludico v1]] — propuesta original del modelo lúdico
  con 3 pirámides y William narrador. Inspiró v1, no v2.
- [[Rollback - Estado minimo]] — documento de la decisión de tirar todo
  lo construido en v1 y volver al mínimo (solo cuestionario + summary).
  Es el punto de partida desde el cual se construye v2.
- [[Propuestas - Cambios desde video Algebra de Riqueza]] — backlog ya
  **absorbido** (mayo 2026): los 7 nodos, 10 insights y 4 términos de
  glosario propuestos están implementados en `diagnosis.ts`.

## Regla de oro

`src/content/diagnosis.ts` es la fuente de verdad. Si este vault y el TS
divergen, **el vault está equivocado y se corrige en la misma pasada**.
Detalle en el `CLAUDE.md` del root del repo.
