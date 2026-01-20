
import React, { useEffect } from 'react';
import { GameState, TileType } from '../../types';
import { getBotBuildActions, shouldBotBuy, getBestMove, checkOffensiveOptionExec } from '../../utils/gameLogic';
import { getStrategicTradeProposal, getStrategicOptionAction } from '../../utils/ai/trade';

// Added React import to satisfy React.Dispatch namespace requirement
export const useBotTurn = (state: GameState, dispatch: React.Dispatch<any>) => {
    useEffect(() => {
        if (!state.gameStarted || state.activeEvent) return;

        const currentPlayer = state.players[state.currentPlayerIndex];
        // Logic Trigger: Only if it's bot's turn, and no modal blocking (auction/trade)
        if (currentPlayer && currentPlayer.isBot && !state.auction && !state.trade) {
            
            const botTurn = async () => {
                const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                // 0. CHECK STATE
                // If skipping turn
                if (currentPlayer.skipTurns && currentPlayer.skipTurns > 0) {
                    await wait(800);
                    dispatch({ type: 'ROLL_DICE' }); // Logic handles skip decrement
                    await wait(800);
                    dispatch({ type: 'END_TURN' });
                    return;
                }

                // 1. PRE-ROLL PHASE
                // A. Unjail?
                if (currentPlayer.jail > 0) {
                    await wait(1000);
                    const isRich = currentPlayer.money > 500;
                    const hasCard = (currentPlayer.jailCards || 0) > 0;
                    
                    if (hasCard) {
                        dispatch({ type: 'PAY_JAIL' }); // Use card logic implied or pay
                    } else if (isRich) {
                        dispatch({ type: 'PAY_JAIL' });
                    } else {
                        dispatch({ type: 'ROLL_DICE' });
                    }
                    return; 
                }

                // B. Build Houses (Before moving)
                if (!state.rolled && state.pendingMoves === 0) {
                    const builds = getBotBuildActions(state, currentPlayer);
                    if (builds.length > 0) {
                        await wait(500);
                        dispatch({ type: 'BUILD_HOUSE', payload: { tId: builds[0] } });
                        return; // Re-run effect
                    }
                }

                // C. Roll Dice
                if (!state.rolled && state.pendingMoves === 0) {
                    await wait(1000);
                    dispatch({ type: 'ROLL_DICE' });
                    return;
                }

                // D. Movement Phase (Handling selections with PATHFINDING)
                if (state.pendingMoves > 0) {
                    if (state.movementOptions.length > 0) {
                        await wait(800);
                        // AI: Pathfinding (Avoid Hotels)
                        const choice = getBestMove(state, currentPlayer, state.movementOptions);
                        dispatch({ type: 'SELECT_MOVE', payload: choice });
                        return;
                    }
                    return; // Waiting for animation
                }

                if (state.isMoving) return; // Wait for arrival

                // E. LANDING / ACTION PHASE
                if (state.rolled && state.pendingMoves === 0) {
                    await wait(1000); // Read the tile
                    
                    const tile = state.tiles[currentPlayer.pos];

                    // E1. Buy / Auction
                    if (tile.type === TileType.PROP && tile.owner === null) {
                        const buyDecision = shouldBotBuy(state, currentPlayer, tile);
                        
                        if (buyDecision && state.gov === 'authoritarian') {
                            dispatch({ type: 'BUY_PROP' });
                        } else if (state.gov !== 'left') {
                            dispatch({ type: 'START_AUCTION', payload: tile.id });
                        }
                        return; 
                    }

                    // E2. Pay Rent (Handled via button in UI, bot needs to click it)
                    if (tile.type === TileType.PROP && tile.owner !== null && tile.owner !== currentPlayer.id && tile.owner !== 'E') {
                        dispatch({ type: 'PAY_RENT' });
                        await wait(800);
                    }

                    // E3. STRATEGIC PHASE (Trades & Options)
                    // Only perform if rich enough to pay fees and not in debt
                    if (currentPlayer.money > 0) {
                        // 1. OFFENSIVE OPTION EXECUTION (Bankruptcy Killer)
                        const killOptionId = checkOffensiveOptionExec(state, currentPlayer);
                        if (killOptionId) {
                            await wait(500);
                            dispatch({ type: 'EXERCISE_OPTION', payload: { optId: killOptionId } });
                            // Don't return, allow trading too
                        }

                        // 2. Trading / Creating Options (Random chance to not spam)
                        if (Math.random() < 0.30) {
                            const tradeProposal = getStrategicTradeProposal(state, currentPlayer);
                            if (tradeProposal) {
                                dispatch({ type: 'PROPOSE_TRADE', payload: tradeProposal });
                                return; // Wait for human response
                            }
                            
                            // If no trade, maybe buy an option?
                            const optionAction = getStrategicOptionAction(state, currentPlayer);
                            if (optionAction) {
                                dispatch({ type: 'CREATE_OPTION_CONTRACT', payload: optionAction.payload });
                                await wait(500);
                            }
                        }
                    }

                    // E4. Insider Ability (Risk)
                    if (currentPlayer.insiderTokens > 0 && Math.random() < 0.1) {
                        dispatch({ type: 'USE_INSIDER', payload: { pId: currentPlayer.id } });
                        await wait(500);
                    }

                    // F. End Turn
                    await wait(500);
                    dispatch({ type: 'END_TURN' });
                }
            };

            botTurn();
        }

    }, [
        state.currentPlayerIndex, 
        state.rolled, 
        state.pendingMoves, 
        state.isMoving, 
        state.auction?.isOpen, 
        state.trade?.isOpen, 
        // We include specific properties to trigger re-eval
        state.players[state.currentPlayerIndex]?.money,
        state.players[state.currentPlayerIndex]?.pos,
        dispatch
    ]);
};
