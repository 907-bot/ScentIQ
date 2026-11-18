"""Odor ontology definitions and label mappings for ScentIQ."""

from typing import Dict, List, Any

# OdorNet's 12 primary odor categories
ODORNET_12_CATEGORIES = [
    "fruity",
    "floral",
    "woody",
    "sweet",
    "green",
    "herbal",
    "spicy",
    "citrus",
    "earthy",
    "chemical",
    "animalic",
    "minty"
]

ODORNET_CATEGORY_METADATA: Dict[str, Dict[str, Any]] = {
    "fruity": {
        "description": "Sweet, fresh, ripe, or berry-like notes reminiscent of fruits (apple, berry, peach, banana).",
        "archetype": "Isoamyl acetate",
        "archetype_smiles": "CC(=O)OCCC(C)C",
        "color": "#F59E0B"
    },
    "floral": {
        "description": "Blossom and flower scents such as rose, jasmine, violet, and lavender.",
        "archetype": "Linalool",
        "archetype_smiles": "CC(=CCCC(C)(O)C=C)C",
        "color": "#EC4899"
    },
    "woody": {
        "description": "Dry, resinous, cedarwood, sandalwood, or pine aroma notes.",
        "archetype": "Cedrol",
        "archetype_smiles": "CC1(C)CCCC2(C)C1CCC2(C)O",
        "color": "#8B5CF6"
    },
    "sweet": {
        "description": "Caramel, vanillic, honey, balsamic, or confectionery sugary notes.",
        "archetype": "Vanillin",
        "archetype_smiles": "COC1=C(O)C=CC(C=O)=C1",
        "color": "#EF4444"
    },
    "green": {
        "description": "Freshly cut grass, crushed leaves, stems, or cucumber aroma.",
        "archetype": "cis-3-Hexen-1-ol",
        "archetype_smiles": "CC/C=C\\CCO",
        "color": "#10B981"
    },
    "herbal": {
        "description": "Aromatic culinary herbs such as rosemary, sage, basil, and thyme.",
        "archetype": "Thymol",
        "archetype_smiles": "CC(C)C1=CC(C)=CCC1=O",
        "color": "#059669"
    },
    "spicy": {
        "description": "Warm, pungent sensations reminiscent of clove, cinnamon, nutmeg, or pepper.",
        "archetype": "Eugenol",
        "archetype_smiles": "COC1=C(O)C=CC(CC=C)=C1",
        "color": "#D97706"
    },
    "citrus": {
        "description": "Zesty, sharp notes of lemon, lime, orange, grapefruit, and bergamot.",
        "archetype": "Limonene",
        "archetype_smiles": "CC1=CCC(CC1)C(=C)C",
        "color": "#FBBF24"
    },
    "earthy": {
        "description": "Damp soil, moss, mushroom, petrichor, or geosmin character.",
        "archetype": "Geosmin",
        "archetype_smiles": "CC1(O)CCCC2(C)CCCC12",
        "color": "#78350F"
    },
    "chemical": {
        "description": "Solvent, ethereal, medicinal, phenolic, or sharp industrial aromatic qualities.",
        "archetype": "Benzaldehyde",
        "archetype_smiles": "O=CC1=CC=CC=C1",
        "color": "#6B7280"
    },
    "animalic": {
        "description": "Musk, civet, leather, castoreum, or indole-like warm fecal notes.",
        "archetype": "Indole",
        "archetype_smiles": "C1=CC=C2C(=C1)C=CN2",
        "color": "#B45309"
    },
    "minty": {
        "description": "Cooling, refreshing, camphoraceous, peppermint, or spearmint notes.",
        "archetype": "Menthol",
        "archetype_smiles": "CC1CCC(C(O)C1)C(C)C",
        "color": "#06B6D4"
    }
}
