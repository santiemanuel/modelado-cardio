from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas import PredictionRequest


VALID_PAYLOAD = {
    "RIDAGEYR": 66,
    "BMXBMI": 31.7,
    "BMXWAIST": 101.8,
    "LBXTC": 157.0,
    "LBDHDD": 60.0,
    "LBXGH": 6.2,
    "sex": "Female",
    "race_ethnicity": "Non-Hispanic Black",
    "current_smoker": 0.0,
}


def test_model_loads() -> None:
    app = create_app()
    assert app.state.model_service.model is not None
    assert app.state.model_service.model_name == "logistic_regression_no_indfmpir"


def test_health() -> None:
    client = TestClient(create_app())
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "model_loaded": True}


def test_predict_valid_payload() -> None:
    client = TestClient(create_app())
    response = client.post("/predict", json=VALID_PAYLOAD)
    body = response.json()

    assert response.status_code == 200
    assert 0 <= body["probability"] <= 1
    assert body["threshold"] == 0.5
    assert body["prediction"] in [0, 1]
    assert body["model_name"] == "logistic_regression_no_indfmpir"
    assert body["model_version"] == "case1-logreg-no-indfmpir-v2"
    assert body["mode"] == "complete"
    assert "No reemplaza" in body["context"]
    assert body["shap_output_unit"] == "log_odds"
    assert body["shap_base_value"] is not None
    assert len(body["shap_explanations"]) == 9
    assert {item["feature"] for item in body["shap_explanations"]} == {
        "RIDAGEYR",
        "BMXBMI",
        "BMXWAIST",
        "LBXTC",
        "LBDHDD",
        "LBXGH",
        "sex",
        "race_ethnicity",
        "current_smoker",
    }
    assert body["shap_explanations"][0]["impact"] >= body["shap_explanations"][-1]["impact"]


def test_predict_rejects_missing_required_field() -> None:
    client = TestClient(create_app())
    payload = dict(VALID_PAYLOAD)
    payload.pop("BMXBMI")

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_operational_model_does_not_use_indfmpir() -> None:
    app = create_app()
    payload = PredictionRequest(**VALID_PAYLOAD)

    frame = app.state.model_service.build_model_frame(payload)

    assert "INDFMPIR" not in frame.columns
    assert "INDFMPIR" not in app.state.model_service.features
    assert "INDFMPIR" not in VALID_PAYLOAD


def test_predict_simple_uses_model_without_laboratory_fields() -> None:
    client = TestClient(create_app())
    payload = {
        "RIDAGEYR": 66,
        "BMXBMI": 31.7,
        "BMXWAIST": 101.8,
        "sex": "Female",
        "race_ethnicity": "Non-Hispanic Black",
        "current_smoker": 0.0,
    }

    response = client.post("/predict-simple", json=payload)
    body = response.json()

    assert response.status_code == 200
    assert body["model_name"] == "logistic_regression_simple_no_lab"
    assert body["model_version"] == "case1-logreg-simple-no-lab-v2"
    assert body["mode"] == "simple"
    assert "menos datos" in body["context"]
    assert len(body["shap_explanations"]) == 6
    assert "LBXTC" not in {item["feature"] for item in body["shap_explanations"]}


def test_model_info_exposes_versioned_metadata() -> None:
    client = TestClient(create_app())

    response = client.get("/model-info")
    body = response.json()

    assert response.status_code == 200
    assert body["model_version"] == "case1-logreg-no-indfmpir-v2"
    assert body["metadata_version"] == "case1-metadata-v2"
    assert body["trained_at"] == "2026-06-24"
    assert body["threshold_policy"]["default"]
    assert body["available_modes"] == ["complete", "simple"]
    assert [summary["mode"] for summary in body["model_summaries"]] == ["complete", "simple"]
    assert body["model_summaries"][1]["model_version"] == "case1-logreg-simple-no-lab-v2"
    assert "INDFMPIR" not in body["features"]


def test_thresholds_endpoint_exposes_named_options() -> None:
    client = TestClient(create_app())

    response = client.get("/thresholds")
    body = response.json()

    assert response.status_code == 200
    names = {item["name"] for item in body["thresholds"]}
    assert {"default", "max_f1_validation", "screening_recall_80_validation"} <= names
    assert body["model_version"] == "case1-logreg-no-indfmpir-v2"


def test_cors_origins_can_be_configured(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ALLOW_ORIGINS", "https://preview.example, http://localhost:5173")
    client = TestClient(create_app())

    response = client.options(
        "/health",
        headers={
            "Origin": "https://preview.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://preview.example"


def test_rate_limit_applies_per_ip() -> None:
    client = TestClient(create_app(rate_limit="2/minute"))

    assert client.get("/health").status_code == 200
    assert client.get("/health").status_code == 200
    assert client.get("/health").status_code == 429
