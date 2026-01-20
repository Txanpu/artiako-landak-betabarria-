
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
            // Logic to determine mode and participants
            // Left Gov = Mode B (Salseo) for Heli/Female/Marcianito
            // Others = Mode A (Maldini) for Males
            const isLeft = state.gov === 'left';
            const mode = isLeft ? 'salseo' : 'maldini';
            
            // Only players present on the tile or everyone? 
            // Prompt said "only accessible if someone is there" -> handled in Modal UI trigger.
            // But once started, who participates? 
            // "Todos participan (según el gobierno)" -> The original prompt.
            // "Muerte Súbita" usually means everyone available competes.
            
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
                logs: [`🏟️ ¡Empieza el Quiz Maldini! Bote: ${formatMoney(pot)}`, ...state.logs]
            };
        }

        case 'QUIZ_NEXT_QUESTION': {
            if (!state.quiz) return state;
            
            // Logic to check if we just had an elimination or correct answer
            // and rotate to the next player
            let active = [...state.quiz.activePlayers];
            
            if (state.quiz.lastResult) {
                // Determine next player based on who just played
                const lastId = state.quiz.currentTurnPlayerId;
                const lastIdx = active.indexOf(lastId!);
                
                if (!state.quiz.lastResult.correct) {
                    // Elimination Logic happened in QUIZ_ANSWER
                    // If player was removed, `active` array passed here is already updated in QUIZ_ANSWER
                    // Wait, QUIZ_ANSWER handles state update. 
                    // Let's check `QUIZ_ANSWER` logic below. 
                    // It removes player. So we just need to rotate index.
                    // If index 0 was removed, new player at index 0 is next. 
                    // If index 1 was removed (in array of 3), new index 1 is next.
                    // So we need to store the `lastIndex` before removal?
                    // Simplified: Just update `currentTurnPlayerId` in QUIZ_ANSWER to the next person immediately.
                    // But here we generate the question.
                }
            }

            // --- WINNER CHECK ---
            if (active.length <= 1) {
                 return quizReducer(state, { type: 'QUIZ_CHECK_WINNER' });
            }

            // Pick Next Player (Round Robin)
            // If `currentTurnPlayerId` is null (start), pick [0].
            // Else find index. 
            let nextPlayerId: number;
            
            if (state.quiz.currentTurnPlayerId === null) {
                nextPlayerId = active[0];
            } else {
                // Find current player in the active list
                const currentIdx = active.indexOf(state.quiz.currentTurnPlayerId);
                
                if (currentIdx === -1) {
                    // Current player was eliminated and removed from list. 
                    // We need a way to track where we were. 
                    // For simplicity in this reducer structure: 
                    // Random pick? No.
                    // Let's assume the player *after* the eliminated one goes next.
                    // If P1 (idx 0) removed, P2 shifts to idx 0. So we take idx 0.
                    // But we don't know the old index here easily.
                    // HACK: Pick random to avoid stale state issues, or just [0]
                    // Better: We will handle next ID calculation in QUIZ_ANSWER and store it if needed.
                    // Let's try simple rotation:
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
                // Avoid duplicate answers and avoid the correct answer
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
            
            // Calculate Next Player ID *before* removing (to maintain order)
            const currentIdx = newActive.indexOf(pId);
            let nextPlayerId = pId; // Placeholder

            if (isCorrect) {
                newLogs = [`✅ ${player?.name} acierta la pregunta.`, ...newLogs];
                // Next player is the one after me
                nextPlayerId = newActive[(currentIdx + 1) % newActive.length];
            } else {
                newLogs = [`❌ ${player?.name} ha fallado y queda ELIMINADO.`, ...newLogs];
                // Remove me
                newActive.splice(currentIdx, 1);
                // Next player is the one who slid into my index (or 0 if I was last)
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
                    // We temporarily set currentTurnPlayerId to the NEXT one here? 
                    // No, keep it as current for the Result display ("Player X was eliminated").
                    // But we store 'nextPlayerId' implicitly by updating activePlayers list 
                    // and letting QUIZ_NEXT_QUESTION logic handle finding the next based on ID?
                    // Actually, let's pre-set the ID for next turn in a way QUIZ_NEXT_QUESTION respects.
                    // We will set currentTurnPlayerId to `nextPlayerId` NOW, 
                    // BUT for the "Result" view we might want to know who *just* played.
                    // However, `QuizModal` uses `currentPlayer` for "Turno de:".
                    // If we change it now, "Turno de:" changes during the "CORRECT!" screen.
                    // Let's keep it same, but handle rotation in QUIZ_NEXT_QUESTION strictly using `nextPlayerId` logic?
                    // Or simpler: Just set it now and accept the UI shift?
                    // User experience: click -> "CORRECT" -> wait -> New Question/Player.
                    // We'll stick to: Keep ID, let NEXT_QUESTION handle logic.
                    // But NEXT_QUESTION needs to know if I was removed.
                    // HACK: If I am removed, I am not in `activePlayers`. 
                    // `QUIZ_NEXT_QUESTION` sees ID not in list -> pick `activePlayers[oldIndex]`.
                    // But `oldIndex` is lost.
                    // SOLUTION: Store `nextTurnPlayerId` in state temporarily? No, messy.
                    // Let's simply update `currentTurnPlayerId` to `nextPlayerId` HERE.
                    // And in QuizModal, if phase is 'result', display "Result for previous player" if we tracked it?
                    // Or just let UI update. "CORRECT!" overlay is big enough to hide the name change behind it.
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
                // CONTINUE GAME (Next Question)
                // This state update just triggers the UI to ask for next question or auto-transition
                return state;
            }
        }

        case 'CLOSE_QUIZ': {
            return { ...state, quiz: null };
        }

        default: return state;
    }
};
