"""Molecular similarity search across chemical, embedding, and predicted odor spaces."""

from typing import List, Dict, Any, Optional
import numpy as np
from rdkit import Chem, DataStructs
from rdkit.Chem import AllChem
from scipy.spatial.distance import cosine

from scentiq_ml.chemistry.depiction import smiles_to_svg


class SimilarityEngine:
    """
    Computes nearest neighbor molecules across three distinct scientific similarity domains:
    1. Chemical Fingerprint (Morgan/Tanimoto)
    2. Learned Molecular Embedding (GNN latent space cosine similarity)
    3. Predicted Odor Profile (Odor vector cosine similarity)
    """

    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog = catalog or []
        self._precompute_catalog_features()

    def set_catalog(self, catalog: List[Dict[str, Any]]):
        self.catalog = catalog
        self._precompute_catalog_features()

    def _precompute_catalog_features(self):
        for item in self.catalog:
            mol = Chem.MolFromSmiles(item["smiles"])
            if mol is not None:
                item["_mol"] = mol
                item["_fp"] = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048)

    def search(
        self,
        query_mol: Chem.Mol,
        method: str = "chemical_fingerprint",
        top_k: int = 6,
        gnn_model: Optional[Any] = None,
        prediction_fn: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Search catalog for top_k similar molecules under the specified method.
        """
        if not self.catalog:
            return []

        query_fp = AllChem.GetMorganFingerprintAsBitVect(query_mol, 2, nBits=2048)
        results = []

        if method == "chemical_fingerprint":
            # Tanimoto similarity
            for item in self.catalog:
                if "_fp" in item:
                    sim = float(DataStructs.TanimotoSimilarity(query_fp, item["_fp"]))
                    results.append({
                        "name": item.get("name", "Unknown"),
                        "smiles": item["smiles"],
                        "cid": item.get("cid"),
                        "similarity_score": round(sim, 4),
                        "similarity_metric": "Morgan Tanimoto (Radius 2, 2048b)",
                        "method": "chemical_fingerprint",
                        "svg": smiles_to_svg(item["smiles"], 200, 150)
                    })
        elif method == "learned_embedding" and gnn_model is not None:
            # GNN embedding cosine similarity
            from scentiq_ml.chemistry.featurizer import mol_to_graph_data
            import torch
            with torch.no_grad():
                qx, q_edge, _ = mol_to_graph_data(query_mol)
                _, q_emb = gnn_model(qx, q_edge)
                q_vec = q_emb.squeeze(0).cpu().numpy()
                q_norm = np.linalg.norm(q_vec) + 1e-8

            for item in self.catalog:
                mol = item.get("_mol")
                if mol is not None:
                    with torch.no_grad():
                        ix, i_edge, _ = mol_to_graph_data(mol)
                        _, i_emb = gnn_model(ix, i_edge)
                        i_vec = i_emb.squeeze(0).cpu().numpy()
                        i_norm = np.linalg.norm(i_vec) + 1e-8
                    cos_sim = float(np.dot(q_vec, i_vec) / (q_norm * i_norm))
                    results.append({
                        "name": item.get("name", "Unknown"),
                        "smiles": item["smiles"],
                        "cid": item.get("cid"),
                        "similarity_score": round(cos_sim, 4),
                        "similarity_metric": "GNN Latent Cosine Similarity",
                        "method": "learned_embedding",
                        "svg": smiles_to_svg(item["smiles"], 200, 150)
                    })
        else:
            # Predicted odor profile similarity
            if prediction_fn is not None:
                q_scores = np.array(list(prediction_fn(query_mol).values()))
                q_norm = np.linalg.norm(q_scores) + 1e-8

                for item in self.catalog:
                    mol = item.get("_mol")
                    if mol is not None:
                        i_scores = np.array(list(prediction_fn(mol).values()))
                        i_norm = np.linalg.norm(i_scores) + 1e-8
                        cos_sim = float(np.dot(q_scores, i_scores) / (q_norm * i_norm))
                        results.append({
                            "name": item.get("name", "Unknown"),
                            "smiles": item["smiles"],
                            "cid": item.get("cid"),
                            "similarity_score": round(cos_sim, 4),
                            "similarity_metric": "Predicted Odor Profile Cosine",
                            "method": "predicted_odor_profile",
                            "svg": smiles_to_svg(item["smiles"], 200, 150)
                        })

        # Sort descending by similarity
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]
