
import { GameState } from '../../../types';
import { formatMoney } from '../../gameLogic';

export const motocrossReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_MOTOCROSS': {
            if (state.gov === 'left') {
                return { ...state, logs: ['🚫 Motocross prohibido por normas medioambientales (Gobierno Izquierdas).', ...state.logs] };
            }
            return {
                ...state,
                selectedTileId: null, // Close property modal
                motocross: {
                    isOpen: true,
                    phase: 'playing',
                    score: 0,
                    reward: 200, // Prize for winning
                },
                logs: ['🏍️ ¡Entrando a la pista de Txarlin Pistie!', ...state.logs]
            };
        }

        case 'MOTOCROSS_CRASH': {
            if (!state.motocross) return state;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            
            // Penalty: Medical Bill (Bird Center cost)
            const fine = 50;
            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, money: player.money - fine };

            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney + fine,
                motocross: { ...state.motocross, phase: 'crashed' },
                logs: [`🚑 ¡Accidente! ${player.name} paga $${fine} de gastos médicos.`, ...state.logs]
            };
        }

        case 'MOTOCROSS_WIN': {
            if (!state.motocross) return state;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            const reward = state.motocross.reward;

            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, money: player.money + reward };

            return {
                ...state,
                players: newPlayers,
                estadoMoney: state.estadoMoney - reward,
                motocross: { ...state.motocross, phase: 'won' },
                logs: [`🏆 ¡Increíble! ${player.name} supera el circuito y gana ${formatMoney(reward)}.`, ...state.logs]
            };
        }

        case 'CLOSE_MOTOCROSS': {
            return { ...state, motocross: null };
        }

        default: return state;
    }
};
