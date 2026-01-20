
import React from 'react';
import { GameState } from '../../types';
import { GOV_CONFIGS } from '../../utils/roles';

interface GovGuideModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const GovGuideModal: React.FC<GovGuideModalProps> = ({ state, dispatch }) => {
    if (!state.showGovGuide) return null;

    const govInfo = [
        {
            id: 'left',
            title: 'IZQUIERDA',
            color: 'bg-rose-900 border-rose-500 text-rose-100',
            desc: 'Estado fuerte. Impuestos altos pero muchas ayudas sociales.',
            perks: [
                '🏛️ El Estado paga tu alquiler en casillas sociales (Gym, Servicios, Transporte).',
                '🚫 Prohibida la compra de propiedades al Estado.',
                '💸 Tax: 25% | Ayudas: Altas'
            ]
        },
        {
            id: 'right',
            title: 'DERECHA',
            color: 'bg-blue-900 border-blue-500 text-blue-100',
            desc: 'Mercado libre y seguridad privada. Menos impuestos.',
            perks: [
                '⚖️ Inmunidad ante ciertos arrestos (evitas cárcel por eventos).',
                '💵 Subvenciones a la empresa (Bonos por género/rol).',
                '💸 Tax: -20% (Subvención) | Seguridad: Alta'
            ]
        },
        {
            id: 'authoritarian',
            title: 'AUTORITARIO',
            color: 'bg-purple-900 border-purple-500 text-purple-100',
            desc: 'Control total. El Estado interviene y expropia.',
            perks: [
                '🏚️ Expropiaciones forzosas de propiedades sin edificar.',
                '🔨 Compra directa permitida (sin subasta) de propiedades libres.',
                '💸 Tax: 10% | Riesgo: Expropiación'
            ]
        },
        {
            id: 'libertarian',
            title: 'LIBERTARIO',
            color: 'bg-yellow-900 border-yellow-500 text-yellow-100',
            desc: 'Estado mínimo. Privatización masiva.',
            perks: [
                '🏗️ El Estado vende (privatiza) sus propiedades cada turno.',
                '💰 Tax negativo (-100%): No pagas en casilla de Impuestos.',
                '💸 Tax: 0% | Servicios: Nulos'
            ]
        },
        {
            id: 'anarchy',
            title: 'ANARQUÍA',
            color: 'bg-red-950 border-red-600 text-red-100',
            desc: 'Sin reglas. Caos absoluto.',
            perks: [
                '🔥 Sin impuestos ni ayudas.',
                '🧨 Alta probabilidad de disturbios y eventos caóticos.',
                '💸 Tax: 0% | Caos: Máximo'
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans" onClick={() => dispatch({type: 'TOGGLE_GOV_GUIDE'})}>
            <div className="w-full max-w-4xl bg-slate-950 rounded-xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Guía de Gobierno</h2>
                        <p className="text-sm text-slate-400">El sistema político cambia cada 7 turnos o por golpe de estado.</p>
                    </div>
                    <button onClick={() => dispatch({type: 'TOGGLE_GOV_GUIDE'})} className="text-slate-400 hover:text-white text-2xl font-bold px-2">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
                    {govInfo.map((g) => {
                        const isActive = state.gov === g.id;
                        return (
                            <div key={g.id} className={`p-4 rounded-lg border-2 flex flex-col gap-2 relative transition-transform hover:scale-[1.02] ${g.color} ${isActive ? 'ring-4 ring-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'opacity-80 hover:opacity-100'}`}>
                                {isActive && <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">ACTUAL</div>}
                                
                                <h3 className="font-black text-xl uppercase border-b border-white/20 pb-1 mb-1">{g.title}</h3>
                                <p className="text-xs italic opacity-90 mb-2 min-h-[32px]">{g.desc}</p>
                                
                                <ul className="space-y-1">
                                    {g.perks.map((p, i) => (
                                        <li key={i} className="text-[10px] leading-tight flex items-start gap-1">
                                            <span className="opacity-70">•</span>
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Stats Mini Bar */}
                                <div className="mt-auto pt-3 flex gap-1 justify-between text-[9px] font-mono opacity-80 border-t border-white/10">
                                    <div>TAX: {(GOV_CONFIGS[g.id as any].tax * 100).toFixed(0)}%</div>
                                    <div>WELFARE: {(GOV_CONFIGS[g.id as any].welfare * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                    <button onClick={() => dispatch({type: 'TOGGLE_GOV_GUIDE'})} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2 rounded-full font-bold text-sm border border-slate-600 transition-colors">
                        Cerrar Guía
                    </button>
                </div>
            </div>
        </div>
    );
};
