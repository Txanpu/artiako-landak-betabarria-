
import { GameState } from '../../../types';
import { isPowerOff, formatMoney, canProxenetaCheat, getRandom } from '../../gameLogic';

// Constantes de la Ruleta Europea
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const rouletteReducer = (state: GameState, action: any): GameState => {
    if (action.type !== 'SPIN_ROULETTE') return state;

    // 1. Validaciones de Gobierno y Estado
    if (state.gov === 'left') {
        return { ...state, showCasinoModal: false, logs: ['🚫 Ruleta clausurada por el Gobierno.', ...state.logs] };
    }
    if (state.casinoPlays >= 3) {
        return { ...state, logs: ['🚫 Límite de 3 jugadas por turno alcanzado.', ...state.logs] };
    }
    if (isPowerOff(state)) {
        return { ...state, showCasinoModal: false, logs: ['🚫 Apagón: La ruleta no funciona.', ...state.logs] };
    }

    const { bets } = action.payload; // bets es un objeto { "key": amount }
    const pIdx = state.currentPlayerIndex;
    let player = { ...state.players[pIdx] };
    
    // Calcular apuesta total
    let totalBet = 0;
    Object.values(bets).forEach((v: any) => totalBet += (v as number));

    if (player.money < totalBet) return state; // No funds

    // 2. Ejecutar Transacción (Cobrar apuesta)
    player.money -= totalBet;
    
    // Gestión del Dueño del Casino
    const tile = state.tiles[player.pos];
    let ownerIdx = -1;
    if (tile && typeof tile.owner === 'number' && tile.owner !== player.id) {
        ownerIdx = state.players.findIndex(p => p.id === tile.owner);
    }

    let newEstadoMoney = state.estadoMoney;
    const newPlayers = [...state.players];
    
    // Si hay dueño, el dinero va a él temporalmente (luego paga si pierde)
    // Si es del estado, va a las arcas
    let casinoBank = 0; // Dinero disponible para pagar premios si es un jugador
    if (ownerIdx !== -1) {
        const owner = { ...newPlayers[ownerIdx] };
        owner.money += totalBet; // Cobra la apuesta
        casinoBank = owner.money;
        newPlayers[ownerIdx] = owner;
    } else {
        newEstadoMoney += totalBet;
        // El estado "siempre" tiene fondos teóricamente, o usa estadoMoney
        casinoBank = Infinity; 
    }

    // 3. Girar la Ruleta (RNG Seguro)
    let winningNumber = Math.floor(getRandom() * 37);

    // 4. Calcular Ganancias (Lógica Completa)
    const calculateWinnings = (num: number, currentBets: Record<string, number>) => {
        let totalWin = 0;

        for (const [key, amount] of Object.entries(currentBets)) {
            const bet = amount as number;
            
            // A. Apuestas a Número (Straight Up) 35:1
            if (!isNaN(parseInt(key))) {
                if (parseInt(key) === num) totalWin += bet * 36; // 35 payout + 1 bet returned
            }
            
            // B. Colores (1:1)
            else if (key === 'red') { if (RED_NUMBERS.has(num)) totalWin += bet * 2; }
            else if (key === 'black') { if (num !== 0 && !RED_NUMBERS.has(num)) totalWin += bet * 2; }
            
            // C. Par/Impar (1:1)
            else if (key === 'even') { if (num !== 0 && num % 2 === 0) totalWin += bet * 2; }
            else if (key === 'odd') { if (num !== 0 && num % 2 !== 0) totalWin += bet * 2; }
            
            // D. Mitades (1:1)
            else if (key === '1-18') { if (num >= 1 && num <= 18) totalWin += bet * 2; }
            else if (key === '19-36') { if (num >= 19 && num <= 36) totalWin += bet * 2; }
            
            // E. Docenas (2:1)
            else if (key === '1st12') { if (num >= 1 && num <= 12) totalWin += bet * 3; }
            else if (key === '2nd12') { if (num >= 13 && num <= 24) totalWin += bet * 3; }
            else if (key === '3rd12') { if (num >= 25 && num <= 36) totalWin += bet * 3; }
            
            // F. Columnas (2:1)
            else if (key === 'col1') { if (num > 0 && num % 3 === 1) totalWin += bet * 3; } // 1, 4, 7...
            else if (key === 'col2') { if (num > 0 && num % 3 === 2) totalWin += bet * 3; } // 2, 5, 8...
            else if (key === 'col3') { if (num > 0 && num % 3 === 0) totalWin += bet * 3; } // 3, 6, 9...
        }
        return totalWin;
    };

    let payout = calculateWinnings(winningNumber, bets);

    // --- PROXENETA CHEAT ---
    // Si pierde todo, el Proxeneta tiene una oportunidad de trucar la ruleta
    if (payout === 0 && canProxenetaCheat(player, 0.35)) {
        // Intenta encontrar un número ganador basado en las apuestas
        const betKeys = Object.keys(bets);
        
        // Prioridad: Números directos
        const numberBets = betKeys.filter(k => !isNaN(parseInt(k)));
        if (numberBets.length > 0) {
            winningNumber = parseInt(numberBets[Math.floor(getRandom() * numberBets.length)]);
        } 
        // Si no, Color
        else if (bets['red']) winningNumber = 3; // Un rojo cualquiera
        else if (bets['black']) winningNumber = 2; // Un negro cualquiera
        else if (bets['0']) winningNumber = 0;

        // Recalcular con el número trucado
        payout = calculateWinnings(winningNumber, bets);
    }

    // 5. Pagar Premios
    let bankruptcyLog = null;
    let newTiles = [...state.tiles];

    if (payout > 0) {
        if (ownerIdx !== -1) {
            // Paga el Dueño Jugador
            const owner = newPlayers[ownerIdx]; // Ya tiene la apuesta sumada arriba
            
            if (owner.money >= payout) {
                owner.money -= payout;
                player.money += payout;
            } else {
                // BANCARROTA DEL DUEÑO
                const cash = owner.money;
                player.money += cash; // Se lleva lo que quede
                owner.money = 0;
                
                // Transferir propiedades
                newTiles = newTiles.map(t => {
                    if (t.owner === owner.id) {
                        if (!player.props.includes(t.id)) player.props.push(t.id);
                        return { ...t, owner: player.id };
                    }
                    return t;
                });
                owner.props = [];
                owner.alive = false;
                bankruptcyLog = `☠️ CASINO: ${owner.name} quiebra al no poder pagar ${formatMoney(payout)}.`;
            }
            newPlayers[ownerIdx] = owner;
        } else {
            // Paga el Estado
            if (newEstadoMoney >= payout) {
                newEstadoMoney -= payout;
                player.money += payout;
            } else {
                // Estado en quiebra (raro pero posible)
                player.money += newEstadoMoney;
                newEstadoMoney = 0;
                // No quiebra el estado, solo no paga completo
            }
        }
    }

    newPlayers[pIdx] = player;
    
    // Actualizar historial
    const history = state.rouletteState?.history || [];
    const newHistory = [winningNumber, ...history].slice(0, 10);

    const logs = [...state.logs];
    if (bankruptcyLog) logs.unshift(bankruptcyLog);

    return {
        ...state,
        players: newPlayers,
        estadoMoney: newEstadoMoney,
        tiles: newTiles,
        logs: logs,
        casinoPlays: state.casinoPlays + 1,
        rouletteState: {
            winningNumber,
            totalWinnings: payout,
            netOwnerChange: totalBet - payout, // Utility stat
            history: newHistory
        }
    };
};
