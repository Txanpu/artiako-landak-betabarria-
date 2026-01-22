
import React from 'react';
import { TileData } from '../../../types';
import { TileConfig } from '../../../utils/boardLayout';

interface Props {
    tile: TileData;
    config: TileConfig;
    ownerColor: string | null;
    isMortgaged?: boolean;
    textRot: string;
    flexClass: string;
}

export const TransportRenderer: React.FC<Props> = ({ tile, config, ownerColor, isMortgaged, textRot, flexClass }) => {
    // Specific Styles per Type
    const isAir = tile.subtype === 'air';
    const isRail = tile.subtype === 'rail';
    const isBus = tile.subtype === 'bus';
    const isFerry = tile.subtype === 'ferry';

    let bgClass = '';
    let borderClass = '';
    let icon = '';
    let label = '';
    
    // AIRPORT DESIGN (Sky Theme)
    if (isAir) {
        bgClass = 'bg-sky-500';
        borderClass = 'border-white';
        icon = '✈️';
        label = 'AEROPUERTO';
    } 
    // METRO DESIGN (Urban Dark Theme)
    else if (isRail) {
        bgClass = 'bg-slate-900';
        borderClass = 'border-white/20';
        icon = '🚇';
        label = 'METRO';
    }
    // BUS DESIGN (Road Theme)
    else if (isBus) {
        bgClass = 'bg-emerald-700';
        borderClass = 'border-emerald-900';
        icon = '🚌';
        label = 'BUS';
    }
    // FERRY DESIGN (Sea Theme)
    else {
        bgClass = 'bg-blue-700';
        borderClass = 'border-blue-900';
        icon = '⛴️';
        label = 'FERRY';
    }

    // Determine layout orientation for background elements
    // If flexClass is 'flex-col' or 'flex-col-reverse', the tile is VERTICAL in the grid (Tall)
    // If 'flex-row' or 'flex-row-reverse', it is HORIZONTAL (Wide)
    const isVertical = flexClass.includes('col');

    return (
        <div className={`absolute inset-0 flex ${flexClass} items-center justify-between p-1 overflow-hidden border-2 ${borderClass} ${bgClass} shadow-inner`}>
            
            {/* --- BACKGROUND LAYERS --- */}
            
            {/* METRO: Tunnel / Tracks */}
            {isRail && (
                <>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.5)_10px,rgba(0,0,0,0.5)_20px)] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/80"></div>
                    {/* Glowing Red Line */}
                    <div className={`absolute ${isVertical ? 'h-full w-1' : 'w-full h-1'} bg-red-600 blur-[2px] opacity-60`}></div>
                </>
            )}
            
            {/* AIRPORT: Clouds / Runway */}
            {isAir && (
                <>
                    {/* Cloud Pattern */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,white_0%,transparent_70%)] bg-[length:150%_150%]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-700/50 to-transparent"></div>
                    {/* Runway Markings */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isVertical ? 'h-[80%] w-6 border-x-2' : 'w-[80%] h-6 border-y-2'} border-dashed border-white/30 flex items-center justify-center`}>
                        <div className={`bg-white/20 ${isVertical ? 'w-1 h-full' : 'h-1 w-full'}`}></div>
                    </div>
                </>
            )}

            {/* BUS: Asphalt */}
            {isBus && (
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
            )}

            {/* FERRY: Waves */}
            {isFerry && (
                <div className="absolute bottom-0 w-full h-full bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.2)_0%,transparent_60%)] animate-pulse"></div>
            )}

            {/* --- CONTENT LAYER (Z-10) --- */}

            {/* 1. LABEL BADGE */}
            <div className={`z-10 relative ${config.isDiagonal ? '' : textRot} mb-0.5`}>
                <div className={`
                    text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-lg border text-center whitespace-nowrap
                    ${isAir ? 'bg-sky-800 border-sky-400 text-white' : ''}
                    ${isRail ? 'bg-red-700 border-red-500 text-white shadow-red-900/50' : ''}
                    ${isBus ? 'bg-yellow-500 border-yellow-300 text-black' : ''}
                    ${isFerry ? 'bg-white border-blue-300 text-blue-800' : ''}
                `}>
                    {label}
                </div>
            </div>
            
            {/* 2. MAIN ICON */}
            <div className={`z-10 text-4xl filter drop-shadow-xl transform transition-transform group-hover:scale-110 ${config.isDiagonal ? '' : textRot} ${isAir ? 'text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]' : ''}`}>
                {icon}
            </div>
            
            {/* 3. INFO FOOTER */}
            <div className={`flex flex-col items-center z-10 ${config.isDiagonal ? '' : textRot} bg-black/40 px-1 py-0.5 rounded backdrop-blur-[1px]`}>
                {/* Name */}
                <div className={`text-[8px] font-black text-center leading-tight uppercase tracking-tight mb-0.5 ${isAir || isRail ? 'text-white' : 'text-slate-100'} drop-shadow-md whitespace-nowrap`}>
                    {tile.name}
                </div>

                {/* Price Tag */}
                <div className={`
                    text-[8px] font-mono font-bold px-1 rounded-sm shadow-sm border
                    ${isAir ? 'bg-sky-900 text-sky-200 border-sky-500' : ''}
                    ${isRail ? 'bg-black text-yellow-400 border-yellow-600' : ''}
                    ${isBus ? 'bg-black/80 text-white border-white/20' : ''}
                    ${isFerry ? 'bg-blue-900 text-white border-blue-500' : ''}
                `}>
                    ${tile.price}
                </div>
            </div>

            {/* --- OVERLAYS --- */}

            {/* Owner Indicator */}
            {ownerColor && (
                <div className="absolute top-1 right-1 z-20">
                    <div className="w-3 h-3 rounded-full border-2 border-white shadow-lg" style={{backgroundColor: ownerColor}}></div>
                </div>
            )}
            
            {/* Mortgaged */}
            {isMortgaged && (
                <div className={`absolute inset-0 flex items-center justify-center bg-black/80 z-30 backdrop-blur-[2px]`}>
                    <div className={`text-red-500 font-black text-[10px] uppercase -rotate-12 border-2 border-red-500 rounded px-2 py-1 bg-black`}>
                        HIPOTECA
                    </div>
                </div>
            )}
        </div>
    );
};
