
import { GameState } from '../../types';
import { buyProperty, stateForceBuy } from './property/acquisition';
import { manageProperty } from './property/management';
import { payRent } from './property/rent';
import { commonPropertyReducer } from './property/common';
import { handlePlataOPlomo } from './special/crimeLogic';
import { getRandomWorker } from '../../data/fioreData';
import { formatMoney, getRent } from '../gameLogic';

export const propertyReducer = (state: GameState, action: any): GameState => {
    // Fiore Management Actions
    if (action.type === 'HIRE_WORKER') {
        const { tId } = action.payload;
        const pIdx = state.currentPlayerIndex;
        const player = { ...state.players[pIdx] };
        const tile = { ...state.tiles[tId] };
        const COST = 150;

        if (state.gov === 'left') {
            return { ...state, logs: ['🚫 Fiore cerrado por Ley de Moralidad Pública.', ...state.logs] };
        }

        if (tile.owner === player.id && player.money >= COST && (tile.workersList?.length || 0) < 6) {
            player.money -= COST;
            state.estadoMoney += COST;
            
            // Get existing IDs to avoid dupes
            const currentIds = tile.workersList ? tile.workersList.map(w => w.id) : [];
            const newWorker = getRandomWorker(currentIds);
            
            // Ensure array exists
            if (!tile.workersList) tile.workersList = [];
            tile.workersList.push(newWorker);
            // Legacy sync
            tile.workers = tile.workersList.length;

            const uTiles = [...state.tiles]; uTiles[tId] = tile;
            const uPlayers = [...state.players]; uPlayers[pIdx] = player;
            return { 
                ...state, 
                tiles: uTiles, 
                players: uPlayers, 
                logs: [`💃 ${player.name} contrató a ${newWorker.name} (${newWorker.rarity}) en Fiore.`, ...state.logs] 
            };
        }
        return state;
    }

    if (action.type === 'FIRE_WORKER') {
        const { tId, wIdx } = action.payload;
        const tile = { ...state.tiles[tId] };
        if (tile.workersList && tile.workersList[wIdx]) {
            const fired = tile.workersList[wIdx];
            tile.workersList.splice(wIdx, 1);
            tile.workers = tile.workersList.length;
            
            const uTiles = [...state.tiles]; uTiles[tId] = tile;
            return { 
                ...state, 
                tiles: uTiles, 
                logs: [`🚪 Se ha despedido a ${fired.name} del Fiore.`, ...state.logs] 
            };
        }
        return state;
    }

    // --- ANARCHY RENT RESOLUTION ---
    if (action.type === 'RESOLVE_ANARCHY_RENT') {
        const { mode } = action.payload; // 'pay' | 'plata_o_plomo'
        const player = state.players[state.currentPlayerIndex];
        const tile = state.tiles[player.pos];

        if (mode === 'plata_o_plomo') {
            // Trigger minigame logic, clear anarchy pending
            const newState = handlePlataOPlomo(state, tile.id);
            return { ...newState, anarchyActionPending: false };
        } 
        else {
            // Mode 'pay': Trigger standard rent payment logic manually
            const rent = getRent(tile, state.dice[0]+state.dice[1], state.tiles, state);
            if (player.money >= rent) {
                const paidState = payRent(state);
                return { ...paidState, anarchyActionPending: false };
            } else {
                // Trigger Debt
                return { 
                    ...state, 
                    anarchyActionPending: false, 
                    pendingDebt: { amount: rent, creditorId: tile.owner || 'E' },
                    logs: [`⚠️ Fondos insuficientes para pagar renta en Anarquía. Deuda pendiente.`, ...state.logs]
                };
            }
        }
    }

    switch (action.type) {
        case 'BUY_PROP': 
            return buyProperty(state);
        
        case 'DECLINE_BUY': {
            const { tId } = action.payload;
            // AUTHORITARIAN RULE: If you don't buy, State buys and distributes
            if (state.gov === 'authoritarian') {
                return stateForceBuy(state, tId);
            }
            // Standard behavior: Just close modal (or auction if configured elsewhere, but simple close here)
            return { ...state, selectedTileId: null };
        }
            
        case 'BUILD_HOUSE':
        case 'SELL_HOUSE':
        case 'MORTGAGE_PROP':
        case 'UNMORTGAGE_PROP':
            return manageProperty(state, action);
            
        case 'PAY_RENT': 
            return payRent(state);
            
        case 'PAY_JAIL': 
        case 'SELECT_TILE':
        case 'CLOSE_MODAL':
            return commonPropertyReducer(state, action);
            
        default: return state;
    }
};
