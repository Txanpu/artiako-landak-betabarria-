
import React from 'react';
import { GameState } from '../../types';

interface Props {
    state: GameState;
    onReset: () => void;
    onUndo: () => void;
    canUndo: boolean;
}

export const SidebarHeader: React.FC<Props> = ({ state, onReset, onUndo, canUndo }) => {
    const weatherIcon = state.world.weather === 'rain' ? '🌧️' : state.world.weather === 'heatwave' ? '🔥' : '☀️';
    const dayIcon = state.world.isNight ? '🌙' : '☀️';
    
    // Gov Colors
    const govColor = {
        anarchy: 'text-red-500 border-red-500/30 bg-red-500/10',
        authoritarian: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        libertarian: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        left: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
        right: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    }[state.gov] || 'text-gray-400';

    return (
        <div className="p-5 border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-800/80 backdrop-blur-md flex flex-col gap-3 shadow-lg z-10">
            {/* Title Row */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider leading-none drop-shadow-sm">
                        ARTIA <span className="text-emerald-500">LANDAK</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950/50 px-1.5 py-0.5 rounded">T: {state.turnCount}</span>
                        <div className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${govColor} tracking-wider`}>
                            {state.gov}
                        </div>
                    </div>
                </div>
                
                {/* Controls */}
                <div className="flex gap-1">
                    <button 
                        onClick={onUndo} 
                        disabled={!canUndo} 
                        className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded hover:bg-slate-700 hover:text-white disabled:opacity-30 transition-colors font-bold uppercase"
                        title="Deshacer"
                    >
                        Undo
                    </button>
                    <button 
                        onClick={onReset} 
                        className="text-[10px] bg-red-950/30 text-red-400 border border-red-900/50 px-2 py-1 rounded hover:bg-red-900/50 transition-colors font-bold uppercase"
                        title="Reiniciar"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 rounded p-2 border border-emerald-900/30 flex flex-col justify-center">
                    <span className="text-[9px] text-emerald-600/70 uppercase font-bold tracking-widest mb-0.5">Arcas Estado</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm tracking-tight drop-shadow-sm">
                        ${state.estadoMoney.toLocaleString()}
                    </span>
                </div>
                <div className="bg-black/30 rounded p-2 border border-blue-900/30 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-blue-500/70 uppercase font-bold tracking-widest mb-0.5">Mundo</span>
                        <span className="text-slate-300 text-xs font-medium">Día {state.world.dayCount}</span>
                    </div>
                    <div className="flex gap-1 text-base filter drop-shadow-md bg-white/5 p-1 rounded-lg">
                        <span>{dayIcon}</span>
                        <span>{weatherIcon}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
