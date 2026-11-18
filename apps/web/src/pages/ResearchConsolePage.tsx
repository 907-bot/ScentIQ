import React, { useState, useEffect } from 'react';
import {
  Database,
  Cpu,
  FileCheck,
  ExternalLink,
  ShieldAlert,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetMetadata, ModelMetadata } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const ResearchConsolePage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, m] = await Promise.all([api.getDatasets(), api.getModels()]);
        setDatasets(d);
        setModels(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Database className="w-6 h-6 text-teal-400" />
          Research Console & Scientific Provenance
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Inspect public dataset cards, model evaluation metrics, split governance, and license compliance records.
        </p>
      </div>

      <ScientificDisclaimer
        title="Open Science & Provenance Protocol"
        message="Every model inference in ScentIQ tracks dataset name, version DOI, loss masking policy, and training commit hash. No dataset labels are silently merged or modified without ontological documentation."
      />

      {/* Dataset Cards Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" />
          Public Research Datasets & Benchmarks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((d) => (
            <div key={d.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{d.name}</h3>
                    <div className="text-[11px] font-mono text-teal-400 mt-0.5">Version: {d.version}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {d.license}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{d.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Molecules</span>
                    <strong className="text-slate-200">{d.molecule_count.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Odor Labels</span>
                    <strong className="text-slate-200">{d.categories_count} categories</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {d.doi && (
                  <span className="font-mono text-[11px] text-slate-400">
                    DOI: <strong className="text-teal-400">{d.doi}</strong>
                  </span>
                )}
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 text-[11px] ml-auto"
                >
                  <span>Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Cards & Benchmarks */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          Registered Model Cards & Performance Audits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m) => (
            <div key={m.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{m.name}</h3>
                    <div className="text-[11px] font-mono text-violet-400 mt-0.5">ID: {m.id} (v{m.version})</div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    m.status === 'ready'
                      ? 'bg-teal-950 text-teal-400 border border-teal-800/40'
                      : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{m.description}</p>

                {/* Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-semibold text-slate-300">Reported Benchmark Metrics:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(m.metrics).map(([k, v]) => (
                      <div key={k} className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                        <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                        <strong className="text-teal-300">{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations */}
                {m.limitations.length > 0 && (
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <strong className="text-slate-300 block text-xs">Documented Model Limitations:</strong>
                    {m.limitations.map((lim, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{lim}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
