
import { GameState } from '../../../types';
import { getBoardNeighbors } from '../../board';
import { handleLandingLogic } from '../../movement/landingLogic';
import { shouldBlockWelfare, shouldBlockSalary } from '../../roles';
import { calculateGoSalary } from '../../governmentRules';
import { formatMoney } from '../../gameLogic';

export const navigationReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_MOVE': {
            const moves = action.payload.moves;
            return navigationReducer({ ...state, pendingMoves: moves, isMoving: true, lastMovementPos: null }, { type: 'PROCESS_STEP' });
        }
        
        case 'PROCESS_STEP': {
            if (state.pendingMoves <= 0) return handleLandingLogic(state);
    
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            const currentPos = player.pos;
            let neighbors = getBoardNeighbors(currentPos);
            
            if (state.lastMovementPos !== null) {
                neighbors = neighbors.filter(n => n !== state.lastMovementPos);
            }
    
            if (neighbors.length === 0) return handleLandingLogic(state);
    
            if (neighbors.length === 1) {
                const nextPos = neighbors[0];
                const newPs = [...state.players];
                let newMoney = state.estadoMoney;
                let logs = [...state.logs];
                let p = { ...player, pos: nextPos };

                // --- LIBERTARIAN ROAD TOLL (Peaje) ---
                if (state.gov === 'libertarian') {
                    const tile = state.tiles[nextPos];
                    // Pay toll if property owned by rival
                    if (tile.owner && typeof tile.owner === 'number' && tile.owner !== p.id) {
                        const TOLL = 5;
                        if (p.money >= TOLL) {
                            p.money -= TOLL;
                            const ownerIdx = newPs.findIndex(pl => pl.id === tile.owner);
                            if (ownerIdx !== -1) {
                                newPs[ownerIdx] = { ...newPs[ownerIdx], money: newPs[ownerIdx].money + TOLL };
                                // Don't log every step to avoid spam, but money transfers
                            }
                        }
                    }
                }

                // --- PASSING START LOGIC ---
                if (nextPos === 0) {
                    // 1. Calculate Salary based on Government
                    let salaryLog = null;
                    let salaryAmount = calculateGoSalary(state.gov, p);

                    if (shouldBlockWelfare(state)) {
                        salaryLog = 'Huelga general: sin ayudas en SALIDA.';
                    } else if (shouldBlockSalary(state, p.id)) {
                        salaryLog = 'Techo de cristal: salario bloqueado.';
                    } else if (salaryAmount > 0) {
                        // UPDATED LOGIC: Money Printing for Left/Authoritarian
                        const canPrintMoney = state.gov === 'left' || state.gov === 'authoritarian';
                        
                        if (canPrintMoney && newMoney < salaryAmount) {
                            const diff = salaryAmount - newMoney;
                            newMoney += diff; // Print to cover
                            logs.push(`🖨️ Banco Central (${state.gov.toUpperCase()}) imprime dinero para salarios.`);
                        }

                        // LIBERTARIAN CHECK: NO HAY PLATA
                        if (state.gov === 'libertarian' && newMoney < salaryAmount) {
                            salaryLog = `🦁 Gobierno Libertario: "NO HAY PLATA". No se paga salario.`;
                            salaryAmount = 0;
                        } else if (newMoney >= salaryAmount) {
                            p.money += salaryAmount;
                            newMoney -= salaryAmount;
                            salaryLog = `💰 Salario ${state.gov}: ${p.name} recibe ${formatMoney(salaryAmount)}.`;
                        } else {
                            salaryLog = `💸 Estado sin fondos (${formatMoney(newMoney)}) para salario.`;
                        }
                    } else {
                        if (state.gov === 'anarchy') salaryLog = '🔥 Anarquía: No hay estado que pague.';
                        else salaryLog = '🚫 No cumples los requisitos para cobrar salario.';
                    }
                    
                    if (salaryLog) logs = [salaryLog, ...logs];

                    // 2. Transport Import Tax (New Mechanic)
                    // Every time ANY player passes Go, transport owners get paid by State
                    state.players.forEach((owner, idx) => {
                        if (!owner.alive) return;
                        const transportCount = state.tiles.filter(t => 
                            ['rail', 'bus', 'ferry', 'air'].includes(t.subtype || '') && t.owner === owner.id
                        ).length;

                        if (transportCount > 0) {
                            const tax = transportCount * 10;
                            // Only pay if funds available (State doesn't print for this usually, but let's stick to base logic)
                            if (newMoney >= tax) {
                                newMoney -= tax;
                                const updatedOwner = (idx === pIdx) ? p : { ...newPs[idx] }; // Use p if it's current player
                                updatedOwner.money += tax;
                                newPs[idx] = updatedOwner;
                                logs = [`✈️ Aduanas: ${owner.name} recibe ${formatMoney(tax)} por sus ${transportCount} transportes.`, ...logs];
                            }
                        }
                    });
                }
    
                newPs[pIdx] = p;
                
                const newState = {
                    ...state,
                    players: newPs,
                    estadoMoney: newMoney,
                    pendingMoves: state.pendingMoves - 1,
                    lastMovementPos: currentPos,
                    logs
                };
                
                return navigationReducer(newState, { type: 'PROCESS_STEP' });
            } else {
                if (player.isBot) {
                    const choice = neighbors[Math.floor(Math.random() * neighbors.length)];
                    return navigationReducer(state, { type: 'SELECT_MOVE', payload: choice });
                }
                return {
                    ...state,
                    movementOptions: neighbors,
                    logs: ['¡Elige tu camino!', ...state.logs]
                };
            }
        }
        
        case 'SELECT_MOVE': {
            const nextPos = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            const currentPos = player.pos;
            const neighbors = getBoardNeighbors(currentPos); 
            
            if (!neighbors.includes(nextPos)) return state;
    
            const p = { ...player, pos: nextPos };
            const newPs = [...state.players];
            
            let newMoney = state.estadoMoney;
            let logs = [...state.logs];

            if (nextPos === 0) {
                // Reuse Salary Logic
                let salaryLog = null;
                let salaryAmount = calculateGoSalary(state.gov, p);

                if (shouldBlockWelfare(state)) {
                    salaryLog = 'Huelga general: sin ayudas en SALIDA.';
                } else if (shouldBlockSalary(state, p.id)) {
                    salaryLog = 'Techo de cristal: salario bloqueado.';
                } else if (salaryAmount > 0) {
                     // UPDATED LOGIC
                     const canPrintMoney = state.gov === 'left' || state.gov === 'authoritarian';
                     
                     if (canPrintMoney && newMoney < salaryAmount) {
                         const diff = salaryAmount - newMoney;
                         newMoney += diff;
                         logs.push(`🖨️ Banco Central (${state.gov.toUpperCase()}) imprime dinero para salarios.`);
                     }

                     if (state.gov === 'libertarian' && newMoney < salaryAmount) {
                        salaryLog = `🦁 Gobierno Libertario: "NO HAY PLATA".`;
                        salaryAmount = 0;
                     } else if (newMoney >= salaryAmount) {
                        p.money += salaryAmount;
                        newMoney -= salaryAmount;
                        salaryLog = `💰 Salario ${state.gov}: ${p.name} recibe ${formatMoney(salaryAmount)}.`;
                    } else {
                        salaryLog = `💸 Estado sin fondos.`;
                    }
                } else {
                     if (state.gov === 'anarchy') salaryLog = '🔥 Anarquía: No hay estado.';
                     else salaryLog = '🚫 No cobras.';
                }
                if (salaryLog) logs = [salaryLog, ...logs];

                // Transport Tax
                state.players.forEach((owner, idx) => {
                    if (!owner.alive) return;
                    const transportCount = state.tiles.filter(t => 
                        ['rail', 'bus', 'ferry', 'air'].includes(t.subtype || '') && t.owner === owner.id
                    ).length;
                    if (transportCount > 0) {
                        const tax = transportCount * 10;
                        if (newMoney >= tax) {
                            newMoney -= tax;
                            const updatedOwner = (idx === pIdx) ? p : { ...newPs[idx] };
                            updatedOwner.money += tax;
                            newPs[idx] = updatedOwner;
                            logs = [`✈️ Aduanas: ${owner.name} recibe ${formatMoney(tax)} por transportes.`, ...logs];
                        }
                    }
                });
            }
            
            newPs[pIdx] = p;

            const newState = {
                ...state,
                players: newPs,
                estadoMoney: newMoney,
                movementOptions: [], 
                pendingMoves: state.pendingMoves - 1,
                lastMovementPos: currentPos,
                logs
            };
    
            return navigationReducer(newState, { type: 'PROCESS_STEP' });
        }
        
        default: return state;
    }
};
