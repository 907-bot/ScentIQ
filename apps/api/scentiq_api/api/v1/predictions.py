"""Odor prediction endpoints for single molecules and blends."""

from fastapi import APIRouter
from rdkit import Chem

from scentiq_ml.models import ModelRegistry
from scentiq_api.schemas.predictions import (
    SinglePredictionRequest,
    SinglePredictionResponse,
    BlendPredictionRequest,
    BlendPredictionResponse
)
from scentiq_api.services.chemistry_service import ChemistryService
from scentiq_api.services.prediction_service import PredictionService
from scentiq_api.core.errors import ScentIQException

router = APIRouter(prefix="/predictions", tags=["Predictions"])

registry = ModelRegistry.get_instance()
chem_service = ChemistryService()
pred_service = PredictionService(registry)


@router.post("/single", response_model=SinglePredictionResponse)
async def predict_single_molecule(request: SinglePredictionRequest):
    smiles = request.smiles
    mol_id = request.molecule_id

    if not smiles and mol_id:
        stored = chem_service.get_molecule_by_id(mol_id)
        if stored:
            smiles = stored.canonical_smiles

    if not smiles:
        raise ScentIQException(
            code="MISSING_INPUT",
            message="Either 'smiles' or a valid 'molecule_id' must be provided."
        )

    # Process molecule
    mol_res = chem_service.process_smiles(smiles)
    mol = Chem.MolFromSmiles(mol_res.canonical_smiles)

    return pred_service.predict_single(
        request=request,
        mol=mol,
        canonical_smiles=mol_res.canonical_smiles,
        mol_id=mol_res.molecule_id
    )


@router.post("/blend", response_model=BlendPredictionResponse)
async def predict_blend(request: BlendPredictionRequest):
    return pred_service.predict_blend(request)


@router.get("/{prediction_id}", response_model=SinglePredictionResponse)
async def get_prediction(prediction_id: str):
    pred = pred_service.get_prediction_by_id(prediction_id)
    if not pred:
        raise ScentIQException(
            code="PREDICTION_NOT_FOUND",
            message=f"Prediction '{prediction_id}' not found.",
            status_code=404
        )
    return pred
