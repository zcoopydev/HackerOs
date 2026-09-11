import React, { useState, useEffect, useRef } from 'react';
import {
  Key,
  ShieldAlert,
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface CrackJob {
  id: string;
  name: string;
  algorithm: string;
  targetHash: string;
  keyspace: string;
  knownPlaintext?: string;
  status: 'QUEUED' | 'RUNNING' | 'CRACKED' | 'FAILED';
  progress: number;
}

const DEFAULT_TARGETS: CrackJob[] = [
  {
    id: 'job-1',
    name: 'ROOT_SHADOW_KEY',
    algorithm: 'SHA-256',
    targetHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    keyspace: 'A-Z, a-z, 0-9, Symbols',
    knownPlaintext: 'admin',
    status: 'RUNNING',
    progress: 42
  },
  {
    id: 'job-2',
    name: 'WPA3_AIRCRACK_HANDSHAKE',
    algorithm: 'PBKDF2-HMAC',
    targetHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    keyspace: 'Wordlist (rockyou.txt)',
    status: 'QUEUED',
    progress: 0
  },
  {
    id: 'job-3',
    name: 'QUANTUM_ENCLAVE_TOKEN',
    algorithm: 'AES-256-XTS',
    targetHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    keyspace: 'Hexadecimal (128-bit)',
    status: 'QUEUED',
    progress: 0
  }
];

const WORDLIST_SAMPLE = [
  'admin', 'quantum94', 'root1234', 'nexus_core', 'shadow_matrix',
  'bypass_0x7f', 'cipher2026', 'override_pw', 'skynet_alpha', 'enclave_key',
  'cyber_god', 'delta_force', 'neural_node', 'orbital_sat', 'firewall_null',
  'kali_master', 'super_secret', 'crypto_miner', 'payload_inject', 'zero_day'
];

export const PasswordCracker: React.FC = () => {
  const [jobs, setJobs] = useState<CrackJob[]>(DEFAULT_TARGETS);
  const [activeJobId, setActiveJobId] = useState<string>('job-1');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [runningKeys, setRunningKeys] = useState<string[]>([]);
  const [keysPerSec, setKeysPerSec] = useState<number>(14280500);
  const [crackedHistory, setCrackedHistory] = useState<{ hash: string; plain: string; time: string }[]>([
    {
      hash: '5d41402abc4b2a76b9719d911017c592',
      plain: 'hello',
      time: '08:14:02'
    }
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  // Animated Key Stream generation ("keys running everywhere")
  useEffect(() => {
    if (!isRunning) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=~0x';
    const interval = setInterval(() => {
      // Generate 8-12 random candidate strings per tick
      const newBatch: string[] = [];
      for (let i = 0; i < 9; i++) {
        let key = '';
        const len = 8 + Math.floor(Math.random() * 12);
        for (let j = 0; j < len; j++) {
          key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const pseudoHex = Math.random().toString(16).substring(2, 8);
        newBatch.push(`0x${pseudoHex} :: [${key}]`);
      }
      setRunningKeys(newBatch);

      // Fluctuate keys/sec
      setKeysPerSec(Math.floor((12000000 + Math.random() * 5000000) * speedMultiplier));

      // Advance job progress
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === activeJobId && j.status === 'RUNNING') {
            const nextProgress = Math.min(100, j.progress + 0.8 * speedMultiplier);
            if (nextProgress >= 100 && j.status !== 'CRACKED') {
              terminalSound.playAccessGranted();
              const plain = j.knownPlaintext || WORDLIST_SAMPLE[Math.floor(Math.random() * WORDLIST_SAMPLE.length)];
              setCrackedHistory((h) => [
                { hash: j.targetHash.slice(0, 16) + '...', plain, time: new Date().toLocaleTimeString() },
                ...h
              ]);
              return { ...j, progress: 100, status: 'CRACKED' };
            }
            return { ...j, progress: nextProgress };
          }
          return j;
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isRunning, activeJobId, speedMultiplier]);

  const toggleRun = () => {
    terminalSound.playTik();
    setIsRunning(!isRunning);
  };

  const handleRestart = () => {
    terminalSound.playTik();
    setJobs((prev) =>
      prev.map((j) => (j.id === activeJobId ? { ...j, progress: 0, status: 'RUNNING' } : j))
    );
    setIsRunning(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    terminalSound.playTik();
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-2.5">
      {/* Top Header & Telemetry */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-[11px] text-emerald-600">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-300 tracking-wider">
            PASSWORD CRACKER // BRUTE-FORCE MATRIX
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {(keysPerSec / 1000000).toFixed(2)} M/s
          </span>

          <button
            onClick={toggleRun}
            className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
              isRunning
                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isRunning ? 'PAUSE' : 'START'}</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-1 hover:text-emerald-300 text-emerald-600 transition-colors cursor-pointer"
            title="Restart Active Job"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Hash Selection Strip */}
      <div className="flex items-center gap-2 overflow-x-auto terminal-scroll pb-1">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => {
              terminalSound.playTik();
              setActiveJobId(job.id);
            }}
            className={`px-2.5 py-1 rounded text-[10px] border flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
              activeJobId === job.id
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                : 'bg-black/60 border-emerald-500/20 text-neutral-400 hover:text-emerald-400'
            }`}
          >
            <ShieldAlert
              className={`w-3 h-3 ${
                job.status === 'CRACKED'
                  ? 'text-emerald-400'
                  : job.status === 'RUNNING'
                  ? 'text-amber-400 animate-spin'
                  : 'text-neutral-500'
              }`}
            />
            <span>{job.name}</span>
            <span className="text-[9px] text-emerald-600 font-normal">[{job.algorithm}]</span>
          </button>
        ))}
      </div>

      {/* Active Target Banner */}
      <div className="p-2.5 rounded bg-black/70 border border-emerald-500/30 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-emerald-500">
          <span>TARGET HASH:</span>
          <span className="text-emerald-400 font-bold">{activeJob.algorithm} &bull; {activeJob.keyspace}</span>
        </div>
        <div className="text-[11px] text-emerald-300 break-all bg-black/80 p-1.5 rounded border border-emerald-500/20 font-mono select-text">
          {activeJob.targetHash}
        </div>

        {/* Progress bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] text-emerald-500">
            <span>PERMUTATION ENTROPY:</span>
            <span className="font-bold text-emerald-300">{activeJob.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-emerald-500/30">
            <div
              className={`h-full transition-all duration-200 ${
                activeJob.status === 'CRACKED'
                  ? 'bg-emerald-400 shadow-[0_0_10px_#00ff66]'
                  : 'bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-400'
              }`}
              style={{ width: `${activeJob.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Split: Fast Streaming Keys Matrix + Cracked History */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-h-0 overflow-hidden">
        {/* Left: Rapidly cycling keys matrix ("keys running everywhere") */}
        <div className="bg-black/90 border border-emerald-500/20 rounded-lg p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-emerald-500 pb-1 border-b border-emerald-500/10">
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <Layers className="w-3 h-3" /> CANDIDATE PIPELINE STREAM
            </span>
            <span className="text-[9px] text-emerald-600 animate-pulse">CYCLING AT 120Hz</span>
          </div>

          <div className="flex-1 overflow-hidden py-1 space-y-0.5 text-[11px] font-mono leading-tight">
            {runningKeys.map((keyLine, idx) => (
              <div
                key={idx}
                className={`truncate transition-colors ${
                  idx === 0
                    ? 'text-white font-bold glow-text-green'
                    : idx % 2 === 0
                    ? 'text-emerald-400'
                    : 'text-emerald-600'
                }`}
              >
                {keyLine}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-emerald-950 text-[9px] text-emerald-600">
            <span>THREAD CLUSTER: 64 CORES</span>
            <span>MASK: ?a?a?a?d?d?s</span>
          </div>
        </div>

        {/* Right: Solved Hashes & Plaintexts Log */}
        <div className="bg-black/90 border border-emerald-500/20 rounded-lg p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-emerald-500 pb-1 border-b border-emerald-500/10">
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RECOVERED PLAINTEXTS
            </span>
            <span className="text-[9px] text-emerald-600">COUNT: {crackedHistory.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto terminal-scroll py-1 space-y-1.5">
            {crackedHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <Key className="w-3 h-3 text-emerald-400" />
                    <span>"{item.plain}"</span>
                  </div>
                  <div className="text-[9px] text-emerald-600">{item.hash} &bull; {item.time}</div>
                </div>

                <button
                  onClick={() => copyToClipboard(item.plain, `plain-${idx}`)}
                  className="p-1 hover:text-emerald-200 text-emerald-500 cursor-pointer flex items-center gap-1 text-[10px]"
                  title="Copy cracked password"
                >
                  {copiedKey === `plain-${idx}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedKey === `plain-${idx}` ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            ))}

            {activeJob.status === 'CRACKED' && (
              <div className="p-2 rounded bg-emerald-500/20 border border-emerald-400 text-center space-y-0.5 animate-pulse">
                <div className="text-emerald-300 font-black text-xs glow-text-green">
                  MATCH FOUND: "{activeJob.knownPlaintext || 'admin'}"
                </div>
                <div className="text-[9px] text-emerald-500">
                  Target {activeJob.name} has been successfully breached!
                </div>
              </div>
            )}
          </div>

          {/* Speed Boost Selector */}
          <div className="flex items-center justify-between pt-1 border-t border-emerald-950 text-[10px]">
            <span className="text-emerald-600">OVERCLOCK:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 8].map((mult) => (
                <button
                  key={mult}
                  onClick={() => {
                    terminalSound.playTik();
                    setSpeedMultiplier(mult);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                    speedMultiplier === mult
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-black/60 text-emerald-600 hover:text-emerald-400'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
