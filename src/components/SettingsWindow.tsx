import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Trash2,
  Volume2,
  VolumeX,
  Maximize2,
  Monitor,
  Palette,
  User,
  CheckCircle2,
  Key,
  Check,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  Rocket
} from 'lucide-react';
import { UserProfile, authStorage, settingsStorage, SystemSettings } from '../utils/storage';
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
  onSettingsUpdated?: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({
  currentUser,
  onPurgeAccount,
  isMuted,
  onToggleMute,
  currentTheme,
  onSelectTheme,
  isCrtEnabled,
  onToggleCrt,
  onSettingsUpdated
}) => {
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(settingsStorage.getSettings());

  // Change Password State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setSettings(settingsStorage.getSettings());
  }, []);

  const handleUpdateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    terminalSound.playTik();
    const updated = settingsStorage.saveSettings({ [key]: value });
    setSettings(updated);
    if (onSettingsUpdated) onSettingsUpdated();
  };

  const handleToggleFullscreen = () => {
    terminalSound.playTik();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setPasswordMsg({ text: 'NO ACTIVE USER PROFILE REGISTERED', isError: true });
      return;
    }

    if (!authStorage.verifyPassword(currentPasswordInput)) {
      terminalSound.playAccessDenied();
      setPasswordMsg({ text: 'INCORRECT CURRENT PASSWORD', isError: true });
      return;
    }

    if (newPasswordInput.length < 3) {
      terminalSound.playAccessDenied();
      setPasswordMsg({ text: 'NEW PASSWORD MUST BE AT LEAST 3 CHARACTERS', isError: true });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      terminalSound.playAccessDenied();
      setPasswordMsg({ text: 'CONFIRM PASSWORD DOES NOT MATCH', isError: true });
      return;
    }

    const ok = authStorage.updatePassword(newPasswordInput);
    if (ok) {
      terminalSound.playAccessGranted();
      setPasswordMsg({ text: 'PASSWORD ENCRYPTED & SAVED TO LOCAL STORAGE!', isError: false });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => setPasswordMsg(null), 3500);
    }
  };

  const handleExecutePurge = () => {
    terminalSound.playAccessDenied();
    authStorage.clearAll();
    onPurgeAccount();
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono space-y-3.5 select-none overflow-y-auto terminal-scroll pr-1">
      {/* 1. Operator Account & Password Change */}
      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-emerald-500 border-b border-emerald-500/20 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-emerald-300">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            OPERATOR IDENTITY & CREDENTIAL VAULT
          </span>
          <span className="text-[10px] text-emerald-600">ID: SECURE_LOCAL_STORAGE</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-emerald-600 block text-[10px]">OPERATOR CALLSIGN:</span>
            <span className="text-emerald-300 font-bold uppercase">{currentUser?.username || 'GUEST_OPERATOR'}</span>
          </div>
          <div>
            <span className="text-emerald-600 block text-[10px]">TOTAL LOGIN SESSIONS:</span>
            <span className="text-emerald-300 font-bold">{currentUser?.sessionCount || 1}</span>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="pt-2 border-t border-emerald-950/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
            <Key className="w-3 h-3 text-emerald-400" />
            <span>CHANGE OPERATOR PASSWORD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="password"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="CURRENT PASSWORD"
              className="bg-black/80 border border-emerald-500/30 text-emerald-200 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-emerald-400 font-mono"
            />
            <input
              type="password"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="NEW PASSWORD"
              className="bg-black/80 border border-emerald-500/30 text-emerald-200 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-emerald-400 font-mono"
            />
            <input
              type="password"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              placeholder="CONFIRM NEW"
              className="bg-black/80 border border-emerald-500/30 text-emerald-200 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer transition-colors"
            >
              SAVE NEW PASSWORD
            </button>

            {passwordMsg && (
              <span
                className={`text-[10px] font-bold ${
                  passwordMsg.isError ? 'text-rose-400' : 'text-emerald-400 glow-text-green'
                }`}
              >
                {passwordMsg.text}
              </span>
            )}
          </div>
        </form>

        {/* Purge Account Option */}
        <div className="pt-2 border-t border-emerald-950">
          {!confirmPurge ? (
            <button
              onClick={() => {
                terminalSound.playTik();
                setConfirmPurge(true);
              }}
              className="w-full py-1.5 px-3 rounded bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 flex items-center justify-center gap-2 font-bold tracking-wider cursor-pointer transition-colors text-[10px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              PURGE ACCOUNT & RESET LOCAL STORAGE
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
                  className="flex-1 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                >
                  YES, WIPE EVERYTHING
                </button>
                <button
                  onClick={() => setConfirmPurge(false)}
                  className="px-3 py-1 rounded bg-black/60 hover:bg-neutral-800 text-neutral-300 border border-neutral-600 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Startup & Boot Configuration Options */}
      <div className="p-3 rounded-lg bg-black/80 border border-emerald-500/30 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-emerald-500 border-b border-emerald-500/20 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-emerald-300">
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            STARTUP & BOOT SYSTEM PROTOCOLS
          </span>
          <span className="text-[10px] text-emerald-600">AUTO-RUN CONTROL</span>
        </div>

        <div className="space-y-2">
          {/* Toggle: Bypass Lock Screen */}
          <div className="flex items-center justify-between p-2 rounded bg-emerald-950/20 border border-emerald-500/20">
            <div className="space-y-0.5">
              <span className="text-emerald-300 font-bold text-[11px] block">
                BYPASS LOGIN / LOCK SCREEN ON STARTUP
              </span>
              <span className="text-emerald-600 text-[10px] block">
                Skip credential check after boot logs and load the cyber desktop directly.
              </span>
            </div>

            <button
              onClick={() => handleUpdateSetting('skipLockScreen', !settings.skipLockScreen)}
              className="cursor-pointer text-emerald-400 hover:text-emerald-200 transition-colors p-1"
            >
              {settings.skipLockScreen ? (
                <ToggleRight className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_#00ff66]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-600" />
              )}
            </button>
          </div>

          {/* Toggle: Auto-Open All Apps on Boot */}
          <div className="flex items-center justify-between p-2 rounded bg-emerald-950/20 border border-emerald-500/20">
            <div className="space-y-0.5">
              <span className="text-emerald-300 font-bold text-[11px] block">
                AUTO-LAUNCH ALL APPS ON BOOT
              </span>
              <span className="text-emerald-600 text-[10px] block">
                Automatically opens Terminal, Globe, Cracker, Warhead, Miner & Code Typer.
              </span>
            </div>

            <button
              onClick={() => handleUpdateSetting('autoOpenAllApps', !settings.autoOpenAllApps)}
              className="cursor-pointer text-emerald-400 hover:text-emerald-200 transition-colors p-1"
            >
              {settings.autoOpenAllApps ? (
                <ToggleRight className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_#00ff66]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-600" />
              )}
            </button>
          </div>

          {/* Toggle: Advanced Futuristic Warp Entrance Animation */}
          <div className="flex items-center justify-between p-2 rounded bg-emerald-950/20 border border-emerald-500/20">
            <div className="space-y-0.5">
              <span className="text-emerald-300 font-bold text-[11px] block">
                FUTURISTIC HYPERSPACE WARP DESKTOP ENTRANCE
              </span>
              <span className="text-emerald-600 text-[10px] block">
                Cinematic cyber de-cloaking, holographic grid bloom, and sub-bass audio burst.
              </span>
            </div>

            <button
              onClick={() => handleUpdateSetting('warpAnimation', !settings.warpAnimation)}
              className="cursor-pointer text-emerald-400 hover:text-emerald-200 transition-colors p-1"
            >
              {settings.warpAnimation ? (
                <ToggleRight className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_#00ff66]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Audio & Display Theme Preferences */}
      <div className="p-3 rounded-lg bg-black/80 border border-emerald-500/30 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-emerald-500 border-b border-emerald-500/20 pb-1.5">
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
                  handleUpdateSetting('theme', th.id);
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
              handleUpdateSetting('soundMuted', !isMuted);
            }}
            className="p-2 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-[10px]">{isMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE'}</span>
          </button>

          <button
            onClick={() => {
              terminalSound.playTik();
              onToggleCrt();
              handleUpdateSetting('crtEnabled', !isCrtEnabled);
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

      <div className="text-[9px] text-emerald-700 text-center py-1">
        ALL SETTINGS PERMANENTLY STORED IN BROWSER LOCAL STORAGE
      </div>
    </div>
  );
};
