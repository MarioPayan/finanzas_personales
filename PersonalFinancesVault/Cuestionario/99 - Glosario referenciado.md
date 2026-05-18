# Glosario referenciado

Términos que el cuestionario expone al usuario en el panel lateral cuando
aparecen literalmente en el texto de la pregunta o sus opciones. La fuente
de verdad técnica es `src/content/glossary.ts`.

Una entrada del glosario solo se le muestra al usuario si el término aparece
escrito en algún nodo activo (pregunta actual o ya respondida). Esto evita
"definir lo que no se mencionó". Detalle de la regla en
[[Lineamientos/05 - Glosario y ejemplos]].

## Entradas

### SMM

**Salario Mínimo Mensual:** el ingreso mínimo legal en tu país, fijado por
el gobierno. Lo usamos como referencia para que las preguntas funcionen
sin importar la moneda.

Aparece en: [[01 - Base (salario y gastos)#Ingresos mensuales · `incomeBand`]].

### EA

**Tasa Efectiva Anual:** cuánto crece una deuda en un año si no pagas
nada. Es la forma estándar de comparar tasas entre productos.

Aparece en: [[02 - Deudas#Tasa de cada deuda · `debtRates`]],
[[04 - Inversiones#Rendimiento por vehículo · `investmentYields`]].

### Gastos obligatorios

Lo que no puedes dejar de pagar este mes sin consecuencias serias:
vivienda, servicios, transporte, comida básica, salud.

Aparece en: [[01 - Base (salario y gastos)#Gastos obligatorios · `obligatoryPct`]].

### Fondo de emergencia

Dinero líquido reservado para imprevistos (despido, salud, daño grave). Se
mide en meses de tus gastos obligatorios.

Aparece en: [[03 - Estabilidad#Fondo de emergencia · `emergencyMonths`]].

### CDT

**Certificado de Depósito a Término:** un producto bancario donde dejas
dinero un plazo fijo a cambio de una tasa garantizada.

Aparece en: [[04 - Inversiones#Vehículos de inversión · `investmentVehicles`]].

### Diversificación

Repartir el dinero en distintos vehículos (acciones, fondos, bienes
raíces, etc.) para que un mal año en uno no destruya todo.

Aparece en: [[04 - Inversiones#Vehículos de inversión · `investmentVehicles`]].

### Deuda de inversión

Deuda que se toma para producir más dinero del que cuesta el interés.

Aparece en: [[02 - Deudas#Naturaleza de cada deuda · `debtKinds`]].

### Deuda de ahorro

Deuda que reemplaza un gasto recurrente por un activo que se conserva.

Aparece en: [[02 - Deudas#Naturaleza de cada deuda · `debtKinds`]].

### Deuda mala

Deuda tomada para gastos que no producen ingreso ni evitan otro gasto.
Suele ser la más urgente de pagar.

Aparece en: [[02 - Deudas#Naturaleza de cada deuda · `debtKinds`]].

### Apalancamiento contra activos

Tomar deuda usando activos como garantía en vez de venderlos: conservas
el activo, evitas el impuesto a la ganancia, y el costo es la tasa que
pagas. Es la mecánica que usan los patrimonios grandes para financiar
consumo sin liquidar inversiones.

Aparece en: [[02 - Deudas#Naturaleza de cada deuda · `debtKinds`]].

### Fondo indexado

Vehículo que replica un índice de mercado (S&P 500, MSCI World, etc.)
a bajo costo, en vez de elegir activos uno por uno. En plazos largos
le gana a la mayoría de fondos gestionados activamente.

Aparece en: [[04 - Inversiones#Uso de fondos indexados · `usesIndexFunds`]].

### Interés compuesto

Rendimiento que se reinvierte y genera nuevo rendimiento sobre el
rendimiento previo. Es la variable que más amplifica empezar temprano:
cada año adicional invertido vale más que el anterior.

Aparece en: [[04 - Inversiones#Años invirtiendo · `yearsInvesting`]].

### Sistema de cubetas

Dividir el ingreso entrante en compartimentos con un destino predefinido
(gastos obligatorios, fondo de emergencia, inversión, gusto). Puede ser
mental, en cuentas separadas, o automatizado por el banco. Predice mejor
el cumplimiento de ahorro que el monto guardado.

Aparece en: [[01 - Base (salario y gastos)#Sistema de cubetas · `hasBudgetSystem`]].
