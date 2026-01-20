
import { GameState } from '../../../types';
import { createLoan, createLoanPool, distributePoolDividends, formatMoney, splitLoan } from '../../gameLogic';

export const loansReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'TAKE_LOAN': { 
            const { amount, interest, totalRepayment, turns, lenderId } = action.payload; 
            const lBorrowerIdx = state.currentPlayerIndex; 
            const lBorrower = { ...state.players[lBorrowerIdx] }; 
            
            let lender = lenderId !== undefined ? lenderId : 'E';
            if (lender !== 'E') {
                const lenderPlayer = state.players.find(p => p.id === lender);
                if (!lenderPlayer || lenderPlayer.money < amount) {
                    return { ...state, logs: [`❌ Préstamo fallido: Prestamista sin fondos.`, ...state.logs] };
                }
            }
            
            let finalInterestTotal: number | undefined = undefined;
            if (totalRepayment !== undefined) {
                finalInterestTotal = Math.max(0, totalRepayment - amount);
            }

            const newLoan = createLoan(lBorrower.id, amount, interest || 0, turns, finalInterestTotal);
            if (lender !== 'E') newLoan.lenderId = lender;

            lBorrower.money += amount; 
            const lPlayers = [...state.players]; 
            lPlayers[lBorrowerIdx] = lBorrower; 
            
            if (lender !== 'E') {
                const lenderIdx = lPlayers.findIndex(p => p.id === lender);
                if (lenderIdx !== -1) {
                    lPlayers[lenderIdx] = { ...lPlayers[lenderIdx], money: lPlayers[lenderIdx].money - amount };
                }
            } else {
                state.estadoMoney -= amount;
            }

            const repayAmount = totalRepayment !== undefined ? totalRepayment : Math.round(amount * (1 + (interest/100)));

            return { ...state, players: lPlayers, loans: [...state.loans, newLoan], estadoMoney: state.estadoMoney, showBankModal: false, logs: [`${lBorrower.name} pidió préstamo ${lender === 'E' ? 'al Estado' : 'P2P'}. Recibe: ${formatMoney(amount)}. Devuelve: ${formatMoney(repayAmount)}.`, ...state.logs] }; 
        }
        case 'CREATE_POOL': { 
            const { loanIds, name } = action.payload; 
            if(loanIds.length === 0) return state; 
            const pool = createLoanPool(state, loanIds, name); 
            return { ...state, logs: [`Pool "${name}" creado con ${loanIds.length} préstamos.`, ...state.logs] }; 
        }
        case 'DISTRIBUTE_DIVIDENDS': { 
            const { poolId } = action.payload; 
            const amt = distributePoolDividends(state, poolId); 
            return { ...state, logs: [`Repartidos $${amt} en dividendos del Pool.`, ...state.logs] }; 
        }
        case 'SECURITIZE_LOAN': {
            const { loanId } = action.payload;
            return splitLoan(state, loanId);
        }
        case 'TOGGLE_LOANS_MODAL': return { ...state, showLoansModal: !state.showLoansModal };
        default: return state;
    }
};
