import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.schemas import PredictionRequest, PredictionResponse


APP_DIR = Path(__file__).resolve().parent
MODEL_PATH = APP_DIR / "models" / "model.joblib"
METADATA_PATH = APP_DIR / "models" / "model_metadata.json"

DEFAULT_CONTEXT = (
    "Resultado orientativo basado en señales indirectas. "
    "No reemplaza una medición de presión arterial ni una consulta médica."
)


class ModelService:
    def __init__(self, model_path: Path = MODEL_PATH, metadata_path: Path = METADATA_PATH):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.metadata = self._load_metadata()
        self.model = joblib.load(model_path)
        self.features = list(self.metadata["features"])
        self.threshold = float(self.metadata.get("threshold_default", 0.5))
        self.model_name = str(self.metadata.get("model_name", "unknown"))

    def _load_metadata(self) -> dict[str, Any]:
        with self.metadata_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def build_model_frame(self, payload: PredictionRequest) -> pd.DataFrame:
        values = payload.model_dump()
        values["INDFMPIR"] = np.nan
        return pd.DataFrame([{feature: values.get(feature, np.nan) for feature in self.features}])

    def predict(self, payload: PredictionRequest) -> PredictionResponse:
        frame = self.build_model_frame(payload)
        probability = float(self.model.predict_proba(frame)[0][1])
        prediction = int(probability >= self.threshold)
        risk_label = (
            "señales compatibles con hipertensión"
            if prediction == 1
            else "sin señales compatibles con hipertensión"
        )

        return PredictionResponse(
            probability=round(probability, 6),
            threshold=self.threshold,
            prediction=prediction,
            risk_label=risk_label,
            context=DEFAULT_CONTEXT,
            model_name=self.model_name,
        )
