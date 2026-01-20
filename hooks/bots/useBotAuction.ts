import React, { useEffect } from 'react';
import { GameState } from '../../types';
import { getBotBid } from '../../utils/extras';
import { getPredatorBid } from '../../utils/risk';

// Added React import to satisfy React.Dispatch namespace requirement
export const useBotAuction = (state: GameState, dispatch: React.Dispatch<any>) => {
    useEffect(() => {
        if (state.auction && state.auction.isOpen) {
            const auction = state.auction;
            const activeBots = state.players.filter(p => p.isBot && auction.activePlayers.includes(p.id));
            
            if (activeBots.length > 0) {
                // Random delay to simulate thinking and not flood updates
                const delay = 800 + Math.random() * 1200;
                
                const timer = setTimeout(() => {
                    if (!state.auction?.isOpen) return;
                    
                    // Iterate through bots and see if any want to bid
                    // We only pick ONE bot to bid per 'tick' to avoid race conditions/instant wars in 1ms
                    const biddingBot = activeBots.find(bot => {
                         // 1. Check Predator Bid first (Higher priority aggression)
                         const predatorBid = getPredatorBid(state, bot.id);
                         if (predatorBid && predatorBid > state.auction!.currentBid) {
                             dispatch({ type: 'BID_AUCTION', payload: { amount: predatorBid, pId: bot.id } });
                             return true;
                         }

                         // 2. Standard Bid
                         const bidAmount = getBotBid(state, bot.id);
                         if (bidAmount && bidAmount > state.auction!.currentBid) {
                             dispatch({ type: 'BID_AUCTION', payload: { amount: bidAmount, pId: bot.id } });
                             return true; 
                         }
                         return false;
                    });

                }, delay);
                return () => clearTimeout(timer);
            }
        }
    }, [state.auction?.currentBid, state.auction?.highestBidder, state.auction?.isOpen, state.players, state.tiles, dispatch]);
};