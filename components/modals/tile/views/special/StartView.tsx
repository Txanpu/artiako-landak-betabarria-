
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
