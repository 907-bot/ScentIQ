"""Health check and service status endpoint."""

from fastapi import APIRouter
from scentiq_api.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "models_status": {
            "baseline_rf": "ready",
            "odornet_gnn": "ready",
            "openpom_adapter": "ready",
            "mixture_prototype": "experimental"
        }
    }
