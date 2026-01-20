
import React, { useState } from 'react';
import { GameState } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const DerivativesIssuance: React.FC<Props> = ({ state, dispatch }) => {
    const [contractType, setContractType] = useState<'call' | 'put'>('call');
    const [selectedPropId, setSelectedPropId] = useState<number>(-1);
    const [counterpartyId, setCounterpartyId] = useState<number>(-1);
    const [strikePrice, setStrikePrice] = useState(200);
    const [premium, setPremium] = useState(50);

    const currentPlayer = state.players[state.currentPlayerIndex];
    const myProperties = state.tiles.filter(t => t.owner === currentPlayer.id);

    return (
        <div className="space-y-4 text-xs">
            <div className="flex gap-2 bg-black/20 p-1 rounded">
                <button onClick={() => setContractType('call')} className={`flex-1 py-1 rounded font-bold ${contractType === 'call' ? 'bg-green-700 text-white' : 'text-gray-500 hover:text-white'}`}>VENDER CALL</button>
                <button onClick={() => setContractType('put')} className={`flex-1 py-1 rounded font-bold ${contractType === 'put' ? 'bg-red-700 text-white' : 'text-gray-500 hover:text-white'}`}>COMPRAR PUT</button>
            </div>

            <div className="bg-slate-800 p-3 rounded border border-slate-700">
                {contractType === 'call' ? (
                    <p className="text-gray-400 mb-2 italic">
                        "Vendo a otro jugador el derecho a <b>COMPRARME</b> esta propiedad por {formatMoney(strikePrice)}."
                        <br/><span className="text-green-400">Cobras Prima: {formatMoney(premium)}</span>
                    </p>
                ) : (
                    <p className="text-gray-400 mb-2 italic">
                        "Pago a otro jugador para tener derecho a <b>VENDERLE</b> esta propiedad por {formatMoney(strikePrice)}."
                        <br/><span className="text-red-400">Pagas Prima: {formatMoney(premium)}</span>
                    </p>
                )}

                <div className="space-y-2">
                    <div>
                        <label className="block text-gray-500 mb-1">1. Propiedad Subyacente (Debes ser dueño)</label>
                        <select className="w-full bg-black border border-slate-600 rounded p-1 text-white" value={selectedPropId} onChange={e => setSelectedPropId(Number(e.target.value))}>
                            <option value={-1}>Seleccionar propiedad...</option>
                            {myProperties.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Val: {formatMoney(p.price||0)})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-500 mb-1">2. Contraparte ({contractType === 'call' ? 'Comprador opción' : 'Vendedor opción'})</label>
                        <select className="w-full bg-black border border-slate-600 rounded p-1 text-white" value={counterpartyId} onChange={e => setCounterpartyId(Number(e.target.value))}>
                            <option value={-1}>Seleccionar jugador...</option>
                            {state.players.filter(p => p.id !== currentPlayer.id && p.alive).map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Saldo: {formatMoney(p.money)})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-gray-500 mb-1">Strike Price</label>
                            <input type="number" value={strikePrice} onChange={e => setStrikePrice(Number(e.target.value))} className="w-full bg-black border border-slate-600 rounded p-1 text-white text-right" />
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Prima (Coste)</label>
                            <input type="number" value={premium} onChange={e => setPremium(Number(e.target.value))} className="w-full bg-black border border-slate-600 rounded p-1 text-white text-right" />
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => dispatch({type: 'CREATE_OPTION_CONTRACT', payload: { type: contractType, propId: selectedPropId, strike: strikePrice, premium, counterpartyId }})}
                disabled={selectedPropId === -1 || counterpartyId === -1}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-2 rounded text-white font-bold disabled:opacity-50"
            >
                FIRMAR CONTRATO
            </button>
        </div>
    );
};
