export interface MoleculeDescriptors {
  molecular_weight: number;
  logp: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotatable_bonds: number;
  aromatic_rings: number;
  fraction_csp3: number;
  heavy_atom_count: number;
  molar_refractivity: number;
}

export interface ChiralCenter {
  atom_idx: number;
  element: string;
  assignment: string;
}

export interface ConformerAtom {
  idx: number;
  element: string;
  x: number;
  y: number;
  z: number;
  color: string;
  radius: number;
}

export interface ConformerBond {
  source: number;
  target: number;
  order: number;
}

export interface ConformerCoordinates {
  status: string;
  method: string;
  is_experimental_structure: boolean;
  atoms: ConformerAtom[];
  bonds: ConformerBond[];
  num_atoms: number;
  num_bonds: number;
}

export interface Molecule {
  molecule_id: string;
  name: string;
  pubchem_cid: number | null;
  original_input: string;
  canonical_smiles: string;
  isomeric_smiles: string;
  inchi: string | null;
  inchikey: string | null;
  formula: string;
  molecular_weight: number;
  validation_status: string;
  has_stereochemistry: boolean;
  chiral_centers: ChiralCenter[];
  warnings: string[];
  descriptors?: MoleculeDescriptors;
  svg_2d?: string;
  coordinates_3d?: ConformerCoordinates;
  source: string;
}

export interface OdorScore {
  label: string;
  score: number;
  calibrated_probability: number | null;
  category_archetype?: string;
  color?: string;
}

export interface AtomAttribution {
  atom_idx: number;
  element: string;
  salience: number;
  role: string;
}

export interface ExplanationInfo {
  status: string;
  target_label: string;
  method: string;
  atom_attributions: AtomAttribution[];
  highlighted_svg?: string;
  disclaimer: string;
}

export interface UncertaintyInfo {
  status: string;
  ood_flag: boolean;
  max_training_tanimoto: number;
  message: string;
}

export interface SinglePrediction {
  prediction_id: string;
  molecule_id: string;
  canonical_smiles: string;
  task: string;
  model: {
    id: string;
    name: string;
    version: string;
    task: string;
  };
  dataset: {
    name: string;
    version: string;
    doi?: string;
  };
  predictions: OdorScore[];
  dominant_category: string;
  uncertainty: UncertaintyInfo;
  explanation?: ExplanationInfo;
  limitations: string[];
  created_at: string;
}

export interface NeighborItem {
  name: string;
  smiles: string;
  cid: number | null;
  similarity_score: number;
  similarity_metric: string;
  method: string;
  svg?: string;
}

export interface SimilarityResult {
  query_smiles: string;
  method: string;
  count: number;
  neighbors: NeighborItem[];
  method_disclaimer: string;
}

export interface OdorMapPoint {
  id: string;
  name: string;
  smiles: string;
  x: number;
  y: number;
  z?: number | null;
  dominant_odor: string;
  odor_color: string;
  scores: Record<string, number>;
}

export interface OdorMapData {
  dimension: number;
  projection_method: string;
  total_molecules: number;
  categories: string[];
  points: OdorMapPoint[];
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  task: string;
  dataset_name: string;
  dataset_version: string;
  status: string;
  description: string;
  supported_labels: string[];
  input_type: string;
  metrics: Record<string, number>;
  limitations: string[];
  model_card_url: string;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  version: string;
  source_url: string;
  doi?: string;
  license: string;
  molecule_count: number;
  categories_count: number;
  description: string;
  ontology: string[];
  split_info: Record<string, any>;
  data_card_url: string;
}

export interface BlendComponentInput {
  smiles: string;
  fraction: number;
  name?: string;
}

export interface BlendPredictionResponse {
  prediction_id: string;
  status: string;
  model_id: string;
  concentration_basis: string;
  components: Array<{
    smiles: string;
    name: string;
    fraction: number;
    isolated_scores: Record<string, number>;
  }>;
  predicted_blend_profile: OdorScore[];
  dominant_category: string;
  scientific_warning: string;
  created_at: string;
}

export interface CompareMoleculeItem {
  smiles: string;
  name: string;
  formula: string;
  molecular_weight: number;
  svg: string;
  descriptors: Record<string, any>;
  odor_scores: Record<string, number>;
  dominant_odor: string;
}

export interface CompareResponse {
  molecules: CompareMoleculeItem[];
  pairwise_chemical_tanimoto: Record<string, number>;
  pairwise_odor_similarity: Record<string, number>;
  delta_descriptors: Record<string, Record<string, number>>;
}
