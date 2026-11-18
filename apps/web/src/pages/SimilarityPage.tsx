import React, { useState, useEffect } from 'react';
import {
  Share2,
  Search,
  ArrowRight,
  RefreshCw,
  FlaskConical,
  Info
} from 'lucide-react';
import { Molecule, SimilarityResult } from '../types';
import { api } from '../services/api';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  currentMolecule: Molecule | null;
  onSelectMolecule: (smiles: string) => void;
}

export const SimilarityPage: React.FC<Props> = ({ currentMolecule, onSelectMolecule }) => {
  const [method, setMethod] = useState<'chemical_fingerprint' | 'learned_embedding' | 'predicted_odor_profile'>('chemical_fingerprint');
  const [topK, setTopK] = useState<number>(6);
  const [results, setResults] = useState<SimilarityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSimilar = async () => {
    if (!currentMolecule) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.searchSimilarity(currentMolecule.canonical_smiles, method, topK);
      setResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Similarity search failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMolecule) {
      fetchSimilar();
    }
  }, [currentMolecule, method, topK]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Share2 className="w-6 h-6 text-amber-400" />
          Similarity Explorer
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Search nearest neighbor molecules across three mathematically and scientifically segregated similarity spaces.
        </p>
      </div>

      <ScientificDisclaimer
        variant="warning"
        title="Scientific Metric Distinction"
        message="Do not compare Tanimoto scores, learned latent embeddings, and predicted odor-profile similarities as equivalent quantities. Two molecules can share high 2D chemical similarity while exhibiting completely divergent odor profiles."
      />

      {!currentMolecule ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Target Molecule Selected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Load or validate a molecule in the Molecular Lab to search for structural or odor analogs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Method Selector Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-200">Comparison Domain</h3>
                <p className="text-[11px] text-slate-400">Target: {currentMolecule.name} ({currentMolecule.canonical_smiles})</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Neighbors:</span>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value={4}>Top 4</option>
                  <option value={6}>Top 6</option>
                  <option value={8}>Top 8</option>
                  <option value={12}>Top 12</option>
                </select>

                <button
                  onClick={fetchSimilar}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Refresh search"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setMethod('chemical_fingerprint')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  method === 'chemical_fingerprint'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-200 mb-0.5">Chemical Fingerprint</div>
                <div className="text-[11px] text-slate-400">Morgan / ECFP4 Tanimoto topological path overlap</div>
              </button>

              <button
                onClick={() => setMethod('learned_embedding')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  method === 'learned_embedding'
                    ? 'bg-violet-500/10 border-violet-500/50 shadow-md shadow-violet-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-200 mb-0.5">Learned GNN Embedding</div>
                <div className="text-[11px] text-slate-400">Latent graph representation space cosine similarity</div>
              </button>

              <button
                onClick={() => setMethod('predicted_odor_profile')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  method === 'predicted_odor_profile'
                    ? 'bg-teal-500/10 border-teal-500/50 shadow-md shadow-teal-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-200 mb-0.5">Predicted Odor Profile</div>
                <div className="text-[11px] text-slate-400">12-category predicted descriptor distribution cosine</div>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Searching chemical catalog...</span>
            </div>
          ) : results ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.neighbors.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2 pb-1 border-b border-slate-800/80">
                        <span className="font-bold text-slate-200 group-hover:text-amber-300 transition">
                          {item.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {item.similarity_score.toFixed(3)}
                        </span>
                      </div>

                      {/* 2D SVG preview */}
                      <div className="h-36 bg-slate-950/60 rounded-xl border border-slate-800/40 p-2 flex items-center justify-center overflow-hidden mb-3">
                        {item.svg ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg_rect]:fill-transparent"
                            dangerouslySetInnerHTML={{ __html: item.svg }}
                          />
                        ) : (
                          <span className="text-xs text-slate-500 italic">No SVG</span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 truncate mb-1">
                        SMILES: <span className="text-slate-300">{item.smiles}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Metric: {item.similarity_metric}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectMolecule(item.smiles)}
                      className="mt-4 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
                      <span>Inspect in Lab</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <strong>Method Note:</strong> {results.method_disclaimer}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
