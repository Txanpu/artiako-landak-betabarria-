
import { GameState } from '../types';
import { auctionReducer } from './reducers/auctionReducer';
import { movementReducer } from './reducers/movementReducer';
import { propertyReducer } from './reducers/propertyReducer';
import { financeReducer } from './reducers/financeReducer';
import { tradeReducer } from './reducers/tradeReducer';
import { minigameReducer } from './reducers/minigameReducer';
import { coreReducer } from './reducers/coreReducer';
import { shopReducer } from './reducers/shopReducer';
import { electionReducer } from './reducers/electionReducer';
import { specialReducer } from './reducers/specialReducer';
import { pokemonReducer } from './reducers/minigames/pokemonReducer'; 
import { motocrossReducer } from './reducers/minigames/motocrossReducer'; 
import { polymarketReducer } from './reducers/minigames/polymarketReducer'; 
import { boatRaceReducer } from './reducers/minigames/boatRaceReducer';
import { skateReducer } from './reducers/minigames/skateReducer'; 
import { birdHuntReducer } from './reducers/minigames/birdHuntReducer'; // Added

export const gameReducer = (state: GameState, action: any): GameState => {
    let nextState = state;

    // --- AVATAR SELECTION ---
    if (action.type === 'TOGGLE_AVATAR_SELECTION') {
        return { ...state, showAvatarSelection: !state.showAvatarSelection };
    }
    if (action.type === 'CHANGE_AVATAR') {
        const { pId, newAvatar } = action.payload;
        // Verify uniqueness
        const isTaken = state.players.some(p => p.avatar === newAvatar && p.id !== pId);
        if (isTaken) return state;

        const newPlayers = state.players.map(p => {
            if (p.id === pId) return { ...p, avatar: newAvatar };
            return p;
        });
        
        return { ...state, players: newPlayers, showAvatarSelection: false };
    }

    // 1. Core Lifecycle & Debug
    nextState = coreReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 2. Special Actions (Bribe, Insider, Sabotage)
    nextState = specialReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 3. Shop & Dark Web
    nextState = shopReducer(nextState, action);
    if (nextState !== state) return nextState;
    
    // 4. Elections
    nextState = electionReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 5. Pokemon (Intercepts)
    if (action.type.startsWith('POKEMON_') || action.type === 'START_POKEMON_BATTLE') {
        return pokemonReducer(state, action);
    }

    // 6. Motocross (Intercepts)
    if (action.type.startsWith('MOTOCROSS_') || action.type === 'START_MOTOCROSS' || action.type === 'CLOSE_MOTOCROSS') {
        return motocrossReducer(state, action);
    }

    // 7. Polymarket (Intercepts)
    if (action.type === 'TOGGLE_POLYMARKET' || action.type === 'CREATE_PREDICTION_MARKET' || action.type === 'ACCEPT_MARKET' || action.type === 'TRIGGER_MARKET_VOTE' || action.type === 'CAST_MARKET_VOTE' || action.type === 'RESOLVE_MARKET' || action.type === 'CANCEL_MARKET') {
        return polymarketReducer(state, action);
    }

    // 8. Boat Race (Intercepts)
    if (action.type.startsWith('BOAT_') || action.type === 'START_BOAT_RACE' || action.type === 'CLOSE_BOAT_RACE') {
        return boatRaceReducer(state, action);
    }

    // 9. Skate (Intercepts)
    if (action.type.startsWith('SKATE_') || action.type === 'START_SKATE' || action.type === 'CLOSE_SKATE') {
        return skateReducer(state, action);
    }

    // 10. Bird Hunt (Intercepts)
    if (action.type.startsWith('BIRD_') || action.type === 'START_BIRD_HUNT' || action.type === 'CLOSE_BIRD_HUNT') {
        return birdHuntReducer(state, action);
    }

    // 11. Movement
    // IMPORTANT: 'SELECT_TILE' interaction logic
    if (action.type === 'SELECT_TILE' && state.pendingMoves > 0 && state.movementOptions.includes(action.payload)) {
        return movementReducer(state, { type: 'SELECT_MOVE', payload: action.payload });
    }
    nextState = movementReducer(state, action);
    if (nextState !== state) return nextState;

    // 12. Property Management
    nextState = propertyReducer(state, action);
    if (nextState !== state) return nextState;

    // 13. Auction
    nextState = auctionReducer(state, action);
    if (nextState !== state) return nextState;

    // 14. Trade
    nextState = tradeReducer(state, action);
    if (nextState !== state) return nextState;

    // 15. Finance (Bank, Loans, Market)
    nextState = financeReducer(state, action);
    if (nextState !== state) return nextState;

    // 16. Minigames (Casino, Quiz, Greyhounds)
    nextState = minigameReducer(state, action);
    if (nextState !== state) return nextState;

    return state;
};
