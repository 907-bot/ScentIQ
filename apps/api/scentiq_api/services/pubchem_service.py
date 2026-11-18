"""PubChem resolution service with in-memory caching and offline fallback catalog."""

import urllib.parse
from typing import Optional, Dict, Any
import httpx

# Fast offline fallback library of standard flavor & fragrance chemicals
KNOWN_COMPOUNDS: Dict[str, Dict[str, Any]] = {
    "ethanol": {"name": "Ethanol", "cid": 702, "smiles": "CCO", "formula": "C2H6O", "molecular_weight": 46.07},
    "vanillin": {"name": "Vanillin", "cid": 1183, "smiles": "COC1=C(O)C=CC(C=O)=C1", "formula": "C8H8O3", "molecular_weight": 152.15},
    "limonene": {"name": "Limonene", "cid": 22311, "smiles": "CC1=CCC(CC1)C(=C)C", "formula": "C10H16", "molecular_weight": 136.23},
    "linalool": {"name": "Linalool", "cid": 6549, "smiles": "CC(=CCCC(C)(O)C=C)C", "formula": "C10H18O", "molecular_weight": 154.25},
    "benzaldehyde": {"name": "Benzaldehyde", "cid": 240, "smiles": "O=CC1=CC=CC=C1", "formula": "C7H6O", "molecular_weight": 106.12},
    "eugenol": {"name": "Eugenol", "cid": 3314, "smiles": "COC1=C(O)C=CC(CC=C)=C1", "formula": "C10H12O2", "molecular_weight": 164.20},
    "geraniol": {"name": "Geraniol", "cid": 637566, "smiles": "CC(=CCC/C(=C/CO)/C)C", "formula": "C10H18O", "molecular_weight": 154.25},
    "menthol": {"name": "Menthol", "cid": 16640, "smiles": "CC1CCC(C(O)C1)C(C)C", "formula": "C10H20O", "molecular_weight": 156.27},
    "camphor": {"name": "Camphor", "cid": 2537, "smiles": "CC1(C)C2CCC1(C)C(=O)C2", "formula": "C10H16O", "molecular_weight": 152.23},
    "cinnamaldehyde": {"name": "Cinnamaldehyde", "cid": 637511, "smiles": "O=CC=CC1=CC=CC=C1", "formula": "C9H8O", "molecular_weight": 132.16},
    "beta-ionone": {"name": "beta-Ionone", "cid": 638014, "smiles": "CC1=C(C(CCC1)(C)C)/C=C/C(=O)C", "formula": "C13H20O", "molecular_weight": 192.30},
    "isoamyl acetate": {"name": "Isoamyl acetate", "cid": 31276, "smiles": "CC(=O)OCCC(C)C", "formula": "C7H14O2", "molecular_weight": 130.18},
    "coumarin": {"name": "Coumarin", "cid": 323, "smiles": "O=C1OC2=CC=CC=C2C=C1", "formula": "C9H6O2", "molecular_weight": 146.14},
    "indole": {"name": "Indole", "cid": 798, "smiles": "C1=CC=C2C(=C1)C=CN2", "formula": "C8H7N", "molecular_weight": 117.15},
    "civetone": {"name": "Civetone", "cid": 5315570, "smiles": "O=C1CCCCCCC=CCCCCCCC1", "formula": "C17H30O", "molecular_weight": 250.42},
    "geosmin": {"name": "Geosmin", "cid": 29746, "smiles": "CC1(O)CCCC2(C)CCCC12", "formula": "C12H22O", "molecular_weight": 182.30},
    "eucalyptol": {"name": "Eucalyptol", "cid": 2758, "smiles": "CC1(C2CCC(O1)(CC2)C)C", "formula": "C10H18O", "molecular_weight": 154.25},
    "ethyl butyrate": {"name": "Ethyl butyrate", "cid": 7762, "smiles": "CCCC(=O)OCC", "formula": "C6H12O2", "molecular_weight": 116.16},
    "damascone": {"name": "alpha-Damascone", "cid": 5365886, "smiles": "CC1=C(C(CCC1)(C)C)/C=C/C(=O)C", "formula": "C13H20O", "molecular_weight": 192.30},
    "thymol": {"name": "Thymol", "cid": 6989, "smiles": "CC(C)C1=CC(C)=CCC1=O", "formula": "C10H14O", "molecular_weight": 150.22}
}


class PubChemService:
    """Async PubChem resolution service with timeout, cache, and graceful fallback."""

    def __init__(self, base_url: str = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"):
        self.base_url = base_url
        self.cache: Dict[str, Dict[str, Any]] = {}

    async def resolve_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        clean_name = name.strip().lower()
        if clean_name in self.cache:
            return self.cache[clean_name]

        # Check offline catalog first
        if clean_name in KNOWN_COMPOUNDS:
            res = KNOWN_COMPOUNDS[clean_name]
            self.cache[clean_name] = res
            return res

        # Attempt remote PubChem REST call
        encoded = urllib.parse.quote(name.strip())
        url = f"{self.base_url}/compound/name/{encoded}/property/MolecularFormula,MolecularWeight,ConnectivitySMILES,IsomericSMILES,IUPACName/JSON"

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, headers={"Accept": "application/json"})
                if resp.status_code == 200:
                    payload = resp.json()
                    props = payload.get("PropertyTable", {}).get("Properties", [])
                    if props:
                        p = props[0]
                        smi = p.get("IsomericSMILES") or p.get("ConnectivitySMILES")
                        result = {
                            "name": p.get("IUPACName") or name,
                            "cid": p.get("CID"),
                            "smiles": smi,
                            "formula": p.get("MolecularFormula"),
                            "molecular_weight": float(p.get("MolecularWeight", 0.0))
                        }
                        self.cache[clean_name] = result
                        return result
        except Exception:
            # Silent fallback if offline or request timed out
            pass

        return None
