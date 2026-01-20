
import { GameState, Player, TileData } from '../../../types';
import { FIESTA_TILES } from '../../../constants';
import { getRandomWorker } from '../../../data/fioreData';

export const processSpecialLocations = (
    state: GameState, 
    tiles: TileData[], 
    player: Player, 
    tile: TileData
): { updatedTiles: TileData[], logs: string[], fiestaDest?: string } => {
    
    const uTiles = [...tiles];
    const logs: string[] = [];
    let fiestaDest: string | undefined;

    // --- SPECIAL RULE: KANALA BITCH -> FIORE RECRUITMENT ---
    if (tile.name === 'Kanala Bitch') {
        const fioreIdx = uTiles.findIndex(t => t.subtype === 'fiore');
        if (fioreIdx !== -1) {
            const fioreTile = { ...uTiles[fioreIdx] };
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
                    
                    uTiles[fioreIdx] = fioreTile;
                    logs.push(`💃 ¡Talento descubierto! Alguien ha caído en Kanala Bitch y ${newWorker.name} se une al Fiore de ${owner.name} GRATIS.`);
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
        logs.push(`🎉 FIESTA CLANDESTINA: ${outcome.txt}`);
        fiestaDest = outcome.dest;
    }

    return { updatedTiles: uTiles, logs, fiestaDest };
};
