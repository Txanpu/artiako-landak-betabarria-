
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
                
                // RIGHT GOV: 0% Fee (Amnistía Fiscal)
                const isTaxHaven = state.gov === 'right';
                const fee = isTaxHaven ? 0 : 0.10;
                const net = Math.floor(amount * (1 - fee));
                
                p.money += net;
                const ps = [...state.players]; ps[pIdx] = p;
                
                const logMsg = isTaxHaven 
                    ? `🏝️ ${p.name} retira fondos offshore (Amnistía Fiscal 0% coms).`
                    : `🏝️ ${p.name} retira fondos offshore (+${formatMoney(net)} tras blanqueo).`;

                return { ...state, players: ps, logs: [logMsg, ...state.logs] };
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
            const { mode, propId, strike, premium, counterpartyId } = action.payload;
            const me = state.players[state.currentPlayerIndex];
            const other = state.players.find(p => p.id === counterpartyId);
            const tile = state.tiles[propId];
            
            if (!other || !tile) return state;

            let logMsg = '';
            let writerId = -1;
            let holderId = -1;
            let type: 'call' | 'put' = 'call';
            
            // Logic Container for validation and money transfer
            const executeDeal = (payer: typeof me, receiver: typeof me, wId: number, hId: number, optType: 'call' | 'put', propOwnerId: number) => {
                // 1. Check Ownership
                if (tile.owner !== propOwnerId) return { success: false, msg: `❌ La propiedad no pertenece al emisor correcto.` };
                // 2. Check Funds
                if (payer.money < premium) return { success: false, msg: `❌ ${payer.name} no tiene fondos para la prima.` };

                // 3. Transfer Money
                const newPlayers = state.players.map(p => {
                    if (p.id === payer.id) return { ...p, money: p.money - premium };
                    if (p.id === receiver.id) return { ...p, money: p.money + premium };
                    return p;
                });

                writerId = wId;
                holderId = hId;
                type = optType;
                
                return { success: true, newPlayers };
            };

            let res: any;

            if (mode === 'sell_call') {
                // I sell Call. I get Premium. I am Writer. I own Prop.
                res = executeDeal(other, me, me.id, other.id, 'call', me.id);
                logMsg = `📝 CALL Creada: ${me.name} vende opción de compra a ${other.name} sobre #${tile.name}. Prima: $${premium}.`;
            } 
            else if (mode === 'buy_call') {
                // I buy Call. I pay Premium. Other is Writer. Other owns Prop.
                res = executeDeal(me, other, other.id, me.id, 'call', other.id);
                logMsg = `📝 CALL Creada: ${me.name} compra derecho a comprar #${tile.name} a ${other.name}. Prima: $${premium}.`;
            }
            else if (mode === 'buy_put') {
                // I buy Put. I pay Premium. Other is Writer (Insurer). I own Prop.
                res = executeDeal(me, other, other.id, me.id, 'put', me.id);
                logMsg = `📝 PUT Creada: ${me.name} compra seguro de venta a ${other.name} sobre #${tile.name}. Prima: $${premium}.`;
            }
            else if (mode === 'sell_put') {
                // I sell Put (Insurer). I get Premium. I am Writer. Other owns Prop.
                res = executeDeal(other, me, me.id, other.id, 'put', other.id);
                logMsg = `📝 PUT Creada: ${me.name} asegura la propiedad #${tile.name} de ${other.name}. Prima: $${premium}.`;
            }

            if (!res || !res.success) {
                return { ...state, logs: [res?.msg || 'Error en contrato', ...state.logs] };
            }

            const option = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                propertyId: propId,
                strikePrice: strike,
                premium,
                writerId,
                holderId,
                expiresTurn: state.turnCount + 15
            };

            return {
                ...state,
                players: res.newPlayers,
                financialOptions: [...state.financialOptions, option],
                logs: [logMsg, ...state.logs]
            };
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
                
                // Writer (Insurer) pays Holder
                // Even if Writer has no money, debt is enforced (negative balance -> bankruptcy check later)
                
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
