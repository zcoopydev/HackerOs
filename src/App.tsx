import React, { useState, useEffect, useRef } from 'react';
import { Power } from 'lucide-react';
import { HackerLogo } from './components/HackerLogo';
import { LockScreen } from './components/LockScreen';
import { Desktop } from './components/Desktop';
import { REAL_LINUX_BOOT_LOGS, LinuxBootLog } from './data/bootLogs';
import { terminalSound } from './utils/terminalSound';
import { UserProfile, authStorage } from './utils/storage';

type SystemState = 'standby' | 'logo' | 'logs' | 'lock' | 'desktop';

interface DisplayLog extends LinuxBootLog {
  id: number;
  timestampStr?: string;
}

export default function App() {
  const [systemState, setSystemState] = useState<SystemState>('standby');
  const [isLogoFading, setIsLogoFading] = useState<boolean>(false);
  const [logs, setLogs] = useState<DisplayLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // System Customization Settings
  const [currentTheme, setCurrentTheme] = useState<string>('emerald');
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef<boolean>(false);
  const timeoutIdRef = useRef<number | null>(null);

  // Check existing credentials & load saved preferences on start
  useEffect(() => {
    const user = authStorage.getUser();
    if (user) {
      setCurrentUser(user);
    }
    const savedTheme = localStorage.getItem('nexus_os_theme');
    if (savedTheme) setCurrentTheme(savedTheme);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (terminalEndRef.current && systemState === 'logs') {
      terminalEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [logs, systemState]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const handleSelectTheme = (theme: string) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('nexus_os_theme', theme);
    } catch {}
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    terminalSound.toggleMute();
  };

  const handleToggleCrt = () => {
    setIsCrtEnabled(!isCrtEnabled);
  };

  // 1. User presses BOOT button
  const handleStartBoot = async () => {
    // Attempt fullscreen
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (document.documentElement as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
      }
    } catch {
      // Ignore if browser policy restricts
    }

    // Play power switch / CRT capacitor hum
    terminalSound.playBootPower();

    // Transition: Boot button disappears, Logo appears in the center
    setSystemState('logo');
    setIsLogoFading(false);
    setLogs([]);

    // Logo stays centered and animated for 1.8s, then fades out over 800ms
    setTimeout(() => {
      setIsLogoFading(true);

      setTimeout(() => {
        // Logo is completely gone. Transition to PURE LOGS on black screen
        setSystemState('logs');
        startLoggingSequence();
      }, 800);
    }, 1800);
  };

  // 2. Sequential Log Streamer with Dynamic Speed & Natural Pauses
  const startLoggingSequence = () => {
    isRunningRef.current = true;
    const startTime = Date.now();
    let index = 0;

    const processNextLine = () => {
      if (!isRunningRef.current) return;

      if (index >= REAL_LINUX_BOOT_LOGS.length) {
        // Boot completed!
        terminalSound.playBootReady();

        // Pause briefly after final log line, then automatically transition to the LOCK SCREEN
        timeoutIdRef.current = window.setTimeout(() => {
          setSystemState('lock');
        }, 800);
        return;
      }

      const item = REAL_LINUX_BOOT_LOGS[index];
      const elapsed = (Date.now() - startTime) / 1000;
      const formattedTimestamp = `[    ${elapsed.toFixed(6).padStart(8, '0')}]`;

      setLogs((prev) => [
        ...prev,
        {
          ...item,
          id: index,
          timestampStr: formattedTimestamp
        }
      ]);

      // Mechanical teletype "tik" sound
      terminalSound.playTik();

      // Determine delay for the next line
      let nextDelay = 120; // default normal speed

      if (item.pauseAfterMs) {
        nextDelay = item.pauseAfterMs;
      } else if (item.speedClass === 'blitz') {
        nextDelay = Math.floor(18 + Math.random() * 15); // ~18-33ms
      } else {
        nextDelay = Math.floor(90 + Math.random() * 50); // ~90-140ms
      }

      index++;
      timeoutIdRef.current = window.setTimeout(processNextLine, nextDelay);
    };

    // Kick off first log line
    timeoutIdRef.current = window.setTimeout(processNextLine, 60);
  };

  // 3. Handle Lock Screen Success -> Transition into the Desktop Interface!
  const handleUnlockSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setSystemState('desktop');
  };

  const handleResetSystem = () => {
    setCurrentUser(null);
    setSystemState('standby');
    setLogs([]);
  };

  const handlePurgeAccount = () => {
    setCurrentUser(null);
    setSystemState('standby');
    setLogs([]);
  };

  const handleReboot = () => {
    isRunningRef.current = false;
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    handleStartBoot();
  };

  const handleLock = () => {
    terminalSound.playTik();
    setSystemState('lock');
  };

  const getThemeClass = () => {
    if (currentTheme === 'cyan') return 'theme-cyan';
    if (currentTheme === 'amber') return 'theme-amber';
    if (currentTheme === 'crimson') return 'theme-crimson';
    return '';
  };

  return (
    <main
      className={`min-h-screen w-full bg-black text-emerald-400 font-mono select-none overflow-x-hidden relative ${getThemeClass()}`}
    >
      {/* Authentic CRT scanline overlay if enabled */}
      {isCrtEnabled && <div className="crt-overlay fixed inset-0 pointer-events-none z-50" />}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 1: STANDBY - ONLY BOOT BUTTON ON BLANK BLACK SCREEN
         ───────────────────────────────────────────────────────────── */}
      {systemState === 'standby' && (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative">
          <button
            id="boot-button"
            onClick={handleStartBoot}
            aria-label="Boot System"
            className="group relative cursor-pointer flex flex-col items-center justify-center p-10 rounded-full transition-all duration-500 hover:scale-110 active:scale-95 focus:outline-none"
          >
            {/* Pulsing Concentric Aura */}
            <div className="absolute w-40 h-40 rounded-full border border-emerald-500/20 group-hover:border-emerald-400/60 group-hover:scale-125 transition-all duration-700 animate-pulse" />
            <div className="absolute w-32 h-32 rounded-full border border-dashed border-emerald-400/30 group-hover:border-emerald-400/80 animate-[spin_12s_linear_infinite]" />

            {/* Glowing Core Boot Button */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-950/40 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(0,255,102,0.4)] group-hover:shadow-[0_0_60px_rgba(0,255,102,0.8)] transition-all">
              <Power className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-300 drop-shadow-[0_0_12px_#00ff66]" />
            </div>

            {/* Clean Custom OS Label */}
            <span className="mt-6 text-xs sm:text-sm tracking-[0.4em] text-emerald-500 group-hover:text-emerald-300 font-bold uppercase transition-colors glow-text-green">
              INITIALIZE NEXUS // OS
            </span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 2: CENTER LOGO REVEAL (ANIMATES IN, THEN FADES AWAY)
         ───────────────────────────────────────────────────────────── */}
      {systemState === 'logo' && (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
          <HackerLogo isFadingOut={isLogoFading} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 3: CLEAN LOGS ON BLACK SCREEN (NO UNWANTED BRANDING)
         ───────────────────────────────────────────────────────────── */}
      {systemState === 'logs' && (
        <div className="min-h-screen w-full p-3 sm:p-6 text-xs sm:text-sm leading-relaxed overflow-y-auto">
          <div className="w-full font-mono space-y-1">
            {logs.map((log) => {
              if (log.type === 'dmesg') {
                return (
                  <div key={log.id} className="flex items-start text-neutral-300">
                    <span className="text-emerald-500/80 shrink-0 select-none mr-2 font-mono">
                      {log.timestampStr}
                    </span>
                    <span className="text-neutral-200 break-all">{log.text}</span>
                  </div>
                );
              }

              if (log.tag === 'OK') {
                return (
                  <div key={log.id} className="flex items-start">
                    <span className="text-neutral-500 select-none mr-2 font-mono">[</span>
                    <span className="text-emerald-400 font-bold select-none glow-text-green">  OK  </span>
                    <span className="text-neutral-500 select-none mr-2 font-mono">]</span>
                    <span className={log.type === 'target' ? 'text-cyan-300 font-semibold' : 'text-neutral-200'}>
                      {log.text}
                    </span>
                  </div>
                );
              }

              if (log.type === 'ready') {
                return (
                  <div key={log.id} className="pt-2 pb-1 text-emerald-400 font-bold glow-text-green">
                    &gt;&gt; {log.text}
                  </div>
                );
              }

              return (
                <div key={log.id} className="text-emerald-400">
                  {log.text}
                </div>
              );
            })}

            <div className="flex items-center gap-2 pt-1 text-emerald-400">
              <span className="animate-spin font-bold text-emerald-300">/</span>
              <span className="text-xs text-emerald-600 font-mono tracking-wider">
                launching security controller...
              </span>
            </div>

            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 4: LOCK SCREEN / CREDENTIAL VERIFICATION
         ───────────────────────────────────────────────────────────── */}
      {systemState === 'lock' && (
        <LockScreen
          onUnlockSuccess={handleUnlockSuccess}
          onResetSystem={handleResetSystem}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 5: FULL CYBER DESKTOP INTERFACE
         ───────────────────────────────────────────────────────────── */}
      {systemState === 'desktop' && (
        <Desktop
          currentUser={currentUser}
          onLockSystem={handleLock}
          onRebootSystem={handleReboot}
          onPurgeAccount={handlePurgeAccount}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          isCrtEnabled={isCrtEnabled}
          onToggleCrt={handleToggleCrt}
        />
      )}
    </main>
  );
}
