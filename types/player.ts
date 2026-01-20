
export type InventoryItemType = 'dark_lawyer' | 'dark_molotov' | 'dark_okupa' | 'dark_immunity';

export interface Player {
  id: number;
  name: string;
  money: number;
  pos: number;
  alive: boolean;
  jail: number; 
  color: string;
  isBot: boolean;
  gender: 'male' | 'female' | 'helicoptero' | 'marcianito';
  role?: 'proxeneta' | 'florentino' | 'fbi' | 'okupa' | 'hacker' | 'civil'; 
  props: number[];
  taxBase: number;
  vatIn: number;
  vatOut: number;
  doubleStreak: number;
  pendingMove?: number | null;
  skipTurns?: number;
  insiderTokens: number; 
  fentanylAddiction?: boolean;
  jailCards?: number;
  inventory: InventoryItemType[]; 
  immunityTurns?: number; 
  offshoreMoney?: number;
  
  // New Drug System
  farlopa: number; // Inventory count
  highTurns: number; // Turns left with 3rd die
}
