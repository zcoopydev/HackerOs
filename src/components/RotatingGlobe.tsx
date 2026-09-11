import React, { useRef, useEffect, useState } from 'react';
import { Globe, Play, Pause, Compass, Zap, Activity, Maximize2 } from 'lucide-react';
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
  { name: 'SAN-FRANCISCO', lat: 37.7749, lng: -122.4194, ip: '104.244.42.1', status: 'ACTIVE', ping: 14 },
  { name: 'REYKJAVIK-ICE', lat: 64.1466, lng: -21.9426, ip: '193.4.58.12', status: 'ONLINE', ping: 39 },
  { name: 'CAPE-TOWN-GATE', lat: -33.9249, lng: 18.4241, ip: '196.25.1.1', status: 'ROUTING', ping: 95 }
];

// Active data communication arcs between cities
const DATA_ARCS: [number, number][] = [
  [0, 8], // Tokyo <-> San Francisco
  [2, 1], // New York <-> London
  [1, 3], // London <-> Frankfurt
  [3, 7], // Frankfurt <-> Dubai
  [7, 4], // Dubai <-> Singapore
  [4, 0], // Singapore <-> Tokyo
  [4, 5], // Singapore <-> Sydney
  [2, 6], // New York <-> Sao Paulo
  [1, 9], // London <-> Reykjavik
  [3, 10] // Frankfurt <-> Cape Town
];

// Procedural high-density continent point clusters
function generateContinentPoints(): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  const addCluster = (latMin: number, latMax: number, lngMin: number, lngMax: number, count: number) => {
    for (let i = 0; i < count; i++) {
      points.push({
        lat: latMin + Math.random() * (latMax - latMin),
        lng: lngMin + Math.random() * (lngMax - lngMin)
      });
    }
  };

  // North America
  addCluster(25, 60, -125, -70, 180);
  // South America
  addCluster(-50, 10, -75, -35, 120);
  // Europe
  addCluster(36, 68, -10, 40, 160);
  // Africa
  addCluster(-35, 35, -15, 50, 160);
  // Asia & Russia
  addCluster(10, 70, 50, 145, 260);
  // Australia
  addCluster(-40, -12, 115, 155, 90);
  // Greenland
  addCluster(65, 80, -50, -20, 40);
  // Japan & Archipelago
  addCluster(30, 45, 130, 145, 45);
  // Indonesia / Malaysia
  addCluster(-8, 8, 95, 140, 60);

  return points;
}

const CONTINENT_POINTS = generateContinentPoints();

export const RotatingGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<CityNode>(GLOBAL_NODES[0]);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.007);
  const [packetCount, setPacketCount] = useState<number>(1420);

  const angleRef = useRef<number>(0);
  const pitchRef = useRef<number>(0.28); // slight axial tilt for 3D depth
  const animFrameIdRef = useRef<number | null>(null);

  // Drag interaction
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Dynamic Starfield background particles
    const stars: { x: number; y: number; s: number; a: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        s: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      if (isRotating && !isDraggingRef.current) {
        angleRef.current += rotationSpeed;
      }
      const angle = angleRef.current;
      const pitch = pitchRef.current;

      // 1. Draw Starfield
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(0, 255, 102, ${star.a * 0.4})`;
        ctx.fillRect(star.x % width, star.y % height, star.s, star.s);
      });

      // 2. Outer glowing atmospheric halo
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.25);
      grad.addColorStop(0, 'rgba(0, 255, 102, 0.12)');
      grad.addColorStop(0.6, 'rgba(0, 255, 102, 0.04)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Outer boundary ring with degree tick marks
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Exterior Orbital Compass Ring
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.18)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Draw 3D projected Latitude rings
      const latitudes = [-60, -40, -20, 0, 20, 40, 60];
      latitudes.forEach((latDeg) => {
        const latRad = (latDeg * Math.PI) / 180;
        const rLat = radius * Math.cos(latRad);
        const yLat = cy - radius * Math.sin(latRad) * Math.cos(pitch);

        ctx.strokeStyle = latDeg === 0 ? 'rgba(0, 255, 102, 0.4)' : 'rgba(0, 255, 102, 0.12)';
        ctx.lineWidth = latDeg === 0 ? 1.5 : 0.6;
        ctx.beginPath();
        ctx.ellipse(cx, yLat, rLat, rLat * Math.sin(pitch) * 0.9 + 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 4. Draw 3D projected Longitude meridians
      const meridianCount = 14;
      for (let i = 0; i < meridianCount; i++) {
        const lonOffset = (i * Math.PI * 2) / meridianCount + angle;
        const xDist = Math.cos(lonOffset) * radius;
        const zDist = Math.sin(lonOffset);

        ctx.strokeStyle = zDist > 0 ? 'rgba(0, 255, 102, 0.22)' : 'rgba(0, 255, 102, 0.05)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(xDist), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Draw High-Density Continent Landmass Matrix
      CONTINENT_POINTS.forEach((pt) => {
        const latRad = (pt.lat * Math.PI) / 180;
        const lngRad = (pt.lng * Math.PI) / 180 + angle;

        // 3D Spherical Coordinates
        const x3 = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y3 = -radius * Math.sin(latRad) * Math.cos(pitch) + radius * Math.cos(latRad) * Math.cos(lngRad) * Math.sin(pitch);
        const z3 = radius * Math.cos(latRad) * Math.cos(lngRad) * Math.cos(pitch) + radius * Math.sin(latRad) * Math.sin(pitch);

        if (z3 > 0) {
          const alpha = (z3 / radius);
          ctx.fillStyle = `rgba(52, 211, 153, ${Math.max(0.15, alpha * 0.65)})`;
          ctx.beginPath();
          ctx.arc(cx + x3, cy + y3, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Helper function for 3D node projection
      const projectNode = (node: CityNode) => {
        const latRad = (node.lat * Math.PI) / 180;
        const lngRad = (node.lng * Math.PI) / 180 + angle;

        const x3 = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y3 = -radius * Math.sin(latRad) * Math.cos(pitch) + radius * Math.cos(latRad) * Math.cos(lngRad) * Math.sin(pitch);
        const z3 = radius * Math.cos(latRad) * Math.cos(lngRad) * Math.cos(pitch) + radius * Math.sin(latRad) * Math.sin(pitch);

        return {
          screenX: cx + x3,
          screenY: cy + y3,
          z3,
          isVisible: z3 > -radius * 0.1
        };
      };

      // 6. Draw Curved Cyber Data Arcs & Flying Packets
      const nowTime = Date.now() * 0.0015;
      DATA_ARCS.forEach(([idxA, idxB]) => {
        const nodeA = GLOBAL_NODES[idxA];
        const nodeB = GLOBAL_NODES[idxB];
        if (!nodeA || !nodeB) return;

        const projA = projectNode(nodeA);
        const projB = projectNode(nodeB);

        // Only draw if at least one node is front-facing
        if (projA.z3 > 0 || projB.z3 > 0) {
          const midX = (projA.screenX + projB.screenX) / 2;
          const midY = (projA.screenY + projB.screenY) / 2 - 25; // Arc height

          // Draw bezier curve
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.28)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(projA.screenX, projA.screenY);
          ctx.quadraticCurveTo(midX, midY, projB.screenX, projB.screenY);
          ctx.stroke();

          // Animated photon packet traveling along arc
          const t = (nowTime + idxA * 0.25) % 1;
          const packetX = (1 - t) * (1 - t) * projA.screenX + 2 * (1 - t) * t * midX + t * t * projB.screenX;
          const packetY = (1 - t) * (1 - t) * projA.screenY + 2 * (1 - t) * t * midY + t * t * projB.screenY;

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(packetX, packetY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // 7. Draw Global Cyber Nodes & Reticles
      GLOBAL_NODES.forEach((node) => {
        const proj = projectNode(node);
        if (!proj.isVisible) return;

        const isSelected = selectedNode.name === node.name;
        const alpha = Math.max(0.3, (proj.z3 + radius) / (2 * radius));

        // Node Glow Circle
        ctx.fillStyle = isSelected ? '#00ff66' : `rgba(0, 255, 102, ${alpha})`;
        ctx.beginPath();
        ctx.arc(proj.screenX, proj.screenY, isSelected ? 4.5 : 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar ping around node
        const pingRadius = (Date.now() * 0.02 + node.lat * 5) % 14;
        ctx.strokeStyle = `rgba(0, 255, 102, ${Math.max(0, 0.6 - pingRadius / 14)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(proj.screenX, proj.screenY, pingRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (isSelected) {
          // Tactical targeting reticle
          ctx.strokeStyle = '#00ff66';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, 9, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle tick crosshairs
          ctx.beginPath();
          ctx.moveTo(proj.screenX - 14, proj.screenY);
          ctx.lineTo(proj.screenX - 6, proj.screenY);
          ctx.moveTo(proj.screenX + 6, proj.screenY);
          ctx.lineTo(proj.screenX + 14, proj.screenY);
          ctx.moveTo(proj.screenX, proj.screenY - 14);
          ctx.lineTo(proj.screenX, proj.screenY - 6);
          ctx.moveTo(proj.screenX, proj.screenY + 6);
          ctx.lineTo(proj.screenX, proj.screenY + 14);
          ctx.stroke();

          // Pointer line and label
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(proj.screenX, proj.screenY);
          ctx.lineTo(proj.screenX + 22, proj.screenY - 16);
          ctx.lineTo(proj.screenX + 55, proj.screenY - 16);
          ctx.stroke();

          ctx.fillStyle = '#6ee7b7';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(node.name, proj.screenX + 24, proj.screenY - 20);
        }
      });

      // 8. Orbital Satellite Beam Sweep
      const sweepAngle = (Date.now() * 0.0018) % (Math.PI * 2);
      const sweepX = cx + Math.cos(sweepAngle) * (radius * 1.12);
      const sweepY = cy + Math.sin(sweepAngle) * (radius * 0.55);

      ctx.fillStyle = '#00ff66';
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sweepX, sweepY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sweep trail line to core
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isRotating, rotationSpeed, selectedNode]);

  // Mouse drag handlers for direct manual globe rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    angleRef.current += deltaX * 0.008;
    pitchRef.current = Math.max(-0.6, Math.min(0.6, pitchRef.current + deltaY * 0.004));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-[11px] text-emerald-600 px-1">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400 animate-spin" />
          <span className="font-bold text-emerald-300 tracking-wider">
            GLOBAL NEURAL MESH // ORBITAL MATRIX
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            11 SATELLITES LOCKED
          </span>

          <button
            onClick={() => {
              terminalSound.playTik();
              setIsRotating(!isRotating);
            }}
            className="p-1 hover:text-emerald-300 text-emerald-500 transition-colors cursor-pointer"
            title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="flex-1 w-full relative flex items-center justify-center min-h-[210px] bg-black/50 rounded border border-emerald-500/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Live Telemetry Overlay */}
        <div className="absolute top-2 left-2 pointer-events-none text-[9px] text-emerald-600/90 font-mono space-y-0.5">
          <div>ROT: {(angleRef.current % (Math.PI * 2)).toFixed(3)} RAD &bull; TILT: {(pitchRef.current * 57.3).toFixed(1)}&deg;</div>
          <div>BEAM: QUANTUM ENCRYPTED (AES-GCM)</div>
          <div>TRAFFIC: 4.88 Gbps &bull; MESH NODES: 11/11</div>
        </div>

        <div className="absolute bottom-2 right-2 pointer-events-none text-[9px] text-emerald-600/80 font-mono">
          DRAG GLOBE TO ROTATE DIRECTLY
        </div>
      </div>

      {/* Selected Node Details Card & Node Switcher */}
      <div className="space-y-1.5 pt-1 border-t border-emerald-500/20">
        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-[11px]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Compass className="w-3 h-3 text-emerald-400" />
              {selectedNode.name}
            </div>
            <div className="text-[10px] text-emerald-600">
              IP: {selectedNode.ip} &bull; COORDS: {selectedNode.lat}&deg;, {selectedNode.lng}&deg;
            </div>
          </div>
          <div className="text-right">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
              {selectedNode.status}
            </span>
            <div className="text-[10px] text-emerald-500 mt-0.5">
              LATENCY: {selectedNode.ping} ms
            </div>
          </div>
        </div>

        {/* Node Buttons Strip */}
        <div className="flex items-center gap-1 overflow-x-auto terminal-scroll pb-1">
          {GLOBAL_NODES.map((node) => (
            <button
              key={node.name}
              onClick={() => {
                terminalSound.playTik();
                setSelectedNode(node);
              }}
              className={`shrink-0 px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                selectedNode.name === node.name
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold'
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
