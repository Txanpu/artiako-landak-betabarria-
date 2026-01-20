
import { GameState, GovernmentType, TileType } from '../../types';
import { GOV_CONFIGS } from './config';

export const handleGovernmentTick = (state: GameState): Partial<GameState> => {
    let newState = { ...state };
    newState.govTurnsLeft -= 1;
    let newEstadoMoney = newState.estadoMoney;
    let newBankHouses = newState.housesAvail;
    let newBankHotels = newState.hotelsAvail;
    let govLogs: string[] = [];
    let updatedTiles = [...newState.tiles];

    // 1. ANARCHY REVOLUTION (Breaking Houses)
    if (newState.gov === 'anarchy') {
        let brokenCount = 0;
        updatedTiles = updatedTiles.map(t => {
            if (t.type === TileType.PROP && t.owner && t.owner !== 'E' && !t.isBroken) {
                // 5% chance to break per turn
                if (Math.random() < 0.05) {
                    const hasBuildings = (t.houses || 0) > 0 || t.hotel;
                    return {
                        ...t,
                        isBroken: true,
                        // Reset buildings if they exist
                        houses: 0,
                        hotel: false
                    };
                    if (hasBuildings) {
                        if (t.hotel) newBankHotels++;
                        else newBankHouses += (t.houses || 0);
                        govLogs.push(`🔥 ¡REVOLUCIÓN! Han quemado ${t.name}. Edificios destruidos.`);
                    } else {
                        govLogs.push(`🔥 ¡REVOLUCIÓN! Han destrozado ${t.name}. Necesita reparaciones.`);
                    }
                    brokenCount++;
                }
            }
            return t;
        });
        if (brokenCount > 0 && govLogs.length === 0) govLogs.push(`🔥 Disturbios en Artia: ${brokenCount} propiedades dañadas.`);
    }

    // 2. Money Printer (Inflation) - Autoritario Logic moved here partly?
    // Actually, Navigation reducer handles salary printing. Here we handle random injection.
    if(['left','right','authoritarian'].includes(newState.gov) && Math.random() < 0.02) { 
        newEstadoMoney += 800;
        govLogs.push('🖨️ "Money Printer Go Brrr": El gobierno inyecta $800.');
    }

    // 3. Libertarian: Privatize Everything (Auction state assets)
    if (newState.gov === 'libertarian') {
        const stateProps = updatedTiles.filter(t => t.owner === 'E');
        if (stateProps.length > 0) {
            // Force an auction for a random state property
            const prop = stateProps[Math.floor(Math.random() * stateProps.length)];
            // We can't trigger the modal directly from here cleanly without complex state return,
            // but we can put it in the log or simply sell it to bank (privatize).
            // Better: Sell to highest bidder automatically? 
            // Simplified: State sells to bank (liquidation)
            prop.owner = null; // Back to market
            newEstadoMoney += (prop.price || 0);
            govLogs.push(`🏛️ Gobierno Libertario privatiza: ${prop.name} vuelve al mercado libre.`);
        }
    }

    // 4. Natural Disasters (Still active for everyone)
    if (Math.random() < 0.01) {
        const type = Math.random() < 0.5 ? 'Terremoto' : 'Tornado';
        let destroyed = 0;
        updatedTiles = updatedTiles.map(t => {
            if (t.type === TileType.PROP && (t.houses || t.hotel)) {
                if (t.hotel) newBankHotels++;
                if (t.houses) newBankHouses += t.houses;
                destroyed++;
                return { ...t, houses: 0, hotel: false };
            }
            return t;
        });
        if (destroyed > 0) {
            govLogs.push(`🌪️ ¡${type}! Se han destruido edificios en ${destroyed} propiedades.`);
        }
    }

    // 5. Authoritarian Expropriation
    if (newState.gov === 'authoritarian' && Math.random() < 0.15) {
        const candidates = updatedTiles.filter(t => t.type === TileType.PROP && t.owner !== null && t.owner !== 'E' && (t.houses||0) === 0 && !t.hotel);
        if (candidates.length > 0) {
            const target = candidates[Math.floor(Math.random() * candidates.length)];
            const victim = newState.players.find(p => p.id === target.owner);
            if (victim) {
                target.owner = 'E';
                target.mortgaged = false;
                govLogs.push(`🏚️ EXPROPIACIÓN: El Gobierno Autoritario confisca ${target.name} a ${victim.name}.`);
            }
        }
    }

    // Gender Policies
    if (newState.players && newState.players.length > 0) {
        newState.players.forEach(p => {
            if (!p.alive || p.isBot) return; 
            
            const gender = p.gender;
            
            if (newState.gov === 'left') {
                if (gender === 'male') {
                    const tax = 20;
                    if (p.money >= tax) { p.money -= tax; newEstadoMoney += tax; }
                } else if (gender === 'female' || gender === 'marcianito') {
                    const subsidy = 20;
                    p.money += subsidy; newEstadoMoney -= subsidy;
                }
            } else if (newState.gov === 'right') {
                if (gender === 'female') {
                    const tax = 20;
                    if (p.money >= tax) { p.money -= tax; newEstadoMoney += tax; }
                } else if (gender === 'male') {
                    const bonus = 20;
                    p.money += bonus; newEstadoMoney -= bonus;
                }
            } else if (newState.gov === 'authoritarian') {
                if (gender === 'helicoptero') {
                    const subsidy = 50;
                    p.money += subsidy; newEstadoMoney -= subsidy;
                } else {
                    const tax = 10;
                    if (p.money >= tax) { p.money -= tax; newEstadoMoney += tax; }
                }
            }
        });
    }
    
    // --- ELECTIONS / CHANGE GOV ---
    if (newState.govTurnsLeft <= 0) {
        if (Math.random() < 0.5) {
            return {
                ...newState,
                estadoMoney: newEstadoMoney,
                tiles: updatedTiles,
                housesAvail: newBankHouses,
                hotelsAvail: newBankHotels,
                election: {
                    isOpen: true,
                    votes: { left: 0, right: 0, authoritarian: 0, libertarian: 0, anarchy: 0 },
                    votedPlayers: []
                },
                logs: [...(newState.logs || []), ...govLogs, '🗳️ ¡SE CONVOCAN ELECCIONES! Preparad las urnas.']
            };
        } else {
            const govs: GovernmentType[] = ['left', 'right', 'authoritarian', 'libertarian', 'anarchy'];
            const nextGov = govs[Math.floor(Math.random() * govs.length)];
            newState.gov = nextGov;
            newState.govTurnsLeft = 7;
            newState.currentGovConfig = GOV_CONFIGS[nextGov];
            govLogs.push(`🎲 Golpe de Estado / Sucesión: Nuevo gobierno ${nextGov.toUpperCase()}`);
        }
    }

    return { 
        ...newState, 
        estadoMoney: newEstadoMoney, 
        tiles: updatedTiles, 
        housesAvail: newBankHouses, 
        hotelsAvail: newBankHotels, 
        logs: [...(newState.logs || []), ...govLogs] 
    };
};
