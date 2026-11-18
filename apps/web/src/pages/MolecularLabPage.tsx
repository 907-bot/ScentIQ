import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Molecule } from '../types';
import { api } from '../services/api';
import { Structure2DViewer } from '../components/Structure2DViewer';
import { Structure3DViewer } from '../components/Structure3DViewer';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  currentMolecule: Molecule | null;
  onMoleculeLoaded: (mol: Molecule) => void;
  onNavigateToPrediction: () => void;
  onNavigateToSimilarity: () => void;
}

export const MolecularLabPage: React.FC<Props> = ({
  currentMolecule,
  onMoleculeLoaded,
  onNavigateToPrediction,
  onNavigateToSimilarity
}) => {
  const [inputMode, setInputMode] = useState<'name' | 'smiles' | 'presets'>('name');
  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSmiles, setCopiedSmiles] = useState<boolean>(false);

  const presets = [
    { label: 'Vanillin (Sweet / Vanilla)', query: 'Vanillin', smiles: 'COC1=C(O)C=CC(C=O)=C1' },
    { label: 'Limonene (Citrus / Orange)', query: 'Limonene', smiles: 'CC1=CCC(CC1)C(=C)C' },
    { label: 'Linalool (Floral / Lavender)', query: 'Linalool', smiles: 'CC(=CCCC(C)(O)C=C)C' },
    { label: 'Geosmin (Earthy / Petrichor)', query: 'Geosmin', smiles: 'CC1(O)CCCC2(C)CCCC12' },
    { label: 'Eugenol (Spicy / Clove)', query: 'Eugenol', smiles: 'COC1=C(O)C=CC(CC=C)=C1' },
    { label: 'Menthol (Minty / Peppermint)', query: 'Menthol', smiles: 'CC1CCC(C(O)C1)C(C)C' },
    { label: 'Cinnamaldehyde (Spicy / Cinnamon)', query: 'Cinnamaldehyde', smiles: 'O=CC=CC1=CC=CC=C1' },
    { label: 'Indole (Floral / Animalic)', query: 'Indole', smiles: 'C1=CC=C2C(=C1)C=CN2' }
  ];

  const handleValidate = async (queryToUse?: string) => {
    const q = (queryToUse ?? inputVal).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      let mol: Molecule;
      if (inputMode === 'smiles') {
        mol = await api.validateMolecule(q);
      } else {
        mol = await api.resolveMolecule(q, inputMode === 'name' ? 'name' : 'auto');
      }
      onMoleculeLoaded(mol);
    } catch (err: any) {
      setErrorMsg(err.message || 'Validation failed. Check the syntax or chemical name.');
    } finally {
      setLoading(false);
    }
  };

  const copySmiles = () => {
    if (!currentMolecule) return;
    navigator.clipboard.writeText(currentMolecule.canonical_smiles);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <FlaskConical className="w-6 h-6 text-teal-400" />
          Molecular Lab
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Validate and standardize molecular structures using RDKit, inspect stereochemistry, and calculate physicochemical descriptors.
        </p>
      </div>

      {/* Input Selector Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex border-b border-slate-800 mb-4">
          <button
            onClick={() => { setInputMode('name'); setInputVal(''); }}
            className={`pb-2.5 px-4 text-xs font-semibold transition border-b-2 ${
              inputMode === 'name' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Chemical Name
          </button>
          <button
            onClick={() => { setInputMode('smiles'); setInputVal(''); }}
            className={`pb-2.5 px-4 text-xs font-semibold transition border-b-2 ${
              inputMode === 'smiles' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SMILES String
          </button>
          <button
            onClick={() => setInputMode('presets')}
            className={`pb-2.5 px-4 text-xs font-semibold transition border-b-2 ${
              inputMode === 'presets' ? 'border-teal-400 text-teal-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Aroma Presets
          </button>
        </div>

        {inputMode === 'presets' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setInputVal(p.query);
                  handleValidate(p.query);
                }}
                disabled={loading}
                className="p-3 text-left bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/40 rounded-xl text-xs transition disabled:opacity-50"
              >
                <div className="font-bold text-slate-200">{p.query}</div>
                <div className="text-[10px] text-teal-400 mt-0.5">{p.label.split('(')[1]?.replace(')', '')}</div>
                <div className="text-[10px] font-mono text-slate-500 truncate mt-1">{p.smiles}</div>
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleValidate();
            }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  inputMode === 'name'
                    ? 'Enter compound name (e.g. Vanillin, Linalool, Ethanol, Coumarin)...'
                    : 'Enter valid SMILES (e.g. COC1=C(O)C=CC(C=O)=C1)...'
                }
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Resolving...' : 'Validate Molecule'}</span>
            </button>
          </form>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Validated Molecule Display */}
      {currentMolecule && (
        <div className="space-y-6">
          {/* Identity & Stereochemistry Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <h2 className="text-xl font-bold text-white">{currentMolecule.name}</h2>
                  {currentMolecule.pubchem_cid && (
                    <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      CID: {currentMolecule.pubchem_cid}
                    </span>
                  )}
                  <span className="text-[11px] bg-teal-950 text-teal-400 px-2 py-0.5 rounded border border-teal-800/40">
                    {currentMolecule.validation_status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-4 font-mono">
                  <span>Formula: <strong className="text-slate-200">{currentMolecule.formula}</strong></span>
                  <span>Mol Weight: <strong className="text-slate-200">{currentMolecule.molecular_weight} g/mol</strong></span>
                  <span>Source: <strong className="text-slate-200">{currentMolecule.source}</strong></span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateToPrediction}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Predict Odor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={onNavigateToSimilarity}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Find Similar</span>
                </button>
              </div>
            </div>

            {/* Canonical SMILES copy bar */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 truncate mr-2 select-all">
                SMILES: <span className="text-teal-300">{currentMolecule.canonical_smiles}</span>
              </span>
              <button
                onClick={copySmiles}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0 flex items-center gap-1"
                title="Copy SMILES"
              >
                {copiedSmiles ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedSmiles ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Warnings or Stereochemistry audit */}
            {currentMolecule.warnings.length > 0 && (
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-1">
                {currentMolecule.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2D & 3D Structure Viewers Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Structure2DViewer
              svg={currentMolecule.svg_2d}
              title="2D Standardized Depiction"
              subtitle="RDKit MolDraw2DSVG with CIP stereo flags"
            />
            <Structure3DViewer
              coordinates={currentMolecule.coordinates_3d}
            />
          </div>

          {/* Physicochemical Descriptors Grid */}
          {currentMolecule.descriptors && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-200 mb-1">Calculated Physicochemical Descriptors</h3>
              <p className="text-xs text-slate-400 mb-4">Molecular features derived from sanitized molecular graph:</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">LogP (Lipophilicity)</div>
                  <div className="text-base font-bold text-teal-400 font-mono mt-0.5">
                    {currentMolecule.descriptors.logp}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">TPSA (Polar Area)</div>
                  <div className="text-base font-bold text-teal-400 font-mono mt-0.5">
                    {currentMolecule.descriptors.tpsa} Å²
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">H-Bond Donors (HBD)</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentMolecule.descriptors.hbd}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">H-Bond Acceptors (HBA)</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentMolecule.descriptors.hba}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Rotatable Bonds</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentMolecule.descriptors.rotatable_bonds}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Aromatic Rings</div>
                  <div className="text-base font-bold text-violet-400 font-mono mt-0.5">
                    {currentMolecule.descriptors.aromatic_rings}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Fraction CSP3</div>
                  <div className="text-base font-bold text-violet-400 font-mono mt-0.5">
                    {currentMolecule.descriptors.fraction_csp3}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Heavy Atom Count</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentMolecule.descriptors.heavy_atom_count}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Molar Refractivity</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {currentMolecule.descriptors.molar_refractivity}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Stereocenters</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                    {currentMolecule.chiral_centers.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
