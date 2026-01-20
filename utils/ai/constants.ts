
import { TileData } from '../../types';

// --- CONSTANTS ---
export const MONOPOLY_MULTIPLIER = 3.0; // Huge value on completing sets
export const BLOCK_MULTIPLIER = 1.5;    // Value on blocking others
export const CASH_BUFFER = 100;         // Minimum cash to keep

// --- HELPERS ---
export const getColorGroup = (tiles: TileData[], color: string) => tiles.filter(t => t.color === color);
export const countOwnedInGroup = (group: TileData[], playerId: number) => group.filter(t => t.owner === playerId).length;
