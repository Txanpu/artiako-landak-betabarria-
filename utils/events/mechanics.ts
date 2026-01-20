
import { GameState } from '../../types';
import { EVENTS_DECK } from './definitions';

export const drawEvent = (state: GameState, playerIdx: number): Partial<GameState> => {
    let card;
    let usedInsider = false;

    // Check Insider Commitment
    if (state.meta?.insider?.committed) {
        const committedId = state.meta.insider.committed;
        card = EVENTS_DECK.find(e => e.id === committedId);
        if (card) {
            usedInsider = true;
        }
    }

    // Fallback if no committed event or not found
    if (!card) {
        const player = state.players[playerIdx];
        const tile = state.tiles[player.pos];
        let pool = EVENTS_DECK;

        // Logic for Deck Splitting based on Tile Name
        if (tile && tile.name === 'Caja de Comunidad') {
            pool = EVENTS_DECK.filter(e => e.id.startsWith('cc_'));
        } else if (tile && tile.name === 'Suerte') {
            pool = EVENTS_DECK.filter(e => e.id.startsWith('ch_'));
        } else {
            // Generic Events (ev_) for other event tiles
            pool = EVENTS_DECK.filter(e => e.id.startsWith('ev_'));
        }
        
        // Safety: If pool is empty, use full deck
        if (pool.length === 0) pool = EVENTS_DECK;

        card = pool[Math.floor(Math.random() * pool.length)];
    }

    const effectResult = card.effect(state, playerIdx);
    
    // Check if it's a direct action event (like greyhounds) or informational
    const isMinigame = card.id === 'ev_greyhounds';
    
    const newLogs = [`⚡ EVENTO: ${card.title}${usedInsider ? ' (Fijado por Insider)' : ''}`, ...(effectResult.logs || [])];
    
    const updates: Partial<GameState> = {
        ...effectResult,
        activeEvent: isMinigame ? null : { title: card.title, description: card.description }, 
        logs: [...newLogs, ...state.logs]
    };

    // Clear committed event if used
    if (usedInsider && state.meta) {
        updates.meta = {
            ...state.meta,
            insider: { ...state.meta.insider, committed: null }
        };
    }

    return updates;
};

export const tickAdvancedEvents = (s: GameState): Partial<GameState> => {
    const updates: Partial<GameState> = {};
    if (s.rentEventTurns && s.rentEventTurns > 0) {
        updates.rentEventTurns = s.rentEventTurns - 1;
        if (updates.rentEventTurns === 0) updates.rentEventMul = 1;
    }
    if (s.buildEventTurns && s.buildEventTurns > 0) {
        updates.buildEventTurns = s.buildEventTurns - 1;
        if (updates.buildEventTurns === 0) updates.buildEventMul = 0;
    }
    if (s.blockBuildTurns > 0) {
        updates.blockBuildTurns = s.blockBuildTurns - 1;
    }
    
    if (s.rentFilters.length > 0) {
        updates.rentFilters = s.rentFilters
            .map(f => ({ ...f, turns: f.turns - 1 }))
            .filter(f => f.turns > 0);
    }
    
    return updates;
};

export const checkFiestaClandestina = (state: GameState): Partial<GameState> | null => {
    // 3% de probabilidad al final de cada turno de que ocurra una fiesta ilegal
    if (Math.random() < 0.03) {
        const cost = 50;
        const newPlayers = state.players.map(p => ({
            ...p,
            money: p.money - cost
        }));
        
        return {
            activeEvent: {
                title: 'Fiesta Clandestina',
                description: `La policía ha disuelto una fiesta ilegal. Multa de $${cost} para todos.`
            },
            players: newPlayers,
            estadoMoney: state.estadoMoney + (state.players.length * cost),
            logs: ['🚓 ¡Redada en fiesta clandestina! Todos multados.', ...state.logs]
        };
    }
    return null;
};

export const getTransportDestinations = () => [];
