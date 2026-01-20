
import { GameState, Player, Loan } from '../../../types';
import { 
    handleGovernmentTick, 
    processTurnLoans, 
    performStateAutoBuild, 
    processFioreTips, 
    formatMoney
} from '../../gameLogic';
import { checkLoanMarginCalls } from '../../risk';
import { checkFiestaClandestina } from '../../events';
import { processMaintenanceAndBankruptcy } from './turnEnd/bankruptcy';
import { calculateMetrics } from './turnEnd/metrics';
import { tickWorld } from '../../world';

export const resolveEndTurn = (state: GameState): GameState => {
    let epIdx = state.currentPlayerIndex;
    let ePlayer = state.players[epIdx];
    let endLogs: string[] = [];
    let ePlayers = [...state.players];
    let eTiles = [...state.tiles];
    let currentEstadoMoney = state.estadoMoney;

    // --- DECREMENT COUNTERS ---
    if (ePlayer.immunityTurns && ePlayer.immunityTurns > 0) {
        ePlayer.immunityTurns--;
        if (ePlayer.immunityTurns === 0) endLogs.push(`🛡️ La inmunidad de ${ePlayer.name} ha expirado.`);
    }
    
    // Drug Effect Wear-off
    if (ePlayer.highTurns && ePlayer.highTurns > 0) {
        ePlayer.highTurns--;
        if (ePlayer.highTurns === 0) endLogs.push(`😴 El efecto de la Farlopa se ha pasado para ${ePlayer.name}.`);
    }

    eTiles = eTiles.map(t => {
        if (t.blockedRentTurns && t.blockedRentTurns > 0) {
            return { ...t, blockedRentTurns: t.blockedRentTurns - 1 };
        }
        return t;
    });

    // --- HACKER CRYPTO MINING ---
    if (ePlayer.role === 'hacker') {
        const miningProfit = Math.floor(Math.random() * 61); 
        if (miningProfit > 0) {
            ePlayer.money += miningProfit;
            currentEstadoMoney += miningProfit; 
            endLogs.push(`💻 Minería Cripto: ${ePlayer.name} genera ${formatMoney(miningProfit)}.`);
        }
    }

    const loanRes = processTurnLoans(state, epIdx);
    endLogs.push(...(loanRes.logs || []));
    ePlayers = loanRes.players as Player[];
    
    if (ePlayer.fentanylAddiction) {
        const FENT_COST = 15;
        if (ePlayer.money >= FENT_COST) {
            ePlayer.money -= FENT_COST;
            currentEstadoMoney += FENT_COST;
            endLogs.push(`💊 ${ePlayer.name} paga $${FENT_COST} por su dosis de fentanilo.`);
        }
    }
    
    const fiorePay = state.tiles.filter(t => t.subtype === 'fiore' && t.owner === ePlayer.id).reduce((acc, t) => acc + (t.workers||0)*70, 0); 
    if(fiorePay > 0) endLogs.push(...processFioreTips(state, ePlayers[epIdx], fiorePay));

    const stateBuild = performStateAutoBuild(eTiles, state.housesAvail, state.hotelsAvail, currentEstadoMoney, state.gov);
    eTiles = stateBuild.tiles;
    currentEstadoMoney = stateBuild.estadoMoney;
    endLogs.push(...stateBuild.logs);

    const govUpdate = handleGovernmentTick({ ...state, players: ePlayers, tiles: eTiles, estadoMoney: currentEstadoMoney });
    if (govUpdate.estadoMoney !== undefined) currentEstadoMoney = govUpdate.estadoMoney;
    if (govUpdate.tiles) eTiles = govUpdate.tiles; 
    let finalPlayers = govUpdate.players || ePlayers;

    const bankrRes = processMaintenanceAndBankruptcy(state, finalPlayers, eTiles, epIdx, currentEstadoMoney);
    finalPlayers = bankrRes.players;
    eTiles = bankrRes.tiles;
    endLogs.push(...bankrRes.logs);
    currentEstadoMoney = bankrRes.estadoMoney;
    const nextIdx = bankrRes.nextIndex;

    const randomEventUpdate = checkFiestaClandestina({ ...state, players: finalPlayers, estadoMoney: currentEstadoMoney });
    let finalLogs = [...endLogs, ...(govUpdate.logs||[]), ...state.logs];
    
    const worldRes = tickWorld({ ...state, world: state.world, logs: finalLogs });
    if (worldRes.world) state.world = worldRes.world;
    if (worldRes.logs) finalLogs = worldRes.logs;

    const newMetrics = calculateMetrics(state.metrics, finalPlayers, eTiles, state.loans, state.turnCount);

    let finalStateData = {
        ...state,
        ...govUpdate,
        tiles: eTiles,
        loans: loanRes.loans as Loan[],
        currentPlayerIndex: nextIdx,
        rolled: false,
        turnCount: state.turnCount + 1,
        metrics: newMetrics,
        casinoPlays: 0,
        estadoMoney: currentEstadoMoney,
        world: state.world
    };

    if (randomEventUpdate) {
        finalStateData = { ...finalStateData, ...randomEventUpdate };
        if (randomEventUpdate.logs) finalLogs = [...randomEventUpdate.logs, ...finalLogs];
    }
    
    const nextPlayerId = finalPlayers[nextIdx].id;
    const loanRisk = checkLoanMarginCalls(finalStateData, nextPlayerId);
    if (loanRisk.logs.length > 0) {
        finalStateData = { ...loanRisk.state };
        finalLogs = [...loanRisk.logs, ...finalLogs];
    }
    
    finalStateData.logs = [`Turno de ${finalPlayers[nextIdx].name}`, ...finalLogs];
    return finalStateData;
};
