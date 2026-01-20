
import React, { useState, useEffect } from 'react';
import { GameState } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';
import { Chip } from './CasinoComponents';

const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export const RouletteView: React.FC<{state: GameState, dispatch: any, player: any, ownerName: string}> = ({state, dispatch, player, ownerName}) => {
    const [phase, setPhase] = useState<'betting' | 'spinning' | 'result'>('betting');
    const [bets, setBets] = useState<Record<string, number>>({});
    const [selectedChip, setSelectedChip] = useState(10);
    const [rotation, setRotation] = useState(0);
    const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

    const currentTotalBet: number = (Object.values(bets) as number[]).reduce((a: number, b: number) => a + b, 0);

    useEffect(() => {
        if (state.rouletteState && phase === 'betting') {
            const winNum = state.rouletteState.winningNumber;
            spinWheel(winNum);
        }
    }, [state.rouletteState, phase]);

    const handlePlaceBet = (key: string) => {
        if (phase !== 'betting') return;
        if (state.casinoPlays >= 3) return;
        if (player.money < currentTotalBet + selectedChip) return;
        setBets(prev => ({ ...prev, [key]: (prev[key] || 0) + selectedChip }));
    };

    const handleSpin = () => {
        if (currentTotalBet === 0 || state.casinoPlays >= 3) return;
        dispatch({ type: 'SPIN_ROULETTE', payload: { bets } });
    };

    const spinWheel = (winningNumber: number) => {
        setPhase('spinning');
        const index = WHEEL_NUMBERS.indexOf(winningNumber);
        const segmentAngle = 360 / 37;
        const targetRotation = 360 * 5 + (index * segmentAngle);
        setRotation(prev => prev + targetRotation);

        setTimeout(() => {
            setPhase('result');
            if (state.rouletteState) {
                const win = state.rouletteState.totalWinnings as number;
                if (win > 0) setPayoutMsg(`¡GANAS ${formatMoney(win)}!`);
                else setPayoutMsg(`Pierdes ${formatMoney(currentTotalBet)}`);
            }
        }, 4000);
    };

    const resetGame = () => {
        setBets({});
        setPayoutMsg(null);
        setPhase('betting');
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl items-center justify-center h-full max-h-screen">
            <div className="flex flex-col items-center justify-center relative scale-75 md:scale-100">
                <div className="absolute top-0 z-20 bg-yellow-400 w-4 h-8 rounded-b-full shadow-lg border-2 border-yellow-600"></div>
                <div 
                    className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-[12px] border-[#4a2c20] shadow-2xl relative overflow-hidden transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
                    style={{ 
                        transform: `rotate(-${rotation}deg)`,
                        transitionDuration: phase === 'spinning' ? '4000ms' : '0ms',
                        background: 'conic-gradient(#065f46 0deg 9.7deg, #dc2626 9.7deg 19.4deg, #111827 19.4deg 29.1deg, #dc2626 29.1deg 38.8deg, #111827 38.8deg 48.5deg, #dc2626 48.5deg 58.2deg, #111827 58.2deg 67.9deg, #dc2626 67.9deg 77.6deg, #111827 77.6deg 87.3deg, #dc2626 87.3deg 97deg, #111827 97deg 106.7deg, #111827 106.7deg 116.4deg, #dc2626 116.4deg 126.1deg, #111827 126.1deg 135.8deg, #dc2626 135.8deg 145.5deg, #111827 145.5deg 155.2deg, #dc2626 155.2deg 164.9deg, #111827 164.9deg 174.6deg, #dc2626 174.6deg 184.3deg, #dc2626 184.3deg 194deg, #111827 194deg 203.7deg, #dc2626 203.7deg 213.4deg, #111827 213.4deg 223.1deg, #dc2626 223.1deg 232.8deg, #111827 232.8deg 242.5deg, #dc2626 242.5deg 252.2deg, #111827 252.2deg 261.9deg, #dc2626 261.9deg 271.6deg, #111827 271.6deg 281.3deg, #dc2626 281.3deg 291deg, #111827 291deg 300.7deg, #dc2626 300.7deg 310.4deg, #111827 310.4deg 320.1deg, #dc2626 320.1deg 329.8deg, #111827 329.8deg 339.5deg, #dc2626 339.5deg 349.2deg, #111827 349.2deg 360deg)'
                    }}
                >
                    {WHEEL_NUMBERS.map((num, i) => (
                        <div key={i} className="absolute top-0 left-1/2 -ml-[10px] h-1/2 w-[20px] text-center pt-2 text-white font-bold text-[10px] origin-bottom" style={{ transform: `rotate(${i * (360/37)}deg)` }}>{num}</div>
                    ))}
                    <div className="absolute inset-[25%] rounded-full bg-[#4a2c20] border-4 border-[#d4af37] flex items-center justify-center">
                        <div className="text-[#d4af37] font-serif text-2xl font-bold">ARTIA</div>
                    </div>
                </div>
                <div className="mt-4 flex gap-1">
                    {state.rouletteState?.history.map((n, i) => (
                        <div key={i} className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-bold ${n===0?'bg-green-600':(REDS.has(n)?'bg-red-600':'bg-black')} text-white`}>{n}</div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-green-800 p-4 rounded-xl border-[8px] border-[#5c4033] shadow-2xl relative max-w-lg">
                <div className="flex justify-between items-center mb-4 text-white">
                    <div className="font-bold text-xl">Tu Dinero: {formatMoney(player.money - currentTotalBet)}</div>
                    <div className="text-right">
                        <div className="text-xs opacity-70">Apuesta Total</div>
                        <div className="font-mono text-yellow-400 font-bold text-xl">{formatMoney(currentTotalBet)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-[40px_1fr] gap-1 select-none">
                    <div onClick={() => handlePlaceBet('0')} className="bg-green-600 hover:brightness-110 flex items-center justify-center rounded-l cursor-pointer border border-green-400 text-white font-bold relative group">0 {bets['0'] > 0 && <Chip val={bets['0']} />}</div>
                    <div className="grid grid-cols-3 gap-1">
                        {Array.from({length: 36}, (_, i) => i + 1).map(n => (
                            <div key={n} onClick={() => handlePlaceBet(n.toString())} className={`${REDS.has(n) ? 'bg-red-600' : 'bg-black'} hover:brightness-125 h-10 flex items-center justify-center text-white font-bold border border-white/20 cursor-pointer relative`}>
                                {n} {bets[n.toString()] > 0 && <Chip val={bets[n.toString()]} />}
                            </div>
                        ))}
                    </div>
                    <div></div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                        <div onClick={() => handlePlaceBet('red')} className="bg-red-600 h-12 flex items-center justify-center text-white font-bold border border-white/20 cursor-pointer hover:brightness-110 relative">ROJO {bets['red'] > 0 && <Chip val={bets['red']} />}</div>
                        <div onClick={() => handlePlaceBet('black')} className="bg-black h-12 flex items-center justify-center text-white font-bold border border-white/20 cursor-pointer hover:brightness-110 relative">NEGRO {bets['black'] > 0 && <Chip val={bets['black']} />}</div>
                        <div onClick={() => handlePlaceBet('even')} className="bg-green-700 h-10 flex items-center justify-center text-white font-bold border border-white/20 cursor-pointer hover:brightness-110 relative">PAR {bets['even'] > 0 && <Chip val={bets['even']} />}</div>
                        <div onClick={() => handlePlaceBet('odd')} className="bg-green-700 h-10 flex items-center justify-center text-white font-bold border border-white/20 cursor-pointer hover:brightness-110 relative">IMPAR {bets['odd'] > 0 && <Chip val={bets['odd']} />}</div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    {[10, 50, 100, 500].map(val => (
                        <button key={val} onClick={() => setSelectedChip(val)} className={`w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center font-bold text-xs transition-transform ${selectedChip === val ? 'scale-125 border-yellow-400 z-10' : 'border-dashed border-white/50 opacity-80 hover:scale-110 hover:opacity-100'} ${val === 10 ? 'bg-white text-black' : val === 50 ? 'bg-blue-600 text-white' : val === 100 ? 'bg-black text-white' : 'bg-purple-600 text-white'}`}>{val}</button>
                    ))}
                </div>

                <div className="flex gap-2 mt-6">
                    {phase === 'betting' ? (
                        <>
                            <button onClick={() => setBets({})} className="px-4 py-2 bg-red-800 text-red-200 rounded hover:bg-red-700">Borrar</button>
                            <button onClick={handleSpin} disabled={currentTotalBet === 0} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl py-3 rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">GIRAR</button>
                        </>
                    ) : (
                        <div className="w-full text-center">
                            {phase === 'spinning' && <div className="text-yellow-400 font-bold animate-pulse text-xl">¡No va más!</div>}
                            {phase === 'result' && (
                                <div className="animate-in zoom-in duration-300">
                                    <div className="text-white text-lg mb-1">Resultado: <span className="font-bold text-2xl">{state.rouletteState?.winningNumber}</span></div>
                                    <div className="text-3xl font-black text-yellow-400 mb-4">{payoutMsg}</div>
                                    <div className="flex gap-2">
                                        <button onClick={resetGame} disabled={state.casinoPlays >= 3} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">Reintentar</button>
                                        <button onClick={() => dispatch({type: 'CLOSE_CASINO'})} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded">Salir</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
