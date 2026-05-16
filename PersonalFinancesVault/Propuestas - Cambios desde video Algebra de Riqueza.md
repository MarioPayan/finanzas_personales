# Propuestas — video "El álgebra de la riqueza" (Scott Galloway)

Backlog de cambios candidatos al cuestionario y al glosario derivados de la
lectura de `video.md` (resumen del libro de Scott Galloway). No es un plan
implementado, es un menú para decidir qué adoptar.

Fuente original: `/home/kazemu/repos/Kaze/finanzas_personales/video.md`.

---

## 1. Preguntas nuevas candidatas

| Regla del video | Pregunta candidata | Bloque sugerido | Tipo | Justificación |
| --- | --- | --- | --- | --- |
| 6 — No operes día con día | `tradingFrequency` (¿con qué frecuencia operás tus inversiones?) | Inversiones | chips (nunca / mensual / semanal / diaria) | Señal directa: trading frecuente es predictor de mal desempeño. Encaja con la filosofía de bandas. |
| 14 — Mantén la inversión simple | `usesIndexFunds` (toggle) o columna implícita en `investmentVehicles` | Inversiones | toggle, o agregar opción "Fondo indexado / ETF" en `investmentVehicles` | Hoy "Fondo de inversión" agrupa indexado y gestionado activamente. Distinguirlos abre un insight serio. |
| 15 — Tres cubetas | `hasBudgetSystem` (¿separás tu plata en cuentas/cubetas?) | Base | toggle o chips (no / mental / cuentas separadas / automatizado) | El sistema de cubetas predice mejor el cumplimiento de ahorro que el monto mismo. |
| 17 — Estrés financiero como daño a la salud | `financialStressLevel` | Estabilidad | chips (ninguno / a veces / frecuente / constante) | Captura una variable que el resto de la app no toca y abre tips de salud + finanzas. |
| 18 — Cónyuge como inversión | `householdFinancialAlignment` (con gate `inRelationship` toggle) | Estabilidad | toggle + chips (¿hablan de dinero? acuerdo en gastos/ahorro) | Predictor #1 de divorcio según el video; hoy invisible en el diagnóstico. Requiere diseño cuidadoso para no ser invasivo. |
| 2 + 9 — Tiempo es tu mayor activo / 20s son taller | `yearsInvesting` (¿hace cuánto invertís?) | Inversiones | chips (no invierto / <1 / 1–3 / 3–10 / >10 años) | Permite contrastar "edad joven + cero años invirtiendo" → tip muy potente. La edad sola no basta. |

**Prioridad recomendada:** `tradingFrequency`, `householdFinancialAlignment`
(con gate), `usesIndexFunds`. Las otras tres son agregados de menor relación
esfuerzo/beneficio.

---

## 2. Tips / insights nuevos sobre nodos existentes

| Regla | Nodo donde vive el tip | Condición | Texto sugerido (resumen) |
| --- | --- | --- | --- |
| 2 — Compound time | `invests` | `invests = No` **y** `age < 30` | "A los 20 cada año invertido vale más que diez años a los 40. Empezar tarde con más plata pierde contra empezar temprano con poca." |
| 1 — Cómo juegan los ricos | `debtKinds` | hay deuda "Una inversión" | "Esa es la mecánica que usan los patrimonios grandes: pedir prestado contra activos en vez de venderlos. Tu deuda productiva opera en esa misma dirección." |
| 5 — Diversifica el dinero | `investmentVehicles` | un solo vehículo, o concentración > X% | Refuerza el `lowDiversification` actual con el encuadre del video. |
| 6 — No day trading | `investmentYields` | algún rendimiento `gt15` o exacto > 30% | "Rendimientos consistentemente altos casi siempre esconden riesgo no contabilizado o sesgo de supervivencia. Antes de duplicar la apuesta, verificá el track record en años malos." |
| 13 — Metas alcanzables | `emergencyMonths` | respuesta = Ninguno / Menos de 1 | "Apuntá primero a 1 mes de gastos obligatorios, no a 6. Las metas grandes que no se cumplen producen abandono; las chicas que se cumplen producen hábito." |
| 14 — Inversión simple | `riskProfile` o `investmentVehicles` | si no hay fondos indexados | "El 94% de gestores profesionales no le gana a un fondo indexado en 20 años. Para la mayoría, lo más simple gana." |
| 24 — Medir gasto en tiempo | `discretionaryPct` | `discretionaryPct > 45%` | Complementa el `highDiscretionarySpending`: "Probá esto: dividí cada gasto grande por tu ingreso por hora. Te dice cuántas horas de tu vida cuesta." |
| 17 — Salud + finanzas | `obligatoryPct` o sección Estabilidad | `obligatoryPct > 70%` y/o sin fondo | "La presión financiera sostenida sube presión arterial y daña sueño. Arreglar el cash-flow no es solo financiero, es salud." |

---

## 3. Glosario candidato

| Término | Definición corta | Origen |
| --- | --- | --- |
| **Apalancamiento contra activos** | Tomar deuda usando activos como garantía en vez de venderlos, para evitar el impuesto a la ganancia y conservar el activo. | Regla 1 |
| **Fondo indexado** | Vehículo que replica un índice de mercado a bajo costo, en vez de elegir activos. Históricamente le gana a la mayoría de gestores activos en plazos largos. | Regla 14 |
| **Interés compuesto** | Rendimiento que se reinvierte y genera nuevo rendimiento sobre el rendimiento previo. La variable que más amplifica empezar temprano. | Regla 2 |
| **Sistema de cubetas / buckets** | Dividir el ingreso entrante en compartimentos con un destino predefinido (obligatorios, emergencia, inversión). | Regla 15 |

Verificar antes de agregar si alguno ya existe parcialmente en
`PersonalFinancesVault/Cuestionario/99 - Glosario referenciado.md`.

---

## 4. Reglas descartadas como pregunta

Filosóficas, culturales o demasiado contextuales para encajar en bandas:

3 (elegir la ola/industria), 4 (talento sobre pasión), 7 (work-life balance
en 20s), 8 (invertir en crisis), 10 (cuándo rendirse), 11 (delegar),
12 (ciudad/oficina), 16 (hablar de dinero), 19–22 (suerte, perspectiva,
escépticos, vivir mejor), 23 (memento mori), 25 (el dinero no da felicidad).

Si querés salvarlas, opción: micro-cápsulas educativas en el panel lateral
o un bloque de cierre tras el puntaje final ("lecturas que valen la pena"),
sin ser puntuables.

---

## 5. Orden recomendado para arrancar

1. **2 preguntas:** `tradingFrequency` y `householdFinancialAlignment` con gate. Tocan terreno hoy no cubierto.
2. **3 tips:** regla 2 sobre `invests`, regla 13 sobre `emergencyMonths`, regla 6 sobre `investmentYields`. Costo ~10 líneas cada uno.
3. **Glosario:** sumar "Apalancamiento contra activos" y "Fondo indexado".

Cada cambio implica actualizar en la misma pasada:

- `src/content/diagnosis.ts`
- archivo de categoría correspondiente en `Cuestionario/`
- glosario en `Cuestionario/99 - Glosario referenciado.md` si suma término
- lineamiento en `Lineamientos/` si introduce un patrón nuevo
