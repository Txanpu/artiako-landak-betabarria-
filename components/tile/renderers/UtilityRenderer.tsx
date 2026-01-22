
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

export const UtilityRenderer: React.FC<Props> = ({ tile, config, ownerColor, isMortgaged, textRot, flexClass }) => {
    const isWater = tile.name.toLowerCase().includes('agua');
    const icon = isWater ? '💧' : '⚡';
    
    // For diagonals, we default to standard flex
    const layoutClass = config.isDiagonal ? 'flex-col' : flexClass;

    return (
        <div className={`absolute inset-0 flex ${layoutClass} items-center justify-center overflow-hidden bg-slate-400 border-2 border-slate-500`}>
            {/* Metallic Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500"></div>
            
            <div className={`z-10 flex ${layoutClass} items-center border-2 border-slate-600 p-1 rounded bg-slate-200/50 shadow-inner w-[90%] h-[90%] justify-between`}>
                <div className={`text-[7px] font-black text-slate-700 uppercase tracking-tighter ${config.isDiagonal ? '' : textRot}`}>SERVICIO</div>
                
                <div className={`text-3xl filter drop-shadow-sm ${config.isDiagonal ? '' : textRot}`}>{icon}</div>
                
                <div className={`text-[8px] font-bold text-slate-900 text-center leading-tight ${config.isDiagonal ? '' : textRot}`}>
                    {tile.name}
                </div>
                
                <div className={`font-mono text-[9px] text-slate-800 font-bold ${config.isDiagonal ? '' : textRot}`}>
                    ${tile.price}
                </div>
            </div>

            {/* Owner Indicator (Corner Triangle) */}
            {ownerColor && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-l-[12px] border-b-[12px] border-t-transparent border-r-transparent border-b-transparent border-l-transparent" 
                        style={{ borderTopColor: ownerColor, borderRightColor: ownerColor, transform: 'scale(1.5) translate(25%, -25%)' }}>
                </div>
            )}

            {isMortgaged && <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 text-red-500 font-black text-xs uppercase">HIPOTECADO</div>}
        </div>
    );
};
