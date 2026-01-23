
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

export const BoatRaceModal: React.FC<Props> = ({ state, dispatch }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const requestRef = useRef<number>(0);
    const gameRef = useRef({
        playerLeft: 180,
        obstacles: [] as { x: number, y: number }[],
        score: 0,
        gameRunning: true,
        speed: 3
    });

    useEffect(() => {
        if (!state.boatRace?.isOpen) return;

        // Reset Game State
        gameRef.current = {
            playerLeft: 180,
            obstacles: [],
            score: 0,
            gameRunning: true,
            speed: 3
        };
        setScore(0);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loop = () => {
            if (!gameRef.current.gameRunning) return;

            const g = gameRef.current;

            // Clear
            ctx.fillStyle = '#0077be';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Spawn Obstacles (Prob 2%)
            if (Math.random() < 0.02) {
                g.obstacles.push({ x: Math.floor(Math.random() * (canvas.width - 30)), y: -40 });
            }

            // Move & Draw Obstacles
            ctx.font = '30px Arial';
            ctx.textBaseline = 'top';
            
            // Filter obstacles out that are off screen
            for (let i = g.obstacles.length - 1; i >= 0; i--) {
                let ob = g.obstacles[i];
                ob.y += g.speed;

                // Draw Rock
                ctx.fillText('🪨', ob.x, ob.y);

                // Collision Detection
                // Player: ~40px wide, at bottom 20px. 
                // Hitbox approx: x: playerLeft, y: canvas.height - 60, w: 40, h: 40
                // Rock: x: ob.x, y: ob.y, w: 30, h: 30
                const pRect = { x: g.playerLeft, y: canvas.height - 60, w: 30, h: 30 };
                const oRect = { x: ob.x, y: ob.y, w: 25, h: 25 };

                if (
                    pRect.x < oRect.x + oRect.w &&
                    pRect.x + pRect.w > oRect.x &&
                    pRect.y < oRect.y + oRect.h &&
                    pRect.y + pRect.h > oRect.y
                ) {
                    g.gameRunning = false;
                    dispatch({ type: 'BOAT_RACE_CRASH', payload: { score: g.score } });
                    return;
                }

                // Remove off-screen & Score
                if (ob.y > canvas.height) {
                    g.obstacles.splice(i, 1);
                    g.score++;
                    setScore(g.score); // Update UI
                    
                    if (g.score % 10 === 0) g.speed++;
                }
            }

            // Draw Player
            ctx.font = '40px Arial';
            ctx.fillText('🚤', g.playerLeft, canvas.height - 60);

            // Draw Waves/Effects
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(0, (Date.now() / 5) % canvas.height, canvas.width, 10);
            
            requestRef.current = requestAnimationFrame(loop);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameRef.current.gameRunning) return;
            const step = 20;
            if (e.key === 'ArrowLeft' && gameRef.current.playerLeft > 0) {
                gameRef.current.playerLeft -= step;
            }
            if (e.key === 'ArrowRight' && gameRef.current.playerLeft < (canvas.width - 40)) {
                gameRef.current.playerLeft += step;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        requestRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [state.boatRace?.isOpen, dispatch]);

    if (!state.boatRace?.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
            <div className="relative bg-blue-900 border-4 border-blue-500 rounded-2xl shadow-2xl p-2 max-w-lg w-full flex flex-col items-center">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center text-white px-4 py-2 border-b border-blue-700 mb-2">
                    <div className="font-black text-xl uppercase tracking-widest flex items-center gap-2">
                        <span>🚤</span> REGATA ERROTA
                    </div>
                    <div className="text-xl font-bold text-yellow-400">
                        {score} pts
                    </div>
                </div>

                {/* Game Area */}
                <div className="relative border-2 border-white rounded overflow-hidden shadow-inner bg-[#0077be]">
                    <canvas 
                        ref={canvasRef} 
                        width={400} 
                        height={500} 
                        className="block bg-[#0077be]"
                    />

                    {/* Controls Overlay (Mobile) */}
                    <div className="absolute bottom-4 left-0 w-full flex justify-between px-8 md:hidden pointer-events-none">
                        <div 
                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl pointer-events-auto active:bg-white/40"
                            onClick={() => { if(gameRef.current.playerLeft > 0) gameRef.current.playerLeft -= 20; }}
                        >⬅️</div>
                        <div 
                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl pointer-events-auto active:bg-white/40"
                            onClick={() => { if(gameRef.current.playerLeft < 360) gameRef.current.playerLeft += 20; }}
                        >➡️</div>
                    </div>

                    {/* Result Overlay */}
                    {state.boatRace.phase === 'crashed' && (
                        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center animate-in zoom-in z-20">
                            <h2 className="text-5xl font-black text-white drop-shadow-lg mb-2">¡CHOCASTE!</h2>
                            <p className="text-white text-lg mb-6">Puntuación Final: {score}</p>
                            {score < 50 ? (
                                <p className="text-red-300 font-bold mb-4">Multa Reparación: $30</p>
                            ) : (
                                <p className="text-green-300 font-bold mb-4">Premio: ${score * 2}</p>
                            )}
                            <button onClick={() => dispatch({type: 'CLOSE_BOAT_RACE'})} className="bg-white text-red-700 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 transition">Salir</button>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="text-xs text-blue-200 mt-2 text-center">
                    Usa <span className="font-bold text-white">🡄 🡆</span> para esquivar rocas.
                    <br/>
                    Consigue <span className="text-yellow-400 font-bold">50 puntos</span> para ganar dinero.
                </div>
            </div>
        </div>
    );
};
