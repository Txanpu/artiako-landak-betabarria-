
import React from 'react';
import { GameState, TileData, Player } from '../../../../types';
import { formatMoney, getAvailableTransportHops, getRentTable } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const TransportTicket: React.FC<Props> = ({ state, dispatch, t, currentPlayer }) => {
    const isOwner = t.owner === currentPlayer?.id;
    const isOkupa = currentPlayer?.role === 'okupa';
    const isOwnerlessProp = t.owner === null;
    const isAtLocation = currentPlayer && currentPlayer.pos === t.id;
    
    const canBuyDirect = isOwnerlessProp && isAtLocation && currentPlayer && currentPlayer.money >= (t.price || 0) && state.gov === 'authoritarian';
    const canAuction = isOwnerlessProp && isAtLocation && ['right', 'libertarian', 'anarchy'].includes(state.gov);
    
    const mortgageValue = Math.floor((t.price || 0) * 0.5);

    const hasAccess = isOwner || isOkupa;
    const transportDestinations = (hasAccess && isAtLocation) 
        ? getAvailableTransportHops(state.tiles, currentPlayer, t.id)
        : [];

    // HELICOPTER Logic
    const isHelicopter = currentPlayer.gender === 'helicoptero';
    const canFly = isHelicopter && isAtLocation && t.subtype === 'air';

    let icon = '🚇';
    let headerColor = 'bg-slate-700';
    if (t.subtype === 'air') { icon = '✈️'; headerColor = 'bg-sky-600'; }
    if (t.subtype === 'bus') { icon = '🚌'; headerColor = 'bg-emerald-600'; }
    if (t.subtype === 'ferry') { icon = '⛴️'; headerColor = 'bg-blue-600'; }

    // Use shared getRentTable logic
    const rentTable = getRentTable(t);

    return (
        <div className={`bg-slate-50 text-slate-900 w-full max-w-sm rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 relative flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-black rounded-full"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-black rounded-full"></div>
            <div className="absolute top-1/2 left-0 w-full border-b-2 border-dashed border-slate-300 pointer-events-none"></div>

            <div className={`${headerColor} text-white p-4 flex justify-between items-center`}>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Boarding Pass</span>
                    <h2 className="text-2xl font-black uppercase leading-none">{t.name}</h2>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>

            <div className="p-6 bg-slate-100 flex flex-col gap-4">
                <div className="bg-sky-50 border border-sky-200 p-2 rounded text-[10px] text-sky-800 italic">
                    ⭐ <b>IMPUESTO DE IMPORTACIÓN:</b> Cada vez que un jugador pasa por SALIDA, el Estado te paga $10 por transporte.
                </div>

                <div className="bg-white p-3 rounded border border-slate-300 shadow-sm">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase">
                                <th className="text-left pb-1">Cantidad</th>
                                <th className="text-right pb-1">Tarifa Renta</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {rentTable.map((row, i) => (
                                <tr key={i} className="text-slate-600 border-b last:border-0 border-slate-100">
                                    <td className="py-1">{row.label}</td>
                                    <td className="text-right font-bold">${row.rent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {transportDestinations.length > 0 && (
                    <div className="bg-sky-100 border border-sky-300 rounded p-2 text-center">
                        <div className="text-xs font-bold text-sky-700 uppercase mb-2">
                            {isOkupa && !isOwner ? "Conexiones Clandestinas (Okupa)" : "Conexiones Directas"}
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            {transportDestinations.map(destId => (
                                <button key={destId} onClick={() => { dispatch({type: 'CLOSE_MODAL'}); dispatch({type: 'TRANSPORT_HOP', payload: destId}); }} className="bg-sky-600 text-white text-xs py-1 rounded hover:bg-sky-500 transition font-bold">
                                    Ir a {state.tiles[destId].name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {canFly && (
                    <div className="bg-orange-100 border border-orange-300 rounded p-2 text-center">
                        <div className="text-xs font-bold text-orange-700 uppercase mb-2">🚁 HABILIDAD HELICÓPTERO</div>
                        <button 
                            onClick={() => { dispatch({type: 'CLOSE_MODAL'}); dispatch({type: 'TOGGLE_FLIGHT_MODE'}); }} 
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xs py-2 rounded shadow-lg font-bold uppercase animate-pulse"
                        >
                            SELECCIONAR DESTINO EN MAPA
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                    {canBuyDirect && <button onClick={() => {dispatch({type: 'BUY_PROP'}); dispatch({type: 'CLOSE_MODAL'})}} className="col-span-2 bg-slate-800 text-white py-2 rounded font-bold">Comprar Billete (${t.price})</button>}
                    {canAuction && <button onClick={() => {dispatch({type: 'START_AUCTION', payload: t.id}); dispatch({type: 'CLOSE_MODAL'})}} className="col-span-2 bg-purple-600 text-white py-2 rounded font-bold">Subastar</button>}
                    {isOwner && !t.mortgaged && (
                        <button onClick={() => dispatch({type: 'MORTGAGE_PROP', payload: {tId: t.id}})} className="col-span-2 border border-red-500 text-red-600 hover:bg-red-50 py-1 rounded text-xs font-bold">Hipotecar (+{formatMoney(mortgageValue)})</button>
                    )}
                    <button onClick={() => dispatch({type: 'CLOSE_MODAL'})} className="col-span-2 text-xs text-slate-400 hover:text-slate-600 underline text-center">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
