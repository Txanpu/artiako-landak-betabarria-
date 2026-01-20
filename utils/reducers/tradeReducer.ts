
import { GameState } from '../../types';

export const tradeReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'PROPOSE_TRADE': {
            const proposal = action.payload; 
            if (proposal) return { ...state, trade: proposal, showTradeModal: true };
            return { ...state, showTradeModal: true };
        }
        case 'ACCEPT_TRADE': {
            if (!state.trade) return state;
            const t = state.trade;
            
            // IMMUTABLE UPDATE: Map over players to create new objects
            const newPlayers = state.players.map(p => {
                // Update Initiator (P1)
                if (p.id === t.initiatorId) {
                    let newProps = p.props.filter(id => !t.offeredProps.includes(id)); // Remove what they gave
                    newProps = [...newProps, ...t.requestedProps]; // Add what they got
                    return { 
                        ...p, 
                        money: p.money - t.offeredMoney + t.requestedMoney,
                        props: newProps
                    };
                }
                // Update Target (P2)
                if (p.id === t.targetId) {
                    let newProps = p.props.filter(id => !t.requestedProps.includes(id)); // Remove what they gave
                    newProps = [...newProps, ...t.offeredProps]; // Add what they got
                    return { 
                        ...p, 
                        money: p.money - t.requestedMoney + t.offeredMoney,
                        props: newProps
                    };
                }
                return p;
            });
            
            // Update Tile Owners
            const newTiles = state.tiles.map(tile => {
                if (t.offeredProps.includes(tile.id)) return { ...tile, owner: t.targetId };
                if (t.requestedProps.includes(tile.id)) return { ...tile, owner: t.initiatorId };
                return tile;
            });

            // Get names for logging
            const p1Name = state.players.find(p => p.id === t.initiatorId)?.name || 'Jugador';
            const p2Name = state.players.find(p => p.id === t.targetId)?.name || 'Jugador';

            return { 
                ...state, 
                players: newPlayers, 
                tiles: newTiles, 
                trade: null, 
                showTradeModal: false, 
                logs: [`🤝 ¡Trato cerrado entre ${p1Name} y ${p2Name}!`, ...state.logs] 
            };
        }
        case 'REJECT_TRADE': {
            if (!state.trade) return state;
            
            const initiator = state.players.find(p => p.id === state.trade!.initiatorId);
            
            // Check Florentino Role (Force Accept)
            if (initiator && initiator.role === 'florentino' && Math.random() < 0.30) {
                 const t = state.trade;
                 
                 // Reuse immutable logic for forced trade
                 const newPlayers = state.players.map(p => {
                    if (p.id === t.initiatorId) {
                        let newProps = p.props.filter(id => !t.offeredProps.includes(id));
                        newProps = [...newProps, ...t.requestedProps];
                        return { ...p, money: p.money - t.offeredMoney + t.requestedMoney, props: newProps };
                    }
                    if (p.id === t.targetId) {
                        let newProps = p.props.filter(id => !t.requestedProps.includes(id));
                        newProps = [...newProps, ...t.offeredProps];
                        return { ...p, money: p.money - t.requestedMoney + t.offeredMoney, props: newProps };
                    }
                    return p;
                 });

                 const newTiles = state.tiles.map(tile => {
                    if (t.offeredProps.includes(tile.id)) return { ...tile, owner: t.targetId };
                    if (t.requestedProps.includes(tile.id)) return { ...tile, owner: t.initiatorId };
                    return tile;
                 });
                 
                 return { 
                     ...state, 
                     players: newPlayers, 
                     tiles: newTiles, 
                     trade: null, 
                     showTradeModal: false, 
                     logs: [`🦅 Florentino fuerza la aceptación del trato!`, ...state.logs] 
                 };
            }

            return { ...state, trade: null, showTradeModal: false, logs: [`❌ Trato rechazado.`, ...state.logs] };
        }
        case 'CLOSE_TRADE': return { ...state, showTradeModal: false };
        default: return state;
    }
};
