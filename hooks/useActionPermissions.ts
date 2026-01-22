
import { GameState, Player, TileType } from '../types';
import { canAuction, canBuyDirectly } from '../utils/governmentRules';

export const useActionPermissions = (state: GameState, player: Player) => {
    const currentTile = state.tiles[player.pos];
    
    // 1. Basic Property Actions
    const isOwnerless = currentTile?.type === TileType.PROP && currentTile.owner === null;
    const mustPayRent = currentTile?.type === TileType.PROP && currentTile.owner !== null && currentTile.owner !== player.id && currentTile.owner !== 'E';
    
    const canBuy = isOwnerless && player.money >= (currentTile.price || 0) && canBuyDirectly(state.gov);
    const allowAuction = isOwnerless && canAuction(state.gov);
    const isBlocked = isOwnerless && state.gov === 'left';
    
    // 2. Roles
    const isHacker = player.role === 'hacker';
    const isFbi = player.role === 'fbi';

    // 3. Drugs Logic (Farlopa)
    const isNight = state.world.isNight;
    const isOzollo = currentTile?.name.includes('Ozollo');
    const isMarko = currentTile?.name.includes('Marko Pollo');
    const isFerry = currentTile?.subtype === 'ferry';
    
    const canBuyFarlopa = isNight && (isMarko || isFerry);
    const canGetFreeFarlopa = isNight && isOzollo;
    const hasStash = (player.farlopa || 0) > 0;
    const isHigh = (player.highTurns || 0) > 0;

    // 4. Gender Ability Logic
    const abilityConfig = {
        male: { name: 'Mansplaining', icon: '📢', desc: 'Obliga a rival a perder turno' },
        female: { name: 'Cancelación', icon: '🚫', desc: 'Bloquea renta rival 2 turnos' },
        helicoptero: { name: 'Napalm', icon: '💣', desc: 'Destruye edificio aleatorio (-$300)' },
        marcianito: { name: 'Abducción', icon: '🛸', desc: 'Intercambia posición con rival' }
    }[player.gender];
    
    const abilityCooldown = player.genderAbilityCooldown;
    const canUseAbility = abilityCooldown === 0;

    // 5. Global Blocks
    const isElectionOpen = state.election && state.election.isOpen;

    return {
        currentTile,
        actions: {
            canBuy,
            allowAuction,
            mustPayRent,
            isBlocked,
            canBuyFarlopa,
            canGetFreeFarlopa
        },
        roles: {
            isHacker,
            isFbi
        },
        drugState: {
            hasStash,
            isHigh
        },
        ability: {
            config: abilityConfig,
            canUse: canUseAbility,
            cooldown: abilityCooldown
        },
        global: {
            isElectionOpen
        }
    };
};
