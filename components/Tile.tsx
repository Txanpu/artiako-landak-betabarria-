
import React from 'react';
import { TileData, Player, TileType, GovConfig } from '../types';
import { PLAYER_EMOJIS } from '../constants';
import { TileConfig } from '../utils/boardLayout';
import { TileContent } from './tile/TileContent';

interface TileProps {
  tile: TileData;
  players: Player[];
  onClick: () => void;
  config: TileConfig;
  heatVal?: number;
  isValidMove?: boolean;
  govConfig?: GovConfig;
}

export const Tile: React.FC<TileProps> = ({ tile, players, onClick, config, heatVal, isValidMove, govConfig }) => {
  const getBorderColor = (tile: TileData) => {
    if (tile.owner === 'E') return '3px solid #ffd700';
    if (typeof tile.owner === 'number') {
      const owner = players.find(p => p.id === tile.owner);
      return owner ? `3px solid ${owner.color}` : '1px solid #334155';
    }
    return '1px solid #1e293b';
  };

  const isMortgaged = tile.mortgaged;
  const playersHere = players.filter(p => p.pos === tile.id && p.alive);

  // Background Styles for Special Tiles (moved from old code to here to keep container logic)
  let bgStyle = 'bg-[#0f172a]';
  if (tile.type === TileType.GOTOJAIL) bgStyle = 'bg-slate-900 overflow-hidden';
  else if (tile.type === TileType.PARK) bgStyle = 'bg-gradient-to-br from-emerald-900 to-teal-900';
  else if (tile.name === 'Suerte') bgStyle = 'bg-gradient-to-br from-orange-700 to-orange-900';
  else if (tile.name.includes('Comunidad')) bgStyle = 'bg-gradient-to-br from-blue-700 to-indigo-900';

  // Orientation Logic needed for flex layout of the container
  let flexClass = 'flex-col';
  if (!config.isDiagonal) {
    if (config.rotation === 90) flexClass = 'flex-row-reverse';
    else if (config.rotation === 180) flexClass = 'flex-col-reverse';
    else if (config.rotation === -90) flexClass = 'flex-row';
  }

  // Visual effects
  const heatOpacity = heatVal ? Math.min(0.85, 0.3 + (heatVal * 0.15)) : 0;
  const heatStyle = heatVal ? { backgroundColor: `rgba(255, 60, 0, ${heatOpacity})` } : {};
  const moveStyle = isValidMove ? { boxShadow: '0 0 15px 5px rgba(255, 255, 0, 0.8)', borderColor: '#fbbf24', zIndex: 100 } : {};
  const transformStyle = config.isDiagonal ? `rotate(${config.rotation}deg) scale(0.75)` : 'none';
  const entryStyle = config.isDiagonalEntry ? { zIndex: 20 } : {};

  return (
    <div
      onClick={onClick}
      className={`relative flex ${flexClass} h-full w-full ${bgStyle} hover:z-50 hover:scale-110 transition-transform duration-200 cursor-pointer shadow-lg select-none ${isMortgaged ? 'opacity-60 grayscale' : ''} ${isValidMove ? 'animate-pulse' : ''}`}
      style={{ 
        border: isValidMove ? '4px solid yellow' : getBorderColor(tile), 
        borderRadius: config.isDiagonal ? '6px' : '2px', 
        transform: transformStyle,
        ...entryStyle,
        ...moveStyle
      }}
    >
      {heatVal && <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 mix-blend-screen" style={heatStyle} />}

      <TileContent 
        tile={tile} 
        config={config} 
        isMortgaged={isMortgaged} 
        govConfig={govConfig} 
        players={players} 
      />

      {/* Players Overlay */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="flex flex-wrap justify-center gap-1 p-1">
            {playersHere.map(p => (
              <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm relative animate-bounce bg-slate-800" style={{ borderColor: p.color, animationDuration: `${1 + p.id * 0.2}s` }} title={p.name}>
                {PLAYER_EMOJIS[p.id % PLAYER_EMOJIS.length]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
