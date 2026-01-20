
import React, { useEffect } from 'react';
import { GameState } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

interface AuctionModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({ state, dispatch }) => {
    
    // Timer logic in this component only runs if mounted (auction is open)
    useEffect(() => {
        let interval: any = null;
        if (state.auction && state.auction.isOpen) {
            interval = setInterval(() => {
                dispatch({ type: 'TICK_AUCTION' });
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [state.auction?.isOpen, dispatch]);

    if (!state.auction || !state.auction.isOpen) return null;

    const isSealed = state.auction.sealed;

    return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-slate-800 p-6 rounded-xl border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.3)] max-w-md w-full relative max-h-[90vh] overflow-y-auto">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {state.auction.kind === 'bundle' ? '📦 SUBASTA DE LOTE' : 'SUBASTA'}
                  </div>
                  {state.auction.kind === 'bundle' ? (
                      <div className="my-4 space-y-1 bg-slate-900 p-2 rounded border border-slate-700">
                          {state.auction.items?.map(tid => (<div key={tid} className="text-sm text-gray-300 flex justify-between"><span>{state.tiles[tid].name}</span><span className="text-green-500">${state.tiles[tid].price}</span></div>))}
                          <div className="text-xs text-center text-gray-500 pt-1 border-t border-slate-800">Valor Total: ${state.auction.items?.reduce((acc, id) => acc + (state.tiles[id].price||0), 0)}</div>
                      </div>
                  ) : (<h3 className="text-xl text-center text-white font-bold mt-4 mb-2">{state.tiles[state.auction.tileId].name}</h3>)}
                  
                  {isSealed ? (
                      <div className="text-center text-4xl font-black text-gray-500 mb-2 blur-sm select-none">???</div>
                  ) : (
                      <div className="text-center text-4xl font-black text-green-400 mb-2">{formatMoney(state.auction.currentBid)}</div>
                  )}
                  
                  {isSealed && <div className="text-center text-yellow-500 font-bold mb-2 uppercase text-xs">🔒 Subasta Oculta - Pujas Secretas</div>}

                  {/* Timer Visual */}
                  <div className="mb-4 w-full bg-gray-700 rounded-full h-4 overflow-hidden relative border border-gray-600">
                      <div className={`h-full transition-all duration-1000 ease-linear ${state.auction.timer < 5 ? 'bg-red-600 animate-pulse' : 'bg-yellow-500'}`} style={{ width: `${(state.auction.timer / 20) * 100}%` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md z-10">{state.auction.timer}s</div>
                  </div>

                  <div className="text-center text-xs text-gray-400 mb-4">
                      {isSealed 
                          ? 'Pujador líder oculto' 
                          : `Puja más alta: ${state.auction.highestBidder !== null ? state.players.find(p => p.id === state.auction.highestBidder)?.name : 'Nadie'}`
                      }
                  </div>

                  <div className="space-y-3 mb-4">
                      {state.players.filter(p => !p.isBot && state.auction!.activePlayers.includes(p.id)).length === 0 && (
                          <div className="text-center text-gray-500 italic text-sm">No quedan humanos en la puja.</div>
                      )}
                      
                      {state.players.filter(p => !p.isBot && state.auction!.activePlayers.includes(p.id)).map(human => (
                          <div key={human.id} className="bg-slate-700/50 p-3 rounded border border-slate-600 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                  <span className="font-bold text-sm text-white">{human.name}</span>
                                  <span className="font-mono text-green-400 text-xs">${human.money}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                  <button onClick={() => dispatch({type: 'BID_AUCTION', payload: {amount: (isSealed ? (state.auction?.bids?.[human.id]||0) : state.auction!.currentBid) + 10, pId: human.id}})} disabled={human.money < state.auction!.currentBid + 10} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold py-2 rounded disabled:opacity-50">+10</button>
                                  <button onClick={() => dispatch({type: 'BID_AUCTION', payload: {amount: (isSealed ? (state.auction?.bids?.[human.id]||0) : state.auction!.currentBid) + 50, pId: human.id}})} disabled={human.money < state.auction!.currentBid + 50} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold py-2 rounded disabled:opacity-50">+50</button>
                                  <button onClick={() => dispatch({type: 'BID_AUCTION', payload: {amount: (isSealed ? (state.auction?.bids?.[human.id]||0) : state.auction!.currentBid) + 100, pId: human.id}})} disabled={human.money < state.auction!.currentBid + 100} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold py-2 rounded disabled:opacity-50">+100</button>
                                  <button onClick={() => dispatch({type: 'WITHDRAW_AUCTION', payload: {pId: human.id}})} className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-2 rounded">Pasar</button>
                              </div>
                              {isSealed && <div className="text-center text-[10px] text-gray-400">Tu puja actual: ${state.auction?.bids?.[human.id] || 0}</div>}
                          </div>
                      ))}
                  </div>

                  <button onClick={() => dispatch({type: 'END_AUCTION'})} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg border-b-4 border-green-800 active:scale-95 transition-all">
                      ADJUDICAR / CERRAR
                  </button>
              </div>
          </div>
    );
};
