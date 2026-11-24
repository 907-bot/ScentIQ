import {
  Molecule,
  SinglePrediction,
  BlendPredictionResponse,
  SimilarityResult,
  CompareResponse,
  OdorMapData,
  ModelMetadata,
  DatasetMetadata,
  BlendComponentInput
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://scentiq.onrender.com/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error?.message || errorBody?.detail || `API request failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  async resolveMolecule(query: string, inputType: string = 'auto'): Promise<Molecule> {
    const res = await fetch(`${API_BASE}/molecules/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, input_type: inputType })
    });
    return handleResponse<Molecule>(res);
  },

  async validateMolecule(smiles: string, name?: string): Promise<Molecule> {
    const res = await fetch(`${API_BASE}/molecules/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles, name })
    });
    return handleResponse<Molecule>(res);
  },

  async predictMolecule(payload: {
    smiles?: string;
    molecule_id?: string;
    model_id?: string;
    top_k?: number;
    include_explanation?: boolean;
    explanation_target_label?: string;
  }): Promise<SinglePrediction> {
    const res = await fetch(`${API_BASE}/predictions/single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: 'scentiq-odornet-gnn',
        top_k: 12,
        include_explanation: true,
        ...payload
      })
    });
    return handleResponse<SinglePrediction>(res);
  },

  async predictBlend(components: BlendComponentInput[], concentrationBasis: string = 'mole_fraction'): Promise<BlendPredictionResponse> {
    const res = await fetch(`${API_BASE}/predictions/blend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        components,
        model_id: 'scentiq-mixture-prototype',
        concentration_basis: concentrationBasis
      })
    });
    return handleResponse<BlendPredictionResponse>(res);
  },

  async searchSimilarity(smiles: string, method: string = 'chemical_fingerprint', topK: number = 6): Promise<SimilarityResult> {
    const res = await fetch(`${API_BASE}/similarity/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles, method, top_k: topK })
    });
    return handleResponse<SimilarityResult>(res);
  },

  async compareMolecules(smilesList: string[]): Promise<CompareResponse> {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles_list: smilesList })
    });
    return handleResponse<CompareResponse>(res);
  },

  async getOdorMap(dimension: number = 2): Promise<OdorMapData> {
    const res = await fetch(`${API_BASE}/odor-map?dimension=${dimension}`);
    return handleResponse<OdorMapData>(res);
  },

  async getModels(): Promise<ModelMetadata[]> {
    const res = await fetch(`${API_BASE}/models`);
    return handleResponse<ModelMetadata[]>(res);
  },

  async getDatasets(): Promise<DatasetMetadata[]> {
    const res = await fetch(`${API_BASE}/datasets`);
    const data = await handleResponse<{ datasets: DatasetMetadata[] }>(res);
    return data.datasets;
  },

  async createReport(moleculeId: string, predictionId: string, title?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        molecule_id: moleculeId,
        prediction_id: predictionId,
        report_title: title
      })
    });
    return handleResponse<any>(res);
  }
};
