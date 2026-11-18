"""3D conformer generation and coordinate extraction for WebGL / Three.js visualization."""

from typing import Dict, Any, List
from rdkit import Chem
from rdkit.Chem import AllChem


# Standard CPK element colors in Hex for 3D rendering
ELEMENT_COLORS = {
    'H': '#FFFFFF',
    'C': '#333333',
    'N': '#3050F8',
    'O': '#FF0D0D',
    'F': '#90E050',
    'Cl': '#1FF01F',
    'Br': '#A62929',
    'I': '#940094',
    'P': '#FF8000',
    'S': '#FFFF30',
    'B': '#FFB5B5',
    'Si': '#F0C8A0'
}

# Approximate van der Waals radii in Angstroms
VDW_RADII = {
    'H': 1.20,
    'C': 1.70,
    'N': 1.55,
    'O': 1.52,
    'F': 1.47,
    'Cl': 1.75,
    'Br': 1.85,
    'I': 1.98,
    'P': 1.80,
    'S': 1.80
}


def generate_3d_coordinates(mol: Chem.Mol, max_attempts: int = 50) -> Dict[str, Any]:
    """
    Generate 3D coordinates for a molecule using ETKDG and MMFF optimization.
    Returns atom positions, element types, radii, colors, and bond connectivity.
    """
    mol_3d = Chem.AddHs(mol)
    params = AllChem.ETKDGv3()
    params.randomSeed = 42

    conf_id = AllChem.EmbedMolecule(mol_3d, params)
    if conf_id == -1:
        # Fallback to random coordinates if distance geometry fails
        AllChem.EmbedMolecule(mol_3d, useRandomCoords=True, maxAttempts=max_attempts)

    # Attempt MMFF force-field optimization
    try:
        AllChem.MMFFOptimizeMolecule(mol_3d, maxIters=200)
    except Exception:
        try:
            AllChem.UFFOptimizeMolecule(mol_3d, maxIters=200)
        except Exception:
            pass

    conf = mol_3d.GetConformer()
    atoms: List[Dict[str, Any]] = []

    for atom in mol_3d.GetAtoms():
        idx = atom.GetIdx()
        pos = conf.GetAtomPosition(idx)
        sym = atom.GetSymbol()
        atoms.append({
            "idx": idx,
            "element": sym,
            "x": round(float(pos.x), 4),
            "y": round(float(pos.y), 4),
            "z": round(float(pos.z), 4),
            "color": ELEMENT_COLORS.get(sym, '#808080'),
            "radius": VDW_RADII.get(sym, 1.5) * 0.35  # scaled for ball-and-stick
        })

    bonds: List[Dict[str, Any]] = []
    for bond in mol_3d.GetBonds():
        bonds.append({
            "source": bond.GetBeginAtomIdx(),
            "target": bond.GetEndAtomIdx(),
            "order": float(bond.GetBondTypeAsDouble())
        })

    return {
        "status": "generated",
        "method": "RDKit ETKDGv3 + MMFF94",
        "is_experimental_structure": False,
        "atoms": atoms,
        "bonds": bonds,
        "num_atoms": len(atoms),
        "num_bonds": len(bonds)
    }
