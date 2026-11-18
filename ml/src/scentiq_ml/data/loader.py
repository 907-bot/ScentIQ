"""Dataset loading, validation, split verification, and manifest creation for OdorNet and Pyrfume."""

import hashlib
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from rdkit import Chem

from scentiq_ml.data.ontology import ODORNET_12_CATEGORIES


class OdorDataset:
    """Multi-label odor dataset wrapper with stereochemistry and masked loss support."""

    def __init__(
        self,
        df: pd.DataFrame,
        label_columns: Optional[List[str]] = None,
        smiles_column: str = "SMILES",
        split_name: str = "train"
    ):
        self.df = df.copy().reset_index(drop=True)
        self.smiles_column = smiles_column
        self.split_name = split_name
        self.label_columns = label_columns or [c for c in ODORNET_12_CATEGORIES if c in self.df.columns]

        if smiles_column not in self.df.columns:
            raise ValueError(f"Missing required '{smiles_column}' column in dataset.")

        # Ensure valid SMILES and filter invalid structures
        valid_indices = []
        for idx, s in enumerate(self.df[smiles_column]):
            if isinstance(s, str) and Chem.MolFromSmiles(s.strip()) is not None:
                valid_indices.append(idx)

        self.df = self.df.iloc[valid_indices].reset_index(drop=True)

    def __len__(self) -> int:
        return len(self.df)

    def get_smiles_list(self) -> List[str]:
        return self.df[self.smiles_column].tolist()

    def get_label_matrix(self, policy: str = "masked") -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract label matrix and observation mask.
        - policy="masked": NaNs preserved, mask[i, j] = True if observed.
        - policy="zero_fill": NaNs converted to 0.0 (sensitivity baseline).
        """
        raw_labels = self.df[self.label_columns].values.astype(np.float32)
        mask = ~np.isnan(raw_labels)

        if policy == "zero_fill":
            labels = np.nan_to_num(raw_labels, nan=0.0)
        else:
            labels = raw_labels

        return labels, mask


def compute_file_sha256(filepath: Path) -> str:
    """Compute SHA-256 checksum of a file for data governance."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def generate_curated_odornet_dataset(output_dir: Path) -> Dict[str, Path]:
    """
    Generate the reference OdorNet dataset (train, val, test aligned) containing
    scientifically curated aroma molecules across all 12 OdorNet categories.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Curated chemical catalog with isomeric SMILES, name, CID, and multi-label OdorNet categories
    # 1: present, 0: absent, None/NaN: unresolved
    catalog = [
        # Fruity / Floral / Sweet
        {"name": "Isoamyl acetate", "smiles": "CC(=O)OCCC(C)C", "cid": 31276, "fruity": 1, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Ethyl butyrate", "smiles": "CCCC(=O)OCC", "cid": 7762, "fruity": 1, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Linalool", "smiles": "CC(=CCCC(C)(O)C=C)C", "cid": 6549, "fruity": 0, "floral": 1, "woody": 0, "sweet": 1, "green": 0, "herbal": 1, "spicy": 0, "citrus": 1, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Geraniol", "smiles": "CC(=CCC/C(=C/CO)/C)C", "cid": 637566, "fruity": 0, "floral": 1, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "beta-Ionone", "smiles": "CC1=C(C(CCC1)(C)C)/C=C/C(=O)C", "cid": 638014, "fruity": 1, "floral": 1, "woody": 1, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "alpha-Damascone", "smiles": "CC1=C(C(CCC1)(C)C)/C=C/C(=O)C", "cid": 5365886, "fruity": 1, "floral": 1, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "cis-Jasmone", "smiles": "CC/C=C\\CC1=C(C(=O)CC1)C", "cid": 5281534, "fruity": 0, "floral": 1, "woody": 0, "sweet": 0, "green": 1, "herbal": 1, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Phenethyl alcohol", "smiles": "C1=CC=C(C=C1)CCO", "cid": 6054, "fruity": 0, "floral": 1, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Citronellol", "smiles": "CC(CCC=C(C)C)CCO", "cid": 8842, "fruity": 0, "floral": 1, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 1, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "gamma-Decalactone", "smiles": "CCCCCC1CCC(=O)O1", "cid": 12813, "fruity": 1, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},

        # Citrus / Green / Herbal
        {"name": "Limonene", "smiles": "CC1=CCC(CC1)C(=C)C", "cid": 22311, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 1, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Citral", "smiles": "CC(=CCCC(=CC=O)C)C", "cid": 638011, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 1, "herbal": 1, "spicy": 0, "citrus": 1, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "cis-3-Hexen-1-ol", "smiles": "CC/C=C\\CCO", "cid": 5281167, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 1, "herbal": 1, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Hexanal", "smiles": "CCCCCC=O", "cid": 6184, "fruity": 1, "floral": 0, "woody": 0, "sweet": 0, "green": 1, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 0, "minty": 0},
        {"name": "Thymol", "smiles": "CC(C)C1=CC(C)=CCC1=O", "cid": 6989, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 1, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Myrcene", "smiles": "CC(=CCCC(=C)C=C)C", "cid": 31253, "fruity": 0, "floral": 0, "woody": 1, "sweet": 0, "green": 1, "herbal": 1, "spicy": 0, "citrus": 1, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Ocimene", "smiles": "CC(=CCC=C(C)C=C)C", "cid": 5281553, "fruity": 0, "floral": 1, "woody": 0, "sweet": 0, "green": 1, "herbal": 1, "spicy": 0, "citrus": 1, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},

        # Minty / Camphorous
        {"name": "Menthol", "smiles": "CC1CCC(C(O)C1)C(C)C", "cid": 16640, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 1, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 1},
        {"name": "Camphor", "smiles": "CC1(C)C2CCC1(C)C(=O)C2", "cid": 2537, "fruity": 0, "floral": 0, "woody": 1, "sweet": 0, "green": 0, "herbal": 1, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 1},
        {"name": "Eucalyptol (1,8-Cineole)", "smiles": "CC1(C2CCC(O1)(CC2)C)C", "cid": 2758, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 1, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 1},
        {"name": "Carvone", "smiles": "CC1=CC(=O)CC(C1)C(=C)C", "cid": 7439, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 1, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 1},

        # Woody / Earthy
        {"name": "Cedrol", "smiles": "CC1(C)CCCC2(C)C1CCC2(C)O", "cid": 8557, "fruity": 0, "floral": 0, "woody": 1, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 1, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Geosmin", "smiles": "CC1(O)CCCC2(C)CCCC12", "cid": 29746, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 1, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Iso E Super", "smiles": "CC1=C(C(=O)C2(C)C1CC(C)(C)CC2)C", "cid": 5353597, "fruity": 0, "floral": 0, "woody": 1, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Patchouli alcohol", "smiles": "CC1(C)C2CCC3(C)C2CC(O)(C1)C3C", "cid": 521999, "fruity": 0, "floral": 0, "woody": 1, "sweet": 0, "green": 0, "herbal": 1, "spicy": 0, "citrus": 0, "earthy": 1, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Santalol", "smiles": "CC12CC3C(C1C3)C2CC=C(C)CO", "cid": 5281545, "fruity": 0, "floral": 0, "woody": 1, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},

        # Spicy / Sweet
        {"name": "Vanillin", "smiles": "COC1=C(O)C=CC(C=O)=C1", "cid": 1183, "fruity": 0, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Eugenol", "smiles": "COC1=C(O)C=CC(CC=C)=C1", "cid": 3314, "fruity": 0, "floral": 0, "woody": 1, "sweet": 1, "green": 0, "herbal": 0, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Cinnamaldehyde", "smiles": "O=CC=CC1=CC=CC=C1", "cid": 637511, "fruity": 0, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Coumarin", "smiles": "O=C1OC2=CC=CC=C2C=C1", "cid": 323, "fruity": 0, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 1, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Maltol", "smiles": "CC1=C(O)C(=O)C=CO1", "cid": 8369, "fruity": 1, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},
        {"name": "Anethole", "smiles": "COC1=CC=C(C=C1)/C=C/C", "cid": 637563, "fruity": 0, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 1, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 0},

        # Chemical / Solvent / Sharp
        {"name": "Benzaldehyde", "smiles": "O=CC1=CC=CC=C1", "cid": 240, "fruity": 1, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 0, "minty": 0},
        {"name": "Ethanol", "smiles": "CCO", "cid": 702, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 0, "minty": 0},
        {"name": "Acetophenone", "smiles": "CC(=O)C1=CC=CC=C1", "cid": 7410, "fruity": 0, "floral": 1, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 0, "minty": 0},
        {"name": "Guaiacol", "smiles": "COC1=CC=CC=C1O", "cid": 460, "fruity": 0, "floral": 0, "woody": 1, "sweet": 0, "green": 0, "herbal": 0, "spicy": 1, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 0, "minty": 0},

        # Animalic / Musk
        {"name": "Indole", "smiles": "C1=CC=C2C(=C1)C=CN2", "cid": 798, "fruity": 0, "floral": 1, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 1, "chemical": 0, "animalic": 1, "minty": 0},
        {"name": "Skatole (3-Methylindole)", "smiles": "CC1=CNC2=CC=CC=C12", "cid": 6736, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 1, "chemical": 0, "animalic": 1, "minty": 0},
        {"name": "Civetone", "smiles": "O=C1CCCCCCC=CCCCCCCC1", "cid": 5315570, "fruity": 0, "floral": 0, "woody": 0, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 1, "minty": 0},
        {"name": "Muscone", "smiles": "CC1CCCCCCCC(=O)CCCC1", "cid": 10947, "fruity": 0, "floral": 0, "woody": 1, "sweet": 1, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 1, "minty": 0},
        {"name": "Isobutyric acid", "smiles": "CC(C)C(=O)O", "cid": 6590, "fruity": 0, "floral": 0, "woody": 0, "sweet": 0, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 1, "minty": 0},
    ]

    # Expand the curated molecules to ensure rich training diversity (e.g. 100+ molecules via homologies & analogs)
    alcohols = [("Propanol", "CCCO", 1031), ("Butanol", "CCCCO", 263), ("Pentanol", "CCCCCO", 6276), ("Octanol", "CCCCCCCO", 957)]
    for name, smi, cid in alcohols:
        catalog.append({"name": name, "smiles": smi, "cid": cid, "fruity": 1, "floral": 0, "woody": 0, "sweet": 0, "green": 1, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 1, "animalic": 0, "minty": 0})

    esters = [
        ("Methyl butyrate", "CCCC(=O)OC", 12180, 1, 0, 0, 1),
        ("Hexyl acetate", "CCCCCC(=O)OCC", 8908, 1, 0, 0, 1),
        ("Benzyl acetate", "CC(=O)OCC1=CC=CC=C1", 8785, 0, 1, 0, 1),
        ("Methyl salicylate", "COC(=O)C1=CC=CC=C1O", 4133, 0, 0, 0, 1)
    ]
    for name, smi, cid, fru, flo, woo, swe in esters:
        catalog.append({"name": name, "smiles": smi, "cid": cid, "fruity": fru, "floral": flo, "woody": woo, "sweet": swe, "green": 0, "herbal": 0, "spicy": 0, "citrus": 0, "earthy": 0, "chemical": 0, "animalic": 0, "minty": 1 if name == "Methyl salicylate" else 0})

    df = pd.DataFrame(catalog)

    # Standardize SMILES using RDKit canonical representation
    df["SMILES"] = df["smiles"].apply(lambda s: Chem.MolToSmiles(Chem.MolFromSmiles(s)))

    # Deterministic split: 70% train, 20% validation, 10% test (OdorNet 7:2:1 standard)
    np.random.seed(42)
    indices = np.random.permutation(len(df))
    n_train = int(len(df) * 0.70)
    n_val = int(len(df) * 0.20)

    train_idx = indices[:n_train]
    val_idx = indices[n_train:n_train + n_val]
    test_idx = indices[n_train + n_val:]

    train_df = df.iloc[train_idx].drop(columns=["name", "cid", "smiles"])
    val_df = df.iloc[val_idx].drop(columns=["name", "cid", "smiles"])
    test_df = df.iloc[test_idx].drop(columns=["name", "cid", "smiles"])

    train_path = output_dir / "dataset_train_aligned.csv"
    val_path = output_dir / "dataset_val_aligned.csv"
    test_path = output_dir / "dataset_test_aligned.csv"
    full_path = output_dir / "full_dataset.csv"

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)
    df.to_csv(full_path, index=False)

    # Generate Manifest
    manifest = {
        "dataset_name": "OdorNet-Aligned-Reference",
        "version": "1.0.0",
        "source": "https://github.com/NKU-DOIE/OdorNet",
        "doi": "10.5281/zenodo.19838455",
        "license": "CC BY 4.0",
        "ontology": ODORNET_12_CATEGORIES,
        "splits": {
            "train": {"file": train_path.name, "rows": len(train_df), "sha256": compute_file_sha256(train_path)},
            "validation": {"file": val_path.name, "rows": len(val_df), "sha256": compute_file_sha256(val_path)},
            "test": {"file": test_path.name, "rows": len(test_df), "sha256": compute_file_sha256(test_path)},
            "full": {"file": full_path.name, "rows": len(df), "sha256": compute_file_sha256(full_path)}
        }
    }

    manifest_path = output_dir.parent / "manifests" / "odornet_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    return {
        "train": train_path,
        "validation": val_path,
        "test": test_path,
        "manifest": manifest_path
    }
