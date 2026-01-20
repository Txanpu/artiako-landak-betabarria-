
import { GameState, TileData, Player, TileType } from '../types';

// === GRAPH MOVEMENT LOGIC ===
export const getBoardNeighbors = (currentPos: number): number[] => {
    // 1. Perimeter (Circular) 0-63
    
    // Bottom-Right Corner (0) -> Can go to 1 OR Enter Bottom-Right Diag (91)
    if (currentPos === 0) return [1, 91];
    
    // Bottom-Left Corner (16) -> Can go to 17 OR Enter Bottom-Left Diag (82)
    if (currentPos === 16) return [17, 82];
    
    // Top-Left Corner (32) -> Can go to 33 OR Enter Top-Left Diag (64)
    if (currentPos === 32) return [33, 64];
    
    // Top-Right Corner (48) -> Can go to 49 OR Enter Top-Right Diag (73)
    if (currentPos === 48) return [49, 73];

    // Perimeter Standard Logic
    if (currentPos < 64) {
        return [(currentPos + 1) % 64];
    }

    // 2. Diagonals (Inward & Outward & Center)
    // 9 Tiles per Arm. Total 100 tiles (0-99).
    
    // Top-Left Arm (64-72). 64 is outer, 72 is center-tip
    // 64 connects to 32 (Corner) and 65 (In)
    if (currentPos === 64) return [65, 32]; 
    if (currentPos >= 65 && currentPos < 72) return [currentPos + 1, currentPos - 1]; 
    if (currentPos === 72) return [71, 81, 90, 99]; // Center Hub -> Back to arm or other tips

    // Top-Right Arm (73-81). 73 outer, 81 center
    // 73 connects to 48 (Corner) and 74 (In)
    if (currentPos === 73) return [74, 48];
    if (currentPos >= 74 && currentPos < 81) return [currentPos + 1, currentPos - 1];
    if (currentPos === 81) return [80, 72, 90, 99]; // Center Hub

    // Bottom-Left Arm (82-90). 82 outer, 90 center
    // 82 connects to 16 (Corner) and 83 (In)
    if (currentPos === 82) return [83, 16];
    if (currentPos >= 83 && currentPos < 90) return [currentPos + 1, currentPos - 1];
    if (currentPos === 90) return [89, 72, 81, 99]; // Center Hub

    // Bottom-Right Arm (91-99). 91 outer, 99 center
    // 91 connects to 0 (Corner) and 92 (In)
    if (currentPos === 91) return [92, 0];
    if (currentPos >= 92 && currentPos < 99) return [currentPos + 1, currentPos - 1];
    if (currentPos === 99) return [98, 72, 81, 90]; // Center Hub

    return [];
};

export const trackTileLanding = (state: GameState, tileId: number): Record<number, number> => {
    const newMap = { ...state.heatmap };
    newMap[tileId] = (newMap[tileId] || 0) + 1;
    return newMap;
};

// Helper for Rule 6 & 9: Find next Fiore
export const getNearestTileBySubtype = (tiles: TileData[], startPos: number, subtype: string): number => {
    let curr = (startPos + 1) % tiles.length;
    let loops = 0;
    while (curr !== startPos && loops < tiles.length * 2) {
        if (tiles[curr].subtype === subtype) return curr;
        curr = (curr + 1) % tiles.length;
        loops++;
    }
    return startPos; 
};

export const getAvailableTransportHops = (tiles: TileData[], player: Player, currentTileId: number): number[] => {
    const current = tiles[currentTileId];
    if (!current || !current.subtype || !['rail', 'bus', 'ferry', 'air'].includes(current.subtype)) return [];
    
    // HELICOPTER LOGIC: If on Airport, can fly ANYWHERE.
    // However, returning ALL tiles is too much for the UI button list.
    // The Helicopter UI will handle the "Click any tile" mode separately.
    // This function returns "Standard" transport connections.
    // But we can filter to just other transports for convenience in the list.
    
    return tiles
        .filter(t => t.id !== currentTileId)
        .filter(t => {
            // Check Subtype match
            let typeMatch = false;
            
            // Standard Rule: Match Subtype (with Rail/Bus compatibility)
            if (current.subtype === 'rail') typeMatch = t.subtype === 'rail' || t.subtype === 'bus';
            else if (current.subtype === 'bus') typeMatch = t.subtype === 'bus' || t.subtype === 'rail';
            else typeMatch = t.subtype === current.subtype;

            // MARCIANITO LOGIC: Can connect any owned transports
            if (!typeMatch && player.gender === 'marcianito') {
                const ownsSource = current.owner === player.id;
                const ownsTarget = t.owner === player.id;
                // If I own both, they are connected regardless of type
                if (ownsSource && ownsTarget) typeMatch = true;
            }

            if (!typeMatch) return false;

            // Check Ownership / Role Access
            // Okupa: Can access if subtype matches regardless of owner (Standard logic handles this by check above + this check)
            if (player.role === 'okupa') return true; 
            
            // Marcianito: Cross-type already checked ownership above, but let's be safe
            // Normal rule: Must own it or be 'E' (State)
            return t.owner === player.id || t.owner === 'E'; 
        })
        .map(t => t.id);
};
