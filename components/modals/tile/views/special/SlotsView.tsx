
import React from 'react';
import { GameState, TileData, Player } from '../../../../../types';
import { formatMoney } from '../../../../../utils/gameLogic';

interface Props {
    state: GameState;
    t: TileData;
    currentPlayer: Player;
    dispatch: React.Dispatch<any>;
    close: () => void;
}

export const SlotsView: React.FC<Props> = ({ t, currentPlayer, dispatch, state, close }) => {
    const isAtTile = currentPlayer.pos === t.id;
    const isClosed = state.gov === 'left';

    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)] border-4 border-purple-600 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            {isClosed && (
                <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center text-center p-4">
                    <div className="text-6xl mb-2">🚫</div>
                    <div className="text-2xl font-black text-red-500 uppercase tracking-widest border-4 border-red-500 p-2 transform -rotate-12">
                        PROHIBIDO
                    </div>
                    <p className="mt-4 text-xs text-gray-400">"El juego es el impuesto de los tontos."<br/>- Gobierno de Izquierdas</p>
                    <button onClick={close} className="mt-6 text-xs text-gray-500 hover:text-white underline">Cerrar</button>
                </div>
            )}

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="p-8 text-center flex flex-col items-center relative z-10">
                <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_#d946ef]">🎰</div>
                <h2 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-400 to-purple-700 mb-2 tracking-tighter">SLOTS</h2>
                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-[0.2em] mb-6">Casino Estatal</div>
                <div className="bg-black/60 p-4 rounded border border-purple-500/50 w-full mb-6 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                        <span className="text-gray-400 text-xs">Bote del Estado:</span>
                        <span className="text-yellow-400 font-mono font-bold text-lg">{formatMoney(state.estadoMoney)}</span>
                    </div>
                    <p className="text-xs text-gray-300 italic">"Gana premios instantáneos. El Estado siempre paga... si tiene fondos."</p>
                </div>
                {isAtTile ? (
                    <button onClick={() => { close(); dispatch({type: 'OPEN_SLOTS_MODAL'}); }} className="w-full bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 text-white border-b-4 border-purple-900 px-8 py-4 rounded-xl font-black shadow-lg mb-3 active:scale-95 transition-all text-xl flex items-center justify-center gap-2"><span>JUGAR AHORA</span><span className="text-2xl">🎲</span></button>
                ) : (
                    <div className="w-full bg-slate-800/80 border border-slate-600 text-gray-500 font-bold py-3 px-4 rounded-lg mb-3">Debes estar aquí para jugar.</div>
                )}
                <button onClick={close} className="text-xs text-gray-500 hover:text-white underline">Cerrar</button>
            </div>
        </div>
    );
};
