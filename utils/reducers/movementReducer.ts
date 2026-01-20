
import { GameState } from '../../types';
import { handleLandingLogic } from '../movement/landingLogic';
import { handleRollDice } from './movement/roll';
import { navigationReducer } from './movement/navigation';
import { handleTransportHop } from './movement/transport';

// Export for compatibility if other reducers use it
export const handleLanding = handleLandingLogic;

export const movementReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'ROLL_DICE':
            return handleRollDice(state, action);
            
        case 'START_MOVE':
        case 'PROCESS_STEP':
        case 'SELECT_MOVE':
            return navigationReducer(state, action);

        case 'TRANSPORT_HOP':
            return handleTransportHop(state, action);
            
        case 'TOGGLE_FLIGHT_MODE':
            return { ...state, flightMode: !state.flightMode };

        case 'SELECT_TILE':
            // 1. Helicopter Flight Interception
            if (state.flightMode) {
                const targetId = action.payload;
                const pIdx = state.currentPlayerIndex;
                const player = { ...state.players[pIdx] };
                
                player.pos = targetId;
                const newPlayers = [...state.players];
                newPlayers[pIdx] = player;
                
                // Trigger Landing at new spot
                return handleLandingLogic({
                    ...state,
                    players: newPlayers,
                    flightMode: false, // Turn off mode
                    usedTransportHop: true, // Use up transport action
                    selectedTileId: null, // Ensure modal closes
                    logs: [`🚁 ${player.name} vuela tácticamente a ${state.tiles[targetId].name}.`, ...state.logs]
                });
            }
            
            // 2. FBI Expropriation Interception
            if ((state.fbiExpropriationSlots || 0) > 0) {
                const targetId = action.payload;
                const tile = state.tiles[targetId];
                
                if (tile.type === 'prop' && tile.owner === null) {
                    const pIdx = state.currentPlayerIndex;
                    const player = { ...state.players[pIdx] };
                    
                    const newTiles = [...state.tiles];
                    newTiles[targetId] = { ...tile, owner: player.id };
                    
                    player.props.push(targetId);
                    const newPlayers = [...state.players];
                    newPlayers[pIdx] = player;
                    
                    const remaining = (state.fbiExpropriationSlots || 0) - 1;
                    
                    return {
                        ...state,
                        tiles: newTiles,
                        players: newPlayers,
                        fbiExpropriationSlots: remaining,
                        selectedTileId: null,
                        logs: [`🕵️ FBI: ${player.name} expropia ${tile.name}. Quedan ${remaining}.`, ...state.logs]
                    };
                }
            }

            // 3. Normal Movement Selection
            if (state.pendingMoves > 0 && state.movementOptions.includes(action.payload)) {
                return navigationReducer(state, { type: 'SELECT_MOVE', payload: action.payload });
            }
            return { ...state, selectedTileId: action.payload };

        default: return state;
    }
};
