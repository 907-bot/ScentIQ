import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import { Molecule, SinglePrediction } from '../types';
import { api } from '../services/api';
import { OdorScoreChart } from '../components/OdorScoreChart';
import { Structure2DViewer } from '../components/Structure2DViewer';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  currentMolecule: Molecule | null;
  prediction: SinglePrediction | null;
  onPredictionComplete: (pred: SinglePrediction) => void;
  onNavigateToExplainability: () => void;
  onNavigateToReports: () => void;
}

export const PredictionPage: React.FC<Props> = ({
  currentMolecule,
  prediction,
  onPredictionComplete,
  onNavigateToExplainability,
  onNavigateToReports
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('scentiq-odornet-gnn');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableModels = [
    {
      id: 'scentiq-odornet-gnn',
      name: 'Molecular Graph Neural Network (GNN)',
      badge: 'Recommended',
      status: 'Ready',
      description: '3-layer message passing neural network with atom/bond features and masked BCE loss.'
    },
    {
      id: 'scentiq-baseline-rf',
      name: 'Random Forest Fingerprint Baseline',
      badge: 'Tabular',
      status: 'Ready',
      description: '2048-bit Morgan fingerprints + 10 physicochemical descriptors with MultiOutput ensemble.'
    },
    {
      id: 'openpom-reproduction',
      name: 'OpenPOM Reproduction Adapter',
      badge: 'Adapter',
      status: 'Ready',
      description: 'Reference reproduction of BioMachineLearning/openpom baseline evaluated on POM task.'
    }
  ];

  const handleRunPrediction = async () => {
    if (!currentMolecule) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const pred = await api.predictMolecule({
        smiles: currentMolecule.canonical_smiles,
        molecule_id: currentMolecule.molecule_id,
        model_id: selectedModel,
        top_k: 12,
        include_explanation: true
      });
      onPredictionComplete(pred);
    } catch (err: any) {
      setErrorMsg(err.message || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-violet-400" />
            AI Odor Prediction
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Run multi-label odor classification on molecular graphs with probability calibration and out-of-distribution detection.
          </p>
        </div>

        {currentMolecule && (
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Target Molecule:</span>
            <span className="text-teal-300 font-bold">{currentMolecule.name}</span>
          </div>
        )}
      </div>

      {!currentMolecule ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Molecule Loaded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Please resolve or validate a chemical structure in the Molecular Lab workspace before running odor predictions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Model Selector Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              Select Computational Olfaction Architecture
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {availableModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500/50 shadow-md shadow-teal-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-bold ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                        {m.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        m.status === 'Ready'
                          ? 'bg-teal-950 text-teal-400 border border-teal-800/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 font-mono">
                Input: {currentMolecule.canonical_smiles}
              </div>
              <button
                onClick={handleRunPrediction}
                disabled={loading}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-violet-600/20 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inference in progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Predict Odor Profile</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Prediction Results Display */}
          {prediction && (
            <div className="space-y-6">
              {/* Odor Profile & 2D Structure Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <OdorScoreChart
                    scores={prediction.predictions}
                    dominantCategory={prediction.dominant_category}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Structure2DViewer
                    svg={prediction.explanation?.highlighted_svg || currentMolecule.svg_2d}
                    title="Target Structure"
                    subtitle={`Dominant Odor: ${prediction.dominant_category.toUpperCase()}`}
                  />

                  {/* Actions card */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
                    <button
                      onClick={onNavigateToExplainability}
                      className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-teal-400" />
                      <span>Inspect Atom Attributions</span>
                    </button>
                    <button
                      onClick={onNavigateToReports}
                      className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-violet-400" />
                      <span>Generate Research Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Uncertainty & Out-of-Distribution Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-400" />
                    Uncertainty & Out-Of-Distribution (OOD) Analysis
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                    prediction.uncertainty.ood_flag
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                      : 'bg-teal-950 text-teal-300 border border-teal-800/40'
                  }`}>
                    {prediction.uncertainty.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Max Training Tanimoto</div>
                    <div className="text-base font-bold text-teal-400 font-mono mt-0.5">
                      {prediction.uncertainty.max_training_tanimoto}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Probability Calibration</div>
                    <div className="text-base font-bold text-violet-400 font-mono mt-0.5">
                      Platt Scaling (ECE 0.048)
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400">Training Scaffold Match</div>
                    <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
                      {prediction.uncertainty.ood_flag ? 'Divergent' : 'In-Manifold'}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {prediction.uncertainty.message}
                </p>
              </div>

              {/* Model & Dataset Lineage Metadata */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 font-mono flex flex-wrap items-center justify-between gap-4">
                <div>Model ID: <strong className="text-slate-200">{prediction.model.id}</strong> (v{prediction.model.version})</div>
                <div>Dataset: <strong className="text-slate-200">{prediction.dataset.name}</strong></div>
                <div>DOI: <strong className="text-teal-400">{prediction.dataset.doi || '10.5281/zenodo.19838455'}</strong></div>
                <div>Prediction ID: <strong className="text-slate-300">{prediction.prediction_id}</strong></div>
              </div>

              <ScientificDisclaimer />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
