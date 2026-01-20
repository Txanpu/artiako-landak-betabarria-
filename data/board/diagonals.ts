
import { TileData, TileType } from '../../types';
import { p, rail } from './helpers';

// TOTAL: 36 TILES (64-99)
// Each arm has 9 tiles.
// Total Board: 64 (Perimeter) + 36 (Diagonals) = 100 Tiles (0-99).

export const DIAGONAL_TILES: Partial<TileData>[] = [
  // === ARM 1 (Top-Left) [Indices 64-72] ===
  p('Cocina Pablo', 'blue', 220, 'Rojo', 'gym'),      // 64 (Entry from Parkie #32)
  p('Ereñokoa Ez Dan Kanterie', 'slate', 470, 'Gaztelugatxe'), // 65
  p('Artiako Kanterie', 'slate', 460, 'Gaztelugatxe'), // 66
  p('Artiako GYM-e', 'violet', 480, 'Sirimiri'),      // 67
  p('Ereñoko GYM-e', 'violet', 490, 'Sirimiri'),      // 68
  p('Frontoiko Bici estatikak', 'violet', 500, 'Sirimiri'), // 69
  { type: TileType.SLOTS, name: 'Tragaperras' },      // 70
  { type: TileType.TAX, name: 'Hacienda' },           // 71
  { type: TileType.PARK, name: 'Parkie' },            // 72 (Center Tip)

  // === ARM 2 (Top-Right) [Indices 73-81] ===
  p('Solabe', 'red', 510, 'Itsaso'),                  // 73 (Entry from GotoJail #48)
  p('Katxitxone', 'red', 520, 'Itsaso'),              // 74
  p('San Antolin', 'brown', 530, 'Txakoli'),          // 75
  p('Farolak', 'brown', 540, 'Txakoli'),              // 76
  { type: TileType.QUIZ, name: 'El Quiz Maldini' },   // 77
  p('Santi Mamiñe', 'yellow', 550, 'Arrantzale'),     // 78
  p('Portuaseko Kobazuloa', 'yellow', 560, 'Arrantzale'), // 79
  { type: TileType.TAX, name: 'Hacienda' },           // 80
  { type: TileType.PARK, name: 'Parkie' },            // 81 (Center Tip)

  // === ARM 3 (Bottom-Left) [Indices 82-90] ===
  p('Hemingway Etxea', 'navy', 570, 'Zorionak'),      // 82 (Entry from Jail #16)
  p('Etxealaia', 'navy', 580, 'Zorionak'),            // 83
  p('Kastillue', 'navy', 590, 'Zorionak'),            // 84
  p('Errota', 'navy', 600, 'Zorionak'),               // 85
  { type: TileType.SLOTS, name: 'Tragaperras' },      // 86
  { type: TileType.EVENT, name: 'Suerte' },           // 87
  { type: TileType.PROP, name: 'Canódromo', subtype: 'greyhound', price: 0, owner: 'E' }, // 88
  { type: TileType.TAX, name: 'Hacienda' },           // 89
  { type: TileType.PARK, name: 'Parkie' },            // 90 (Center Tip)

  // === ARM 4 (Bottom-Right) [Indices 91-99] ===
  p('Lezika', 'fuchsia', 430, 'Bilbo'),               // 91 (Entry from Start #0)
  p('Bernaetxe', 'fuchsia', 440, 'Bilbo'),            // 92
  p('Baserri Maitea', 'fuchsia', 450, 'Bilbo'),       // 93
  p('Casino Ruleta', 'pink', 300, 'Rosa', 'casino_roulette'), // 94
  p('Mirador de Artia', 'gold', 1000, 'Especial'),    // 95
  { type: TileType.EVENT, name: 'Caja de Comunidad' },// 96
  { type: TileType.TAX, name: 'Hacienda' },           // 97
  { type: TileType.PARK, name: 'Parkie' },            // 98
  { type: TileType.EVENT, name: 'Suerte' },           // 99 (Center Tip)
];
