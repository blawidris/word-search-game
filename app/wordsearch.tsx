import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { ConfettiOverlay } from '../src/components/ConfettiOverlay';
import { HUD } from '../src/components/HUD';
import { NeonBackground } from '../src/components/NeonBackground';
import { WordGrid } from '../src/components/WordGrid';
import { WordList } from '../src/components/WordList';
import { WORD_LIST, TOTAL_WORDS } from '../src/data/wordList';
import { generateGrid } from '../src/logic/gridGenerator';
import { validateSelection } from '../src/logic/wordValidator';
import { useSettings } from '../src/store/settingsStore';
import { useWordSearchStore } from '../src/store/wordSearchStore';

const formatTime = (timeMs: number) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function WordSearchScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const gridWidth = isWide ? Math.min(width * 0.55, 480) : Math.min(width - 40, 420);

  const [gridData, setGridData] = useState(() => generateGrid(WORD_LIST));
  const [foundWordIds, setFoundWordIds] = useState<Set<string>>(new Set());
  const [foundIndices, setFoundIndices] = useState<Set<number>>(new Set());
  const [pulseIndices, setPulseIndices] = useState<Set<number>>(new Set());
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const startTimeRef = useRef(Date.now());
  const foundWordIdsRef = useRef(foundWordIds);

  const { bestTimeMs, hintsRemaining, consumeHint, resetHints, recordCompletion } = useWordSearchStore();
  const { soundEnabled, musicEnabled, hapticsEnabled, toggleHaptics, toggleMusic, toggleSound } =
    useSettings();

  const wordFoundPlayer = useAudioPlayer(require('../assets/sounds/word-found.wav'));
  const invalidPlayer = useAudioPlayer(require('../assets/sounds/invalid.wav'));
  const completePlayer = useAudioPlayer(require('../assets/sounds/complete.wav'));
  const musicPlayer = useAudioPlayer(require('../assets/sounds/music.wav'));

  useEffect(() => {
    foundWordIdsRef.current = foundWordIds;
  }, [foundWordIds]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    wordFoundPlayer.volume = 0.6;
    invalidPlayer.volume = 0.3;
    completePlayer.volume = 0.7;
    musicPlayer.volume = 0.15;
    musicPlayer.loop = true;
  }, [completePlayer, invalidPlayer, musicPlayer, wordFoundPlayer]);

  useEffect(() => {
    if (!musicEnabled) {
      musicPlayer.pause();
      return;
    }
    musicPlayer.play();
  }, [musicEnabled, musicPlayer]);

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (completed || foundWordIds.size !== TOTAL_WORDS) {
      return;
    }
    const finalTime = Date.now() - startTimeRef.current;
    setElapsedMs(finalTime);
    setRunning(false);
    setCompleted(true);
    setModalVisible(true);
    setConfettiTrigger((value) => value + 1);
    recordCompletion(finalTime);
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    if (soundEnabled) {
      completePlayer.seekTo(0).then(() => completePlayer.play()).catch(() => completePlayer.play());
    }
  }, [completed, completePlayer, foundWordIds.size, hapticsEnabled, recordCompletion, soundEnabled]);

  const playEffect = useCallback(
    (player: AudioPlayer) => {
      if (!soundEnabled) {
        return;
      }
      player.seekTo(0).then(() => player.play()).catch(() => player.play());
    },
    [soundEnabled]
  );

  const handleSelectionEnd = useCallback(
    (selection: number[]) => {
      if (selection.length < 2) {
        return;
      }
      const matchedWordId = validateSelection(selection, gridData.placedWords);
      if (!matchedWordId || foundWordIdsRef.current.has(matchedWordId)) {
        setShakeTrigger((value) => value + 1);
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        }
        playEffect(invalidPlayer);
        return;
      }

      const positions = gridData.placedWords[matchedWordId] ?? [];
      setFoundWordIds((prev) => new Set([...prev, matchedWordId]));
      setFoundIndices((prev) => {
        const next = new Set(prev);
        positions.forEach((position) => next.add(position.index));
        return next;
      });
      setPulseIndices(new Set(positions.map((position) => position.index)));
      setPulseTrigger((value) => value + 1);

      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
      playEffect(wordFoundPlayer);
    },
    [gridData.placedWords, hapticsEnabled, invalidPlayer, playEffect, wordFoundPlayer]
  );

  const handleHint = useCallback(() => {
    if (hintsRemaining <= 0) {
      return;
    }
    const remaining = WORD_LIST.filter((word) => !foundWordIdsRef.current.has(word.id));
    if (remaining.length === 0) {
      return;
    }
    const word = remaining[Math.floor(Math.random() * remaining.length)];
    const firstCell = gridData.placedWords[word.id]?.[0];
    if (!firstCell) {
      return;
    }
    consumeHint();
    setHintIndex(firstCell.index);
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    setTimeout(() => {
      setHintIndex(null);
    }, 900);
  }, [consumeHint, gridData.placedWords, hapticsEnabled, hintsRemaining]);

  const handleRestart = useCallback(() => {
    setGridData(generateGrid(WORD_LIST));
    setFoundWordIds(new Set());
    setFoundIndices(new Set());
    setPulseIndices(new Set());
    setPulseTrigger((value) => value + 1);
    setHintIndex(null);
    setShakeTrigger(0);
    setElapsedMs(0);
    setRunning(true);
    setCompleted(false);
    setModalVisible(false);
    startTimeRef.current = Date.now();
    resetHints();
  }, [resetHints]);

  const progressText = useMemo(
    () => `${foundWordIds.size} / ${TOTAL_WORDS} words found`,
    [foundWordIds.size]
  );

  const bestTimeText = bestTimeMs !== null ? formatTime(bestTimeMs) : '--:--';

  return (
    <SafeAreaView style={styles.screen}>
      <NeonBackground />
      <View style={styles.content}>
        <HUD
          timeMs={elapsedMs}
          hintsRemaining={hintsRemaining}
          onHint={handleHint}
          onRestart={handleRestart}
          hintDisabled={hintsRemaining <= 0 || completed}
        />

        <View style={[styles.main, isWide ? styles.mainRow : styles.mainColumn]}>
          <View style={[styles.gridWrapper, { width: gridWidth }]}>
            <WordGrid
              grid={gridData.grid}
              foundIndices={foundIndices}
              hintIndex={hintIndex}
              shakeTrigger={shakeTrigger}
              pulseTrigger={pulseTrigger}
              pulseIndices={pulseIndices}
              onSelectionEnd={handleSelectionEnd}
            />
          </View>
          <View style={styles.listWrapper}>
            <WordList words={WORD_LIST} foundWordIds={foundWordIds} />
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Best Time</Text>
              <Text style={styles.statsValue}>{bestTimeText}</Text>
              <View style={styles.toggles}>
                <Pressable onPress={toggleMusic} style={styles.toggleButton}>
                  <Text style={styles.toggleText}>Music: {musicEnabled ? 'On' : 'Off'}</Text>
                </Pressable>
                <Pressable onPress={toggleSound} style={styles.toggleButton}>
                  <Text style={styles.toggleText}>Sound: {soundEnabled ? 'On' : 'Off'}</Text>
                </Pressable>
                <Pressable onPress={toggleHaptics} style={styles.toggleButton}>
                  <Text style={styles.toggleText}>Haptics: {hapticsEnabled ? 'On' : 'Off'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.progressText}>{progressText}</Text>
          <Pressable onPress={() => router.push('/garage')} style={styles.garageButton}>
            <Text style={styles.garageText}>Garage</Text>
          </Pressable>
        </View>
      </View>

      <ConfettiOverlay visible={modalVisible} trigger={confettiTrigger} />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Puzzle Complete</Text>
            <Text style={styles.modalTime}>{formatTime(elapsedMs)}</Text>
            <Text style={styles.modalSub}>{foundWordIds.size} / {TOTAL_WORDS} words</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={handleRestart} style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonText}>Replay</Text>
              </Pressable>
              <Pressable onPress={() => router.replace('/')} style={styles.modalButtonGhost}>
                <Text style={styles.modalButtonGhostText}>Home</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070b17',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 18,
  },
  main: {
    flex: 1,
    gap: 16,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainColumn: {
    flexDirection: 'column',
  },
  gridWrapper: {
    alignSelf: 'center',
  },
  listWrapper: {
    flex: 1,
    gap: 14,
  },
  statsCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(12, 18, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(90, 186, 255, 0.25)',
  },
  statsLabel: {
    color: '#88c9ff',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statsValue: {
    color: '#f0fbff',
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 4,
  },
  toggles: {
    marginTop: 10,
    gap: 8,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 226, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(45, 226, 255, 0.25)',
  },
  toggleText: {
    color: '#c2f2ff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#9ad7ff',
    fontSize: 14,
    fontWeight: '600',
  },
  garageButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  garageText: {
    color: '#e6f7ff',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 19, 32, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(90, 186, 255, 0.35)',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    color: '#c2f2ff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalTime: {
    color: '#f0fbff',
    fontSize: 32,
    fontWeight: '800',
  },
  modalSub: {
    color: '#8fd1ff',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalButtonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#2de2ff',
  },
  modalButtonText: {
    color: '#0b1020',
    fontWeight: '700',
  },
  modalButtonGhost: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalButtonGhostText: {
    color: '#e6f7ff',
    fontWeight: '700',
  },
});
