
import React from 'react';
import { GameState } from '../../types';
import { BASQUE_AVATARS } from '../../constants';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const AvatarSelectorModal: React.FC<Props> = ({ state, dispatch }) => {
    if (!state.showAvatarSelection) return null;

    const currentPlayer = state.players[state.currentPlayerIndex];

    const selectAvatar = (icon: string) => {
        dispatch({
            type: 'CHANGE_AVATAR', 
            payload: { pId: currentPlayer.id, newAvatar: icon }
        });
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-sans" onClick={() => dispatch({type: 'TOGGLE_AVATAR_SELECTION'})}>
            <div className="w-full max-w-4xl bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-emerald-900 to-slate-900 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                            ELIGE TU ICONO <span className="text-emerald-400">VASCO</span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Personaliza tu ficha. <span className="text-red-400">Si alguien lo tiene, no puedes cogerlo.</span>
                        </p>
                    </div>
                    <button onClick={() => dispatch({type: 'TOGGLE_AVATAR_SELECTION'})} className="text-slate-500 hover:text-white text-3xl font-bold">✕</button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {BASQUE_AVATARS.map((avatar) => {
                            // Check if taken by OTHER players
                            const isTaken = state.players.some(p => p.avatar === avatar.icon && p.id !== currentPlayer.id);
                            const isMine = currentPlayer.avatar === avatar.icon;
                            const takenBy = state.players.find(p => p.avatar === avatar.icon && p.id !== currentPlayer.id);

                            return (
                                <button
                                    key={avatar.id}
                                    disabled={isTaken}
                                    onClick={() => !isMine && selectAvatar(avatar.icon)}
                                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group
                                        ${isMine 
                                            ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-default' 
                                            : isTaken 
                                                ? 'bg-slate-900 border-slate-800 opacity-50 grayscale cursor-not-allowed'
                                                : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1'
                                        }
                                    `}
                                >
                                    <div className={`text-6xl mb-2 transition-transform duration-300 ${!isTaken && !isMine ? 'group-hover:scale-110' : ''}`}>
                                        {avatar.icon}
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className={`font-bold text-sm uppercase ${isMine ? 'text-emerald-400' : 'text-white'}`}>
                                            {avatar.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 leading-tight mt-1">
                                            {avatar.desc}
                                        </div>
                                    </div>

                                    {/* Status Badges */}
                                    {isMine && (
                                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                            TUYO
                                        </div>
                                    )}
                                    {isTaken && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                                            <div className="bg-red-900/80 text-red-200 text-xs font-bold px-3 py-1 rounded border border-red-500">
                                                USADO POR {takenBy?.name}
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-700 text-center">
                    <button onClick={() => dispatch({type: 'TOGGLE_AVATAR_SELECTION'})} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-600 transition-colors">
                        Cerrar Menú
                    </button>
                </div>
            </div>
        </div>
    );
};
