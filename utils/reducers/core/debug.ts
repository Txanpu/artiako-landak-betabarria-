
import { GameState } from '../../../types';

export const debugReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'TOGGLE_HEATMAP': 
            return { ...state, showHeatmap: !state.showHeatmap };
        
        case 'TOGGLE_BALANCE_MODAL': 
            return { ...state, showBalanceModal: !state.showBalanceModal };
        
        case 'TOGGLE_GOV_GUIDE': 
            return { ...state, showGovGuide: !state.showGovGuide };

        case 'TOGGLE_WEATHER_MODAL': 
            return { ...state, showWeatherModal: !state.showWeatherModal };

        case 'CLOSE_EVENT': 
            return { ...state, activeEvent: null };

        // Debugs
        case 'DEBUG_ADD_MONEY': { 
            const { pId, amount } = action.payload; 
            const ps = [...state.players]; 
            if (ps[pId]) ps[pId].money += amount; 
            return { ...state, players: ps }; 
        }
        case 'DEBUG_TELEPORT': { 
            const { pId, pos } = action.payload; 
            const ps = [...state.players]; 
            if (ps[pId]) ps[pId].pos = pos; 
            return { ...state, players: ps }; 
        }
        case 'DEBUG_SET_ROLE': { 
            const { pId, role } = action.payload; 
            const ps = [...state.players]; 
            if (ps[pId]) ps[pId].role = role as any; 
            return { ...state, players: ps }; 
        }
        case 'DEBUG_SET_GOV': 
            return { ...state, gov: action.payload as any };
        
        case 'DEBUG_TRIGGER_EVENT': 
            return { ...state, nextEventId: action.payload };

        default: 
            return state;
    }
};
