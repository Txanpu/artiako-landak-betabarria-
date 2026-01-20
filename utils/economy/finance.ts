
import { GameState, Loan, LoanPool, FinancialOption } from '../../types';

export const createFinancialOption = (state: GameState, type: 'call' | 'put', propertyId: number, strike: number, premium: number, sellerId: number, buyerId: number): FinancialOption => {
    return {
        id: Math.random().toString(36).substr(2, 9),
        type, 
        propertyId, 
        strikePrice: strike, 
        premium, 
        writerId: sellerId, 
        holderId: buyerId,
        expiresTurn: state.turnCount + 10
    };
};

export const createLoanPool = (state: GameState, loanIds: string[], name: string): LoanPool => {
    const poolId = Math.random().toString(36).substr(2, 9);
    const pool: LoanPool = {
        id: poolId, name, loanIds, unitsTotal: 1000,
        holdings: { [state.players[state.currentPlayerIndex].id]: 1000 },
        cash: 0
    };
    state.loanPools.push(pool);
    state.loans.forEach(l => { if (loanIds.includes(l.id)) l.poolId = poolId; });
    return pool;
};

// Updated signature to accept explicitInterestTotal
export const createLoan = (borrowerId: number, amount: number, interest: number, turns: number, explicitInterestTotal?: number): Loan => {
    const interestTotal = explicitInterestTotal !== undefined 
        ? explicitInterestTotal 
        : Math.round(amount * (interest/100));

    return {
        id: Math.random().toString(36).substr(2, 9),
        borrowerId,
        lenderId: 'E',
        principal: amount,
        interestTotal: interestTotal,
        turnsTotal: turns,
        turnsLeft: turns,
        amountPerTurn: Math.round((amount + interestTotal) / turns),
        status: 'active'
    };
};

export const distributePoolDividends = (state: GameState, poolId: string) => {
    const pool = state.loanPools.find(p => p.id === poolId);
    if (!pool || pool.cash <= 0) return 0;
    
    const totalDist = pool.cash;
    
    for (const [pidStr, units] of Object.entries(pool.holdings)) {
        const pid = parseInt(pidStr);
        const player = state.players.find(p => p.id === pid);
        if (player) {
            const share = Math.floor((units / pool.unitsTotal) * totalDist);
            player.money += share;
        }
    }
    
    pool.cash = 0;
    return totalDist;
};