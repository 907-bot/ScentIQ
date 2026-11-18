import React from 'react';
import {
  FlaskConical,
  Sparkles,
  Layers,
  Share2,
  Compass,
  GitCompare,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WorkspaceId } from '../components/AppShell';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  onNavigate: (workspace: WorkspaceId) => void;
  onSelectSample: (smiles: string) => void;
}

export const OverviewPage: React.FC<Props> = ({ onNavigate, onSelectSample }) => {
  const sampleMolecules = [
    { name: 'Vanillin', smiles: 'COC1=C(O)C=CC(C=O)=C1', dominant: 'sweet', mw: 152.15, formula: 'C8H8O3' },
    { name: 'Limonene', smiles: 'CC1=CCC(CC1)C(=C)C', dominant: 'citrus', mw: 136.23, formula: 'C10H16' },
    { name: 'Linalool', smiles: 'CC(=CCCC(C)(O)C=C)C', dominant: 'floral', mw: 154.25, formula: 'C10H18O' },
    { name: 'Geosmin', smiles: 'CC1(O)CCCC2(C)CCCC12', dominant: 'earthy', mw: 182.30, formula: 'C12H22O' },
    { name: 'Eugenol', smiles: 'COC1=C(O)C=CC(CC=C)=C1', dominant: 'spicy', mw: 164.20, formula: 'C10H12O2' },
    { name: 'Menthol', smiles: 'CC1CCC(C(O)C1)C(C)C', dominant: 'minty', mw: 156.27, formula: 'C10H20O' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Software-Only Research Platform • Version 1.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Computational Olfaction & Molecular Odor Intelligence
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            ScentIQ bridges molecular structures and sensory perception using machine-learning architectures
            trained on standardized public datasets like OdorNet and OpenPOM. Predict odor descriptors, audit
            stereochemistry, explore molecular similarity, and inspect atom-level feature attributions.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('molecular-lab')}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Launch Molecular Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('research-console')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-violet-400" />
              <span>Research & Data Cards</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
      </div>

      <ScientificDisclaimer
        title="Scientific-Use Reminder"
        message="ScentIQ produces computational predictions from published molecular training datasets, not real-time sensory measurements. A predicted odor label is not an exact physical smell intensity, and feature attribution reflects model input sensitivity rather than human olfactory receptor biology."
      />

      {/* Model & System Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Primary Model</span>
            <span className="flex items-center gap-1 text-teal-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
          <div className="text-xl font-bold text-white mb-1">MPNN-GNN</div>
          <div className="text-xs text-slate-400">3-layer message passing on molecular graphs</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Odor Categories</span>
            <span className="text-violet-400 font-mono font-bold">12 labels</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">OdorNet Aligned</div>
          <div className="text-xs text-slate-400">Fixed 7:2:1 stereochemistry-safe split</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Baseline ROC-AUC</span>
            <span className="text-teal-400 font-mono font-bold">0.865</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">Masked BCE Loss</div>
          <div className="text-xs text-slate-400">Preserves unobserved labels without zero-coercion</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Mixture Studio</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> Experimental
            </span>
          </div>
          <div className="text-xl font-bold text-white mb-1">Non-Linear Model</div>
          <div className="text-xs text-slate-400">Prevents unvalidated arithmetic averaging</div>
        </div>
      </div>

      {/* Quick Launch Workspaces */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          Interactive Research Workspaces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('molecular-lab')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200 mb-1 group-hover:text-teal-300">Molecular Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Standardize structures, detect chiral centers, and inspect RDKit 2D SVG & 3D conformers.
            </p>
            <span className="text-xs text-teal-400 font-semibold inline-flex items-center gap-1">
              Open Lab <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('prediction')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200 mb-1 group-hover:text-violet-300">AI Prediction & Uncertainty</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Generate 12-category odor profiles with calibrated probabilities and out-of-distribution warnings.
            </p>
            <span className="text-xs text-violet-400 font-semibold inline-flex items-center gap-1">
              Run Prediction <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('similarity')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200 mb-1 group-hover:text-amber-300">Similarity Explorer</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Compare chemical Tanimoto, GNN graph embeddings, and predicted odor profiles independently.
            </p>
            <span className="text-xs text-amber-400 font-semibold inline-flex items-center gap-1">
              Explore Neighbors <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Load Sample Aroma Molecules */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-200 mb-1">Curated Aroma Reference Compounds</h2>
        <p className="text-xs text-slate-400 mb-4">Select an archetype molecule to load directly into the validation and prediction pipeline:</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sampleMolecules.map((m) => (
            <button
              key={m.name}
              onClick={() => {
                onSelectSample(m.smiles);
                onNavigate('molecular-lab');
              }}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/60 hover:bg-slate-800/50 text-left transition group"
            >
              <div className="font-bold text-xs text-slate-200 group-hover:text-teal-300">{m.name}</div>
              <div className="text-[10px] text-teal-400 font-medium capitalize mt-0.5">{m.dominant}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">{m.formula} • {m.mw}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
