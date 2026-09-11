import React, { useState } from 'react';
import { ShieldAlert, Trash2, Volume2, VolumeX, Maximize2, Monitor, Palette, User, CheckCircle2 } from 'lucide-react';
import { UserProfile, authStorage } from '../utils/storage';
import { terminalSound } from '../utils/terminalSound';

interface SettingsWindowProps {
  currentUser: UserProfile | null;
  onPurgeAccount: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  isCrtEnabled: boolean;
  onToggleCrt: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({
  currentUser,
  onPurgeAccount,
  isMuted,
  onToggleMute,
  currentTheme,
  onSelectTheme,
  isCrtEnabled,
  onToggleCrt
}) => {
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handleToggleFullscreen = () => {
    terminalSound.playTik();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleExecutePurge = () => {
    terminalSound.playAccessDenied();
    authStorage.clearAll();
    onPurgeAccount();
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono space-y-4 select-none">
      {/* 1. Operator Account Section */}
      <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-500 border-b border-emerald-500/20 pb-2">
          <span className="flex items-center gap-1.5 font-bold text-emerald-300">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            OPERATOR IDENTITY & LOCAL STORAGE
          </span>
          <span className="text-[10px] text-emerald-600">ID: SECURE_LOCAL_VAULT</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div>
            <span className="text-emerald-600 block text-[10px]">CALLSIGN / OPERATOR:</span>
            <span className="text-emerald-300 font-bold uppercase">{currentUser?.username || 'GUEST_USER'}</span>
          </div>
          <div>
            <span className="text-emerald-600 block text-[10px]">TOTAL LOGIN SESSIONS:</span>
            <span className="text-emerald-300 font-bold">{currentUser?.sessionCount || 1}</span>
          </div>
          <div>
            <span className="text-emerald-600 block text-[10px]">ENCRYPTION KEY:</span>
            <span className="text-emerald-400">•••••••• (AES-512)</span>
          </div>
          <div>
            <span className="text-emerald-600 block text-[10px]">STORAGE RESIDENCE:</span>
            <span className="text-emerald-400">MACHINE LOCAL STORAGE</span>
          </div>
        </div>

        {/* Purge Account & Reset Button */}
        <div className="pt-2 border-t border-emerald-950">
          {!confirmPurge ? (
            <button
              onClick={() => {
                terminalSound.playTik();
                setConfirmPurge(true);
              }}
              className="w-full py-2 px-3 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 flex items-center justify-center gap-2 font-bold tracking-wider cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              PURGE ACCOUNT & WIPE LOCAL DATA
            </button>
          ) : (
            <div className="p-2.5 rounded bg-rose-950/80 border border-rose-500 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-[11px]">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>CONFIRM DATA WIPEOUT? THIS PERMANENTLY REMOVES CREDENTIALS.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecutePurge}
                  className="flex-1 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                >
                  YES, WIPE EVERYTHING
                </button>
                <button
                  onClick={() => setConfirmPurge(false)}
                  className="px-3 py-1.5 rounded bg-black/60 hover:bg-neutral-800 text-neutral-300 border border-neutral-600 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Audio & Display Theme Preferences */}
      <div className="p-3.5 rounded-lg bg-black/70 border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-emerald-500 border-b border-emerald-500/20 pb-2">
          <span className="flex items-center gap-1.5 font-bold text-emerald-300">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            PHOSPHOR CRT THEME & APPEARANCE
          </span>
        </div>

        {/* Color Theme Selector */}
        <div>
          <span className="text-[10px] text-emerald-600 mb-1.5 block">SELECT TERMINAL PHOSPHOR COLOR:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'emerald', name: 'EMERALD GREEN', color: '#00ff66', border: 'border-emerald-400' },
              { id: 'cyan', name: 'ELECTRIC CYAN', color: '#00e5ff', border: 'border-cyan-400' },
              { id: 'amber', name: 'AMBER RETRO', color: '#ffb300', border: 'border-amber-400' },
              { id: 'crimson', name: 'CRIMSON BREACH', color: '#ff2a5f', border: 'border-rose-400' }
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => {
                  terminalSound.playTik();
                  onSelectTheme(th.id);
                }}
                className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
                  currentTheme === th.id
                    ? `${th.border} bg-white/10 text-white font-bold`
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.color }} />
                  <span className="text-[10px]">{th.name.split(' ')[0]}</span>
                </div>
                {currentTheme === th.id && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toggles: Audio, CRT scanlines, Fullscreen */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-950/60">
          <button
            onClick={() => {
              terminalSound.playTik();
              onToggleMute();
            }}
            className="p-2 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-[10px]">{isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
          </button>

          <button
            onClick={() => {
              terminalSound.playTik();
              onToggleCrt();
            }}
            className="p-2 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px]">{isCrtEnabled ? 'SCANLINES: ON' : 'SCANLINES: OFF'}</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px]">FULLSCREEN</span>
          </button>
        </div>
      </div>

      <div className="text-[9px] text-emerald-700 text-center">
        CHANGES PERSIST AUTOMATICALLY TO CLIENT LOCAL STORAGE
      </div>
    </div>
  );
};
