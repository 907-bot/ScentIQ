"""Similarity service implementing nearest-neighbor retrieval."""

from typing import List, Dict, Any
import pandas as pd
from rdkit import Chem

from scentiq_ml.similarity import SimilarityEngine
from scentiq_ml.models import ModelRegistry
from scentiq_api.schemas.similarities import (
    SimilaritySearchRequest,
    SimilaritySearchResponse,
    NeighborItem
)
from scentiq_api.core.errors import ScentIQException


class SimilarityService:
    """Manages chemical fingerprint, embedding, and odor-profile similarity searches."""

    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.engine = SimilarityEngine()
        self._load_catalog()

    def _load_catalog(self):
        full_csv = self.registry.data_dir / "full_dataset.csv"
        if not full_csv.exists():
            return

        df = pd.read_csv(full_csv)
        catalog = []
        for _, row in df.iterrows():
            catalog.append({
                "name": row.get("name", "Aroma Molecule"),
                "smiles": row["SMILES"],
                "cid": int(row["cid"]) if "cid" in row and pd.notna(row["cid"]) else None
            })
        self.engine.set_catalog(catalog)

    def search_similar(self, request: SimilaritySearchRequest) -> SimilaritySearchResponse:
        mol = Chem.MolFromSmiles(request.smiles)
        if mol is None:
            raise ScentIQException(
                code="INVALID_SMILES",
                message="Cannot compute similarity: invalid query SMILES string."
            )

        gnn_model = self.registry.get_model("scentiq-odornet-gnn")

        def pred_fn(m: Chem.Mol) -> Dict[str, float]:
            if gnn_model:
                scores, _ = gnn_model.predict_scores(m)
                return scores
            return {}

        raw_results = self.engine.search(
            query_mol=mol,
            method=request.method,
            top_k=request.top_k,
            gnn_model=gnn_model,
            prediction_fn=pred_fn
        )

        neighbors = [NeighborItem(**r) for r in raw_results]

        disclaimers = {
            "chemical_fingerprint": "Measures 2D topological atom-path overlap (Tanimoto). High chemical similarity does NOT guarantee identical odor perception (e.g. enantiomers or divergent functional groups).",
            "learned_embedding": "Measures cosine distance in the GNN's latent graph representation space. Captures structural patterns learned by the neural model.",
            "predicted_odor_profile": "Measures alignment between the model's 12-dimensional predicted category probability distributions."
        }

        return SimilaritySearchResponse(
            query_smiles=request.smiles,
            method=request.method,
            count=len(neighbors),
            neighbors=neighbors,
            method_disclaimer=disclaimers.get(request.method, "")
        )
