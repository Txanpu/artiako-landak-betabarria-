
import React from 'react';
import { GameState } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const DerivativesPortfolio: React.FC<Props> = ({ state, dispatch }) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return null; // Safety check

    // Split into Held (Rights) and Written (Obligations)
    const heldOptions = state.financialOptions.filter(o => o.holderId === currentPlayer.id);
    const writtenOptions = state.financialOptions.filter(o => o.writerId === currentPlayer.id);

    return (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            
            {/* HELD OPTIONS (Long) - Assets you own and can exercise */}
            <div>
                <h4 className="text-[10px] uppercase font-bold text-green-400 mb-2 border-b border-green-800 pb-1 flex justify-between">
                    <span>Mis Derechos (Long)</span>
                    <span className="text-white">{heldOptions.length}</span>
                </h4>
                {heldOptions.length === 0 && <div className="text-gray-600 text-xs italic text-center py-2">No tienes opciones compradas.</div>}
                
                <div className="space-y-2">
                    {heldOptions.map(opt => {
                        const tile = state.tiles[opt.propertyId];
                        const writer = state.players.find(p => p.id === opt.writerId);
                        const isCall = opt.type === 'call';
                        
                        // Exercise Logic Checks
                        const canAfford = currentPlayer.money >= opt.strikePrice;
                        const writerOwns = tile.owner === opt.writerId;
                        const iOwn = tile.owner === currentPlayer.id; // For Put
                        
                        let canExercise = false;
                        let statusMsg = "";

                        if (isCall) {
                            if (!writerOwns) statusMsg = "Emisor vendió la propiedad (Nula)";
                            else if (!canAfford) statusMsg = `Faltan fondos ($${formatMoney(opt.strikePrice)})`;
                            else canExercise = true;
                        } else { // Put
                            if (!iOwn) statusMsg = "No posees la propiedad";
                            else canExercise = true;
                        }

                        return (
                            <div key={opt.id} className="bg-slate-800/80 p-2 rounded border-l-4 border-green-500 flex flex-col gap-2 relative shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className={`text-xs font-black ${isCall ? 'text-blue-300' : 'text-orange-300'}`}>
                                            {isCall ? 'CALL (Compra)' : 'PUT (Venta)'} <span className="text-white">{tile.name}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            Contra: <span className="text-slate-300">{writer?.name}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            Strike: <span className="text-white font-bold font-mono">${opt.strikePrice}</span>
                                        </div>
                                        <div className="text-[9px] text-gray-500 mt-1">Expira: Turno {opt.expiresTurn}</div>
                                    </div>
                                    <div className="flex flex-col gap-1 w-20">
                                        <button 
                                            onClick={() => dispatch({type: 'EXERCISE_OPTION', payload: { optId: opt.id }})}
                                            disabled={!canExercise}
                                            className="bg-green-600 hover:bg-green-500 text-white text-[9px] px-2 py-1.5 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-green-500"
                                        >
                                            EJERCER
                                        </button>
                                        <button 
                                            onClick={() => dispatch({type: 'LIST_ASSET', payload: { assetType: 'option', refId: opt.id, amount: 1, price: Math.floor(opt.premium * 0.8), startAuction: true }})}
                                            className="bg-purple-700 hover:bg-purple-600 text-white text-[9px] px-2 py-1 rounded font-bold border border-purple-500"
                                        >
                                            VENDER
                                        </button>
                                    </div>
                                </div>
                                {!canExercise && statusMsg && (
                                    <div className="text-[9px] text-red-300 font-bold bg-red-900/30 px-1 py-0.5 rounded text-center border border-red-900/50">
                                        🚫 {statusMsg}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* WRITTEN OPTIONS (Short) - Liabilities you owe */}
            <div>
                <h4 className="text-[10px] uppercase font-bold text-red-400 mb-2 border-b border-red-800 pb-1 flex justify-between">
                    <span>Mis Obligaciones (Short)</span>
                    <span className="text-white">{writtenOptions.length}</span>
                </h4>
                {writtenOptions.length === 0 && <div className="text-gray-600 text-xs italic text-center py-2">No has emitido opciones.</div>}

                <div className="space-y-2">
                    {writtenOptions.map(opt => {
                        const tile = state.tiles[opt.propertyId];
                        const holder = state.players.find(p => p.id === opt.holderId);
                        const isCall = opt.type === 'call';

                        return (
                            <div key={opt.id} className="bg-slate-800/80 p-2 rounded border-l-4 border-red-500 flex flex-col gap-1 shadow-md opacity-90">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-gray-300">
                                            Has vendido {isCall ? 'CALL' : 'PUT'} sobre <span className="text-white">{tile.name}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            Tenedor: <span className="text-slate-300">{holder?.name}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            Strike: <span className="font-mono text-white">${opt.strikePrice}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] bg-red-950 text-red-400 px-2 py-1 rounded border border-red-900 inline-block font-bold">
                                            PASIVO
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[9px] text-gray-500 italic mt-1 border-t border-slate-700 pt-1">
                                    {isCall 
                                        ? "Estás obligado a VENDER si te ejercen." 
                                        : "Estás obligado a COMPRAR si te ejercen."}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};
