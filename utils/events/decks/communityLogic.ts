
import { GameState } from '../../../types';
import { calculateRepairs } from '../helpers';
import { formatMoney } from '../../gameLogic';

export const effect_cc_jail_free = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.jailCards = (player.jailCards || 0) + 1;
    p[idx] = player;
    return { players: p, logs: [`🎟️ ${player.name} recibe tarjeta Salir de la Cárcel.`] };
};

export const effect_cc_beauty = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 10;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 10, logs: [`💰 ${player.name} gana $10 (Concurso Belleza).`] };
};

export const effect_cc_stock = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 50;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 50, logs: [`💰 ${player.name} recibe $50 (Acciones).`] };
};

export const effect_cc_life = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 100;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 100, logs: [`💰 ${player.name} cobra $100 (Seguro Vida).`] };
};

export const effect_cc_tax = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 20;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 20, logs: [`💰 ${player.name} recibe $20 (Devolución Renta).`] };
};

export const effect_cc_holiday = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 100;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 100, logs: [`💰 ${player.name} recibe $100 (Fondo Vacaciones).`] };
};

export const effect_cc_inherit = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 100;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 100, logs: [`💰 ${player.name} hereda $100.`] };
};

export const effect_cc_consult = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 25;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 25, logs: [`💰 ${player.name} gana $25 (Consultoría).`] };
};

export const effect_cc_hospital = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= 100;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + 100, logs: [`💸 ${player.name} paga $100 (Hospital).`] };
};

export const effect_cc_bank_err = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money += 200;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney - 200, logs: [`💰 ${player.name} cobra $200 (Error Bancario).`] };
};

export const effect_cc_school = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= 50;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + 50, logs: [`💸 ${player.name} paga $50 (Escuela).`] };
};

export const effect_cc_doctor = (state: GameState, idx: number) => {
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= 50;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + 50, logs: [`💸 ${player.name} paga $50 (Doctor).`] };
};

export const effect_cc_birthday = (state: GameState, idx: number) => {
    const p = [...state.players];
    let total = 0;
    p.forEach((pl, i) => {
        if (i !== idx && pl.alive) {
            const amt = Math.min(pl.money, 10);
            const payer = { ...pl };
            payer.money -= amt;
            total += amt;
            p[i] = payer;
        }
    });
    const receiver = { ...p[idx] };
    receiver.money += total;
    p[idx] = receiver;
    return { players: p, logs: [`🎂 ${receiver.name} recibe $${total} por cumpleaños.`] };
};

export const effect_cc_street = (state: GameState, idx: number) => {
    const cost = calculateRepairs(state, idx, 40, 115);
    const p = [...state.players];
    const player = { ...p[idx] };
    player.money -= cost;
    p[idx] = player;
    return { players: p, estadoMoney: state.estadoMoney + cost, logs: [`💸 ${player.name} paga $${formatMoney(cost)} en reparaciones.`] };
};

export const effect_cc_gotojail = (state: GameState, idx: number) => {
    if (state.gov === 'right') return { logs: ['⚖️ Gobierno Derechas: Community Chest no puede encarcelarte.'] };

    const p = [...state.players];
    const player = { ...p[idx] };
    player.pos = 10;
    player.jail = 3;
    p[idx] = player;
    return { players: p, rolled: false, logs: [`👮 ${player.name} enviado a la cárcel por Community Chest.`] };
};
