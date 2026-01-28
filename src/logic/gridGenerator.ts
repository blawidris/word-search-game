import { WordEntry } from '../data/wordList';
import {
  CellPosition,
  DIRECTIONS,
  Grid,
  canPlaceWord,
  createEmptyGrid,
  placeWord,
} from './wordPlacer';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randomInt = (max: number) => Math.floor(Math.random() * max);

const randomLetter = () => ALPHABET[randomInt(ALPHABET.length)];

const getStartBounds = (size: number, length: number, step: number) => {
  if (step > 0) {
    return { min: 0, max: size - length };
  }
  if (step < 0) {
    return { min: length - 1, max: size - 1 };
  }
  return { min: 0, max: size - 1 };
};

export type GeneratedGrid = {
  grid: Grid;
  size: number;
  placedWords: Record<string, CellPosition[]>;
};

export type GridGeneratorOptions = {
  minSize?: number;
  maxSize?: number;
  attempts?: number;
  placementAttempts?: number;
};

export const generateGrid = (
  words: WordEntry[],
  options: GridGeneratorOptions = {}
): GeneratedGrid => {
  const preparedWords = words
    .map((word) => ({ ...word, value: word.value.toUpperCase() }))
    .sort((a, b) => b.value.length - a.value.length);

  const longest = preparedWords[0]?.value.length ?? 0;
  const minSize = Math.max(options.minSize ?? longest, longest);
  const maxSize = options.maxSize ?? minSize + 6;
  const attempts = options.attempts ?? 200;
  const placementAttempts = options.placementAttempts ?? 140;

  for (let size = minSize; size <= maxSize; size += 1) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const grid = createEmptyGrid(size);
      const placedWords: Record<string, CellPosition[]> = {};
      let success = true;

      for (const word of preparedWords) {
        let placed = false;
        for (let tries = 0; tries < placementAttempts; tries += 1) {
          const direction = DIRECTIONS[randomInt(DIRECTIONS.length)];
          const rowBounds = getStartBounds(size, word.value.length, direction.row);
          const colBounds = getStartBounds(size, word.value.length, direction.col);
          const startRow = rowBounds.min + randomInt(rowBounds.max - rowBounds.min + 1);
          const startCol = colBounds.min + randomInt(colBounds.max - colBounds.min + 1);

          if (canPlaceWord(grid, word.value, startRow, startCol, direction)) {
            placedWords[word.id] = placeWord(grid, word.value, startRow, startCol, direction);
            placed = true;
            break;
          }
        }

        if (!placed) {
          success = false;
          break;
        }
      }

      if (!success) {
        continue;
      }

      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (grid[row][col] === '') {
            grid[row][col] = randomLetter();
          }
        }
      }

      return { grid, size, placedWords };
    }
  }

  throw new Error('Unable to generate a valid grid. Try increasing the grid size.');
};
