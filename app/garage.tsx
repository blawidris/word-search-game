import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { NeonBackground } from '../src/components/NeonBackground';

export default function GarageScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <NeonBackground />
      <View style={styles.content}>
        <Text style={styles.title}>Garage</Text>
        <Text style={styles.subtitle}>Your curated lineup of futuristic rides.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Concept Fleet</Text>
          <Text style={styles.cardText}>
            Tune in as new car-themed games are rolled into the garage.
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Back</Text>
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
    gap: 18,
  },
  title: {
    color: '#e9f6ff',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9fd7ff',
    fontSize: 14,
  },
  card: {
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    color: '#dff5ff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardText: {
    color: '#9fd7ff',
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#e6f7ff',
    fontWeight: '700',
  },
});
