
import { GameState } from '../../../types';

export const handleGenderAbility = (state: GameState): GameState => {
    const pIdx = state.currentPlayerIndex;
    const player = state.players[pIdx];
    
    // Validation
    if (player.genderAbilityCooldown > 0) {
        return { ...state, logs: [`⏳ Habilidad en enfriamiento (${player.genderAbilityCooldown} turnos).`, ...state.logs] };
    }

    let newPlayers = [...state.players];
    let newTiles = [...state.tiles];
    let logs = [...state.logs];
    let newMoney = state.estadoMoney;
    
    // Reset Cooldown (Base 10 turns)
    newPlayers[pIdx] = { ...player, genderAbilityCooldown: 10 };

    // 1. MALE: MANSPLAINING (Force Skip Turn)
    if (player.gender === 'male') {
        const rivals = newPlayers.filter(p => p.id !== player.id && p.alive);
        if (rivals.length > 0) {
            const victim = rivals[Math.floor(Math.random() * rivals.length)];
            const vIdx = newPlayers.findIndex(p => p.id === victim.id);
            newPlayers[vIdx] = { ...victim, skipTurns: (victim.skipTurns || 0) + 1 };
            logs.unshift(`📢 MANSPLAINING: ${player.name} explica la vida a ${victim.name}. ${victim.name} pierde 1 turno.`);
        }
    }

    // 2. FEMALE: CANCEL CULTURE (Block Rent) - 2 TURNS
    if (player.gender === 'female') {
        const rivalProps = newTiles.filter(t => t.type === 'prop' && t.owner !== null && t.owner !== player.id && t.owner !== 'E');
        if (rivalProps.length > 0) {
            const target = rivalProps[Math.floor(Math.random() * rivalProps.length)];
            newTiles[target.id] = { ...target, blockedRentTurns: 2 }; 
            logs.unshift(`🚫 CANCELACIÓN: ${player.name} funa a la propiedad ${target.name}. 2 turnos sin cobrar renta.`);
        } else {
            logs.unshift(`🚫 No hay propiedades rivales para cancelar.`);
        }
    }

    // 3. HELICOPTER: NAPALM (Destroy Building)
    if (player.gender === 'helicoptero') {
        const COST = 300;
        if (player.money >= COST) {
            const targets = newTiles.filter(t => t.type === 'prop' && t.owner !== null && t.owner !== player.id && t.owner !== 'E' && ((t.houses||0) > 0 || t.hotel));
            
            if (targets.length > 0) {
                newPlayers[pIdx].money -= COST; 
                newMoney += COST;
                
                const target = targets[Math.floor(Math.random() * targets.length)];
                let damageMsg = '';
                
                if (target.hotel) {
                    target.hotel = false;
                    target.houses = 4;
                    damageMsg = `El Hotel en ${target.name}`;
                } else {
                    target.houses = (target.houses || 0) - 1;
                    damageMsg = `Una casa en ${target.name}`;
                }
                
                newTiles[target.id] = target;
                logs.unshift(`🚁 NAPALM: ${player.name} bombardea ${target.name}. ${damageMsg} ha sido destruida.`);
            } else {
                logs.unshift(`🚁 No hay objetivos estratégicos (edificios) para bombardear.`);
            }
        } else {
            logs.unshift(`🚁 Necesitas $300 para combustible y munición.`);
            // Refund cooldown
            newPlayers[pIdx].genderAbilityCooldown = 0;
        }
    }

    // 4. MARCIANITO: ABDUCTION (Swap Position)
    if (player.gender === 'marcianito') {
        const rivals = newPlayers.filter(p => p.id !== player.id && p.alive);
        if (rivals.length > 0) {
            const victim = rivals[Math.floor(Math.random() * rivals.length)];
            const vIdx = newPlayers.findIndex(p => p.id === victim.id);
            
            const myPos = player.pos;
            const theirPos = victim.pos;
            
            newPlayers[pIdx].pos = theirPos;
            newPlayers[vIdx].pos = myPos;
            
            logs.unshift(`🛸 ABDUCCIÓN: ${player.name} intercambia posición con ${victim.name}.`);
        }
    }

    return {
        ...state,
        players: newPlayers,
        tiles: newTiles,
        logs,
        estadoMoney: newMoney
    };
};
