
import React from 'react';
import { TileData, TileType } from '../../../types';
import { TileConfig } from '../../../utils/boardLayout';

interface Props {
    tile: TileData;
    config: TileConfig;
    textRot: string;
}

export const SpecialRenderer: React.FC<Props> = ({ tile, config, textRot }) => {
    
    if (tile.type === TileType.QUIZ) {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden border-2 border-yellow-400 bg-slate-900 ${config.isDiagonal ? '' : textRot} shadow-[0_0_10px_rgba(234,179,8,0.3)]`}>
                {/* TV Studio Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-black"></div>
                
                {/* CRT Scanlines Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-60"></div>
                
                {/* "LIVE" Badge */}
                <div className="absolute top-1 right-1 bg-red-600 text-white text-[5px] font-black px-1 rounded animate-pulse shadow-[0_0_5px_red] z-20 flex items-center gap-0.5 border border-red-400">
                    <div className="w-1 h-1 bg-white rounded-full animate-ping"></div> LIVE
                </div>

                {/* Icon Group */}
                <div className="relative z-10 mb-1 group flex items-center justify-center">
                    <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transform group-hover:scale-110 transition-transform duration-300">⚽</div>
                    <div className="absolute -bottom-1 -right-1 text-lg rotate-12 filter drop-shadow-md">🎤</div>
                </div>
                
                {/* Logo Text */}
                <div className="z-10 text-center relative flex flex-col items-center">
                    <div className="text-[5px] text-black bg-yellow-400 px-1 font-black uppercase tracking-widest leading-none transform -skew-x-12 inline-block mb-0.5 border border-white shadow-sm">
                        MALDINI
                    </div>
                    <div className="text-[10px] font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-[2px_2px_0_#000] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 font-sans">
                        QUIZ
                    </div>
                </div>
                
                {/* News Ticker Bar */}
                <div className="absolute bottom-0 w-full h-2.5 bg-blue-900 border-t border-blue-500 flex items-center justify-center overflow-hidden z-10">
                    <div className="text-[4px] text-cyan-300 font-mono uppercase tracking-widest whitespace-nowrap animate-pulse">
                        >>> FÚTBOL INTERNACIONAL >>>
                    </div>
                </div>
            </div>
        );
    }

    // --- CASINO TILES ---
    if (tile.subtype === 'casino_bj' || tile.subtype === 'casino_roulette') {
        const isRoulette = tile.subtype === 'casino_roulette';
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden border-4 border-yellow-700 bg-green-900 ${config.isDiagonal ? '' : textRot}`}>
                {/* Felt Texture Pattern */}
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle, #22543d 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40"></div>
                
                <div className="z-10 text-[7px] font-black text-yellow-400 uppercase tracking-widest bg-black/60 px-2 rounded-full border border-yellow-600 mb-1 shadow-lg">
                    CASINO
                </div>
                
                <div className="z-10 text-3xl filter drop-shadow-lg transform hover:scale-110 transition-transform">
                    {isRoulette ? '🎡' : '♠️'}
                </div>
                
                <div className="z-10 text-[8px] font-black text-white text-center leading-tight mt-1 px-1 drop-shadow-md uppercase font-serif tracking-wide">
                    {isRoulette ? 'RULETA' : 'BLACKJACK'}
                </div>
                
                {/* Gold Trim Corner */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-500 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-500 rounded-bl-sm"></div>
            </div>
        );
    }

    if (tile.type === TileType.GOTOJAIL) {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.isDiagonal ? '' : textRot}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-transparent to-red-900/50 animate-pulse"></div>
                <div className="text-4xl z-10 drop-shadow-lg">👮‍♂️</div>
                <div className="text-[9px] font-black text-white uppercase tracking-wider bg-black/50 px-1 rounded mt-1 z-10 border border-blue-500/30">ARRESTO</div>
            </div>
        );
    }
    
    if (tile.type === TileType.JAIL) {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.isDiagonal ? '' : textRot}`}>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#000_10px,#000_12px)] opacity-30"></div>
                <div className="text-4xl z-10 drop-shadow-lg grayscale contrast-150">⛓️</div>
                <div className="text-[9px] font-bold text-orange-200 uppercase mt-1 z-10 bg-black/60 px-1 rounded backdrop-blur-[1px]">Cárcel</div>
            </div>
        );
    }

    if (tile.type === TileType.BANK) {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${config.isDiagonal ? '' : textRot}`}>
                <div className="absolute inset-0 bg-slate-900"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 to-black"></div>
                <div className="text-4xl z-10 text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">🏦</div>
                <div className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mt-1 z-10 border-b border-yellow-700">BANCA</div>
            </div>
        );
    }

    if (tile.type === TileType.SLOTS) {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${config.isDiagonal ? '' : textRot}`}>
                <div className="absolute inset-0 bg-purple-900"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-600/40 via-purple-900 to-black"></div>
                <div className="text-4xl z-10 animate-pulse drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">🎰</div>
                <div className="text-[8px] font-black text-fuchsia-300 uppercase tracking-widest mt-1 z-10 border-b border-fuchsia-500/50">SLOTS</div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-300"></div>
            </div>
        );
    }

    if (tile.subtype === 'greyhound') {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${config.isDiagonal ? '' : textRot} bg-[#3d2b1f]`}>
                {/* Dirt Track Texture */}
                <div className="absolute inset-0 opacity-40" 
                     style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/dirt-road.png")'}}></div>
                
                {/* Finish Line Checkers */}
                <div className="absolute top-0 right-0 w-3 h-full bg-[repeating-linear-gradient(45deg,#fff,#fff_5px,#000_5px,#000_10px)] opacity-50"></div>
                
                <div className="text-4xl z-10 drop-shadow-md transform -scale-x-100">🐕</div>
                
                <div className="text-[7px] font-black text-yellow-100 uppercase tracking-tighter mt-1 z-10 bg-yellow-900/80 px-2 py-0.5 rounded-full border border-yellow-500 shadow-sm whitespace-nowrap">
                    🏁 CANÓDROMO
                </div>
            </div>
        );
    }

    if (tile.type === TileType.PARK) {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.isDiagonal ? '' : textRot}`}>
                <div className="text-3xl z-10 opacity-90">🌳</div>
                <div className="text-[10px] font-bold text-emerald-100 mt-1 uppercase tracking-wide">Parkie</div>
            </div>
        );
    }
    
    if (tile.name === 'Suerte') {
        return (
            <div className={`absolute inset-0 flex items-center justify-center ${config.isDiagonal ? '' : textRot}`}>
                <div className="text-5xl font-serif text-orange-200/20 font-black absolute">?</div>
                <div className="text-orange-100 font-bold text-[10px] uppercase border-2 border-orange-300/50 px-1 py-0.5 rounded z-10">Suerte</div>
            </div>
        );
    }
    
    if (tile.name === 'Caja de Comunidad' || tile.name.includes('Comunidad')) {
        return (
            <div className={`absolute inset-0 flex items-center justify-center ${config.isDiagonal ? '' : textRot}`}>
                <div className="text-4xl absolute opacity-20">📦</div>
                <div className="text-center z-10">
                    <div className="text-[8px] text-blue-200 uppercase tracking-tighter leading-none mb-0.5">Caja de</div>
                    <div className="text-[9px] font-bold text-white uppercase border-b border-blue-400 leading-none">Comunidad</div>
                </div>
            </div>
        );
    }

    return null;
};
