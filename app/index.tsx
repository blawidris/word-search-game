import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { NeonBackground } from '../src/components/NeonBackground';

type GameCardConfig = {
  title: string;
  subtitle: string;
  route?: string;
};

const GAME_CARDS: GameCardConfig[] = [
  { title: 'Car Maze', subtitle: 'Coming Soon' },
  { title: 'Car Tic Tac Toe', subtitle: 'Coming Soon' },
  { title: 'Car Memory', subtitle: 'Coming Soon' },
  { title: 'Car Word Search', subtitle: 'Play Now', route: '/wordsearch' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <NeonBackground />
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Car Word Search</Text>
          <Text style={styles.subtitle}>A neon garage of mind-bending car puzzles.</Text>
        </View>

        <View style={styles.cardGrid}>
          {GAME_CARDS.map((card) => (
            <Pressable
              key={card.title}
              onPress={() => card.route && router.push(card.route)}
              style={({ pressed }) => [
                styles.card,
                card.route && styles.cardActive,
                pressed && card.route && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push('/garage')} style={styles.garageButton}>
          <Text style={styles.garageText}>Garage</Text>
        </Pressable>
      </View>
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
    padding: 24,
    justifyContent: 'space-between',
    gap: 24,
  },
  title: {
    color: '#e8f8ff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9fd7ff',
    fontSize: 14,
    marginTop: 6,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    minHeight: 120,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'space-between',
  },
  cardActive: {
    borderColor: 'rgba(45, 226, 255, 0.6)',
    shadowColor: '#2de2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  cardTitle: {
    color: '#eaf7ff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#9fd7ff',
    marginTop: 8,
    fontSize: 12,
  },
  garageButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  garageText: {
    color: '#e6f7ff',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
