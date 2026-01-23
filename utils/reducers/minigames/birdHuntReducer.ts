
import { GameState } from '../../../types';
import { formatMoney } from '../../gameLogic';

export const birdHuntReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_BIRD_HUNT': {
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];

            if (player.playedMinigames?.includes('birdHunt')) {
                return { ...state, logs: ['🚫 Ya has cazado en el Bird Center este turno.', ...state.logs] };
            }

            if (state.gov === 'left') {
                return { ...state, logs: ['🚫 Caza prohibida por Ley de Protección Animal (Gobierno Izquierdas).', ...state.logs] };
            }

            // Mark as played
            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, playedMinigames: [...(player.playedMinigames || []), 'birdHunt'] };

            return {
                ...state,
                players: newPlayers,
                selectedTileId: null, // Close property modal
                birdHunt: {
                    isOpen: true,
                    phase: 'playing',
                    score: 0,
                    highScore: state.birdHunt?.highScore || 0
                },
                logs: ['🦆 ¡Comienza la temporada en Bird Center! Duck Hunt JS.', ...state.logs]
            };
        }

        case 'BIRD_HUNT_GAME_OVER': {
            if (!state.birdHunt) return state;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            const score = action.payload.score;
            
            // Logic: High Score = Prize. Low Score = Fine (Wasting ammo/damaging reserve)
            // Threshold: 2000 points (4 ducks)
            let moneyChange = 0;
            let log = '';

            if (score >= 2000) {
                // Prize: $1 for every 20 points
                moneyChange = Math.floor(score / 20); 
                log = `🔫 ¡Buena puntería! ${player.name} vende las presas por $${moneyChange}.`;
            } else {
                // Fine
                const fine = 30;
                moneyChange = -fine;
                log = `🍂 Mala jornada. ${player.name} paga $${fine} por munición desperdiciada.`;
            }

            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, money: player.money + moneyChange };

            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney - moneyChange, 
                birdHunt: { 
                    ...state.birdHunt, 
                    phase: 'finished', 
                    score: score,
                    highScore: Math.max(state.birdHunt.highScore, score)
                },
                logs: [log, ...state.logs]
            };
        }

        case 'CLOSE_BIRD_HUNT': {
            return { ...state, birdHunt: null };
        }

        default: return state;
    }
};
