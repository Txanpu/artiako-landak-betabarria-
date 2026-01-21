
export * from './core';
export * from './board';
export * from './economy';
export * from './roles';
export * from './events';
export * from './ai';
export * from './minigames';
export * from './initialState';
import { GovernmentType, Player } from '../types';

export const getJailFine = (gov: GovernmentType, player?: Player): number => {
    let fine = 50;
    switch (gov) {
        case 'authoritarian': fine = 150; break;
        case 'libertarian': fine = 100; break;
        case 'left': fine = 50; break;
        case 'anarchy': fine = 0; break;
        case 'right': fine = 200; break;
        default: fine = 50;
    }

    // --- PASSIVE: MARCIANITO DOUBLE BAIL (Rule 2d) ---
    if (player && player.gender === 'marcianito') {
        fine *= 2;
    }

    return fine;
};
