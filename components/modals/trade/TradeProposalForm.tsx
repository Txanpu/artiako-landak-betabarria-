
import React, { useState } from 'react';
import { GameState, Player, TileData, FinancialOption } from '../../../types';

interface Props {
    state: GameState;
    currentPlayer: Player;
    dispatch: React.Dispatch<any>;
}

export const TradeProposalForm: React.FC<Props> = ({ state, currentPlayer, dispatch }) => {
    const [targetId, setTargetId] = useState<number>(-1);
    const [offerMoney, setOfferMoney] = useState(0);
    const [offerDrugs, setOfferDrugs] = useState(0);
    const [reqMoney, setReqMoney] = useState(0);
    const [reqDrugs, setReqDrugs] = useState(0);
    const [selectedOfferProps, setSelectedOfferProps] = useState<number[]>([]);
    const [selectedReqProps, setSelectedReqProps] = useState<number[]>([]);

    const targetPlayer = state.players.find(p => p.id === targetId);

    // Rule: Locked properties (by Options) cannot be traded/sold
    const isLocked = (tid: number) => state.financialOptions.some(o => o.propertyId === tid);

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
                offeredFarlopa: offerDrugs,
                requestedMoney: reqMoney,
                requestedProps: selectedReqProps,
                requestedFarlopa: reqDrugs,
                isOpen: true
            }
        });
    };

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
                            setSelectedReqProps([]); 
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
                            <div className="mb-2">
                                <label className="text-xs text-gray-500">Farlopa ({offerDrugs}) / {currentPlayer.farlopa || 0}</label>
                                <input type="range" min="0" max={currentPlayer.farlopa || 0} step="1" value={offerDrugs} onChange={e => setOfferDrugs(Number(e.target.value))} className="w-full accent-white" />
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
                            <div className="mb-2">
                                <label className="text-xs text-gray-500">Farlopa ({reqDrugs}) / {targetPlayer.farlopa || 0}</label>
                                <input type="range" min="0" max={targetPlayer.farlopa || 0} step="1" value={reqDrugs} onChange={e => setReqDrugs(Number(e.target.value))} className="w-full accent-white" />
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
