
import React, { useState } from 'react';
import { GameState, TileType } from '../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const DebugProperties: React.FC<Props> = ({ state, dispatch }) => {
    const [filter, setFilter] = useState<'all'|'prop'|'special'>('all');
    const [search, setSearch] = useState('');

    const filteredTiles = state.tiles.filter(t => {
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === 'prop') return t.type === TileType.PROP;
        if (filter === 'special') return t.type !== TileType.PROP;
        return true;
    });

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Buscar propiedad..." 
                    className="flex-1 bg-slate-100 border rounded p-1 text-xs"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="border rounded p-1 text-xs bg-slate-100">
                    <option value="all">Todo</option>
                    <option value="prop">Props</option>
                    <option value="special">Especial</option>
                </select>
            </div>

            <div className="h-64 overflow-y-auto border border-slate-200 rounded">
                <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-200 sticky top-0">
                        <tr>
                            <th className="p-1">ID</th>
                            <th className="p-1">Nombre</th>
                            <th className="p-1">Dueño</th>
                            <th className="p-1">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTiles.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50">
                                <td className="p-1 font-mono text-gray-500">{t.id}</td>
                                <td className="p-1 font-bold truncate max-w-[100px]" title={t.name}>
                                    <span style={{color: t.color || 'black'}}>■</span> {t.name}
                                </td>
                                <td className="p-1">
                                    <select 
                                        className="bg-transparent border border-slate-300 rounded max-w-[80px]"
                                        value={t.owner === null ? 'null' : (t.owner === 'E' ? 'E' : t.owner)}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const ownerId = val === 'null' ? null : (val === 'E' ? 'E' : parseInt(val));
                                            dispatch({ type: 'DEBUG_SET_OWNER', payload: { tId: t.id, ownerId } });
                                        }}
                                        disabled={t.type !== TileType.PROP && t.type !== TileType.BANK && t.type !== TileType.SLOTS}
                                    >
                                        <option value="null">Nadie</option>
                                        <option value="E">Estado</option>
                                        {state.players.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-1 flex gap-1">
                                    {t.type === TileType.PROP && (
                                        <>
                                            <button 
                                                onClick={() => dispatch({type: 'DEBUG_TOGGLE_MORTGAGE', payload: {tId: t.id}})}
                                                className={`px-1 rounded border ${t.mortgaged ? 'bg-red-100 text-red-600 border-red-300' : 'bg-slate-100 text-slate-400'}`}
                                                title="Hipotecar"
                                            >
                                                Hip
                                            </button>
                                            
                                            {t.subtype !== 'utility' && !['rail','bus','ferry','air'].includes(t.subtype||'') && (
                                                <div className="flex items-center border border-slate-300 rounded bg-white">
                                                    <button 
                                                        className="px-1 hover:bg-slate-200 text-blue-600 font-bold"
                                                        onClick={() => dispatch({type: 'DEBUG_SET_BUILDINGS', payload: {tId: t.id, houses: Math.min(4, (t.houses||0)+1), hotel: false}})}
                                                    >
                                                        +
                                                    </button>
                                                    <span className="px-1 font-mono w-4 text-center">{t.hotel ? 'H' : t.houses || 0}</span>
                                                    <button 
                                                        className="px-1 hover:bg-slate-200 text-red-600 font-bold"
                                                        onClick={() => {
                                                            if (t.hotel) dispatch({type: 'DEBUG_SET_BUILDINGS', payload: {tId: t.id, houses: 4, hotel: false}});
                                                            else dispatch({type: 'DEBUG_SET_BUILDINGS', payload: {tId: t.id, houses: Math.max(0, (t.houses||0)-1), hotel: false}});
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <button 
                                                        className={`px-1 border-l hover:bg-yellow-100 ${t.hotel ? 'text-yellow-600' : 'text-gray-300'}`}
                                                        onClick={() => dispatch({type: 'DEBUG_SET_BUILDINGS', payload: {tId: t.id, houses: 0, hotel: !t.hotel}})}
                                                        title="Toggle Hotel"
                                                    >
                                                        H
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
