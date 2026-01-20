
import { GameState, TileData } from '../types';
import { EVENTS_DECK } from './events/definitions';

// Configuration
const MARGIN_CASH_THRESHOLD = 120;
const GRACE_TURNS = 1;

export const checkLoanMarginCalls = (state: GameState, playerId: number): { state: GameState, logs: string[] } => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return { state, logs: [] };

    // Only check if cash is low
    if (player.money >= MARGIN_CASH_THRESHOLD) return { state, logs: [] };

    let logs: string[] = [];
    let newState = { ...state };
    let loansUpdated = [...newState.loans];
    let auctionTriggered = false;

    // Find loans to call
    for (let i = 0; i < loansUpdated.length; i++) {
        const loan = { ...loansUpdated[i] };
        if (loan.borrowerId !== playerId || loan.status !== 'active') continue;
        
        // Check grace period
        if (loan.lastMarginTurn && (state.turnCount - loan.lastMarginTurn < GRACE_TURNS)) continue;
        
        // If has collateral, force auction
        if (loan.collateralTileIds && loan.collateralTileIds.length > 0) {
            const tileId = loan.collateralTileIds[0];
            loan.lastMarginTurn = state.turnCount;
            loansUpdated[i] = loan;
            
            // Trigger forced auction
            newState.auction = {
                tileId: tileId,
                currentBid: 0,
                highestBidder: null,
                activePlayers: state.players.filter(p => p.alive).map(p => p.id),
                timer: 20,
                isOpen: true,
                kind: 'tile' // Forced sale
            };
            logs.push(`📉 MARGIN CALL: Préstamo en riesgo. Se subasta garantía #${state.tiles[tileId].name} forzosamente.`);
            auctionTriggered = true;
            break; // Max one auction trigger per check to avoid UI lock
        }
    }
    
    newState.loans = loansUpdated;
    return { state: newState, logs };
};

export const calculateDynamicMaintenance = (playerId: number, tiles: TileData[]): number => {
    const MONO_MULT = 1.5;
    const NON_MONO_MULT = 0.7;
    const BASE_PCT = 0.05;
    const MIN_FEE = 5;

    // Group by color
    const colors: Record<string, TileData[]> = {};
    tiles.forEach(t => {
        if (t.color && t.type === 'prop') {
            if (!colors[t.color]) colors[t.color] = [];
            colors[t.color].push(t);
        }
    });

    let totalDue = 0;

    Object.values(colors).forEach(group => {
        const owned = group.filter(t => t.owner === playerId);
        if (owned.length === 0) return;

        const isMonopoly = owned.length === group.length;
        const multiplier = isMonopoly ? MONO_MULT : NON_MONO_MULT;

        owned.forEach(t => {
            let base = t.maintenance || Math.ceil((t.price || 0) * BASE_PCT);
            if (t.houses) base += t.houses * 10;
            if (t.hotel) base += 100;
            
            // Luxury tax implied in price check or subtype
            if ((t.price || 0) > 350) base += Math.ceil((t.price || 0) * 0.02);

            const fee = Math.max(MIN_FEE, Math.ceil(base * multiplier));
            totalDue += fee;
        });
    });

    return totalDue;
};

export const getInsiderChoice = (): { id: string, title: string } | null => {
    // Filter economic events
    const econEvents = EVENTS_DECK.filter(e => 
        /econ|mercado|liquid|inflac|tipos|crisis|banco/i.test(e.title + e.description) || 
        ['ev_inflation', 'ev_tax_audit', 'ev_market_crash'].includes(e.id)
    );
    
    if (econEvents.length === 0) return null;
    const choice = econEvents[Math.floor(Math.random() * econEvents.length)];
    return { id: choice.id, title: choice.title };
};

export const getPredatorBid = (state: GameState, botId: number): number | null => {
    const auction = state.auction;
    if (!auction || !auction.isOpen) return null;
    
    const currentHigh = auction.highestBidder;
    if (currentHigh === null || currentHigh === 'E') return null;
    if (currentHigh === botId) return null;

    // Check if rival is stressed
    const rival = state.players.find(p => p.id === currentHigh);
    if (!rival) return null;
    
    // Stress threshold calculation: Money < Maintenance + 50 buffer
    const maint = calculateDynamicMaintenance(rival.id, state.tiles);
    if (rival.money < maint + 50) {
        // Attack!
        const bot = state.players.find(p => p.id === botId);
        if (!bot) return null;
        
        const bidStep = Math.max(10, Math.ceil(auction.currentBid * 0.10)); // +10% aggressive jump
        const nextBid = auction.currentBid + bidStep;
        
        // Cap bid at fair value * 1.5 to not suicide
        const fairValue = (state.tiles[auction.tileId]?.price || 100);
        if (nextBid > fairValue * 1.5) return null;

        if (bot.money >= nextBid) return nextBid;
    }
    return null;
};
