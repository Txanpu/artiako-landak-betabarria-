
import React from 'react';
import { GameState, MarketAssets, Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface Props {
    state: GameState;
    side: string;
    player?: Player;
    assets: MarketAssets;
    isWinner: boolean;
}

export const StakeSide: React.FC<Props> = ({ state, side, player, assets, isWinner }) => {
    const isYes = side === 'YES';
    const bgClass = isYes ? 'bg-gradient-to-br from-green-900/40 to-green-950/40 border-green-600' : 'bg-gradient-to-br from-red-900/40 to-red-950/40 border-red-600';
    const textClass = isYes ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`rounded-xl border-2 p-4 ${bgClass} relative flex flex-col h-full shadow-inner`}>
            <div className={`font-black text-4xl mb-1 opacity-90 ${textClass}`}>{side}</div>
            <div className="text-sm font-bold text-white mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current opacity-80" style={{backgroundColor: player?.color || '#555'}}></span>
                {player?.name || <span className="text-gray-500 italic">Vacante</span>}
            </div>
            
            <div className="space-y-2 text-xs text-gray-300 flex-1">
                {assets.money > 0 && <div className="flex items-center gap-2 bg-black/20 p-1 rounded"><span className="text-lg">💵</span> <span className="font-mono font-bold text-white text-lg">${formatMoney(assets.money)}</span></div>}
                {assets.farlopa > 0 && <div className="flex items-center gap-2 bg-black/20 p-1 rounded"><span className="text-lg">❄️</span> <span className="font-bold">{assets.farlopa}u Droga</span></div>}
                
                {assets.props.length > 0 && (
                    <div className="flex flex-col bg-black/20 p-1 rounded">
                        <div className="flex items-center gap-2 mb-1"><span className="text-lg leading-none">🏠</span> <span className="font-bold text-[10px] uppercase opacity-70">Propiedades</span></div>
                        <div className="flex flex-wrap gap-1">
                            {assets.props.map(id => (
                                <span key={id} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-600 text-yellow-500">{state.tiles[id].name}</span>
                            ))}
                        </div>
                    </div>
                )}
                
                {assets.shares.length > 0 && (
                    <div className="flex flex-col bg-black/20 p-1 rounded">
                        <div className="flex items-center gap-2 mb-1"><span className="text-lg leading-none">🏢</span> <span className="font-bold text-[10px] uppercase opacity-70">Acciones</span></div>
                        <div className="flex flex-col gap-1">
                            {assets.shares.map((s, i) => (
                                <span key={i} className="text-[10px] text-orange-300">{s.count}x {state.companies.find(c=>c.id===s.companyId)?.name}</span>
                            ))}
                        </div>
                    </div>
                )}

                {(assets.options.length > 0 || assets.loans.length > 0) && (
                    <div className="flex flex-col bg-black/20 p-1 rounded">
                        <div className="flex items-center gap-2 mb-1"><span className="text-lg leading-none">📜</span> <span className="font-bold text-[10px] uppercase opacity-70">Contratos</span></div>
                        <div className="flex flex-col gap-1">
                            {assets.options.length > 0 && <span className="text-[10px] text-green-300">{assets.options.length} Opciones Financieras</span>}
                            {assets.loans.length > 0 && <span className="text-[10px] text-blue-300">{assets.loans.length} Préstamos (Cobrador)</span>}
                        </div>
                    </div>
                )}

                {assets.money === 0 && assets.farlopa === 0 && assets.props.length === 0 && assets.shares.length === 0 && assets.options.length === 0 && assets.loans.length === 0 && (
                    <span className="opacity-30 italic block text-center py-4">Sin apuesta</span>
                )}
            </div>
        </div>
    );
};
