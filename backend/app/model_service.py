import json
import math
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    ShapExplanation,
    SimplePredictionRequest,
    ThresholdOption,
)


APP_DIR = Path(__file__).resolve().parent
MODEL_PATH = APP_DIR / "models" / "model.joblib"
METADATA_PATH = APP_DIR / "models" / "model_metadata.json"
SIMPLE_MODEL_PATH = APP_DIR / "models" / "simple_model.joblib"
SIMPLE_METADATA_PATH = APP_DIR / "models" / "simple_model_metadata.json"

DEFAULT_CONTEXT = (
    "Resultado orientativo basado en señales indirectas. "
    "No reemplaza una medición de presión arterial ni una consulta médica."
)


FEATURE_LABELS = {
    "RIDAGEYR": "Edad",
    "BMXBMI": "IMC calculado",
    "BMXWAIST": "Perímetro de cintura",
    "LBXTC": "Colesterol total",
    "LBDHDD": "HDL",
    "LBXGH": "HbA1c",
    "sex": "Sexo reportado",
    "race_ethnicity": "Grupo étnico reportado",
    "current_smoker": "Tabaquismo actual",
}

FEATURE_UNITS = {
    "RIDAGEYR": "años",
    "BMXBMI": "kg/m²",
    "BMXWAIST": "cm",
    "LBXTC": "mg/dL",
    "LBDHDD": "mg/dL",
    "LBXGH": "%",
}

FEATURE_DESCRIPTIONS = {
    "RIDAGEYR": "Edad comparada con el punto base aprendido por el modelo.",
    "BMXBMI": "IMC calculado desde peso y altura.",
    "BMXWAIST": "Perímetro de cintura declarado frente al perfil base.",
    "LBXTC": "Colesterol total informado para esta evaluación.",
    "LBDHDD": "HDL informado para esta evaluación.",
    "LBXGH": "HbA1c informada para esta evaluación.",
    "sex": "Categoría de sexo reportado usada por NHANES.",
    "race_ethnicity": "Categoría étnica reportada usada por NHANES.",
    "current_smoker": "Respuesta declarada sobre tabaquismo actual.",
}

SEX_VALUE_LABELS = {
    "Female": "Femenino",
    "Male": "Masculino",
}

RACE_VALUE_LABELS = {
    "Mexican American": "Mexicano estadounidense",
    "Non-Hispanic Asian": "Asiático no hispano",
    "Non-Hispanic Black": "Negro no hispano",
    "Non-Hispanic White": "Blanco no hispano",
    "Other Hispanic": "Otro origen hispano",
    "Other Race / Multi-Racial": "Otra raza o multirracial",
}


class ModelService:
    def __init__(
        self,
        model_path: Path = MODEL_PATH,
        metadata_path: Path = METADATA_PATH,
        simple_model_path: Path = SIMPLE_MODEL_PATH,
        simple_metadata_path: Path = SIMPLE_METADATA_PATH,
    ):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.simple_model_path = simple_model_path
        self.simple_metadata_path = simple_metadata_path
        self.metadata = self._load_metadata()
        self.model = joblib.load(model_path)
        self.features = list(self.metadata["features"])
        self.threshold = float(self.metadata.get("threshold_default", 0.5))
        self.model_name = str(self.metadata.get("model_name", "unknown"))
        self.model_version = str(self.metadata.get("model_version", "unversioned"))
        self.simple_metadata = self._load_simple_metadata()
        self.simple_model = joblib.load(simple_model_path) if simple_model_path.exists() else None

    def _load_metadata(self) -> dict[str, Any]:
        with self.metadata_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _load_simple_metadata(self) -> dict[str, Any] | None:
        if not self.simple_metadata_path.exists():
            return None
        with self.simple_metadata_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def available_modes(self) -> list[str]:
        modes = ["complete"]
        if self.simple_model is not None and self.simple_metadata is not None:
            modes.append("simple")
        return modes

    def model_summaries(self) -> list[dict[str, Any]]:
        summaries = [
            {
                "mode": "complete",
                "model_name": self.metadata.get("model_name", "unknown"),
                "model_version": self.metadata.get("model_version", "unversioned"),
                "threshold_default": float(self.metadata.get("threshold_default", 0.5)),
                "primary_test_metrics_weighted": self.metadata.get(
                    "primary_test_metrics_weighted",
                    [],
                ),
            }
        ]
        if self.simple_metadata is not None:
            summaries.append(
                {
                    "mode": "simple",
                    "model_name": self.simple_metadata.get("model_name", "unknown"),
                    "model_version": self.simple_metadata.get("model_version", "unversioned"),
                    "threshold_default": float(self.simple_metadata.get("threshold_default", 0.5)),
                    "primary_test_metrics_weighted": self.simple_metadata.get(
                        "primary_test_metrics_weighted",
                        [],
                    ),
                }
            )
        return summaries

    def build_model_frame(
        self,
        payload: PredictionRequest | SimplePredictionRequest,
        features: list[str] | None = None,
    ) -> pd.DataFrame:
        selected_features = features or self.features
        values = payload.model_dump()
        if "INDFMPIR" in selected_features and "INDFMPIR" not in values:
            values["INDFMPIR"] = np.nan
        return pd.DataFrame([{feature: values.get(feature, np.nan) for feature in selected_features}])

    def predict(self, payload: PredictionRequest) -> PredictionResponse:
        return self._predict_with(
            payload=payload,
            model=self.model,
            metadata=self.metadata,
            mode="complete",
            context=DEFAULT_CONTEXT,
        )

    def predict_simple(self, payload: SimplePredictionRequest) -> PredictionResponse:
        if self.simple_model is None or self.simple_metadata is None:
            raise RuntimeError("Simple model is not available.")
        return self._predict_with(
            payload=payload,
            model=self.simple_model,
            metadata=self.simple_metadata,
            mode="simple",
            context=(
                "Resultado orientativo basado en menos datos porque no incluye laboratorio. "
                "La precisión puede disminuir y no reemplaza mediciones de presión arterial ni consulta médica."
            ),
        )

    def _predict_with(
        self,
        payload: PredictionRequest | SimplePredictionRequest,
        model: Any,
        metadata: dict[str, Any],
        mode: str,
        context: str,
    ) -> PredictionResponse:
        features = list(metadata["features"])
        threshold = float(metadata.get("threshold_default", 0.5))
        frame = self.build_model_frame(payload, features)
        probability = float(model.predict_proba(frame)[0][1])
        prediction = int(probability >= threshold)
        shap_explanations, shap_base_value = self._explain_with_shap(
            model=model,
            frame=frame,
            features=features,
        )
        risk_label = (
            "Señales compatibles con hipertensión"
            if prediction == 1
            else "Sin señales compatibles con hipertensión"
        )

        return PredictionResponse(
            probability=round(probability, 6),
            threshold=threshold,
            prediction=prediction,
            risk_label=risk_label,
            context=context,
            model_name=str(metadata.get("model_name", "unknown")),
            model_version=str(metadata.get("model_version", "unversioned")),
            mode=mode,  # type: ignore[arg-type]
            shap_explanations=shap_explanations,
            shap_base_value=shap_base_value,
        )

    def _explain_with_shap(
        self,
        model: Any,
        frame: pd.DataFrame,
        features: list[str],
    ) -> tuple[list[ShapExplanation], float | None]:
        if not hasattr(model, "named_steps"):
            return [], None

        preprocess = model.named_steps.get("preprocess")
        estimator = model.named_steps.get("model")
        if preprocess is None or estimator is None or not hasattr(estimator, "coef_"):
            return [], None

        baseline = self._build_shap_baseline(model=model, features=features)
        transformed_frame = self._as_dense(preprocess.transform(frame))
        transformed_baseline = self._as_dense(preprocess.transform(baseline))
        transformed_names = list(preprocess.get_feature_names_out())

        shap_values, base_value = self._calculate_linear_shap_values(
            estimator=estimator,
            transformed_frame=transformed_frame,
            transformed_baseline=transformed_baseline,
        )
        grouped_values = self._group_transformed_shap_values(
            shap_values=shap_values,
            transformed_names=transformed_names,
            features=features,
        )
        total_abs = sum(abs(value) for value in grouped_values.values())

        explanations: list[ShapExplanation] = []
        for feature in features:
            value = float(grouped_values.get(feature, 0.0))
            impact = abs(value) / total_abs if total_abs > 0 else 0.0
            if math.isclose(value, 0.0, abs_tol=1e-12):
                direction = "neutral"
            elif value > 0:
                direction = "raises_risk"
            else:
                direction = "lowers_risk"

            explanations.append(
                ShapExplanation(
                    feature=feature,
                    label=FEATURE_LABELS.get(feature, feature),
                    value=self._format_feature_value(feature, frame.iloc[0].get(feature)),
                    shap_value=round(value, 6),
                    impact=round(impact, 6),
                    direction=direction,
                    description=FEATURE_DESCRIPTIONS.get(
                        feature,
                        "Variable comparada con el punto base del modelo.",
                    ),
                )
            )

        explanations.sort(key=lambda item: abs(item.shap_value), reverse=True)
        return explanations, base_value

    def _calculate_linear_shap_values(
        self,
        estimator: Any,
        transformed_frame: np.ndarray,
        transformed_baseline: np.ndarray,
    ) -> tuple[np.ndarray, float | None]:
        try:
            import shap

            explainer = shap.LinearExplainer(estimator, transformed_baseline)
            explanation = explainer(transformed_frame)
            values = np.asarray(explanation.values)
            if values.ndim == 3:
                values = values[:, :, 1]
            base_values = np.asarray(explanation.base_values)
            base_value = float(base_values.reshape(-1)[0]) if base_values.size else None
            return values[0], round(base_value, 6) if base_value is not None else None
        except Exception:
            coefficients = np.asarray(estimator.coef_[0], dtype=float)
            values = (transformed_frame[0] - transformed_baseline[0]) * coefficients
            intercept = float(np.asarray(estimator.intercept_).reshape(-1)[0])
            base_value = intercept + float(np.dot(transformed_baseline[0], coefficients))
            return values, round(base_value, 6)

    def _build_shap_baseline(self, model: Any, features: list[str]) -> pd.DataFrame:
        baseline = {feature: np.nan for feature in features}
        preprocess = model.named_steps["preprocess"]

        for name, transformer, columns in preprocess.transformers_:
            if name == "remainder" or transformer == "drop":
                continue
            imputer = transformer.named_steps.get("imputer") if hasattr(transformer, "named_steps") else None
            if imputer is None or not hasattr(imputer, "statistics_"):
                continue
            for column, statistic in zip(columns, imputer.statistics_, strict=False):
                if column in baseline:
                    baseline[column] = statistic

        return pd.DataFrame([{feature: baseline.get(feature, np.nan) for feature in features}])

    def _group_transformed_shap_values(
        self,
        shap_values: np.ndarray,
        transformed_names: list[str],
        features: list[str],
    ) -> dict[str, float]:
        grouped = {feature: 0.0 for feature in features}
        features_by_length = sorted(features, key=len, reverse=True)

        for transformed_name, value in zip(transformed_names, shap_values, strict=False):
            feature = self._original_feature_name(
                transformed_name=transformed_name,
                features_by_length=features_by_length,
            )
            if feature in grouped:
                grouped[feature] += float(value)

        return grouped

    def _original_feature_name(
        self,
        transformed_name: str,
        features_by_length: list[str],
    ) -> str:
        if "__" in transformed_name:
            _, transformed_name = transformed_name.split("__", 1)
        if transformed_name in features_by_length:
            return transformed_name
        for feature in features_by_length:
            if transformed_name.startswith(f"{feature}_"):
                return feature
        return transformed_name

    def _format_feature_value(self, feature: str, value: Any) -> str:
        if pd.isna(value):
            return "No informado"
        if feature == "current_smoker":
            return "Sí" if float(value) == 1.0 else "No"
        if feature == "sex":
            return SEX_VALUE_LABELS.get(str(value), str(value))
        if feature == "race_ethnicity":
            return RACE_VALUE_LABELS.get(str(value), str(value))
        if isinstance(value, (float, np.floating)):
            formatted = f"{float(value):.1f}".rstrip("0").rstrip(".")
        else:
            formatted = str(value)
        unit = FEATURE_UNITS.get(feature)
        return f"{formatted} {unit}" if unit else formatted

    def _as_dense(self, values: Any) -> np.ndarray:
        if hasattr(values, "toarray"):
            values = values.toarray()
        return np.asarray(values, dtype=float)

    def thresholds(self) -> list[ThresholdOption]:
        return [
            ThresholdOption(
                name="default",
                label="Umbral por defecto",
                threshold=float(self.metadata.get("threshold_default", 0.5)),
                description="Umbral operativo usado por la predicción principal.",
            ),
            ThresholdOption(
                name="max_f1_validation",
                label="Máximo F1 en validación",
                threshold=float(self.metadata.get("threshold_max_f1_validation", self.threshold)),
                description="Punto de corte que maximizó F1 ponderado en validación.",
            ),
            ThresholdOption(
                name="screening_recall_80_validation",
                label="Tamizaje con recall mínimo 0.80",
                threshold=float(
                    self.metadata.get("threshold_screening_recall_80_validation", self.threshold)
                ),
                description="Punto de corte de validación orientado a mayor sensibilidad.",
            ),
        ]
