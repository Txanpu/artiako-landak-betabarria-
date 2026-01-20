
import React from 'react';
import { TileData, TileType, GovConfig, Player } from '../../types';
import { TileConfig } from '../../utils/boardLayout';
import { TransportRenderer } from './renderers/TransportRenderer';
import { UtilityRenderer } from './renderers/UtilityRenderer';
import { SpecialRenderer } from './renderers/SpecialRenderer';
import { StandardRenderer } from './renderers/StandardRenderer';

interface TileContentProps {
    tile: TileData;
    config: TileConfig;
    isMortgaged?: boolean;
    govConfig?: GovConfig;
    players: Player[];
}

export const TileContent: React.FC<TileContentProps> = ({ tile, config, isMortgaged, govConfig, players }) => {
    // Orientation helpers
    let flexClass = 'flex-col';
    let textRot = 'rotate-0';

    if (!config.isDiagonal) {
        if (config.rotation === 90) { // Left Side
           flexClass = 'flex-row-reverse';
           textRot = 'rotate-90';
        } else if (config.rotation === 180) { // Top Side
           flexClass = 'flex-col-reverse';
           textRot = 'rotate-180';
        } else if (config.rotation === -90) { // Right Side
           flexClass = 'flex-row';
           textRot = '-rotate-90';
        }
    }

    // Owner Strip Logic (Applied differently depending on tile type)
    let ownerColor: string | null = null;
    if (tile.owner !== null && tile.owner !== undefined) {
        if (tile.owner === 'E') {
            ownerColor = '#fbbf24'; // State Gold
        } else if (typeof tile.owner === 'number') {
            const owner = players.find(p => p.id === tile.owner);
            if (owner) ownerColor = owner.color;
        }
    }

    // --- 1. SPECIAL RENDER: CASINOS (Override Prop type) ---
    if (['casino_bj', 'casino_roulette'].includes(tile.subtype || '')) {
        return <SpecialRenderer tile={tile} config={config} textRot={textRot} />;
    }

    // --- 2. SPECIAL RENDER: TRANSPORTS ---
    if (['rail', 'bus', 'ferry', 'air'].includes(tile.subtype || '')) {
        return <TransportRenderer tile={tile} config={config} ownerColor={ownerColor} isMortgaged={isMortgaged} textRot={textRot} />;
    }

    // --- 3. SPECIAL RENDER: UTILITIES ---
    if (tile.subtype === 'utility') {
        return <UtilityRenderer tile={tile} config={config} ownerColor={ownerColor} isMortgaged={isMortgaged} textRot={textRot} />;
    }

    // --- 4. SPECIAL TILE OVERRIDES (Jail, Bank, etc) ---
    // If SpecialRenderer returns null, it falls through to Standard
    if (
        [TileType.GOTOJAIL, TileType.JAIL, TileType.BANK, TileType.SLOTS, TileType.PARK, TileType.QUIZ].includes(tile.type) || 
        tile.name === 'Suerte' || 
        tile.name.includes('Comunidad') ||
        tile.subtype === 'greyhound' // Added greyhound check here
    ) {
        const special = <SpecialRenderer tile={tile} config={config} textRot={textRot} />;
        if (special) return special;
    }

    // --- 5. STANDARD RENDER ---
    return <StandardRenderer tile={tile} config={config} ownerColor={ownerColor} isMortgaged={isMortgaged} govConfig={govConfig} textRot={textRot} flexClass={flexClass} />;
};
