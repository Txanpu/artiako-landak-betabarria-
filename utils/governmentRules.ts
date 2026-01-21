
import { GameState, Player, GovernmentType, TileData } from '../types';

// 1. SALARY LOGIC (Pass GO)
export const calculateGoSalary = (gov: GovernmentType, player: Player): number => {
    switch (gov) {
        case 'left':
            // "Paguita": Extra money. 
            // OKUPA BONUS: Double salary in Left
            if (player.role === 'okupa') return 600;

            const baseLeft = 300;
            if (['female', 'helicoptero', 'marcianito'].includes(player.gender)) {
                return baseLeft + 100; // $400 Total for minorities
            }
            return baseLeft; // $300 for regular

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
export const getJailRules = (gov: GovernmentType, player?: Player) => {
    // Okupa Immunity in Left Gov
    const isOkupaSafe = gov === 'left' && player?.role === 'okupa';

    return {
        // Can they enter jail?
        immune: gov === 'right' || gov === 'anarchy' || isOkupaSafe, 
        // How long they stay
        duration: gov === 'authoritarian' ? 6 : 3, // Long sentence in Auth
        // Can they pay to leave?
        canBail: gov !== 'authoritarian' // NO BAIL in Authoritarian
    };
};

// 3. BUILDING PERMISSIONS
export const canBuild = (gov: GovernmentType, tile: TileData): { allowed: boolean, reason?: string } => {
    // In Left Gov, building is allowed but buying is restricted. 
    // Actually, "prohibida especulación" implies buying mostly.
    // Let's allow building but maybe more expensive? For now, stick to Buy Block.
    
    if (gov === 'anarchy' && tile.isBroken) {
        return { allowed: false, reason: 'Propiedad en ruinas. Repárala antes de construir.' };
    }
    return { allowed: true };
};

// 4. AUCTION PERMISSIONS
export const canAuction = (gov: GovernmentType): boolean => {
    if (gov === 'authoritarian') return false; // State sets price
    if (gov === 'left') return false; // Private speculation banned
    return true;
};

// 5. DIRECT BUY PERMISSIONS
export const canBuyDirectly = (gov: GovernmentType): boolean => {
    // Left: NO BUYING PRIVATE PROPERTY from bank
    if (gov === 'left') return false;
    // Authoritarian: YES (Decretazo - Fast Buy)
    return ['authoritarian', 'anarchy', 'right', 'libertarian'].includes(gov);
};

// 6. TRANSPORT PERMISSIONS
export const canUseTransport = (gov: GovernmentType): boolean => {
    // Anarchy: No public transport
    if (gov === 'anarchy') return false;
    return true;
};

// 7. ANARCHY REPAIR COST
export const getRepairCost = (tile: TileData): number => {
    return Math.floor((tile.price || 200) * 0.3); // 30% of base price to repair
};

// 8. TRADE PERMISSIONS (New)
export const canTrade = (gov: GovernmentType): { allowed: boolean, reason?: string } => {
    if (gov === 'left') {
        return { allowed: false, reason: '🚫 El suelo no es mercancía. Comercio prohibido por el Gobierno de Izquierdas.' };
    }
    return { allowed: true };
};
