
import { GameEvent } from '../../../types';
import * as Logic from './chanceLogic';

export const CHANCE_CARDS: GameEvent[] = [
    {
        id: 'ch_jail_free',
        title: 'Suerte',
        description: 'Quedas libre de la cárcel. Esta carta se guarda.',
        effect: Logic.effect_ch_jail_free
    },
    {
        id: 'ch_repairs',
        title: 'Suerte',
        description: 'Reparaciones generales. Paga $25 por casa y $100 por hotel.',
        effect: Logic.effect_ch_repairs
    },
    {
        id: 'ch_speeding',
        title: 'Suerte',
        description: 'Multa por exceso de velocidad: $15.',
        effect: Logic.effect_ch_speeding
    },
    {
        id: 'ch_chairman',
        title: 'Suerte',
        description: 'Has sido elegido presidente de la junta. Paga $50 a cada jugador.',
        effect: Logic.effect_ch_chairman
    },
    {
        id: 'ch_back3',
        title: 'Suerte',
        description: 'Retrocede 3 casillas.',
        effect: Logic.effect_ch_back3
    },
    {
        id: 'ch_util',
        title: 'Suerte',
        description: 'Avanza a la Utilidad más cercana.',
        effect: Logic.effect_ch_util
    },
    {
        id: 'ch_dividend',
        title: 'Suerte',
        description: 'El banco te paga un dividendo de $50.',
        effect: Logic.effect_ch_dividend
    },
    {
        id: 'ch_rail',
        title: 'Suerte',
        description: 'Avanza a la Estación más cercana.',
        effect: Logic.effect_ch_rail
    },
    {
        id: 'ch_poor',
        title: 'Suerte',
        description: 'Impuesto de pobreza: $15.',
        effect: Logic.effect_ch_poor
    },
    {
        id: 'ch_reading',
        title: 'Suerte',
        description: 'Ve a Metro Zelaieta Sur (Reading RR). Si pasas por Salida, cobra $200.',
        effect: Logic.effect_ch_reading
    },
    {
        id: 'ch_boardwalk',
        title: 'Suerte',
        description: 'Ve a Baserri Maitea (Boardwalk).',
        effect: Logic.effect_ch_boardwalk
    },
    {
        id: 'ch_illinois',
        title: 'Suerte',
        description: 'Ve a Txokoa (Illinois Ave). Si pasas por Salida, cobra $200.',
        effect: Logic.effect_ch_illinois
    },
    {
        id: 'ch_loan',
        title: 'Suerte',
        description: 'Vence tu préstamo de construcción. Cobra $150.',
        effect: Logic.effect_ch_loan
    },
    {
        id: 'ch_stcharles',
        title: 'Suerte',
        description: 'Ve a Perrukeria (St. Charles Place). Si pasas por Salida, cobra $200.',
        effect: Logic.effect_ch_stcharles
    },
    {
        id: 'ch_gotojail',
        title: 'Suerte',
        description: 'Ve a la Cárcel. Ve directamente sin pasar por Salida.',
        effect: Logic.effect_ch_gotojail
    }
];
