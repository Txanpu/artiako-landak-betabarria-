
import React from 'react';
import { GameState } from '../types';

export const GameHUD: React.FC<{ state: GameState, dispatch?: React.Dispatch<any> }> = ({ state, dispatch }) => {
    // Mapping colors based on Gov type
    const govStyle = {
        anarchy: 'text-red-500 border-red-500/30 shadow-red-900/20',
        authoritarian: 'text-purple-400 border-purple-500/30 shadow-purple-900/20',
        libertarian: 'text-yellow-400 border-yellow-500/30 shadow-yellow-900/20',
        left: 'text-rose-400 border-rose-500/30 shadow-rose-900/20',
        right: 'text-blue-400 border-blue-500/30 shadow-blue-900/20'
    }[state.gov] || 'text-gray-400 border-gray-500/30';

    const weatherIcon = state.world.weather === 'rain' ? '🌧️' : state.world.weather === 'heatwave' ? '🔥' : '☀️';
    const dayIcon = state.world.isNight ? '🌙' : '☀️';

    return (
        <div className="absolute top-4 left-4 z-30 pointer-events-auto select-none flex flex-col items-start gap-2">
            {/* Main Badge: Government & Turn */}
            <div 
                onClick={() => dispatch && dispatch({type: 'TOGGLE_GOV_GUIDE'})}
                className={`
                    flex items-center gap-3 px-4 py-2 rounded-full 
                    bg-[#0f172a]/80 backdrop-blur-md border shadow-lg 
                    cursor-pointer hover:scale-105 transition-transform active:scale-95
                    ${govStyle}
                `}
                title="Click para ver Guía de Gobierno"
            >
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80 flex items-center gap-1">
                        Gobierno <span className="text-[8px]">ℹ️</span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-tighter">{state.gov}</span>
                </div>
                
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                
                <div className="flex flex-col leading-none items-end text-gray-300">
                    <span className="text-[8px] uppercase font-bold tracking-wider opacity-60">Turno</span>
                    <span className="text-sm font-mono font-bold text-white">{state.turnCount}</span>
                </div>
            </div>

            {/* Secondary Info: State Money & Weather */}
            <div className="flex items-center gap-2 scale-90 origin-top-left opacity-90 pointer-events-none">
                {/* State Treasury */}
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-2 shadow-md pointer-events-auto">
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Arcas</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">${state.estadoMoney}</span>
                </div>

                {/* Environment (Clickable for Forecast) */}
                <div 
                    onClick={() => dispatch && dispatch({type: 'TOGGLE_WEATHER_MODAL'})}
                    className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-md text-sm cursor-pointer hover:bg-black/80 pointer-events-auto transition-colors"
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
