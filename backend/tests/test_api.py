import math

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
    assert app.state.model_service.model_name == "logistic_regression"


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
    assert body["model_name"] == "logistic_regression"
    assert "No reemplaza" in body["context"]


def test_predict_rejects_missing_required_field() -> None:
    client = TestClient(create_app())
    payload = dict(VALID_PAYLOAD)
    payload.pop("BMXBMI")

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_indfmpir_is_added_hidden_as_missing() -> None:
    app = create_app()
    payload = PredictionRequest(**VALID_PAYLOAD)

    frame = app.state.model_service.build_model_frame(payload)

    assert "INDFMPIR" in frame.columns
    assert math.isnan(frame.loc[0, "INDFMPIR"])
    assert "INDFMPIR" not in VALID_PAYLOAD


def test_rate_limit_applies_per_ip() -> None:
    client = TestClient(create_app(rate_limit="2/minute"))

    assert client.get("/health").status_code == 200
    assert client.get("/health").status_code == 200
    assert client.get("/health").status_code == 429
