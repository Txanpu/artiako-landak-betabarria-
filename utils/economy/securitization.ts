
import { GameState, Loan, Listing } from '../../types';

// Split a loan into tradable shares
export const splitLoan = (state: GameState, loanId: string): GameState => {
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan || loan.poolId || (loan.shares && loan.shares.length > 0)) return state;

    // Default: Split into 10 shares of 10% (1000 bips) each
    // Owner becomes the current lender
    const ownerId = typeof loan.lenderId === 'number' ? loan.lenderId : state.currentPlayerIndex; // If 'E', assign to current player or logic needs handling. 
    // Assuming 'E' loans cannot be securitized by players unless they buy them first. 
    // But for gameplay fun, let's assume if a player OWNS the loan (lenderId !== 'E'), they can split.

    if (loan.lenderId === 'E') return state; // State loans cannot be split by players directly

    const shares = Array.from({ length: 10 }, (_, i) => ({
        id: `${loan.id}_sh_${Math.random().toString(36).substr(2, 5)}`,
        ownerId: ownerId,
        bips: 1000 // 10%
    }));

    const newLoans = state.loans.map(l => l.id === loanId ? { ...l, shares, lenderId: 'E' as const } : l); // Lender becomes abstract 'E' (or null logic), ownership is in shares
    // Note: We set lenderId to 'E' just to detach it from a single player, but logic should check shares first.

    return {
        ...state,
        loans: newLoans,
        logs: [`📜 Préstamo fraccionado en 10 participaciones.`, ...state.logs]
    };
};

export const createListing = (state: GameState, assetType: 'loanShare' | 'poolUnit', refId: string, subRefId: string | undefined, amount: number, price: number): GameState => {
    const sellerId = state.players[state.currentPlayerIndex].id;
    
    // Validation
    if (assetType === 'loanShare') {
        const loan = state.loans.find(l => l.id === refId);
        const share = loan?.shares?.find(s => s.id === subRefId);
        if (!share || share.ownerId !== sellerId) return state;
    } else {
        const pool = state.loanPools.find(p => p.id === refId);
        if (!pool || (pool.holdings[sellerId] || 0) < amount) return state;
    }

    const listing: Listing = {
        id: Math.random().toString(36).substr(2, 9),
        sellerId,
        assetType,
        assetRefId: refId,
        subRefId,
        amount,
        price
    };

    return {
        ...state,
        marketListings: [...state.marketListings, listing],
        logs: [`📢 Nueva oferta en mercado secundario: ${assetType === 'poolUnit' ? 'Unidades de Pool' : 'Participación de Préstamo'}.`, ...state.logs]
    };
};
