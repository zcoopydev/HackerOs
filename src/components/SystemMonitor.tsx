import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Battery, BatteryCharging, Monitor, Activity, Layers } from 'lucide-react';

interface BatteryState {
  level: number;
  charging: boolean;
}

export const SystemMonitor: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(34);
  const [cpuHistory, setCpuHistory] = useState<number[]>([25, 30, 45, 32, 28, 50, 42, 38, 55, 34]);
  const [ramUsed, setRamUsed] = useState<number>(4.2);
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Hardware metrics
  const logicalCores = navigator.hardwareConcurrency || 8;
  const estimatedRam = (navigator as unknown as { deviceMemory?: number }).deviceMemory
    ? `${(navigator as unknown as { deviceMemory?: number }).deviceMemory} GB`
    : '8.0 GB (VIRTUAL)';
  const screenResolution = `${window.screen.width} × ${window.screen.height} (${window.devicePixelRatio || 1}x)`;
  const platform = navigator.platform || 'x86_64';

  // Live dynamic clock and CPU load oscillation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Dynamic oscillating CPU telemetry
    const cpuInterval = setInterval(() => {
      const base = 25 + Math.sin(Date.now() * 0.001) * 15;
      const noise = Math.random() * 20;
      const current = Math.min(99, Math.max(8, Math.round(base + noise)));
      setCpuUsage(current);
      setCpuHistory((prev) => [...prev.slice(1), current]);
      setRamUsed(parseFloat((3.8 + Math.sin(Date.now() * 0.0005) * 0.6).toFixed(2)));
    }, 1500);

    return () => {
      clearInterval(clockInterval);
      clearInterval(cpuInterval);
    };
  }, []);

  // Real Battery API detection
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (type: string, fn: () => void) => void }> })
        .getBattery()
        .then((bat) => {
          setBattery({
            level: Math.round(bat.level * 100),
            charging: bat.charging
          });

          bat.addEventListener('levelchange', () => {
            setBattery((prev) => (prev ? { ...prev, level: Math.round(bat.level * 100) } : null));
          });
          bat.addEventListener('chargingchange', () => {
            setBattery((prev) => (prev ? { ...prev, charging: bat.charging } : null));
          });
        })
        .catch(() => {
          // Fallback if blocked
        });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-3">
      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* CPU Box */}
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" /> CPU
            </span>
            <span>{logicalCores} CORES</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-300">{cpuUsage}%</span>
            <span className="text-[9px] text-emerald-600">3.4 GHz</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full h-1 bg-black/60 rounded overflow-hidden mt-1.5 border border-emerald-500/30">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* RAM Box */}
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-400" /> RAM
            </span>
            <span>{estimatedRam}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-300">{ramUsed} GB</span>
            <span className="text-[9px] text-emerald-600">54%</span>
          </div>
          <div className="w-full h-1 bg-black/60 rounded overflow-hidden mt-1.5 border border-emerald-500/30">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: '54%' }}
            />
          </div>
        </div>

        {/* Network Box */}
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" /> LINK
            </span>
            <span className={isOnline ? 'text-emerald-400' : 'text-rose-400'}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-300">1.2 Gbps</span>
            <span className="text-[9px] text-emerald-600">&lt; 12ms</span>
          </div>
          <div className="w-full h-1 bg-black/60 rounded overflow-hidden mt-1.5 border border-emerald-500/30">
            <div className="h-full bg-emerald-400 w-full animate-pulse" />
          </div>
        </div>

        {/* Battery / Power Box */}
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="flex items-center gap-1">
              {battery?.charging ? (
                <BatteryCharging className="w-3 h-3 text-emerald-400" />
              ) : (
                <Battery className="w-3 h-3 text-emerald-400" />
              )}
              POWER
            </span>
            <span>{battery ? `${battery.level}%` : 'AC MAINS'}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-300">
              {battery ? (battery.charging ? 'CHARGING' : `${battery.level}%`) : '100%'}
            </span>
            <span className="text-[9px] text-emerald-600">STABLE</span>
          </div>
          <div className="w-full h-1 bg-black/60 rounded overflow-hidden mt-1.5 border border-emerald-500/30">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${battery?.level ?? 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Oscillating CPU Wave Graph */}
      <div className="p-3 rounded-lg bg-black/70 border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-500">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            REAL-TIME CPU WORKLOAD FREQUENCY
          </span>
          <span className="text-[10px] text-emerald-600">POLL: 1500ms</span>
        </div>

        {/* Live SVG Bar Graph */}
        <div className="h-16 w-full flex items-end gap-1.5 pt-2">
          {cpuHistory.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-300 rounded-t transition-all duration-500 shadow-[0_0_8px_rgba(0,255,102,0.3)]"
                style={{ height: `${val}%` }}
              />
              <span className="text-[8px] text-emerald-700">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Native System Information Details */}
      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-600">DISPLAY:</span>
          <span className="text-emerald-300 font-bold">{screenResolution}</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-600">KERNEL:</span>
          <span className="text-emerald-300 font-bold">{platform}</span>
        </div>
      </div>
    </div>
  );
};
