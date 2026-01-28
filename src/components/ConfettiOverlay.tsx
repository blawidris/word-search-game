import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ConfettiPiece = {
  id: number;
  color: string;
  size: number;
  startX: number;
  endX: number;
  delay: number;
  spin: number;
};

const COLORS = ['#2de2ff', '#4dff9a', '#ffd166', '#ff6bcb', '#9b7bff'];

type ConfettiOverlayProps = {
  visible: boolean;
  trigger: number;
};

const ConfettiPieceView = memo(
  ({
    piece,
    progress,
    height,
  }: {
    piece: ConfettiPiece;
    progress: SharedValue<number>;
    height: number;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const t = Math.max(0, progress.value - piece.delay);
      const local = Math.min(1, t / (1 - piece.delay));
      const translateY = interpolate(local, [0, 1], [-30, height + 60]);
      const translateX = interpolate(local, [0, 1], [piece.startX, piece.endX]);
      const rotate = `${interpolate(local, [0, 1], [0, piece.spin])}deg`;
      const opacity = 1 - local * 0.2;
      return {
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      };
    });

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.piece,
          animatedStyle,
          { backgroundColor: piece.color, width: piece.size, height: piece.size * 1.4 },
        ]}
      />
    );
  }
);

export const ConfettiOverlay = ({ visible, trigger }: ConfettiOverlayProps) => {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const pieces = useMemo(() => {
    const count = 26;
    return Array.from({ length: count }, (_, index) => {
      const startX = Math.random() * width;
      const endX = Math.min(width, Math.max(0, startX + (Math.random() * 120 - 60)));
      return {
        id: index,
        color: COLORS[index % COLORS.length],
        size: 8 + Math.random() * 8,
        startX,
        endX,
        delay: Math.random() * 0.4,
        spin: Math.random() * 220 - 110,
      };
    });
  }, [width]);

  useEffect(() => {
    if (!visible) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1800 });
  }, [progress, trigger, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPieceView key={piece.id} piece={piece} progress={progress} height={height} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: -40,
    borderRadius: 4,
    opacity: 0.9,
  },
});
