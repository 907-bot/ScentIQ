import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface Props {
  variant?: 'warning' | 'info';
  title?: string;
  message?: string;
}

export const ScientificDisclaimer: React.FC<Props> = ({
  variant = 'info',
  title = 'Computational Olfaction Research Notice',
  message = 'ScentIQ predictions are in silico statistical models trained on published chemical datasets. They do not represent sensory or physical measurements, nor should they be construed as medical, toxicology, or safety certifications.'
}) => {
  const isWarning = variant === 'warning';

  return (
    <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${
      isWarning
        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
        : 'bg-slate-900/60 border-slate-800 text-slate-300'
    }`}>
      {isWarning ? (
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
      )}
      <div>
        <div className="font-semibold mb-0.5">{title}</div>
        <div className="text-xs leading-relaxed opacity-90">{message}</div>
      </div>
    </div>
  );
};
