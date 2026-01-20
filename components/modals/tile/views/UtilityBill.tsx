
import React from 'react';
import { GameState, TileData, Player } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const UtilityBill: React.FC<Props> = ({ state, dispatch, t, currentPlayer }) => {
    const isOwner = t.owner === currentPlayer?.id;
    const isOwnerlessProp = t.owner === null;
    const isAtLocation = currentPlayer && currentPlayer.pos === t.id;
    
    const canBuyDirect = isOwnerlessProp && isAtLocation && currentPlayer && currentPlayer.money >= (t.price || 0) && state.gov === 'authoritarian';
    const canAuction = isOwnerlessProp && isAtLocation && ['right', 'libertarian', 'anarchy'].includes(state.gov);
    
    const mortgageValue = Math.floor((t.price || 0) * 0.5);

    return (
        <div className="bg-slate-200 w-full max-w-sm rounded-none shadow-2xl animate-in zoom-in-95 relative border-t-8 border-yellow-500 font-mono" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-white border-x border-b border-slate-300 shadow-sm relative">
                {t.mortgaged && <div className="absolute top-10 right-4 border-4 border-red-600 text-red-600 font-black text-2xl uppercase p-2 -rotate-12 opacity-50 select-none">CANCELADO</div>}

                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">{t.name}</h2>
                        <div className="text-[10px] text-slate-500 uppercase">Suministros Municipales</div>
                    </div>
                    <div className="text-3xl text-slate-800">{t.name.toLowerCase().includes('agua') ? '💧' : '⚡'}</div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-[10px] text-yellow-800 mb-4 italic">
                    ⭐ <b>TASA DE RED:</b> Ganas $20 cada vez que alguien construye.
                    <br/>
                    <b>CORTE DE SUMINISTRO:</b> Si estás aquí, puedes sabotear a un rival.
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div>
                        <span className="block text-slate-500 font-bold uppercase">Estado Contrato</span>
                        <span className="block font-bold truncate">{t.owner ? 'ACTIVO' : 'DISPONIBLE'}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-slate-500 font-bold uppercase">Canon Adquisición</span>
                        <span className="block font-bold text-lg">{formatMoney(t.price || 0)}</span>
                    </div>
                </div>

                <div className="bg-slate-100 p-3 border border-slate-300 mb-4">
                    <h4 className="font-bold text-xs uppercase mb-2 border-b border-slate-300">Tasas de Consumo (Renta)</h4>
                    <div className="flex justify-between text-xs mb-1">
                        <span>1 Utilidad</span>
                        <span className="font-bold">x4 Dados</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>2 Utilidades</span>
                        <span className="font-bold">x10 Dados</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {canBuyDirect && <button onClick={() => {dispatch({type: 'BUY_PROP'}); dispatch({type: 'CLOSE_MODAL'})}} className="w-full bg-black text-white py-2 font-bold hover:bg-slate-800 uppercase tracking-tighter">Adquirir Concesión</button>}
                    {canAuction && <button onClick={() => {dispatch({type: 'START_AUCTION', payload: t.id}); dispatch({type: 'CLOSE_MODAL'})}} className="w-full border-2 border-black text-black py-2 font-bold hover:bg-slate-100">Licitación Pública (Subasta)</button>}
                    
                    {/* ACTIVE ABILITY SABOTAGE */}
                    {isOwner && isAtLocation && !t.mortgaged && (
                        <button onClick={() => {dispatch({type: 'SABOTAGE_SUPPLY', payload: {tId: t.id}}); dispatch({type: 'CLOSE_MODAL'})}} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 uppercase border-b-4 border-yellow-800 active:scale-95">
                            ⚡ SABOTEAR RIVAL
                        </button>
                    )}

                    {isOwner && !t.mortgaged && (
                        <button onClick={() => dispatch({type: 'MORTGAGE_PROP', payload: {tId: t.id}})} className="w-full text-red-600 text-xs font-bold hover:bg-red-50 py-1">Hipotecar (+${mortgageValue})</button>
                    )}
                    <button onClick={() => dispatch({type: 'CLOSE_MODAL'})} className="w-full text-center text-xs text-slate-400 mt-2 hover:text-black">Cerrar Factura</button>
                </div>
            </div>
            <div className="h-4 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#fff_5px,#fff_10px)] border-t border-slate-300"></div>
        </div>
    );
};
