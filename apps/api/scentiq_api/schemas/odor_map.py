"""Pydantic schemas for 2D/3D Odor Map visualization."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class OdorMapPoint(BaseModel):
    id: str
    name: str
    smiles: str
    x: float
    y: float
    z: Optional[float] = None
    dominant_odor: str
    odor_color: str
    scores: Dict[str, float]


class OdorMapResponse(BaseModel):
    dimension: int
    projection_method: str
    total_molecules: int
    categories: List[str]
    points: List[OdorMapPoint]
