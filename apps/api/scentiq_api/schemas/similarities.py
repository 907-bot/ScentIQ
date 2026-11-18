"""Pydantic schemas for similarity search."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SimilaritySearchRequest(BaseModel):
    smiles: str = Field(min_length=1, max_length=1000)
    method: Literal["chemical_fingerprint", "learned_embedding", "predicted_odor_profile"] = "chemical_fingerprint"
    top_k: int = Field(default=6, ge=1, le=20)


class NeighborItem(BaseModel):
    name: str
    smiles: str
    cid: Optional[int] = None
    similarity_score: float
    similarity_metric: str
    method: str
    svg: Optional[str] = None


class SimilaritySearchResponse(BaseModel):
    query_smiles: str
    method: str
    count: int
    neighbors: List[NeighborItem]
    method_disclaimer: str
