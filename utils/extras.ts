
import { GameState, TileData, TileType } from '../types';
import { evaluateProperty } from './ai';

// --- BUNDLES ---
export const findFreeBundles = (state: GameState, size: number = 2): number[][] => {
    const T = state.tiles;
    const bundles: number[][] = [];
    
    // Naive linear scan
    for (let i = 0; i < T.length; i++) {
        let sequence: number[] = [];
        for (let k = 0; k < size; k++) {
            const idx = (i + k) % T.length;
            if (T[idx].type === TileType.PROP && T[idx].owner === null) {
                sequence.push(idx);
            } else {
                sequence = [];
                break;
            }
        }
        if (sequence.length === size) {
            bundles.push(sequence);
        }
    }
    return bundles;
};

// --- MAINTENANCE ---
export const calculateAdvancedMaintenance = (playerId: number, tiles: TileData[]): number => {
    let due = 0;
    tiles.forEach(t => {
        if (t.owner !== playerId) return;
        if (t.hotel) due += 100;
        else if (t.houses) due += t.houses * 10;
        if ((t.price || 0) > 350) {
            due += Math.ceil((t.price || 0) * 0.05); 
        }
    });
    return due;
};

// --- BOTS & FAIR VALUE ---
export const getBotBid = (state: GameState, botId: number): number | null => {
    const auction = state.auction;
    if (!auction || !auction.isOpen) return null;
    
    const bot = state.players.find(p => p.id === botId);
    if (!bot) return null;

    let myValuation = 0;

    if (auction.kind === 'tile') {
        const t = state.tiles[auction.tileId];
        // Use God AI valuation
        myValuation = evaluateProperty(state, bot, t);
    } else if (auction.kind === 'bundle' && auction.items) {
        // Sum of valuations
        myValuation = auction.items.reduce((acc, tid) => acc + evaluateProperty(state, bot, state.tiles[tid]), 0);
    } else {
        // Financial assets (simple heuristic)
        myValuation = 100; // Placeholder for loans
    }

    const currentPrice = auction.currentBid;

    // Don't bid if we are winning
    if (auction.highestBidder === botId) return null;

    // Check budget (Absolute max is money - 10 safety)
    if (bot.money < currentPrice + 10) return null;

    // If current price is below my valuation, bid!
    // Aggression factor: Bots will bid up to 90% of their valuation, or 110% if desperate
    const aggression = bot.role === 'florentino' ? 1.1 : 0.95;
    const maxBid = myValuation * aggression;

    if (currentPrice < maxBid) {
        const step = Math.max(10, Math.ceil(currentPrice * 0.05));
        const nextBid = currentPrice + step;
        if (nextBid <= bot.money && nextBid <= maxBid) return nextBid;
    }
    
    return null;
};
