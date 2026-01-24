
import { GameState } from '../../../types';
import { formatMoney } from '../../gameLogic';

export const buyProperty = (state: GameState): GameState => {
    const buyerIdx = state.currentPlayerIndex;
    const buyer = { ...state.players[buyerIdx] };
    const tileId = buyer.pos;
    const tile = { ...state.tiles[tileId] };

    if (state.gov === 'left') {
            return { ...state, logs: ['🚫 Gobierno de Izquierdas prohíbe la compra privada.', ...state.logs] };
    }

    if (tile.price && buyer.money >= tile.price) {
        buyer.money -= tile.price;
        state.estadoMoney += tile.price;
        buyer.props.push(tileId);
        tile.owner = buyer.id;
        const uPlayers = [...state.players];
        uPlayers[buyerIdx] = buyer;
        const uTiles = [...state.tiles];
        uTiles[tileId] = tile;
        return { ...state, players: uPlayers, tiles: uTiles, logs: [`${buyer.name} compró ${tile.name} por ${formatMoney(tile.price)} (Pago al Estado)`, ...state.logs] };
    }
    return state;
};

// NEW: Authoritarian State Force Buy
export const stateForceBuy = (state: GameState, tileId: number): GameState => {
    const tile = { ...state.tiles[tileId] };
    const price = tile.price || 0;
    let newEstadoMoney = state.estadoMoney;
    let logs = [...state.logs];

    // 1. Money Printing if needed
    if (newEstadoMoney < price) {
        const printed = price - newEstadoMoney;
        newEstadoMoney += printed;
        logs.unshift(`🖨️ Banco Central: El Régimen imprime ${formatMoney(printed)} para nacionalizar ${tile.name}.`);
    }

    // 2. Buy (State pays)
    newEstadoMoney -= price;
    tile.owner = 'E'; // Owned by State
    
    // 3. Distribute to People
    const activePlayers = state.players.filter(p => p.alive);
    const count = activePlayers.length;
    
    let newPlayers = [...state.players];
    
    if (count > 0) {
        const share = Math.floor(price / count);
        newPlayers = newPlayers.map(p => {
            if (p.alive) return { ...p, money: p.money + share };
            return p;
        });
        logs.unshift(`🏛️ NACIONALIZACIÓN: El Estado compra ${tile.name}. Se reparten ${formatMoney(share)} a cada ciudadano.`);
    }

    const newTiles = [...state.tiles];
    newTiles[tileId] = tile;

    return {
        ...state,
        tiles: newTiles,
        players: newPlayers,
        estadoMoney: newEstadoMoney,
        logs: logs,
        selectedTileId: null // Close modal
    };
};
