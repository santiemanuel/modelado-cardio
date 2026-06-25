from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Sex = Literal["Female", "Male"]
RaceEthnicity = Literal[
    "Mexican American",
    "Non-Hispanic Asian",
    "Non-Hispanic Black",
    "Non-Hispanic White",
    "Other Hispanic",
    "Other Race / Multi-Racial",
]
CurrentSmoker = Literal[0.0, 1.0]
ShapDirection = Literal["raises_risk", "lowers_risk", "neutral"]


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    RIDAGEYR: int = Field(..., ge=20, le=120, description="Age in years")
    BMXBMI: float = Field(..., ge=10, le=80, description="Body mass index")
    BMXWAIST: float = Field(..., ge=40, le=220, description="Waist circumference in cm")
    LBXTC: float = Field(..., ge=50, le=500, description="Total cholesterol")
    LBDHDD: float = Field(..., ge=5, le=200, description="HDL cholesterol")
    LBXGH: float = Field(..., ge=3, le=20, description="Glycohemoglobin")
    sex: Sex
    race_ethnicity: RaceEthnicity
    current_smoker: CurrentSmoker


class SimplePredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    RIDAGEYR: int = Field(..., ge=20, le=120, description="Age in years")
    BMXBMI: float = Field(..., ge=10, le=80, description="Body mass index")
    BMXWAIST: float = Field(..., ge=40, le=220, description="Waist circumference in cm")
    sex: Sex
    race_ethnicity: RaceEthnicity
    current_smoker: CurrentSmoker


class PredictionResponse(BaseModel):
    probability: float
    threshold: float
    prediction: int
    risk_label: str
    context: str
    model_name: str
    model_version: str | None = None
    mode: Literal["complete", "simple"] = "complete"
    shap_explanations: list["ShapExplanation"] = Field(default_factory=list)
    shap_base_value: float | None = None
    shap_output_unit: str = "log_odds"


class ShapExplanation(BaseModel):
    feature: str
    label: str
    value: str
    shap_value: float
    impact: float
    direction: ShapDirection
    description: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    metadata_version: str
    trained_at: str
    target: str
    threshold_default: float
    threshold_policy: dict[str, str]
    features: list[str]
    numeric_features: list[str]
    categorical_features: list[str]
    primary_test_metrics_weighted: list[dict[str, float | str]]
    available_modes: list[str]
    model_summaries: list[dict[str, float | str | list[dict[str, float | str]]]]


class ThresholdOption(BaseModel):
    name: str
    label: str
    threshold: float
    description: str


class ThresholdsResponse(BaseModel):
    model_name: str
    model_version: str
    threshold_policy: dict[str, str]
    thresholds: list[ThresholdOption]
