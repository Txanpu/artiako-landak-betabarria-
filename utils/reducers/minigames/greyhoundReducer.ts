
import { GameState } from '../../../types';
import { formatMoney, initGreyhounds } from '../../gameLogic';

export const greyhoundReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_GREYHOUNDS': {
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];

            if (player.playedMinigames?.includes('greyhounds')) {
                return { ...state, logs: ['🚫 Ya has apostado en los Galgos este turno.', ...state.logs] };
            }

            if (state.gov === 'left') {
                return { ...state, logs: ['🚫 Carreras prohibidas por derechos de los animales.', ...state.logs] };
            }

            // Mark as played
            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, playedMinigames: [...(player.playedMinigames || []), 'greyhounds'] };

            return {
                ...state,
                players: newPlayers,
                showGreyhounds: true,
                greyhounds: initGreyhounds(),
                greyhoundPot: 0,
                greyhoundBets: {},
                logs: ['🏁 Iniciando carreras de galgos...', ...state.logs]
            };
        }
        case 'BET_GREYHOUND': {
            const { pId, amount } = action.payload;
            const player = state.players.find(p => p.id === pId);
            if (!player || player.money < amount) return state;
            
            const newPlayers = [...state.players];
            const pIdx = newPlayers.findIndex(p => p.id === pId);
            newPlayers[pIdx] = { ...player, money: player.money - amount };
            
            // El dinero va al Estado (La Banca)
            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney + amount
            };
        }
        case 'PAYOUT_GREYHOUND': {
            const { pId, amount } = action.payload;
            const player = state.players.find(p => p.id === pId);
            if (!player) return state;
            
            const newPlayers = [...state.players];
            const pIdx = newPlayers.findIndex(p => p.id === pId);
            newPlayers[pIdx] = { ...player, money: player.money + amount };
            
            // El dinero sale del Estado (La Banca)
            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney - amount,
                logs: [`🏆 ¡${player.name} gana $${formatMoney(amount)} en los galgos!`, ...state.logs]
            };
        }
        case 'CLOSE_GREYHOUNDS': return { ...state, showGreyhounds: false };
        default: return state;
    }
};
