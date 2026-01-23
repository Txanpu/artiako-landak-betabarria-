
import { GameState } from '../../../types';
import { formatMoney } from '../../gameLogic';

export const skateReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_SKATE': {
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];

            if (player.playedMinigames?.includes('skate')) {
                return { ...state, logs: ['🚫 Ya has patinado en el Skate Park este turno.', ...state.logs] };
            }

            // Mark as played
            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, playedMinigames: [...(player.playedMinigames || []), 'skate'] };

            return {
                ...state,
                players: newPlayers,
                selectedTileId: null, // Close property modal
                skate: {
                    isOpen: true,
                    phase: 'playing',
                    score: 0,
                    highScore: state.skate?.highScore || 0
                },
                logs: ['🛹 ¡Empieza la sesión en Skateko Pistie! Rad Skater Infinite.', ...state.logs]
            };
        }

        case 'SKATE_CRASH': {
            if (!state.skate) return state;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            const score = action.payload.score;
            
            // Logic: High Score = Money prize. Low score = Hospital bill.
            // Threshold: 1000 points
            let moneyChange = 0;
            let log = '';

            if (score > 1000) {
                // Prize: $1 for every 10 points
                moneyChange = Math.floor(score / 10); 
                log = `🛹 ¡Trucazo! ${player.name} consigue sponsors y gana $${moneyChange}.`;
            } else {
                // Repairs / Hospital
                const fine = 40;
                moneyChange = -fine;
                log = `🤕 ¡Wipeout! ${player.name} se rompe un diente. Paga $${fine} en el dentista.`;
            }

            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, money: player.money + moneyChange };

            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney - moneyChange, 
                skate: { 
                    ...state.skate, 
                    phase: 'crashed', 
                    score: score,
                    highScore: Math.max(state.skate.highScore, score)
                },
                logs: [log, ...state.logs]
            };
        }

        case 'CLOSE_SKATE': {
            return { ...state, skate: null };
        }

        default: return state;
    }
};
