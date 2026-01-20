import React, { useEffect } from 'react';
import { GameState } from '../types';
import { useBotAuction } from './bots/useBotAuction';
import { useBotTradeResponse } from './bots/useBotTradeResponse';
import { useBotTurn } from './bots/useBotTurn';

// Added React import to satisfy React.Dispatch namespace requirement
export const useGameBots = (state: GameState, dispatch: React.Dispatch<any>) => {
    // 1. Handle Auction Bidding
    useBotAuction(state, dispatch);

    // 2. Handle Incoming Trade Responses
    useBotTradeResponse(state, dispatch);

    // 3. Handle Bot Turn Logic (Roll, Move, Buy, etc.)
    useBotTurn(state, dispatch);

    // 4. Handle Event/Modal Auto-Close for Bots
    useEffect(() => {
        const currentPlayer = state.players[state.currentPlayerIndex];
        
        // Only proceed if it is a Bot's turn
        if (currentPlayer && currentPlayer.isBot) {
            
            // A. Active Event Popup (Info Modal)
            // Bots cannot read, so we auto-close it after a delay so humans can read it.
            if (state.activeEvent) {
                const timer = setTimeout(() => {
                    dispatch({ type: 'CLOSE_EVENT' });
                }, 2500); 
                return () => clearTimeout(timer);
            }

            // B. Casino Modal 
            // Bots don't play casino visually usually, but if it opens, close it.
            if (state.showCasinoModal) {
                const timer = setTimeout(() => {
                    dispatch({ type: 'CLOSE_CASINO' });
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [state.activeEvent, state.showCasinoModal, state.currentPlayerIndex, state.players, dispatch]);
};