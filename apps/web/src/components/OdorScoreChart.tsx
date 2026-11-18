import React from 'react';
import { OdorScore } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  scores: OdorScore[];
  dominantCategory?: string;
  className?: string;
}

export const OdorScoreChart: React.FC<Props> = ({
  scores,
  dominantCategory,
  className = ''
}) => {
  if (!scores?.length) {
    return (
      <div className={`p-6 text-center text-sm text-slate-500 italic bg-slate-900/50 rounded-2xl border border-slate-800 ${className}`}>
        No odor predictions available
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Odor Profile Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">OdorNet 12-Category Multi-Label Model Scores</p>
        </div>
        {dominantCategory && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
            Dominant: {dominantCategory}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {scores.map((item) => {
          const percentage = Math.round(item.score * 100);
          const isDominant = item.label.toLowerCase() === dominantCategory?.toLowerCase();

          return (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium capitalize ${isDominant ? 'text-teal-300 font-bold' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  {item.category_archetype && (
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      ({item.category_archetype})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-200 font-medium">{percentage}%</span>
                  {item.calibrated_probability !== null && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      cal: {(item.calibrated_probability * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(percentage, 2)}%`,
                    backgroundColor: item.color || '#14b8a6',
                    boxShadow: isDominant ? `0 0 12px ${item.color || '#14b8a6'}80` : 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
