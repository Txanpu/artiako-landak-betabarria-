
// Types for Pokemon Engine
export type PokemonType = "Normal" | "Fire" | "Water" | "Grass" | "Electric" | "Ground" | "Dragon" | "Steel" | "Rock" | "Bug" | "Fighting" | "Psychic" | "Ghost" | "Dark" | "Flying" | "Poison";

export interface Move {
    name: string;
    type: PokemonType;
    power: number;
    category: "Physical" | "Special";
    acc: number;
}

export interface PokemonStats {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
}

export interface PokemonDef {
    name: string;
    types: PokemonType[];
    stats: number[]; // Base Stats: HP, Atk, Def, SpA, SpD, Spe
    sprite: string;
}

export interface ActivePokemon {
    def: PokemonDef;
    name: string;
    maxHp: number;
    currentHp: number;
    stats: PokemonStats;
    moves: string[];
    isPlayer: boolean;
}

// GEN 5 TYPE CHART (Simplified)
const TYPES: Record<string, Record<string, number>> = {
    "Normal":   { Rock:0.5, Ghost:0, Steel:0.5 },
    "Fire":     { Fire:0.5, Water:0.5, Grass:2, Ice:2, Bug:2, Rock:0.5, Dragon:0.5, Steel:2 },
    "Water":    { Fire:2, Water:0.5, Grass:0.5, Ground:2, Rock:2, Dragon:0.5 },
    "Grass":    { Fire:0.5, Water:2, Grass:0.5, Poison:0.5, Ground:2, Flying:0.5, Bug:0.5, Rock:2, Dragon:0.5, Steel:0.5 },
    "Electric": { Water:2, Grass:0.5, Electric:0.5, Ground:0, Flying:2, Dragon:0.5 },
    "Ground":   { Fire:2, Grass:0.5, Electric:2, Poison:2, Flying:0, Bug:0.5, Rock:2, Steel:2 },
    "Dragon":   { Dragon:2, Steel:0.5 },
    "Fighting": { Normal:2, Rock:2, Steel:2, Ice:2, Dark:2, Flying:0.5, Poison:0.5, Bug:0.5, Psychic:0.5, Ghost:0 },
    "Steel":    { Rock:2, Ice:2, Fairy:2, Steel:0.5, Fire:0.5, Water:0.5, Electric:0.5 },
    "Rock":     { Fire:2, Ice:2, Flying:2, Bug:2, Fighting:0.5, Ground:0.5, Steel:0.5 },
    "Bug":      { Grass:2, Psychic:2, Dark:2, Fire:0.5, Fighting:0.5, Poison:0.5, Flying:0.5, Ghost:0.5, Steel:0.5 },
};

export const getEffectiveness = (moveType: string, targetTypes: string[]) => {
    let multiplier = 1;
    targetTypes.forEach(type => {
        if (TYPES[moveType]) {
            if (TYPES[moveType][type] !== undefined) multiplier *= TYPES[moveType][type];
        }
    });
    return multiplier;
};

// POKEDEX
export const POKEDEX: Record<string, PokemonDef> = {
    "Garchomp": { name: "Garchomp", types: ["Dragon", "Ground"], stats: [108, 130, 95, 80, 85, 102], sprite: "https://play.pokemonshowdown.com/sprites/gen5/garchomp.png" },
    "Tyranitar": { name: "Tyranitar", types: ["Rock", "Dark"], stats: [100, 134, 110, 95, 100, 61], sprite: "https://play.pokemonshowdown.com/sprites/gen5/tyranitar.png" },
    "Volcarona": { name: "Volcarona", types: ["Bug", "Fire"], stats: [85, 60, 65, 135, 105, 100], sprite: "https://play.pokemonshowdown.com/sprites/gen5/volcarona.png" },
    "Keldeo":    { name: "Keldeo", types: ["Water", "Fighting"], stats: [91, 72, 90, 129, 90, 108], sprite: "https://play.pokemonshowdown.com/sprites/gen5/keldeo.png" },
    "Ferrothorn":{ name: "Ferrothorn", types: ["Grass", "Steel"], stats: [74, 94, 131, 54, 116, 20], sprite: "https://play.pokemonshowdown.com/sprites/gen5/ferrothorn.png" },
    "Excadrill": { name: "Excadrill", types: ["Ground", "Steel"], stats: [110, 135, 60, 50, 65, 88], sprite: "https://play.pokemonshowdown.com/sprites/gen5/excadrill.png" },
    "Hydreigon": { name: "Hydreigon", types: ["Dark", "Dragon"], stats: [92, 105, 90, 125, 90, 98], sprite: "https://play.pokemonshowdown.com/sprites/gen5/hydreigon.png" },
    "Conkeldurr":{ name: "Conkeldurr", types: ["Fighting"], stats: [105, 140, 95, 55, 65, 45], sprite: "https://play.pokemonshowdown.com/sprites/gen5/conkeldurr.png" }
};

export const MOVES: Record<string, Move> = {
    "Earthquake": { name: "Earthquake", type: "Ground", power: 100, category: "Physical", acc: 100 },
    "Dragon Claw": { name: "Dragon Claw", type: "Dragon", power: 80, category: "Physical", acc: 100 },
    "Surf": { name: "Surf", type: "Water", power: 90, category: "Special", acc: 100 },
    "Flamethrower": { name: "Flamethrower", type: "Fire", power: 90, category: "Special", acc: 100 },
    "Power Whip": { name: "Power Whip", type: "Grass", power: 120, category: "Physical", acc: 85 },
    "Iron Head": { name: "Iron Head", type: "Steel", power: 80, category: "Physical", acc: 100 },
    "Bug Buzz": { name: "Bug Buzz", type: "Bug", power: 90, category: "Special", acc: 100 },
    "Stone Edge": { name: "Stone Edge", type: "Rock", power: 100, category: "Physical", acc: 80 },
    "Dark Pulse": { name: "Dark Pulse", type: "Dark", power: 80, category: "Special", acc: 100 },
    "Secret Sword": { name: "Secret Sword", type: "Fighting", power: 85, category: "Special", acc: 100 },
    "Mach Punch": { name: "Mach Punch", type: "Fighting", power: 40, category: "Physical", acc: 100 },
    "Draco Meteor": { name: "Draco Meteor", type: "Dragon", power: 130, category: "Special", acc: 90 }
};

// HELPERS
export const createPokemon = (name: string, isPlayer: boolean): ActivePokemon => {
    const data = POKEDEX[name];
    const level = 50;
    
    // Gen 5 Stat Formula (Simplified: IV=31, EV=85)
    const calcStat = (base: number) => Math.floor(((2 * base + 31 + 20) * level) / 100) + 5;
    const maxHp = Math.floor(((2 * data.stats[0] + 31 + 20) * level) / 100) + 10 + level;

    const mon: ActivePokemon = {
        def: data,
        name,
        isPlayer,
        maxHp,
        currentHp: maxHp,
        stats: {
            hp: maxHp,
            atk: calcStat(data.stats[1]),
            def: calcStat(data.stats[2]),
            spa: calcStat(data.stats[3]),
            spd: calcStat(data.stats[4]),
            spe: calcStat(data.stats[5])
        },
        moves: []
    };

    // Auto-assign moves based on types
    if (data.types.includes("Ground")) mon.moves.push("Earthquake");
    if (data.types.includes("Dragon")) mon.moves.push("Dragon Claw");
    if (data.types.includes("Water")) mon.moves.push("Surf");
    if (data.types.includes("Fire")) mon.moves.push("Flamethrower");
    if (data.types.includes("Grass")) mon.moves.push("Power Whip");
    if (data.types.includes("Steel")) mon.moves.push("Iron Head");
    if (data.types.includes("Rock")) mon.moves.push("Stone Edge");
    if (data.types.includes("Dark")) mon.moves.push("Dark Pulse");
    if (data.types.includes("Fighting")) mon.moves.push("Secret Sword");
    if (data.types.includes("Bug")) mon.moves.push("Bug Buzz");

    // Fill empty
    while(mon.moves.length < 4) {
        if (!mon.moves.includes("Iron Head")) mon.moves.push("Iron Head");
        else if (!mon.moves.includes("Earthquake")) mon.moves.push("Earthquake");
        else break;
    }
    
    return mon;
};

export const calculateDamage = (attacker: ActivePokemon, defender: ActivePokemon, moveName: string) => {
    const move = MOVES[moveName];
    if (!move) return { damage: 0, eff: 1, miss: false };

    // Accuracy Check
    if (move.acc < 100 && Math.random() * 100 > move.acc) {
        return { damage: 0, eff: 0, miss: true };
    }

    const a = move.category === "Physical" ? attacker.stats.atk : attacker.stats.spa;
    const d = move.category === "Physical" ? defender.stats.def : defender.stats.spd;
    
    let baseDmg = (((2 * 50 / 5 + 2) * move.power * (a / d)) / 50) + 2;

    // STAB
    if (attacker.def.types.includes(move.type)) baseDmg *= 1.5;

    // Type Eff
    const typeEff = getEffectiveness(move.type, defender.def.types);
    baseDmg *= typeEff;

    // Random
    baseDmg *= (Math.random() * 0.15 + 0.85);

    return { damage: Math.floor(baseDmg), eff: typeEff, miss: false };
};
