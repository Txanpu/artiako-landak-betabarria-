import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../../../types';

interface Props {
    state: GameState;
    dispatch: React.Dispatch<any>;
}

// --- ENGINE CONSTANTS ---
const BASE64_BIKE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAXCAYAAAD+4+QTAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xOdTWsmQAAALfSURBVEhLrVVLaBRBEN2NoqirB1Hw4MGD+ImHYNQQdme2IdMz09s9CfgZD56CQREPgmJAEFn1JniSIIIaPHjRg168CYoEQYwa/AYvXvwgRhEFxQ9ZfdXTO3F3Zpc1yYNH73ZVvaqu/kymGdrDcB6Nlls6ZHE5brtquNvzlmrjbMHmwT6IX4b4n5hc3YMpG3nMEMzrXQ3RqzUJIlaKjtho3KYP25UDWMHP+gSWq0a7hFgyKy2D4Gh9AiK1zrjMDIwFy9D3L7GwK9+AD6Pf6gXGY/m+vsXGfXqwuTwVJ+DyIiXFdLbgqq1I/gDzFV0EV2MFT3VEUf8JiDyPkshfYD9jLGdMGkzKFbC/jIpQdywhlhtT60BLbkRJ4nZ9xni8u3vHAuOSKXK5EwU8NvbTZrp1MBbm0KajCJ6oScbVXZj1/Sg6wRbbkQp+r7TNKwU03wxZ9HY3XTwE77IcKWw/6LSc0hokOog9ehYncuV+/L9Ge4IEk0j8w8zfpziscJvdE3SWy+U2oz0FIcR8xkubbU8eqQpqkpArP9bMNaBOxOUQHRa0coRaauRr4bruIuzJ7zSRRoToU4wVOiRGhpCtvnupQAvO1Qs1Y546gBaiuNebgmChkWmINuYF62xPddlu4GH5B1DdMIRQZXoC+Ewgjva0A/8rSHQFK7uE8bztlLaTTSsTir6y4aTPviZXnyxP7SUbEg3E8wnKm+RD7xk68C5h5+o67tncTMHv3YDlfks4gFQZ3eyEjcvvWMV7CA+ZQs4mfKrk8jD2oO57kWTULi6/IuEHCN7G6NPNpzaFYThH25Jxmij0CT0jU21KI849juP6Rt8QeixT46pEYfSMPEo1aspJ6rfRa4Qs/N6mxxPlCK3kRNIQ85YRagoIDabEatIrgLeK5VJXQyesR7QbnebAMwL/M4j757jTl1UOGo/4UTwJxzGM4zg1F5jvrzLmlpH3/bWI3QPxfibEymg2k/kLGmgFj+yZMV8AAAAASUVORK5CYII";

export const MotocrossModal: React.FC<Props> = ({ state, dispatch }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const requestIdRef = useRef<number>(0);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    
    // Game State Refs (Mutable for loop performance)
    const gameRef = useRef({
        t: 0,
        speed: 0,
        playing: true,
        player: {
            x: 0, // Will be set on init
            y: 0,
            ySpeed: 0,
            rot: 0,
            rSpeed: 0,
            img: new Image()
        },
        perm: [] as number[],
        finishLine: 3000 // Distance to win
    });

    useEffect(() => {
        if (!state.motocross?.isOpen) return;

        // Init Perm Array for Noise
        const perm: number[] = [];
        while (perm.length < 255) {
            while (perm.includes(Math.floor(Math.random() * 255)));
            perm.push(Math.floor(Math.random() * 255));
        }
        gameRef.current.perm = perm;
        gameRef.current.player.img.src = BASE64_BIKE;
        gameRef.current.player.x = 360; // Center of 720 canvas
        gameRef.current.playing = true;
        gameRef.current.t = 0;
        gameRef.current.speed = 0;
        gameRef.current.player.ySpeed = 0;
        gameRef.current.player.rot = 0;
        gameRef.current.player.rSpeed = 0;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const lerp = (a: number, b: number, t: number) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;
        
        const noise = (x: number) => {
            x = x * 0.01 % 254;
            return lerp(gameRef.current.perm[Math.floor(x)], gameRef.current.perm[Math.ceil(x)], x - Math.floor(x));
        }

        const loop = () => {
            if (!gameRef.current.playing) return;

            const k = keysRef.current;
            const g = gameRef.current;
            const p = g.player;

            // Physics
            const up = k['ArrowUp'] ? 1 : 0;
            const down = k['ArrowDown'] ? 1 : 0;
            const left = k['ArrowLeft'] ? 1 : 0;
            const right = k['ArrowRight'] ? 1 : 0;

            g.speed -= (g.speed - (up - down)) * 0.01;
            g.t += 10 * g.speed;

            // Draw Sky
            ctx.fillStyle = "#19f";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Hills (Background)
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let i = 0; i < canvas.width; i++)
                ctx.lineTo(i, canvas.height * 0.8 - noise(g.t + i * 5) * 0.25);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.fill();

            // Draw Ground (Foreground)
            ctx.fillStyle = "#444";
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let i = 0; i < canvas.width; i++)
                ctx.lineTo(i, canvas.height - noise(g.t + i) * 0.25);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.fill();

            // Player Physics
            const p1 = canvas.height - noise(g.t + p.x) * 0.25;
            const p2 = canvas.height - noise(g.t + 5 + p.x) * 0.25;

            let grounded = 0;
            if (p1 - 15 > p.y) {
                p.ySpeed += 0.1; // Gravity
            } else {
                p.ySpeed -= p.y - (p1 - 15);
                p.y = p1 - 15;
                grounded = 1;
            }

            // CRASH LOGIC
            if (grounded && Math.abs(p.rot) > Math.PI * 0.5) {
                g.playing = false;
                dispatch({ type: 'MOTOCROSS_CRASH' });
                return;
            }

            // WIN LOGIC
            if (g.t > g.finishLine * 10) { // arbitrary scaling to match game feel
                g.playing = false;
                dispatch({ type: 'MOTOCROSS_WIN' });
                return;
            }

            const angle = Math.atan2((p2 - 15) - p.y, (p.x + 5) - p.x);
            p.y += p.ySpeed;

            if (grounded && g.playing) {
                p.rot -= (p.rot - angle) * 0.65;
                p.rSpeed = p.rSpeed - (angle - p.rot);
            }
            
            p.rSpeed += (left - right) * 0.05;
            p.rot -= p.rSpeed * 0.1;
            
            if (p.rot > Math.PI) p.rot = -Math.PI;
            if (p.rot < -Math.PI) p.rot = Math.PI;

            // Draw Player
            ctx.save();
            ctx.translate(p.x, p.y - 3);
            ctx.rotate(p.rot);
            ctx.drawImage(p.img, -15, -15, 30, 30);
            ctx.restore();

            // Update React UI occasionally
            if (g.t % 50 < 10) {
                setProgress(Math.min(100, (g.t / (g.finishLine * 10)) * 100));
            }

            requestIdRef.current = requestAnimationFrame(loop);
        };

        const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Start Loop
        requestIdRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
        };
    }, [state.motocross?.isOpen]); // Only restart if modal opens

    if (!state.motocross || !state.motocross.isOpen) return null;

    const { phase } = state.motocross;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-mono">
            <div className="bg-slate-900 border-4 border-indigo-600 rounded-2xl shadow-2xl relative max-w-4xl w-full flex flex-col items-center p-2">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center text-white px-4 py-2 border-b border-indigo-900">
                    <div className="font-bold text-xl uppercase tracking-widest flex items-center gap-2">
                        <span>🏍️</span> Txarlin Pistie Motocross
                    </div>
                    <div className="text-xs text-slate-400">
                        Goal: Finish Line | Prize: $200
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="relative border-2 border-slate-700 bg-blue-900 overflow-hidden w-full aspect-video max-h-[60vh]">
                    <canvas 
                        ref={canvasRef} 
                        width={720} 
                        height={480} 
                        className="w-full h-full object-contain block"
                    />
                    
                    {/* Progress Bar */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-black/50 rounded-full overflow-hidden border border-white/30">
                        <div 
                            className="h-full bg-green-500 transition-all duration-200" 
                            style={{width: `${Math.max(0, progress)}%`}}
                        ></div>
                    </div>

                    {/* OVERLAYS */}
                    {phase === 'crashed' && (
                        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center animate-in zoom-in">
                            <h2 className="text-5xl font-black text-white drop-shadow-lg mb-2">¡ACCIDENTE!</h2>
                            <p className="text-white text-lg mb-6">Pagas $50 de hospital.</p>
                            <button onClick={() => dispatch({type: 'CLOSE_MOTOCROSS'})} className="bg-white text-red-700 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 transition">Salir</button>
                        </div>
                    )}
                    
                    {phase === 'won' && (
                        <div className="absolute inset-0 bg-green-900/80 flex flex-col items-center justify-center animate-in zoom-in">
                            <h2 className="text-5xl font-black text-yellow-400 drop-shadow-lg mb-2">¡META!</h2>
                            <p className="text-white text-lg mb-6">Has ganado el premio de $200.</p>
                            <button onClick={() => dispatch({type: 'CLOSE_MOTOCROSS'})} className="bg-white text-green-700 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 transition">Recoger Premio</button>
                        </div>
                    )}
                </div>

                {/* Controls Info */}
                <div className="w-full bg-slate-800 p-4 mt-2 rounded flex justify-around text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-700 px-2 py-1 rounded border border-slate-600">⬆</span> 
                        <span>Acelerar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-700 px-2 py-1 rounded border border-slate-600">⬇</span> 
                        <span>Frenar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <span className="bg-slate-700 px-2 py-1 rounded border border-slate-600">⬅</span>
                            <span className="bg-slate-700 px-2 py-1 rounded border border-slate-600">➡</span>
                        </div>
                        <span>Rotar (¡Aterriza plano!)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};