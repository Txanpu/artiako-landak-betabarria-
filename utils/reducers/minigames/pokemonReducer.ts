
import { GameState, PokemonState } from '../../../types';
import { createPokemon, calculateDamage, POKEDEX } from '../../minigames/pokemonData';
import { formatMoney } from '../../gameLogic';

export const pokemonReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_POKEMON_BATTLE': {
            const { tileId, rent } = action.payload;
            
            // Pick Garchomp for Player (Gen 5 King)
            const playerMon = createPokemon("Garchomp", true);
            
            // Random Enemy
            const keys = Object.keys(POKEDEX);
            const randomEnemy = keys[Math.floor(Math.random() * keys.length)];
            const enemyMon = createPokemon(randomEnemy, false);

            return {
                ...state,
                pokemon: {
                    isOpen: true,
                    tileId,
                    rentBase: rent,
                    streak: 0,
                    playerMon,
                    enemyMon,
                    turn: 'player',
                    logs: [`⚔️ ¡Desafío de Gimnasio! Rent a pagar: ${formatMoney(rent)}.`, `Aparece un ${enemyMon.name} salvaje!`],
                    phase: 'battle'
                },
                // Close modal so PokemonModal shows on top or integrated
                selectedTileId: null 
            };
        }

        case 'POKEMON_ATTACK': {
            if (!state.pokemon) return state;
            const { move } = action.payload;
            const { playerMon, enemyMon, turn } = state.pokemon;

            if (turn !== 'player') return state;

            // Player attacks Enemy
            const res = calculateDamage(playerMon, enemyMon, move);
            let logs = [...state.pokemon.logs];
            
            if (res.miss) logs.push(`${playerMon.name} usó ${move} pero falló!`);
            else logs.push(`${playerMon.name} usó ${move}! ${res.eff > 1 ? '¡Es muy eficaz!' : res.eff < 1 ? 'No es muy eficaz...' : ''}`);

            const newEnemyHp = Math.max(0, enemyMon.currentHp - res.damage);
            const newEnemy = { ...enemyMon, currentHp: newEnemyHp };

            if (newEnemyHp <= 0) {
                // Enemy Fainted
                const newStreak = state.pokemon.streak + 1;
                logs.push(`${newEnemy.name} se debilitó!`);
                
                if (newStreak >= 5) {
                    // VICTORY ROYALE
                    return {
                        ...state,
                        pokemon: {
                            ...state.pokemon,
                            enemyMon: newEnemy,
                            streak: newStreak,
                            phase: 'victory',
                            logs: [...logs, "🏆 ¡HAS GANADO 5 BATALLAS! RENTA ANULADA."]
                        }
                    };
                } else {
                    // Next Battle Prep
                    return {
                        ...state,
                        pokemon: {
                            ...state.pokemon,
                            enemyMon: newEnemy,
                            streak: newStreak,
                            turn: 'end', // Wait for user to click next
                            logs: [...logs, `Victoria #${newStreak}. Prepárate para el siguiente.`]
                        }
                    };
                }
            }

            // Enemy survived, their turn
            return {
                ...state,
                pokemon: {
                    ...state.pokemon,
                    enemyMon: newEnemy,
                    turn: 'enemy',
                    logs
                }
            };
        }

        case 'POKEMON_ENEMY_MOVE': {
            if (!state.pokemon || state.pokemon.turn !== 'enemy') return state;
            const { playerMon, enemyMon } = state.pokemon;

            // AI Pick Move
            const move = enemyMon.moves[Math.floor(Math.random() * enemyMon.moves.length)];
            const res = calculateDamage(enemyMon, playerMon, move);
            
            let logs = [...state.pokemon.logs];
            if (res.miss) logs.push(`El rival ${enemyMon.name} usó ${move} pero falló!`);
            else logs.push(`El rival ${enemyMon.name} usó ${move}!`);

            const newPlayerHp = Math.max(0, playerMon.currentHp - res.damage);
            const newPlayer = { ...playerMon, currentHp: newPlayerHp };

            if (newPlayerHp <= 0) {
                // Player Fainted -> GAME OVER
                return {
                    ...state,
                    pokemon: {
                        ...state.pokemon,
                        playerMon: newPlayer,
                        phase: 'defeat',
                        logs: [...logs, `${playerMon.name} se debilitó... Has perdido.`]
                    }
                };
            }

            return {
                ...state,
                pokemon: {
                    ...state.pokemon,
                    playerMon: newPlayer,
                    turn: 'player',
                    logs
                }
            };
        }

        case 'POKEMON_NEXT_ROUND': {
            if (!state.pokemon) return state;
            
            // Full Heal Player for next round (Battle Tower rules usually heal, or at least in this arcade version)
            const playerMon = { ...state.pokemon.playerMon, currentHp: state.pokemon.playerMon.maxHp };
            
            // New Enemy
            const keys = Object.keys(POKEDEX);
            let randomEnemy = keys[Math.floor(Math.random() * keys.length)];
            // Avoid repeat if possible
            if (randomEnemy === state.pokemon.enemyMon.name) randomEnemy = keys[Math.floor(Math.random() * keys.length)];
            
            const enemyMon = createPokemon(randomEnemy, false);

            return {
                ...state,
                pokemon: {
                    ...state.pokemon,
                    playerMon,
                    enemyMon,
                    turn: 'player',
                    logs: [`Batalla #${state.pokemon.streak + 1}: Aparece ${enemyMon.name}!`]
                }
            };
        }

        case 'POKEMON_CLOSE_WIN': {
            return { ...state, pokemon: null, logs: [`🏆 Gimnasio superado. Renta perdonada.`, ...state.logs] };
        }

        case 'POKEMON_CLOSE_LOSS': {
            if (!state.pokemon) return state;
            const { rentBase, tileId } = state.pokemon;
            const doubleRent = rentBase * 2;
            const pIdx = state.currentPlayerIndex;
            const player = { ...state.players[pIdx] };
            const tile = state.tiles[tileId];
            
            // Deduct money
            player.money -= doubleRent;
            
            // Pay Owner
            const newPlayers = [...state.players];
            if (tile.owner && typeof tile.owner === 'number') {
                const ownerIdx = newPlayers.findIndex(p => p.id === tile.owner);
                if (ownerIdx !== -1) {
                    newPlayers[ownerIdx] = { ...newPlayers[ownerIdx], money: newPlayers[ownerIdx].money + doubleRent };
                }
            } else {
                // State owned
                state.estadoMoney += doubleRent;
            }
            newPlayers[pIdx] = player;

            return {
                ...state,
                players: newPlayers,
                pokemon: null,
                logs: [`💀 Derrota en Gimnasio. ${player.name} paga DOBLE renta: ${formatMoney(doubleRent)}.`, ...state.logs]
            };
        }

        default: return state;
    }
};
