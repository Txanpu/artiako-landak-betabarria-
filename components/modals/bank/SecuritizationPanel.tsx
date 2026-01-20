
import React, { useState } from 'react';
import { GameState, Player } from '../../../types';

interface SecuritizationPanelProps {
    state: GameState;
    currentPlayer: Player;
    dispatch: React.Dispatch<any>;
}

export const SecuritizationPanel: React.FC<SecuritizationPanelProps> = ({ state, currentPlayer, dispatch }) => {
    const [poolName, setPoolName] = useState('Nuevo Pool');
    const [selectedLoansForPool, setSelectedLoansForPool] = useState<string[]>([]);

    // Helper for My Loans
    const myLoans = state.loans.filter(l => l.lenderId === currentPlayer.id && l.status === 'active' && !l.poolId && !l.shares);

    return (
        <div className="bg-slate-900 p-4 rounded border border-purple-700 space-y-4">
            <div>
              <h3 className="font-bold mb-2 text-purple-400">Gestión de Activos (Titulización)</h3>
              <p className="text-[10px] text-gray-500 mb-2">Empaqueta préstamos en Pools (ABS) o fracciona un préstamo único en participaciones (Shares) para vender en subasta.</p>
            </div>

            {/* Create Pool Section */}
            <div className="border-t border-slate-700 pt-2">
              <h4 className="text-xs font-bold text-white mb-1">Crear Pool (ABS)</h4>
              <input type="text" value={poolName} onChange={e => setPoolName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded p-1 mb-2 text-xs text-white" placeholder="Nombre del Pool" />
              <div className="h-24 overflow-y-auto border border-slate-700 p-1 mb-2 bg-black/20">
                  {myLoans.length === 0 && <div className="text-gray-500 text-xs p-2">No tienes préstamos para empaquetar.</div>}
                  {myLoans.map(l => (
                      <div key={l.id} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-800">
                          <input type="checkbox" checked={selectedLoansForPool.includes(l.id)} onChange={(e) => { if(e.target.checked) setSelectedLoansForPool([...selectedLoansForPool, l.id]); else setSelectedLoansForPool(selectedLoansForPool.filter(id => id !== l.id)); }} />
                          <span className="font-mono text-yellow-500">${l.principal}</span>
                          <span className="text-gray-400"> (Deudor: {state.players.find(p=>p.id===l.borrowerId)?.name})</span>
                      </div>
                  ))}
              </div>
              <button onClick={() => { dispatch({type: 'CREATE_POOL', payload: { loanIds: selectedLoansForPool, name: poolName }}); setSelectedLoansForPool([]); }} className="w-full bg-purple-600 hover:bg-purple-500 py-1 rounded text-white text-xs font-bold" disabled={selectedLoansForPool.length === 0}>Crear Pool</button>
            </div>

            {/* Split Loan Section */}
            <div className="border-t border-slate-700 pt-2">
                <h4 className="text-xs font-bold text-white mb-1">Fraccionar Préstamo (Shares)</h4>
                <div className="space-y-1">
                  {myLoans.map(l => (
                      <div key={l.id} className="flex justify-between items-center bg-black/20 p-1 rounded text-xs">
                          <span>Préstamo ${l.principal} a {state.players.find(p=>p.id===l.borrowerId)?.name}</span>
                          <button onClick={() => dispatch({type: 'SECURITIZE_LOAN', payload: { loanId: l.id }})} className="bg-blue-600 px-2 py-0.5 rounded text-white text-[10px]">Dividir 10x10%</button>
                      </div>
                  ))}
                </div>
            </div>
            
            {/* List Shares/Units Section */}
            <div className="border-t border-slate-700 pt-2">
                <h4 className="text-xs font-bold text-white mb-1">Vender Activos (Subasta)</h4>
                {/* My Pools */}
                {state.loanPools.filter(p => (p.holdings[currentPlayer.id]||0) > 0).map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-black/20 p-1 rounded text-xs mb-1">
                        <span>Pool: {p.name} ({p.holdings[currentPlayer.id]} uds)</span>
                        <button onClick={() => dispatch({type: 'LIST_ASSET', payload: { assetType: 'poolUnit', refId: p.id, amount: 100, price: 50, startAuction: true }})} className="bg-yellow-600 px-2 py-0.5 rounded text-black text-[10px]">Subastar 100 uds</button>
                    </div>
                ))}
                
                {/* My Shares */}
                {state.loans.filter(l => l.shares && l.shares.some(s => s.ownerId === currentPlayer.id)).map(l => {
                    const myShares = l.shares!.filter(s => s.ownerId === currentPlayer.id);
                    return myShares.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-black/20 p-1 rounded text-xs mb-1">
                            <span>Share {s.bips/100}% de Préstamo ${l.principal}</span>
                            <button onClick={() => dispatch({type: 'LIST_ASSET', payload: { assetType: 'loanShare', refId: l.id, subRefId: s.id, amount: s.bips, price: Math.floor(l.principal * (s.bips/10000)), startAuction: true }})} className="bg-yellow-600 px-2 py-0.5 rounded text-black text-[10px]">Subastar</button>
                        </div>
                    ));
                })}
            </div>
        </div>
    );
};
