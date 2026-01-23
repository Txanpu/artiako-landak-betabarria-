
import React from 'react';
import { GameState, MarketAssets, Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface Props {
    label: string;
    player?: Player;
    assets: MarketAssets;
    setAssets: (a: MarketAssets) => void;
    state: GameState;
    disabled?: boolean;
}

export const AssetBuilder: React.FC<Props> = ({ label, player, assets, setAssets, state, disabled }) => {
    
    const toggleProp = (id: number) => {
        if (assets.props.includes(id)) setAssets({ ...assets, props: assets.props.filter(x => x !== id) });
        else setAssets({ ...assets, props: [...assets.props, id] });
    };

    const toggleLoan = (id: string) => {
        if (assets.loans.includes(id)) setAssets({ ...assets, loans: assets.loans.filter(x => x !== id) });
        else setAssets({ ...assets, loans: [...assets.loans, id] });
    };

    const toggleOption = (id: string) => {
        if (assets.options.includes(id)) setAssets({ ...assets, options: assets.options.filter(x => x !== id) });
        else setAssets({ ...assets, options: [...assets.options, id] });
    };

    const toggleShare = (compId: string) => {
        const holding = state.companies.find(c => c.id === compId)?.shareholders[player?.id || -1] || 0;
        const exists = assets.shares.find(s => s.companyId === compId);
        
        if (exists) {
            setAssets({ ...assets, shares: assets.shares.filter(s => s.companyId !== compId) });
        } else {
            setAssets({ ...assets, shares: [...assets.shares, { companyId: compId, count: holding }] });
        }
    };

    if (disabled || !player) {
        return (
            <div className="bg-slate-900 p-4 rounded border border-slate-700 opacity-50">
                <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">{label}</h4>
                <div className="text-center italic text-xs">Selecciona un rival primero.</div>
            </div>
        );
    }

    const myTiles = state.tiles.filter(t => t.owner === player.id);
    const myLoans = state.loans.filter(l => l.lenderId === player.id && l.status === 'active');
    const myOptions = state.financialOptions.filter(o => o.holderId === player.id);
    const myShares = state.companies.filter(c => (c.shareholders[player.id] || 0) > 0);

    return (
        <div className="bg-slate-900 p-4 rounded border border-slate-700 flex flex-col h-96">
            <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-2">{label}</h4>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {/* Money */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Dinero</span>
                        <span>Max: {formatMoney(player.money)}</span>
                    </div>
                    <input 
                        type="range" min="0" max={player.money} step="50" 
                        value={assets.money} 
                        onChange={e => setAssets({ ...assets, money: parseInt(e.target.value) })} 
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                    <div className="text-right text-green-400 font-mono text-xs">{formatMoney(assets.money)}</div>
                </div>

                {/* Properties */}
                {myTiles.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-400 mb-1 font-bold">Propiedades</div>
                        <div className="grid grid-cols-2 gap-1">
                            {myTiles.map(t => (
                                <button 
                                    key={t.id} 
                                    onClick={() => toggleProp(t.id)}
                                    className={`text-[10px] px-2 py-1 rounded truncate border ${assets.props.includes(t.id) ? 'bg-blue-900 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shares */}
                {myShares.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-400 mb-1 font-bold">Acciones (Todo)</div>
                        <div className="space-y-1">
                            {myShares.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => toggleShare(c.id)}
                                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${assets.shares.some(s => s.companyId === c.id) ? 'bg-orange-900/50 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    {c.name} ({c.shareholders[player.id]} acc.)
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Options & Loans */}
                {(myOptions.length > 0 || myLoans.length > 0) && (
                    <div>
                        <div className="text-xs text-gray-400 mb-1 font-bold">Financiero</div>
                        <div className="space-y-1">
                            {myOptions.map(o => (
                                <button 
                                    key={o.id} 
                                    onClick={() => toggleOption(o.id)}
                                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${assets.options.includes(o.id) ? 'bg-green-900/50 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    Opción {o.type.toUpperCase()} sobre {state.tiles[o.propertyId]?.name}
                                </button>
                            ))}
                            {myLoans.map(l => (
                                <button 
                                    key={l.id} 
                                    onClick={() => toggleLoan(l.id)}
                                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${assets.loans.includes(l.id) ? 'bg-blue-900/50 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    Préstamo a {state.players.find(p => p.id === l.borrowerId)?.name} (${l.principal})
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
