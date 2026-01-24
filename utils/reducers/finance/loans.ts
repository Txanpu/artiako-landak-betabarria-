
import { GameState } from '../../../types';
import { createLoan, createLoanPool, distributePoolDividends, formatMoney, splitLoan } from '../../gameLogic';

export const loansReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'TAKE_LOAN': { 
            const { amount, interest, totalRepayment, turns, lenderId, borrowerId } = action.payload; 
            
            // Determine actual borrower (default to current player if not specified)
            const actualBorrowerId = borrowerId !== undefined ? borrowerId : state.players[state.currentPlayerIndex].id;
            const actualLenderId = lenderId !== undefined ? lenderId : 'E';

            // Find indexes
            const borrowerIdx = state.players.findIndex(p => p.id === actualBorrowerId);
            const lenderIdx = actualLenderId === 'E' ? -1 : state.players.findIndex(p => p.id === actualLenderId);

            // Validation
            if (borrowerIdx === -1) return state;
            if (actualLenderId !== 'E' && lenderIdx === -1) return state;

            // Check Lender Funds (if not State)
            if (actualLenderId !== 'E') {
                const lender = state.players[lenderIdx];
                if (lender.money < amount) {
                    return { ...state, logs: [`❌ Préstamo fallido: ${lender.name} no tiene fondos suficientes.`, ...state.logs] };
                }
            } else {
                // CORRUPT BANK CHECK: State needs funds
                if (state.estadoMoney < amount) {
                    return { ...state, logs: [`❌ Banca Corrupta Fallida: El Estado no tiene fondos (${formatMoney(state.estadoMoney)}) para prestar.`, ...state.logs] };
                }
            }

            // Calculations
            let finalInterestTotal: number | undefined = undefined;
            if (totalRepayment !== undefined) {
                finalInterestTotal = Math.max(0, totalRepayment - amount);
            }
            const repayAmount = totalRepayment !== undefined ? totalRepayment : Math.round(amount * (1 + (interest/100)));

            // Create Loan Object
            const newLoan = createLoan(actualBorrowerId, amount, interest || 0, turns, finalInterestTotal);
            if (actualLenderId !== 'E') newLoan.lenderId = actualLenderId;

            // Execute Money Transfer
            const newPlayers = [...state.players];
            let newEstadoMoney = state.estadoMoney;

            // 1. Borrower gets money
            newPlayers[borrowerIdx] = { ...newPlayers[borrowerIdx], money: newPlayers[borrowerIdx].money + amount };

            // 2. Lender loses money
            if (actualLenderId !== 'E') {
                newPlayers[lenderIdx] = { ...newPlayers[lenderIdx], money: newPlayers[lenderIdx].money - amount };
            } else {
                newEstadoMoney -= amount;
            }

            const borrowerName = newPlayers[borrowerIdx].name;
            const lenderName = actualLenderId === 'E' ? 'el Estado' : newPlayers[lenderIdx].name;

            return { 
                ...state, 
                players: newPlayers, 
                loans: [...state.loans, newLoan], 
                estadoMoney: newEstadoMoney, 
                showBankModal: false, 
                logs: [`💸 PRÉSTAMO: ${lenderName} presta ${formatMoney(amount)} a ${borrowerName}. Devolverá ${formatMoney(repayAmount)}.`, ...state.logs] 
            }; 
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
