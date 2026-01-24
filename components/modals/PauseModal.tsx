
import React, { useRef, useState } from 'react';
import { GameState } from '../../types';
import { saveToLocal, loadFromLocal, exportSaveFile, importSaveFile } from '../../utils/saveManager';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const PauseModal: React.FC<Props> = ({ state, dispatch }) => {
    const [msg, setMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!state.isPaused) return null;

    const handleResume = () => {
        dispatch({ type: 'TOGGLE_PAUSE' });
    };

    const handleQuickSave = () => {
        const success = saveToLocal(state);
        if (success) setMsg("✅ Partida guardada en navegador.");
        else setMsg("❌ Error al guardar.");
        
        setTimeout(() => setMsg(null), 2000);
    };

    const handleQuickLoad = () => {
        const loadedState = loadFromLocal();
        if (loadedState) {
            if (window.confirm("¿Seguro que quieres cargar? Perderás el progreso actual no guardado.")) {
                dispatch({ type: 'LOAD_GAME', payload: loadedState });
                dispatch({ type: 'TOGGLE_PAUSE' }); // Unpause after load
            }
        } else {
            setMsg("⚠️ No hay partida guardada en navegador.");
            setTimeout(() => setMsg(null), 2000);
        }
    };

    const handleExport = () => {
        exportSaveFile(state);
        setMsg("⬇️ Archivo descargado.");
        setTimeout(() => setMsg(null), 2000);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const newState = await importSaveFile(file);
            dispatch({ type: 'LOAD_GAME', payload: newState });
            dispatch({ type: 'TOGGLE_PAUSE' });
            alert("Partida cargada desde archivo correctamente.");
        } catch (error) {
            console.error(error);
            alert("Error al leer el archivo. Asegúrate de que es un .json válido de Artia Landak.");
        }
        
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleReset = () => {
        if (window.confirm("¿Reiniciar el juego por completo? Se perderá todo el progreso actual.")) {
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-slate-600 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
                
                {/* Header */}
                <div className="bg-slate-950 p-6 text-center border-b border-slate-800">
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase">PAUSA</h2>
                    <div className="text-xs text-slate-500 font-mono mt-1">MENÚ DE SISTEMA</div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                    
                    {msg && (
                        <div className="bg-blue-900/50 text-blue-200 text-center text-sm py-2 rounded border border-blue-500/30 animate-pulse mb-4">
                            {msg}
                        </div>
                    )}

                    <button onClick={handleResume} className="w-full bg-white hover:bg-gray-200 text-black font-black py-4 rounded-xl shadow-lg uppercase tracking-wide transition-transform hover:scale-[1.02] active:scale-95">
                        ▶ Continuar Partida
                    </button>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button onClick={handleQuickSave} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-3 rounded-lg border border-emerald-900/50 hover:border-emerald-500 transition-colors">
                            💾 Guardar Rápido
                        </button>
                        <button onClick={handleQuickLoad} className="bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold py-3 rounded-lg border border-blue-900/50 hover:border-blue-500 transition-colors">
                            📂 Cargar Rápido
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleExport} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors text-xs uppercase">
                            ⬇️ Exportar Archivo
                        </button>
                        <button onClick={handleImportClick} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors text-xs uppercase">
                            ⬆️ Importar Archivo
                        </button>
                        {/* Hidden Input */}
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>

                    <div className="border-t border-slate-800 pt-6 mt-6">
                        <button onClick={handleReset} className="w-full text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest hover:underline">
                            ⚠️ Salir al Menú Principal (Reset)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
