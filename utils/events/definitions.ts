
import { GameEvent } from '../../types';
import { GENERAL_EVENTS } from './decks/general';
import { COMMUNITY_CHEST_CARDS } from './decks/community';
import { CHANCE_CARDS } from './decks/chance';

export const EVENTS_DECK: GameEvent[] = [
    ...GENERAL_EVENTS,
    ...COMMUNITY_CHEST_CARDS,
    ...CHANCE_CARDS
];
