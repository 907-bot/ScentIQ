import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  RefreshCw,
  FlaskConical,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { OdorMapData, OdorMapPoint } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

interface Props {
  onSelectMolecule: (smiles: string) => void;
}

export const OdorMapPage: React.FC<Props> = ({ onSelectMolecule }) => {
  const [mapData, setMapData] = useState<OdorMapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<OdorMapPoint | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        setLoading(true);
        const data = await api.getOdorMap(2);
        setMapData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  // Render canvas scatter plot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData?.points?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    mapData.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const padding = 50;
    const scaleX = (width - padding * 2) / (maxX - minX || 1);
    const scaleY = (height - padding * 2) / (maxY - minY || 1);

    // Draw subtle grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = padding; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = padding; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw data points
    mapData.points.forEach(p => {
      const cx = padding + (p.x - minX) * scaleX;
      const cy = height - (padding + (p.y - minY) * scaleY);

      const isFilteredOut = selectedCategory && p.dominant_odor.toLowerCase() !== selectedCategory.toLowerCase();
      const isHovered = hoveredPoint?.id === p.id;

      ctx.beginPath();
      const radius = isHovered ? 8 : (isFilteredOut ? 3 : 5.5);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);

      if (isFilteredOut) {
        ctx.fillStyle = '#334155';
        ctx.globalAlpha = 0.3;
      } else {
        ctx.fillStyle = p.odor_color || '#14b8a6';
        ctx.globalAlpha = isHovered ? 1.0 : 0.85;
      }

      ctx.fill();
      if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    });
  }, [mapData, selectedCategory, hoveredPoint]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData?.points?.length) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / (rect.width || 1));
    const mouseY = (e.clientY - rect.top) * (canvas.height / (rect.height || 1));

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    mapData.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const padding = 50;
    const scaleX = (canvas.width - padding * 2) / (maxX - minX || 1);
    const scaleY = (canvas.height - padding * 2) / (maxY - minY || 1);

    let found: OdorMapPoint | null = null;
    for (const p of mapData.points) {
      const cx = padding + (p.x - minX) * scaleX;
      const cy = canvas.height - (padding + (p.y - minY) * scaleY);
      const dist = Math.hypot(mouseX - cx, mouseY - cy);
      if (dist < 10) {
        found = p;
        break;
      }
    }
    setHoveredPoint(found);
  };

  const handleCanvasClick = () => {
    if (hoveredPoint) {
      onSelectMolecule(hoveredPoint.smiles);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <MapPin className="w-6 h-6 text-teal-400" />
          Odor Explorer (Landscape Map)
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Explore the chemical odor landscape projected into 2D latent space via PCA on Morgan fingerprints and physicochemical descriptors.
        </p>
      </div>

      <ScientificDisclaimer
        title="2D Projection Disclaimer"
        message="A 2D dimensional reduction projection preserves global chemical clustering but collapses higher-dimensional topological details. Proximity on the 2D map reflects feature similarity, not human perceptual equality."
      />

      {/* Category Filter Pills */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          Filter Cluster:
        </span>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
            selectedCategory === null
              ? 'bg-teal-500 text-slate-950 font-bold'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Categories
        </button>
        {mapData?.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
              selectedCategory === cat
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map Canvas and Selected Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-400 px-2 font-mono">
            <span>Projection: PCA (2D)</span>
            <span>{mapData?.total_molecules || 0} mapped reference molecules</span>
          </div>

          <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden cursor-crosshair">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                <span>Projecting molecular landscape...</span>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                width={700}
                height={440}
                className="w-full h-full block"
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-xl pointer-events-none text-xs max-w-xs backdrop-blur-sm">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hoveredPoint.odor_color }}
                  />
                  {hoveredPoint.name}
                </div>
                <div className="text-[11px] text-teal-300 font-mono mt-0.5">
                  Dominant: {hoveredPoint.dominant_odor.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate mt-1">
                  {hoveredPoint.smiles}
                </div>
                <div className="text-[10px] text-teal-400 mt-1 font-semibold">
                  Click to inspect in Molecular Lab
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Molecule Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-teal-400" />
              Molecule Inspector
            </h3>
            <p className="text-xs text-slate-400 mb-4">Hover over or click any point in the landscape to inspect:</p>

            {hoveredPoint ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-base text-white">{hoveredPoint.name}</div>
                  <div className="text-xs text-teal-400 font-semibold uppercase mt-0.5">
                    Dominant: {hoveredPoint.dominant_odor}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-2">
                    {hoveredPoint.smiles}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Category Profile Scores:</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(hoveredPoint.scores).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 flex justify-between">
                        <span className="capitalize text-slate-400">{k}</span>
                        <span className="font-mono text-slate-200 font-bold">{(v * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950/50 rounded-xl border border-slate-800">
                Hover or click a node in the scatter plot to inspect its odor descriptor profile.
              </div>
            )}
          </div>

          {hoveredPoint && (
            <button
              onClick={() => onSelectMolecule(hoveredPoint.smiles)}
              className="mt-4 w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Load Into Molecular Lab</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
