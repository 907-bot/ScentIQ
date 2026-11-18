import React, { useRef, useEffect, useState } from 'react';
import { Box, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { ConformerCoordinates } from '../types';

interface Props {
  coordinates?: ConformerCoordinates;
  className?: string;
}

export const Structure3DViewer: React.FC<Props> = ({ coordinates, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.3);
  const [rotY, setRotY] = useState<number>(0.4);
  const [zoom, setZoom] = useState<number>(36);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !coordinates?.atoms?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Calculate center of mass
    let sumX = 0, sumY = 0, sumZ = 0;
    coordinates.atoms.forEach(a => {
      sumX += a.x;
      sumY += a.y;
      sumZ += a.z;
    });
    const centerX = sumX / coordinates.atoms.length;
    const centerY = sumY / coordinates.atoms.length;
    const centerZ = sumZ / coordinates.atoms.length;

    // 3D rotation matrix
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const projected = coordinates.atoms.map(atom => {
      let x = atom.x - centerX;
      let y = atom.y - centerY;
      let z = atom.z - centerZ;

      // Rotate around Y
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;

      // Rotate around X
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      const screenX = width / 2 + x1 * zoom;
      const screenY = height / 2 - y2 * zoom;

      return {
        ...atom,
        screenX,
        screenY,
        depth: z2
      };
    });

    // Draw bonds
    ctx.lineWidth = 3;
    coordinates.bonds.forEach(bond => {
      const p1 = projected[bond.source];
      const p2 = projected[bond.target];
      if (!p1 || !p2) return;

      const grad = ctx.createLinearGradient(p1.screenX, p1.screenY, p2.screenX, p2.screenY);
      grad.addColorStop(0, p1.color);
      grad.addColorStop(1, p2.color);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p1.screenX, p1.screenY);
      ctx.lineTo(p2.screenX, p2.screenY);
      ctx.stroke();
    });

    // Sort atoms by depth (painters algorithm)
    const sortedAtoms = [...projected].sort((a, b) => a.depth - b.depth);

    // Draw atoms as shaded balls
    sortedAtoms.forEach(atom => {
      const radius = Math.max(5, atom.radius * (zoom / 4));
      const grad = ctx.createRadialGradient(
        atom.screenX - radius * 0.3,
        atom.screenY - radius * 0.3,
        radius * 0.1,
        atom.screenX,
        atom.screenY,
        radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, atom.color);
      grad.addColorStop(1, '#111827');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(atom.screenX, atom.screenY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Atom label for heavy atoms
      if (atom.element !== 'H' && atom.element !== 'C') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.element, atom.screenX, atom.screenY);
      }
    });
  }, [coordinates, rotX, rotY, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => prev + dx * 0.015);
    setRotX(prev => prev + dy * 0.015);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Box className="w-4 h-4 text-violet-400" />
            3D Conformer Model
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">RDKit ETKDGv3 Distance Geometry</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 70))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.8, 15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setRotX(0.3); setRotY(0.4); setZoom(36); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset Orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 min-h-[220px] bg-slate-950/70 rounded-xl border border-slate-800/40 relative overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {coordinates?.atoms?.length ? (
          <>
            <canvas ref={canvasRef} width={420} height={260} className="w-full h-full block" />
            <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              Drag to rotate • {coordinates.atoms.length} atoms, {coordinates.bonds.length} bonds
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500 italic">3D coordinates not generated</div>
        )}
      </div>
    </div>
  );
};
