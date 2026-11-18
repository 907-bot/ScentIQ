import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { BlendPredictionResponse } from '../types';
import { OdorScoreChart } from '../components/OdorScoreChart';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface ComponentRow {
  id: string;
  name: string;
  smiles: string;
  fraction: number;
}

export const BlendStudioPage: React.FC = () => {
  const [components, setComponents] = useState<ComponentRow[]>([
    { id: '1', name: 'Vanillin', smiles: 'COC1=C(O)C=CC(C=O)=C1', fraction: 0.5 },
    { id: '2', name: 'Eugenol', smiles: 'COC1=C(O)C=CC(CC=C)=C1', fraction: 0.5 }
  ]);
  const [basis, setBasis] = useState<string>('mole_fraction');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BlendPredictionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      name: 'Gourmand Vanilla-Clove Accord',
      components: [
        { id: '1', name: 'Vanillin', smiles: 'COC1=C(O)C=CC(C=O)=C1', fraction: 0.6 },
        { id: '2', name: 'Eugenol', smiles: 'COC1=C(O)C=CC(CC=C)=C1', fraction: 0.4 }
      ]
    },
    {
      name: 'Citrus Lavender Cologne',
      components: [
        { id: '1', name: 'Limonene', smiles: 'CC1=CCC(CC1)C(=C)C', fraction: 0.5 },
        { id: '2', name: 'Linalool', smiles: 'CC(=CCCC(C)(O)C=C)C', fraction: 0.3 },
        { id: '3', name: 'Geraniol', smiles: 'CC(=CCC/C(=C/CO)/C)C', fraction: 0.2 }
      ]
    },
    {
      name: 'Woody Camphoraceous Blend',
      components: [
        { id: '1', name: 'Cedrol', smiles: 'CC1(C)CCCC2(C)C1CCC2(C)O', fraction: 0.5 },
        { id: '2', name: 'Eucalyptol', smiles: 'CC1(C2CCC(O1)(CC2)C)C', fraction: 0.3 },
        { id: '3', name: 'Menthol', smiles: 'CC1CCC(C(O)C1)C(C)C', fraction: 0.2 }
      ]
    }
  ];

  const handleAddComponent = () => {
    if (components.length >= 6) return;
    setComponents([
      ...components,
      { id: Date.now().toString(), name: 'New Chemical', smiles: 'CCO', fraction: 0.1 }
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length <= 2) return;
    setComponents(components.filter(c => c.id !== id));
  };

  const handleUpdateComponent = (id: string, field: keyof ComponentRow, val: any) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleRunBlend = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = components.map(c => ({
        smiles: c.smiles,
        fraction: c.fraction,
        name: c.name
      }));
      const res = await api.predictBlend(payload, basis);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Mixture prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  const totalFraction = components.reduce((acc, c) => acc + c.fraction, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-teal-400" />
          Blend Studio
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40 font-mono uppercase tracking-wide">
            Experimental Track
          </span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Explore volatile chemical mixtures and multi-component non-linear odor modulation.
        </p>
      </div>

      <ScientificDisclaimer
        variant="warning"
        title="Mixture Formulation Warning"
        message="Blend Studio is a research prototype. Linear arithmetic averaging of monomolecular predictions is scientifically invalid for mixtures. Our experimental engine models non-linear masking and vapor synergy."
      />

      {/* Preset Accord Templates */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-200 mb-2">Preset Research Accords</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setComponents(p.components);
                setResult(null);
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-teal-500/40 rounded-xl text-left text-xs transition"
            >
              <div className="font-bold text-slate-200">{p.name}</div>
              <div className="text-[10px] text-teal-400 mt-1">
                {p.components.map(c => `${c.name} ${(c.fraction * 100).toFixed(0)}%`).join(' • ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Component Composer Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Mixture Components</h3>
            <p className="text-xs text-slate-400">Configure 2 to 6 components with their respective ratios:</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Total Fraction: <strong className={Math.abs(totalFraction - 1) < 0.05 ? 'text-teal-400' : 'text-amber-400'}>
                {(totalFraction * 100).toFixed(0)}%
              </strong>
            </span>
            <select
              value={basis}
              onChange={(e) => setBasis(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-teal-500"
            >
              <option value="mole_fraction">Mole Fraction</option>
              <option value="mass_fraction">Mass Fraction</option>
            </select>
            <button
              onClick={handleAddComponent}
              disabled={components.length >= 6}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Component rows */}
        <div className="space-y-3 mb-6">
          {components.map((comp, idx) => (
            <div
              key={comp.id}
              className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center gap-4 text-xs"
            >
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-teal-400 font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                {idx + 1}
              </span>

              <div className="w-36 shrink-0">
                <input
                  type="text"
                  placeholder="Component Name"
                  value={comp.name}
                  onChange={(e) => handleUpdateComponent(comp.id, 'name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex-1 min-w-[160px]">
                <input
                  type="text"
                  placeholder="SMILES string"
                  value={comp.smiles}
                  onChange={(e) => handleUpdateComponent(comp.id, 'smiles', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="w-40 flex items-center gap-2 shrink-0">
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={comp.fraction}
                  onChange={(e) => handleUpdateComponent(comp.id, 'fraction', parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <span className="font-mono text-slate-300 w-10 text-right">
                  {(comp.fraction * 100).toFixed(0)}%
                </span>
              </div>

              {components.length > 2 && (
                <button
                  onClick={() => handleRemoveComponent(comp.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                  title="Remove component"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleRunBlend}
          disabled={loading}
          className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulating mixture interaction...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Compute Blend Odor Profile</span>
            </>
          )}
        </button>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Blend Results */}
      {result && (
        <div className="space-y-6">
          <OdorScoreChart
            scores={result.predicted_blend_profile}
            dominantCategory={result.dominant_category}
          />

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 font-mono flex flex-wrap items-center justify-between gap-4">
            <div>Model: <strong className="text-slate-200">{result.model_id}</strong></div>
            <div>Basis: <strong className="text-teal-400">{result.concentration_basis}</strong></div>
            <div>Dominant Accord: <strong className="text-amber-300 uppercase">{result.dominant_category}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
