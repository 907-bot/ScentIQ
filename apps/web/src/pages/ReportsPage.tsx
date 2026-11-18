import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';
import { Molecule, SinglePrediction } from '../types';
import { api } from '../services/api';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  currentMolecule: Molecule | null;
  prediction: SinglePrediction | null;
}

export const ReportsPage: React.FC<Props> = ({ currentMolecule, prediction }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    if (!currentMolecule || !prediction) return;
    setLoading(true);

    try {
      const rep = await api.createReport(
        currentMolecule.molecule_id,
        prediction.prediction_id,
        `ScentIQ Research Report: ${currentMolecule.name}`
      );
      setReport(rep);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_id}_scentiq_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const md = `# ${report.title}
**Report ID:** \`${report.report_id}\`  
**Generated:** ${report.created_at}  
**Platform:** ScentIQ Computational Olfaction Intelligence Platform

---

## 1. Molecule Identity
- **Name:** ${report.molecule.name}
- **Formula:** ${report.molecule.formula}
- **Molecular Weight:** ${report.molecule.molecular_weight} g/mol
- **Canonical SMILES:** \`${report.molecule.canonical_smiles}\`
- **InChIKey:** \`${report.molecule.inchikey}\`
- **Stereocenters Audited:** ${report.molecule.chiral_centers?.length || 0}

---

## 2. Predicted Odor Profile
- **Model ID:** ${report.prediction.model.id} (v${report.prediction.model.version})
- **Task:** ${report.prediction.task}
- **Dataset:** ${report.prediction.dataset.name} (DOI: ${report.prediction.dataset.doi})
- **Dominant Odor Category:** **${report.prediction.dominant_category.toUpperCase()}**

| Category | Model Score | Calibrated Probability |
|---|---|---|
${report.prediction.predictions.map((p: any) => `| ${p.label} | ${p.score} | ${p.calibrated_probability ?? 'N/A'} |`).join('\n')}

---

## 3. Uncertainty & Out-Of-Distribution (OOD)
- **Status:** ${report.uncertainty.status}
- **Max Training Tanimoto:** ${report.uncertainty.max_training_tanimoto}
- **Scaffold Notice:** ${report.uncertainty.message}

---

## 4. Scientific Provenance & Citations
${report.citations.map((c: any) => `- **${c.title}** (${c.authors}) - DOI: ${c.doi || 'N/A'}`).join('\n')}

---

> **Scientific Disclaimer:**  
> ${report.scientific_disclaimer}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_id}_scentiq_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-violet-400" />
            Research Reports & Evidence Export
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Export reproducible, source-attributed research reports complete with dataset DOIs, model metrics, and uncertainty flags.
          </p>
        </div>

        {report && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-violet-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown</span>
            </button>
          </div>
        )}
      </div>

      {!currentMolecule || !prediction ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Analysis Completed</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Run an odor prediction on a validated molecule to assemble an exportable scientific research report.
          </p>
        </div>
      ) : !report ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Ready to Assemble Report</h3>
            <p className="text-xs text-slate-400 mt-1">
              Assemble source citations, calibration metrics, and odor profile for <strong>{currentMolecule.name}</strong>.
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-teal-500/20"
          >
            {loading ? 'Assembling Report...' : 'Compile Research Report'}
          </button>
        </div>
      ) : (
        /* Render Report Document */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 max-w-4xl mx-auto shadow-2xl">
          {/* Report Header */}
          <div className="pb-6 border-b border-slate-800/80 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-bold">
                ScentIQ Olfaction Intelligence Report
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">{report.title}</h2>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Report ID: {report.report_id} • Generated {new Date(report.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">Dominant Profile</span>
              <strong className="text-teal-300 font-bold uppercase">{report.prediction.dominant_category}</strong>
            </div>
          </div>

          {/* Molecule Data Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
              1. Molecular Structure & Identity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Compound Name</span>
                <strong className="text-slate-200">{report.molecule.name}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Formula</span>
                <strong className="text-slate-200">{report.molecule.formula}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Molecular Weight</span>
                <strong className="text-slate-200">{report.molecule.molecular_weight} g/mol</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PubChem CID</span>
                <strong className="text-slate-200">{report.molecule.pubchem_cid || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Odor Score Rankings Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
              2. Odor Profile Descriptor Distribution
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Raw Score</th>
                    <th className="p-3">Calibrated Probability</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {report.prediction.predictions.map((p: any) => (
                    <tr key={p.label}>
                      <td className="p-3 font-semibold text-slate-200 capitalize">{p.label}</td>
                      <td className="p-3 text-teal-300 font-bold">{p.score}</td>
                      <td className="p-3 text-violet-300">{p.calibrated_probability ?? 'N/A'}</td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {p.score > 0.4 ? 'Predicted Active' : 'Low Evidence'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Uncertainty Audit */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <h3 className="font-bold text-slate-200 mb-1">Uncertainty & Domain Applicability</h3>
            <p className="text-slate-400 leading-relaxed">{report.uncertainty.message}</p>
          </div>

          {/* Scientific Provenance & Citations */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">
              3. Cited Scientific Research & Datasets
            </h3>
            <div className="space-y-2">
              {report.citations.map((c: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-slate-200">{c.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {c.authors} {c.doi && `• DOI: ${c.doi}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ScientificDisclaimer message={report.scientific_disclaimer} />
        </div>
      )}
    </div>
  );
};
