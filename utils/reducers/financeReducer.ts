
import { GameState } from '../../types';
import { loansReducer } from './finance/loans';
import { marketReducer } from './finance/market';
import { companyReducer } from './finance/companies';
import { payPendingDebt, resolveBankruptcy } from '../economy/debt';

export const financeReducer = (state: GameState, action: any): GameState => {
    // 1. Debt Management (High Priority)
    if (action.type === 'PAY_PENDING_DEBT') {
        return payPendingDebt(state);
    }

    if (action.type === 'DECLARE_BANKRUPTCY') {
        return resolveBankruptcy(state);
    }

    // 2. Loans & Pools
    let nextState = loansReducer(state, action);
    if (nextState !== state) return nextState;

    // 3. Market & Options & Offshore
    nextState = marketReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 4. Companies (Monopolies)
    nextState = companyReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 5. UI Toggles
    switch (action.type) {
        case 'CLOSE_BANK_MODAL': return { ...state, showBankModal: false };
        case 'TOGGLE_BANK_MODAL': return { ...state, showBankModal: !state.showBankModal };
        default: return state;
    }
};
