
import { GameState, MarketAssets, Player, PredictionMarket } from '../../types';

// Helper to withdraw assets from player (Escrow)
export const withdrawAssetsForMarket = (player: Player, assets: MarketAssets, state: GameState): { player: Player, tiles: any[], companies: any[], loans: any[], financialOptions: any[] } => {
    let p = { ...player };
    let tiles = [...state.tiles];
    let companies = [...state.companies];
    let loans = [...state.loans];
    let financialOptions = [...state.financialOptions];

    // Money & Drug
    p.money -= assets.money;
    p.farlopa = (p.farlopa || 0) - assets.farlopa;
    
    // Props -> 'E' (State holds them as Escrow)
    assets.props.forEach(tid => {
        tiles[tid] = { ...tiles[tid], owner: 'E' }; 
        p.props = p.props.filter(id => id !== tid);
    });
    
    // Shares
    assets.shares.forEach(s => {
        const cIdx = companies.findIndex(c => c.id === s.companyId);
        if (cIdx !== -1) {
            const comp = { ...companies[cIdx] };
            const holders = { ...comp.shareholders };
            holders[p.id] = (holders[p.id] || 0) - s.count;
            comp.shareholders = holders;
            companies[cIdx] = comp;
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

    return { player: p, tiles, companies, loans, financialOptions };
};

// Helper to give assets to player (Payout)
export const depositAssets = (player: Player, assets: MarketAssets, state: GameState): { player: Player, tiles: any[], companies: any[], loans: any[], financialOptions: any[] } => {
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

export const executeMarketResolution = (state: GameState, marketId: string): GameState => {
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
