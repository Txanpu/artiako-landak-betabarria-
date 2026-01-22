
import { GameState } from '../../types';
import { handleStealTreasury } from './special/heistLogic';
import { handleGenderAbility } from './special/abilityLogic';
import { handlePlataOPlomo, handleBlackMarket } from './special/crimeLogic';
import { handleBribeGov, handleSabotageSupply, handleUseInsider } from './special/tacticalLogic';

export const specialReducer = (state: GameState, action: any): GameState => {
    
    // Toggle FBI Modal
    if (action.type === 'TOGGLE_FBI_MODAL') {
        return { ...state, showFbiModal: !state.showFbiModal };
    }

    switch (action.type) {
        case 'STEAL_TREASURY': 
            return handleStealTreasury(state);

        case 'TRIGGER_GENDER_ABILITY':
            return handleGenderAbility(state);

        case 'PLATA_O_PLOMO':
            return handlePlataOPlomo(state, action.payload.tId);

        case 'BLACK_MARKET_TRADE':
            return handleBlackMarket(state, action.payload.action);

        case 'BRIBE_GOV':
            return handleBribeGov(state, action.payload.pId);

        case 'SABOTAGE_SUPPLY':
            return handleSabotageSupply(state, action.payload.tId);

        case 'USE_INSIDER':
            return handleUseInsider(state, action.payload.pId);

        default:
            return state;
    }
};
