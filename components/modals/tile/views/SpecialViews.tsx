
import React from 'react';
import { GameState, TileData, Player } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';
import { FUNNY } from '../../../../constants';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
    close: () => void;
}

export const GotoJailView: React.FC<Props> = ({ close }) => (
    <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border-4 border-blue-600 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-600 via-transparent to-blue-600 animate-pulse"></div>
        <div className="p-8 text-center flex flex-col items-center">
            <div className="text-6xl mb-4 animate-bounce">🚓</div>
            <h2 className="text-3xl font-black uppercase text-blue-500 mb-2 tracking-tighter">¡ALTO AHÍ!</h2>
            <div className="bg-slate-800 p-4 rounded border border-slate-700 w-full mb-4">
                <p className="text-gray-300 font-bold mb-2">ORDEN DE ARRESTO</p>
                <p className="text-sm text-gray-400">Si caes aquí, vas directo al calabozo sin pasar por la casilla de Salida.</p>
                <p className="text-xs text-red-400 mt-2 font-mono uppercase">"No intentes huir"</p>
            </div>
            <button onClick={close} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-full font-bold">Entendido, Agente</button>
        </div>
    </div>
);

export const JailView: React.FC<Props> = ({ currentPlayer, dispatch, close }) => {
    const isInJail = currentPlayer.jail > 0;
    return (
        <div className="bg-zinc-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-700 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.5)_40px,rgba(0,0,0,0.5)_45px)] z-0 opacity-20"></div>
            <div className="p-8 text-center flex flex-col items-center relative z-10">
                <div className="text-6xl mb-4 text-zinc-500 drop-shadow-lg">⛓️</div>
                <h2 className="text-3xl font-black uppercase text-zinc-300 mb-2 tracking-tighter">CÁRCEL</h2>
                {isInJail ? (
                    <div className="bg-red-900/20 p-4 rounded border border-red-500/50 w-full mb-4 backdrop-blur-sm">
                        <p className="text-red-400 font-bold mb-1 text-lg">¡ESTÁS PRESO!</p>
                        <p className="text-sm text-gray-400">Te quedan <span className="text-white font-bold text-xl mx-1">{currentPlayer.jail}</span> turnos de condena.</p>
                        {currentPlayer.money >= 50 && (
                            <button onClick={() => { dispatch({type: 'PAY_JAIL'}); close(); }} className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded shadow-lg font-bold w-full transition-all hover:scale-[1.02]">
                                Pagar Fianza ($50)
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-zinc-800/50 p-4 rounded border border-zinc-600 w-full mb-4 backdrop-blur-sm">
                        <p className="text-gray-300 font-bold mb-1 uppercase tracking-wide">Solo Visitas</p>
                        <p className="text-xs text-gray-500 italic">"Mira, pero no toques los barrotes..."</p>
                    </div>
                )}
                <button onClick={close} className="bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-2 rounded-full font-bold shadow-lg">Cerrar</button>
            </div>
        </div>
    );
};

export const ParkView: React.FC<Props> = ({ close }) => (
    <div className="bg-gradient-to-b from-emerald-800 to-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-emerald-500 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center">
            <div className="text-6xl mb-4">🌳</div>
            <h2 className="text-3xl font-black text-emerald-300 mb-2">PARKIE</h2>
            <p className="text-emerald-100/80 italic mb-6">"Buen sitio pa fumar porros y relajarse."</p>
            <div className="bg-black/20 p-4 rounded-lg backdrop-blur-sm mb-6 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-400 text-sm mb-1">ZONA SEGURA</h4>
                <p className="text-xs text-gray-300">Aquí no pasa nada malo. Simplemente descansa, espera a que pase la tormenta o negocia con otros jugadores.</p>
            </div>
            <button onClick={close} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-full font-bold shadow-lg">Relax</button>
        </div>
    </div>
);

export const BankView: React.FC<Props> = ({ t, currentPlayer, dispatch, close }) => {
    const isAtBank = currentPlayer.pos === t.id;
    const canAccess = isAtBank || currentPlayer.role === 'florentino';
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

export const EventCardView: React.FC<Props> = ({ t, close }) => {
    const isChance = t.name === 'Suerte';
    const cardColor = isChance ? 'bg-orange-500' : 'bg-blue-600';
    const cardBorder = isChance ? 'border-orange-300' : 'border-blue-300';
    const icon = isChance ? '?' : '📦';
    const title = isChance ? 'SUERTE' : 'COMUNIDAD';
    return (
        <div className={`w-64 h-96 ${cardColor} rounded-2xl shadow-2xl border-4 ${cardBorder} relative flex flex-col items-center justify-center text-center p-6 animate-in flip-in-y duration-700`} onClick={e => e.stopPropagation()} style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.1) 100%)' }}>
            <div className="border-2 border-white/30 rounded-xl w-full h-full flex flex-col items-center justify-center p-4">
                <div className="text-8xl text-white mb-4 drop-shadow-md">{icon}</div>
                <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-sm">{title}</h2>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wide">Toma una carta...</p>
            </div>
            <button onClick={close} className="absolute bottom-[-50px] bg-white text-black font-bold px-6 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors">Cerrar</button>
        </div>
    );
};

export const TaxView: React.FC<Props> = ({ t, state, currentPlayer, close }) => {
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

export const DefaultView: React.FC<Props> = ({ t, close }) => (
    <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="py-4 text-center p-6">
            <div className="text-gray-500 italic mb-4">Casilla Especial<br/><span className="text-white font-bold not-italic mt-2 block">{t.type.toUpperCase()}</span></div>
            <div className="bg-slate-800 p-4 rounded text-yellow-500 font-medium border border-slate-700 shadow-inner">"{FUNNY[t.type] || FUNNY.default}"</div>
            <button onClick={close} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold border border-slate-600 transition-colors">Cerrar</button>
        </div>
    </div>
);
