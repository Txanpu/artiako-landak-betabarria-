
import React from 'react';
import { Card } from '../../../types';

export const CardView: React.FC<{ card: Card, index: number }> = ({ card, index }) => {
    if (card.isHidden) {
        return (
            <div 
                className="w-24 h-36 bg-blue-900 rounded-xl border-[3px] border-white/80 shadow-2xl flex items-center justify-center relative transition-all duration-300"
                style={{ 
                    backgroundImage: 'repeating-linear-gradient(45deg, #1e3a8a 25%, #172554 25%, #172554 50%, #1e3a8a 50%, #1e3a8a 75%, #172554 75%, #172554 100%)',
                    backgroundSize: '16px 16px',
                    zIndex: index
                }}
            >
                <div className="w-16 h-28 border-2 border-white/20 rounded-lg"></div>
            </div>
        );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
        <div 
            className="w-24 h-36 bg-white rounded-xl shadow-2xl flex flex-col justify-between p-2 relative transition-all duration-300 animate-in slide-in-from-right-10 fade-in cursor-default border border-gray-300"
            style={{ zIndex: index, color: isRed ? '#dc2626' : 'black' }}
        >
            <div className="text-2xl font-bold leading-none">{card.rank}<br/><span className="text-xl">{card.suit}</span></div>
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 select-none">{card.suit}</div>
            <div className="text-2xl font-bold leading-none self-end rotate-180">{card.rank}<br/><span className="text-xl">{card.suit}</span></div>
        </div>
    );
};

export const Chip = ({ val, onClick }: { val: number, onClick?: () => void }) => {
    let colorClass = '';
    let borderClass = '';
    
    if (val < 50) { colorClass = 'bg-white text-black'; borderClass = 'border-gray-300 border-dashed'; }
    else if (val < 100) { colorClass = 'bg-red-600 text-white'; borderClass = 'border-red-400 border-dashed'; }
    else if (val < 500) { colorClass = 'bg-blue-600 text-white'; borderClass = 'border-blue-400 border-dashed'; }
    else { colorClass = 'bg-black text-yellow-400'; borderClass = 'border-yellow-500 border-dashed'; }

    return (
        <div 
            onClick={onClick}
            className={`
                w-8 h-8 rounded-full border-4 shadow-md flex items-center justify-center text-[10px] font-black z-10 select-none
                ${colorClass} ${borderClass} relative
            `}
        >
            <div className="absolute inset-0 rounded-full border border-black/20"></div>
            {val >= 1000 ? '1k' : val}
        </div>
    );
};
