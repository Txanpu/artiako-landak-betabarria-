
import { GameState, PredictionMarket, MarketAssets, Player } from '../../../types';
import { formatMoney } from '../../gameLogic';

// Helper to give assets to player (Payout)
const depositAssets = (player: Player, assets: MarketAssets, state: GameState): { player: Player, tiles: any[], companies: any[], loans: any[], financialOptions: any[] } => {
    let p = { ...player };
    let newTiles = [...state.tiles];
    let newCompanies = [...state.companies];
    let newLoans = [...state.loans];
    let newOptions = [...state.financialOptions];

    // Money
    p.money += assets.money;
    
    // Farlopa
    p.farlopa = (p.farlopa || 0) + assets.farlopa;
    
    // Properties
    assets.props.forEach(tid => {
        // Only transfer if it was held in Escrow ('E') or correctly tracked.
        // We assume tiles were set to 'E' during escrow.
        newTiles[tid] = { ...newTiles[tid], owner: p.id };
        if (!p.props.includes(tid)) p.props.push(tid);
    });

    // Shares
    assets.shares.forEach(s => {
        const compIdx = newCompanies.findIndex(c => c.id === s.companyId);
        if (compIdx !== -1) {
            const comp = { ...newCompanies[compIdx] };
            const holders = { ...comp.shareholders };
            holders[p.id] = (holders[p.id] || 0) + s.count;
            comp.shareholders = holders;
            newCompanies[compIdx] = comp;
        }
    });

    // Options (Transfer Holder Rights)
    assets.options.forEach(optId => {
        const optIdx = newOptions.findIndex(o => o.id === optId);
        if (optIdx !== -1) {
            newOptions[optIdx] = { ...newOptions[optIdx], holderId: p.id };
        }
    });

    // Loans (Transfer Lender Rights)
    assets.loans.forEach(loanId => {
        const loanIdx = newLoans.findIndex(l => l.id === loanId);
        if (loanIdx !== -1) {
            newLoans[loanIdx] = { ...newLoans[loanIdx], lenderId: p.id };
        }
    });

    return { player: p, tiles: newTiles, companies: newCompanies, loans: newLoans, financialOptions: newOptions };
};

// Extracted Resolution Logic for reuse
const executeResolution = (state: GameState, marketId: string): GameState => {
    const marketIdx = state.predictionMarkets.findIndex(m => m.id === marketId);
    if (marketIdx === -1) return state;
    const market = state.predictionMarkets[marketIdx];

    // Tally Votes
    let yesVotes = 0;
    let noVotes = 0;
    Object.values(market.votes).forEach(v => v === 'YES' ? yesVotes++ : noVotes++);

    const result = yesVotes > noVotes ? 'YES' : (noVotes > yesVotes ? 'NO' : null);

    if (!result) return { ...state, logs: ['⚖️ Empate en votación. Se requiere desempate manual o más votos.', ...state.logs] };

    // Execute Payout
    const winnerId = result === 'YES' ? market.playerYes : market.playerNo;
    const winnerIdx = state.players.findIndex(p => p.id === winnerId);
    let winner = { ...state.players[winnerIdx] };
    
    // Accumulate all assets
    const totalMoney = market.stakesYes.money + market.stakesNo.money;
    const totalFarlopa = market.stakesYes.farlopa + market.stakesNo.farlopa;
    const totalProps = [...market.stakesYes.props, ...market.stakesNo.props];
    const totalShares = [...market.stakesYes.shares, ...market.stakesNo.shares];
    const totalOptions = [...market.stakesYes.options, ...market.stakesNo.options];
    const totalLoans = [...market.stakesYes.loans, ...market.stakesNo.loans];

    const potAssets: MarketAssets = {
        money: totalMoney,
        farlopa: totalFarlopa,
        props: totalProps,
        shares: totalShares,
        options: totalOptions,
        loans: totalLoans
    };

    const payoutRes = depositAssets(winner, potAssets, state);
    
    let finalPlayers = [...state.players];
    finalPlayers[winnerIdx] = payoutRes.player;

    const finalMarkets = state.predictionMarkets.filter(m => m.id !== marketId);

    return {
        ...state,
        players: finalPlayers,
        tiles: payoutRes.tiles,
        companies: payoutRes.companies,
        loans: payoutRes.loans,
        financialOptions: payoutRes.financialOptions,
        predictionMarkets: finalMarkets,
        logs: [`🔮 PREDICCIÓN RESUELTA: ${result === 'YES' ? 'SÍ' : 'NO'}. ${winner.name} se lleva el bote.`, ...state.logs]
    };
};

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
        // We must withdraw assets from BOTH players right now.
        let players = [...state.players];
        let tiles = [...state.tiles];
        let companies = [...state.companies];
        let loans = [...state.loans];
        let financialOptions = [...state.financialOptions];

        const pYesIdx = players.findIndex(p => p.id === market.playerYes);
        const pNoIdx = players.findIndex(p => p.id === market.playerNo);

        const withdraw = (pIdx: number, assets: MarketAssets) => {
            if (pIdx === -1) return;
            let p = { ...players[pIdx] };
            
            // Money & Drug
            p.money -= assets.money;
            p.farlopa = (p.farlopa||0) - assets.farlopa;
            
            // Props -> 'E' (State holds them as Escrow)
            assets.props.forEach(tid => {
                tiles[tid] = { ...tiles[tid], owner: 'E' }; 
                p.props = p.props.filter(id => id !== tid);
            });
            
            // Shares
            assets.shares.forEach(s => {
                const cIdx = companies.findIndex(c => c.id === s.companyId);
                if (cIdx !== -1) {
                    companies[cIdx].shareholders[p.id] = (companies[cIdx].shareholders[p.id] || 0) - s.count;
                }
            });

            // Options
            assets.options.forEach(optId => {
                const oIdx = financialOptions.findIndex(o => o.id === optId);
                if (oIdx !== -1) financialOptions[oIdx] = { ...financialOptions[oIdx], holderId: 'E' as any }; 
            });

            // Loans
            assets.loans.forEach(loanId => {
                const lIdx = loans.findIndex(l => l.id === loanId);
                if (lIdx !== -1) loans[lIdx] = { ...loans[lIdx], lenderId: 'E' };
            });

            players[pIdx] = p;
        };

        withdraw(pYesIdx, market.stakesYes);
        withdraw(pNoIdx, market.stakesNo);

        return {
            ...state,
            players,
            tiles,
            companies,
            loans,
            financialOptions,
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
            return executeResolution(newState, marketId);
        }

        return newState;
    }

    if (action.type === 'RESOLVE_MARKET') {
        return executeResolution(state, action.payload.marketId);
    }

    return state;
};
