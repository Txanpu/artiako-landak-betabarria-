
import React, { useState, useEffect, useReducer, useRef } from 'react';
import { Board } from './components/Board';
import { DebugPanel } from './components/DebugPanel';
import { GameSidebar } from './components/GameSidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { GameHUD } from './components/GameHUD';
import { SetupModal } from './components/modals/SetupModal';
import { CasinoModal } from './components/modals/CasinoModal';
import { SlotsModal } from './components/modals/SlotsModal';
import { BankModal } from './components/modals/BankModal';
import { TradeModal } from './components/modals/TradeModal';
import { AuctionModal } from './components/modals/AuctionModal';
import { TileModal } from './components/modals/TileModal';
import { GreyhoundModal } from './components/modals/GreyhoundModal';
import { BalanceModal } from './components/modals/BalanceModal';
import { DarkWebModal } from './components/modals/DarkWebModal'; 
import { ElectionModal } from './components/modals/ElectionModal';
import { QuizModal } from './components/modals/QuizModal';
import { PokemonModal } from './components/modals/PokemonModal'; 
import { GovGuideModal } from './components/modals/GovGuideModal'; 
import { WeatherModal } from './components/modals/WeatherModal'; 
import { FbiModal } from './components/modals/FbiModal'; // NEW
import { GameState } from './types';
import { createInitialState, makeHistory, makeWatchdog } from './utils/gameLogic';
import { gameReducer } from './utils/gameReducer';
import { useGameBots } from './hooks/useGameBots';
import { useDiceAnimation } from './hooks/useDiceAnimation';

// Bumped to v7 to force reset after board resize
const SAVE_KEY = 'artiako_landak_save_v7';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const [setupOpen, setSetupOpen] = useState(true);
  
  // Custom Hooks
  const { isRolling, displayDice, handleRollDice } = useDiceAnimation(state, dispatch);
  useGameBots(state, dispatch);
  
  const historyRef = useRef(makeHistory<GameState>());
  const watchdogRef = useRef(makeWatchdog(5000));

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key.toLowerCase() === 's') { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); alert('💾 Guardado'); }
    if (e.key.toLowerCase() === 'l') { const saved = localStorage.getItem(SAVE_KEY); if (saved) dispatch({type:'LOAD_GAME', payload: JSON.parse(saved)}); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (historyRef.current.canUndo()) {
            const prev = historyRef.current.undo();
            if (prev) dispatch({ type: 'RESTORE_STATE', payload: prev });
        }
    }
  };
  useEffect(() => { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [state]);

  useEffect(() => {
      historyRef.current.snapshot(state);
  }, [state.turnCount, state.currentPlayerIndex]);

  const currentPlayer = state.players[state.currentPlayerIndex];
  
  return (
    <div className="flex w-screen h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans">
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#050505]">
        
        {/* New Floating HUD (Replaces old weather/gov displays) */}
        <GameHUD state={state} dispatch={dispatch} />

        <div className="absolute inset-0 flex items-center justify-center p-2 md:p-8 z-0">
            <Board 
                state={state} 
                onTileClick={(id) => dispatch({type: 'SELECT_TILE', payload: id})} 
                focusId={currentPlayer?.pos} 
            />
        </div>
        <DebugPanel state={state} dispatch={dispatch} />
      </div>

      {/* Desktop Sidebar */}
      <GameSidebar 
          state={state}
          dispatch={dispatch}
          isRolling={isRolling}
          displayDice={displayDice}
          onRoll={handleRollDice}
          onReset={() => setSetupOpen(true)}
          onUndo={() => { if(historyRef.current.canUndo()) dispatch({type: 'RESTORE_STATE', payload: historyRef.current.undo()}) }}
          canUndo={historyRef.current.canUndo()}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar 
          state={state}
          dispatch={dispatch}
          isRolling={isRolling}
          displayDice={displayDice}
          onRoll={handleRollDice}
          onReset={() => setSetupOpen(true)}
          onUndo={() => { if(historyRef.current.canUndo()) dispatch({type: 'RESTORE_STATE', payload: historyRef.current.undo()}) }}
          canUndo={historyRef.current.canUndo()}
      />

      <TradeModal state={state} dispatch={dispatch} />
      <BankModal state={state} dispatch={dispatch} />
      <AuctionModal state={state} dispatch={dispatch} />
      <CasinoModal state={state} dispatch={dispatch} />
      <SlotsModal state={state} dispatch={dispatch} />
      <TileModal state={state} dispatch={dispatch} />
      <GreyhoundModal state={state} dispatch={dispatch} />
      <BalanceModal state={state} dispatch={dispatch} />
      <DarkWebModal state={state} dispatch={dispatch} />
      <ElectionModal state={state} dispatch={dispatch} />
      <QuizModal state={state} dispatch={dispatch} /> 
      <PokemonModal state={state} dispatch={dispatch} />
      <GovGuideModal state={state} dispatch={dispatch} />
      <WeatherModal state={state} dispatch={dispatch} />
      <FbiModal state={state} dispatch={dispatch} />

      {setupOpen && <SetupModal onStartGame={(p) => { dispatch({type:'START_GAME', payload: p}); setSetupOpen(false); }} />}
      
      {state.activeEvent && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95"><div className="bg-slate-900 text-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-purple-500 relative overflow-hidden"><h3 className="text-2xl font-black mb-2 uppercase tracking-wide text-purple-400">{state.activeEvent.title}</h3><p className="text-gray-300 text-lg mb-6 leading-relaxed">{state.activeEvent.description}</p><button onClick={() => dispatch({type: 'CLOSE_EVENT'})} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-500 transition w-full shadow-lg">Entendido</button></div></div>)}
    </div>
  );
};

export default App;
