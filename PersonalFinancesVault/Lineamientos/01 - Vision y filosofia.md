# Visión y filosofía

## Qué es la aplicación

Una herramienta de diagnóstico financiero personal que arranca con un
cuestionario corto y produce una lectura del estado del usuario en cuatro
ejes: **Base** (ingresos y gastos), **Deudas**, **Estabilidad** (fondo de
emergencia) e **Inversiones**.

El cuestionario es chips/sliders/toggles antes que tipear cifras: la pantalla
no le exige al usuario precisión que no tiene, le ofrece bandas razonables.

## Qué no es

- **No es un libro contable.** No registra transacciones, no concilia, no
  proyecta a largo plazo.
- **No es un asesor.** No promete consejos legales/tributarios, no recomienda
  productos.
- **No es invasiva.** No pide acceso a cuentas, no almacena datos en remoto, no
  pide permisos del navegador (salvo lo que necesita para inferir el país).

## Principios rectores

### Mínima fricción para el usuario

El cuestionario es la puerta de entrada al diagnóstico. Si el usuario se
siente abrumado por la cantidad de campos, la complejidad de las preguntas, o
la fricción de cada interacción, va a abandonar antes de terminar — y un
diagnóstico no entregado vale cero.

Cada decisión de diseño se evalúa contra ese costo: **¿esto le pide al usuario
más esfuerzo del estrictamente necesario?** Algunas implicaciones concretas:

- Bandas y chips antes que campos numéricos. La precisión la inferimos a
  partir de bandas y derivaciones; el usuario no debería tener que conocerla.
- Defaults razonables en sliders y entradas numéricas. Avanzar sin tocar nada
  debería ser una opción válida.
- **Una sola representación visual para todos los pasos.** La fricción
  cognitiva de "este paso se comporta distinto que el anterior" se acumula y
  es real, aunque sea sutil. Si dos nodos del mismo tipo no se ven y se
  comportan idénticos, es un bug.
- Layouts compactos cuando hay repetición (varias deudas, varios vehículos):
  preferir grillas tabulares antes que listas verticales que crecen.
- Sin login, sin permisos, sin pedir cuentas externas, sin datos sensibles.
- Atajos para casos comunes (auto-avance al elegir un chip, valor exacto
  opcional, etc.) son bienvenidos **siempre que no rompan la consistencia**.

Entre dos opciones equivalentes en calidad de diagnóstico, gana la que pide
menos clics, menos decisiones y menos lectura.

### Nodos autocontenidos

Cada paso del diagnóstico (cada "nodo" del cuestionario) debe poseer toda la
información necesaria para presentarlo y para analizarlo fuera de la
aplicación. Eso incluye su título, descripción, pregunta, opciones, glosario
referenciado, ejemplos, brackets numéricos, derivaciones, dependencias, y los
widgets que necesita en el panel lateral.

La consecuencia práctica: el array `DIAGNOSIS_QUESTIONS` debería poder
serializarse a JSON y entregarse a un sistema externo (un análisis de
respuestas, una visualización offline, una versión alternativa de la UI) sin
necesidad de exportar lógica adicional.

## Lo que sigue de aquí

- La estructura del nodo se documenta en [[02 - Estructura de los nodos]].
- El árbol, el glosario y los widgets del panel lateral se cubren en
  [[03 - Panel lateral]].
- Las fórmulas que cruzan respuestas previas con el nodo actual viven en
  [[04 - Derivaciones y formulas]].
