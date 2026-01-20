
import React from 'react';
import { GameState } from '../../types';
import { RouletteView } from './casino/RouletteView';
import { BlackjackView } from './casino/BlackjackView';

interface CasinoModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const CasinoModal: React.FC<CasinoModalProps> = ({ state, dispatch }) => {
    const player = state.players[state.currentPlayerIndex];
    const tile = state.tiles[player?.pos];
    const ownerName = (tile && typeof tile.owner === 'number') ? state.players.find(p=>p.id===tile.owner)?.name : 'Banca';

    if (!state.showCasinoModal) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 md:p-6 overflow-hidden">
             <div className="absolute top-4 left-4 text-white text-xs opacity-70">
                <div className="font-bold uppercase">Casino Owner: {ownerName}</div>
                <div>Jugadas restantes: {3 - state.casinoPlays}/3</div>
            </div>
            
            {state.casinoGame === 'roulette' ? (
                <RouletteView state={state} dispatch={dispatch} player={player} ownerName={ownerName} />
            ) : (
                <BlackjackView state={state} dispatch={dispatch} player={player} ownerName={ownerName} />
            )}
        </div>
    );
};
