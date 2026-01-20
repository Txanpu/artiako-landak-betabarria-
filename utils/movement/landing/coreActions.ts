
import { GameState, Player, TileData, TileType } from '../../../types';
import { formatMoney } from '../../gameLogic';

export const processTaxTile = (
    state: GameState, 
    player: Player
): { updatedPlayer: Player, updatedStateMoney: number, updatedFbiPot: number, log: string | null } => {
    
    let p = { ...player };
    let sMoney = state.estadoMoney;
    let fbiPot = state.fbiPot || 0;
    let log = null;

    const taxRate = state.currentGovConfig.tax;
    
    // Positive Tax
    if (taxRate > 0) {
        const taxAmount = Math.floor(p.money * taxRate);
        if (taxAmount > 0) {
            p.money -= taxAmount;
            
            // Split Tax: 50% State, 50% FBI Pot (Corruption)
            const toState = Math.floor(taxAmount * 0.5);
            const toPot = taxAmount - toState;
            
            sMoney += toState;
            fbiPot += toPot;
            
            log = `💸 IMPUESTOS (${(taxRate*100).toFixed(0)}%): ${p.name} paga ${formatMoney(taxAmount)}.`;
        } else {
            log = `💸 IMPUESTOS: ${p.name} no tiene ingresos declarables.`;
        }
    } else {
        log = `💸 IMPUESTOS: Exención fiscal por Gobierno actual (0%).`;
    }

    return { updatedPlayer: p, updatedStateMoney: sMoney, updatedFbiPot: fbiPot, log };
};

export const processJailTile = (
    player: Player, 
    tiles: TileData[]
): { updatedPlayer: Player, log: string } => {
    const jailTile = tiles.find(t => t.type === TileType.JAIL);
    const jailPos = jailTile ? jailTile.id : 10; 

    return {
        updatedPlayer: {
            ...player,
            jail: 3,
            pos: jailPos,
            doubleStreak: 0
        },
        log: '👮 ¡A la cárcel!'
    };
};

export const processFbiTheft = (
    player: Player, 
    fbiPot: number
): { updatedPlayer: Player, newPot: number, log: string | null } => {
    if (player.role === 'fbi' && fbiPot > 0) {
        return {
            updatedPlayer: { ...player, money: player.money + fbiPot },
            newPot: 0,
            log: `🕵️ FBI CORRUPTO: ${player.name} confisca el bote de impuestos de $${formatMoney(fbiPot)}.`
        };
    }
    return { updatedPlayer: player, newPot: fbiPot, log: null };
};
