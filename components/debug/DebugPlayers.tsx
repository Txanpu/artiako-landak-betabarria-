
import React from 'react';
import { GameState, InventoryItemType } from '../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

const TP_LOCATIONS = [
    { name: 'Salida', id: 0 },
    { name: 'Cárcel', id: 16 },
    { name: 'Parkie (N)', id: 32 },
    { name: 'Ir a Cárcel', id: 48 },
    { name: 'Banca', id: 50 },
    { name: 'Bird Center', id: 24 },
    { name: 'Fiore', id: 31 },
    { name: 'Quiz Maldini', id: 77 },
];

export const DebugPlayers: React.FC<Props> = ({ state, dispatch }) => {
    return (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {state.players.map((p, idx) => (
                <div key={p.id} className="bg-slate-50 border border-slate-200 rounded p-2 text-xs">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200">
                        <span className="font-bold text-slate-700">{p.name}</span>
                        <div className="flex gap-2">
                            <select 
                                value={p.role || 'civil'}
                                onChange={(e) => dispatch({type: 'DEBUG_SET_ROLE', payload: {pId: p.id, role: e.target.value}})}
                                className="bg-white border rounded px-1 text-[10px]"
                            >
                                <option value="civil">Civil</option>
                                <option value="proxeneta">Proxeneta</option>
                                <option value="florentino">Florentino</option>
                                <option value="fbi">FBI</option>
                                <option value="okupa">Okupa</option>
                                <option value="hacker">Hacker</option>
                            </select>
                            <button 
                                onClick={() => dispatch({type: 'DEBUG_TELEPORT', payload: {pId: p.id, pos: 10}})} 
                                className="text-[10px] bg-red-100 text-red-600 hover:bg-red-200 px-1 rounded font-bold"
                            >
                                JAIL
                            </button>
                        </div>
                    </div>

                    {/* Money & Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <label className="block text-[9px] text-gray-500">Dinero</label>
                            <div className="flex gap-1">
                                <input 
                                    type="number" 
                                    value={p.money} 
                                    onChange={(e) => dispatch({type: 'DEBUG_ADD_MONEY', payload: {pId: p.id, amount: parseInt(e.target.value) - p.money}})}
                                    className="w-full border rounded px-1"
                                />
                                <button onClick={() => dispatch({type: 'DEBUG_ADD_MONEY', payload: {pId: p.id, amount: 1000}})} className="bg-green-100 text-green-700 px-1 rounded font-bold">+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">Posición (TP)</label>
                            <div className="flex gap-1">
                                <input 
                                    type="number" 
                                    value={p.pos} 
                                    onChange={(e) => dispatch({type: 'DEBUG_TELEPORT', payload: {pId: p.id, pos: parseInt(e.target.value)}})}
                                    className="w-12 border rounded px-1"
                                />
                                <select 
                                    className="flex-1 border rounded px-1 text-[9px] bg-white"
                                    onChange={(e) => {
                                        if (e.target.value !== "") {
                                            dispatch({type: 'DEBUG_TELEPORT', payload: {pId: p.id, pos: parseInt(e.target.value)}});
                                            e.target.value = ""; // Reset
                                        }
                                    }}
                                >
                                    <option value="">Ir a...</option>
                                    {TP_LOCATIONS.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Inventory & Resources */}
                    <div className="bg-white border rounded p-1">
                        <div className="text-[9px] font-bold text-gray-400 mb-1">RECURSOS</div>
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <label className="text-[9px]">❄️ Farlopa</label>
                                <input type="number" className="w-full border rounded px-1" value={p.farlopa || 0} onChange={e => dispatch({type:'DEBUG_SET_RESOURCE', payload: {pId: p.id, resource: 'farlopa', value: parseInt(e.target.value)}})} />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px]">🕵️ Insider</label>
                                <input type="number" className="w-full border rounded px-1" value={p.insiderTokens || 0} onChange={e => dispatch({type:'DEBUG_SET_RESOURCE', payload: {pId: p.id, resource: 'insiderTokens', value: parseInt(e.target.value)}})} />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px]">🎟️ JailCards</label>
                                <input type="number" className="w-full border rounded px-1" value={p.jailCards || 0} onChange={e => dispatch({type:'DEBUG_SET_RESOURCE', payload: {pId: p.id, resource: 'jailCards', value: parseInt(e.target.value)}})} />
                            </div>
                        </div>
                        
                        <div className="text-[9px] font-bold text-gray-400 mb-1">ITEMS DARK WEB</div>
                        <div className="flex flex-wrap gap-1">
                            {['dark_molotov', 'dark_lawyer', 'dark_okupa', 'dark_immunity'].map(item => (
                                <button 
                                    key={item}
                                    onClick={() => dispatch({type: 'DEBUG_GIVE_ITEM', payload: {pId: p.id, itemId: item}})}
                                    className="px-2 py-1 bg-slate-800 text-white rounded text-[9px] hover:bg-slate-700"
                                    title={`Añadir ${item}`}
                                >
                                    + {item.replace('dark_', '')}
                                </button>
                            ))}
                        </div>
                        <div className="mt-1 text-[9px] text-gray-500 italic">
                            Tiene: {(p.inventory || []).join(', ') || 'Nada'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
