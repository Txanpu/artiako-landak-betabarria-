
import { GameState, PredictionMarket } from '../../../types';
import { executeMarketResolution, withdrawAssetsForMarket } from '../../minigames/polymarketLogic';

export const polymarketReducer = (state: GameState, action: any): GameState => {
    
    if (action.type === 'TOGGLE_POLYMARKET') {
        return { ...state, showPolymarket: !state.showPolymarket };
    }

    if (action.type === 'CREATE_PREDICTION_MARKET') {
        const { creatorId, targetId, condition, creatorSide, myStake, theirStake } = action.payload;
        
        // 1. Prepare Market Object
        const market: PredictionMarket = {
            id: `mkt_${Math.random().toString(36).substr(2, 6)}`,
            creatorId,
            targetId,
            condition,
            creatorSide,
            stakesYes: creatorSide === 'YES' ? myStake : theirStake,
            stakesNo: creatorSide === 'NO' ? myStake : theirStake,
            playerYes: creatorSide === 'YES' ? creatorId : targetId,
            playerNo: creatorSide === 'NO' ? creatorId : targetId,
            status: 'active', // IMMEDIATE ACTIVE STATUS
            votes: {},
            createdAtTurn: state.turnCount
        };

        // 2. IMMEDIATE ESCROW WITHDRAWAL
        // We update state sequentially for both withdrawals
        let tempState = { ...state };
        
        const pYes = tempState.players.find(p => p.id === market.playerYes);
        if (pYes) {
            const res1 = withdrawAssetsForMarket(pYes, market.stakesYes, tempState);
            tempState.players = tempState.players.map(p => p.id === pYes.id ? res1.player : p);
            tempState.tiles = res1.tiles;
            tempState.companies = res1.companies;
            tempState.loans = res1.loans;
            tempState.financialOptions = res1.financialOptions;
        }

        const pNo = tempState.players.find(p => p.id === market.playerNo);
        if (pNo) {
            const res2 = withdrawAssetsForMarket(pNo, market.stakesNo, tempState);
            tempState.players = tempState.players.map(p => p.id === pNo.id ? res2.player : p);
            tempState.tiles = res2.tiles;
            tempState.companies = res2.companies;
            tempState.loans = res2.loans;
            tempState.financialOptions = res2.financialOptions;
        }

        return {
            ...tempState,
            predictionMarkets: [...state.predictionMarkets, market],
            logs: [`🔮 Apuesta "${condition}" creada y ACTIVADA. Fondos retirados.`, ...state.logs]
        };
    }

    if (action.type === 'TRIGGER_MARKET_VOTE') {
        const { marketId } = action.payload;
        const markets = state.predictionMarkets.map(m => 
            m.id === marketId ? { ...m, status: 'voting' as const } : m
        );
        return { 
            ...state, 
            predictionMarkets: markets, 
            logs: [`🗳️ VOTACIÓN ABIERTA para resultado de: ${markets.find(m => m.id === marketId)?.condition}`, ...state.logs] 
        };
    }

    if (action.type === 'CAST_MARKET_VOTE') {
        const { marketId, pId, vote } = action.payload; // vote: 'YES' | 'NO'
        const marketIdx = state.predictionMarkets.findIndex(m => m.id === marketId);
        if (marketIdx === -1) return state;

        const market = { ...state.predictionMarkets[marketIdx] };
        market.votes = { ...market.votes, [pId]: vote };

        const updatedMarkets = [...state.predictionMarkets];
        updatedMarkets[marketIdx] = market;

        let newState = { ...state, predictionMarkets: updatedMarkets };

        // CHECK IF ALL HUMANS VOTED
        const humans = state.players.filter(p => !p.isBot && p.alive);
        const allVoted = humans.every(h => market.votes[h.id]);

        if (allVoted) {
            // Trigger automatic resolution
            return executeMarketResolution(newState, marketId);
        }

        return newState;
    }

    if (action.type === 'RESOLVE_MARKET') {
        return executeMarketResolution(state, action.payload.marketId);
    }

    return state;
};
