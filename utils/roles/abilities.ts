
import { GameState, Player, TileData, TileType, GovernmentType } from '../../types';

// Simple time-seeded RNG (Mulberry32 algorithm)
const createRNG = (seed: number) => {
    let state = seed;
    return () => {
      let t = state += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export const assignRoles = (players: Player[]) => {
    // Seed based on current time and random noise
    const seed = Date.now() ^ (Math.random() * 0x100000000);
    const rng = createRNG(seed);

    // Roles available
    const specialRoles = ['proxeneta', 'florentino', 'fbi', 'okupa', 'hacker'];
    
    // 1. Shuffle the roles array itself (so index 1 is not always Florentino)
    for (let i = specialRoles.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [specialRoles[i], specialRoles[j]] = [specialRoles[j], specialRoles[i]];
    }

    // 2. Shuffle the players
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Assign roles
    shuffled.forEach((p, i) => {
        if (i < specialRoles.length) {
            p.role = specialRoles[i] as any;
        } else {
            p.role = 'civil';
        }
    });

    // Return players sorted by ID to maintain turn order stability
    return shuffled.sort((a, b) => a.id - b.id);
};

export const isCasinoBanned = (gov: GovernmentType): boolean => gov === 'left';

export const isPowerOff = (state: GameState): boolean => state.activeEvent?.title.includes('Apagón') || false;

export const canProxenetaCheat = (player: Player, baseProb: number): boolean => {
    if (player.role !== 'proxeneta') return false;
    return Math.random() < (baseProb + 0.20); 
};

export const shouldBlockWelfare = (state: GameState): boolean => {
    return state.gov === 'anarchy' || (state.activeEvent?.title.includes('Huelga') || false);
};

export const shouldBlockSalary = (state: GameState, playerId: number): boolean => {
    const p = state.players.find(x => x.id === playerId);
    if (!p) return false;
    if (state.gov === 'authoritarian' && p.role === 'okupa') return true;
    return false;
};

// OKUPA: 5% Occupation Chance
export const checkOkupaOccupation = (player: Player, tile: TileData): { success: boolean, msg?: string } => {
    if (player.role === 'okupa' && tile.type === TileType.PROP && tile.owner === 'E') {
        if (Math.random() < 0.05) {
            return { success: true, msg: `🏚️ ${player.name} (Okupa) ha ocupado ${tile.name} (antes del Estado).` };
        }
    }
    return { success: false };
};

// OKUPA: 20% Rent/Loan Skip
export const checkOkupaRentSkip = (player: Player): boolean => {
    if (player.role === 'okupa') return Math.random() < 0.20;
    return false;
};

// OKUPA: 30% Destruction Chance (Remove 1 House if not Hotel)
export const checkOkupaDestruction = (player: Player, tile: TileData): { success: boolean, msg?: string } => {
    if (player.role === 'okupa' && tile.type === TileType.PROP && tile.owner !== null && tile.owner !== player.id && tile.owner !== 'E') {
        // Only if there are houses and NO hotel
        if ((tile.houses || 0) > 0 && !tile.hotel) {
            if (Math.random() < 0.30) {
                return { success: true, msg: `🔨 ${player.name} (Okupa) ha causado destrozos en ${tile.name}. Se derrumba una casa.` };
            }
        }
    }
    return { success: false };
};

export const checkFentanylAddiction = (player: Player, tile: TileData): { addicted: boolean, msg?: string } => {
    if (tile.name.includes('Farmazixe') || tile.name.includes('Farmacia')) {
        if (!player.fentanylAddiction && Math.random() < 0.15) { 
            return { addicted: true, msg: `🧪 ${player.name} se ha enganchado al Fentanilo en la Farmacia. Pagarás $15 por turno.` };
        }
    }
    return { addicted: false };
};

export const handleRoleAbilities = (state: GameState, player: Player, tile: TileData): string[] => {
    const logs: string[] = [];
    if (player.role === 'fbi' && tile.owner && typeof tile.owner === 'number' && tile.owner !== player.id) {
        if (Math.random() < 0.4) { 
            const owner = state.players.find(p => p.id === tile.owner);
            if (owner) {
                logs.push(`🕵️ FBI INTEL: ${owner.name} tiene $${owner.money} y rol ${owner.role || 'desconocido'}.`);
            }
        }
    }
    return logs;
};

export const processFioreTips = (state: GameState, player: Player, amount: number): string[] => {
    if (amount <= 0) return [];
    let finalAmount = amount;
    let msg = `💃 Ingresos Fiore: ${player.name} gana $${amount}`;
    if (player.role === 'proxeneta') {
        const bonus = Math.round(amount * 0.5);
        finalAmount += bonus;
        msg += ` + $${bonus} (Bonus Proxeneta)`;
    }
    player.money += finalAmount;
    return [msg];
};
