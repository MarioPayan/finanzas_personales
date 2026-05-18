# Investigación — fase de exploración (mayo 2026)

> **EJECUTADA (mayo 2026).** Todo el alcance del doc [[02 - Propuestas de implementacion]]
> excepto T4.2 (nada tributario ni pensional, por decisión del usuario) quedó
> implementado. Resumen del cambio: cuestionario pasó de 37 a 48 nodos, sumó
> sección "Protección" (5 nodos: ownsHome, hasARL, hasLifeInsurance,
> hasHealthCoverage, hasHomeInsurance), añadió ~17 insights nuevos
> (refinados y citables), 3 widgets (usuryRate, ageBasedRiskAllocation,
> fireGoal en Summary), 8 entradas de glosario, "Tu próximo paso" arriba
> del Summary, frase de cierre rotativa de educadores. El nodo
> `hasHealthInsurance` se eliminó (reemplazado por `hasHealthCoverage` con
> más granularidad).

> Carpeta que aterriza la **siguiente fase** del proyecto. Después del cierre
> del [[Archivo/Plan de Accion - Roadmap v2|Roadmap v2]], se hizo investigación
> exhaustiva sobre finanzas personales en Colombia / LatAm para identificar
> qué contenido y mecánicas suman valor concreto al usuario sin romper la
> filosofía de "mínima fricción".

## Documentos

1. **[[01 - Recursos finanzas personales LatAm]]** — base de conocimiento.
   ~120 ítems organizados por dominio (presupuesto, ahorro, deudas,
   inversión, pensiones, seguros, impuestos, comportamiento, educadores,
   pareja), cada uno con qué es / por qué importa / especificidad LatAm /
   umbral numérico / fuente. Mayo 2026.

2. **[[02 - Propuestas de implementacion]]** — cada ítem del recurso
   mapeado a una recomendación de implementación en el formato actual del
   cuestionario (insight nuevo, nodo nuevo, widget, sección nueva,
   refinamiento de copy, o "no recomendado"). Agrupado por **tiers de
   esfuerzo** y con paquetes sugeridos (A-E). Pensado para que el usuario
   marque qué quiere implementar.

## Cómo usar esto

1. Leer el [[02 - Propuestas de implementacion|doc 02]] de corrido (es
   scaneable por tablas).
2. Marcar IDs (T1.X, T2.X, T3.X, T4.X, T5.X) o paquete (A / B / C / D / E).
3. Esa selección se vuelve el **plan de ejecución de la siguiente fase**.
4. Cuando ese plan cierre, se archiva igual que el Roadmap v2.

## Convención

- Los conceptos del doc 01 son **referencia técnica** — citables.
- Las propuestas del doc 02 son **opciones** — no compromisos.
- Las cifras citadas son de mayo 2026; cualquier umbral que se incorpore al
  código debería re-validarse anualmente (UVT, SMM, tasa de usura, etc.).
