
import React from 'react';
import { Player, GameState } from '../../../../../types';
import { getJailFine, formatMoney } from '../../../../../utils/gameLogic';

interface Props {
    state?: GameState;
    currentPlayer: Player;
    dispatch: React.Dispatch<any>;
    close: () => void;
}

export const GotoJailView: React.FC<Props> = ({ close }) => (
    <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border-4 border-blue-600 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-600 via-transparent to-blue-600 animate-pulse"></div>
        <div className="p-8 text-center flex flex-col items-center">
            <div className="text-6xl mb-4 animate-bounce">🚓</div>
            <h2 className="text-3xl font-black uppercase text-blue-500 mb-2 tracking-tighter">¡ALTO AHÍ!</h2>
            <div className="bg-slate-800 p-4 rounded border border-slate-700 w-full mb-4">
                <p className="text-sm text-gray-400">Si caes aquí, vas directo al calabozo sin pasar por la casilla de Salida.</p>
                <p className="text-xs text-red-400 mt-2 font-mono uppercase">"No intentes huir"</p>
            </div>
            <button onClick={close} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-full font-bold">Entendido</button>
        </div>
    </div>
);

export const JailView: React.FC<Props> = ({ state, currentPlayer, dispatch, close }) => {
    const isInJail = currentPlayer.jail > 0;
    const bailPrice = state ? getJailFine(state.gov) : 50;
    
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
                        {bailPrice > 0 ? (
                            currentPlayer.money >= bailPrice ? (
                                <button onClick={() => { dispatch({type: 'PAY_JAIL'}); close(); }} className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded shadow-lg font-bold w-full transition-all hover:scale-[1.02]">
                                    Pagar Fianza ({formatMoney(bailPrice)})
                                </button>
                            ) : (
                                <div className="mt-4 text-xs text-red-400 font-bold">No tienes suficiente para la fianza ({formatMoney(bailPrice)}).</div>
                            )
                        ) : (
                            <button onClick={() => { dispatch({type: 'PAY_JAIL'}); close(); }} className="mt-4 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded shadow-lg font-bold w-full">
                                ¡Amnistía! Salir Gratis
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
