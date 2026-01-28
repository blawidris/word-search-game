import { CellPosition } from './wordPlacer';

export const validateSelection = (
  selection: number[],
  placedWords: Record<string, CellPosition[]>
): string | null => {
  if (selection.length === 0) {
    return null;
  }

  const selectionKey = selection.join(',');
  const reversedKey = [...selection].reverse().join(',');

  for (const [wordId, positions] of Object.entries(placedWords)) {
    if (positions.length !== selection.length) {
      continue;
    }
    const wordKey = positions.map((position) => position.index).join(',');
    if (wordKey === selectionKey || wordKey === reversedKey) {
      return wordId;
    }
  }

  return null;
};
