
import React from 'react';
import { GameState } from '../types';
import { formatMoney } from '../utils/gameLogic';

export const GameHUD: React.FC<{ state: GameState, dispatch?: React.Dispatch<any> }> = ({ state, dispatch }) => {
    // VISUAL THEMES FOR GOVERNMENTS
    const govStyle = {
        anarchy: {
            bg: 'bg-red-950/90',
            border: 'border-red-600',
            text: 'text-red-500',
            shadow: 'shadow-[0_0_15px_rgba(220,38,38,0.4)]',
            icon: '🔥'
        },
        authoritarian: {
            bg: 'bg-purple-950/90',
            border: 'border-purple-600',
            text: 'text-purple-400',
            shadow: 'shadow-[0_0_15px_rgba(147,51,234,0.4)]',
            icon: '👮'
        },
        libertarian: {
            bg: 'bg-yellow-900/90',
            border: 'border-yellow-600',
            text: 'text-yellow-400',
            shadow: 'shadow-[0_0_15px_rgba(202,138,4,0.4)]',
            icon: '🐍'
        },
        left: {
            bg: 'bg-rose-900/90',
            border: 'border-rose-500',
            text: 'text-rose-300',
            shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
            icon: '🌹'
        },
        right: {
            bg: 'bg-blue-900/90',
            border: 'border-blue-500',
            text: 'text-blue-300',
            shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
            icon: '👔'
        }
    }[state.gov] || { bg: 'bg-slate-900', border: 'border-gray-500', text: 'text-gray-400', shadow: '', icon: '' };

    const weatherIcon = state.world.weather === 'rain' ? '🌧️' : state.world.weather === 'heatwave' ? '🔥' : '☀️';
    const dayIcon = state.world.isNight ? '🌙' : '☀️';

    // Helpers for Turn Order
    const currentPlayerId = state.players[state.currentPlayerIndex]?.id;
    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    const nextPlayerId = state.players[nextPlayerIndex]?.id;

    return (
        <div className="absolute top-4 left-4 z-30 pointer-events-auto select-none flex flex-col gap-2 w-64">
            {/* Main Badge: Government & Turn */}
            <div 
                onClick={() => dispatch && dispatch({type: 'TOGGLE_GOV_GUIDE'})}
                className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl
                    ${govStyle.bg} backdrop-blur-md border-2 ${govStyle.border} ${govStyle.shadow}
                    cursor-pointer hover:scale-[1.02] transition-transform active:scale-95
                `}
                title="Click para ver Guía de Gobierno"
            >
                <div className="flex items-center gap-3">
                    <div className="text-2xl filter drop-shadow-md">{govStyle.icon}</div>
                    <div className="flex flex-col leading-none">
                        <span className={`text-[9px] uppercase font-black tracking-widest opacity-80 ${govStyle.text}`}>
                            Gobierno
                        </span>
                        <span className="text-base font-black uppercase tracking-tighter text-white drop-shadow-sm truncate max-w-[80px]">
                            {state.gov}
                        </span>
                    </div>
                </div>
                
                <div className="h-8 w-px bg-white/20 mx-1"></div>
                
                <div className="flex flex-col leading-none items-end text-white">
                    <span className="text-[8px] uppercase font-bold tracking-wider opacity-60">Turno</span>
                    <span className="text-xl font-mono font-black">{state.turnCount}</span>
                </div>
            </div>

            {/* Secondary Info: State Money & Weather */}
            <div className="w-full flex gap-2">
                {/* State Treasury - CLICKABLE TO STEAL */}
                <div 
                    onClick={() => dispatch && dispatch({type: 'STEAL_TREASURY'})}
                    className="flex-1 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-emerald-500/30 flex flex-col justify-center shadow-lg cursor-pointer group hover:border-red-500 hover:bg-red-900/20 transition-all relative overflow-hidden"
                    title="⚠️ ¡CLICK PARA ROBAR AL ESTADO! (Riesgo de cárcel)"
                >
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider mb-0.5 group-hover:text-red-400 transition-colors flex justify-between">
                        <span>Arcas</span>
                        <span className="opacity-0 group-hover:opacity-100 text-[8px]">🕵️ ROBAR</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm tracking-tight truncate group-hover:text-white transition-colors">
                        ${state.estadoMoney.toLocaleString()}
                    </span>
                </div>

                {/* Environment (Clickable for Forecast) */}
                <div 
                    onClick={() => dispatch && dispatch({type: 'TOGGLE_WEATHER_MODAL'})}
                    className="flex-1 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 flex flex-col items-center justify-center shadow-lg cursor-pointer hover:bg-slate-800 transition-colors"
                    title="Ver Previsión Meteorológica"
                >
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Mundo</span>
                    <div className="flex gap-2 text-sm">
                        <span>{dayIcon}</span>
                        <span>{weatherIcon}</span>
                    </div>
                </div>
            </div>

            {/* --- PLAYER HUB (Lista Interactiva) --- */}
            <div className="w-full flex flex-col gap-1 bg-black/60 backdrop-blur-md rounded-xl p-2 border border-white/10 shadow-xl overflow-hidden">
                <div className="flex justify-between items-center px-1 mb-1 border-b border-white/5 pb-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Jugadores</span>
                    <span className="text-[9px] text-slate-600 font-mono">{state.players.filter(p=>p.alive).length} Vivos</span>
                </div>
                
                {state.players.map((p, idx) => {
                    const isCurrent = p.id === currentPlayerId;
                    const isNext = p.id === nextPlayerId;
                    const isMe = p.id === currentPlayerId;

                    return (
                        <div 
                            key={p.id}
                            onClick={() => {
                                if (!isMe && dispatch) {
                                    dispatch({ type: 'OPEN_TRADE_WITH', payload: p.id });
                                }
                            }}
                            className={`
                                flex items-center justify-between p-2 rounded-lg border transition-all duration-200 group relative w-full
                                ${isCurrent 
                                    ? 'bg-slate-800 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                                    : 'bg-slate-900/60 border-transparent hover:bg-slate-800 hover:border-slate-600 cursor-pointer'
                                }
                                ${!p.alive ? 'opacity-40 grayscale pointer-events-none' : ''}
                            `}
                            title={!isMe ? "Click para negociar" : "Eres tú"}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {/* Avatar Container */}
                                <div className="relative shrink-0">
                                    <div className="w-6 h-6 rounded flex items-center justify-center text-sm bg-slate-950 border border-slate-700 shadow-sm">
                                        {p.avatar}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-black shadow-sm" style={{backgroundColor: p.color}}></div>
                                </div>
                                
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-xs font-bold leading-none truncate max-w-[80px] ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                                        {p.name}
                                    </span>
                                    {isCurrent && <span className="text-[8px] text-blue-400 font-bold leading-none mt-0.5">JUGANDO</span>}
                                    {isNext && !isCurrent && <span className="text-[8px] text-gray-500 font-bold leading-none mt-0.5">SIGUIENTE</span>}
                                    {!p.alive && <span className="text-[8px] text-red-500 font-bold leading-none mt-0.5">ELIMINADO</span>}
                                </div>
                            </div>

                            <div className="text-right shrink-0 ml-2">
                                <span className={`font-mono text-xs font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {formatMoney(p.money)}
                                </span>
                            </div>

                            {/* Hover Trade Icon */}
                            {!isMe && p.alive && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-[9px] px-2 py-1 rounded font-bold shadow-lg">
                                    NEGOCIAR
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
