
import React from 'react';
import { TileData, Player, GameState } from '../../../../../types';

interface Props {
    t: TileData;
    currentPlayer: Player;
    close: () => void;
    dispatch: React.Dispatch<any>;
    state: GameState; // Added state
}

export const GreyhoundView: React.FC<Props> = ({ t, currentPlayer, close, dispatch, state }) => {
    const isAtLocation = currentPlayer.pos === t.id;
    const isClosed = state.gov === 'left';

    return (
        <div className="bg-[#2a1b12] text-white w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.5)] border-4 border-yellow-700 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            {isClosed && (
                <div className="absolute inset-0 bg-[#2a1b12]/95 z-20 flex flex-col items-center justify-center text-center p-6">
                    <div className="text-6xl mb-4 grayscale opacity-50">🐕</div>
                    <div className="text-xl font-black text-orange-500 uppercase tracking-widest border-b-2 border-orange-500 pb-2 mb-2">
                        CARRERAS SUSPENDIDAS
                    </div>
                    <p className="text-xs text-gray-400">
                        El Gobierno de Izquierdas ha prohibido la explotación animal con fines de lucro.
                    </p>
                    <button onClick={close} className="mt-8 px-6 py-2 bg-slate-800 rounded font-bold text-xs hover:bg-slate-700">Entendido</button>
                </div>
            )}

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
                
                {isAtLocation ? (
                    <button 
                        onClick={() => { close(); dispatch({type: 'START_GREYHOUNDS'}); }} 
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white font-black py-4 rounded-xl shadow-[0_5px_0_rgb(120,53,15)] active:shadow-none active:translate-y-[5px] transition-all text-xl flex items-center justify-center gap-3 border border-yellow-400/30"
                    >
                        <span className="relative z-10 tracking-widest">ENTRAR AL RUEDO</span>
                        <span className="text-2xl relative z-10 group-hover:translate-x-1 transition-transform">🏁</span>
                        {/* Shine effect */}
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-shine"></div>
                    </button>
                ) : (
                    <div className="w-full bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-xl text-center mb-2">
                        <p className="text-yellow-500 font-bold text-xs uppercase tracking-widest">Solo Presencial</p>
                        <p className="text-yellow-200/50 text-[10px] mt-1">Debes estar en el Canódromo para apostar.</p>
                    </div>
                )}
                
                <button onClick={close} className="mt-4 text-xs text-yellow-700 hover:text-yellow-500 font-bold uppercase tracking-wide">
                    Cerrar
                </button>
            </div>
        </div>
    );
};
