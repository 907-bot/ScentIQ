"""Unit tests for chemistry featurization, validation, and conformer generation."""

import pytest
from rdkit import Chem
from scentiq_ml.chemistry import (
    validate_and_standardize_smiles,
    compute_physicochemical_descriptors,
    compute_morgan_fingerprint,
    mol_to_svg,
    generate_3d_coordinates
)


def test_valid_smiles_vanillin():
    smiles = "COC1=C(O)C=CC(C=O)=C1"  # Vanillin
    res = validate_and_standardize_smiles(smiles)
    assert res.is_valid is True
    assert res.formula == "C8H8O3"
    assert res.canonical_smiles is not None
    assert res.molecular_weight > 150.0
    assert res.inchikey is not None


def test_invalid_smiles():
    res = validate_and_standardize_smiles("INVALID_SMILES_STRING_123")
    assert res.is_valid is False
    assert res.error_message is not None


def test_stereocenter_detection():
    # (R)-Limonene
    smiles = "C[C@@H]1CC=C(C)CC1"
    res = validate_and_standardize_smiles(smiles)
    assert res.is_valid is True
    assert res.has_stereochemistry is True
    assert len(res.chiral_centers) > 0


def test_physicochemical_descriptors():
    mol = Chem.MolFromSmiles("CCO")
    desc = compute_physicochemical_descriptors(mol)
    assert desc["molecular_weight"] == pytest.approx(46.069, rel=1e-2)
    assert desc["heavy_atom_count"] == 3
    assert desc["hbd"] == 1
    assert desc["hba"] == 1


def test_morgan_fingerprint():
    mol = Chem.MolFromSmiles("CCO")
    fp = compute_morgan_fingerprint(mol, radius=2, n_bits=2048, as_numpy=True)
    assert len(fp) == 2048
    assert fp.sum() > 0


def test_svg_generation():
    mol = Chem.MolFromSmiles("COC1=C(O)C=CC(C=O)=C1")
    svg = mol_to_svg(mol, 300, 200)
    assert "<svg" in svg
    assert "</svg>" in svg


def test_conformer_3d_generation():
    mol = Chem.MolFromSmiles("CCO")
    coords = generate_3d_coordinates(mol)
    assert coords["status"] == "generated"
    assert len(coords["atoms"]) > 0
    assert len(coords["bonds"]) > 0
