
import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';
import { GRID_SIZE, getTileConfig } from '../utils/boardLayout';
import { Tile } from './Tile';

interface BoardProps {
  state: GameState;
  onTileClick: (id: number) => void;
  focusId?: number;
}

export const Board: React.FC<BoardProps> = ({ state, onTileClick, focusId }) => {
  const tiles = state.tiles;
  const tileRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const isZoomedOut = state.viewFullBoard;

  useEffect(() => {
    // Only auto-scroll if NOT zoomed out
    if (!isZoomedOut && focusId !== undefined && tileRefs.current[focusId]) {
      tileRefs.current[focusId]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [focusId, isZoomedOut]);

  // LOGO POSITION FOR GRID 46 (Adjusted for gap)
  const logoStart = 20; 
  const logoSpan = 7;

  const currentPlayerId = state.players[state.currentPlayerIndex]?.id;

  return (
    <div className={`
        ${isZoomedOut ? 'fixed inset-0 z-0 bg-[#121212] overflow-hidden' : 'w-full h-full bg-[#121212] overflow-auto scroll-smooth p-8 flex'}
    `}>
      <div 
        className={`
            bg-[#121212] shadow-[0_0_150px_rgba(0,0,0,0.9)] transition-all duration-500 ease-in-out
            ${isZoomedOut ? 'absolute top-1/2 left-1/2 origin-center' : 'relative m-auto'}
        `}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 38px)`, 
          gridTemplateRows: `repeat(${GRID_SIZE}, 38px)`, 
          gap: '0px', 
          padding: '2px',
          width: 'fit-content',
          transform: isZoomedOut ? 'translate(-50%, -50%) scale(0.35)' : 'none',
        }}
      >
        {/* Center Logo Area */}
        <div 
          style={{ gridColumn: `${logoStart} / span ${logoSpan}`, gridRow: `${logoStart} / span ${logoSpan}` }} 
          className="flex flex-col items-center justify-center relative overflow-visible z-0 rounded-full border-[4px] border-[#1e293b]/30 bg-[#0f172a]"
        >
          <div className="absolute inset-0 bg-blue-900/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="z-10 flex flex-col items-center pointer-events-none select-none transform rotate-[-45deg]">
            <h1 className="text-[3.5rem] font-black text-slate-700/60 tracking-[0.2em] uppercase leading-none text-center drop-shadow-2xl">ARTIA</h1>
            <div className="text-[0.6rem] font-bold text-slate-600 uppercase tracking-[0.8em] mt-2">MONOPOLY</div>
          </div>
        </div>

        {/* Render Tiles */}
        {tiles.map((tile) => {
          const config = getTileConfig(tile.id);
          const isValidMove = state.movementOptions.includes(tile.id);
          
          // Z-Index Logic: Diagonals higher than center logo, Entries highest
          let z = 10;
          if (config.isDiagonal) z = 20; 
          if (config.isDiagonalEntry) z = 30;
          if (isValidMove) z = 50;

          return (
            <div
              key={tile.id}
              ref={el => { if (el) tileRefs.current[tile.id] = el; }}
              style={{ gridColumn: config.gridColumn, gridRow: config.gridRow, zIndex: z }}
              className="h-full w-full relative group transition-all duration-300"
            >
              <Tile 
                tile={tile} 
                players={state.players} 
                onClick={() => onTileClick(tile.id)} 
                config={config} 
                heatVal={state.showHeatmap ? state.heatmap?.[tile.id] : undefined}
                isValidMove={isValidMove}
                govConfig={state.currentGovConfig}
                currentPlayerId={currentPlayerId}
                pendingMoves={state.pendingMoves}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
