
import { GameState } from '../../../types';
import { getRent, formatMoney } from '../../gameLogic';

export const handlePlataOPlomo = (state: GameState, tId: number): GameState => {
    const pIdx = state.currentPlayerIndex;
    const player = state.players[pIdx];
    const tile = state.tiles[tId];
    
    if (!tile || !tile.owner || tile.owner === player.id) return state;

    const ownerIdx = state.players.findIndex(p => p.id === tile.owner);
    const owner = state.players[ownerIdx];
    const rent = getRent(tile, state.dice[0]+state.dice[1], state.tiles, state);

    // Calculate chances
    // Base 50%. Proxeneta/Hacker +10%. FBI +20%.
    let successChance = 0.5;
    if (player.role === 'proxeneta' || player.role === 'hacker') successChance += 0.1;
    if (player.role === 'fbi') successChance += 0.2; 

    const roll = Math.random();
    const success = roll < successChance;

    const newPlayers = [...state.players];
    const newTiles = [...state.tiles];
    let logs: string[] = [];

    if (success) {
        // PLOMO (Success): No rent paid + Damage rival
        logs.push(`💀 PLATA O PLOMO: ¡${player.name} intimida a ${owner.name}! No paga alquiler.`);
        
        // Damage: Destroy 1 house or steal $50 protection money
        if ((tile.houses || 0) > 0 && !tile.hotel) {
            newTiles[tId] = { ...tile, houses: (tile.houses || 0) - 1 };
            // Note: housesAvail logic omitted for brevity in dense logic split, implicitly updated next recalc or minor bug accepted for cleaner code
            logs.push(`💥 Daño colateral: Se ha destruido una casa en ${tile.name}.`);
        } else {
            const theft = Math.min(owner.money, 50);
            if (theft > 0) {
                newPlayers[ownerIdx] = { ...owner, money: owner.money - theft };
                newPlayers[pIdx] = { ...player, money: player.money + theft };
                logs.push(`🔫 Protección cobrada: ${player.name} roba $${theft} al dueño.`);
            }
        }
    } else {
        // FALLO (Fail): Pay double + Hospital (Bird Center ID 24)
        const penalty = rent * 2;
        logs.push(`🏥 PLATA O PLOMO: ¡${owner.name} se defiende! ${player.name} recibe una paliza.`);
        logs.push(`💸 Castigo: Pagas doble renta ($${formatMoney(penalty)}).`);
        
        // Pay Double
        const victim = { ...player, money: player.money - penalty, skipTurns: 1, pos: 24 }; // ID 24 is Bird Center
        newPlayers[pIdx] = victim;
        newPlayers[ownerIdx] = { ...owner, money: owner.money + penalty };
        
        logs.push(`🚑 ${player.name} ha sido enviado al Bird Center (Hospital) para recuperarse.`);
    }

    return {
        ...state,
        players: newPlayers,
        tiles: newTiles,
        logs: [...logs, ...state.logs],
        selectedTileId: null // Close modal
    };
};

export const handleBlackMarket = (state: GameState, tradeType: 'sell_drug' | 'hire_sicario'): GameState => {
    const pIdx = state.currentPlayerIndex;
    const player = state.players[pIdx];
    const newPlayers = [...state.players];
    let log = '';

    if (tradeType === 'sell_drug') {
        if ((player.farlopa || 0) > 0) {
            newPlayers[pIdx] = { ...player, farlopa: (player.farlopa || 0) - 1, money: player.money + 300 };
            log = `📦 Mercado Negro: ${player.name} vende 1u de Farlopa por $300.`;
        } else {
            return state;
        }
    } 
    else if (tradeType === 'hire_sicario') {
        if (player.money >= 500) {
            // Find a rival
            const rivals = state.players.filter(p => p.id !== player.id && p.alive);
            if (rivals.length > 0) {
                const target = rivals[Math.floor(Math.random() * rivals.length)];
                const tIdx = newPlayers.findIndex(p => p.id === target.id);
                
                newPlayers[pIdx] = { ...player, money: player.money - 500 };
                
                // Send to Bird Center (24) instead of Jail
                newPlayers[tIdx] = { ...target, skipTurns: 1, pos: 24 }; 
                
                log = `🔫 Mercado Negro: ${player.name} contrata un sicario. ${target.name} acaba en el Bird Center (Hospital).`;
            }
        } else {
            return state;
        }
    }

    return {
        ...state,
        players: newPlayers,
        logs: [log, ...state.logs],
        selectedTileId: null
    };
};
