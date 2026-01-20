
import { GameState, Player, TileData } from '../../../types';
import { checkOkupaOccupation, checkOkupaDestruction, checkFentanylAddiction, handleRoleAbilities } from '../../gameLogic';

export const applyRoleLandingEffects = (
    state: GameState, 
    player: Player, 
    tile: TileData, 
    currentTiles: TileData[]
): { updatedPlayer: Player, updatedTiles: TileData[], logs: string[] } => {
    
    let uPlayer = { ...player };
    const uTiles = [...currentTiles];
    const logs: string[] = [];
    const tileIdx = tile.id;

    // 1. Okupa Occupation check (Steal 'E' prop)
    const okupaCheck = checkOkupaOccupation(uPlayer, tile);
    if (okupaCheck.success) {
        const t = { ...uTiles[tileIdx], owner: uPlayer.id };
        uTiles[tileIdx] = t;
        uPlayer.props = [...uPlayer.props, t.id];
        logs.push(okupaCheck.msg || '');
    }

    // 2. Okupa Destruction check (Remove House)
    // Note: destruction check logic in gameLogic usually handles checking if owned by others
    const destroyCheck = checkOkupaDestruction(uPlayer, uTiles[tileIdx]); 
    if (destroyCheck.success) {
        const t = { ...uTiles[tileIdx] };
        t.houses = (t.houses || 0) - 1;
        uTiles[tileIdx] = t;
        // Material return to bank is handled in main state usually, but here we just update tile/logs
        logs.push(destroyCheck.msg || '');
    }

    // 3. Fentanyl Addiction check
    const fentCheck = checkFentanylAddiction(uPlayer, tile);
    if (fentCheck.addicted) {
        uPlayer.fentanylAddiction = true;
        logs.push(fentCheck.msg || '');
    }

    // 4. Generic Role Abilities Logs (FBI Intel, etc)
    const abilityLogs = handleRoleAbilities(state, uPlayer, uTiles[tileIdx]);
    logs.push(...abilityLogs);

    return { updatedPlayer: uPlayer, updatedTiles: uTiles, logs };
};
