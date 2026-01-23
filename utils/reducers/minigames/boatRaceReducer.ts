
import { GameState } from '../../../types';
import { formatMoney } from '../../gameLogic';

export const boatRaceReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_BOAT_RACE': {
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];

            if (player.playedMinigames?.includes('boatRace')) {
                return { ...state, logs: ['🚫 Ya has participado en la Regata este turno.', ...state.logs] };
            }

            if (state.gov === 'left') {
                return { ...state, logs: ['🚫 Regatas prohibidas por protección del ecosistema fluvial (Gobierno Izquierdas).', ...state.logs] };
            }

            // Mark as played
            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, playedMinigames: [...(player.playedMinigames || []), 'boatRace'] };

            return {
                ...state,
                players: newPlayers,
                selectedTileId: null, // Close property modal
                boatRace: {
                    isOpen: true,
                    phase: 'playing',
                    score: 0,
                    highScore: state.boatRace?.highScore || 0
                },
                logs: ['🚤 ¡Arranca la carrera de lanchas en Errota!', ...state.logs]
            };
        }

        case 'BOAT_RACE_CRASH': {
            if (!state.boatRace) return state;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            const score = action.payload.score;
            
            // Logic: Pay for repairs if low score, win small cash if high score
            let moneyChange = 0;
            let log = '';

            if (score > 50) {
                // Prize
                moneyChange = score * 2; // $2 per point
                log = `🏆 ¡Gran carrera! ${player.name} gana $${moneyChange} en premios.`;
            } else {
                // Repairs
                const repairCost = 30;
                moneyChange = -repairCost;
                log = `💥 ¡Choque! ${player.name} paga $${repairCost} en reparaciones de la lancha.`;
            }

            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, money: player.money + moneyChange };

            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney - moneyChange, // State pays prize or receives fine
                boatRace: { 
                    ...state.boatRace, 
                    phase: 'crashed', 
                    score: score,
                    highScore: Math.max(state.boatRace.highScore, score)
                },
                logs: [log, ...state.logs]
            };
        }

        case 'CLOSE_BOAT_RACE': {
            return { ...state, boatRace: null };
        }

        default: return state;
    }
};
