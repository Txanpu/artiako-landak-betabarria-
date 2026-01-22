
export * from './data/boardData';

export const COLORS = {
  brown: '#78350f',
  cyan: '#06b6d4',
  pink: '#db2777',
  orange: '#f97316',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  
  // Extended Palette for Mega Board
  purple: '#9333ea',
  lime: '#84cc16',
  teal: '#14b8a6',
  indigo: '#6366f1',
  rose: '#e11d48',
  amber: '#d97706',
  emerald: '#10b981',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  fuchsia: '#d946ef',
  slate: '#64748b',

  // New Unique Colors for Diagonals to avoid collisions
  maroon: '#7f1d1d',   // Dark Red (vs Red)
  coral: '#fb923c',    // Peach/Orange (vs Orange)
  gold: '#b45309',     // Dark Gold (vs Yellow)
  navy: '#1e3a8a',     // Dark Blue (vs Blue)
  turquoise: '#2dd4bf', // Minty Cyan (vs Cyan/Teal)
  
  util: '#a3a3a3',
  rail: '#6d28d9',
  ferry: '#0ea5e9',
  air: '#facc15',
  park: '#4ade80',
  start: '#10b981',
  jail: '#111827',
  tax: '#f59e0b',
  bank: '#991b1b',
  event: '#a855f7',
  slots: '#d946ef'
};

export const PLAYER_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#14b8a6', '#ec4899', '#6366f1'];

export const PLAYER_EMOJIS = ['😃', '🤖', '🦊', '🐸', '🐼', '🐵', '🦄', '🐲'];

export const BASQUE_AVATARS = [
    { id: 'txapela', icon: '🧢', name: 'La Txapela', desc: 'El clásico, no puede faltar.' },
    { id: 'katxi', icon: '🥤', name: 'Katxi Kalimotxo', desc: 'Vaso maceta rebosante.' },
    { id: 'piedra', icon: '🪨', name: 'Harrijasotzaile', desc: 'Piedra rectangular enorme.' },
    { id: 'chuleton', icon: '🥩', name: 'El Chuletón', desc: 'Con hueso y sangrando.' },
    { id: 'trainera', icon: '🚣', name: 'La Trainera', desc: 'A remar fuerte.' },
    { id: 'lauburu', icon: '☸️', name: 'El Lauburu', desc: 'Toque tradicional vasco.' },
    { id: 'baldosa', icon: '🌼', name: 'Baldosa Bilbao', desc: 'La flor de la villa.' },
    { id: 'eguzkilore', icon: '🌻', name: 'Eguzkilore', desc: 'Protección contra espíritus.' },
    { id: 'marijaia', icon: '🙆‍♀️', name: 'Marijaia', desc: '¡Brazos arriba Aste Nagusia!' },
    { id: 'celedon', icon: '☂️', name: 'Celedón', desc: 'Bajando con el paraguas.' },
    { id: 'eskopeta', icon: '🔫', name: 'Eskopeta', desc: 'Cuidadito conmigo.' },
    { id: 'demonio', icon: '👹', name: 'Demonio', desc: 'Puro Akelarre.' },
    { id: 'robot', icon: '🤖', name: 'Teknologia', desc: 'Parque Tecnológico.' },
    { id: 'dragon', icon: '🐲', name: 'Herensuge', desc: 'Dragón mitológico.' },
    { id: 'oveja', icon: '🐑', name: 'Latxa', desc: 'Oveja del país.' },
    { id: 'kaiku', icon: '🥛', name: 'Kaiku', desc: 'Leche buena.' }
];

export const FUNNY: Record<string, string> = {
  start:    'salidas como tu madre.',
  tax:      'dinerito pal politiko',
  jail:     'Buen sitio pa hacer Networking?',
  gotojail: 'A la cárcel, a la cárcel, a la cárcel, a la cárcel, a la cárcel…',
  park:     'buen sitio pa fumar porros',
  slots:    'GANA GANA GANA!!!',
  bank:     'Banca corrupta: pide préstamo o tituliza deudas.',
  default:  'Sin info, como tu madre...'
};

export const WELFARE_TILES = [
  'Eskolie', 'Baratze', 'Farmazixe', 'Medikue', 'Frontoie',
  'Skateko Pistie', 'Txarlin Pistie', 'Artiako GYM-e',
  'Ereñoko GYM-e', 'Frontoiko Bici estatikak', 'Farolak'
];

export const FIESTA_TILES = [
  'Pipi´s Bar', 'Artea', 'Atxarre', 'Casa Minte',
  'Cocina Pablo', 'Garbigune', 'Medikue', 'Frontoie', 'Kastillue'
];
