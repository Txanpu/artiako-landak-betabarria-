
import { GameEvent } from '../../../types';
import * as Logic from './communityLogic';

export const COMMUNITY_CHEST_CARDS: GameEvent[] = [
    {
        id: 'cc_jail_free',
        title: 'Community Chest',
        description: 'Quedas libre de la cárcel. Esta carta se guarda.',
        effect: Logic.effect_cc_jail_free
    },
    {
        id: 'cc_beauty',
        title: 'Community Chest',
        description: 'Has ganado el segundo premio en un concurso de belleza. Cobra $10.',
        effect: Logic.effect_cc_beauty
    },
    {
        id: 'cc_stock',
        title: 'Community Chest',
        description: 'De la venta de acciones, obtienes $50.',
        effect: Logic.effect_cc_stock
    },
    {
        id: 'cc_life',
        title: 'Community Chest',
        description: 'Vence tu seguro de vida. Cobra $100.',
        effect: Logic.effect_cc_life
    },
    {
        id: 'cc_tax',
        title: 'Community Chest',
        description: 'Devolución de la Renta. Cobra $20.',
        effect: Logic.effect_cc_tax
    },
    {
        id: 'cc_holiday',
        title: 'Community Chest',
        description: 'Vence el fondo de vacaciones. Recibe $100.',
        effect: Logic.effect_cc_holiday
    },
    {
        id: 'cc_inherit',
        title: 'Community Chest',
        description: 'Heredas $100.',
        effect: Logic.effect_cc_inherit
    },
    {
        id: 'cc_consult',
        title: 'Community Chest',
        description: 'Recibes $25 por consultoría.',
        effect: Logic.effect_cc_consult
    },
    {
        id: 'cc_hospital',
        title: 'Community Chest',
        description: 'Paga tasas de hospital: $100.',
        effect: Logic.effect_cc_hospital
    },
    {
        id: 'cc_bank_err',
        title: 'Community Chest',
        description: 'Error bancario a tu favor. Cobra $200.',
        effect: Logic.effect_cc_bank_err
    },
    {
        id: 'cc_school',
        title: 'Community Chest',
        description: 'Paga tasas escolares: $50.',
        effect: Logic.effect_cc_school
    },
    {
        id: 'cc_doctor',
        title: 'Community Chest',
        description: 'Honorarios del doctor. Paga $50.',
        effect: Logic.effect_cc_doctor
    },
    {
        id: 'cc_birthday',
        title: 'Community Chest',
        description: 'Es tu cumpleaños. Cobra $10 de cada jugador.',
        effect: Logic.effect_cc_birthday
    },
    {
        id: 'cc_street',
        title: 'Community Chest',
        description: 'Reparaciones en la calle. Paga $40 por casa y $115 por hotel.',
        effect: Logic.effect_cc_street
    },
    {
        id: 'cc_gotojail',
        title: 'Community Chest',
        description: 'Ve a la Cárcel. Ve directamente sin pasar por Salida.',
        effect: Logic.effect_cc_gotojail
    }
];
