
import { TileData, TileType } from '../../types';
import { p, rail, bus, util, ferry, air } from './helpers';

// TOTAL: 64 TILES (0-63)
// 0: Start
// 1-15: Bottom Side
// 16: Corner (Jail)
// 17-31: Left Side
// 32: Corner (Parkie) -> Connects to Index 64
// 33-47: Top Side
// 48: Corner (GotoJail) -> Connects to Index 74
// 49-63: Right Side

export const PERIMETER_TILES: Partial<TileData>[] = [
  // --- CORNER 0 (Bottom-Right) ---
  { type: TileType.START, name: 'SALIDA' }, // 0

  // --- BOTTOM SIDE (1-15) ---
  p('San Lorenzo ermitie', 'brown', 60, 'Txakoli'), // 1
  { type: TileType.EVENT, name: 'Caja de Comunidad' }, // 2
  p('Santa Maria Elizie', 'brown', 70, 'Txakoli'), // 3
  { type: TileType.TAX, name: 'Hacienda' }, // 4
  rail('Metro Zelaieta Sur'), // 5
  p('Pipi´s Bar', 'cyan', 80, 'Pintxo'), // 6
  { type: TileType.EVENT, name: 'Suerte' }, // 7
  p('Artea', 'cyan', 90, 'Pintxo'), // 8
  p('Perrukeria', 'pink', 100, 'Kalea'), // 9
  util('Iberduero Aguas'), // 10
  p('Estetika Zentroa', 'pink', 105, 'Kalea'), // 11
  p('Atxarre', 'orange', 120, 'Mendi'), // 12
  bus('Bizkaibus Herriko'), // 13
  p('San Miguel', 'orange', 130, 'Mendi'), // 14
  p('Omako Basoa', 'orange', 140, 'Mendi'), // 15

  // --- CORNER 1 (Bottom-Left) ---
  { type: TileType.JAIL, name: 'Cárcel' }, // 16

  // --- LEFT SIDE (17-31) ---
  p('Gruas Arego', 'red', 150, 'Itsaso'), // 17
  { type: TileType.EVENT, name: 'Caja de Comunidad' }, // 18
  p('Talleres Arteaga', 'red', 160, 'Itsaso'), // 19
  p('Casa Rural Ozollo', 'yellow', 170, 'Arrantzale'), // 20
  rail('Metro Arteaga Urias'), // 21
  p('Aberasturi', 'yellow', 180, 'Arrantzale'), // 22
  util('IberdueroLuz'), // 23
  p('Bird Center', 'emerald', 190, 'Verde'), // 24
  p('Autokarabanak', 'emerald', 200, 'Verde'), // 25
  ferry('Ferris Laida'), // 26
  p('Casino Blackjack', 'pink', 300, 'Rosa', 'casino_bj'), // 27
  p('Txokoa', 'blue', 210, 'Rojo'), // 28
  { type: TileType.TAX, name: 'Hacienda' }, // 29
  p('Casa Minte', 'blue', 230, 'Rojo', 'gym'), // 30
  p('Fiore', 'green', 240, 'Verde', 'fiore'), // 31

  // --- CORNER 2 (Top-Left) ---
  { type: TileType.PARK, name: 'Parkie' }, // 32

  // --- TOP SIDE (33-47) ---
  p('Marko Pollo', 'cyan', 240, 'Pintxo'), // 33
  { type: TileType.EVENT, name: 'Suerte' }, // 34
  p('Arketas', 'cyan', 250, 'Pintxo'), // 35
  rail('Metro Islas'), // 36
  p('Joshua´s', 'lime', 260, 'Amarillo'), // 37
  { type: TileType.TAX, name: 'Hacienda' }, // 38
  p('Santana Esnekiak', 'lime', 270, 'Amarillo'), // 39
  p('Klinika Dental Arteaga', 'lime', 280, 'Amarillo'), // 40
  air('Loiu'), // 41
  p('Kanala Bitch', 'emerald', 290, 'Verde'), // 42
  { type: TileType.EVENT, name: 'Caja de Comunidad' }, // 43
  p('Kanaleko Tabernie', 'emerald', 300, 'Verde'), // 44
  bus('Bizkaibus Muruetagane'), // 45
  p('Baratze', 'teal', 310, 'Azul'), // 46
  p('Eskolie', 'teal', 320, 'Azul'), // 47

  // --- CORNER 3 (Top-Right) ---
  { type: TileType.GOTOJAIL, name: 'Ir a la cárcel' }, // 48

  // --- RIGHT SIDE (49-63) ---
  p('Garbigune', 'sky', 330, 'Cian'), // 49
  { type: TileType.BANK, name: 'Banca corrupta' }, // 50
  p('Padura', 'sky', 340, 'Cian'), // 51
  p('Santanako Desaguie', 'sky', 350, 'Cian'), // 52
  rail('Metro Portuas'), // 53
  p('Farmazixe', 'teal', 360, 'Azul'), // 54
  { type: TileType.EVENT, name: 'Suerte' }, // 55
  p('Medikue', 'teal', 370, 'Azul'), // 56
  air('Ozolloko Aireportue'), // 57
  p('Frontoie', 'indigo', 380, 'Baserri'), // 58
  p('Skateko Pistie', 'indigo', 390, 'Baserri'), // 59
  ferry('Ferris Mundaka'), // 60
  p('Txarlin Pistie', 'indigo', 400, 'Baserri'), // 61
  p('Txopebenta', 'violet', 410, 'Sirimiri'), // 62
  p('Jaunsolo Molino', 'violet', 420, 'Sirimiri'), // 63
];
