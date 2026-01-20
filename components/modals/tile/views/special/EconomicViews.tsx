
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

export const BankView: React.FC<Props> = ({ t, currentPlayer, dispatch, close }) => {
    const canAccess = currentPlayer.pos === t.id || currentPlayer.role === 'florentino';
    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-yellow-600/50 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center flex flex-col items-center">
                <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🏦</div>
                <h2 className="text-3xl font-black uppercase text-yellow-500 mb-6 tracking-widest">BANCA</h2>
                {canAccess ? (
                    <button onClick={() => { close(); dispatch({type: 'TOGGLE_BANK_MODAL'}); }} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg font-bold">ACCEDER A LA BANCA</button>
                ) : (
                    <div className="w-full bg-slate-800 border border-slate-600 text-gray-500 py-3 px-4 rounded-lg text-xs">Acceso solo si estás en la casilla o eres Florentino.</div>
                )}
                <button onClick={close} className="mt-4 text-xs text-gray-500 underline">Cerrar</button>
            </div>
        </div>
    );
};

export const SlotsView: React.FC<Props> = ({ t, currentPlayer, dispatch, state, close }) => {
    const isAtTile = currentPlayer.pos === t.id;
    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)] border-4 border-purple-600 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center flex flex-col items-center">
                <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_#d946ef]">🎰</div>
                <h2 className="text-4xl font-black uppercase text-fuchsia-400 mb-6 tracking-tighter">SLOTS</h2>
                {isAtTile ? (
                    <button onClick={() => { close(); dispatch({type: 'OPEN_SLOTS_MODAL'}); }} className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white py-4 rounded-xl font-black text-xl">JUGAR AHORA 🎲</button>
                ) : (
                    <div className="w-full bg-slate-800 text-gray-500 py-3 px-4 rounded-lg">Debes estar aquí para jugar.</div>
                )}
                <button onClick={close} className="mt-4 text-xs text-gray-500 underline">Cerrar</button>
            </div>
        </div>
    );
};

export const TaxView: React.FC<Props> = ({ t, state, close }) => {
    const taxRate = state.currentGovConfig.tax;
    const taxPercent = (taxRate * 100).toFixed(0);
    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-red-500/30 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-8 space-y-4">
                <h3 className="text-2xl font-black uppercase text-center text-red-400">{t.name} 💸</h3>
                <div className="bg-slate-800 p-4 rounded-xl text-center">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Tasa Actual</div>
                    <div className={`text-5xl font-black ${taxRate > 0 ? 'text-red-500' : 'text-green-500'}`}>{taxRate <= 0 ? '0%' : `${taxPercent}%`}</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-gray-700 flex justify-between items-center"><span className="text-gray-400 text-xs">Bote FBI:</span><span className="font-mono text-green-400 font-bold">{formatMoney(state.fbiPot || 0)}</span></div>
                <button onClick={close} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold">Cerrar</button>
            </div>
        </div>
    );
};
