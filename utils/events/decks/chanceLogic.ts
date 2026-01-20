
import { GameState } from '../../../types';
import { calculateRepairs } from '../helpers';
import { getNearestTileBySubtype } from '../../board';
import { formatMoney } from '../../gameLogic';

export const effect_ch_jail_free = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.jailCards = (player.jailCards || 0) + 1;
    p[idx] = player;
    return { players: p, logs: [`🎟️ ${player.name} recibe tarjeta Salir de la Cárcel.`] };
};

export const effect_ch_repairs = (state: GameState, idx: number) => {
    const cost = calculateRepairs(state, idx, 25, 100);
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= cost;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + cost, logs: [`💸 ${player.name} paga $${formatMoney(cost)} en reparaciones.`] };
};

export const effect_ch_speeding = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= 15;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + 15, logs: [`💸 ${player.name} paga $15 (Multa Tráfico).`] };
};

export const effect_ch_chairman = (state: GameState, idx: number) => {
    const p = [...state.players];
    let totalPaid = 0;
    p.forEach((pl, i) => {
        if (i !== idx && pl.alive) {
            const receiver = { ...pl };
            receiver.money += 50;
            totalPaid += 50;
            p[i] = receiver;
        }
    });
    const player = { ...p[idx] };
    player.money -= totalPaid;
    p[idx] = player;
    return { players: p, logs: [`💸 ${player.name} paga $${totalPaid} al resto de jugadores.`] };
};

export const effect_ch_back3 = (state: GameState, idx: number) => {
    const p = [...state.players]; 
    const player = { ...p[idx] };
    const newPos = (player.pos - 3 + state.tiles.length) % state.tiles.length;
    player.pos = newPos;
    p[idx] = player;
    return { players: p, logs: [`🔙 ${player.name} retrocede a ${state.tiles[newPos].name}.`] };
};

export const effect_ch_util = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    const target = getNearestTileBySubtype(state.tiles, player.pos, 'utility');
    player.pos = target;
    p[idx] = player;
    return { players: p, logs: [`➡️ ${player.name} avanza a Utilidad: ${state.tiles[target].name}.`] };
};

export const effect_ch_dividend = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 50;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 50, logs: [`💰 ${player.name} recibe $50 (Dividendos).`] };
};

export const effect_ch_rail = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    // Find rail or bus
    let target = player.pos;
    for(let i=1; i<state.tiles.length; i++) {
        const next = (player.pos + i) % state.tiles.length;
        if (['rail', 'bus'].includes(state.tiles[next].subtype || '')) {
            target = next;
            break;
        }
    }
    player.pos = target;
    p[idx] = player;
    return { players: p, logs: [`➡️ ${player.name} avanza a Transporte: ${state.tiles[target].name}.`] };
};

export const effect_ch_poor = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= 15;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + 15, logs: [`💸 ${player.name} paga $15 (Impuesto Pobreza).`] };
};

export const effect_ch_reading = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    const target = state.tiles.find(t => t.name.includes('Metro Zelaieta'))?.id || 3;
    
    let extraLog = '';
    if (player.pos > target) {
        player.money += 200;
        extraLog = ' (Pasó por Salida +$200)';
    }
    player.pos = target;
    p[idx] = player;
    return { players: p, logs: [`➡️ ${player.name} va a Metro Zelaieta.${extraLog}`] };
};

export const effect_ch_boardwalk = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    const target = state.tiles.find(t => t.name.includes('Baserri Maitea'))?.id || 44;
    player.pos = target;
    p[idx] = player;
    return { players: p, logs: [`➡️ ${player.name} va a Baserri Maitea.`] };
};

export const effect_ch_illinois = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    const target = state.tiles.find(t => t.name === 'Txokoa')?.id || 21;
    
    let extraLog = '';
    if (player.pos > target) {
        player.money += 200;
        extraLog = ' (Pasó por Salida +$200)';
    }
    player.pos = target;
    p[idx] = player;
    return { players: p, logs: [`➡️ ${player.name} va a Txokoa.${extraLog}`] };
};

export const effect_ch_loan = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 150;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 150, logs: [`💰 ${player.name} recibe $150 (Vencimiento Préstamo).`] };
};

export const effect_ch_stcharles = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    const target = state.tiles.find(t => t.name === 'Perrukeria')?.id || 7;
    
    let extraLog = '';
    if (player.pos > target) {
        player.money += 200;
        extraLog = ' (Pasó por Salida +$200)';
    }
    player.pos = target;
    p[idx] = player;
    return { players: p, logs: [`➡️ ${player.name} va a Perrukeria.${extraLog}`] };
};

export const effect_ch_gotojail = (state: GameState, idx: number) => {
    if (state.gov === 'right') return { logs: ['⚖️ Suerte: El Gobierno Derechas evita tu encarcelamiento.'] };

    const p = [...state.players];
    const player = { ...p[idx] };
    player.pos = 10;
    player.jail = 3;
    p[idx] = player;
    return { players: p, rolled: false, logs: [`👮 ${player.name} a la cárcel por carta Suerte.`] };
};
