
import React, { useState, useEffect } from 'react';
import { Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface P2PLoanPanelProps {
    players: Player[];
    currentPlayerId: number;
    dispatch: React.Dispatch<any>;
}

export const P2PLoanPanel: React.FC<P2PLoanPanelProps> = ({ players, currentPlayerId, dispatch }) => {
    const [loanAmount, setLoanAmount] = useState(500);
    const [repayAmount, setRepayAmount] = useState(600); // Default to slightly more than loan
    const [loanTurns, setLoanTurns] = useState(10);
    const [p2pTarget, setP2pTarget] = useState<number>(-1);

    // Ensure repayment is never less than loan amount
    const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setLoanAmount(val);
        if (repayAmount < val) setRepayAmount(val);
    };

    const profit = repayAmount - loanAmount;
    const profitPercent = loanAmount > 0 ? Math.round((profit / loanAmount) * 100) : 0;

    return (
        <div className="bg-slate-900 p-4 rounded border border-blue-700">
             <h3 className="font-bold mb-2 text-blue-400">Préstamo entre Jugadores</h3>
             <p className="text-[10px] text-gray-500 mb-2">Pide dinero a otro jugador. Negociad los términos fuera del juego, aquí formalizáis el contrato.</p>
             <div className="space-y-4 text-xs">
                 <div>
                     <label className="block text-gray-400 mb-1">Prestamista (Quien te da el dinero):</label>
                     <select className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-white" value={p2pTarget} onChange={e => setP2pTarget(Number(e.target.value))}>
                         <option value={-1}>Seleccionar Jugador...</option>
                         {players.filter(p => p.id !== currentPlayerId && p.alive).map(p => (
                             <option key={p.id} value={p.id}>{p.name} (Saldo: {formatMoney(p.money)})</option>
                         ))}
                     </select>
                 </div>

                 {/* Loan Amount Slider */}
                 <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="flex justify-between mb-1">
                        <label className="text-gray-400 font-bold">Pides Prestado:</label>
                        <span className="text-white font-mono text-sm">{formatMoney(loanAmount)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="5000" 
                        step="50" 
                        value={loanAmount} 
                        onChange={handleLoanChange} 
                        className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>

                 {/* Repayment Slider */}
                 <div className="bg-slate-800 p-2 rounded border border-slate-700">
                     <div className="flex justify-between mb-1">
                        <label className="text-gray-400 font-bold">Total a Devolver:</label>
                        <span className="text-yellow-400 font-mono text-sm">{formatMoney(repayAmount)}</span>
                     </div>
                     <input 
                        type="range" 
                        min={loanAmount} 
                        max={loanAmount * 3} 
                        step="50" 
                        value={repayAmount} 
                        onChange={e => setRepayAmount(Number(e.target.value))} 
                        className="w-full accent-yellow-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                        <span>Interés implícito: {profitPercent}%</span>
                        <span className="text-green-400">Ganancia Prestamista: {formatMoney(profit)}</span>
                    </div>
                 </div>

                 {/* Turns Slider */}
                 <div>
                     <div className="flex justify-between mb-1">
                        <label className="text-gray-400">Plazo de devolución:</label>
                        <span className="text-white">{loanTurns} turnos</span>
                     </div>
                     <input type="range" min="5" max="30" step="1" value={loanTurns} onChange={e => setLoanTurns(Number(e.target.value))} className="w-full accent-gray-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                 </div>

                 <button 
                      disabled={p2pTarget === -1}
                      onClick={() => dispatch({
                          type: 'TAKE_LOAN', 
                          payload: { 
                              amount: loanAmount, 
                              totalRepayment: repayAmount, // Send fixed repayment instead of interest
                              turns: loanTurns, 
                              lenderId: p2pTarget 
                          }
                      })} 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 rounded text-white font-bold disabled:opacity-50 shadow-lg border-t border-white/20"
                 >
                     Firmar Contrato P2P
                 </button>
             </div>
        </div>
    );
};
