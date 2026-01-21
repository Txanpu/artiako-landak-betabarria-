
import React from 'react';
import { TradeOffer, Player, TileData } from '../../../types';

interface Props {
    trade: TradeOffer;
    players: Player[];
    tiles: TileData[];
    currentPlayerId: number;
    dispatch: React.Dispatch<any>;
}

export const ActiveTradeView: React.FC<Props> = ({ trade, players, tiles, currentPlayerId, dispatch }) => {
    const initiator = players.find(p => p.id === trade.initiatorId);
    const target = players.find(p => p.id === trade.targetId);
    
    // In Hotseat mode, if the target is Human, we allow interaction immediately regardless of whose turn it is.
    // If target is Bot, we show waiting screen because the Bot hook handles the response asynchronously.
    const isTargetBot = target?.isBot;
    const showControls = !isTargetBot; 

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500 shadow-2xl max-w-lg w-full relative overflow-hidden">
                
                {/* Header Badge */}
                <div className={`absolute top-0 left-0 w-full h-2 ${showControls ? 'bg-indigo-500' : 'bg-gray-600 animate-pulse'}`}></div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-indigo-400 flex items-center gap-2">
                        {!showControls ? '⏳ ENVIANDO...' : '🤝 TRATO PENDIENTE'}
                    </h2>
                    {showControls && (
                        <div className="bg-indigo-900/50 text-indigo-200 text-[10px] px-2 py-1 rounded border border-indigo-500/30 font-bold uppercase tracking-wider">
                            Decisión de {target?.name}
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Initiator Gives */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-700 relative group">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{backgroundColor: initiator?.color}}></span>
                            {initiator?.name} DA:
                        </div>
                        <div className="text-green-400 font-bold mb-1 font-mono text-lg">${trade.offeredMoney}</div>
                        {(trade.offeredFarlopa || 0) > 0 && <div className="text-white font-bold mb-1 text-sm bg-black/30 px-2 py-0.5 rounded inline-block">❄️ {trade.offeredFarlopa}u</div>}
                        <div className="space-y-1 mt-2">
                            {trade.offeredProps.map(pid => (
                                <div key={pid} className="text-xs text-white bg-slate-800 px-2 py-1 rounded border border-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: tiles[pid].color ? tiles[pid].color : '#ccc'}}></div>
                                    <span className="truncate">{tiles[pid].name}</span>
                                </div>
                            ))}
                            {trade.offeredProps.length === 0 && trade.offeredMoney === 0 && (trade.offeredFarlopa || 0) === 0 && <div className="text-gray-600 text-xs italic">Nada</div>}
                        </div>
                    </div>

                    {/* Target Gives (Initiator Receives) */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-700 relative group">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{backgroundColor: target?.color}}></span>
                            {target?.name} DA:
                        </div>
                        <div className="text-green-400 font-bold mb-1 font-mono text-lg">${trade.requestedMoney}</div>
                        {(trade.requestedFarlopa || 0) > 0 && <div className="text-white font-bold mb-1 text-sm bg-black/30 px-2 py-0.5 rounded inline-block">❄️ {trade.requestedFarlopa}u</div>}
                        <div className="space-y-1 mt-2">
                            {trade.requestedProps.map(pid => (
                                <div key={pid} className="text-xs text-white bg-slate-800 px-2 py-1 rounded border border-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: tiles[pid].color ? tiles[pid].color : '#ccc'}}></div>
                                    <span className="truncate">{tiles[pid].name}</span>
                                </div>
                            ))}
                            {trade.requestedProps.length === 0 && trade.requestedMoney === 0 && (trade.requestedFarlopa || 0) === 0 && <div className="text-gray-600 text-xs italic">Nada</div>}
                        </div>
                    </div>
                </div>

                {!showControls ? (
                    <div className="text-center bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <div className="text-indigo-400 font-bold text-sm mb-1 animate-pulse">Esperando respuesta de {target?.name}...</div>
                        <div className="text-[10px] text-gray-500 italic">La IA está evaluando la oferta.</div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button 
                            onClick={() => dispatch({type: 'REJECT_TRADE'})} 
                            className="flex-1 bg-red-900/80 hover:bg-red-600 text-white font-bold py-4 rounded-lg border-b-4 border-red-950 active:scale-95 transition-all uppercase tracking-wider flex flex-col items-center leading-none gap-1"
                        >
                            <span>RECHAZAR</span>
                            <span className="text-[9px] opacity-70 font-normal normal-case">No me interesa</span>
                        </button>
                        <button 
                            onClick={() => dispatch({type: 'ACCEPT_TRADE'})} 
                            className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-4 rounded-lg border-b-4 border-green-900 active:scale-95 transition-all uppercase tracking-wider flex flex-col items-center leading-none gap-1 shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                        >
                            <span>ACEPTAR TRATO</span>
                            <span className="text-[9px] opacity-70 font-normal normal-case">Firmar Acuerdo</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
