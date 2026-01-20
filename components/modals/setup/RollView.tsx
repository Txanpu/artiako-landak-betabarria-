
import React from 'react';
import { Player } from '../../../types';

export interface RollEntry {
    player: Player;
    dice: number[]; // Updated to array
    total: number;
}

interface RollViewProps {
    phase: 'rolling' | 'finished';
    entries: RollEntry[];
    onConfirm: () => void;
}

export const RollView: React.FC<RollViewProps> = ({ phase, entries, onConfirm }) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black mb-4 text-white text-center tracking-tight">
                {phase === 'rolling' ? '🎲 SORTEANDO...' : '🏆 ORDEN DE JUEGO'}
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {entries.map((entry, idx) => (
                    <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 
                        ${phase === 'finished' && idx === 0 ? 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border-yellow-500 scale-105 shadow-yellow-500/20 shadow-lg' : 'bg-slate-900 border-slate-700'}
                    `}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`font-mono text-lg font-bold w-6 ${phase === 'finished' && idx === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>#{idx + 1}</div>
                            <div>
                                <div className="font-bold text-white text-sm">{entry.player.name}</div>
                                {phase === 'finished' && idx === 0 && <span className="text-[10px] text-yellow-400 uppercase font-black tracking-widest animate-pulse">👑 Empieza</span>}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 flex items-center justify-center bg-gray-100 text-black font-black rounded shadow-inner text-lg border-b-2 border-gray-400 ${phase === 'rolling' ? 'animate-bounce' : ''}`}>
                                {entry.dice[0]}
                            </div>
                            <div className={`w-8 h-8 flex items-center justify-center bg-gray-100 text-black font-black rounded shadow-inner text-lg border-b-2 border-gray-400 ${phase === 'rolling' ? 'animate-bounce delay-75' : ''}`}>
                                {entry.dice[1]}
                            </div>
                            <div className="w-8 text-center font-mono font-bold text-emerald-400 text-xl ml-2">
                                {entry.total}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {phase === 'finished' && (
                <button onClick={onConfirm} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 text-white font-bold py-4 rounded-xl shadow-lg mt-6 animate-in zoom-in duration-300 transform hover:scale-[1.02] active:scale-95">
                    JUGAR AHORA
                </button>
            )}
        </div>
    );
};
