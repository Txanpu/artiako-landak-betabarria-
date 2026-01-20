
import { GameState } from '../../../types';
import { buyProperty } from './property/acquisition';
import { manageProperty } from './property/management';
import { payRent } from './property/rent';
import { commonPropertyReducer } from './property/common';
import { getRandomWorker } from '../../../data/fioreData';
import { formatMoney } from '../../gameLogic';

export const propertyReducer = (state: GameState, action: any): GameState => {
    // Fiore Management Actions
    if (action.type === 'HIRE_WORKER') {
        const { tId } = action.payload;
        const pIdx = state.currentPlayerIndex;
        const player = { ...state.players[pIdx] };
        const tile = { ...state.tiles[tId] };
        const COST = 150;

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

    switch (action.type) {
        case 'BUY_PROP': 
            return buyProperty(state);
            
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
