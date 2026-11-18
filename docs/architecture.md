# ScentIQ System Architecture & Research Design

**Computational Olfaction, Molecular Odor Intelligence, and Research Platform**  
**Version:** 1.0 | 18 November 2026

## 1. System Overview

ScentIQ is a software-only computational olfaction platform designed to model structure-to-odor relationships from published scientific datasets (OdorNet, OpenPOM, Pyrfume).

The platform enforces strict scientific boundaries:
- Predictions are statistical and computational, not physical sensory measurements.
- Monomolecular odor descriptor models are strictly segregated from multi-component mixture models.
- Missing labels in OdorNet are evaluated using masked loss functions (Drop policy) rather than false negative coercion.
- Feature attribution reflects mathematical gradient sensitivity, not proven biological receptor mechanisms.

```
+-----------------------------------------------------------------------+
|                             USER INTERFACE                            |
|  React 18 + TypeScript + Vite + Tailwind CSS (10 Research Workspaces) |
|  Overview | Molecular Lab | AI Prediction | Explainability | Blend    |
|  Similarity | Odor Explorer | Compare Lab | Research Console | Reports|
+------------------------------------+----------------------------------+
                                     |
                                     | RESTful JSON / OpenAPI Contracts
                                     v
+------------------------------------+----------------------------------+
|                            FASTAPI SERVICE                            |
|             apps/api/scentiq_api (Python 3.10+ / 3.11+)               |
|  - Molecules Router (Resolve / Validate / Depict)                     |
|  - Predictions Router (Single-molecule multi-label & Mixture Blend)   |
|  - Similarity Router (Chemical Tanimoto / GNN Latent / Odor Cosine)   |
|  - Compare Router (Aligned 2-4 molecule side-by-side analysis)        |
|  - Odor Map Router (2D/3D PCA landscape projection)                   |
|  - Datasets & Models Metadata                                         |
+------------------------------------+----------------------------------+
                                     |
            +------------------------+------------------------+
            v                                                 v
+-----------+-----------+                         +-----------+-----------+
|   CHEMISTRY ENGINE    |                         |      ML RUNTIME       |
|  - RDKit Sanitize     |                         |  - MPNN Graph Neural  |
|  - Stereocenter Audit |                         |    Network (GNN)      |
|  - Morgan Fingerprints|                         |  - Baseline Tabular RF|
|  - 2D SVG Depiction   |                         |  - Probability Calib. |
|  - 3D Conformer Model |                         |  - OOD Detector       |
|  - Descriptors Grid   |                         |  - Atom Saliency XAI  |
+-----------------------+                         +-----------------------+
```

## 2. Scientific Data Flow

1. **Chemical Input & Ingestion**:
   User supplies compound name (e.g. `Vanillin`, `Limonene`) or SMILES.
   PubChem PUG REST resolves names to CIDs with local in-memory caching and offline catalog fallback.
2. **Standardization & Stereochemistry**:
   RDKit parses, strips disconnected salt fragments, canonicalizes SMILES, and audits chiral centers. Unassigned centers trigger explicit enantiomer divergence warnings.
3. **Representation & Inference**:
   Molecules are featurized into atom/bond graph tensors (node dim 29, edge dim 9) for the 3-layer Molecular GNN or concatenated with 10 physicochemical descriptors for the Random Forest baseline.
4. **Uncertainty & Calibration**:
   Raw sigmoid outputs are passed through validation-derived logistic Platt scaling (ECE 0.048). The molecule's Morgan fingerprint is benchmarked against training manifold centroids to compute maximum Tanimoto similarity; molecules with similarity < 0.28 are flagged Out-Of-Distribution (OOD).
5. **Feature Attribution (XAI)**:
   Integrated Gradients backpropagate loss with respect to chosen target odor category logits to generate normalized atom-level salience scores and highlighted 2D SVGs.
