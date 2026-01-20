
import React from 'react';
import { TileData } from '../../../types';
import { TileConfig } from '../../../utils/boardLayout';

interface Props {
    tile: TileData;
    config: TileConfig;
    ownerColor: string | null;
    isMortgaged?: boolean;
    textRot: string;
}

export const TransportRenderer: React.FC<Props> = ({ tile, config, ownerColor, isMortgaged, textRot }) => {
    let icon = '🚇';
    let bgColor = 'bg-slate-800';
    let pattern = '';
    
    if (tile.subtype === 'air') { icon = '✈️'; bgColor = 'bg-sky-700'; }
    if (tile.subtype === 'bus') { icon = '🚌'; bgColor = 'bg-emerald-800'; }
    if (tile.subtype === 'ferry') { icon = '⛴️'; bgColor = 'bg-blue-800'; }
    if (tile.subtype === 'rail') { icon = '🚇'; bgColor = 'bg-indigo-900'; pattern = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.2) 5px, rgba(0,0,0,0.2) 10px)'; }

    return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden border-2 border-slate-600 ${bgColor} ${config.isDiagonal ? '' : textRot}`}>
            {pattern && <div className="absolute inset-0 z-0" style={{background: pattern}}></div>}
            
            {/* Dedicated Transport Header */}
            <div className="z-10 text-[8px] font-black text-white/70 uppercase tracking-widest mb-1 bg-black/30 px-2 rounded-full">
                {tile.subtype === 'air' ? 'AEROPUERTO' : 'TRANSPORTE'}
            </div>
            
            {/* Icon */}
            <div className="z-10 text-4xl drop-shadow-md transform transition-transform group-hover:scale-110">{icon}</div>
            
            {/* Name */}
            <div className="z-10 text-[9px] font-bold text-white text-center leading-tight px-1 mt-1 drop-shadow-sm">
                {tile.name}
            </div>

            {/* Price */}
            <div className="z-10 bg-black/60 text-white text-[8px] font-mono px-1 rounded mt-1">
                ${tile.price}
            </div>

            {/* Owner Indicator (Dot) */}
            {ownerColor && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm z-20" style={{backgroundColor: ownerColor}}></div>
            )}
            
            {isMortgaged && <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 text-red-500 font-black text-xs uppercase -rotate-12 border-2 border-red-500 rounded m-2">HIPOTECADO</div>}
        </div>
    );
};
