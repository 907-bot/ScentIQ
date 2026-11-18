"""Chemistry service coordinating RDKit validation, descriptors, 2D depictions, and 3D coordinates."""

import hashlib
from typing import Optional, Dict, Any
from rdkit import Chem

from scentiq_ml.chemistry import (
    validate_and_standardize_smiles,
    compute_physicochemical_descriptors,
    mol_to_svg,
    generate_3d_coordinates
)
from scentiq_api.schemas.molecules import MoleculeResponse, MoleculeDescriptors
from scentiq_api.core.errors import ScentIQException


class ChemistryService:
    """Handles molecular validation and chemical feature extraction."""

    def __init__(self):
        self.molecule_store: Dict[str, MoleculeResponse] = {}

    def process_smiles(
        self,
        smiles: str,
        name: Optional[str] = None,
        pubchem_cid: Optional[int] = None,
        source: str = "RDKit"
    ) -> MoleculeResponse:
        val_res = validate_and_standardize_smiles(smiles)
        if not val_res.is_valid:
            raise ScentIQException(
                code="INVALID_SMILES",
                message=val_res.error_message or "Invalid chemical SMILES provided."
            )

        mol = Chem.MolFromSmiles(val_res.canonical_smiles)
        if mol is None:
            raise ScentIQException(
                code="SANITIZATION_FAILED",
                message="Failed to reconstruct sanitized molecule."
            )

        # Generate unique ID based on InChIKey or canonical SMILES
        mol_id = f"mol_{hashlib.sha256(val_res.canonical_smiles.encode()).hexdigest()[:12]}"

        # Descriptors
        raw_desc = compute_physicochemical_descriptors(mol)
        descriptors = MoleculeDescriptors(**raw_desc)

        # 2D SVG
        svg_2d = mol_to_svg(mol, width=420, height=300)

        # 3D Conformer Coordinates
        coords_3d = generate_3d_coordinates(mol)

        response = MoleculeResponse(
            molecule_id=mol_id,
            name=name or val_res.formula,
            pubchem_cid=pubchem_cid,
            original_input=smiles,
            canonical_smiles=val_res.canonical_smiles,
            isomeric_smiles=val_res.isomeric_smiles,
            inchi=val_res.inchi,
            inchikey=val_res.inchikey,
            formula=val_res.formula,
            molecular_weight=val_res.molecular_weight,
            validation_status="valid",
            has_stereochemistry=val_res.has_stereochemistry,
            chiral_centers=val_res.chiral_centers,
            warnings=val_res.warnings,
            descriptors=descriptors,
            svg_2d=svg_2d,
            coordinates_3d=coords_3d,
            source=source
        )

        self.molecule_store[mol_id] = response
        return response

    def get_molecule_by_id(self, mol_id: str) -> Optional[MoleculeResponse]:
        return self.molecule_store.get(mol_id)
