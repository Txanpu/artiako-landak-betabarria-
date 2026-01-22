
import React from 'react';
import { GameState, Player } from '../../types';
import { SnortSlider } from '../ui/SnortSlider';
import { useActionPermissions } from '../../hooks/useActionPermissions';

interface Props {
    state: GameState;
    player: Player;
    onRoll: () => void;
    isRolling: boolean;
    dispatch: React.Dispatch<any>;
}

export const ActionPanel: React.FC<Props> = ({ state, player, onRoll, isRolling, dispatch }) => {
    // Logic extracted to custom hook for cleanliness
    const { 
        currentTile, 
        actions, 
        roles, 
        drugState, 
        ability, 
        global 
    } = useActionPermissions(state, player);

    return (
        <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-800">
            {/* MAIN ACTION AREA (Full Width) */}
            <div className="col-span-4 mb-2">
                {global.isElectionOpen ? (
                    <div className="w-full bg-blue-900/50 border border-blue-500 text-blue-200 text-center py-4 rounded-xl animate-pulse font-bold">
                        🗳️ ELECCIONES EN CURSO...
                    </div>
                ) : !state.rolled && state.pendingMoves === 0 && !isRolling ? (
                    <div className="flex flex-col gap-2">
                        {/* 1. ROLL BUTTON */}
                        <button 
                            onClick={onRoll} 
                            disabled={isRolling} 
                            className={`w-full relative overflow-hidden group py-4 rounded-xl shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                ${drugState.isHigh 
                                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-800 hover:from-pink-500 hover:to-purple-500' 
                                    : 'bg-gradient-to-r from-emerald-600 to-green-600 border-emerald-800 hover:from-emerald-500 hover:to-green-500'}
                            `}
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                            <span className="relative z-10 text-white font-black text-xl tracking-widest uppercase flex items-center justify-center gap-2 drop-shadow-md">
                                {drugState.isHigh ? 'TIRADA TRIPLE' : 'TIRAR DADOS'}
                                <span className={`${isRolling ? 'animate-spin' : 'animate-bounce'}`}>🎲</span>
                            </span>
                        </button>

                        {/* 2. SNORT SLIDER */}
                        {drugState.hasStash && !drugState.isHigh && (
                            <SnortSlider onComplete={() => dispatch({type: 'CONSUME_FARLOPA'})} />
                        )}
                        
                        {drugState.isHigh && (
                            <div className="text-center text-[10px] text-pink-400 font-bold uppercase tracking-widest animate-pulse mt-1">
                                ¡EFECTO ACTIVO! ({player.highTurns} turnos)
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full min-h-[60px] flex items-center justify-center">
                        {state.pendingMoves > 0 ? (
                            <div className="text-yellow-400 font-bold text-sm uppercase tracking-widest animate-pulse border border-yellow-500/30 px-4 py-2 rounded bg-yellow-500/10">
                                Movimiento en curso...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {actions.canBuyFarlopa && (
                                    <button onClick={() => dispatch({type: 'GET_FARLOPA', payload: {cost: 100}})} disabled={player.money < 100} className="col-span-2 bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-500 text-indigo-100 py-2 rounded text-xs font-bold uppercase shadow-sm">
                                        Comprar "Material" ($100)
                                    </button>
                                )}
                                {actions.canGetFreeFarlopa && (
                                    <button onClick={() => dispatch({type: 'GET_FARLOPA', payload: {cost: 0}})} className="col-span-2 bg-green-900/80 hover:bg-green-800 border border-green-500 text-green-100 py-2 rounded text-xs font-bold uppercase animate-pulse shadow-sm">
                                        Recoger Paquete Gratis
                                    </button>
                                )}

                                {actions.canBuy && <ActionButton label="COMPRAR" sub={`$${currentTile.price}`} color="blue" onClick={() => dispatch({type: 'BUY_PROP'})} />}
                                {actions.allowAuction && <ActionButton label="SUBASTAR" color="purple" onClick={() => dispatch({type: 'START_AUCTION', payload: currentTile.id})} />}
                                {actions.mustPayRent && <ActionButton label="PAGAR RENTA" color="red" onClick={() => dispatch({type: 'PAY_RENT'})} fullWidth />}
                                
                                {actions.isBlocked && (
                                    <div className="col-span-2 bg-red-950/50 border border-red-900 text-red-400 p-2 rounded text-[10px] text-center uppercase font-bold">
                                        🚫 Compra bloqueada por el Gobierno
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => dispatch({type: 'END_TURN'})} 
                                    className="col-span-2 mt-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider text-sm"
                                >
                                    Finalizar Turno
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SECONDARY ACTIONS (Icons) */}
            
            {/* GENDER ABILITY BUTTON */}
            <button 
                onClick={() => dispatch({ type: 'TRIGGER_GENDER_ABILITY' })}
                disabled={!ability.canUse || global.isElectionOpen}
                className={`group rounded-lg flex flex-col items-center justify-center p-1 border transition-all relative overflow-hidden shadow-sm active:scale-95
                    ${ability.canUse && !global.isElectionOpen
                        ? (player.gender === 'female' ? 'bg-pink-900/50 border-pink-500 text-pink-400 hover:bg-pink-800' : 
                           player.gender === 'helicoptero' ? 'bg-orange-900/50 border-orange-500 text-orange-400 hover:bg-orange-800' :
                           player.gender === 'marcianito' ? 'bg-green-900/50 border-green-500 text-green-400 hover:bg-green-800' :
                           'bg-blue-900/50 border-blue-500 text-blue-400 hover:bg-blue-800')
                        : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed opacity-60'
                    }
                `}
                title={`${ability.config.name}: ${ability.config.desc}`}
            >
                <span className="text-xl relative z-10">{ability.config.icon}</span>
                {!ability.canUse && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 font-black text-[10px] text-white backdrop-blur-[1px]">
                        {ability.cooldown}t
                    </div>
                )}
            </button>

            <IconButton icon={state.viewFullBoard ? "🔍" : "🗺️"} label="Mapa" onClick={() => dispatch({type: 'TOGGLE_FULL_BOARD'})} />
            <IconButton icon="🤝" label="Trade" onClick={() => dispatch({type: 'PROPOSE_TRADE'})} />
            <IconButton icon="🏦" label="Banco" onClick={() => dispatch({type: 'TOGGLE_BANK_MODAL'})} />
            <IconButton icon="📈" label="Stats" onClick={() => dispatch({type: 'TOGGLE_BALANCE_MODAL'})} />
            <IconButton icon="📜" label="Logs" onClick={() => dispatch({type: 'TOGGLE_LOGS_MODAL'})} />
            
            {/* Dark Web Button (Hacker) */}
            {roles.isHacker && (
                <button 
                    onClick={() => dispatch({type: 'TOGGLE_DARK_WEB'})} 
                    className="rounded-lg flex flex-col items-center justify-center p-1 border transition-all relative overflow-hidden group bg-black border-green-500/50 text-green-500 hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                    title="Acceso Dark Web"
                >
                    <span className="text-xl relative z-10">🕸️</span>
                    <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"></div>
                </button>
            )}

            {/* FBI Dossier Button (FBI) */}
            {roles.isFbi && (
                <button 
                    onClick={() => dispatch({type: 'TOGGLE_FBI_MODAL'})} 
                    className="rounded-lg flex flex-col items-center justify-center p-1 border transition-all relative overflow-hidden group bg-slate-900 border-green-700 text-green-400 hover:border-green-500 hover:bg-slate-800"
                    title="Investigación Federal"
                >
                    <span className="text-xl relative z-10">🕵️</span>
                </button>
            )}
        </div>
    );
};

// Helper Components
const ActionButton = ({ label, sub, color, onClick, fullWidth }: any) => {
    const colors = {
        blue: 'bg-blue-600 hover:bg-blue-500 border-blue-800',
        purple: 'bg-purple-600 hover:bg-purple-500 border-purple-800',
        red: 'bg-red-600 hover:bg-red-500 border-red-800'
    };
    const c = colors[color as keyof typeof colors] || colors.blue;

    return (
        <button 
            onClick={onClick} 
            className={`${fullWidth ? 'col-span-2' : ''} ${c} text-white py-2 px-1 rounded-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md flex flex-col items-center justify-center`}
        >
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">{label}</span>
            {sub && <span className="text-[9px] font-mono opacity-80 leading-none mt-0.5">{sub}</span>}
        </button>
    );
};

const IconButton = ({ icon, label, onClick }: any) => (
    <button 
        onClick={onClick}
        className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white rounded-lg p-2 flex flex-col items-center justify-center gap-0.5 transition-all shadow-sm active:scale-95"
        title={label}
    >
        <span className="text-lg leading-none">{icon}</span>
    </button>
);
