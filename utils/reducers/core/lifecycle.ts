
import { GameState, GovernmentType } from '../../../types';
import { GOV_CONFIGS } from '../../../utils/roles';

export const lifecycleReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'START_GAME': {
            const { players, logs } = action.payload;
            
            // Randomize Government on Start
            const govTypes: GovernmentType[] = ['left', 'right', 'authoritarian', 'libertarian', 'anarchy'];
            const startGov = govTypes[Math.floor(Math.random() * govTypes.length)];
            const govLog = `🏛️ GOBIERNO INICIAL: ${startGov.toUpperCase()}`;

            return { 
                ...state, 
                players: players, // Already sorted by roll
                gameStarted: true, 
                currentPlayerIndex: 0,
                estadoMoney: 0, 
                gov: startGov,
                currentGovConfig: GOV_CONFIGS[startGov],
                govTurnsLeft: 7,
                logs: [...(logs || []), govLog, 'Roles asignados secretamente.', '¡Buena suerte!']
            };
        }
          
        case 'LOAD_GAME':
            return { ...action.payload, logs: ['💾 Partida cargada correctamente.', ...action.payload.logs] };
        
        case 'RESTORE_STATE':
            return action.payload;
            
        default:
            return state;
    }
};
