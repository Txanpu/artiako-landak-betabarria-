
import React, { useState } from 'react';
import { GameState } from '../../types';
import { formatMoney } from '../../utils/gameLogic';
import { useGreyhoundRace } from './greyhound/useGreyhoundRace';
import { GreyhoundTrack } from './greyhound/GreyhoundTrack';
import { GreyhoundBetting } from './greyhound/GreyhoundBetting';

export const GreyhoundModal: React.FC<{ state: GameState; dispatch: any }> = ({ state, dispatch }) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const [myBet, setMyBet] = useState<{dogId: number, amount: number} | null>(null);

    const { dogs, phase, commentary, startRace } = useGreyhoundRace(state.showGreyhounds, (winnerId, odds) => {
        if (myBet && myBet.dogId === winnerId) {
            const payout = Math.floor(myBet.amount * odds);
            dispatch({ type: 'PAYOUT_GREYHOUND', payload: { pId: currentPlayer.id, amount: payout } });
        }
    });

    const handleBet = (dogId: number, amount: number) => {
        setMyBet({ dogId, amount });
        dispatch({ type: 'BET_GREYHOUND', payload: { pId: currentPlayer.id, amount } });
        startRace();
    };

    if (!state.showGreyhounds) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono">
            <div className="w-full max-w-5xl bg-slate-900 border-4 border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-950 p-4 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
                    <div className="text-yellow-400 font-bold text-xl animate-pulse">📢 {commentary}</div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase">Tu Saldo</div>
                        <div className="text-2xl font-black text-green-500">{formatMoney(currentPlayer.money)}</div>
                    </div>
                </div>

                <GreyhoundTrack dogs={dogs} phase={phase} />

                {phase === 'betting' && (
                    <GreyhoundBetting dogs={dogs} player={currentPlayer} onBetPlaced={handleBet} />
                )}

                {phase === 'results' && (
                    <div className="bg-slate-800 p-6 border-t border-slate-700 flex justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-2xl font-black text-white">
                                {myBet && dogs.find(d => d.id === myBet.dogId)?.rank === 1 ? '¡HAS GANADO!' : '¡MALA SUERTE!'}
                            </div>
                            <button 
                                onClick={() => dispatch({type: 'CLOSE_GREYHOUNDS'})} 
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-12 rounded-full border border-slate-500 shadow-lg"
                            >
                                Cerrar Canódromo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
