
import { GameState } from '../../../types';
import { createListing, formatMoney } from '../../gameLogic';

export const marketReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'DEPOSIT_OFFSHORE': {
            const { amount } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const p = { ...state.players[pIdx] };
            if (p.money >= amount) {
                p.money -= amount;
                p.offshoreMoney = (p.offshoreMoney || 0) + amount;
                const ps = [...state.players]; ps[pIdx] = p;
                return { ...state, players: ps, logs: [`🏝️ ${p.name} envía ${formatMoney(amount)} a paraíso fiscal.`, ...state.logs] };
            }
            return state;
        }
        case 'WITHDRAW_OFFSHORE': {
            const { amount } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const p = { ...state.players[pIdx] };
            if ((p.offshoreMoney || 0) >= amount) {
                p.offshoreMoney = (p.offshoreMoney || 0) - amount;
                const net = Math.floor(amount * 0.9); // 10% fee
                p.money += net;
                const ps = [...state.players]; ps[pIdx] = p;
                return { ...state, players: ps, logs: [`🏝️ ${p.name} retira fondos offshore (+${formatMoney(net)} tras blanqueo).`, ...state.logs] };
            }
            return state;
        }
        case 'LIST_ASSET': {
            const { assetType, refId, subRefId, amount, price, startAuction } = action.payload;
            const newState = createListing(state, assetType, refId, subRefId, amount, price);
            
            if (startAuction) {
                 const listing = newState.marketListings[newState.marketListings.length - 1];
                 return {
                     ...newState,
                     auction: {
                         tileId: 0, // Dummy
                         currentBid: 0,
                         highestBidder: null,
                         activePlayers: state.players.filter(p => p.alive).map(p => p.id),
                         timer: 20,
                         isOpen: true,
                         kind: assetType,
                         assetId: listing.id,
                         units: amount
                     },
                     logs: [`📢 SUBASTA: ${assetType} iniciada!`, ...newState.logs]
                 };
            }
            return newState;
        }
        
        case 'CREATE_OPTION_CONTRACT': {
            const { type, propId, strike, premium, counterpartyId } = action.payload;
            const currentPlayer = state.players[state.currentPlayerIndex];
            const counterparty = state.players.find(p => p.id === counterpartyId);
            
            if (!counterparty) return state;

            // Scenario 1: CALL (I sell Call to Counterparty)
            if (type === 'call') {
                const tile = state.tiles[propId];
                if (tile.owner !== currentPlayer.id) return { ...state, logs: ['❌ No posees la propiedad para emitir una Call.', ...state.logs] };
                if (counterparty.money < premium) return { ...state, logs: ['❌ El comprador no tiene fondos para la prima.', ...state.logs] };

                // Money Transfer
                const newPlayers = state.players.map(p => {
                    if (p.id === currentPlayer.id) return { ...p, money: p.money + premium };
                    if (p.id === counterparty.id) return { ...p, money: p.money - premium };
                    return p;
                });

                const option = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'call' as const,
                    propertyId: propId,
                    strikePrice: strike,
                    premium,
                    writerId: currentPlayer.id, 
                    holderId: counterparty.id, 
                    expiresTurn: state.turnCount + 15
                };

                return {
                    ...state,
                    players: newPlayers,
                    financialOptions: [...state.financialOptions, option],
                    logs: [`📝 CALL Creada: ${counterparty.name} paga $${premium} a ${currentPlayer.name} por derecho a comprar #${tile.name} a $${strike}.`, ...state.logs]
                };
            }

            // Scenario 2: PUT (I buy Put from Counterparty)
            if (type === 'put') {
                const tile = state.tiles[propId];
                if (tile.owner !== currentPlayer.id) return { ...state, logs: ['❌ Debes poseer la propiedad para comprar protección (Put).', ...state.logs] };
                if (currentPlayer.money < premium) return { ...state, logs: ['❌ No tienes fondos para pagar la prima.', ...state.logs] };

                // Money Transfer
                const newPlayers = state.players.map(p => {
                    if (p.id === currentPlayer.id) return { ...p, money: p.money - premium };
                    if (p.id === counterparty.id) return { ...p, money: p.money + premium };
                    return p;
                });

                const option = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'put' as const,
                    propertyId: propId,
                    strikePrice: strike,
                    premium,
                    writerId: counterparty.id, 
                    holderId: currentPlayer.id,
                    expiresTurn: state.turnCount + 15
                };

                return {
                    ...state,
                    players: newPlayers,
                    financialOptions: [...state.financialOptions, option],
                    logs: [`📝 PUT Creada: ${currentPlayer.name} paga $${premium} a ${counterparty.name} por derecho a vender #${tile.name} a $${strike}.`, ...state.logs]
                };
            }
            return state;
        }

        case 'EXERCISE_OPTION': {
            const { optId } = action.payload;
            const opt = state.financialOptions.find(o => o.id === optId);
            if (!opt) return state;

            const holder = state.players.find(p => p.id === opt.holderId);
            const writer = state.players.find(p => p.id === opt.writerId);
            const tile = state.tiles[opt.propertyId];

            if (!holder || !writer || !tile) return state;

            if (state.turnCount > opt.expiresTurn) {
                return {
                    ...state,
                    financialOptions: state.financialOptions.filter(o => o.id !== optId),
                    logs: [`⌛ Opción expirada sobre ${tile.name}.`, ...state.logs]
                };
            }

            let logMsg = '';
            let success = false;
            let newPlayers = [...state.players];
            let newTiles = [...state.tiles];

            if (opt.type === 'call') {
                if (tile.owner !== writer.id) {
                    return { ...state, financialOptions: state.financialOptions.filter(o => o.id !== optId), logs: [`❌ CALL Fallida: El emisor ya no tiene la propiedad.`, ...state.logs] };
                }
                if (holder.money < opt.strikePrice) {
                    return { ...state, logs: [`❌ No tienes fondos para ejercer la Call ($${opt.strikePrice}).`, ...state.logs] };
                }

                newPlayers = newPlayers.map(p => {
                    if (p.id === holder.id) return { ...p, money: p.money - opt.strikePrice, props: [...p.props, tile.id] };
                    if (p.id === writer.id) return { ...p, money: p.money + opt.strikePrice, props: p.props.filter(tid => tid !== tile.id) };
                    return p;
                });
                newTiles[tile.id] = { ...tile, owner: holder.id };
                logMsg = `📞 CALL EJERCIDA: ${holder.name} compra ${tile.name} a ${writer.name} por $${opt.strikePrice}.`;
                success = true;

            } else if (opt.type === 'put') {
                if (tile.owner !== holder.id) {
                    return { ...state, financialOptions: state.financialOptions.filter(o => o.id !== optId), logs: [`❌ PUT Fallida: Ya no posees la propiedad.`, ...state.logs] };
                }
                
                newPlayers = newPlayers.map(p => {
                    if (p.id === holder.id) return { ...p, money: p.money + opt.strikePrice, props: p.props.filter(tid => tid !== tile.id) };
                    if (p.id === writer.id) return { ...p, money: p.money - opt.strikePrice, props: [...p.props, tile.id] };
                    return p;
                });
                newTiles[tile.id] = { ...tile, owner: writer.id };
                logMsg = `📉 PUT EJERCIDA: ${holder.name} vende ${tile.name} a ${writer.name} por $${opt.strikePrice}.`;
                success = true;
            }

            if (success) {
                return {
                    ...state,
                    players: newPlayers,
                    tiles: newTiles,
                    financialOptions: state.financialOptions.filter(o => o.id !== optId),
                    logs: [logMsg, ...state.logs]
                };
            }
            return state;
        }
        default: return state;
    }
};
