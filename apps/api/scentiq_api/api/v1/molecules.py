"""Molecule resolution and validation endpoints."""

from fastapi import APIRouter, Depends, Query
from scentiq_api.schemas.molecules import (
    ResolveMoleculeRequest,
    ValidateMoleculeRequest,
    MoleculeResponse
)
from scentiq_api.services.pubchem_service import PubChemService
from scentiq_api.services.chemistry_service import ChemistryService
from scentiq_api.core.errors import ScentIQException

router = APIRouter(prefix="/molecules", tags=["Molecules"])

# Injected singletons
pubchem_service = PubChemService()
chem_service = ChemistryService()


@router.post("/resolve", response_model=MoleculeResponse)
async def resolve_molecule(request: ResolveMoleculeRequest):
    query = request.query.strip()
    smiles = None
    name = None
    cid = None
    source = "RDKit"

    # If query is SMILES directly
    from rdkit import Chem
    test_mol = Chem.MolFromSmiles(query)
    if test_mol is not None and request.input_type in ("smiles", "auto"):
        smiles = query
        name = query
        source = "Direct SMILES"
    else:
        # Check PubChem
        lookup = await pubchem_service.resolve_by_name(query)
        if lookup:
            smiles = lookup["smiles"]
            name = lookup["name"]
            cid = lookup.get("cid")
            source = "PubChem"
        else:
            if request.input_type == "name":
                raise ScentIQException(
                    code="COMPOUND_NOT_FOUND",
                    message=f"Could not resolve compound name '{query}'. Try entering a valid SMILES string directly.",
                    status_code=404
                )
            # Try parsing query as SMILES anyway
            if test_mol is not None:
                smiles = query
                name = query
            else:
                raise ScentIQException(
                    code="UNRESOLVED_INPUT",
                    message=f"Could not parse '{query}' as a valid SMILES or resolve it via chemical catalog.",
                    status_code=400
                )

    return chem_service.process_smiles(smiles=smiles, name=name, pubchem_cid=cid, source=source)


@router.post("/validate", response_model=MoleculeResponse)
async def validate_molecule(request: ValidateMoleculeRequest):
    return chem_service.process_smiles(smiles=request.smiles, name=request.name)


@router.get("/{molecule_id}", response_model=MoleculeResponse)
async def get_molecule(molecule_id: str):
    mol = chem_service.get_molecule_by_id(molecule_id)
    if not mol:
        raise ScentIQException(
            code="MOLECULE_NOT_FOUND",
            message=f"Molecule with ID '{molecule_id}' not found.",
            status_code=404
        )
    return mol
