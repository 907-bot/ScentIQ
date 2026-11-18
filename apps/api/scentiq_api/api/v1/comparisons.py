"""Molecule comparison endpoint."""

from typing import Dict, Any
from fastapi import APIRouter
from rdkit import Chem, DataStructs
from rdkit.Chem import AllChem

from scentiq_ml.models import ModelRegistry
from scentiq_ml.chemistry import (
    validate_and_standardize_smiles,
    compute_physicochemical_descriptors,
    mol_to_svg
)
from scentiq_api.schemas.comparisons import (
    CompareMoleculesRequest,
    CompareMoleculesResponse,
    MoleculeCompareItem
)
from scentiq_api.core.errors import ScentIQException

router = APIRouter(tags=["Compare"])

registry = ModelRegistry.get_instance()


@router.post("/compare", response_model=CompareMoleculesResponse)
async def compare_molecules(request: CompareMoleculesRequest):
    if len(request.smiles_list) < 2:
        raise ScentIQException(code="INSUFFICIENT_MOLECULES", message="Please provide at least 2 molecules to compare.")

    gnn_model = registry.get_model("scentiq-odornet-gnn")

    items = []
    mols = []
    fps = []

    for idx, smi in enumerate(request.smiles_list):
        val = validate_and_standardize_smiles(smi)
        if not val.is_valid:
            raise ScentIQException(code="INVALID_SMILES", message=f"Molecule at index {idx} ({smi}) is invalid.")

        mol = Chem.MolFromSmiles(val.canonical_smiles)
        mols.append(mol)
        fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048)
        fps.append(fp)

        desc = compute_physicochemical_descriptors(mol)
        svg = mol_to_svg(mol, 240, 180)

        if gnn_model:
            scores, _ = gnn_model.predict_scores(mol)
            dom = max(scores.items(), key=lambda x: x[1])[0]
        else:
            scores = {}
            dom = "unknown"

        items.append(MoleculeCompareItem(
            smiles=val.canonical_smiles,
            name=val.formula or f"Molecule {idx+1}",
            formula=val.formula,
            molecular_weight=val.molecular_weight,
            svg=svg,
            descriptors=desc,
            odor_scores=scores,
            dominant_odor=dom
        ))

    # Compute pairwise metrics
    pairwise_tanimoto = {}
    pairwise_odor = {}

    import numpy as np
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            pair_key = f"{items[i].name} vs {items[j].name}"
            # Tanimoto
            tan = float(DataStructs.TanimotoSimilarity(fps[i], fps[j]))
            pairwise_tanimoto[pair_key] = round(tan, 4)

            # Odor vector cosine
            v1 = np.array(list(items[i].odor_scores.values()))
            v2 = np.array(list(items[j].odor_scores.values()))
            if len(v1) > 0 and len(v2) > 0:
                n1 = np.linalg.norm(v1) + 1e-8
                n2 = np.linalg.norm(v2) + 1e-8
                cos_sim = float(np.dot(v1, v2) / (n1 * n2))
                pairwise_odor[pair_key] = round(cos_sim, 4)

    # Compute descriptor deltas relative to first molecule
    delta_descriptors = {}
    base_desc = items[0].descriptors
    for k in base_desc.keys():
        deltas = {}
        for m in items:
            deltas[m.name] = round(float(m.descriptors[k] - base_desc[k]), 2)
        delta_descriptors[k] = deltas

    return CompareMoleculesResponse(
        molecules=items,
        pairwise_chemical_tanimoto=pairwise_tanimoto,
        pairwise_odor_similarity=pairwise_odor,
        delta_descriptors=delta_descriptors
    )
