
import React, { useState } from 'react';
import { GameState } from '../../types';
import { ActiveMarkets } from './polymarket/ActiveMarkets';
import { CreateMarketForm } from './polymarket/CreateMarketForm';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const PolymarketModal: React.FC<Props> = ({ state, dispatch }) => {
    const [tab, setTab] = useState<'create' | 'active'>('active');
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (!state.showPolymarket) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans">
            <div className="w-full max-w-5xl bg-[#0f172a] border-2 border-blue-600 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-[#0f172a] p-6 border-b border-blue-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl filter drop-shadow-lg">🔮</div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">POLYMARKET</h2>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Mercado de Predicciones Descentralizado</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch({type: 'TOGGLE_POLYMARKET'})} className="text-blue-500 hover:text-white text-2xl font-bold">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-900 border-b border-slate-700 shrink-0">
                    <button onClick={() => setTab('active')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${tab === 'active' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-slate-800'}`}>Mercados Activos</button>
                    <button onClick={() => setTab('create')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${tab === 'create' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-slate-800'}`}>Crear Apuesta</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-[#0b1120] p-6 custom-scrollbar">
                    {tab === 'active' && <ActiveMarkets state={state} dispatch={dispatch} currentPlayer={currentPlayer} />}
                    {tab === 'create' && <CreateMarketForm state={state} dispatch={dispatch} currentPlayer={currentPlayer} onComplete={() => setTab('active')} />}
                </div>
            </div>
        </div>
    );
};
