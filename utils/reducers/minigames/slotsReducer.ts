
import { GameState } from '../../../types';
import { isPowerOff, canProxenetaCheat } from '../../gameLogic';

const SLOT_SYMBOLS = ['🍒', '🍋', '🍇', '🍉', '🔔', '💎', '7️⃣'];

export const slotsReducer = (state: GameState, action: any): GameState => {
    if (action.type !== 'SPIN_SLOTS') return state;

    if (state.gov === 'left') return { ...state, logs: ['🚫 Juego ilegal detectado.', ...state.logs] };

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
    let r1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    let r2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    let r3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];

    // --- PROXENETA CHEAT CHECK (PRE-CALC) ---
    // If we are about to lose, check if we can force a small win
    if (player.role === 'proxeneta') {
        const potentialWin = (r1 === r2 && r2 === r3) || (r1 === '🍒' || r2 === '🍒' || r3 === '🍒');
        if (!potentialWin && canProxenetaCheat(player, 0.30)) {
            // Force 2 Cherries (Payout 5x) or 3 Lemons (Payout 25x)
            if (Math.random() < 0.2) {
                r1 = '🍋'; r2 = '🍋'; r3 = '🍋'; // Rare Cheat
            } else {
                r1 = '🍒'; r2 = '🍒'; r3 = SLOT_SYMBOLS[2]; // Common Cheat
            }
        }
    }

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
    if (win && player.role === 'proxeneta') logMsg += ' 🎲(Suerte Proxeneta)';

    return {
        ...state,
        players: newPlayers,
        estadoMoney: newStateMoney,
        casinoPlays: state.casinoPlays + 1,
        slotsData: { r1, r2, r3, win, msg, payout },
        logs: [logMsg, ...state.logs]
    };
};
