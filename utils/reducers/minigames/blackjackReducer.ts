
import { GameState } from '../../../types';
import { isPowerOff } from '../../gameLogic';
import { generateDeck, calculateHand, handleCasinoBankruptcy } from '../../minigames/casinoHelpers';

export const blackjackReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_BLACKJACK': {
            if (state.casinoPlays >= 3) {
                 return { ...state, logs: ['🚫 Límite de 3 jugadas por turno alcanzado.', ...state.logs] };
            }
            if (isPowerOff(state)) return state;

            const { bet } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];

            if (player.money < bet) return state;

            // Deduct Bet immediately
            const newPlayers = [...state.players];
            const p = { ...player, money: player.money - bet };
            newPlayers[pIdx] = p;

            // Transfer bet to Owner/Bank
            let newEstadoMoney = state.estadoMoney;
            const tile = state.tiles[player.pos];
            if (tile.owner && typeof tile.owner === 'number') {
                const oIdx = newPlayers.findIndex(x => x.id === tile.owner);
                if (oIdx !== -1) newPlayers[oIdx] = { ...newPlayers[oIdx], money: newPlayers[oIdx].money + bet };
            } else {
                newEstadoMoney += bet;
            }

            const deck = generateDeck();
            const playerHand = [deck.pop()!, deck.pop()!];
            const dealerHand = [deck.pop()!, { ...deck.pop()!, isHidden: true }];

            const pScore = calculateHand(playerHand);

            return {
                ...state,
                players: newPlayers,
                estadoMoney: newEstadoMoney,
                casinoPlays: state.casinoPlays + 1,
                blackjackState: {
                    deck,
                    playerHand,
                    dealerHand,
                    bet,
                    phase: pScore === 21 ? 'dealer' : 'playing',
                    resultMsg: '',
                    payout: 0
                }
            };
        }

        case 'HIT_BLACKJACK': {
            if (!state.blackjackState || state.blackjackState.phase !== 'playing') return state;
            const newState = { ...state.blackjackState };
            const card = newState.deck.pop()!;
            newState.playerHand = [...newState.playerHand, card];
            
            const score = calculateHand(newState.playerHand);
            if (score > 21) {
                // Bust
                newState.phase = 'result';
                newState.resultMsg = '💥 TE PASASTE (BUST). PIERDES.';
                newState.payout = 0;
            }
            return { ...state, blackjackState: newState };
        }

        case 'STAND_BLACKJACK': {
             if (!state.blackjackState) return state;
             return {
                 ...state,
                 blackjackState: { ...state.blackjackState, phase: 'dealer', dealerHand: state.blackjackState.dealerHand.map(c => ({...c, isHidden: false})) }
             };
        }

        case 'DEALER_STEP_BLACKJACK': {
            if (!state.blackjackState || state.blackjackState.phase !== 'dealer') return state;
            
            const bjs = { ...state.blackjackState };
            const dScore = calculateHand(bjs.dealerHand);
            const pScore = calculateHand(bjs.playerHand);

            // AI Logic
            if (dScore < 17) {
                const card = bjs.deck.pop()!;
                bjs.dealerHand = [...bjs.dealerHand, card];
                return { ...state, blackjackState: bjs }; 
            }

            // Dealer finished, calculate Result
            bjs.phase = 'result';
            let payout = 0;
            let msg = '';
            
            if (dScore > 21) {
                msg = '🎉 DEALER SE PASA. ¡GANAS!';
                payout = bjs.bet * 2;
            } else if (pScore > dScore) {
                msg = `🏆 GANAS (${pScore} vs ${dScore})`;
                payout = bjs.bet * 2;
                if (pScore === 21 && bjs.playerHand.length === 2) payout = Math.floor(bjs.bet * 2.5); 
            } else if (pScore === dScore) {
                msg = `🤝 EMPATE (${pScore})`;
                payout = bjs.bet;
            } else {
                msg = `❌ PIERDES (${pScore} vs ${dScore})`;
                payout = 0;
            }
            
            bjs.resultMsg = msg;
            bjs.payout = payout;

            // Handle Payout & Bankruptcy
            if (payout > 0) {
                 const playerIdx = state.currentPlayerIndex;
                 const tileId = state.players[playerIdx].pos;
                 const bkResult = handleCasinoBankruptcy(state, playerIdx, payout, tileId);
                 
                 return {
                     ...state,
                     players: bkResult.players,
                     tiles: bkResult.tiles,
                     logs: [...bkResult.logs, ...state.logs],
                     estadoMoney: bkResult.estadoMoney,
                     blackjackState: bjs
                 };
            }

            return { ...state, blackjackState: bjs };
        }
        
        default: return state;
    }
};
