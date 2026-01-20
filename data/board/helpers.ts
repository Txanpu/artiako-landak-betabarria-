
import { TileData, TileType } from '../../types';

export const p = (name: string, color: string, price: number, familia?: string, subtype?: string): Partial<TileData> => ({
  type: TileType.PROP,
  name,
  price,
  color,
  familia: familia || color,
  subtype
});

export const rail = (name: string) => p(name, 'rail', 200, 'rail', 'rail');
export const bus = (name: string) => p(name, 'rail', 200, 'rail', 'bus');
export const ferry = (name: string) => p(name, 'ferry', 180, 'ferry', 'ferry');
export const air = (name: string) => p(name, 'air', 260, 'air', 'air');
export const util = (name: string) => p(name, 'util', 150, 'util', 'utility');
