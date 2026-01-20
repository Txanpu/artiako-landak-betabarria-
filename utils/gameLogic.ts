
export * from './core';
export * from './board';
export * from './economy';
export * from './roles';
export * from './events';
export * from './ai';
export * from './minigames';
export * from './initialState';
import { GovernmentType } from '../types';

export const getJailFine = (gov: GovernmentType): number => {
    switch (gov) {
        case 'authoritarian': return 150; // Punishment
        case 'libertarian': return 100;   // Private Bail
        case 'left': return 50;           // Standard/Subsidized
        case 'anarchy': return 0;         // No laws
        case 'right': return 200;         // Bribe (if stuck)
        default: return 50;
    }
};
