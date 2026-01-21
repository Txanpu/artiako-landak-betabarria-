
import React, { useState, useEffect } from 'react';
import { GameState } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

type DerivativeMode = 'sell_call' | 'buy_call' | 'buy_put' | 'sell_put';

export const DerivativesIssuance: React.FC<Props> = ({ state, dispatch }) => {
    const [mode, setMode] = useState<DerivativeMode>('sell_call');
    const [selectedPropId, setSelectedPropId] = useState<number>(-1);
    const [counterpartyId, setCounterpartyId] = useState<number>(-1);
    const [strikePrice, setStrikePrice] = useState(200);
    const [premium, setPremium] = useState(50);

    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Logic to determine whose properties to show
    // Sell Call (I own prop) | Buy Put (I own prop)
    // Buy Call (They own prop) | Sell Put (They own prop)
    const targetIsMe = mode === 'sell_call' || mode === 'buy_put';
    
    const targetProperties = targetIsMe 
        ? state.tiles.filter(t => t.owner === currentPlayer.id)
        : (counterpartyId !== -1 ? state.tiles.filter(t => t.owner === counterpartyId) : []);

    // Reset property selection when mode or counterparty changes
    useEffect(() => {
        setSelectedPropId(-1);
    }, [mode, counterpartyId]);

    const getDescription = () => {
        switch (mode) {
            case 'sell_call': 
                return (
                    <p className="text-gray-400 mb-2 italic">
                        "Vendo el derecho a <b>COMPRARME</b> mi propiedad. Yo cobro la prima."
                        <br/><span className="text-green-400">Tú recibes prima. Rival paga.</span>
                    </p>
                );
            case 'buy_call':
                return (
                    <p className="text-gray-400 mb-2 italic">
                        "Compro el derecho a <b>COMPRARLE</b> su propiedad al rival. Yo pago la prima."
                        <br/><span className="text-red-400">Tú pagas prima. Rival recibe.</span>
                    </p>
                );
            case 'buy_put':
                return (
                    <p className="text-gray-400 mb-2 italic">
                        "Compro el derecho a <b>VENDER</b> mi propiedad (Seguro). Yo pago la prima."
                        <br/><span className="text-red-400">Tú pagas prima. Rival recibe.</span>
                    </p>
                );
            case 'sell_put':
                return (
                    <p className="text-gray-400 mb-2 italic">
                        "Vendo un seguro (Put). Si él quiere vender, yo <b>DEBO COMPRAR</b> su propiedad."
                        <br/><span className="text-green-400">Tú recibes prima. Rival paga.</span>
                    </p>
                );
        }
    };

    return (
        <div className="space-y-4 text-xs">
            {/* Mode Selectors */}
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMode('sell_call')} className={`py-1 rounded font-bold border ${mode === 'sell_call' ? 'bg-green-700 text-white border-green-500' : 'bg-slate-800 text-gray-500 border-slate-600'}`}>VENDER CALL</button>
                <button onClick={() => setMode('buy_call')} className={`py-1 rounded font-bold border ${mode === 'buy_call' ? 'bg-blue-700 text-white border-blue-500' : 'bg-slate-800 text-gray-500 border-slate-600'}`}>COMPRAR CALL</button>
                <button onClick={() => setMode('buy_put')} className={`py-1 rounded font-bold border ${mode === 'buy_put' ? 'bg-red-700 text-white border-red-500' : 'bg-slate-800 text-gray-500 border-slate-600'}`}>COMPRAR PUT</button>
                <button onClick={() => setMode('sell_put')} className={`py-1 rounded font-bold border ${mode === 'sell_put' ? 'bg-purple-700 text-white border-purple-500' : 'bg-slate-800 text-gray-500 border-slate-600'}`}>VENDER PUT</button>
            </div>

            <div className="bg-slate-800 p-3 rounded border border-slate-700">
                {getDescription()}

                <div className="space-y-2">
                    {/* Counterparty Selection */}
                    <div>
                        <label className="block text-gray-500 mb-1">1. Contraparte (Rival)</label>
                        <select className="w-full bg-black border border-slate-600 rounded p-1 text-white" value={counterpartyId} onChange={e => setCounterpartyId(Number(e.target.value))}>
                            <option value={-1}>Seleccionar jugador...</option>
                            {state.players.filter(p => p.id !== currentPlayer.id && p.alive).map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Saldo: {formatMoney(p.money)})</option>
                            ))}
                        </select>
                    </div>

                    {/* Property Selection */}
                    <div>
                        <label className="block text-gray-500 mb-1">
                            2. Propiedad Subyacente ({targetIsMe ? 'Tus propiedades' : 'Propiedades del Rival'})
                        </label>
                        <select 
                            className="w-full bg-black border border-slate-600 rounded p-1 text-white disabled:opacity-50" 
                            value={selectedPropId} 
                            onChange={e => setSelectedPropId(Number(e.target.value))}
                            disabled={!targetIsMe && counterpartyId === -1}
                        >
                            <option value={-1}>
                                {!targetIsMe && counterpartyId === -1 ? 'Selecciona rival primero' : 'Seleccionar propiedad...'}
                            </option>
                            {targetProperties.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Val: {formatMoney(p.price||0)})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-gray-500 mb-1">Strike Price (Ejecución)</label>
                            <input type="number" value={strikePrice} onChange={e => setStrikePrice(Number(e.target.value))} className="w-full bg-black border border-slate-600 rounded p-1 text-white text-right" />
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Prima (Coste Contrato)</label>
                            <input type="number" value={premium} onChange={e => setPremium(Number(e.target.value))} className="w-full bg-black border border-slate-600 rounded p-1 text-white text-right" />
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => dispatch({type: 'CREATE_OPTION_CONTRACT', payload: { mode, propId: selectedPropId, strike: strikePrice, premium, counterpartyId }})}
                disabled={selectedPropId === -1 || counterpartyId === -1}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-3 rounded text-white font-bold disabled:opacity-50 shadow-lg border-b-4 border-emerald-800 active:scale-95"
            >
                FIRMAR CONTRATO
            </button>
        </div>
    );
};
