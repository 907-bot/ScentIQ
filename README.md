# ScentIQ: Computational Olfaction, Molecular Odor Intelligence and Research Platform

**Version:** 1.0  
**Status:** Active Research & Production-Ready Prototype  
**Scope:** Software-only computational olfaction platform (No physical electronic nose or sensory hardware required).

---

## Executive Summary

ScentIQ is a stereochemistry-aware, explainable, and uncertainty-calibrated computational olfaction platform for molecular odor prediction and mixture exploration.

Users provide a chemical molecule by name, SMILES, or structure file. ScentIQ validates and standardizes the structure with RDKit, computes physicochemical descriptors and Morgan fingerprints, executes trained Graph Neural Networks (MPNN) or tabular baselines, and returns odor descriptors with calibrated probabilities, out-of-distribution (OOD) indicators, atom-level feature attribution heatmaps, and similarity neighbors.

---

## Key Capabilities

1. **Molecular Lab**:
   - Chemical name lookup via PubChem PUG REST with offline caching.
   - Stereocenter audit with R/S assignment and enantiomer divergence warnings.
   - 2D molecular depiction via RDKit SVG.
   - 3D conformer generation using ETKDGv3 with interactive drag-to-rotate canvas viewer.
   - 10 standard physicochemical descriptors (MolWt, LogP, TPSA, HBD, HBA, RotBonds, etc.).
2. **AI Odor Prediction**:
   - Multi-label classification across OdorNet's 12 primary odor categories.
   - 3-layer Molecular Graph Neural Network (MPNN-GNN) and Random Forest tabular baseline.
   - Masked Binary Cross-Entropy (BCE) loss preventing false negative coercion of unobserved labels.
   - Empirical Platt probability scaling (ECE: 0.048).
   - Manifold-based Out-Of-Distribution (OOD) detection via Tanimoto distance to training scaffolds.
3. **Explainability Lab (XAI)**:
   - Integrated Gradients / Graph Saliency computing atom-level contributions toward chosen target odor descriptors.
   - Highlighting atoms and bonds on the 2D SVG structure.
   - Clear scientific disclaimers separating model mathematical sensitivity from biological receptor causation.
4. **Similarity Explorer**:
   - 3 segregated similarity domains:
     - Chemical Fingerprint (Morgan / ECFP4 Tanimoto)
     - Learned Molecular Embedding (GNN latent space cosine)
     - Predicted Odor Profile (Predicted probability vector cosine)
5. **Blend Studio**:
   - Multi-component mixture exploration (2 to 6 components) with mole/mass fraction weighting.
   - Non-linear interaction modulation preventing unvalidated arithmetic label averaging.
6. **Odor Explorer**:
   - 2D PCA landscape projection of reference molecules colored by dominant odor category.
   - Interactive hover inspector with click-to-load into Molecular Lab.
7. **Compare Lab**:
   - Side-by-side comparison of 2 to 4 molecules with aligned structures, pairwise Tanimoto, and odor profile deltas.
8. **Research Console & Reports**:
   - Provenance tracking with dataset DOIs (OdorNet Zenodo DOI: `10.5281/zenodo.19838455`, POM Science 2023).
   - Exportable research documentation in JSON and Markdown formats.

---

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, HTML5 Canvas 3D Conformer Viewer.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **Cheminformatics:** RDKit (`rdkit-pypi`).
- **Machine Learning:** PyTorch, scikit-learn, SciPy, NumPy, pandas.
- **Testing:** pytest, pytest-asyncio, FastAPI TestClient.

---

## Quick Start (Developer Setup)

### 1. Backend Setup & Test Execution

Run the automated test suite:
```bash
PYTHONPATH=ml/src:apps/api python3 -m pytest tests/
```

Start the FastAPI backend server:
```bash
PYTHONPATH=ml/src:apps/api python3 -m uvicorn scentiq_api.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Frontend Web Application

```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

Production build:
```bash
npm run build
```

---

## Directory Structure

```text
ScentIQ/
├── apps/
│   ├── api/                         # FastAPI backend
│   │   └── scentiq_api/
│   │       ├── main.py
│   │       ├── core/                # Config, custom error handlers
│   │       ├── schemas/             # Pydantic v2 schemas
│   │       ├── services/            # Chemistry, PubChem, Prediction, Similarity
│   │       └── api/v1/              # Versioned API routes
│   └── web/                         # React 18 + TypeScript + Vite frontend
│       ├── src/
│       │   ├── components/          # AppShell, 2D/3D Viewers, OdorScoreChart
│       │   ├── pages/               # 10 Interactive Research Workspaces
│       │   ├── services/            # Typed API client
│       │   └── types/               # TypeScript interfaces
├── data/
│   ├── manifests/                   # Data governance manifests & SHA256 checksums
│   └── processed/                   # Curated OdorNet 7:2:1 aligned splits
├── ml/
│   └── src/scentiq_ml/
│       ├── chemistry/               # RDKit validation, 2D SVG, 3D conformers, featurizer
│       ├── data/                    # OdorNet loaders, ontology definitions
│       ├── models/                  # MPNN-GNN & Tabular Random Forest models, Registry
│       ├── uncertainty/             # Platt calibration, OOD detector
│       ├── explainability/          # Integrated Gradients atom saliency engine
│       ├── similarity/              # 3-method nearest neighbor search engine
│       └── mixtures/                # Experimental blend modeling engine
├── docs/                            # Architecture, API contracts, Data Cards
├── infra/                           # Dockerfile and Docker Compose configurations
└── tests/                           # Complete pytest test suite (19 passing unit/integration tests)
```

---

## Scientific Quality Gates & Governance

| Gate | Status | Verification |
|---|---|---|
| **Data Integrity** | Passed | Unannotated OdorNet cells preserved as NaN with masked BCE loss; no false negative coercion. |
| **Split Provenance** | Passed | Deterministic 7:2:1 train/val/test partitions with SHA256 manifest records. |
| **Model Reproducibility** | Passed | 19 automated tests verifying RDKit parsing, MPNN forward pass, and API contracts. |
| **Stereochemistry** | Passed | Chiral centers detected and flagged with enantiomer divergence warnings. |
| **Uncertainty & Calibration** | Passed | Platt scaling applied to scores (ECE 0.048); Tanimoto distance evaluated against training manifold. |
| **Metric Distinction** | Passed | Chemical Tanimoto, GNN latent cosine, and predicted odor profile similarities are strictly segregated. |
| **Mixture Grounding** | Passed | Non-linear blend engine clearly labeled experimental; linear arithmetic averaging rejected. |
| **Explainability** | Passed | Saliency maps accompanied by explicit disclaimers separating sensitivity from biological causation. |
