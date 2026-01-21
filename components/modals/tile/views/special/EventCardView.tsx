
import React from 'react';
import { TileData } from '../../../../../types';

interface Props {
    t: TileData;
    close: () => void;
}

export const EventCardView: React.FC<Props> = ({ t, close }) => {
    const isChance = t.name === 'Suerte';
    const cardColor = isChance ? 'bg-orange-500' : 'bg-blue-600';
    const cardBorder = isChance ? 'border-orange-300' : 'border-blue-300';
    const icon = isChance ? '?' : '📦';
    const title = isChance ? 'SUERTE' : 'COMUNIDAD';
    return (
        <div className={`w-64 h-96 ${cardColor} rounded-2xl shadow-2xl border-4 ${cardBorder} relative flex flex-col items-center justify-center text-center p-6 animate-in flip-in-y duration-700`} onClick={e => e.stopPropagation()} style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.1) 100%)' }}>
            <div className="border-2 border-white/30 rounded-xl w-full h-full flex flex-col items-center justify-center p-4">
                <div className="text-8xl text-white mb-4 drop-shadow-md">{icon}</div>
                <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-sm">{title}</h2>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wide">Toma una carta...</p>
            </div>
            <button onClick={close} className="absolute bottom-[-50px] bg-white text-black font-bold px-6 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors">Cerrar</button>
        </div>
    );
};
