
import { GameState } from '../../types';
import { formatMoney } from '../gameLogic';

export const resolveAuction = (state: GameState): GameState => {
    if (!state.auction) return state;
    const winnerId = state.auction.highestBidder;
    let newState = { ...state };
    
    if (winnerId !== null) {
        // CASE A: Player Wins
        if (typeof winnerId === 'number') {
            const wIdx = state.players.findIndex(p => p.id === winnerId);
            if (wIdx === -1) return { ...state, auction: null };
            
            const wPlayer = { ...state.players[wIdx] };
            
            // Handle Financial Auctions (Shares, Pools, Options)
            if (state.auction.kind === 'loanShare' || state.auction.kind === 'poolUnit' || state.auction.kind === 'option') {
                 const listing = state.marketListings.find(l => l.id === state.auction!.assetId);
                 
                 if (listing && wPlayer.money >= state.auction.currentBid) {
                     wPlayer.money -= state.auction.currentBid;
                     const seller = newState.players.find(p => p.id === listing.sellerId);
                     if (seller) seller.money += state.auction.currentBid;
                     
                     // Transfer Assets
                     if (listing.assetType === 'loanShare') {
                         const loan = newState.loans.find(l => l.id === listing.assetRefId);
                         const share = loan?.shares?.find(s => s.id === listing.subRefId);
                         if (share) share.ownerId = wPlayer.id;
                     } else if (listing.assetType === 'poolUnit') {
                         const pool = newState.loanPools.find(p => p.id === listing.assetRefId);
                         if (pool) {
                             pool.holdings[listing.sellerId] = (pool.holdings[listing.sellerId] || 0) - listing.amount;
                             pool.holdings[wPlayer.id] = (pool.holdings[wPlayer.id] || 0) + listing.amount;
                         }
                     } else if (listing.assetType === 'option') {
                         // Transfer Option Holder
                         const optIndex = newState.financialOptions.findIndex(o => o.id === listing.assetRefId);
                         if (optIndex !== -1) {
                             newState.financialOptions[optIndex] = { 
                                 ...newState.financialOptions[optIndex], 
                                 holderId: wPlayer.id 
                             };
                         }
                     }
                     
                     // Remove listing
                     newState.marketListings = newState.marketListings.filter(l => l.id !== listing.id);
                     newState.players[wIdx] = wPlayer; // Update winner
                     newState.logs = [`🔨 Subasta financiera cerrada. ${wPlayer.name} gana por ${formatMoney(state.auction.currentBid)}`, ...state.logs];
                 } else {
                     newState.logs = [`🔨 Subasta fallida.`, ...state.logs];
                 }
                 
                 newState.auction = null;
                 return newState;
            }

            // Handle Property/Bundle Auctions
            const wTiles = [...state.tiles];
            
            if (wPlayer.money >= state.auction.currentBid) {
                wPlayer.money -= state.auction.currentBid;
                newState.estadoMoney += state.auction.currentBid;
                
                const targets = state.auction.kind === 'bundle' && state.auction.items ? state.auction.items : [state.auction.tileId];
                targets.forEach(tid => {
                    if (!wPlayer.props.includes(tid)) wPlayer.props.push(tid);
                    wTiles[tid].owner = wPlayer.id;
                });
                
                newState.players[wIdx] = wPlayer;
                newState.tiles = wTiles;
                newState.logs = [`🔨 ¡Vendido! ${wPlayer.name} gana por ${formatMoney(state.auction.currentBid)}`, ...state.logs];
            } else {
                 newState.logs = [`🔨 Subasta cancelada: ${wPlayer.name} no puede pagar.`, ...state.logs];
            }
        } 
        // CASE B: State Wins
        else if (winnerId === 'E') {
             const activePlayers = newState.players.filter(p => p.alive);
             if (activePlayers.length > 0) {
                 const distribution = Math.floor(state.auction.currentBid / activePlayers.length);
                 
                 // Redistribute funds
                 newState.players = newState.players.map(p => {
                     if (p.alive) return { ...p, money: p.money + distribution };
                     return p;
                 });
                 
                 // State pays (reduce treasury tracking)
                 newState.estadoMoney -= state.auction.currentBid;

                 // Transfer Property to State
                 const wTiles = [...state.tiles];
                 const targets = state.auction.kind === 'bundle' && state.auction.items ? state.auction.items : [state.auction.tileId];
                 
                 targets.forEach(tid => {
                     // Reset property
                     wTiles[tid] = { ...wTiles[tid], owner: 'E', mortgaged: false, houses: 0, hotel: false };
                 });
                 newState.tiles = wTiles;

                 newState.logs = [`🔨 El Estado gana la subasta ($${formatMoney(state.auction.currentBid)}). Se reparten $${distribution} a cada jugador.`, ...state.logs];
             } else {
                 newState.logs = ['🔨 Estado gana subasta pero no hay jugadores para repartir.', ...state.logs];
             }
        }
    } else {
        newState.logs = ['🔨 Subasta desierta.', ...state.logs];
    }
    
    newState.auction = null;
    return newState;
};

export const auctionReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_AUCTION': { 
            const aucTileId = action.payload; 
            return { 
                ...state, 
                auction: { 
                    tileId: aucTileId, 
                    currentBid: 0, 
                    highestBidder: null, 
                    activePlayers: state.players.filter(p => p.alive).map(p => p.id), 
                    timer: 20, 
                    isOpen: true, 
                    kind: 'tile' 
                } 
            }; 
        }
        case 'BID_AUCTION': { 
            const { amount, pId: bidderId } = action.payload; 
            if (state.auction && amount > state.auction.currentBid && state.auction.activePlayers.includes(bidderId)) { 
                return { ...state, auction: { ...state.auction, currentBid: amount, highestBidder: bidderId, timer: 10 }, logs: [`Subasta: ${state.players[bidderId].name} puja ${formatMoney(amount)}`, ...state.logs] }; 
            } 
            return state; 
        }
        case 'TICK_AUCTION': {
            if (!state.auction || !state.auction.isOpen) return state;
            if (state.auction.timer <= 0) {
                 return resolveAuction(state);
            }
            return { ...state, auction: { ...state.auction, timer: state.auction.timer - 1 } };
        }
        case 'WITHDRAW_AUCTION': {
            const { pId } = action.payload;
            if (!state.auction) return state;
            const newActive = state.auction.activePlayers.filter(id => id !== pId);
            const quitter = state.players.find(p => p.id === pId);
            
            if (newActive.length === 0) {
                return resolveAuction(state);
            }
            
            return { 
                ...state, 
                auction: { ...state.auction, activePlayers: newActive }, 
                logs: [`${quitter?.name} se retiró de la subasta.`, ...state.logs] 
            };
        }
        case 'END_AUCTION': { 
            return resolveAuction(state);
        }
        default: return state;
    }
};
