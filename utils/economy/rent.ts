
import { GameState, TileData, TileType } from '../../types';

export const getRent = (tile: TileData, diceTotal: number = 0, tiles: TileData[], state?: GameState): number => {
  if (tile.type !== TileType.PROP) return 0;
  if (tile.mortgaged) return 0;
  if (tile.owner === 'E' && tile.mortgaged) return 0;
  
  // Okupa Block Logic
  if (tile.blockedRentTurns && tile.blockedRentTurns > 0) return 0;

  // Weather Logic (Heatwave = 0 rent on normal streets)
  if (state?.world.weather === 'heatwave' && tile.subtype === undefined) { 
      return 0;
  }

  // --- ROLE ABILITIES: IMMUNITY CHECK ---
  const payer = state?.players[state.currentPlayerIndex];
  if (payer) {
      if (payer.role === 'proxeneta' && state?.world.isNight) return 0;
      if (payer.role === 'okupa' && tile.subtype === 'utility') return 0;
      if (payer.immunityTurns && payer.immunityTurns > 0) return 0;
  }

  let rent = 0;
  const subtype = tile.subtype || '';
  
  if (subtype === 'utility') {
    const ownerId = tile.owner;
    if (ownerId === null) return 0;
    const ownedCount = tiles.filter(t => t.subtype === 'utility' && t.owner === ownerId).length;
    const nightMod = (state?.world.isNight) ? 0.5 : 1;
    rent = Math.round((diceTotal * (ownedCount >= 2 ? 10 : 4)) * nightMod);
  } else if (['rail', 'bus', 'ferry', 'air'].includes(subtype)) {
    const ownerId = tile.owner;
    if (ownerId === null) return 0;
    const ownedCount = tiles.filter(t => t.subtype === subtype && t.owner === ownerId).length;
    rent = Math.round((25 * Math.pow(2, Math.max(0, ownedCount - 1))));
  } else if (subtype === 'fiore') {
    const workerCount = tile.workersList ? tile.workersList.length : (tile.workers || 0);
    rent = workerCount * 70;
    if (tile.workersList) {
        tile.workersList.forEach(w => {
            if (w.rarity === 'rare') rent += 20;
            if (w.rarity === 'legendary') rent += 50;
        });
    }
    if (state?.world.isNight) rent *= 2;
  } else if (['casino_bj', 'casino_roulette'].includes(subtype)) {
    rent = 0; 
  } else {
    // STANDARD PROPERTY RENT LOGIC
    const base = tile.baseRent || Math.round((tile.price || 0) * 0.12);
    if (tile.hotel) {
        rent = base * 25;
    } else {
        const h = tile.houses || 0;
        if (h === 0) rent = base;
        else if (h === 1) rent = base * 3;
        else if (h === 2) rent = base * 6;
        else if (h === 3) rent = base * 12;
        else if (h === 4) rent = base * 18;
    }
  }

  // Event multipliers
  if (state) {
      if (state.rentEventMul && state.rentEventMul !== 1) {
          rent = Math.round(rent * state.rentEventMul);
      }
      state.rentFilters.forEach(filter => {
          let match = false;
          const isLeisure = tile.color === 'pink' || ['casino_bj','casino_roulette','fiore'].includes(subtype);
          const isTransport = ['bus','rail','ferry','air'].includes(subtype);
          
          if (filter.filterType === 'leisure' && isLeisure) match = true;
          if (filter.filterType === 'transport' && isTransport) match = true;
          if (filter.filterType === 'family' && (tile.familia === filter.filterValue || tile.color === filter.filterValue)) match = true;
          if (filter.filterType === 'owner' && tile.owner === filter.filterValue) match = true;
          if (match) rent = Math.round(rent * filter.mul);
      });
      if (state.rentCap && state.rentCap.amount > 0) {
          rent = Math.min(rent, state.rentCap.amount);
      }
  }

  return Math.max(0, rent);
};

export const getRentTable = (t: TileData) => {
    if (!t) return [];
    const subtype = t.subtype || '';

    if (subtype === 'fiore') {
        return [
            { label: 'Por Chica', rent: 70 },
            { label: 'Bonus Rara', rent: '+20' },
            { label: 'Bonus Legend', rent: '+50' },
            { label: 'Turno Noche', rent: 'x2' },
        ];
    }
    
    if (['rail', 'bus', 'ferry', 'air'].includes(subtype)) {
        let max = 4;
        let unit = 'Estación';
        
        // Specific logic for types with only 2 stations on board
        if (subtype === 'ferry') { max = 2; unit = 'Ferry'; }
        else if (subtype === 'air') { max = 2; unit = 'Aeropuerto'; }
        else if (subtype === 'bus') { max = 4; unit = 'Estación'; }
        else if (subtype === 'rail') { max = 5; unit = 'Estación'; }

        const rows = [];
        for(let i=0; i<max; i++) {
            let label = `${i+1} ${unit}`;
            if (i > 0) {
                if (unit === 'Estación') label += 'es';
                else if (unit === 'Ferry') label = `${i+1} Ferris`;
                else if (unit === 'Aeropuerto') label += 's';
            }
            rows.push({ label, rent: 25 * Math.pow(2, i) });
        }
        return rows;
    }
    
    // Standard Properties
    const base = t.baseRent ?? Math.round((t.price || 0) * 0.12);
    return [
        { label: 'Alquiler base', rent: base },
        { label: '1 Casa', rent: base * 3 },
        { label: '2 Casas', rent: base * 6 },
        { label: '3 Casas', rent: base * 12 },
        { label: '4 Casas', rent: base * 18 },
        { label: 'Hotel', rent: base * 25 },
    ];
};

export const getHouseCost = (tile: TileData): number => {
    return Math.round((tile.price || 0) * 0.5);
};

export const ownsFullGroup = (player: any, tile: TileData, tiles: TileData[]) => {
    if (!tile.color) return false;
    const group = tiles.filter(t => t.color === tile.color);
    return group.every(t => t.owner === player.id);
};

export const canSellEven = (tile: TileData, tiles: TileData[]) => true;
