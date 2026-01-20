
import React, { useState } from 'react';
import { Player } from '../../../types';
import { formatMoney } from '../../../utils/gameLogic';

interface OffshorePanelProps {
    player: Player;
    dispatch: React.Dispatch<any>;
}

export const OffshorePanel: React.FC<OffshorePanelProps> = ({ player, dispatch }) => {
    const [amount, setAmount] = useState(100);
    const balance = player.offshoreMoney || 0;

    return (
        <div className="bg-slate-900 p-4 rounded border border-cyan-700 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🏝️</div>
            
            <div>
                <h3 className="font-bold mb-1 text-cyan-400">Paraíso Fiscal (Cuenta Suiza)</h3>
                <p className="text-[10px] text-gray-400">
                    El dinero aquí está a salvo de embargos, impuestos y robos.
                    <br/>
                    <span className="text-red-400">Comisión de blanqueo al retirar: 10%.</span>
                </p>
            </div>

            <div className="bg-black/30 p-3 rounded flex justify-between items-center border border-cyan-900/50">
                <span className="text-gray-400 text-xs">Saldo Offshore:</span>
                <span className="text-2xl font-mono text-cyan-300 font-bold">{formatMoney(balance)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* DEPOSIT */}
                <div className="bg-slate-800 p-2 rounded">
                    <div className="text-xs font-bold text-green-400 mb-1">INGRESAR</div>
                    <div className="text-[10px] text-gray-500 mb-2">De tu efectivo: {formatMoney(player.money)}</div>
                    <input 
                        type="range" 
                        min="0" 
                        max={player.money} 
                        step="10" 
                        value={amount > player.money ? player.money : amount} 
                        onChange={e => setAmount(Number(e.target.value))}
                        className="w-full accent-green-500 h-1 mb-2"
                    />
                    <div className="flex gap-1">
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(Math.min(player.money, Number(e.target.value)))}
                            className="w-20 bg-black border border-slate-600 rounded text-xs px-1"
                        />
                        <button 
                            onClick={() => dispatch({type: 'DEPOSIT_OFFSHORE', payload: { amount }})}
                            disabled={amount <= 0 || amount > player.money}
                            className="flex-1 bg-green-700 hover:bg-green-600 text-white text-[10px] font-bold rounded py-1 disabled:opacity-50"
                        >
                            DEPOSITAR
                        </button>
                    </div>
                </div>

                {/* WITHDRAW */}
                <div className="bg-slate-800 p-2 rounded">
                    <div className="text-xs font-bold text-red-400 mb-1">RETIRAR</div>
                    <div className="text-[10px] text-gray-500 mb-2">Recibes (90%): {formatMoney(Math.floor(amount * 0.9))}</div>
                    <input 
                        type="range" 
                        min="0" 
                        max={balance} 
                        step="10" 
                        value={amount > balance ? balance : amount} 
                        onChange={e => setAmount(Number(e.target.value))}
                        className="w-full accent-red-500 h-1 mb-2"
                    />
                    <div className="flex gap-1">
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(Math.min(balance, Number(e.target.value)))}
                            className="w-20 bg-black border border-slate-600 rounded text-xs px-1"
                        />
                        <button 
                            onClick={() => dispatch({type: 'WITHDRAW_OFFSHORE', payload: { amount }})}
                            disabled={amount <= 0 || amount > balance}
                            className="flex-1 bg-red-700 hover:bg-red-600 text-white text-[10px] font-bold rounded py-1 disabled:opacity-50"
                        >
                            SACAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
