
import { GameState } from '../../../types';

export const fbiReducer = (state: GameState, action: any): GameState => {
    if (action.type !== 'FBI_GUESS') return state;

    const { fbiId, targetId, roleGuess } = action.payload; 
    const fbi = state.players.find(p => p.id === fbiId); 
    const target = state.players.find(p => p.id === targetId); 
    
    if(!fbi || !target) return state; 
    
    const newGuesses = { ...state.fbiGuesses }; 
    if(!newGuesses[fbiId]) newGuesses[fbiId] = {}; 
    newGuesses[fbiId][targetId] = roleGuess; 
    
    const isCorrect = target.role === roleGuess; 
    
    if (isCorrect) {
        let logMsg = `🕵️ FBI ${fbi.name} acertó: ${target.name} es ${roleGuess}!`; 
        
        // Check if FBI has revealed ALL hidden roles (excluding self and civilians)
        let allGuessed = true;
        state.players.forEach(p => {
            if (p.id !== fbiId && p.alive && p.role !== 'civil') {
                const guess = newGuesses[fbiId]?.[p.id];
                if (guess !== p.role) allGuessed = false;
            }
        });

        if (allGuessed) {
            logMsg += " ¡EL FBI HA DESCUBIERTO A TODOS! Recompensa: Expropiar 2 casillas libres.";
            return { ...state, fbiGuesses: newGuesses, fbiExpropriationSlots: 2, logs: [logMsg, ...state.logs] }; 
        }

        return { ...state, fbiGuesses: newGuesses, logs: [logMsg, ...state.logs] }; 
    } else {
        // INCORRECT GUESS - RISK CHECK
        // 40% Chance of Bankruptcy/Elimination for False Accusation
        if (Math.random() < 0.40) {
            const seizedCash = Math.max(0, fbi.money);
            const newEstadoMoney = state.estadoMoney + seizedCash;

            // Transfer Properties to State ('E')
            const newTiles = state.tiles.map(t => {
                if (t.owner === fbi.id) {
                    return { ...t, owner: 'E' as const, houses: 0, hotel: false, mortgaged: false };
                }
                return t;
            });

            // Eliminate FBI
            const newPlayers = state.players.map(p => {
                if (p.id === fbiId) {
                    return { ...p, money: 0, alive: false, props: [] };
                }
                return p;
            });

            return {
                ...state,
                players: newPlayers,
                tiles: newTiles,
                estadoMoney: newEstadoMoney,
                fbiGuesses: newGuesses,
                logs: [`⚖️ FALSO TESTIMONIO: El Agente ${fbi.name} falló la acusación contra ${target.name}. El Estado lo elimina por incompetencia. BIENES INCAUTADOS.`, ...state.logs]
            };
        } else {
            // Safe fail
            const logMsg = `🕵️ FBI ${fbi.name} falló sospecha sobre ${target.name}.`; 
            return { ...state, fbiGuesses: newGuesses, logs: [logMsg, ...state.logs] }; 
        }
    }
};
