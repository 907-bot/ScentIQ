from fastapi import APIRouter
from scentiq_api.api.v1.health import router as health_router
from scentiq_api.api.v1.molecules import router as molecules_router
from scentiq_api.api.v1.predictions import router as predictions_router
from scentiq_api.api.v1.similarities import router as similarities_router
from scentiq_api.api.v1.comparisons import router as comparisons_router
from scentiq_api.api.v1.odor_map import router as odor_map_router
from scentiq_api.api.v1.datasets import router as datasets_router
from scentiq_api.api.v1.models import router as models_router
from scentiq_api.api.v1.reports import router as reports_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(molecules_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(similarities_router)
api_v1_router.include_router(comparisons_router)
api_v1_router.include_router(odor_map_router)
api_v1_router.include_router(datasets_router)
api_v1_router.include_router(models_router)
api_v1_router.include_router(reports_router)

__all__ = ["api_v1_router"]
