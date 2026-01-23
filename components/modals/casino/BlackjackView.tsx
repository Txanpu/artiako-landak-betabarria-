
import React, { useState, useEffect } from 'react';
import { GameState, Card } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';
import { CardView, Chip } from './CasinoComponents'; // Using Chip from components
import { useBlackjackAnimation } from '../../../hooks/useBlackjackAnimation';

export const BlackjackView: React.FC<{state: GameState, dispatch: any, player: any, ownerName: string}> = ({state, dispatch, player, ownerName}) => {
    const bjState = state.blackjackState;
    const [betAmount, setBetAmount] = useState(0);
    const [selectedChip, setSelectedChip] = useState(50);

    // Animation Hook
    useBlackjackAnimation(state, dispatch);

    // Calculate Scores Helper
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

    // Actions
    const addChip = () => {
        if (player.money >= betAmount + selectedChip) {
            setBetAmount(prev => prev + selectedChip);
        }
    };

    const clearBet = () => setBetAmount(0);

    const deal = () => {
        if (state.casinoPlays >= 3) return;
        if (betAmount <= 0) return;
        dispatch({ type: 'START_BLACKJACK', payload: { bet: betAmount } });
    };

    // Render Logic
    const isPlaying = !!bjState;
    const pScore = isPlaying ? calcScore(bjState!.playerHand) : 0;
    const dScore = isPlaying ? calcScore(bjState!.dealerHand) : 0;
    const phase = bjState?.phase || 'betting';

    // Limit check
    const playsLeft = 3 - state.casinoPlays;

    return (
        <div className="w-full max-w-5xl h-[600px] bg-[#0f2015] rounded-3xl border-[12px] border-[#5c4033] shadow-2xl relative overflow-hidden flex flex-col font-sans select-none">
            
            {/* --- FELT TEXTURE & DECORATION --- */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 50% -20%, #1a4d2e 0%, #0f2015 70%)'}}></div>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center opacity-30 pointer-events-none">
                <div className="text-yellow-500 font-serif font-black text-4xl tracking-widest">ROYAL BLACKJACK</div>
                <div className="text-yellow-600 text-xs tracking-[0.5em] uppercase mt-1">PAYS 3 TO 2 • DEALER MUST STAND ON 17</div>
            </div>

            {/* --- HUD HEADER --- */}
            <div className="relative z-20 flex justify-between items-start p-6">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 border border-yellow-600/30 flex flex-col min-w-[120px]">
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Croupier</span>
                    <span className="text-white font-bold text-sm truncate max-w-[150px]">{ownerName}</span>
                </div>
                
                <div className="flex flex-col items-end">
                    <button onClick={() => dispatch({type: 'CLOSE_CASINO'})} className="bg-red-900/80 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full border border-red-500 transition-colors mb-2">
                        SALIR
                    </button>
                    <div className="text-yellow-500/50 text-[10px] font-bold uppercase">Jugadas: {playsLeft}/3</div>
                </div>
            </div>

            {/* --- GAME AREA --- */}
            <div className="flex-1 relative z-10 flex flex-col justify-between pb-8">
                
                {/* 1. DEALER CARDS */}
                <div className="flex flex-col items-center justify-center h-32 relative">
                    {isPlaying ? (
                        <div className="flex gap-[-40px]">
                            {bjState!.dealerHand.map((c, i) => (
                                <div key={i} className="transform transition-transform hover:-translate-y-2 relative" style={{marginLeft: i > 0 ? '-40px' : '0'}}>
                                    <CardView card={c} index={i} />
                                </div>
                            ))}
                            {/* Score Bubble */}
                            <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-black/60 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full border border-white/20">
                                {phase === 'playing' ? '?' : dScore}
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-white/10 rounded-lg w-24 h-36 flex items-center justify-center">
                            <span className="text-white/20 font-bold">DEALER</span>
                        </div>
                    )}
                </div>

                {/* 2. CENTER MESSAGE / BETTING ZONE */}
                <div className="flex justify-center items-center h-20">
                    {phase === 'result' ? (
                        <div className="bg-black/80 backdrop-blur border-2 border-yellow-500 px-8 py-4 rounded-xl text-center animate-in zoom-in">
                            <div className="text-2xl font-black text-white mb-1 uppercase tracking-wider">{bjState!.resultMsg}</div>
                            {bjState!.payout > 0 && <div className="text-3xl text-yellow-400 font-black drop-shadow-md">+{formatMoney(bjState!.payout)}</div>}
                            <div className="flex gap-2 justify-center mt-3">
                                <button 
                                    onClick={() => { setBetAmount(0); dispatch({type:'CLOSE_CASINO'}); setTimeout(()=>dispatch({type:'PLAY_CASINO', payload:{game:'blackjack'}}), 50); }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-full shadow-lg"
                                >
                                    Jugar de Nuevo
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Betting Circle / Pot Display
                        <div 
                            onClick={!isPlaying ? addChip : undefined}
                            className={`w-40 h-40 rounded-full border-4 ${isPlaying ? 'border-yellow-600 bg-black/20' : 'border-white/20 hover:border-yellow-400/50 hover:bg-white/5 cursor-pointer'} flex flex-col items-center justify-center transition-all relative group`}
                        >
                            <span className="text-[10px] text-yellow-500/60 font-bold uppercase tracking-widest mb-1">Apuesta</span>
                            <span className="text-3xl font-mono text-white font-black drop-shadow-md">
                                {formatMoney(isPlaying ? bjState!.bet : betAmount)}
                            </span>
                            {!isPlaying && (
                                <span className="text-[9px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click para añadir ficha</span>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. PLAYER CARDS */}
                <div className="flex flex-col items-center justify-center h-32 relative mb-4">
                    {isPlaying && (
                        <div className="flex gap-[-40px]">
                            {bjState!.playerHand.map((c, i) => (
                                <div key={i} className="transform transition-transform hover:-translate-y-2 relative" style={{marginLeft: i > 0 ? '-40px' : '0'}}>
                                    <CardView card={c} index={i} />
                                </div>
                            ))}
                            <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-yellow-600 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full border border-white/20 shadow-lg">
                                {pScore}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. CONTROLS BAR */}
                <div className="px-8 flex justify-between items-end">
                    
                    {/* LEFT: Player Money */}
                    <div className="bg-black/60 rounded-xl p-3 border border-emerald-500/30 flex flex-col min-w-[140px]">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Tu Saldo</span>
                        <span className="text-2xl font-mono text-white font-black">{formatMoney(player.money)}</span>
                    </div>

                    {/* CENTER: Actions */}
                    <div className="flex gap-4">
                        {!isPlaying ? (
                            // BETTING CONTROLS
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-2 bg-black/40 p-2 rounded-full border border-white/10">
                                    {[10, 50, 100, 500].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => setSelectedChip(val)}
                                            className={`relative transition-transform hover:-translate-y-1 ${selectedChip === val ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'opacity-80 hover:opacity-100'}`}
                                        >
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-dashed flex items-center justify-center font-black text-xs shadow-xl
                                                ${val === 10 ? 'bg-white border-gray-300 text-black' : 
                                                  val === 50 ? 'bg-red-600 border-red-400 text-white' : 
                                                  val === 100 ? 'bg-blue-600 border-blue-400 text-white' : 
                                                  'bg-black border-yellow-500 text-yellow-500'}
                                            `}>
                                                {val}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={clearBet} disabled={betAmount === 0} className="px-6 py-2 rounded-full bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 disabled:opacity-50 text-sm">LIMPIAR</button>
                                    <button onClick={deal} disabled={betAmount === 0 || playsLeft <= 0} className="px-10 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50 disabled:grayscale text-lg">
                                        REPARTIR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // PLAYING CONTROLS
                            phase === 'playing' ? (
                                <div className="flex gap-4 items-center">
                                    <button onClick={() => dispatch({type: 'HIT_BLACKJACK'})} className="bg-green-600 hover:bg-green-500 text-white w-24 h-24 rounded-full border-4 border-green-800 shadow-xl font-black text-lg active:scale-95 transition-all flex flex-col justify-center items-center leading-none gap-1">
                                        <span>PEDIR</span>
                                        <span className="text-2xl">+</span>
                                    </button>
                                    
                                    {bjState!.playerHand.length === 2 && player.money >= bjState!.bet && (
                                        <button onClick={() => dispatch({type: 'DOUBLE_DOWN_BLACKJACK'})} className="bg-yellow-600 hover:bg-yellow-500 text-white w-20 h-20 rounded-full border-4 border-yellow-800 shadow-xl font-black text-xs active:scale-95 transition-all flex flex-col justify-center items-center leading-none gap-1">
                                            <span>DOBLAR</span>
                                            <span className="text-xl">x2</span>
                                        </button>
                                    )}

                                    <button onClick={() => dispatch({type: 'STAND_BLACKJACK'})} className="bg-red-600 hover:bg-red-500 text-white w-24 h-24 rounded-full border-4 border-red-800 shadow-xl font-black text-lg active:scale-95 transition-all flex flex-col justify-center items-center leading-none gap-1">
                                        <span>PLANTAR</span>
                                        <span className="text-2xl">✋</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="h-24 flex items-center text-white/50 italic font-bold">Esperando resultado...</div>
                            )
                        )}
                    </div>

                    {/* RIGHT: Spacer to balance layout */}
                    <div className="min-w-[140px]"></div>
                </div>
            </div>
        </div>
    );
};
