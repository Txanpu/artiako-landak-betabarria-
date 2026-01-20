
import React, { useState } from 'react';
import { GameState } from '../../../types';
import { DerivativesIssuance } from './derivatives/DerivativesIssuance';
import { DerivativesPortfolio } from './derivatives/DerivativesPortfolio';

export const DerivativesPanel: React.FC<{ dispatch: React.Dispatch<any>, state?: GameState }> = ({ dispatch, state }) => {
    if (!state) return <div>Error: State not passed to Derivatives.</div>;

    const [activeView, setActiveView] = useState<'create' | 'wallet'>('create');
    const currentPlayer = state.players[state.currentPlayerIndex];
    const myOptionsCount = state.financialOptions.filter(o => o.holderId === currentPlayer.id).length;

    return (
        <div className="bg-slate-900 p-4 rounded border border-green-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-green-800 pb-2">
                <h3 className="font-bold text-green-400">Derivados Financieros</h3>
                <div className="flex gap-2">
                    <button onClick={() => setActiveView('create')} className={`px-2 py-1 text-[10px] rounded font-bold ${activeView === 'create' ? 'bg-green-600 text-white' : 'bg-slate-800 text-gray-400'}`}>EMITIR</button>
                    <button onClick={() => setActiveView('wallet')} className={`px-2 py-1 text-[10px] rounded font-bold ${activeView === 'wallet' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>MI CARTERA ({myOptionsCount})</button>
                </div>
            </div>

            {activeView === 'create' ? (
                <DerivativesIssuance state={state} dispatch={dispatch} />
            ) : (
                <DerivativesPortfolio state={state} dispatch={dispatch} />
            )}
        </div>
    );
};
