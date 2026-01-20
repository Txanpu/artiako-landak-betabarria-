
import { GameState, InventoryItemType } from '../../types';
import { formatMoney } from '../gameLogic';

const PRICES: Record<InventoryItemType, number> = {
    dark_lawyer: 300,
    dark_molotov: 500,
    dark_okupa: 400,
    dark_immunity: 600
};

export const shopReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        // --- NEW DRUG LOGIC ---
        case 'GET_FARLOPA': {
            const { cost } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            
            if (player.money >= cost) {
                player.money -= cost;
                player.farlopa = (player.farlopa || 0) + 1;
                state.estadoMoney += (cost > 0 ? cost : 0); // Logic: Money goes to state/corruption
                
                const players = [...state.players];
                players[pIdx] = player;
                return { 
                    ...state, 
                    players, 
                    logs: [`❄️ ${player.name} ha pillado "Oilasko Erdi" (Farlopa). Inventario: ${player.farlopa}`, ...state.logs] 
                };
            }
            return state;
        }

        case 'CONSUME_FARLOPA': {
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            
            if ((player.farlopa || 0) > 0) {
                player.farlopa--;
                player.highTurns = 2; // Lasts 2 turns (current + next)
                
                const players = [...state.players];
                players[pIdx] = player;
                return {
                    ...state,
                    players,
                    logs: [`👃 ${player.name} se mete una raya. ¡3 DADOS desbloqueados por 2 turnos!`, ...state.logs]
                };
            }
            return state;
        }
        // ----------------------

        case 'TOGGLE_DARK_WEB': {
            const player = state.players[state.currentPlayerIndex];
            if (player.role !== 'hacker') {
                return { ...state, logs: ['⛔ Acceso denegado. Se requiere nivel de encriptación HACKER.', ...state.logs] };
            }
            return { ...state, showDarkWeb: !state.showDarkWeb };
        }

        case 'BUY_ITEM': {
            const { itemId } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            const price = PRICES[itemId as InventoryItemType];

            if (player.money >= price) {
                player.money -= price;
                player.inventory = [...(player.inventory || []), itemId];
                if (Math.random() < 0.10) {
                    player.jail = 3;
                    player.pos = 10;
                    const ps = [...state.players]; ps[pIdx] = player;
                    return { ...state, players: ps, logs: [`🕵️ FBI: ${player.name} arrestado comprando en la Dark Web.`, ...state.logs], showDarkWeb: false };
                }
                const ps = [...state.players]; ps[pIdx] = player;
                return { ...state, players: ps, estadoMoney: state.estadoMoney + (price * 0.5) }; 
            }
            return state;
        }

        case 'USE_ITEM': {
            const { itemId, targetTileId } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            
            const idx = (player.inventory || []).indexOf(itemId);
            if (idx === -1) return state;
            player.inventory.splice(idx, 1);
            
            let log = '';
            let updatedTiles = [...state.tiles];
            const ps = [...state.players];
            ps[pIdx] = player;

            if (itemId === 'dark_molotov') {
                if (targetTileId) {
                    const t = { ...updatedTiles[targetTileId] };
                    if (t.hotel) { t.hotel = false; t.houses = 4; log = `🔥 Molotov: El hotel en ${t.name} ha sido dañado.`; }
                    else if ((t.houses||0) > 0) { t.houses = (t.houses||0) - 1; log = `🔥 Molotov: Una casa en ${t.name} ha ardido.`; }
                    else { log = `🔥 Molotov fallido: ${t.name} no tenía edificios.`; }
                    updatedTiles[targetTileId] = t;
                }
            } else if (itemId === 'dark_lawyer') {
                player.jailCards = (player.jailCards || 0) + 1;
                log = `⚖️ Abogado Corrupto contratado. Tienes un salvoconducto de cárcel.`;
            } else if (itemId === 'dark_immunity') {
                player.immunityTurns = (player.immunityTurns || 0) + 5;
                log = `🛡️ Inmunidad Diplomática activada por 5 turnos.`;
            } else if (itemId === 'dark_okupa') {
                if (targetTileId) {
                    const t = { ...updatedTiles[targetTileId] };
                    t.blockedRentTurns = 3; 
                    updatedTiles[targetTileId] = t;
                    log = `🏚️ Okupas enviados a ${t.name}. No generará renta por 3 turnos.`;
                }
            }

            return { ...state, players: ps, tiles: updatedTiles, logs: [log, ...state.logs] };
        }

        default: return state;
    }
};
