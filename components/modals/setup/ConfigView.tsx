
import React from 'react';

interface HumanConfig {
    name: string;
    gender: 'male'|'female'|'helicoptero'|'marcianito';
}

interface ConfigViewProps {
    setupHumans: number;
    setSetupHumans: (n: number) => void;
    humanConfigs: HumanConfig[];
    setHumanConfigs: (configs: HumanConfig[]) => void;
    numBots: number;
    setNumBots: (n: number) => void;
    onStart: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
    setupHumans, setSetupHumans,
    humanConfigs, setHumanConfigs,
    numBots, setNumBots,
    onStart
}) => {
    const totalPlayers = setupHumans + numBots;
    const canStart = totalPlayers >= 2;

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-white text-center tracking-tight border-b border-white/10 pb-2 uppercase">
                ¡HOLA! SOY EL PROFESOR OAK
            </h2>
            
            {/* --- SLIDERS COMPACTOS (FILA SUPERIOR) --- */}
            <div className="flex gap-4 mb-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 shrink-0">
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Humanos</label>
                        <span className="text-xs font-mono text-green-400 font-bold">{setupHumans}</span>
                    </div>
                    <input 
                        type="range" min="0" max="8" step="1" 
                        value={setupHumans} 
                        onChange={e => setSetupHumans(parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" 
                    />
                </div>
                <div className="w-px bg-slate-700"></div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Bots</label>
                        <span className="text-xs font-mono text-blue-400 font-bold">{numBots}</span>
                    </div>
                    <input 
                        type="range" min="0" max="8" step="1" 
                        value={numBots} 
                        onChange={e => setNumBots(parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                </div>
            </div>

            {/* --- LISTA DE JUGADORES (SCROLL) --- */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                {humanConfigs.length === 0 && (
                    <div className="text-center text-gray-500 text-xs italic py-8 border-2 border-dashed border-slate-700 rounded-xl">
                        Añade humanos o juega solo con bots.
                    </div>
                )}

                {humanConfigs.map((cfg, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1 rounded-lg bg-slate-800/40 border border-slate-700/50 transition-all focus-within:border-green-500/50 focus-within:bg-slate-800">
                        {/* Indicador Numérico */}
                        <div className="w-8 h-10 flex items-center justify-center bg-slate-700 rounded font-mono text-sm font-bold text-gray-400 shrink-0 select-none">
                            #{idx + 1}
                        </div>

                        {/* Input Nombre */}
                        <input 
                            type="text" 
                            value={cfg.name} 
                            onChange={(e) => {
                                const newCfgs = [...humanConfigs];
                                newCfgs[idx].name = e.target.value;
                                setHumanConfigs(newCfgs);
                            }}
                            className="flex-1 bg-transparent border-none text-sm text-white placeholder-gray-600 focus:ring-0 px-2 h-10"
                            placeholder={`Nombre Jugador ${idx + 1}`}
                        />

                        {/* Selector Género (Emojis) */}
                        <div className="relative shrink-0">
                            <select 
                                value={cfg.gender}
                                onChange={(e) => {
                                    const newCfgs = [...humanConfigs];
                                    newCfgs[idx].gender = e.target.value as any;
                                    setHumanConfigs(newCfgs);
                                }}
                                className="w-14 h-10 bg-slate-900 border border-slate-600 rounded text-xl text-center appearance-none focus:outline-none focus:border-green-500 cursor-pointer"
                                style={{ textAlignLast: 'center' }}
                            >
                                <option value="male">👨</option>
                                <option value="female">👩</option>
                                <option value="helicoptero">🚁</option>
                                <option value="marcianito">👽</option>
                            </select>
                            {/* Pequeña flecha visual si se quiere, o dejarlo limpio */}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- BOTÓN DE ACCIÓN (FIJO ABAJO) --- */}
            <div className="mt-4 pt-2 border-t border-slate-700 shrink-0">
                <button 
                    onClick={onStart} 
                    disabled={!canStart}
                    className={`w-full font-black py-4 rounded-xl shadow-lg transform transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2
                        ${canStart 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 border border-slate-700'
                        }`}
                >
                    {canStart ? (
                        <><span>🎲 SORTEAR TURNOS</span></>
                    ) : (
                        'MÍNIMO 2 JUGADORES'
                    )}
                </button>
            </div>
        </div>
    );
};
