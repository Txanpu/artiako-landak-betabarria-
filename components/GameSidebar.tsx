
import React from 'react';
import { GameState } from '../types';
import { PlayerActionCard } from './sidebar/PlayerActionCard';
import { ActionPanel } from './sidebar/ActionPanel';
import { formatMoney } from '../utils/gameLogic';

interface GameSidebarProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
    isRolling: boolean;
    displayDice: number[];
    onRoll: () => void;
    onReset: () => void;
    onUndo: () => void;
    canUndo: boolean;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({ 
    state, dispatch, isRolling, displayDice, onRoll, onReset, onUndo, canUndo 
}) => {
    const currentPlayer = state.players[state.currentPlayerIndex];

    return (
        <div className="hidden lg:flex w-80 h-full bg-[#0b1120] border-l border-white/5 flex-col shadow-2xl z-40 relative">
            
            {/* Header / Info Area (Controls removed) */}
            <div className="p-4 border-b border-white/5 bg-slate-900/50">
                <div className="flex justify-between items-center">
                    <h2 className="text-white font-black uppercase tracking-wider text-sm">ARTIA LANDAK</h2>
                    <div className="text-[10px] text-slate-500 font-mono bg-black/30 px-2 py-1 rounded">Turno {state.turnCount}</div>
                </div>
            </div>
            
            {currentPlayer ? (
                <>
                    <PlayerActionCard player={currentPlayer} isRolling={isRolling} displayDice={displayDice} onRoll={onRoll} dispatch={dispatch} />
                    <ActionPanel state={state} player={currentPlayer} onRoll={onRoll} isRolling={isRolling} dispatch={dispatch} />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 italic text-sm animate-pulse">
                    Inicializando Sistemas...
                </div>
            )}

            {/* Mini Player List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar bg-[#0f172a]/50">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1 sticky top-0 bg-[#0f172a] py-1 z-10">Ranking Global</div>
                {state.players.map(p => {
                    const isActive = p.id === state.currentPlayerIndex;
                    return (
                        <div 
                            key={p.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300
                                ${isActive 
                                    ? 'bg-slate-800 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)] translate-x-1' 
                                    : 'bg-slate-900/50 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'}
                                ${!p.alive ? 'grayscale opacity-30' : ''}
                            `}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{color: p.color, backgroundColor: p.color}}></div>
                                <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                    {p.name}
                                </span>
                                {!p.alive && <span className="text-[9px] text-red-500 font-bold">☠️</span>}
                            </div>
                            <div className={`font-mono font-bold text-xs ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {formatMoney(p.money)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Logs Area */}
            <div className="h-40 bg-black border-t border-slate-800 p-3 font-mono text-[10px] overflow-y-auto text-gray-400 custom-scrollbar relative">
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"></div>
                <div className="flex flex-col gap-1">
                    {state.logs.map((l, i) => (
                        <div key={i} className="border-l-2 border-slate-800 pl-2 py-0.5 hover:text-white hover:border-blue-500 transition-colors leading-tight">
                            <span className="opacity-50 mr-2">[{state.turnCount > i ? state.turnCount - i : 0}]</span>
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
