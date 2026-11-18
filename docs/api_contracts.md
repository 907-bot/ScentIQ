# ScentIQ API Contracts & Specification

**Base URL:** `http://127.0.0.1:8000/api/v1`  
**OpenAPI Docs:** `http://127.0.0.1:8000/docs`

## Endpoints

### 1. Health & Status
- **Method:** `GET /health`
- **Response:**
```json
{
  "status": "healthy",
  "service": "ScentIQ Olfaction Intelligence API",
  "version": "0.1.0",
  "models_status": {
    "baseline_rf": "ready",
    "odornet_gnn": "ready",
    "openpom_adapter": "experimental",
    "mixture_prototype": "experimental"
  }
}
```

### 2. Molecule Resolution
- **Method:** `POST /molecules/resolve`
- **Request:**
```json
{
  "query": "Vanillin",
  "input_type": "name"
}
```
- **Response:**
```json
{
  "molecule_id": "mol_a1b2c3d4e5f6",
  "name": "Vanillin",
  "pubchem_cid": 1183,
  "canonical_smiles": "COc1cc(C=O)ccc1O",
  "formula": "C8H8O3",
  "molecular_weight": 152.149,
  "validation_status": "valid",
  "has_stereochemistry": false,
  "descriptors": {
    "molecular_weight": 152.149,
    "logp": 1.18,
    "tpsa": 46.53,
    "hbd": 1,
    "hba": 3
  },
  "svg_2d": "<svg ...></svg>",
  "coordinates_3d": { "atoms": [...], "bonds": [...] }
}
```

### 3. Single-Molecule Prediction
- **Method:** `POST /predictions/single`
- **Request:**
```json
{
  "smiles": "COC1=C(O)C=CC(C=O)=C1",
  "model_id": "scentiq-odornet-gnn",
  "top_k": 8,
  "include_explanation": true
}
```
- **Response:**
```json
{
  "prediction_id": "pred_9f8e7d6c5b4a",
  "molecule_id": "mol_...",
  "task": "single_molecule_odor_multilabel",
  "model": { "id": "scentiq-odornet-gnn", "version": "0.1.0" },
  "predictions": [
    { "label": "sweet", "score": 0.8653, "calibrated_probability": 0.856 },
    { "label": "fruity", "score": 0.4605, "calibrated_probability": 0.442 }
  ],
  "dominant_category": "sweet",
  "uncertainty": {
    "status": "in_distribution",
    "ood_flag": false,
    "max_training_tanimoto": 1.0,
    "message": "Molecule resides within the well-sampled chemical space..."
  },
  "explanation": {
    "status": "available",
    "target_label": "sweet",
    "method": "Integrated Gradients / Graph Saliency",
    "atom_attributions": [...]
  }
}
```

### 4. Similarity Search
- **Method:** `POST /similarity/search`
- **Request:**
```json
{
  "smiles": "CCO",
  "method": "chemical_fingerprint",
  "top_k": 4
}
```
Method choices: `"chemical_fingerprint"` | `"learned_embedding"` | `"predicted_odor_profile"`.

### 5. Multi-Molecule Comparison
- **Method:** `POST /compare`
- **Request:**
```json
{
  "smiles_list": ["CCO", "COC1=C(O)C=CC(C=O)=C1"]
}
```

### 6. Blend Studio Mixture Prediction
- **Method:** `POST /predictions/blend`
- **Request:**
```json
{
  "components": [
    { "smiles": "COC1=C(O)C=CC(C=O)=C1", "fraction": 0.6, "name": "Vanillin" },
    { "smiles": "COC1=C(O)C=CC(CC=C)=C1", "fraction": 0.4, "name": "Eugenol" }
  ],
  "concentration_basis": "mole_fraction"
}
```
