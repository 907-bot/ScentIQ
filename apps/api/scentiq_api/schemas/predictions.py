"""Pydantic schemas for single-molecule and blend odor predictions."""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


class OdorScore(BaseModel):
    label: str
    score: float
    calibrated_probability: Optional[float] = None
    category_archetype: Optional[str] = None
    color: Optional[str] = None


class ModelLineage(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: str
    name: str
    version: str
    task: str


class DatasetLineage(BaseModel):
    name: str
    version: str
    doi: Optional[str] = None


class UncertaintyInfo(BaseModel):
    status: str
    ood_flag: bool
    max_training_tanimoto: float
    message: str


class ExplanationInfo(BaseModel):
    status: str
    target_label: str
    method: str
    atom_attributions: List[Dict[str, Any]]
    highlighted_svg: Optional[str] = None
    disclaimer: str


class SinglePredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    molecule_id: Optional[str] = None
    smiles: Optional[str] = None
    model_id: str = "scentiq-odornet-gnn"
    model_version: Optional[str] = None
    top_k: int = Field(default=12, ge=1, le=12)
    include_explanation: bool = True
    explanation_target_label: Optional[str] = None


class SinglePredictionResponse(BaseModel):
    prediction_id: str
    molecule_id: str
    canonical_smiles: str
    task: str
    model: ModelLineage
    dataset: DatasetLineage
    predictions: List[OdorScore]
    dominant_category: str
    uncertainty: UncertaintyInfo
    explanation: Optional[ExplanationInfo] = None
    limitations: List[str]
    created_at: str


class BlendComponentInput(BaseModel):
    smiles: str
    fraction: float = Field(gt=0.0, le=1.0)
    name: Optional[str] = None


class BlendPredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    components: List[BlendComponentInput] = Field(min_length=2, max_length=10)
    model_id: str = "scentiq-mixture-prototype"
    concentration_basis: Literal["mole_fraction", "mass_fraction", "unknown"] = "mole_fraction"


class BlendPredictionResponse(BaseModel):
    prediction_id: str
    status: str
    model_id: str
    concentration_basis: str
    components: List[Dict[str, Any]]
    predicted_blend_profile: List[OdorScore]
    dominant_category: str
    scientific_warning: str
    created_at: str
