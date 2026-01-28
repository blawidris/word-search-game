import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export const NeonBackground = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress]);

  const firstStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const secondStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <>
      <AnimatedGradient
        colors={['#070b17', '#0b1425', '#111c33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, firstStyle]}
      />
      <AnimatedGradient
        colors={['#081321', '#0a1f2d', '#121027']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, secondStyle]}
      />
    </>
  );
};
