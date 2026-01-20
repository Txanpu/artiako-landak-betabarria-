
import { GameState } from '../../../types';
import { formatMoney, getRent, checkOkupaRentSkip } from '../../gameLogic';
import { WELFARE_TILES } from '../../../constants';

export const payRent = (state: GameState): GameState => {
    const payerIdx = state.currentPlayerIndex; 
    const payer = { ...state.players[payerIdx] }; 
    const tId = payer.pos; 
    const t = state.tiles[tId]; 
    const baseRent = getRent(t, state.dice[0] + state.dice[1], state.tiles, state); 
    
    if (baseRent > 0 && typeof t.owner === 'number' && t.owner !== payer.id) { 
        
        // --- V22: OKUPA CHECK ---
        if (checkOkupaRentSkip(payer)) {
            return { ...state, logs: [`🏚️ ${payer.name} (Okupa) se niega a pagar el alquiler.`, ...state.logs] };
        }

        const ivaRate = state.currentGovConfig.rentIVA || 0; 
        const ivaAmount = Math.round(baseRent * ivaRate);
        const totalPay = baseRent + ivaAmount;
        const ownerIdx = state.players.findIndex(p => p.id === t.owner); 
        const updatedPlayers = [...state.players]; 
        let newEstadoMoney = state.estadoMoney;
        let newFbiPot = state.fbiPot || 0;
        let logStr = '';
        
        // WELFARE LOGIC: If Gov is Left and Tile is covered, State Pays
        const isWelfare = WELFARE_TILES.includes(t.name) || ['bus','rail','ferry','air'].includes(t.subtype || '');
        if (state.gov === 'left' && isWelfare) {
                if (newEstadoMoney >= totalPay) {
                    newEstadoMoney -= totalPay;
                    if (ownerIdx !== -1) {
                        updatedPlayers[ownerIdx] = { ...updatedPlayers[ownerIdx], money: updatedPlayers[ownerIdx].money + baseRent };
                        // State gets the IVA back basically (or it goes to FBI pot/black hole)
                        // For gameplay, let's put IVA into FBI Pot to create accumulation
                        newFbiPot += ivaAmount;
                    }
                    logStr = `🏛️ El Estado subvenciona el alquiler en ${t.name}.`;
                } else {
                    logStr = `🏛️ Estado sin fondos para subvención. Impago.`;
                }
        } else {
            // Normal Player Pay
            payer.money -= totalPay; 
            logStr = `${payer.name} pagó ${formatMoney(baseRent)} a ${updatedPlayers[ownerIdx]?.name}`;
            if (ownerIdx !== -1) { 
                updatedPlayers[ownerIdx] = { ...updatedPlayers[ownerIdx], money: updatedPlayers[ownerIdx].money + baseRent }; 
            } 
            if (ivaAmount > 0) {
                // IVA Breakdown in log for user verification
                const toState = Math.floor(ivaAmount / 2);
                const toPot = ivaAmount - toState;
                newEstadoMoney += toState;
                newFbiPot += toPot;
                logStr += ` + ${formatMoney(ivaAmount)} IVA (${(ivaRate*100).toFixed(0)}%).`;
            }
        }
        
        updatedPlayers[payerIdx] = payer; 

        return { ...state, players: updatedPlayers, estadoMoney: newEstadoMoney, fbiPot: newFbiPot, logs: [logStr, ...state.logs] }; 
    } 
    return state; 
};
