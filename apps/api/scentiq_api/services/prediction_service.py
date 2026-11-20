"""Prediction service coordinating model inference, calibration, uncertainty, and explainability."""

import datetime
import uuid
from typing import Dict, Any, List, Optional
import pandas as pd
from rdkit import Chem

from scentiq_ml.models import ModelRegistry
from scentiq_ml.uncertainty import ProbabilityCalibrator, OODDetector
from scentiq_ml.explainability import AtomAttributionEngine
from scentiq_ml.mixtures import MixtureEngine
from scentiq_ml.data.ontology import ODORNET_CATEGORY_METADATA
from scentiq_api.schemas.predictions import (
    SinglePredictionRequest,
    SinglePredictionResponse,
    BlendPredictionRequest,
    BlendPredictionResponse,
    OdorScore,
    ModelLineage,
    DatasetLineage,
    UncertaintyInfo,
    ExplanationInfo
)
from scentiq_api.core.errors import ScentIQException
from scentiq_api.core.cache import BoundedLRUDict


class PredictionService:
    """Manages prediction pipeline, calibration, and explainability."""
    _shared_store = BoundedLRUDict[str, SinglePredictionResponse](maxsize=2000)

    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.calibrator = ProbabilityCalibrator()
        self.mixture_engine = MixtureEngine()

        # Initialize OOD detector with training SMILES
        train_csv = registry.data_dir / "dataset_train_aligned.csv"
        if train_csv.exists():
            df = pd.read_csv(train_csv)
            self.ood_detector = OODDetector(df["SMILES"].tolist())
        else:
            self.ood_detector = OODDetector()

        # Shared cached predictions
        self.prediction_store = PredictionService._shared_store

    def predict_single(self, request: SinglePredictionRequest, mol: Chem.Mol, canonical_smiles: str, mol_id: str) -> SinglePredictionResponse:
        model_info = self.registry.get_model_info(request.model_id)
        if not model_info:
            raise ScentIQException(
                code="MODEL_NOT_FOUND",
                message=f"Requested model '{request.model_id}' is not registered."
            )

        model = self.registry.get_model(request.model_id)
        if not model:
            raise ScentIQException(
                code="MODEL_NOT_READY",
                message=f"Model '{request.model_id}' is currently unavailable or still training."
            )

        # 1. Run model prediction
        if request.model_id == "scentiq-odornet-gnn":
            raw_scores, _ = model.predict_scores(mol)
        else:
            raw_scores = model.predict_scores(mol)

        # 2. Uncertainty & OOD detection
        ood_res = self.ood_detector.evaluate(mol)

        # 3. Assemble OdorScores with calibrated probabilities
        scores_list: List[OdorScore] = []
        for label, score in raw_scores.items():
            cal_prob = self.calibrator.calibrate_score(score)
            meta = ODORNET_CATEGORY_METADATA.get(label, {})
            scores_list.append(OdorScore(
                label=label,
                score=round(score, 4),
                calibrated_probability=cal_prob,
                category_archetype=meta.get("archetype"),
                color=meta.get("color")
            ))

        # Sort descending by score
        scores_list.sort(key=lambda s: s.score, reverse=True)
        dominant_cat = scores_list[0].label if scores_list else "unassigned"

        # Limit to top_k requested
        reported_scores = scores_list[:request.top_k]

        # 4. Explainability
        explanation_info = None
        if request.include_explanation:
            target_label = request.explanation_target_label or dominant_cat
            explainer = AtomAttributionEngine(
                gnn_model=model if request.model_id == "scentiq-odornet-gnn" else None
            )
            exp_data = explainer.explain_molecule_label(mol, target_label)
            explanation_info = ExplanationInfo(
                status="available",
                target_label=target_label,
                method=exp_data["method"],
                atom_attributions=exp_data["atom_attributions"],
                highlighted_svg=exp_data["highlighted_svg"],
                disclaimer=exp_data["scientific_disclaimer"]
            )

        pred_id = f"pred_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        response = SinglePredictionResponse(
            prediction_id=pred_id,
            molecule_id=mol_id,
            canonical_smiles=canonical_smiles,
            task=model_info.task,
            model=ModelLineage(
                id=model_info.id,
                name=model_info.name,
                version=model_info.version,
                task=model_info.task
            ),
            dataset=DatasetLineage(
                name=model_info.dataset_name,
                version=model_info.dataset_version,
                doi="10.5281/zenodo.19838455"
            ),
            predictions=reported_scores,
            dominant_category=dominant_cat,
            uncertainty=UncertaintyInfo(
                status=ood_res.status,
                ood_flag=ood_res.is_ood,
                max_training_tanimoto=ood_res.max_training_tanimoto,
                message=ood_res.message
            ),
            explanation=explanation_info,
            limitations=model_info.limitations,
            created_at=now_iso
        )

        self.prediction_store[pred_id] = response
        return response

    def predict_blend(self, request: BlendPredictionRequest) -> BlendPredictionResponse:
        gnn_model = self.registry.get_model("scentiq-odornet-gnn")

        def single_pred_fn(m: Chem.Mol) -> Dict[str, float]:
            if gnn_model:
                scores, _ = gnn_model.predict_scores(m)
                return scores
            return {lbl: 0.2 for lbl in ODORNET_CATEGORY_METADATA.keys()}

        try:
            blend_res = self.mixture_engine.predict_blend(
                components=[c.model_dump() for c in request.components],
                concentration_basis=request.concentration_basis,
                single_prediction_fn=single_pred_fn
            )
        except ValueError as e:
            raise ScentIQException(code="INVALID_MIXTURE", message=str(e), status_code=400)

        profile_scores: List[OdorScore] = []
        for label, val in blend_res["predicted_blend_profile"].items():
            meta = ODORNET_CATEGORY_METADATA.get(label, {})
            profile_scores.append(OdorScore(
                label=label,
                score=round(val, 4),
                calibrated_probability=round(val, 4),
                category_archetype=meta.get("archetype"),
                color=meta.get("color")
            ))

        profile_scores.sort(key=lambda s: s.score, reverse=True)
        dominant_cat = profile_scores[0].label if profile_scores else "unassigned"

        pred_id = f"blend_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        return BlendPredictionResponse(
            prediction_id=pred_id,
            status="experimental",
            model_id=request.model_id,
            concentration_basis=request.concentration_basis,
            components=blend_res["components"],
            predicted_blend_profile=profile_scores,
            dominant_category=dominant_cat,
            scientific_warning=blend_res["scientific_warning"],
            created_at=now_iso
        )

    def get_prediction_by_id(self, pred_id: str) -> Optional[SinglePredictionResponse]:
        return self.prediction_store.get(pred_id)
