import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  FlaskConical
} from 'lucide-react';
import { Molecule, SinglePrediction } from '../types';
import { api } from '../services/api';
import { Structure2DViewer } from '../components/Structure2DViewer';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  currentMolecule: Molecule | null;
  prediction: SinglePrediction | null;
  onUpdatePrediction: (pred: SinglePrediction) => void;
}

export const ExplainabilityPage: React.FC<Props> = ({
  currentMolecule,
  prediction,
  onUpdatePrediction
}) => {
  const [targetLabel, setTargetLabel] = useState<string>(
    prediction?.dominant_category || 'sweet'
  );
  const [loading, setLoading] = useState<boolean>(false);

  const categories = [
    'fruity', 'floral', 'woody', 'sweet', 'green', 'herbal',
    'spicy', 'citrus', 'earthy', 'chemical', 'animalic', 'minty'
  ];

  const handleTargetChange = async (newLabel: string) => {
    if (!currentMolecule) return;
    setTargetLabel(newLabel);
    setLoading(true);

    try {
      const updated = await api.predictMolecule({
        smiles: currentMolecule.canonical_smiles,
        molecule_id: currentMolecule.molecule_id,
        model_id: prediction?.model.id || 'scentiq-odornet-gnn',
        include_explanation: true,
        explanation_target_label: newLabel
      });
      onUpdatePrediction(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const explanation = prediction?.explanation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-teal-400" />
          Explainability Lab
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Inspect model feature attribution and atom-level saliency mappings with respect to chosen target odor descriptors.
        </p>
      </div>

      <ScientificDisclaimer
        variant="warning"
        title="Model Sensitivity vs Biological Causality"
        message="Atom saliency scores illustrate mathematical gradient contributions of input features to the neural model output. They do not constitute scientific proof of human olfactory receptor binding or physical biochemical causation."
      />

      {!currentMolecule || !prediction ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Analysis Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Please run an odor prediction on a validated molecule first to compute atom attribution maps.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Category Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200">
                Target Odor Category for Attribution:
              </span>
              {loading && (
                <span className="text-xs text-teal-400 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Calculating gradients...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = targetLabel.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => handleTargetChange(cat)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saliency Visualization and Atom Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Structure2DViewer
              svg={explanation?.highlighted_svg || currentMolecule.svg_2d}
              title={`Atom Attribution: ${targetLabel.toUpperCase()}`}
              subtitle="Highlighted regions denote high gradient magnitude"
            />

            {/* Atom Attribution Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-200">Atom Salience Breakdown</h3>
                <span className="text-xs text-slate-400 font-mono">
                  Method: {explanation?.method || 'Integrated Gradients'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2 pr-1">
                {explanation?.atom_attributions.map((atom) => (
                  <div
                    key={atom.atom_idx}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-teal-400 font-mono font-bold flex items-center justify-center text-[11px]">
                        {atom.element}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">
                          Atom #{atom.atom_idx} ({atom.element})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Influence: {atom.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{ width: `${Math.round(atom.salience * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-teal-300 font-bold w-10 text-right">
                        {(atom.salience * 100).toFixed(0)}%
                      </span>
                    </div>
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
