import React, { memo, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { LetterCell } from './LetterCell';

type WordGridProps = {
  grid: string[][];
  foundIndices: Set<number>;
  hintIndex: number | null;
  shakeTrigger: number;
  pulseTrigger: number;
  pulseIndices: Set<number>;
  onSelectionEnd: (selection: number[]) => void;
};

type CellPoint = { row: number; col: number; index: number };

const getCellFromPoint = (x: number, y: number, size: number, cellSize: number): CellPoint | null => {
  'worklet';
  if (cellSize <= 0) {
    return null;
  }
  const row = Math.floor(y / cellSize);
  const col = Math.floor(x / cellSize);
  if (row < 0 || col < 0 || row >= size || col >= size) {
    return null;
  }
  return { row, col, index: row * size + col };
};

const buildSelectionPath = (
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  size: number
): number[] => {
  'worklet';
  const deltaRow = endRow - startRow;
  const deltaCol = endCol - startCol;
  if (deltaRow === 0 && deltaCol === 0) {
    return [startRow * size + startCol];
  }

  const absRow = Math.abs(deltaRow);
  const absCol = Math.abs(deltaCol);
  let stepRow = 0;
  let stepCol = 0;
  let length = 0;

  if (absRow === 0) {
    stepCol = Math.sign(deltaCol);
    length = absCol;
  } else if (absCol === 0) {
    stepRow = Math.sign(deltaRow);
    length = absRow;
  } else if (absRow === absCol) {
    stepRow = Math.sign(deltaRow);
    stepCol = Math.sign(deltaCol);
    length = absRow;
  } else if (absRow > absCol) {
    stepRow = Math.sign(deltaRow);
    length = absRow;
  } else {
    stepCol = Math.sign(deltaCol);
    length = absCol;
  }

  const selection: number[] = [];
  for (let i = 0; i <= length; i += 1) {
    selection.push((startRow + stepRow * i) * size + (startCol + stepCol * i));
  }
  return selection;
};

const WordGridComponent = ({
  grid,
  foundIndices,
  hintIndex,
  shakeTrigger,
  pulseTrigger,
  pulseIndices,
  onSelectionEnd,
}: WordGridProps) => {
  const size = grid.length;
  const selection = useSharedValue<number[]>([]);
  const startRow = useSharedValue(-1);
  const startCol = useSharedValue(-1);
  const cellSizeShared = useSharedValue(0);
  const [cellSize, setCellSize] = useState(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (shakeTrigger === 0) {
      return;
    }
    shake.value = withSequence(
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(-4, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  }, [shakeTrigger, shake]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const nextSize = width / size;
    setCellSize(nextSize);
    cellSizeShared.value = nextSize;
  };

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((event) => {
          const cell = getCellFromPoint(event.x, event.y, size, cellSizeShared.value);
          if (!cell) {
            return;
          }
          startRow.value = cell.row;
          startCol.value = cell.col;
          selection.value = [cell.index];
        })
        .onChange((event) => {
          if (startRow.value < 0 || startCol.value < 0) {
            return;
          }
          const cell = getCellFromPoint(event.x, event.y, size, cellSizeShared.value);
          if (!cell) {
            return;
          }
          selection.value = buildSelectionPath(startRow.value, startCol.value, cell.row, cell.col, size);
        })
        .onFinalize(() => {
          if (selection.value.length > 0) {
            const finalSelection = selection.value.slice();
            selection.value = [];
            startRow.value = -1;
            startCol.value = -1;
            runOnJS(onSelectionEnd)(finalSelection);
          }
        }),
    [cellSizeShared, onSelectionEnd, selection, size, startCol, startRow]
  );

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const fontSize = Math.max(11, Math.min(18, cellSize * 0.52));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, shakeStyle]} onLayout={handleLayout}>
        <View style={styles.grid}>
          {grid.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((letter, colIndex) => {
                const index = rowIndex * size + colIndex;
                return (
                  <LetterCell
                    key={`cell-${index}`}
                    index={index}
                    letter={letter}
                    size={cellSize}
                    fontSize={fontSize}
                    selection={selection}
                    isFound={foundIndices.has(index)}
                    isHinted={hintIndex === index}
                    pulseTrigger={pulseTrigger}
                    pulseIndices={pulseIndices}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export const WordGrid = memo(WordGridComponent);

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 20, 35, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(90, 186, 255, 0.35)',
    shadowColor: '#2de2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
  },
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
});
