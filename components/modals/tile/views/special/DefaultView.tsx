
import React from 'react';
import { TileData } from '../../../../../types';
import { FUNNY } from '../../../../../constants';

interface Props {
    t: TileData;
    close: () => void;
}

export const DefaultView: React.FC<Props> = ({ t, close }) => (
    <div className="bg-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="py-4 text-center p-6">
            <div className="text-gray-500 italic mb-4">Casilla Especial<br/><span className="text-white font-bold not-italic mt-2 block">{t.type.toUpperCase()}</span></div>
            <div className="bg-slate-800 p-4 rounded text-yellow-500 font-medium border border-slate-700 shadow-inner">"{FUNNY[t.type] || FUNNY.default}"</div>
            <button onClick={close} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold border border-slate-600 transition-colors">Cerrar</button>
        </div>
    </div>
);
