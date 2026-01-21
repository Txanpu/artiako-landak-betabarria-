
import { GameState } from '../../../types';
import { formatMoney, getHouseCost } from '../../gameLogic';
import { canBuild, getRepairCost } from '../../governmentRules';

export const manageProperty = (state: GameState, action: any): GameState => {
    
    if (action.type === 'REPAIR_PROP') {
        const { tId } = action.payload;
        const pIdx = state.currentPlayerIndex;
        const player = { ...state.players[pIdx] };
        const tile = { ...state.tiles[tId] };
        
        if (tile.isBroken && tile.owner === player.id) {
            const cost = getRepairCost(tile);
            if (player.money >= cost) {
                player.money -= cost;
                tile.isBroken = false;
                const uTiles = [...state.tiles]; uTiles[tId] = tile;
                const uPlayers = [...state.players]; uPlayers[pIdx] = player;
                
                return { ...state, tiles: uTiles, players: uPlayers, logs: [`🛠️ ${player.name} ha reparado ${tile.name} por ${formatMoney(cost)}.`, ...state.logs] };
            }
        }
        return state;
    }

    switch(action.type) {
        case 'BUILD_HOUSE': {
            const { tId } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            const tile = { ...state.tiles[tId] };
            
            const permission = canBuild(state.gov, tile);
            if (!permission.allowed) {
                return { ...state, logs: [`🚫 ${permission.reason}`, ...state.logs] };
            }

            const baseCost = getHouseCost(tile);
            
            // --- DISCOUNT LOGIC ---
            let discountMul = 1;
            
            // Florentino Role
            if (player.role === 'florentino') discountMul = 0.8;
            
            // RIGHT GOV: "Ley del Suelo" (Aggressive construction)
            if (state.gov === 'right') {
                discountMul = 0.5; // 50% Discount base
                if (player.role === 'florentino') discountMul = 0.4; // Stack: 40% total cost
            }

            const finalCost = Math.floor(baseCost * discountMul);

            const extraLogs: string[] = [];
            const newPlayers = [...state.players];
            
            if (state.blockBuildTurns > 0) {
                 return { ...state, logs: ['🚫 Huelga de obras: no se puede construir.', ...state.logs] };
            }
    
            let hasStock = true;
            let buildCost = finalCost;
            if (tile.houses === 4) { 
                if (state.hotelsAvail <= 0) hasStock = false;
            } else { 
                if (state.housesAvail <= 0) hasStock = false;
            }

            if (!hasStock) {
                if (state.gov === 'right') {
                    buildCost *= 4; // Sobrecoste por escasez (Derecha permite construir pagando más)
                } else {
                    return { ...state, logs: ['🚫 No hay stock de edificios en el Banco.', ...state.logs] };
                }
            }

            if (tile.owner === player.id && player.money >= buildCost && (tile.houses || 0) < 5 && !tile.mortgaged) {
                 player.money -= buildCost;
                 state.estadoMoney += buildCost; 
                 
                 if (state.gov === 'right') extraLogs.push('🏗️ Ley del Suelo: 50% Descuento aplicado.');
                 else if (player.role === 'florentino') extraLogs.push('👷 Descuento Constructora aplicado.');

                 // --- UTILITY CONNECTION FEE ---
                 const CONNECTION_FEE = 20;
                 state.players.forEach((owner, idx) => {
                     const hasUtility = state.tiles.some(t => t.subtype === 'utility' && t.owner === owner.id);
                     if (hasUtility && owner.alive) {
                         if (player.money >= CONNECTION_FEE) {
                             player.money -= CONNECTION_FEE;
                             if (owner.id === player.id) {
                                 player.money += CONNECTION_FEE; 
                             } else {
                                 newPlayers[idx] = { ...newPlayers[idx], money: newPlayers[idx].money + CONNECTION_FEE };
                                 extraLogs.push(`⚡ Tasa de Enganche: Pagas $20 a ${owner.name}.`);
                             }
                         }
                     }
                 });

                 let logMsg = '';
                 if ((tile.houses || 0) === 4) { 
                     tile.houses = 0; tile.hotel = true; 
                     if(hasStock) { state.hotelsAvail--; state.housesAvail += 4; }
                     logMsg = `${player.name} construyó un HOTEL en ${tile.name} ($${formatMoney(buildCost)}).`;
                 }
                 else { 
                     tile.houses = (tile.houses || 0) + 1; 
                     if(hasStock) state.housesAvail--;
                     logMsg = `${player.name} construyó una casa en ${tile.name} ($${formatMoney(buildCost)}).`;
                 }
                 
                 const uTiles = [...state.tiles]; uTiles[tId] = tile;
                 newPlayers[pIdx] = player; 
                 
                 return { ...state, tiles: uTiles, players: newPlayers, logs: [logMsg, ...extraLogs, ...state.logs] };
            }
            return state;
        }
        case 'SELL_HOUSE': {
             const { tId } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            const tile = { ...state.tiles[tId] };
            
            if (tile.isBroken) {
                return { ...state, logs: ['🚫 No puedes vender edificios en ruinas.', ...state.logs] };
            }

            const cost = getHouseCost(tile); 
            const refund = Math.floor(cost * 0.5);

            if (tile.owner === player.id && (tile.houses || 0) > 0 || tile.hotel) {
                if (tile.hotel) {
                    tile.hotel = false;
                    tile.houses = 4;
                    state.hotelsAvail++;
                    state.housesAvail = Math.max(0, state.housesAvail - 4);
                    player.money += refund * 5; 
                    player.money += refund; 
                } else {
                    tile.houses = (tile.houses || 0) - 1;
                    state.housesAvail++;
                    player.money += refund;
                }
                
                const uTiles = [...state.tiles]; uTiles[tId] = tile;
                const uPlayers = [...state.players]; uPlayers[pIdx] = player;
                return { ...state, tiles: uTiles, players: uPlayers, logs: [`${player.name} vendió edificio en ${tile.name}.`, ...state.logs] };
            }
            return state;
        }
        case 'MORTGAGE_PROP': {
            const { tId } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            const tile = { ...state.tiles[tId] };

            if (tile.isBroken) {
                return { ...state, logs: ['🚫 No puedes hipotecar una propiedad en ruinas (Roto).', ...state.logs] };
            }

            if (state.blockMortgage[player.id] > 0) {
                 return { ...state, logs: ['🚫 Bloqueo de hipoteca activo.', ...state.logs] };
            }

            if (tile.owner === player.id && !tile.mortgaged && (tile.houses||0) === 0 && !tile.hotel) {
                const value = Math.floor((tile.price || 0) * 0.5);
                tile.mortgaged = true;
                tile.mortgagePrincipal = value;
                player.money += value;
                
                const uTiles = [...state.tiles]; uTiles[tId] = tile;
                const uPlayers = [...state.players]; uPlayers[pIdx] = player;
                return { ...state, tiles: uTiles, players: uPlayers, logs: [`${player.name} hipotecó ${tile.name} por ${formatMoney(value)}.`, ...state.logs] };
            }
            return state;
        }
        case 'UNMORTGAGE_PROP': {
             const { tId } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            const tile = { ...state.tiles[tId] };

            if (tile.owner === player.id && tile.mortgaged) {
                const principal = tile.mortgagePrincipal || Math.floor((tile.price || 0) * 0.5);
                const interest = Math.ceil(principal * 0.10);
                const totalCost = principal + interest;

                if (player.money >= totalCost) {
                    player.money -= totalCost;
                    tile.mortgaged = false;
                    tile.mortgagePrincipal = undefined;
                    state.estadoMoney += totalCost;

                    const uTiles = [...state.tiles]; uTiles[tId] = tile;
                    const uPlayers = [...state.players]; uPlayers[pIdx] = player;
                    return { ...state, tiles: uTiles, players: uPlayers, logs: [`${player.name} levantó hipoteca de ${tile.name} (-${formatMoney(totalCost)}).`, ...state.logs] };
                }
            }
            return state;
        }
        default: return state;
    }
};
