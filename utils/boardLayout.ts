
// ============= GRID CONFIG =============
// GRID 46:
// - Esquinas: 2 unidades (Indices 1-2 y 45-46)
// - Espacio lateral disponible: 42 unidades (3 a 44)
// - Perímetro (15 tiles): Distribución dinámica (mezcla de span 2 y 3) para llenar 42 unidades.
// - Diagonales: Span 3 (3x3), Fixed Step 2 (Compact & Regular).
export const GRID_SIZE = 46; 
export const PERIMETER_TILES = 64;
export const DIAGONAL_TILES = 36; // 40 -> 36 (1 removed per arm)
export const TILES_PER_SIDE = 16;
export const TILES_PER_DIAGONAL = 9; // 10 -> 9

export interface TileConfig {
  gridColumn: string;
  gridRow: string;
  rotation: number;
  isDiagonal: boolean;
  isDiagonalEntry?: boolean;
}

// Función para distribuir 15 items en 42 espacios
const getPerimeterSpan = (index: number, totalTiles: number, totalSpace: number) => {
    const start = Math.round((index / totalTiles) * totalSpace);
    const end = Math.round(((index + 1) / totalTiles) * totalSpace);
    return { startOffset: start, span: end - start };
};

export const getTileConfig = (index: number): TileConfig => {
  // === PERÍMETRO EXTERIOR (0-63) ===
  if (index < PERIMETER_TILES) {
    const sideIndex = Math.floor(index / TILES_PER_SIDE);
    const posInSide = index % TILES_PER_SIDE; // 0 a 15
    
    // Configuración de Esquinas (Indices 0, 16, 32, 48) - Tamaño 2x2
    if (posInSide === 0) {
        // Corner 0 (Bottom-Right) -> 45-46
        if (sideIndex === 0) return { gridColumn: `45 / span 2`, gridRow: `45 / span 2`, rotation: 0, isDiagonal: false };
        // Corner 16 (Bottom-Left) -> 1-2
        if (sideIndex === 1) return { gridColumn: `1 / span 2`, gridRow: `45 / span 2`, rotation: 90, isDiagonal: false };
        // Corner 32 (Top-Left) -> 1-2
        if (sideIndex === 2) return { gridColumn: `1 / span 2`, gridRow: `1 / span 2`, rotation: 180, isDiagonal: false };
        // Corner 48 (Top-Right) -> 45-46
        if (sideIndex === 3) return { gridColumn: `45 / span 2`, gridRow: `1 / span 2`, rotation: -90, isDiagonal: false };
    }

    // Configuración de Lados (Fichas 1-15)
    // Espacio útil: Indices 3 a 44 (42 unidades)
    const SIDE_LENGTH = GRID_SIZE - 4; // 42
    
    // Lado Inferior (Bottom): Derecha a Izquierda
    if (sideIndex === 0) {
      const { startOffset, span } = getPerimeterSpan(posInSide - 1, 15, SIDE_LENGTH);
      const colStart = (GRID_SIZE - 1) - (startOffset + span);
      return { gridColumn: `${colStart} / span ${span}`, gridRow: `45 / span 2`, rotation: 0, isDiagonal: false };
    }
    
    // Lado Izquierdo (Left): Abajo a Arriba
    if (sideIndex === 1) {
      const { startOffset, span } = getPerimeterSpan(posInSide - 1, 15, SIDE_LENGTH);
      const rowStart = (GRID_SIZE - 1) - (startOffset + span);
      return { gridColumn: `1 / span 2`, gridRow: `${rowStart} / span ${span}`, rotation: 90, isDiagonal: false };
    }
    
    // Lado Superior (Top): Izquierda a Derecha
    if (sideIndex === 2) {
      const { startOffset, span } = getPerimeterSpan(posInSide - 1, 15, SIDE_LENGTH);
      const colStart = 3 + startOffset;
      return { gridColumn: `${colStart} / span ${span}`, gridRow: `1 / span 2`, rotation: 180, isDiagonal: false };
    }
    
    // Lado Derecho (Right): Arriba a Abajo
    if (sideIndex === 3) {
      const { startOffset, span } = getPerimeterSpan(posInSide - 1, 15, SIDE_LENGTH);
      const rowStart = 3 + startOffset;
      return { gridColumn: `45 / span 2`, gridRow: `${rowStart} / span ${span}`, rotation: -90, isDiagonal: false };
    }
  }
  
  // === DIAGONALES (64-99) ===
  const diagIndex = index - PERIMETER_TILES;
  const armIndex = Math.floor(diagIndex / TILES_PER_DIAGONAL);
  const posInArm = diagIndex % TILES_PER_DIAGONAL; // 0 (outer) to 8 (inner)
  const isEntry = posInArm === 0; 
  
  // CONFIGURACIÓN DE DIAGONALES
  // Start Offset 3: Puts entry near corner (3), Tip (8) at 19.
  // This leaves 22, 23, 24 open in the center.
  const startOffset = 3; 
  const step = 2;
  const currentPos = startOffset + (posInArm * step);

  // Diagonal Top-Left (64-72) -> From (3,3) inwards
  if (armIndex === 0) {
    return { gridColumn: `${currentPos} / span 3`, gridRow: `${currentPos} / span 3`, rotation: 45, isDiagonal: true, isDiagonalEntry: isEntry };
  }
  // Diagonal Top-Right (73-81) -> From (42,3) inwards
  else if (armIndex === 1) {
    const col = (GRID_SIZE + 1) - (currentPos + 3); 
    const row = currentPos;
    return { gridColumn: `${col} / span 3`, gridRow: `${row} / span 3`, rotation: -45, isDiagonal: true, isDiagonalEntry: isEntry };
  }
  // Diagonal Bottom-Left (82-90) -> From (3, 42) inwards
  else if (armIndex === 2) {
    const col = currentPos;
    const row = (GRID_SIZE + 1) - (currentPos + 3);
    return { gridColumn: `${col} / span 3`, gridRow: `${row} / span 3`, rotation: -45, isDiagonal: true, isDiagonalEntry: isEntry };
  }
  // Diagonal Bottom-Right (91-99) -> From (42, 42) inwards
  else {
    const pos = (GRID_SIZE + 1) - (currentPos + 3);
    return { gridColumn: `${pos} / span 3`, gridRow: `${pos} / span 3`, rotation: 45, isDiagonal: true, isDiagonalEntry: isEntry };
  }
};
