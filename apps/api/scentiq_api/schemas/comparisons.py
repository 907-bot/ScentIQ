"""Pydantic schemas for multi-molecule comparison."""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class CompareMoleculesRequest(BaseModel):
    smiles_list: List[str] = Field(min_length=2, max_length=4)
    model_id: str = "scentiq-odornet-gnn"


class MoleculeCompareItem(BaseModel):
    smiles: str
    name: str
    formula: str
    molecular_weight: float
    svg: str
    descriptors: Dict[str, Any]
    odor_scores: Dict[str, float]
    dominant_odor: str


class CompareMoleculesResponse(BaseModel):
    molecules: List[MoleculeCompareItem]
    pairwise_chemical_tanimoto: Dict[str, float]
    pairwise_odor_similarity: Dict[str, float]
    delta_descriptors: Dict[str, Dict[str, float]]
