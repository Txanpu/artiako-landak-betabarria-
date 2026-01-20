
import { FioreWorker } from '../types';

export const FIORE_ROSTER: FioreWorker[] = [
    // LEGENDARY
    { id: 'w_asuka', name: 'Asuka', rarity: 'legendary', trait: 'Tsundere', flavor: '¡Baka! ¿Por qué tardas tanto en pagar?', color: '#ef4444', icon: '😡' }, // Red
    { id: 'w_02', name: 'Zero Two', rarity: 'legendary', trait: 'Darling', flavor: 'Te roba el alma (y la cartera).', color: '#f472b6', icon: '😈' }, // Pink
    { id: 'w_makima', name: 'Makima', rarity: 'legendary', trait: 'Control', flavor: 'Tú eres su perro ahora. Ladra.', color: '#be185d', icon: '👔' }, // Dark Pink/Red
    { id: 'w_nami', name: 'Nami', rarity: 'legendary', trait: 'Navegante', flavor: 'Cobra un 20% extra por "mapas".', color: '#f97316', icon: '🍊' }, // Orange
    { id: 'w_yor', name: 'Yor', rarity: 'legendary', trait: 'Thorn Princess', flavor: 'Limpia "manchas" difíciles.', color: '#000000', icon: '🥀' }, // Black/Red

    // RARE
    { id: 'w_rem', name: 'Rem', rarity: 'rare', trait: 'Maid Devota', flavor: 'Lo hace todo por ti (incluso matar).', color: '#3b82f6', icon: '🧹' }, // Blue
    { id: 'w_ram', name: 'Ram', rarity: 'rare', trait: 'Maid Tóxica', flavor: 'Te insulta mientras limpia.', color: '#ec4899', icon: '😒' }, // Pink
    { id: 'w_misato', name: 'Misato', rarity: 'rare', trait: 'Madura', flavor: 'Trae cerveza barata al trabajo.', color: '#7e22ce', icon: '🍺' }, // Purple
    { id: 'w_mikasa', name: 'Mikasa', rarity: 'rare', trait: 'Escolta', flavor: 'Si no pagas, te corta.', color: '#b91c1c', icon: '🧣' }, // Red Scarf
    { id: 'w_megumin', name: 'Megumin', rarity: 'rare', trait: 'Explosiva', flavor: 'Un servicio y se desmaya.', color: '#dc2626', icon: '💥' }, // Red
    { id: 'w_2b', name: '2B', rarity: 'rare', trait: 'Androide', flavor: 'Emociones prohibidas.', color: '#e5e7eb', icon: '🤖' }, // White/Silver
    { id: 'w_lucy', name: 'Lucy', rarity: 'rare', trait: 'Netrunner', flavor: 'Te hackea la cuenta bancaria.', color: '#a855f7', icon: '🌙' }, // Purple/Neon

    // COMMON
    { id: 'w_aqua', name: 'Aqua', rarity: 'common', trait: 'Diosa Inútil', flavor: 'Se gasta las ganancias en alcohol.', color: '#06b6d4', icon: '💧' }, // Cyan/Blue
    { id: 'w_rei', name: 'Rei', rarity: 'common', trait: 'Kuudere', flavor: '...', color: '#93c5fd', icon: '🩹' }, // Light Blue
    { id: 'w_marin', name: 'Marin', rarity: 'common', trait: 'Cosplayer', flavor: 'Cada día un disfraz nuevo.', color: '#facc15', icon: '👘' }, // Yellow/Blonde
    { id: 'w_power', name: 'Power', rarity: 'common', trait: 'Caótica', flavor: 'No tira de la cadena.', color: '#fbbf24', icon: '😼' }, // Blonde/Orange
    { id: 'w_hinata', name: 'Hinata', rarity: 'common', trait: 'Tímida', flavor: 'Se desmaya si la miras mucho.', color: '#1e3a8a', icon: '😳' }, // Dark Blue
    { id: 'w_chika', name: 'Chika', rarity: 'common', trait: 'Caos', flavor: 'Te enseña a bailar.', color: '#fbcfe8', icon: '🎀' }, // Pink
    { id: 'w_nezuko', name: 'Nezuko', rarity: 'common', trait: 'Demonio', flavor: 'Mmm mmm mmm!', color: '#be123c', icon: '🎋' }, // Rose
    { id: 'w_kaguya', name: 'Kaguya', rarity: 'common', trait: 'Tsundere Rica', flavor: 'O kawaii koto...', color: '#be185d', icon: '🏫' }, // Dark Red
];

export const getRandomWorker = (excludeIds: string[] = []): FioreWorker => {
    // Filter out workers that are already present
    const available = FIORE_ROSTER.filter(w => !excludeIds.includes(w.id));
    
    if (available.length === 0) {
        // Fallback: If we have everyone (wow), pick random from full roster
        return FIORE_ROSTER[Math.floor(Math.random() * FIORE_ROSTER.length)];
    }
    
    return available[Math.floor(Math.random() * available.length)];
};
