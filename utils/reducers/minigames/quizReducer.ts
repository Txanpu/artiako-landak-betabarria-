
import { GameState } from '../../../types';
import { FOOTBALL_QUESTIONS, GOSSIP_QUESTIONS } from '../../../data/quizData';
import { formatMoney } from '../../gameLogic';

// Helper to shuffle array
const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const quizReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_QUIZ': {
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];

            if (player.playedMinigames?.includes('quiz')) {
                return { ...state, logs: ['🚫 Ya has participado en el Quiz este turno.', ...state.logs] };
            }

            // Mark as played
            const newPlayers = [...state.players];
            newPlayers[pIdx] = { ...player, playedMinigames: [...(player.playedMinigames || []), 'quiz'] };

            // Logic to determine mode and participants
            // Left Gov = Mode B (Salseo) for Heli/Female/Marcianito
            // Others = Mode A (Maldini) for Males
            const isLeft = state.gov === 'left';
            const mode = isLeft ? 'salseo' : 'maldini';
            
            const participants = state.players.filter(p => {
                if (!p.alive) return false;
                if (isLeft) return ['female', 'helicoptero', 'marcianito'].includes(p.gender);
                return p.gender === 'male';
            }).map(p => p.id);

            // Fallback: If no valid participants for the mode, take everyone
            const activePlayers = participants.length > 0 
                ? participants 
                : state.players.filter(p => p.alive).map(p => p.id);

            const pot = Math.floor(state.estadoMoney * 0.5);

            return {
                ...state,
                players: newPlayers,
                quiz: {
                    isOpen: true,
                    mode,
                    pot,
                    activePlayers,
                    currentQuestion: null,
                    currentOptions: [],
                    correctOptionIdx: -1,
                    currentTurnPlayerId: null,
                    phase: 'intro'
                },
                logs: [`🏟️ ¡Empieza el Quiz ${mode === 'maldini' ? 'Maldini' : 'Salseo'}! Bote: ${formatMoney(pot)}`, ...state.logs]
            };
        }

        case 'QUIZ_NEXT_QUESTION': {
            if (!state.quiz) return state;
            
            let active = [...state.quiz.activePlayers];
            
            if (state.quiz.lastResult) {
                const lastId = state.quiz.currentTurnPlayerId;
                const lastIdx = active.indexOf(lastId!);
            }

            // --- WINNER CHECK ---
            if (active.length <= 1) {
                 return quizReducer(state, { type: 'QUIZ_CHECK_WINNER' });
            }

            let nextPlayerId: number;
            
            if (state.quiz.currentTurnPlayerId === null) {
                nextPlayerId = active[0];
            } else {
                const currentIdx = active.indexOf(state.quiz.currentTurnPlayerId);
                
                if (currentIdx === -1) {
                    nextPlayerId = active[0]; // Fallback
                } else {
                    // Player survived, go next
                    nextPlayerId = active[(currentIdx + 1) % active.length];
                }
            }

            // 1. Get Question
            const deck = state.quiz.mode === 'maldini' ? FOOTBALL_QUESTIONS : GOSSIP_QUESTIONS;
            const qIndex = Math.floor(Math.random() * deck.length);
            const question = deck[qIndex];

            // 2. Generate Distractors (Wrong Answers)
            const distractors: string[] = [];
            while (distractors.length < 3) {
                const rand = deck[Math.floor(Math.random() * deck.length)];
                if (rand.a !== question.a && !distractors.includes(rand.a)) {
                    distractors.push(rand.a);
                }
            }

            // 3. Create Options Array
            const options = shuffle([question.a, ...distractors]);
            const correctIdx = options.indexOf(question.a);

            return {
                ...state,
                quiz: {
                    ...state.quiz,
                    currentQuestion: question,
                    currentOptions: options,
                    correctOptionIdx: correctIdx,
                    currentTurnPlayerId: nextPlayerId,
                    phase: 'question',
                    lastResult: undefined
                }
            };
        }

        case 'QUIZ_ANSWER': {
            if (!state.quiz) return state;
            const { selectedIdx } = action.payload; // 0, 1, 2, 3

            const isCorrect = selectedIdx === state.quiz.correctOptionIdx;
            const pId = state.quiz.currentTurnPlayerId!;
            const player = state.players.find(p => p.id === pId);
            
            let newActive = [...state.quiz.activePlayers];
            let newLogs = [...state.logs];
            
            const currentIdx = newActive.indexOf(pId);
            let nextPlayerId = pId; // Placeholder

            if (isCorrect) {
                newLogs = [`✅ ${player?.name} acierta la pregunta.`, ...newLogs];
                nextPlayerId = newActive[(currentIdx + 1) % newActive.length];
            } else {
                newLogs = [`❌ ${player?.name} ha fallado y queda ELIMINADO.`, ...newLogs];
                newActive.splice(currentIdx, 1);
                if (newActive.length > 0) {
                    nextPlayerId = newActive[currentIdx % newActive.length];
                } else {
                    nextPlayerId = -1; // Everyone died
                }
            }

            return {
                ...state,
                quiz: {
                    ...state.quiz,
                    phase: 'result',
                    activePlayers: newActive,
                    currentTurnPlayerId: nextPlayerId, 
                    lastResult: {
                        correct: isCorrect,
                        correctAnswer: state.quiz.currentOptions[state.quiz.correctOptionIdx]
                    }
                },
                logs: newLogs
            };
        }

        case 'QUIZ_CHECK_WINNER': {
            if (!state.quiz) return state;
            
            const active = state.quiz.activePlayers;

            if (active.length === 1) {
                // WINNER
                const winnerId = active[0];
                const winner = state.players.find(p => p.id === winnerId);
                const pot = state.quiz.pot;

                const newPlayers = state.players.map(p => {
                    if (p.id === winnerId) return { ...p, money: p.money + pot };
                    return p;
                });

                return {
                    ...state,
                    players: newPlayers,
                    estadoMoney: state.estadoMoney - pot,
                    quiz: { ...state.quiz, phase: 'winner' },
                    logs: [`🏆 ¡${winner?.name} GANA EL QUIZ! Se lleva el bote de ${formatMoney(pot)}.`, ...state.logs]
                };
            } else if (active.length === 0) {
                // NO ONE WINS (Bank keeps money)
                return {
                    ...state,
                    quiz: { ...state.quiz, phase: 'winner' },
                    logs: [`☠️ Todos han sido eliminados. El Estado se queda con el dinero.`, ...state.logs]
                };
            } else {
                return state;
            }
        }

        case 'CLOSE_QUIZ': {
            return { ...state, quiz: null };
        }

        default: return state;
    }
};
