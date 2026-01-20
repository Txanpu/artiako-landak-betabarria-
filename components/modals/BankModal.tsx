
import React, { useState, useEffect } from 'react';
import { GameState, TileType } from '../../types';
import { BankLoanPanel } from './bank/BankLoanPanel';
import { P2PLoanPanel } from './bank/P2PLoanPanel';
import { SecuritizationPanel } from './bank/SecuritizationPanel';
import { DerivativesPanel } from './bank/DerivativesPanel';
import { OffshorePanel } from './bank/OffshorePanel';

interface BankModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const BankModal: React.FC<BankModalProps> = ({ state, dispatch }) => {
    const [activeTab, setActiveTab] = useState<'bank'|'p2p'|'pool'|'options'|'offshore'>('bank');
    
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    const isFlorentino = currentPlayer?.role === 'florentino';
    const isAtBank = currentPlayer && state.tiles[currentPlayer.pos].type === TileType.BANK;
    const canAccessCorrupt = isFlorentino || isAtBank;

    // Redirect if on restricted tab when not allowed
    useEffect(() => {
        if (state.showBankModal && !canAccessCorrupt && (activeTab === 'bank' || activeTab === 'offshore')) {
            setActiveTab('p2p');
        }
        // Auto-select bank if it's the main reason to open modal (landing on tile)
        if (state.showBankModal && canAccessCorrupt && activeTab !== 'bank' && isAtBank) {
            setActiveTab('bank');
        }
    }, [state.showBankModal, canAccessCorrupt, activeTab, isAtBank]);

    if (!state.showBankModal) return null;

    return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-800 p-6 rounded-xl border border-red-500/50 shadow-2xl max-w-lg w-full h-[90vh] flex flex-col">
                  <h2 className="text-2xl font-black text-red-500 mb-4 border-b border-red-900 pb-2 flex justify-between">
                      <span>🏛️ BANCA</span>
                      <span className="text-white text-sm font-normal self-center">Saldo: ${currentPlayer.money}</span>
                  </h2>
                  
                  <div className="flex gap-1 mb-4 bg-slate-900 p-1 rounded overflow-x-auto">
                      {canAccessCorrupt ? (
                        <>
                            <button onClick={()=>setActiveTab('bank')} className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${activeTab==='bank'?'bg-red-600 text-white':'text-gray-400 hover:text-white'}`}>Crédito</button>
                            <button onClick={()=>setActiveTab('offshore')} className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${activeTab==='offshore'?'bg-cyan-600 text-white':'text-gray-400 hover:text-white'}`}>Offshore</button>
                        </>
                      ) : (
                        <div className="px-3 py-1 rounded text-xs font-bold text-gray-600 bg-slate-800 border border-slate-700 cursor-not-allowed whitespace-nowrap">
                            Corrupto 🔒
                        </div>
                      )}
                      
                      <button onClick={()=>setActiveTab('p2p')} className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${activeTab==='p2p'?'bg-blue-600 text-white':'text-gray-400 hover:text-white'}`}>P2P</button>
                      <button onClick={()=>setActiveTab('pool')} className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${activeTab==='pool'?'bg-purple-600 text-white':'text-gray-400 hover:text-white'}`}>Titulizar</button>
                      <button onClick={()=>setActiveTab('options')} className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ${activeTab==='options'?'bg-green-600 text-white':'text-gray-400 hover:text-white'}`}>Opciones</button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {activeTab === 'bank' && canAccessCorrupt && <BankLoanPanel dispatch={dispatch} />}
                      {activeTab === 'offshore' && canAccessCorrupt && <OffshorePanel player={currentPlayer} dispatch={dispatch} />}
                      
                      {(activeTab === 'bank' || activeTab === 'offshore') && !canAccessCorrupt && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                              <span className="text-4xl mb-2">🔒</span>
                              <p className="text-center text-sm">Acceso Restringido.</p>
                              <p className="text-center text-xs mt-1">Necesitas ser Florentino o estar en la casilla de Banca.</p>
                          </div>
                      )}
                      {activeTab === 'p2p' && <P2PLoanPanel players={state.players} currentPlayerId={currentPlayer.id} dispatch={dispatch} />}
                      {activeTab === 'pool' && <SecuritizationPanel state={state} currentPlayer={currentPlayer} dispatch={dispatch} />}
                      {activeTab === 'options' && <DerivativesPanel dispatch={dispatch} state={state} />}
                  </div>
                  
                  <button onClick={() => dispatch({type: 'CLOSE_BANK_MODAL'})} className="mt-4 bg-slate-700 hover:bg-slate-600 py-2 rounded text-white font-bold">Cerrar Banca</button>
              </div>
          </div>
    );
};
