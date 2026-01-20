
import React from 'react';
import { GameState, WeatherType } from '../../types';

interface WeatherModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ state, dispatch }) => {
    if (!state.showWeatherModal) return null;

    const currentWeather = state.world.weather;
    const forecast = state.world.forecast || [];

    const weatherInfo: Record<WeatherType, { icon: string, title: string, desc: string, color: string }> = {
        sunny: {
            icon: '☀️',
            title: 'Soleado',
            desc: 'Condiciones normales. Sin efectos adversos.',
            color: 'text-yellow-400'
        },
        rain: {
            icon: '🌧️',
            title: 'Lluvia',
            desc: 'Tráfico lento. Se resta -1 al movimiento de todos los jugadores.',
            color: 'text-blue-400'
        },
        heatwave: {
            icon: '🔥',
            title: 'Ola de Calor',
            desc: 'La gente no sale de casa. No se cobra alquiler en propiedades normales (calles).',
            color: 'text-orange-500'
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={() => dispatch({type: 'TOGGLE_WEATHER_MODAL'})}>
            <div className="bg-slate-900 border-2 border-blue-500 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-center border-b border-blue-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter relative z-10">
                        📺 EL TIEMPO EN ARTIA
                    </h2>
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-widest relative z-10 mt-1">
                        Previsión Meteorológica Oficial
                    </p>
                    <button onClick={() => dispatch({type: 'TOGGLE_WEATHER_MODAL'})} className="absolute top-2 right-2 text-blue-300 hover:text-white font-bold text-xl">✕</button>
                </div>

                <div className="p-6">
                    {/* Current Weather */}
                    <div className="flex items-center gap-6 mb-8 bg-slate-800 p-4 rounded-xl border border-slate-600">
                        <div className="text-6xl animate-pulse filter drop-shadow-lg">
                            {weatherInfo[currentWeather].icon}
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Ahora mismo</div>
                            <h3 className={`text-2xl font-black uppercase ${weatherInfo[currentWeather].color}`}>
                                {weatherInfo[currentWeather].title}
                            </h3>
                            <p className="text-sm text-gray-300 leading-tight mt-1">
                                {weatherInfo[currentWeather].desc}
                            </p>
                        </div>
                    </div>

                    {/* Forecast */}
                    <h4 className="text-gray-400 font-bold text-xs uppercase mb-3 tracking-wider">Próximos Cambios (Forecast)</h4>
                    <div className="grid grid-cols-5 gap-2 mb-8">
                        {forecast.slice(0, 5).map((w, i) => (
                            <div key={i} className="bg-slate-800/50 p-2 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-gray-500 mb-1">+{i+1}</span>
                                <span className="text-2xl mb-1 filter drop-shadow-md">{weatherInfo[w].icon}</span>
                                <span className={`text-[9px] font-bold uppercase ${weatherInfo[w].color}`}>{weatherInfo[w].title}</span>
                            </div>
                        ))}
                    </div>

                    {/* Legend / Guide */}
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <h4 className="text-gray-500 font-bold text-[10px] uppercase mb-2 text-center">Guía de Efectos</h4>
                        <div className="space-y-2">
                            {Object.entries(weatherInfo).map(([key, info]) => (
                                <div key={key} className="flex items-start gap-2 text-xs">
                                    <span className="text-lg leading-none">{info.icon}</span>
                                    <div>
                                        <span className={`font-bold ${info.color}`}>{info.title}:</span> <span className="text-gray-400">{info.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950 p-3 text-center border-t border-slate-800">
                    <button onClick={() => dispatch({type: 'TOGGLE_WEATHER_MODAL'})} className="text-xs text-slate-500 hover:text-white underline">
                        Cerrar Parte Meteorológico
                    </button>
                </div>
            </div>
        </div>
    );
};
