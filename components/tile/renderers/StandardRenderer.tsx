
import React from 'react';
import { TileData, TileType, GovConfig } from '../../../types';
import { TileConfig } from '../../../utils/boardLayout';
import { COLORS } from '../../../constants';

interface Props {
    tile: TileData;
    config: TileConfig;
    ownerColor: string | null;
    isMortgaged?: boolean;
    govConfig?: GovConfig;
    textRot: string;
    flexClass: string;
}

export const StandardRenderer: React.FC<Props> = ({ tile, config, ownerColor, isMortgaged, govConfig, textRot, flexClass }) => {
    const isCorner = [TileType.START, TileType.JAIL, TileType.GOTOJAIL, TileType.PARK].includes(tile.type);
    
    // Tax Calculations
    let taxDisplay = '';
    if (tile.type === TileType.TAX && govConfig) {
        const rate = govConfig.tax;
        if (rate <= 0) taxDisplay = '0%';
        else taxDisplay = `${Math.round(rate * 100)}%`;
    }

    const isFiore = tile.subtype === 'fiore';
    
    // FIORE SPECIFIC STYLES
    const fioreBg = isFiore ? 'bg-slate-900' : '';
    const fioreContainerStyle = isFiore ? {
        backgroundImage: 'radial-gradient(circle at center, #4a044e 0%, #0f172a 100%)',
        boxShadow: 'inset 0 0 20px rgba(192, 38, 211, 0.2)'
    } : {};

    const barColor = tile.color ? COLORS[tile.color as keyof typeof COLORS] : '#334155';

    // === COLOR DISTINCTION LOGIC ===
    let customBarStyle = {};
    
    if (!isFiore && tile.type === TileType.PROP && !isCorner) {
        if (tile.color === 'teal') { 
            customBarStyle = { background: `linear-gradient(135deg, ${COLORS.teal} 50%, #0f172a 50%)` };
        } else if (tile.color === 'sky') {
            customBarStyle = { background: `linear-gradient(135deg, ${COLORS.sky} 50%, #e0f2fe 50%)` };
        } else if (tile.color === 'turquoise') {
            customBarStyle = { background: `linear-gradient(135deg, ${COLORS.turquoise} 50%, #1e3a8a 50%)` };
        } else if (tile.color === 'indigo') {
            customBarStyle = { background: `linear-gradient(135deg, ${COLORS.indigo} 50%, #312e81 50%)` };
        } else if (tile.color === 'coral') {
            customBarStyle = { background: `linear-gradient(135deg, ${COLORS.coral} 50%, #fff7ed 50%)` };
        } else if (tile.color === 'gold') {
            customBarStyle = { background: `linear-gradient(135deg, ${COLORS.gold} 50%, #facc15 50%)` };
        } else {
            customBarStyle = { backgroundColor: barColor };
        }
    }

    // Fiore Custom Bar Gradient
    if (isFiore) {
        customBarStyle = { 
            background: 'linear-gradient(90deg, #701a75 0%, #d946ef 50%, #701a75 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 3s ease infinite'
        };
    }

    let barClass = 'h-[25%] w-full border-b border-white/10';
    let buildingsLayout = 'flex-row gap-0.5'; // Default horizontal layout for buildings

    if (!config.isDiagonal) {
        if (config.rotation === 90) {
            barClass = 'h-full w-[25%] border-l border-white/10';
            buildingsLayout = 'flex-col gap-0.5';
        } else if (config.rotation === 180) {
            barClass = 'h-[25%] w-full border-t border-white/10';
            buildingsLayout = 'flex-row gap-0.5';
        } else if (config.rotation === -90) {
            barClass = 'h-full w-[25%] border-r border-white/10';
            buildingsLayout = 'flex-col gap-0.5';
        }
    }

    return (
        <>
            {/* Color Bar */}
            {tile.type === TileType.PROP && !isCorner && (
                <div className={`${barClass} relative overflow-hidden z-10`} style={customBarStyle}>
                    {isMortgaged && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-bold text-white uppercase">💸</div>}
                    
                    {/* BUILDINGS (Houses/Hotels) RENDER IN BAR */}
                    {!isMortgaged && !isFiore && (
                        <div className={`absolute inset-0 flex items-center justify-center ${buildingsLayout}`}>
                            {tile.hotel ? (
                                <span className="text-sm filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] scale-125">🏨</span>
                            ) : (
                                Array.from({ length: tile.houses || 0 }).map((_, i) => (
                                    <span key={i} className="text-[10px] filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">🏠</span>
                                ))
                            )}
                        </div>
                    )}

                    {isFiore && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
                            <span className="text-[6px] text-fuchsia-200 tracking-widest uppercase leading-none">NIGHT</span>
                            <span className="text-[9px] font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] tracking-wide leading-none">CLUB</span>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex ${flexClass === 'flex-row' || flexClass === 'flex-row-reverse' ? 'flex-row items-center' : 'flex-col'} justify-between p-1 text-center overflow-hidden relative z-10 ${fioreBg}`} style={fioreContainerStyle}>
                
                {/* ID Tag */}
                <span className={`absolute text-[9px] text-gray-500 font-mono font-bold z-10 ${flexClass.includes('row') ? 'bottom-0.5 right-1' : 'top-0.5 right-0.5'}`}>#{tile.id}</span>

                {/* Name */}
                <div className={`flex-1 flex items-center justify-center w-full px-1 ${config.isDiagonal ? '' : textRot}`}>
                    <span 
                        className={`leading-tight font-bold ${isCorner ? 'text-xs uppercase tracking-wider text-gray-200' : 'text-[10px] line-clamp-2'} 
                        ${isFiore ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-fuchsia-200 to-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] font-black tracking-wider uppercase' : 'text-gray-200'}`} 
                        style={{ textShadow: isFiore ? '0 0 10px #d946ef' : '0 1px 2px black' }}
                    >
                        {tile.name}
                    </span>
                </div>

                {/* Price */}
                {tile.type === TileType.PROP && (
                    <div className={`flex justify-between items-end text-[9px] text-gray-300 font-mono ${config.isDiagonal ? '' : textRot} ${flexClass.includes('row') ? 'flex-col h-full py-2' : 'w-full px-0.5'}`}>
                        <span className={`font-bold ${isFiore ? 'text-fuchsia-300' : 'text-emerald-400'}`}>${tile.price}</span>
                        {tile.owner !== null && tile.owner !== undefined && <span className="text-gray-400">R${tile.rent || tile.baseRent}</span>}
                    </div>
                )}

                {/* Generic Icons Background */}
                <div className={`absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none ${config.isDiagonal ? '' : textRot}`}>
                    {tile.type === TileType.START && <span className="text-5xl">🚩</span>}
                    {tile.type === TileType.TAX && <span className="text-4xl">💸</span>}
                    {isFiore && <span className="text-5xl opacity-40 text-fuchsia-500 filter blur-[1px]">🍸</span>}
                </div>

                {/* Tax Overlay */}
                {tile.type === TileType.TAX && taxDisplay && (
                    <div className={`absolute inset-0 flex items-center justify-center z-20 ${config.isDiagonal ? '' : textRot}`}>
                        <div className="bg-red-600/90 text-white text-[10px] font-black px-1 rounded shadow-lg border border-red-400">
                            TAX {taxDisplay}
                        </div>
                    </div>
                )}

                {/* Workers (Fiore Only) */}
                {isFiore && (tile.workersList?.length || tile.workers || 0) > 0 && (
                    <div className={`absolute w-full flex justify-center gap-0.5 z-20 ${flexClass.includes('row') ? 'h-full flex-col left-0 items-center' : 'bottom-1 left-0'}`}>
                        <div className="flex bg-black/80 rounded-full px-1.5 py-0.5 border border-fuchsia-500/50 shadow-[0_0_5px_#d946ef]">
                            {Array.from({ length: Math.min(3, tile.workersList?.length || tile.workers || 0) }).map((_, i) => (
                                <span key={i} className="text-[8px] animate-pulse" style={{animationDelay: `${i*0.2}s`}}>💃</span>
                            ))}
                            {(tile.workersList?.length || tile.workers || 0) > 3 && <span className="text-[8px] text-fuchsia-300 font-bold ml-0.5">+</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Owner Strip Indicator */}
            {ownerColor && (
                <div 
                    className={`${flexClass.includes('row') ? 'h-full w-[6px] border-l' : 'w-full h-[6px] border-t'} border-black/30 relative z-20 shadow-inner`} 
                    style={{ backgroundColor: ownerColor }}
                >
                    {tile.owner === 'E' && (
                        <div className="absolute inset-0 flex items-center justify-center text-[5px] text-black font-black opacity-50">E</div>
                    )}
                </div>
            )}
        </>
    );
};
