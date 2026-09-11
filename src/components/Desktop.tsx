import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Globe,
  Activity,
  FileCode,
  Settings,
  Lock,
  RotateCcw,
  Minus,
  Square,
  X,
  Volume2,
  VolumeX,
  Code2,
  FolderArchive,
  KeyRound,
  Binary,
  Cpu,
  Key,
  Bomb,
  Coins,
  LayoutGrid,
  Zap,
  Radio
} from 'lucide-react';
import { UserProfile, settingsStorage } from '../utils/storage';
import { terminalSound } from '../utils/terminalSound';
import { RotatingGlobe } from './RotatingGlobe';
import { SystemMonitor } from './SystemMonitor';
import { CmdTerminal } from './CmdTerminal';
import { NotesVault } from './NotesVault';
import { SettingsWindow } from './SettingsWindow';
import { ZDCode } from './ZDCode';
import { FileManager } from './FileManager';
import { CryptoTool } from './CryptoTool';
import { MatrixRain } from './MatrixRain';
import { PasswordCracker } from './PasswordCracker';
import { CyberBomb } from './CyberBomb';
import { CryptoMiner } from './CryptoMiner';

interface DesktopProps {
  currentUser: UserProfile | null;
  onLockSystem: () => void;
  onRebootSystem: () => void;
  onPurgeAccount: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  isCrtEnabled: boolean;
  onToggleCrt: () => void;
}

interface WindowState {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Desktop: React.FC<DesktopProps> = ({
  currentUser,
  onLockSystem,
  onRebootSystem,
  onPurgeAccount,
  isMuted,
  onToggleMute,
  currentTheme,
  onSelectTheme,
  isCrtEnabled,
  onToggleCrt
}) => {
  const initialSettings = settingsStorage.getSettings();

  // Desktop Windows definition
  const [windows, setWindows] = useState<Record<string, WindowState>>(() => {
    const autoOpen = initialSettings.autoOpenAllApps;

    return {
      terminal: {
        id: 'terminal',
        title: 'CMD // SHELL CONSOLE',
        icon: Terminal,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 20,
        x: 105,
        y: 48,
        width: 580,
        height: 450
      },
      globe: {
        id: 'globe',
        title: 'GLOBAL NEURAL MESH RADAR',
        icon: Globe,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 19,
        x: 700,
        y: 48,
        width: 560,
        height: 450
      },
      cracker: {
        id: 'cracker',
        title: 'PASSWORD CRACKER // BRUTE-FORCE MATRIX',
        icon: Key,
        isOpen: autoOpen,
        isMinimized: false,
        isMaximized: false,
        zIndex: 18,
        x: 120,
        y: 220,
        width: 640,
        height: 470
      },
      miner: {
        id: 'miner',
        title: 'QUANTUM CRYPTO MINER // HASH MATRIX',
        icon: Coins,
        isOpen: autoOpen,
        isMinimized: false,
        isMaximized: false,
        zIndex: 17,
        x: 680,
        y: 220,
        width: 630,
        height: 480
      },
      zdcode: {
        id: 'zdcode',
        title: 'ZD CODE // HACKER TYPER',
        icon: Code2,
        isOpen: autoOpen,
        isMinimized: false,
        isMaximized: false,
        zIndex: 16,
        x: 220,
        y: 90,
        width: 640,
        height: 480
      },
      bomb: {
        id: 'bomb',
        title: 'WARHEAD DETONATOR // DEFCON SYSTEM',
        icon: Bomb,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 15,
        x: 320,
        y: 70,
        width: 620,
        height: 520
      },
      files: {
        id: 'files',
        title: 'FILE MANAGER // PAYLOAD VAULT',
        icon: FolderArchive,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 14,
        x: 180,
        y: 80,
        width: 680,
        height: 470
      },
      monitor: {
        id: 'monitor',
        title: 'SYSTEM HARDWARE TELEMETRY',
        icon: Activity,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 13,
        x: 240,
        y: 70,
        width: 640,
        height: 480
      },
      crypto: {
        id: 'crypto',
        title: 'CRYPTO TOOLKIT & HASH ENCODER',
        icon: KeyRound,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 12,
        x: 260,
        y: 85,
        width: 580,
        height: 460
      },
      matrix: {
        id: 'matrix',
        title: 'MATRIX DIGITAL RAIN',
        icon: Binary,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 11,
        x: 320,
        y: 95,
        width: 540,
        height: 430
      },
      notes: {
        id: 'notes',
        title: 'DATA VAULT // SCRATCHPAD',
        icon: FileCode,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
        x: 220,
        y: 80,
        width: 600,
        height: 460
      },
      settings: {
        id: 'settings',
        title: 'SYSTEM SETTINGS & PREFERENCES',
        icon: Settings,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 9,
        x: 280,
        y: 65,
        width: 600,
        height: 520
      }
    };
  });

  const [topZ, setTopZ] = useState<number>(40);
  const [timeString, setTimeString] = useState<string>('');

  // Futuristic Hyperspace Warp Entrance Animation State
  const [showWarpAnimation, setShowWarpAnimation] = useState<boolean>(initialSettings.warpAnimation);
  const [warpProgress, setWarpProgress] = useState<number>(0);

  // Dragging state tracking
  const [dragInfo, setDragInfo] = useState<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  const dragInfoRef = useRef(dragInfo);
  dragInfoRef.current = dragInfo;

  // Trigger Warp Entrance Animation
  useEffect(() => {
    if (!showWarpAnimation) return;

    terminalSound.playWarp();
    const startTime = Date.now();
    const duration = 1400; // 1.4s

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min(1, elapsed / duration);
      setWarpProgress(prog);

      if (prog >= 1) {
        clearInterval(interval);
        setShowWarpAnimation(false);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // Real-time clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global mouse move and up listeners for window dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfoRef.current) return;
      const { id, startX, startY, initX, initY } = dragInfoRef.current;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setWindows((prev) => {
        const win = prev[id];
        if (!win || win.isMaximized) return prev;

        const maxX = Math.max(200, window.innerWidth - 120);
        const maxY = Math.max(200, window.innerHeight - 80);

        const newX = Math.max(10, Math.min(maxX, initX + deltaX));
        const newY = Math.max(38, Math.min(maxY, initY + deltaY));

        return {
          ...prev,
          [id]: {
            ...win,
            x: newX,
            y: newY
          }
        };
      });
    };

    const handleMouseUp = () => {
      if (dragInfoRef.current) {
        setDragInfo(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Bring window to top focus
  const focusWindow = (id: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZ
        }
      };
    });
  };

  const openApp = (id: string) => {
    terminalSound.playTik();
    focusWindow(id);
  };

  const closeWindow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    terminalSound.playTik();
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false
      }
    }));
  };

  const minimizeWindow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    terminalSound.playTik();
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true
      }
    }));
  };

  const toggleMaximize = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    terminalSound.playTik();
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMaximized: !prev[id].isMaximized
      }
    }));
  };

  // Start dragging a window from title bar
  const startDrag = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    focusWindow(id);

    const win = windows[id];
    if (!win || win.isMaximized) return;

    setDragInfo({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initX: win.x,
      initY: win.y
    });
  };

  // Tile / Arrange All Windows across screen
  const handleArrangeWindows = () => {
    terminalSound.playTik();
    const openIds = Object.keys(windows).filter((id) => windows[id].isOpen);
    if (openIds.length === 0) return;

    const screenW = window.innerWidth - 120;
    const screenH = window.innerHeight - 80;

    let cols = 2;
    if (openIds.length >= 5) cols = 3;

    const rows = Math.ceil(openIds.length / cols);
    const cellW = Math.max(380, Math.floor(screenW / cols) - 10);
    const cellH = Math.max(300, Math.floor(screenH / rows) - 10);

    setWindows((prev) => {
      const next = { ...prev };
      openIds.forEach((id, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        next[id] = {
          ...next[id],
          isMaximized: false,
          isMinimized: false,
          x: 105 + col * (cellW + 10),
          y: 44 + row * (cellH + 10),
          width: cellW,
          height: cellH
        };
      });
      return next;
    });
  };

  // Launchers on the desktop dock / launcher strip
  const desktopApps = [
    { id: 'terminal', label: 'CMD // SHELL', icon: Terminal },
    { id: 'cracker', label: 'PW CRACKER', icon: Key },
    { id: 'bomb', label: 'WARHEAD DET', icon: Bomb },
    { id: 'miner', label: 'CRYPTO MINER', icon: Coins },
    { id: 'zdcode', label: 'ZD CODE', icon: Code2 },
    { id: 'globe', label: 'NEURAL RADAR', icon: Globe },
    { id: 'files', label: 'FILE VAULT', icon: FolderArchive },
    { id: 'monitor', label: 'TELEMETRY', icon: Activity },
    { id: 'crypto', label: 'CRYPTO TOOL', icon: KeyRound },
    { id: 'matrix', label: 'MATRIX RAIN', icon: Binary },
    { id: 'notes', label: 'SCRATCHPAD', icon: FileCode },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col justify-between bg-black text-emerald-400 select-none relative font-mono">
      {/* ─────────────────────────────────────────────────────────────
          FUTURISTIC HYPERSPACE WARP DESKTOP ENTRANCE OVERLAY
         ───────────────────────────────────────────────────────────── */}
      {showWarpAnimation && (
        <div
          onClick={() => setShowWarpAnimation(false)}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-auto cursor-pointer transition-opacity duration-300"
          style={{ opacity: 1 - Math.max(0, (warpProgress - 0.7) / 0.3) }}
        >
          {/* Hyperspace tunnel rings */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div
              className="w-96 h-96 rounded-full border border-emerald-400/40 transition-transform duration-75"
              style={{ transform: `scale(${1 + warpProgress * 4})`, opacity: 1 - warpProgress }}
            />
            <div
              className="w-64 h-64 rounded-full border border-dashed border-emerald-300/60 transition-transform duration-75"
              style={{ transform: `scale(${1 + warpProgress * 6}) rotate(${warpProgress * 180}deg)` }}
            />
            <div
              className="w-32 h-32 rounded-full border-2 border-emerald-400 shadow-[0_0_50px_#00ff66] transition-transform duration-75"
              style={{ transform: `scale(${1 + warpProgress * 8})` }}
            />
          </div>

          {/* Central Hologram Banner */}
          <div className="relative z-10 text-center space-y-3 p-6 max-w-lg">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-950/80 border border-emerald-400 shadow-[0_0_30px_#00ff66] animate-pulse">
              <Zap className="w-8 h-8 text-emerald-300" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-emerald-300 glow-text-green tracking-[0.25em] uppercase">
              INITIALIZING NEXUS // WORKSTATION
            </h1>

            <div className="space-y-1 text-xs text-emerald-400 font-mono tracking-wider">
              <div>[+] BYPASSING SUB-ORBITAL FIREWALLS: DONE</div>
              <div>[+] QUANTUM THREAD ENCLAVE: SYNCHRONIZED</div>
              <div className="text-emerald-300 font-bold">
                [+] DE-CLOAKING DESKTOP ENVIRONMENT...
              </div>
            </div>

            <div className="w-64 h-1.5 bg-black/80 rounded-full mx-auto overflow-hidden border border-emerald-500/40">
              <div
                className="h-full bg-emerald-400 shadow-[0_0_12px_#00ff66] transition-all duration-75"
                style={{ width: `${warpProgress * 100}%` }}
              />
            </div>

            <div className="text-[9px] text-emerald-600">CLICK ANYWHERE OR PRESS ESC TO SKIP</div>
          </div>
        </div>
      )}

      {/* Top Cyber Status / Telemetry Bar */}
      <header className="w-full bg-black/90 border-b border-emerald-500/30 px-4 py-1.5 flex items-center justify-between text-xs z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-emerald-300 tracking-wider">
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="glow-text-green font-black">NEXUS // OS</span>
            <span className="text-[10px] text-emerald-600 hidden sm:inline">
              QUANTUM-KERNEL v9.4
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-emerald-600 border-l border-emerald-500/20 pl-3">
            <span>OPERATOR:</span>
            <span className="text-emerald-300 font-bold">
              {currentUser ? currentUser.username.toUpperCase() : 'ROOT'}
            </span>
          </div>
        </div>

        {/* Center System Specs & Tile Windows Action */}
        <div className="flex items-center gap-3 text-[10px] text-emerald-500">
          <button
            onClick={handleArrangeWindows}
            className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Tile and Arrange All Open Windows"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span>ARRANGE ALL</span>
          </button>

          <span className="hidden lg:flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff66]" />
            SECURE LINK: ESTABLISHED (AES-512)
          </span>
          <span className="hidden lg:inline">THEME: {currentTheme.toUpperCase()}</span>
        </div>

        {/* Right Tools & Clock */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Synthesizer Audio' : 'Mute Synthesizer Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onLockSystem}
            className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
            title="Lock Terminal Session"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={onRebootSystem}
            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
            title="Reboot System"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="border-l border-emerald-500/20 pl-2 text-emerald-300 font-bold text-xs tracking-widest">
            {timeString}
          </div>
        </div>
      </header>

      {/* Main Desktop Stage Area */}
      <main className="flex-1 w-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-black to-black">
        {/* Ambient Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff6608_1px,transparent_1px),linear-gradient(to_bottom,#00ff6608_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Desktop Application Launchers Column */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-h-[calc(100vh-110px)] overflow-y-auto terminal-scroll pr-1">
          {desktopApps.map((app) => {
            const IconComp = app.icon;
            const isOpen = windows[app.id]?.isOpen;

            return (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                className="group flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-150 hover:bg-emerald-950/60 border border-transparent hover:border-emerald-500/40 cursor-pointer w-20 text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-black/80 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(0,255,102,0.35)] group-hover:border-emerald-400 transition-all relative">
                  <IconComp className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                  {isOpen && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_6px_#00ff66]" />
                  )}
                </div>
                <span className="mt-1 text-[9px] text-emerald-600 group-hover:text-emerald-300 font-mono tracking-wider font-bold truncate w-full">
                  {app.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Draggable Windows Rendering Layer */}
        <div className="w-full h-full relative z-20 pointer-events-none">
          {(Object.values(windows) as WindowState[]).map((win) => {
            if (!win.isOpen || win.isMinimized) return null;

            const IconComp = win.icon;
            const isMax = win.isMaximized;

            return (
              <div
                key={win.id}
                onClick={() => focusWindow(win.id)}
                style={
                  isMax
                    ? { zIndex: win.zIndex }
                    : {
                        left: `${win.x}px`,
                        top: `${win.y}px`,
                        width: `${win.width}px`,
                        height: `${win.height}px`,
                        zIndex: win.zIndex
                      }
                }
                className={`pointer-events-auto transition-shadow absolute flex flex-col bg-black/95 border-2 border-emerald-500/50 rounded-xl shadow-2xl backdrop-blur-xl ${
                  isMax ? 'inset-2 sm:inset-4' : 'max-w-[95vw] max-h-[85vh]'
                }`}
              >
                {/* Cyber Window Header Bar - DRAGGABLE */}
                <div
                  onMouseDown={(e) => startDrag(win.id, e)}
                  onDoubleClick={() => toggleMaximize(win.id)}
                  className={`px-3 py-2 bg-emerald-950/70 border-b border-emerald-500/30 flex items-center justify-between select-none ${
                    isMax ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 tracking-wider">
                    <IconComp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{win.title}</span>
                  </div>

                  {/* Window Controls */}
                  <div
                    className="flex items-center gap-1 text-emerald-600 shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => minimizeWindow(win.id, e)}
                      className="p-1 hover:text-emerald-300 hover:bg-emerald-500/20 rounded cursor-pointer transition-colors"
                      title="Minimize Window"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleMaximize(win.id, e)}
                      className="p-1 hover:text-emerald-300 hover:bg-emerald-500/20 rounded cursor-pointer transition-colors"
                      title={isMax ? 'Restore Window Size' : 'Maximize Window'}
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => closeWindow(win.id, e)}
                      className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer transition-colors"
                      title="Close Window"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cyber Window Content Stage */}
                <div className="flex-1 p-3 overflow-hidden relative">
                  {win.id === 'terminal' && (
                    <CmdTerminal
                      username={currentUser ? currentUser.username : 'root'}
                      onOpenApp={openApp}
                      onLockSystem={onLockSystem}
                      onRebootSystem={onRebootSystem}
                      onChangeTheme={onSelectTheme}
                    />
                  )}

                  {win.id === 'cracker' && <PasswordCracker />}

                  {win.id === 'bomb' && <CyberBomb />}

                  {win.id === 'miner' && <CryptoMiner />}

                  {win.id === 'zdcode' && <ZDCode />}

                  {win.id === 'globe' && <RotatingGlobe />}

                  {win.id === 'files' && <FileManager />}

                  {win.id === 'monitor' && <SystemMonitor />}

                  {win.id === 'crypto' && <CryptoTool />}

                  {win.id === 'matrix' && <MatrixRain />}

                  {win.id === 'notes' && <NotesVault />}

                  {win.id === 'settings' && (
                    <SettingsWindow
                      currentUser={currentUser}
                      onPurgeAccount={onPurgeAccount}
                      currentTheme={currentTheme}
                      onSelectTheme={onSelectTheme}
                      isCrtEnabled={isCrtEnabled}
                      onToggleCrt={onToggleCrt}
                      isMuted={isMuted}
                      onToggleMute={onToggleMute}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Cyber Taskbar / Dock */}
      <footer className="w-full bg-black/90 border-t border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs z-40 backdrop-blur-md">
        {/* Active Taskbar Windows */}
        <div className="flex items-center gap-2 overflow-x-auto terminal-scroll">
          {(Object.values(windows) as WindowState[]).map((win) => {
            const IconComp = win.icon;
            if (!win.isOpen) return null;
            return (
              <button
                key={win.id}
                onClick={() => {
                  terminalSound.playTik();
                  if (win.isMinimized) {
                    focusWindow(win.id);
                  } else {
                    minimizeWindow(win.id);
                  }
                }}
                className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono shrink-0 ${
                  !win.isMinimized
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_8px_rgba(0,255,102,0.2)]'
                    : 'bg-black/50 border-emerald-500/30 text-emerald-600 hover:text-emerald-400'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">{win.title.split('//')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Launch Drawer */}
        <div className="flex items-center gap-3 text-[10px] text-emerald-600 shrink-0 border-l border-emerald-500/20 pl-3">
          <button
            onClick={() => openApp('settings')}
            className="hover:text-emerald-300 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
          <span className="hidden md:inline">&bull;</span>
          <span className="hidden md:inline">QUANTUM MATRIX: ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};
