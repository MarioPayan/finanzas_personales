# Plan de Acción — Desarrollo de la App (v1.1)

> **OBSOLETO (mayo 2026).** Este plan describe el modelo de **3 pirámides
> + árbol + misiones IRL post-quiz + mascota Pataco** que se implementó
> hasta Fase 6 y luego se descartó vía rollback ([[Rollback - Estado
> minimo]]). El plan vigente es [[Plan de Accion - Roadmap v2]], que
> reemplazó el modelo de misiones IRL por un quiz one-shot de
> diagnóstico con scoring + insights.
>
> Se conserva como referencia histórica: muchas decisiones (inputs
> low-friction, SMM por país, opciones-no-opiniones, mínima fricción) se
> mantienen vigentes en v2.

> Documento que integra `Propuesta - Modelo Ludico v1.md` con los ajustes del `Raw plan.md` y la iteración 2. Pensado como hoja de ruta accionable, no como diseño cerrado.

---

## Bitácora de cambios

### v1.1 — Iteración 2
- **Patacoin = moneda local 1:1**. Si el usuario gana 3.000.000 COP, son 3.000.000 patacoin. Sin conversión, sin múltiplos del SMM.
- **País y SMM se infieren del navegador**, no se preguntan. Tabla local de SMM por país, ajustable por el usuario si la default está desactualizada.
- **William reemplazado por una mascota** (default `Pataco`, renombrable). El William del README sobrevive solo como narrador dentro de la biblioteca, no como guía de la app.
- **Mínima fricción en inputs**: chips, sliders y rangos antes de campos numéricos. El diagnóstico debe poder completarse sin teclear ni una cifra.
- **Fases del plan expandidas** con tareas concretas, criterios de cierre, dependencias y riesgos.

### v1.0 — Iteración 1
- Tres pirámides (Deuda, Estabilidad, Inversión) que confluyen en un árbol como meta visual.
- 5 niveles por pirámide.
- Persistencia local, sin servidor ni cuentas.
- Filosofía de contenido: opciones, no opiniones.
- Audiencia hispanohablante general; idioma único español.

---

## 0. Síntesis de decisiones tomadas

| #   | Decisión                | Valor                                                                                              |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | Audiencia               | Hispanohablante general                                                                            |
| 2   | Moneda                  | **Patacoin = moneda local 1:1**; SMM por país inferido del navegador y ajustable                   |
| 3   | Niveles por pirámide    | 5                                                                                                  |
| 4   | Estructura              | **Tres pirámides** (Deuda, Estabilidad, Inversión) que confluyen en **un árbol**                   |
| 5   | Personaje guía          | **Mascota** no humana (default `Pataco`, renombrable)                                              |
| 6   | Persistencia            | Local (`localStorage` + export/import JSON)                                                        |
| 7   | Idioma                  | Español únicamente                                                                                 |
| 8   | Tono                    | Opciones, no opiniones — presentar tradeoffs y dejar elegir                                        |
| 9   | Naturaleza del proyecto | Personal, con potencial de monetización futura                                                     |
| 10  | Gamificación            | **Capa gruesa**, no decorativa — XP, logros, inventario, eventos, rachas                           |
| 11  | Inputs                  | **Mínima fricción**: chips, sliders y rangos antes que campos de texto                             |

---

## 1. El modelo refinado: **El Árbol de las Finanzas**

### 1.1 Las tres pirámides

Cada pirámide es independiente en su recorrido pero contribuye a una misma meta visual final: el árbol.

```
       PIRÁMIDE 1            PIRÁMIDE 2            PIRÁMIDE 3
        DEUDA                ESTABILIDAD           INVERSIÓN
       (raíces)              (tronco)              (copa)

    Nivel 5 ▲              Nivel 5 ▲             Nivel 5 ▲
    Nivel 4 ▲              Nivel 4 ▲             Nivel 4 ▲
    Nivel 3 ▲              Nivel 3 ▲             Nivel 3 ▲
    Nivel 2 ▲              Nivel 2 ▲             Nivel 2 ▲
    Nivel 1 ▲              Nivel 1 ▲             Nivel 1 ▲
```

#### Pirámide 1 — Deuda (Las Raíces)
| N° | Nombre          | Criterio de salida                                                            |
| -- | --------------- | ----------------------------------------------------------------------------- |
| 1  | **Inventario**  | Has listado todas tus deudas con saldo, tasa y cuota                          |
| 2  | **Triaje**      | Cada deuda está clasificada (mala / buena / subsistencia / ahorro)            |
| 3  | **Estrategia**  | Elegiste un método de ataque (avalancha / bola de nieve / consolidación)      |
| 4  | **Ejecución**   | Tu cuota mensual de deuda mala bajó al menos 20% desde el inicio              |
| 5  | **Limpieza**    | Sin deuda mala con tasa > umbral; deuda buena bajo control                    |

#### Pirámide 2 — Estabilidad (El Tronco)
| N° | Nombre           | Criterio de salida                                                            |
| -- | ---------------- | ----------------------------------------------------------------------------- |
| 1  | **Conciencia**   | Sabes cuánto entra y cuánto sale al mes (cifras concretas)                    |
| 2  | **Margen**       | Tu margen mensual es positivo y reproducible                                  |
| 3  | **Colchón**      | Tienes 1 mes de gastos guardados en lugar accesible                           |
| 4  | **Refuerzo**     | Fondo de emergencia de 3-6 meses según tu perfil                              |
| 5  | **Resiliencia**  | Fondo + presupuesto consistente 3 meses seguidos + gastos optimizados         |

#### Pirámide 3 — Inversión (La Copa)
| N° | Nombre                | Criterio de salida                                                            |
| -- | --------------------- | ----------------------------------------------------------------------------- |
| 1  | **Educación**         | Completaste módulos básicos (rentabilidad, riesgo, inflación, costo de oport.)|
| 2  | **Auto-conocimiento** | Definiste tu perfil (riesgo + horizonte)                                      |
| 3  | **Primer movimiento** | Primera inversión real registrada acorde a tu perfil                          |
| 4  | **Diversificación**   | Inversiones distribuidas en al menos 3 mecanismos                             |
| 5  | **Maestría**          | Portafolio activo con revisiones/rebalanceos periódicos                       |

### 1.2 El árbol como meta visual

Cada nivel completado en una pirámide hace crecer una parte del árbol:

- **Pirámide Deuda → Raíces**: cada nivel hace crecer una raíz visible bajo tierra.
- **Pirámide Estabilidad → Tronco**: cada nivel engrosa y sube el tronco.
- **Pirámide Inversión → Copa**: cada nivel agrega una rama y hojas; en nivel 5, fruta.

El árbol vive en el dashboard principal. **Es la pantalla "wow" de la app**: el usuario ve su propio árbol crecer mes a mes. Cuando los tres niveles 5 se alcanzan, el árbol da fruto y se desbloquea un modo "maestro" (revisiones periódicas, eventos avanzados).

### 1.3 Reglas de progresión entre pirámides

Las pirámides **no son estrictamente secuenciales**, pero sí están **gateadas con sentido común**:

- **Inversión Nivel 3+ requiere Estabilidad Nivel 3** (no inviertes con saldo si no tienes colchón).
- **Estabilidad Nivel 4+ requiere Deuda Nivel 3** (no acumulas más fondo si tienes deuda mala sin estrategia).
- **Inversión Nivel 1-2 está siempre abierta**: educarte e identificar tu perfil no requiere otros prerrequisitos.

Esto evita la trampa del "pague-deuda-primero-y-punto" sin caer en el extremo opuesto de invertir con tarjetas en mora.

---

## 2. Sistema de moneda y normalización

### 2.1 Patacoin = moneda local (1:1)

El usuario nunca convierte. Si gana 3.000.000 COP, son 3.000.000 patacoin. Si gana 4.000 CLP, son 4.000 patacoin. **Patacoin es solo el nombre lúdico de la moneda local del usuario.** Visualmente toda la app habla en patacoin; conceptualmente, son sus pesos/soles/euros.

### 2.2 País y SMM: inferidos, no preguntados

La app intenta inferir el país y SMM del usuario sin preguntárselo:

- **Detección de país** vía `navigator.language` / `Intl.Locale` (ej: `es-CO` → Colombia).
- **Tabla local de SMM por país** en código (`content/smm.ts`) con valor de referencia y fecha de última actualización.
- Si no se puede inferir, se elige un default razonable (ej: el más común entre los usuarios esperados).
- En settings hay **un único campo editable**: el SMM. El usuario puede ajustarlo si la default está desactualizada o si está en un país no listado. La app nunca pregunta el país explícitamente.

### 2.3 Para qué usamos el SMM

El SMM no se le muestra al usuario constantemente; sirve internamente para:

- **Bucketing de ingreso** ("ganas alrededor de 3 SMM") y dar contexto en los resultados.
- **Sugerir umbrales razonables** (ej: tasas de interés "altas", magnitudes de deuda "grandes" relativas al SMM del país).
- **Mantener el modelo agnóstico al país** sin obligar al usuario a hacer cuentas.

### 2.4 Mantenimiento de la tabla SMM

La tabla vive en código y se actualiza en releases. Si está desactualizada, el usuario ajusta manualmente. **No hay fetch a un servicio externo en V1**; mantener el principio de "sin servidor".

### 2.5 Tabla SMM mínima inicial (a validar)

| País       | Locale  | SMM (referencia)        | Fecha de revisión |
| ---------- | ------- | ----------------------- | ----------------- |
| Colombia   | es-CO   | 1.300.000 COP           | TBD               |
| México     | es-MX   | 7.467 MXN/mes (~aprox)  | TBD               |
| Chile      | es-CL   | 460.000 CLP             | TBD               |
| Argentina  | es-AR   | TBD                     | TBD               |
| Perú       | es-PE   | 1.025 PEN               | TBD               |
| Uruguay    | es-UY   | 21.106 UYU              | TBD               |
| España     | es-ES   | 1.134 EUR               | TBD               |

> Cifras a confirmar al construir la tabla; sirven como ilustración.

---

## 3. Capas de gamificación

La gamificación es **estructural, no decorativa**. El usuario no juega para divertirse de paso; juega para entender mejor su realidad.

### 3.1 Sistemas

| Sistema                          | Qué es                                                                            | Para qué sirve                                       |
| -------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **XP por pirámide**              | Cada misión otorga XP en su pirámide                                              | Visualizar progreso fino dentro del nivel            |
| **Stats del personaje**          | 5 barras: Liquidez, Salud Crediticia, Margen, Diversificación, Conocimiento       | Ver cuello de botella sin texto largo                |
| **Inventario / Coleccionables**  | Cada misión otorga un objeto temático (semilla, ladrillo, moneda, libro)          | Sentir que algo se acumula tangiblemente             |
| **Logros / Medallas**            | Unlocks con nombre y arte ("Primera limpieza", "Cazador de tasas", "Diversificado de manual") | Reconocer hitos memorables             |
| **Rachas (streaks)**             | "5 semanas seguidas haciendo check-in"                                            | Generar hábito de retorno                            |
| **Eventos aleatorios**           | Simulaciones cortas: "Se daña la nevera, sale 400.000 patacoin. ¿De dónde lo sacas?" | Probar resiliencia y reforzar lecciones           |
| **Quizzes de la mascota**        | Preguntas opcionales de la biblioteca con XP de Conocimiento                      | Reforzar contenido educativo                         |
| **El árbol**                     | Visualización cumulativa del progreso                                             | El "trofeo" visible permanente                       |

### 3.2 Loop de retención

```
[Diagnóstico] → [Ver árbol y nivel actual] → [Misión recomendada] →
[Hacer misión IRL] → [Volver a la app a marcar completada] →
[XP, logro, objeto, árbol crece, mascota reacciona] → [Próxima misión]
```

La app **no te ata a sesiones largas**. Una sesión típica son 3-5 minutos. El compromiso real está en la vida del usuario, no en la app — pero la app te recompensa cada vez que vuelves.

### 3.3 La mascota como guía con estados

El acompañante del usuario es una **mascota no humana**. Default: **Pataco** (renombrable en onboarding y en settings). La mascota representa al usuario en su viaje, no es un personaje aparte.

Evoluciona junto con el usuario:
- **Cría** (todos en nivel 0-1): pequeña, novata, mira el mundo con curiosidad.
- **Crecida** (mix de niveles 2-3): segura de sí misma, ya sabe varias cosas.
- **Veterana** (la mayoría en nivel 4-5): tranquila, sabia, se sienta a tomar tinto.

Sus reacciones (bocadillos, expresiones) cambian según el evento: completar misión, fallar evento aleatorio, subir nivel, etc. Hereda el tono del README original (irreverente, cómplice, con emojis sutiles), pero ahora es **tu** mascota, con el nombre que tú elegiste.

> El `William` del README pasa a ser un personaje narrativo dentro de la biblioteca, no el guía de la app.

---

## 4. Filosofías de diseño

### 4.1 Contenido: opciones, no opiniones

Cada vez que el usuario debe elegir cómo abordar algo, le presentamos un **panel de opciones** con tradeoffs explícitos. Ejemplos:

**Pirámide Deuda, Nivel 3 — Estrategia:**
- Avalancha → minimiza interés total, requiere disciplina.
- Bola de nieve → momentum psicológico, paga un poco más en intereses.
- Consolidación → una sola cuota, depende del banco y tasa ofrecida.

**Pirámide Estabilidad, Nivel 4 — Dónde guardar el fondo:**
- Cuenta de ahorros: liquidez total, rentabilidad casi cero.
- Fondo de inversión a la vista: liquidez alta, rentabilidad baja-moderada.
- CDT a 30/60/90 días: liquidez media, rentabilidad mejor.

**Pirámide Inversión, Nivel 4 — Diversificación:**
- Tabla del README original (riesgo × plazo) con mecanismos sugeridos por celda.
- El usuario elige su mix; la app calcula su % de diversificación.

La app **registra la elección** y adapta misiones futuras. Si después el usuario quiere cambiar de método, puede; eso recalcula su trayectoria.

### 4.2 Inputs: mínima fricción

**Tipear cifras es la última opción**, no la primera. La meta es que el usuario pueda completar el diagnóstico inicial **sin teclear ningún número** si así lo prefiere.

| Tipo de pregunta                  | Forma preferida                  | Ejemplo                                                                |
| --------------------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| Magnitud de ingreso               | **Chips de rango (en SMM)**      | "< 1 SMM" / "1-2" / "2-4" / "4-8" / "> 8"                              |
| Porcentaje (gastos, ahorro, etc.) | **Slider 0-100%** con saltos 5%  | Slider de "% del ingreso en gastos obligatorios"                       |
| Cantidad de meses (fondo)         | **Chips discretos**              | "Ninguno" / "< 1" / "1-3" / "3-6" / "> 6"                              |
| Tasa de interés                   | **Chips por banda**              | "< 10% EA" / "10-25%" / "25-50%" / "> 50%"                             |
| Sí/No                             | **Toggle de un toque**           | "¿Tienes deudas?"                                                      |
| Cifra exacta (raro)               | **Input numérico con default**   | Solo para ajustar SMM o registrar deuda específica                     |

**Reglas de oro**:
1. Si una respuesta puede ser un rango sin perder utilidad, **es un rango**.
2. Si el usuario quiere precisión, puede expandir el chip a un input dentro del rango (progressive disclosure).
3. Toda pregunta debe poder responderse en **un toque**.
4. El diagnóstico inicial completo no debe requerir más de **5-8 toques**.
5. Cuando haya que ingresar cifras (ej: lista de deudas en Pirámide 1), preferir input numérico con sugerencias y autoformato (separadores de miles).

---

## 5. Mapa de contenido por producir

### 5.1 Diagnóstico inicial (5-8 preguntas, todas con chips/sliders)

| #  | Pregunta                              | Forma                              | Notas                                            |
| -- | ------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| 1  | Magnitud de ingreso mensual           | Chips por bandas de SMM            | El SMM se infiere del navegador                  |
| 2  | % del ingreso en gastos obligatorios  | Slider 0-100%                      | Default sugerido 50%                             |
| 3  | ¿Tienes deudas?                       | Toggle Sí/No                       | Si No, salta 4                                   |
| 4  | Magnitud y tasa promedio de deuda     | Chips combinados                   | Solo si #3 = Sí                                  |
| 5  | Meses de gastos guardados como fondo  | Chips: 0 / <1 / 1-3 / 3-6 / >6     |                                                  |
| 6  | ¿Inviertes ya?                        | Toggle Sí/No                       | Si No, salta 7                                   |
| 7  | Tipo y % del ingreso invertido        | Chips combinados                   | Solo si #6 = Sí                                  |
| 8  | (Opcional) Ajustar SMM                | Input numérico con default         | En settings; opcional al inicio                  |

Tiempo objetivo: < 3 minutos. Output: nivel actual en cada una de las 3 pirámides + valores iniciales de los 5 stats + país + SMM.

### 5.2 Misiones por pirámide y nivel

15 niveles totales (3 pirámides × 5 niveles), 3-7 misiones cada uno → **45-105 misiones**.

Estructura de cada misión:
```
- id
- pirámide
- nivel
- título (tono cómplice, no acartonado)
- descripción
- prerrequisitos (otras misiones)
- tipo (informativa | acción IRL | quiz | evento)
- criterio de completada (auto-declarado por usuario)
- recompensa (XP, objeto, logro, stat boost)
- inputs (cuando los pida): chips/sliders/toggles según §4.2
```

### 5.3 Biblioteca
- Migrar el contenido del README a módulos cortos indexados por pirámide y nivel.
- Cada módulo = 2-5 minutos de lectura.
- Quizzes opcionales por módulo.
- El personaje "William" del README sobrevive aquí como narrador de la biblioteca, no como guía de la app.

### 5.4 Eventos aleatorios
- Banco de ~30 eventos (emergencias menores y mayores, oportunidades, sustos).
- Cada evento tiene: descripción, opciones de respuesta, resultado según tu situación actual.
- Frecuencia: 1 evento cada N días o tras X misiones.

### 5.5 Logros y coleccionables
- ~20-30 logros con nombre, descripción y condición de desbloqueo.
- 1 coleccionable por misión, agrupados por temas (semillas, ladrillos, monedas, libros).

### 5.6 Bocadillos de la mascota
- Banco de líneas indexadas por contexto (`content/mascotLines.ts`).
- Variantes según estado de la mascota (cría / crecida / veterana).
- Mínimo 3-5 líneas por contexto para evitar repetición.

---

## 6. Arquitectura técnica

### 6.1 Stack

- **Frontend**: React 18 + TypeScript + Vite (ya está).
- **UI**: MUI (ya está) + Framer Motion (animaciones) + un sistema de iconos consistente.
- **Estado**: Zustand para estado global; nada de Redux.
- **Persistencia**: `localStorage` para perfil; IndexedDB solo si necesitamos guardar histórico extenso.
- **Contenido**: TypeScript tipado para datos; MDX para biblioteca. **Eliminar el pipeline drawio→json.**
- **Tests**: Vitest para el motor; Playwright opcional para flujos clave.

### 6.2 Estructura de carpetas

```
src/
  content/
    diagnosis.ts             # preguntas del diagnóstico
    smm.ts                   # tabla de SMM por país
    pyramids/
      debt.ts                # niveles + misiones de Deuda
      stability.ts           # niveles + misiones de Estabilidad
      investment.ts          # niveles + misiones de Inversión
    library/                 # MDX por pirámide/nivel
    events.ts                # banco de eventos aleatorios
    achievements.ts          # logros
    mascotLines.ts           # bocadillos por contexto

  engine/
    leveling.ts              # respuestas/misiones → nivel por pirámide
    stats.ts                 # estado → stats (0-100)
    gating.ts                # qué pirámides/niveles están desbloqueados
    nextMission.ts           # qué hacer ahora
    events.ts                # selección y resolución de eventos
    rewards.ts               # XP, logros, objetos
    currency.ts              # detección de país, lookup SMM, formateo
    streaks.ts               # check-ins y rachas

  state/
    profile.ts               # store del perfil completo (Zustand)
    persistence.ts           # serialización/deserialización a localStorage
    importExport.ts          # JSON in/out

  views/
    Onboarding/              # primera entrada, presentación de la mascota
    Diagnosis/               # cuestionario inicial
    Tree/                    # dashboard principal con árbol
    Pyramid/                 # detalle de una pirámide
    Mission/                 # misión activa
    Library/                 # biblioteca
    Profile/                 # stats, inventario, logros
    Settings/                # exportar, importar, ajustar SMM, renombrar mascota

  components/
    Mascot/                  # avatar + bocadillos
    StatBar/
    Tree/                    # SVG animado del árbol
    Pyramid/                 # visualización de pirámide
    EventCard/
    AchievementBadge/
    OptionsPanel/            # panel de "opciones, no opiniones"
    inputs/                  # ChipGroup, RangeSlider, Toggle (low-friction)
    ...

  hooks/
  utils/
  types/                     # Profile, Mission, Pyramid, Mascot, etc.
```

### 6.3 Principios

- **Motor puro**: todas las funciones en `engine/` son puras y testeables sin DOM.
- **Contenido declarativo**: agregar una misión es agregar un objeto, no tocar lógica.
- **UI tonta**: las views no tienen lógica de negocio; consumen el motor y el state.
- **Sin servicios externos** en V1: nada de auth, nada de backend, nada de analytics.

### 6.4 Modelo de datos del perfil (sketch)

```ts
type Profile = {
  schemaVersion: number
  createdAt: string
  mascot: { name: string; stage: 'cria' | 'crecida' | 'veterana' }
  locale: { country: string; currencyCode: string; smm: number; smmEditedByUser: boolean }
  diagnosis: DiagnosisAnswers
  pyramids: {
    debt:       { level: 1|2|3|4|5; xp: number; missionsCompleted: string[] }
    stability:  { level: 1|2|3|4|5; xp: number; missionsCompleted: string[] }
    investment: { level: 1|2|3|4|5; xp: number; missionsCompleted: string[] }
  }
  stats: { liquidity: number; credit: number; margin: number; diversification: number; knowledge: number }
  inventory: { itemId: string; count: number }[]
  achievements: string[]
  streaks: { lastCheckIn: string; currentDays: number; bestDays: number }
  decisions: Record<string, string>   // ej: { debtMethod: 'avalanche' }
  history: ProfileEvent[]
}
```

---

## 7. Plan de fases

Cada fase termina con un **producto demostrable** — no solo código. Las estimaciones de tiempo son orientativas para una persona trabajando en ratos.

---

### Fase 0 — Limpieza y andamiaje
**Meta**: dejar el repo listo para construir encima sin lastre.
**Duración estimada**: 3-5 días.
**Dependencias**: ninguna.

**Tareas**:
- [ ] Borrar `scripts/drawio.xml`, `scripts/data.json`, `scripts/xml_to_json.py` y la carpeta `scripts/`.
- [ ] Borrar `src/steps.ts` y referencias en `App.tsx`.
- [ ] Reorganizar `src/` según §6.2: crear las carpetas vacías de `content/`, `engine/`, `state/`, `views/`, `components/`, `hooks/`, `utils/`, `types/`.
- [ ] Mover componentes actuales (`Score`, `Slide`, `AppContainer`, `ContentContainer`, `Tabs`, `TabContent`) a `legacy/` mientras decidimos qué reusar.
- [ ] Configurar **Vitest** + un test smoke (`pnpm test`).
- [ ] Agregar **Framer Motion** como dependencia.
- [ ] Agregar **Zustand** como store global con middleware `persist`.
- [ ] Verificar TypeScript en modo `strict`.
- [ ] Crear `src/types/index.ts` con tipos centrales: `Profile`, `Mission`, `Pyramid`, `Stat`, `Mascot`, etc. (tipos vacíos por ahora, se completan en Fase 1).
- [ ] Crear `src/state/profile.ts` con un store dummy persistido para verificar que `localStorage` funciona.
- [ ] Esqueleto de export/import JSON (función pura, sin UI todavía).
- [ ] Limpiar `App.tsx` para que sea un router/shell mínimo (puede ser solo un `<div>Hola</div>` para empezar).

**Criterio de cierre**:
- `pnpm dev` corre y abre una página vacía con shell.
- `pnpm test` corre y pasa con un test smoke.
- Un perfil dummy persiste entre recargas vía `localStorage`.

**Riesgos**: bajo. Si surge friction con MUI/Vite/Zustand/Vitest, ahora es el momento de resolverlo.

---

### Fase 1 — Motor + diagnóstico mínimo
**Meta**: el usuario puede hacer el diagnóstico y obtener nivel + stats.
**Duración estimada**: 2 semanas.
**Dependencias**: Fase 0.

**Tareas**:
- [ ] Implementar `engine/currency.ts`: detección de país via `Intl.Locale`, lookup en tabla SMM, formateo de patacoin (separadores de miles según locale).
- [ ] Crear `content/smm.ts` con tabla mínima de 7-8 países hispanohablantes (ver §2.5).
- [ ] Implementar `engine/leveling.ts`: respuestas → nivel por pirámide. Tests unitarios cubriendo casos representativos.
- [ ] Implementar `engine/stats.ts`: respuestas → stats 0-100. Tests unitarios.
- [ ] Implementar `engine/gating.ts`: reglas de prerrequisitos entre pirámides (§1.3).
- [ ] Escribir las 5-8 preguntas de `content/diagnosis.ts` con sus chips/sliders/toggles según §5.1.
- [ ] Componentes UI reusables low-friction: `ChipGroup`, `RangeSlider`, `Toggle` (en `components/inputs/`). Estilo MUI.
- [ ] View `Diagnosis/`: recorrido podado dinámicamente (saltar preguntas según respuestas anteriores).
- [ ] Persistir resultado del diagnóstico en el perfil.
- [ ] View `Tree/` mínima (solo texto): "Estás en Deuda 2, Estabilidad 1, Inversión 1".
- [ ] Permitir rehacer el diagnóstico desde una opción de menú.

**Criterio de cierre**:
- Un usuario nuevo abre la app, ve un onboarding mínimo, completa el diagnóstico en menos de 3 min sin tipear ningún número, y ve sus 3 niveles iniciales.
- Tests del motor (`leveling`, `stats`, `gating`, `currency`) pasan al 100%.
- Recargar la página mantiene el estado.

**Decisiones internas pendientes**:
- Definir umbrales exactos para cada nivel de cada pirámide (aterrizar los criterios cualitativos de §1.1 en valores numéricos).
- Decidir UX de "ajustar SMM": ¿solo en settings, o un acceso rápido al detectarse outlier?
- Número final de preguntas (5, 6, 7 u 8) según pruebas de UX rápidas.

**Riesgos**:
- Definir bien los umbrales de niveles puede tomar más tiempo del estimado. Mitigación: empezar con valores razonables, iterar con usuarios reales en Fase 6.

---

### Fase 2 — Pirámide de Deuda completa
**Meta**: una pirámide funcionando de punta a punta para validar el modelo.
**Duración estimada**: 2-3 semanas.
**Dependencias**: Fase 1.

**Tareas**:
- [ ] Co-escribir `content/pyramids/debt.ts`: 5 niveles × 3-7 misiones cada uno (~20-30 misiones).
- [ ] Cada misión tipada con: id, título, descripción, criterio de completada, recompensas, inputs si aplica.
- [ ] View `Pyramid/`: visualización de los 5 niveles de Deuda con misiones por nivel y barra de XP.
- [ ] View `Mission/`: detalle de la misión activa, botón "Marcar completada", animación de XP/recompensa.
- [ ] Implementar `engine/rewards.ts`: dar XP, otorgar logro si aplica, agregar objeto al inventario, subir stat correspondiente.
- [ ] Animaciones de recompensa con Framer Motion (subir XP, levelup, brillo del objeto).
- [ ] Migrar contenido del README sección "Deudas" a `content/library/debt/` en MDX.
- [ ] Conectar biblioteca a las misiones (cada misión enlaza al artículo relevante).
- [ ] **Onboarding de la mascota Pataco**: bienvenida + opción de renombrar antes de empezar.
- [ ] Bocadillos de Pataco para eventos clave: bienvenida, primera misión, primer levelup, primera misión fallida.
- [ ] Componente `Mascot/` con render del avatar y bubble de bocadillo.
- [ ] Panel de "opciones, no opiniones" para Nivel 3 (avalancha vs bola de nieve vs consolidación).

**Criterio de cierre**:
- Un usuario puede recorrer la Pirámide de Deuda end-to-end: ver nivel, abrir misión, leer biblioteca asociada, marcar completada, recibir recompensa, ver progreso.
- Mascota Pataco aparece, reacciona, y se puede renombrar.
- Una misión que pide elegir método de pago muestra un panel de opciones con tradeoffs.

**Decisiones internas pendientes**:
- Cantidad exacta de misiones por nivel.
- Formato visual de la pirámide (5 escalones discretos vs barra de progreso continua).

**Riesgos**:
- El contenido de las misiones es donde más tiempo se va. Mitigación: tener una plantilla clara y co-escribir en sesiones cortas.

---

### Fase 3 — Estabilidad e Inversión
**Meta**: las otras dos pirámides al mismo nivel de pulido.
**Duración estimada**: 3-4 semanas.
**Dependencias**: Fase 2.

**Tareas**:
- [ ] Co-escribir `content/pyramids/stability.ts` (5 niveles × 3-7 misiones).
- [ ] Co-escribir `content/pyramids/investment.ts` (5 niveles × 3-7 misiones).
- [ ] Migrar resto del README a biblioteca: `library/stability/`, `library/investment/`.
- [ ] Implementar paneles de "opciones, no opiniones" para decisiones clave: dónde guardar el fondo (Estabilidad N4), tipo de inversionista (Inversión N2), mecanismos de inversión (Inversión N4).
- [ ] Conectar `engine/gating.ts` con la UI: pirámides bloqueadas se ven distinto y tienen un mensaje claro ("Termina Estabilidad N3 para desbloquear esto").
- [ ] Reusar componentes `Pyramid/` y `Mission/` (no debería haber código nuevo significativo aquí).
- [ ] Bocadillos de la mascota específicos para cada pirámide.

**Criterio de cierre**:
- Las 3 pirámides funcionales con misiones, biblioteca y paneles de opciones.
- Usuario puede progresar en cualquier pirámide respetando los gates.
- Cobertura del README: todo el contenido educativo está accesible desde la biblioteca.

**Decisiones internas pendientes**:
- Tipo de inversión recomendado por país (ej: CDT en Colombia ↔ depósito a plazo en Chile). ¿Lo abstraemos o lo localizamos?

**Riesgos**:
- El contenido de Inversión es el más opinable. Mitigación: ser estrictamente "opciones, no opiniones".

---

### Fase 4 — El árbol
**Meta**: la pantalla "wow".
**Duración estimada**: 1-2 semanas.
**Dependencias**: Fase 3.

**Tareas**:
- [ ] Bocetar el árbol antes de codificar (papel/Figma).
- [ ] Diseñar SVG del árbol con 6 estados de raíces × 6 de tronco × 6 de copa (incluyendo nivel 0 = semilla).
- [ ] Implementar `components/Tree/`: render del árbol según estado del perfil; cada parte (raíz/tronco/copa) es un sub-componente parametrizado por nivel.
- [ ] Animación de crecimiento al subir de nivel (Framer Motion + interpolación SVG).
- [ ] Integrar el árbol como view principal del dashboard (`views/Tree/`).
- [ ] Pantalla "endgame" cuando los 3 niveles 5 se alcanzan: árbol da fruto, animación celebratoria, modo maestro desbloqueado.
- [ ] Tap en una parte del árbol → lleva a la pirámide correspondiente.

**Criterio de cierre**:
- Dashboard muestra el árbol del usuario en su estado actual.
- Al subir nivel, se ve la animación de crecimiento.
- Endgame existe y es satisfactorio.

**Riesgos**:
- **Riesgo principal**: el arte del árbol puede consumir mucho tiempo y verse mediocre si se hace a las carreras. Mitigación: para V1, una versión SVG geométrica sencilla (estilo low-poly o flat) es aceptable; el arte detallado puede venir post-launch o vía contratación de un ilustrador.

---

### Fase 5 — Capas de gamificación profundas
**Meta**: convertir la app de funcional a adictiva (en el buen sentido).
**Duración estimada**: 2 semanas.
**Dependencias**: Fase 4.

**Tareas**:
- [ ] Implementar `engine/events.ts` y banco de ~30 eventos en `content/events.ts` (emergencias, oportunidades, sustos).
- [ ] UI de evento aleatorio: card con la situación, opciones de respuesta, resolución según el estado del perfil.
- [ ] Sistema de rachas (`engine/streaks.ts`): check-in semanal, racha de semanas/días, mejor racha histórica.
- [ ] Recordatorio de check-in (notificación in-app cuando han pasado X días sin abrir).
- [ ] Sistema de quizzes en biblioteca: 3-5 preguntas por módulo con recompensa de XP de Conocimiento.
- [ ] Vista de **Inventario** (`views/Profile/Inventory/`): grilla de objetos coleccionables con su origen.
- [ ] Vista de **Logros** (`views/Profile/Achievements/`): grid de medallas, con bloqueadas en escala de grises.
- [ ] Mascota multi-estado: implementar transición visual cría → crecida → veterana según el promedio de niveles del usuario.
- [ ] Diccionario de bocadillos por contexto en `content/mascotLines.ts` con variantes por estado.

**Criterio de cierre**:
- Volver a la app después de unos días dispara un evento aleatorio.
- La mascota cambia de estado cuando subiste niveles.
- Inventario y logros muestran progreso visualmente.
- Las rachas se trackean y se muestran.

**Decisiones internas pendientes**:
- Frecuencia exacta de eventos (¿1 por semana? ¿1 cada 3 misiones?).
- Si los eventos pueden modificar el perfil real (ej: bajar fondo de emergencia) o solo son simulación.

**Riesgos**:
- Los eventos pueden sentirse intrusivos. Mitigación: dar al usuario opción de "no ahora" sin penalización.

---

### Fase 6 — Pulido y publicación
**Meta**: dejar algo que se pueda compartir.
**Duración estimada**: 1-2 semanas.
**Dependencias**: Fase 5.

**Tareas**:
- [ ] Onboarding pulido: animación de bienvenida, presentación de Pataco con texto del README adaptado, opción de renombrar.
- [ ] View `Settings/`: export JSON, import JSON, reset perfil, ajustar SMM, renombrar mascota, créditos.
- [ ] Configurar **PWA**: manifest, service worker, instalable en móvil; offline básico.
- [ ] Performance pass: bundle size, lazy loading de bibliotecas pesadas (MDX, Framer), code splitting por view.
- [ ] Accesibilidad básica: navegación por teclado, contrastes WCAG AA, atributos ARIA.
- [ ] Testing manual end-to-end con 3-5 usuarios reales (amigos/conocidos hispanohablantes de distintos países si es posible).
- [ ] Iterar el contenido más confuso según feedback.
- [ ] Registrar dominio + deploy (Netlify / Vercel / GitHub Pages).
- [ ] Política de privacidad mínima ("no recolectamos nada, todo vive en tu navegador").
- [ ] Página `About` con créditos, link al repo y propósito.

**Criterio de cierre**:
- App pública en una URL.
- Instalable en móvil como PWA.
- 3+ usuarios reales completaron al menos el diagnóstico y reportaron experiencia.
- Bundle inicial < 300 KB gzip (objetivo).

**Riesgos**:
- Feedback negativo masivo sobre el contenido. Mitigación: ya estuvo iterado en fases anteriores; aceptar que post-launch hay más cambios.

---

### Fase 7 — Iteración con feedback (continuo)
**Meta**: ajustar lo que choque con usuarios reales.
**Duración**: continua.
**Dependencias**: Fase 6.

**Tareas (recurrentes)**:
- [ ] Telemetría opt-in (PostHog en modo anónimo) para entender drop-off del diagnóstico, retención semanal, misiones más completadas/abandonadas.
- [ ] Iterar contenido de misiones que no funcionen.
- [ ] Agregar países/SMM faltantes según usuarios reales.
- [ ] Recolectar feedback (formulario in-app simple o link a un canal externo).
- [ ] Considerar Fase 8 (monetización) cuando haya métricas estables.

**Decisiones diferidas**:
- ¿Cuándo (y si) introducir auth + sync entre dispositivos?
- ¿Cuándo introducir un modo "premium"?
- ¿Vale la pena traducir a portugués para Brasil? (cambia la audiencia base)
- ¿Mantenemos la app local-only para siempre como ventaja competitiva?

---

## 8. Riesgos y decisiones aún abiertas

| Tema                              | Riesgo / pregunta                                                                | Quién decide y cuándo                                                  |
| --------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Diseño visual del árbol**       | Hacerlo bien es caro; hacerlo mal lo vuelve cliché                               | Bocetar antes de Fase 4. Versión simple SVG en V1; arte fino post.     |
| **Verificación honesta**          | Toda misión es auto-declarada. ¿Y si la gente miente?                            | Aceptar el riesgo. La app es para uno mismo, no hay leaderboard.       |
| **Contenido localizado**          | Productos bancarios varían por país                                              | Empezar genérico hispanohablante; señalar "consulta tu banco" donde aplique |
| **Avalancha de configuraciones**  | Si damos demasiadas opciones, abrumamos                                          | Defaults sensatos, opciones avanzadas escondidas                       |
| **Métricas de éxito**             | ¿Cómo sabremos si funciona?                                                      | Definir 2-3 KPIs antes de Fase 6 (retención 7d, # misiones/usuario)    |
| **Monetización futura**           | Premium con qué?                                                                 | Decidir post Fase 7 con datos reales                                   |
| **Tabla SMM desactualizada**      | El SMM cambia en cada país y la tabla queda obsoleta                             | Permitir override del usuario; revisión anual en releases              |
| **Diseño de la mascota**          | Si es genérica, no engancha; si es muy específica, no a todos les gusta          | Iterar en Fase 2 con bocetos rápidos; permitir renombrar siempre       |

---

## 9. Lo que entregaríamos al cierre de la V1

Una PWA en una URL, instalable en móvil, donde cualquier hispanohablante puede:

1. Hacer un diagnóstico de < 3 min sin teclear ningún número.
2. Ver su nivel actual en las 3 pirámides y su árbol naciendo.
3. Recibir misiones concretas, una a la vez, adaptadas a su situación.
4. Volver semanalmente a marcar progreso, recibir eventos, completar quizzes.
5. Ver su árbol crecer hasta dar fruto.
6. Exportar su perfil cuando quiera, sin que ningún dato suyo viva en un servidor.

Todo en español, con su mascota Pataco (o como la rebautice), sin dependencias de moneda externa, y sin recomendaciones dogmáticas — solo opciones bien explicadas.

---

## 10. Próxima acción concreta

Si este plan te cuadra, lo primero es **co-escribir el contenido de la Pirámide de Deuda** (5 niveles, sus misiones, sus criterios de salida concretos). Es el bloque más cercano al README actual y el que más rápido nos deja validar el modelo end-to-end.

En paralelo, si quieres avanzar en lo visual: **bocetar la mascota Pataco y el árbol en Figma o papel** sin presión de pulir, solo para tener una primera intuición visual.

> Marca con `?` o tacha lo que quieras cambiar; ajustamos y arrancamos por donde digas.
