"""Odor Map endpoints."""

from fastapi import APIRouter, Query
from scentiq_ml.models import ModelRegistry
from scentiq_api.schemas.odor_map import OdorMapResponse
from scentiq_api.services.odor_map_service import OdorMapService

router = APIRouter(tags=["Odor Map"])

registry = ModelRegistry.get_instance()
map_service = OdorMapService(registry)


@router.get("/odor-map", response_model=OdorMapResponse)
async def get_odor_map(dimension: int = Query(default=2, ge=2, le=3)):
    return map_service.get_map(dimension=dimension)
