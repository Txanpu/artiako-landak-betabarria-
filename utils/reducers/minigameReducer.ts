
import { GameState } from '../../types';
import { playBlackjack, formatMoney, isPowerOff } from '../gameLogic';
import { rouletteReducer } from './minigames/rouletteReducer';
import { blackjackReducer } from './minigames/blackjackReducer';
import { greyhoundReducer } from './minigames/greyhoundReducer';
import { quizReducer } from './minigames/quizReducer';

const SLOT_SYMBOLS = ['🍒', '🍋', '🍇', '🍉', '🔔', '💎', '7️⃣'];

export const minigameReducer = (state: GameState, action: any): GameState => {
    
    // Delegate to Sub-Reducers
    if (action.type.includes('ROULETTE')) return rouletteReducer(state, action);
    if (action.type.includes('BLACKJACK')) return blackjackReducer(state, action);
    if (action.type.includes('GREYHOUNDS')) return greyhoundReducer(state, action);
    if (action.type.includes('QUIZ')) return quizReducer(state, action); // Quiz hook

    switch (action.type) {
        case 'PLAY_CASINO': {
            // Legacy/Deprecated simple handler
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
        case 'OPEN_SLOTS_MODAL': return { ...state, showSlotsModal: true };

        case 'SPIN_SLOTS': {
            const { bet } = action.payload;
            if (state.casinoPlays >= 3) return { ...state, slotsData: { ...state.slotsData!, win: false, msg: '🚫 Límite de jugadas alcanzado.', payout: 0, r1: '❌', r2: '❌', r3: '❌' } };
            if (isPowerOff(state)) return { ...state, slotsData: { ...state.slotsData!, win: false, msg: '🚫 Apagón: Sin energía.', payout: 0, r1: '⚡', r2: '⚡', r3: '⚡' } };

            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            
            if (player.money < bet) return state;

            // 1. Transaction (Pay to State)
            player.money -= bet;
            let newStateMoney = state.estadoMoney + bet;

            // 2. Spin Logic
            const r1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
            const r2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
            const r3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];

            // 3. Payout Table
            let win = false;
            let payout = 0;
            let msg = 'Inténtalo de nuevo...';

            if (r1 === '7️⃣' && r2 === '7️⃣' && r3 === '7️⃣') { payout = 1000; msg = '¡JACKPOT 777!'; }
            else if (r1 === '💎' && r2 === '💎' && r3 === '💎') { payout = 500; msg = '¡DIAMANTES!'; }
            else if (r1 === '🔔' && r2 === '🔔' && r3 === '🔔') { payout = 200; msg = '¡CAMPANAS!'; }
            else if (r1 === '🍉' && r2 === '🍉' && r3 === '🍉') { payout = 100; msg = '¡SANDÍA!'; }
            else if (r1 === '🍇' && r2 === '🍇' && r3 === '🍇') { payout = 50; msg = '¡UVAS!'; }
            else if (r1 === '🍋' && r2 === '🍋' && r3 === '🍋') { payout = 25; msg = '¡LIMONES!'; }
            else if (r1 === '🍒' && r2 === '🍒' && r3 === '🍒') { payout = 10; msg = '¡CEREZAS!'; }
            else if ((r1 === '🍒' && r2 === '🍒') || (r1 === '🍒' && r3 === '🍒') || (r2 === '🍒' && r3 === '🍒')) { payout = 5; msg = 'Dos Cerezas'; }
            else if (r1 === '🍒' || r2 === '🍒' || r3 === '🍒') { payout = 2; msg = 'Una Cereza'; }

            if (payout > 0) {
                win = true;
                if (newStateMoney >= payout) {
                    newStateMoney -= payout;
                    player.money += payout;
                } else {
                    msg = '¡GANASTE! Pero el Estado no tiene fondos...';
                    player.money += payout; 
                    newStateMoney -= payout; 
                }
            }

            const newPlayers = [...state.players];
            newPlayers[pIdx] = player;

            let logMsg = `🎰 Slots: ${player.name} ${win ? `GANA $${payout}` : 'pierde'}. [${r1}|${r2}|${r3}]`;

            return {
                ...state,
                players: newPlayers,
                estadoMoney: newStateMoney,
                casinoPlays: state.casinoPlays + 1,
                slotsData: { r1, r2, r3, win, msg, payout },
                logs: [logMsg, ...state.logs]
            };
        }
        
        case 'FBI_GUESS': { 
            const { fbiId, targetId, roleGuess } = action.payload; 
            const fbi = state.players.find(p => p.id === fbiId); 
            const target = state.players.find(p => p.id === targetId); 
            
            if(!fbi || !target) return state; 
            
            const newGuesses = { ...state.fbiGuesses }; 
            if(!newGuesses[fbiId]) newGuesses[fbiId] = {}; 
            newGuesses[fbiId][targetId] = roleGuess; 
            
            const isCorrect = target.role === roleGuess; 
            let logMsg = isCorrect ? `🕵️ FBI ${fbi.name} acertó: ${target.name} es ${roleGuess}!` : `🕵️ FBI ${fbi.name} falló sospecha sobre ${target.name}.`; 
            
            // Check if FBI has revealed ALL hidden roles (excluding self and civilians if we want hard mode, but usually just special roles)
            // Let's assume all alive players except self.
            let allGuessed = true;
            state.players.forEach(p => {
                if (p.id !== fbiId && p.alive && p.role !== 'civil') {
                    // Check if correctly guessed
                    const guess = newGuesses[fbiId]?.[p.id];
                    if (guess !== p.role) allGuessed = false;
                }
            });

            if (allGuessed) {
                logMsg += " ¡EL FBI HA DESCUBIERTO A TODOS! Recompensa: Expropiar 2 casillas libres.";
                return { ...state, fbiGuesses: newGuesses, fbiExpropriationSlots: 2, logs: [logMsg, ...state.logs] }; 
            }

            return { ...state, fbiGuesses: newGuesses, logs: [logMsg, ...state.logs] }; 
        }

        default: return state;
    }
};
