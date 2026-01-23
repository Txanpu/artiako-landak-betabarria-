
import { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';

// Standard European Roulette Order (0 at top)
export const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export const useRouletteAnimation = (state: GameState) => {
    const [phase, setPhase] = useState<'betting' | 'spinning' | 'result'>('betting');
    const [rotation, setRotation] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        // RESET Logic: If state is cleared, force betting phase
        // This ensures we don't start spinning until the old state is gone
        if (!state.rouletteState) {
            if (phase !== 'betting') {
                setPhase('betting');
            }
            return;
        }

        // SPIN Logic: If we have a result and we are in betting phase, Start Spin
        if (state.rouletteState && phase === 'betting') {
            const winNum = state.rouletteState.winningNumber;
            const index = WHEEL_NUMBERS.indexOf(winNum);
            const sliceAngle = 360 / 37;
            
            // Calculate target angle (absolute position on the circle)
            const targetAngle = index * sliceAngle;

            setRotation(prevRotation => {
                // Calculate where we are currently in the 0-360 circle
                const currentMod = prevRotation % 360;
                
                // Calculate distance to target
                let delta = targetAngle - currentMod;
                
                // Ensure we always spin forward (positive delta)
                // If delta is negative (target is 'behind'), add 360 to go round
                if (delta <= 0) delta += 360;
                
                // Add minimum spins (5 full rotations = 1800 degrees)
                const extraSpins = 5 * 360;
                
                return prevRotation + extraSpins + delta;
            });

            setPhase('spinning');

            if (timerRef.current) clearTimeout(timerRef.current);
            
            timerRef.current = setTimeout(() => {
                setPhase('result');
            }, 3800); 
        }
    }, [state.rouletteState, phase]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { phase, rotation };
};
