import React, { memo, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { WordEntry } from '../data/wordList';

type WordListProps = {
  words: WordEntry[];
  foundWordIds: Set<string>;
};

type WordListItemProps = {
  label: string;
  found: boolean;
};

const WordListItem = memo(({ label, found }: WordListItemProps) => {
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
        animatedStyle,
        found && styles.wordFound,
      ]}
    >
      {label}
    </Animated.Text>
  );
});

export const WordList = ({ words, foundWordIds }: WordListProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Word List</Text>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {words.map((word) => (
          <WordListItem key={word.id} label={word.display} found={foundWordIds.has(word.id)} />
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
  title: {
    color: '#b5e3ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  listContent: {
    gap: 10,
  },
  word: {
    color: '#eef7ff',
    fontSize: 15,
    fontWeight: '600',
  },
  wordFound: {
    textDecorationLine: 'line-through',
    color: '#67ffb7',
    textShadowColor: '#67ffb7',
    textShadowRadius: 6,
  },
});
