
import React from 'react';
import { TileData } from '../../../../../types';
import { FUNNY } from '../../../../../constants';

interface Props {
    t: TileData;
    close: () => void;
    dispatch: React.Dispatch<any>;
}

export const StartView: React.FC<Props> = ({ t, close, dispatch }) => {
    const quote = FUNNY[t.type] || "Salidas como tu madre.";
    
    return (
        <div className="bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.4)] border-4 border-emerald-500 animate-in zoom-in-95 relative font-sans" onClick={e => e.stopPropagation()}>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-slate-900 opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent z-0"></div>
            
            <div className="relative z-10 p-8 flex flex-col items-center text-center">
                
                {/* Big Icon Container */}
                <div className="relative mb-6 group cursor-default">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-2xl relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                        <span className="text-5xl drop-shadow-md">🚩</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-black text-xs px-2 py-1 rounded-full border-2 border-slate-900 transform rotate-12 shadow-lg animate-bounce">
                        +$200
                    </div>
                </div>

                {/* Titles */}
                <div className="mb-6">
                    <h2 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl uppercase" style={{textShadow: '0 4px 0 #064e3b'}}>
                        SALIDA
                    </h2>
                    <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full mt-2"></div>
                </div>

                {/* Flavor Text Card */}
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 w-full backdrop-blur-sm mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-full transition-all duration-500 opacity-20"></div>
                    <p className="text-emerald-100 text-sm font-medium italic relative z-10">
                        "{quote}"
                    </p>
                </div>

                {/* Info Text */}
                <p className="text-slate-400 text-xs mb-6 max-w-[220px] leading-relaxed">
                    Recoge tu salario del Estado cada vez que completes una vuelta al tablero.
                </p>

                <div className="space-y-3 w-full">
                    <button 
                        onClick={close} 
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg border-b-4 border-emerald-800 active:scale-95 active:border-b-0 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 group"
                    >
                        <span>Continuar</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export const GreyhoundView: React.FC<Props> = ({ close, dispatch }) => (
    <div className="bg-[#2a1b12] text-white w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.5)] border-4 border-yellow-700 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
        {/* Dirt Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dirt-road.png')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>

        <div className="p-8 text-center flex flex-col items-center relative z-10">
            {/* Header Ticket Style */}
            <div className="bg-yellow-500 text-black font-black text-xs px-4 py-1 rounded-full mb-6 border-2 border-yellow-300 shadow-lg tracking-widest uppercase transform -rotate-2">
                🎟️ Ticket de Apuesta
            </div>

            <div className="relative mb-4">
                <div className="text-7xl animate-bounce filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] transform -scale-x-100">🐕</div>
                <div className="absolute -bottom-2 -right-4 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded border border-white rotate-12">EN VIVO</div>
            </div>

            <h2 className="text-4xl font-black uppercase text-yellow-500 mb-1 tracking-tighter drop-shadow-xl" style={{textShadow: '3px 3px 0px #000'}}>
                CANÓDROMO
            </h2>
            <div className="text-yellow-700 font-serif font-bold tracking-widest text-xs mb-6">MUNICIPAL DE ARTIA</div>
            
            <div className="bg-black/50 p-4 rounded-lg border border-yellow-700/50 w-full mb-6 backdrop-blur-sm">
                <p className="text-yellow-100/90 italic text-sm font-medium">
                    "Donde la velocidad se paga en efectivo. Apostar es ganar... a veces."
                </p>
                <div className="flex justify-center gap-4 mt-3 text-[10px] text-gray-400 font-mono border-t border-white/10 pt-2">
                    <span>MIN: $10</span>
                    <span>MAX: $10,000</span>
                </div>
            </div>
            
            <button 
                onClick={() => { close(); dispatch({type: 'START_GREYHOUNDS'}); }} 
                className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white font-black py-4 rounded-xl shadow-[0_5px_0_rgb(120,53,15)] active:shadow-none active:translate-y-[5px] transition-all text-xl flex items-center justify-center gap-3 border border-yellow-400/30"
            >
                <span className="relative z-10 tracking-widest">ENTRAR AL RUEDO</span>
                <span className="text-2xl relative z-10 group-hover:translate-x-1 transition-transform">🏁</span>
                {/* Shine effect */}
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-shine"></div>
            </button>
            
            <button onClick={close} className="mt-6 text-xs text-yellow-700 hover:text-yellow-500 font-bold uppercase tracking-wide">
                No, gracias. Soy aburrido.
            </button>
        </div>
    </div>
);

export const ParkView: React.FC<Props> = ({ close }) => (
    <div className="bg-gradient-to-b from-emerald-800 to-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-emerald-500 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center">
            <div className="text-6xl mb-4">🌳</div>
            <h2 className="text-3xl font-black text-emerald-300 mb-2">PARKIE</h2>
            <div className="text-[10px] bg-emerald-900/50 text-emerald-200 px-2 py-1 rounded inline-block mb-4 border border-emerald-700">ZONA DE INTERCAMBIO</div>
            
            <div className="bg-black/30 p-4 rounded-lg backdrop-blur-sm mb-6 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-400 text-sm mb-2 animate-pulse">⚡ EFECTO CAOS ⚡</h4>
                <p className="text-xs text-gray-200">
                    Al entrar en el Parkie, las identidades se mezclan en la oscuridad...
                    <br/><br/>
                    <span className="font-bold text-yellow-300">¡SE HAN REASIGNADO LOS ROLES DE TODOS LOS JUGADORES!</span>
                </p>
            </div>
            
            <button onClick={close} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-full font-bold shadow-lg">Entendido</button>
        </div>
    </div>
);

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

export const DefaultView: React.FC<Props> = ({ t, close }) => (
    <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="py-4 text-center p-6">
            <div className="text-gray-500 italic mb-4">Casilla Especial<br/><span className="text-white font-bold not-italic mt-2 block">{t.type.toUpperCase()}</span></div>
            <div className="bg-slate-800 p-4 rounded text-yellow-500 font-medium border border-slate-700 shadow-inner">"{FUNNY[t.type] || FUNNY.default}"</div>
            <button onClick={close} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold border border-slate-600 transition-colors">Cerrar</button>
        </div>
    </div>
);
