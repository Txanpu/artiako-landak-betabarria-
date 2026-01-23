
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

interface Duck {
    id: number;
    x: number;
    y: number;
    speed: number;
    baseY: number; // For sine wave
    direction: 1 | -1; // 1 Right, -1 Left
    isDead: boolean;
    isFalling: boolean;
}

export const BirdHuntModal: React.FC<Props> = ({ state, dispatch }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const [score, setScore] = useState(0);
    const [ammo, setAmmo] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    
    // Game State Ref
    const gameRef = useRef({
        ducks: [] as Duck[],
        lastSpawn: 0,
        running: true,
        nextDuckId: 0
    });

    useEffect(() => {
        if (!state.birdHunt?.isOpen) return;

        // Init
        gameRef.current = { ducks: [], lastSpawn: 0, running: true, nextDuckId: 0 };
        setScore(0);
        setAmmo(3);
        setGameOver(false);

        const spawnDuck = () => {
            if (!containerRef.current) return;
            const height = containerRef.current.clientHeight;
            const topPos = Math.random() * (height - 250);
            
            const duck: Duck = {
                id: gameRef.current.nextDuckId++,
                x: -100,
                y: topPos,
                baseY: topPos,
                speed: Math.random() * 3 + 2, // 2 to 5
                direction: 1,
                isDead: false,
                isFalling: false
            };
            gameRef.current.ducks.push(duck);
        };

        const loop = (time: number) => {
            if (!gameRef.current.running) return;

            // Spawn Logic (Every 1.5s approx)
            if (time - gameRef.current.lastSpawn > 1500) {
                spawnDuck();
                gameRef.current.lastSpawn = time;
            }

            // Update Ducks
            const width = containerRef.current?.clientWidth || 800;
            const height = containerRef.current?.clientHeight || 500;

            gameRef.current.ducks = gameRef.current.ducks.filter(d => {
                if (d.isDead) {
                    // Falling Logic
                    d.y += 10; // Fall speed
                    return d.y < height; // Keep until hits bottom
                } else {
                    // Flying Logic
                    d.x += d.speed;
                    d.y = d.baseY + Math.sin(d.x / 50) * 30; // Sine wave motion
                    return d.x < width + 100; // Keep until off screen right
                }
            });

            // Force Re-render to update positions in UI
            // In a real heavy game we'd use Canvas, but for Duck Hunt DOM sprites are nostalgic and fine
            // We use a dummy state to trigger re-render of the duck list
            setDummyState(prev => prev + 1);

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(requestRef.current);
    }, [state.birdHunt?.isOpen]);

    const [dummyState, setDummyState] = useState(0); // Trigger for render loop

    const handleShoot = (e: React.MouseEvent) => {
        if (gameOver || ammo <= 0) return;

        // Flash Effect
        if (containerRef.current) {
            const el = containerRef.current;
            el.style.backgroundColor = 'white';
            setTimeout(() => { el.style.backgroundColor = '#3fbfff'; }, 50);
        }

        let hit = false;
        // Check clicks on ducks is handled by duck onClick, this is background click (miss)
        // Logic: if duck clicked, it stops propagation. If this triggers, it's a miss.
        
        setAmmo(prev => {
            const newAmmo = prev - 1;
            if (newAmmo <= 0) {
                setTimeout(() => {
                    gameRef.current.running = false;
                    setGameOver(true);
                    dispatch({ type: 'BIRD_HUNT_GAME_OVER', payload: { score } }); // Use CURRENT score, not state var potentially
                }, 1000);
            }
            return newAmmo;
        });
    };

    const handleDuckClick = (e: React.MouseEvent, duckId: number) => {
        e.stopPropagation(); // Prevent "Miss" handler on background
        if (gameOver || ammo <= 0) return;

        const duck = gameRef.current.ducks.find(d => d.id === duckId);
        if (duck && !duck.isDead) {
            duck.isDead = true;
            // Refill ammo mechanic from prompt
            setAmmo(prev => Math.min(prev + 1, 3)); 
            
            // Score update needs to be safe for closure
            setScore(prev => prev + 500); 
            // Also need to pass this new score to final game over logic if ammo was 1 and we refilled?
            // Actually, ammo logic: consume 1 (visual/logic) then add 1. Net 0 change if hit?
            // User code: "if ammo > 0... hitDuck... ammo = min(ammo+1, 3)".
            // It doesn't decrement on hit in user code. Only on miss (bg click).
            // But wait, the user code adds click listener to gameArea which handles misses.
            // And click listener to Duck which handles hits.
            // Duck click does stopPropagation.
            // So on HIT, we do NOT decrement. We actually GAIN if below 3.
        }
    };

    if (!state.birdHunt?.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono select-none">
            <div className="relative w-full max-w-4xl aspect-video bg-[#3fbfff] border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl cursor-crosshair" 
                 ref={containerRef}
                 onMouseDown={handleShoot}
            >
                
                {/* Grass & Ground */}
                <div className="absolute bottom-[140px] left-0 w-full h-[30px] z-[5]" style={{background: 'linear-gradient(to bottom, transparent 0%, #7cfc00 50%)'}}></div>
                <div className="absolute bottom-0 left-0 w-full h-[150px] bg-[#694f00] border-t-[10px] border-[#548900] z-[10]"></div>

                {/* UI */}
                <div className="absolute bottom-5 left-5 z-20 bg-black/70 text-white p-3 border-2 border-white rounded-lg text-lg font-bold">
                    <div>SCORE: {score}</div>
                    <div className="text-yellow-400">BALAS: {Array(ammo).fill('❚').join('')}</div>
                </div>

                {/* Ducks */}
                {gameRef.current.ducks.map(duck => (
                    <div
                        key={duck.id}
                        onMouseDown={(e) => handleDuckClick(e, duck.id)}
                        className={`absolute w-[60px] h-[40px] z-[2] transition-transform duration-100 ${duck.isDead ? 'bg-red-600' : ''}`}
                        style={{
                            top: duck.y,
                            left: duck.x,
                            transform: duck.isDead ? 'rotate(180deg)' : 'none',
                            cursor: 'crosshair' // Ensure cursor remains crosshair
                        }}
                    >
                        {/* CSS Duck Body */}
                        {!duck.isDead && (
                            <>
                                <div className="absolute top-[10px] left-0 w-[40px] h-[20px] bg-black shadow-[4px_-4px_0_white,4px_4px_0_white]"></div>
                                <div className="absolute top-0 right-0 w-[15px] h-[15px] bg-green-600 rounded-full border-r-[5px] border-yellow-400"></div>
                                {/* Wings Flap Simulation via simple toggle if needed, but movement is sine wave enough */}
                            </>
                        )}
                        {/* Dead Duck Visual */}
                        {duck.isDead && (
                            <div className="w-full h-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">DEAD</div>
                        )}
                    </div>
                ))}

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center animate-in zoom-in">
                        <h1 className="text-6xl text-red-500 font-black mb-4 bg-white px-4">GAME OVER</h1>
                        <p className="text-white text-2xl mb-8">Puntuación Final: {score}</p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => dispatch({type: 'CLOSE_BIRD_HUNT'})}
                                className="bg-[#7cfc00] text-black font-bold py-3 px-8 rounded border-4 border-white hover:scale-105 transition-transform"
                            >
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
