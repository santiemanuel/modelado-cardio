# PRD v0.1: App Web Local Para Predicción De Señales De Hipertensión

## Resumen

Crear una app local con `backend/` en FastAPI y `frontend/` en React para consumir el modelo entrenado existente.

La app permite cargar datos cardiometabólicos, consultar una API sin autenticación y recibir una predicción con contexto: probabilidad, etiqueta de riesgo, umbral usado y mensaje aclaratorio no diagnóstico.

## Cambios Principales

- `backend/`: FastAPI, carga del modelo `joblib`, endpoint de predicción y rate limit.
- `frontend/`: React con Vite + TypeScript.
- Artefacto del modelo en `backend/app/models/model.joblib`.
- Compatibilidad con `scikit-learn==1.8.0`.
- API sin autenticación.
- Rate limit inicial: `60 requests/minuto/IP`.

## Contrato De API

### `GET /health`

Devuelve estado del servidor y si el modelo cargo correctamente.

### `GET /model-info`

Devuelve nombre del modelo, target, threshold default y features esperadas.

### `POST /predict`

Recibe:

- `RIDAGEYR`: edad en años.
- `BMXBMI`: índice de masa corporal.
- `BMXWAIST`: cintura en cm.
- `LBXTC`: colesterol total.
- `LBDHDD`: HDL.
- `LBXGH`: hemoglobina glicosilada.
- `sex`: `Female` o `Male`.
- `race_ethnicity`: categoria entrenada.
- `current_smoker`: `0.0` o `1.0`.

El backend agrega internamente `INDFMPIR=null` antes de llamar al pipeline. El campo no se expone al usuario y queda imputado por el pipeline entrenado.

Respuesta:

```json
{
  "probability": 0.72,
  "threshold": 0.5,
  "prediction": 1,
  "risk_label": "señales compatibles con hipertensión",
  "context": "Resultado orientativo basado en señales indirectas. No reemplaza una medición de presión arterial ni una consulta médica.",
  "model_name": "logistic_regression"
}
```

## Frontend

- React + Vite + TypeScript.
- Pantalla única con formulario, validación, estado de carga, errores y resultado.
- No solicita ni muestra `INDFMPIR`.
- No presenta el resultado como diagnóstico médico.

## Backend

- FastAPI con Pydantic para validar request/response.
- Modelo cargado una sola vez al iniciar la app.
- Rate limit por IP con `slowapi`.
- CORS habilitado para frontend local.

## Regla De Idioma

Todo texto visible para el usuario debe escribirse en español correcto con tildes, diéresis cuando corresponda y la letra `ñ`, usando archivos UTF-8. No reemplazar caracteres propios del español por versiones ASCII sin diacríticos.

## Tests Y Validacion

- Backend: carga del modelo, `/health`, `/predict`, validación de campos, rate limit e imputación oculta de `INDFMPIR`.
- Frontend: validación de formulario, resultado exitoso, error de API y ausencia de `INDFMPIR` en UI.
- Validacion manual: levantar backend y frontend, completar un caso ejemplo y confirmar probabilidad, etiqueta y contexto.

## Supuestos

- Se usa el modelo actual sin reentrenar.
- `INDFMPIR` queda oculto para el usuario y se imputa por el pipeline.
- El threshold inicial es `0.5`.
- El diseño visual final queda para una etapa posterior.
- La app está pensada primero para ejecución local o demo controlada.
