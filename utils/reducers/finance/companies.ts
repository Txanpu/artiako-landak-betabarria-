
import { GameState, MonopolyCompany } from '../../../types';
import { getColorGroup, countOwnedInGroup } from '../../ai/constants';
import { formatMoney } from '../../gameLogic';

export const companyReducer = (state: GameState, action: any): GameState => {
    switch (action.type) {
        case 'CREATE_MONOPOLY_COMPANY': {
            const { color } = action.payload;
            const pIdx = state.currentPlayerIndex;
            const player = state.players[pIdx];
            
            // FIX: Guard check for undefined player
            if (!player) return state;

            // 1. Validate Ownership (Full Monopoly Required)
            const group = getColorGroup(state.tiles, color);
            const ownedCount = countOwnedInGroup(group, player.id);
            
            if (ownedCount !== group.length) {
                return { ...state, logs: [`❌ No posees todo el grupo ${color} para crear una Sociedad.`, ...state.logs] };
            }

            // 2. Validate Constraints (Cannot be mortgaged)
            if (group.some(t => t.mortgaged)) {
                return { ...state, logs: [`❌ No puedes crear Sociedad con propiedades hipotecadas.`, ...state.logs] };
            }

            // 3. Create Company Object
            const totalValuation = group.reduce((acc, t) => acc + (t.price || 0) + ((t.houses||0)* (t.houseCost||50)) + (t.hotel ? (t.houseCost||50)*5 : 0), 0);
            
            const companyId = `comp_${color}_${Math.random().toString(36).substr(2, 5)}`;
            const newCompany: MonopolyCompany = {
                id: companyId,
                name: `Sociedad ${color.toUpperCase()}`,
                color: color,
                propertyIds: group.map(t => t.id),
                totalShares: 10, // UPDATED: 10 Shares Logic
                shareholders: { [player.id]: 10 }, // Owner starts with 100% (10 shares)
                valuation: totalValuation
            };

            // 4. Update Tiles (Lock them with companyId and change owner to SHARES)
            const newTiles = [...state.tiles];
            group.forEach(t => {
                newTiles[t.id] = { ...t, companyId: companyId, owner: 'SHARES' };
            });

            return {
                ...state,
                tiles: newTiles,
                companies: [...state.companies, newCompany],
                logs: [`🏢 ¡${player.name} ha fundado la Sociedad ${newCompany.name}! Acciones emitidas: 10.`, ...state.logs]
            };
        }
        default: return state;
    }
};
