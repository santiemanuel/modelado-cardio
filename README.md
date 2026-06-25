## Modelado de Sistemas de IA

Este repositorio contiene el código y los recursos relacionados con el modelado de sistemas de inteligencia artificial (IA). El objetivo es proporcionar una base sólida para la comprensión y el desarrollo de modelos de **IA**, así como para la implementación de soluciones prácticas en diversos dominios.

Proyecto de Detección de Señales de Hipertensión

# 1) Resumen de la primera iteración del proyecto

Esta primera iteración se centró en desarrollar un modelo para detectar **señales compatibles con hipertensión** en una población adulta, utilizando datos de la encuesta NHANES 2017-2018. El enfoque principal fue la **interpretabilidad, robustez y reproducibilidad**, prestando especial atención a evitar la fuga de información y asegurar la representatividad de los resultados.

### Preparación y limpieza de datos

*   **Población analítica:** Se definió la población de estudio como adultos de 20 años o más con pesos muestrales válidos y etiqueta conocida.
*   **Particionamiento de datos:** Los datos se dividieron en conjuntos de entrenamiento, validación y prueba (75%/25% y 75%/25% respectivamente), con **estratificación por la variable objetivo** y uso de **pesos muestrales (`WTMEC2YR`)** para asegurar la representatividad poblacional en cada subconjunto.

*   **Carga y validación:** Se cargó y validó la estructura del dataset `nhanes_2017_2018_cardiometabolic_raw.csv`, verificando la presencia de columnas esperadas y la unicidad de los identificadores.
*   **Limpieza de códigos Especiales:** Se convirtieron los códigos de respuesta especiales de los cuestionarios (ej., 'Refused', 'Don't know') a `NaN` para una correcta interpretación numérica.
*   **Recodificación de variables:** Se recodificaron variables categóricas como `sex` y `race_ethnicity` a formatos legibles y se derivó `age_group`.
### Justificación de transformaciones y simplificación de las variables clínicas

* **Transformaciones y simplificaciones de variables clínicas:** se realizaron considerando criterios clínicos, epidemiológicos y metodológicos. Se priorizó preservar categorías con significado clínico validado en la literatura, reducir ruido asociado a categorías poco representadas y mejorar la estabilidad estadística del modelo.

La recodificación de variables categóricas como `sex` y `race_ethnicity`, así como la derivación de `age_group`, tuvieron como objetivo facilitar la interpretación epidemiológica y permitir análisis por subgrupos clínicamente relevantes. En el caso de la edad, la agrupación en rangos etarios responde a la conocida relación no lineal entre edad y riesgo cardiovascular, además de alinearse con estrategias de estratificación utilizadas en salud pública y medicina preventiva.

Asimismo, ciertas simplificaciones buscaron reducir sparsity y evitar inestabilidad en categorías con baja frecuencia, mejorando la robustez del entrenamiento y la generalización del modelo. Estas decisiones priorizaron un balance entre capacidad predictiva, interpretabilidad clínica y reproducibilidad analítica.

### Pipelines de preprocesamiento

 La implementación de `Pipeline` y `ColumnTransformer` fue fundamental para:
 
   *   **Reproducibilidad:** Encapsula todas las transformaciones de datos, asegurando que el mismo preprocesamiento se aplique consistentemente a los conjuntos de entrenamiento, validación y prueba, así como a nuevos datos en producción.
   *   **Prevención de fuga de información:** Garantiza que los transformadores (ej., imputadores, escaladores) se ajusten solo con los datos de entrenamiento, **evitando que la información del conjunto de validación o prueba contamine el ajuste del preprocesamiento.**

   *   **Manejo de tipos de datos mixtos:** `ColumnTransformer` permite aplicar diferentes cadenas de preprocesamiento a subconjuntos de columnas (numéricas vs. categóricas), lo que es esencial para un dataset heterogéneo como NHANES.

### Imputación de valores faltantes (`SimpleImputer`):

   *   **Numéricas:** Se utilizó `strategy="median"` para las características numéricas. La mediana es una **medida de tendencia central robusta, menos sensible a los valores atípicos que la media**, lo cual es deseable para mantener la robustez del modelo.

   *   **Categóricas:** Se empleó `strategy="most_frequent"` para las características categóricas, imputando con la moda. Esta estrategia es simple y efectiva para categorías, **evitando la introducción de ruido significativo**.

### Codificación One-Hot para variables categóricas:

 Las variables categóricas (`sex`, `race_ethnicity`, `current_smoker`) se transformaron utilizando `OneHotEncoder`. Esta técnica es vital para que los algoritmos de machine learning, que operan con números, puedan procesar características nominales sin asumir una relación ordinal incorrecta entre categorías. El parámetro `handle_unknown="ignore"` se estableció para asegurar la robustez del pipeline frente a categorías no vistas durante el entrenamiento, lo que puede ocurrir en un entorno productivo.

### Construcción de la variable objetivo (`hypertension_130_80`):

La etiqueta se construyó rigurosamente a partir de múltiples lecturas de presión arterial y la declaración de uso de medicación antihipertensiva, **siguiendo umbrales clínicos (`SBP >= 130` o `DBP >= 80`) y definiciones epidemiológicas del CDC**. Esto asegura que la etiqueta sea lo más precisa y clínicamente relevante posible, a la vez que se evita la fuga de información al **no usar estas variables directamente como predictores.**

### Uso de pesos muestrales (`WTMEC2YR`):

Es una decisión fundamental para este proyecto, dada la naturaleza del dataset NHANES (encuesta compleja). Al aplicar `WTMEC2YR` como `sample_weight` durante el entrenamiento de los modelos y en el cálculo de las métricas, se **asegura que los resultados sean representativos de la población y no solo de la muestra cruda**. Esto es crucial para la validez epidemiológica y clínica de las conclusiones.

### Exclusión de variables directas de presión arterial o diagnóstico como features:

 Las variables `BPXSY*`, `BPXDI*`, `sbp_mean`, `dbp_mean`, `BPQ020`, `BPQ050A`, y `hbp_med_current` fueron explícitamente prohibidas como características de entrada para el modelo. 
 
 Esta fue una decisión crítica para evitar la **fuga de información (data leakage)**. Si estas variables se incluyeran, el modelo aprendería a predecir la hipertensión usando la misma información con la que se define la hipertensión, volviéndolo inútilmente preciso para el objetivo del proyecto: detectar *señales indirectas* de hipertensión en personas que *no* han sido medidas o diagnosticadas directamente.

### Exclusión de la variable `INDFMPIR`:

La decisión de excluir `INDFMPIR` (relación ingreso familiar / pobreza) del conjunto de características finales se basó: 

  *   **Redundancia Estadística:** 
  Los coeficientes de la regresión logística y los gráficos de densidad mostraron que su **poder predictivo era bajo o redundante en presencia de variables cardiometabólicas más directas.**

  *   **Incompatibilidad Contextual:** 
  La métrica `INDFMPIR` es específica del contexto socioeconómico de EE. UU. y su interpretación o extrapolación a otras regiones es compleja. Su inclusión podría introducir un sesgo geográfico o temporal.
  
  *   **Fricción con el Usuario Final:**
   La recolección de datos financieros puede ser sensible e invasiva. Si la variable no aporta valor predictivo significativo, **su exclusión mejora la experiencia del usuario** y reduce las barreras para la implementación.

   
### Optimización de hiperparámetros
 Se realizó una búsqueda simple de hiperparámetros en el conjunto de validación para ambos modelos, optimizando el rendimiento (`C` para regresión logística, `max_depth` y `min_samples_leaf` para Random Forest).





# 2) Justificación Técnica de Decisiones

### 2.1. Modelos desarrollados (1era iteración)

La selección de modelos, el preprocesamiento de datos y las estrategias de evaluación se basaron en los principios de interpretabilidad, robustez, reproducibilidad y adecuación al problema de identificación de señales de hipertensión en una población de encuesta compleja.


**A) Regresión Logística:**


Fue elegida como un modelo base fuerte por su **interpretabilidad y eficiencia computacional**. Permite entender la dirección y la magnitud de la asociación de cada característica con el log-odds de la señal de hipertensión, lo cual es valioso en contextos clínicos. Su naturaleza lineal proporciona un punto de referencia claro para evaluar el beneficio de modelos más complejos.

 La aplicación de `StandardScaler` a las características numéricas es crucial para la regresión logística, ya que asegura que la regularización (L2 por defecto) se aplique de manera justa a todas las características, evitando que aquellas con mayores escalas dominen los coeficientes o el proceso de optimización.

**B) Random Forest:** 

Se incorporó para explorar relaciones no lineales e interacciones entre características que un modelo lineal no podría capturar. Como método de ensamble basado en árboles de decisión, es conocido por su alta capacidad predictiva, robustez frente al sobreajuste (especialmente con una adecuada tuning de `max_depth` y `min_samples_leaf`) y menor sensibilidad a los outliers y a la necesidad de escalar características numéricas. Ofrece una visión de la importancia de las características, aunque de manera diferente a los coeficientes de regresión.


### 2.2 Alternativas descartadas

Se consideraron y descartaron varias alternativas durante el proceso de modelado, por lo siguiente:

*   **`DummyClassifier` como Modelo Final:** El `DummyClassifier` (con estrategia `prior`) fue utilizado exclusivamente como un baseline de rendimiento. Se descartó como modelo final porque su objetivo es solo predecir la clase mayoritaria o basarse en la distribución de clases del entrenamiento, sin aprender ninguna relación con las características. Su bajo `roc_auc` (alrededor de 0.50) en la validación confirmó que, **si bien es útil para establecer un piso de rendimiento, no tiene poder de clasificación real basado en las features.**

*   **Modelos más complejos (ej., Gradient Boosting Machines, Redes Neuronales):** Aunque modelos como LightGBM, XGBoost o Redes Neuronales podrían ofrecer un mayor rendimiento predictivo, no fueron seleccionados para esta fase inicial por las siguientes razones:

    *   **Interpretabilidad:** Priorizamos modelos que permitieran una **comprensión más directa de las relaciones entre características y la etiqueta**, lo cual es fundamental en el ámbito de la salud para la confianza y la auditabilidad. La regresión logística y Random Forest ofrecen un mejor balance en este aspecto para una primera iteración.
  
    *   **Sobreajuste:** Sin una justificación clara de la necesidad de capturar relaciones extremadamente complejas, el riesgo de sobreajuste aumenta con modelos de mayor complejidad.

### 2.3. El mejor modelo para detectar señales de hipertensión (1era iteración)

Para identificar el mejor modelo con el objetivo de reducir falsos negativos, **debemos enfocarnos en la métrica Recall (sensibilidad)**. Un recall más alto significa que el modelo es capaz de identificar una mayor proporción de los casos positivos reales, lo que se traduce en menos falsos negativos. Esto es crucial en un contexto de detección de señales de hipertensión, donde no detectar un caso positivo (falso negativo) puede tener implicaciones importantes para la salud. 

Es importante recordar que el recall se maximiza a menudo a expensas de la precisión. La matriz de confusión y la curva Precision-Recall permiten visualizar este trade-off y **decidir un umbral que equilibre** ambos si es necesario para los objetivos operativos específicos.

Según las métricas ponderadas en el conjunto de prueba (test_metrics_weighted):

> **El modelo con el Recall más alto es la regresión logística.**


*   `Recall`: 0.6120
*   `ROC-AUC`: 0.8166
*   `Average Precision`: 0.6970
*   `Precision`: 0.5910
*   `F1 Score`: 0.6013
*   `Accuracy`: 0.7719
*   `Balanced Accuracy`: 0.7303
*   `Brier Score`: 0.1706
*   `Log Loss`: 0.4682

---

# 3) App local FastAPI + React

Esta iteración agrega una app local con:

* `backend/`: API FastAPI que carga el modelo entrenado desde `backend/app/models/model.joblib`.
* `frontend/`: app React + Vite + TypeScript para completar el formulario y consultar la API.
* `docs/PRD.md`: PRD de la versión inicial.

La API no usa autenticación. Incluye rate limit por IP para evitar saturar el servidor local.

## Requisitos

* Python compatible con las dependencias del modelo.
* Node.js y npm.
* El artefacto `backend/app/models/model.joblib` debe existir. La copia operativa actual proviene de `metrics/nhanes_case1_hypertension_logistic_regression_no_indfmpir_pipeline_no_indfmpir_v2.joblib`.

## Levantar backend

Desde la raiz del repo:

```bash
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python -m uvicorn app.main:app --app-dir backend --reload
```

En PowerShell tambien se puede usar:

```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload
```

La API queda disponible en `http://127.0.0.1:8000`.

Probar salud:

```bash
curl http://127.0.0.1:8000/health
```

Información del modelo activo:

```bash
curl http://127.0.0.1:8000/model-info
curl http://127.0.0.1:8000/thresholds
```

Ejemplo de predicción:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d "{\"RIDAGEYR\":66,\"BMXBMI\":31.7,\"BMXWAIST\":101.8,\"LBXTC\":157,\"LBDHDD\":60,\"LBXGH\":6.2,\"sex\":\"Female\",\"race_ethnicity\":\"Non-Hispanic Black\",\"current_smoker\":0.0}"
```

Ejemplo de predicción simple sin laboratorio reciente:

```bash
curl -X POST http://127.0.0.1:8000/predict-simple \
  -H "Content-Type: application/json" \
  -d "{\"RIDAGEYR\":66,\"BMXBMI\":31.7,\"BMXWAIST\":101.8,\"sex\":\"Female\",\"race_ethnicity\":\"Non-Hispanic Black\",\"current_smoker\":0.0}"
```

El modo simple no usa colesterol total, HDL ni HbA1c. El resultado debe interpretarse con más cautela porque se calcula con menos información.

### Configuración CORS

Por defecto, el backend acepta `http://localhost:5173` y `http://127.0.0.1:5173`.

Para previews o puertos alternativos, definir una lista separada por coma:

```powershell
$env:CORS_ALLOW_ORIGINS="http://localhost:5173,http://127.0.0.1:5174,https://preview.example"
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload
```

### Modelos y artefactos

El modelo operativo actual es `case1-logreg-no-indfmpir-v2`, una regresión logística entrenada sin `INDFMPIR`. La aplicación no necesita inferir, enviar ni completar esa variable para el modelo activo.

También queda disponible `case1-logreg-simple-no-lab-v2`, una variante simple sin colesterol total, HDL ni HbA1c para usuarios sin laboratorio reciente.

Archivos principales:

* `backend/app/models/model.joblib`
* `backend/app/models/model_metadata.json`
* `backend/app/models/simple_model.joblib`
* `backend/app/models/simple_model_metadata.json`
* `backend/app/models/model_registry.json`

Los artefactos versionados de origen quedan en `metrics/`.

Para regenerar las variantes:

```powershell
.\venv\Scripts\python.exe scripts\train_model_variants.py
```

## Levantar frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://127.0.0.1:5173`.

Si la API corre en otra URL, crear `frontend/.env.local` con:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Ejecutar tests

Backend:

```bash
backend/.venv/Scripts/python -m pytest backend/tests
```

Frontend:

```bash
cd frontend
npm test
```

## Notas de producto

* `INDFMPIR` no se solicita ni se muestra en el frontend.
* El modelo operativo actual no contiene `INDFMPIR` en sus features.
* `ModelService` conserva una compatibilidad defensiva para artefactos legacy que sí esperen `INDFMPIR`, pero esa rama no se usa con `case1-logreg-no-indfmpir-v2`.
* Todo texto visible para el usuario debe mantenerse en español correcto, con tildes y `ñ` cuando corresponda.
* El resultado es orientativo y no reemplaza una medición de presión arterial ni una consulta médica.

Aunque otros modelos podrían tener un rendimiento ligeramente superior en otras métricas, si el objetivo principal es reducir los falsos negativos, la regresión logística es la opción preferida por su mayor recall.

# 4) Reporte de Evaluación de Modelos

A continuación se detalla el rendimiento de los modelos operativos v2 evaluados sobre el conjunto de prueba ponderado. Las métricas completas quedan versionadas en `metrics/` y copiadas a la metadata operativa de `backend/app/models/`.

### 4.1. Métricas Globales de Prueba (Test Metrics)

Se evaluaron dos variantes con un umbral de decisión por defecto de 0.5:

| Modelo | Exactitud (Accuracy) | Precisión (Precision) | Sensibilidad (Recall) | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Base sin INDFMPIR** (`case1-logreg-no-indfmpir-v2`) | 72.1% | 70.7% | 72.6% | 71.6% | 78.0% |
| **Simple sin laboratorio** (`case1-logreg-simple-no-lab-v2`) | 71.9% | 71.1% | 75.3% | 73.1% | 78.8% |

**Interpretación de las métricas:**
*   **Modelo base sin INDFMPIR:** es el modelo principal de la aplicación completa. Usa laboratorio reciente, mantiene trazabilidad de versión y elimina la variable socioeconómica `INDFMPIR` del pipeline.
*   **Modelo simple sin laboratorio:** permite una evaluación opcional cuando la persona no tiene colesterol total, HDL ni HbA1c recientes. Trabaja con menos información, por lo que la UI y el PDF advierten que la precisión puede disminuir.
*   **Comparación:** las métricas son cercanas entre variantes, pero no deben interpretarse como validación clínica local. El modo simple existe para reducir fricción, no para reemplazar al modo completo.

*Nota: estos valores provienen del split de prueba definido por `scripts/train_model_variants.py` y deben revisarse si se reentrenan artefactos o cambia el dataset fuente.*

### 4.2. Análisis de Umbrales de Decisión (Thresholds)

El análisis de diferentes puntos de corte permite ajustar el comportamiento del modelo para priorizar detección o precisión. El backend expone los thresholds documentados del modelo activo en `/thresholds`.

Thresholds disponibles para `case1-logreg-no-indfmpir-v2`:

| Nombre | Umbral | Uso |
| :--- | :---: | :--- |
| `default` | 0.50 | Umbral operativo usado por `/predict`. |
| `max_f1_validation` | 0.42 | Umbral con mayor F1 ponderado en validación. |
| `screening_recall_80_validation` | 0.48 | Umbral de validación orientado a recall ponderado de al menos 0.80. |

Por ahora la app muestra thresholds y tramos comunicacionales, pero no permite que el usuario cambie el umbral operativo desde el formulario.


