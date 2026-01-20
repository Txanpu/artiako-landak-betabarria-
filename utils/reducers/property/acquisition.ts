
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
