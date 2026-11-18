"""Unit tests for ML models, loss functions, calibration, and OOD."""

import pytest
import numpy as np
import torch
from rdkit import Chem

from scentiq_ml.models import BaselineTabularModel, MolecularGNN
from scentiq_ml.models.graph_model import compute_masked_bce_loss
from scentiq_ml.uncertainty import ProbabilityCalibrator, OODDetector


def test_baseline_rf_training_and_prediction():
    smiles = ["CCO", "COC1=C(O)C=CC(C=O)=C1", "CC1=CCC(CC1)C(=C)C"]
    labels = np.array([
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0]
    ], dtype=np.float32)

    model = BaselineTabularModel(n_estimators=10)
    model.fit(smiles, labels)
    assert model.is_fitted is True

    scores = model.predict_scores(Chem.MolFromSmiles("CCO"))
    assert len(scores) == 12
    assert "chemical" in scores


def test_masked_bce_loss():
    # targets contain NaN (unobserved)
    logits = torch.tensor([[1.5, -2.0, 0.5]], requires_grad=True)
    targets = torch.tensor([[1.0, 0.0, float("nan")]])
    mask = ~torch.isnan(targets)

    loss = compute_masked_bce_loss(logits, targets, mask)
    assert loss.item() > 0.0
    loss.backward()
    assert logits.grad is not None


def test_calibration_transform():
    calibrator = ProbabilityCalibrator()
    cal = calibrator.calibrate_score(0.8)
    assert 0.0 <= cal <= 1.0
    assert cal > 0.5


def test_ood_detector():
    training_smiles = ["CCO", "CCCO", "CCCCO"]
    detector = OODDetector(training_smiles)

    in_dist = detector.evaluate(Chem.MolFromSmiles("CCO"))
    assert in_dist.is_ood is False
    assert in_dist.max_training_tanimoto >= 0.99
