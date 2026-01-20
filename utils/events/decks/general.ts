
import { GameEvent } from '../../../types';
import { findFreeBundles } from '../../extras';
import { formatMoney } from '../../gameLogic';

export const GENERAL_EVENTS: GameEvent[] = [
    {
        id: 'ev_lottery',
        title: 'Lotería Nacional',
        description: '¡Has ganado el segundo premio! Recibes $150.',
        effect: (state, idx) => {
            const p = [...state.players]; 
            const player = { ...p[idx] };
            player.money += 150;
            p[idx] = player;
            return { players: p, estadoMoney: state.estadoMoney - 150, logs: [`💰 ${player.name} gana $150 en la Lotería.`] };
        }
    },
    {
        id: 'ev_tax_audit',
        title: 'Inspección Fiscal',
        description: 'Hacienda somos todos. Pagas $100.',
        effect: (state, idx) => {
            const p = [...state.players]; 
            const player = { ...p[idx] };
            player.money -= 100;
            p[idx] = player;
            return { players: p, fbiPot: (state.fbiPot||0) + 100, logs: [`💸 ${player.name} paga $100 de multa fiscal.`] };
        }
    },
    {
        id: 'ev_jarein',
        title: '¿Eres el padre de Jarein?',
        description: 'Te preguntan por Jarein. Pagas $100 al Estado por si acaso.',
        effect: (state, idx) => {
            const p = [...state.players];
            const player = { ...p[idx] };
            player.money -= 100;
            p[idx] = player;
            return { players: p, estadoMoney: state.estadoMoney + 100, logs: [`💸 ${player.name} paga $100 por confusión de identidad.`] };
        }
    },
    {
        id: 'ev_javi',
        title: 'JAVI.',
        description: 'JAVI. Cada jugador te paga $10. No preguntes.',
        effect: (state, idx) => {
            const p = [...state.players];
            let collected = 0;
            p.forEach((pl, i) => {
                if (i !== idx && pl.alive) {
                    const payer = { ...pl };
                    const amount = Math.min(payer.money, 10);
                    payer.money -= amount;
                    collected += amount;
                    p[i] = payer;
                }
            });
            const receiver = { ...p[idx] };
            receiver.money += collected;
            p[idx] = receiver;
            return { players: p, logs: [`💰 ${receiver.name} recibe $${collected} por JAVI.`] };
        }
    },
    {
        id: 'ev_itv',
        title: 'ITV Motos',
        description: 'La moto se calienta. Te pillan: Tú y el de tu izquierda vais a la cárcel.',
        effect: (state, idx) => {
            if (state.gov === 'right') return { logs: ['⚖️ ITV: El Gobierno Derechas evita el arresto.'] };

            const p = [...state.players];
            const player = { ...p[idx] };
            player.pos = 10; 
            player.jail = 2;
            p[idx] = player;

            let leftIdx = idx - 1;
            if (leftIdx < 0) leftIdx = p.length - 1;
            
            if (p[leftIdx].alive) {
                const partner = { ...p[leftIdx] };
                partner.pos = 10;
                partner.jail = 2;
                p[leftIdx] = partner;
                return { players: p, rolled: false, logs: [`👮 ITV: ${player.name} y ${partner.name} a la cárcel.`] };
            }
            return { players: p, rolled: false, logs: [`👮 ITV: ${player.name} a la cárcel.`] }; 
        }
    },
    {
        id: 'ev_blackout',
        title: 'Apagón Nacional',
        description: 'Se ha ido la luz. No hay ruleta, tragaperras ni galgos por 2 turnos.',
        effect: (state, idx) => ({ logs: ['🌑 Apagón activo.'] })
    },
    {
        id: 'ev_strike',
        title: 'Huelga General',
        description: 'Sindicatos toman las calles. Sin alquileres ni ayudas por este turno.',
        effect: (state, idx) => ({ logs: ['✊ Huelga General activa.'] })
    },
    {
        id: 'ev_jail_card',
        title: 'Redada Policial',
        description: 'Te han pillado con material sospechoso. Vas a la cárcel.',
        effect: (state, idx) => {
            if (state.gov === 'right') return { logs: ['⚖️ Redada: El Gobierno Derechas cancela la operación.'] };
            
            const p = [...state.players]; 
            const player = { ...p[idx] };
            player.pos = 10; 
            player.jail = 3;
            p[idx] = player;
            return { players: p, rolled: false, logs: [`👮 ${player.name} detenido en redada.`] }; 
        }
    },
    {
        id: 'ev_advance_go',
        title: 'Avance Rápido',
        description: 'Corre a la Salida. Cobras $200.',
        effect: (state, idx) => {
            const p = [...state.players]; 
            const player = { ...p[idx] };
            player.pos = 0; 
            player.money += 200;
            p[idx] = player;
            return { players: p, estadoMoney: state.estadoMoney - 200, logs: [`➡️ ${player.name} avanza a Salida y cobra $200.`] };
        }
    },
    {
        id: 'ev_bundle_auction',
        title: 'Subasta de Lote',
        description: 'El Estado subasta un paquete de propiedades abandonadas.',
        effect: (state, idx) => {
             const bundles = findFreeBundles(state, 2);
             if (bundles.length === 0) {
                 return { logs: ['🚫 No hay lotes disponibles para subastar.'] };
             }
             const targetBundle = bundles[Math.floor(Math.random() * bundles.length)];
             const basePrice = targetBundle.reduce((acc, tid) => acc + (state.tiles[tid].price || 0), 0);
             return {
                 auction: {
                     tileId: targetBundle[0],
                     items: targetBundle,
                     currentBid: Math.floor(basePrice * 0.5),
                     highestBidder: null,
                     activePlayers: state.players.filter(p => p.alive).map(p => p.id),
                     timer: 30,
                     isOpen: true,
                     kind: 'bundle',
                     sealed: true
                 },
                 logs: ['📦 ¡Subasta de Lote iniciada (Puja Oculta)!']
             };
        }
    },
    {
        id: 'ev_greyhounds',
        title: 'Carrera de Galgos',
        description: '¡Día de carreras! Todos al canódromo para apostar.',
        effect: (state, idx) => {
             return { showGreyhounds: true, greyhoundPot: 0, greyhoundBets: {}, logs: ['🏁 ¡Empieza la carrera de galgos!'] };
        }
    },
    {
        id: 'ev_inflation',
        title: 'Deriva Inflacionaria',
        description: 'El coste de construcción sube un 25% durante 3 turnos.',
        effect: (state, idx) => {
            return { buildEventMul: 0.25, buildEventTurns: 3, logs: ['📈 Inflación: Costes de construcción +25%.'] };
        }
    }
];
