
import { GameState, TileType } from '../../types';
import { getInsiderChoice } from '../risk';
import { getRent, formatMoney } from '../gameLogic';

export const specialReducer = (state: GameState, action: any): GameState => {
    
    // Toggle FBI Modal
    if (action.type === 'TOGGLE_FBI_MODAL') {
        return { ...state, showFbiModal: !state.showFbiModal };
    }

    // --- NEW: STEAL TREASURY (EL GOLPE) ---
    if (action.type === 'STEAL_TREASURY') {
        const pIdx = state.currentPlayerIndex;
        const player = state.players[pIdx];
        
        // 1. Validation: Can only steal during your turn, if alive, and not jailed
        if (player.jail > 0) return { ...state, logs: ['🚫 No puedes robar desde la cárcel.', ...state.logs] };
        if (state.estadoMoney <= 0) return { ...state, logs: ['🚫 Las arcas están vacías. No hay nada que robar.', ...state.logs] };

        // 2. Cooldown check (Optional, or just high risk)
        // Let's use simple risk calculation
        
        let successChance = 0.20; // Base 20%
        let jailTurns = 3;
        let heistName = 'Atraco';

        // Gov Modifiers
        if (state.gov === 'anarchy') { 
            successChance = 0.60; 
            heistName = 'Saqueo Anarquista'; 
            jailTurns = 1; // Little punishment
        }
        if (state.gov === 'authoritarian') { 
            successChance = 0.05; 
            heistName = 'Golpe al Régimen'; 
            jailTurns = 6; // Gulag punishment
        }
        if (state.gov === 'libertarian') {
            successChance = 0.30;
        }

        // Role Modifiers
        if (player.role === 'hacker') { successChance += 0.25; heistName += ' Digital'; }
        if (player.role === 'florentino') { successChance += 0.15; heistName = 'Desfalco de Guante Blanco'; }
        if (player.role === 'okupa') { successChance += 0.10; }
        if (player.role === 'fbi') { successChance -= 0.10; } // FBI shouldn't steal easily (Conflict of interest)

        // Roll
        const roll = Math.random();
        const success = roll < successChance;

        const newPlayers = [...state.players];
        let newEstadoMoney = state.estadoMoney;
        let logs = [...state.logs];

        if (success) {
            // Success: Steal between 10% and 30% of treasury, capped at $1000
            const percent = 0.10 + (Math.random() * 0.20);
            let loot = Math.floor(state.estadoMoney * percent);
            if (loot > 1000) loot = 1000;
            if (loot < 50) loot = 50; // Minimum heist
            if (loot > state.estadoMoney) loot = state.estadoMoney;

            newEstadoMoney -= loot;
            newPlayers[pIdx] = { ...player, money: player.money + loot };
            logs.unshift(`💰 ¡${heistName} EXITOSO! ${player.name} roba $${loot} de las arcas del Estado.`);
        } else {
            // Fail: Go to Jail + Fine
            const fine = Math.min(player.money, 200);
            newPlayers[pIdx] = { 
                ...player, 
                money: player.money - fine, 
                jail: jailTurns, 
                pos: 10, // Jail Position
                doubleStreak: 0
            };
            newEstadoMoney += fine;
            
            // If Authoritarian, maybe confiscate property? (Too harsh for simple click)
            logs.unshift(`👮 ¡ALARMA! ${player.name} pillado intentando robar las arcas. Multa de $${fine} y ${jailTurns} turnos de cárcel.`);
        }

        return {
            ...state,
            players: newPlayers,
            estadoMoney: newEstadoMoney,
            logs,
            // If failed and jailed, cancel movement if any
            pendingMoves: success ? state.pendingMoves : 0,
            transportOptions: success ? state.transportOptions : []
        };
    }

    // --- GENDER ABILITIES (ULTIMATES) ---
    if (action.type === 'TRIGGER_GENDER_ABILITY') {
        const pIdx = state.currentPlayerIndex;
        const player = state.players[pIdx];
        
        // Validation
        if (player.genderAbilityCooldown > 0) {
            return { ...state, logs: [`⏳ Habilidad en enfriamiento (${player.genderAbilityCooldown} turnos).`, ...state.logs] };
        }

        let newPlayers = [...state.players];
        let newTiles = [...state.tiles];
        let logs = [...state.logs];
        let newMoney = state.estadoMoney;
        
        // Reset Cooldown (Base 10 turns)
        newPlayers[pIdx] = { ...player, genderAbilityCooldown: 10 };

        // 1. MALE: MANSPLAINING (Force Skip Turn)
        if (player.gender === 'male') {
            const rivals = newPlayers.filter(p => p.id !== player.id && p.alive);
            if (rivals.length > 0) {
                const victim = rivals[Math.floor(Math.random() * rivals.length)];
                const vIdx = newPlayers.findIndex(p => p.id === victim.id);
                newPlayers[vIdx] = { ...victim, skipTurns: (victim.skipTurns || 0) + 1 };
                logs.unshift(`📢 MANSPLAINING: ${player.name} explica la vida a ${victim.name}. ${victim.name} pierde 1 turno.`);
            }
        }

        // 2. FEMALE: CANCEL CULTURE (Block Rent) - 2 TURNS
        if (player.gender === 'female') {
            // Find a valuable rival property
            const rivalProps = newTiles.filter(t => t.type === 'prop' && t.owner !== null && t.owner !== player.id && t.owner !== 'E');
            if (rivalProps.length > 0) {
                const target = rivalProps[Math.floor(Math.random() * rivalProps.length)];
                newTiles[target.id] = { ...target, blockedRentTurns: 2 }; // STRICTLY 2 TURNS
                logs.unshift(`🚫 CANCELACIÓN: ${player.name} funa a la propiedad ${target.name}. 2 turnos sin cobrar renta.`);
            } else {
                logs.unshift(`🚫 No hay propiedades rivales para cancelar.`);
            }
        }

        // 3. HELICOPTER: NAPALM (Destroy Building)
        if (player.gender === 'helicoptero') {
            const COST = 300;
            if (player.money >= COST) {
                // Find property with buildings
                const targets = newTiles.filter(t => t.type === 'prop' && t.owner !== null && t.owner !== player.id && t.owner !== 'E' && ((t.houses||0) > 0 || t.hotel));
                
                if (targets.length > 0) {
                    newPlayers[pIdx].money -= COST; // Deduct from *new* player object
                    newMoney += COST;
                    
                    const target = targets[Math.floor(Math.random() * targets.length)];
                    let damageMsg = '';
                    
                    if (target.hotel) {
                        target.hotel = false;
                        target.houses = 4;
                        damageMsg = `El Hotel en ${target.name}`;
                    } else {
                        target.houses = (target.houses || 0) - 1;
                        damageMsg = `Una casa en ${target.name}`;
                    }
                    
                    newTiles[target.id] = target;
                    logs.unshift(`🚁 NAPALM: ${player.name} bombardea ${target.name}. ${damageMsg} ha sido destruida.`);
                } else {
                    logs.unshift(`🚁 No hay objetivos estratégicos (edificios) para bombardear.`);
                }
            } else {
                logs.unshift(`🚁 Necesitas $300 para combustible y munición.`);
                // Refund cooldown
                newPlayers[pIdx].genderAbilityCooldown = 0;
            }
        }

        // 4. MARCIANITO: ABDUCTION (Swap Position)
        if (player.gender === 'marcianito') {
            const rivals = newPlayers.filter(p => p.id !== player.id && p.alive);
            if (rivals.length > 0) {
                const victim = rivals[Math.floor(Math.random() * rivals.length)];
                const vIdx = newPlayers.findIndex(p => p.id === victim.id);
                
                const myPos = player.pos;
                const theirPos = victim.pos;
                
                newPlayers[pIdx].pos = theirPos;
                newPlayers[vIdx].pos = myPos;
                
                logs.unshift(`🛸 ABDUCCIÓN: ${player.name} intercambia posición con ${victim.name}.`);
            }
        }

        return {
            ...state,
            players: newPlayers,
            tiles: newTiles,
            logs,
            estadoMoney: newMoney
        };
    }

    // --- ANARCHY: PLATA O PLOMO ---
    if (action.type === 'PLATA_O_PLOMO') {
        const { tId } = action.payload;
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
        if (player.role === 'fbi') successChance += 0.2; // FBI has guns

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
                state.housesAvail++;
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
    }

    // --- ANARCHY: BLACK MARKET (HACIENDA REPLACEMENT) ---
    if (action.type === 'BLACK_MARKET_TRADE') {
        const { action: tradeType } = action.payload; // 'sell_drug' | 'hire_sicario'
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
    }

    if (action.type === 'BRIBE_GOV') {
        const { pId } = action.payload;
        const player = state.players.find(p => p.id === pId);
        const COST = 200;
        
        if (player && player.money >= COST) {
            const newPlayers = state.players.map(p => p.id === pId ? { ...p, money: p.money - COST } : p);
            return {
                ...state,
                players: newPlayers,
                fbiPot: (state.fbiPot || 0) + COST,
                govTurnsLeft: 1, // Trigger election next tick
                logs: [`💼 SOBORNO: ${player.name} paga $200 para forzar elecciones inmediatas.`, ...state.logs]
            };
        }
        return state;
    }

    if (action.type === 'SABOTAGE_SUPPLY') {
        const { tId } = action.payload;
        const pIdx = state.currentPlayerIndex;
        const player = state.players[pIdx];
        const tile = state.tiles[tId];
        
        if (tile.owner === player.id && player.pos === tId) {
            const rivals = state.tiles.filter(t => t.type === 'prop' && t.owner !== null && t.owner !== player.id && t.owner !== 'E');
            if (rivals.length > 0) {
                const target = rivals[Math.floor(Math.random() * rivals.length)];
                const newTiles = [...state.tiles];
                newTiles[target.id] = { ...target, blockedRentTurns: 1 };
                
                return {
                    ...state,
                    tiles: newTiles,
                    logs: [`⚡ CORTE DE SUMINISTRO: ${player.name} sabotea ${target.name}. No cobrará renta por 1 turno.`, ...state.logs]
                };
            } else {
                return { ...state, logs: [`⚡ Sabotaje fallido: No hay rivales con propiedades.`, ...state.logs] };
            }
        }
        return state;
    }

    if (action.type === 'USE_INSIDER') {
        const { pId } = action.payload;
        const player = state.players.find(p => p.id === pId);
        
        if (player && player.insiderTokens > 0) {
            const nextEvent = getInsiderChoice();
            if (nextEvent) {
                const newPlayers = state.players.map(p => p.id === pId ? { ...p, insiderTokens: p.insiderTokens - 1 } : p);
                
                return {
                    ...state,
                    players: newPlayers,
                    meta: {
                        ...state.meta,
                        insider: { committed: nextEvent.id }
                    },
                    logs: [`🕵️ INSIDER: ${player.name} ha fijado el próximo evento económico: ${nextEvent.title}.`, ...state.logs]
                };
            }
            return { ...state, logs: ['⚠️ Insider: No se pudo encontrar evento económico.', ...state.logs] };
        }
        return state;
    }

    return state;
};
