
import React, { useState } from 'react';
import { GameState, TileType } from '../types';
import { formatMoney } from '../utils/gameLogic';
import { canAuction, canBuyDirectly } from '../utils/governmentRules';

interface MobileSidebarProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
    isRolling: boolean;
    displayDice: number[];
    onRoll: () => void;
    onReset: () => void;
    onUndo: () => void;
    canUndo: boolean;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
    state, dispatch, isRolling, displayDice, onRoll, onReset, onUndo, canUndo 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [revealRole, setRevealRole] = useState(false);

    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // --- LOGIC EXTRACTION FOR COMPACT ACTIONS ---
    const currentTile = currentPlayer ? state.tiles[currentPlayer.pos] : null;
    const isOwnerless = currentTile?.type === TileType.PROP && currentTile.owner === null;
    const mustPayRent = currentTile?.type === TileType.PROP && currentTile.owner !== null && currentTile.owner !== currentPlayer?.id && currentTile.owner !== 'E';
    
    const canBuy = isOwnerless && currentPlayer && currentPlayer.money >= (currentTile?.price || 0) && canBuyDirectly(state.gov);
    const allowAuction = isOwnerless && canAuction(state.gov);
    const isBlocked = isOwnerless && state.gov === 'left';
    const isHacker = currentPlayer?.role === 'hacker';

    // Drugs Logic
    const isNight = state.world.isNight;
    const isOzollo = currentTile?.name.includes('Ozollo');
    const isMarko = currentTile?.name.includes('Marko Pollo');
    const isFerry = currentTile?.subtype === 'ferry';
    const canBuyFarlopa = isNight && (isMarko || isFerry);
    const canGetFreeFarlopa = isNight && isOzollo;
    const hasStash = (currentPlayer?.farlopa || 0) > 0;
    const isHigh = (currentPlayer?.highTurns || 0) > 0;

    // Dice visibility
    const showDice = isRolling || state.rolled;
    const d1 = displayDice[0] ?? 1;
    const d2 = displayDice[1] ?? 1;
    const d3 = displayDice[2] ?? 1;

    return (
        <div className="lg:hidden">
            {/* --- TOGGLE BUTTON (HUD STYLE) --- */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-4 right-4 z-[60] flex items-center justify-center w-10 h-10 rounded-lg border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300
                    ${isOpen 
                        ? 'bg-red-900/90 border-red-500 text-red-100' 
                        : 'bg-slate-900/90 border-blue-500 text-blue-200'
                    } backdrop-blur-md`}
            >
                {isOpen ? <span className="font-bold text-lg">✕</span> : <span className="text-xl">☰</span>}
            </button>

            {/* --- BACKDROP --- */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* --- DRAWER CONTENT --- */}
            <div className={`
                fixed inset-y-0 right-0 z-50 w-[85vw] max-w-xs h-full 
                bg-[#0b1120] border-l border-white/10 flex flex-col shadow-2xl
                transform transition-transform duration-300 ease-out font-mono
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                
                {/* 1. TOP SPACING (Header removed, just padding) */}
                <div className="h-4 bg-gradient-to-b from-black/50 to-transparent"></div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {currentPlayer ? (
                        <>
                            {/* 2. PLAYER COMPACT CARD */}
                            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 flex justify-between items-center relative overflow-hidden mt-2">
                                <div className="flex items-center gap-2 z-10">
                                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-lg shadow-inner cursor-pointer hover:border-white border border-transparent transition-colors" style={{borderColor: currentPlayer.color}} onClick={() => dispatch({type: 'TOGGLE_AVATAR_SELECTION'})}>
                                        {currentPlayer.avatar}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-xs truncate max-w-[100px]">{currentPlayer.name}</span>
                                        <button onClick={() => setRevealRole(!revealRole)} className="text-[9px] text-blue-400 text-left hover:text-white transition-colors">
                                            {revealRole ? currentPlayer.role : 'VER ROL'}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right z-10">
                                    <div className="text-emerald-400 font-black text-xl leading-none">{formatMoney(currentPlayer.money)}</div>
                                    {(currentPlayer.farlopa > 0 || currentPlayer.insiderTokens > 0) && (
                                        <div className="text-[9px] text-gray-500 mt-1 flex justify-end gap-1">
                                            {currentPlayer.farlopa > 0 && <span>❄️{currentPlayer.farlopa}</span>}
                                            {currentPlayer.insiderTokens > 0 && <span>🕵️{currentPlayer.insiderTokens}</span>}
                                        </div>
                                    )}
                                </div>
                                {/* BG Tint */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-900/10 z-0"></div>
                            </div>

                            {/* 3. DICE (CONDITIONAL) */}
                            {showDice && (
                                <div className="flex justify-center gap-2 py-1 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-8 h-8 bg-slate-200 text-black font-black flex items-center justify-center rounded shadow text-lg">{d1}</div>
                                    <div className="w-8 h-8 bg-slate-200 text-black font-black flex items-center justify-center rounded shadow text-lg">{d2}</div>
                                    {(isHigh || displayDice.length > 2) && (
                                        <div className="w-8 h-8 bg-pink-200 text-pink-900 font-black flex items-center justify-center rounded shadow text-lg">{d3}</div>
                                    )}
                                </div>
                            )}

                            {/* 4. ACTIONS GRID (COMPACT) */}
                            <div className="grid grid-cols-4 gap-1">
                                {/* MAIN ACTION */}
                                <div className="col-span-4">
                                    {!state.rolled && state.pendingMoves === 0 && !isRolling ? (
                                        <button 
                                            onClick={onRoll} 
                                            disabled={isRolling}
                                            className={`w-full py-3 rounded-lg font-black text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2
                                                ${isHigh ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-gradient-to-r from-emerald-600 to-green-600'}
                                            `}
                                        >
                                            {isHigh ? 'TIRADA TRIPLE' : 'TIRAR DADOS'} 🎲
                                        </button>
                                    ) : state.pendingMoves > 0 ? (
                                        <div className="bg-yellow-900/30 border border-yellow-600/50 text-yellow-500 text-center py-2 rounded text-xs font-bold animate-pulse">
                                            MOVIENDO...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-1">
                                            {canBuy && (
                                                <button onClick={() => dispatch({type:'BUY_PROP'})} className="bg-blue-600 text-white py-2 rounded font-bold text-xs hover:bg-blue-500">
                                                    COMPRAR (${currentTile?.price})
                                                </button>
                                            )}
                                            {allowAuction && (
                                                <button onClick={() => dispatch({type:'START_AUCTION', payload: currentTile?.id})} className="bg-purple-600 text-white py-2 rounded font-bold text-xs hover:bg-purple-500">
                                                    SUBASTAR
                                                </button>
                                            )}
                                            {mustPayRent && (
                                                <button onClick={() => dispatch({type:'PAY_RENT'})} className="col-span-2 bg-red-600 text-white py-3 rounded font-bold text-xs hover:bg-red-500 animate-pulse">
                                                    PAGAR RENTA
                                                </button>
                                            )}
                                            {isBlocked && (
                                                <div className="col-span-2 text-[10px] text-red-400 text-center py-1">Compra bloqueada</div>
                                            )}
                                            
                                            {/* Drug Actions */}
                                            {canBuyFarlopa && (
                                                <button onClick={() => dispatch({type:'GET_FARLOPA', payload: {cost:100}})} disabled={currentPlayer.money<100} className="col-span-2 bg-indigo-900 text-indigo-200 py-1 rounded text-[10px]">
                                                    Comprar Material ($100)
                                                </button>
                                            )}
                                            {canGetFreeFarlopa && (
                                                <button onClick={() => dispatch({type:'GET_FARLOPA', payload: {cost:0}})} className="col-span-2 bg-green-900 text-green-200 py-1 rounded text-[10px]">
                                                    Recoger Paquete
                                                </button>
                                            )}
                                            {hasStash && !isHigh && !state.rolled && (
                                                <button onClick={() => dispatch({type:'CONSUME_FARLOPA'})} className="col-span-2 bg-slate-700 text-white py-1 rounded text-[10px]">
                                                    Usar Item ❄️
                                                </button>
                                            )}

                                            <button onClick={() => dispatch({type:'END_TURN'})} className="col-span-2 bg-slate-700 text-white py-2 rounded font-bold text-xs border-b-2 border-slate-900 hover:bg-slate-600 mt-1">
                                                FINALIZAR TURNO
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* SECONDARY ICONS ROW */}
                                <button onClick={() => dispatch({type:'TOGGLE_FULL_BOARD'})} className={`p-2 rounded text-lg ${state.viewFullBoard ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`} title="Mapa">{state.viewFullBoard ? '🔍' : '🗺️'}</button>
                                <button onClick={() => dispatch({type:'PROPOSE_TRADE'})} className="bg-slate-800 p-2 rounded text-lg hover:bg-slate-700" title="Trade">🤝</button>
                                <button onClick={() => dispatch({type:'TOGGLE_BANK_MODAL'})} className="bg-slate-800 p-2 rounded text-lg hover:bg-slate-700" title="Banco">🏦</button>
                                <button onClick={() => dispatch({type:'TOGGLE_BALANCE_MODAL'})} className="bg-slate-800 p-2 rounded text-lg hover:bg-slate-700" title="Stats">📈</button>
                                <button onClick={() => dispatch({type:'TOGGLE_DARK_WEB'})} disabled={!isHacker} className={`p-2 rounded text-lg ${isHacker ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-gray-600 opacity-50'}`} title="Dark Web">{isHacker ? '🕸️' : '🔒'}</button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 text-xs py-4">Cargando...</div>
                    )}
                </div>

                {/* 6. LOGS FOOTER */}
                <div className="h-24 bg-black border-t border-slate-800 p-2 text-[9px] text-gray-400 font-mono overflow-y-auto custom-scrollbar">
                    {state.logs.map((l, i) => (
                        <div key={i} className="border-l border-slate-700 pl-1 mb-0.5 leading-tight">
                            <span className="opacity-50 mr-1">[{state.turnCount > i ? state.turnCount - i : 0}]</span>
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
