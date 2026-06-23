import os

from fastapi import FastAPI, Request
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
)


def create_app(rate_limit: str | None = None) -> FastAPI:
    limit = rate_limit or os.getenv("RATE_LIMIT", "60/minute")
    limiter = Limiter(key_func=get_remote_address, default_limits=[limit])

    app = FastAPI(
        title="Cardiometabolic Screening API",
        version="0.1.0",
        description="Local API for indirect hypertension signal prediction.",
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    model_service = ModelService()
    app.state.model_service = model_service

    @app.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(status="ok", model_loaded=model_service.model is not None)

    @app.get("/model-info", response_model=ModelInfoResponse)
    def model_info() -> ModelInfoResponse:
        return ModelInfoResponse(
            model_name=model_service.model_name,
            target=str(model_service.metadata["target"]),
            threshold_default=model_service.threshold,
            features=model_service.features,
        )

    @app.post("/predict", response_model=PredictionResponse)
    def predict(request: Request, payload: PredictionRequest) -> PredictionResponse:
        return model_service.predict(payload)

    return app


app = create_app()
