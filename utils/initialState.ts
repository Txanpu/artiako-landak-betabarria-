
import { GameState, GovernmentType, WeatherType } from '../types';
import { INITIAL_TILES } from '../constants';
import { GOV_CONFIGS } from './roles';
import { seedFromString } from './core';

export const createInitialState = (): GameState => {
  const govTypes: GovernmentType[] = ['left', 'right', 'authoritarian', 'libertarian', 'anarchy'];
  const startGov = govTypes[Math.floor(Math.random() * govTypes.length)];
  
  // Generate initial forecast
  const forecast: WeatherType[] = [];
  for(let i=0; i<5; i++) {
      const r = Math.random();
      if (r < 0.6) forecast.push('sunny');
      else if (r < 0.9) forecast.push('rain');
      else forecast.push('heatwave');
  }

  return {
      players: [],
      tiles: JSON.parse(JSON.stringify(INITIAL_TILES)),
      currentPlayerIndex: 0,
      rolled: false,
      dice: [0, 0],
      logs: ['Bienvenido a Artiako Landak!'],
      auction: null,
      trade: null,
      estadoMoney: 0, 
      fbiPot: 0,
      turnCount: 0,
      gov: startGov,
      govTurnsLeft: 7,
      currentGovConfig: GOV_CONFIGS[startGov], 
      gameStarted: false,
      selectedTileId: null,
      
      // MOVEMENT STATE
      pendingMoves: 0,
      movementOptions: [],
      isMoving: false,
      lastMovementPos: null,

      bankCorrupt: true, 
      taxPot: 0,
      loans: [],
      loanPools: [],
      financialOptions: [],
      marketListings: [],
      
      // Extras
      bundleListings: [],
      cooldowns: {},
      flags: { collusion: [] },
      
      // Risk
      meta: {
          aiLearn: { colorAdj: {} },
          insider: { committed: null }
      },
      
      // NEW FEATURES
      world: { isNight: false, weather: 'sunny', dayCount: 0, forecast: forecast },
      election: null,
      showDarkWeb: false,
      showGovGuide: false, 
      showWeatherModal: false, 
      showFbiModal: false, 
      showAvatarSelection: false, 
      showLogsModal: false, 
      hideHud: false, // NEW
      
      // UI Metrics
      metrics: {},

      showBankModal: false,
      showLoansModal: false,
      showTradeModal: false,
      preselectedTradeTarget: null, // NEW
      showBalanceModal: false,
      showSlots: false,
      showCasinoModal: false,
      showSlotsModal: false,
      casinoGame: null,
      casinoPlays: 0,
      showHeatmap: false,
      viewFullBoard: false, // Default zoom level normal
      activeEvent: null,
      showGreyhounds: false,
      greyhounds: [],
      greyhoundPot: 0,
      greyhoundBets: {},
      housesAvail: 32,
      hotelsAvail: 12,
      usedTransportHop: false,
      
      // Advanced Event State
      rentEventMul: 1,
      rentEventTurns: 0,
      rentFilters: [],
      blockMortgage: {},
      blockBuildTurns: 0,
      sellBonusByOwner: {},
      rentCap: null,
      nextEventId: null,
      
      // Graphics
      heatmap: {},
      
      // Roles
      fbiGuesses: {},
      vatIn: 0,
      vatOut: 0,

      // Utils
      rngSeed: seedFromString(new Date().toISOString())
  };
};
