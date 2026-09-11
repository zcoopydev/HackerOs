import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, AlertTriangle, CheckCircle, UserCheck, Eye, EyeOff, Lock, UserPlus, RefreshCw } from 'lucide-react';
import { UserProfile, authStorage } from '../utils/storage';
import { terminalSound } from '../utils/terminalSound';

interface LockScreenProps {
  onUnlockSuccess: (user: UserProfile) => void;
  onResetSystem: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlockSuccess, onResetSystem }) => {
  const [existingUser, setExistingUser] = useState<UserProfile | null>(null);

  // Setup mode states (for first-time users)
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');

  // Unlock mode states (for returning users)
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'checking' | 'denied' | 'granted'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [failedCount, setFailedCount] = useState(0);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = authStorage.getUser();
    setExistingUser(user);
    // Auto-focus the relevant field
    setTimeout(() => {
      if (user) {
        passwordInputRef.current?.focus();
      } else {
        usernameInputRef.current?.focus();
      }
    }, 150);
  }, []);

  // Handle first-time registration
  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = setupUsername.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 2) {
      terminalSound.playAccessDenied();
      setErrorMessage('CALLSIGN MUST BE AT LEAST 2 CHARACTERS');
      return;
    }

    if (!setupPassword || setupPassword.length < 3) {
      terminalSound.playAccessDenied();
      setErrorMessage('MASTER ACCESS KEY MUST BE AT LEAST 3 CHARACTERS');
      return;
    }

    if (setupPassword !== setupConfirm) {
      terminalSound.playAccessDenied();
      setErrorMessage('ACCESS KEYS DO NOT MATCH');
      return;
    }

    // Save to machine localStorage
    terminalSound.playAccessGranted();
    const createdUser = authStorage.setUser({
      username: cleanUsername,
      password: setupPassword
    });
    setExistingUser(createdUser);
    onUnlockSuccess(createdUser);
  };

  // Handle unlocking with saved credentials
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authStatus === 'checking' || authStatus === 'granted') return;

    if (!inputPassword) {
      terminalSound.playAccessDenied();
      setErrorMessage('ENTER ACCESS KEY');
      return;
    }

    setAuthStatus('checking');
    setErrorMessage('');

    setTimeout(() => {
      const isMatch = authStorage.verifyPassword(inputPassword);

      if (isMatch) {
        terminalSound.playAccessGranted();
        setAuthStatus('granted');
        const updated = authStorage.recordSuccessfulLogin();
        setTimeout(() => {
          if (updated) onUnlockSuccess(updated);
        }, 800);
      } else {
        terminalSound.playAccessDenied();
        setAuthStatus('denied');
        setFailedCount((prev) => prev + 1);
        setErrorMessage('ACCESS DENIED: INVALID KEY FOR ' + (existingUser?.username.toUpperCase() || 'OPERATOR'));
        setInputPassword('');
        setTimeout(() => {
          setAuthStatus('idle');
          passwordInputRef.current?.focus();
        }, 1200);
      }
    }, 400);
  };

  const handleKeyStroke = () => {
    terminalSound.playTik();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-black text-emerald-400 font-mono select-none relative">
      {/* Dynamic Security Aura */}
      <div
        className={`absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-500 ${
          authStatus === 'denied'
            ? 'bg-rose-600'
            : authStatus === 'granted'
            ? 'bg-emerald-400'
            : 'bg-emerald-600'
        }`}
      />

      {/* Main Glass/CRT Lock Terminal Card */}
      <div
        className={`relative z-10 w-full max-w-md bg-black/95 border-2 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
          authStatus === 'denied'
            ? 'border-rose-500 glow-box-red animate-[shake_0.4s_ease-in-out]'
            : authStatus === 'granted'
            ? 'border-emerald-400 shadow-[0_0_50px_rgba(0,255,102,0.5)]'
            : 'border-emerald-500/50 shadow-[0_0_30px_rgba(0,255,102,0.2)]'
        }`}
      >
        {/* Terminal Header Telemetry */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-6 text-[11px] text-emerald-600">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            NEXUS_SECURITY // AUTH_GATE
          </span>
          <span className="tracking-widest">
            {existingUser ? 'LOCAL_STORAGE: SYNCED' : 'INITIAL_SETUP'}
          </span>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CASE A: USER ALREADY SAVED IN MACHINE LOCAL STORAGE -> LOCK SCREEN
           ───────────────────────────────────────────────────────────── */}
        {existingUser ? (
          <div className="flex flex-col items-center text-center">
            {/* Holographic Lock Icon Badge */}
            <div className="relative mb-5 flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  authStatus === 'denied'
                    ? 'border-rose-500 bg-rose-950/40 text-rose-400'
                    : authStatus === 'granted'
                    ? 'border-emerald-300 bg-emerald-950/60 text-emerald-300 shadow-[0_0_20px_#00ff66]'
                    : 'border-emerald-400 bg-emerald-950/40 text-emerald-400'
                }`}
              >
                {authStatus === 'granted' ? (
                  <CheckCircle className="w-10 h-10 animate-bounce text-emerald-300" />
                ) : authStatus === 'denied' ? (
                  <AlertTriangle className="w-10 h-10 animate-pulse text-rose-400" />
                ) : (
                  <Lock className="w-10 h-10 text-emerald-300 drop-shadow-[0_0_8px_#00ff66]" />
                )}
              </div>

              {/* Decorative Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />
            </div>

            {/* Saved User Identity Banner */}
            <div className="space-y-1 mb-6">
              <div className="text-[10px] text-emerald-600 tracking-[0.3em] uppercase">
                [ SYSTEM LOCKED // CREDENTIAL MATCH ]
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-widest text-emerald-300 glow-text-green uppercase flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400 inline" />
                {existingUser.username}
              </h2>
              <div className="text-[11px] text-emerald-600 flex items-center justify-center gap-3 pt-1">
                <span>LOGINS: {existingUser.sessionCount || 1}</span>
                <span>&bull;</span>
                <span>LAST: {formatDate(existingUser.lastLogin)}</span>
              </div>
            </div>

            {/* Password Verification Form */}
            <form onSubmit={handleUnlockSubmit} className="w-full space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between text-[11px] text-emerald-500 mb-1 px-1">
                  <span>ENTER MASTER ACCESS KEY</span>
                  {failedCount > 0 && (
                    <span className="text-rose-400 font-bold">FAILED: {failedCount}</span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <Key className="w-4 h-4 text-emerald-500 absolute left-3 pointer-events-none" />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      handleKeyStroke();
                    }}
                    disabled={authStatus === 'checking' || authStatus === 'granted'}
                    placeholder="••••••••••••"
                    className="w-full bg-black/80 border border-emerald-500/50 rounded-lg pl-9 pr-10 py-2.5 text-sm sm:text-base text-emerald-300 tracking-wider focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-400 transition-all font-mono placeholder:text-emerald-800"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-emerald-600 hover:text-emerald-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide Key' : 'Reveal Key'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status/Error Notification Banner */}
              {errorMessage && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs text-left flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {authStatus === 'granted' && (
                <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-400/60 text-emerald-300 text-xs text-left flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>CREDENTIALS VERIFIED. DECRYPTING ROOT TTY...</span>
                </div>
              )}

              {/* Submit Unlock Button */}
              <button
                type="submit"
                disabled={authStatus === 'checking' || authStatus === 'granted'}
                className="w-full py-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 font-bold tracking-widest text-xs sm:text-sm uppercase transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {authStatus === 'checking' ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> VERIFYING KEY...
                  </span>
                ) : authStatus === 'granted' ? (
                  'ACCESS GRANTED'
                ) : (
                  'AUTHENTICATE & UNLOCK'
                )}
              </button>
            </form>

            {/* Wipe/Reset Option */}
            <div className="mt-6 pt-4 border-t border-emerald-950/60 w-full flex items-center justify-between text-[11px] text-emerald-600">
              <span>LOCAL DEVICE REPOSITORY</span>
              <button
                onClick={() => {
                  if (window.confirm('Wipe saved credentials from local storage and restart setup?')) {
                    authStorage.clearAll();
                    setExistingUser(null);
                    onResetSystem();
                  }
                }}
                className="hover:text-rose-400 transition-colors cursor-pointer underline"
              >
                RESET CREDENTIALS
              </button>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              CASE B: FIRST STARTUP -> PROMPT FOR INITIAL REGISTRATION
             ───────────────────────────────────────────────────────────── */
          <div className="flex flex-col items-center">
            {/* Setup Emblem */}
            <div className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-emerald-950/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,102,0.3)]">
              <UserPlus className="w-8 h-8 text-emerald-300" />
            </div>

            <div className="text-center space-y-1 mb-6">
              <span className="text-[10px] text-emerald-500 tracking-[0.3em] uppercase block">
                [ FIRST STARTUP DETECTED ]
              </span>
              <h2 className="text-xl font-bold tracking-wider text-emerald-300 glow-text-green uppercase">
                CREATE ROOT CREDENTIALS
              </h2>
              <p className="text-xs text-emerald-600">
                Credentials will be stored locally on this device.
              </p>
            </div>

            <form onSubmit={handleSetupSubmit} className="w-full space-y-3.5">
              <div>
                <label className="block text-[11px] text-emerald-500 mb-1 px-1">
                  OPERATOR CALLSIGN / USERNAME
                </label>
                <input
                  ref={usernameInputRef}
                  type="text"
                  value={setupUsername}
                  onChange={(e) => {
                    setSetupUsername(e.target.value);
                    handleKeyStroke();
                  }}
                  placeholder="e.g. zcoopy, neo, root"
                  className="w-full bg-black/80 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-emerald-300 tracking-wider focus:outline-none focus:border-emerald-300 font-mono placeholder:text-emerald-800"
                  spellCheck={false}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-500 mb-1 px-1">
                  SET MASTER ACCESS KEY
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={setupPassword}
                  onChange={(e) => {
                    setSetupPassword(e.target.value);
                    handleKeyStroke();
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-black/80 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-emerald-300 tracking-wider focus:outline-none focus:border-emerald-300 font-mono placeholder:text-emerald-800"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-500 mb-1 px-1">
                  CONFIRM MASTER ACCESS KEY
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={setupConfirm}
                  onChange={(e) => {
                    setSetupConfirm(e.target.value);
                    handleKeyStroke();
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-black/80 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-emerald-300 tracking-wider focus:outline-none focus:border-emerald-300 font-mono placeholder:text-emerald-800"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-emerald-600 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide keys' : 'Show keys'}</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 font-bold tracking-widest text-xs sm:text-sm uppercase transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] cursor-pointer active:scale-[0.98]"
              >
                INITIALIZE & STORE CREDENTIALS
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer System Telemetry */}
      <div className="mt-6 text-[10px] text-emerald-700 tracking-widest text-center">
        AES-512 HARDWARE ENCRYPTED STORAGE // PERSISTED ON LOCAL MACHINE
      </div>
    </div>
  );
};
