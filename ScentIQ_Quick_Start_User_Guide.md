# ScentIQ - Quick Start User Guide

**Version 1.0 | 18 November 2026**  
**Project status:** This guide describes the planned user experience. A feature should only be used when the deployed ScentIQ application marks its model as Ready.

## What ScentIQ does

ScentIQ is a software-only computational olfaction platform. It analyzes a chemical molecular structure and predicts odor descriptors learned from scientific datasets. It does not physically smell or measure a sample.

## 1. Open the application

1. Open the ScentIQ URL supplied by the project team.
2. Check the API and model status on the Overview page.
3. Continue only when the selected model is marked **Ready**. Experimental and Unavailable models must be clearly identified.

## 2. Analyze one molecule

1. Open **Molecular Lab**.
2. Choose **Chemical name** or **SMILES**.
3. Enter a known compound name or valid SMILES string.
4. Select **Validate molecule**.
5. Check the resolved identity, formula, structure and stereochemistry warnings.
6. Open **AI Prediction**.
7. Select a single-molecule model and check its dataset and task description.
8. Select **Predict odor profile**.
9. Review the odor-label scores, model version, uncertainty panel and limitations.

## 3. Understand the output

- A model score is not automatically a calibrated probability.
- A predicted odor label is not a measured odor intensity.
- An out-of-distribution (OOD) warning means the molecule may be unlike the model's training data.
- Odor perception can differ across people and experimental conditions.
- An explainability view describes which model inputs influenced its prediction; it does not prove a biological mechanism.
- ScentIQ is not a safety, toxicology, medical or regulatory assessment tool.

## 4. Find similar molecules

1. Open **Similarity Explorer** from a validated molecule.
2. Select a method: chemical fingerprint, learned molecular embedding or predicted odor-profile similarity.
3. Run the search.
4. Inspect each neighbor's structure and method-specific score.
5. Do not compare Tanimoto, embedding distance and odor-profile similarity scores as if they were the same quantity.

## 5. Compare molecules

1. Open **Compare Lab**.
2. Add two or more validated molecules.
3. Review molecular structures, descriptors and model predictions side by side.
4. Check whether the selected similarity or prediction method uses the same label set and model version.

## 6. Use Blend Studio

Blend Studio is an experimental workspace. Only use it when a mixture model is marked Ready.

1. Add two or more supported molecules.
2. Enter component ratios only when the model's dataset supports the required basis (for example, mole fraction or mass fraction).
3. Review units and concentration metadata.
4. Run the model and inspect its task definition and limitations.

Do not treat an arithmetic average of individual molecule predictions as a validated mixture prediction. If no mixture model is available, the application should display an unavailable or experimental notice instead of fabricating an output.

## 7. Create and export a report

1. Open a completed analysis.
2. Select **Create report**.
3. Review molecule identity, scores, model and dataset versions, explanations, uncertainty and source citations.
4. Export PDF or JSON.
5. Include the model/data version information when sharing the result.

## 8. Workspace reference

| Workspace | Purpose |
|---|---|
| Overview | Model status, recent analyses and dataset availability |
| Molecular Lab | Enter, resolve and inspect molecular structures |
| AI Prediction | Run a single-molecule odor prediction |
| Explainability Lab | Inspect model feature attribution |
| Similarity Explorer | Find chemically or odor-profile-similar molecules |
| Blend Studio | Run a separate mixture model when available |
| Odor Explorer | Navigate a 2D/3D molecular odor map |
| Compare Lab | Compare two or more molecules |
| Research Console | Inspect datasets, model versions and metrics |
| Reports | Export and revisit source-attributed results |

## 9. If something goes wrong

| Message | What to do |
|---|---|
| Invalid SMILES | Check syntax and brackets, or use a chemical name lookup |
| Ambiguous name | Select a confirmed compound record; do not guess |
| PubChem unavailable | Retry later or enter a known valid SMILES |
| Model not ready | Select a model marked Ready or contact the project team |
| OOD warning | Treat the prediction as exploratory and inspect nearest training molecules |
| Explanation unavailable | The selected model may not support the current explanation method |
| Blend model unavailable | Use single-molecule analysis; do not synthesize a blend prediction by averaging labels |

## Scientific-use reminder

ScentIQ is a research and educational software platform. It produces computational predictions from existing data, not sensory measurements. Always inspect the dataset, model card, score definition, uncertainty warning and cited evidence before interpreting or sharing a result.
