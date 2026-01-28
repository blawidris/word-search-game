import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'car-word-search:progress';
const DEFAULT_HINTS = 3;

type PersistedState = {
  bestTimeMs: number | null;
  hintsRemaining: number;
};

const DEFAULT_STATE: PersistedState = {
  bestTimeMs: null,
  hintsRemaining: DEFAULT_HINTS,
};

export const useWordSearchStore = () => {
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(DEFAULT_STATE.bestTimeMs);
  const [hintsRemaining, setHintsRemaining] = useState(DEFAULT_STATE.hintsRemaining);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && active) {
          const parsed = JSON.parse(stored) as PersistedState;
          setBestTimeMs(parsed.bestTimeMs ?? DEFAULT_STATE.bestTimeMs);
          setHintsRemaining(
            typeof parsed.hintsRemaining === 'number'
              ? parsed.hintsRemaining
              : DEFAULT_STATE.hintsRemaining
          );
        }
      } catch {
        // Ignore storage errors.
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    };
    loadState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const nextState: PersistedState = {
      bestTimeMs,
      hintsRemaining,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)).catch(() => {
      // Ignore persistence errors.
    });
  }, [bestTimeMs, hintsRemaining, hydrated]);

  const consumeHint = useCallback(() => {
    setHintsRemaining((prev) => Math.max(0, prev - 1));
  }, []);

  const resetHints = useCallback(() => {
    setHintsRemaining(DEFAULT_HINTS);
  }, []);

  const recordCompletion = useCallback((timeMs: number) => {
    setBestTimeMs((prev) => {
      if (prev === null) {
        return timeMs;
      }
      return Math.min(prev, timeMs);
    });
  }, []);

  return {
    bestTimeMs,
    hintsRemaining,
    hydrated,
    consumeHint,
    resetHints,
    recordCompletion,
    defaultHints: DEFAULT_HINTS,
  };
};
