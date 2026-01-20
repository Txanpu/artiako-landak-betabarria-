
import React, { useState, useEffect } from 'react';
import { Player } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

interface Props {
    player: Player;
    isRolling: boolean;
    displayDice: number[];
    onRoll: () => void;
    dispatch: React.Dispatch<any>;
}

export const PlayerActionCard: React.FC<Props> = ({ player, isRolling, displayDice, dispatch }) => {
    const [revealRole, setRevealRole] = useState(false);
    useEffect(() => setRevealRole(false), [player.id]);

    const isHigh = (player.highTurns || 0) > 0;
    
    const d1 = displayDice[0] ?? 1;
    const d2 = displayDice[1] ?? 1;
    const d3 = displayDice[2] ?? 1;

    return (
        <div className="relative z-10 m-4 mb-2">
            {/* Background Glow for Active Player */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-xl blur-xl pointer-events-none"></div>

            <div className={`relative p-4 rounded-xl border transition-all duration-500 shadow-xl overflow-hidden
                ${isHigh ? 'bg-[#1f1018] border-pink-500/50 shadow-pink-900/20' : 'bg-[#0f172a] border-slate-700 shadow-black/50'}
            `}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                {/* Header: Avatar & Name */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-lg shadow-lg flex items-center justify-center text-lg border-2" style={{backgroundColor: '#1e293b', borderColor: player.color}}>
                                <span className="filter drop-shadow-md">
                                    {player.gender === 'helicoptero' ? '🚁' : player.gender === 'marcianito' ? '👽' : player.gender === 'female' ? '👩' : '👨'}
                                </span>
                            </div>
                            {player.jail > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded border border-black font-bold animate-pulse">JAIL</div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-sm tracking-wide">{player.name}</span>
                            <button 
                                onClick={() => setRevealRole(!revealRole)} 
                                className={`text-[9px] uppercase font-bold tracking-wider text-left transition-colors ${revealRole ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {revealRole ? player.role : 'VER ROL 👁️'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Money Display */}
                    <div className="text-right">
                        <div className="text-[9px] text-emerald-600 uppercase font-bold tracking-widest mb-0.5">Saldo</div>
                        <div className="text-2xl font-mono font-black text-emerald-400 tracking-tighter filter drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                            {formatMoney(player.money)}
                        </div>
                    </div>
                </div>

                {/* Inventory / Status Bar */}
                {(player.farlopa > 0 || player.insiderTokens > 0) && (
                    <div className="flex gap-2 mb-4 bg-black/20 p-1.5 rounded-lg border border-white/5">
                        {player.farlopa > 0 && (
                            <div className="text-[9px] text-slate-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                                <span>❄️</span> <span className="font-mono font-bold text-white">{player.farlopa}</span>
                            </div>
                        )}
                        {player.insiderTokens > 0 && (
                            <div className="text-[9px] text-purple-300 flex items-center gap-1 bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30">
                                <span>🕵️</span> <span className="font-mono font-bold text-white">{player.insiderTokens}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Dice Display Area */}
                <div className="relative">
                    {/* Label */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#0f172a] px-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest z-10">
                        Resultados
                    </div>
                    
                    <div className={`grid ${isHigh || displayDice.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 p-3 pt-4 rounded-xl border border-slate-800 bg-black/40`}>
                        <DiceBox val={d1} rolling={isRolling} />
                        <DiceBox val={d2} rolling={isRolling} delay={75} />
                        {(isHigh || displayDice.length > 2) && (
                            <DiceBox val={d3} rolling={isRolling} delay={150} color="text-pink-400 border-pink-500/30 bg-pink-900/10" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DiceBox = ({ val, rolling, delay = 0, color }: { val: number, rolling: boolean, delay?: number, color?: string }) => (
    <div className={`
        relative h-14 rounded-lg flex items-center justify-center border-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-200
        ${color ? color : 'bg-slate-900/80 border-slate-700 text-white'}
        ${rolling ? 'animate-bounce border-yellow-500/50 text-yellow-200' : ''}
    `} style={{ animationDelay: `${delay}ms` }}>
        <span className="text-3xl font-black font-mono tracking-tighter drop-shadow-md">{val}</span>
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-lg pointer-events-none"></div>
    </div>
);
