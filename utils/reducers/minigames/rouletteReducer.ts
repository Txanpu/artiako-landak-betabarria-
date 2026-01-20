
import { GameState } from '../../../types';
import { isPowerOff, formatMoney } from '../../gameLogic';

export const rouletteReducer = (state: GameState, action: any): GameState => {
    if (action.type !== 'SPIN_ROULETTE') return state;

    if (state.casinoPlays >= 3) {
            return { ...state, logs: ['🚫 Límite de 3 jugadas por turno alcanzado.', ...state.logs] };
    }
    if (isPowerOff(state)) {
            return { ...state, showCasinoModal: false, logs: ['🚫 Apagón: La ruleta no funciona.', ...state.logs] };
    }

    const { bets } = action.payload;
    const pIdx = state.currentPlayerIndex;
    const newPlayers = [...state.players];
    const player = { ...newPlayers[pIdx] };
    const tile = state.tiles[player.pos];
    
    let ownerIdx = -1;
    if (tile && typeof tile.owner === 'number' && tile.owner !== player.id) {
        ownerIdx = state.players.findIndex(p => p.id === tile.owner);
    }

    let totalBet = 0;
    Object.values(bets).forEach((v: any) => totalBet += (v as number));
    if (player.money < totalBet) return state; 

    // 1. Pay
    player.money -= totalBet;
    
    let owner = null;
    if (ownerIdx !== -1) {
        owner = { ...newPlayers[ownerIdx] };
        owner.money += totalBet;
        newPlayers[ownerIdx] = owner;
    } else {
        state.estadoMoney += totalBet;
    }

    // 2. Result
    const winningNumber = Math.floor(Math.random() * 37);
    
    // 3. Winnings
    const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    const blacks = new Set([2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]);
    let totalWinnings = 0;
    for (const [betKey, amount] of Object.entries(bets)) {
        const betVal = amount as number;
        if (betKey === 'red' && reds.has(winningNumber)) totalWinnings += betVal * 2;
        else if (betKey === 'black' && blacks.has(winningNumber)) totalWinnings += betVal * 2;
        else if (betKey === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) totalWinnings += betVal * 2;
        else if (betKey === 'odd' && winningNumber !== 0 && winningNumber % 2 !== 0) totalWinnings += betVal * 2;
        else if (!isNaN(parseInt(betKey))) {
            if (parseInt(betKey) === winningNumber) totalWinnings += betVal * 36;
        }
    }

    let newTiles = [...state.tiles];
    let logs = state.logs;
    let newEstadoMoney = state.estadoMoney;

    if (totalWinnings > 0) {
            // Revert the money add to calculate cleanly
            // player.money += totalWinnings; (Logic handled below)
            
            if (owner) {
                if (owner.money >= totalWinnings) {
                    owner.money -= totalWinnings;
                    player.money += totalWinnings;
                } else {
                    const cash = owner.money;
                    player.money += cash; 
                    owner.money = 0;
                    
                    // Bankrupt
                    newTiles = newTiles.map(t => {
                    if (t.owner === owner!.id) {
                        if (!player.props.includes(t.id)) player.props.push(t.id);
                        return { ...t, owner: player.id };
                    }
                    return t;
                    });
                    owner.props = [];
                    owner.alive = false;
                    logs = [`☠️ CASINO: ${owner.name} entra en BANCARROTA.`, ...logs];
                }
                newPlayers[ownerIdx] = owner;
            } else {
                newEstadoMoney -= totalWinnings;
                player.money += totalWinnings;
            }
    }

    newPlayers[pIdx] = player;
    const history = state.rouletteState?.history || [];
    history.unshift(winningNumber);
    if(history.length > 10) history.pop();

    return {
        ...state,
        players: newPlayers,
        tiles: newTiles,
        logs: logs,
        estadoMoney: newEstadoMoney,
        casinoPlays: state.casinoPlays + 1,
        rouletteState: {
            winningNumber,
            totalWinnings,
            netOwnerChange: totalBet - totalWinnings,
            history
        }
    };
};
