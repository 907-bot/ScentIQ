"""2D molecular depiction with RDKit SVG generation and atom/bond highlighting."""

from typing import List, Optional, Dict
from rdkit import Chem
from rdkit.Chem.Draw import rdMolDraw2D


def mol_to_svg(
    mol: Chem.Mol,
    width: int = 400,
    height: int = 300,
    highlight_atoms: Optional[List[int]] = None,
    highlight_atom_colors: Optional[Dict[int, tuple]] = None,
    highlight_bonds: Optional[List[int]] = None,
    highlight_bond_colors: Optional[Dict[int, tuple]] = None,
) -> str:
    """
    Render an RDKit Mol to an SVG string.
    Supports coloring atoms/bonds for explainability attribution heatmaps.
    """
    drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
    draw_options = drawer.drawOptions()
    draw_options.clearBackground = False
    draw_options.addStereoAnnotation = True
    draw_options.bondLineWidth = 2

    # Prepare molecule with 2D coordinates
    mol_copy = Chem.Mol(mol)
    rdMolDraw2D.PrepareMolForDrawing(mol_copy)

    if highlight_atoms or highlight_atom_colors:
        atoms = highlight_atoms if highlight_atoms is not None else list(highlight_atom_colors.keys())
        colors = highlight_atom_colors if highlight_atom_colors is not None else {}
        bonds = highlight_bonds if highlight_bonds is not None else []
        bcolors = highlight_bond_colors if highlight_bond_colors is not None else {}
        drawer.DrawMolecule(
            mol_copy,
            highlightAtoms=atoms,
            highlightAtomColors=colors,
            highlightBonds=bonds,
            highlightBondColors=bcolors
        )
    else:
        drawer.DrawMolecule(mol_copy)

    drawer.FinishDrawing()
    svg = drawer.GetDrawingText()
    return svg


def smiles_to_svg(smiles: str, width: int = 400, height: int = 300) -> Optional[str]:
    """Helper to convert SMILES directly to SVG string."""
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    return mol_to_svg(mol, width, height)
