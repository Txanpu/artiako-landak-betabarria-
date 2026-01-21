
import React from 'react';
import { GameState } from '../../types';
import { ActiveTradeView } from './trade/ActiveTradeView';
import { TradeProposalForm } from './trade/TradeProposalForm';

interface TradeModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const TradeModal: React.FC<TradeModalProps> = ({ state, dispatch }) => {
    if (!state.showTradeModal) return null;

    const currentPlayer = state.players[state.currentPlayerIndex];

    // Case 1: Viewing an Active Trade (Incoming or Sent)
    if (state.trade) {
        return (
            <ActiveTradeView 
                trade={state.trade} 
                players={state.players} 
                tiles={state.tiles} 
                currentPlayerId={currentPlayer.id} 
                dispatch={dispatch} 
            />
        );
    }

    // Case 2: Creating a New Trade
    return <TradeProposalForm state={state} currentPlayer={currentPlayer} dispatch={dispatch} />;
};
