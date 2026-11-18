import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  Search,
  Share2,
  GitCompare,
  Layers,
  MapPin,
  Cpu,
  FileText,
  Activity,
  Menu,
  X,
  Compass,
  Database
} from 'lucide-react';

export type WorkspaceId =
  | 'overview'
  | 'molecular-lab'
  | 'prediction'
  | 'explainability'
  | 'similarity'
  | 'blend-studio'
  | 'odor-map'
  | 'compare'
  | 'research-console'
  | 'reports';

interface Props {
  activeWorkspace: WorkspaceId;
  onSelectWorkspace: (id: WorkspaceId) => void;
  onQuickSearch?: (query: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({
  activeWorkspace,
  onSelectWorkspace,
  onQuickSearch,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: Array<{ id: WorkspaceId; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'molecular-lab', label: 'Molecular Lab', icon: FlaskConical },
    { id: 'prediction', label: 'AI Prediction', icon: Sparkles, badge: 'Ready' },
    { id: 'explainability', label: 'Explainability Lab', icon: Layers },
    { id: 'similarity', label: 'Similarity Explorer', icon: Share2 },
    { id: 'blend-studio', label: 'Blend Studio', icon: Compass, badge: 'Exper.' },
    { id: 'odor-map', label: 'Odor Explorer', icon: MapPin },
    { id: 'compare', label: 'Compare Lab', icon: GitCompare },
    { id: 'research-console', label: 'Research Console', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onQuickSearch) {
      onQuickSearch(searchQuery.trim());
      onSelectWorkspace('molecular-lab');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-violet-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FlaskConical className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 via-teal-200 to-violet-400 bg-clip-text text-transparent">
                ScentIQ
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Olfaction Intelligence
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeWorkspace === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectWorkspace(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    item.badge === 'Ready'
                      ? 'bg-teal-950 text-teal-400 border border-teal-800/50'
                      : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System & Model Lineage Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              GNN Runtime
            </span>
            <span className="font-mono text-teal-400">v0.1.0</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate">
            Dataset: OdorNet-Aligned
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Lookup molecule (e.g. Vanillin, Limonene, CCO)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Model: MPNN-GNN</span>
            </span>
            <button
              onClick={() => onSelectWorkspace('molecular-lab')}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
