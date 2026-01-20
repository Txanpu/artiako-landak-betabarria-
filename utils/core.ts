
import { GameState, TileData, Player } from '../types';

export const seedFromString = (s: string) => {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return h >>> 0;
};

export const formatMoney = (amount: number) => `$${Math.round(amount)}`;

// Updated to N dice (0-9 values)
export const rollDice = (count: number = 2): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 10));
};

export const getNextPlayerIndex = (state: GameState): number => {
  if (state.players.length === 0) return 0;
  let next = (state.currentPlayerIndex + 1) % state.players.length;
  let loopCount = 0;
  while (loopCount < state.players.length) {
      const p = state.players[next];
      if (!p.alive) next = (next + 1) % state.players.length;
      else break; 
      loopCount++;
  }
  return next;
};

export const validateState = (state: GameState, TILES: TileData[]): string[] => {
    const errs: string[] = [];
    try {
      if (!Array.isArray(state.players)) errs.push('players no es array');
      state.players?.forEach((p, idx) => {
        if (typeof p.money !== 'number') errs.push(`p${idx}.money inválido`);
        if (p.pos < 0 || p.pos >= TILES.length) errs.push(`p${idx}.pos fuera de rango`);
      });
    } catch (e: any) { errs.push('Excepción en validate: ' + e.message); }
    return errs;
};

export const repairState = (state: GameState, TILES: TileData[]): GameState => {
    const newState = { ...state };
    newState.players.forEach(p => {
      if (!Number.isFinite(p.money)) p.money = 0;
      p.pos = Math.max(0, Math.min(Math.trunc(p.pos || 0), TILES.length - 1));
    });
    return newState;
};

export const makeHistory = <T>(max = 30) => {
    const stack: T[] = [];
    let idx = -1;
    return {
      snapshot(state: T) {
        const snap = structuredClone(state);
        stack.splice(idx + 1);
        stack.push(snap);
        if (stack.length > max) { stack.shift(); } else { idx++; }
      },
      canUndo() { return idx > 0; },
      canRedo() { return idx < stack.length - 1; },
      undo() { if (idx > 0) return structuredClone(stack[--idx]); },
      peek() { return structuredClone(stack[idx]); }
    };
};

export const makeWatchdog = (ms = 3000) => {
    let timer: any = null;
    return {
      arm(tag = 'op') { clearTimeout(timer); timer = setTimeout(() => { console.error('Watchdog:', tag); }, ms); },
      disarm() { clearTimeout(timer); timer = null; }
    };
};
