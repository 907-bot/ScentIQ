"""Odor Map service creating 2D/3D latent projections for landscape visualization."""

from typing import List, Dict, Any
import numpy as np
import pandas as pd
from rdkit import Chem
from sklearn.decomposition import PCA

from scentiq_ml.models import ModelRegistry
from scentiq_ml.chemistry.featurizer import compute_combined_feature_vector
from scentiq_ml.data.ontology import ODORNET_CATEGORY_METADATA, ODORNET_12_CATEGORIES
from scentiq_api.schemas.odor_map import OdorMapResponse, OdorMapPoint


class OdorMapService:
    """Computes coordinate landscape of molecules in chemical / perceptual space."""

    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self._cached_map: Dict[int, OdorMapResponse] = {}

    def get_map(self, dimension: int = 2) -> OdorMapResponse:
        if dimension in self._cached_map:
            return self._cached_map[dimension]

        full_csv = self.registry.data_dir / "full_dataset.csv"
        if not full_csv.exists():
            return OdorMapResponse(
                dimension=dimension,
                projection_method="PCA",
                total_molecules=0,
                categories=ODORNET_12_CATEGORIES,
                points=[]
            )

        df = pd.read_csv(full_csv)
        vectors = []
        valid_rows = []

        gnn = self.registry.get_model("scentiq-odornet-gnn")

        for _, row in df.iterrows():
            smi = row["SMILES"]
            mol = Chem.MolFromSmiles(smi)
            if mol is not None:
                vec = compute_combined_feature_vector(mol, n_bits=512)
                vectors.append(vec)
                valid_rows.append((row, mol))

        X = np.array(vectors)
        pca = PCA(n_components=min(dimension, 3), random_state=42)
        coords = pca.fit_transform(X)

        points = []
        for idx, (row, mol) in enumerate(valid_rows):
            name = row.get("name", "Chemical")
            smi = row["SMILES"]

            # Predict or extract dominant category
            if gnn:
                scores, _ = gnn.predict_scores(mol)
                dominant = max(scores.items(), key=lambda x: x[1])[0]
            else:
                dominant = "sweet"
                scores = {c: 0.1 for c in ODORNET_12_CATEGORIES}

            color = ODORNET_CATEGORY_METADATA.get(dominant, {}).get("color", "#6366F1")

            x_coord = float(round(coords[idx, 0], 3))
            y_coord = float(round(coords[idx, 1], 3))
            z_coord = float(round(coords[idx, 2], 3)) if dimension == 3 and coords.shape[1] > 2 else None

            points.append(OdorMapPoint(
                id=f"map_{idx}",
                name=str(name),
                smiles=smi,
                x=x_coord,
                y=y_coord,
                z=z_coord,
                dominant_odor=dominant,
                odor_color=color,
                scores={k: round(v, 3) for k, v in scores.items()}
            ))

        response = OdorMapResponse(
            dimension=dimension,
            projection_method="PCA (Chemical Fingerprint + Physicochemical Manifold)",
            total_molecules=len(points),
            categories=ODORNET_12_CATEGORIES,
            points=points
        )

        self._cached_map[dimension] = response
        return response
