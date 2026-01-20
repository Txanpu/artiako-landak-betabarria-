
import React, { useEffect } from 'react';
import { GameState } from '../../types';
import { evaluateTradeByBot } from '../../utils/ai/trade';

// Added React import to satisfy React.Dispatch namespace requirement
export const useBotTradeResponse = (state: GameState, dispatch: React.Dispatch<any>) => {
    useEffect(() => {
        if (!state.gameStarted || state.activeEvent) return;

        // Check if there is an active trade
        if (state.trade && state.trade.isOpen) {
            // Find target player correctly by ID
            const targetPlayer = state.players.find(p => p.id === state.trade?.targetId);
            
            if (targetPlayer && targetPlayer.isBot) {
                const bot = targetPlayer;
                const timer = setTimeout(() => {
                    const accept = evaluateTradeByBot(state, bot, state.trade!);
                    if (accept) dispatch({ type: 'ACCEPT_TRADE' });
                    else dispatch({ type: 'REJECT_TRADE' });
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [state.gameStarted, state.activeEvent, state.trade, state.players, dispatch]);
};
