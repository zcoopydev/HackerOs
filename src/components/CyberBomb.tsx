import React, { useState, useEffect, useRef } from 'react';
import {
  Bomb,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Crosshair,
  Volume2,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface TargetOption {
  id: string;
  name: string;
  coords: string;
  yield: string;
  type: string;
}

const TARGETS: TargetOption[] = [
  { id: 't1', name: 'ORBITAL ION SATELLITE ARRAY', coords: '35.6762°N, 139.6503°E [GEO-SYNC]', yield: '150 TERA-WATT EMP', type: 'SPACE-BORNE' },
  { id: 't2', name: 'SUBSEA OPTICAL BACKBONE TRUNK', coords: '38.8951°N, 77.0364°W [ATLANTIC-01]', yield: 'TOTAL DATA PURGE', type: 'INFRASTRUCTURE' },
  { id: 't3', name: 'QUANTUM MAINFRAME ENCLAVE', coords: '46.2044°N, 6.1432°E [SUB-TERRAIN]', yield: 'LOGIC MELTDOWN', type: 'CORE MATRIX' },
  { id: 't4', name: 'GLOBAL POWER GRID SYNCHRONIZER', coords: '51.5074°N, 0.1278°W [SECTOR-9]', yield: 'BLACKOUT OVERRIDE', type: 'POWER GRID' }
];

export const CyberBomb: React.FC = () => {
  const [defcon, setDefcon] = useState<number>(3);
  const [selectedTarget, setSelectedTarget] = useState<TargetOption>(TARGETS[0]);
  const [keyAArmed, setKeyAArmed] = useState<boolean>(false);
  const [keyBArmed, setKeyBArmed] = useState<boolean>(false);
  const [safetyCoverOpen, setSafetyCoverOpen] = useState<boolean>(false);

  // Countdown state
  const [countdownSeconds, setCountdownSeconds] = useState<number>(30);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(30000);
  const [isDetonated, setIsDetonated] = useState<boolean>(false);

  // Defusal system
  const [defuseCode, setDefuseCode] = useState<string>('ALPHA-99');
  const [defuseInput, setDefuseInput] = useState<string>('');
  const [defuseMessage, setDefuseMessage] = useState<string>('');

  const countdownIntervalRef = useRef<number | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  const isBothKeysArmed = keyAArmed && keyBArmed;

  // Countdown timer engine
  useEffect(() => {
    if (!isCountingDown) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      return;
    }

    // Siren loop
    terminalSound.playSiren();
    sirenIntervalRef.current = window.setInterval(() => {
      terminalSound.playSiren();
    }, 850);

    const startTime = Date.now();
    const targetMs = timeLeftMs;

    let lastSecondBeep = Math.ceil(targetMs / 1000);

    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, targetMs - elapsed);
      setTimeLeftMs(remaining);

      const currentSecond = Math.ceil(remaining / 1000);
      if (currentSecond !== lastSecondBeep && currentSecond > 0) {
        lastSecondBeep = currentSecond;
        terminalSound.playCountdownBeep(currentSecond <= 5);
      }

      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
        setIsCountingDown(false);
        setIsDetonated(true);
        terminalSound.playDetonation();
      }
    }, 30);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    };
  }, [isCountingDown]);

  const handleStartCountdown = () => {
    if (!isBothKeysArmed) return;
    terminalSound.playCountdownBeep(true);
    // Generate new random defusal override code
    const codes = ['NEXUS-77', 'OVERRIDE-0', 'CIPHER-X', 'KILL-SWITCH', 'DEFCON-ZERO'];
    setDefuseCode(codes[Math.floor(Math.random() * codes.length)]);
    setTimeLeftMs(countdownSeconds * 1000);
    setIsDetonated(false);
    setIsCountingDown(true);
    setDefuseInput('');
    setDefuseMessage('');
  };

  const handleDefuseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (defuseInput.trim().toUpperCase() === defuseCode) {
      terminalSound.playAccessGranted();
      setIsCountingDown(false);
      setDefuseMessage('DEFUSAL SUCCESSFUL. WARHEAD DEACTIVATED.');
    } else {
      terminalSound.playAccessDenied();
      setDefuseMessage('INCORRECT OVERRIDE KEY! TIME PENALTY -5s!');
      setTimeLeftMs((prev) => Math.max(1000, prev - 5000));
    }
  };

  const handleReset = () => {
    terminalSound.playTik();
    setIsCountingDown(false);
    setIsDetonated(false);
    setKeyAArmed(false);
    setKeyBArmed(false);
    setSafetyCoverOpen(false);
    setTimeLeftMs(countdownSeconds * 1000);
    setDefuseMessage('');
    setDefuseInput('');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-2 relative overflow-hidden">
      {/* Detonation Flash Overlay */}
      {isDetonated && (
        <div className="absolute inset-0 z-50 bg-rose-950/95 border-4 border-rose-500 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pulse">
          <Flame className="w-16 h-16 text-rose-500 animate-bounce" />
          <div className="text-2xl font-black tracking-widest text-rose-300 glow-text-crimson">
            DETONATION SEQUENCE COMPLETE
          </div>
          <div className="text-sm text-rose-400 max-w-md">
            CRITICAL EMP SHOCKWAVE DISCHARGED INTO {selectedTarget.name}.
            ALL TARGET SUBSYSTEMS HAVE BEEN ANNIHILATED.
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RE-INITIALIZE WARHEAD SYSTEM
          </button>
        </div>
      )}

      {/* Top Header: DEFCON Bar & Status */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-500/30 text-[11px] text-rose-400">
        <div className="flex items-center gap-2">
          <Bomb className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="font-bold tracking-wider text-rose-300">
            WARHEAD ACTIVATION // DEFCON DETONATION SYSTEM
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[5, 4, 3, 2, 1].map((level) => (
            <button
              key={level}
              onClick={() => {
                terminalSound.playTik();
                setDefcon(level);
              }}
              className={`px-2 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-all ${
                defcon === level
                  ? level === 1
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_8px_#ff0055]'
                    : level === 2
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-black/60 border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              DEFCON {level}
            </button>
          ))}
        </div>
      </div>

      {/* Target Selector & Coordinates HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="p-2.5 rounded bg-black/80 border border-rose-500/30 space-y-1">
          <span className="text-[10px] text-rose-500 font-bold block">SELECT STRIKE VECTOR:</span>
          <select
            value={selectedTarget.id}
            onChange={(e) => {
              terminalSound.playTik();
              const found = TARGETS.find((t) => t.id === e.target.value);
              if (found) setSelectedTarget(found);
            }}
            className="w-full bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs rounded p-1.5 focus:outline-none"
          >
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id} className="bg-black text-rose-300">
                {t.name}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-rose-400/80 pt-1 flex justify-between">
            <span>TYPE: {selectedTarget.type}</span>
            <span>YIELD: {selectedTarget.yield}</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-black/80 border border-rose-500/30 space-y-1">
          <span className="text-[10px] text-rose-500 font-bold block">TARGET COORDINATES:</span>
          <div className="text-xs text-rose-300 font-mono flex items-center gap-1.5 bg-black p-1.5 rounded border border-rose-900">
            <Crosshair className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{selectedTarget.coords}</span>
          </div>
          <div className="text-[9px] text-rose-500 flex justify-between pt-0.5">
            <span>SATELLITE LOCK: ACTIVE</span>
            <span>TRAJECTORY: CONFIRMED</span>
          </div>
        </div>
      </div>

      {/* Main Countdown Display / Detonation Trigger Center */}
      <div
        className={`p-4 rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300 ${
          isCountingDown
            ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(255,0,85,0.4)] animate-pulse'
            : 'bg-black/90 border-rose-500/30'
        }`}
      >
        {/* Flashing Warning Beacon */}
        {isCountingDown && (
          <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] text-rose-300 font-bold animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            WARHEAD COUNTDOWN ACTIVE!
          </div>
        )}

        {/* Big LED Digital Clock */}
        <div className="text-center py-1">
          <div className="text-[10px] text-rose-500 font-bold tracking-widest uppercase">
            DETONATION T-MINUS
          </div>
          <div className="text-4xl sm:text-5xl font-mono font-black text-rose-400 tracking-wider glow-text-crimson drop-shadow-[0_0_12px_#ff0055]">
            {(timeLeftMs / 1000).toFixed(2)}s
          </div>
        </div>

        {/* Dual Authorization Keys */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-2 pt-2 border-t border-rose-500/20">
          <button
            onClick={() => {
              terminalSound.playTik();
              setKeyAArmed(!keyAArmed);
            }}
            disabled={isCountingDown}
            className={`p-2 rounded border flex flex-col items-center gap-1 cursor-pointer transition-all ${
              keyAArmed
                ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                : 'bg-black/80 border-neutral-800 text-neutral-500'
            }`}
          >
            {keyAArmed ? <Unlock className="w-4 h-4 text-rose-400" /> : <Lock className="w-4 h-4 text-neutral-600" />}
            <span className="text-[10px] font-bold">{keyAArmed ? 'KEY A: ARMED' : 'KEY A: SAFE'}</span>
          </button>

          <button
            onClick={() => {
              terminalSound.playTik();
              setKeyBArmed(!keyBArmed);
            }}
            disabled={isCountingDown}
            className={`p-2 rounded border flex flex-col items-center gap-1 cursor-pointer transition-all ${
              keyBArmed
                ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                : 'bg-black/80 border-neutral-800 text-neutral-500'
            }`}
          >
            {keyBArmed ? <Unlock className="w-4 h-4 text-rose-400" /> : <Lock className="w-4 h-4 text-neutral-600" />}
            <span className="text-[10px] font-bold">{keyBArmed ? 'KEY B: ARMED' : 'KEY B: SAFE'}</span>
          </button>
        </div>

        {/* Master Detonation Button with Acrylic Shield */}
        <div className="mt-3 flex flex-col items-center">
          {!safetyCoverOpen ? (
            <button
              onClick={() => {
                terminalSound.playTik();
                setSafetyCoverOpen(true);
              }}
              className="px-4 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white cursor-pointer text-[10px] flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              FLIP OPEN SAFETY COVER
            </button>
          ) : !isCountingDown ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartCountdown}
                disabled={!isBothKeysArmed}
                className={`px-6 py-2.5 rounded-lg border font-black text-sm tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer ${
                  isBothKeysArmed
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_#ff0055] animate-pulse'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <Flame className="w-4 h-4" />
                INITIATE LAUNCH
              </button>

              <button
                onClick={() => setSafetyCoverOpen(false)}
                className="px-2 py-2 rounded bg-black/60 border border-neutral-800 text-neutral-500 text-[10px] cursor-pointer"
              >
                CLOSE COVER
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Emergency Abort / Defusal Console */}
      {isCountingDown && (
        <form
          onSubmit={handleDefuseSubmit}
          className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="flex-1 w-full text-left space-y-0.5">
            <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-spin" />
              EMERGENCY DEFUSAL OVERRIDE
            </div>
            <div className="text-[9px] text-rose-300">
              ENTER CIPHER KEY: <span className="font-bold underline text-white">{defuseCode}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={defuseInput}
              onChange={(e) => setDefuseInput(e.target.value)}
              placeholder="ENTER CIPHER..."
              className="bg-black/90 border border-rose-500 text-rose-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer text-xs"
            >
              DEFUSE
            </button>
          </div>
        </form>
      )}

      {defuseMessage && (
        <div className="p-2 rounded bg-black/80 border border-rose-500/40 text-center text-xs text-rose-300 font-bold">
          {defuseMessage}
        </div>
      )}
    </div>
  );
};
