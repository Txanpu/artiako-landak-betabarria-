import React, { useEffect } from 'react';
import { GameState } from '../types';

export const useBlackjackAnimation = (state: GameState, dispatch: React.Dispatch<any>) => {
    const bjState = state.blackjackState;
    const dealerPhase = bjState?.phase === 'dealer';

    useEffect(() => {
        if (dealerPhase) {
            // El Dealer saca carta cada 1 segundo para dar tensión visual
            const timer = setTimeout(() => {
                dispatch({ type: 'DEALER_STEP_BLACKJACK' });
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [dealerPhase, bjState?.dealerHand.length, dispatch]);
};