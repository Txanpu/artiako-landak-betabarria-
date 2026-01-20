
import { useState, useEffect, useRef } from 'react';
import { Greyhound } from '../../../types';

const NAMES = ["Relámpago", "Tornado", "Mordisquitos", "Sputnik", "Cohete", "Bala", "Flash", "Cometa"];
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];

export interface Dog extends Greyhound {
    name: string;
    stats: { speed: number; stamina: number; erratic: number };
    odds: number;
    pos: number; 
    currentSpeed: number;
    fatigue: number;
    rank: number | null;
}

export const useGreyhoundRace = (isOpen: boolean, onFinish: (winnerId: number, odds: number) => void) => {
    const [phase, setPhase] = useState<'betting' | 'racing' | 'results'>('betting');
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [commentary, setCommentary] = useState("¡Bienvenidos al Canódromo Municipal de Artia!");
    const frameRef = useRef<number>(0);

    // Initialization
    useEffect(() => {
        if (!isOpen) return;
        const newDogs: Dog[] = Array.from({ length: 6 }, (_, i) => {
            const speed = 5 + Math.random() * 5;
            const stamina = 3 + Math.random() * 7;
            const erratic = Math.random() * 0.5;
            const power = speed + stamina - (erratic * 5);
            let odds = Math.max(1.5, parseFloat(((20 / power) * 2).toFixed(1)));
            if (odds > 20) odds = 20;

            return {
                id: i,
                name: NAMES[Math.floor(Math.random() * NAMES.length)],
                color: COLORS[i],
                stats: { speed, stamina, erratic },
                odds,
                pos: 0,
                currentSpeed: 0,
                fatigue: 0,
                rank: null,
                progress: 0,
                speed: 0
            };
        });
        setDogs(newDogs);
        setPhase('betting');
        setCommentary("Hagan sus apuestas. ¿Quién es su favorito?");
    }, [isOpen]);

    // Game Loop
    useEffect(() => {
        if (phase !== 'racing') return;

        const loop = () => {
            setDogs(prev => {
                let finishedCount = prev.filter(d => d.rank !== null).length;
                
                const next = prev.map(dog => {
                    if (dog.rank !== null) return dog; 

                    let move = dog.currentSpeed;
                    if (dog.currentSpeed < dog.stats.speed && dog.fatigue < 50) dog.currentSpeed += 0.1;
                    
                    dog.fatigue += (dog.currentSpeed * 0.1) / dog.stats.stamina;
                    if (dog.fatigue > 80) dog.currentSpeed *= 0.98;

                    if (Math.random() < dog.stats.erratic) move += (Math.random() - 0.5) * 2;

                    let newPos = dog.pos + (move * 0.2); 

                    if (newPos >= 100) {
                        newPos = 100;
                        finishedCount++;
                        dog.rank = finishedCount;
                        if (dog.rank === 1) setCommentary(`¡${dog.name} cruza la meta primero!`);
                    }
                    return { ...dog, pos: newPos };
                });

                if (next.every(d => d.rank !== null)) {
                    setTimeout(() => {
                        setPhase('results');
                        const winner = next.find(d => d.rank === 1);
                        if (winner) onFinish(winner.id, winner.odds);
                    }, 1000);
                } else {
                    const leader = next.reduce((prev, curr) => (curr.pos > prev.pos) ? curr : prev);
                    if (Math.random() < 0.05) setCommentary(`¡${leader.name} va en cabeza!`);
                }
                return next;
            });
            frameRef.current = requestAnimationFrame(loop);
        };
        frameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameRef.current);
    }, [phase, onFinish]);

    const startRace = () => {
        setPhase('racing');
        setCommentary("¡Y ARRANCAN!");
    };

    return { dogs, phase, commentary, startRace };
};
