
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

// GAME CONSTANTS
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_HEIGHT = 100;
const GAME_SPEED_START = 6;
const GAME_SPEED_MAX = 18;
const ACCELERATION = 0.4;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;
const SPAWN_RATE_MIN = 70;
const SPAWN_RATE_MAX = 140;

const ObstacleType = {
    CONE: 'CONE',
    HYDRANT: 'HYDRANT',
    BIRD: 'BIRD'
};

export const SkateModal: React.FC<Props> = ({ state, dispatch }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const [score, setScore] = useState(0);
    
    // Game State Mutable Ref
    const gameRef = useRef({
        running: true,
        gameSpeed: GAME_SPEED_START,
        frameCount: 0,
        nextSpawn: 0,
        score: 0,
        player: {
            pos: { x: 100, y: 0 }, // y will be calculated relative to canvas height
            velocity: { x: 0, y: 0 },
            size: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
            isJumping: false,
            isCrouching: false,
            onGround: true,
            rotation: 0
        },
        obstacles: [] as any[],
        particles: [] as any[]
    });

    useEffect(() => {
        if (!state.skate?.isOpen) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Init Dimensions & Player Y
        const CANVAS_WIDTH = canvas.width;
        const CANVAS_HEIGHT = canvas.height;
        gameRef.current.player.pos.y = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
        
        // Reset
        gameRef.current.running = true;
        gameRef.current.score = 0;
        gameRef.current.obstacles = [];
        gameRef.current.particles = [];
        gameRef.current.gameSpeed = GAME_SPEED_START;
        setScore(0);

        const createParticles = (x: number, y: number, color: string, amount: number) => {
            for (let i = 0; i < amount; i++) {
                gameRef.current.particles.push({
                    pos: { x, y },
                    velocity: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 },
                    life: 1.0,
                    color,
                    size: Math.random() * 5 + 3
                });
            }
        };

        const update = () => {
            if (!gameRef.current.running) return;
            const g = gameRef.current;
            const p = g.player;

            g.frameCount++;

            // 1. Physics
            p.velocity.y += GRAVITY;
            p.pos.y += p.velocity.y;

            // Ground Collision
            const groundLevel = CANVAS_HEIGHT - GROUND_HEIGHT - p.size.height;
            if (p.pos.y >= groundLevel) {
                p.pos.y = groundLevel;
                p.velocity.y = 0;
                if (!p.onGround) {
                    createParticles(p.pos.x + 20, p.pos.y + 60, '#94a3b8', 5);
                }
                p.onGround = true;
                p.isJumping = false;
                p.rotation = 0;
            } else {
                p.onGround = false;
                p.rotation = Math.min(p.rotation + 0.05, 0.4);
            }

            // 2. Obstacles Spawning
            if (g.frameCount > g.nextSpawn) {
                const typeRand = Math.random();
                let type = ObstacleType.CONE;
                if (typeRand > 0.65) type = ObstacleType.BIRD;
                else if (typeRand > 0.5) type = ObstacleType.HYDRANT;

                let w = 40, h = 40, y = CANVAS_HEIGHT - GROUND_HEIGHT - 40;

                if (type === ObstacleType.BIRD) {
                    y = CANVAS_HEIGHT - GROUND_HEIGHT - 100;
                    w = 40; h = 30;
                } else if (type === ObstacleType.HYDRANT) {
                    w = 30; h = 50;
                    y = CANVAS_HEIGHT - GROUND_HEIGHT - 50;
                }

                g.obstacles.push({
                    type,
                    pos: { x: CANVAS_WIDTH, y },
                    size: { width: w, height: h },
                    passed: false
                });

                const minSpawn = SPAWN_RATE_MIN / (g.gameSpeed / GAME_SPEED_START);
                const maxSpawn = SPAWN_RATE_MAX / (g.gameSpeed / GAME_SPEED_START);
                g.nextSpawn = g.frameCount + Math.random() * (maxSpawn - minSpawn) + minSpawn;
            }

            // Move Obstacles & Collision
            for (let i = g.obstacles.length - 1; i >= 0; i--) {
                const obs = g.obstacles[i];
                obs.pos.x -= g.gameSpeed;

                if (obs.pos.x < -100) {
                    g.obstacles.splice(i, 1);
                    continue;
                }

                const px = p.pos.x + 10;
                const pw = p.size.width - 20;
                let py = p.pos.y + 10;
                let ph = p.size.height - 15;

                if (p.isCrouching) {
                    py = p.pos.y + 30;
                    ph = p.size.height - 35;
                }

                if (
                    px < obs.pos.x + obs.size.width &&
                    px + pw > obs.pos.x &&
                    py < obs.pos.y + obs.size.height &&
                    py + ph > obs.pos.y
                ) {
                    // CRASH
                    g.running = false;
                    dispatch({ type: 'SKATE_CRASH', payload: { score: Math.floor(g.score) } });
                    return;
                }

                // Scoring
                if (!obs.passed && p.pos.x > obs.pos.x + obs.size.width) {
                    obs.passed = true;
                    g.score += 100;
                    setScore(g.score);
                    g.gameSpeed = Math.min(g.gameSpeed + ACCELERATION, GAME_SPEED_MAX);
                }
            }

            // Particles
            for (let i = g.particles.length - 1; i >= 0; i--) {
                const p = g.particles[i];
                p.pos.x += p.velocity.x;
                p.pos.y += p.velocity.y;
                p.life -= 0.04;
                if (p.life <= 0) g.particles.splice(i, 1);
            }
        };

        const draw = () => {
            // Background
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, '#0f172a'); 
            gradient.addColorStop(1, '#1e293b'); 
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            const g = gameRef.current;
            const p = g.player;

            // Sun
            ctx.beginPath();
            ctx.arc(CANVAS_WIDTH - 100, 80, 50, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.arc(CANVAS_WIDTH - 100, 80, 35, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();

            // City
            ctx.fillStyle = '#334155';
            const cityOffset = (g.frameCount * 0.2) % 200;
            for (let i = -1; i < 6; i++) {
                const h = 100 + Math.sin(i * 132) * 50;
                ctx.fillRect(i * 200 - cityOffset, CANVAS_HEIGHT - GROUND_HEIGHT - h, 120, h);
            }

            // Ground
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

            // Road Lines
            const lineOffset = (g.frameCount * g.gameSpeed) % 100;
            ctx.fillStyle = '#374151';
            for(let i=0; i < CANVAS_WIDTH + 100; i+=200) {
                ctx.fillRect(i - lineOffset, CANVAS_HEIGHT - GROUND_HEIGHT + 40, 100, 10);
            }

            // Obstacles
            g.obstacles.forEach(obs => {
                if (obs.type === ObstacleType.CONE) {
                    ctx.fillStyle = '#fb923c';
                    ctx.beginPath();
                    ctx.moveTo(obs.pos.x, obs.pos.y + obs.size.height);
                    ctx.moveTo(obs.pos.x + obs.size.width / 2, obs.pos.y);
                    ctx.moveTo(obs.pos.x + obs.size.width, obs.pos.y + obs.size.height);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(obs.pos.x + 8, obs.pos.y + 20, 24, 8);
                } else if (obs.type === ObstacleType.HYDRANT) {
                    ctx.fillStyle = '#ef4444'; 
                    ctx.fillRect(obs.pos.x + 5, obs.pos.y, 20, 40);
                    ctx.fillRect(obs.pos.x, obs.pos.y + 10, 30, 8);
                    ctx.fillStyle = '#991b1b'; 
                    ctx.fillRect(obs.pos.x + 5, obs.pos.y + 35, 20, 5);
                } else if (obs.type === ObstacleType.BIRD) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    const wingY = Math.sin(g.frameCount * 0.4) * 12;
                    ctx.moveTo(obs.pos.x, obs.pos.y + 15);
                    ctx.lineTo(obs.pos.x + 15, obs.pos.y + 15 + wingY);
                    ctx.lineTo(obs.pos.x + 30, obs.pos.y + 15);
                    ctx.stroke();
                    ctx.fillStyle = '#22d3ee';
                    ctx.beginPath();
                    ctx.arc(obs.pos.x + 15, obs.pos.y + 15, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Player
            ctx.save();
            ctx.translate(p.pos.x + p.size.width / 2, p.pos.y + p.size.height / 2);
            ctx.rotate(p.rotation);
            ctx.translate(-(p.pos.x + p.size.width / 2), -(p.pos.y + p.size.height / 2));

            // Skateboard
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.roundRect(p.pos.x, p.pos.y + p.size.height - 10, p.size.width, 10, 4);
            ctx.fill();
            
            // Wheels
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(p.pos.x + 8, p.pos.y + p.size.height, 4, 0, Math.PI * 2);
            ctx.arc(p.pos.x + p.size.width - 8, p.pos.y + p.size.height, 4, 0, Math.PI * 2);
            ctx.fill();

            // Character
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const crouchY = p.isCrouching ? 15 : 0;

            // Legs
            ctx.beginPath();
            if (p.isCrouching) {
                ctx.moveTo(p.pos.x + 10, p.pos.y + p.size.height - 10);
                ctx.lineTo(p.pos.x + 5, p.pos.y + p.size.height - 20);
                ctx.lineTo(p.pos.x + 20, p.pos.y + 35 + crouchY);
                
                ctx.moveTo(p.pos.x + 30, p.pos.y + p.size.height - 10);
                ctx.lineTo(p.pos.x + 35, p.pos.y + p.size.height - 20);
                ctx.lineTo(p.pos.x + 20, p.pos.y + 35 + crouchY);
            } else {
                ctx.moveTo(p.pos.x + 10, p.pos.y + p.size.height - 10);
                ctx.lineTo(p.pos.x + 15, p.pos.y + p.size.height - 25);
                ctx.lineTo(p.pos.x + 20, p.pos.y + 30);
                
                ctx.moveTo(p.pos.x + 30, p.pos.y + p.size.height - 10);
                ctx.lineTo(p.pos.x + 25, p.pos.y + p.size.height - 25);
                ctx.lineTo(p.pos.x + 20, p.pos.y + 30);
            }
            ctx.stroke();

            // Torso
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(p.pos.x + 20, p.pos.y + 30 + crouchY);
            ctx.lineTo(p.pos.x + 20, p.pos.y + 10 + crouchY);
            ctx.stroke();

            // Head
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(p.pos.x + 20, p.pos.y + 5 + crouchY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Hat
            ctx.fillStyle = '#ef4444'; 
            ctx.beginPath();
            ctx.arc(p.pos.x + 20, p.pos.y + 4 + crouchY, 8, Math.PI, 0);
            ctx.fillRect(p.pos.x + 12, p.pos.y + 3 + crouchY, 6, 4);
            ctx.fill();

            // Arms
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(p.pos.x + 20, p.pos.y + 15 + crouchY);
            if (p.isCrouching) {
                ctx.lineTo(p.pos.x + 5, p.pos.y + 25 + crouchY);
                ctx.moveTo(p.pos.x + 20, p.pos.y + 15 + crouchY);
                ctx.lineTo(p.pos.x + 35, p.pos.y + 25 + crouchY);
            } else if (p.isJumping) {
                ctx.lineTo(p.pos.x + 5, p.pos.y);
                ctx.moveTo(p.pos.x + 20, p.pos.y + 15);
                ctx.lineTo(p.pos.x + 35, p.pos.y);
            } else {
                ctx.lineTo(p.pos.x + 5, p.pos.y + 20);
                ctx.moveTo(p.pos.x + 20, p.pos.y + 15);
                ctx.lineTo(p.pos.x + 35, p.pos.y + 20);
            }
            ctx.stroke();
            ctx.restore();

            // Particles
            g.particles.forEach(p => {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });
        };

        const loop = () => {
            update();
            draw();
            requestRef.current = requestAnimationFrame(loop);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const p = gameRef.current.player;
            if ((e.code === 'Space' || e.code === 'ArrowUp') && p.onGround) {
                p.velocity.y = JUMP_FORCE;
                p.onGround = false;
                p.isJumping = true;
                // Add jump particles here if needed
            }
            if (e.code === 'ArrowDown') {
                p.isCrouching = true;
                if (!p.onGround) p.velocity.y += 5;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'ArrowDown') gameRef.current.player.isCrouching = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        requestRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [state.skate?.isOpen, dispatch]);

    if (!state.skate?.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono select-none">
            <div className="bg-slate-900 border-4 border-pink-600 rounded-2xl shadow-2xl relative w-full max-w-4xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center text-white px-4 py-2 border-b border-pink-800 bg-slate-950">
                    <div className="font-black text-xl uppercase tracking-widest flex items-center gap-2 italic">
                        <span className="text-2xl">🛹</span> RAD SKATER
                    </div>
                    <div className="flex gap-4">
                        <div className="text-sm font-bold text-gray-400 uppercase">Target: 1000pts</div>
                        <div className="text-xl font-black text-yellow-400">{score}</div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="relative w-full aspect-video bg-[#0f172a]">
                    <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={500} 
                        className="w-full h-full block"
                    />

                    {/* Result Overlay */}
                    {state.skate.phase === 'crashed' && (
                        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center animate-in zoom-in z-20">
                            <h2 className="text-6xl font-black text-white transform -rotate-6 drop-shadow-xl mb-2 italic">WIPEOUT!</h2>
                            <p className="text-white text-xl mb-6 font-bold">SCORE: {score}</p>
                            
                            {score < 1000 ? (
                                <p className="text-red-300 font-bold mb-4 bg-black/40 px-4 py-2 rounded">Gastos Médicos: $40</p>
                            ) : (
                                <p className="text-green-300 font-bold mb-4 bg-black/40 px-4 py-2 rounded">Sponsors: ${Math.floor(score/10)}</p>
                            )}
                            
                            <button onClick={() => dispatch({type: 'CLOSE_SKATE'})} className="bg-white text-red-900 px-10 py-4 rounded-full font-black uppercase shadow-lg hover:scale-105 transition border-b-8 border-gray-300 active:border-b-0 active:translate-y-2">
                                CONTINUAR
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Controls Info */}
                <div className="bg-slate-900 p-4 flex justify-around text-xs text-gray-400 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                        <kbd className="bg-slate-700 px-2 py-1 rounded border border-slate-600 text-white font-bold">ESPACIO</kbd> 
                        <span>SALTAR</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="bg-slate-700 px-2 py-1 rounded border border-slate-600 text-white font-bold">⬇</kbd> 
                        <span>AGACHARSE / CAER RÁPIDO</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
