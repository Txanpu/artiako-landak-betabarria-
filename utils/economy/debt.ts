
import { GameState } from '../../types';
import { getNextPlayerIndex } from '../core';

export const payPendingDebt = (state: GameState): GameState => {
    const pIdx = state.currentPlayerIndex;
    const player = { ...state.players[pIdx] };
    
    if (!state.pendingDebt) return state;
    
    const { amount, creditorId } = state.pendingDebt;
    
    if (player.money >= amount) {
        // Execute Pay Logic
        player.money -= amount;
        let newEstadoMoney = state.estadoMoney;
        const newPlayers = [...state.players];
        let logs = [...state.logs];

        // Transfer to Creditor
        if (creditorId === 'E') {
            newEstadoMoney += amount;
            logs.push(`💸 Deuda Pagada: ${player.name} paga $${amount} al Estado.`);
        } else if (creditorId === 'SHARES') {
            // Assume SHARES means general company pot or state in simple mode
            newEstadoMoney += amount;
            logs.push(`💸 Deuda Pagada: ${player.name} paga $${amount} (S.A.).`);
        } else if (typeof creditorId === 'number') {
            const credIdx = newPlayers.findIndex(p => p.id === creditorId);
            if (credIdx !== -1) {
                newPlayers[credIdx] = { ...newPlayers[credIdx], money: newPlayers[credIdx].money + amount };
                logs.push(`💸 Deuda Pagada: ${player.name} paga $${amount} a ${newPlayers[credIdx].name}.`);
            }
        }

        newPlayers[pIdx] = player;
        return {
            ...state,
            players: newPlayers,
            estadoMoney: newEstadoMoney,
            pendingDebt: null, // Clear Debt
            logs
        };
    }
    return state; // Cannot pay
};

export const resolveBankruptcy = (state: GameState): GameState => {
    const pIdx = state.currentPlayerIndex;
    const player = state.players[pIdx];
    
    // Liquidate Assets
    const newPlayers = [...state.players];
    const newTiles = [...state.tiles];
    const creditorId = state.pendingDebt?.creditorId;
    
    // 1. Transfer Cash
    let cash = player.money;
    if (cash > 0) {
        if (creditorId === 'E' || creditorId === 'SHARES') state.estadoMoney += cash;
        else if (typeof creditorId === 'number') {
            const cIdx = newPlayers.findIndex(p => p.id === creditorId);
            if (cIdx !== -1) newPlayers[cIdx].money += cash;
        }
    }

    // 2. Transfer Properties
    state.tiles.forEach(t => {
        if (t.owner === player.id) {
            // If creditor is player, they get it. If State, State gets it.
            if (typeof creditorId === 'number') {
                newTiles[t.id] = { ...t, owner: creditorId, mortgaged: true }; // Creditor gets it mortgaged
            } else {
                newTiles[t.id] = { ...t, owner: 'E', mortgaged: false, houses: 0, hotel: false }; // State resets it
            }
        }
    });

    // 3. Eliminate Player
    newPlayers[pIdx] = { ...player, money: 0, alive: false, props: [] };
    
    // 4. Force End Turn (Calc next)
    const nextIdx = getNextPlayerIndex({ ...state, players: newPlayers });

    return {
        ...state,
        players: newPlayers,
        tiles: newTiles,
        pendingDebt: null,
        anarchyActionPending: false,
        currentPlayerIndex: nextIdx,
        turnCount: state.turnCount + 1, // Advance turn
        rolled: false,
        logs: [`☠️ BANCARROTA: ${player.name} ha caído.`, `Turno de ${newPlayers[nextIdx].name}.`, ...state.logs]
    };
};
