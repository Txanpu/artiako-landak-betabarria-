
import { GameState, TileType } from '../../types';
import { trackTileLanding, handleRoleAbilities, drawEvent, checkOkupaOccupation, checkFentanylAddiction, formatMoney, getRent, checkOkupaRentSkip } from '../gameLogic';
import { getAvailableTransportHops } from '../board';
import { FIESTA_TILES, WELFARE_TILES } from '../../constants';
import { getRandomWorker } from '../../../data/fioreData';
import { getJailRules } from '../governmentRules';

export const handleLandingLogic = (state: GameState): GameState => {
    let pIdx = state.currentPlayerIndex;
    let player = { ...state.players[pIdx] };
    let newPos = player.pos;
    const tile = state.tiles[newPos];
    let tileUpdates = [...state.tiles];
    let newPlayers = [...state.players];
    let roleLogs: string[] = [];
    
    // Flags for Rent Logic
    let pendingDebt: { amount: number, creditorId: number | 'E' | 'SHARES' } | null = null;
    let anarchyActionPending = false;
    let rentPaidLog: string | null = null;

    // --- ANARCHY: THE PURGE (Steal from players on same tile) ---
    if (state.gov === 'anarchy') {
        const victims = newPlayers.filter(p => p.id !== player.id && p.pos === newPos && p.alive);
        if (victims.length > 0) {
            let stoleTotal = 0;
            victims.forEach(v => {
                const steal = Math.min(v.money, 100);
                if (steal > 0) {
                    newPlayers[v.id] = { ...v, money: v.money - steal };
                    stoleTotal += steal;
                    roleLogs.push(`⚔️ PURGA: ¡${player.name} asalta a ${v.name} y le roba ${formatMoney(steal)}!`);
                }
            });
            player.money += stoleTotal;
        }
    }

    // --- NEW V22: ROLE CHECKS ---
    // 1. Okupa Occupation check (Steal 'E' prop)
    const okupaCheck = checkOkupaOccupation(player, tile);
    let okupaMsg = null;
    
    if (okupaCheck.success) {
        // Apply occupation
        const t = { ...tile, owner: player.id };
        tileUpdates[newPos] = t;
        player.props.push(t.id);
        okupaMsg = okupaCheck.msg;
    }

    // 2. Fentanyl Addiction check
    const fentCheck = checkFentanylAddiction(player, tile);
    let fentMsg = null;
    if (fentCheck.addicted) {
        player.fentanylAddiction = true;
        fentMsg = fentCheck.msg;
    }

    const newHeatmap = trackTileLanding(state, newPos);
    const abilityLogs = handleRoleAbilities(state, player, tile);
    roleLogs = [...roleLogs, ...abilityLogs];
    
    if (okupaMsg) roleLogs.push(okupaMsg);
    if (fentMsg) roleLogs.push(fentMsg);
    
    // --- SPECIAL RULE: KANALA BITCH -> FIORE RECRUITMENT ---
    if (tile.name === 'Kanala Bitch') {
        const fioreIdx = tileUpdates.findIndex(t => t.subtype === 'fiore');
        if (fioreIdx !== -1) {
            const fioreTile = { ...tileUpdates[fioreIdx] };
            if (fioreTile.owner && typeof fioreTile.owner === 'number') {
                const ownerId = fioreTile.owner;
                const owner = state.players.find(p => p.id === ownerId);
                
                // Add random worker if slot available (max 6)
                if (owner && (fioreTile.workersList?.length || 0) < 6) {
                    const currentIds = fioreTile.workersList ? fioreTile.workersList.map(w => w.id) : [];
                    const newWorker = getRandomWorker(currentIds);
                    
                    if (!fioreTile.workersList) fioreTile.workersList = [];
                    fioreTile.workersList.push(newWorker);
                    fioreTile.workers = fioreTile.workersList.length;
                    
                    tileUpdates[fioreIdx] = fioreTile;
                    roleLogs.push(`💃 ¡Talento descubierto! Alguien ha caído en Kanala Bitch y ${newWorker.name} se une al Fiore de ${owner.name} GRATIS.`);
                }
            }
        }
    }

    // --- FIESTA CLANDESTINA LOGIC ---
    if (FIESTA_TILES.includes(tile.name) && Math.random() < 0.30) {
        const outcomes = [
            { txt: 'Se ha complicado la fiesta, vas de after al Txoko.', dest: 'Txokoa' },
            { txt: 'Mandibulie eskapa yatzu: vas a Klinika Dental.', dest: 'Klinika Dental Arteaga' },
            { txt: 'Se te ha complicado y te has roto una farola. Vas a Farolak.', dest: 'Farolak' },
            { txt: 'Te pones a matar pájaros en el Bird Center.', dest: 'Bird Center' }
        ];
        
        if (player.gender === 'male') {
            outcomes.push({ txt: 'No has ligado, asiue al Fiore.', dest: 'Fiore' });
        }
        
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        const destTile = state.tiles.find(t => t.name === outcome.dest);
        
        if (destTile) {
            // Recursive Landing call for the new destination
            player.pos = destTile.id;
            newPlayers[pIdx] = player;
            
            return handleLandingLogic({
                ...state,
                tiles: tileUpdates, // Pass Okupa/Fiore updates
                players: newPlayers,
                logs: [`🎉 FIESTA CLANDESTINA: ${outcome.txt}`, ...state.logs, ...roleLogs]
            });
        }
    }

    // --- AUTOMATIC RENT & DEBT LOGIC ---
    const t = tile;
    // Check if property is owned and not by current player
    const isOwner = t.owner === player.id;
    const isOwned = (t.owner !== null && t.owner !== undefined) || !!t.companyId;
    
    if (t.type === TileType.PROP && isOwned && !isOwner) {
        const baseRent = getRent(t, state.dice[0] + state.dice[1], state.tiles, state);
        const ivaRate = state.currentGovConfig.rentIVA || 0;
        const ivaAmount = Math.round(baseRent * ivaRate);
        const totalRent = baseRent + ivaAmount;

        const isOkupaSkip = checkOkupaRentSkip(player);

        if (totalRent > 0 && !isOkupaSkip) {
            // ANARCHY: Choice (Pay or Plata o Plomo)
            if (state.gov === 'anarchy') {
                anarchyActionPending = true;
            } 
            // NORMAL: Auto-Pay
            else {
                // Welfare Logic (Left Gov)
                const isWelfare = WELFARE_TILES.includes(t.name) || ['bus','rail','ferry','air'].includes(t.subtype || '');
                if (state.gov === 'left' && isWelfare) {
                    if (state.estadoMoney >= totalRent) {
                        state.estadoMoney -= totalRent;
                        rentPaidLog = `🏛️ Estado Subvencionista paga tu alquiler de ${formatMoney(totalRent)}.`;
                        // Pay Owner Logic below...
                    } else {
                        roleLogs.push(`🏛️ Estado sin fondos para subvención. Impago.`);
                    }
                } else {
                    // Player pays
                    if (player.money >= totalRent) {
                        player.money -= totalRent;
                        rentPaidLog = `💸 ${player.name} paga automáticamente alquiler de ${formatMoney(totalRent)}.`;
                    } else {
                        // DEBT TRIGGER
                        pendingDebt = { 
                            amount: totalRent, 
                            creditorId: t.companyId ? 'SHARES' : (t.owner || 'E') 
                        };
                    }
                }

                // Distribution Logic (Only if Paid or State Paid)
                if ((player.money >= totalRent || (state.gov === 'left' && isWelfare && state.estadoMoney >= totalRent)) && !pendingDebt) {
                    // Pay Creditor
                    if (t.companyId) {
                        const company = state.companies.find(c => c.id === t.companyId);
                        if (company) {
                            Object.entries(company.shareholders).forEach(([pid, shares]) => {
                                const shareAmt = Math.floor(baseRent * (shares / company.totalShares));
                                if (shareAmt > 0) {
                                    const hIdx = newPlayers.findIndex(p => p.id === parseInt(pid));
                                    if (hIdx !== -1) newPlayers[hIdx].money += shareAmt;
                                }
                            });
                        }
                    } else if (typeof t.owner === 'number') {
                        const ownerIdx = newPlayers.findIndex(p => p.id === t.owner);
                        if (ownerIdx !== -1) newPlayers[ownerIdx].money += baseRent;
                    } else if (t.owner === 'E') {
                        state.estadoMoney += baseRent;
                    }

                    // IVA to State
                    if (ivaAmount > 0) {
                        const toState = Math.floor(ivaAmount / 2);
                        state.estadoMoney += toState;
                        state.fbiPot = (state.fbiPot || 0) + (ivaAmount - toState);
                    }
                }
            }
        } else if (isOkupaSkip) {
            roleLogs.push(`🏚️ ${player.name} (Okupa) se niega a pagar el alquiler.`);
        }
    }

    let showCasino = false;
    let casinoGame: 'blackjack' | 'roulette' | null = null;
    if (tile.subtype === 'casino_bj') { showCasino = true; casinoGame = 'blackjack'; }
    if (tile.subtype === 'casino_roulette') { showCasino = true; casinoGame = 'roulette'; }
    if (tile.type === TileType.SLOTS) { showCasino = true; casinoGame = null; }

    if (player.isBot) { showCasino = false; }

    // --- TRANSPORT HOP CHECK ---
    let transportOptions: number[] = [];
    const isTransport = tile.type === TileType.PROP && ['rail', 'bus', 'ferry', 'air'].includes(tile.subtype || '');
    const hasTransportAccess = isTransport && (tile.owner === player.id || player.role === 'okupa');

    if (!state.usedTransportHop && hasTransportAccess) {
        transportOptions = getAvailableTransportHops(state.tiles, player, newPos);
    }

    // --- IMPUESTOS (TAX LOGIC) ---
    // Calculates tax based on current Gov Config and deducts from player
    let taxLog = null;
    let newEstadoMoney = state.estadoMoney;
    let newFbiPot = state.fbiPot;

    if (tile.type === TileType.TAX) {
        
        // --- PASSIVE: MARCIANITO TAX EVASION (Rule 2d) ---
        if (player.gender === 'marcianito') {
            taxLog = `👽 Marcianito: Hacienda no tiene tus datos (Sin papeles). Evades impuestos.`;
        } else {
            const taxRate = state.currentGovConfig.tax;
            
            // If tax rate is negative (Right wing/Libertarian), it implies 0 tax on this tile (or subsidy, but let's keep it 0 for "Tax" tile)
            if (taxRate > 0) {
                const taxAmount = Math.floor(player.money * taxRate);
                if (taxAmount > 0) {
                    player.money -= taxAmount;
                    
                    // Split Tax: 50% State, 50% FBI Pot (Corruption)
                    const toState = Math.floor(taxAmount * 0.5);
                    const toPot = taxAmount - toState;
                    
                    newEstadoMoney += toState;
                    newFbiPot += toPot;
                    
                    taxLog = `💸 IMPUESTOS (${(taxRate*100).toFixed(0)}%): ${player.name} paga ${formatMoney(taxAmount)}.`;
                } else {
                    taxLog = `💸 IMPUESTOS: ${player.name} no tiene ingresos declarables.`;
                }
            } else {
                taxLog = `💸 IMPUESTOS: Exención fiscal por Gobierno actual (0%).`;
            }
        }
    }

    // Apply Player Updates
    newPlayers[pIdx] = player;

    if (rentPaidLog) roleLogs.push(rentPaidLog);

    let finalState: GameState = {
        ...state,
        tiles: tileUpdates,
        players: newPlayers,
        heatmap: newHeatmap,
        showCasinoModal: showCasino,
        casinoGame: casinoGame,
        transportOptions, 
        logs: [...roleLogs, ...state.logs],
        estadoMoney: newEstadoMoney,
        fbiPot: newFbiPot,
        isMoving: false, 
        pendingMoves: 0,
        movementOptions: [],
        lastMovementPos: null,
        // Set new flags
        pendingDebt,
        anarchyActionPending
    };

    if (taxLog) {
        finalState.logs = [taxLog, ...finalState.logs];
    }

    if (tile.type === TileType.EVENT) {
        const evtRes = drawEvent(finalState, pIdx);
        finalState = { ...finalState, ...evtRes };
    }

    // Go To Jail Tile
    if (tile.type === TileType.GOTOJAIL) {
        const jailRules = getJailRules(state.gov);
        
        if (jailRules.immune) {
            // RIGHT or ANARCHY GOV: NO JAIL
            finalState.logs.push(`⚖️ Gobierno ${state.gov.toUpperCase()}: Inmunidad aplicada. No entras en la cárcel.`);
            finalState.rolled = true;
        } else {
            // Find actual Jail Tile ID
            const jailTile = state.tiles.find(t => t.type === TileType.JAIL);
            const jailPos = jailTile ? jailTile.id : 10; 

            player.jail = jailRules.duration; // Use gov duration rule
            player.pos = jailPos;
            player.doubleStreak = 0;
            finalState.logs.push('👮 ¡A la cárcel!');
            finalState.rolled = true;
            newPlayers[pIdx] = player;
            finalState.players = newPlayers;
            finalState.transportOptions = []; // Cancel hop if jailed
        }
    }
    
    // FBI Logic: Steal Tax Pot if Landing on Tax
    if (tile.type === TileType.TAX && player.role === 'fbi' && (finalState.fbiPot||0) > 0) {
        const bonus = finalState.fbiPot || 0;
        player.money += bonus;
        finalState.fbiPot = 0;
        finalState.logs = [`🕵️ FBI CORRUPTO: ${player.name} confisca el bote de impuestos de $${formatMoney(bonus)}.`, ...finalState.logs];
        newPlayers[pIdx] = player; // Update player again with new money
        finalState.players = newPlayers;
    }

    // QUIZ LOGIC: Auto-Open Modal
    if (tile.type === TileType.QUIZ) {
        finalState.selectedTileId = newPos;
    }

    return finalState;
};
