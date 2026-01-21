
import React, { useState } from 'react';
import { GameState } from '../types';
import { EVENTS_DECK } from '../utils/gameLogic';
import { DebugProperties } from './debug/DebugProperties';
import { DebugPlayers } from './debug/DebugPlayers';

interface DebugPanelProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ state, dispatch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'status' | 'players' | 'props' | 'events' | 'export'>('status');

    if (!state.gameStarted) return null;

    const currentPlayer = state.players[state.currentPlayerIndex];

    const copyState = () => {
        navigator.clipboard.writeText(JSON.stringify(state));
        alert('Estado copiado al portapapeles');
    };

    return (
        <>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 z-[999] p-3 rounded-full shadow-2xl border-2 transition-all ${isOpen ? 'bg-red-600 border-red-400 text-white rotate-90 scale-110' : 'bg-slate-900 border-slate-600 text-gray-400 hover:text-white hover:scale-105'}`}
                title="Modo Dios / Debug"
            >
                🐞
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 z-[999] w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-400 overflow-hidden text-xs font-sans flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-10 fade-in duration-200">
                    
                    {/* Header Tabs */}
                    <div className="flex bg-slate-100 border-b border-slate-200 overflow-x-auto">
                        {[
                            {id: 'status', label: 'Estado'},
                            {id: 'players', label: 'Jugadores'},
                            {id: 'props', label: 'Propiedades'},
                            {id: 'events', label: 'Eventos'},
                            {id: 'export', label: 'Data'}
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3 px-2 font-bold text-[10px] uppercase tracking-wider transition-colors ${activeTab === tab.id ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 overflow-y-auto flex-1 bg-white">
                        
                        {/* 1. STATUS & GENERAL ACTIONS */}
                        {activeTab === 'status' && (
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-2 rounded border border-slate-200 grid grid-cols-2 gap-2">
                                    <div><span className="text-gray-500">Turno:</span> <b>{state.turnCount}</b></div>
                                    <div><span className="text-gray-500">Jugador:</span> <b>{currentPlayer.name}</b></div>
                                    <div><span className="text-gray-500">Rolled:</span> <b>{state.rolled ? 'SI' : 'NO'}</b></div>
                                    <div><span className="text-gray-500">Arcas:</span> <b>${state.estadoMoney}</b></div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Gobierno:</span>
                                        <select 
                                            value={state.gov}
                                            onChange={(e) => dispatch({type: 'DEBUG_SET_GOV', payload: e.target.value})}
                                            className="ml-2 border rounded p-1 text-[10px] uppercase font-bold"
                                        >
                                            <option value="left">Izquierda</option>
                                            <option value="right">Derecha</option>
                                            <option value="authoritarian">Autoritario</option>
                                            <option value="libertarian">Libertario</option>
                                            <option value="anarchy">Anarquía</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => dispatch({type: 'ROLL_DICE'})} className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded font-bold">Forzar Dados</button>
                                    <button onClick={() => dispatch({type: 'END_TURN'})} className="bg-red-100 hover:bg-red-200 text-red-800 p-2 rounded font-bold">Pasar Turno</button>
                                    <button onClick={() => dispatch({type: 'TOGGLE_HEATMAP'})} className="bg-orange-100 hover:bg-orange-200 text-orange-800 p-2 rounded">Mapa Calor</button>
                                    <button onClick={() => dispatch({type: 'TOGGLE_WEATHER_MODAL'})} className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 p-2 rounded">Weather UI</button>
                                </div>
                            </div>
                        )}

                        {/* 2. PLAYERS & INVENTORY */}
                        {activeTab === 'players' && <DebugPlayers state={state} dispatch={dispatch} />}

                        {/* 3. PROPERTIES & BUILDINGS */}
                        {activeTab === 'props' && <DebugProperties state={state} dispatch={dispatch} />}

                        {/* 4. EVENTS TRIGGER */}
                        {activeTab === 'events' && (
                            <div className="space-y-1">
                                <p className="text-gray-400 text-[10px] uppercase font-bold mb-2">Forzar Evento en el próximo robo de carta</p>
                                {EVENTS_DECK.map(evt => (
                                    <button 
                                        key={evt.id}
                                        onClick={() => { dispatch({type: 'DEBUG_TRIGGER_EVENT', payload: evt.id}); alert(`Evento ${evt.title} fijado.`); }}
                                        className={`w-full text-left p-2 rounded border border-transparent text-xs truncate transition-colors ${state.nextEventId === evt.id ? 'bg-purple-100 border-purple-500 text-purple-900 font-bold' : 'hover:bg-slate-50 hover:border-slate-300'}`}
                                    >
                                        ⚡ {evt.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 5. DATA EXPORT */}
                        {activeTab === 'export' && (
                            <div className="space-y-2">
                                <button onClick={copyState} className="w-full bg-slate-800 text-white p-3 rounded hover:bg-slate-700 font-bold shadow-lg">
                                    📋 Copiar JSON del Estado
                                </button>
                                <div className="text-[10px] text-gray-500 font-bold uppercase mt-4">Log del Sistema:</div>
                                <textarea readOnly className="w-full h-40 bg-slate-100 border p-2 text-[10px] font-mono rounded resize-none focus:outline-none" value={state.logs.slice(0, 50).join('\n')} />
                            </div>
                        )}

                    </div>
                </div>
            )}
        </>
    );
};
