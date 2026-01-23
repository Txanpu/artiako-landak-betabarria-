
import { GameState, Player, Loan } from '../../../types';
import { 
    handleGovernmentTick, 
    processTurnLoans, 
    performStateAutoBuild, 
    processFioreTips 
} from '../../gameLogic';
import { checkLoanMarginCalls } from '../../risk';
import { checkFiestaClandestina } from '../../events';
import { processMaintenanceAndBankruptcy } from './turnEnd/bankruptcy';
import { calculateMetrics } from './turnEnd/metrics';
import { tickWorld } from '../../world';
import { handleCounters, handleRolePassives } from './turnEnd/passiveLogic'; // Imported Logic

export const resolveEndTurn = (state: GameState): GameState => {
    let epIdx = state.currentPlayerIndex;
    let ePlayer = { ...state.players[epIdx] };
    let endLogs: string[] = [];
    let ePlayers = [...state.players];
    let eTiles = [...state.tiles];
    let currentEstadoMoney = state.estadoMoney;

    // 1. Handle Counters (Immunity, High, Cooldowns)
    const countersRes = handleCounters(ePlayer, eTiles, endLogs);
    ePlayer = countersRes.updatedPlayer;
    eTiles = countersRes.updatedTiles;

    // 2. Handle Role Passives (Hacker, Fiore Expenses, Welfare, Addiction)
    const passivesRes = handleRolePassives(state, ePlayer, eTiles, endLogs, ePlayer.money, currentEstadoMoney);
    ePlayer.money = passivesRes.updatedMoney;
    currentEstadoMoney = passivesRes.updatedStateMoney;

    // 3. Process Loans
    // We update the player in the array first because loan processor expects full array state sometimes
    ePlayers[epIdx] = ePlayer;
    const loanRes = processTurnLoans({ ...state, players: ePlayers }, epIdx);
    endLogs.push(...(loanRes.logs || []));
    ePlayers = loanRes.players as Player[];
    // Get updated player back reference
    ePlayer = ePlayers[epIdx]; 
    
    // 4. Fiore Income (Tips) - Positive Income
    const fiorePay = eTiles.filter(t => t.subtype === 'fiore' && t.owner === ePlayer.id).reduce((acc, t) => acc + (t.workers||0)*70, 0); 
    if(fiorePay > 0) endLogs.push(...processFioreTips(state, ePlayer, fiorePay));

    // 5. State Logic (Auto-Build)
    const stateBuild = performStateAutoBuild(eTiles, state.housesAvail, state.hotelsAvail, currentEstadoMoney, state.gov);
    eTiles = stateBuild.tiles;
    currentEstadoMoney = stateBuild.estadoMoney;
    endLogs.push(...stateBuild.logs);

    // 6. Government Tick (Policies & Events)
    const govUpdate = handleGovernmentTick({ ...state, players: ePlayers, tiles: eTiles, estadoMoney: currentEstadoMoney });
    if (govUpdate.estadoMoney !== undefined) currentEstadoMoney = govUpdate.estadoMoney;
    if (govUpdate.tiles) eTiles = govUpdate.tiles; 
    let finalPlayers = govUpdate.players || ePlayers;

    // 7. Maintenance & Bankruptcy Check
    const bankrRes = processMaintenanceAndBankruptcy(state, finalPlayers, eTiles, epIdx, currentEstadoMoney);
    finalPlayers = bankrRes.players;
    eTiles = bankrRes.tiles;
    endLogs.push(...bankrRes.logs);
    currentEstadoMoney = bankrRes.estadoMoney;
    const nextIdx = bankrRes.nextIndex;

    // 8. World Events (Fiesta, Day/Night)
    const randomEventUpdate = checkFiestaClandestina({ ...state, players: finalPlayers, estadoMoney: currentEstadoMoney });
    let finalLogs = [...endLogs, ...(govUpdate.logs||[]), ...state.logs];
    
    const worldRes = tickWorld({ ...state, world: state.world, logs: finalLogs });
    if (worldRes.world) state.world = worldRes.world;
    if (worldRes.logs) finalLogs = worldRes.logs;

    // 9. Metrics & cleanup
    const newMetrics = calculateMetrics(state.metrics, finalPlayers, eTiles, state.loans, state.turnCount);

    if (finalLogs.length > 60) {
        finalLogs = finalLogs.slice(0, 60);
    }

    // --- RESET MINIGAME LIMITS FOR NEXT PLAYER ---
    finalPlayers[nextIdx] = { ...finalPlayers[nextIdx], playedMinigames: [] };

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
        world: state.world,
        players: finalPlayers // Update players with reset flag
    };

    if (randomEventUpdate) {
        finalStateData = { ...finalStateData, ...randomEventUpdate };
        if (randomEventUpdate.logs) {
            finalLogs = [...randomEventUpdate.logs, ...finalLogs];
            if (finalLogs.length > 60) finalLogs = finalLogs.slice(0, 60);
        }
    }
    
    // 10. Risk Check for Next Player
    const nextPlayerId = finalPlayers[nextIdx].id;
    const loanRisk = checkLoanMarginCalls(finalStateData, nextPlayerId);
    if (loanRisk.logs.length > 0) {
        finalStateData = { ...loanRisk.state };
        finalLogs = [...loanRisk.logs, ...finalLogs];
    }
    
    finalStateData.logs = [`Turno de ${finalPlayers[nextIdx].name}`, ...finalLogs];
    return finalStateData;
};
