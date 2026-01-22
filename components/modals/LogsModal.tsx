
import React, { useRef, useEffect } from 'react';
import { GameState } from '../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const LogsModal: React.FC<Props> = ({ state, dispatch }) => {
    if (!state.showLogsModal) return null;

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic (scroll to TOP because list is usually rendered newest first in some logic, 
    // but here we map naturally so newest is at BOTTOM. Let's ensure consistency).
    // The state.logs usually has newest at index 0. So we render them and let user scroll.
    
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => dispatch({type: 'TOGGLE_LOGS_MODAL'})}>
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-green-800 rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.15)] flex flex-col max-h-[80vh] font-mono text-xs overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* CRT Effect Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] pointer-events-none z-10 opacity-50 bg-[length:100%_2px,3px_100%]"></div>

                {/* Terminal Header */}
                <div className="bg-[#111] p-3 border-b border-green-900/50 flex justify-between items-center relative z-20">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                        </div>
                        <span className="text-green-500 font-bold ml-2 uppercase tracking-[0.2em] text-[10px] opacity-80">System_Log_v22.0</span>
                    </div>
                    <button onClick={() => dispatch({type: 'TOGGLE_LOGS_MODAL'})} className="text-green-700 hover:text-green-400 font-bold px-2 text-lg">✕</button>
                </div>

                {/* Logs Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-black/95 text-green-400 custom-scrollbar relative z-20 font-medium">
                    {state.logs.length === 0 && <div className="text-gray-600 italic text-center mt-10 opacity-50">... SYSTEM READY ...</div>}
                    
                    {state.logs.map((log, i) => {
                        const isTurn = log.includes('Turno de');
                        const isMoney = log.includes('$') || log.includes('paga') || log.includes('gana') || log.includes('compra');
                        const isEvent = log.includes('EVENTO') || log.includes('⚡');
                        const isCombat = log.includes('⚔️') || log.includes('🔫') || log.includes('arrestado') || log.includes('cárcel');
                        const isError = log.includes('🚫') || log.includes('❌');
                        
                        let colorClass = 'text-green-400/80';
                        let prefix = '>';

                        if (isTurn) {
                            colorClass = 'text-blue-400 font-bold border-t border-blue-900/30 pt-3 mt-1 pb-1';
                            prefix = '#';
                        }
                        else if (isMoney) { colorClass = 'text-yellow-200/90'; prefix = '$'; }
                        else if (isEvent) { colorClass = 'text-purple-400 font-bold'; prefix = '!'; }
                        else if (isCombat) { colorClass = 'text-red-400 font-bold'; prefix = '⚔'; }
                        else if (isError) { colorClass = 'text-red-500/80 italic'; prefix = 'ERR'; }

                        return (
                            <div key={i} className={`flex gap-3 px-2 py-0.5 rounded leading-tight hover:bg-white/5 transition-colors ${colorClass}`}>
                                <span className="opacity-30 select-none w-6 text-right shrink-0 font-bold">{prefix}</span>
                                <span className="break-words flex-1">{log}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Input Fake */}
                <div className="bg-[#050505] p-2 border-t border-green-900/50 text-green-600 relative z-20 flex items-center">
                    <span className="mr-2 opacity-50 font-bold">root@artia:~#</span>
                    <span className="animate-pulse bg-green-500 w-2 h-4 block"></span>
                </div>
            </div>
        </div>
    );
};
