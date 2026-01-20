
import { GameState } from './state';

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    effect: (state: GameState, currentPlayerIdx: number) => Partial<GameState>;
    tags?: string[]; 
}
