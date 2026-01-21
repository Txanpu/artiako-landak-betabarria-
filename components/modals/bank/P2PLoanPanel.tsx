
import React, { useState, useEffect } from 'react';
import { Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface P2PLoanPanelProps {
    players: Player[];
    currentPlayerId: number;
    dispatch: React.Dispatch<any>;
}

export const P2PLoanPanel: React.FC<P2PLoanPanelProps> = ({ players, currentPlayerId, dispatch }) => {
    const [mode, setMode] = useState<'borrow' | 'lend'>('borrow'); // 'borrow' = Ask for money, 'lend' = Give money
    const [loanAmount, setLoanAmount] = useState(500);
    const [repayAmount, setRepayAmount] = useState(600);
    const [loanTurns, setLoanTurns] = useState(10);
    const [targetId, setTargetId] = useState<number>(-1);

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const targetPlayer = players.find(p => p.id === targetId);

    // Calculate Max Limit based on who is giving the money
    // If I borrow, max is Target's money. If I lend, max is My money.
    const maxAmount = mode === 'borrow' 
        ? (targetPlayer ? targetPlayer.money : 1000) 
        : (currentPlayer ? currentPlayer.money : 1000);

    // Ensure repayment is never less than loan amount
    const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setLoanAmount(val);
        // Auto adjust repay if it falls below principal
        if (repayAmount < val) setRepayAmount(Math.ceil(val * 1.1));
    };

    const profit = repayAmount - loanAmount;
    const profitPercent = loanAmount > 0 ? Math.round((profit / loanAmount) * 100) : 0;

    const handleConfirm = () => {
        if (targetId === -1) return;
        
        // Define roles based on mode
        const lenderId = mode === 'borrow' ? targetId : currentPlayerId;
        const borrowerId = mode === 'borrow' ? currentPlayerId : targetId;

        dispatch({
            type: 'TAKE_LOAN', 
            payload: { 
                amount: loanAmount, 
                totalRepayment: repayAmount, 
                turns: loanTurns, 
                lenderId: lenderId,
                borrowerId: borrowerId
            }
        });
    };

    return (
        <div className="bg-slate-900 p-4 rounded border border-blue-700">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-blue-400">Préstamo P2P</h3>
                 <div className="flex bg-slate-800 rounded p-1">
                     <button 
                        onClick={() => { setMode('borrow'); setTargetId(-1); }} 
                        className={`px-3 py-1 text-[10px] font-bold rounded ${mode === 'borrow' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     >
                         PEDIR
                     </button>
                     <button 
                        onClick={() => { setMode('lend'); setTargetId(-1); }} 
                        className={`px-3 py-1 text-[10px] font-bold rounded ${mode === 'lend' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     >
                         PRESTAR
                     </button>
                 </div>
             </div>

             <p className="text-[10px] text-gray-500 mb-2">
                 {mode === 'borrow' 
                    ? "Pides dinero a otro jugador. Él gana los intereses." 
                    : "Prestas tu dinero a otro jugador. Tú ganas los intereses."}
             </p>

             <div className="space-y-4 text-xs">
                 <div>
                     <label className="block text-gray-400 mb-1">
                         {mode === 'borrow' ? 'Prestamista (¿Quién te da el dinero?)' : 'Prestatario (¿A quién le das el dinero?)'}
                     </label>
                     <select className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-white" value={targetId} onChange={e => setTargetId(Number(e.target.value))}>
                         <option value={-1}>Seleccionar Jugador...</option>
                         {players.filter(p => p.id !== currentPlayerId && p.alive).map(p => (
                             <option key={p.id} value={p.id}>{p.name} (Saldo: {formatMoney(p.money)})</option>
                         ))}
                     </select>
                 </div>

                 {/* Loan Amount Slider */}
                 <div className={`p-2 rounded border ${mode === 'borrow' ? 'bg-slate-800 border-slate-700' : 'bg-green-900/20 border-green-800'}`}>
                      <div className="flex justify-between mb-1">
                        <label className="text-gray-400 font-bold">{mode === 'borrow' ? 'Recibes (Capital):' : 'Entregas (Capital):'}</label>
                        <span className="text-white font-mono text-sm">{formatMoney(loanAmount)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max={Math.max(50, maxAmount)} 
                        step="10" 
                        value={loanAmount} 
                        onChange={handleLoanChange} 
                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${mode === 'borrow' ? 'accent-blue-500' : 'accent-green-500'}`}
                    />
                    <div className="text-[9px] text-right text-gray-500">Máx disponible: {formatMoney(maxAmount)}</div>
                 </div>

                 {/* Repayment Slider */}
                 <div className="bg-slate-800 p-2 rounded border border-slate-700">
                     <div className="flex justify-between mb-1">
                        <label className="text-gray-400 font-bold">{mode === 'borrow' ? 'Devolverás:' : 'Te devolverán:'}</label>
                        <span className="text-yellow-400 font-mono text-sm">{formatMoney(repayAmount)}</span>
                     </div>
                     <input 
                        type="range" 
                        min={loanAmount} 
                        max={loanAmount * 3} 
                        step="10" 
                        value={repayAmount} 
                        onChange={e => setRepayAmount(Number(e.target.value))} 
                        className="w-full accent-yellow-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                        <span>Interés: {profitPercent}%</span>
                        <span className="text-green-400">Ganancia: {formatMoney(profit)}</span>
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
                      disabled={targetId === -1 || loanAmount > maxAmount}
                      onClick={handleConfirm}
                      className={`w-full py-3 rounded text-white font-bold disabled:opacity-50 shadow-lg border-t border-white/20 
                        ${mode === 'borrow' 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'}`
                      }
                 >
                     {mode === 'borrow' ? 'SOLICITAR PRÉSTAMO' : 'CONCEDER PRÉSTAMO'}
                 </button>
             </div>
        </div>
    );
};
