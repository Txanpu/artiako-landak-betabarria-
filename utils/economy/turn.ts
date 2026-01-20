
import { GameState, TileData } from '../../types';
import { getHouseCost } from './rent';
import { checkOkupaRentSkip } from '../../utils/roles';

export const processTurnLoans = (state: GameState, playerIdx: number) => {
    const players = [...state.players];
    const player = { ...players[playerIdx] };
    const loans = state.loans.map(l => ({ ...l }));
    const logs: string[] = [];
    let paymentTotal = 0;

    loans.forEach(loan => {
        if (loan.borrowerId === player.id && loan.status === 'active') {
            
            // OKUPA CHECK
            if (checkOkupaRentSkip(player)) {
                logs.push(`🏚️ ${player.name} (Okupa) evita pagar la cuota del préstamo ID ${loan.id.substr(0,4)}.`);
                // Still reduce turnsLeft? Usually yes, time passes. But interest accumulation/payment is skipped.
                // Let's just decrease turn count but NOT deduct money.
                loan.turnsLeft--;
                if (loan.turnsLeft <= 0) {
                    loan.status = 'paid';
                    logs.push(`✅ Préstamo finalizado (Okupa style).`);
                }
                return; // Skip payment logic
            }

            const pay = loan.amountPerTurn;
            
            // Allow negative money temporarily, Margin Call will fix it later
            player.money -= pay;
            paymentTotal += pay;

            // --- ROUTING LOGIC ---
            if (loan.poolId) {
                // 1. Pay to Pool
                const pool = state.loanPools.find(p => p.id === loan.poolId);
                if (pool) pool.cash += pay;
            } else if (loan.shares && loan.shares.length > 0) {
                // 2. Pay to Shareholders
                const totalBips = 10000;
                let remainder = pay;
                loan.shares.forEach(share => {
                    const shareAmount = Math.floor(pay * (share.bips / totalBips));
                    const holderIdx = players.findIndex(p => p.id === share.ownerId);
                    if (holderIdx !== -1 && shareAmount > 0) {
                        players[holderIdx] = { ...players[holderIdx], money: players[holderIdx].money + shareAmount };
                        remainder -= shareAmount;
                    }
                });
                // Remainder (dust) goes to first shareholder or swallowed
                if (remainder > 0) {
                    const firstHolderId = loan.shares[0].ownerId;
                    const hIdx = players.findIndex(p => p.id === firstHolderId);
                    if (hIdx !== -1) players[hIdx].money += remainder;
                }
            } else if (loan.lenderId !== 'E') {
                // 3. Pay to Individual Lender
                const lenderIdx = players.findIndex(p => p.id === loan.lenderId);
                if (lenderIdx !== -1) {
                    players[lenderIdx] = { ...players[lenderIdx], money: players[lenderIdx].money + pay };
                }
            } else {
                // 4. Pay to State (Burned/Treasury)
                // Assuming implicit state money handling
            }

            loan.turnsLeft--;
            if (loan.turnsLeft <= 0) {
                loan.status = 'paid';
                logs.push(`✅ Préstamo pagado por ${player.name} ($${loan.principal}).`);
            }
        }
    });

    if (paymentTotal > 0) logs.push(`💸 ${player.name} pagó $${paymentTotal} en cuotas de préstamos.`);
    players[playerIdx] = player;

    return { loans, players, logs };
};

export const calculateMaintenance = (playerId: number, tiles: TileData[]) => {
    let cost = 0;
    tiles.filter(t => t.owner === playerId).forEach(t => {
        if (t.hotel) cost += 100;
        else if (t.houses) cost += (t.houses * 10);
        
        // Special building maintenance
        if (t.subtype === 'fiore') cost += (t.workers || 0) * (t.wagePer || 0);
    });
    return cost;
};

export const checkMarginCalls = (state: GameState, playerId: number) => {
    const player = state.players.find(p => p.id === playerId);
    
    if (!player || player.money >= 0) return { soldTiles: [], amountRaised: 0 };

    const soldTiles: string[] = [];
    let amountRaised = 0;
    
    // 1. Sell Houses (No restrictions, owners can sell buildings)
    state.tiles.forEach(t => {
        if (player.money >= 0) return;
        if (t.owner === playerId && (t.houses || 0) > 0 && !t.hotel) {
            const sellPrice = Math.floor((getHouseCost(t) * 0.5));
            t.houses = (t.houses || 0) - 1;
            player.money += sellPrice;
            amountRaised += sellPrice;
            soldTiles.push(`Casa en ${t.name}`);
        }
    });

    // 2. Mortgage Properties (Allowed even if locked by options, ownership doesn't change)
    if (player.money < 0) {
        state.tiles.forEach(t => {
            if (player.money >= 0) return;
            if (t.owner === playerId && !t.mortgaged) {
                const mortgageVal = Math.floor((t.price || 0) * 0.5);
                t.mortgaged = true;
                player.money += mortgageVal;
                amountRaised += mortgageVal;
                soldTiles.push(`Hipoteca ${t.name}`);
            }
        });
    }

    // 3. Liquidation (Sell to Bank)
    // BLOCKED if Option exists
    if (player.money < 0) {
        state.tiles.forEach(t => {
            if (player.money >= 0) return;
            
            // Check if locked by Financial Option
            const isLocked = state.financialOptions.some(o => o.propertyId === t.id);
            
            if (t.owner === playerId && !isLocked) {
                const liqVal = Math.floor((t.price || 0) * 0.5);
                t.owner = null;
                t.mortgaged = false;
                t.houses = 0;
                player.money += liqVal;
                amountRaised += liqVal;
                soldTiles.push(`Liquidación ${t.name}`);
            }
        });
    }

    return { soldTiles, amountRaised };
};
