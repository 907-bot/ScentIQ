"""Molecular featurization: physicochemical descriptors, Morgan fingerprints, and graph representations."""

from typing import Dict, Any, Tuple, List, Optional
import numpy as np
from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem, rdMolDescriptors
import torch


def compute_physicochemical_descriptors(mol: Chem.Mol) -> Dict[str, float]:
    """Compute standard RDKit physicochemical descriptors."""
    return {
        "molecular_weight": round(float(Descriptors.MolWt(mol)), 3),
        "logp": round(float(Descriptors.MolLogP(mol)), 3),
        "tpsa": round(float(Descriptors.TPSA(mol)), 2),
        "hbd": int(Descriptors.NumHDonors(mol)),
        "hba": int(Descriptors.NumHAcceptors(mol)),
        "rotatable_bonds": int(Descriptors.NumRotatableBonds(mol)),
        "aromatic_rings": int(rdMolDescriptors.CalcNumAromaticRings(mol)),
        "fraction_csp3": round(float(Descriptors.FractionCSP3(mol)), 3),
        "heavy_atom_count": int(mol.GetNumHeavyAtoms()),
        "molar_refractivity": round(float(Descriptors.MolMR(mol)), 2)
    }


def compute_morgan_fingerprint(
    mol: Chem.Mol, radius: int = 2, n_bits: int = 2048, as_numpy: bool = True
) -> Any:
    """Generate Morgan fingerprint (ECFP4 equivalent for radius=2)."""
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=n_bits)
    if as_numpy:
        arr = np.zeros((n_bits,), dtype=np.float32)
        from rdkit.DataStructs import ConvertToNumpyArray
        ConvertToNumpyArray(fp, arr)
        return arr
    return fp


def compute_combined_feature_vector(
    mol: Chem.Mol, n_bits: int = 2048
) -> np.ndarray:
    """Combine Morgan fingerprint with normalized physicochemical descriptors for tabular models."""
    fp = compute_morgan_fingerprint(mol, radius=2, n_bits=n_bits, as_numpy=True)
    desc = compute_physicochemical_descriptors(mol)
    desc_vector = np.array([
        desc["molecular_weight"] / 500.0,
        (desc["logp"] + 5.0) / 15.0,
        desc["tpsa"] / 200.0,
        desc["hbd"] / 10.0,
        desc["hba"] / 15.0,
        desc["rotatable_bonds"] / 20.0,
        desc["aromatic_rings"] / 5.0,
        desc["fraction_csp3"],
        desc["heavy_atom_count"] / 50.0,
        desc["molar_refractivity"] / 150.0
    ], dtype=np.float32)
    return np.concatenate([fp, desc_vector])


# Supported atomic symbols for GNN one-hot
ALLOWED_ATOMS = ['C', 'N', 'O', 'S', 'F', 'P', 'Cl', 'Br', 'I', 'H', 'Unknown']
ALLOWED_HYBRIDIZATIONS = [
    Chem.rdchem.HybridizationType.SP,
    Chem.rdchem.HybridizationType.SP2,
    Chem.rdchem.HybridizationType.SP3,
    Chem.rdchem.HybridizationType.SP3D,
    Chem.rdchem.HybridizationType.SP3D2,
    'Other'
]


def atom_to_feature_vector(atom: Chem.Atom) -> List[float]:
    """Convert an RDKit Atom object into a feature vector."""
    symbol = atom.GetSymbol()
    sym_idx = ALLOWED_ATOMS.index(symbol) if symbol in ALLOWED_ATOMS else len(ALLOWED_ATOMS) - 1
    sym_onehot = [1.0 if i == sym_idx else 0.0 for i in range(len(ALLOWED_ATOMS))]

    deg = atom.GetTotalDegree()
    deg_onehot = [1.0 if deg == i else 0.0 for i in range(6)]

    charge = float(atom.GetFormalCharge())
    num_h = float(atom.GetTotalNumHs())
    is_aromatic = 1.0 if atom.GetIsAromatic() else 0.0
    is_in_ring = 1.0 if atom.IsInRing() else 0.0

    hyb = atom.GetHybridization()
    hyb_idx = ALLOWED_HYBRIDIZATIONS.index(hyb) if hyb in ALLOWED_HYBRIDIZATIONS else len(ALLOWED_HYBRIDIZATIONS) - 1
    hyb_onehot = [1.0 if i == hyb_idx else 0.0 for i in range(len(ALLOWED_HYBRIDIZATIONS))]

    chirality = atom.GetChiralTag()
    chiral_val = [
        1.0 if chirality == Chem.rdchem.ChiralType.CHI_TETRAHEDRAL_CW else 0.0,
        1.0 if chirality == Chem.rdchem.ChiralType.CHI_TETRAHEDRAL_CCW else 0.0,
    ]

    return sym_onehot + deg_onehot + [charge, num_h, is_aromatic, is_in_ring] + hyb_onehot + chiral_val


def bond_to_feature_vector(bond: Chem.Bond) -> List[float]:
    """Convert an RDKit Bond object into a feature vector."""
    bt = bond.GetBondType()
    btype_onehot = [
        1.0 if bt == Chem.rdchem.BondType.SINGLE else 0.0,
        1.0 if bt == Chem.rdchem.BondType.DOUBLE else 0.0,
        1.0 if bt == Chem.rdchem.BondType.TRIPLE else 0.0,
        1.0 if bt == Chem.rdchem.BondType.AROMATIC else 0.0,
    ]
    is_conjugated = 1.0 if bond.GetIsConjugated() else 0.0
    is_in_ring = 1.0 if bond.IsInRing() else 0.0
    stereo = bond.GetStereo()
    stereo_onehot = [
        1.0 if stereo == Chem.rdchem.BondStereo.STEREONONE else 0.0,
        1.0 if stereo in (Chem.rdchem.BondStereo.STEREOE, Chem.rdchem.BondStereo.STEREOTRANS) else 0.0,
        1.0 if stereo in (Chem.rdchem.BondStereo.STEREOZ, Chem.rdchem.BondStereo.STEREOCIS) else 0.0,
    ]
    return btype_onehot + [is_conjugated, is_in_ring] + stereo_onehot


def mol_to_graph_data(mol: Chem.Mol) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    """
    Convert RDKit Mol to PyTorch graph tensors:
    - x: Atom node features [num_atoms, atom_feature_dim]
    - edge_index: Graph connectivity [2, 2 * num_bonds]
    - edge_attr: Bond features [2 * num_bonds, bond_feature_dim]
    """
    atom_features = [atom_to_feature_vector(atom) for atom in mol.GetAtoms()]
    x = torch.tensor(atom_features, dtype=torch.float32)

    edge_indices = []
    edge_features = []

    for bond in mol.GetBonds():
        i = bond.GetBeginAtomIdx()
        j = bond.GetEndAtomIdx()
        feat = bond_to_feature_vector(bond)

        # Undirected graph: add both directions
        edge_indices.append([i, j])
        edge_features.append(feat)
        edge_indices.append([j, i])
        edge_features.append(feat)

    if len(edge_indices) == 0:
        edge_index = torch.zeros((2, 0), dtype=torch.long)
        edge_attr = torch.zeros((0, 9), dtype=torch.float32)
    else:
        edge_index = torch.tensor(edge_indices, dtype=torch.long).t().contiguous()
        edge_attr = torch.tensor(edge_features, dtype=torch.float32)

    return x, edge_index, edge_attr
