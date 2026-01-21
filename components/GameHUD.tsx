
import React from 'react';
import { GameState } from '../types';

export const GameHUD: React.FC<{ state: GameState, dispatch?: React.Dispatch<any> }> = ({ state, dispatch }) => {
    // VISUAL THEMES FOR GOVERNMENTS
    const govStyle = {
        anarchy: {
            bg: 'bg-red-950/80',
            border: 'border-red-600',
            text: 'text-red-500',
            shadow: 'shadow-[0_0_20px_rgba(220,38,38,0.5)]',
            icon: '🔥'
        },
        authoritarian: {
            bg: 'bg-purple-950/80',
            border: 'border-purple-600',
            text: 'text-purple-400',
            shadow: 'shadow-[0_0_20px_rgba(147,51,234,0.5)]',
            icon: '👮'
        },
        libertarian: {
            bg: 'bg-yellow-900/80',
            border: 'border-yellow-600',
            text: 'text-yellow-400',
            shadow: 'shadow-[0_0_20px_rgba(202,138,4,0.5)]',
            icon: '🐍'
        },
        left: {
            bg: 'bg-rose-900/80',
            border: 'border-rose-500',
            text: 'text-rose-300',
            shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',
            icon: '🌹'
        },
        right: {
            bg: 'bg-blue-900/80',
            border: 'border-blue-500',
            text: 'text-blue-300',
            shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
            icon: '👔'
        }
    }[state.gov] || { bg: 'bg-slate-900', border: 'border-gray-500', text: 'text-gray-400', shadow: '', icon: '' };

    const weatherIcon = state.world.weather === 'rain' ? '🌧️' : state.world.weather === 'heatwave' ? '🔥' : '☀️';
    const dayIcon = state.world.isNight ? '🌙' : '☀️';

    return (
        <div className="absolute top-4 left-4 z-30 pointer-events-auto select-none flex flex-col items-start gap-2">
            {/* Main Badge: Government & Turn */}
            <div 
                onClick={() => dispatch && dispatch({type: 'TOGGLE_GOV_GUIDE'})}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    ${govStyle.bg} backdrop-blur-md border-2 ${govStyle.border} ${govStyle.shadow}
                    cursor-pointer hover:scale-105 transition-transform active:scale-95
                `}
                title="Click para ver Guía de Gobierno"
            >
                <div className="text-2xl filter drop-shadow-md">{govStyle.icon}</div>
                <div className="flex flex-col leading-none">
                    <span className={`text-[9px] uppercase font-black tracking-widest opacity-80 ${govStyle.text}`}>
                        Gobierno
                    </span>
                    <span className="text-base font-black uppercase tracking-tighter text-white drop-shadow-sm">
                        {state.gov}
                    </span>
                </div>
                
                <div className="w-px h-8 bg-white/20 mx-2"></div>
                
                <div className="flex flex-col leading-none items-end text-white">
                    <span className="text-[8px] uppercase font-bold tracking-wider opacity-60">Turno</span>
                    <span className="text-xl font-mono font-black">{state.turnCount}</span>
                </div>
            </div>

            {/* Secondary Info: State Money & Weather */}
            <div className="flex items-center gap-2 scale-90 origin-top-left opacity-90 pointer-events-none">
                {/* State Treasury */}
                <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-2 shadow-lg pointer-events-auto">
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">Arcas</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm tracking-tight">${state.estadoMoney.toLocaleString()}</span>
                </div>

                {/* Environment (Clickable for Forecast) */}
                <div 
                    onClick={() => dispatch && dispatch({type: 'TOGGLE_WEATHER_MODAL'})}
                    className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-lg text-sm cursor-pointer hover:bg-slate-800 pointer-events-auto transition-colors"
                    title="Ver Previsión Meteorológica"
                >
                    <span>{dayIcon}</span>
                    <span className="text-xs text-white/50">•</span>
                    <span>{weatherIcon}</span>
                </div>
            </div>
        </div>
    );
};
