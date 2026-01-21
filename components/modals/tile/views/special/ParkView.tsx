
import React from 'react';

interface Props {
    close: () => void;
}

export const ParkView: React.FC<Props> = ({ close }) => (
    <div className="bg-gradient-to-b from-emerald-800 to-slate-900 text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-emerald-500 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center">
            <div className="text-6xl mb-4">🌳</div>
            <h2 className="text-3xl font-black text-emerald-300 mb-2">PARKIE</h2>
            <div className="text-[10px] bg-emerald-900/50 text-emerald-200 px-2 py-1 rounded inline-block mb-4 border border-emerald-700">ZONA DE INTERCAMBIO</div>
            
            <div className="bg-black/30 p-4 rounded-lg backdrop-blur-sm mb-6 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-400 text-sm mb-2 animate-pulse">⚡ EFECTO CAOS ⚡</h4>
                <p className="text-xs text-gray-200">
                    Al entrar en el Parkie, las identidades se mezclan en la oscuridad...
                    <br/><br/>
                    <span className="font-bold text-yellow-300">¡SE HAN REASIGNADO LOS ROLES DE TODOS LOS JUGADORES!</span>
                </p>
            </div>
            
            <button onClick={close} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-full font-bold shadow-lg">Entendido</button>
        </div>
    </div>
);
