
export enum TileType {
  START = 'start',
  PROP = 'prop',
  TAX = 'tax',
  JAIL = 'jail',
  GOTOJAIL = 'gotojail',
  PARK = 'park',
  EVENT = 'event',
  SLOTS = 'slots',
  BANK = 'bank',
  QUIZ = 'quiz', // NEW
}

export interface FioreWorker {
    id: string;
    name: string;
    rarity: 'common' | 'rare' | 'legendary';
    trait: string;
    flavor: string;
    color: string; // Hex for visual theme (hair/outfit)
    icon: string;  // Specific emoji
}

export interface TileData {
  id: number;
  type: TileType;
  name: string;
  price?: number;
  color?: string;
  subtype?: string; // 'rail', 'bus', 'utility', 'fiore', etc.
  owner?: number | 'E' | null;
  houses?: number;
  hotel?: boolean;
  mortgaged?: boolean;
  baseRent?: number;
  rent?: number;
  familia?: string;
  workers?: number; // Legacy count, prefer workersList
  workersList?: FioreWorker[]; // New: Actual objects
  maintenance?: number; 
  wagePer?: number; 
  houseCost?: number; 
  mortgagePrincipal?: number;
  blockedRentTurns?: number; 
  isBroken?: boolean; // NEW: For Anarchy revolutions
}
