"""Molecular validation, standardization, and stereochemistry detection using RDKit."""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors
try:
    from rdkit.Chem.inchi import MolToInchi, MolToInchiKey
except ImportError:
    MolToInchi = None
    MolToInchiKey = None


@dataclass
class ValidationResult:
    is_valid: bool
    error_message: Optional[str] = None
    canonical_smiles: Optional[str] = None
    isomeric_smiles: Optional[str] = None
    inchi: Optional[str] = None
    inchikey: Optional[str] = None
    formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    num_atoms: int = 0
    num_heavy_atoms: int = 0
    has_stereochemistry: bool = False
    chiral_centers: List[Dict[str, Any]] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


def validate_and_standardize_smiles(smiles: str) -> ValidationResult:
    """
    Validate, sanitize, and extract chemical properties from a SMILES string.
    Identifies stereocenters, charges, and standardizes representation.
    """
    if not smiles or not isinstance(smiles, str) or not smiles.strip():
        return ValidationResult(is_valid=False, error_message="Empty or invalid SMILES string provided.")

    smiles = smiles.strip()

    try:
        mol = Chem.MolFromSmiles(smiles)
    except Exception as e:
        return ValidationResult(is_valid=False, error_message=f"RDKit parser exception: {str(e)}")

    if mol is None:
        return ValidationResult(
            is_valid=False,
            error_message="Invalid chemical syntax: molecule could not be parsed or sanitized by RDKit."
        )

    warnings: List[str] = []

    # Check for disconnected components / salts
    frags = Chem.GetMolFrags(mol, asMols=True)
    if len(frags) > 1:
        warnings.append(f"Molecule contains {len(frags)} disconnected fragments (e.g. counterion or mixture). Primary fragment retained for property calculation.")
        # Retain largest fragment
        mol = max(frags, key=lambda m: m.GetNumHeavyAtoms())

    # Detect stereochemistry
    chiral_centers_raw = Chem.FindMolChiralCenters(mol, includeUnassigned=True)
    chiral_centers = []
    unassigned_centers = 0

    for idx, tag in chiral_centers_raw:
        atom = mol.GetAtomWithIdx(idx)
        chiral_centers.append({
            "atom_idx": idx,
            "element": atom.GetSymbol(),
            "assignment": tag  # 'R', 'S', or '?'
        })
        if tag == '?':
            unassigned_centers += 1

    has_stereochemistry = len(chiral_centers) > 0
    if unassigned_centers > 0:
        warnings.append(
            f"Molecule contains {unassigned_centers} unassigned stereocenter(s). Specific enantiomeric odor perception may differ."
        )

    # Stereochemistry awareness: canonical SMILES (without stereochem) vs isomeric SMILES (with stereochem)
    canonical_smiles = Chem.MolToSmiles(mol, isomericSmiles=False)
    isomeric_smiles = Chem.MolToSmiles(mol, isomericSmiles=True)

    # InChI and InChIKey
    try:
        inchi_str = MolToInchi(mol) if MolToInchi else None
        inchikey_str = MolToInchiKey(mol) if MolToInchiKey else None
    except Exception:
        inchi_str = None
        inchikey_str = None

    # Properties
    formula = rdMolDescriptors.CalcMolFormula(mol)
    mw = round(Descriptors.MolWt(mol), 3)
    num_atoms = mol.GetNumAtoms()
    num_heavy_atoms = mol.GetNumHeavyAtoms()

    return ValidationResult(
        is_valid=True,
        canonical_smiles=canonical_smiles,
        isomeric_smiles=isomeric_smiles,
        inchi=inchi_str,
        inchikey=inchikey_str,
        formula=formula,
        molecular_weight=mw,
        num_atoms=num_atoms,
        num_heavy_atoms=num_heavy_atoms,
        has_stereochemistry=has_stereochemistry,
        chiral_centers=chiral_centers,
        warnings=warnings
    )
