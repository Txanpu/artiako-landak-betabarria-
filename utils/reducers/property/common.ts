
import { GameState } from '../../../types';
import { movementReducer } from '../movementReducer';
import { getJailFine, formatMoney } from '../../gameLogic';
import { getJailRules } from '../../governmentRules'; // NEW

export const commonPropertyReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'PAY_JAIL': { 
            const jailRules = getJailRules(state.gov);
            if (!jailRules.canBail) {
                return { ...state, logs: ['🔒 Gobierno Autoritario: No se permite pagar fianza. Cumple tu condena.', ...state.logs] };
            }

            const jpIdx = state.currentPlayerIndex; 
            const jPlayer = { ...state.players[jpIdx] }; 
            const fine = getJailFine(state.gov, jPlayer); // Added player param

            if (jPlayer.money >= fine && jPlayer.jail > 0) { 
                jPlayer.money -= fine; 
                jPlayer.jail = 0; 
                const jpPlayers = [...state.players]; 
                jpPlayers[jpIdx] = jPlayer; 
                return { ...state, players: jpPlayers, estadoMoney: state.estadoMoney + fine, logs: [`${jPlayer.name} paga fianza de ${formatMoney(fine)} y queda libre.`, ...state.logs] }; 
            } 
            return state; 
        }
        case 'SELECT_TILE': {
            const id = action.payload;
            if (state.pendingMoves > 0 && state.movementOptions.includes(id)) {
                return movementReducer(state, { type: 'SELECT_MOVE', payload: action.payload });
            }
            return { ...state, selectedTileId: id };
        }
        case 'CLOSE_MODAL': return { ...state, selectedTileId: null };
        default: return state;
    }
};
