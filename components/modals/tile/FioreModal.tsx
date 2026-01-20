
import React from 'react';
import { GameState, TileData, Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface FioreModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const FioreModal: React.FC<FioreModalProps> = ({ state, dispatch, t, currentPlayer }) => {
    const isOwner = t.owner === currentPlayer?.id;
    const isOwnerless = t.owner === null;
    const isAtLocation = currentPlayer && currentPlayer.pos === t.id;
    
    // Workers Logic
    const workers = t.workersList || [];
    const maxWorkers = 6;
    const hireCost = 150;
    const currentRent = (workers.length * 70) || t.rent || 0;

    return (
        <div className="bg-[#1a0b2e] w-full max-w-lg rounded-xl overflow-hidden shadow-[0_0_50px_#d946ef] border-4 border-fuchsia-600 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            {/* Neon Sign Header */}
            <div className="bg-black/50 p-6 text-center relative overflow-hidden border-b border-fuchsia-800">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 animate-pulse drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" style={{fontFamily: 'Impact, sans-serif'}}>
                    FIORE CLUB
                </h2>
                <div className="text-fuchsia-300 text-xs tracking-[0.5em] uppercase mt-1">Premium Hostess Bar</div>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Info Bar */}
                <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-fuchsia-900/50">
                    <div className="text-pink-200 text-xs">
                        <div className="uppercase font-bold opacity-70">Tarifa Entrada</div>
                        <div className="text-xl font-mono text-fuchsia-400 font-bold">{formatMoney(currentRent)}</div>
                    </div>
                    <div className="text-right text-pink-200 text-xs">
                        <div className="uppercase font-bold opacity-70">Staff</div>
                        <div className="text-xl font-mono text-fuchsia-400 font-bold">{workers.length} / {maxWorkers}</div>
                    </div>
                </div>

                {/* Worker Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Render Existing Workers */}
                    {workers.map((w, idx) => (
                        <div 
                            key={idx} 
                            className="relative p-2 rounded-lg border-2 flex flex-col items-center text-center group transition-all hover:scale-105 overflow-hidden"
                            style={{ 
                                borderColor: w.color, 
                                backgroundColor: `${w.color}20`, // 20 hex alpha = low opacity
                                boxShadow: `0 0 10px ${w.color}40`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                            
                            <div className="text-3xl mb-1 filter drop-shadow-md z-10 animate-bounce" style={{animationDuration: '3s'}}>
                                {w.icon}
                            </div>
                            <div className="font-black text-sm leading-tight z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] uppercase tracking-wide">
                                {w.name}
                            </div>
                            <div className="text-[9px] mt-1 italic leading-none z-10 text-gray-200" style={{color: w.color, filter: 'brightness(1.5)'}}>
                                {w.trait}
                            </div>
                            
                            {/* Rarity Badge */}
                            <div className={`absolute top-1 left-1 text-[7px] font-bold px-1 rounded z-10 uppercase
                                ${w.rarity === 'legendary' ? 'bg-yellow-500 text-black' : w.rarity === 'rare' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'}
                            `}>
                                {w.rarity === 'legendary' ? 'SSR' : w.rarity === 'rare' ? 'SR' : 'R'}
                            </div>

                            <div className="text-[8px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/95 flex items-center justify-center p-2 text-center text-gray-300 z-20">
                                "{w.flavor}"
                            </div>
                            
                            {isOwner && (
                                <button 
                                    onClick={() => dispatch({type: 'FIRE_WORKER', payload: {tId: t.id, wIdx: idx}})}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 border border-white z-30 hover:bg-red-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, maxWorkers - workers.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-2 border-dashed border-fuchsia-900/50 rounded-lg flex flex-col items-center justify-center p-2 opacity-50 bg-black/20 hover:bg-black/30 transition-colors">
                            <div className="text-2xl opacity-20 grayscale">👤</div>
                            <div className="text-[9px] text-fuchsia-800 uppercase font-bold mt-1">Vacante</div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="space-y-2">
                    {isOwner ? (
                        <>
                            {workers.length < maxWorkers && (
                                <button 
                                    onClick={() => dispatch({type: 'HIRE_WORKER', payload: {tId: t.id}})}
                                    disabled={currentPlayer.money < hireCost}
                                    className="w-full bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg border-b-4 border-fuchsia-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-between px-6 items-center"
                                >
                                    <span>CONTRATAR CHICA</span>
                                    <span className="bg-black/30 px-2 rounded text-sm text-fuchsia-200">-{formatMoney(hireCost)}</span>
                                </button>
                            )}
                            {workers.length >= maxWorkers && (
                                <div className="text-center text-fuchsia-400 font-bold text-xs border border-fuchsia-900 p-2 rounded bg-black/40">
                                    🚫 PLANTILLA COMPLETA
                                </div>
                            )}
                        </>
                    ) : (
                        isOwnerless && isAtLocation ? (
                            <button onClick={() => {dispatch({type: 'BUY_PROP'}); dispatch({type: 'CLOSE_MODAL'})}} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg">
                                Comprar Negocio ({formatMoney(t.price || 0)})
                            </button>
                        ) : (
                            <div className="bg-slate-900/80 p-3 text-center text-gray-400 text-xs rounded border border-gray-700">
                                {isAtLocation ? "Disfruta de la compañía..." : "Debes estar aquí para entrar."}
                            </div>
                        )
                    )}
                    
                    <button onClick={() => dispatch({type: 'CLOSE_MODAL'})} className="w-full bg-transparent border border-fuchsia-800 text-fuchsia-400 hover:bg-fuchsia-900/30 font-bold py-2 rounded transition-colors text-xs">
                        SALIR DEL CLUB
                    </button>
                </div>

            </div>
        </div>
    );
};
