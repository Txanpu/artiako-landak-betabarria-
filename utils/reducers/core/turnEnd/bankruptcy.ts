
import { GameState, Player, TileData } from '../../../../types';
import { calculateDynamicMaintenance } from '../../../risk';
import { checkMarginCalls, formatMoney, getNextPlayerIndex } from '../../../gameLogic';

interface BankruptcyResult {
    players: Player[];
    tiles: TileData[];
    logs: string[];
    nextIndex: number;
    estadoMoney: number;
}

export const processMaintenanceAndBankruptcy = (
    state: GameState, 
    players: Player[], 
    tiles: TileData[], 
    currentIdx: number, 
    estadoMoney: number
): BankruptcyResult => {
    let finalPlayers = [...players];
    let finalTiles = [...tiles];
    let finalLogs: string[] = [];
    let currentEstadoMoney = estadoMoney;

    const currentPlayer = finalPlayers[currentIdx];

    // 1. Dynamic Maintenance
    const maintFee = calculateDynamicMaintenance(currentPlayer.id, finalTiles);
    if (maintFee > 0) { 
        currentPlayer.money -= maintFee; 
        currentEstadoMoney += maintFee; 
        finalLogs.push(`🏗️ Mantenimiento Dinámico: ${currentPlayer.name} paga ${formatMoney(maintFee)}.`);
    }

    // 2. Margin Calls
    // Need to pass a constructed state-like object to checkMarginCalls because it expects GameState
    const tempState = { ...state, players: finalPlayers, tiles: finalTiles } as GameState;
    const marginRes = checkMarginCalls(tempState, currentPlayer.id);
    
    if (marginRes.soldTiles.length > 0) {
        finalLogs.push(`📉 LIQUIDACIÓN: ${currentPlayer.name} vende: ${marginRes.soldTiles.join(', ')} (+${formatMoney(marginRes.amountRaised)}).`);
    }

    // 3. Bankruptcy
    let nextIdx = getNextPlayerIndex({ ...state, players: finalPlayers });
    
    // Check if player is bankrupt after maintenance and margin calls
    const updatedCurrentPlayer = finalPlayers.find(p => p.id === currentPlayer.id);
    
    if (updatedCurrentPlayer && updatedCurrentPlayer.money < 0) {
        updatedCurrentPlayer.alive = false;
        
        // Liquidation of assets to 'E'
        finalTiles.forEach(t => {
            if(t.owner === updatedCurrentPlayer.id) {
                t.owner = null;
                t.houses = 0;
                t.hotel = false;
                t.mortgaged = false;
            }
        });
        
        finalLogs.push(`💀 BANCARROTA: ${updatedCurrentPlayer.name} ha sido eliminado.`);
        
        // Recalculate next index since current died
        nextIdx = getNextPlayerIndex({ ...state, players: finalPlayers });
    }

    return {
        players: finalPlayers,
        tiles: finalTiles,
        logs: finalLogs,
        nextIndex: nextIdx,
        estadoMoney: currentEstadoMoney
    };
};
