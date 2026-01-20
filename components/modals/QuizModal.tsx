
import React, { useEffect, useState } from 'react';
import { GameState } from '../../types';
import { formatMoney } from '../../utils/gameLogic';

interface QuizModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const QuizModal: React.FC<QuizModalProps> = ({ state, dispatch }) => {
    // Auto-transition effect for results
    useEffect(() => {
        let timer: any;
        if (state.quiz?.phase === 'result') {
            timer = setTimeout(() => {
                // Check if winner or next question
                if (state.quiz?.activePlayers.length! <= 1) {
                    dispatch({ type: 'QUIZ_CHECK_WINNER' });
                } else {
                    dispatch({ type: 'QUIZ_NEXT_QUESTION' });
                }
            }, 2500); // Show result for 2.5 seconds
        }
        return () => clearTimeout(timer);
    }, [state.quiz?.phase, state.quiz?.activePlayers.length, dispatch]);

    if (!state.quiz || !state.quiz.isOpen) return null;

    const { mode, pot, phase, currentQuestion, currentOptions, currentTurnPlayerId, activePlayers, lastResult } = state.quiz;
    const isMaldini = mode === 'maldini';
    const currentPlayer = state.players.find(p => p.id === currentTurnPlayerId);

    // Styles
    const bgStyle = isMaldini ? 'bg-green-950' : 'bg-fuchsia-950';
    const borderStyle = isMaldini ? 'border-green-500' : 'border-pink-500';
    const accentColor = isMaldini ? 'text-green-400' : 'text-pink-400';
    const title = isMaldini ? '⚽ QUIZ MALDINI' : '💅 QUIZ SALSEO';
    const icon = isMaldini ? '🥅' : '💄';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in zoom-in-95 font-sans">
            <div className={`w-full max-w-4xl ${bgStyle} rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 ${borderStyle} overflow-hidden relative flex flex-col min-h-[500px]`}>
                
                {/* Header */}
                <div className="bg-black/40 p-6 flex justify-between items-center border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl filter drop-shadow-lg">{icon}</span>
                        <div>
                            <h2 className={`text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)]`}>{title}</h2>
                            <div className={`${accentColor} text-sm font-bold uppercase tracking-widest`}>Muerte Súbita</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Bote en juego</div>
                        <div className="text-4xl font-mono font-black text-yellow-400 drop-shadow-md">{formatMoney(pot)}</div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col items-center justify-center w-full relative">
                    
                    {/* Phase: INTRO */}
                    {phase === 'intro' && (
                        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-8">
                            <div className="text-white text-xl mb-8 font-light text-center max-w-lg">
                                <strong className="text-yellow-400 font-bold">REGLAS:</strong><br/>
                                1. Una pregunta, cuatro opciones.<br/>
                                2. Si fallas, estás <strong>ELIMINADO</strong>.<br/>
                                3. El último en pie se lleva el bote.
                            </div>
                            
                            <div className="bg-black/30 p-6 rounded-2xl border border-white/10 mb-8 w-full max-w-2xl">
                                <h3 className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest text-center">Concursantes Activos</h3>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {activePlayers.map(id => {
                                        const p = state.players.find(pl => pl.id === id);
                                        return (
                                            <span key={id} className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg transform hover:scale-110 transition-transform cursor-default border-2 border-transparent hover:border-yellow-400">
                                                {p?.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => dispatch({type: 'QUIZ_NEXT_QUESTION'})}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-2xl py-4 px-16 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] transform hover:scale-105 transition-all border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2"
                            >
                                ¡EMPEZAR!
                            </button>
                        </div>
                    )}

                    {/* Phase: QUESTION & RESULT */}
                    {(phase === 'question' || phase === 'result') && currentQuestion && (
                        <div className="w-full max-w-3xl flex flex-col h-full animate-in fade-in">
                            
                            {/* Player Info */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-black/50 px-8 py-2 rounded-full border border-white/20 flex items-center gap-3">
                                    <span className="text-gray-400 text-xs uppercase font-bold">Turno de</span>
                                    <span className="text-2xl font-bold text-white" style={{color: currentPlayer?.color}}>{currentPlayer?.name}</span>
                                </div>
                            </div>

                            {/* Question Box */}
                            <div className="bg-gradient-to-b from-blue-900 to-blue-950 p-8 rounded-2xl w-full border-2 border-blue-500 shadow-2xl mb-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                                <p className="text-3xl text-white font-medium text-center leading-tight drop-shadow-md relative z-10">
                                    {currentQuestion.q}
                                </p>
                            </div>

                            {/* Options Grid (Increased Gap) */}
                            <div className="grid grid-cols-2 gap-6 w-full flex-1">
                                {currentOptions.map((opt, idx) => {
                                    const labels = ['A', 'B', 'C', 'D'];
                                    
                                    // Determine visual state
                                    let btnClass = "bg-slate-800 hover:bg-slate-700 border-slate-600 text-white hover:border-white/50"; // Default
                                    
                                    if (phase === 'result' && lastResult) {
                                        if (opt === lastResult.correctAnswer) {
                                            btnClass = "bg-green-600 border-green-400 text-white animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.6)]"; // Correct Answer
                                        } else if (!lastResult.correct && idx === currentOptions.indexOf(opt) && state.quiz!.lastResult!.correctAnswer !== opt) {
                                            btnClass = "bg-slate-800 opacity-30 border-slate-700 grayscale"; // Dim others
                                        } else {
                                            btnClass = "bg-slate-800 opacity-30 border-slate-700 grayscale"; // Dim others
                                        }
                                    }

                                    return (
                                        <button 
                                            key={idx}
                                            disabled={phase === 'result'}
                                            onClick={() => dispatch({type: 'QUIZ_ANSWER', payload: {selectedIdx: idx}})}
                                            className={`relative py-6 px-8 rounded-2xl border-4 shadow-xl transition-all transform active:scale-95 text-left flex items-center gap-4 group ${btnClass}`}
                                        >
                                            <span className="text-yellow-500 font-black text-3xl group-hover:scale-110 transition-transform drop-shadow-md">{labels[idx]}</span>
                                            <span className="text-xl font-bold leading-tight tracking-wide">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Result Message Overlay */}
                            {phase === 'result' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                    <div className={`text-6xl font-black uppercase px-12 py-6 rounded-2xl shadow-2xl border-8 transform rotate-[-5deg] animate-in zoom-in duration-300 ${lastResult?.correct ? 'bg-green-600 border-green-300 text-white' : 'bg-red-600 border-red-300 text-white'}`}>
                                        {lastResult?.correct ? '¡CORRECTO!' : '¡ELIMINADO!'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Phase: WINNER */}
                    {phase === 'winner' && (
                        <div className="text-center animate-in zoom-in duration-500 flex flex-col items-center">
                            <div className="text-8xl mb-6 filter drop-shadow-[0_0_20px_gold]">🏆</div>
                            <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">¡TENEMOS GANADOR!</h2>
                            <div className="text-4xl text-yellow-400 font-black mb-8 bg-black/50 px-8 py-4 rounded-xl border border-yellow-500 shadow-xl">
                                {activePlayers.length > 0 
                                    ? state.players.find(p => p.id === activePlayers[0])?.name 
                                    : "EL ESTADO (Nadie ganó)"
                                }
                            </div>
                            <button 
                                onClick={() => dispatch({type: 'CLOSE_QUIZ'})}
                                className="bg-white text-black font-black py-4 px-12 rounded-full shadow-2xl hover:bg-gray-200 transition-all text-xl"
                            >
                                CERRAR Y COBRAR
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
