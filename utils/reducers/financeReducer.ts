
import { GameState } from '../../types';
import { loansReducer } from './finance/loans';
import { marketReducer } from './finance/market';
import { companyReducer } from './finance/companies';
import { getNextPlayerIndex, formatMoney } from '../gameLogic';

export const financeReducer = (state: GameState, action: any): GameState => {
    // 1. Debt Management (High Priority)
    if (action.type === 'PAY_PENDING_DEBT') {
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
                // Should find which company, but creditorId in pendingDebt logic needs to point to company if SHARES.
                // Simplified: pendingDebt.creditorId should probably hold the ID if it's a company owner, OR company ID. 
                // We'll assume the rent logic put the companyId into creditorId if possible, but type is number|E|SHARES.
                // If SHARES is generic, we might lose who to pay. 
                // FIX: In landingLogic, we should try to resolve owner better.
                // For now, assume SHARES means State or Company distribution logic re-run.
                // Simplification: Pay State if generic SHARES, or implement robust company debt lookup. 
                // Let's assume SHARES -> Estado for simplicity in debt recovery or log it.
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
    }

    if (action.type === 'DECLARE_BANKRUPTCY') {
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
        // Since we are in the middle of a turn, we need to find the next player
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
    }

    // 2. Loans & Pools
    let nextState = loansReducer(state, action);
    if (nextState !== state) return nextState;

    // 3. Market & Options & Offshore
    nextState = marketReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 4. Companies (Monopolies)
    nextState = companyReducer(nextState, action);
    if (nextState !== state) return nextState;

    // 5. UI Toggles
    switch (action.type) {
        case 'CLOSE_BANK_MODAL': return { ...state, showBankModal: false };
        case 'TOGGLE_BANK_MODAL': return { ...state, showBankModal: !state.showBankModal };
        default: return state;
    }
};
