# Propuesta — App de finanzas personales con modelo lúdico (v1)

> Documento vivo. Pensado para iterar contigo. Cada sección es una decisión que podemos discutir por separado.

---

## 1. Diagnóstico de lo que ya tienes

Antes de proponer, mi lectura de lo que existe hoy:

- **README**: una guía narrativa con "William" muy buena como contenido educativo. Tres bloques: deudas, presupuesto/ahorro, inversiones. Tiene tono, tiene historia, tiene un personaje. Eso es oro y deberíamos rescatarlo.
- **App actual**: un cuestionario lineal que se construye desde un diagrama `drawio.xml` → `data.json`. Recorre nodos (preguntas, acciones, definiciones) y va sumando o restando a un único score numérico que va de -100 a 100.
- **Datos**: ya tienes preguntas modeladas en tres áreas (Deuda, Ahorro, Inversión) con clasificaciones útiles (deuda buena/mala/ahorro/subsistencia, ingresos vs gastos, etc.).

**Dónde se cae el modelo actual** (no como crítica, como punto de partida):

1. **Un solo número no le dice al usuario qué hacer.** Que tu score sea 47/100 no te ayuda a decidir si pagar la tarjeta o abrir un CDT mañana.
2. **El cuestionario es lineal y largo.** Si todos pasan por todo, los que están en deuda mala se aburren con preguntas de inversión y los que ya invierten se aburren con preguntas de subsistencia.
3. **El contenido (William) y la mecánica (cuestionario) están desconectados.** William vive en el README, no aparece en la app. La parte lúdica que menciona el README se pierde.
4. **El pipeline drawio→json es frágil para autoría.** Cada cambio de contenido implica editar XML. Si quieres iterar rápido en preguntas y misiones, esto te va a frenar.
5. **No hay un "después".** El usuario responde, ve un número y se va. No hay siguiente paso, no hay misión, no hay vuelta.

---

## 2. La idea central

> **Tu situación financiera no es un puntaje, es un nivel en el que estás parado.** Y en cada nivel hay una próxima jugada óptima.

La app debería:

1. **Ubicarte rápido en un nivel** mediante un diagnóstico corto (5-10 min, no 30).
2. **Mostrarte el mapa entero** para que entiendas dónde estás y a dónde sigue.
3. **Darte misiones concretas** del tamaño correcto para tu nivel (no recomendar ETFs a alguien con tarjetas en mora).
4. **Volver a verte la cara**: el valor real está en regresar y ver progreso, no en una sola sesión.

La metáfora lúdica que propongo es una **escalera/pirámide financiera con personaje**, similar en espíritu a los "Baby Steps" de Dave Ramsey pero localizada (Latam, patacoin, William) y con un perfil multidimensional en vez de un único número.

---

## 3. El modelo lúdico

### 3.1 Niveles (la escalera)

Cinco niveles claros, cada uno con un nombre, un objetivo único y misiones para llegar al siguiente. El usuario solo puede estar en **un** nivel a la vez — esto es importante porque elimina la parálisis del "¿por dónde empiezo?".

| Nivel | Nombre                | Objetivo único                                      | Cuándo lo superas                                              |
| ----- | --------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| 0     | **Sobrevivencia**     | Cubrir gastos básicos del mes                       | Tus ingresos cubren tus gastos obligatorios sin endeudarte más |
| 1     | **Salir del hoyo**    | Eliminar deuda mala con tasas altas                 | Sin deudas mala con tasa > X%, o con un plan activo en marcha  |
| 2     | **Construir la base** | Fondo de emergencia (3-6 meses) y control de gastos | Tienes el fondo + sabes en qué gastas mes a mes                |
| 3     | **Hacer crecer**      | Invertir el excedente con perfil definido           | Tienes un portafolio acorde a tu perfil de riesgo/tiempo       |
| 4     | **Libertad**          | Ingresos pasivos que cubren tu estilo de vida       | Tu portafolio rinde lo que necesitas para vivir                |

> **Por qué niveles y no un score**: porque "estás en nivel 1" se traduce a una acción en lenguaje humano. Un score de 47 no.

### 3.2 Perfil del personaje (los stats)

Dentro de cada nivel, el usuario tiene un avatar (puede ser William, o un avatar que él/ella elige) con **stats visibles** que reflejan dimensiones distintas:

- **Liquidez** — cuántos meses de gastos puedes cubrir hoy
- **Salud crediticia** — relación deuda/ingreso, tasas, puntualidad
- **Margen** — ingreso menos gastos como % del ingreso
- **Diversificación** — qué tan repartidas están tus inversiones (cuando aplique)
- **Conocimiento** — módulos educativos completados

Cada stat se llena al hacer el diagnóstico inicial y se actualiza cuando completas misiones o vuelves a actualizar tu situación.

> **Por qué stats múltiples**: porque dos personas en el mismo nivel pueden tener cuellos de botella distintos. Stats te dejan ver el cuello de botella sin necesidad de bajar a un texto largo.

### 3.3 Misiones

Cada nivel tiene 3-7 misiones. Una misión es **concreta, accionable, y verificable por el usuario** (no por la app — no le pedimos credenciales bancarias).

Ejemplos:

- _Nivel 1, Misión "Lista negra"_: lista cada deuda con su saldo, tasa y cuota. (5 min, te lo guarda local)
- _Nivel 1, Misión "Avalancha o bola de nieve"_: te explico ambos métodos y eliges uno.
- _Nivel 2, Misión "Mes vivido"_: registra todos tus gastos durante 30 días con la herramienta que prefieras y vuelves a entrar.
- _Nivel 3, Misión "Test de inversionista"_: 8 preguntas para definir riesgo + horizonte (esto ya lo tienes en parte).

Las misiones generan el **engagement de retorno**: la app te pide volver en X días para verificar que la cumpliste. No la cumples → seguimos en el mismo nivel sin juzgarte.

### 3.4 William vive en la app

William deja de ser un personaje del README y se vuelve **el guía/narrador**. Aparece con bocadillos, hace preguntas, reacciona a tus respuestas. El tono divertido que ya tienes en el README se traslada como capa narrativa sobre la mecánica.

> **Por qué importa**: el contenido educativo del README es lo más diferenciador de tu proyecto vs. cualquier otra calculadora financiera genérica. No hay que botarlo, hay que integrarlo.

---

## 4. Cómo se siente la primera sesión

Para hacer concreto el modelo, esto es lo que el usuario vive la primera vez que entra:

1. **Pantalla de bienvenida**: William saluda. "Vamos a ubicarte en el mapa en 5 minutos."
2. **Diagnóstico corto** (~8 preguntas, no 30): ingresos aproximados, gastos obligatorios, ¿deudas?, ¿fondo de emergencia?, ¿inviertes?. **El árbol se poda dinámicamente**: si dices "no tengo deudas", saltamos toda la rama de deuda.
3. **Revelación del nivel**: "Estás en Nivel 2: Construir la base." Animación, contexto, qué significa.
4. **Mapa completo visible**: ves los 5 niveles, los anteriores marcados como completados, el siguiente como bloqueado.
5. **Tu siguiente jugada**: una sola misión recomendada, no un menú abrumador. "Antes de invertir, asegura tu fondo de emergencia. Calcúlalo aquí." Dos botones: "Empezar" / "Más tarde".
6. **Biblioteca abierta**: la guía estilo William queda accesible siempre, pero no obligatoria. Indexada por nivel.

Total tiempo: ~10 minutos. Salida: el usuario sabe **exactamente** qué hacer mañana.

---

## 5. Qué pasa con la app actual

Mi recomendación es **conservar la stack** (React + Vite + TS + MUI) pero reescribir el contenido y el flujo. No es tirar el trabajo, es reusar la base técnica con un modelo más sólido encima.

**Qué se queda:**
- React/Vite/TS, MUI, estructura de carpetas.
- El componente `Score` y `Slide` (animaciones reusables).
- Las preguntas que ya escribiste — son buenas, hay que reorganizarlas por nivel.
- El espíritu del README como contenido educativo central.

**Qué se va o se transforma:**
- El pipeline `drawio.xml` → `data.json`. Lo cambiaría por **definiciones de contenido en TypeScript o MDX** para iterar rápido y tener tipos. (drawio fue ingenioso para visualizar pero te frena al editar.)
- El score lineal de -100 a 100 → reemplazado por nivel + stats.
- El cuestionario lineal único → diagnóstico podado + misiones por nivel.

**Qué se agrega:**
- Persistencia local (localStorage o IndexedDB) — sin cuentas, sin servidor, sin datos sensibles. El usuario puede exportar/importar su perfil.
- Un motor de reglas pequeño que mapea respuestas → nivel + stats.
- Una vista de "mapa" y una vista de "misión activa".

---

## 6. Arquitectura propuesta (alto nivel, no para implementar aún)

```
src/
  content/                 # contenido en TS/MDX, autoría rápida
    levels/                # definición de los 5 niveles
    missions/              # misiones por nivel
    diagnosis/             # preguntas del diagnóstico inicial
    library/               # guía estilo William, indexada por nivel/tema
  engine/                  # motor de reglas (puro, testeable)
    leveling.ts            # respuestas → nivel
    stats.ts               # respuestas → stats
    nextMission.ts         # nivel + stats → próxima misión recomendada
  state/                   # persistencia local del perfil del usuario
  views/
    Diagnosis/             # flujo del diagnóstico
    Map/                   # los 5 niveles visualizados
    Profile/               # avatar + stats
    Mission/               # misión activa
    Library/               # contenido educativo
  components/              # reusables (Score → StatBar, Slide, etc.)
```

La clave es: **el motor es puro y testeable**, el contenido es declarativo, la UI sólo renderiza. Esto te deja iterar contenido sin tocar lógica y al revés.

---

## 7. Decisiones que necesito de ti antes de seguir

Para evitar diseñar algo que no es lo que tienes en mente, estas son las preguntas que cambian el resto del diseño. Puedes responder solo las que tengas opinión:

1. **¿Audiencia?** ¿Es para hispanohablantes en general, Colombia específicamente (patacoin sugiere eso), o algo más amplio? Esto cambia ejemplos, monedas y referencias bancarias.
2. **¿Cuántos niveles?** ¿Cinco te parece bien, o prefieres más granularidad (7-8) o menos (3)?
3. **¿William sí o no?** ¿Lo conservamos como narrador, lo reemplazamos por un avatar configurable, o ambas cosas?
4. **¿Persistencia?** ¿Local-only (privacidad total, sin cuentas) o quieres habilitar cuentas para sincronizar entre dispositivos? Mi recomendación inicial es local-only.
5. **¿Idioma?** ¿Solo español, o pensamos en i18n desde el principio?
6. **¿Monetización / propósito?** ¿Esto es proyecto personal, portafolio, idea de producto? Cambia el nivel de "polish" que vale la pena.
7. **¿Qué tan opinado quieres ser?** Algunos métodos (avalancha vs bola de nieve, % en renta variable por edad, etc.) son polémicos. ¿Prefieres una sola recomendación clara, o varias opciones con tradeoffs?

---

## 8. Lo que NO es esta propuesta

Para alinear expectativas:

- **No es una app de tracking de gastos**: no compite con Fintonic, Monefy, Ivy Wallet. Tu app no registra cada compra; orienta a alta velocidad.
- **No es un robo-advisor**: no recomienda activos específicos. Recomienda categorías y habits.
- **No es un curso**: el contenido educativo está, pero la unidad de valor es la **misión cumplida**, no la lección leída.
- **No es una calculadora**: aunque incluye herramientas (calcular fondo de emergencia, simular avalancha de deuda), la calculadora es un medio, no el producto.

Lo que sí es: un **GPS financiero personal** que te dice dónde estás, a dónde sigue, y la siguiente jugada concreta — con tono y narrativa que no se sienta como un Excel con esteroides.

---

## 9. Próximos pasos sugeridos

Cuando estés listo para iterar, en orden:

1. Responder/discutir las preguntas de §7.
2. Definir los **5 niveles** con criterios de entrada/salida concretos (esto se vuelve la columna vertebral).
3. Listar las **misiones del Nivel 0 y 1** completas, con su criterio de "completada". Si esto se siente sólido, el resto cae en cascada.
4. Diseñar el flujo del diagnóstico inicial (qué se pregunta, en qué orden, podado por respuestas).
5. Hacer un mockup en papel/Figma del mapa, perfil y misión activa antes de tocar código.
6. Recién ahí, atacar la implementación reusando lo de la app actual.

---

_Escrito para empezar la conversación, no para cerrarla. Marca con `?` o tacha lo que no te cuadra y seguimos._
