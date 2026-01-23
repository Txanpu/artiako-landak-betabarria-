
import React from 'react';
import { GameState, Player } from '../../../types';
import { StakeSide } from './StakeSide';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    currentPlayer: Player;
}

export const ActiveMarkets: React.FC<Props> = ({ state, dispatch, currentPlayer }) => {
    const markets = state.predictionMarkets;

    if (markets.length === 0) return <div className="text-center text-gray-500 italic py-10">No hay mercados activos. Crea uno.</div>;

    return (
        <div className="space-y-6">
            {markets.map(m => {
                // Determine Voting State
                const humans = state.players.filter(p => !p.isBot && p.alive);
                const nextVoter = humans.find(p => !m.votes[p.id]);
                const isVoting = m.status === 'voting';

                return (
                    <div key={m.id} className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 p-3">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                                m.status === 'active' ? 'bg-green-900/50 text-green-400 border-green-500' : 
                                m.status === 'voting' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500 animate-pulse' : 
                                'bg-gray-800 text-gray-400 border-gray-600'
                            }`}>
                                {m.status}
                            </span>
                        </div>

                        {/* Header: Condition */}
                        <div className="mb-6 pr-20">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                                Creado por {state.players.find(p => p.id === m.creatorId)?.name}
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight italic">"{m.condition}"</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-stretch">
                            {/* LEFT: YES / NO Cards */}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* YES SIDE */}
                                <StakeSide 
                                    state={state} 
                                    side="YES" 
                                    player={state.players.find(p => p.id === m.playerYes)} 
                                    assets={m.stakesYes} 
                                    isWinner={false}
                                />
                                {/* NO SIDE */}
                                <StakeSide 
                                    state={state} 
                                    side="NO" 
                                    player={state.players.find(p => p.id === m.playerNo)} 
                                    assets={m.stakesNo} 
                                    isWinner={false}
                                />
                            </div>

                            {/* RIGHT: Validation / Voting Actions */}
                            <div className="w-full md:w-64 flex flex-col justify-center border-l border-slate-700 pl-4 bg-black/20 rounded-r-xl p-2">
                                
                                {m.status === 'active' && (
                                    <button onClick={() => dispatch({type: 'TRIGGER_MARKET_VOTE', payload: {marketId: m.id}})} className="w-full h-full min-h-[80px] bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-sm uppercase shadow-lg border-b-4 border-yellow-800 active:scale-95 transition-all animate-pulse flex items-center justify-center text-center">
                                        EMPEZAR A VALIDAR
                                        <br/>
                                        <span className="text-[10px] font-normal lowercase">(Votación)</span>
                                    </button>
                                )}

                                {isVoting && (
                                    <div className="w-full h-full flex flex-col gap-2 justify-center">
                                        {nextVoter ? (
                                            <>
                                                <div className="bg-blue-900/40 p-2 rounded text-center border border-blue-500/30 mb-2">
                                                    <div className="text-[9px] text-blue-300 uppercase font-bold tracking-widest mb-1">TURNO DE VOTO</div>
                                                    <div className="text-lg font-black text-white flex items-center justify-center gap-2">
                                                        {nextVoter.avatar} {nextVoter.name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 italic mt-1">¿Se cumplió la condición?</div>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => dispatch({type: 'CAST_MARKET_VOTE', payload: {marketId: m.id, pId: nextVoter.id, vote: 'YES'}})} 
                                                        className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-lg font-black text-xl py-3 border-b-4 border-green-800 active:scale-95 transition-all"
                                                    >
                                                        SÍ
                                                    </button>
                                                    <button 
                                                        onClick={() => dispatch({type: 'CAST_MARKET_VOTE', payload: {marketId: m.id, pId: nextVoter.id, vote: 'NO'}})} 
                                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black text-xl py-3 border-b-4 border-red-800 active:scale-95 transition-all"
                                                    >
                                                        NO
                                                    </button>
                                                </div>
                                                <div className="text-center text-[10px] text-gray-500 mt-2">
                                                    Votos: {Object.keys(m.votes).length} / {humans.length}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center animate-pulse">
                                                <div className="text-yellow-400 font-bold mb-2">RECUENTO FINAL...</div>
                                                <div className="text-xs text-gray-500">Procesando resultados</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
