# Especificación de contenido para integrar en la página — Modelado Cardio

**Proyecto:** `santiemanuel/modelado-cardio`  
**Producto sugerido:** Presión Bajo Control  
**Fecha de preparación:** 2026-06-24  
**Idioma principal:** Español rioplatense/neutro con tono claro, preventivo y responsable  
**Dataset a mantener:** NHANES 2017–2018  
**Cambio de dataset:** No aplicar. Este documento asume que el producto seguirá trabajando con el mismo dataset y con el artefacto/modelo actual o sus versiones derivadas del mismo dataset.  
**Uso previsto:** Sitio educativo y evaluación orientativa de señales cardiometabólicas compatibles con hipertensión.  
**Uso no permitido:** Diagnóstico médico autónomo, prescripción, ajuste de medicación, reemplazo de medición de presión arterial o reemplazo de consulta profesional.

---

## 0. Resumen ejecutivo

La página debe evolucionar desde una landing con formulario hacia un sitio completo de producto preventivo. La estrategia recomendada es organizar el contenido en seis áreas:

1. **Landing comercial/educativa:** explica el problema, la utilidad del formulario y el alcance no diagnóstico.
2. **Formulario de evaluación:** guía al usuario paso a paso, con consentimiento, unidades, validación y ayudas.
3. **Resultado orientativo:** muestra probabilidad, umbral, tramo de prioridad, próximos pasos y limitaciones.
4. **Sobre el modelo / Model Card:** explica dataset, variables, métricas, thresholds, exclusiones y limitaciones.
5. **Educación cardiometabólica:** presión arterial, medición correcta, IMC, cintura, colesterol, HDL, HbA1c y tabaquismo.
6. **Recursos locales y privacidad:** directorio de centros/laboratorios en Salta Capital, política de datos y FAQ.

El sitio debe repetir una idea central en puntos estratégicos:

> **Esta herramienta no diagnostica hipertensión. Ordena señales indirectas para ayudar a decidir cuándo medir presión, repetir controles o consultar con un equipo de salud.**

---

## 1. Arquitectura de páginas recomendada

### 1.1 Rutas sugeridas

```txt
/                     Landing principal
/evaluar              Formulario de evaluación
/modelo               Sobre el modelo / Model Card
/metodologia          Dataset, variables y prevención de fuga de información
/educacion            Guías educativas de presión arterial y variables cardiometabólicas
/recursos             Directorio local de laboratorios y centros de salud
/privacidad           Privacidad, consentimiento y uso de datos
/faq                  Preguntas frecuentes
/404                  Página no encontrada
```

### 1.2 Componentes de contenido sugeridos

```txt
src/content/landingContent.ts
src/content/evaluationContent.ts
src/content/resultContent.ts
src/content/modelCardContent.ts
src/content/educationContent.ts
src/content/faqContent.ts
src/content/privacyContent.ts
src/content/localResourcesContent.ts
src/content/sourceContent.ts
```

### 1.3 Reglas editoriales globales

- Usar siempre **“evaluación orientativa”**, **“señales compatibles”**, **“prioridad de revisión”** y **“próximos pasos”**.
- Evitar frases como **“tenés hipertensión”**, **“estás sano”**, **“no tenés riesgo”**, **“debés medicarte”** o **“el modelo diagnostica”**.
- Usar **“presión arterial”** para educación general y aclarar que el modelo actual **no usa presión arterial como entrada**.
- Explicar que el dataset es **NHANES 2017–2018**, una encuesta de Estados Unidos; por lo tanto, su uso fuera de esa población debe interpretarse con cautela.
- Mantener visible que el producto está orientado a **adultos de 20 años o más**.
- No pedir `INDFMPIR` al usuario. En la versión actual, esa variable se completa internamente como faltante para compatibilidad con el pipeline.

---

## 2. Landing principal (`/`)

### 2.1 Hero

**Título recomendado**

> Detectá señales cardiometabólicas antes de que la presión alta pase inadvertida

**Subtítulo recomendado**

> Una evaluación orientativa que combina edad, mediciones corporales, laboratorio y hábitos para ayudarte a decidir cuándo conviene medir la presión, repetir controles o conversar con un equipo de salud.

**CTA principal**

> Evaluar señales

**CTA secundario**

> Conocer cómo funciona

**Microcopy bajo CTA**

> No diagnostica hipertensión. El resultado debe confirmarse con medición de presión arterial y criterio profesional.

**Nota de integración**

- CTA principal debe navegar a `/evaluar`.
- CTA secundario puede hacer scroll a `#como-funciona`.
- En mobile, mostrar primero CTA principal y luego microcopy.

**Fundamento público**

CDC indica que la presión alta suele no presentar signos o síntomas y que medir la presión es la única forma de saber si está elevada. Ver fuentes [S1] y [S2].

---

### 2.2 Banda de confianza / trust strip

**Título opcional**

> Evaluación responsable

**Items**

| Item | Texto corto |
|---|---|
| No diagnóstico | No reemplaza consulta médica ni medición de presión. |
| Datos habituales | Usa edad, mediciones corporales, laboratorio y hábitos. |
| Modelo documentado | Basado en NHANES 2017–2018 y métricas trazables. |
| Enfoque preventivo | Ayuda a ordenar señales para conversar mejor con un profesional. |

**Microcopy complementario**

> Un resultado bajo no descarta hipertensión. Un resultado alto no la confirma. La presión arterial se confirma con mediciones reales.

---

### 2.3 Sección “Cómo funciona”

**ID sugerido:** `como-funciona`

**Título**

> Cómo funciona en 3 pasos

**Cards**

#### 1. Cargás tus datos

> Ingresás edad, peso, altura, cintura, colesterol total, HDL, hemoglobina glicosilada, sexo, grupo étnico reportado y tabaquismo actual.

#### 2. El modelo ordena señales

> El sistema calcula el IMC, arma el registro esperado por el modelo y devuelve una probabilidad orientativa de señales compatibles con hipertensión.

#### 3. Revisás próximos pasos

> El resultado te ayuda a decidir si conviene medir presión, repetir controles, preparar una consulta o registrar datos para seguimiento.

**Nota UX**

Agregar una frase al final:

> La evaluación funciona mejor si tenés datos recientes de laboratorio. Si no los tenés, podés usar la página para saber qué información te falta.

---

### 2.4 Sección “Qué hace esta herramienta”

**Título**

> Una lectura preventiva, no un diagnóstico

**Texto**

> Esta herramienta estima señales compatibles con hipertensión a partir de datos cardiometabólicos indirectos. Usa información como edad, IMC, cintura, colesterol total, HDL, hemoglobina glicosilada, sexo, grupo étnico reportado y tabaquismo actual. El objetivo es orientar próximos pasos: medir presión arterial, repetir controles, organizar datos o consultar con un profesional.

**Cards**

#### Ordena señales

> Integra datos que suelen aparecer en controles clínicos o de laboratorio.

#### Prioriza próximos pasos

> Ayuda a identificar cuándo conviene no dejar pasar una medición de presión.

#### Evita diagnóstico automático

> No reemplaza tensiómetro, laboratorio, historia clínica ni consulta médica.

#### Diseño responsable

> El modelo evita usar como entradas las mismas variables de presión arterial que definen la etiqueta, para reducir fuga de información.

---

### 2.5 Sección “Qué NO hace”

**Título**

> Lo que esta herramienta no debe prometer

**Texto principal**

> Esta evaluación no diagnostica hipertensión, no indica medicación, no reemplaza una consulta médica y no debe usarse para decidir tratamientos. Un resultado bajo no descarta presión alta. Un resultado alto no confirma hipertensión. La presión arterial se confirma con mediciones reales, realizadas con técnica adecuada y revisadas por un profesional.

**Lista corta para UI**

- No diagnostica.
- No prescribe medicación.
- No reemplaza medir presión.
- No reemplaza seguimiento médico.
- No sirve para emergencias.

**Callout de seguridad**

> Si tenés síntomas preocupantes, malestar intenso o una medición de presión extremadamente elevada, buscá atención médica urgente por los canales locales.

**Fundamento público**

CDC indica que los equipos de salud diagnostican presión alta revisando los valores sistólicos y diastólicos frente a guías clínicas. La American Heart Association aclara que solo un médico u otro profesional puede confirmar un diagnóstico de presión alta. Ver fuentes [S1] y [S3].

---

### 2.6 Sección “Datos que necesitás antes de empezar”

**Título**

> Tené estos datos a mano

**Texto**

> Para usar la evaluación completa necesitás algunos datos personales, mediciones corporales y resultados simples de laboratorio. Si no tenés laboratorio reciente, la herramienta puede servirte como guía para saber qué datos pedir o conversar en un control.

| Dato | Unidad / tipo | Label sugerido | Ayuda breve para UI |
|---|---:|---|---|
| Edad | años | Edad | Personas adultas de 20 años o más. |
| Peso | kg | Peso | Se usa junto con altura para calcular IMC. |
| Altura | cm | Altura | Se usa junto con peso para calcular IMC. |
| Cintura | cm | Perímetro de cintura | Medición abdominal, útil como señal cardiometabólica. |
| Colesterol total | mg/dL | Colesterol total | Parte del perfil lipídico. |
| HDL | mg/dL | HDL | Conocido como “colesterol bueno”. |
| Hemoglobina glicosilada | % | HbA1c | Refleja promedio de glucosa de los últimos meses. |
| Sexo | categoría | Sexo reportado | Categoría usada por el dataset original. |
| Grupo étnico reportado | categoría NHANES | Grupo étnico reportado | Variable del dataset original; puede no representar identidades locales. |
| Tabaquismo actual | sí/no | Fumador actual | Señal derivada de preguntas de consumo actual de cigarrillos. |

**Nota de integración**

- Mostrar este bloque antes del CTA final.
- En `/evaluar`, repetirlo de forma resumida en el primer paso.

**Fundamento público**

NHANES documenta edad, sexo, raza/origen hispano, pesos muestrales y variables demográficas en `DEMO_J`; también documenta peso, altura, cintura e IMC en `BMX_J`. Ver fuentes [S9] y [S10].

---

### 2.7 Sección “Por qué primero medir presión”

**Título**

> La presión alta no siempre se siente

**Texto**

> Muchas personas pueden tener presión arterial elevada sin notar síntomas. Por eso, la medición sigue siendo la referencia principal. Esta herramienta no reemplaza esa medición: ayuda a ordenar señales indirectas para que no dejes pasar un control importante.

**Cards de prioridad**

1. **Medición real de presión arterial** — Referencia principal.  
2. **Contexto cardiometabólico** — Señales indirectas.  
3. **Consulta profesional** — Decisión clínica.

**Fundamento público**

CDC indica que la presión alta generalmente no presenta signos de advertencia y que la medición es la única forma de saber si existe presión alta. Ver [S1] y [S2].

---

### 2.8 CTA final

**Título**

> Usá el formulario cuando tengas tus datos a mano

**Texto**

> Vas a recibir una predicción orientativa y una guía de próximos pasos para decidir si corresponde medir, repetir controles o consultar.

**Botón**

> Ir al formulario

**Microcopy**

> El resultado no reemplaza una medición de presión arterial ni una consulta médica.

---

## 3. Página de evaluación (`/evaluar`)

### 3.1 Encabezado de página

**Título**

> Evaluar señales cardiometabólicas

**Subtítulo**

> Completá el formulario con datos corporales, laboratorio y contexto declarado. El resultado es orientativo y debe interpretarse junto con una medición real de presión arterial y una consulta profesional.

**Aviso corto visible**

> Para adultos de 20 años o más. No usar como diagnóstico ni para emergencias.

---

### 3.2 Consentimiento antes de empezar

**Título**

> Antes de continuar

**Texto**

> Para usar esta herramienta, confirmá que entendés su alcance.

**Checklist de consentimiento**

- Entiendo que esta herramienta no diagnostica hipertensión.
- Entiendo que el resultado es orientativo.
- Entiendo que la presión arterial debe confirmarse con mediciones reales.
- Entiendo que no debo tomar decisiones de medicación con esta herramienta.
- Entiendo que, ante síntomas preocupantes o presión medida extremadamente elevada, debo buscar atención médica urgente.

**Botón**

> Entiendo y quiero continuar

**Nota de integración**

- No hace falta bloquear agresivamente la experiencia, pero sí conviene mostrarlo antes del primer envío real.
- Si se implementa historial o PDF, registrar localmente que el usuario aceptó el consentimiento, sin enviar datos sensibles al servidor salvo decisión explícita.

---

### 3.3 Paso 1 — Casos base / presets

**Título actual sugerido**

> Elegí un punto de partida

**Descripción**

> Usá un caso completo para probar el modelo o avanzá para cargar valores propios.

**Presets sugeridos**

#### Control habitual

> Valores completos para probar una lectura preventiva.

#### Más señales

> Caso útil para revisar cómo responde el modelo ante una combinación de edad, cintura e indicadores metabólicos más altos.

#### Tabaquismo actual

> Perfil completo para ensayar el factor de tabaquismo.

**Nota UX**

Agregar una ayuda:

> Los casos base son ejemplos para probar la interfaz. No representan recomendaciones clínicas ni perfiles personales.

---

### 3.4 Paso 2 — Mediciones corporales

**Título**

> Mediciones corporales

**Descripción**

> Ingresá peso, altura y cintura. El IMC se calcula automáticamente para el modelo.

| Campo | Label final | Unidad visual | Rango actual sugerido | Hint |
|---|---|---:|---:|---|
| `RIDAGEYR` | Edad | años | 20–120 | Ingresá tu edad en años cumplidos. |
| `BMXWT` | Peso | kg | 30–250 | Usá una medición reciente. |
| `BMXHT` | Altura | cm | 120–230 | Ingresá altura en centímetros. |
| `BMXWAIST` | Perímetro de cintura | cm | 40–220 | Medición alrededor del abdomen. |

**Ayuda para IMC**

> El IMC se calcula como peso en kilogramos dividido por altura en metros al cuadrado. Es una medida de screening y no describe por sí sola composición corporal ni estado de salud completo.

**Fuente**

CDC define el IMC como peso en kg dividido por altura en m² y recomienda interpretarlo con otros factores como presión arterial, colesterol, examen físico y laboratorio. Ver [S4].

---

### 3.5 Ayuda contextual — Cómo medir cintura

**Título**

> Cómo medir la cintura

**Texto**

> Parate derecho, colocá una cinta métrica alrededor de la zona media del abdomen, justo por encima de los huesos de la cadera, y medí después de exhalar. La cinta debe estar ajustada, pero sin comprimir la piel.

**Nota preventiva**

> Si no estás seguro de la medición, registrá el valor como aproximado y confirmalo en un control de salud.

**Fuente**

NHLBI describe que la cintura se mide de pie, con cinta alrededor de la zona media, justo por encima de los huesos de la cadera, después de exhalar. Ver [S7].

---

### 3.6 Paso 3 — Laboratorio

**Título**

> Marcadores de laboratorio

**Descripción**

> Completá las señales metabólicas indirectas antes de revisar el contexto.

| Campo | Label final | Unidad visual | Rango actual sugerido | Hint |
|---|---|---:|---:|---|
| `LBXTC` | Colesterol total | mg/dL | 50–500 | Dato del perfil lipídico. |
| `LBDHDD` | HDL | mg/dL | 5–200 | Conocido como “colesterol bueno”. |
| `LBXGH` | Hemoglobina glicosilada / HbA1c | % | 3–20 | Refleja promedio de glucosa de los últimos meses. |

**Callout si el usuario no conoce los datos**

> ¿No conocés estos datos? Podés consultar centros donde suelen realizar análisis de rutina. Antes de concurrir, confirmá si realizan colesterol total, HDL y HbA1c, si necesitás pedido médico, turno u obra social.

**Botón**

> Ver directorio

**Fundamento público**

CDC explica que el colesterol se mide en mg/dL y que el perfil lipídico incluye LDL, HDL, triglicéridos y colesterol total. CDC también explica que la prueba A1C/HbA1c mide el promedio de glucosa de los últimos 3 meses. Ver [S5] y [S6].

---

### 3.7 Paso 4 — Contexto declarado

**Título**

> Contexto declarado

**Descripción**

> Confirmá las categorías usadas por el dataset original y enviá la evaluación orientativa.

#### Campo: Sexo

**Label**

> Sexo reportado

**Opciones**

- Femenino
- Masculino

**Ayuda**

> Esta categoría replica la variable disponible en el dataset original. No describe identidad de género de forma amplia.

#### Campo: Grupo étnico reportado

**Label**

> Grupo étnico reportado

**Opciones actuales del modelo**

- Mexicano estadounidense
- Asiático no hispano
- Negro no hispano
- Blanco no hispano
- Otro origen hispano
- Otra raza o multirracial

**Ayuda obligatoria**

> Esta categoría proviene de NHANES 2017–2018, un dataset de Estados Unidos. Puede no representar perfectamente identidades locales fuera de esa población. Elegí la opción más cercana solo porque el modelo actual la requiere como variable técnica.

**Fuente**

NHANES `DEMO_J` documenta `RIDRETH3` como variable de raza/origen hispano derivada de preguntas de raza y origen hispano, con categorías específicas del diseño de NHANES. Ver [S9].

#### Campo: Fumador actual

**Label**

> Fumador actual

**Opciones**

- Sí
- No

**Ayuda**

> En el dataset original, el tabaquismo actual se deriva de preguntas sobre haber fumado al menos 100 cigarrillos en la vida y si la persona fuma actualmente.

**Fuente**

NHANES `SMQ_J` documenta `SMQ020` y `SMQ040` para consumo de cigarrillos y consumo actual. Ver [S16].

---

### 3.8 Validaciones y mensajes de error

#### Error de campo vacío

> Ingresá un valor válido para {campo}.

#### Error de rango

> {Campo} debe estar entre {min} y {max} {unidad}.

#### Error de IMC calculado

> El IMC calculado debe estar entre 10 y 80 kg/m². Revisá peso y altura.

#### Error de conexión

> No se pudo conectar con el servidor. Revisá que la API esté activa e intentá nuevamente.

#### Error 422 / payload inválido

> Hay datos que el servidor no pudo validar. Revisá los campos marcados.

#### Error 429 / rate limit

> El servidor recibió demasiadas solicitudes. Intentá nuevamente en un minuto.

#### Error 500

> No se pudo obtener la predicción por un problema del servidor. Intentá más tarde o revisá la configuración de la API.

---

## 4. Resultado orientativo

### 4.1 Encabezado del resultado

**Título genérico**

> Resumen orientativo

**Subtítulo**

> Resultado basado en señales indirectas. No reemplaza una medición de presión arterial ni una consulta médica.

### 4.2 Métrica principal

**Label**

> Probabilidad estimada

**Formato recomendado**

- Mostrar porcentaje redondeado: `72%`.
- Mostrar valor técnico secundario: `0.720`.
- Evitar precisión excesiva como elemento principal.

**Microcopy junto a probabilidad**

> Interpretá este número como una estimación del modelo, no como diagnóstico individual.

---

### 4.3 Tramos comunicacionales sugeridos

> Estos tramos son comunicacionales. El umbral técnico del modelo puede ser distinto y debe mostrarse por separado.

| Tramo | Label de UI | Texto de interpretación | Próximo paso sugerido |
|---:|---|---|---|
| 0–24% | Prioridad baja | Las señales cargadas no sugieren prioridad alta, pero siguen siendo una lectura orientativa. | Mantené controles habituales y medí tu presión cuando corresponda. |
| 25–49% | Prioridad moderada | Hay señales que conviene revisar con más atención, especialmente si tenés mediciones previas elevadas. | Agendá una consulta de control o repetí mediciones de presión si ya tenés registros. |
| 50–74% | Prioridad alta | El modelo detecta una combinación de señales que amerita priorizar una revisión clínica. | Priorizá medición correcta de presión arterial y conversación con un profesional. |
| 75–100% | Prioridad muy alta | La probabilidad orientativa es muy alta y no debería manejarse solo con esta herramienta. | Buscá evaluación médica pronta; si hay síntomas o presión medida muy elevada, usá los canales de urgencia locales. |

### 4.4 Umbral técnico

**Label**

> Umbral del modelo

**Texto**

> El umbral indica desde qué probabilidad el modelo clasifica el resultado como “señales compatibles”. No es un umbral diagnóstico de presión arterial.

**Políticas de umbral recomendadas para mostrar**

| Política | Umbral | Uso comunicacional |
|---|---:|---|
| Conservadora / default | 0.50 | Clasificación por defecto del artefacto actual. |
| Balanceada | 0.44 | Umbral que maximiza F1 en validación. |
| Preventiva / screening | 0.40 | Umbral orientado a sostener recall alrededor de 80% en validación. |

**Nota de integración**

- Si por ahora el backend usa solo `threshold_default = 0.50`, mostrar únicamente ese umbral y agregar una nota técnica de roadmap para habilitar políticas alternativas.
- Si se expone `threshold_policy`, mostrar: `Política usada: default / balanceada / preventiva`.

---

### 4.5 Bloque “Qué hacer ahora”

#### Si prioridad baja

> El resultado no sugiere prioridad alta, pero no descarta presión elevada. Mantené controles habituales, registrá tus mediciones cuando las tengas y llevá tus datos a la próxima consulta.

Checklist:

- Medir presión cuando corresponda.
- Mantener controles de rutina.
- Guardar o exportar el resultado si querés conversarlo en consulta.

#### Si prioridad moderada

> Hay señales que conviene revisar. Si tenés mediciones previas elevadas o antecedentes, no lo dejes pasar.

Checklist:

- Medir presión con técnica adecuada.
- Registrar al menos dos lecturas separadas por 1 o 2 minutos.
- Consultar con un profesional si los valores se repiten elevados.

#### Si prioridad alta

> La combinación de señales amerita priorizar una revisión clínica.

Checklist:

- Medir presión en condiciones adecuadas.
- Repetir la medición si el valor es alto.
- Preparar tus datos para consulta médica.
- No iniciar ni cambiar medicación por este resultado.

#### Si prioridad muy alta

> El resultado es orientativo, pero conviene buscar evaluación profesional pronta.

Checklist:

- Confirmar presión arterial con una medición correcta.
- Si existen síntomas preocupantes o presión medida extremadamente elevada, usar canales de urgencia locales.
- Llevar datos de laboratorio, mediciones y este resultado a consulta.

---

### 4.6 Bloque “Por qué pudo salir este resultado”

**Título**

> Señales usadas por el modelo

**Texto**

> El modelo considera edad, IMC, cintura, colesterol total, HDL, HbA1c, sexo, grupo étnico reportado y tabaquismo actual. Estas variables se interpretan como señales asociadas dentro del dataset, no como causas directas.

**Items sugeridos**

- Edad cargada.
- IMC calculado.
- Cintura cargada.
- Colesterol total cargado.
- HDL cargado.
- HbA1c cargada.
- Tabaquismo actual.

**Advertencia**

> La explicación no implica causalidad. Solo ayuda a revisar los datos usados en la inferencia.

---

### 4.7 Botones de resultado

**Botones sugeridos**

- Descargar resumen para consulta.
- Guardar en este dispositivo.
- Limpiar datos.
- Medir presión correctamente.
- Ver directorio de laboratorios.

**Nota de privacidad**

> Si se guarda historial, hacerlo localmente por defecto y permitir borrar datos.

---

## 5. Página “Sobre el modelo” (`/modelo`)

### 5.1 Encabezado

**Título**

> Sobre el modelo orientativo

**Texto**

> Este modelo fue construido con datos públicos de NHANES 2017–2018, una encuesta de salud y nutrición de Estados Unidos coordinada por CDC/NCHS. El objetivo no es diagnosticar hipertensión, sino detectar señales indirectas compatibles con hipertensión en adultos, evitando usar como entradas las mediciones de presión arterial o las preguntas que definen directamente la etiqueta.

**Fuente**

NHANES 2017–2018 seleccionó 16.211 personas, con 9.254 entrevistas completadas y 8.704 personas examinadas; usa un diseño complejo y multietápico para población civil no institucionalizada de Estados Unidos. Ver [S8].

---

### 5.2 Ficha técnica / Model Card resumida

| Campo | Valor para mostrar |
|---|---|
| Nombre del sistema | Presión Bajo Control — Evaluación orientativa de señales cardiometabólicas |
| Versión de producto | 0.1.0, actualizar según release |
| Dataset | NHANES 2017–2018 |
| Fuente del dataset | CDC/NCHS |
| Tipo de dataset | Encuesta transversal con entrevista, examen físico y laboratorio |
| Población analítica del proyecto | Adultos de 20 años o más con etiqueta conocida y pesos muestrales válidos |
| Target | `hypertension_130_80` |
| Modelo recomendado actual | Regresión logística |
| Salida | Probabilidad orientativa, predicción binaria según umbral y texto de contexto |
| Uso previsto | Educación, pre-screening, organización de señales, conversación clínica |
| Uso no permitido | Diagnóstico autónomo, medicación, urgencias, reemplazo de medición |

---

### 5.3 Variables usadas por el modelo

#### Variables visibles para el usuario

| Variable de UI | Variable técnica | Tipo | Unidad | Descripción |
|---|---|---|---:|---|
| Edad | `RIDAGEYR` | numérica | años | Edad en años al screening. |
| IMC | `BMXBMI` | numérica | kg/m² | Calculado desde peso y altura en la UI. |
| Cintura | `BMXWAIST` | numérica | cm | Perímetro de cintura. |
| Colesterol total | `LBXTC` | numérica | mg/dL | Colesterol total. |
| HDL | `LBDHDD` | numérica | mg/dL | HDL colesterol. |
| HbA1c | `LBXGH` | numérica | % | Hemoglobina glicosilada. |
| Sexo | `sex` | categórica | — | Femenino/masculino según recodificación del proyecto. |
| Grupo étnico reportado | `race_ethnicity` | categórica | — | Categoría derivada del dataset original. |
| Fumador actual | `current_smoker` | categórica/binaria | — | Derivada de preguntas de tabaquismo. |

#### Variable oculta por compatibilidad del pipeline

| Variable | Estado en producto | Explicación |
|---|---|---|
| `INDFMPIR` | No se pide ni se muestra | En el artefacto actual está dentro de las features del pipeline. La app la completa internamente como valor faltante para que el pipeline la impute. No debe pedirse al usuario mientras se mantenga esta decisión de UX. |

**Texto público recomendado sobre `INDFMPIR`**

> La app no solicita información de ingresos o pobreza. El modelo actual conserva una variable socioeconómica del pipeline original, pero en la interfaz se envía como faltante y se imputa internamente. Esto evita pedir datos financieros sensibles al usuario.

**Nota técnica interna**

> Si en el futuro se reentrena una versión sin `INDFMPIR`, actualizar model card, metadata y copy para eliminar esta explicación. Mientras se mantenga el mismo dataset/modelo, no cambiar esta decisión sin revalidación.

---

### 5.4 Variables excluidas para evitar fuga de información

**Título**

> Qué datos no usamos como entrada

**Texto**

> El modelo no usa lecturas de presión arterial ni preguntas directas de diagnóstico o medicación antihipertensiva como entradas. Esa decisión evita que el sistema aprenda a predecir la etiqueta usando la misma información con la que se define la hipertensión.

**Lista técnica**

- `BPXSY1`, `BPXSY2`, `BPXSY3`, `BPXSY4`
- `BPXDI1`, `BPXDI2`, `BPXDI3`, `BPXDI4`
- `sbp_mean_all`, `dbp_mean_all`
- `sbp_mean_followup`, `dbp_mean_followup`
- `sbp_mean`, `dbp_mean`
- `BPQ020`
- `BPQ050A`
- `hbp_med_current`

**Texto de usuario**

> Aunque medir presión es fundamental, este modelo no la pide porque su objetivo es ordenar señales indirectas. Si usara presión arterial como input, el resultado dejaría de aportar valor como pre-screening.

**Fuentes de variables NHANES**

- `BPX_J` documenta mediciones de presión arterial y procedimientos de medición. Ver [S11].
- `BPQ_J` documenta preguntas de awareness/tratamiento de presión alta, incluyendo si un profesional informó hipertensión y uso actual de medicación. Ver [S12].

---

### 5.5 Métricas actuales para mostrar

> Usar estas métricas si coinciden con el artefacto actual y `metrics/nhanes_case1_hypertension_test_metrics_v1.csv`. Si se reentrena el modelo, actualizar esta sección.

| Modelo | Threshold | Accuracy | Balanced accuracy | Precision | Recall | F1 | ROC-AUC | Average precision | Brier | Log loss |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Regresión logística | 0.50 | 0.7304 | 0.7303 | 0.7380 | 0.7133 | 0.7254 | 0.8029 | 0.7757 | 0.1812 | 0.5415 |
| Random forest | 0.50 | 0.7203 | 0.7203 | 0.7150 | 0.7313 | 0.7231 | 0.7890 | 0.7724 | 0.1866 | 0.5537 |
| Baseline prior | 0.50 | 0.4994 | 0.5000 | 0.4994 | 1.0000 | 0.6661 | 0.5000 | 0.4994 | 0.2502 | 0.6936 |

**Texto interpretativo**

> La regresión logística se mantiene como modelo recomendado porque ofrece buen desempeño global, probabilidad interpretable y mayor facilidad de auditoría. Random forest presenta recall algo mayor al umbral 0.50, pero la regresión logística tiene mejor ROC-AUC, precision, F1 y Brier en la tabla actual. Esta comparación no implica causalidad ni validación clínica externa.

---

### 5.6 Thresholds / umbrales

| Política | Threshold | Descripción |
|---|---:|---|
| Default | 0.50 | Umbral por defecto del modelo actual. |
| Max F1 validation | 0.44 | Umbral que maximiza F1 en validación. |
| Screening recall 80 validation | 0.40 | Umbral seleccionado para mantener recall de al menos 0.80 en validación, priorizando screening. |

**Copy público**

> El umbral no es una categoría clínica de presión arterial. Es una regla técnica para convertir la probabilidad del modelo en una clasificación binaria. La política de umbral debe elegirse según el objetivo: equilibrio general, mayor detección o menor cantidad de alertas.

---

### 5.7 Limitaciones del modelo

**Título**

> Limitaciones importantes

**Texto principal**

> Esta herramienta tiene limitaciones. Fue entrenada con datos públicos de NHANES 2017–2018, una encuesta estadounidense. Por eso, su aplicación fuera de esa población debe interpretarse con cautela. El modelo es transversal: estima señales presentes en los datos, no riesgo futuro causal. Además, aunque usa pesos muestrales, no reemplaza validación clínica local ni validación prospectiva.

**Lista**

- No diagnostica hipertensión.
- No predice eventos futuros.
- No reemplaza medición de presión arterial.
- No reemplaza evaluación médica.
- Puede comportarse distinto en poblaciones diferentes a NHANES.
- Puede tener diferencias de desempeño por subgrupos.
- Las variables de etnicidad vienen del dataset original y pueden no representar bien a usuarios locales.
- La probabilidad debe entenderse como score orientativo.
- La interpretación de coeficientes o importancia de variables no implica causalidad.
- Si se usa en una población local, requiere validación externa o prospectiva.

**Fuente**

NHANES describe su población objetivo como población civil no institucionalizada de Estados Unidos y detalla subgrupos sobremuestreados en 2017–2018. Ver [S8].

---

### 5.8 Condiciones mínimas antes de uso clínico real

**Título**

> Antes de un piloto clínico

**Checklist**

- Validación externa o prospectiva aceptable.
- Calibración adecuada para el uso previsto.
- Evaluación por subgrupos sin brechas inaceptables.
- Revisión clínica del umbral y de la acción posterior.
- Monitoreo de drift y performance.
- Logs auditables con versión de modelo y threshold.
- Procedimiento de rollback.
- Comunicación clara de que el resultado es señal de riesgo, no diagnóstico.
- Revisión legal/regulatoria de datos de salud.
- Política de privacidad y consentimiento.

---

## 6. Página “Metodología” (`/metodologia`)

### 6.1 Título

> Metodología y datos

### 6.2 Texto introductorio

> El proyecto usa NHANES 2017–2018 para construir una etiqueta de señales compatibles con hipertensión y entrenar modelos que usan variables indirectas. La presión arterial medida y la medicación antihipertensiva pueden participar en la definición de la etiqueta, pero no se usan como entradas del modelo.

---

### 6.3 Dataset

**Bloque de contenido**

> NHANES es una encuesta nacional de salud y nutrición de Estados Unidos. Combina entrevistas, exámenes físicos y datos de laboratorio. El ciclo 2017–2018 incluyó selección de participantes, entrevistas y exámenes en centros móviles. Los archivos públicos se vinculan mediante el identificador `SEQN`.

**Puntos técnicos**

- Población objetivo: población civil no institucionalizada residente en Estados Unidos.
- Diseño: complejo, multietápico y probabilístico.
- Ciclo: 2017–2018.
- Entrevistas completadas: 9.254.
- Examinados: 8.704.
- Subgrupos sobremuestreados: personas hispanas, negras no hispanas, asiáticas no hispanas, ciertos grupos de bajos ingresos y personas blancas/no hispanas u otras de 80+ años.

**Fuente**

Ver [S8].

---

### 6.4 Variables NHANES usadas

| Área | Archivo NHANES | Variables relevantes | Uso en el proyecto |
|---|---|---|---|
| Demografía | `DEMO_J` | `RIDAGEYR`, `RIAGENDR`, `RIDRETH3`, `WTMEC2YR`, `SDMVSTRA`, `SDMVPSU`, `INDFMPIR` | Edad, sexo, etnicidad, pesos, diseño muestral, variable socioeconómica imputada como faltante en app. |
| Antropometría | `BMX_J` | `BMXBMI`, `BMXWAIST`, peso, altura | IMC, cintura y cálculo de IMC desde peso/altura. |
| Presión arterial | `BPX_J` | `BPXSY*`, `BPXDI*` | Construcción de etiqueta; excluidas como features. |
| Cuestionario presión/colesterol | `BPQ_J` | `BPQ020`, `BPQ050A` | Awareness/tratamiento; excluidas como features. |
| Colesterol total | `TCHOL_J` | `LBXTC` | Feature de laboratorio. |
| HDL | `HDL_J` | `LBDHDD` | Feature de laboratorio. |
| HbA1c | `GHB_J` | `LBXGH` | Feature de laboratorio. |
| Tabaquismo | `SMQ_J` | `SMQ020`, `SMQ040` | Derivación de fumador actual. |

**Fuentes**

Ver [S9] a [S16].

---

### 6.5 Prevención de fuga de información

**Texto**

> La fuga de información ocurre cuando un modelo usa como entrada datos que contienen directa o indirectamente la respuesta que intenta predecir. En este proyecto, las mediciones de presión arterial y las preguntas de diagnóstico/medicación se excluyen como features porque están demasiado cerca de la definición de hipertensión. Así, el modelo intenta ordenar señales indirectas en vez de aprender una regla circular.

**Ejemplo para usuarios**

> Si preguntáramos “¿tu presión fue 140/90?” y luego el modelo dijera “hay señales compatibles”, no estaríamos descubriendo nada nuevo. Por eso el formulario actual usa información cardiometabólica indirecta.

---

### 6.6 Uso de pesos muestrales

**Texto**

> NHANES usa un diseño de encuesta complejo. Por eso, las métricas del proyecto usan `WTMEC2YR` como peso muestral para acercar los resultados a la representatividad poblacional del ciclo. Aun así, usar pesos dentro de scikit-learn no equivale a una estimación completa de varianza con estratos y PSU.

**Nota técnica**

> Para informes epidemiológicos formales, considerar métodos de encuesta compleja que incorporen `SDMVSTRA` y `SDMVPSU`.

**Fuente**

Los archivos de laboratorio NHANES recomiendan usar variables de diseño y demografía; `DEMO_J` documenta pesos, pseudo-PSU y pseudo-estratos. Ver [S9], [S13], [S14] y [S15].

---

## 7. Página educativa (`/educacion`)

### 7.1 Introducción

**Título**

> Entender tus señales cardiometabólicas

**Texto**

> Esta sección explica los conceptos usados por la herramienta. No reemplaza asesoramiento médico, pero puede ayudarte a preparar mejores preguntas para tu consulta.

---

### 7.2 Presión arterial

**Título**

> La presión arterial se interpreta con dos números

**Texto**

> La presión arterial se registra con dos valores: presión sistólica, que corresponde al primer número, y presión diastólica, que corresponde al segundo. Las categorías clínicas dependen de esos valores y deben interpretarse con un equipo de salud.

| Categoría educativa | Sistólica | Diastólica |
|---|---:|---:|
| Normal | menor de 120 | menor de 80 |
| Elevada | 120–129 | menor de 80 |
| Hipertensión etapa 1 | 130–139 | 80–89 |
| Hipertensión etapa 2 | 140 o más | 90 o más |
| Hipertensión severa | mayor de 180 | y/o mayor de 120 |

**Aviso de seguridad**

> Si una medición supera 180 y/o 120 mm Hg, repetí la medición después de al menos 1 minuto. Si se mantiene elevada o hay síntomas como dolor de pecho, falta de aire, debilidad, cambios visuales o dificultad para hablar, buscá atención de emergencia por los canales locales.

**Fuente**

American Heart Association publica las categorías de presión arterial y advierte que solo un profesional puede confirmar diagnóstico. Ver [S3].

---

### 7.3 Cómo medir presión correctamente

**Título**

> Medir bien cambia la interpretación

**Texto**

> La presión arterial puede variar por postura, café, alcohol, actividad física, tabaco, estrés o técnica de medición. Para obtener una lectura más confiable, prepará la medición y registrá el contexto.

**Checklist**

- Usá un tensiómetro validado y un manguito del tamaño adecuado.
- Medí siempre en horarios comparables si estás haciendo seguimiento.
- Sentate con la espalda apoyada.
- Apoyá ambos pies en el piso.
- No cruces las piernas.
- Apoyá el brazo sobre una mesa, a la altura del pecho.
- Colocá el manguito sobre piel descubierta, no sobre ropa.
- Descansá unos minutos antes de medir.
- No hables durante la medición.
- Tomá al menos dos lecturas separadas por 1 o 2 minutos.
- Registrá fecha, hora, brazo usado y observaciones.

**Fuente**

CDC recomienda registrar mediciones, medir a la misma hora cada día y tomar al menos dos lecturas separadas por 1 o 2 minutos. Ver [S2].

---

### 7.4 IMC

**Título**

> IMC: una medida de screening

**Texto**

> El índice de masa corporal se calcula con peso y altura: peso en kilogramos dividido por altura en metros al cuadrado. Es útil como medida rápida de screening, pero no distingue grasa, músculo y masa ósea, ni muestra dónde se distribuye la grasa corporal.

**Fórmula**

```txt
IMC = peso(kg) / altura(m)^2
```

**Aviso**

> Para interpretar el IMC de una persona, conviene considerarlo junto con presión arterial, colesterol, glucosa, examen físico, antecedentes y hábitos.

**Fuente**

CDC explica la fórmula, el uso como screening y las limitaciones del IMC. Ver [S4].

---

### 7.5 Cintura

**Título**

> Cintura y distribución de grasa corporal

**Texto**

> La cintura ayuda a contextualizar la distribución de grasa corporal. Una mayor acumulación de grasa alrededor de la cintura se asocia con mayor riesgo cardiometabólico, aunque el valor debe interpretarse con contexto clínico.

**Cómo medir**

> Parate derecho, colocá la cinta alrededor de la zona media justo por encima de los huesos de la cadera y medí después de exhalar.

**Fuente**

NHLBI indica que mayor grasa alrededor de la cintura se asocia con mayor riesgo de enfermedad cardíaca y diabetes tipo 2, y describe cómo medir cintura. Ver [S7].

---

### 7.6 Colesterol total y HDL

**Título**

> Colesterol total y HDL

**Texto**

> El colesterol es una sustancia grasa necesaria para el cuerpo, pero niveles alterados pueden asociarse con problemas cardiovasculares. Un perfil lipídico suele incluir LDL, HDL, triglicéridos y colesterol total. El HDL suele llamarse “colesterol bueno” porque niveles más altos pueden asociarse con menor riesgo de enfermedad cardíaca y accidente cerebrovascular.

**Uso en la herramienta**

> En este modelo, colesterol total y HDL funcionan como señales indirectas del contexto cardiometabólico.

**Fuente**

CDC describe colesterol total, LDL, HDL y triglicéridos, además de su medición en mg/dL. Ver [S5].

---

### 7.7 Hemoglobina glicosilada / HbA1c

**Título**

> HbA1c: promedio de glucosa de los últimos meses

**Texto**

> La hemoglobina glicosilada, o HbA1c, es un análisis de sangre que refleja el promedio de glucosa de los últimos 3 meses. Se usa para diagnóstico y monitoreo de diabetes y prediabetes, pero en esta herramienta se utiliza solo como señal metabólica indirecta.

**Fuente**

CDC explica que la prueba A1C mide el promedio de glucosa de los últimos 3 meses y se usa para diagnosticar prediabetes/diabetes y monitorear evolución. Ver [S6].

---

### 7.8 Tabaquismo actual

**Título**

> Tabaquismo actual

**Texto**

> El tabaquismo actual se usa como una señal de hábito y riesgo cardiometabólico. En el dataset original se deriva de preguntas sobre haber fumado al menos 100 cigarrillos en la vida y si la persona fuma actualmente.

**Fuente**

NHANES `SMQ_J` documenta `SMQ020` y `SMQ040`. Ver [S16].

---

## 8. Página de recursos locales (`/recursos`)

### 8.1 Encabezado

**Título**

> Recursos para análisis y controles en Salta Capital

**Texto**

> Este directorio reúne centros públicos y privados mencionados por fuentes institucionales o sitios oficiales. Antes de concurrir, confirmá si realizan colesterol total, HDL y HbA1c, si necesitás pedido médico, turno, ayuno u obra social.

**Aviso obligatorio**

> La disponibilidad, horarios y prestaciones pueden cambiar. Verificá siempre con el centro antes de asistir.

---

### 8.2 Filtros sugeridos

- Público
- Privado
- Laboratorio
- Hospital
- Confirmado para perfil lipídico / HbA1c
- Requiere turno
- Atiende por orden de llegada
- Tiene contacto telefónico/WhatsApp

---

### 8.3 Cards de centros públicos

#### Hospital Público Materno Infantil

**Tipo:** Público  
**Ubicación:** Av. Sarmiento 1301, Salta Capital  
**Texto para card:**

> Hospital público con unidad de laboratorio. En 2023 realizó determinaciones de rutina, baja y alta complejidad, beneficiando a pacientes de la institución y funcionando como referencia de establecimientos del Primer Nivel de Atención de la ciudad de Salta.

**Qué verificar antes de asistir**

- Si realizan colesterol total, HDL y HbA1c para pacientes externos.
- Si se necesita pedido médico.
- Si se requiere turno.
- Horario de extracción.

**Fuente:** Gobierno de Salta informa 991.984 determinaciones en 2023 y referencia para 38 establecimientos del Primer Nivel de Atención. Ver [S17].

---

#### Hospital San Bernardo

**Tipo:** Público  
**Ubicación:** Tobías 69, Salta Capital  
**Texto para card:**

> Hospital público de gestión descentralizada en Salta Capital. Su carta de servicios incluye Programa de Laboratorio Central, laboratorio de microbiología y laboratorio de patología, además de atención de emergencias las 24 horas.

**Qué verificar antes de asistir**

- Si el laboratorio recibe pacientes externos para análisis de rutina.
- Si realiza perfil lipídico y HbA1c.
- Si requiere derivación o pedido médico.

**Fuente:** Boletín Oficial de Salta, carta de servicios del Hospital San Bernardo. Ver [S18].

---

#### Hospital Señor del Milagro

**Tipo:** Público  
**Ubicación:** Av. Sarmiento 557, Salta Capital  
**Texto para card:**

> Hospital público referente en enfermedades infecciosas, con amplia cartera de especialidades. En el primer trimestre de 2025 registró 74.900 análisis de laboratorio y cuenta con seis laboratorios.

**Especialidades relacionadas mencionadas por fuente**

- Cardiología
- Clínica médica
- Diabetología
- Endocrinología
- Nutrición
- Hematología

**Qué verificar antes de asistir**

- Si realiza laboratorio para pacientes externos.
- Si requiere turno o derivación.
- Si realiza colesterol total, HDL y HbA1c.

**Fuente:** Gobierno de Salta, nota institucional del hospital. Ver [S19].

---

#### Hospital Dr. Arturo Oñativia

**Tipo:** Público  
**Ubicación:** E. Paz Chain 30, Salta Capital  
**Texto para card:**

> Hospital público con laboratorio bioquímico orientado a población adulta y perfil endocrinológico-metabólico. Su cartera publicada incluye glucohemoglobina/HbA1c, perfil lipídico, colesterol total y HDL colesterol.

**Prestaciones relevantes publicadas**

- Glucohemoglobina / HbA1c
- Perfil lipídico
- Colesterol total
- HDL colesterol
- Glucemia
- Triglicéridos

**Horarios publicados para laboratorio**

- Solicitud de turnos: lunes a jueves de 9:30 a 15:50; viernes de 9:30 a 14:50.
- Toma de muestras para pacientes externos: lunes a viernes de 7:15 a 9:30.
- Entrega de resultados: lunes a viernes de 10:00 a 16:00.

**Qué verificar antes de asistir**

- Si los horarios siguen vigentes.
- Si se requiere turno previo.
- Si se necesita pedido médico.

**Fuente:** sitio del Hospital Dr. Arturo Oñativia. Ver [S20].

---

### 8.4 Cards de centros privados

#### CIACLAB

**Tipo:** Privado  
**Ubicación:** Santiago del Estero 449, Salta Capital  
**Texto para card:**

> Laboratorio de análisis clínicos en Salta Capital. Permite enviar pedido médico por WhatsApp y publica horarios de extracción y presentación de muestras.

**Horarios publicados**

- Extracción y presentación de muestras: lunes a viernes de 7:30 a 10:30; sábados de 8:00 a 10:30.
- Resultados por WhatsApp: lunes a viernes de 17:00 a 21:00.

**Áreas publicadas**

- Bioquímica
- Endocrinología
- Hematología
- Inmunología
- Química clínica
- Serología

**Qué verificar antes de asistir**

- Si realiza colesterol total, HDL y HbA1c.
- Si requiere ayuno.
- Si se necesita turno.
- Cobertura de obra social.

**Fuente:** sitio de CIACLAB. Ver [S21].

---

#### MAS Medicina Ambulatoria Salta

**Tipo:** Privado  
**Ubicación:** Buenos Aires 196, Salta Capital; Av. Finca Yerba Buena 1500, San Lorenzo Chico  
**Texto para card:**

> Centro privado con laboratorio de alta complejidad. Publica atención sin turnos por orden de llegada y servicios de análisis clínicos, hematología, química clínica, inmunología, bacteriología, parasitología y otros.

**Datos publicados**

- Atención de laboratorio sin turnos, por orden de llegada.
- Teléfono: (0387) 4311977.
- Email: consultas@massaltasalud.com.ar.

**Qué verificar antes de asistir**

- Si realiza colesterol total, HDL y HbA1c.
- Horario de extracción.
- Ayuno y pedido médico.
- Cobertura de obra social.

**Fuente:** sitio de MAS Medicina Ambulatoria Salta. Ver [S22].

---

#### Clínica del Centro

**Tipo:** Privado  
**Ubicación:** Gral. Alvarado 858, Ciudad de Salta  
**Texto para card:**

> Clínica privada en el microcentro de Salta. Publica laboratorio clínico de alta complejidad, cardiología, nutrición, clínica médica y estudios de alta complejidad.

**Datos publicados**

- Teléfonos: +54 (387) 4 219-212 / +54 (387) 4 219-222.
- WhatsApp consultas: 3872 219-202.
- Laboratorio: 387 557-2887.
- Dirección: Gral. Alvarado 858, Ciudad de Salta.

**Qué verificar antes de asistir**

- Si realiza colesterol total, HDL y HbA1c.
- Horario de laboratorio.
- Si requiere turno o pedido médico.
- Cobertura de obra social.

**Fuente:** sitio de Clínica del Centro. Ver [S23].

---

## 9. Página de privacidad (`/privacidad`)

### 9.1 Encabezado

**Título**

> Privacidad y uso de datos

**Texto corto**

> Los datos de salud son sensibles. Esta herramienta debe procesar solo la información necesaria para calcular una evaluación orientativa y debe explicar con claridad si guarda o no guarda datos.

**Fuente de marco general**

La AAIP de Argentina presenta la protección de datos personales como garantía de privacidad en el marco de transformaciones tecnológicas y economía digital. Ver [S24].

---

### 9.2 Versión local sin cuenta ni historial

**Texto recomendado**

> En la versión local actual, los datos ingresados se usan para calcular una predicción orientativa. La herramienta no debería crear una cuenta ni guardar información personal en una base de datos. Si se agrega historial, perfiles o exportación de PDF, se deberá informar de forma clara qué datos se guardan, dónde se guardan, por cuánto tiempo y cómo pueden eliminarse.

---

### 9.3 Datos procesados

**Lista**

- Edad.
- Peso y altura para calcular IMC.
- Cintura.
- Colesterol total.
- HDL.
- HbA1c.
- Sexo reportado.
- Grupo étnico reportado.
- Tabaquismo actual.
- Resultado del modelo.
- Threshold usado.
- Versión del modelo.

---

### 9.4 Principios recomendados

- Minimización: pedir solo datos necesarios.
- Transparencia: explicar finalidad y límites.
- Control del usuario: permitir borrar datos locales.
- Seguridad: no registrar datos sensibles en logs innecesarios.
- Trazabilidad: registrar versión de modelo y threshold sin exponer datos identificables.
- Consentimiento: mostrar alcance antes de usar el formulario.

---

### 9.5 Texto para consentimiento de datos

> Entiendo que mis datos se usan para generar una evaluación orientativa. Entiendo que esta herramienta no diagnostica hipertensión ni reemplaza una consulta médica. Si activo funciones de historial o exportación, entiendo que puedo borrar mis datos del dispositivo.

---

### 9.6 Si se implementa historial local

**Texto recomendado**

> Si decidís guardar una evaluación, los datos se almacenarán en este dispositivo. No se sincronizarán con una cuenta ni se enviarán a una base externa, salvo que una versión futura lo informe explícitamente y solicite consentimiento.

**Botones sugeridos**

- Guardar en este dispositivo.
- Descargar PDF.
- Borrar historial.
- No guardar.

---

## 10. FAQ (`/faq`)

### 10.1 ¿Esto significa que tengo hipertensión?

No. El resultado no diagnostica hipertensión. Solo estima señales indirectas compatibles con hipertensión. Para saber si tenés presión alta necesitás mediciones reales de presión arterial y evaluación profesional.

**Fuente:** CDC indica que medir la presión arterial es la única forma de saber si está alta. Ver [S2].

---

### 10.2 ¿Por qué no me piden mi presión arterial?

Porque el objetivo del modelo es detectar señales indirectas. Si usara presión arterial como entrada, estaría usando la misma información que define la hipertensión y el resultado sería menos útil como pre-screening. Por eso el formulario actual pide datos cardiometabólicos indirectos.

---

### 10.3 ¿Qué hago si el resultado da alto?

Priorizá una medición correcta de presión arterial y una consulta con un profesional. Si además tenés síntomas preocupantes o registros de presión muy elevados, buscá atención de emergencia por los canales locales.

**Fuente:** AHA recomienda repetir una medición severamente elevada y buscar ayuda urgente si hay síntomas como dolor de pecho, falta de aire, debilidad, cambios visuales o dificultad para hablar. Ver [S3].

---

### 10.4 ¿Qué hago si el resultado da bajo?

Un resultado bajo no descarta hipertensión. La presión alta puede no dar síntomas, por eso conviene sostener controles habituales y medir la presión cuando corresponda.

**Fuente:** CDC indica que la presión alta suele no presentar signos o síntomas. Ver [S1].

---

### 10.5 ¿Por qué piden colesterol y HDL?

Porque forman parte del contexto cardiometabólico. El colesterol total y el HDL aportan información indirecta sobre el perfil metabólico y cardiovascular. En esta herramienta no diagnostican por sí solos: ayudan al modelo a ordenar señales.

**Fuente:** CDC describe el colesterol total, LDL, HDL y triglicéridos dentro del perfil lipídico. Ver [S5].

---

### 10.6 ¿Qué es HbA1c?

La hemoglobina glicosilada o HbA1c es un análisis de sangre que refleja el promedio de glucosa de los últimos 3 meses. En esta herramienta se usa como señal metabólica indirecta.

**Fuente:** CDC explica que la prueba A1C mide el promedio de glucosa de los últimos 3 meses. Ver [S6].

---

### 10.7 ¿Por qué aparece grupo étnico reportado?

Porque esa variable existe en el dataset NHANES usado para entrenar el modelo. La categoría puede no representar perfectamente a usuarios fuera de Estados Unidos, por lo que la página debe explicarlo con transparencia.

**Fuente:** NHANES `DEMO_J` documenta `RIDRETH3`, variable de raza/origen hispano derivada de preguntas de raza y origen hispano. Ver [S9].

---

### 10.8 ¿Sirve para Argentina?

Puede usarse como herramienta educativa u orientativa, pero no debe presentarse como validada clínicamente para población argentina. El dataset de entrenamiento es NHANES 2017–2018, de Estados Unidos. Para uso clínico local haría falta validación externa o prospectiva.

---

### 10.9 ¿Se guardan mis datos?

En la versión local actual, la evaluación puede calcularse sin crear una cuenta ni guardar información en una base de datos. Si más adelante se agrega historial, PDF o perfiles, la página debe explicar qué datos se guardan, dónde se guardan, por cuánto tiempo y cómo se eliminan.

---

### 10.10 ¿Puedo usarlo si tengo menos de 20 años?

No debería usarse para menores de 20 años en esta versión, porque la población analítica del proyecto está definida como adultos de 20 años o más.

---

### 10.11 ¿Puedo usarlo si estoy embarazada?

No debería usarse como guía clínica durante embarazo. La presión alta durante embarazo requiere evaluación específica. Si estás embarazada o creés estarlo, consultá con un equipo de salud.

---

### 10.12 ¿Qué pasa si no tengo laboratorio reciente?

Podés usar la página para identificar qué datos te faltan, pero el modelo completo necesita colesterol total, HDL y HbA1c. Si esos datos no están disponibles, conviene obtenerlos mediante laboratorio o consulta antes de interpretar el resultado.

---

## 11. Glosario

### Presión sistólica

Primer número de la presión arterial. Representa la presión cuando el corazón late.

### Presión diastólica

Segundo número. Representa la presión entre latidos.

### Hipertensión

Presión arterial consistentemente por encima de lo normal. CDC describe presión alta como valores consistentemente iguales o superiores a 130/80 mm Hg. Ver [S1].

### IMC

Índice de masa corporal. Se calcula con peso y altura: peso en kg dividido por altura en metros al cuadrado. Es una medida de screening y debe interpretarse con otros datos. Ver [S4].

### HDL

Tipo de colesterol conocido como “colesterol bueno”. Forma parte del perfil lipídico. Ver [S5].

### Colesterol total

Cantidad total de colesterol en sangre, calculada considerando distintos componentes del perfil lipídico. Ver [S5].

### HbA1c

Hemoglobina glicosilada. Indica promedio de glucosa de los últimos 3 meses. Ver [S6].

### Screening

Evaluación inicial para orientar próximos pasos. No equivale a diagnóstico.

### Falso negativo

Cuando una herramienta indica baja probabilidad aunque la condición esté presente.

### Falso positivo

Cuando una herramienta indica alta probabilidad aunque la condición no esté presente.

### Data leakage / fuga de información

Problema de modelado que ocurre cuando una variable de entrada contiene información directa o casi directa de la respuesta que se quiere predecir.

---

## 12. SEO y metadata sugerida

### 12.1 Home

```html
<title>Presión Bajo Control | Señales cardiometabólicas e hipertensión</title>
<meta name="description" content="Evaluación orientativa para ordenar señales cardiometabólicas compatibles con hipertensión. No reemplaza medición de presión arterial ni consulta médica." />
```

### 12.2 Evaluación

```html
<title>Evaluar señales cardiometabólicas | Presión Bajo Control</title>
<meta name="description" content="Formulario orientativo para estimar señales compatibles con hipertensión a partir de edad, mediciones corporales, laboratorio y hábitos." />
```

### 12.3 Modelo

```html
<title>Sobre el modelo | Presión Bajo Control</title>
<meta name="description" content="Conocé el dataset NHANES 2017–2018, variables, métricas, umbrales y limitaciones del modelo orientativo." />
```

### 12.4 Educación

```html
<title>Guía de presión arterial y señales cardiometabólicas</title>
<meta name="description" content="Información educativa sobre presión arterial, medición correcta, IMC, cintura, colesterol, HDL, HbA1c y tabaquismo." />
```

---

## 13. Accesibilidad y copy de interfaz

### 13.1 Reglas de accesibilidad

- Mantener `lang="es"`.
- Usar labels visibles en todos los inputs.
- No usar solo color para comunicar riesgo.
- Acompañar semáforo con texto: prioridad baja, moderada, alta, muy alta.
- Mantener `aria-live="polite"` para resultado.
- Usar `role="alert"` para errores.
- Si hay dropdown custom, soportar `ArrowUp`, `ArrowDown`, `Enter`, `Escape`, `Home`, `End`.
- Permitir navegación completa con teclado.
- Evitar placeholders como sustituto de labels.
- Incluir unidades visibles al lado del campo.

### 13.2 Textos de botones

| Acción | Texto recomendado |
|---|---|
| Empezar | Empezar evaluación |
| Continuar | Continuar |
| Volver | Anterior |
| Enviar | Evaluar señales |
| Limpiar | Limpiar datos |
| Directorio | Ver directorio |
| Resultado PDF | Descargar resumen |
| Historial | Guardar en este dispositivo |
| Borrar historial | Borrar datos guardados |

### 13.3 Estados vacíos

**Antes de calcular**

> Completá el formulario para ver una probabilidad orientativa y el contexto del modelo.

**Cargando**

> Calculando con el modelo entrenado.

**Error de API**

> No se pudo obtener la predicción. Revisá los datos o el servidor.

**Sin datos de historial**

> Todavía no guardaste evaluaciones en este dispositivo.

---

## 14. Exportar PDF para consulta médica

### 14.1 Contenido recomendado del PDF

**Título**

> Resumen orientativo para consulta

**Secciones**

1. Fecha y hora.
2. Datos cargados.
3. IMC calculado.
4. Resultado del modelo.
5. Threshold usado.
6. Versión del modelo.
7. Próximos pasos sugeridos.
8. Advertencia de no diagnóstico.
9. Preguntas para conversar con el profesional.
10. Espacio para registrar presión arterial.

### 14.2 Copy para preguntas sugeridas

- ¿Conviene que mida mi presión en casa durante varios días?
- ¿Estos valores de laboratorio requieren seguimiento?
- ¿Mi cintura, IMC o HbA1c cambian mi prioridad de control?
- ¿Con qué frecuencia debería repetir controles?
- ¿Qué señales o síntomas deberían hacerme consultar antes?

### 14.3 Espacio para presión arterial

| Fecha | Hora | Sistólica | Diastólica | Pulso | Brazo | Observaciones |
|---|---|---:|---:|---:|---|---|
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

## 15. Contenido como constantes TypeScript sugeridas

### 15.1 Rutas

```ts
export const routes = [
  { path: "/", label: "Inicio" },
  { path: "/evaluar", label: "Evaluar señales" },
  { path: "/modelo", label: "Modelo" },
  { path: "/educacion", label: "Educación" },
  { path: "/recursos", label: "Recursos" },
  { path: "/privacidad", label: "Privacidad" },
  { path: "/faq", label: "FAQ" },
];
```

### 15.2 Disclaimers

```ts
export const disclaimers = {
  short: "Resultado orientativo. No reemplaza medición de presión arterial ni consulta médica.",
  long: "Esta estimación se basa en señales indirectas. No confirma ni descarta hipertensión. Para interpretar tu situación necesitás mediciones reales de presión arterial, contexto clínico y evaluación profesional.",
  emergency: "Si tenés síntomas preocupantes o una medición de presión extremadamente elevada, buscá atención médica urgente por los canales locales.",
};
```

### 15.3 Tramos de resultado

```ts
export const resultRanges = [
  {
    min: 0,
    max: 24,
    label: "Prioridad baja",
    interpretation:
      "Las señales cargadas no sugieren prioridad alta, pero siguen siendo una lectura orientativa.",
    nextStep:
      "Mantené controles habituales y medí tu presión cuando corresponda.",
  },
  {
    min: 25,
    max: 49,
    label: "Prioridad moderada",
    interpretation:
      "Hay señales que conviene revisar con más atención, especialmente si tenés mediciones previas elevadas.",
    nextStep:
      "Agendá una consulta de control o repetí mediciones de presión si ya tenés registros.",
  },
  {
    min: 50,
    max: 74,
    label: "Prioridad alta",
    interpretation:
      "El modelo detecta una combinación de señales que amerita priorizar una revisión clínica.",
    nextStep:
      "Priorizá medición correcta de presión arterial y conversación con un profesional.",
  },
  {
    min: 75,
    max: 100,
    label: "Prioridad muy alta",
    interpretation:
      "La probabilidad orientativa es muy alta y no debería manejarse solo con esta herramienta.",
    nextStep:
      "Buscá evaluación médica pronta; si hay síntomas o presión medida muy elevada, usá los canales de urgencia locales.",
  },
];
```

---

## 16. Checklist de integración por prioridad

### Prioridad 1 — Confianza y seguridad

- Agregar consentimiento antes del formulario.
- Agregar sección “Qué NO hace”.
- Agregar página `/modelo` con model card.
- Agregar página `/privacidad`.
- Agregar disclaimers al resultado.
- Mostrar versión del modelo y threshold.
- Corregir textos de etnicidad para explicar contexto NHANES.

### Prioridad 2 — Usabilidad

- Agregar unidades visibles en inputs.
- Aceptar coma decimal y convertir a punto.
- Marcar errores por campo.
- Agregar autosave local opcional.
- Mejorar accesibilidad de dropdowns.
- Agregar PDF de consulta.

### Prioridad 3 — Producto completo

- Agregar `/educacion`.
- Agregar `/recursos` con filtros.
- Agregar historial local.
- Agregar registro manual de presión arterial.
- Agregar página `/faq`.
- Agregar SEO y Open Graph.

### Prioridad 4 — Roadmap técnico

- Exponer endpoint `/thresholds`.
- Exponer `model_version`, `metadata_version`, `trained_at` y `threshold_policy`.
- Mejorar errores 422/500/network.
- Configurar CORS por ambiente.
- Fijar versiones de dependencias frontend en vez de usar `latest`.
- Agregar model registry o versionado de artefactos.

---

## 17. Fuentes públicas verificadas

> Sugerencia técnica: cargar estas fuentes en `sourceContent.ts` con campos `id`, `title`, `publisher`, `url`, `lastCheckedAt` y `usage`.

### Fuentes clínicas y educativas

**[S1] CDC — About High Blood Pressure**  
URL: https://www.cdc.gov/high-blood-pressure/about/index.html  
Uso: definición de presión alta, ausencia frecuente de síntomas, diagnóstico por equipo de salud, prevención.

**[S2] CDC — Measuring Your Blood Pressure**  
URL: https://www.cdc.gov/high-blood-pressure/measure/index.html  
Uso: medición como única forma de saber si hay presión alta, automedición, registro, dos lecturas separadas por 1 o 2 minutos.

**[S3] American Heart Association — Understanding Blood Pressure Readings**  
URL: https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings  
Uso: categorías normal/elevada/hipertensión etapa 1/etapa 2/severa, advertencias de emergencia, confirmación profesional.

**[S4] CDC — About Body Mass Index (BMI)**  
URL: https://www.cdc.gov/bmi/about/index.html  
Uso: fórmula de IMC, uso como screening, limitaciones, interpretación junto con otros factores.

**[S5] CDC — About Cholesterol**  
URL: https://www.cdc.gov/cholesterol/about/index.html  
Uso: colesterol total, LDL, HDL, triglicéridos, medición en mg/dL, perfil lipídico.

**[S6] CDC — A1C Test for Diabetes and Prediabetes**  
URL: https://www.cdc.gov/diabetes/diabetes-testing/prediabetes-a1c-test.html  
Uso: HbA1c/A1C como promedio de glucosa de 3 meses.

**[S7] NHLBI — Heart-Healthy Living: Aim for a Healthy Weight**  
URL: https://www.nhlbi.nih.gov/health/heart-healthy-living/healthy-weight  
Uso: cintura, medición de cintura, asociación con riesgo cardiometabólico, rangos generales de BMI.

### Fuentes NHANES / dataset

**[S8] CDC/NCHS — NHANES 2017–2018 Overview**  
URL: https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/overview.aspx?BeginYear=2017  
Uso: población objetivo, diseño, oversampling, cantidad de participantes seleccionados, entrevistados y examinados.

**[S9] CDC/NCHS — DEMO_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/DEMO_J.htm  
Uso: edad, sexo/género NHANES, raza/origen hispano, `WTMEC2YR`, `SDMVPSU`, `SDMVSTRA`, `INDFMPIR`.

**[S10] CDC/NCHS — BMX_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/BMX_J.htm  
Uso: peso, altura, cintura, IMC, cálculo de BMI, control de calidad antropométrico.

**[S11] CDC/NCHS — BPX_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/BPX_J.htm  
Uso: mediciones de presión arterial, procedimientos y variables excluidas del modelo como features.

**[S12] CDC/NCHS — BPQ_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/BPQ_J.htm  
Uso: preguntas de hipertensión, awareness, medicación, variables excluidas como features.

**[S13] CDC/NCHS — TCHOL_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/TCHOL_J.htm  
Uso: colesterol total `LBXTC`, unidad mg/dL, metodología de laboratorio.

**[S14] CDC/NCHS — HDL_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/HDL_J.htm  
Uso: HDL `LBDHDD`, unidad mg/dL, metodología de laboratorio.

**[S15] CDC/NCHS — GHB_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/GHB_J.htm  
Uso: HbA1c/glycohemoglobin `LBXGH`, unidad %, metodología de laboratorio.

**[S16] CDC/NCHS — SMQ_J**  
URL: https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/SMQ_J.htm  
Uso: tabaquismo, `SMQ020`, `SMQ040`, derivación de fumador actual.

### Fuentes locales Salta

**[S17] Gobierno de Salta — Laboratorio del Hospital Público Materno Infantil**  
URL: https://www.salta.gob.ar/prensa/noticias/en-el-ultimo-anio-el-laboratorio-del-materno-infantil-realizo-casi-un-millon-de-analisis-94645  
Uso: laboratorio, determinaciones 2023, referencia para centros del primer nivel.

**[S18] Boletín Oficial de Salta — Carta de servicios Hospital San Bernardo**  
URL: https://boletinoficialsalta.gob.ar/instrumento.php?cXdlcnR5dGFibGE9UnwyMTFELzA2JmRhdGE9MTc0MTRxd2VydHk=  
Uso: domicilio, teléfonos, laboratorio central, laboratorio de microbiología, emergencias.

**[S19] Gobierno de Salta — Hospital Señor del Milagro**  
URL: https://www.salta.gob.ar/prensa/noticias/el-hospital-del-senior-del-milagro-cumple-130-anios-junto-a-los-saltenios-101089  
Uso: seis laboratorios, análisis, especialidades, contexto institucional.

**[S20] Hospital Dr. Arturo Oñativia — Laboratorio Bioquímico**  
URL: https://www.hospitalonativia.gob.ar/?page_id=200  
Uso: HbA1c/glucohemoglobina, perfil lipídico, colesterol total, HDL, horarios de toma de muestra.

**[S21] CIACLAB — Laboratorio**  
URL: https://ciacsalta.com.ar/laboratorio/  
Uso: laboratorio privado, horarios, química clínica, contacto, dirección.

**[S22] MAS Medicina Ambulatoria Salta — Laboratorio**  
URL: https://massalta.com.ar/laboratorio/  
Uso: laboratorio de alta complejidad, química clínica, atención sin turnos, dirección/contacto.

**[S23] Clínica del Centro Salta**  
URL: https://clinicadelcentrosalta.com.ar/  
Uso: laboratorio clínico de alta complejidad, cardiología, nutrición, teléfonos y dirección.

### Privacidad

**[S24] AAIP Argentina — Protección de datos personales**  
URL: https://www.argentina.gob.ar/aaip/datospersonales  
Uso: marco general de privacidad y protección de datos personales en Argentina.

---

## 18. Nota final de implementación

Este documento contiene copy listo para integrar, pero no reemplaza revisión clínica, legal ni de UX. La prioridad de implementación recomendada es:

1. Integrar disclaimers, consentimiento y `/modelo`.
2. Mejorar el formulario con unidades visibles, ayudas y errores por campo.
3. Integrar `/educacion`, `/faq`, `/privacidad` y `/recursos`.
4. Agregar PDF e historial local.
5. Exponer versión del modelo, threshold y política de threshold desde el backend.

