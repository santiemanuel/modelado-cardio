"""Train reproducible model variants for the cardiometabolic screening app."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    brier_score_loss,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "nhanes_case1_hypertension.csv"
METRICS_DIR = ROOT / "metrics"
RANDOM_STATE = 42
TARGET = "hypertension_130_80"
WEIGHT = "WTMEC2YR"
FORBIDDEN_FEATURES = [
    "BPXSY1",
    "BPXSY2",
    "BPXSY3",
    "BPXSY4",
    "BPXDI1",
    "BPXDI2",
    "BPXDI3",
    "BPXDI4",
    "sbp_mean_all",
    "dbp_mean_all",
    "sbp_mean_followup",
    "dbp_mean_followup",
    "sbp_mean",
    "dbp_mean",
    "BPQ020",
    "BPQ050A",
    "hbp_med_current",
]


@dataclass(frozen=True)
class Variant:
    slug: str
    model_name: str
    model_version: str
    metadata_version: str
    features: list[str]
    numeric_features: list[str]
    categorical_features: list[str]
    description: str


VARIANTS = [
    Variant(
        slug="no_indfmpir_v2",
        model_name="logistic_regression_no_indfmpir",
        model_version="case1-logreg-no-indfmpir-v2",
        metadata_version="case1-metadata-v2",
        features=[
            "RIDAGEYR",
            "BMXBMI",
            "BMXWAIST",
            "LBXTC",
            "LBDHDD",
            "LBXGH",
            "sex",
            "race_ethnicity",
            "current_smoker",
        ],
        numeric_features=["RIDAGEYR", "BMXBMI", "BMXWAIST", "LBXTC", "LBDHDD", "LBXGH"],
        categorical_features=["sex", "race_ethnicity", "current_smoker"],
        description="Modelo base sin INDFMPIR, con laboratorio disponible.",
    ),
    Variant(
        slug="simple_no_lab_v2",
        model_name="logistic_regression_simple_no_lab",
        model_version="case1-logreg-simple-no-lab-v2",
        metadata_version="case1-metadata-simple-v2",
        features=[
            "RIDAGEYR",
            "BMXBMI",
            "BMXWAIST",
            "sex",
            "race_ethnicity",
            "current_smoker",
        ],
        numeric_features=["RIDAGEYR", "BMXBMI", "BMXWAIST"],
        categorical_features=["sex", "race_ethnicity", "current_smoker"],
        description="Modelo simple para evaluación sin colesterol total, HDL ni HbA1c.",
    ),
]


def make_pipeline(variant: Variant) -> Pipeline:
    numeric_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    preprocessor = ColumnTransformer(
        [
            ("numeric", numeric_pipeline, variant.numeric_features),
            ("categorical", categorical_pipeline, variant.categorical_features),
        ]
    )
    return Pipeline(
        [
            ("preprocess", preprocessor),
            ("model", LogisticRegression(max_iter=1000, solver="lbfgs", random_state=RANDOM_STATE)),
        ]
    )


def metric_row(model_name: str, threshold: float, y_true, probabilities, sample_weight) -> dict[str, float | str]:
    predictions = (probabilities >= threshold).astype(int)
    return {
        "model": model_name,
        "threshold": threshold,
        "accuracy": accuracy_score(y_true, predictions, sample_weight=sample_weight),
        "balanced_accuracy": balanced_accuracy_score(y_true, predictions, sample_weight=sample_weight),
        "precision": precision_score(y_true, predictions, sample_weight=sample_weight, zero_division=0),
        "recall": recall_score(y_true, predictions, sample_weight=sample_weight, zero_division=0),
        "f1": f1_score(y_true, predictions, sample_weight=sample_weight, zero_division=0),
        "roc_auc": roc_auc_score(y_true, probabilities, sample_weight=sample_weight),
        "average_precision": average_precision_score(y_true, probabilities, sample_weight=sample_weight),
        "brier": brier_score_loss(y_true, probabilities, sample_weight=sample_weight),
        "log_loss": log_loss(y_true, probabilities, sample_weight=sample_weight),
    }


def threshold_table(model_name: str, y_true, probabilities, sample_weight) -> pd.DataFrame:
    rows = []
    for threshold in np.round(np.arange(0.10, 0.91, 0.02), 2):
        row = metric_row(model_name, float(threshold), y_true, probabilities, sample_weight)
        rows.append(
            {
                key: row[key]
                for key in [
                    "threshold",
                    "accuracy",
                    "balanced_accuracy",
                    "precision",
                    "recall",
                    "f1",
                ]
            }
        )
    return pd.DataFrame(rows)


def best_thresholds(validation_thresholds: pd.DataFrame) -> tuple[float, float]:
    max_f1 = validation_thresholds.sort_values(["f1", "recall"], ascending=False).iloc[0]
    recall_candidates = validation_thresholds[validation_thresholds["recall"] >= 0.80]
    if recall_candidates.empty:
        screening = validation_thresholds.sort_values("recall", ascending=False).iloc[0]
    else:
        screening = recall_candidates.sort_values(["precision", "f1"], ascending=False).iloc[0]
    return float(max_f1["threshold"]), float(screening["threshold"])


def write_variant(variant: Variant, data: pd.DataFrame) -> None:
    complete = data.dropna(subset=variant.features + [TARGET, WEIGHT]).copy()
    train_validation, test = train_test_split(
        complete,
        test_size=0.25,
        random_state=RANDOM_STATE,
        stratify=complete[TARGET],
    )
    train, validation = train_test_split(
        train_validation,
        test_size=0.25,
        random_state=RANDOM_STATE,
        stratify=train_validation[TARGET],
    )

    pipeline = make_pipeline(variant)
    pipeline.fit(train[variant.features], train[TARGET], model__sample_weight=train[WEIGHT])

    validation_probabilities = pipeline.predict_proba(validation[variant.features])[:, 1]
    test_probabilities = pipeline.predict_proba(test[variant.features])[:, 1]

    validation_thresholds = threshold_table(
        variant.model_name,
        validation[TARGET],
        validation_probabilities,
        validation[WEIGHT],
    )
    test_thresholds = threshold_table(
        variant.model_name,
        test[TARGET],
        test_probabilities,
        test[WEIGHT],
    )
    threshold_max_f1, threshold_screening = best_thresholds(validation_thresholds)
    test_metrics = pd.DataFrame(
        [
            metric_row(
                variant.model_name,
                0.5,
                test[TARGET],
                test_probabilities,
                test[WEIGHT],
            )
        ]
    )

    metadata = {
        "model_name": variant.model_name,
        "model_version": variant.model_version,
        "metadata_version": variant.metadata_version,
        "trained_at": "2026-06-24",
        "target": TARGET,
        "description": variant.description,
        "features": variant.features,
        "numeric_features": variant.numeric_features,
        "categorical_features": variant.categorical_features,
        "forbidden_features": FORBIDDEN_FEATURES,
        "threshold_default": 0.5,
        "threshold_max_f1_validation": threshold_max_f1,
        "threshold_screening_recall_80_validation": threshold_screening,
        "threshold_policy": {
            "default": "Umbral operativo por defecto para mantener continuidad.",
            "max_f1_validation": "Umbral con mayor F1 ponderado en validación.",
            "screening_recall_80_validation": "Umbral de validación con recall ponderado de al menos 0.80 y mejor precisión disponible.",
        },
        "random_state": RANDOM_STATE,
        "sklearn_version": "1.8.0",
        "csv_path_used": DATA_PATH.name,
        "rows_raw": int(len(data)),
        "rows_complete_variant": int(len(complete)),
        "rows_train": int(len(train)),
        "rows_validation": int(len(validation)),
        "rows_test": int(len(test)),
        "positive_rate_unweighted": float(complete[TARGET].mean()),
        "positive_rate_weighted": float(np.average(complete[TARGET], weights=complete[WEIGHT])),
        "primary_test_metrics_weighted": test_metrics.to_dict(orient="records"),
    }

    model_path = METRICS_DIR / f"nhanes_case1_hypertension_{variant.model_name}_pipeline_{variant.slug}.joblib"
    metadata_path = METRICS_DIR / f"nhanes_case1_hypertension_model_metadata_{variant.slug}.json"
    test_metrics_path = METRICS_DIR / f"nhanes_case1_hypertension_test_metrics_{variant.slug}.csv"
    thresholds_path = METRICS_DIR / f"nhanes_case1_hypertension_thresholds_{variant.slug}.csv"
    validation_thresholds_path = (
        METRICS_DIR / f"nhanes_case1_hypertension_validation_thresholds_{variant.slug}.csv"
    )

    joblib.dump(pipeline, model_path)
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    test_metrics.to_csv(test_metrics_path, index=False)
    test_thresholds.to_csv(thresholds_path, index=False)
    validation_thresholds.to_csv(validation_thresholds_path, index=False)
    print(f"wrote {variant.model_name}: {model_path.relative_to(ROOT)}")


def main() -> None:
    METRICS_DIR.mkdir(exist_ok=True)
    data = pd.read_csv(DATA_PATH)
    for variant in VARIANTS:
        write_variant(variant, data)


if __name__ == "__main__":
    main()
