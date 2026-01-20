
import { TileData } from '../types';
import { PERIMETER_TILES } from './board/perimeter';
import { DIAGONAL_TILES } from './board/diagonals';
export { p, rail, bus, ferry, air, util } from './board/helpers';

// Combine both sections
export const BOARD_DEF: Partial<TileData>[] = [
    ...PERIMETER_TILES,
    ...DIAGONAL_TILES
];

export const INITIAL_TILES: TileData[] = BOARD_DEF.map((t, i) => ({
  ...t,
  id: i,
  owner: null,
  houses: 0,
  hotel: false,
  mortgaged: false,
  workers: 0,
} as TileData));
