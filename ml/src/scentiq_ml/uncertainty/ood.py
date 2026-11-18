"""Out-Of-Distribution (OOD) detection in fingerprint and chemical descriptor spaces."""

from dataclasses import dataclass
from typing import List, Optional, Any
import numpy as np
from rdkit import Chem, DataStructs
from rdkit.Chem import AllChem, Descriptors


@dataclass
class OODResult:
    is_ood: bool
    status: str  # "in_distribution", "borderline", "out_of_distribution"
    max_training_tanimoto: float
    nearest_training_smiles: Optional[str]
    message: str


class OODDetector:
    """
    Evaluates whether a target molecule falls outside the model's training manifold.
    Uses exact Morgan / Tanimoto similarity against training set fingerprints
    and physicochemical bounding checks.
    """

    def __init__(self, training_smiles: Optional[List[str]] = None):
        self.training_fps: List[Any] = []
        self.training_smiles: List[str] = []
        if training_smiles:
            self.fit(training_smiles)

    def fit(self, smiles_list: List[str]):
        self.training_smiles = smiles_list
        self.training_fps = []
        for s in smiles_list:
            mol = Chem.MolFromSmiles(s)
            if mol is not None:
                fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048)
                self.training_fps.append(fp)

    def evaluate(self, mol: Chem.Mol) -> OODResult:
        if not self.training_fps:
            return OODResult(
                is_ood=False,
                status="uncalibrated",
                max_training_tanimoto=1.0,
                nearest_training_smiles=None,
                message="Training manifold not loaded; OOD status unknown."
            )

        query_fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048)
        sims = DataStructs.BulkTanimotoSimilarity(query_fp, self.training_fps)
        max_idx = int(np.argmax(sims))
        max_sim = float(sims[max_idx])
        nearest_smi = self.training_smiles[max_idx]

        # Molecular weight sanity check
        mw = Descriptors.MolWt(mol)

        if max_sim < 0.28 or mw > 600 or mw < 30:
            return OODResult(
                is_ood=True,
                status="out_of_distribution",
                max_training_tanimoto=round(max_sim, 3),
                nearest_training_smiles=nearest_smi,
                message="Molecule is chemically distant from training scaffolds (max Tanimoto < 0.28). Treat predictions with caution."
            )
        elif max_sim < 0.42:
            return OODResult(
                is_ood=False,
                status="borderline",
                max_training_tanimoto=round(max_sim, 3),
                nearest_training_smiles=nearest_smi,
                message="Moderate chemical divergence from training set (Tanimoto 0.28 - 0.42). Exploratory confidence."
            )
        else:
            return OODResult(
                is_ood=False,
                status="in_distribution",
                max_training_tanimoto=round(max_sim, 3),
                nearest_training_smiles=nearest_smi,
                message="Molecule resides within the well-sampled chemical space of the training dataset."
            )
