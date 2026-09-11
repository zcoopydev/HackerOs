import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Zap,
  Play,
  Pause,
  Flame,
  Coins,
  TrendingUp,
  Activity,
  Sliders,
  CheckCircle2,
  Fan,
  Wallet
} from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface GpuCore {
  id: number;
  name: string;
  hashrate: number;
  temp: number;
  fanSpeed: number;
  powerWatts: number;
}

export const CryptoMiner: React.FC = () => {
  const [isMining, setIsMining] = useState<boolean>(true);
  const [threads, setThreads] = useState<number>(8);
  const [isOverclocked, setIsOverclocked] = useState<boolean>(false);
  const [minedCoins, setMinedCoins] = useState<number>(14.8251);
  const [acceptedBlocks, setAcceptedBlocks] = useState<number>(38);
  const [rejectedBlocks, setRejectedBlocks] = useState<number>(1);
  const [nonce, setNonce] = useState<number>(48291024);
  const [currentHash, setCurrentHash] = useState<string>('000000a94bf820f719b384210d...');

  const [cores, setCores] = useState<GpuCore[]>([
    { id: 1, name: 'QUANTUM-QPU-01', hashrate: 124.5, temp: 58, fanSpeed: 65, powerWatts: 140 },
    { id: 2, name: 'QUANTUM-QPU-02', hashrate: 118.2, temp: 61, fanSpeed: 70, powerWatts: 145 },
    { id: 3, name: 'TENSOR-CORE-03', hashrate: 135.0, temp: 64, fanSpeed: 75, powerWatts: 160 },
    { id: 4, name: 'CRYPTO-ENGINE-04', hashrate: 105.8, temp: 55, fanSpeed: 60, powerWatts: 130 }
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hashrateHistoryRef = useRef<number[]>(Array(40).fill(480));

  // Mining cycle loop
  useEffect(() => {
    if (!isMining) return;

    const interval = setInterval(() => {
      // Nonce increment
      const nonceDelta = Math.floor(125000 * (isOverclocked ? 1.5 : 1.0));
      setNonce((prev) => prev + nonceDelta);

      // Generate animated simulated hash
      const randomHex = Math.random().toString(16).substring(2, 10);
      const isBlockFound = Math.random() < 0.08;

      if (isBlockFound) {
        terminalSound.playBlockMined();
        const blockReward = 0.25;
        setMinedCoins((c) => +(c + blockReward).toFixed(4));
        setAcceptedBlocks((b) => b + 1);
        setCurrentHash(`00000000${randomHex}89d... [BLOCK SOLVED]`);
      } else {
        setCurrentHash(`000000${randomHex}${Math.random().toString(16).substring(2, 10)}...`);
      }

      // Update Rig Telemetry
      setCores((prevCores) =>
        prevCores.map((core) => {
          const ocBonus = isOverclocked ? 1.35 : 1.0;
          const hashVariation = (Math.random() * 6 - 3);
          const targetHash = +(core.hashrate * 0.95 + (120 * ocBonus + hashVariation) * 0.05).toFixed(1);

          const tempBase = isOverclocked ? 76 : 58;
          const targetTemp = Math.floor(tempBase + (Math.random() * 4 - 2));

          const targetFan = isOverclocked ? 88 + Math.floor(Math.random() * 8) : 62 + Math.floor(Math.random() * 6);
          const targetPower = Math.floor((core.powerWatts * 0.9 + (isOverclocked ? 190 : 140) * 0.1));

          return {
            ...core,
            hashrate: targetHash,
            temp: targetTemp,
            fanSpeed: targetFan,
            powerWatts: targetPower
          };
        })
      );

      // Push total hashrate to history
      const totalHash = cores.reduce((acc, c) => acc + c.hashrate, 0);
      hashrateHistoryRef.current.push(totalHash);
      if (hashrateHistoryRef.current.length > 50) {
        hashrateHistoryRef.current.shift();
      }

      // Draw real-time sparkline chart
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = (canvas.width = canvas.parentElement?.clientWidth || 300);
          const h = (canvas.height = canvas.parentElement?.clientHeight || 65);
          ctx.clearRect(0, 0, w, h);

          const history = hashrateHistoryRef.current;
          const min = Math.min(...history) * 0.95;
          const max = Math.max(...history) * 1.05;
          const range = max - min || 1;

          // Draw gradient fill
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, 'rgba(0, 255, 102, 0.3)');
          grad.addColorStop(1, 'rgba(0, 255, 102, 0.0)');

          ctx.beginPath();
          history.forEach((val, i) => {
            const x = (i / (history.length - 1)) * w;
            const y = h - ((val - min) / range) * (h - 10) - 5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();

          // Stroke line
          ctx.beginPath();
          history.forEach((val, i) => {
            const x = (i / (history.length - 1)) * w;
            const y = h - ((val - min) / range) * (h - 10) - 5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = '#00ff66';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isMining, isOverclocked, cores]);

  const totalHashrate = cores.reduce((acc, c) => acc + c.hashrate, 0);

  const toggleMining = () => {
    terminalSound.playTik();
    setIsMining(!isMining);
  };

  const toggleOverclock = () => {
    terminalSound.playTik();
    setIsOverclocked(!isOverclocked);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-2.5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-[11px] text-emerald-600">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400 animate-spin" />
          <span className="font-bold text-emerald-300 tracking-wider">
            QUANTUM CRYPTO MINER // NEXUS HASH MATRIX
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleOverclock}
            className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
              isOverclocked
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_8px_#ff0055]'
                : 'bg-black/60 border-neutral-800 text-neutral-400 hover:text-emerald-300'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>{isOverclocked ? 'OC: ACTIVE' : 'OC: OFF'}</span>
          </button>

          <button
            onClick={toggleMining}
            className={`px-2.5 py-0.5 rounded border text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
              isMining
                ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                : 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
            }`}
          >
            {isMining ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isMining ? 'HALT' : 'RESUME'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner Stats: Balance & Pool Shares */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="p-2.5 rounded bg-black/80 border border-emerald-500/30 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-emerald-600">
            <span>UNCONFIRMED BALANCE:</span>
            <Wallet className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-300 glow-text-green">
            {minedCoins.toFixed(4)} NXC
          </div>
          <div className="text-[9px] text-emerald-600">
            &asymp; ${(minedCoins * 184.2).toFixed(2)} USD (NEXUS POOL)
          </div>
        </div>

        <div className="p-2.5 rounded bg-black/80 border border-emerald-500/30 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-emerald-600">
            <span>AGGREGATE HASHRATE:</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-300">
            {isMining ? totalHashrate.toFixed(1) : 0} MH/s
          </div>
          <div className="text-[9px] text-emerald-600">
            ALGORITHM: SHA-256 (QUANTUM OPTIMIZED)
          </div>
        </div>

        <div className="p-2.5 rounded bg-black/80 border border-emerald-500/30 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-emerald-600">
            <span>BLOCK SHARES (24H):</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-300">
            {acceptedBlocks} <span className="text-xs text-neutral-500 font-normal">/ {rejectedBlocks} REJ</span>
          </div>
          <div className="text-[9px] text-emerald-600">
            EFFICIENCY: 97.4% &bull; DIFFICULTY: 14.8 T
          </div>
        </div>
      </div>

      {/* Live Hashrate Chart */}
      <div className="p-2.5 rounded bg-black/90 border border-emerald-500/20 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-emerald-500">
          <span className="flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> LIVE HASHRATE OSCILLATION OSCILLOSCOPE
          </span>
          <span className="text-emerald-400 font-bold">{totalHashrate.toFixed(1)} MH/s</span>
        </div>
        <div className="w-full h-16 relative">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* 4 Animated QPU / GPU Cores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cores.map((core) => (
          <div
            key={core.id}
            className="p-2 rounded bg-black/80 border border-emerald-500/20 space-y-1.5"
          >
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
              <span className="truncate">{core.name}</span>
              <Fan
                className={`w-3.5 h-3.5 text-emerald-400 ${
                  isMining ? 'animate-[spin_1s_linear_infinite]' : ''
                }`}
              />
            </div>

            <div className="text-xs font-bold text-emerald-300">
              {isMining ? core.hashrate : 0} MH/s
            </div>

            {/* Core Temp bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-emerald-600">
                <span>TEMP:</span>
                <span className={core.temp > 75 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {core.temp}&deg;C
                </span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    core.temp > 75 ? 'bg-rose-500' : core.temp > 65 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (core.temp / 90) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-[9px] text-emerald-600 pt-0.5">
              <span>FAN: {core.fanSpeed}%</span>
              <span>{core.powerWatts}W</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Solved Nonce Stream */}
      <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 truncate">
          <span className="text-emerald-600 text-[10px] shrink-0">NONCE: {nonce}</span>
          <span className="text-emerald-300 font-mono truncate">{currentHash}</span>
        </div>
        <span className="text-[10px] text-emerald-500 shrink-0 font-bold pl-2">
          POOL: STRATUM+TCP
        </span>
      </div>
    </div>
  );
};
