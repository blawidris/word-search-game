import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'car-word-search:settings';

type SettingsState = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
};

type SettingsContextValue = SettingsState & {
  hydrated: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHaptics: () => void;
};

const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && active) {
          const parsed = JSON.parse(stored) as SettingsState;
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch {
        // Ignore storage errors, fallback to defaults.
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    };
    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {
      // Ignore persistence errors.
    });
  }, [hydrated, settings]);

  const toggleSound = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleMusic = useCallback(() => {
    setSettings((prev) => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  }, []);

  const toggleHaptics = useCallback(() => {
    setSettings((prev) => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  }, []);

  const value = useMemo(
    () => ({
      ...settings,
      hydrated,
      toggleSound,
      toggleMusic,
      toggleHaptics,
    }),
    [settings, hydrated, toggleSound, toggleMusic, toggleHaptics]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider.');
  }
  return context;
};
