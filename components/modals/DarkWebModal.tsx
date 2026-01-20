
import React from 'react';
import { GameState, InventoryItemType } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

interface DarkWebModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

const ITEMS: { id: InventoryItemType, name: string, price: number, icon: string, desc: string }[] = [
    { id: 'dark_molotov', name: 'Cóctel Molotov', price: 500, icon: '🔥', desc: 'Reduce 1 nivel de edificio en una propiedad.' },
    { id: 'dark_lawyer', name: 'Abogado Corrupto', price: 300, icon: '⚖️', desc: 'Tarjeta "Salir de la Cárcel" extra.' },
    { id: 'dark_okupa', name: 'Contrato Okupa', price: 400, icon: '🏚️', desc: 'Bloquea el cobro de alquiler de una propiedad por 3 turnos.' },
    { id: 'dark_immunity', name: 'Inmunidad Dipl.', price: 600, icon: '🛡️', desc: 'No pagas alquiler durante 5 turnos.' }
];

export const DarkWebModal: React.FC<DarkWebModalProps> = ({ state, dispatch }) => {
    if (!state.showDarkWeb) return null;

    const currentPlayer = state.players[state.currentPlayerIndex];

    const buy = (id: string) => {
        dispatch({ type: 'BUY_ITEM', payload: { itemId: id } });
    };

    const use = (id: string) => {
        let targetTileId = undefined;
        if (id === 'dark_molotov' || id === 'dark_okupa') {
            const currentTile = state.tiles[currentPlayer.pos];
            if (currentTile && currentTile.owner && currentTile.owner !== currentPlayer.id && currentTile.owner !== 'E') {
                targetTileId = currentPlayer.pos;
            } else {
                alert("Debes estar en la casilla de un rival para usar esto.");
                return;
            }
        }
        dispatch({ type: 'USE_ITEM', payload: { itemId: id, targetTileId } });
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 font-mono">
            <div className="bg-gray-900 border-2 border-green-600 w-full max-w-3xl p-6 shadow-[0_0_30px_rgba(0,255,0,0.2)] rounded relative flex flex-col max-h-[90vh]">
                <button onClick={() => dispatch({type: 'TOGGLE_DARK_WEB'})} className="absolute top-2 right-2 text-green-600 hover:text-white">✕</button>
                
                <h2 className="text-3xl text-green-500 font-bold mb-2 text-center glitch-text">DARK WEB MARKET</h2>
                <div className="text-center text-xs text-green-800 mb-6">Conexión Segura Tor v3... Identidad Oculta...</div>

                <div className="flex gap-6 overflow-y-auto pr-2">
                    {/* Shop */}
                    <div className="flex-1">
                        <h3 className="text-white border-b border-green-900 mb-2 pb-1">CATÁLOGO ILEGAL</h3>
                        <div className="space-y-2">
                            {ITEMS.map(item => (
                                <div key={item.id} className="bg-black/50 p-2 border border-green-900 hover:border-green-500 flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl">{item.icon}</div>
                                        <div>
                                            <div className="text-green-400 font-bold text-sm">{item.name}</div>
                                            <div className="text-[10px] text-gray-500">{item.desc}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => buy(item.id)} 
                                        disabled={currentPlayer.money < item.price}
                                        className="bg-green-900/40 text-green-400 text-xs px-3 py-1 border border-green-700 hover:bg-green-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        {formatMoney(item.price)}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Services Section */}
                        <h3 className="text-white border-b border-green-900 mt-6 mb-2 pb-1">SERVICIOS DE HACKEO</h3>
                        <div className="bg-black/50 p-3 border border-yellow-900 hover:border-yellow-600 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🗳️</div>
                                <div>
                                    <div className="text-yellow-500 font-bold text-sm">Amañar Elecciones</div>
                                    <div className="text-[10px] text-gray-500">Fuerza la convocatoria de elecciones inmediata.</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => dispatch({type: 'BRIBE_GOV', payload: {pId: currentPlayer.id}})}
                                disabled={currentPlayer.money < 200}
                                className="bg-yellow-900/40 text-yellow-400 text-xs px-3 py-1 border border-yellow-700 hover:bg-yellow-600 hover:text-black disabled:opacity-30"
                            >
                                $200
                            </button>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="w-1/3 border-l border-green-900 pl-4">
                        <h3 className="text-white border-b border-green-900 mb-2 pb-1">TU INVENTARIO</h3>
                        <div className="space-y-2">
                            {(currentPlayer.inventory || []).length === 0 && <div className="text-gray-600 text-xs italic">Vacío...</div>}
                            {(currentPlayer.inventory || []).map((itemId, idx) => {
                                const def = ITEMS.find(i => i.id === itemId);
                                if (!def) return null;
                                return (
                                    <div key={idx} className="bg-gray-800 p-2 text-xs flex justify-between items-center">
                                        <span className="text-white">{def.name}</span>
                                        <button onClick={() => use(itemId)} className="text-[10px] bg-blue-900 text-blue-200 px-1 rounded hover:bg-blue-700">USAR</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 text-[10px] text-red-900 text-center">
                    ⚠️ ADVERTENCIA: El uso de la Dark Web puede resultar en encarcelamiento inmediato por el FBI. Úsalo bajo tu propio riesgo.
                </div>
            </div>
        </div>
    );
};
