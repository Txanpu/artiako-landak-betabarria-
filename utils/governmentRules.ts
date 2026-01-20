
import { GameState, Player, GovernmentType, TileData } from '../types';

// 1. SALARY LOGIC (Pass GO)
export const calculateGoSalary = (gov: GovernmentType, player: Player): number => {
    switch (gov) {
        case 'left':
            // "Paguita": Extra money. Bonus for minorities/specific genders.
            const baseLeft = 300;
            if (['female', 'helicoptero', 'marcianito'].includes(player.gender)) {
                return baseLeft + 100; // $400 Total
            }
            return baseLeft; // $300

        case 'right':
            // Traditional. Gap for women.
            if (player.gender === 'male') return 200;
            if (player.gender === 'female') return 150; // Wage gap
            return 0; // Aliens/Helicopters get nothing

        case 'libertarian':
            return 0; // No state handouts

        case 'anarchy':
            return 0; // No state

        case 'authoritarian':
            return 200; // Standard ration

        default:
            return 200;
    }
};

// 2. JAIL RULES
export const getJailRules = (gov: GovernmentType) => {
    return {
        // Can they enter jail?
        immune: gov === 'right' || gov === 'anarchy', 
        // How long they stay
        duration: gov === 'authoritarian' ? 6 : 3,
        // Can they pay to leave?
        canBail: gov !== 'authoritarian'
    };
};

// 3. BUILDING PERMISSIONS
export const canBuild = (gov: GovernmentType, tile: TileData): { allowed: boolean, reason?: string } => {
    if (gov === 'left') {
        return { allowed: false, reason: 'Gobierno de Izquierdas: Prohibida la especulación inmobiliaria (Construcción bloqueada).' };
    }
    if (gov === 'anarchy' && tile.isBroken) {
        return { allowed: false, reason: 'Propiedad en ruinas. Repárala antes de construir.' };
    }
    return { allowed: true };
};

// 4. AUCTION PERMISSIONS
export const canAuction = (gov: GovernmentType): boolean => {
    // Authoritarian: Everything is direct buy.
    if (gov === 'authoritarian') return false;
    return true;
};

// 5. TRANSPORT PERMISSIONS
export const canUseTransport = (gov: GovernmentType): boolean => {
    // Anarchy: No public transport
    if (gov === 'anarchy') return false;
    return true;
};

// 6. ANARCHY REPAIR COST
export const getRepairCost = (tile: TileData): number => {
    return Math.floor((tile.price || 200) * 0.3); // 30% of base price to repair
};
