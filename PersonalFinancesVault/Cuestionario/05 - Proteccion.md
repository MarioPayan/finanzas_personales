# Cuestionario · 05 — Protección

> Sección nueva en mayo 2026. Cubre los seguros y la red de protección
> contra riesgos grandes (laborales, vida, salud, vivienda). Reemplaza
> al toggle simple `hasHealthInsurance` que vivía en Estabilidad.

Fuente: `src/content/diagnosis.ts` (categoría `protection`). Para detalle
estructural del flujo, ver [[00 - Indice]].

---

## Situación de vivienda · `ownsHome`

- **Mide**: cómo el usuario habita su vivienda.
- **Cuándo se muestra**: siempre.
- **Tipo**: `chips`.
- **Prompt**: ¿Cómo es tu vivienda actual?
- **Opciones**:
  - `mortgaged` — Propia con hipoteca (score 80)
  - `owned` — Propia sin hipoteca (score 100)
  - `rented` — Arrendada (score 60)
  - `family` — Familiar / sin pagar (score 50)
  - `other` — Otra (40)
- **Puntaje**: aporta al promedio de Protección.
- **Gates que habilita**: `hasHomeInsurance` (sólo si `mortgaged`/`owned`).
- **Insights**: ninguno directo — sirve como gate.

---

## Cobertura de riesgos laborales (ARL) · `hasARL`

- **Mide**: si el usuario independiente tiene ARL activa.
- **Cuándo se muestra**: si `formalEmployment ∈ {independent, mixed}`.
- **Tipo**: `toggle`.
- **Prompt**: ¿Estás afiliado a una ARL?
- **Hint**: ARL = Administradora de Riesgos Laborales. Si eres empleado
  formal, generalmente la paga tu empleador. Si eres independiente, la
  tienes que activar tú.
- **Glosario**: `arl`.
- **Puntaje**: `{whenTrue: 100, whenFalse: 20}`.
- **Insights**:
  - `noARLIndependent` (critical) — si independiente sin ARL.
    *Tarifa 0,5%-7% del IBC según clase de riesgo y es deducible.
    Activarla cuesta poco y tapa un agujero grande.*

---

## Seguro de vida · `hasLifeInsurance`

- **Mide**: si el usuario tiene seguro de vida acorde a su situación.
- **Cuándo se muestra**: si `hasDependents > 0`.
- **Tipo**: `toggle`.
- **Prompt**: ¿Tienes seguro de vida?
- **Hint**: No el seguro funerario chico, sino uno que cubra a quien
  depende económicamente de ti si falleces.
- **Puntaje**: `{whenTrue: 100, whenFalse: 20}`.
- **Insights**:
  - `noLifeInsuranceWithDependents` (critical) — si dependientes ≥ 1
    sin seguro. *Suma asegurada recomendada 5-10× ingreso anual;
    pólizas a plazo (no whole-life) son baratas para edades jóvenes.*

---

## Cobertura de salud · `hasHealthCoverage`

- **Mide**: nivel de cobertura de salud del usuario. Reemplaza el
  toggle anterior `hasHealthInsurance` con más granularidad.
- **Cuándo se muestra**: siempre.
- **Tipo**: `chips`.
- **Prompt**: ¿Qué cobertura de salud tienes?
- **Opciones**:
  - `none` — Sin cobertura (score 0)
  - `public` — Solo público / EPS (60)
  - `complementary` — Plan complementario (85)
  - `prepaid` — Medicina prepagada (100)
- **Insights**:
  - `noHealthCoverage` (critical) — si `none`.
  - `minimumHealthCoverageOlder` (warning) — si `public` y `age ≥ 40`.

---

## Seguro de hogar · `hasHomeInsurance`

- **Mide**: si la vivienda propia (o hipotecada) tiene seguro de
  incendio/terremoto/contenido.
- **Cuándo se muestra**: si `ownsHome ∈ {mortgaged, owned}`.
- **Tipo**: `toggle`.
- **Prompt**: ¿Tu vivienda tiene seguro?
- **Hint**: Cubre incendio, terremoto, daños por agua, hurto. En
  Colombia es zona sísmica activa.
- **Puntaje**: `{whenTrue: 100, whenFalse: 30}`.
- **Insights**:
  - `noHomeInsuranceOwned` (warning) — si propia sin hipoteca y sin
    seguro. *Costo típico anual: 0,2-0,5% del valor del inmueble.*

---

## Perfiles de personaje (sección Protección)

Tabla en `src/content/profiles.ts` y resumen en
[[../Lineamientos/07 - Perfiles de personaje]]. Cinco bandas: "Sin
cobertura", "Cobertura parcial", "Bien cubierto en lo esencial",
"Bien protegido", "Protección completa".
