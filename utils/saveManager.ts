
import { GameState } from '../types';

const STORAGE_KEY = 'artia_landak_autosave';

/**
 * Guarda el estado actual en el LocalStorage del navegador.
 */
export const saveToLocal = (state: GameState): boolean => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, serializedState);
        return true;
    } catch (e) {
        console.error("Error saving to local storage", e);
        return false;
    }
};

/**
 * Carga el estado desde el LocalStorage.
 */
export const loadFromLocal = (): GameState | null => {
    try {
        const serializedState = localStorage.getItem(STORAGE_KEY);
        if (serializedState === null) return null;
        return JSON.parse(serializedState) as GameState;
    } catch (e) {
        console.error("Error loading from local storage", e);
        return null;
    }
};

/**
 * Descarga el estado actual como un archivo .json
 */
export const exportSaveFile = (state: GameState) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `artia_save_T${state.turnCount}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

/**
 * Lee un archivo .json y devuelve el estado parseado (Promesa)
 */
export const importSaveFile = (file: File): Promise<GameState> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Aquí podrías añadir validaciones de esquema si fuera necesario
                resolve(json);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};
