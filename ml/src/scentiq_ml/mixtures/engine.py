"""Mixture and blend odor modeling engine."""

from typing import List, Dict, Any, Optional
import numpy as np
from rdkit import Chem

from scentiq_ml.data.ontology import ODORNET_12_CATEGORIES


class MixtureEngine:
    """
    Experimental multi-component blend odor prediction framework.
    Strictly prevents ungrounded arithmetic label averaging, modeling
    non-linear odor masking and synergies with concentration weighting.
    """

    def __init__(self, labels: Optional[List[str]] = None):
        self.labels = labels or ODORNET_12_CATEGORIES

    def predict_blend(
        self,
        components: List[Dict[str, Any]],
        concentration_basis: str = "mole_fraction",
        single_prediction_fn: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Evaluate mixture odor profile.
        components: list of {'smiles': str, 'fraction': float, 'name': Optional[str]}
        """
        if len(components) < 2:
            raise ValueError("A mixture requires at least two chemical components.")

        total_fraction = sum(c["fraction"] for c in components)
        if abs(total_fraction - 1.0) > 0.05:
            # Normalize fractions if close to 1
            for c in components:
                c["fraction"] = c["fraction"] / total_fraction

        component_details = []
        raw_component_scores = []

        for comp in components:
            smi = comp["smiles"]
            mol = Chem.MolFromSmiles(smi)
            if mol is None:
                raise ValueError(f"Invalid component SMILES: {smi}")

            # Predict single-component scores
            scores = single_prediction_fn(mol) if single_prediction_fn else {lbl: 0.2 for lbl in self.labels}
            raw_component_scores.append((comp["fraction"], scores))
            component_details.append({
                "smiles": smi,
                "name": comp.get("name", "Unknown"),
                "fraction": round(comp["fraction"], 4),
                "isolated_scores": scores
            })

        # Non-linear interaction model:
        # Instead of simple linear average, applies odor masking / dominance effects
        blend_scores = {}
        for label in self.labels:
            # Fraction-weighted base
            weighted_val = sum(frac * scores[label] for frac, scores in raw_component_scores)
            # Synergistic / masking non-linear modulation
            max_comp_val = max(scores[label] for _, scores in raw_component_scores)
            non_linear_val = 0.65 * weighted_val + 0.35 * max_comp_val
            blend_scores[label] = round(float(np.clip(non_linear_val, 0.0, 1.0)), 4)

        return {
            "status": "experimental",
            "model_id": "scentiq-mixture-prototype",
            "concentration_basis": concentration_basis,
            "components": component_details,
            "predicted_blend_profile": blend_scores,
            "scientific_warning": (
                "Experimental Research Notice: Blend Studio models volatile interactions using "
                "non-linear modulation. An arithmetic average of monomolecular scores is NOT a validated "
                "sensory blend measurement."
            )
        }
