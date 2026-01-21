
import { GameState, TileType } from '../../../types';
import { rollDice } from '../../gameLogic';
import { getNearestTileBySubtype } from '../../board';
import { handleLandingLogic } from '../../movement/landingLogic';
import { navigationReducer } from './navigation';
import { getJailRules } from '../../governmentRules';

export const handleRollDice = (state: GameState, action: any): GameState => {
    if (state.rolled) return state;
    const pIdx = state.currentPlayerIndex;
    const player = { ...state.players[pIdx] };
    
    // Handle Skip Turn
    if (player.skipTurns && player.skipTurns > 0) {
        player.skipTurns--;
        const newPlayers = [...state.players];
        newPlayers[pIdx] = player;
        return { ...state, players: newPlayers, rolled: true, logs: [`${player.name} pierde el turno.`, ...state.logs] };
    }

    // CHECK DRUG EFFECT
    const isHigh = (player.highTurns || 0) > 0;
    const diceCount = isHigh ? 3 : 2;

    const diceResults = action.payload?.dice || rollDice(diceCount);
    
    // Sum Dice
    let total = diceResults.reduce((a: number, b: number) => a + b, 0);
    
    const d1 = diceResults[0];
    const d2 = diceResults[1];
    const isDouble = d1 === d2;

    // Log Construction
    let logMsg = `${player.name} tiró ${diceResults.join(' + ')}`;
    if (isHigh) logMsg += ' ❄️(3º Dado)';
    
    // Weather Logic: Rain reduces movement by 1
    if (state.world.weather === 'rain') {
        total = Math.max(1, total - 1);
        logMsg += ` (Lluvia -1)`;
    }
    
    logMsg += ` = ${total}.`;
    if (isDouble) logMsg += ' ¡DOBLES!';
    
    let logs = [logMsg];
    
    // --- JAIL LOGIC START ---
    if (player.jail > 0) {
        logs = [`${player.name} tiró ${d1} + ${d2} en la cárcel.`];
        let newPlayers = [...state.players];

        if (isDouble) {
            player.jail = 0;
            player.doubleStreak = 0; 
            logs.push("🎲 ¡Dobles! Sales gratis.");
            newPlayers[pIdx] = player;
            
            return navigationReducer(
                { ...state, players: newPlayers, dice: diceResults, rolled: true, logs: [...logs, ...state.logs] },
                { type: 'START_MOVE', payload: { moves: total } }
            );
        } else {
            player.jail--;
            if (player.jail === 0) {
                const FINE = 50; 
                player.money -= FINE;
                state.estadoMoney += FINE;
                logs.push(`⏳ Último intento fallido. Pagas fianza forzosa de $${FINE} y mueves.`);
                newPlayers[pIdx] = player;
                
                return navigationReducer(
                    { ...state, players: newPlayers, dice: diceResults, rolled: true, logs: [...logs, ...state.logs] },
                    { type: 'START_MOVE', payload: { moves: total } }
                );
            } else {
                logs.push(`🔒 Te quedas. Restan ${player.jail} intentos.`);
                newPlayers[pIdx] = player;
                return { ...state, players: newPlayers, dice: diceResults, rolled: true, logs: [...logs, ...state.logs] };
            }
        }
    }
    // --- JAIL LOGIC END ---

    state.usedTransportHop = false;

    // 0-0 RULE: Repeat Tile (Only first 2 dice)
    if (d1 === 0 && d2 === 0) {
        logs.push('⟳ Regla 0–0: Repites casilla.');
        // We do NOT return here anymore. We let it fall through to Double Logic.
        // Total is 0, so navigationReducer will trigger handleLandingLogic immediately on current tile.
        // isDouble is true, so rolled will be false (re-roll allowed).
    }

    // SNAKE EYES RULE (1-1)
    if (d1 === 1 && d2 === 1) {
        const jailRules = getJailRules(state.gov);
        if (jailRules.immune) {
            logs.push(`🐍 Ojos de Serpiente: Gobierno ${state.gov.toUpperCase()} anula la cárcel. Te salvas.`);
            return { ...state, dice: [1,1], rolled: true, logs: [...logs, ...state.logs] };
        } else {
            logs.push('🐍 Ojos de Serpiente: ¡Cárcel directa!');
            const jailTile = state.tiles.find(t => t.type === TileType.JAIL);
            player.jail = jailRules.duration;
            player.pos = jailTile ? jailTile.id : 10;
            player.doubleStreak = 0;
            const newPlayers = [...state.players];
            newPlayers[pIdx] = player;
            return { ...state, players: newPlayers, dice: [1,1], rolled: true, logs: [...logs, ...state.logs] };
        }
    }

    // 6 & 9 RULE
    const is69 = (d1 === 6 && d2 === 9) || (d1 === 9 && d2 === 6);
    if (is69) {
        logs.push('➡️ Regla 6 y 9: Vas al FIORE más cercano.');
        const target = getNearestTileBySubtype(state.tiles, player.pos, 'fiore');
        player.pos = target;
        const newPlayers = [...state.players];
        newPlayers[pIdx] = player;
        return handleLandingLogic({ ...state, players: newPlayers, dice: diceResults, rolled: true, logs: [...logs, ...state.logs] });
    }

    // DOUBLES STREAK
    if (isDouble) {
        player.doubleStreak = (player.doubleStreak || 0) + 1;
        if (player.doubleStreak >= 3) {
            const jailRules = getJailRules(state.gov);
            if (jailRules.immune) {
                logs.push(`💥 3 Dobles: Gobierno ${state.gov.toUpperCase()} anula la cárcel. Pierdes el turno.`);
                return { ...state, dice: diceResults, rolled: true, logs: [...logs, ...state.logs] };
            } else {
                logs.push('💥 3 Dobles seguidos: ¡A la cárcel!');
                const jailTile = state.tiles.find(t => t.type === TileType.JAIL);
                player.jail = jailRules.duration;
                player.pos = jailTile ? jailTile.id : 10;
                player.doubleStreak = 0;
                const newPlayers = [...state.players];
                newPlayers[pIdx] = player;
                return { ...state, players: newPlayers, dice: diceResults, rolled: true, logs: [...logs, ...state.logs] };
            }
        }
        logs.push(`¡Dobles #${player.doubleStreak}! Tiras otra vez.`);
    } else {
        player.doubleStreak = 0;
    }

    return navigationReducer({
        ...state,
        dice: diceResults,
        rolled: !isDouble,
        logs: [...logs, ...state.logs]
    }, { type: 'START_MOVE', payload: { moves: total } });
};
