
import React from 'react';
import { GameState, TileData, Player } from '../../../../types';
import { COLORS } from '../../../../constants';
import { formatMoney, getRentTable, getHouseCost, ownsFullGroup } from '../../../../utils/gameLogic';
import { canBuild, canAuction, getRepairCost } from '../../../../utils/governmentRules'; // NEW

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const PropertyCard: React.FC<Props> = ({ state, dispatch, t, currentPlayer }) => {
    const headerColor = t.color ? COLORS[t.color as keyof typeof COLORS] : '#334155';
    const isOwner = t.owner === currentPlayer?.id;
    const isOwnerlessProp = t.owner === null;
    const isAtLocation = currentPlayer && currentPlayer.pos === t.id;
    const houseCost = getHouseCost(t);
    const hasMonopoly = t.color ? ownsFullGroup(currentPlayer, t, state.tiles) : false;

    // Gov Logic
    const allowAuction = isOwnerlessProp && isAtLocation && canAuction(state.gov);
    // Force Buy logic if auction is disabled (Authoritarian) but user has money
    const forceBuy = isOwnerlessProp && isAtLocation && !allowAuction && currentPlayer.money >= (t.price || 0) && state.gov === 'authoritarian';
    
    // Normal Buy (Authoritarian is covered by forceBuy, but check standard)
    const canBuyDirect = isOwnerlessProp && isAtLocation && currentPlayer && currentPlayer.money >= (t.price || 0) && state.gov === 'authoritarian';
    
    const isBlockedByGov = isOwnerlessProp && isAtLocation && state.gov === 'left';
    
    const mortgageValue = Math.floor((t.price || 0) * 0.5);
    const unmortgageCost = Math.floor(mortgageValue * 1.1);

    // Broken State (Anarchy)
    const repairCost = getRepairCost(t);
    const buildPermission = canBuild(state.gov, t);

    return (
        <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="h-32 flex flex-col items-center justify-center text-white p-4 shadow-inner relative overflow-hidden" style={{backgroundColor: headerColor}}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="z-10 relative text-center">
                    <h3 className="text-2xl font-black uppercase drop-shadow-md leading-tight">{t.name}</h3>
                    <div className="text-[10px] uppercase tracking-[0.2em] opacity-90 mt-1 font-bold bg-black/30 px-2 py-1 rounded inline-block">
                        {t.familia || t.color || 'Propiedad'}
                    </div>
                </div>
                {t.mortgaged && <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-lg border border-white">HIPOTECADA</div>}
                {t.isBroken && <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-lg border border-white animate-pulse">EN RUINAS</div>}
            </div>

            <div className="p-6 space-y-4 bg-slate-900">
                <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                    <span className="text-gray-400 text-xs uppercase font-bold">Valor de mercado</span>
                    <span className="font-black text-2xl text-emerald-400">{formatMoney(t.price || 0)}</span>
                </div>

                {t.isBroken ? (
                    <div className="bg-orange-900/50 p-4 rounded border border-orange-600 text-center">
                        <p className="text-orange-300 font-bold mb-2">¡PROPIEDAD DESTROZADA!</p>
                        <p className="text-xs text-gray-400 mb-4">No produce renta ni permite construir hasta ser reparada.</p>
                        {isOwner && (
                            <button 
                                onClick={() => dispatch({type: 'REPAIR_PROP', payload: {tId: t.id}})}
                                disabled={currentPlayer.money < repairCost}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded shadow disabled:opacity-50"
                            >
                                REPARAR ({formatMoney(repairCost)})
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-lg overflow-hidden text-xs border border-slate-700">
                        <table className="w-full">
                            <thead className="bg-slate-950 text-gray-400 uppercase tracking-wider">
                                <tr><th className="p-2 text-left">Nivel</th><th className="p-2 text-right">Renta</th></tr>
                            </thead>
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
                                        <tr key={idx} className={isActive ? 'bg-emerald-900/30 text-emerald-300 font-bold' : 'text-gray-400'}>
                                            <td className="p-2 border-r border-slate-700/30">{row.label}</td>
                                            <td className="p-2 text-right font-mono text-gray-300">{typeof row.rent === 'number' ? formatMoney(row.rent) : row.rent}</td>
                                        </tr> 
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                    {(canBuyDirect || forceBuy) && (
                        <button onClick={() => {dispatch({type: 'BUY_PROP'}); dispatch({type: 'CLOSE_MODAL'})}} className="col-span-2 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-black text-white shadow-lg border-b-4 border-green-800 active:scale-95 transition-all">
                            COMPRAR
                        </button>
                    )}
                    {allowAuction && (
                        <button onClick={() => {dispatch({type: 'START_AUCTION', payload: t.id}); dispatch({type: 'CLOSE_MODAL'})}} className="col-span-2 bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-black text-white shadow-lg border-b-4 border-purple-800 active:scale-95 transition-all">
                            SUBASTAR
                        </button>
                    )}
                    {isBlockedByGov && <div className="col-span-2 bg-red-900/50 p-2 text-center text-xs text-red-300 rounded font-bold border border-red-800">🚫 Gobierno de Izquierdas: Compra Prohibida</div>}
                    
                    {isOwner && !t.isBroken && (
                        <>
                        {/* BUILD BUTTON */}
                        {hasMonopoly && !t.mortgaged && (t.houses || 0) < 5 && ( 
                            buildPermission.allowed ? (
                                <button onClick={() => dispatch({type: 'BUILD_HOUSE', payload: {tId: t.id}})} className="col-span-2 bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold text-white shadow-lg border-b-4 border-blue-800 active:scale-95">
                                    Construir ({formatMoney(houseCost)})
                                </button> 
                            ) : (
                                <div className="col-span-2 bg-slate-800 text-red-400 text-[10px] p-2 text-center border border-red-900 rounded">
                                    🚫 {buildPermission.reason}
                                </div>
                            )
                        )}
                        {!hasMonopoly && !t.mortgaged && (
                            <div className="col-span-2 text-center text-[10px] text-gray-500 italic py-1">
                                Necesitas el grupo completo.
                            </div>
                        )}
                        
                        {((t.houses || 0) > 0 || t.hotel) && (
                            <button onClick={() => dispatch({type: 'SELL_HOUSE', payload: {tId: t.id}})} className="col-span-2 bg-amber-600 hover:bg-amber-500 py-2 rounded font-bold text-white shadow-lg border-b-4 border-amber-800 active:scale-95">
                                Vender Edificio (+{formatMoney(houseCost/2)})
                            </button>
                        )}
                        {!t.mortgaged && (t.houses || 0) === 0 && !t.hotel && (
                            <button onClick={() => dispatch({type: 'MORTGAGE_PROP', payload: {tId: t.id}})} className="bg-red-700 hover:bg-red-600 py-2 rounded font-bold text-white shadow-lg text-xs border-b-4 border-red-900 active:scale-95">
                                Hipotecar (+{formatMoney(mortgageValue)})
                            </button>
                        )}
                        {t.mortgaged && (
                            <button onClick={() => dispatch({type: 'UNMORTGAGE_PROP', payload: {tId: t.id}})} className="col-span-2 bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-bold text-white shadow-lg border-b-4 border-emerald-800 active:scale-95">
                                Levantar Hipoteca (-{formatMoney(unmortgageCost)})
                            </button>
                        )}
                        </>
                    )}
                </div>

                <button onClick={() => dispatch({type: 'CLOSE_MODAL'})} className="w-full bg-transparent hover:bg-slate-800 text-gray-400 hover:text-white py-2 rounded font-bold transition-colors text-xs uppercase tracking-widest">
                    Cerrar
                </button>
            </div>
        </div>
    );
};
