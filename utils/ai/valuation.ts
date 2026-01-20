
import { GameState, Player, TileData, TileType } from '../../types';
import { getColorGroup, countOwnedInGroup, MONOPOLY_MULTIPLIER, BLOCK_MULTIPLIER } from './constants';

// --- VALUATION ENGINE ---
export const evaluateProperty = (state: GameState, player: Player, tile: TileData): number => {
    if (tile.type !== TileType.PROP || !tile.color) return (tile.price || 0);
    
    let value = tile.price || 0;
    const group = getColorGroup(state.tiles, tile.color);
    const myCount = countOwnedInGroup(group, player.id);
    const totalInGroup = group.length;
    
    // Factor 1: Monopoly Potential
    if (myCount === totalInGroup - 1) {
        // This is the last piece!
        value *= MONOPOLY_MULTIPLIER; 
    } 
    else if (myCount > 0) {
        // Building towards it
        value *= 1.2 + (myCount * 0.1); 
    }

    // Factor 2: Blocking
    // Check if any opponent is waiting for this one
    const opponentWaiting = state.players.some(p => p.id !== player.id && p.alive && countOwnedInGroup(group, p.id) === totalInGroup - 1);
    if (opponentWaiting) {
        value *= BLOCK_MULTIPLIER;
    }

    // Factor 3: Role Synergy
    if (player.role === 'florentino') value *= 1.2; 

    return Math.floor(value);
};
