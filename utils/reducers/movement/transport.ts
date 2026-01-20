
import { GameState } from '../../../types';
import { handleLandingLogic } from '../../movement/landingLogic';
import { getAvailableTransportHops } from '../../board';
import { canUseTransport } from '../../governmentRules'; // NEW

export const handleTransportHop = (state: GameState, action: any): GameState => {
    // 1. Check if already used this turn
    if (state.usedTransportHop) return state;
    
    // NEW: Check Gov Rules
    if (!canUseTransport(state.gov)) {
        return { ...state, logs: ['🔥 ANARQUÍA: El transporte público ha sido quemado. No puedes viajar.', ...state.logs] };
    }

    const pIdx = state.currentPlayerIndex;
    const player = state.players[pIdx];
    const currentPos = player.pos;
    const currentTile = state.tiles[currentPos];
    const targetId = action.payload;

    // 2. Validate Origin
    const isTransport = ['rail', 'bus', 'ferry', 'air'].includes(currentTile.subtype || '');
    if (!isTransport) return state;

    const hasAccess = currentTile.owner === player.id || player.role === 'okupa';
    if (!hasAccess) return state;

    // 3. Validate Destination: Re-calculate valid hops using updated logic
    const validHops = getAvailableTransportHops(state.tiles, player, currentPos);
    if (!validHops.includes(targetId)) {
        return state;
    }
    
    // 4. Move Player
    const p = { ...player, pos: targetId };
    const newPs = [...state.players];
    newPs[pIdx] = p;
    
    const targetName = state.tiles[targetId].name;
    const method = player.role === 'okupa' && currentTile.owner !== player.id ? 'se cuela en' : 'viaja a';
    
    // 5. Trigger Landing Logic
    const landState = handleLandingLogic({
        ...state,
        players: newPs,
        usedTransportHop: true,
        transportOptions: [], // Clear options
        selectedTileId: null, // Close Modal
        logs: [`🚆 ${player.name} ${method} ${targetName}`, ...state.logs]
    });
    
    return landState;
};
