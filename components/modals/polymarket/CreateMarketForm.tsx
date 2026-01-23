
import React, { useState } from 'react';
import { GameState, Player, MarketAssets } from '../../../types';
import { AssetBuilder } from './AssetBuilder';
import { formatMoney } from '../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    currentPlayer: Player;
    onComplete: () => void;
}

export const CreateMarketForm: React.FC<Props> = ({ state, dispatch, currentPlayer, onComplete }) => {
    const [condition, setCondition] = useState('');
    const [targetId, setTargetId] = useState(-1);
    const [creatorSide, setCreatorSide] = useState<'YES' | 'NO'>('YES');
    
    // Helper to create empty asset bag
    const emptyAssets = (): MarketAssets => ({ money: 0, farlopa: 0, props: [], shares: [], options: [], loans: [] });

    // My Stake
    const [myAssets, setMyAssets] = useState<MarketAssets>(emptyAssets());
    
    // Their Stake
    const [theirAssets, setTheirAssets] = useState<MarketAssets>(emptyAssets());

    const target = state.players.find(p => p.id === targetId);

    const create = () => {
        // Fix: Allow targetId 0
        if (targetId === -1 || !condition) return;
        
        dispatch({
            type: 'CREATE_PREDICTION_MARKET',
            payload: {
                creatorId: currentPlayer.id,
                targetId,
                condition,
                creatorSide,
                myStake: myAssets,
                theirStake: theirAssets
            }
        });
        onComplete();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-blue-400 text-xs font-bold uppercase tracking-wider">1. Rival</label>
                    <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" value={targetId} onChange={e => setTargetId(parseInt(e.target.value))}>
                        <option value={-1}>Seleccionar contrincante...</option>
                        {state.players.filter(p => p.id !== currentPlayer.id && p.alive).map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Saldo: {formatMoney(p.money)})</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-blue-400 text-xs font-bold uppercase tracking-wider">3. Tu Posición</label>
                    <div className="flex gap-4">
                        <button onClick={() => setCreatorSide('YES')} className={`flex-1 py-3 rounded font-black border-2 transition-all ${creatorSide === 'YES' ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-900 border-slate-700 text-gray-500'}`}>APUESTO SÍ</button>
                        <button onClick={() => setCreatorSide('NO')} className={`flex-1 py-3 rounded font-black border-2 transition-all ${creatorSide === 'NO' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900 border-slate-700 text-gray-500'}`}>APUESTO NO</button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-blue-400 text-xs font-bold uppercase tracking-wider">2. Predicción (Detallada)</label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white h-24 resize-none focus:border-blue-500 outline-none"
                    placeholder='Ej: "El jugador 3 caerá en un Hotel antes del turno 50"'
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <AssetBuilder 
                    label="Tú Pones (Tus Activos)" 
                    player={currentPlayer} 
                    assets={myAssets} 
                    setAssets={setMyAssets} 
                    state={state} 
                />
                <AssetBuilder 
                    label={`Él Pone (${target?.name || 'Rival'})`} 
                    player={target} 
                    assets={theirAssets} 
                    setAssets={setTheirAssets} 
                    state={state} 
                    disabled={!target}
                />
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded text-center text-xs text-yellow-500 mb-2">
                ⚠️ Al crear la apuesta, los fondos se retirarán <b>inmediatamente</b> de ambos jugadores. Asegúrate de tener acuerdo verbal.
            </div>

            <button 
                onClick={create}
                disabled={targetId === -1 || !condition}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl shadow-lg border-b-4 border-blue-900 active:scale-95 transition-all text-lg uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
                CREAR CONTRATO INTELIGENTE
            </button>
        </div>
    );
};
