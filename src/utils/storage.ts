export interface UserProfile {
  username: string;
  password: string;
  createdAt: string;
  lastLogin: string;
  sessionCount: number;
}

const STORAGE_KEY = 'hacker_sim_auth_v1';

export const authStorage = {
  getUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  setUser(profile: Omit<UserProfile, 'createdAt' | 'lastLogin' | 'sessionCount'>): UserProfile {
    const newProfile: UserProfile = {
      username: profile.username.trim().toLowerCase(),
      password: profile.password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      sessionCount: 1
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    return newProfile;
  },

  verifyPassword(inputPassword: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.password === inputPassword;
  },

  updatePassword(newPassword: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    user.password = newPassword;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    } catch {
      return false;
    }
  },

  recordSuccessfulLogin(): UserProfile | null {
    const user = this.getUser();
    if (!user) return null;
    user.lastLogin = new Date().toISOString();
    user.sessionCount = (user.sessionCount || 1) + 1;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
    return user;
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {
      // Ignore
    }
  }
};

export interface SystemSettings {
  skipLockScreen: boolean;
  autoOpenAllApps: boolean;
  theme: string;
  crtEnabled: boolean;
  soundMuted: boolean;
  warpAnimation: boolean;
  activeAppId: string;
}

const SETTINGS_KEY = 'nexus_os_system_settings_v1';

const DEFAULT_SETTINGS: SystemSettings = {
  skipLockScreen: false,
  autoOpenAllApps: true,
  theme: 'emerald',
  crtEnabled: true,
  soundMuted: false,
  warpAnimation: true,
  activeAppId: 'terminal'
};

export const settingsStorage = {
  getSettings(): SystemSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: Partial<SystemSettings>): SystemSettings {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return { ...DEFAULT_SETTINGS, ...settings };
    }
  }
};
