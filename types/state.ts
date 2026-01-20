
import { Player } from './player';
import { TileData } from './board';
import { AuctionState, TradeOffer, Loan, LoanPool, FinancialOption, Listing } from './economy';
import { GovConfig, GovernmentType, Greyhound, RentFilter } from './config';
import { Question } from '../data/quizData'; // Import Question

export const INITIAL_MONEY = 1500;

export interface Card {
    suit: '♥' | '♦' | '♣' | '♠';
    rank: string;
    value: number;
    isHidden?: boolean;
}

export type WeatherType = 'sunny' | 'rain' | 'heatwave';

export interface WorldState {
    isNight: boolean;
    weather: WeatherType;
    dayCount: number;
    forecast: WeatherType[]; // NEW: Queue of upcoming weather
}

export interface ElectionState {
    isOpen: boolean;
    votes: Record<string, number>; // GovType -> Count
    votedPlayers: number[];
}

export interface QuizState {
    isOpen: boolean;
    mode: 'maldini' | 'salseo';
    pot: number;
    activePlayers: number[]; // Player IDs remaining
    currentQuestion: Question | null;
    currentOptions: string[]; 
    correctOptionIdx: number; 
    currentTurnPlayerId: number | null;
    phase: 'intro' | 'question' | 'result' | 'winner'; 
    lastResult?: { correct: boolean, correctAnswer: string }; 
}

export interface PokemonState {
    isOpen: boolean;
    tileId: number; // The gym tile
    rentBase: number; // The original rent amount
    streak: number; // Current wins (Target 5)
    playerMon: any; // Pokemon Object
    enemyMon: any; // Pokemon Object
    turn: 'player' | 'enemy' | 'end';
    logs: string[];
    phase: 'intro' | 'battle' | 'victory' | 'defeat';
}

export interface GameState {
  // Core
  players: Player[];
  tiles: TileData[];
  currentPlayerIndex: number;
  rolled: boolean;
  dice: number[]; 
  logs: string[];
  turnCount: number;
  gameStarted: boolean;
  
  // Interaction
  auction: AuctionState | null;
  trade: TradeOffer | null;
  selectedTileId: number | null;
  quiz?: QuizState | null; 
  pokemon?: PokemonState | null; // NEW POKEMON STATE
  
  // Economy & Gov
  estadoMoney: number;
  fbiPot: number; 
  gov: GovernmentType;
  govTurnsLeft: number;
  currentGovConfig: GovConfig;
  bankCorrupt: boolean;
  taxPot: number;
  loans: Loan[]; 
  loanPools: LoanPool[]; 
  financialOptions: FinancialOption[]; 
  marketListings: Listing[]; 
  housesAvail: number;
  hotelsAvail: number;

  // EXTRAS: Bundles & Anti-Abuse
  bundleListings: { id: string, tiles: number[], minPrice: number }[];
  cooldowns: Record<string, { pair: string, until: number }>;
  flags: { collusion: any[] };

  // RISK & AI
  meta: {
      aiLearn: { colorAdj: Record<string, number> };
      insider: { committed: string | null };
  };
  
  // NEW FEATURES v3
  world: WorldState;
  election: ElectionState | null;
  showDarkWeb: boolean;
  showGovGuide: boolean; 
  showWeatherModal: boolean; // NEW: Forecast UI Toggle
  
  // Metrics History for Sparklines
  metrics: Record<number, { turn: number, money: number, netWorth: number }[]>;

  // Movement & Graph
  pendingMoves: number; 
  movementOptions: number[]; 
  isMoving: boolean; 
  lastMovementPos: number | null; 
  transportOptions?: number[]; 
  flightMode?: boolean; 

  // Modals & UI
  showBankModal: boolean;
  showLoansModal: boolean;
  showTradeModal: boolean;
  showBalanceModal: boolean; 
  showSlots: boolean; 
  showCasinoModal: boolean;
  showSlotsModal: boolean; 
  casinoGame?: 'blackjack' | 'roulette' | null;
  casinoPlays: number; 
  showHeatmap: boolean; 
  slotsData?: { r1: string, r2: string, r3: string, win: boolean, msg: string, payout: number };
  heatmap: Record<number, number>; 
  
  // Roulette Specific
  rouletteState?: {
      winningNumber: number;
      totalWinnings: number;
      netOwnerChange: number;
      history: number[];
  };

  // Blackjack Specific
  blackjackState?: {
      deck: Card[];
      playerHand: Card[];
      dealerHand: Card[];
      bet: number;
      phase: 'betting' | 'playing' | 'dealer' | 'result';
      resultMsg: string;
      payout: number;
  };

  // Events & Minigames
  activeEvent: { title: string, description: string } | null;
  showGreyhounds: boolean;
  greyhounds: Greyhound[];
  greyhoundPot: number;
  greyhoundBets: Record<number, number>; 
  
  // Advanced Modifiers
  rentEventMul?: number; 
  rentEventTurns?: number;
  buildEventMul?: number; 
  buildEventTurns?: number;
  rentFilters: RentFilter[]; 
  rentCap?: { amount: number, turns: number } | null; 
  blockMortgage: Record<number, number>; 
  blockBuildTurns: number; 
  sellBonusByOwner: Record<number, number>; 
  nextEventId?: string | null; 
  
  // Roles Data
  fbiGuesses: Record<number, Record<number, string>>; 
  vatIn: number;  
  vatOut: number; 
  fbiExpropriationSlots?: number; // FBI Reward
  
  // Flags
  usedTransportHop: boolean;
  rngSeed: number; 
}
