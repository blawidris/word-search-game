import React, { memo, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type LetterCellProps = {
  letter: string;
  index: number;
  size: number;
  fontSize: number;
  selection: SharedValue<number[]>;
  isFound: boolean;
  isHinted: boolean;
  pulseTrigger: number;
  pulseIndices: Set<number>;
};

const BASE_COLOR = '#101624';
const SELECTED_COLOR = '#2de2ff';
const FOUND_COLOR = '#4dff9a';
const HINT_COLOR = '#ffc857';

const LetterCellComponent = ({
  letter,
  index,
  size,
  fontSize,
  selection,
  isFound,
  isHinted,
  pulseTrigger,
  pulseIndices,
}: LetterCellProps) => {
  const foundProgress = useSharedValue(isFound ? 1 : 0);
  const hintProgress = useSharedValue(isHinted ? 1 : 0);
  const pulse = useSharedValue(0);

  const selectedProgress = useDerivedValue(() => {
    const selected = selection.value.includes(index);
    return withTiming(selected ? 1 : 0, { duration: 110 });
  });

  useEffect(() => {
    foundProgress.value = withTiming(isFound ? 1 : 0, { duration: 240 });
  }, [isFound, foundProgress]);

  useEffect(() => {
    hintProgress.value = withTiming(isHinted ? 1 : 0, { duration: 200 });
  }, [isHinted, hintProgress]);

  useEffect(() => {
    if (!pulseIndices.has(index)) {
      return;
    }
    pulse.value = 0;
    pulse.value = withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 320 }));
  }, [pulseTrigger, pulseIndices, index, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const selectionColor = interpolateColor(selectedProgress.value, [0, 1], [BASE_COLOR, SELECTED_COLOR]);
    const foundColor = interpolateColor(foundProgress.value, [0, 1], [selectionColor, FOUND_COLOR]);
    const hintColor = interpolateColor(hintProgress.value, [0, 1], [foundColor, HINT_COLOR]);
    const scale = 1 - selectedProgress.value * 0.06 + pulse.value * 0.08;

    return {
      backgroundColor: hintColor,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.cell, animatedStyle, { width: size, height: size }]}>
      <Text style={[styles.letter, { fontSize }]}>{letter}</Text>
    </Animated.View>
  );
};

export const LetterCell = memo(LetterCellComponent);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#39d0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  letter: {
    color: '#e6f7ff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
