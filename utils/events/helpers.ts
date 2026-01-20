
import { GameState } from '../../types';

export const calculateRepairs = (state: GameState, playerIdx: number, houseCost: number, hotelCost: number) => {
    const p = state.players[playerIdx];
    let cost = 0;
    state.tiles.forEach(t => {
        if (t.owner === p.id) {
            if (t.hotel) cost += hotelCost;
            else if (t.houses) cost += (t.houses * houseCost);
        }
    });
    return cost;
};
