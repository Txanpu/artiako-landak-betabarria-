
import React, { useState } from 'react';
import { GameState, PredictionMarket, MarketAssets, Player, TileData, MonopolyCompany } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

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

const ActiveMarkets: React.FC<{ state: GameState, dispatch: any, currentPlayer: Player }> = ({ state, dispatch, currentPlayer }) => {
    const markets = state.predictionMarkets;

    if (markets.length === 0) return <div className="text-center text-gray-500 italic py-10">No hay mercados activos. Crea uno.</div>;

    return (
        <div className="space-y-6">
            {markets.map(m => {
                // Determine Voting State
                const humans = state.players.filter(p => !p.isBot && p.alive);
                const nextVoter = humans.find(p => !m.votes[p.id]);
                const isVoting = m.status === 'voting';

                return (
                    <div key={m.id} className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 p-3">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                                m.status === 'active' ? 'bg-green-900/50 text-green-400 border-green-500' : 
                                m.status === 'voting' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500 animate-pulse' : 
                                'bg-gray-800 text-gray-400 border-gray-600'
                            }`}>
                                {m.status}
                            </span>
                        </div>

                        {/* Header: Condition */}
                        <div className="mb-6 pr-20">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                                Creado por {state.players.find(p => p.id === m.creatorId)?.name}
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight italic">"{m.condition}"</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-stretch">
                            {/* LEFT: YES / NO Cards */}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* YES SIDE */}
                                <StakeSide 
                                    state={state} 
                                    side="YES" 
                                    player={state.players.find(p => p.id === m.playerYes)} 
                                    assets={m.stakesYes} 
                                    isWinner={false}
                                />
                                {/* NO SIDE */}
                                <StakeSide 
                                    state={state} 
                                    side="NO" 
                                    player={state.players.find(p => p.id === m.playerNo)} 
                                    assets={m.stakesNo} 
                                    isWinner={false}
                                />
                            </div>

                            {/* RIGHT: Validation / Voting Actions */}
                            <div className="w-full md:w-64 flex flex-col justify-center border-l border-slate-700 pl-4 bg-black/20 rounded-r-xl p-2">
                                
                                {m.status === 'active' && (
                                    <button onClick={() => dispatch({type: 'TRIGGER_MARKET_VOTE', payload: {marketId: m.id}})} className="w-full h-full min-h-[80px] bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-sm uppercase shadow-lg border-b-4 border-yellow-800 active:scale-95 transition-all animate-pulse flex items-center justify-center text-center">
                                        EMPEZAR A VALIDAR
                                        <br/>
                                        <span className="text-[10px] font-normal lowercase">(Votación)</span>
                                    </button>
                                )}

                                {isVoting && (
                                    <div className="w-full h-full flex flex-col gap-2 justify-center">
                                        {nextVoter ? (
                                            <>
                                                <div className="bg-blue-900/40 p-2 rounded text-center border border-blue-500/30 mb-2">
                                                    <div className="text-[9px] text-blue-300 uppercase font-bold tracking-widest mb-1">TURNO DE VOTO</div>
                                                    <div className="text-lg font-black text-white flex items-center justify-center gap-2">
                                                        {nextVoter.avatar} {nextVoter.name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 italic mt-1">¿Se cumplió la condición?</div>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => dispatch({type: 'CAST_MARKET_VOTE', payload: {marketId: m.id, pId: nextVoter.id, vote: 'YES'}})} 
                                                        className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-lg font-black text-xl py-3 border-b-4 border-green-800 active:scale-95 transition-all"
                                                    >
                                                        SÍ
                                                    </button>
                                                    <button 
                                                        onClick={() => dispatch({type: 'CAST_MARKET_VOTE', payload: {marketId: m.id, pId: nextVoter.id, vote: 'NO'}})} 
                                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black text-xl py-3 border-b-4 border-red-800 active:scale-95 transition-all"
                                                    >
                                                        NO
                                                    </button>
                                                </div>
                                                <div className="text-center text-[10px] text-gray-500 mt-2">
                                                    Votos: {Object.keys(m.votes).length} / {humans.length}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center animate-pulse">
                                                <div className="text-yellow-400 font-bold mb-2">RECUENTO FINAL...</div>
                                                <div className="text-xs text-gray-500">Procesando resultados</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const StakeSide = ({ state, side, player, assets, isWinner }: { state: GameState, side: string, player?: Player, assets: MarketAssets, isWinner: boolean }) => {
    const isYes = side === 'YES';
    // Visual style updates as requested: better cards
    const bgClass = isYes ? 'bg-gradient-to-br from-green-900/40 to-green-950/40 border-green-600' : 'bg-gradient-to-br from-red-900/40 to-red-950/40 border-red-600';
    const textClass = isYes ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`rounded-xl border-2 p-4 ${bgClass} relative flex flex-col h-full shadow-inner`}>
            <div className={`font-black text-4xl mb-1 opacity-90 ${textClass}`}>{side}</div>
            <div className="text-sm font-bold text-white mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current opacity-80" style={{backgroundColor: player?.color || '#555'}}></span>
                {player?.name || <span className="text-gray-500 italic">Vacante</span>}
            </div>
            
            <div className="space-y-2 text-xs text-gray-300 flex-1">
                {assets.money > 0 && <div className="flex items-center gap-2 bg-black/20 p-1 rounded"><span className="text-lg">💵</span> <span className="font-mono font-bold text-white text-lg">${formatMoney(assets.money)}</span></div>}
                {assets.farlopa > 0 && <div className="flex items-center gap-2 bg-black/20 p-1 rounded"><span className="text-lg">❄️</span> <span className="font-bold">{assets.farlopa}u Droga</span></div>}
                
                {assets.props.length > 0 && (
                    <div className="flex flex-col bg-black/20 p-1 rounded">
                        <div className="flex items-center gap-2 mb-1"><span className="text-lg leading-none">🏠</span> <span className="font-bold text-[10px] uppercase opacity-70">Propiedades</span></div>
                        <div className="flex flex-wrap gap-1">
                            {assets.props.map(id => (
                                <span key={id} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-600 text-yellow-500">{state.tiles[id].name}</span>
                            ))}
                        </div>
                    </div>
                )}
                
                {assets.shares.length > 0 && (
                    <div className="flex flex-col bg-black/20 p-1 rounded">
                        <div className="flex items-center gap-2 mb-1"><span className="text-lg leading-none">🏢</span> <span className="font-bold text-[10px] uppercase opacity-70">Acciones</span></div>
                        <div className="flex flex-col gap-1">
                            {assets.shares.map((s, i) => (
                                <span key={i} className="text-[10px] text-orange-300">{s.count}x {state.companies.find(c=>c.id===s.companyId)?.name}</span>
                            ))}
                        </div>
                    </div>
                )}

                {(assets.options.length > 0 || assets.loans.length > 0) && (
                    <div className="flex flex-col bg-black/20 p-1 rounded">
                        <div className="flex items-center gap-2 mb-1"><span className="text-lg leading-none">📜</span> <span className="font-bold text-[10px] uppercase opacity-70">Contratos</span></div>
                        <div className="flex flex-col gap-1">
                            {assets.options.length > 0 && <span className="text-[10px] text-green-300">{assets.options.length} Opciones Financieras</span>}
                            {assets.loans.length > 0 && <span className="text-[10px] text-blue-300">{assets.loans.length} Préstamos (Cobrador)</span>}
                        </div>
                    </div>
                )}

                {assets.money === 0 && assets.farlopa === 0 && assets.props.length === 0 && assets.shares.length === 0 && assets.options.length === 0 && assets.loans.length === 0 && (
                    <span className="opacity-30 italic block text-center py-4">Sin apuesta</span>
                )}
            </div>
        </div>
    );
};

// --- CREATE FORM ---
const CreateMarketForm: React.FC<{ state: GameState, dispatch: any, currentPlayer: Player, onComplete: () => void }> = ({ state, dispatch, currentPlayer, onComplete }) => {
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

const AssetBuilder: React.FC<{ 
    label: string, 
    player?: Player, 
    assets: MarketAssets, 
    setAssets: (a: MarketAssets) => void, 
    state: GameState,
    disabled?: boolean 
}> = ({ label, player, assets, setAssets, state, disabled }) => {
    
    const toggleProp = (id: number) => {
        if (assets.props.includes(id)) setAssets({ ...assets, props: assets.props.filter(x => x !== id) });
        else setAssets({ ...assets, props: [...assets.props, id] });
    };

    const toggleLoan = (id: string) => {
        if (assets.loans.includes(id)) setAssets({ ...assets, loans: assets.loans.filter(x => x !== id) });
        else setAssets({ ...assets, loans: [...assets.loans, id] });
    };

    const toggleOption = (id: string) => {
        if (assets.options.includes(id)) setAssets({ ...assets, options: assets.options.filter(x => x !== id) });
        else setAssets({ ...assets, options: [...assets.options, id] });
    };

    const toggleShare = (compId: string) => {
        // Toggle entire holding for simplicity in UI, or implement slider. 
        // Let's implement toggle "All Shares" for simplicity
        const holding = state.companies.find(c => c.id === compId)?.shareholders[player?.id || -1] || 0;
        const exists = assets.shares.find(s => s.companyId === compId);
        
        if (exists) {
            setAssets({ ...assets, shares: assets.shares.filter(s => s.companyId !== compId) });
        } else {
            setAssets({ ...assets, shares: [...assets.shares, { companyId: compId, count: holding }] });
        }
    };

    if (disabled || !player) {
        return (
            <div className="bg-slate-900 p-4 rounded border border-slate-700 opacity-50">
                <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">{label}</h4>
                <div className="text-center italic text-xs">Selecciona un rival primero.</div>
            </div>
        );
    }

    const myTiles = state.tiles.filter(t => t.owner === player.id);
    const myLoans = state.loans.filter(l => l.lenderId === player.id && l.status === 'active');
    const myOptions = state.financialOptions.filter(o => o.holderId === player.id);
    const myShares = state.companies.filter(c => (c.shareholders[player.id] || 0) > 0);

    return (
        <div className="bg-slate-900 p-4 rounded border border-slate-700 flex flex-col h-96">
            <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-2">{label}</h4>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {/* Money */}
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Dinero</span>
                        <span>Max: {formatMoney(player.money)}</span>
                    </div>
                    <input 
                        type="range" min="0" max={player.money} step="50" 
                        value={assets.money} 
                        onChange={e => setAssets({ ...assets, money: parseInt(e.target.value) })} 
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                    <div className="text-right text-green-400 font-mono text-xs">{formatMoney(assets.money)}</div>
                </div>

                {/* Properties */}
                {myTiles.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-400 mb-1 font-bold">Propiedades</div>
                        <div className="grid grid-cols-2 gap-1">
                            {myTiles.map(t => (
                                <button 
                                    key={t.id} 
                                    onClick={() => toggleProp(t.id)}
                                    className={`text-[10px] px-2 py-1 rounded truncate border ${assets.props.includes(t.id) ? 'bg-blue-900 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shares */}
                {myShares.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-400 mb-1 font-bold">Acciones (Todo)</div>
                        <div className="space-y-1">
                            {myShares.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => toggleShare(c.id)}
                                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${assets.shares.some(s => s.companyId === c.id) ? 'bg-orange-900/50 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    {c.name} ({c.shareholders[player.id]} acc.)
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Options & Loans */}
                {(myOptions.length > 0 || myLoans.length > 0) && (
                    <div>
                        <div className="text-xs text-gray-400 mb-1 font-bold">Financiero</div>
                        <div className="space-y-1">
                            {myOptions.map(o => (
                                <button 
                                    key={o.id} 
                                    onClick={() => toggleOption(o.id)}
                                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${assets.options.includes(o.id) ? 'bg-green-900/50 border-green-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    Opción {o.type.toUpperCase()} sobre {state.tiles[o.propertyId]?.name}
                                </button>
                            ))}
                            {myLoans.map(l => (
                                <button 
                                    key={l.id} 
                                    onClick={() => toggleLoan(l.id)}
                                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${assets.loans.includes(l.id) ? 'bg-blue-900/50 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-gray-400'}`}
                                >
                                    Préstamo a {state.players.find(p => p.id === l.borrowerId)?.name} (${l.principal})
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
