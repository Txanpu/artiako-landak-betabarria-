
import React from 'react';
import { GameState, TileData, Player } from '../../../../../types';
import { formatMoney } from '../../../../../utils/gameLogic';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const CasinoEntradaView: React.FC<Props> = ({ state, dispatch, t, currentPlayer }) => {
    const isOwner = t.owner === currentPlayer?.id;
    const isOwnerlessProp = t.owner === null;
    const isAtLocation = currentPlayer && currentPlayer.pos === t.id;
    
    // Authorization Logic
    const canBuyDirect = isOwnerlessProp && isAtLocation && currentPlayer && currentPlayer.money >= (t.price || 0) && state.gov === 'authoritarian';
    const canAuction = isOwnerlessProp && isAtLocation && ['right', 'libertarian', 'anarchy'].includes(state.gov);
    
    const mortgageValue = Math.floor((t.price || 0) * 0.5);
    const isRoulette = t.subtype === 'casino_roulette';

    return (
        <div className="bg-[#0f2015] w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_60px_rgba(255,215,0,0.3)] border-4 border-[#b8860b] animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
            
            {/* Header / Neon Sign */}
            <div className="relative p-6 text-center overflow-hidden border-b-4 border-[#b8860b] bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(220,38,38,0.3)_0%,transparent_70%)]"></div>
                <div className="relative z-10">
                    <div className="text-5xl mb-2 filter drop-shadow-[0_0_10px_gold]">
                        {isRoulette ? '🎡' : '♠️'}
                    </div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 uppercase tracking-widest drop-shadow-sm font-serif">
                        {isRoulette ? 'RULETA' : 'BLACKJACK'}
                    </h2>
                    <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-[0.5em] mt-1">
                        ROYAL CASINO
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] bg-green-900 relative">
                {/* Owner Badge */}
                <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-yellow-700/50 mb-4 backdrop-blur-sm">
                    <div>
                        <div className="text-[9px] text-yellow-500 uppercase font-bold tracking-wider">Gerente / Propietario</div>
                        <div className="text-white font-bold text-sm">
                            {t.owner === 'E' ? 'ESTADO' : (t.owner ? state.players.find(p => p.id === t.owner)?.name : 'VACANTE')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-yellow-500 uppercase font-bold tracking-wider">Valor Licencia</div>
                        <div className="text-xl font-mono text-white font-black">{formatMoney(t.price || 0)}</div>
                    </div>
                </div>

                {/* Rules / Info */}
                <div className="text-center mb-6">
                    <div className="text-xs text-green-200 bg-black/20 p-2 rounded italic border border-green-800">
                        "La casa siempre gana. Si compras este casino, te quedarás con las pérdidas de los jugadores... pero tendrás que pagar sus ganancias."
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    {/* Play Button */}
                    {isAtLocation && (
                        <button 
                            onClick={() => { dispatch({type: 'CLOSE_MODAL'}); dispatch({type: 'PLAY_CASINO', payload: {game: isRoulette ? 'roulette' : 'blackjack'}}); }} 
                            className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black py-4 rounded-lg shadow-lg border-b-4 border-red-900 active:scale-95 transition-all text-lg flex justify-center items-center gap-2"
                        >
                            <span>ENTRAR A JUGAR</span>
                            <span className="animate-pulse">🎲</span>
                        </button>
                    )}

                    {/* Management Buttons */}
                    {canBuyDirect && (
                        <button onClick={() => {dispatch({type: 'BUY_PROP'}); dispatch({type: 'CLOSE_MODAL'})}} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-3 rounded-lg shadow-lg border-b-4 border-yellow-800 active:scale-95 uppercase text-xs">
                            Adquirir Licencia
                        </button>
                    )}
                    {canAuction && (
                        <button onClick={() => {dispatch({type: 'START_AUCTION', payload: t.id}); dispatch({type: 'CLOSE_MODAL'})}} className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-lg border-b-4 border-purple-900 active:scale-95 uppercase text-xs">
                            Subastar Licencia
                        </button>
                    )}
                    
                    {isOwner && !t.mortgaged && (
                        <button onClick={() => dispatch({type: 'MORTGAGE_PROP', payload: {tId: t.id}})} className="w-full border border-red-500/50 text-red-400 hover:bg-red-900/30 py-2 rounded text-xs font-bold uppercase">
                            Hipotecar Negocio (+{formatMoney(mortgageValue)})
                        </button>
                    )}

                    <button onClick={() => dispatch({type: 'CLOSE_MODAL'})} className="w-full text-center text-[10px] text-yellow-600/70 hover:text-yellow-500 uppercase font-bold mt-2">
                        Volver a la calle
                    </button>
                </div>
            </div>
        </div>
    );
};
