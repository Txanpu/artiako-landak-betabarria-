
import React, { useEffect, useRef } from 'react';
import { GameState } from '../../types';
import { MOVES } from '../../utils/minigames/pokemonData';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const PokemonModal: React.FC<Props> = ({ state, dispatch }) => {
    const pk = state.pokemon;
    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [pk?.logs]);

    // Enemy Turn Logic
    useEffect(() => {
        if (pk && pk.isOpen && pk.turn === 'enemy' && pk.phase === 'battle') {
            const timer = setTimeout(() => {
                dispatch({ type: 'POKEMON_ENEMY_MOVE' });
            }, 1500); // 1.5s delay for enemy move
            return () => clearTimeout(timer);
        }
    }, [pk?.turn, pk?.isOpen, dispatch]);

    if (!pk || !pk.isOpen) return null;

    const pMon = pk.playerMon;
    const eMon = pk.enemyMon;

    const pHealth = Math.max(0, (pMon.currentHp / pMon.maxHp) * 100);
    const eHealth = Math.max(0, (eMon.currentHp / eMon.maxHp) * 100);

    const getHealthColor = (pct: number) => pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 font-mono select-none">
            <div className="w-[800px] bg-slate-800 border-4 border-slate-600 rounded-lg overflow-hidden relative shadow-2xl">
                
                {/* --- HEADER --- */}
                <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center border-b border-slate-600">
                    <div className="font-bold text-lg">GYM BATTLE <span className="text-yellow-400">#{pk.streak + 1}/5</span></div>
                    <div className="text-xs text-slate-400">GEN 5 RULES</div>
                </div>

                {/* --- BATTLE SCENE --- */}
                <div className="relative h-64 bg-gradient-to-b from-teal-700 to-green-700 overflow-hidden">
                    
                    {/* Platforms */}
                    <div className="absolute bottom-10 left-12 w-48 h-12 bg-black/30 rounded-[50%] transform scale-y-50"></div>
                    <div className="absolute top-24 right-12 w-40 h-10 bg-black/30 rounded-[50%] transform scale-y-50"></div>

                    {/* Sprites */}
                    <img src={eMon.def.sprite} className="absolute top-8 right-16 w-32 h-32 image-pixelated animate-in slide-in-from-right duration-700" alt="Enemy" />
                    <img src={pMon.def.sprite} className="absolute bottom-8 left-20 w-40 h-40 image-pixelated scale-x-[-1] animate-in slide-in-from-left duration-700" alt="Player" />

                    {/* Enemy HUD */}
                    <div className="absolute top-4 left-4 bg-slate-900/80 p-2 rounded-lg border border-slate-500 w-56 text-white text-xs">
                        <div className="flex justify-between font-bold mb-1">
                            <span>{eMon.name}</span>
                            <span>Lv.50</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden border border-slate-900">
                            <div className={`h-full transition-all duration-500 ${getHealthColor(eHealth)}`} style={{width: `${eHealth}%`}}></div>
                        </div>
                    </div>

                    {/* Player HUD */}
                    <div className="absolute bottom-8 right-4 bg-slate-900/80 p-2 rounded-lg border border-slate-500 w-56 text-white text-xs">
                        <div className="flex justify-between font-bold mb-1">
                            <span>{pMon.name}</span>
                            <span>Lv.50</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden border border-slate-900 mb-1">
                            <div className={`h-full transition-all duration-500 ${getHealthColor(pHealth)}`} style={{width: `${pHealth}%`}}></div>
                        </div>
                        <div className="text-right text-[10px] text-slate-300">{pMon.currentHp} / {pMon.maxHp}</div>
                    </div>

                    {/* Overlays */}
                    {pk.phase === 'victory' && (
                        <div className="absolute inset-0 bg-green-500/50 flex flex-col items-center justify-center animate-in zoom-in">
                            <h2 className="text-4xl font-black text-white drop-shadow-lg mb-4">¡VICTORIA!</h2>
                            <button onClick={() => dispatch({type: 'POKEMON_CLOSE_WIN'})} className="bg-white text-green-700 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition">RECOGER MEDALLA</button>
                        </div>
                    )}
                    
                    {pk.phase === 'defeat' && (
                        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center animate-in zoom-in">
                            <h2 className="text-4xl font-black text-white drop-shadow-lg mb-4">DERROTADO</h2>
                            <button onClick={() => dispatch({type: 'POKEMON_CLOSE_LOSS'})} className="bg-white text-red-700 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition">PAGAR DOBLE RENTA</button>
                        </div>
                    )}
                </div>

                {/* --- CONTROLS --- */}
                <div className="h-40 bg-slate-800 p-4 grid grid-cols-2 gap-4">
                    
                    {/* Logs */}
                    <div className="bg-slate-950 border border-slate-600 rounded p-2 text-[10px] text-green-400 font-mono overflow-y-auto custom-scrollbar flex flex-col gap-1">
                        {pk.logs.map((l, i) => <div key={i}>> {l}</div>)}
                        <div ref={logEndRef}></div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        {pk.turn === 'player' && pk.phase === 'battle' ? (
                            pMon.moves.map((moveName: string) => {
                                const m = MOVES[moveName];
                                let typeColor = 'bg-gray-500';
                                if (m.type === 'Fire') typeColor = 'bg-orange-600';
                                if (m.type === 'Water') typeColor = 'bg-blue-600';
                                if (m.type === 'Grass') typeColor = 'bg-green-600';
                                if (m.type === 'Electric') typeColor = 'bg-yellow-600';
                                if (m.type === 'Ground') typeColor = 'bg-yellow-800';
                                if (m.type === 'Dragon') typeColor = 'bg-indigo-700';
                                if (m.type === 'Fighting') typeColor = 'bg-red-700';
                                if (m.type === 'Rock') typeColor = 'bg-stone-600';
                                if (m.type === 'Dark') typeColor = 'bg-slate-900 border border-slate-600';
                                if (m.type === 'Bug') typeColor = 'bg-lime-700';
                                if (m.type === 'Steel') typeColor = 'bg-slate-500';

                                return (
                                    <button 
                                        key={moveName} 
                                        onClick={() => dispatch({type: 'POKEMON_ATTACK', payload: {move: moveName}})}
                                        className={`${typeColor} text-white font-bold rounded shadow-md hover:brightness-110 active:scale-95 transition-all text-xs flex flex-col justify-center items-center`}
                                    >
                                        <span>{moveName}</span>
                                        <span className="text-[9px] opacity-70 uppercase">{m.type}</span>
                                    </button>
                                )
                            })
                        ) : pk.turn === 'end' ? (
                            <div className="col-span-2 flex items-center justify-center">
                                <button 
                                    onClick={() => dispatch({type: 'POKEMON_NEXT_ROUND'})}
                                    className="bg-yellow-500 text-black font-black py-3 px-8 rounded-full shadow-lg animate-bounce"
                                >
                                    SIGUIENTE RIVAL ▶
                                </button>
                            </div>
                        ) : (
                            <div className="col-span-2 flex items-center justify-center text-slate-500 italic">
                                Esperando...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
