
import React from 'react';
import { GameState } from '../../types';
import { calculateAdvancedMaintenance } from '../../utils/extras';
import { formatMoney } from '../../utils/gameLogic';

interface BalanceModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

// Simple SVG Sparkline
const Sparkline: React.FC<{ data: number[], color: string, width?: number, height?: number }> = ({ data, color, width = 100, height = 30 }) => {
    if (!data || data.length < 2) return <div style={{width, height}} className="bg-slate-800/50 rounded"></div>;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export const BalanceModal: React.FC<BalanceModalProps> = ({ state, dispatch }) => {
    if (!state.showBalanceModal) return null;

    const p = state.players[state.currentPlayerIndex];
    if (!p) return null;

    // Calc Data
    const debts = state.loans.filter(l => l.borrowerId === p.id && l.status === 'active');
    const credits = state.loans.filter(l => l.lenderId === p.id && l.status === 'active');
    
    const totalDebt = debts.reduce((acc, l) => acc + l.principal, 0);
    const totalCredit = credits.reduce((acc, l) => acc + l.principal, 0);
    
    // Calculate Property Value (Base Price + Half House Cost approx, or just Base Price)
    // User requested "Valor de la propiedad", usually market value (base price).
    const propsValue = state.tiles.filter(t => t.owner === p.id).reduce((acc, t) => acc + (t.price || 0), 0);

    const netWorth = p.money + totalCredit - totalDebt + propsValue; 
    
    const nextMaintenance = calculateAdvancedMaintenance(p.id, state.tiles);
    
    const propsCount = state.tiles.filter(t => t.owner === p.id).length;
    const houseCount = state.tiles.filter(t => t.owner === p.id).reduce((acc, t) => acc + (t.houses||0) + (t.hotel?5:0), 0);

    // Metrics for Sparklines
    const history = state.metrics?.[p.id] || [];
    const cashHistory = history.map(h => h.money);
    const netWorthHistory = history.map(h => h.netWorth);

    // Add current current state to end of history for real-time feel
    cashHistory.push(p.money);
    netWorthHistory.push(netWorth);

    return (
          <div className="fixed top-20 right-4 z-50 w-72 bg-slate-900/95 backdrop-blur border border-emerald-500/50 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right font-mono text-xs">
              <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                  <h3 className="text-emerald-400 font-bold text-sm uppercase">Mi Balance Finan.</h3>
                  <button onClick={() => dispatch({type: 'TOGGLE_BALANCE_MODAL'})} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                  {/* Cash Section */}
                  <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-gray-400">Cash Líquido</span>
                        <span className="text-white font-bold text-lg">{formatMoney(p.money)}</span>
                      </div>
                      <div className="bg-slate-800 rounded p-1">
                          <Sparkline data={cashHistory} color="#34d399" width={250} height={30} />
                      </div>
                  </div>
                  
                  {/* Debt Section */}
                  <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="flex justify-between text-red-400">
                          <span>Deuda Total:</span>
                          <span>-{formatMoney(totalDebt)}</span>
                      </div>
                      <div className="flex justify-between text-blue-400">
                          <span>Créditos (P2P):</span>
                          <span>+{formatMoney(totalCredit)}</span>
                      </div>
                      <div className="border-t border-slate-600 mt-1 pt-1 flex justify-between font-bold">
                          <span className="text-gray-400">Neto Deuda:</span>
                          <span className={totalCredit - totalDebt >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {formatMoney(totalCredit - totalDebt)}
                          </span>
                      </div>
                  </div>

                  {/* Net Worth Section */}
                   <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-gray-400">Patrimonio Neto</span>
                        <span className="text-blue-300 font-bold">{formatMoney(netWorth)}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between px-1 mb-1">
                          <span>(+ Valor Propiedades)</span>
                          <span>{formatMoney(propsValue)}</span>
                      </div>
                      <div className="bg-slate-800 rounded p-1">
                          <Sparkline data={netWorthHistory} color="#60a5fa" width={250} height={30} />
                      </div>
                  </div>

                  {/* Assets Count */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-800 p-1 rounded">
                          <div className="text-gray-500 text-[10px]">Propiedades</div>
                          <div className="font-bold text-white">{propsCount}</div>
                      </div>
                      <div className="bg-slate-800 p-1 rounded">
                          <div className="text-gray-500 text-[10px]">Edificios</div>
                          <div className="font-bold text-white">{houseCount}</div>
                      </div>
                  </div>

                  <div className="mt-2 bg-yellow-900/20 p-2 rounded border border-yellow-700/50">
                       <div className="flex justify-between items-center">
                           <span className="text-yellow-500">Mantenimiento Prox:</span>
                           <span className="text-white font-bold">{formatMoney(nextMaintenance)}</span>
                       </div>
                       <div className="text-[9px] text-gray-500 mt-1 leading-tight">
                           Se cobra al finalizar tu turno. Incluye tasas por propiedades de lujo (+350$).
                       </div>
                  </div>
              </div>
          </div>
    );
};
