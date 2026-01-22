
import { GameState, Player, TileData } from '../../../../types';
import { formatMoney } from '../../../gameLogic';

// Handles Counter Decrements (Immunity, High, Cooldowns, Rent Blocks)
export const handleCounters = (player: Player, tiles: TileData[], logs: string[]): { updatedPlayer: Player, updatedTiles: TileData[] } => {
    let p = { ...player };
    let t = [...tiles];

    // Immunity
    if (p.immunityTurns && p.immunityTurns > 0) {
        p.immunityTurns--;
        if (p.immunityTurns === 0) logs.push(`🛡️ La inmunidad de ${p.name} ha expirado.`);
    }
    
    // High (Drugs)
    if (p.highTurns && p.highTurns > 0) {
        p.highTurns--;
        if (p.highTurns === 0) logs.push(`😴 El efecto de la Farlopa se ha pasado para ${p.name}.`);
    }

    // Gender Cooldown
    if (p.genderAbilityCooldown > 0) {
        p.genderAbilityCooldown--;
    }

    // Tile Rent Blocks (e.g. Cancelled by Female Ability)
    t = t.map(tile => {
        if (tile.blockedRentTurns && tile.blockedRentTurns > 0) {
            return { ...tile, blockedRentTurns: tile.blockedRentTurns - 1 };
        }
        return tile;
    });

    return { updatedPlayer: p, updatedTiles: t };
};

// Handles Role Passives (Hacker Mining, Fiore Syndicate, Civil Subsidy)
export const handleRolePassives = (
    state: GameState, 
    player: Player, 
    tiles: TileData[], 
    logs: string[],
    currentMoney: number,
    currentStateMoney: number
): { updatedMoney: number, updatedStateMoney: number } => {
    
    let pMoney = currentMoney;
    let sMoney = currentStateMoney;

    // 1. Hacker Mining
    if (player.role === 'hacker') {
        const miningProfit = Math.floor(Math.random() * 61); 
        if (miningProfit > 0) {
            pMoney += miningProfit;
            sMoney += miningProfit; // Inflation mechanism
            logs.push(`💻 Minería Cripto: ${player.name} genera ${formatMoney(miningProfit)}.`);
        }
    }

    // 2. SINDICATO FIORE (Coste Seguridad Social)
    const fioreTiles = tiles.filter(t => t.subtype === 'fiore' && t.owner === player.id);
    if (fioreTiles.length > 0) {
        let totalWages = 0;
        fioreTiles.forEach(t => {
            const workers = t.workersList?.length || 0;
            if (workers > 0) {
                totalWages += workers * 50;
            }
        });

        if (totalWages > 0) {
            pMoney -= totalWages;
            sMoney += totalWages;
            logs.push(`🚩 SINDICATO FIORE: ${player.name} paga ${formatMoney(totalWages)} de Seguridad Social por sus trabajadoras.`);
        }
    }

    // 3. CIVIL SUBSIDY (Ingreso Mínimo)
    if (state.gov === 'left' && player.role === 'civil' && Math.random() < 0.20) {
        const subsidy = 50;
        pMoney += subsidy;
        sMoney -= subsidy;
        logs.push(`🍞 Ingreso Mínimo Vital: ${player.name} (Civil) recibe subsidio de $50.`);
    }

    // 4. FENTANYL ADDICTION COST
    if (player.fentanylAddiction) {
        const FENT_COST = 15;
        if (pMoney >= FENT_COST) {
            pMoney -= FENT_COST;
            sMoney += FENT_COST;
            logs.push(`💊 ${player.name} paga $${FENT_COST} por su dosis de fentanilo.`);
        }
    }

    return { updatedMoney: pMoney, updatedStateMoney: sMoney };
};
