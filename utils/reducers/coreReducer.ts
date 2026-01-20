
import { GameState } from '../../types';
import { lifecycleReducer } from './core/lifecycle';
import { resolveEndTurn } from './core/turnEnd';
import { debugReducer } from './core/debug';

export const coreReducer = (state: GameState, action: any): GameState => {
    if (action.type === 'END_TURN') {
        return resolveEndTurn(state);
    }

    let nextState = lifecycleReducer(state, action);
    if (nextState !== state) return nextState;

    nextState = debugReducer(state, action);
    if (nextState !== state) return nextState;

    return state;
};
