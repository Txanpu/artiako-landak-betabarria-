
import { GameState, GovernmentType, TileType } from '../../types';
import { GOV_CONFIGS } from './config';
import { getColorGroup } from '../ai/constants';
import { formatMoney } from '../gameLogic';

export const handleGovernmentTick = (state: GameState): Partial<GameState> => {
    let newState = { ...state };
    newState.govTurnsLeft -= 1;
    let newEstadoMoney = newState.estadoMoney;
    let newBankHouses = newState.housesAvail;
    let newBankHotels = newState.hotelsAvail;
    let govLogs: string[] = [];
    let updatedTiles = [...newState.tiles];
    let updatedPlayers = [...state.players];

    // 1. LEFT GOVERNMENT LOGIC
    if (newState.gov === 'left') {
        // A. Wealth Tax
        updatedPlayers = updatedPlayers.map(p => {
            if (p.money > 2000) {
                const tax = Math.floor(p.money * 0.05);
                if (tax > 0) {
                    newEstadoMoney += tax;
                    govLogs.push(`⚖️ Impuesto Riqueza: ${p.name} paga ${formatMoney(tax)} al Estado.`);
                    return { ...p, money: p.money - tax };
                }
            }
            return p;
        });

        // B. Expropriation
        const colors = [...new Set(updatedTiles.filter(t => t.color).map(t => t.color!))];
        colors.forEach(c => {
            const group = getColorGroup(updatedTiles, c);
            if (group.length === 0) return;
            const firstOwner = group[0].owner;
            
            if (typeof firstOwner === 'number' && group.every(t => t.owner === firstOwner)) {
                const hasBuildings = group.some(t => (t.houses || 0) > 0 || t.hotel);
                if (!hasBuildings && Math.random() < 0.05) {
                    const target = group[Math.floor(Math.random() * group.length)];
                    const ownerName = updatedPlayers.find(p => p.id === firstOwner)?.name;
                    target.owner = 'E';
                    govLogs.push(`🏚️ EXPROPIACIÓN USO SOCIAL: El Estado confisca ${target.name} a ${ownerName} por falta de uso.`);
                }
            }
        });
    }

    // 2. RIGHT GOVERNMENT LOGIC
    if (newState.gov === 'right') {
        // A. Offshore Interest (5%)
        updatedPlayers = updatedPlayers.map(p => {
            if ((p.offshoreMoney || 0) > 0) {
                const interest = Math.floor(p.offshoreMoney! * 0.05);
                if (interest > 0) {
                    govLogs.push(`📈 Paraíso Fiscal: ${p.name} genera ${formatMoney(interest)} de intereses.`);
                    return { ...p, offshoreMoney: (p.offshoreMoney || 0) + interest };
                }
            }
            return p;
        });

        // B. Desokupa Express
        updatedTiles = updatedTiles.map(t => {
            if (t.blockedRentTurns && t.blockedRentTurns > 0) {
                govLogs.push(`👮 Desokupa Express: La policía desaloja a los ocupantes de ${t.name}.`);
                return { ...t, blockedRentTurns: 0 };
            }
            return t;
        });
    }

    // 3. ANARCHY REVOLUTION
    if (newState.gov === 'anarchy') {
        let brokenCount = 0;
        
        // A. Destruction
        updatedTiles = updatedTiles.map(t => {
            if (t.type === TileType.PROP && t.owner && t.owner !== 'E' && !t.isBroken) {
                if (Math.random() < 0.05) {
                    const hasBuildings = (t.houses || 0) > 0 || t.hotel;
                    if (hasBuildings) {
                        if (t.hotel) newBankHotels++;
                        else newBankHouses += (t.houses || 0);
                        govLogs.push(`🔥 ¡REVOLUCIÓN! Han quemado ${t.name}. Edificios destruidos.`);
                        return { ...t, houses: 0, hotel: false, isBroken: true };
                    } else {
                        govLogs.push(`🔥 ¡REVOLUCIÓN! Han destrozado ${t.name}. Necesita reparaciones.`);
                        return { ...t, isBroken: true };
                    }
                    brokenCount++;
                }
            }
            return t;
        });

        // B. NARCO CARTELS
        const colors = [...new Set(updatedTiles.filter(t => t.color).map(t => t.color!))];
        colors.forEach(c => {
            const group = getColorGroup(updatedTiles, c);
            if (group.length === 0) return;
            const firstOwner = group[0].owner;
            
            if (firstOwner && typeof firstOwner === 'number' && group.every(t => t.owner === firstOwner && !t.mortgaged && !t.isBroken)) {
                updatedPlayers = updatedPlayers.map(p => {
                    if (p.id === firstOwner) {
                        return { ...p, farlopa: (p.farlopa || 0) + 1 };
                    }
                    return p;
                });
                govLogs.push(`📦 Cártel ${c.toUpperCase()}: Producción de Farlopa entregada al Capo.`);
            }
        });

        if (brokenCount > 0 && govLogs.length === 0) govLogs.push(`🔥 Disturbios en Artia: ${brokenCount} propiedades dañadas.`);
    }

    // 4. AUTHORITARIAN LOGIC
    if (newState.gov === 'authoritarian') {
        // A. Money Printer if State is broke
        if (newEstadoMoney < 500) {
             newEstadoMoney += 1000;
             govLogs.push('🖨️ Banco Central: El Régimen imprime billetes para mantener el control.');
        }

        // B. Expropiación de "Vagos y Maleantes" (Solares vacíos)
        if (Math.random() < 0.15) {
            const undevelopedProps = updatedTiles.filter(t => 
                t.type === TileType.PROP && 
                t.owner !== null && 
                typeof t.owner === 'number' && 
                (t.houses || 0) === 0 && 
                !t.hotel
            );

            if (undevelopedProps.length > 0) {
                const target = undevelopedProps[Math.floor(Math.random() * undevelopedProps.length)];
                const victim = updatedPlayers.find(p => p.id === target.owner);
                if (victim) {
                    target.owner = 'E'; // Seize to State
                    target.mortgaged = false; // Reset mortgage status
                    govLogs.push(`👮 LEY DE VAGOS: El Régimen expropia ${target.name} a ${victim.name} por falta de productividad.`);
                }
            }
        }

        // C. FORCED LABOR IN JAIL (Gulag)
        updatedPlayers = updatedPlayers.map(p => {
            if (p.jail > 0) {
                const laborValue = 50;
                if (p.money >= laborValue) {
                    p.money -= laborValue;
                    newEstadoMoney += laborValue;
                    govLogs.push(`⚒️ GULAG: ${p.name} genera $50 en trabajos forzados desde la cárcel.`);
                } else {
                    // Debt / Punish
                    p.money -= laborValue; // Go negative
                    newEstadoMoney += laborValue;
                    govLogs.push(`⚒️ GULAG: ${p.name} genera deuda estatal por trabajos forzados.`);
                }
            }
            return p;
        });
    }

    // 5. Libertarian: Privatize
    if (newState.gov === 'libertarian') {
        const stateProps = updatedTiles.filter(t => t.owner === 'E');
        if (stateProps.length > 0) {
            const prop = stateProps[Math.floor(Math.random() * stateProps.length)];
            prop.owner = null; 
            newEstadoMoney += (prop.price || 0);
            govLogs.push(`🏛️ Gobierno Libertario privatiza: ${prop.name} vuelve al mercado libre.`);
        }
    }

    // 6. Natural Disasters
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

    // Gender Policies
    if (updatedPlayers && updatedPlayers.length > 0) {
        updatedPlayers = updatedPlayers.map(p => {
            if (!p.alive || p.isBot) return p; 
            
            const gender = p.gender;
            let moneyChange = 0;
            
            if (newState.gov === 'left') {
                if (gender === 'male') moneyChange = -20;
                else if (gender === 'female' || gender === 'marcianito') moneyChange = 20;
            } else if (newState.gov === 'right') {
                if (gender === 'female') moneyChange = -20;
                else if (gender === 'male') moneyChange = 20;
            } else if (newState.gov === 'authoritarian') {
                if (gender === 'helicoptero') moneyChange = 50; // Military/Attack Heli bonus
                else moneyChange = -10; // Everyone else pays tribute
            }

            if (moneyChange !== 0) {
                if (moneyChange < 0 && p.money < Math.abs(moneyChange)) return p;
                newEstadoMoney -= moneyChange;
                return { ...p, money: p.money + moneyChange };
            }
            return p;
        });
    }
    
    // --- ELECTIONS ---
    if (newState.govTurnsLeft <= 0) {
        if (Math.random() < 0.5) {
            return {
                ...newState,
                players: updatedPlayers,
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

    // --- STATE BANKRUPTCY CHECK (New) ---
    if (newEstadoMoney < 0) {
        newState.gov = 'anarchy';
        newState.currentGovConfig = GOV_CONFIGS['anarchy'];
        newState.govTurnsLeft = 7;
        newEstadoMoney = 0;
        govLogs.push("💥 ¡QUIEBRA DEL ESTADO! Las arcas están en negativo. Cae el Gobierno y reina la ANARQUÍA.");
    }

    return { 
        ...newState, 
        players: updatedPlayers,
        estadoMoney: newEstadoMoney, 
        tiles: updatedTiles, 
        housesAvail: newBankHouses, 
        hotelsAvail: newBankHotels, 
        logs: [...(newState.logs || []), ...govLogs] 
    };
};
