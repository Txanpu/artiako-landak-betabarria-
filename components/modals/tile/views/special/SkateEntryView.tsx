
import React from 'react';
import { GameState, TileData, Player } from '../../../../../types';
import { formatMoney, getHouseCost, ownsFullGroup, getRentTable } from '../../../../../utils/gameLogic';
import { canAuction, canBuyDirectly, canBuild } from '../../../../../utils/governmentRules';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
    close: () => void;
}

export const SkateEntryView: React.FC<Props> = ({ state, dispatch, t, currentPlayer, close }) => {
    const isOwner = t.owner === currentPlayer?.id;
    const isOwnerlessProp = t.owner === null;
    const isAtLocation = currentPlayer && currentPlayer.pos === t.id;
    
    // Gov Rules
    const canBuyDirect = isOwnerlessProp && isAtLocation && currentPlayer && currentPlayer.money >= (t.price || 0) && canBuyDirectly(state.gov);
    const allowAuction = isOwnerlessProp && isAtLocation && canAuction(state.gov);
    const buildPermission = canBuild(state.gov, t);
    const isAuthoritarian = state.gov === 'authoritarian';
    
    const mortgageValue = Math.floor((t.price || 0) * 0.5);
    const houseCost = getHouseCost(t);
    const hasMonopoly = t.color ? ownsFullGroup(currentPlayer, t, state.tiles) : false;
    const unmortgageCost = Math.floor(mortgageValue * 1.1);

    return (
        <div className="bg-[#111827] text-white w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.5)] border-4 border-yellow-500 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="h-32 relative flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 overflow-hidden border-b-4 border-yellow-500 shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="z-10 text-center transform -skew-x-6">
                    <div className="text-6xl mb-2 filter drop-shadow-lg">🛹</div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
                        {t.name}
                    </h2>
                </div>
                {t.hotel && <div className="absolute bottom-2 right-2 text-2xl">🏨</div>}
                {t.houses && t.houses > 0 && !t.hotel && <div className="absolute bottom-2 right-2 flex">{Array(t.houses).fill('🏠')}</div>}
            </div>

            <div className="p-6 bg-slate-900 relative space-y-4">
                
                {/* Special Action: Skate Game */}
                {isAtLocation ? (
                    <button 
                        onClick={() => dispatch({type: 'START_SKATE'})} 
                        className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-400 hover:to-pink-400 text-black font-black py-4 rounded-lg shadow-lg border-b-4 border-pink-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 group"
                    >
                        <span>RAD SKATER</span>
                        <span className="text-2xl group-hover:rotate-12 transition-transform">🔥</span>
                    </button>
                ) : (
                    <div className="text-center text-xs text-gray-500 italic py-2 border border-slate-700 rounded bg-slate-950">
                        Debes estar aquí para patinar.
                    </div>
                )}

                {/* Property Info (Rent Table) */}
                <div className="bg-slate-800 rounded-lg overflow-hidden text-xs border border-slate-700">
                    <div className="bg-slate-950 px-3 py-2 border-b border-slate-700 flex justify-between">
                        <span className="font-bold text-gray-400">RENTA</span>
                        <span className="text-gray-500">Grupo: {t.color?.toUpperCase()}</span>
                    </div>
                    <table className="w-full">
                        <tbody className="divide-y divide-slate-700/50">
                            {getRentTable(t).map((row, idx) => {
                                let isActive = false;
                                if (!t.mortgaged) {
                                    if (t.hotel && row.label === 'Hotel') isActive = true;
                                    else if (!t.hotel) {
                                        const h = t.houses || 0;
                                        if (h === 0 && row.label === 'Alquiler base') isActive = true;
                                        else if (h > 0 && row.label.startsWith(`${h} Casa`)) isActive = true;
                                    }
                                }
                                return ( 
                                    <tr key={idx} className={isActive ? 'bg-indigo-900/50 text-indigo-300 font-bold' : 'text-gray-400'}>
                                        <td className="p-2 border-r border-slate-700/30">{row.label}</td>
                                        <td className="p-2 text-right font-mono text-gray-300">{typeof row.rent === 'number' ? formatMoney(row.rent) : row.rent}</td>
                                    </tr> 
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Management Actions */}
                <div className="grid grid-cols-2 gap-2">
                    {canBuyDirect && (
                        <button onClick={() => {dispatch({type: 'BUY_PROP'}); close()}} className="col-span-2 bg-green-600 hover:bg-green-500 py-2 rounded text-white font-bold text-sm shadow-lg">
                            Comprar Propiedad ({formatMoney(t.price||0)})
                        </button>
                    )}
                    {allowAuction && (
                        <button onClick={() => {dispatch({type: 'START_AUCTION', payload: t.id}); close()}} className="col-span-2 bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 rounded text-sm shadow">
                            Subastar
                        </button>
                    )}
                    
                    {isAuthoritarian && isOwnerlessProp && isAtLocation && (
                        <button onClick={() => dispatch({type: 'DECLINE_BUY', payload: {tId: t.id}})} className="col-span-2 bg-purple-900 text-white py-2 rounded font-bold text-xs">
                            RECHAZAR (ESTADO COMPRA)
                        </button>
                    )}
                    
                    {isOwner && (
                        <>
                            {/* Building Controls */}
                            {hasMonopoly && !t.mortgaged && (t.houses || 0) < 5 && ( 
                                buildPermission.allowed ? (
                                    <button onClick={() => dispatch({type: 'BUILD_HOUSE', payload: {tId: t.id}})} className="col-span-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-black text-white shadow-lg border-b-4 border-blue-800 active:scale-95 flex justify-between px-4 items-center group text-xs">
                                        <span className="group-hover:translate-x-1 transition-transform">CONSTRUIR</span>
                                        <span className="bg-black/20 px-2 py-1 rounded font-mono">-{formatMoney(houseCost)}</span>
                                    </button> 
                                ) : (
                                    <div className="col-span-2 bg-slate-800 text-red-400 text-[10px] p-2 text-center border border-red-900 rounded font-bold">
                                        🚫 {buildPermission.reason}
                                    </div>
                                )
                            )}

                            {!hasMonopoly && !t.mortgaged && (
                                <div className="col-span-2 text-center text-[10px] text-gray-500 italic py-2 bg-slate-800/50 rounded">
                                    Necesitas todo el grupo {t.color} para construir.
                                </div>
                            )}

                            {((t.houses || 0) > 0 || t.hotel) && (
                                <button onClick={() => dispatch({type: 'SELL_HOUSE', payload: {tId: t.id}})} className="col-span-2 bg-amber-600 hover:bg-amber-500 py-2 rounded font-bold text-white shadow-lg border-b-4 border-amber-800 active:scale-95 text-xs">
                                    Vender Edificio (+{formatMoney(houseCost/2)})
                                </button>
                            )}

                            {/* Mortgage Controls */}
                            {!t.mortgaged && (t.houses || 0) === 0 && !t.hotel && (
                                <button onClick={() => dispatch({type: 'MORTGAGE_PROP', payload: {tId: t.id}})} className="col-span-2 border border-red-500 text-red-500 hover:bg-red-900/20 py-2 rounded text-xs font-bold">
                                    Hipotecar (+{formatMoney(mortgageValue)})
                                </button>
                            )}
                            {t.mortgaged && (
                                <button onClick={() => dispatch({type: 'UNMORTGAGE_PROP', payload: {tId: t.id}})} className="col-span-2 bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-bold text-white shadow-lg border-b-4 border-emerald-800 active:scale-95 text-xs">
                                    Levantar Hipoteca (-{formatMoney(unmortgageCost)})
                                </button>
                            )}
                        </>
                    )}
                </div>

                <button onClick={close} className="w-full mt-2 text-center text-xs text-yellow-600 hover:text-yellow-400 underline">
                    Cerrar
                </button>
            </div>
        </div>
    );
};
