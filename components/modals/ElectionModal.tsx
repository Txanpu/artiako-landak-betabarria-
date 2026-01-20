
import React from 'react';
import { GameState, GovernmentType } from '../../types';
import { GOV_CONFIGS } from '../../utils/roles';

interface ElectionModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const ElectionModal: React.FC<ElectionModalProps> = ({ state, dispatch }) => {
    if (!state.election || !state.election.isOpen) return null;

    const hasVoted = (pId: number) => state.election?.votedPlayers.includes(pId);
    
    // Auto-vote for bots effect
    React.useEffect(() => {
        const timer = setTimeout(() => {
            state.players.forEach(p => {
                if (p.isBot && !hasVoted(p.id)) {
                    // Bot Vote Logic
                    const opts: GovernmentType[] = ['left', 'right', 'authoritarian', 'libertarian', 'anarchy'];
                    const choice = opts[Math.floor(Math.random() * opts.length)];
                    dispatch({ type: 'VOTE_ELECTION', payload: { pId: p.id, candidate: choice } });
                }
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [state.election, state.players, dispatch]);

    const activePlayers = state.players.filter(p => p.alive && !p.isBot && !hasVoted(p.id));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/90 backdrop-blur p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 text-center border-4 border-blue-600 relative">
                <h2 className="text-4xl font-black text-blue-800 mb-2 uppercase tracking-tighter">🗳️ Elecciones Generales</h2>
                <p className="text-gray-500 mb-8">Elige el destino de Artia. Recuerda: El voto de Florentino vale doble.</p>

                <div className="grid grid-cols-5 gap-2 mb-8">
                    {(['left', 'right', 'authoritarian', 'libertarian', 'anarchy'] as GovernmentType[]).map(gov => (
                        <div key={gov} className="border p-2 rounded bg-gray-50 hover:bg-blue-50 transition">
                            <div className="font-bold uppercase text-xs mb-1">{gov}</div>
                            <div className="text-[10px] text-gray-600">
                                Tax: {GOV_CONFIGS[gov].tax*100}%<br/>
                                Ayudas: {GOV_CONFIGS[gov].welfare*100}%
                            </div>
                            {/* Vote Count Visualization (Hidden in real poll usually, but fun here) */}
                            <div className="mt-2 h-2 bg-gray-200 rounded overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all" style={{width: `${(state.election?.votes[gov] || 0) * 10}%`}}></div>
                            </div>
                            <div className="text-xs font-bold mt-1">{state.election?.votes[gov] || 0}</div>
                        </div>
                    ))}
                </div>

                {activePlayers.length > 0 ? (
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <h3 className="font-bold text-blue-800 mb-4">Vota ahora: {activePlayers[0].name}</h3>
                        <div className="flex justify-center gap-2">
                            {(['left', 'right', 'authoritarian', 'libertarian', 'anarchy'] as GovernmentType[]).map(gov => (
                                <button 
                                    key={gov}
                                    onClick={() => dispatch({type: 'VOTE_ELECTION', payload: { pId: activePlayers[0].id, candidate: gov }})}
                                    className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded hover:bg-blue-500 hover:text-white capitalize"
                                >
                                    {gov}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in zoom-in">
                        <div className="text-xl font-bold text-green-600 mb-4">¡Votación Completada!</div>
                        <button 
                            onClick={() => dispatch({type: 'FINISH_ELECTION'})}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition"
                        >
                            RECONTAR Y PROCLAMAR
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
