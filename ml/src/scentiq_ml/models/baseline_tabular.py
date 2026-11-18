"""Baseline tabular multi-label model for molecular odor prediction."""

from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from rdkit import Chem

from scentiq_ml.chemistry.featurizer import compute_combined_feature_vector
from scentiq_ml.data.ontology import ODORNET_12_CATEGORIES


class BaselineTabularModel:
    """
    Random Forest multi-label odor prediction baseline operating on
    Morgan Fingerprints (radius=2, 2048-bit) and physicochemical descriptors.
    """

    def __init__(self, labels: Optional[List[str]] = None, n_estimators: int = 100, random_state: int = 42):
        self.labels = labels or ODORNET_12_CATEGORIES
        self.random_state = random_state
        self.model_id = "scentiq-baseline-rf"
        self.model_version = "0.1.0"
        self.task = "single_molecule_odor_multilabel"
        self.dataset_name = "OdorNet"
        self.feature_dim = 2048 + 10  # 2048 Morgan bits + 10 physicochemical descriptors

        base_rf = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=16,
            min_samples_split=2,
            random_state=random_state,
            n_jobs=1
        )
        self.classifier = MultiOutputClassifier(base_rf)
        self.is_fitted = False

    def featurize_smiles_list(self, smiles_list: List[str]) -> np.ndarray:
        features = []
        for s in smiles_list:
            mol = Chem.MolFromSmiles(s)
            if mol is None:
                vec = np.zeros(self.feature_dim, dtype=np.float32)
            else:
                vec = compute_combined_feature_vector(mol, n_bits=2048)
            features.append(vec)
        return np.array(features, dtype=np.float32)

    def fit(self, smiles_list: List[str], label_matrix: np.ndarray, mask: Optional[np.ndarray] = None) -> "BaselineTabularModel":
        """
        Train the multi-output classifier.
        Supports masked labels by imputation of unobserved entries for tree training.
        """
        X = self.featurize_smiles_list(smiles_list)
        y = np.nan_to_num(label_matrix, nan=0.0)

        self.classifier.fit(X, y)
        self.is_fitted = True
        return self

    def predict_scores(self, mol: Chem.Mol) -> Dict[str, float]:
        """Predict continuous probability/score for each odor label."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted yet.")

        vec = compute_combined_feature_vector(mol, n_bits=2048).reshape(1, -1)
        probas = self.classifier.predict_proba(vec)

        scores: Dict[str, float] = {}
        for idx, label in enumerate(self.labels):
            # predict_proba returns list of arrays [n_samples, 2] for each output
            p = probas[idx]
            if p.shape[1] > 1:
                score = float(p[0, 1])
            else:
                score = float(p[0, 0])
            scores[label] = round(score, 4)

        return scores
