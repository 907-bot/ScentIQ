import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  RefreshCw,
  FlaskConical,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { CompareResponse } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const CompareLabPage: React.FC = () => {
  const [smilesList, setSmilesList] = useState<string[]>([
    'COC1=C(O)C=CC(C=O)=C1', // Vanillin
    'COC1=C(O)C=CC(CC=C)=C1'  // Eugenol
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      title: 'Vanillin vs Eugenol (Sweet vs Spicy)',
      molecules: ['COC1=C(O)C=CC(C=O)=C1', 'COC1=C(O)C=CC(CC=C)=C1']
    },
    {
      title: 'Citrus & Floral Terpenes (Limonene vs Linalool)',
      molecules: ['CC1=CCC(CC1)C(=C)C', 'CC(=CCCC(C)(O)C=C)C']
    },
    {
      title: 'Aroma Triad (Vanillin, Eugenol, Coumarin)',
      molecules: ['COC1=C(O)C=CC(C=O)=C1', 'COC1=C(O)C=CC(CC=C)=C1', 'O=C1OC2=CC=CC=C2C=C1']
    }
  ];

  const handleCompare = async (listToCompare?: string[]) => {
    const list = listToCompare || smilesList;
    if (list.length < 2) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.compareMolecules(list);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCompare();
  }, []);

  const handleAddMolecule = () => {
    if (smilesList.length >= 4) return;
    const nextList = [...smilesList, 'CCO'];
    setSmilesList(nextList);
    handleCompare(nextList);
  };

  const handleRemoveMolecule = (idx: number) => {
    if (smilesList.length <= 2) return;
    const nextList = smilesList.filter((_, i) => i !== idx);
    setSmilesList(nextList);
    handleCompare(nextList);
  };

  const handleUpdateSmiles = (idx: number, val: string) => {
    const nextList = [...smilesList];
    nextList[idx] = val;
    setSmilesList(nextList);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <GitCompare className="w-6 h-6 text-teal-400" />
          Compare Lab
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Perform aligned side-by-side comparison of 2 to 4 molecular structures, property deltas, and odor profiles.
        </p>
      </div>

      <ScientificDisclaimer
        title="Comparative Scientific Quality Gate"
        message="Notice how pairwise Chemical Tanimoto (topological overlap) can diverge substantially from Predicted Odor Similarity (perceptual descriptor alignment). Both values are reported side-by-side without conflation."
      />

      {/* Preset Comparisons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-200 mb-2">Preset Comparisons</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setSmilesList(p.molecules);
                handleCompare(p.molecules);
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 rounded-xl text-left text-xs transition"
            >
              <div className="font-bold text-slate-200">{p.title}</div>
              <div className="text-[10px] font-mono text-slate-500 truncate mt-1">
                {p.molecules.length} molecules aligned
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Molecule SMILES Inputs Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200">Comparison Set (2-4 molecules)</h3>
          <button
            onClick={handleAddMolecule}
            disabled={smilesList.length >= 4}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Molecule</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {smilesList.map((smi, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-teal-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={smi}
                onChange={(e) => handleUpdateSmiles(idx, e.target.value)}
                className="flex-1 bg-transparent text-xs font-mono text-slate-200 focus:outline-none truncate"
                placeholder="SMILES"
              />
              {smilesList.length > 2 && (
                <button
                  onClick={() => handleRemoveMolecule(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => handleCompare()}
          disabled={loading}
          className="w-full py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
          <span>Run Comparison Analysis</span>
        </button>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Aligned Cards Display */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.molecules.map((m, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2 pb-1 border-b border-slate-800">
                    <span>{m.name}</span>
                    <span className="text-[10px] font-mono text-teal-400">{m.formula}</span>
                  </div>

                  <div className="h-36 bg-slate-950/70 rounded-xl border border-slate-800/50 p-2 flex items-center justify-center overflow-hidden mb-3">
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg_rect]:fill-transparent"
                      dangerouslySetInnerHTML={{ __html: m.svg }}
                    />
                  </div>

                  <div className="text-[11px] space-y-1 font-mono text-slate-400">
                    <div>MW: <strong className="text-slate-200">{m.molecular_weight}</strong></div>
                    <div>Dominant Odor: <strong className="text-amber-400 uppercase">{m.dominant_odor}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pairwise Metric Matrices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-200 mb-3">Pairwise Chemical Tanimoto Similarity</h3>
              <div className="space-y-2">
                {Object.entries(result.pairwise_chemical_tanimoto).map(([pair, score]) => (
                  <div key={pair} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{pair}</span>
                    <span className="font-mono text-amber-400 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                      {score.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-200 mb-3">Pairwise Predicted Odor Profile Cosine</h3>
              <div className="space-y-2">
                {Object.entries(result.pairwise_odor_similarity).map(([pair, score]) => (
                  <div key={pair} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{pair}</span>
                    <span className="font-mono text-teal-400 font-bold bg-teal-950/50 px-2 py-0.5 rounded border border-teal-800/40">
                      {score.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
