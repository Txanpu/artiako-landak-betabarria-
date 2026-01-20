
import React, { useState } from 'react';

interface BankLoanPanelProps {
    dispatch: React.Dispatch<any>;
}

export const BankLoanPanel: React.FC<BankLoanPanelProps> = ({ dispatch }) => {
    const [loanAmount, setLoanAmount] = useState(500);
    const [loanTurns, setLoanTurns] = useState(10);

    return (
        <div className="bg-slate-900 p-4 rounded border border-slate-700">
            <h3 className="font-bold mb-2 text-white">Pedir Préstamo al Estado</h3>
            <p className="text-[10px] text-gray-500 mb-2">Dinero rápido del contribuyente. Si no pagas, el Estado embarga tus bienes.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="text-gray-400">Cantidad: ${loanAmount}</label>
                <input type="range" min="100" max="2000" step="100" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="accent-red-500"/>
                <div className="col-span-2 flex justify-between"><span>Plazo: {loanTurns} turnos</span><span>Interés: 20%</span></div>
                <button onClick={() => dispatch({type: 'TAKE_LOAN', payload: { amount: loanAmount, interest: 20, turns: loanTurns }})} className="col-span-2 bg-red-600 hover:bg-red-500 py-2 rounded text-white font-bold">Solicitar Fondos</button>
            </div>
        </div>
    );
};
