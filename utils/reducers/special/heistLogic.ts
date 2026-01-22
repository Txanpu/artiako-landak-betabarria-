
import { GameState, TileType } from '../../../types';

export const handleStealTreasury = (state: GameState): GameState => {
    const pIdx = state.currentPlayerIndex;
    const player = state.players[pIdx];
    
    // 1. Validation
    if (player.jail > 0) return { ...state, logs: ['🚫 No puedes robar desde la cárcel.', ...state.logs] };
    if (state.estadoMoney <= 20) return { ...state, logs: ['🚫 Las arcas están prácticamente vacías. No merece la pena el riesgo.', ...state.logs] };

    // 2. Probability Calculation
    let successChance = 0.30; 
    let heistName = 'Atraco';

    // Gov Modifiers
    if (state.gov === 'anarchy') { 
        successChance = 0.60; 
        heistName = 'Saqueo Anarquista'; 
    }
    if (state.gov === 'authoritarian') { 
        successChance = 0.05; 
        heistName = 'Golpe al Régimen'; 
    }
    if (state.gov === 'libertarian') {
        successChance = 0.30; // Standard
    }

    // Role Modifiers
    if (player.role === 'hacker') { successChance += 0.25; heistName += ' Digital'; }
    if (player.role === 'florentino') { successChance += 0.15; heistName = 'Desfalco'; }
    if (player.role === 'okupa') { successChance += 0.10; }
    if (player.role === 'fbi') { successChance -= 0.10; } 

    // Roll
    const roll = Math.random();
    const success = roll < successChance;

    const newPlayers = [...state.players];
    let newEstadoMoney = state.estadoMoney;
    let logs = [...state.logs];

    if (success) {
        // Success: Calculate Loot (20 to 500)
        let loot = 0;
        const amountRoll = Math.random();
        
        if (amountRoll < 0.90) {
            // Low tier loot ($20 - $50)
            loot = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
        } else {
            // High tier loot ($51 - $500)
            loot = Math.floor(Math.random() * (500 - 51 + 1)) + 51;
        }

        // Cap loot at available funds
        loot = Math.min(loot, state.estadoMoney);

        newEstadoMoney -= loot;
        newPlayers[pIdx] = { ...player, money: player.money + loot };
        logs.unshift(`💰 ¡${heistName} EXITOSO! ${player.name} roba $${loot} de las arcas.`);
    } else {
        // Fail: 7 Turns Jail + Fine
        const jailTile = state.tiles.find(t => t.type === TileType.JAIL);
        const jailPos = jailTile ? jailTile.id : 16; 

        const fine = Math.min(player.money, 200);
        
        newPlayers[pIdx] = { 
            ...player, 
            money: player.money - fine, 
            jail: 7, 
            pos: jailPos, 
            doubleStreak: 0,
            pendingMove: null
        };
        newEstadoMoney += fine;
        
        logs.unshift(`👮 ¡MALVERSACIÓN! ${player.name} detenido robando las arcas. 7 turnos de condena.`);
    }

    return {
        ...state,
        players: newPlayers,
        estadoMoney: newEstadoMoney,
        logs,
        pendingMoves: success ? state.pendingMoves : 0,
        transportOptions: success ? state.transportOptions : [],
        rolled: !success 
    };
};
