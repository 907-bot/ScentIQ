import React from 'react';
import { Copy, Check, Eye } from 'lucide-react';

interface Props {
  svg?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Structure2DViewer: React.FC<Props> = ({
  svg,
  title = '2D Chemical Structure',
  subtitle,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySvg = () => {
    if (!svg) return;
    navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-teal-400" />
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {svg && (
          <button
            onClick={handleCopySvg}
            title="Copy SVG XML"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'SVG'}</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[220px] bg-slate-950/60 rounded-xl border border-slate-800/40 p-2 overflow-hidden">
        {svg ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-[260px] [&>svg]:w-auto [&>svg]:h-auto [&>svg_rect]:fill-transparent"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="text-xs text-slate-500 italic">No structure available</div>
        )}
      </div>
    </div>
  );
};
