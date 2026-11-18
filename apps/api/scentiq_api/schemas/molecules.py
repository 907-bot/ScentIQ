"""Pydantic schemas for molecule resolution, validation, and structures."""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class ResolveMoleculeRequest(BaseModel):
    query: str = Field(min_length=1, max_length=400, description="Chemical name, SMILES, or CID")
    input_type: Literal["name", "smiles", "pubchem_cid", "auto"] = "auto"


class MoleculeDescriptors(BaseModel):
    molecular_weight: float
    logp: float
    tpsa: float
    hbd: int
    hba: int
    rotatable_bonds: int
    aromatic_rings: int
    fraction_csp3: float
    heavy_atom_count: int
    molar_refractivity: float


class MoleculeResponse(BaseModel):
    molecule_id: str
    name: Optional[str] = None
    pubchem_cid: Optional[int] = None
    original_input: str
    canonical_smiles: str
    isomeric_smiles: str
    inchi: Optional[str] = None
    inchikey: Optional[str] = None
    formula: str
    molecular_weight: float
    validation_status: str
    has_stereochemistry: bool
    chiral_centers: List[Dict[str, Any]] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    descriptors: Optional[MoleculeDescriptors] = None
    svg_2d: Optional[str] = None
    coordinates_3d: Optional[Dict[str, Any]] = None
    source: str = "PubChem / RDKit"


class ValidateMoleculeRequest(BaseModel):
    smiles: str = Field(min_length=1, max_length=1000)
    name: Optional[str] = None
