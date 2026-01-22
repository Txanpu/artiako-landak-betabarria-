
import React from 'react';
import { GameState } from '../types';

export const GameLogs: React.FC<{ state: GameState }> = ({ state }) => {
    return (
        <div className="hidden lg:flex absolute bottom-4 left-4 z-30 w-[400px] flex-col gap-2 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto">
                {/* Header */}
                <div className="bg-slate-900/90 px-3 py-1 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro del Sistema</span>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>

                {/* Log Feed */}
                <div className="h-48 overflow-y-auto custom-scrollbar p-3 font-mono text-[11px] text-gray-300 relative">
                    <div className="flex flex-col gap-1.5">
                        {state.logs.slice(0, 30).map((log, i) => {
                            // Simple highlighting
                            const isEvent = log.includes('⚡') || log.includes('EVENTO');
                            const isMoney = log.includes('$');
                            const isCombat = log.includes('⚔️') || log.includes('🔫');
                            
                            let colorClass = "text-gray-300";
                            if (isEvent) colorClass = "text-yellow-300";
                            if (isMoney) colorClass = "text-emerald-300";
                            if (isCombat) colorClass = "text-red-300";
                            if (i === 0) colorClass += " font-bold brightness-125"; // Highlight newest

                            return (
                                <div key={i} className={`leading-tight flex gap-2 ${i === 0 ? 'animate-in slide-in-from-left-2 duration-300' : 'opacity-80'}`}>
                                    <span className="text-slate-600 select-none">[{state.turnCount > i ? state.turnCount - i : 0}]</span>
                                    <span className={colorClass}>{log}</span>
                                </div>
                            );
                        })}
                        {state.logs.length === 0 && <div className="text-gray-600 italic">Esperando eventos...</div>}
                    </div>
                    {/* Fade Out Effect at Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};
