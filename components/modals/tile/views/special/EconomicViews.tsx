
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-yellow-900/20"></div>
            <div className="p-8 text-center flex flex-col items-center relative z-10">
                <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🏦</div>
                <h2 className="text-3xl font-black uppercase text-yellow-500 mb-1 tracking-widest">BANCA</h2>
                <div className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em] mb-6 border-b border-red-900/50 pb-2 w-full">CORRUPTA & ASOCIADOS</div>
                <div className="bg-black/40 p-4 rounded border border-yellow-700/30 w-full mb-6 backdrop-blur-sm">
                    <p className="text-sm text-gray-300 italic mb-3">"Donde tu dinero desaparece y tus deudas se multiplican."</p>
                    <div className="flex justify-around text-xs text-yellow-200/80">
                        <span className="flex flex-col items-center"><span className="text-lg">📉</span>Futuros</span>
                        <span className="flex flex-col items-center"><span className="text-lg">💰</span>Préstamos</span>
                        <span className="flex flex-col items-center"><span className="text-lg">🏝️</span>Offshore</span>
                    </div>
                </div>
                {canAccess ? (
                    <button onClick={() => { close(); dispatch({type: 'TOGGLE_BANK_MODAL'}); }} className="w-full bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white border-b-4 border-yellow-900 px-8 py-3 rounded-lg font-bold shadow-lg mb-3 active:scale-95 transition-all">ACCEDER A LA BANCA</button>
                ) : (
                    <div className="w-full bg-slate-800 border border-slate-600 text-gray-500 font-bold py-3 px-4 rounded-lg mb-3 flex flex-col items-center"><span className="text-xs uppercase tracking-wide">Acceso Denegado</span><span className="text-[10px] font-normal">Debes estar en esta casilla para operar.</span></div>
                )}
                <button onClick={close} className="text-xs text-gray-500 hover:text-white underline">Solo mirar</button>
            </div>
        </div>
    );
};

export const SlotsView: React.FC<Props> = ({ t, currentPlayer, dispatch, state, close }) => {
    const isAtTile = currentPlayer.pos === t.id;
    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)] border-4 border-purple-600 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
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

export const TaxView: React.FC<Props> = ({ t, state, currentPlayer, dispatch, close }) => {
    const isAnarchy = state.gov === 'anarchy';
    
    // ANARCHY: BLACK MARKET MODE
    if (isAnarchy) {
        const canSell = (currentPlayer.farlopa || 0) > 0;
        const canHire = currentPlayer.money >= 500;
        const isHere = currentPlayer.pos === t.id;

        return (
            <div className="bg-zinc-950 text-green-500 w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.3)] border-2 border-green-800 animate-in zoom-in-95 font-mono" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative">
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-2 animate-pulse">🕶️</div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-green-400">MERCADO NEGRO</h3>
                        <div className="text-[10px] bg-green-900/30 text-green-600 px-2 py-1 rounded inline-block mt-2 border border-green-800">
                            ZONA SIN LEY
                        </div>
                    </div>

                    {isHere ? (
                        <div className="space-y-3">
                            <button 
                                onClick={() => dispatch({type: 'BLACK_MARKET_TRADE', payload: {action: 'sell_drug'}})}
                                disabled={!canSell}
                                className="w-full bg-slate-900 border border-slate-700 hover:border-green-500 text-white py-3 px-4 rounded flex justify-between items-center group disabled:opacity-30"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-xs uppercase group-hover:text-green-400">Vender Mercancía</div>
                                    <div className="text-[9px] text-gray-500">Stock: {currentPlayer.farlopa || 0}</div>
                                </div>
                                <span className="font-mono font-bold text-green-500">+$300</span>
                            </button>

                            <button 
                                onClick={() => dispatch({type: 'BLACK_MARKET_TRADE', payload: {action: 'hire_sicario'}})}
                                disabled={!canHire}
                                className="w-full bg-slate-900 border border-slate-700 hover:border-red-500 text-white py-3 px-4 rounded flex justify-between items-center group disabled:opacity-30"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-xs uppercase group-hover:text-red-400">Contratar Sicario</div>
                                    <div className="text-[9px] text-gray-500">Elimina (Bird Center) a un rival random</div>
                                </div>
                                <span className="font-mono font-bold text-red-500">-$500</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-gray-500 italic border border-green-900/30 p-4 rounded">
                            Ven aquí para hacer negocios turbios...
                        </div>
                    )}
                    
                    <button onClick={close} className="w-full mt-6 text-center text-[10px] text-green-800 hover:text-green-500 uppercase font-bold">
                        Cerrar conexión
                    </button>
                </div>
            </div>
        );
    }

    // STANDARD TAX MODE
    const taxRate = state.currentGovConfig.tax;
    const taxPercent = (taxRate * 100).toFixed(0);
    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-red-500/30 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="h-32 flex flex-col items-center justify-center bg-red-900/20 p-4 shadow-inner relative overflow-hidden">
                <h3 className="text-3xl font-black uppercase text-center drop-shadow-md z-10 text-red-400">{t.name}</h3>
                <div className="text-4xl mt-2 z-10">💸</div>
            </div>
            <div className="p-6 space-y-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-red-500/30 text-center">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Tipo Impositivo Actual</div>
                    <div className={`text-5xl font-black ${taxRate > 0 ? 'text-red-500' : 'text-green-500'}`}>{taxRate <= 0 ? '0%' : `${taxPercent}%`}</div>
                    <div className="text-xs text-yellow-500 mt-2 uppercase font-bold tracking-wider">Gobierno {state.gov}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div className="bg-slate-800 p-2 rounded"><div className="font-bold text-white mb-1">🏛️ Estado (50%)</div><p>Financia sueldos, ayudas y construcción pública.</p></div>
                    <div className="bg-slate-800 p-2 rounded relative overflow-hidden"><div className="font-bold text-white mb-1">🕵️ Corrupción (50%)</div><p>Desaparece misteriosamente...</p>{currentPlayer.role === 'fbi' && <div className="absolute inset-0 bg-green-900/90 flex items-center justify-center text-green-300 font-bold">¡TÚ RECIBES ESTO!</div>}</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-gray-700 flex justify-between items-center"><span className="text-gray-400 text-xs">Bote Acumulado (FBI Pot):</span><span className="font-mono text-green-400 font-bold">{formatMoney(state.fbiPot || 0)}</span></div>
                <button onClick={close} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold border border-slate-600 transition-colors">Cerrar</button>
            </div>
        </div>
    );
};
