
import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';

export const useDiceAnimation = (state: GameState, dispatch: React.Dispatch<any>) => {
    const [isRolling, setIsRolling] = useState(false);
    const [displayDice, setDisplayDice] = useState<number[]>([1, 1]);

    const handleRollDice = useCallback(() => {
        if (isRolling || state.rolled || state.pendingMoves > 0) return;
        setIsRolling(true);
        
        // Check if player is high to animate 3 dice
        const player = state.players[state.currentPlayerIndex];
        const count = (player.highTurns || 0) > 0 ? 3 : 2;

        const interval = setInterval(() => {
            setDisplayDice(Array.from({length: count}, () => Math.floor(Math.random()*10)));
        }, 80);
  
        setTimeout(() => {
            clearInterval(interval);
            setIsRolling(false);
            dispatch({ type: 'ROLL_DICE' });
        }, 800);
    }, [isRolling, state.rolled, state.pendingMoves, dispatch, state.players, state.currentPlayerIndex]);

    // Sync display dice with state when state updates from other sources (bots)
    useEffect(() => {
        if(!isRolling) {
            setDisplayDice(state.dice);
        }
    }, [state.dice, isRolling]);

    return { isRolling, displayDice, handleRollDice };
};
