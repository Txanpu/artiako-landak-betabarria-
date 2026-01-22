
import React, { useState } from 'react';
import { GameState } from '../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

const SUSPECT_ROLES = ['proxeneta', 'florentino', 'okupa', 'hacker', 'civil', 'fbi'];

export const FbiModal: React.FC<Props> = ({ state, dispatch }) => {
    if (!state.showFbiModal) return null;

    const fbiPlayer = state.players[state.currentPlayerIndex];
    
    // Only FBI can see this (Security check mainly for bugs, assuming modal only triggers if FBI)
    if (fbiPlayer.role !== 'fbi') {
        return null;
    }

    const targets = state.players.filter(p => p.id !== fbiPlayer.id && p.alive);
    const myGuesses = state.fbiGuesses[fbiPlayer.id] || {};

    const [selectedRole, setSelectedRole] = useState<Record<number, string>>({});

    const handleSelect = (pId: number, role: string) => {
        setSelectedRole(prev => ({ ...prev, [pId]: role }));
    };

    const confirmGuess = (pId: number) => {
        const role = selectedRole[pId];
        if (!role) return;
        dispatch({ type: 'FBI_GUESS', payload: { fbiId: fbiPlayer.id, targetId: pId, roleGuess: role } });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 font-mono">
            <div className="w-full max-w-4xl bg-[#1a1a1a] border-2 border-green-800 rounded shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="bg-green-900/20 p-4 border-b border-green-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🕵️‍♂️</div>
                        <div>
                            <h2 className="text-2xl font-black text-green-500 tracking-widest uppercase">DOSSIER CONFIDENCIAL</h2>
                            <p className="text-[10px] text-green-700 font-bold uppercase">Agencia Federal de Investigación - Artia</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch({type: 'TOGGLE_FBI_MODAL'})} className="text-green-600 hover:text-green-400 font-bold">CERRAR CASO [X]</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/grid-noise.png')]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {targets.map(suspect => {
                            const lastGuess = myGuesses[suspect.id];
                            const isIdentified = lastGuess === suspect.role; // Assuming reducer stores correct guess or we just check reality
                            // Actually, reducer stores what we GUESSED.
                            // We need to check if that guess matches reality to show "IDENTIFIED" status visually here
                            const confirmed = lastGuess === suspect.role;
                            
                            return (
                                <div key={suspect.id} className="bg-black/60 border border-green-900/50 p-4 rounded relative group hover:border-green-600 transition-colors">
                                    {confirmed && (
                                        <div className="absolute top-2 right-2 border-2 border-green-500 text-green-500 text-[10px] font-black px-2 py-1 rounded transform rotate-12 bg-black z-10 animate-pulse">
                                            IDENTIFICADO
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3 mb-3 border-b border-green-900/30 pb-2">
                                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                            {suspect.avatar}
                                        </div>
                                        <div>
                                            <div className="text-green-100 font-bold">{suspect.name}</div>
                                            <div className="text-[10px] text-green-700">Sospechoso #{suspect.id}</div>
                                        </div>
                                    </div>

                                    {confirmed ? (
                                        <div className="text-center py-4">
                                            <span className="text-green-400 font-black text-xl uppercase">{suspect.role}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {lastGuess && !confirmed && (
                                                <div className="text-[10px] text-red-500 text-center bg-red-900/10 p-1 rounded border border-red-900/30 mb-2">
                                                    Fallaste: No es {lastGuess}
                                                </div>
                                            )}
                                            
                                            <label className="text-[10px] text-green-600 font-bold uppercase block">Asignar Rol:</label>
                                            <div className="flex gap-2">
                                                <select 
                                                    className="bg-black border border-green-800 text-green-400 text-xs p-2 rounded flex-1 outline-none focus:border-green-500"
                                                    value={selectedRole[suspect.id] || ''}
                                                    onChange={(e) => handleSelect(suspect.id, e.target.value)}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {SUSPECT_ROLES.filter(r => r !== 'fbi').map(role => (
                                                        <option key={role} value={role}>{role.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                                <button 
                                                    onClick={() => confirmGuess(suspect.id)}
                                                    disabled={!selectedRole[suspect.id]}
                                                    className="bg-green-800 hover:bg-green-700 text-black font-bold px-3 rounded text-xs disabled:opacity-50"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {targets.length === 0 && (
                        <div className="text-center text-green-700 py-10 italic">No hay sospechosos vivos.</div>
                    )}
                </div>

                <div className="bg-black p-2 border-t border-green-900 text-center">
                    <p className="text-[9px] text-green-800 uppercase">
                        Si identificas a todos los criminales, el Estado te recompensará con expropiaciones.
                    </p>
                </div>
            </div>
        </div>
    );
};
