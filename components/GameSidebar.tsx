
import React from 'react';
import { GameState } from '../types';
import { PlayerActionCard } from './sidebar/PlayerActionCard';
import { ActionPanel } from './sidebar/ActionPanel';

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
    state, dispatch, isRolling, displayDice, onRoll
}) => {
    const currentPlayer = state.players[state.currentPlayerIndex];

    return (
        <div className="hidden lg:flex w-80 h-full bg-[#0b1120] border-l border-white/5 flex-col shadow-2xl z-40 relative">
            
            {/* Header Removed as requested. Starts directly with content. */}
            
            {currentPlayer ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-4">
                    <PlayerActionCard player={currentPlayer} isRolling={isRolling} displayDice={displayDice} onRoll={onRoll} dispatch={dispatch} />
                    <ActionPanel state={state} player={currentPlayer} onRoll={onRoll} isRolling={isRolling} dispatch={dispatch} />
                    
                    {/* Filler space with gradient to look nice at bottom */}
                    <div className="flex-1 bg-gradient-to-b from-[#0b1120] to-black/80 min-h-[20px]"></div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 italic text-sm animate-pulse">
                    Inicializando Sistemas...
                </div>
            )}

            {/* Logs Footer Removed as requested */}
        </div>
    );
};
