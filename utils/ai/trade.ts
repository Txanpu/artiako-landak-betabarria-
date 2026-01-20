
import { GameState, Player, TradeOffer, TileData } from '../../types';
import { evaluateProperty } from './valuation';
import { getColorGroup, countOwnedInGroup } from './constants';

// --- STRATEGY 1: SET SWAPPING (Negociar colores cruzados) ---
export const getStrategicTradeProposal = (state: GameState, bot: Player): TradeOffer | null => {
    const colors = [...new Set(state.tiles.filter(t => t.color).map(t => t.color!))];
    
    // 1. Identify my partial sets (I have some, need more)
    const myPartialColors = colors.filter(c => {
        const g = getColorGroup(state.tiles, c);
        const owned = countOwnedInGroup(g, bot.id);
        return owned > 0 && owned < g.length;
    });

    for (const myColor of myPartialColors) {
        const myGroup = getColorGroup(state.tiles, myColor);
        // Find the specific tile(s) I am missing from this group
        const missingTiles = myGroup.filter(t => t.owner !== bot.id && t.owner !== null && t.owner !== 'E');
        
        for (const missingTile of missingTiles) {
            if (typeof missingTile.owner !== 'number') continue;
            
            const targetOwnerId = missingTile.owner;
            const targetPlayer = state.players.find(p => p.id === targetOwnerId);
            if (!targetPlayer) continue;

            // 2. Check if I have something THEY need (Cross-Set Swap)
            // Look at target's partial sets
            const theirPartialColors = colors.filter(c => {
                const g = getColorGroup(state.tiles, c);
                const owned = countOwnedInGroup(g, targetOwnerId);
                return owned > 0 && owned < g.length;
            });

            for (const theirColor of theirPartialColors) {
                const theirGroup = getColorGroup(state.tiles, theirColor);
                // Do I own a piece of their incomplete group?
                const pieceIHave = theirGroup.find(t => t.owner === bot.id);
                
                if (pieceIHave) {
                    // FOUND A SWAP: I give 'pieceIHave', I get 'missingTile'
                    
                    // Valuation check to balance money
                    const valMyItem = evaluateProperty(state, targetPlayer, pieceIHave); // Value to them
                    const valTheirItem = evaluateProperty(state, bot, missingTile); // Value to me
                    
                    const diff = valTheirItem - valMyItem;
                    let moneyOffer = 0;
                    let moneyReq = 0;

                    if (diff > 0) moneyOffer = diff; // I pay difference
                    else moneyReq = Math.abs(diff);  // They pay difference

                    // Cap money to affordable limits
                    if (moneyOffer > bot.money * 0.8) continue; // Too expensive
                    if (moneyReq > targetPlayer.money) moneyReq = targetPlayer.money; // They can't pay

                    return {
                        initiatorId: bot.id,
                        targetId: targetOwnerId,
                        offeredProps: [pieceIHave.id],
                        offeredMoney: Math.floor(moneyOffer),
                        requestedProps: [missingTile.id],
                        requestedMoney: Math.floor(moneyReq),
                        isOpen: true
                    };
                }
            }
        }
    }
    
    // Fallback to standard "Buy what I need" logic if no swap found
    return getStandardTradeProposal(state, bot);
};

// --- STRATEGY 2: OPTIONS (Buy Call on missing piece) ---
export const getStrategicOptionAction = (state: GameState, bot: Player): { type: 'create_option', payload: any } | null => {
    // Only if rich enough to pay premium
    if (bot.money < 200) return null;

    const colors = [...new Set(state.tiles.filter(t => t.color).map(t => t.color!))];
    
    for (const c of colors) {
        const group = getColorGroup(state.tiles, c);
        const myCount = countOwnedInGroup(group, bot.id);
        
        // If I own majority (e.g. 2 of 3) and missing one is owned by another player
        if (myCount === group.length - 1) {
            const missing = group.find(t => t.owner !== bot.id && t.owner !== null && t.owner !== 'E');
            if (missing && typeof missing.owner === 'number') {
                // Check if I already have an option
                const hasOption = state.financialOptions.some(o => o.propertyId === missing.id && o.holderId === bot.id);
                if (hasOption) continue;

                // Create Call Proposal
                // Strike Price: 150% of market value (tempting for seller)
                // Premium: 20% of strike
                const strike = Math.floor((missing.price || 100) * 1.5);
                const premium = Math.floor(strike * 0.2);

                if (bot.money >= premium) {
                    return {
                        type: 'create_option',
                        payload: {
                            type: 'call',
                            propId: missing.id,
                            strike: strike,
                            premium: premium,
                            counterpartyId: missing.owner // I buy from owner
                        }
                    };
                }
            }
        }
    }
    return null;
};

// Legacy/Fallback Logic (Buying junk or standard props)
const getStandardTradeProposal = (state: GameState, bot: Player): TradeOffer | null => {
    // ... existing logic simplified or kept if needed, 
    // but the set-swap above is the priority.
    // Let's implement a simple cash buyout for a needed property if swap fails.
    
    const colors = [...new Set(state.tiles.filter(t => t.color).map(t => t.color!))];
    for (const c of colors) {
        const group = getColorGroup(state.tiles, c);
        const myCount = countOwnedInGroup(group, bot.id);
        
        if (myCount > 0 && myCount < group.length) {
             const missing = group.find(t => t.owner !== bot.id && t.owner !== null && t.owner !== 'E');
             if (missing && typeof missing.owner === 'number') {
                 const owner = state.players.find(p => p.id === missing.owner);
                 if (!owner) continue;

                 const valuation = evaluateProperty(state, bot, missing);
                 const offer = Math.min(bot.money * 0.6, valuation * 1.2);

                 if (offer > (missing.price || 0)) {
                     return {
                        initiatorId: bot.id,
                        targetId: missing.owner,
                        offeredMoney: Math.floor(offer),
                        offeredProps: [],
                        requestedMoney: 0,
                        requestedProps: [missing.id],
                        isOpen: true
                     };
                 }
             }
        }
    }

    return null;
};

export const evaluateTradeByBot = (state: GameState, bot: Player, offer: TradeOffer): boolean => {
    // 1. Analyze what I GET
    let valueIn = offer.offeredMoney;
    let getsCompletedSet = false;
    
    offer.offeredProps.forEach(pid => {
        const t = state.tiles[pid];
        let strategicVal = evaluateProperty(state, bot, t);
        
        // Bonus: Does this complete a set?
        const g = getColorGroup(state.tiles, t.color!);
        if (countOwnedInGroup(g, bot.id) === g.length - 1) {
            getsCompletedSet = true;
            strategicVal *= 2.0; // Desperate for last piece
        }

        valueIn += strategicVal;
    });

    // 2. Analyze what I GIVE
    let valueOut = offer.requestedMoney;
    let breaksMySet = false;
    
    offer.requestedProps.forEach(pid => {
        const t = state.tiles[pid];
        let strategicVal = evaluateProperty(state, bot, t);
        
        const group = getColorGroup(state.tiles, t.color!);
        // If I am breaking a set I'm building, value it higher
        if (countOwnedInGroup(group, bot.id) > 1) strategicVal *= 1.5; 
        // If I am breaking a completed monopoly, NEVER SELL (unless huge overpay)
        if (countOwnedInGroup(group, bot.id) === group.length) {
            strategicVal *= 10.0; 
            breaksMySet = true;
        }

        valueOut += strategicVal;
    });

    if (breaksMySet && valueIn < valueOut * 2) return false; 

    // 3. Decision
    const ratio = valueIn / (valueOut || 1);
    
    // Florentino is greedy
    if (bot.role === 'florentino' && ratio > 1.2) return true;
    
    // If it helps me complete a set, I'm very lenient
    if (getsCompletedSet && ratio > 0.85) return true;

    return ratio >= 1.1; // Usually demand 10% profit
};
