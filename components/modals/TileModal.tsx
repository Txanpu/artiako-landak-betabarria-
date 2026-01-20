
import React from 'react';
import { GameState, TileType } from '../../types';
import { StandardTileModal } from './tile/StandardTileModal';
import { SpecialTileModal } from './tile/SpecialTileModal';
import { FioreModal } from './tile/FioreModal';

interface TileModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const TileModal: React.FC<TileModalProps> = ({ state, dispatch }) => {
    if (state.selectedTileId === null) return null;

    const t = state.tiles[state.selectedTileId];
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Background Backdrop logic
    const close = () => dispatch({type: 'CLOSE_MODAL'});
    
    // FIORE MODAL
    if (t.subtype === 'fiore') {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-fuchsia-900/80 backdrop-blur-md p-4" onClick={close}>
                <FioreModal state={state} dispatch={dispatch} t={t} currentPlayer={currentPlayer} />
            </div>
        );
    }

    // Determine which Modal to show
    // Special Types OR Subtypes
    if (
        t.type === TileType.GOTOJAIL || 
        t.type === TileType.JAIL ||
        t.type === TileType.PARK || 
        t.type === TileType.TAX || 
        t.type === TileType.QUIZ || 
        t.name === 'Suerte' || 
        t.name.includes('Comunidad') ||
        t.type === TileType.START || 
        t.type === TileType.BANK ||
        t.subtype === 'greyhound' ||
        t.subtype === 'gym' // <--- ADDED GYM HERE
    ) {
        // Special Backdrop Colors
        let backdrop = "bg-black/60";
        if (t.type === TileType.GOTOJAIL) backdrop = "bg-blue-900/80";
        if (t.type === TileType.JAIL) backdrop = "bg-zinc-900/90"; 
        if (t.type === TileType.PARK) backdrop = "bg-emerald-900/80";
        if (t.type === TileType.BANK) backdrop = "bg-yellow-900/40"; 
        if (t.subtype === 'greyhound') backdrop = "bg-slate-900/90";
        if (t.type === TileType.QUIZ) backdrop = "bg-indigo-950/90"; 
        if (t.name === 'Suerte' || t.name.includes('Comunidad')) backdrop = "bg-black/80";
        if (t.subtype === 'gym') backdrop = "bg-[#2e2e2e]/90"; // Pokemon Style Grey

        return (
            <div className={`fixed inset-0 z-40 flex items-center justify-center ${backdrop} backdrop-blur-sm p-4`} onClick={close}>
                <SpecialTileModal state={state} dispatch={dispatch} t={t} currentPlayer={currentPlayer} />
            </div>
        );
    }

    // SLOTS: Don't show generic modal if clicked via inspection, just show generic
    if (t.type === TileType.SLOTS) {
         return (
            <div className={`fixed inset-0 z-40 flex items-center justify-center bg-purple-900/50 backdrop-blur-sm p-4`} onClick={close}>
                <SpecialTileModal state={state} dispatch={dispatch} t={t} currentPlayer={currentPlayer} />
            </div>
        );
    }

    // Standard Property Modal
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={close}>
            <StandardTileModal state={state} dispatch={dispatch} t={t} currentPlayer={currentPlayer} />
        </div>
    );
};
