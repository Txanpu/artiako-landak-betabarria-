
import React, { useState } from 'react';
import { GameState, TileType } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

interface TradeModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const TradeModal: React.FC<TradeModalProps> = ({ state, dispatch }) => {
    // Local state for CREATING a trade
    const [targetId, setTargetId] = useState<number>(-1);
    const [offerMoney, setOfferMoney] = useState(0);
    const [reqMoney, setReqMoney] = useState(0);
    const [selectedOfferProps, setSelectedOfferProps] = useState<number[]>([]);
    const [selectedReqProps, setSelectedReqProps] = useState<number[]>([]);

    if (!state.showTradeModal) return null;

    const currentPlayer = state.players[state.currentPlayerIndex];

    // Case 1: Viewing an Active Trade (Incoming or Sent)
    if (state.trade) {
        const initiator = state.players.find(p => p.id === state.trade!.initiatorId);
        const target = state.players.find(p => p.id === state.trade!.targetId);
        const isMyProposal = state.trade.initiatorId === currentPlayer.id;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500 shadow-2xl max-w-lg w-full">
                    <h2 className="text-2xl font-black text-indigo-400 mb-4 flex items-center gap-2">
                        {isMyProposal ? '⏳ ESPERANDO RESPUESTA...' : '🤝 PROPUESTA DE CAMBIO'}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Initiator Gives */}
                        <div className="bg-slate-900 p-3 rounded border border-slate-700">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{initiator?.name} ENTREGA:</div>
                            <div className="text-green-400 font-bold mb-1">${state.trade.offeredMoney}</div>
                            <div className="space-y-1">
                                {state.trade.offeredProps.map(pid => (
                                    <div key={pid} className="text-xs text-white bg-slate-800 px-1 rounded border border-slate-600">{state.tiles[pid].name}</div>
                                ))}
                            </div>
                        </div>

                        {/* Target Gives (Initiator Receives) */}
                        <div className="bg-slate-900 p-3 rounded border border-slate-700">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{target?.name} ENTREGA:</div>
                            <div className="text-green-400 font-bold mb-1">${state.trade.requestedMoney}</div>
                            <div className="space-y-1">
                                {state.trade.requestedProps.map(pid => (
                                    <div key={pid} className="text-xs text-white bg-slate-800 px-1 rounded border border-slate-600">{state.tiles[pid].name}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isMyProposal ? (
                         <div className="text-center text-gray-400 py-4 italic animate-pulse border-t border-slate-700">
                            Enviado a {target?.name}. Esperando decisión...
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => dispatch({type: 'REJECT_TRADE'})} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded">RECHAZAR</button>
                            <button onClick={() => dispatch({type: 'ACCEPT_TRADE'})} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded">ACEPTAR</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Case 2: Creating a New Trade
    const toggleOfferProp = (id: number) => {
        if (selectedOfferProps.includes(id)) setSelectedOfferProps(selectedOfferProps.filter(x => x !== id));
        else setSelectedOfferProps([...selectedOfferProps, id]);
    };

    const toggleReqProp = (id: number) => {
        if (selectedReqProps.includes(id)) setSelectedReqProps(selectedReqProps.filter(x => x !== id));
        else setSelectedReqProps([...selectedReqProps, id]);
    };

    const sendTrade = () => {
        if (targetId === -1) return;
        dispatch({
            type: 'PROPOSE_TRADE',
            payload: {
                initiatorId: currentPlayer.id,
                targetId: targetId,
                offeredMoney: offerMoney,
                offeredProps: selectedOfferProps,
                requestedMoney: reqMoney,
                requestedProps: selectedReqProps,
                isOpen: true
            }
        });
        // Reset form
        setTargetId(-1); setOfferMoney(0); setReqMoney(0); setSelectedOfferProps([]); setSelectedReqProps([]);
    };

    const targetPlayer = state.players.find(p => p.id === targetId);

    // Rule: Locked properties (by Options) cannot be traded/sold
    const isLocked = (tid: number) => state.financialOptions.some(o => o.propertyId === tid);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-blue-500 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-black text-blue-400">NUEVO COMERCIO</h2>
                    <button onClick={() => dispatch({type: 'CLOSE_TRADE'})} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Elegir Jugador:</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                        value={targetId}
                        onChange={e => {
                            setTargetId(Number(e.target.value));
                            setSelectedReqProps([]); // Reset props when changing target
                        }}
                    >
                        <option value={-1}>Selecciona un rival...</option>
                        {state.players.filter(p => p.id !== currentPlayer.id && p.alive).map(p => (
                            <option key={p.id} value={p.id}>{p.name} (${p.money})</option>
                        ))}
                    </select>
                </div>

                {targetId !== -1 && targetPlayer && (
                    <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                        {/* LEFT: I GIVE */}
                        <div className="bg-slate-900 p-3 rounded border border-slate-700 flex flex-col">
                            <h3 className="text-green-400 font-bold border-b border-gray-700 pb-1 mb-2">YO DOY</h3>
                            <div className="mb-2">
                                <label className="text-xs text-gray-500">Dinero (${offerMoney})</label>
                                <input type="range" min="0" max={currentPlayer.money} step="10" value={offerMoney} onChange={e => setOfferMoney(Number(e.target.value))} className="w-full accent-green-500" />
                            </div>
                            <div className="flex-1 overflow-y-auto border border-slate-800 p-1 custom-scrollbar max-h-40">
                                {state.tiles.filter(t => t.owner === currentPlayer.id).map(t => {
                                    const locked = isLocked(t.id);
                                    return (
                                        <div 
                                            key={t.id} 
                                            onClick={() => !locked && toggleOfferProp(t.id)} 
                                            className={`text-xs p-1 cursor-pointer select-none flex justify-between ${selectedOfferProps.includes(t.id) ? 'bg-green-900 text-white' : (locked ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-slate-800')}`}
                                        >
                                            <span>{t.name}</span>
                                            {locked && <span className="text-[9px] text-red-500 font-bold">LOCKED</span>}
                                            {selectedOfferProps.includes(t.id) && <span>✓</span>}
                                        </div>
                                    );
                                })}
                                <div className="text-[9px] text-gray-500 italic mt-1 text-center">Propiedades con opciones activas no se pueden vender.</div>
                            </div>
                        </div>

                        {/* RIGHT: I GET */}
                        <div className="bg-slate-900 p-3 rounded border border-slate-700 flex flex-col">
                            <h3 className="text-blue-400 font-bold border-b border-gray-700 pb-1 mb-2">YO RECIBO</h3>
                            <div className="mb-2">
                                <label className="text-xs text-gray-500">Dinero (${reqMoney})</label>
                                <input type="range" min="0" max={targetPlayer.money} step="10" value={reqMoney} onChange={e => setReqMoney(Number(e.target.value))} className="w-full accent-blue-500" />
                            </div>
                             <div className="flex-1 overflow-y-auto border border-slate-800 p-1 custom-scrollbar max-h-40">
                                {state.tiles.filter(t => t.owner === targetPlayer.id).map(t => {
                                    const locked = isLocked(t.id);
                                    return (
                                        <div 
                                            key={t.id} 
                                            onClick={() => !locked && toggleReqProp(t.id)} 
                                            className={`text-xs p-1 cursor-pointer select-none flex justify-between ${selectedReqProps.includes(t.id) ? 'bg-blue-900 text-white' : (locked ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-slate-800')}`}
                                        >
                                            <span>{t.name}</span>
                                            {locked && <span className="text-[9px] text-red-500 font-bold">LOCKED</span>}
                                            {selectedReqProps.includes(t.id) && <span>✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button 
                        disabled={targetId === -1}
                        onClick={sendTrade}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ENVIAR OFERTA
                    </button>
                </div>
            </div>
        </div>
    );
};
