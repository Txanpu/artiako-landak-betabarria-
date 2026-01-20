
import { GameState, GovernmentType } from '../../types';
import { GOV_CONFIGS } from '../roles/config';

export const electionReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'VOTE_ELECTION': {
            const { pId, candidate } = action.payload; // candidate is a GovType
            if (!state.election || !state.election.isOpen) return state;
            if (state.election.votedPlayers.includes(pId)) return state;

            const player = state.players.find(p => p.id === pId);
            if (!player) return state;

            // Florentino weighting logic
            const weight = player.role === 'florentino' ? 2 : 1;
            
            const newVotes = { ...state.election.votes };
            newVotes[candidate] = (newVotes[candidate] || 0) + weight;

            return {
                ...state,
                election: {
                    ...state.election,
                    votes: newVotes,
                    votedPlayers: [...state.election.votedPlayers, pId]
                }
            };
        }
        case 'FINISH_ELECTION': {
            if (!state.election) return state;
            
            // Tally votes
            const votes = state.election.votes;
            let maxVotes = -1;
            let winners: GovernmentType[] = [];

            Object.entries(votes).forEach(([gov, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    winners = [gov as GovernmentType];
                } else if (count === maxVotes) {
                    winners.push(gov as GovernmentType);
                }
            });

            // If tie, pick random from winners, else pick winner. If no votes, random.
            let nextGov: GovernmentType;
            if (winners.length > 0) {
                nextGov = winners[Math.floor(Math.random() * winners.length)];
            } else {
                const all: GovernmentType[] = ['left', 'right', 'authoritarian', 'libertarian', 'anarchy'];
                nextGov = all[Math.floor(Math.random() * all.length)];
            }

            return {
                ...state,
                election: null,
                gov: nextGov,
                govTurnsLeft: 7,
                currentGovConfig: GOV_CONFIGS[nextGov],
                logs: [`🗳️ Resultados Electorales: ¡Gana ${nextGov.toUpperCase()}!`, ...state.logs]
            };
        }
        default: return state;
    }
};
