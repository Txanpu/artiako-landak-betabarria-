
import { GameState } from '../../../types';
import { formatMoney, getRent, checkOkupaRentSkip } from '../../gameLogic';
import { WELFARE_TILES } from '../../../constants';

export const payRent = (state: GameState): GameState => {
    const payerIdx = state.currentPlayerIndex; 
    const payer = { ...state.players[payerIdx] }; 
    const tId = payer.pos; 
    const t = state.tiles[tId]; 
    const baseRent = getRent(t, state.dice[0] + state.dice[1], state.tiles, state); 
    
    // Check ownership. If companyId exists, owner check is handled differently logic-wise but physically t.owner is usually the creator.
    // We check t.owner !== payer.id OR if it's a company, check if payer owns 100% (rare optimization, usually just pay)
    
    if (baseRent > 0 && ((typeof t.owner === 'number' && t.owner !== payer.id) || t.companyId)) { 
        
        // --- V22: OKUPA CHECK ---
        if (checkOkupaRentSkip(payer)) {
            return { ...state, logs: [`🏚️ ${payer.name} (Okupa) se niega a pagar el alquiler.`, ...state.logs] };
        }

        const ivaRate = state.currentGovConfig.rentIVA || 0; 
        const ivaAmount = Math.round(baseRent * ivaRate);
        const totalPay = baseRent + ivaAmount;
        let newEstadoMoney = state.estadoMoney;
        let newFbiPot = state.fbiPot || 0;
        const updatedPlayers = [...state.players]; 
        let logStr = '';

        // WELFARE LOGIC
        const isWelfare = WELFARE_TILES.includes(t.name) || ['bus','rail','ferry','air'].includes(t.subtype || '');
        if (state.gov === 'left' && isWelfare) {
             if (newEstadoMoney >= totalPay) {
                 newEstadoMoney -= totalPay;
                 // Pay Owner Logic (Below) but source is State
                 // ... (Reuse payment distribution logic logic)
                 // For brevity, let's assume welfare assumes standard owner. 
                 // If company, State pays dividends? Yes.
             } else {
                 return { ...state, logs: [`🏛️ Estado sin fondos para subvención. Impago.`, ...state.logs] };
             }
        } else {
             // Player Pays
             payer.money -= totalPay;
        }

        // --- DISTRIBUTION LOGIC ---
        if (t.companyId) {
            const company = state.companies.find(c => c.id === t.companyId);
            if (company) {
                // Distribute baseRent among shareholders
                let distributed = 0;
                Object.entries(company.shareholders).forEach(([pid, shares]) => {
                    const shareAmt = Math.floor(baseRent * (shares / company.totalShares));
                    if (shareAmt > 0) {
                        const hIdx = updatedPlayers.findIndex(p => p.id === parseInt(pid));
                        if (hIdx !== -1) {
                            updatedPlayers[hIdx] = { ...updatedPlayers[hIdx], money: updatedPlayers[hIdx].money + shareAmt };
                            distributed += shareAmt;
                        }
                    }
                });
                logStr = `🏢 ${payer.name} paga ${formatMoney(baseRent)} a accionistas de ${company.name}.`;
            }
        } else if (typeof t.owner === 'number') {
            const ownerIdx = state.players.findIndex(p => p.id === t.owner); 
            if (ownerIdx !== -1) { 
                updatedPlayers[ownerIdx] = { ...updatedPlayers[ownerIdx], money: updatedPlayers[ownerIdx].money + baseRent }; 
            }
            logStr = `${payer.name} pagó ${formatMoney(baseRent)} a ${updatedPlayers[ownerIdx]?.name}`;
        }

        // IVA Logic
        if (ivaAmount > 0) {
            const toState = Math.floor(ivaAmount / 2);
            const toPot = ivaAmount - toState;
            newEstadoMoney += toState;
            newFbiPot += toPot;
            logStr += ` + ${formatMoney(ivaAmount)} IVA.`;
        }
        
        updatedPlayers[payerIdx] = payer; 

        return { ...state, players: updatedPlayers, estadoMoney: newEstadoMoney, fbiPot: newFbiPot, logs: [logStr, ...state.logs] }; 
    } 
    return state; 
};
