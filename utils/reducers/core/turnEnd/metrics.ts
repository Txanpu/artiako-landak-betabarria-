
import { GameState, Player, TileData, Loan } from '../../../../types';

export const calculateMetrics = (
    currentMetrics: Record<number, { turn: number, money: number, netWorth: number }[]> | undefined,
    players: Player[],
    tiles: TileData[],
    loans: Loan[],
    turnCount: number
): Record<number, { turn: number, money: number, netWorth: number }[]> => {
    const newMetrics = { ...(currentMetrics || {}) };
    
    players.forEach(p => {
        if (!p.alive) return;
        
        const propsVal = tiles.filter(t => t.owner === p.id).reduce((acc, t) => acc + (t.price||0), 0);
        const debt = loans.filter(l => l.borrowerId === p.id).reduce((acc, l) => acc + l.principal, 0);
        const net = p.money + propsVal - debt;
        
        if (!newMetrics[p.id]) newMetrics[p.id] = [];
        newMetrics[p.id] = [...newMetrics[p.id], { turn: turnCount, money: p.money, netWorth: net }];
        
        if (newMetrics[p.id].length > 30) {
            newMetrics[p.id] = newMetrics[p.id].slice(-30);
        }
    });

    return newMetrics;
};
