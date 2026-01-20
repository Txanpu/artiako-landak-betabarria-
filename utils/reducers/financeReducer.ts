
import { GameState } from '../../types';
import { loansReducer } from './finance/loans';
import { marketReducer } from './finance/market';

export const financeReducer = (state: GameState, action: any): GameState => {
    // 1. Loans & Pools
    const loanState = loansReducer(state, action);
    if (loanState !== state) return loanState;

    // 2. Market & Options & Offshore
    const marketState = marketReducer(state, action);
    if (marketState !== state) return marketState;

    // 3. UI Toggles
    switch (action.type) {
        case 'CLOSE_BANK_MODAL': return { ...state, showBankModal: false };
        case 'TOGGLE_BANK_MODAL': return { ...state, showBankModal: !state.showBankModal };
        default: return state;
    }
};
