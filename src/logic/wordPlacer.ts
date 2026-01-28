export type Grid = string[][];
export type CellPosition = {
  row: number;
  col: number;
  index: number;
};

export type Direction = {
  row: number;
  col: number;
};

export const DIRECTIONS: Direction[] = [
  { row: 0, col: 1 },
  { row: 0, col: -1 },
  { row: 1, col: 0 },
  { row: -1, col: 0 },
  { row: 1, col: 1 },
  { row: -1, col: -1 },
  { row: 1, col: -1 },
  { row: -1, col: 1 },
];

export const createEmptyGrid = (size: number): Grid => {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
};

const inBounds = (size: number, row: number, col: number) => {
  return row >= 0 && row < size && col >= 0 && col < size;
};

export const canPlaceWord = (
  grid: Grid,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
) => {
  const size = grid.length;
  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    if (!inBounds(size, row, col)) {
      return false;
    }
    const cell = grid[row][col];
    if (cell !== '' && cell !== word[i]) {
      return false;
    }
  }
  return true;
};

export const placeWord = (
  grid: Grid,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): CellPosition[] => {
  const positions: CellPosition[] = [];
  const size = grid.length;
  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + direction.row * i;
    const col = startCol + direction.col * i;
    if (!inBounds(size, row, col)) {
      break;
    }
    grid[row][col] = word[i];
    positions.push({ row, col, index: row * size + col });
  }
  return positions;
};
