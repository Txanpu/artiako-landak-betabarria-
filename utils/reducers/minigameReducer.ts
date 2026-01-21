
import { GameState } from '../../types';
import { playBlackjack } from '../gameLogic';
import { rouletteReducer } from './minigames/rouletteReducer';
import { blackjackReducer } from './minigames/blackjackReducer';
import { greyhoundReducer } from './minigames/greyhoundReducer';
import { quizReducer } from './minigames/quizReducer';
import { fbiReducer } from './minigames/fbiReducer';
import { slotsReducer } from './minigames/slotsReducer';

export const minigameReducer = (state: GameState, action: any): GameState => {
    
    // Delegate to Sub-Reducers
    if (action.type.includes('ROULETTE')) return rouletteReducer(state, action);
    if (action.type.includes('BLACKJACK')) return blackjackReducer(state, action);
    if (action.type.includes('GREYHOUNDS')) return greyhoundReducer(state, action);
    if (action.type.includes('QUIZ')) return quizReducer(state, action);
    if (action.type === 'FBI_GUESS') return fbiReducer(state, action);
    if (action.type === 'SPIN_SLOTS') return slotsReducer(state, action);

    switch (action.type) {
        case 'PLAY_CASINO': {
            if (state.gov === 'left') return { ...state, showCasinoModal: false, logs: ['🚫 El Gobierno de Izquierdas ha clausurado los Casinos.', ...state.logs] };

            const { game } = action.payload; 
            const player = state.players[state.currentPlayerIndex];
            let logMsg = '';
            
            if (game === 'blackjack') {
                const res = playBlackjack(state, player);
                if (res.msg) { 
                    logMsg = res.msg;
                } else {
                    if (res.win) { player.money += 15; logMsg = `🃏 BJ: ${player.name} GANA (${res.playerVal} vs ${res.dealer})`; }
                    else if (res.push) { logMsg = `🃏 BJ: Empate (${res.playerVal})`; }
                    else { player.money -= 30; logMsg = `🃏 BJ: Pierdes (${res.playerVal} vs ${res.dealer})`; }
                }
            }
            return { ...state, showCasinoModal: false, logs: [logMsg, ...state.logs] };
        }
        
        case 'CLOSE_CASINO': return { ...state, showCasinoModal: false, rouletteState: undefined, blackjackState: undefined };
        case 'CLOSE_SLOTS': return { ...state, showSlotsModal: false, slotsData: undefined };
        case 'OPEN_SLOTS_MODAL': 
            if (state.gov === 'left') return { ...state, logs: ['🚫 Las Tragaperras están prohibidas por el Gobierno.', ...state.logs] };
            return { ...state, showSlotsModal: true };

        default: return state;
    }
};
