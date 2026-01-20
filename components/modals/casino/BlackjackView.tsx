
import React, { useState, useEffect } from 'react';
import { GameState, Card } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';
import { CardView } from './CasinoComponents';

export const BlackjackView: React.FC<{state: GameState, dispatch: any, player: any, ownerName: string}> = ({state, dispatch, player, ownerName}) => {
    const [bet, setBet] = useState(100);
    const bjState = state.blackjackState;
    const dealerPhase = bjState?.phase === 'dealer';

    // Dealer Animation Loop
    useEffect(() => {
        if (dealerPhase) {
            const timer = setTimeout(() => {
                dispatch({ type: 'DEALER_STEP_BLACKJACK' });
            }, 1000); // 1 second per dealer card
            return () => clearTimeout(timer);
        }
    }, [dealerPhase, bjState?.dealerHand.length, dispatch]);

    const playStart = () => {
        if (state.casinoPlays >= 3) return;
        dispatch({ type: 'START_BLACKJACK', payload: { bet } });
    };

    if (!bjState) {
        // Betting Phase
        return (
            <div className="bg-green-800 p-8 rounded-xl border-[8px] border-[#5c4033] shadow-2xl w-full max-w-2xl flex flex-col items-center gap-6">
                <h2 className="text-4xl font-black text-white drop-shadow-md tracking-wider">BLACKJACK</h2>
                <div className="text-center">
                    <p className="text-green-200 mb-2 font-bold">TU DINERO: {formatMoney(player.money)}</p>
                    <div className="text-white text-lg">Apuesta: <span className="text-yellow-400 font-bold text-3xl">${bet}</span></div>
                    <input type="range" min="50" max={Math.min(player.money, 5000)} step="50" value={bet} onChange={e=>setBet(parseInt(e.target.value))} className="w-64 mt-4 accent-yellow-400 h-2 rounded-lg cursor-pointer" />
                </div>
                <div className="flex gap-4">
                    <button onClick={() => dispatch({type:'CLOSE_CASINO'})} className="px-6 py-3 bg-red-900 text-white rounded font-bold hover:bg-red-800">Salir</button>
                    <button 
                        onClick={playStart} 
                        disabled={state.casinoPlays >= 3 || player.money < bet}
                        className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                    >
                        REPARTIR
                    </button>
                </div>
                {state.casinoPlays >= 3 && <div className="text-red-400 font-bold">Límite de jugadas alcanzado.</div>}
            </div>
        );
    }

    const calcScore = (hand: Card[]) => {
        let sc = 0;
        let ac = 0;
        hand.forEach(c => {
             if(c.isHidden) return;
             sc += c.value;
             if(c.rank === 'A') ac++;
        });
        while(sc > 21 && ac > 0) { sc -= 10; ac--; }
        return sc;
    };

    const pScore = calcScore(bjState.playerHand);
    const dScore = calcScore(bjState.dealerHand);

    return (
        <div className="bg-green-800 p-4 md:p-8 rounded-xl border-[8px] border-[#5c4033] shadow-2xl w-full max-w-4xl min-h-[500px] flex flex-col justify-between relative">
            {/* Dealer Area */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-green-200 font-bold uppercase text-xs tracking-widest">Dealer ({ownerName})</div>
                <div className="flex gap-[-20px] justify-center h-32 items-center">
                    {bjState.dealerHand.map((c, i) => <CardView key={i} card={c} index={i} />)}
                </div>
                <div className="bg-black/30 px-3 py-1 rounded-full text-white font-bold font-mono">{bjState.phase === 'playing' ? '?' : dScore}</div>
            </div>

            {/* Center Info / Result */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {bjState.phase === 'result' && (
                    <div className="bg-black/80 backdrop-blur-sm p-6 rounded-2xl text-center animate-in zoom-in z-50 pointer-events-auto border-2 border-yellow-500">
                        <div className="text-2xl font-black text-white mb-2">{bjState.resultMsg}</div>
                        {bjState.payout > 0 && <div className="text-3xl text-yellow-400 font-bold mb-4">+{formatMoney(bjState.payout)}</div>}
                        <div className="flex gap-2 justify-center">
                             <button onClick={() => dispatch({type: 'CLOSE_CASINO'})} className="bg-gray-700 px-4 py-2 rounded text-white font-bold hover:bg-gray-600">Salir</button>
                             <button 
                                onClick={() => { setBet(100); dispatch({type:'CLOSE_CASINO'}); setTimeout(()=>dispatch({type:'PLAY_CASINO', payload:{game:'blackjack'}}), 50); }}
                                disabled={state.casinoPlays >= 3}
                                className="bg-blue-600 px-4 py-2 rounded text-white font-bold hover:bg-blue-500 disabled:opacity-50"
                             >
                                Jugar de nuevo
                             </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Player Area */}
            <div className="flex flex-col items-center gap-4">
                <div className="bg-black/30 px-3 py-1 rounded-full text-white font-bold font-mono">{pScore}</div>
                <div className="flex gap-[-20px] justify-center h-32 items-center">
                     {bjState.playerHand.map((c, i) => <CardView key={i} card={c} index={i} />)}
                </div>
                
                {/* Controls */}
                <div className="flex gap-4 z-20">
                    {bjState.phase === 'playing' ? (
                        <>
                            <button onClick={() => dispatch({type: 'HIT_BLACKJACK'})} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border-b-4 border-blue-800 active:scale-95 transition-all">PEDIR</button>
                            <button onClick={() => dispatch({type: 'STAND_BLACKJACK'})} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border-b-4 border-yellow-800 active:scale-95 transition-all">PLANTARSE</button>
                        </>
                    ) : (
                        <div className="h-12"></div> // Spacer
                    )}
                </div>
                 <div className="text-green-200 font-bold uppercase text-xs tracking-widest mt-2">{player.name}</div>
            </div>
        </div>
    );
};
