
import React from 'react';
import { GameState, TileData, Player, TileType } from '../../../types';
import { GotoJailView, JailView } from './views/special/PrisonViews';
import { BankView, SlotsView, TaxView } from './views/special/EconomicViews';
import { ParkView, EventCardView, StartView, DefaultView, GreyhoundView } from './views/special/MiscViews';
import { GymEntryView } from './views/special/GymEntryView'; // New View

interface SpecialTileModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const SpecialTileModal: React.FC<SpecialTileModalProps> = (props) => {
    const { t, dispatch, currentPlayer, state } = props;
    const close = () => dispatch({type: 'CLOSE_MODAL'});
    const passProps = { ...props, close };

    // Prison Logic
    if (t.type === TileType.GOTOJAIL) return <GotoJailView {...passProps} />;
    if (t.type === TileType.JAIL) return <JailView {...passProps} state={state} />;
    
    // Economic Logic
    if (t.type === TileType.BANK) return <BankView {...passProps} />;
    if (t.type === TileType.SLOTS) return <SlotsView {...passProps} />;
    if (t.type === TileType.TAX) return <TaxView {...passProps} />;

    // Misc Logic
    if (t.type === TileType.START) return <StartView {...passProps} />;
    if (t.type === TileType.PARK) return <ParkView {...passProps} />;
    if (t.name === 'Suerte' || t.name.includes('Comunidad')) return <EventCardView {...passProps} />;
    if (t.subtype === 'greyhound') return <GreyhoundView {...passProps} />;

    // GYM VIEW
    if (t.subtype === 'gym') return <GymEntryView {...passProps} />;

    // QUIZ ENTRY VIEW
    if (t.type === TileType.QUIZ) {
        const isAtLocation = currentPlayer.pos === t.id;
        
        return (
            <div className="bg-slate-900 text-white w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.5)] border-4 border-yellow-500 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
                
                {/* Background Graphics */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-black z-0"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    {/* Header */}
                    <div className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 p-4 border-b-4 border-yellow-500 shadow-lg text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]"></div>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_0px_rgba(0,0,0,1)] transform -skew-x-6">
                            QUIZ MALDINI
                        </h2>
                        <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-[0.4em] mt-1">International Football & Gossip</div>
                    </div>

                    <div className="p-8 text-center w-full">
                        <div className="text-6xl mb-6 animate-pulse filter drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">📺</div>
                        
                        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-600 mb-6 shadow-inner">
                            <p className="text-gray-300 text-sm italic mb-2">
                                "Demuestra tus conocimientos o sal del plató."
                            </p>
                            <div className="flex justify-around items-center text-xs font-bold text-white mt-4 bg-black/40 p-2 rounded">
                                <div className="flex flex-col">
                                    <span className="text-yellow-500">PREMIO</span>
                                    <span>50% ARCAS</span>
                                </div>
                                <div className="w-px h-6 bg-slate-600"></div>
                                <div className="flex flex-col">
                                    <span className="text-red-500">CASTIGO</span>
                                    <span>ELIMINACIÓN</span>
                                </div>
                            </div>
                        </div>
                        
                        {isAtLocation ? (
                            <button 
                                onClick={() => { close(); dispatch({type: 'START_QUIZ'}); }} 
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-black py-4 rounded-xl shadow-xl border-b-4 border-orange-800 active:scale-95 transition-all text-xl uppercase tracking-widest flex items-center justify-center gap-2 group"
                            >
                                <span className="text-2xl group-hover:rotate-12 transition-transform">🎤</span>
                                <span>CONCURSAR</span>
                            </button>
                        ) : (
                            <div className="bg-red-900/50 text-red-300 p-4 rounded-xl border border-red-700 font-bold mb-4 text-xs uppercase tracking-wide">
                                🚫 Debes estar en esta casilla para participar.
                            </div>
                        )}
                        
                        <button onClick={close} className="mt-6 text-xs text-slate-500 hover:text-white underline transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <DefaultView {...passProps} />;
};
