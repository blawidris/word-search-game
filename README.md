# Car Word Search (Expo Router)

Modern Android-first word search game built with Expo SDK (latest), Expo Router, TypeScript, Reanimated, Gesture Handler, Expo Haptics, Expo Audio, and AsyncStorage.

## Getting Started

```bash
npm install
npm run android
```

## Word Placement Rules

- All required words are placed in the grid using **8 directions**:
  - Horizontal (left/right)
  - Vertical (up/down)
  - Diagonal (both directions)
- The generator sorts words by length (longest-first) and attempts randomized placement.
- If placement fails, the grid size automatically increases until all words fit.
- Empty cells are filled with random A–Z characters.

## Multi-Word Handling

- Phrases like **“The Horizon”** and **“W Motors”** are stored **without spaces** in the grid:
  - `THEHORIZON`, `WMOTORS`, `THEFUTURE`
- The word list UI uses the original display text with proper spacing.

## Gesture Detection Logic

- The grid uses `react-native-gesture-handler` Pan gestures.
- On drag start, the first cell becomes the anchor.
- As you drag, a **straight-line selection** is computed between the anchor and the current cell:
  - Horizontal, vertical, or diagonal selections are supported.
- Selection is validated **on release** by matching the exact cell path against placed words
  (forward or reverse).
- Incorrect selections trigger a subtle shake animation.

## Persistence

AsyncStorage is used to persist:

- Best completion time
- Remaining hint count
- Audio / haptics toggle preferences

## Project Structure

```
/app
  index.tsx
  garage.tsx
  wordsearch.tsx

/src
  /components
    LetterCell.tsx
    WordGrid.tsx
    WordList.tsx
    HUD.tsx
  /logic
    gridGenerator.ts
    wordPlacer.ts
    wordValidator.ts
  /store
    wordSearchStore.ts
    settingsStore.ts
  /data
    wordList.ts

/assets
  /sounds
  /ui
```

## Notes

- Grid cells are memoized and selection highlighting uses Reanimated shared values to keep drag
  interactions smooth at 60 FPS.
- Found words are permanently highlighted in the grid and crossed out in the word list.
- Completion triggers haptics + confetti + optional sound effects.
