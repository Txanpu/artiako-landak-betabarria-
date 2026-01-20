
import { GameState } from '../../types';
import { getInsiderChoice } from '../risk';

export const specialReducer = (state: GameState, action: any): GameState => {
    
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
