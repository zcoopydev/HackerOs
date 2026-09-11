import React, { useRef, useEffect, useState } from 'react';
import { Globe, Radio, Play, Pause, Compass } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface CityNode {
  name: string;
  lat: number;
  lng: number;
  ip: string;
  status: 'ONLINE' | 'ACTIVE' | 'ROUTING';
  ping: number;
}

const GLOBAL_NODES: CityNode[] = [
  { name: 'TOKYO-PRIME', lat: 35.6762, lng: 139.6503, ip: '133.242.18.9', status: 'ACTIVE', ping: 18 },
  { name: 'LONDON-CENTRAL', lat: 51.5074, lng: -0.1278, ip: '185.199.108.153', status: 'ONLINE', ping: 24 },
  { name: 'NEW-YORK-GATEWAY', lat: 40.7128, lng: -74.006, ip: '198.51.100.44', status: 'ACTIVE', ping: 32 },
  { name: 'FRANKFURT-CORE', lat: 50.1109, lng: 8.6821, ip: '194.109.6.92', status: 'ONLINE', ping: 21 },
  { name: 'SINGAPORE-HUB', lat: 1.3521, lng: 103.8198, ip: '202.158.42.11', status: 'ONLINE', ping: 45 },
  { name: 'SYDNEY-TERMINAL', lat: -33.8688, lng: 151.2093, ip: '139.130.4.5', status: 'ROUTING', ping: 68 },
  { name: 'SAO-PAULO-RELAY', lat: -23.5505, lng: -46.6333, ip: '200.160.2.3', status: 'ONLINE', ping: 110 },
  { name: 'DUBAI-GATE', lat: 25.2048, lng: 55.2708, ip: '195.229.241.50', status: 'ONLINE', ping: 52 },
  { name: 'SAN-FRANCISCO', lat: 37.7749, lng: -122.4194, ip: '104.244.42.1', status: 'ACTIVE', ping: 14 }
];

export const RotatingGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<CityNode>(GLOBAL_NODES[0]);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.008);
  const angleRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      if (isRotating) {
        angleRef.current += rotationSpeed;
      }
      const angle = angleRef.current;

      // 1. Draw outer glowing atmospheric ring
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.15);
      grad.addColorStop(0, 'rgba(0, 255, 102, 0.08)');
      grad.addColorStop(0.8, 'rgba(0, 255, 102, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Outer boundary border
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw latitude rings
      const latitudes = [-60, -40, -20, 0, 20, 40, 60];
      latitudes.forEach((latDeg) => {
        const latRad = (latDeg * Math.PI) / 180;
        const rLat = radius * Math.cos(latRad);
        const yLat = cy - radius * Math.sin(latRad);

        ctx.strokeStyle = latDeg === 0 ? 'rgba(0, 255, 102, 0.35)' : 'rgba(0, 255, 102, 0.12)';
        ctx.lineWidth = latDeg === 0 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.ellipse(cx, yLat, rLat, rLat * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 3. Draw rotating longitude meridians
      const meridianCount = 12;
      for (let i = 0; i < meridianCount; i++) {
        const lonOffset = (i * Math.PI * 2) / meridianCount + angle;
        const xDist = Math.cos(lonOffset) * radius;
        const zDist = Math.sin(lonOffset);

        ctx.strokeStyle = zDist > 0 ? 'rgba(0, 255, 102, 0.22)' : 'rgba(0, 255, 102, 0.06)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(xDist), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Project and Draw Global Cyber Nodes
      GLOBAL_NODES.forEach((node) => {
        const latRad = (node.lat * Math.PI) / 180;
        const lngRad = (node.lng * Math.PI) / 180 + angle;

        // 3D Sphere projection
        const x3 = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y3 = -radius * Math.sin(latRad);
        const z3 = radius * Math.cos(latRad) * Math.cos(lngRad);

        const screenX = cx + x3;
        const screenY = cy + y3 * 0.88;

        // Only draw or emphasize front-facing nodes (z3 > -radius * 0.1)
        if (z3 > -radius * 0.1) {
          const isSelected = selectedNode.name === node.name;
          const alpha = (z3 + radius) / (2 * radius);

          // Node Ping circle
          ctx.fillStyle = isSelected ? '#00ff66' : `rgba(0, 255, 102, ${Math.max(0.3, alpha)})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, isSelected ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fill();

          if (isSelected) {
            // Pulsing target reticle on selected node
            ctx.strokeStyle = '#00ff66';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 8 + Math.sin(Date.now() * 0.008) * 3, 0, Math.PI * 2);
            ctx.stroke();

            // Label line
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + 18, screenY - 14);
            ctx.lineTo(screenX + 45, screenY - 14);
            ctx.stroke();

            // City name
            ctx.fillStyle = '#6ee7b7';
            ctx.font = '10px monospace';
            ctx.fillText(node.name, screenX + 16, screenY - 18);
          }
        }
      });

      // 5. Draw orbital satellite beam sweep
      const sweepAngle = (Date.now() * 0.002) % (Math.PI * 2);
      const sweepX = cx + Math.cos(sweepAngle) * (radius * 1.08);
      const sweepY = cy + Math.sin(sweepAngle) * (radius * 0.45);

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(sweepX, sweepY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isRotating, rotationSpeed, selectedNode]);

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs select-none">
      {/* Top Header telemetry */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 px-1 text-[11px] text-emerald-600">
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          GLOBAL NEURAL MESH
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-500">NODES: 9/9 ONLINE</span>
          <button
            onClick={() => {
              setIsRotating(!isRotating);
              terminalSound.playTik();
            }}
            className="p-1 hover:text-emerald-300 text-emerald-500 transition-colors cursor-pointer"
            title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full relative flex items-center justify-center my-1 min-h-[190px]">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

        {/* Floating live coordinates HUD */}
        <div className="absolute top-2 left-2 pointer-events-none text-[9px] text-emerald-600/80 font-mono space-y-0.5">
          <div>ROT: {(angleRef.current % (Math.PI * 2)).toFixed(3)} RAD</div>
          <div>LAT_BND: &plusmn;60&deg; MERCATOR</div>
          <div>SWEEP: 4.8 GHz ENCRYPTED</div>
        </div>
      </div>

      {/* Bottom Node Inspector & Quick Switcher */}
      <div className="border-t border-emerald-500/20 pt-2 space-y-2">
        {/* Selected Node Details Card */}
        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Compass className="w-3 h-3 text-emerald-400" />
              {selectedNode.name}
            </div>
            <div className="text-[10px] text-emerald-600">
              IP: {selectedNode.ip} &bull; LAT: {selectedNode.lat}&deg; LNG: {selectedNode.lng}&deg;
            </div>
          </div>
          <div className="text-right">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
              {selectedNode.status}
            </span>
            <div className="text-[10px] text-emerald-500 mt-0.5">
              RTT: {selectedNode.ping} ms
            </div>
          </div>
        </div>

        {/* Node Buttons Strip */}
        <div className="flex items-center gap-1 overflow-x-auto terminal-scroll pb-1">
          {GLOBAL_NODES.map((node) => (
            <button
              key={node.name}
              onClick={() => {
                setSelectedNode(node);
                terminalSound.playTik();
              }}
              className={`shrink-0 px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                selectedNode.name === node.name
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                  : 'bg-black/60 text-emerald-600 hover:text-emerald-400 border border-emerald-950'
              }`}
            >
              {node.name.split('-')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
