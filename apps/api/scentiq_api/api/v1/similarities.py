"""Molecular similarity endpoints."""

from fastapi import APIRouter
from scentiq_ml.models import ModelRegistry
from scentiq_api.schemas.similarities import (
    SimilaritySearchRequest,
    SimilaritySearchResponse
)
from scentiq_api.services.similarity_service import SimilarityService

router = APIRouter(prefix="/similarity", tags=["Similarity"])

registry = ModelRegistry.get_instance()
sim_service = SimilarityService(registry)


@router.post("/search", response_model=SimilaritySearchResponse)
async def search_similar_molecules(request: SimilaritySearchRequest):
    return sim_service.search_similar(request)
