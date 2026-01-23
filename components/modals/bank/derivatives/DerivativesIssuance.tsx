
import React, { useState, useEffect } from 'react';
import { GameState } from '../../../../types';
import { formatMoney } from '../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

type DerivativeMode = 'sell_call' | 'buy_call' | 'buy_put' | 'sell_put';

export const DerivativesIssuance: React.FC<Props> = ({ state, dispatch }) => {
    // Default changed to 'buy_call' -> More intuitive for "I want to bet on a property"
    const [mode, setMode] = useState<DerivativeMode>('buy_call');
    const [selectedPropId, setSelectedPropId] = useState<number>(-1);
    const [counterpartyId, setCounterpartyId] = useState<number>(-1);
    const [strikePrice, setStrikePrice] = useState(200);
    const [premium, setPremium] = useState(50);

    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Logic to determine whose properties to show
    const targetIsMe = mode === 'sell_call' || mode === 'buy_put';
    
    const targetProperties = currentPlayer ? (targetIsMe 
        ? state.tiles.filter(t => t.owner === currentPlayer.id)
        : (counterpartyId !== -1 ? state.tiles.filter(t => t.owner === counterpartyId) : [])) : [];

    // Reset property selection when mode or counterparty changes
    useEffect(() => {
        setSelectedPropId(-1);
    }, [mode, counterpartyId]);

    // Safety check after hooks
    if (!currentPlayer) return null; 

    const getDescription = () => {
        switch (mode) {
            case 'sell_call': 
                return (
                    <div className="text-gray-400 mb-2 italic text-[10px]">
                        <p className="mb-1">"Vendo el derecho a <b>COMPRARME</b> mi propiedad."</p>
                        <span className="text-green-400 font-bold">GANAS: Prima inmediata.</span> <span className="text-red-400 font-bold">RIESGO: Perder la propiedad barato.</span>
                    </div>
                );
            case 'buy_call':
                return (
                    <div className="text-gray-400 mb-2 italic text-[10px]">
                        <p className="mb-1">"Compro el derecho a <b>ROBARLE (COMPRAR)</b> su propiedad."</p>
                        <span className="text-red-400 font-bold">PAGAS: Prima.</span> <span className="text-green-400 font-bold">VENTAJA: Compras a precio fijo aunque suba.</span>
                    </div>
                );
            case 'buy_put':
                return (
                    <div className="text-gray-400 mb-2 italic text-[10px]">
                        <p className="mb-1">"Compro el derecho a <b>VENDERLE</b> mi propiedad (Seguro)."</p>
                        <span className="text-red-400 font-bold">PAGAS: Prima.</span> <span className="text-green-400 font-bold">VENTAJA: Te aseguras un precio de venta.</span>
                    </div>
                );
            case 'sell_put':
                return (
                    <div className="text-gray-400 mb-2 italic text-[10px]">
                        <p className="mb-1">"Vendo un seguro. Si él quiere vender, yo <b>DEBO COMPRAR</b>."</p>
                        <span className="text-green-400 font-bold">GANAS: Prima.</span> <span className="text-red-400 font-bold">RIESGO: Comprar basura cara.</span>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4 text-xs h-full flex flex-col">
            {/* Mode Selectors */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
                <button onClick={() => setMode('buy_call')} className={`py-2 rounded font-bold border transition-colors ${mode === 'buy_call' ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-gray-500 border-slate-600 hover:bg-slate-700'}`}>COMPRAR CALL</button>
                <button onClick={() => setMode('sell_call')} className={`py-2 rounded font-bold border transition-colors ${mode === 'sell_call' ? 'bg-green-700 text-white border-green-500' : 'bg-slate-800 text-gray-500 border-slate-600 hover:bg-slate-700'}`}>VENDER CALL</button>
                <button onClick={() => setMode('buy_put')} className={`py-2 rounded font-bold border transition-colors ${mode === 'buy_put' ? 'bg-orange-700 text-white border-orange-500' : 'bg-slate-800 text-gray-500 border-slate-600 hover:bg-slate-700'}`}>COMPRAR PUT</button>
                <button onClick={() => setMode('sell_put')} className={`py-2 rounded font-bold border transition-colors ${mode === 'sell_put' ? 'bg-purple-700 text-white border-purple-500' : 'bg-slate-800 text-gray-500 border-slate-600 hover:bg-slate-700'}`}>VENDER PUT</button>
            </div>

            <div className="bg-slate-800 p-3 rounded border border-slate-700 flex-1 overflow-y-auto">
                {getDescription()}

                <div className="space-y-3 mt-2">
                    {/* Counterparty Selection */}
                    <div>
                        <label className="block text-gray-500 mb-1 font-bold">1. Contraparte (Rival)</label>
                        <select className="w-full bg-black border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500" value={counterpartyId} onChange={e => setCounterpartyId(Number(e.target.value))}>
                            <option value={-1}>Seleccionar jugador...</option>
                            {state.players.filter(p => p.id !== currentPlayer.id && p.alive).map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Saldo: {formatMoney(p.money)})</option>
                            ))}
                        </select>
                    </div>

                    {/* Property Selection */}
                    <div>
                        <label className="block text-gray-500 mb-1 font-bold">
                            2. Propiedad ({targetIsMe ? 'Tus propiedades' : 'Propiedades del Rival'})
                        </label>
                        <select 
                            className="w-full bg-black border border-slate-600 rounded p-2 text-white disabled:opacity-50 outline-none focus:border-blue-500" 
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

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                            <label className="block text-gray-500 mb-1 font-bold">Strike Price</label>
                            <div className="text-[9px] text-gray-600 mb-1">Precio futuro</div>
                            <input type="number" value={strikePrice} onChange={e => setStrikePrice(Number(e.target.value))} className="w-full bg-black border border-slate-600 rounded p-1 text-white text-right font-mono" />
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1 font-bold">Prima</label>
                            <div className="text-[9px] text-gray-600 mb-1">Coste contrato</div>
                            <input type="number" value={premium} onChange={e => setPremium(Number(e.target.value))} className="w-full bg-black border border-slate-600 rounded p-1 text-white text-right font-mono" />
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => dispatch({type: 'CREATE_OPTION_CONTRACT', payload: { mode, propId: selectedPropId, strike: strikePrice, premium, counterpartyId }})}
                disabled={selectedPropId === -1 || counterpartyId === -1}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-3 rounded text-white font-bold disabled:opacity-50 shadow-lg border-b-4 border-emerald-800 active:scale-95 shrink-0"
            >
                FIRMAR CONTRATO
            </button>
        </div>
    );
};
