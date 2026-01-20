
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
import { pokemonReducer } from './reducers/minigames/pokemonReducer'; // Added

export const gameReducer = (state: GameState, action: any): GameState => {
    let nextState = state;

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

    // 6. Movement
    // IMPORTANT: 'SELECT_TILE' interaction logic
    if (action.type === 'SELECT_TILE' && state.pendingMoves > 0 && state.movementOptions.includes(action.payload)) {
        return movementReducer(state, { type: 'SELECT_MOVE', payload: action.payload });
    }
    nextState = movementReducer(state, action);
    if (nextState !== state) return nextState;

    // 7. Property Management
    nextState = propertyReducer(state, action);
    if (nextState !== state) return nextState;

    // 8. Auction
    nextState = auctionReducer(state, action);
    if (nextState !== state) return nextState;

    // 9. Trade
    nextState = tradeReducer(state, action);
    if (nextState !== state) return nextState;

    // 10. Finance (Bank, Loans, Market)
    nextState = financeReducer(state, action);
    if (nextState !== state) return nextState;

    // 11. Minigames (Casino, Quiz, Greyhounds)
    nextState = minigameReducer(state, action);
    if (nextState !== state) return nextState;

    return state;
};
