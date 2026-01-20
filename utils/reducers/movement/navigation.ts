
import { GameState } from '../../../types';
import { getBoardNeighbors } from '../../board';
import { handleLandingLogic } from '../../movement/landingLogic';
import { shouldBlockWelfare, shouldBlockSalary } from '../../roles';
import { calculateGoSalary } from '../../governmentRules'; // NEW IMPORT
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
                const p = { ...player, pos: nextPos };
                const newPs = [...state.players];
                
                let newMoney = state.estadoMoney;
                let logs = [...state.logs];

                // --- PASSING START LOGIC ---
                if (nextPos === 0) {
                    // 1. Calculate Salary based on Government
                    let salaryLog = null;
                    const salaryAmount = calculateGoSalary(state.gov, p);

                    if (shouldBlockWelfare(state)) {
                        salaryLog = 'Huelga general: sin ayudas en SALIDA.';
                    } else if (shouldBlockSalary(state, p.id)) {
                        salaryLog = 'Techo de cristal: salario bloqueado.';
                    } else if (salaryAmount > 0) {
                        if (state.estadoMoney >= salaryAmount || state.gov === 'authoritarian') {
                            // Authoritarian prints money if needed
                            if (state.gov === 'authoritarian' && state.estadoMoney < salaryAmount) {
                                newMoney += 1000; // Print buffer
                                logs.push('🖨️ Banco Central Autoritario imprime dinero para pagar salarios.');
                            }

                            if (newMoney >= salaryAmount) {
                                p.money += salaryAmount;
                                newMoney -= salaryAmount;
                                salaryLog = `💰 Salario ${state.gov}: ${p.name} recibe ${formatMoney(salaryAmount)}.`;
                            } else {
                                salaryLog = `💸 Estado sin fondos (${formatMoney(state.estadoMoney)}) para salario.`;
                            }
                        } else {
                            salaryLog = `💸 Estado sin fondos para salario.`;
                        }
                    } else {
                        if (state.gov === 'libertarian') salaryLog = '🏛️ Gobierno Libertario: No hay salario público.';
                        else if (state.gov === 'anarchy') salaryLog = '🔥 Anarquía: No hay estado que pague.';
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
                            if (newMoney >= tax) {
                                newMoney -= tax;
                                const updatedOwner = (idx === pIdx) ? p : { ...newPs[idx] };
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
                const salaryAmount = calculateGoSalary(state.gov, p);

                if (shouldBlockWelfare(state)) {
                    salaryLog = 'Huelga general: sin ayudas en SALIDA.';
                } else if (shouldBlockSalary(state, p.id)) {
                    salaryLog = 'Techo de cristal: salario bloqueado.';
                } else if (salaryAmount > 0) {
                     if (state.estadoMoney >= salaryAmount || state.gov === 'authoritarian') {
                        if (state.gov === 'authoritarian' && state.estadoMoney < salaryAmount) {
                            newMoney += 1000;
                            logs.push('🖨️ Banco Central Autoritario imprime dinero.');
                        }
                        if (newMoney >= salaryAmount) {
                            p.money += salaryAmount;
                            newMoney -= salaryAmount;
                            salaryLog = `💰 Salario ${state.gov}: ${p.name} recibe ${formatMoney(salaryAmount)}.`;
                        } else {
                            salaryLog = `💸 Estado sin fondos.`;
                        }
                    } else {
                        salaryLog = `💸 Estado sin fondos.`;
                    }
                } else {
                     if (state.gov === 'libertarian') salaryLog = '🏛️ Gobierno Libertario: No hay salario.';
                     else if (state.gov === 'anarchy') salaryLog = '🔥 Anarquía: No hay estado.';
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
