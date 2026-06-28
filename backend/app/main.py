import os

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from slowapi import _rate_limit_exceeded_handler

from app.model_service import ModelService
from app.schemas import (
    HealthResponse,
    ModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
    SimplePredictionRequest,
    ThresholdsResponse,
)


API_PREFIX = "/api"
DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]


def parse_cors_origins(value: str | None = None) -> list[str]:
    raw_value = value if value is not None else os.getenv("CORS_ALLOW_ORIGINS", "")
    origins = [origin.strip() for origin in raw_value.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ORIGINS


def create_app(rate_limit: str | None = None) -> FastAPI:
    limit = rate_limit or os.getenv("RATE_LIMIT", "60/minute")
    limiter = Limiter(key_func=get_remote_address, default_limits=[limit])

    app = FastAPI(
        title="Cardiometabolic Screening API",
        version="0.1.0",
        description="Local API for indirect hypertension signal prediction.",
        docs_url=f"{API_PREFIX}/docs",
        redoc_url=f"{API_PREFIX}/redoc",
        openapi_url=f"{API_PREFIX}/openapi.json",
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=parse_cors_origins(),
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    model_service = ModelService()
    app.state.model_service = model_service

    router = APIRouter(prefix=API_PREFIX)

    @router.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(status="ok", model_loaded=model_service.model is not None)

    @router.get("/model-info", response_model=ModelInfoResponse)
    def model_info() -> ModelInfoResponse:
        return ModelInfoResponse(
            model_name=model_service.model_name,
            model_version=model_service.model_version,
            metadata_version=str(model_service.metadata.get("metadata_version", "unversioned")),
            trained_at=str(model_service.metadata.get("trained_at", "unknown")),
            target=str(model_service.metadata["target"]),
            threshold_default=model_service.threshold,
            threshold_policy=dict(model_service.metadata.get("threshold_policy", {})),
            features=model_service.features,
            numeric_features=list(model_service.metadata.get("numeric_features", [])),
            categorical_features=list(model_service.metadata.get("categorical_features", [])),
            primary_test_metrics_weighted=list(
                model_service.metadata.get("primary_test_metrics_weighted", [])
            ),
            available_modes=model_service.available_modes(),
            model_summaries=model_service.model_summaries(),
        )

    @router.get("/thresholds", response_model=ThresholdsResponse)
    def thresholds() -> ThresholdsResponse:
        return ThresholdsResponse(
            model_name=model_service.model_name,
            model_version=model_service.model_version,
            threshold_policy=dict(model_service.metadata.get("threshold_policy", {})),
            thresholds=model_service.thresholds(),
        )

    @router.post("/predict", response_model=PredictionResponse)
    def predict(request: Request, payload: PredictionRequest) -> PredictionResponse:
        return model_service.predict(payload)

    @router.post("/predict-simple", response_model=PredictionResponse)
    def predict_simple(request: Request, payload: SimplePredictionRequest) -> PredictionResponse:
        return model_service.predict_simple(payload)

    app.include_router(router)

    return app


app = create_app()
