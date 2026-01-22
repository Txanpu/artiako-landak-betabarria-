
import { GameState, TileType } from '../../../types';

export const debugReducer = (state: GameState, action: any): GameState => {
    const updatePlayers = (fn: (p: any) => any) => state.players.map(fn);
    const updateTiles = (fn: (t: any) => any) => state.tiles.map(fn);

    switch (action.type) {
        // --- UI TOGGLES ---
        case 'TOGGLE_HEATMAP': 
            return { ...state, showHeatmap: !state.showHeatmap };
        case 'TOGGLE_BALANCE_MODAL': 
            return { ...state, showBalanceModal: !state.showBalanceModal };
        case 'TOGGLE_GOV_GUIDE': 
            return { ...state, showGovGuide: !state.showGovGuide };
        case 'TOGGLE_WEATHER_MODAL': 
            return { ...state, showWeatherModal: !state.showWeatherModal };
        case 'TOGGLE_FULL_BOARD':
            return { ...state, viewFullBoard: !state.viewFullBoard };
        case 'TOGGLE_LOGS_MODAL': // NEW
            return { ...state, showLogsModal: !state.showLogsModal };
        case 'CLOSE_EVENT': 
            return { ...state, activeEvent: null };

        // --- BASIC CHEATS ---
        case 'DEBUG_ADD_MONEY': { 
            const { pId, amount } = action.payload; 
            return { 
                ...state, 
                players: state.players.map(p => p.id === pId ? { ...p, money: p.money + amount } : p)
            }; 
        }
        case 'DEBUG_TELEPORT': { 
            const { pId, pos } = action.payload; 
            return { 
                ...state, 
                players: state.players.map(p => p.id === pId ? { ...p, pos } : p)
            }; 
        }
        case 'DEBUG_SET_ROLE': { 
            const { pId, role } = action.payload; 
            return { 
                ...state, 
                players: state.players.map(p => p.id === pId ? { ...p, role: role as any } : p)
            }; 
        }
        case 'DEBUG_SET_GOV': 
            return { ...state, gov: action.payload as any };
        case 'DEBUG_TRIGGER_EVENT': 
            return { ...state, nextEventId: action.payload };

        // --- ADVANCED PROPERTY MANAGEMENT ---
        case 'DEBUG_SET_OWNER': {
            const { tId, ownerId } = action.payload; // ownerId can be number, 'E' or null
            const tile = state.tiles[tId];
            
            // 1. Remove from old owner's props list if it was a player
            let newPlayers = state.players.map(p => {
                if (p.props.includes(tId)) {
                    return { ...p, props: p.props.filter(id => id !== tId) };
                }
                return p;
            });

            // 2. Add to new owner's props list if it is a player
            if (typeof ownerId === 'number') {
                newPlayers = newPlayers.map(p => {
                    if (p.id === ownerId && !p.props.includes(tId)) {
                        return { ...p, props: [...p.props, tId] };
                    }
                    return p;
                });
            }

            // 3. Update Tile
            const newTiles = [...state.tiles];
            newTiles[tId] = { ...tile, owner: ownerId, mortgaged: false, houses: 0, hotel: false };

            return { ...state, players: newPlayers, tiles: newTiles, logs: [`🐞 DEBUG: Propiedad #${tId} asignada a ${ownerId === 'E' ? 'Estado' : (ownerId === null ? 'Nadie' : `Jugador ${ownerId}`)}`, ...state.logs] };
        }

        case 'DEBUG_SET_BUILDINGS': {
            const { tId, houses, hotel } = action.payload;
            const newTiles = [...state.tiles];
            newTiles[tId] = { ...newTiles[tId], houses, hotel };
            return { ...state, tiles: newTiles };
        }

        case 'DEBUG_TOGGLE_MORTGAGE': {
            const { tId } = action.payload;
            const newTiles = [...state.tiles];
            newTiles[tId] = { ...newTiles[tId], mortgaged: !newTiles[tId].mortgaged };
            return { ...state, tiles: newTiles };
        }

        // --- ADVANCED INVENTORY MANAGEMENT ---
        case 'DEBUG_GIVE_ITEM': {
            const { pId, itemId } = action.payload;
            return {
                ...state,
                players: state.players.map(p => {
                    if (p.id === pId) {
                        return { ...p, inventory: [...(p.inventory || []), itemId] };
                    }
                    return p;
                })
            };
        }

        case 'DEBUG_SET_RESOURCE': {
            const { pId, resource, value } = action.payload; // resource: 'farlopa' | 'insiderTokens' | 'jailCards'
            return {
                ...state,
                players: state.players.map(p => {
                    if (p.id === pId) {
                        return { ...p, [resource]: value };
                    }
                    return p;
                })
            };
        }

        default: 
            return state;
    }
};
