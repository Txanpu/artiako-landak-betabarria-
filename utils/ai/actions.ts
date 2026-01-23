
import { GameState, Player, TileData, TileType } from '../../types';
import { getHouseCost, getRent } from '../economy/rent';
import { evaluateProperty } from './valuation';
import { CASH_BUFFER, getColorGroup } from './constants';
import { getBoardNeighbors } from '../board';

// --- ACTION: BUY DECISION ---
export const shouldBotBuy = (state: GameState, player: Player, tile: TileData): boolean => {
    if (state.gov === 'left') return false; 
    
    const price = tile.price || 0;
    if (player.money < price) return false; // Absolute broke check

    const strategicValue = evaluateProperty(state, player, tile);
    
    // Logic:
    // 1. Always buy if it completes a monopoly (unless strictly impossible)
    if (strategicValue > price * 2) return true;

    // 2. Buy if affordable with buffer
    if (player.money - price > CASH_BUFFER) return true;

    // 3. Buy if it's a block, even if it hurts cash flow slightly
    if (strategicValue > price * 1.4 && player.money >= price) return true;

    return false;
};

// --- ACTION: BUILDING STRATEGY ---
export const getBotBuildActions = (state: GameState, player: Player): number[] => {
    if (player.money < 300) return []; 

    const buildableGroups: TileData[][] = [];
    const colors = [...new Set(state.tiles.filter(t => t.color).map(t => t.color!))];

    // Identify monopolies
    colors.forEach(c => {
        const group = getColorGroup(state.tiles, c);
        if (group.every(t => t.owner === player.id) && group.length > 0) {
            buildableGroups.push(group);
        }
    });

    if (buildableGroups.length === 0) return [];

    // Prioritize expensive groups (higher rent return usually)
    buildableGroups.sort((a, b) => (b[0].price || 0) - (a[0].price || 0));

    const actions: number[] = [];
    let budget = player.money - CASH_BUFFER;
    const allowUneven = state.gov === 'libertarian' || state.gov === 'anarchy';

    for (const group of buildableGroups) {
        // EVEN BUILDING LOGIC (Standard / Horizontal Law)
        if (!allowUneven) {
            const minHouses = Math.min(...group.map(t => t.houses || 0));
            if (minHouses >= 5) continue;

            const candidates = group.filter(t => (t.houses || 0) === minHouses && !t.mortgaged && !t.hotel);
            
            for (const t of candidates) {
                const cost = getHouseCost(t);
                const isHotel = t.houses === 4;
                const avail = isHotel ? state.hotelsAvail > 0 : state.housesAvail > 0;
                
                if (budget >= cost && avail) {
                    actions.push(t.id);
                    budget -= cost;
                }
            }
        } 
        // UNEVEN BUILDING LOGIC (Libertarian/Anarchy - Focus Fire)
        else {
            // Sort group by base price (highest rent potential first)
            const sortedGroup = [...group].sort((a, b) => (b.price||0) - (a.price||0));
            
            for (const t of sortedGroup) {
                if (t.mortgaged || t.hotel) continue;
                
                const current = t.houses || 0;
                // Try to max out this property before moving to next
                if (current < 5) {
                    const cost = getHouseCost(t);
                    const isHotel = current === 4;
                    const avail = isHotel ? state.hotelsAvail > 0 : state.housesAvail > 0;
                    
                    if (budget >= cost && avail) {
                        actions.push(t.id);
                        budget -= cost;
                        // Stop after queueing one build per tick per group to allow UI refresh
                        break; 
                    }
                }
            }
        }

        if (budget < 100) break; 
    }

    return actions;
};

// --- ACTION: PATHFINDING (AVOID HOTELS) ---
export const getBestMove = (state: GameState, player: Player, options: number[]): number => {
    if (options.length === 0) return player.pos;
    if (options.length === 1) return options[0];

    // Map each option to a "Danger Score"
    const scores = options.map(startNode => {
        let danger = 0;
        let current = startNode;
        // Look ahead 10 steps or until another junction
        for(let i=0; i<10; i++) {
            const tile = state.tiles[current];
            
            // Assess Rent Danger
            if (tile.type === TileType.PROP && tile.owner !== null && tile.owner !== player.id && tile.owner !== 'E') {
                const rent = getRent(tile, 7, state.tiles, state); // Assume average dice 7
                
                danger += rent;
                
                // MASSIVE FEAR OF HOTELS
                if (tile.hotel) danger += 2000; 
                else if ((tile.houses || 0) >= 3) danger += 500;
            }
            
            // Assess Special Danger
            if (tile.type === TileType.GOTOJAIL && player.jail === 0 && state.gov !== 'right') danger += 500;
            if (tile.type === TileType.TAX) danger += 100;

            // Move next
            const neighbors = getBoardNeighbors(current);
            // Simple heuristic: keep going forward. 
            // Neighbors usually return [next, prev] or [branchA, branchB, prev].
            // We just pick the first one that isn't where we came from (simplified graph walk)
            const next = neighbors.find(n => n !== current - 1 && n !== current + 1 && n !== player.pos) || neighbors[0];
            current = next;
        }
        return { option: startNode, danger };
    });

    // Sort by lowest danger
    scores.sort((a, b) => a.danger - b.danger);
    
    // Debug log in console if needed
    // console.log(`Bot ${player.name} pathfinding:`, scores);

    return scores[0].option;
};

// --- ACTION: OFFENSIVE OPTION EXECUTION ---
// Checks if I hold a PUT option against someone who is broke
// If so, execute it to force bankruptcy and steal assets
export const checkOffensiveOptionExec = (state: GameState, bot: Player): string | null => {
    const myOptions = state.financialOptions.filter(o => o.holderId === bot.id);
    
    for (const opt of myOptions) {
        // STRATEGY: PUT OPTION (Right to Sell)
        // If I have a PUT, I can force the writer to buy at Strike Price.
        // If they don't have the money -> Bankruptcy -> I get their stuff.
        if (opt.type === 'put') {
            const victim = state.players.find(p => p.id === opt.writerId);
            if (victim && victim.alive) {
                // Check if executing this would bankrupt them
                if (victim.money < opt.strikePrice) {
                    // Check if they have assets worth taking
                    const victimAssets = state.tiles.filter(t => t.owner === victim.id).length;
                    if (victimAssets > 0) {
                        return opt.id; // KILL HIM
                    }
                }
            }
        }
        
        // STRATEGY: CALL OPTION (Right to Buy)
        // Standard usage: If I have money and I want the property
        if (opt.type === 'call') {
            const tile = state.tiles[opt.propertyId];
            // Only exercise if I really want it (completes set) or it's cheap
            const value = evaluateProperty(state, bot, tile);
            
            if (bot.money > opt.strikePrice + CASH_BUFFER && value > opt.strikePrice) {
                return opt.id;
            }
        }
    }
    return null;
};
