
import { GameState, Card } from '../../types';
import { formatMoney } from '../gameLogic';

export const generateDeck = (): Card[] => {
    const suits: ('♥' | '♦' | '♣' | '♠')[] = ['♥', '♦', '♣', '♠'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];
    
    for (const suit of suits) {
        for (const rank of ranks) {
            let value = parseInt(rank);
            if (isNaN(value)) {
                if (rank === 'A') value = 11;
                else value = 10;
            }
            deck.push({ suit, rank, value });
        }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

export const calculateHand = (hand: Card[]): number => {
    let score = 0;
    let aces = 0;
    for (const card of hand) {
        if (card.isHidden) continue;
        score += card.value;
        if (card.rank === 'A') aces++;
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
};

export const handleCasinoBankruptcy = (
    state: GameState, 
    pIdx: number, 
    winnings: number, 
    tileId: number
): { players: any[], tiles: any[], logs: string[], estadoMoney: number } => {
    const newPlayers = [...state.players];
    const newTiles = [...state.tiles];
    let newEstadoMoney = state.estadoMoney;
    let logs: string[] = [];
    const player = { ...newPlayers[pIdx] };
    const tile = newTiles[tileId];

    let ownerIdx = -1;
    if (tile && typeof tile.owner === 'number') {
        ownerIdx = state.players.findIndex(p => p.id === tile.owner);
    }

    if (ownerIdx !== -1) {
        const owner = { ...newPlayers[ownerIdx] };
        if (owner.money >= winnings) {
            owner.money -= winnings;
            newPlayers[ownerIdx] = owner;
        } else {
            // Bankrupt
            const cash = owner.money;
            owner.money = 0;
            
            // Transfer properties
            newTiles.forEach(t => {
                if (t.owner === owner.id) {
                    t.owner = player.id;
                    if (!player.props.includes(t.id)) player.props.push(t.id);
                }
            });
            owner.props = [];
            owner.alive = false;
            
            logs.push(`☠️ CASINO: ${owner.name} entra en BANCARROTA al no poder pagar $${formatMoney(winnings)}. Entrega todo a ${player.name}.`);
            newPlayers[ownerIdx] = owner;
            
            // Player gets remaining cash (if any)
            if (cash > 0) player.money += cash; 
        }
    } else {
        newEstadoMoney -= winnings;
    }
    
    newPlayers[pIdx] = player;
    return { players: newPlayers, tiles: newTiles, logs, estadoMoney: newEstadoMoney };
};
