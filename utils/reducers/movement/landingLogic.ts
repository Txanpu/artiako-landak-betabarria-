
import { GameState, TileType } from '../../types';
import { trackTileLanding, handleRoleAbilities, drawEvent, checkOkupaOccupation, checkFentanylAddiction, formatMoney } from '../gameLogic';
import { getAvailableTransportHops } from '../board';
import { FIESTA_TILES } from '../../constants';
import { getRandomWorker } from '../../../data/fioreData';

export const handleLandingLogic = (state: GameState): GameState => {
    let pIdx = state.currentPlayerIndex;
    let player = { ...state.players[pIdx] };
    let newPos = player.pos;
    const tile = state.tiles[newPos];

    // --- NEW V22: ROLE CHECKS ---
    // 1. Okupa Occupation check (Steal 'E' prop)
    const okupaCheck = checkOkupaOccupation(player, tile);
    let okupaMsg = null;
    let tileUpdates = [...state.tiles];
    
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
    const roleLogs = handleRoleAbilities(state, player, tile);
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
            const newPlayers = [...state.players];
            newPlayers[pIdx] = player;
            
            return handleLandingLogic({
                ...state,
                tiles: tileUpdates, // Pass Okupa/Fiore updates
                players: newPlayers,
                logs: [`🎉 FIESTA CLANDESTINA: ${outcome.txt}`, ...state.logs, ...roleLogs]
            });
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

    const newPlayers = [...state.players];
    
    // --- IMPUESTOS (TAX LOGIC) ---
    // Calculates tax based on current Gov Config and deducts from player
    let taxLog = null;
    let newEstadoMoney = state.estadoMoney;
    let newFbiPot = state.fbiPot;

    if (tile.type === TileType.TAX) {
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

    // Apply Player Updates
    newPlayers[pIdx] = player;

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
        lastMovementPos: null 
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
        if (state.gov === 'right') {
            // RIGHT GOV: NO JAIL
            finalState.logs.push('⚖️ Gobierno de Derechas: La seguridad privada te deja ir. No entras en la cárcel.');
            finalState.rolled = true;
        } else {
            // Find actual Jail Tile ID
            const jailTile = state.tiles.find(t => t.type === TileType.JAIL);
            const jailPos = jailTile ? jailTile.id : 10; // Fallback to 10 if not found

            player.jail = 3;
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

    return finalState;
};
