
import { GameState, Player, Greyhound } from '../types';
import { isCasinoBanned, isPowerOff, canProxenetaCheat } from './roles';

// --- CASINO LOGIC ---

export const playBlackjack = (state: GameState, player: Player): { dealer: number, playerVal: number, win: boolean, push: boolean, msg?: string } => {
    // 1. Check Gov Blocks
    if (isCasinoBanned(state.gov)) {
        return { dealer: 0, playerVal: 0, win: false, push: false, msg: '🚫 Gobierno clausuró el Blackjack.' };
    }
    
    // 2. Check Power
    if (isPowerOff(state)) {
        return { dealer: 0, playerVal: 0, win: false, push: false, msg: '🔦 Apagón: Casino cerrado.' };
    }

    const draw = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const dealer = draw(17, 23);
    const playerVal = draw(16, 23); 
    
    const dealerBust = dealer > 21;
    const playerBust = playerVal > 21;
    
    let win = false;
    let push = false;

    // Logic Standard
    if (playerBust) win = false;
    else if (dealerBust) win = true;
    else if (playerVal > dealer) win = true;
    else if (playerVal === dealer) push = true;
    else win = false;

    // 3. Proxeneta Cheating Logic
    if (!win && !push && player.role === 'proxeneta') {
        if (canProxenetaCheat(player, 0.4)) { // 40% base chance to cheat
            win = true; // Force win
            return { dealer, playerVal, win, push, msg: '🃏 (Habilidad Proxeneta activada)' };
        }
    }

    return { dealer, playerVal, win, push };
};

export const playRoulette = (state: GameState, player: Player, betColor: 'red' | 'black' | 'green'): { outcome: number, color: 'red' | 'black' | 'green', win: boolean, msg?: string } => {
    // 1. Check Power
    if (isPowerOff(state)) {
        return { outcome: 0, color: 'black', win: false, msg: '🔦 Apagón: Ruleta detenida.' };
    }

    const n = Math.floor(Math.random() * 37);
    const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    let color: 'red' | 'black' | 'green' = 'black';
    if (n === 0) color = 'green';
    else if (reds.has(n)) color = 'red';
    
    let win = betColor === color;

    // 2. Proxeneta Cheating Logic
    if (!win && player.role === 'proxeneta') {
        const baseProb = betColor === 'green' ? 0.02 : 0.48;
        if (canProxenetaCheat(player, baseProb)) {
            // Force the result to match the bet
            win = true;
            color = betColor;
            return { outcome: n, color, win, msg: '🎯 (Proxeneta trucó la ruleta)' };
        }
    }

    return { outcome: n, color, win };
};

// --- GREYHOUNDS LOGIC ---

export const initGreyhounds = (): Greyhound[] => {
    // Create 5 dogs
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];
    return Array.from({ length: 5 }, (_, i) => ({
        id: i,
        color: colors[i],
        progress: 0,
        speed: 1 + Math.random() * 0.5 // Initial random speed
    }));
};
