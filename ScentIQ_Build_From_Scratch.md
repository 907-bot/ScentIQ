---
title: "ScentIQ: Complete Build-From-Scratch Project Guide"
subtitle: "Computational Olfaction, Molecular Odor Intelligence and Research Platform"
date: "18 November 2026"
---

# ScentIQ: Complete Build-From-Scratch Project Guide

**Project type:** Software-only AI & Data Science final-year project  
**Working title:** *ScentIQ: A Stereochemistry-Aware, Explainable and Uncertainty-Calibrated Computational Olfaction Platform for Molecular and Mixture Odor Prediction*  
**Primary output:** A web application that analyzes chemical structures and predicts odor descriptors from published datasets and trained machine-learning models.  
**Physical hardware:** None required.  
**Important scope statement:** ScentIQ is a computational model, not a physical electronic nose. It does not directly smell, measure or chemically verify a real sample.

> **How to use this guide:** Start with Sections 1-5 before coding. Sections 6-12 describe the backend, ML, APIs, front end and deployment. Section 13 is the quick-start guide for someone using the finished platform. Section 14 is the research and testing plan. Do not implement every advanced feature before the baseline pipeline works.

### Guide map

1. Project definition and scope  
2. Feature freeze and staged capabilities  
3. Public repositories and datasets  
4. End-to-end product workflow  
5. Technology stack  
6. GitHub strategy and repository structure  
7. Data ingestion and chemical processing  
8. Machine-learning design and research protocol  
9. Backend modules and API contracts  
10. Database schema  
11. Full frontend workspace and component specification  
12. Frontend-to-API integration  
13. End-user quick-start guide  
14. Developer quick-start setup  
15. Tests and scientific quality gates  
16. Deployment plan  
17. Development milestones  
18. Research contribution and evaluation  
19. Licensing and publication checklist  
20. References and build order

---

## Executive summary

ScentIQ is a research-oriented computational olfaction platform. A user provides a molecule as a chemical name, SMILES string or supported structure file. ScentIQ validates and standardizes the structure, derives molecular representations, runs one or more trained odor-prediction models, and returns predicted odor descriptors with model-calibrated scores, uncertainty indicators, molecular similarity results and model explanations.

The system has two distinct scientific tasks:

1. **Single-molecule odor prediction:** Predict the odor-label profile associated with one molecular structure.
2. **Mixture-related prediction:** Predict an odor profile for a documented multi-component mixture, or predict perceptual similarity between mixtures, only where an appropriate mixture dataset and task definition support it.

These tasks must remain separate in the data model and model registry. A single-molecule label dataset is not automatically a mixture dataset, and a pairwise mixture-distance task is not the same as predicting a 51-descriptor mixture profile.

### Problem statement

Odor perception is difficult to model because it depends on molecular structure, stereochemistry, concentration, mixtures, human variability, experimental context and the odor vocabulary used by each study. Public datasets capture only parts of this problem. ScentIQ will provide a reproducible software environment for learning structure-to-odor relationships, exploring molecular similarity and communicating uncertainty.

### Proposed objectives

- Build a robust molecular input, validation and standardization layer.
- Reproduce a public odor-prediction baseline such as OpenPOM.
- Train and evaluate at least one independently implemented baseline on a documented dataset.
- Compare molecular fingerprints and graph-based representations.
- Add explainability and calibrated uncertainty rather than displaying unsupported certainty.
- Explore mixture prediction using mixture-specific data as a separate research track.
- Build a responsive web application with an interactive chemical workspace and exportable reports.
- Publish dataset cards, model cards, evaluation protocols and reproducible experiment records.

### What the platform can and cannot claim

| ScentIQ can do | ScentIQ must not claim |
|---|---|
| Predict odor descriptors learned from labeled molecular datasets. | Directly smell, sense or measure a physical sample. |
| Compare chemical fingerprints and predicted odor profiles. | Prove that a human will perceive a prediction in the same way. |
| Flag low-confidence or out-of-distribution molecules. | Guarantee that a model score is a real-world smell intensity. |
| Show molecular features that influenced a model output. | Treat feature attribution as proof of a biological mechanism. |
| Explore mixture datasets with task-specific models. | Assume that averaging individual molecule scores predicts mixture perception. |
| Generate reproducible research reports. | Replace laboratory sensory evaluation or safety assessment. |

---

## Recommended scope and feature freeze

Build the project in three levels.

### Level 1 - required product features

1. Molecule name / SMILES input and validation.
2. Chemical structure standardization and molecular properties.
3. Single-molecule multi-label odor prediction.
4. Model comparison and per-label evaluation.
5. Molecular similarity search.
6. Prediction explanations.
7. Calibrated uncertainty and out-of-distribution warnings.
8. Model and dataset provenance.
9. Interactive molecular and odor-space visualization.
10. Report export.

### Level 2 - research differentiators

1. Stereochemistry-aware evaluation and enantiomer comparison.
2. A graph neural network (GNN) compared with fingerprint-based models.
3. Pharmacophore and 3D descriptors as controlled feature ablations.
4. A mixture-modeling track using public mixture-specific data.
5. Concentration-aware prediction only where concentration metadata exists.
6. Cross-dataset generalization and label-harmonization experiments.

### Level 3 - optional extensions

- Olfactory receptor evidence explorer.
- Persistent-homology or other topological molecular descriptors.
- Human-perception variability modeling.
- Research copilot grounded in project datasets and verified literature.
- Molecule-generation or inverse-design research (out of initial final-year scope; requires separate safety, validity and scientific review).

**Recommended freeze:** Complete all Level 1 features, choose two or three Level 2 experiments, and leave Level 3 as future work. Do not build an LLM copilot before the scientific pipeline is validated.

---

## Public repositories and datasets

The sources below were checked on **18 November 2026**. Repository contents and terms may change; re-check the current README, release notes and license before each dataset download, model integration or public redistribution.

### Primary dataset: OdorNet

- Repository: <https://github.com/NKU-DOIE/OdorNet>
- Zenodo concept record: <https://zenodo.org/records/19838455>
- Concept DOI: `10.5281/zenodo.19838455`
- Role: Main standardized multi-label molecular odor dataset for the first ScentIQ training baseline.

The repository describes a processed release containing **8,892 molecules**, represented by `SMILES` plus **12 primary odor-category labels**. It includes a fixed connectivity/stereochemistry-safe split:

| File | Rows | Role |
|---|---:|---|
| `dataset_train_aligned.csv` | 6,224 | Train |
| `dataset_val_aligned.csv` | 1,778 | Validation |
| `dataset_test_aligned.csv` | 890 | Final held-out test |
| `full_dataset.csv` | 8,892 | Full aligned table |

Important data handling rules from the repository's data dictionary:

- `1` means the category is supported by the resolved annotation.
- `0` means the category is explicitly absent after resolution.
- Blank / `NA` means unresolved. It is **not** a negative label.
- A row containing twelve zeros must not automatically be interpreted as chemically odorless.
- The training table preserves unresolved label cells; validation and test contain explicit values.
- The repository documents three possible missing-label policies: Drop, Union and Intersection. Use **Drop / masked loss as the evidence-preserving primary analysis**. Treat Union and Intersection only as sensitivity analyses and clearly state their assumptions.
- The repository reports separate licenses: code, examples and documentation under MIT; processed dataset files and source-rich archive under CC BY 4.0. Preserve attribution and inspect the exact license files.

Suggested first download:

```bash
mkdir -p data/external
cd data/external
git clone https://github.com/NKU-DOIE/OdorNet.git
```

Start with the processed GitHub tables. Download the Zenodo source-rich archive only if you need source-level provenance or wish to reproduce the dataset curation. Verify archive checksums using the repository's current release instructions.

### Baseline model: OpenPOM

- Main repository: <https://github.com/BioMachineLearning/openpom>
- Original author's repository: <https://github.com/ARY2260/openpom>
- Role: Reproducible reference implementation and baseline, not the whole ScentIQ application.

OpenPOM is a replication of the Principal Odor Map work and integrates with DeepChem. Its README reports an MPNN-POM benchmark ROC-AUC of **0.8872** on a curated 4,983-molecule dataset using five-fold cross-validation with an ensemble of ten models per fold. This is the repository's reported result, not a guarantee for ScentIQ and not directly comparable with a score on OdorNet unless the task, labels, split and metric are harmonized.

The OpenPOM code repository declares an MIT license. Preserve its copyright and license notice in any fork or redistributed substantial portions. Review licenses for any associated dataset, weights or model files separately; a code license does not automatically license every scientific dataset or third-party artifact.

**Recommended integration strategy:** Fork OpenPOM for traceability, reproduce it in an isolated environment, and call it through a ScentIQ adapter. Keep the ScentIQ product repository separate. Do not rename or overwrite the upstream project and do not copy its source code into the main application unless needed.

#### Fork and track upstream

Install Git and GitHub CLI, then authenticate:

```bash
gh auth login
```

Fork and clone:

```bash
gh repo fork BioMachineLearning/openpom --clone
cd openpom
```

Check remotes. If the `upstream` remote is not already present, add it:

```bash
git remote -v
git remote add upstream https://github.com/BioMachineLearning/openpom.git
```

Create a named branch for ScentIQ integration work:

```bash
git checkout -b scentiq/baseline-adapter
```

When syncing later:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

Resolve conflicts carefully, run upstream tests, then merge the updated fork into your integration branch. Do not directly edit the upstream `main` branch.

#### OpenPOM environment caution

The current OpenPOM README specifies Python 3.10 and shows a PyTorch 2.4.0 / CUDA 12.4 / DGL installation for the Linux NVIDIA setup. **Do not paste those CUDA commands into macOS or CPU-only terminals.** Use a separate Python 3.10 environment and follow the current platform-specific PyTorch/DGL instructions. The upstream README notes that CPU inference may require setting the model's `device_name` to CPU. First prove a single prediction works in isolation before integrating it with FastAPI.

### Pyrfume public data archive

- Data: <https://github.com/pyrfume/pyrfume-data>
- Python library: <https://github.com/pyrfume/pyrfume>
- Project website: <https://pyrfume.org/>
- Scientific data descriptor: <https://doi.org/10.1038/s41597-024-04051-z>

Pyrfume curates olfactory psychophysics and biology data. Its examples include molecule, mixture and behavior tables, for example `bushdid_2014/molecules.csv`, `bushdid_2014/mixtures.csv` and `bushdid_2014/behavior.csv`.

Install and inspect:

```bash
pip install pyrfume
```

```python
import pyrfume
molecules = pyrfume.load_data("bushdid_2014/molecules.csv")
mixtures = pyrfume.load_data("bushdid_2014/mixtures.csv")
behavior = pyrfume.load_data("bushdid_2014/behavior.csv")
```

**Licensing caution:** Pyrfume states that licensing information is available for individual datasets, and the Pyrfume paper describes the archive as intended for non-commercial use except where individual licenses permit commercial use. Do not assume that every dataset has the same license. Check the dataset-specific license and cite original sources.

### Mixture profile data: 2025 DREAM challenge model repository

- Repository: <https://github.com/Satarifard/Olfactory-Mixtures-Prediction-2025>
- Challenge project: <https://www.synapse.org/Synapse:syn64743570>
- Role: Research reference for concentration-dependent odor profiles and multi-component mixture profile prediction.

The public repository README describes:

- Task 1: 151 monomolecular odorants with 51-term RATA profiles at two concentration levels.
- Task 2: more than 650 mixtures, with 2, 3, 5 or 10 components drawn from a pool of more than 145 odorants; the task predicts 51-term odor profiles.
- A CatBoost-based concentration-profile translation task and a graph model for mixture profiles.

This is a **different target** from OdorNet's 12-category single-molecule labels. Keep it as a separately versioned mixture/concentration dataset and model. Review the current repository and Synapse terms before using challenge files in a public release. The GitHub page does not by itself establish that all data can be redistributed without restrictions.

### DREAM mixture-pair perceptual similarity dataset

- Repository: <https://github.com/Satarifard/DREAM-olfactory-mixtures-prediction-challenge>
- Role: Predict perceptual similarity / distance between pairs of mixtures.

The repository describes a training set of 507 mixture pairs from three psychophysical studies, a hidden test set of 46 pairs and a later 50-pair validation dataset. This is a pairwise mixture-distance task, **not** the same as predicting a full odor profile for a mixture. Keep a separate task definition and evaluation pipeline. Check challenge/Synapse terms and license before redistribution.

### PubChem for molecule lookup

- PUG REST documentation: <https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest>
- PUG REST tutorial: <https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial>

Use PubChem for compound identifiers and available molecular properties when a user enters a chemical name. A documented property request format is:

```text
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/ethanol/property/MolecularFormula,MolecularWeight,SMILES/JSON
```

PubChem is a chemical identity/property source; it is not an odor-label dataset. Use ScentIQ's own validated data and model for odor predictions. Preserve PubChem CID and source URL in molecule metadata. Add backend caching, timeouts, retries and respectful request handling. Do not make repeated uncontrolled calls from the browser.

### Recommended dataset order

| Priority | Source | Use first? | Main task |
|---|---|---|---|
| 1 | OdorNet | Yes | Standardized single-molecule multi-label odor prediction |
| 2 | OpenPOM | Yes, as a separate baseline | Reproduction / benchmark on its own data and label space |
| 3 | Pyrfume | After the baseline | External validation, human psychophysics, receptor or mixture sub-studies |
| 4 | 2025 mixture-profile repository | Experimental phase | 51-term mixture and concentration tasks |
| 5 | DREAM mixture-pair repository | Optional | Pairwise mixture perceptual-distance task |
| 6 | PubChem PUG REST | Runtime enrichment | Compound name / CID / molecular property lookup |

### Data governance checklist

For every dataset, keep a `DATA_CARD.md` with:

- Dataset name, version, URL, access date and DOI.
- Original publication and citation.
- License and redistribution conditions.
- Raw and processed file checksums.
- Number of rows, molecules, labels and missing values.
- Label ontology and mapping rules.
- Duplicate and stereochemistry handling.
- Train/validation/test split provenance.
- Known biases and unsupported interpretations.

Never silently merge labels from OdorNet, OpenPOM, Pyrfume and the mixture datasets. First map labels to a documented common ontology, retain original labels, and report where a mapping is ambiguous or impossible.

---

## Product workflow and user journey

### Single-molecule workflow

```text
User enters chemical name / SMILES / structure file
                |
                v
Input validation and source resolution
                |
                v
RDKit parsing and standardization
                |
                v
Molecular descriptors + fingerprints + graph features
                |
                v
Versioned prediction model
                |
       +--------+---------+
       |        |         |
       v        v         v
  Odor labels  XAI     Uncertainty / OOD
       |        |         |
       +--------+---------+
                |
                v
Similarity search + report assembly
                |
                v
React dashboard and export
```

### Mixture workflow (separate model family)

```text
User selects component molecules and dataset-supported amounts
                |
                v
Validate each component + units / ratios
                |
                v
Construct a set / disconnected-graph representation
                |
                v
Mixture model trained on mixture-specific targets
                |
                v
51-term profile or pairwise distance (task-specific)
                |
                v
Domain / concentration warnings + explanation
```

Do not use an arithmetic average of single-molecule outputs as a mixture prediction. If a simple weighted average is included as a baseline, label it explicitly as a baseline and compare it against a mixture-trained model.

---

## Recommended technology stack

| Layer | Recommended technology | Responsibility |
|---|---|---|
| Frontend | React + TypeScript + Vite | Main interactive web app |
| UI styling | Tailwind CSS or CSS modules | Layout, typography and responsive design |
| Charts | Plotly or Recharts | Odor-score charts, model metrics and comparisons |
| 2D chemistry | RDKit-generated SVG served by backend | Accurate 2D molecular depiction |
| 3D visualization | Three.js + React Three Fiber v9 + Drei | Molecular and embedding visualization |
| Backend | Python + FastAPI + Pydantic | Validation, orchestration and APIs |
| Cheminformatics | RDKit | Parsing, canonicalization, fingerprints, descriptors and conformers |
| ML baselines | scikit-learn, XGBoost / CatBoost as appropriate | Reproducible tabular models |
| GNN | PyTorch + PyTorch Geometric or a compatible graph stack | Graph-based molecular model |
| Existing baseline | OpenPOM in isolated environment | Reference reproduction |
| Database | PostgreSQL | Molecules, model versions, reports and experiment metadata |
| Vector search | pgvector (optional) | Learned embeddings; use RDKit for exact Morgan/Tanimoto similarity |
| Cache / queue | Redis (optional, later) | Repeated lookups and longer jobs |
| Experiment tracking | MLflow or structured local logs | Configs, metrics, model lineage |
| Local orchestration | Docker Compose | API + database + web app |
| Deployment | Static frontend + Dockerized API + managed PostgreSQL | Public demo and hosted service |

### Version compatibility strategy

- Use a Python 3.10 environment for the OpenPOM reproduction because its current README specifies Python 3.10. Keep a separate environment if the main ScentIQ stack needs a different version.
- Use a current supported Node LTS release. Current Vite documentation lists Node.js 20.19+ or 22.12+ as the baseline requirement; re-check before installation.
- React Three Fiber v9 pairs with React 19. Avoid the v10 alpha for the first stable deliverable unless you explicitly intend to experiment with it.
- Pin tested dependencies in lockfiles. Do not use floating `latest` versions in a reproducible submission.

---

## Repository strategy and project structure

### Keep the product repo separate from OpenPOM

Create a new repository named `scentiq`. OpenPOM remains an upstream research dependency / reproducibility baseline. This prevents ScentIQ's frontend, API, datasets and custom models from being tangled with upstream model code.

Suggested top-level structure:

```text
scentiq/
├── apps/
│   ├── web/                         # React + TypeScript frontend
│   └── api/                         # FastAPI application
├── packages/
│   └── contracts/                   # Shared API types / OpenAPI client
├── ml/
│   ├── configs/                     # Dataset and model configurations
│   ├── data/
│   │   ├── manifests/               # Source versions / checksums only
│   │   ├── raw/                     # Downloaded data; not committed by default
│   │   ├── interim/
│   │   └── processed/
│   ├── notebooks/                   # Exploration, not production logic
│   ├── src/scentiq_ml/
│   │   ├── data/                    # Loaders, schema and label policies
│   │   ├── chemistry/               # RDKit featurization
│   │   ├── models/                  # RF, XGBoost, MPNN/GNN
│   │   ├── training/                # Training loops and losses
│   │   ├── evaluation/              # Metrics, splits and audit
│   │   ├── explainability/          # SHAP / atom attribution
│   │   ├── uncertainty/             # Calibration and OOD
│   │   ├── similarity/              # Fingerprint and embedding search
│   │   └── mixtures/                # Separate mixture task/models
│   ├── artifacts/                   # Local ignored checkpoints
│   └── reports/                     # Evaluation outputs
├── third_party/
│   └── openpom/                     # Optional pinned fork submodule
├── infra/
│   ├── docker/
│   └── compose.yaml
├── docs/
│   ├── architecture.md
│   ├── data_cards/
│   ├── model_cards/
│   ├── api_contracts.md
│   ├── frontend_guide.md
│   └── research_protocol.md
├── tests/
│   ├── api/
│   ├── chemistry/
│   ├── data/
│   └── ml/
├── .env.example
├── .gitignore
├── pyproject.toml
├── README.md
└── LICENSE
```

### GitHub setup

Create a new empty repository in your GitHub account named `scentiq`, then:

```bash
mkdir scentiq && cd scentiq
git init
git branch -M main
```

Add the initial structure and commit it. If you want the OpenPOM fork inside the ScentIQ checkout as a pinned submodule, add your fork URL only after the fork exists:

```bash
git submodule add https://github.com/<your-github-username>/openpom.git third_party/openpom
git submodule update --init --recursive
```

If you prefer simpler development, keep the OpenPOM clone beside `scentiq/` and configure its path in `.env`; do not use a submodule until you are comfortable with submodule workflows.

### Git hygiene

- Do not commit `.env`, API credentials or private keys.
- Do not commit large downloaded datasets or model weights by default.
- Track source URLs, licenses, checksums and download scripts.
- Use Git LFS or release/object storage for large model artifacts where appropriate.
- Preserve third-party LICENSE and NOTICE files.
- Pin model and dataset versions in every experiment record.

---

## Data ingestion and chemistry pipeline

### Ingestion stages

1. Download or load a source dataset.
2. Create a source manifest (URL, version, DOI, license, access date and SHA-256).
3. Validate required columns and data types.
4. Preserve original SMILES and original labels.
5. Parse the molecule with RDKit.
6. Record invalid structures instead of silently dropping them.
7. Create canonical and isomeric SMILES, InChIKey where available, formula and selected descriptors.
8. Deduplicate according to a documented chemical identity policy.
9. Preserve stereochemical identity for model inputs and group-aware split validation.
10. Map source labels only through a versioned ontology map.
11. Persist cleaned records and a data quality report.

### Example OdorNet loader

```python
from pathlib import Path
import pandas as pd
from rdkit import Chem

ODORNET_DIR = Path("data/external/OdorNet/data/processed")
train_df = pd.read_csv(ODORNET_DIR / "dataset_train_aligned.csv")
val_df = pd.read_csv(ODORNET_DIR / "dataset_val_aligned.csv")
test_df = pd.read_csv(ODORNET_DIR / "dataset_test_aligned.csv")

label_columns = [c for c in train_df.columns if c != "SMILES"]

for split_name, frame in {
    "train": train_df,
    "validation": val_df,
    "test": test_df,
}.items():
    assert "SMILES" in frame.columns, f"{split_name}: missing SMILES"
    assert set(label_columns).issubset(frame.columns), f"{split_name}: label mismatch"
    invalid = frame["SMILES"].map(lambda s: Chem.MolFromSmiles(str(s)) is None)
    print(split_name, "rows=", len(frame), "invalid_smiles=", int(invalid.sum()))

# Keep unresolved cells as NaN; do not convert them to zero here.
y_train = train_df[label_columns].astype("float32")
observed_mask = y_train.notna()
```

### Missing-label policy

For OdorNet's training split, use a masked multi-label loss. Only observed label cells contribute to the loss and metrics. Compare alternate policies only in a clearly labeled sensitivity experiment.

Pseudo-code:

```python
# logits and targets have shape [batch_size, num_labels]
valid = targets.isfinite()
if valid.any():
    loss = binary_cross_entropy_with_logits(logits[valid], targets[valid])
else:
    # Skip this batch or use an explicitly tested fallback.
    loss = None
```

Do not convert blank cells to zero in the base dataset. That creates false negatives and changes the meaning of the source data.

### Molecular features

Start with features that are easy to audit:

- Isomeric / canonical SMILES.
- Morgan fingerprints (e.g. 2,048 bits; report radius and settings).
- Molecular weight, topological polar surface area, hydrogen-bond donors/acceptors, rotatable bonds and ring counts.
- Atom and bond graph features for a GNN.

Then add experimental feature groups:

- 3D conformer-derived geometric features.
- Pharmacophore features.
- Electrostatic descriptors.
- Persistent-homology/topological descriptors.

Each feature group needs an ablation study. Do not add complex descriptors simply to make the architecture appear advanced.

### PubChem name resolution example

Use a backend service to call PubChem; never put the remote request directly in the browser.

```python
from urllib.parse import quote
import httpx

PUBCHEM = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"

async def pubchem_lookup_by_name(name: str) -> dict | None:
    encoded_name = quote(name.strip(), safe="")
    url = (
        f"{PUBCHEM}/compound/name/{encoded_name}/"
        "property/MolecularFormula,MolecularWeight,SMILES/JSON"
    )
    timeout = httpx.Timeout(15.0, connect=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url, headers={"Accept": "application/json"})
    if response.status_code == 404:
        return None
    response.raise_for_status()
    payload = response.json()
    properties = payload.get("PropertyTable", {}).get("Properties", [])
    return properties[0] if properties else None
```

After retrieving SMILES, parse and standardize it with RDKit. Record the PubChem CID and the source URL. Handle ambiguous names, no results, rate limiting, timeouts and temporary API failures. Cache successful lookups to avoid repeated remote requests.

---

## Machine-learning design and research protocol

### Baseline ladder

Build a progression where each stage can be evaluated independently.

| Model | Input | Why build it |
|---|---|---|
| Majority / label-frequency baseline | Labels only | Sanity check |
| Logistic regression / one-vs-rest | Morgan fingerprints | Interpretable baseline |
| Random Forest / ExtraTrees | Morgan + descriptors | Strong tabular baseline |
| XGBoost / CatBoost | Fingerprints + descriptors | Nonlinear boosting baseline |
| MPNN / GIN / GAT | Molecular graph | Learn graph representation |
| Pharmacophore + graph model | 3D-derived pharmacophore + graph | Advanced controlled experiment |
| OpenPOM | Upstream supported representation | Reproduction baseline on its documented task |

### Avoid invalid model comparisons

- OpenPOM's reported result uses its own curated dataset and odor-label space. Do not compare its paper/repository ROC-AUC directly with an OdorNet score as if the test data were identical.
- OdorNet's 12 broad labels and other datasets' fine-grained descriptors are not automatically interchangeable.
- Use a shared label ontology only after documenting a defensible mapping and retaining unmapped labels.
- Keep test sets untouched until model choice and tuning are complete.
- Report per-label metrics and support counts; macro metrics can be unstable for rare labels.

### Recommended evaluation

For single-molecule multi-label classification, report:

- Macro-F1 and micro-F1.
- Macro/micro ROC-AUC where both classes are represented.
- Macro/micro PR-AUC (especially for imbalanced labels).
- Per-label precision, recall, F1 and support.
- Hamming loss and subset accuracy where appropriate.
- Calibration (Brier score / reliability diagram / expected calibration error, with method described).
- OOD detection quality and performance on distant scaffolds.

Use the OdorNet published train/validation/test split for a reproducible first benchmark. Also build a separate scaffold-grouped generalization experiment if you have enough data. Never tune thresholds on the final test set.

### Stereochemistry experiment

- Preserve isomeric SMILES.
- Record whether the source explicitly specifies stereochemistry.
- Compare stereoisomer pairs only where valid and data support exists.
- Avoid treating unspecified stereochemistry as equivalent to a known stereoisomer.
- Report the number of stereochemical pairs and missing labels.

### Mixture-modeling track

Keep two different tasks separate:

**Task A - mixture profile prediction:** input is a set of components and, when available, their concentration/ratio metadata; output is a multi-descriptor odor profile. Use the 2025 mixture profile source only under its current access/usage terms.

**Task B - mixture-pair perceptual distance:** input is two mixtures; output is a similarity/distance target. Use the DREAM mixture-pair source and its task definition.

Never report Task B performance as full profile-prediction accuracy. Never infer component proportions if the dataset does not provide them. Compare a simple baseline with a model trained on mixture-specific targets. Use mixture-level and molecule-level grouping to prevent leakage.

### Explainability

Recommended tools:

- SHAP for tree models and suitable feature vectors.
- Integrated Gradients or graph-specific attribution for neural models.
- Atom / bond contribution visualization on the RDKit drawing.
- Counterfactual masking as a model-sensitivity experiment.

Every explanation panel should display the method name, target label, baseline/reference definition and a caution that model attribution is not chemical causation.

### Uncertainty and OOD

Use multiple signals rather than one uncalibrated number:

- Probability calibration on validation data.
- Deep ensembles or model disagreement.
- Distance to training examples in fingerprint space.
- Embedding-space distance for GNNs.
- Conformal prediction only with a justified calibration split and exchangeability assumptions.

UI labels should distinguish **predicted score**, **calibrated probability** and **OOD warning**. Do not call an arbitrary neural output a confidence percentage.

### Recent research to review

- OpenPOM / Principal Odor Map (2023): reference structure-to-odor modeling.
- Pyrfume data descriptor (2024): harmonized olfactory data infrastructure.
- Mixture prediction and DREAM challenge work (2025): concentration and multi-component tasks.
- PharmaGNN (published 2026): recent pharmacophore-enhanced GNN work. Its article states that underlying study data are available on request, so do not assume a public training dataset is available.
- Topology-aware olfaction prediction (first published 21 October 2026): explores persistent-entropy descriptors together with standard molecular descriptors. Treat it as a recent comparison idea, not proof that persistent homology is automatically superior.

---

## Backend architecture and API contracts

### Service modules

```text
apps/api/scientiq_api/
├── main.py
├── core/
│   ├── config.py
│   ├── logging.py
│   └── security.py
├── api/v1/
│   ├── health.py
│   ├── molecules.py
│   ├── predictions.py
│   ├── similarities.py
│   ├── comparisons.py
│   ├── odor_map.py
│   ├── datasets.py
│   └── reports.py
├── schemas/
├── services/
│   ├── pubchem_service.py
│   ├── chemistry_service.py
│   ├── prediction_service.py
│   ├── similarity_service.py
│   └── report_service.py
├── repositories/
└── model_runtime/
```

### API endpoint plan

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness and model-service status |
| POST | `/api/v1/molecules/resolve` | Resolve a name or external identifier |
| POST | `/api/v1/molecules/validate` | Validate / standardize SMILES |
| GET | `/api/v1/molecules/{molecule_id}` | Fetch stored molecule details |
| POST | `/api/v1/predictions/single` | Run single-molecule odor prediction |
| POST | `/api/v1/predictions/blend` | Run mixture model when available |
| POST | `/api/v1/similarity/search` | Search chemical or odor-profile neighbors |
| POST | `/api/v1/compare` | Compare two or more molecules |
| GET | `/api/v1/odor-map` | Get sampled map points and filters |
| GET | `/api/v1/datasets` | List data sources and licenses |
| GET | `/api/v1/models` | List available model versions / status |
| POST | `/api/v1/reports` | Create an exportable report |
| GET | `/api/v1/reports/{report_id}` | Retrieve a report |

### Request / response examples

**Resolve a molecule**

```json
{
  "query": "ethanol",
  "input_type": "name"
}
```

Example response shape:

```json
{
  "molecule_id": "mol_01J...",
  "name": "ethanol",
  "pubchem_cid": 702,
  "original_input": "ethanol",
  "canonical_smiles": "CCO",
  "isomeric_smiles": "CCO",
  "formula": "C2H6O",
  "molecular_weight": 46.07,
  "source": "PubChem",
  "validation_status": "valid"
}
```

**Run a single-molecule prediction**

```json
{
  "molecule_id": "mol_01J...",
  "model_id": "scentiq-odornet-gnn",
  "model_version": "0.1.0",
  "top_k": 8,
  "include_explanation": true
}
```

Example response shape:

```json
{
  "prediction_id": "pred_01J...",
  "molecule_id": "mol_01J...",
  "task": "single_molecule_odor_multilabel",
  "model": {"id": "scentiq-odornet-gnn", "version": "0.1.0"},
  "dataset": {"name": "OdorNet", "version": "recorded-in-model-card"},
  "predictions": [
    {"label": "floral", "score": 0.71, "calibrated_probability": null}
  ],
  "uncertainty": {
    "status": "not_calibrated",
    "ood_flag": false,
    "message": "Interpret scores as model outputs until calibration is validated."
  },
  "explanation": {"status": "available", "method": "integrated_gradients"},
  "limitations": ["Prediction is computational and does not verify real human perception."]
}
```

The sample score above is illustrative only. Never hard-code it as a prediction.

### FastAPI request schema starter

```python
from typing import Literal
from pydantic import BaseModel, Field

class ResolveMoleculeRequest(BaseModel):
    query: str = Field(min_length=1, max_length=300)
    input_type: Literal["name", "smiles", "pubchem_cid"]

class SinglePredictionRequest(BaseModel):
    molecule_id: str | None = None
    smiles: str | None = None
    model_id: str = "scentiq-baseline"
    model_version: str | None = None
    top_k: int = Field(default=8, ge=1, le=30)
    include_explanation: bool = False

class BlendComponent(BaseModel):
    smiles: str
    fraction: float = Field(gt=0, le=1)

class BlendPredictionRequest(BaseModel):
    components: list[BlendComponent] = Field(min_length=2, max_length=10)
    model_id: str
    concentration_basis: Literal["mole_fraction", "mass_fraction", "unknown"]
```

For blends, validate that component fractions sum to the expected total only when the user selects a defined basis and the dataset/model expects that convention. Do not assume mole fraction and mass fraction are interchangeable.

### API integration rules

- Use Pydantic request and response schemas.
- Return stable error codes and human-readable messages.
- Set CORS to the exact deployed frontend origin; do not leave `*` in production when credentials are enabled.
- Keep PubChem access in the backend with caching and timeouts.
- Make inference endpoints return model ID, model version and dataset version.
- Run long model tasks in a job queue if synchronous responses become slow.
- Add request IDs, structured logs and health checks.
- Serve automatic interactive API docs at `/docs` in development; restrict or disable public docs only if deployment policy requires it.
- Validate uploaded file type, size and parser result; do not trust file extensions.

---

## Database design

Use PostgreSQL as the source of truth. Use JSONB for flexible prediction payloads, but keep important searchable fields in typed columns.

### Core tables

| Table | Main fields |
|---|---|
| `molecules` | id, input_name, original_smiles, canonical_smiles, isomeric_smiles, inchikey, pubchem_cid, formula, molecular_weight |
| `datasets` | id, name, version, source_url, doi, license, checksum, accessed_at, data_card_path |
| `models` | id, version, task, dataset_version, code_commit, artifact_uri, model_card_path, metrics_json |
| `predictions` | id, molecule_id, model_id, input_hash, output_jsonb, uncertainty_jsonb, created_at |
| `blend_scenarios` | id, model_id, components_jsonb, concentration_basis, task, output_jsonb |
| `research_runs` | id, experiment_name, config_jsonb, dataset_version, code_commit, metrics_jsonb, created_at |
| `reports` | id, report_type, prediction_id, storage_uri, created_at |

### Similarity strategy

- Morgan fingerprint / Tanimoto: compute using RDKit for chemical similarity.
- Learned embedding / cosine: optionally store in pgvector for embedding-based nearest neighbors.
- Predicted odor profile similarity: compare aligned and validated descriptor vectors with a documented metric.

Do not confuse chemical similarity with odor similarity; show which method was used in the UI.

---

## Frontend design specification

### Visual direction

Use a modern scientific research interface, not a decorative sci-fi dashboard. A dark navy / charcoal base with restrained teal and violet accents is suitable, but charts must remain readable and accessible. Keep motion subtle and provide a reduced-motion fallback.

Recommended layout:

- Left navigation rail with grouped workspaces.
- Top bar with global search, active model/dataset label and profile/settings.
- Main content area with page title, description and primary action.
- Right-side contextual inspector for selected molecule, model or experiment where screen width allows.
- Responsive layout that collapses navigation on smaller devices.

### Frontend workspaces and their components

| Workspace | Components | Main behavior / API |
|---|---|---|
| Overview | Project status cards, recent analyses, model status, dataset badges, activity feed | GET `/models`, `/datasets`, recent predictions |
| Molecular Lab | Name/SMILES input, file import, validation result, 2D structure, 3D viewer, descriptor table | POST `/molecules/resolve`, `/molecules/validate` |
| AI Prediction | Model selector, prediction action, odor-label bars, label table, model/dataset provenance, limitations | POST `/predictions/single` |
| Explainability Lab | Atom/bond heatmap, feature-attribution list, target-label selector, method metadata | Explanation payload from prediction API or dedicated explanation endpoint |
| Similarity Explorer | Search method selector, nearest-neighbor list, pairwise score, structure comparison | POST `/similarity/search` |
| Blend Studio | Component picker, ratio/concentration inputs, unit selector, blend summary, model support banner | POST `/predictions/blend` only for a trained mixture model |
| Odor Explorer | UMAP/PCA scatter map, label filters, search, selection inspector | GET `/odor-map` |
| Compare Lab | Two-to-four molecule comparison, aligned property cards, descriptor deltas, score comparison | POST `/compare` |
| Research Console | Dataset selector, model versions, experiment filters, metrics charts, split/provenance inspector | GET `/datasets`, `/models`; research admin endpoints later |
| Reports | Report list, detail, PDF/JSON/CSV export, citation panel | POST `/reports`, GET `/reports/{id}` |
| Settings | Theme, motion, display preferences, model-default selection | User preferences API if accounts are implemented |

### Detailed reusable component inventory

**Global components**

- `AppShell`: layout, navigation and responsive breakpoints.
- `SidebarNav`: grouped workspaces and active-page state.
- `TopBar`: global search, current model/dataset and account controls.
- `PageHeader`: page title, description, breadcrumb and primary action.
- `StatusBadge`: model/dataset status (ready, experimental, unavailable).
- `LoadingState`, `EmptyState`, `ErrorState`: consistent async states.
- `SourceCitation`: displays dataset, DOI, license and external source link.
- `ScientificDisclaimer`: explains model limits near predictions.

**Molecule components**

- `MoleculeInput`: accepts name or SMILES and validates required input.
- `InputModeTabs`: switch between name, SMILES and supported file import.
- `MoleculeSummaryCard`: name, CID, formula, mass and InChIKey.
- `Structure2DViewer`: displays server-generated RDKit SVG.
- `Structure3DViewer`: interactive conformer viewer; display geometry as a generated model, not an experimentally solved structure unless sourced as such.
- `DescriptorGrid`: chemical descriptor values and units.
- `ValidationWarnings`: invalid valence, unsupported atom, missing stereochemistry or ambiguous name.

**Prediction components**

- `ModelSelector`: select a model only if its task and version are available.
- `PredictionRunButton`: submit the request and prevent duplicate requests.
- `OdorScoreChart`: sorted label-score bar chart with clear score semantics.
- `OdorLabelTable`: ranked labels, scores and label definitions.
- `PredictionMetadata`: model, version, dataset and timestamp.
- `UncertaintyPanel`: calibrated status, ensemble spread, OOD warning and limitations.
- `ModelComparisonPanel`: side-by-side scores for models evaluated on the same task.

**Explainability and discovery components**

- `AtomAttributionViewer`: color atoms/bonds based on attribution values.
- `AttributionLegend`: explains positive/negative attribution and scale.
- `SimilarityMethodSelector`: Morgan/Tanimoto vs learned embedding vs odor-profile similarity.
- `MoleculeNeighborCard`: structure, identity, chemical similarity and odor-profile similarity as separate values.
- `OdorMapCanvas`: UMAP/PCA map with filters, hover and molecule selection.
- `MoleculeCompareGrid`: align structures and chemical properties for comparison.

**Mixture components**

- `MixtureComposer`: add and remove components.
- `ComponentMoleculePicker`: select from existing molecule records.
- `RatioEditor`: enter values and select mole/mass/unknown basis.
- `MixtureValidityPanel`: checks model support, number of components and concentration availability.
- `MixturePredictionPanel`: show the task-specific output and model limitations.

**Research and report components**

- `DatasetCard`: source, release, license, citation, row count and known limitations.
- `ModelCard`: intended use, data, metrics, split, calibration, limitations and citation.
- `MetricDashboard`: per-label metrics, PR curves, calibration and confusion summaries.
- `ExperimentTimeline`: run ID, date, commit, configuration and metrics.
- `ReportPreview`: preview, export and citation list.

### Screen-level behavior

**Molecular Lab flow**

1. User chooses Name or SMILES.
2. User enters the input and selects Validate.
3. Frontend shows pending state and disables duplicate submit.
4. Backend resolves name if needed, then validates and standardizes with RDKit.
5. Frontend shows molecule identity and any ambiguity warning.
6. User can proceed to prediction only after a valid structure is returned.

**Prediction flow**

1. User selects a supported single-molecule model.
2. Frontend shows task type and training dataset.
3. User clicks Predict.
4. Backend returns predictions, model version and uncertainty metadata.
5. Frontend renders labels and scores, explanation and warning panels.
6. User can save a report or compare similar molecules.

**Blend Studio flow**

1. User adds at least two known components.
2. User enters component amounts only when supported by the dataset/model.
3. Frontend validates units and ratio basis.
4. If no supported blend model is deployed, show an explicit "experimental / unavailable" state instead of fake predictions.
5. If the model is available, show the task-specific target (odor profile or pairwise distance) and training-domain warning.

### Design and accessibility rules

- Use consistent 8px spacing scale and a clear type hierarchy.
- Ensure keyboard navigation, visible focus states and semantic labels.
- Avoid color-only meaning; add text labels and icons.
- Provide tooltips for technical terms such as SMILES, Tanimoto and OOD.
- Show units and score semantics beside every chart.
- Use empty/loading/error states on every API-driven panel.
- Keep 3D visualizations optional; the main workflow must remain usable if WebGL is unavailable.
- Do not animate scientific charts in ways that imply measured sensor signals.
- Label all demo/simulated data as illustrative.

---

## Frontend-to-API integration

### Environment variables

Frontend `.env`:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Do not store PubChem keys, database URLs or private credentials in frontend variables. Vite variables prefixed with `VITE_` are exposed to the browser.

### Typed API client example

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type OdorScore = {
  label: string;
  score: number;
  calibrated_probability: number | null;
};

export type PredictionResponse = {
  prediction_id: string;
  molecule_id: string;
  task: string;
  model: { id: string; version: string };
  predictions: OdorScore[];
  uncertainty: {
    status: string;
    ood_flag: boolean;
    message?: string;
  };
  limitations: string[];
};

export async function predictMolecule(
  payload: {
    molecule_id: string;
    model_id: string;
    model_version?: string;
    top_k: number;
    include_explanation: boolean;
  },
  signal?: AbortSignal,
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/predictions/single`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Prediction failed (${response.status})`);
  }
  return response.json();
}
```

Use an abort controller when the user changes molecule or navigates away. Keep loading, error and empty states in the component state machine.

### API error shape

Use one consistent error format:

```json
{
  "error": {
    "code": "INVALID_SMILES",
    "message": "The supplied string could not be parsed as a valid molecule.",
    "request_id": "req_..."
  }
}
```

Suggested error codes: `INVALID_INPUT`, `INVALID_SMILES`, `AMBIGUOUS_NAME`, `PUBCHEM_UNAVAILABLE`, `MODEL_NOT_READY`, `TASK_NOT_SUPPORTED`, `OOD_WARNING`, `DATASET_NOT_AVAILABLE`, `RATE_LIMITED`, `INTERNAL_ERROR`.

---

## Quick-start guide for using the finished ScentIQ platform

This section describes the planned user experience. A feature should only be enabled in the deployed app after its model, API and validation tests are complete.

### Open the platform

1. Open the ScentIQ web URL provided by the project team.
2. Wait for the Overview page to show API and model-service status.
3. Confirm the selected model status is **Ready**. If the model is marked Experimental or Unavailable, do not treat its output as a validated result.

### Analyze a single molecule

1. Open **Molecular Lab**.
2. Choose **Chemical name** or **SMILES**.
3. Enter a known compound name or valid SMILES string.
4. Select **Validate molecule**.
5. Check the returned name, formula, structure and stereochemistry warnings.
6. Open **AI Prediction** and choose a single-molecule model.
7. Confirm the model's dataset and intended task.
8. Select **Predict odor profile**.
9. Review the predicted labels, score definitions, uncertainty warning and limitations.

### Understand a prediction

- A raw model score is not automatically a calibrated probability.
- A label score is not a measured odor intensity.
- An OOD warning means the molecule may be unlike the model's training examples.
- Human odor perception can vary and the dataset may represent a limited population, vocabulary or experimental condition.
- Use the explanation panel to understand model attribution, not as proof of a biological mechanism.

### Find similar molecules

1. Open **Similarity Explorer** from a validated molecule.
2. Select a comparison mode: chemical fingerprint, learned molecular embedding or predicted odor profile.
3. Run the search.
4. Review the method-specific similarity score and inspect the returned structures.
5. Do not compare scores from different similarity methods as though they were the same measurement.

### Compare molecules

1. Open **Compare Lab**.
2. Add two or more validated molecules.
3. Review structures, chemical descriptors and model predictions side by side.
4. Use the comparison method label to distinguish chemical similarity from predicted odor-profile similarity.

### Use Blend Studio

1. Open **Blend Studio**.
2. Add two or more supported components.
3. Enter component ratios only if the selected model requires them and the dataset supports that basis.
4. Check the experimental warning and model domain.
5. Submit only if the mixture model is marked Ready.

If the mixture model is not yet trained and validated, Blend Studio should remain a disabled preview or clearly labeled research prototype. Never display an averaged single-molecule output as a true mixture prediction.

### Export a report

1. Open a completed analysis.
2. Select **Create report**.
3. Confirm molecule identity, model version, dataset version, scores, explanation, uncertainty and source citations.
4. Export PDF or JSON.
5. Include the report's model/data versions when sharing results.

---

## Development quick-start (developer setup)

These steps create the initial development environment. They do not download every large model or make every feature available automatically.

### Prerequisites

- Git and GitHub account.
- Python 3.10 for the OpenPOM reproduction environment.
- A supported Node.js LTS version (check Vite's current minimum version).
- Docker Desktop / Docker Engine with Compose.
- Optional: GitHub CLI (`gh`).

### Clone your ScentIQ repository

```bash
git clone https://github.com/<your-github-username>/scentiq.git
cd scentiq
cp .env.example .env
```

### Start PostgreSQL locally

A minimal `infra/compose.yaml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: scentiq
      POSTGRES_USER: scentiq
      POSTGRES_PASSWORD: local_dev_only_change_me
    ports:
      - "5432:5432"
    volumes:
      - scentiq_pgdata:/var/lib/postgresql/data

volumes:
  scentiq_pgdata:
```

Start it:

```bash
docker compose -f infra/compose.yaml up -d
```

For a shared or deployed system, replace the local password and use managed secrets. Never use the sample password in production.

### Create the API environment

```bash
cd apps/api
python3.10 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install fastapi "uvicorn[standard]" pydantic-settings httpx pandas numpy scikit-learn rdkit sqlalchemy psycopg[binary] alembic pytest
```

After the first working environment, freeze tested dependencies into a lockfile / requirements file. Install PyTorch, PyTorch Geometric, OpenPOM and optional explainability dependencies in controlled, separate steps because wheel compatibility differs by OS and CPU/GPU.

Run the API after creating `scentiq_api/main.py`:

```bash
uvicorn scentiq_api.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs` to inspect the generated API documentation.

### Create the frontend

From the repository root:

```bash
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm install
npm install three @react-three/fiber@9 @react-three/drei
npm install plotly.js react-plotly.js
npm run dev
```

Use the compatible React / React Three Fiber major versions listed in the current official documentation. Add a `.env` file with `VITE_API_BASE_URL=http://localhost:8000/api/v1`.

### Download the first datasets

```bash
mkdir -p data/external
cd data/external
git clone https://github.com/NKU-DOIE/OdorNet.git
git clone https://github.com/pyrfume/pyrfume-data.git
```

Keep downloaded data outside the Git-tracked source tree unless the data license and repository policy clearly permit redistribution. Add a `data/external/README.md` recording the versions, licenses, access dates and checksums.

### First acceptance test

Before building a beautiful frontend, demonstrate this vertical slice:

1. Load one OdorNet row.
2. Parse its SMILES using RDKit.
3. Render a 2D structure.
4. Generate a Morgan fingerprint.
5. Run one simple baseline model trained on the training split.
6. Return a typed JSON prediction from FastAPI.
7. Display that response in a React page.
8. Save model version and data provenance with the result.

Only after this vertical slice works should you add the GNN, 3D viewer, blend model and advanced visualization.

---

## Testing and quality gates

### Unit tests

- Valid and invalid SMILES parsing.
- Canonical / isomeric SMILES invariants.
- PubChem success, no-result, timeout and throttling paths.
- Label mapping and missing-label masking.
- Fingerprint reproducibility.
- Model input shape and output label ordering.
- Calibration and OOD warning logic.
- API request / response schema validation.

### Integration tests

- Molecule resolve -> validate -> predict -> report.
- Dataset loader -> featurizer -> training -> evaluation.
- Frontend -> API -> model runtime.
- Database migration -> persistence -> retrieval.
- Report export -> source citations and model version.

### Scientific quality gates

| Gate | Acceptance condition |
|---|---|
| Data integrity | No silent label coercion; invalid rows and missingness reported |
| Split integrity | No canonical connectivity/stereochemistry leakage across published partitions |
| Baseline | Simple baseline runs end-to-end and metrics are reproducible |
| GNN | Beats or offers a defensible trade-off versus baseline on the same split/task |
| Explainability | Attributions are method-labeled and stable enough to interpret cautiously |
| Calibration | Calibration is measured on validation data and reported, not assumed |
| OOD | Known far-from-training examples trigger the intended warning behavior |
| Mixtures | Model is trained/evaluated on mixture targets, not synthetic averages presented as true results |
| Reproducibility | Model card, data card, config, commit and metrics saved for each run |
| UX | Invalid input, errors, loading and unsupported model states are clear |

### Frontend test requirements

- Test each page at desktop, tablet and mobile widths.
- Test keyboard-only navigation and focus visibility.
- Verify WebGL-disabled fallback.
- Verify no charts are shown as real measurements if they are illustrative.
- Verify warning text remains visible when charts are exported.

---

## Deployment plan

### First demo deployment

- **Frontend:** Deploy the Vite production build as a static site (for example, Vercel or Netlify).
- **API:** Deploy the FastAPI service as a Dockerized web service (for example, Render or another container platform).
- **Database:** Use managed PostgreSQL (for example, Supabase or Neon) or a university-hosted instance.
- **Artifacts:** Store large model weights in object storage or a versioned model-artifact store; do not push large checkpoints into ordinary Git commits.
- **Monitoring:** Log API errors, model load state, latency and request IDs.

### Deployment caution

Some free API hosting services may sleep after inactivity, causing cold starts. A model-heavy API may also exceed free CPU or memory allocations. Verify current plan limits before the final demo. If OpenPOM or the GNN is too heavy for the public API service, deploy the web UI and API separately from an inference worker, or keep inference on a research machine for a controlled academic demo.

### Production environment variables

```text
APP_ENV=production
DATABASE_URL=<managed-postgres-connection-string>
CORS_ORIGINS=https://<your-frontend-domain>
MODEL_ARTIFACT_URI=<versioned-artifact-location>
PUBCHEM_BASE_URL=https://pubchem.ncbi.nlm.nih.gov/rest/pug
LOG_LEVEL=INFO
```

Use platform secret management rather than committing real values. Enforce HTTPS, exact CORS origins, request-size limits and dependency updates.

---

## Suggested implementation milestones

| Milestone | Deliverable | Exit condition |
|---|---|---|
| M0 - scope and governance | Feature freeze, data cards, license checklist | Dataset and task definitions approved |
| M1 - repository and environment | ScentIQ repo, OpenPOM fork, project skeleton | Reproducible local setup |
| M2 - data pipeline | OdorNet loader, checksums, quality audit | Data integrity report complete |
| M3 - chemical features | RDKit validation, descriptors and fingerprints | Unit tests pass |
| M4 - baseline ML | RF / logistic / boosting model | Baseline metrics and model card saved |
| M5 - GNN research | Graph model and ablations | Comparable evaluation on same splits |
| M6 - explainability and uncertainty | Attributions, calibration and OOD flags | Validation evidence documented |
| M7 - API and frontend MVP | Molecular Lab, prediction and reports | End-to-end vertical slice works |
| M8 - discovery experience | Similarity, map and compare views | Search and visual tests pass |
| M9 - mixture experiment | Separate mixture model / prototype | Task-specific evaluation and clear status |
| M10 - release | Deployment, PPT, report and quick-start docs | Clean reproducible demo |

Adjust milestone duration to your academic calendar. Do not commit to mixture prediction until a dataset, target definition and usable license have been confirmed.

---

## Research contribution and final-year evaluation

A strong final-year submission should not claim that the whole field of computational olfaction is novel. The contribution should be framed as a reproducible comparison or extension.

### Recommended research questions

- **RQ1:** How do molecular fingerprints, physicochemical descriptors and graph representations compare for multi-label odor prediction on a fixed, provenance-aware dataset?
- **RQ2:** Does stereochemistry-aware featurization improve performance on a carefully defined subset of stereo-resolved molecules?
- **RQ3:** Do feature attribution methods reveal stable model-relevant molecular regions, and where do explanations disagree?
- **RQ4:** How does model calibration and out-of-distribution detection affect the reliability of predictions for unseen scaffolds?
- **RQ5 (extension):** Can a separately trained mixture model predict mixture profiles or pairwise perceptual distances more effectively than a simple baseline on the relevant mixture dataset?

### Suggested figures for the paper / presentation

1. End-to-end system architecture.
2. Dataset source and label-coverage diagram.
3. Train/validation/test split audit.
4. Model architecture diagram.
5. Macro/micro metric comparison.
6. Per-label precision-recall / support plots.
7. Calibration and reliability diagram.
8. OOD-distance distribution.
9. Molecular attribution examples.
10. Odor-space map with method and embedding noted.
11. Mixture task results (only if validated).
12. Ablation study table.

### Avoid these research mistakes

- Reporting accuracy alone for an imbalanced multi-label task.
- Randomly splitting molecules when close analogs can leak across partitions.
- Treating missing labels as negatives without an explicit experiment.
- Using the same test set repeatedly for model tuning.
- Comparing metrics from different label spaces or test cohorts.
- Showing attractive 3D molecule views as though they prove odor mechanisms.
- Presenting a predicted score as human consensus or physical measurement.
- Claiming the mixture engine predicts emergent perception when only single-molecule scores were averaged.

---

## License, ethics and publication checklist

- Preserve OpenPOM's MIT copyright and license notice when using or modifying its code.
- Preserve OdorNet attribution and CC BY 4.0 requirements for its dataset release.
- Inspect each Pyrfume dataset's individual license; its archive is not a blanket commercial-use license.
- Check Synapse and GitHub terms for mixture challenge datasets before distributing data or derived artifacts.
- Do not repackage third-party datasets or pretrained weights unless their licenses permit it.
- Provide citations and source links in exported reports.
- Document human-perception variability and descriptor vocabulary limitations.
- Do not use the app to make safety, toxicology, medical or regulatory claims.
- Keep the initial project software-only; no physical sample handling is necessary.

---

## Reference links and further reading

### Core repositories and data

1. OpenPOM: <https://github.com/BioMachineLearning/openpom>
2. OpenPOM original fork: <https://github.com/ARY2260/openpom>
3. OdorNet: <https://github.com/NKU-DOIE/OdorNet>
4. OdorNet Zenodo archive: <https://zenodo.org/records/19838455>
5. Pyrfume data archive: <https://github.com/pyrfume/pyrfume-data>
6. Pyrfume package: <https://github.com/pyrfume/pyrfume>
7. Mixture profile model/data repository: <https://github.com/Satarifard/Olfactory-Mixtures-Prediction-2025>
8. DREAM mixture-pair challenge repository: <https://github.com/Satarifard/DREAM-olfactory-mixtures-prediction-challenge>
9. PubChem PUG REST: <https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest>

### Research papers

10. Lee et al., *A Principal Odor Map Unifies Diverse Tasks in Human Olfactory Perception*, Science (2023), DOI: <https://doi.org/10.1126/science.ade4401>
11. Pyrfume data descriptor, Scientific Data (2024), DOI: <https://doi.org/10.1038/s41597-024-04051-z>
12. Sisson et al., mixture prediction work, ACS Omega (2025), DOI: <https://doi.org/10.1021/acsomega.4c10924>
13. DREAM Olfactory Mixtures Prediction Challenge information: <https://www.synapse.org/Synapse:syn64743570>
14. Liu et al., *PharmaGNN: a model for odor prediction based on graph neural networks*, Journal of the Science of Food and Agriculture (2026), DOI: <https://doi.org/10.1002/jsfa.70826>
15. Wang et al., *Olfaction Prediction With Topology-Aware Machine Learning*, Flavour and Fragrance Journal (first published 21 October 2026), DOI: <https://doi.org/10.1002/ffj.70173>

### Official developer documentation

16. RDKit installation and documentation: <https://www.rdkit.org/docs/Install.html>
17. FastAPI first steps and OpenAPI docs: <https://fastapi.tiangolo.com/tutorial/first-steps/>
18. FastAPI request body / Pydantic: <https://fastapi.tiangolo.com/tutorial/body/>
19. React Quick Start: <https://react.dev/learn>
20. Vite guide: <https://vite.dev/guide/>
21. React Three Fiber: <https://r3f.docs.pmnd.rs/getting-started/introduction>
22. PostgreSQL JSON types: <https://www.postgresql.org/docs/current/datatype-json.html>
23. pgvector: <https://github.com/pgvector/pgvector>
24. Docker Compose quickstart: <https://docs.docker.com/compose/gettingstarted/>
25. Render FastAPI deployment: <https://render.com/docs/deploy-fastapi>
26. Hugging Face model cards: <https://huggingface.co/docs/hub/main/en/model-cards>

---

## Final build order - do this, then this

1. Create the ScentIQ GitHub repository.
2. Fork OpenPOM and record its upstream remote and commit hash.
3. Clone OdorNet and read its README, data dictionary and licenses.
4. Create the dataset manifest and audit the 7:2:1 split.
5. Build RDKit validation and feature generation.
6. Train a simple fingerprint-based multi-label baseline with masked labels.
7. Reproduce or run OpenPOM separately on its supported task.
8. Build GNN and feature-ablation experiments.
9. Evaluate per-label performance, calibration and scaffold generalization.
10. Add explainability and OOD analysis.
11. Freeze API response schemas and build FastAPI endpoints.
12. Build frontend workspaces using the component inventory in Section 11.
13. Integrate the frontend with the API and add error/loading states.
14. Add similarity and odor-space visualization.
15. Add mixture research only after verifying task-specific data access and licenses.
16. Build reports, model cards and dataset cards.
17. Run unit, integration, scientific and UI tests.
18. Deploy a CPU-first demo and keep advanced models behind clear availability labels.
19. Prepare the final-year presentation, report and live demonstration.

**Definition of done:** A user can enter a supported molecule, receive a reproducible model-backed prediction, see the exact model and dataset version, inspect an explanation and uncertainty warning, compare known molecules, and export a source-attributed report. Every displayed result is backed by a real model output or explicitly marked illustrative.