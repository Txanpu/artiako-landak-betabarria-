
import React, { useState, useMemo } from 'react';
import { GameState } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';
import { Chip } from './CasinoComponents';
import { useRouletteAnimation, WHEEL_NUMBERS } from '../../../hooks/useRouletteAnimation';

const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export const RouletteView: React.FC<{state: GameState, dispatch: any, player: any, ownerName: string}> = ({state, dispatch, player, ownerName}) => {
    const [bets, setBets] = useState<Record<string, number>>({});
    const [selectedChip, setSelectedChip] = useState(10);
    
    // Hook handles phase resetting automatically based on state.rouletteState
    const { phase, rotation } = useRouletteAnimation(state);

    const currentTotalBet: number = (Object.values(bets) as number[]).reduce((a: number, b: number) => a + b, 0);

    const addBet = (key: string) => {
        if (phase !== 'betting') return;
        if (state.casinoPlays >= 3) return;
        if (player.money < currentTotalBet + selectedChip) return;
        setBets(prev => ({ ...prev, [key]: (prev[key] || 0) + selectedChip }));
    };

    const clearBets = () => setBets({});

    const spin = () => {
        if (currentTotalBet === 0 || state.casinoPlays >= 3) return;
        dispatch({ type: 'SPIN_ROULETTE', payload: { bets } });
    };

    const playAgain = () => {
        setBets({});
        dispatch({ type: 'RESET_ROULETTE_STATE' });
    };

    const handleClose = () => {
        setBets({}); // Limpiar apuestas locales por si acaso
        dispatch({ type: 'CLOSE_CASINO' });
    };

    // --- SVG WHEEL GENERATION ---
    const wheelSVG = useMemo(() => {
        const radius = 150;
        const center = 150;
        const sliceAngle = 360 / 37;
        const degToRad = (deg: number) => (deg - 90) * (Math.PI / 180); // -90 to start at 12 o'clock

        return (
            <svg viewBox="0 0 300 300" className="w-full h-full transform transition-transform" style={{ transform: `rotate(0deg)` }}>
                {WHEEL_NUMBERS.map((num, i) => {
                    const startAngle = i * sliceAngle;
                    const endAngle = (i + 1) * sliceAngle;
                    
                    // Coordinates for Slice
                    const x1 = center + radius * Math.cos(degToRad(startAngle));
                    const y1 = center + radius * Math.sin(degToRad(startAngle));
                    const x2 = center + radius * Math.cos(degToRad(endAngle));
                    const y2 = center + radius * Math.sin(degToRad(endAngle));

                    // Color
                    let fill = '#111827'; // Black
                    if (num === 0) fill = '#059669'; // Green
                    else if (REDS.has(num)) fill = '#dc2626'; // Red

                    // Text Position (Midpoint, slightly inwards)
                    const midAngle = startAngle + sliceAngle / 2;
                    const textRadius = radius * 0.85;
                    const tx = center + textRadius * Math.cos(degToRad(midAngle));
                    const ty = center + textRadius * Math.sin(degToRad(midAngle));

                    // Rotation for text (to face center)
                    const textRot = midAngle;

                    return (
                        <g key={num}>
                            <path 
                                d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`} 
                                fill={fill} 
                                stroke="#1f2937" 
                                strokeWidth="1"
                            />
                            <text 
                                x={tx} 
                                y={ty} 
                                fill="white" 
                                fontSize="10" 
                                fontWeight="bold" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                transform={`rotate(${textRot + 90}, ${tx}, ${ty})`}
                            >
                                {num}
                            </text>
                        </g>
                    );
                })}
                {/* Center Cap */}
                <circle cx="150" cy="150" r="50" fill="#3d2216" stroke="#d4af37" strokeWidth="4" />
                <text x="150" y="150" fill="#d4af37" textAnchor="middle" dominantBaseline="middle" fontWeight="bold" fontSize="24" fontFamily="serif">ARTIA</text>
            </svg>
        );
    }, []);

    const renderCell = (label: string | number, key: string, colorClass: string, spanClass: string = '') => {
        const betAmount = bets[key];
        return (
            <div 
                onClick={() => addBet(key)}
                className={`${colorClass} ${spanClass} relative flex items-center justify-center border border-white/20 cursor-pointer hover:brightness-125 select-none transition-all active:scale-95 text-white font-bold text-xs sm:text-sm shadow-inner`}
            >
                {label}
                {betAmount > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <Chip val={betAmount} />
                    </div>
                )}
            </div>
        );
    };

    const getResultMsg = () => {
        if (!state.rouletteState) return '';
        const win = state.rouletteState.totalWinnings;
        const num = state.rouletteState.winningNumber;
        const color = num === 0 ? 'text-green-500' : (REDS.has(num) ? 'text-red-500' : 'text-slate-300');
        
        return (
            <div className="text-center animate-in zoom-in duration-300">
                <div className={`text-6xl font-black ${color} drop-shadow-lg mb-2`}>{num}</div>
                {win > 0 ? (
                    <div className="text-3xl font-bold text-yellow-400">¡GANAS {formatMoney(win)}!</div>
                ) : (
                    <div className="text-xl font-bold text-gray-400">Pierdes {formatMoney(currentTotalBet)}</div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 lg:flex-row lg:gap-8 bg-[#0f2015] text-white relative">
            
            {/* CLOSE BUTTON (TOP RIGHT) */}
            <button 
                onClick={handleClose} 
                className="absolute top-4 right-4 z-50 bg-red-900/80 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-red-500 shadow-lg font-bold text-xl active:scale-95 transition-all"
                title="Salir de la Ruleta"
                disabled={phase === 'spinning'}
            >
                ✕
            </button>

            {/* LEFT: WHEEL & INFO */}
            <div className="flex flex-col items-center gap-4 scale-75 lg:scale-100">
                <div className="relative">
                    {/* Marker (Fixed at Top) */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 w-8 h-10 bg-yellow-500 shadow-xl border-2 border-yellow-200" style={{clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'}}></div>
                    
                    {/* Wheel Container */}
                    <div 
                        className="w-[300px] h-[300px] rounded-full border-[10px] border-[#4a2c20] shadow-2xl relative overflow-hidden"
                        style={{ 
                            transform: `rotate(-${rotation}deg)`,
                            transition: phase === 'spinning' ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                        }}
                    >
                        {wheelSVG}
                    </div>
                </div>

                {/* History */}
                <div className="flex gap-1 bg-black/40 p-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-gray-400 mr-2 self-center font-bold tracking-wider">HISTORIAL</span>
                    {state.rouletteState?.history.slice(0, 8).map((n, i) => (
                        <div key={i} className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black shadow-lg ${n===0?'bg-green-600':(REDS.has(n)?'bg-red-600':'bg-slate-900')} border border-white/20`}>
                            {n}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: BETTING TABLE */}
            <div className="flex flex-col items-center bg-green-800 p-4 lg:p-6 rounded-xl border-[8px] border-[#4a2c20] shadow-2xl relative w-full max-w-2xl">
                
                <div className="w-full flex justify-between items-end mb-4 border-b border-green-700 pb-2">
                    <div>
                        <div className="text-[10px] uppercase text-green-300 font-bold tracking-widest">Tu Dinero</div>
                        <div className="text-2xl font-mono text-white font-bold">{formatMoney(player.money - currentTotalBet)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase text-yellow-300 font-bold tracking-widest">Apuesta Total</div>
                        <div className="text-xl font-mono text-yellow-400 font-bold">{formatMoney(currentTotalBet)}</div>
                    </div>
                </div>

                {phase !== 'result' ? (
                    <div className="grid grid-cols-[40px_repeat(3,1fr)] gap-1 w-full max-w-lg select-none">
                        <div className="row-span-13 grid grid-rows-1">
                             {renderCell(0, '0', 'bg-green-600 rounded-l-md border-r-2 border-white/20', 'h-full flex items-center justify-center text-lg')}
                        </div>
                        <div className="col-span-3 grid grid-cols-3 gap-1">
                            {Array.from({length: 36}, (_, i) => i + 1).map(n => {
                                const isRed = REDS.has(n);
                                return renderCell(n, n.toString(), isRed ? 'bg-red-600' : 'bg-slate-900', 'h-10 text-lg shadow-sm');
                            })}
                        </div>
                        <div className="col-span-4 ml-[40px] grid grid-cols-3 gap-1 mt-1">
                            {renderCell('2:1', 'col1', 'bg-transparent border border-white/30 text-[10px] hover:bg-white/10', 'h-8')}
                            {renderCell('2:1', 'col2', 'bg-transparent border border-white/30 text-[10px] hover:bg-white/10', 'h-8')}
                            {renderCell('2:1', 'col3', 'bg-transparent border border-white/30 text-[10px] hover:bg-white/10', 'h-8')}
                        </div>
                        <div className="col-span-4 ml-[40px] grid grid-cols-3 gap-1 mt-1">
                            {renderCell('1ra 12', '1st12', 'bg-green-900 border border-green-600 hover:bg-green-700', 'h-10 uppercase text-[10px] tracking-wide')}
                            {renderCell('2da 12', '2nd12', 'bg-green-900 border border-green-600 hover:bg-green-700', 'h-10 uppercase text-[10px] tracking-wide')}
                            {renderCell('3ra 12', '3rd12', 'bg-green-900 border border-green-600 hover:bg-green-700', 'h-10 uppercase text-[10px] tracking-wide')}
                        </div>
                        <div className="col-span-4 ml-[40px] grid grid-cols-6 gap-1 mt-1 text-[10px] sm:text-xs">
                            {renderCell('1-18', '1-18', 'bg-green-900 border border-green-600 col-span-1', 'h-12')}
                            {renderCell('PAR', 'even', 'bg-green-900 border border-green-600 col-span-1', 'h-12')}
                            {renderCell('', 'red', 'bg-red-600 col-span-1 flex items-center justify-center', 'h-12 after:content-[""] after:w-4 after:h-4 after:bg-red-800 after:rotate-45 after:shadow-inner')}
                            {renderCell('', 'black', 'bg-black col-span-1 flex items-center justify-center', 'h-12 after:content-[""] after:w-4 after:h-4 after:bg-gray-800 after:rotate-45 after:shadow-inner')}
                            {renderCell('IMPAR', 'odd', 'bg-green-900 border border-green-600 col-span-1', 'h-12')}
                            {renderCell('19-36', '19-36', 'bg-green-900 border border-green-600 col-span-1', 'h-12')}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl p-6">
                        {getResultMsg()}
                        <div className="flex gap-4 mt-8">
                            <button onClick={playAgain} disabled={state.casinoPlays >= 3} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg disabled:opacity-50 transform hover:scale-105 transition-transform">
                                Jugar de Nuevo
                            </button>
                            <button onClick={handleClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full shadow-lg">
                                Salir
                            </button>
                        </div>
                    </div>
                )}

                <div className="w-full mt-6 flex flex-col gap-4">
                    <div className="flex justify-center gap-4 bg-black/30 p-2 rounded-full border border-white/5">
                        {[10, 50, 100, 500].map(val => (
                            <div key={val} className={`transform transition-transform ${selectedChip === val ? 'scale-125 -translate-y-2' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}>
                                <Chip val={val} onClick={() => setSelectedChip(val)} />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={clearBets} disabled={phase !== 'betting' || currentTotalBet === 0} className="px-6 bg-red-900/50 text-red-200 rounded hover:bg-red-900 border border-red-800 text-xs font-bold disabled:opacity-50">
                            BORRAR
                        </button>
                        <button 
                            onClick={spin}
                            disabled={phase !== 'betting' || currentTotalBet === 0 || state.casinoPlays >= 3}
                            className="flex-1 bg-gradient-to-b from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-black font-black py-3 rounded shadow-lg border-b-4 border-yellow-900 active:scale-95 transition-all text-xl uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
                        >
                            {phase === 'spinning' ? 'GIRANDO...' : 'GIRAR'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
