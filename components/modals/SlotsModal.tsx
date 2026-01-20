
import React, { useState, useEffect } from 'react';
import { GameState } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

interface SlotsModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

// Visual mapping
const SYMBOLS = ['🍒', '🍋', '🍇', '🍉', '🔔', '💎', '7️⃣'];

export const SlotsModal: React.FC<SlotsModalProps> = ({ state, dispatch }) => {
    const [spinning, setSpinning] = useState(false);
    const [bet, setBet] = useState(50);
    
    // Internal visual state for reels to allow animation before showing real result
    const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);

    const player = state.players[state.currentPlayerIndex];
    const spinsLeft = 3 - state.casinoPlays;

    // Effect to handle the result from reducer
    useEffect(() => {
        if (state.slotsData && spinning) {
            // Wait for visual animation
            const timer = setTimeout(() => {
                setReels([state.slotsData!.r1, state.slotsData!.r2, state.slotsData!.r3]);
                setSpinning(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.slotsData]);

    if (!state.showSlotsModal) return null;

    const handleSpin = () => {
        if (spinsLeft <= 0 || player.money < bet || spinning) return;
        setSpinning(true);
        // Start animation loop in UI
        const interval = setInterval(() => {
            setReels([
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            ]);
        }, 100);

        // Dispatch logic (Result will come back in props)
        // We delay dispatch slightly so the interval above starts first
        setTimeout(() => {
            clearInterval(interval); // Stop random flutter
            dispatch({ type: 'SPIN_SLOTS', payload: { bet } });
        }, 2000); // 2s of spin time
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="relative bg-gradient-to-b from-purple-900 to-black p-1 rounded-3xl shadow-[0_0_100px_rgba(216,180,254,0.3)] border-4 border-yellow-500 w-full max-w-lg overflow-hidden flex flex-col items-center">
                
                {/* Lights Top */}
                <div className="flex gap-2 mb-2 w-full justify-center pt-2">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${spinning ? 'animate-ping bg-yellow-300' : 'bg-yellow-600'}`}></div>
                    ))}
                </div>

                <div className="bg-black/50 w-full text-center py-2 border-y border-yellow-600 mb-4">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm tracking-tighter" style={{fontFamily: 'Impact'}}>
                        SUPER SLOTS ESTADO
                    </h2>
                    <div className="text-[10px] text-yellow-200 tracking-widest uppercase">Propiedad del Gobierno de Artia</div>
                </div>

                {/* Machine Body */}
                <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-xl border-[6px] border-gray-600 shadow-inner flex flex-col items-center gap-6 relative w-[90%]">
                    
                    {/* Screen */}
                    <div className="flex gap-2 bg-white p-2 rounded border-4 border-gray-900 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        {reels.map((symbol, i) => (
                            <div key={i} className="w-20 h-28 bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center text-5xl border-x-2 border-gray-400 overflow-hidden relative">
                                <div className={`transition-transform duration-100 ${spinning ? 'blur-sm scale-110' : ''}`}>
                                    {symbol}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>

                    {/* Info Display */}
                    <div className="bg-black border-2 border-yellow-600 px-4 py-2 rounded text-center w-full min-h-[60px] flex flex-col justify-center">
                        {spinning ? (
                            <span className="text-yellow-400 font-bold animate-pulse">GIRANDO...</span>
                        ) : state.slotsData ? (
                            <>
                                <span className={`text-lg font-bold ${state.slotsData.win ? 'text-green-400' : 'text-gray-400'}`}>
                                    {state.slotsData.msg}
                                </span>
                                {state.slotsData.win && <span className="text-yellow-300 text-xl font-black">+${state.slotsData.payout}</span>}
                            </>
                        ) : (
                            <span className="text-gray-500 text-xs">¡Prueba tu suerte! (3 tiradas máx)</span>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="w-full flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="text-xs">
                            <div className="text-gray-400">APUESTA</div>
                            <select 
                                value={bet} 
                                onChange={e => setBet(Number(e.target.value))} 
                                disabled={spinning}
                                className="bg-black text-yellow-500 border border-yellow-700 rounded px-2 py-1 font-bold outline-none"
                            >
                                <option value={10}>$10</option>
                                <option value={50}>$50</option>
                                <option value={100}>$100</option>
                                <option value={500}>$500</option>
                            </select>
                        </div>

                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Tiradas</div>
                            <div className="text-xl font-mono text-white">{spinsLeft}/3</div>
                        </div>

                        <button 
                            onClick={handleSpin} 
                            disabled={spinning || spinsLeft <= 0 || player.money < bet}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full border-b-4 border-red-900 active:scale-95 transition-all shadow-[0_0_15px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:grayscale"
                        >
                            SPIN
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={() => dispatch({type: 'CLOSE_SLOTS'})} className="mt-6 text-gray-500 hover:text-white text-xs underline">
                    Salir del Casino
                </button>

                {/* State Money Tag */}
                <div className="absolute top-2 left-2 bg-yellow-900/80 text-yellow-200 px-2 py-1 rounded border border-yellow-600 text-[10px] font-bold">
                    Fondos Estado: {formatMoney(state.estadoMoney)}
                </div>
            </div>
        </div>
    );
};
