# Propuestas de implementación

> Cada ítem de [[01 - Recursos finanzas personales LatAm|los recursos]] está
> mapeado a una recomendación concreta en el formato actual del cuestionario
> (nodos / insights / derivaciones / widgets / perfiles). Marcá los IDs que
> querés implementar y arrancamos por esos.

---

## Cómo leer este doc

| Tier | Qué es | Esfuerzo por ítem |
|------|--------|--------------------|
| 🟢 1 | Insight o ajuste de tip sobre nodo existente | < 30 min |
| 🟡 2 | Nodo nuevo individual | 1-3 h |
| 🟡 3 | Widget, derivación nueva, entrada de glosario | 30 min - 2 h |
| 🔴 4 | Sección nueva o cambio estructural | días |
| ⚪ 5 | Refinamiento de copy, perfil o filosofía | difuso |
| ❌ | NO recomendado | — |

| Impacto | Significado |
|---------|-------------|
| ⭐⭐⭐ | Cubre un vacío grande, cifras citables, alta tasa de "aha" |
| ⭐⭐ | Refuerza algo existente con datos / sube precisión |
| ⭐ | Nice-to-have |

Donde aplica, los IDs como `C5`, `D11`, `E1`, etc. apuntan al ítem
equivalente en [[01 - Recursos finanzas personales LatAm]].

---

## 🟢 Tier 1 — Insights nuevos o refinados sobre nodos existentes

Cambios localizados en `node.insights[]` de `src/content/diagnosis.ts`.
No cambian estructura; sí enriquecen el Summary con tips citables.

| ID | Refiere a | Nodo destino | Cambio | Impacto |
|----|-----------|--------------|--------|---------|
| **T1.1** | C5 trampa pago mínimo | `debtMonthlyPct` | Nuevo insight `minimumPaymentTrap` cuando `debtMonthlyPct > 0 ∧ debtRates` tenga `high/veryHigh`. Tip cita "$1M al 28% pagando mínimo tarda 5+ años". | ⭐⭐⭐ |
| **T1.2** | C6 tasa usura | `debtRates` (insight `toxicRates`) | Refinar el `tip` para mencionar la tasa de usura vigente (28,17% EA mayo 2026) como ancla, y mencionar compra de cartera (Banco Agrario 10,30% EA). | ⭐⭐⭐ |
| **T1.3** | C4 capacidad endeudamiento | `debtMonthlyPct` (insight `debtPaymentPressure`) | Subir el corte de `> 30` a banda de severidad: `30-40` info "zona alta", `>40` warning "zona peligrosa", `>50` critical "sobreendeudamiento". Refiere Decreto 0583/2025. | ⭐⭐⭐ |
| **T1.4** | C3 compra de cartera | `debtCount` o `debtRates` | Nuevo insight `consolidationCandidate` cuando `debtCount ≥ 3 ∧ alguna fila debtRates ∈ {high, veryHigh}`. Tip: lista de bancos con tasas de compra de cartera. | ⭐⭐ |
| **T1.5** | C8/C12 errores en Datacrédito | `creditScoreBand` (insight `badCreditScore`) | Refinar tip con dato "10-15% de reportes tienen errores; consulta mensual gratuita". | ⭐⭐ |
| **T1.6** | B5 ahorrar vs invertir | `invests` o `emergencyMonths` | Nuevo insight `investingBeforeEmergency` cuando `invests = true ∧ emergencyMonths ∈ {none, lt1}`. Tip: si surge un imprevisto, vas a vender en mal momento. | ⭐⭐⭐ |
| **T1.7** | D24 día trading | `tradingFrequency` (insight `frequentTrading`) | Refinar tip con cifra "solo 2% de day traders son rentables consistentes; 80% pierden el primer año". | ⭐⭐ |
| **T1.8** | D15 SPIVA fondos activos | `usesIndexFunds` (insight `noIndexFunds`) | Refinar tip con SPIVA: "75% de fondos activos LatAm no superan su benchmark a 1 año; 100% perdieron a 10 años en varias categorías". | ⭐⭐⭐ |
| **T1.9** | D27 comisiones | `investmentVehicles` o `usesIndexFunds` | Nuevo insight `highFeeWarning` cuando hay fondos activos sin uso de indexados. Tip: "comisión razonable < 0,2%; FIC activo 1-2% → diferencia compuesta destruye rendimiento a 20 años". | ⭐⭐ |
| **T1.10** | D25 concentración un solo activo | `investmentVehicles` (insight `lowDiversification`) | Refinar para mencionar "concentración + 1 evento idiosincrático = portafolio arruinado". | ⭐⭐ |
| **T1.11** | D22 regla del 4% | `__summary__` | Insight global en Summary: "tu meta FIRE ≈ gastos × 25 = $X" (cálculo derivado de obligatoryPct + discretionaryPct + ingreso). Versión LatAm: × 28,5. | ⭐⭐⭐ |
| **T1.12** | H15 estrés y sueño | `financialStressLevel` (insight `chronicFinancialStress`) | Refinar tip con dato "45% Gen X pierde sueño por estrés financiero" y mencionar la cadena estrés→sueño→decisiones impulsivas. | ⭐⭐ |
| **T1.13** | A5 gastos hormiga | `discretionaryPct` (insight `highDiscretionarySpending`) | Refinar tip con top 3 Colombia (snacks 25,7%, ocio 14,3%, cigarrillos 6,7%). | ⭐⭐ |
| **T1.14** | A8 baja tasa de tracking | `hasBudgetSystem` (insight `noBudgetSystem`) | Refinar tip con cifra Colombia (55% no presupuesta, 47% no trackea gastos). | ⭐ |
| **T1.15** | A7 lifestyle inflation | `incomeBand` o nuevo (ver T2) | Insight contextual: si el ingreso es medio-alto pero el % de obligatorios+discrecionales > 85, sugerir lifestyle inflation. | ⭐⭐ |
| **T1.16** | H2 descuento hiperbólico | `hasBudgetSystem` | Tip sobre automatización del débito del ahorro el día de cobro para mitigar el sesgo. | ⭐ |
| **T1.17** | D26 FOMO inversiones | `tradingFrequency` o `riskProfile` | Refinar copy/tip con frase "si te enteraste por TikTok, ya es tarde". | ⭐ |
| **T1.18** | D5 regla del 72 | `yearsInvesting` (insight `compoundTimeWasted`) | Refinar tip con la regla del 72: "al 10% el dinero se duplica en 7,2 años". | ⭐⭐ |

---

## 🟡 Tier 2 — Nodos nuevos individuales

Preguntas nuevas en `DIAGNOSIS_QUESTIONS`. Cada una con prompt + opciones +
scoring + insights propios.

| ID | Idea | Tipo | Gate | Insights derivables | Impacto |
|----|------|------|------|---------------------|---------|
| **T2.1** | `creditCardPaymentBehavior` — ¿cómo pagas tu TC? | chips (`total`/`mínimo+`/`mínimo`/`mora`) | `hasDebt = true ∧ debtKinds incluye 'bad'` | Trampa pago mínimo (T1.1 vive mejor acá), señal de estrés financiero | ⭐⭐⭐ |
| **T2.2** | `usesAutomation` — ¿automatizas tu ahorro/inversión? | toggle | — | Refuerza score Base. Insight positive si sí. | ⭐⭐ |
| **T2.3** | `hasDependents` — ¿cuántos dependientes económicos tienes? | number (0-5) | — | Gate para seguros de vida, deducción tributaria, fondo emergencia más alto. | ⭐⭐⭐ |
| **T2.4** | `formalEmployment` — ¿empleado formal, independiente o mixto? | chips (`formal`/`independiente`/`mixto`/`sin ingresos formales`) | — | Habilita gates para ARL, IBC, declaración renta. Hoy se infiere; preguntarlo evita ambigüedad. | ⭐⭐⭐ |
| **T2.5** | `pensionRegime` — ¿en qué régimen pensional estás? | chips (`Colpensiones (RPM)`/`AFP (RAIS)`/`no sé`/`no aporto`) | `formalEmployment ∈ {formal, mixto}` Y país Colombia | Insight crítico si no sabe; insight info sobre ventana de traslado si edad cercana a pensión. | ⭐⭐⭐ |
| **T2.6** | `voluntaryPension` — ¿aportas a pensión voluntaria? | toggle | mismo gate que T2.5 | Insight positive (aprovecha beneficio tributario hasta 30% ingreso/3.800 UVT). | ⭐⭐ |
| **T2.7** | `usesAfcAccount` — ¿usas cuenta AFC para ahorrar para vivienda? | toggle | Colombia | Insight info sobre deducción si no la usa y declara renta. | ⭐⭐ |
| **T2.8** | `declaresIncomeTax` — ¿declaras renta? | toggle | — | Sin esto no hay sentido hablar de deducciones. | ⭐⭐ |
| **T2.9** | `taxDeductionsUsed` — ¿qué deducciones usas? | multiChips (`dependientes`/`AFC`/`PV`/`intereses vivienda`/`medicina prepagada`/`ninguna`/`no aplica`) | `declaresIncomeTax = true` | Insight: si no usa ninguna y declara, deja plata sobre la mesa. | ⭐⭐⭐ |
| **T2.10** | `hasARL` — ¿estás afiliado a una ARL? | toggle | `formalEmployment = independiente` | Insight critical si no, especialmente con dependientes. | ⭐⭐⭐ |
| **T2.11** | `hasLifeInsurance` — ¿tienes seguro de vida? | toggle | `hasDependents > 0 ∨ hasDebt = true` (deuda grande) | Insight: si dependientes y no tiene, suma asegurada recomendada 5-10x ingreso anual. | ⭐⭐⭐ |
| **T2.12** | `hasHealthCoverage` — ¿cobertura adicional a EPS? | chips (`solo EPS`/`plan complementario`/`medicina prepagada`/`ninguna`) | — | Insight critical si ninguna; insight info sobre PC como buen costo/beneficio. | ⭐⭐ |
| **T2.13** | `hasHomeInsurance` — ¿seguro de hogar? | toggle | preguntar `ownsHome` antes | Insight si tiene hipoteca y no tiene seguro (obligatorio por banco igual). | ⭐ |
| **T2.14** | `ownsHome` — ¿vives en casa propia, arrendada o familiar? | chips (`propia con hipoteca`/`propia sin hipoteca`/`arrendada`/`familiar`/`otra`) | — | Habilita gates de hipoteca, deducción intereses, seguro hogar. Insight contextual fuerte. | ⭐⭐⭐ |
| **T2.15** | `currencyDiversification` — ¿ahorras o inviertes en USD u otra moneda fuerte? | toggle | — | Insight info sobre cobertura cambiaria; refinable según país (Argentina/Venezuela severity más alta). | ⭐⭐ |
| **T2.16** | `coupleFinancialStructure` — ¿cómo dividen los gastos en pareja? | chips (`50/50`/`proporcional al ingreso`/`pool conjunto`/`separados`) | `inRelationship = true` | Insight info: con ingresos asimétricos 50/50 genera resentimiento (-49% prob divorcio Northwestern). | ⭐⭐ |
| **T2.17** | `talksAboutMoneyWithPartner` — ¿con qué frecuencia hablan de dinero? | chips (`nunca`/`solo en crisis`/`mensual`/`cada vez que entra`) | `inRelationship = true` | Refuerza `householdFinancialMisalignment`. | ⭐ |

---

## 🟡 Tier 3 — Widgets, derivaciones y glosario

Adiciones al panel de ayuda (popover) o al glosario contextual.

### Glosario nuevo

| ID | Término | Aparece en | Impacto |
|----|---------|------------|---------|
| **T3.G1** | Regla del 72 | tip de `yearsInvesting`, futuras tips de retorno | ⭐⭐ |
| **T3.G2** | Dollar Cost Averaging (DCA) | `invests` y `investmentAmounts` | ⭐⭐ |
| **T3.G3** | FIRE / Regla del 4% | insight T1.11 | ⭐⭐ |
| **T3.G4** | UVT (Unidad de Valor Tributario) | nodos de impuestos (T2.8-2.9) | ⭐⭐ |
| **T3.G5** | IBC (Ingreso Base de Cotización) | nodo T2.4 + T2.10 | ⭐⭐ |
| **T3.G6** | Tasa efectiva anual (EA) vs nominal mensual vencido (NMV) | `debtRates`, `investmentYields` | ⭐⭐ |
| **T3.G7** | Tasa de usura | `debtRates` | ⭐⭐⭐ |
| **T3.G8** | Fogafín | `creditScoreBand` o nuevo nodo de ahorro | ⭐ |
| **T3.G9** | ETF indexado | `investmentVehicles`, `usesIndexFunds` | ⭐⭐ |
| **T3.G10** | Compra de cartera | nuevo insight T1.4 | ⭐⭐ |
| **T3.G11** | RPM / RAIS | nodo T2.5 | ⭐⭐⭐ |
| **T3.G12** | BEPS | nodo T2.5 (si trabajador informal) | ⭐⭐ |
| **T3.G13** | AFC | nodo T2.7 | ⭐⭐ |
| **T3.G14** | Pensión voluntaria (PV) | nodo T2.6 | ⭐⭐ |
| **T3.G15** | ARL | nodo T2.10 | ⭐⭐ |
| **T3.G16** | Renta exenta vs deducible | nodos T2.8-2.9 | ⭐ |

### Widgets / derivaciones nuevas

| ID | Idea | Dónde aparece | Impacto |
|----|------|---------------|---------|
| **T3.W1** | **Tasa de usura vigente** como widget contextual en `debtRates` | sidebarWidget tipo `usuryRate`; muestra "Tope legal mayo 2026: 28,17% EA" | ⭐⭐⭐ |
| **T3.W2** | **Regla 100-edad** como widget en `riskProfile` | "A tus N años, la regla de pulgar sugiere ~M% en renta variable" | ⭐⭐ |
| **T3.W3** | **Rendimiento real vs inflación local** en `investmentYields` | derivación nueva `realYieldVsInflation`: muestra qué deja de ganar comparado con inflación país | ⭐⭐⭐ |
| **T3.W4** | **Capital meta FIRE** como insight global del Summary | `meta_fire = (obligatoryPct + discretionaryPct) × ingreso × 12 × 25` | ⭐⭐⭐ |
| **T3.W5** | Derivación `multiplyMonthlyIncomeTimes` para UVT/SMM en pesos en nodos tributarios | bracket × UVT y mostrarlo en moneda local | ⭐⭐ |
| **T3.W6** | Widget de **comparativa con la media del país** (ya existe vía WID) — extenderlo a más nodos | `incomeBand` ya lo usa; sumarlo en `obligatoryPct`, `emergencyMonths` para "tu fondo vs media del país" | ⭐ |

---

## 🔴 Tier 4 — Cambios estructurales

Estos requieren decidir si extendemos el cuestionario más allá de su scope
actual de 4 secciones (Base / Deudas / Estabilidad / Inversiones).

### T4.1 — Nueva sección "Protección" (seguros + dependientes)
- **Nodos**: T2.3 (`hasDependents`), T2.10 (`hasARL`), T2.11 (`hasLifeInsurance`), T2.12 (`hasHealthCoverage`), T2.13 (`hasHomeInsurance`), T2.14 (`ownsHome`).
- **Perfiles**: "Sin red" / "Cubierto a medias" / "Bien protegido" / "Sobre-asegurado".
- **Justificación**: el 65% de asegurados no entiende su póliza. Es un vacío grande del diagnóstico actual. ⭐⭐⭐
- **Costo**: 6 nodos + insights + perfiles + categoría nueva en `CATEGORIES`.

### T4.2 — Nueva sección "Estructura tributaria y pensional"
- **Nodos**: T2.4 (`formalEmployment`), T2.5 (`pensionRegime`), T2.6 (`voluntaryPension`), T2.7 (`usesAfcAccount`), T2.8 (`declaresIncomeTax`), T2.9 (`taxDeductionsUsed`).
- **Perfiles**: "Desconectado del sistema" / "Cumple lo básico" / "Optimiza activamente".
- **Justificación**: el régimen pensional equivocado puede costar 30-50% menos pensión. Las deducciones disponibles son plata sobre la mesa. ⭐⭐⭐
- **Costo**: 6 nodos + sección nueva + Doble Asesoría content (puede ser tip + link).
- **Riesgo**: si lo hacemos genérico LatAm, hay que decidir país por país; lo más limpio es **gate por país detectado: si Colombia → preguntas Colombia; si no → versión genérica** (más simple).

### T4.3 — Sub-flujo "Pareja"
- **Nodos**: T2.16 (`coupleFinancialStructure`), T2.17 (`talksAboutMoneyWithPartner`).
- **Justificación**: predictor #1 de divorcio. Hoy sólo tenemos un `inRelationship` y un `householdFinancialAlignment` sin profundidad.
- **Costo**: 2 nodos pequeños + insight + posiblemente perfil de pareja en Summary. ⭐⭐

### T4.4 — Rediseño de perfiles ampliados
- Si entran T4.1 / T4.2, los perfiles globales necesitan ampliar el vector: hoy se calculan sobre Base / Deudas / Estabilidad / Inversiones. Habría que sumar Protección y Tributario.
- **Costo**: actualizar `profiles.ts`, lineamiento [[Lineamientos/07 - Perfiles de personaje]], pantalla Summary.

---

## ⚪ Tier 5 — Refinamientos de copy, perfiles y filosofía

Estos no son cambios estructurales pero sí dan identidad al diagnóstico.

### T5.1 — Tono "Paz financiera" (Andrés Gutiérrez)
- Aplicar en welcome screen (si entra alguna vez) y en mensajes del Summary cuando el score global es alto.
- Frase candidata: "No hace falta ser experto para vivir en paz financiera."

### T5.2 — Frase de cierre del Summary
- Rotar entre 3-5 frases de educadores hispanohablantes verificados:
  - Sofía Macías: "Vivir dentro de nuestras posibilidades."
  - Andrés Gutiérrez: "Los pasitos antes que las maratones."
  - Morgan Housel: "Cómo te comportás con el dinero importa más que lo que sabés."
- Mostrar la que corresponda al perfil global (cómodo → Macías, en deuda → Gutiérrez, etc.).

### T5.3 — Mitigación de sesgos en el copy
- **Anti-FOMO** en nodos de inversión: usar lenguaje neutro, evitar "lo que está subiendo".
- **Anti-anclaje** en sublabels: comparar contra benchmarks objetivos (SMM, media nacional, inflación), no contra "el doble del rango previo".
- **"Yo del futuro"** en nodo de pensiones: framing "el tú de los 65 años te está mirando".

### T5.4 — Plan de acción priorizado al estilo "Pasitos"
- Reemplazar el listado por severidad del Summary actual por una versión más narrativa: "tu próximo paso" (1 acción) + "después" (2 más). Inspirado en el método de Andrés Gutiérrez / Ramsey.
- Costo: cambio de render en `Summary.tsx`. ⭐⭐

### T5.5 — Perfiles ampliados con sabor LatAm
- "Equilibrista colombiano" — perfil específico cuando se detecta Colombia y score mid.
- "Resiliente argentino" — perfil específico para Argentina + score sobreviviendo a inflación.
- Costo: textos extra; lógica trivial.

---

## ❌ NO recomendado implementar (al menos no como nodo del cuestionario)

| Item | Por qué no |
|------|-----------|
| Lista de libros / podcasts específicos como nodo | Scope creep. Si querés, vivir en una sección "lecturas recomendadas" del Summary, no como pregunta. |
| Plataformas específicas (Tyba / Trii / Littio) como nodo | Preguntar "qué app usas" es ruido. Mencionarlas como tip en `investmentVehicles` si aplica. |
| Tracking detallado de gastos mensuales | Va contra "mínima fricción". Lo que ya tenemos (annualItems) es suficiente. |
| Mascota narradora | Ya deferido por §4.1.2 del Roadmap v2. |
| Carta exportable PNG | Ya deferido. Reabrir si entra una fase de "viralidad". |
| Sistema de seguimiento longitudinal ("vuelve en 30 días") | Romperíamos el modelo one-shot. La app sigue siendo de diagnóstico, no de habit tracking. |
| Recomendación de productos específicos (CDT de tal banco a tal tasa) | La info envejece rápido (las tasas cambian). Mejor mantener el benchmark (% sobre usura) y dejar que el usuario compare. |
| Padre Rico Padre Pobre como referencia | Conflicto pedagógico — el libro ha sido criticado por consejos riesgosos y por que "padre rico" probablemente nunca existió. Skip. |

---

## 📋 Resumen ejecutivo — paquetes sugeridos

### Paquete A — "Refinar lo que hay" (1-2 días)
Todos los Tier 1 + entradas de glosario más relevantes (T3.G1, G3, G4, G6, G7, G11) + un widget (T3.W1).
**Resultado**: Summary mucho más rico en cifras citables, sin tocar la estructura. Riesgo bajo.

### Paquete B — "Profundizar el diagnóstico" (semana)
Paquete A + T2.1, T2.2, T2.3, T2.4, T2.16, T2.17. Los nodos transversales que profundizan secciones existentes.
**Resultado**: cuestionario sube de 37 → ~43 nodos, mejor contexto para insights, sin sección nueva.

### Paquete C — "Cubrir vacíos grandes" (2-3 semanas)
Paquete B + sección T4.1 (Protección) **o** T4.2 (Tributario). Idealmente las dos por separado.
**Resultado**: cuestionario sube a ~50-55 nodos. Diagnóstico financiero completo de verdad. Costo: lineamientos nuevos, perfiles ampliados, decisiones de país.

### Paquete D — "Sabor LatAm + identidad" (1-2 semanas, paralelo a A/B/C)
Tier 5 completo: tono, frases de educadores, perfiles regionales, plan priorizado al estilo "Pasitos".

### Paquete E — "Sólo lo crítico" (medio día)
Sólo Tier 1 más prioritarios: T1.1, T1.2, T1.3, T1.6, T1.7, T1.8, T1.11.
**Resultado**: el Summary se siente mucho más certero sin tocar nodos. Buena prueba antes de comprometer paquetes más grandes.

---

## Próxima decisión

Marcá:
- Qué paquete (A / B / C / D / E) o qué IDs individuales (T1.X, T2.X, T3.X, T4.X, T5.X) querés implementar primero.
- Si querés que las nuevas secciones (T4.1, T4.2) entren como **categoría nueva** en `CATEGORIES` (5+ categorías totales) o si preferís re-encajarlas dentro de las 4 actuales (ej. seguros bajo Estabilidad, impuestos/pensiones bajo Inversión).
- Si activamos el flag "country-specific" — algunas preguntas (T4.2 completa) sólo aplican si detectamos Colombia.
