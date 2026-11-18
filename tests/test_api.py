"""Integration tests for FastAPI endpoints."""

import sys
sys.path.append("apps/api")
sys.path.append("ml/src")

import pytest
from fastapi.testclient import TestClient
from scentiq_api.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "models_status" in data


def test_resolve_molecule():
    res = client.post("/api/v1/molecules/resolve", json={"query": "vanillin", "input_type": "name"})
    assert res.status_code == 200
    data = res.json()
    assert data["formula"] == "C8H8O3"
    assert data["canonical_smiles"] == "COc1cc(C=O)ccc1O" or "COC1=C(O)C=CC(C=O)=C1" in data["canonical_smiles"].upper()


def test_predict_single_molecule():
    res = client.post("/api/v1/predictions/single", json={
        "smiles": "COC1=C(O)C=CC(C=O)=C1",
        "model_id": "scentiq-odornet-gnn",
        "top_k": 8,
        "include_explanation": True
    })
    assert res.status_code == 200
    data = res.json()
    assert "prediction_id" in data
    assert len(data["predictions"]) == 8
    assert data["dominant_category"] is not None
    assert data["uncertainty"]["status"] is not None
    assert data["explanation"] is not None


def test_similarity_search():
    res = client.post("/api/v1/similarity/search", json={
        "smiles": "CCO",
        "method": "chemical_fingerprint",
        "top_k": 4
    })
    assert res.status_code == 200
    data = res.json()
    assert data["method"] == "chemical_fingerprint"
    assert len(data["neighbors"]) > 0


def test_compare_molecules():
    res = client.post("/api/v1/compare", json={
        "smiles_list": ["CCO", "COC1=C(O)C=CC(C=O)=C1"]
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["molecules"]) == 2
    assert len(data["pairwise_chemical_tanimoto"]) == 1


def test_datasets_list():
    res = client.get("/api/v1/datasets")
    assert res.status_code == 200
    data = res.json()
    assert len(data["datasets"]) >= 4


def test_models_list():
    res = client.get("/api/v1/models")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3


def test_odor_map():
    res = client.get("/api/v1/odor-map?dimension=2")
    assert res.status_code == 200
    data = res.json()
    assert data["dimension"] == 2
    assert len(data["points"]) > 0
