
export interface RentFilter {
    id: string;
    mul: number;
    turns: number;
    filterType: 'leisure' | 'transport' | 'family' | 'owner';
    filterValue?: string | number; 
}

export type GovernmentType = 'left' | 'right' | 'authoritarian' | 'libertarian' | 'anarchy';

export interface GovConfig {
    tax: number;      
    welfare: number;  
    interest: number; 
    rentIVA: number;  
}

export interface Greyhound {
    id: number;
    color: string;
    progress: number;
    speed: number;
}
