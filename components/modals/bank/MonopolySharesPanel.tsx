
import React, { useState } from 'react';
import { GameState, Player, TileType } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';
import { getColorGroup, countOwnedInGroup } from '../../../utils/ai/constants';
import { COLORS } from '../../../constants';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const MonopolySharesPanel: React.FC<Props> = ({ state, dispatch }) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const [sellModeId, setSellModeId] = useState<string | null>(null);
    
    // Sell Form State
    const [sharesToSell, setSharesToSell] = useState(1);
    const [targetPlayerId, setTargetPlayerId] = useState(-1);
    const [askPrice, setAskPrice] = useState(100);

    // FIX: Safety Check
    if (!currentPlayer) return null;

    // Identify Potential Monopolies (Owned fully by me, not yet companies)
    const potentialMonopolies: string[] = [];
    const colors: string[] = Array.from(new Set(state.tiles.filter(t => t.color).map(t => t.color as string)));
    
    colors.forEach(c => {
        const group = getColorGroup(state.tiles, c);
        const myCount = countOwnedInGroup(group, currentPlayer.id);
        const hasCompany = group.some(t => t.companyId);
        
        if (myCount === group.length && !hasCompany) {
            potentialMonopolies.push(c);
        }
    });

    const handleOpenSell = (compId: string, maxShares: number) => {
        setSellModeId(compId);
        setSharesToSell(1);
        setTargetPlayerId(-1);
        setAskPrice(100);
    };

    const confirmSale = (compId: string) => {
        if (targetPlayerId === -1 || sharesToSell <= 0) return;
        
        dispatch({
            type: 'PROPOSE_TRADE',
            payload: {
                initiatorId: currentPlayer.id,
                targetId: targetPlayerId,
                offeredMoney: 0,
                offeredProps: [],
                offeredShares: [{ companyId: compId, count: sharesToSell }],
                requestedMoney: askPrice,
                requestedProps: [],
                isOpen: true
            }
        });
        setSellModeId(null);
    };

    return (
        <div className="bg-slate-900 p-4 rounded border border-orange-700 h-full flex flex-col gap-4">
            <div>
                <h3 className="font-bold text-orange-400">Sociedades Anónimas (Monopolios)</h3>
                <p className="text-[10px] text-gray-500">
                    Convierte tus monopolios en acciones (S.A.). 
                    <br/>
                    <span className="text-green-400">Ventajas:</span> Protección contra Okupas/Destrucción.
                    <br/>
                    <span className="text-red-400">Desventajas:</span> No puedes construir ni hipotecar más.
                </p>
            </div>

            {/* CREATION SECTION */}
            <div className="bg-black/30 p-2 rounded border border-orange-900/50">
                <h4 className="text-xs font-bold text-white mb-2 uppercase border-b border-white/10 pb-1">Fundar Sociedad</h4>
                {potentialMonopolies.length === 0 && <div className="text-[10px] text-gray-600 italic text-center">No tienes monopolios completos disponibles.</div>}
                
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {potentialMonopolies.map(color => (
                        <button 
                            key={color}
                            onClick={() => dispatch({type: 'CREATE_MONOPOLY_COMPANY', payload: { color }})}
                            className="flex items-center gap-2 bg-slate-800 border border-slate-600 px-3 py-2 rounded hover:bg-slate-700 active:scale-95 transition-all"
                        >
                            <div className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{backgroundColor: COLORS[color as keyof typeof COLORS] || color}}></div>
                            <span className="text-xs font-bold text-white uppercase">{color} S.A.</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* PORTFOLIO SECTION */}
            <div className="flex-1 overflow-y-auto">
                <h4 className="text-xs font-bold text-white mb-2 uppercase border-b border-white/10 pb-1">Mercado de Valores</h4>
                {state.companies.length === 0 && <div className="text-[10px] text-gray-600 italic text-center mt-4">No hay sociedades fundadas.</div>}
                
                <div className="space-y-2">
                    {state.companies.map(comp => {
                        const myShares = comp.shareholders[currentPlayer.id] || 0;
                        const pct = ((myShares / comp.totalShares) * 100).toFixed(0);
                        const tileNames = state.tiles.filter(t => comp.propertyIds.includes(t.id)).map(t => t.name).join(', ');
                        const isSelling = sellModeId === comp.id;

                        return (
                            <div key={comp.id} className="bg-slate-800 p-2 rounded border border-slate-600 shadow-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[comp.color as keyof typeof COLORS]}}></div>
                                        <span className="font-bold text-sm text-white">{comp.name}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">Val: {formatMoney(comp.valuation)}</span>
                                </div>
                                
                                <div className="text-[9px] text-gray-500 mb-2 truncate" title={tileNames}>
                                    Activos: {tileNames}
                                </div>

                                <div className="bg-black/40 p-1.5 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-xs">
                                            <span className="text-gray-400">Tus Acciones: </span>
                                            <span className={`font-mono font-bold ${myShares > 0 ? 'text-green-400' : 'text-gray-600'}`}>{myShares} / {comp.totalShares} ({pct}%)</span>
                                        </div>
                                        {myShares > 0 && !isSelling && (
                                            <button 
                                                onClick={() => handleOpenSell(comp.id, myShares)}
                                                className="bg-yellow-600 hover:bg-yellow-500 text-black text-[9px] font-bold px-2 py-1 rounded"
                                            >
                                                VENDER
                                            </button>
                                        )}
                                    </div>

                                    {/* SELL FORM */}
                                    {isSelling && (
                                        <div className="mt-2 p-2 bg-slate-900 rounded border border-yellow-700/50 animate-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                                                <div>
                                                    <label className="text-gray-400 block mb-1">Cantidad</label>
                                                    <input type="number" min="1" max={myShares} value={sharesToSell} onChange={e => setSharesToSell(Math.min(myShares, Math.max(1, parseInt(e.target.value))))} className="w-full bg-black border border-slate-600 rounded px-1 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 block mb-1">Precio Total ($)</label>
                                                    <input type="number" min="0" step="10" value={askPrice} onChange={e => setAskPrice(Math.max(0, parseInt(e.target.value)))} className="w-full bg-black border border-slate-600 rounded px-1 text-white" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-gray-400 block mb-1">Comprador</label>
                                                    <select value={targetPlayerId} onChange={e => setTargetPlayerId(parseInt(e.target.value))} className="w-full bg-black border border-slate-600 rounded px-1 text-white h-6">
                                                        <option value={-1}>Seleccionar...</option>
                                                        {state.players.filter(p => p.id !== currentPlayer.id && p.alive).map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} (${p.money})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setSellModeId(null)} className="flex-1 bg-slate-700 text-xs py-1 rounded text-gray-300">Cancelar</button>
                                                <button onClick={() => confirmSale(comp.id)} disabled={targetPlayerId === -1} className="flex-1 bg-green-600 text-white text-xs font-bold py-1 rounded disabled:opacity-50">OFERTAR</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
