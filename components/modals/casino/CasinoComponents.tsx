
import React from 'react';
import { Card } from '../../../types';

export const CardView: React.FC<{ card: Card, index: number }> = ({ card, index }) => {
    if (card.isHidden) {
        return (
            <div 
                className="w-20 h-28 md:w-24 md:h-36 bg-blue-800 rounded-lg border-2 border-white shadow-xl flex items-center justify-center relative -ml-8 first:ml-0 transition-all duration-300 transform"
                style={{ 
                    backgroundImage: 'repeating-linear-gradient(45deg, #1e3a8a 25%, #172554 25%, #172554 50%, #1e3a8a 50%, #1e3a8a 75%, #172554 75%, #172554 100%)',
                    backgroundSize: '10px 10px',
                    zIndex: index
                }}
            >
                <div className="w-16 h-24 border-2 border-white/20 rounded"></div>
            </div>
        );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
        <div 
            className="w-20 h-28 md:w-24 md:h-36 bg-white rounded-lg shadow-xl flex flex-col justify-between p-2 relative -ml-8 first:ml-0 transition-all duration-300 hover:-translate-y-4 animate-in slide-in-from-right-10 fade-in cursor-default"
            style={{ zIndex: index, color: isRed ? '#dc2626' : 'black' }}
        >
            <div className="text-lg md:text-xl font-bold leading-none">{card.rank}<br/><span className="text-lg">{card.suit}</span></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl opacity-20 select-none">{card.suit}</div>
            <div className="text-lg md:text-xl font-bold leading-none self-end rotate-180">{card.rank}<br/><span className="text-lg">{card.suit}</span></div>
        </div>
    );
};

export const Chip = ({ val }: { val: number }) => (
    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow flex items-center justify-center text-[8px] z-10 font-bold
        ${val < 50 ? 'bg-white text-black' : val < 100 ? 'bg-blue-600 text-white' : val < 500 ? 'bg-black text-white' : 'bg-purple-600 text-white'}
    `}>
        {val >= 1000 ? '1k' : val}
    </div>
);
