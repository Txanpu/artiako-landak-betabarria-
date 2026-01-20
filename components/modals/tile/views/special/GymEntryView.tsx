
import React from 'react';
import { GameState, TileData, Player } from '../../../../../types';
import { formatMoney, getRent } from '../../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
    close: () => void;
}

export const GymEntryView: React.FC<Props> = ({ state, dispatch, t, currentPlayer, close }) => {
    const isOwner = t.owner === currentPlayer.id;
    const isAtLocation = currentPlayer.pos === t.id;
    
    // Calculate potential rent
    const diceTotal = state.dice[0] + state.dice[1];
    const rent = getRent(t, diceTotal, state.tiles, state);
    
    const ownerName = t.owner && typeof t.owner === 'number' 
        ? state.players.find(p => p.id === t.owner)?.name 
        : 'Estado';

    // If I own it, or it's free, show standard management or buy options via this view?
    // Since we redirected to SpecialTileModal, we handle simple buy logic here too.
    const canBuy = t.owner === null && currentPlayer.money >= (t.price || 0) && state.gov === 'authoritarian';
    const canAuction = t.owner === null && ['right', 'libertarian', 'anarchy'].includes(state.gov);

    return (
        <div className="bg-[#2e2e2e] text-white w-full max-w-sm rounded-lg overflow-hidden shadow-2xl border-4 border-slate-700 animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-red-600 p-4 flex items-center justify-between border-b-4 border-slate-800">
                <div className="font-bold text-lg">POKÉMON GYM</div>
                <div className="bg-white rounded-full w-8 h-8 border-4 border-black flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
            </div>

            <div className="p-6 text-center">
                <h2 className="text-2xl font-black mb-1">{t.name}</h2>
                <div className="text-xs text-gray-400 mb-6 uppercase tracking-wider">Líder de Gimnasio: <span className="text-white font-bold">{isOwner ? 'TÚ' : ownerName}</span></div>

                {isOwner ? (
                    <div className="bg-green-800/50 p-4 rounded border border-green-600 mb-4">
                        <p className="font-bold text-green-300">¡Bienvenido a tu Gimnasio!</p>
                        <p className="text-xs text-gray-300 mt-1">Los rivales que caigan aquí deberán vencerte en combate o pagar doble.</p>
                        {/* Owner management could go here */}
                    </div>
                ) : t.owner === null ? (
                    <div className="space-y-3">
                        <div className="text-sm text-gray-300 mb-2">Este gimnasio está buscando un nuevo líder.</div>
                        {canBuy && <button onClick={() => { dispatch({type: 'BUY_PROP'}); close(); }} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold shadow-lg">Comprar Licencia ({formatMoney(t.price||0)})</button>}
                        {canAuction && <button onClick={() => { dispatch({type: 'START_AUCTION', payload: t.id}); close(); }} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded font-bold shadow-lg">Subastar Licencia</button>}
                        <div className="text-xs text-gray-500">Solo Gobiernos Autoritarios permiten compra directa.</div>
                    </div>
                ) : isAtLocation ? (
                    // RIVAL CHALLENGE
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded border border-slate-600">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 uppercase">Renta Estándar</span>
                                <span className="font-mono text-lg font-bold text-yellow-400">{formatMoney(rent)}</span>
                            </div>
                            <hr className="border-slate-600 mb-2"/>
                            <p className="text-[10px] text-left text-gray-300 leading-tight">
                                ⚔️ <b>RETO DEL LÍDER:</b> Gana 5 combates Pokémon seguidos (Gen 5 Rules) para no pagar nada.
                                <br/><br/>
                                ⚠️ <b>RIESGO:</b> Si pierdes o huyes, pagarás el DOBLE ({formatMoney(rent * 2)}).
                            </p>
                        </div>

                        <button 
                            onClick={() => { close(); dispatch({type: 'START_POKEMON_BATTLE', payload: { tileId: t.id, rent }}); }}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-4 rounded-lg shadow-lg border-b-4 border-red-900 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                        >
                            <span>¡DESAFÍO POKÉMON!</span>
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-white/20 animate-spin"></div>
                        </button>

                        <button 
                            onClick={() => { dispatch({type: 'PAY_RENT'}); close(); }}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold py-3 rounded text-xs"
                        >
                            Soy un cobarde, pago la renta normal.
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm italic">Debes estar aquí para desafiar al líder.</div>
                )}

                <button onClick={close} className="mt-6 text-xs text-gray-500 hover:text-white underline">Cerrar</button>
            </div>
        </div>
    );
};
