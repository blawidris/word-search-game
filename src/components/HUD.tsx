import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const formatTime = (timeMs: number) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

type HUDProps = {
  timeMs: number;
  hintsRemaining: number;
  onHint: () => void;
  onRestart: () => void;
  hintDisabled?: boolean;
  compact?: boolean;
};

export const HUD = ({
  timeMs,
  hintsRemaining,
  onHint,
  onRestart,
  hintDisabled,
  compact = false,
}: HUDProps) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.timerCard, compact && styles.timerCardCompact]}>
        <Text style={[styles.timerLabel, compact && styles.timerLabelCompact]}>Time</Text>
        <Text style={[styles.timerValue, compact && styles.timerValueCompact]}>{formatTime(timeMs)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onHint}
          disabled={hintDisabled}
          style={({ pressed }) => [
            styles.actionButton,
            compact && styles.actionButtonCompact,
            hintDisabled && styles.actionDisabled,
            pressed && !hintDisabled && styles.actionPressed,
          ]}
        >
          <Text style={[styles.actionText, compact && styles.actionTextCompact]}>Hint</Text>
          <Text style={[styles.actionSub, compact && styles.actionSubCompact]}>{hintsRemaining}</Text>
        </Pressable>
        <Pressable
          onPress={onRestart}
          style={({ pressed }) => [
            styles.actionButton,
            compact && styles.actionButtonCompact,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={[styles.actionText, compact && styles.actionTextCompact]}>Restart</Text>
          <Text style={[styles.actionSub, compact && styles.actionSubCompact]}>New</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  containerCompact: {
    gap: 8,
  },
  timerCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 21, 35, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(90, 186, 255, 0.3)',
  },
  timerCardCompact: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timerLabel: {
    color: '#89c9ff',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  timerLabelCompact: {
    fontSize: 10,
  },
  timerValue: {
    color: '#e9f6ff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timerValueCompact: {
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(45, 226, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(45, 226, 255, 0.4)',
    alignItems: 'center',
    minWidth: 84,
  },
  actionButtonCompact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 72,
  },
  actionPressed: {
    transform: [{ scale: 0.96 }],
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    color: '#d9f6ff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionTextCompact: {
    fontSize: 11,
  },
  actionSub: {
    color: '#7de6ff',
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  actionSubCompact: {
    fontSize: 10,
  },
});
