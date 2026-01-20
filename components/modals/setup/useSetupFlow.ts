import { useState, useEffect, useCallback } from 'react';
import { Player, INITIAL_MONEY } from '../../../types';
import { PLAYER_COLORS } from '../../../constants';
import { assignRoles } from '../../../utils/gameLogic';
import { RollEntry } from './RollView';

export const useSetupFlow = (onStartGame: (payload: { players: Player[], logs: string[] }) => void) => {
    const [phase, setPhase] = useState<'config' | 'rolling' | 'finished'>('config');
    
    // Config State
    const [setupHumans, setSetupHumans] = useState(2);
    const [humanConfigs, setHumanConfigs] = useState<{name: string, gender: 'male'|'female'|'helicoptero'|'marcianito'}[]>([
        { name: 'Jugador 1', gender: 'male' },
        { name: 'Jugador 2', gender: 'female' }
    ]);
    const [numBots, setNumBots] = useState(0);

    // Roll-Off State
    const [rollEntries, setRollEntries] = useState<RollEntry[]>([]);

    // Sync humanConfigs when setupHumans changes
    useEffect(() => {
        setHumanConfigs(prev => {
            const next = [...prev];
            if (setupHumans > prev.length) {
                for(let i = prev.length; i < setupHumans; i++) {
                    next.push({ name: `Jugador ${i+1}`, gender: 'male' });
                }
            } else if (setupHumans < prev.length) {
                return next.slice(0, setupHumans);
            }
            return next;
        });
    }, [setupHumans]);

    // Animation Logic
    useEffect(() => {
        let interval: any;
        if (phase === 'rolling') {
            // Visual flicker effect every 80ms - Updated to 0-9
            interval = setInterval(() => {
                setRollEntries(prev => prev.map(entry => ({
                    ...entry,
                    dice: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)] 
                })));
            }, 80);

            // Stop animation after 2.5 seconds and calculate real results
            setTimeout(() => {
                clearInterval(interval);
                finalizeRolls();
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [phase]);

    const finalizeRolls = () => {
        setRollEntries(prev => {
            // Calculate REAL results using 0-9 dice
            const finalResults = prev.map(entry => {
                const d1 = Math.floor(Math.random() * 10);
                const d2 = Math.floor(Math.random() * 10);
                return {
                    ...entry,
                    dice: [d1, d2],
                    total: d1 + d2
                };
            });

            // Sort by Total Descending (Winner First)
            finalResults.sort((a, b) => b.total - a.total);
            
            setPhase('finished');
            return finalResults;
        });
    };

    const startRollOff = useCallback(() => {
        // 1. Generate Players based on Config
        const newPlayers: Player[] = [];
        let idCounter = 0;
        
        // Humans
        humanConfigs.forEach((cfg, idx) => {
            newPlayers.push({
                id: idCounter++,
                name: cfg.name,
                money: INITIAL_MONEY,
                pos: 0,
                alive: true,
                jail: 0,
                color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
                isBot: false,
                gender: cfg.gender as any,
                props: [],
                taxBase: 0,
                vatIn: 0,
                vatOut: 0,
                doubleStreak: 0,
                insiderTokens: 0,
                inventory: [],
                offshoreMoney: 0,
                farlopa: 0,
                highTurns: 0
            });
        });

        // Bots
        const botGenders: ('male'|'female'|'helicoptero'|'marcianito')[] = ['male', 'female', 'helicoptero', 'marcianito'];
        for (let i = 0; i < numBots; i++) { 
            newPlayers.push({ 
                id: idCounter++, 
                name: `Bot ${i + 1}`, 
                money: INITIAL_MONEY, 
                pos: 0, 
                alive: true, 
                jail: 0, 
                color: PLAYER_COLORS[(humanConfigs.length + i) % PLAYER_COLORS.length], 
                isBot: true, 
                gender: botGenders[Math.floor(Math.random() * botGenders.length)], 
                props: [], 
                taxBase: 0, 
                vatIn: 0, 
                vatOut: 0, 
                doubleStreak: 0, 
                insiderTokens: 0,
                inventory: [],
                offshoreMoney: 0,
                farlopa: 0,
                highTurns: 0
            }); 
        }
        
        // 2. Assign Roles BEFORE sorting (Randomized Roles)
        const playersWithRoles = assignRoles(newPlayers);

        // 3. Prepare entries for animation
        const entries: RollEntry[] = playersWithRoles.map(p => ({
            player: p,
            dice: [0, 0],
            total: 0
        }));

        setRollEntries(entries);
        setPhase('rolling');
    }, [humanConfigs, numBots]);

    const confirmGameStart = useCallback(() => {
        // Extract sorted players
        const sortedPlayers = rollEntries.map(r => r.player);
        
        // Prepare Start Logs
        const startLogs = [
            '🏁 --- INICIO DE PARTIDA ---',
            `🎲 RESULTADO DEL SORTEO DE TURNOS (Dados 0-9):`,
            ...rollEntries.map((r, i) => `#${i+1} ${r.player.name}: sacó ${r.total} (${r.dice[0]}+${r.dice[1]})`),
            `¡${sortedPlayers[0].name} empieza la partida!`
        ];

        // Start Game
        onStartGame({ players: sortedPlayers, logs: startLogs });
    }, [rollEntries, onStartGame]);

    return {
        phase,
        setupHumans,
        setSetupHumans,
        humanConfigs, setHumanConfigs,
        numBots, setNumBots,
        rollEntries,
        startRollOff,
        confirmGameStart
    };
};