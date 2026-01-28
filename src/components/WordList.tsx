import React, { memo, useEffect } from 'react';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { WordEntry } from '../data/wordList';

type WordListProps = {
  words: WordEntry[];
  foundWordIds: Set<string>;
  compact?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

type WordListItemProps = {
  label: string;
  found: boolean;
  compact: boolean;
};

const WordListItem = memo(({ label, found, compact }: WordListItemProps) => {
  const progress = useSharedValue(found ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(found ? 1 : 0, { duration: 260 });
  }, [found, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.45,
    transform: [{ scale: 1 - progress.value * 0.04 }],
  }));

  return (
    <Animated.Text
      style={[
        styles.word,
        compact && styles.wordCompact,
        animatedStyle,
        found && styles.wordFound,
      ]}
    >
      {label}
    </Animated.Text>
  );
});

export const WordList = ({ words, foundWordIds, compact = false, containerStyle }: WordListProps) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact, containerStyle]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>Word List</Text>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {words.map((word) => (
          <WordListItem
            key={word.id}
            label={word.display}
            found={foundWordIds.has(word.id)}
            compact={compact}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 21, 35, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(90, 186, 255, 0.3)',
  },
  containerCompact: {
    padding: 12,
    minHeight: 150,
  },
  title: {
    color: '#b5e3ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  titleCompact: {
    fontSize: 14,
  },
  listContent: {
    gap: 10,
  },
  word: {
    color: '#eef7ff',
    fontSize: 15,
    fontWeight: '600',
  },
  wordCompact: {
    fontSize: 13,
  },
  wordFound: {
    textDecorationLine: 'line-through',
    color: '#67ffb7',
    textShadowColor: '#67ffb7',
    textShadowRadius: 6,
  },
});
