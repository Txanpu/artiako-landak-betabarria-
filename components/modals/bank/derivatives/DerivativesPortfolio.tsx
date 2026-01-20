
import React from 'react';
import { GameState } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const DerivativesPortfolio: React.FC<Props> = ({ state, dispatch }) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const myOptions = state.financialOptions.filter(o => o.holderId === currentPlayer.id);

    return (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {myOptions.length === 0 && <div className="text-gray-500 text-center text-xs mt-4">No tienes opciones activas.</div>}
            
            {myOptions.map(opt => {
                const tile = state.tiles[opt.propertyId];
                const writer = state.players.find(p => p.id === opt.writerId);
                const isCall = opt.type === 'call';
                const canExercise = isCall ? (currentPlayer.money >= opt.strikePrice) : (tile.owner === currentPlayer.id); 

                return (
                    <div key={opt.id} className="bg-black/40 p-2 rounded border border-slate-600 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className={`text-xs font-black ${isCall ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCall ? 'CALL' : 'PUT'} {tile.name}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                    vs {writer?.name} | Strike: <span className="text-white font-bold">${opt.strikePrice}</span>
                                </div>
                                <div className="text-[9px] text-gray-500">Expira turno {opt.expiresTurn}</div>
                            </div>
                            <div className="text-right">
                                <button 
                                    onClick={() => dispatch({type: 'EXERCISE_OPTION', payload: { optId: opt.id }})}
                                    disabled={!canExercise}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-2 py-1 rounded font-bold disabled:opacity-50 block mb-1 w-full"
                                >
                                    EJERCER
                                </button>
                                <button 
                                    onClick={() => dispatch({type: 'LIST_ASSET', payload: { assetType: 'option', refId: opt.id, amount: 1, price: Math.floor(opt.premium * 0.8), startAuction: true }})}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-[9px] px-2 py-1 rounded font-bold w-full"
                                >
                                    SUBASTAR
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
