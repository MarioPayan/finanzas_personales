# Lineamientos

Reglas generales que rigen cómo está pensada esta aplicación. **No** son una
guía de cómo usarla ni un tutorial — son los principios bajo los que se diseña
y se hace crecer el código y los datos.

Si vas a tocar algo en `src/`, leé esto primero. Si lo que vas a cambiar
afecta uno de estos documentos, actualizalo en la misma pasada.

## Documentos

1. [[01 - Vision y filosofia]] — Qué es la aplicación, qué no es, y los dos
   principios rectores: mínima fricción para el usuario y nodos
   autocontenidos.
2. [[02 - Estructura de los nodos]] — El principio del "nodo fuerte": cada
   pregunta es autocontenida, analizable fuera de la app y extensible sin tocar
   código compartido.
3. [[03 - Panel lateral]] — Composición del sidebar (árbol, glosario, widgets)
   y cómo decide qué mostrar.
4. [[04 - Derivaciones y formulas]] — Cómo las opciones se contextualizan con
   el dinero real del usuario usando respuestas previas.
5. [[05 - Glosario y ejemplos]] — Reglas del glosario (qué se incluye y cuándo)
   y de los ejemplos (dónde viven y dónde no).
6. [[06 - Como extender]] — Receta para agregar preguntas, tipos, widgets,
   reglas de derivación, países, términos del glosario.

## Ver también

- [[../Cuestionario/00 - Indice|Cuestionario]] — Referencia legible para
  revisores financieros: cada pregunta del diagnóstico documentada con su
  prompt, opciones, dependencias y derivaciones, sin leer código. Se
  actualiza en la misma pasada en que se modifica el cuestionario.
