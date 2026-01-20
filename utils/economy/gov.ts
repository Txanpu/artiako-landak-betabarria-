
import { TileData, TileType, GovernmentType } from '../../types';
import { getHouseCost } from './rent';

export const performStateAutoBuild = (tiles: TileData[], bankHouses: number, bankHotels: number, estadoMoney: number, gov: GovernmentType): { tiles: TileData[], bankHouses: number, bankHotels: number, estadoMoney: number, logs: string[] } => {
    const newTiles = [...tiles];
    let newBankHouses = bankHouses;
    let newBankHotels = bankHotels;
    let newEstadoMoney = estadoMoney;
    const logs: string[] = [];
    
    // LIBERTARIAN: State Sells Assets (Privatization)
    if (gov === 'libertarian') {
        const stateProps = newTiles.filter(t => t.owner === 'E');
        if (stateProps.length > 0) {
            // Sell one property per turn to simulate auction/privatization
            const propToSell = stateProps[0];
            propToSell.owner = null; // Release to public/auction pool
            newEstadoMoney += (propToSell.price || 0);
            logs.push(`🏛️ Gobierno Libertario privatiza (vende): ${propToSell.name}`);
        }
        return { tiles: newTiles, bankHouses: newBankHouses, bankHotels: newBankHotels, estadoMoney: newEstadoMoney, logs };
    }

    // NORMAL STATE BEHAVIOR (Build)
    const families = [...new Set(newTiles.filter(t => t.type === TileType.PROP && t.color).map(t => t.color!))];
    families.forEach(fam => {
        const group = newTiles.filter(t => t.color === fam);
        if (!group.every(t => t.owner === 'E')) return;
        if (group.some(t => t.mortgaged)) return;

        let built = true;
        while (built) {
            built = false;
            const levels = group.map(t => t.hotel ? 5 : (t.houses || 0));
            const min = Math.min(...levels);
            const max = Math.max(...levels);
            if (min >= 5) break; 

            const target = group.find(t => (t.hotel ? 5 : (t.houses || 0)) === min && !t.hotel);
            if (target) {
                const cost = getHouseCost(target);
                if ((target.houses || 0) < 4) {
                    if (newBankHouses > 0 && newEstadoMoney >= cost) {
                        target.houses = (target.houses || 0) + 1;
                        newBankHouses--; newEstadoMoney -= cost;
                        logs.push(`🏠 Estado construye casa en ${target.name}.`); built = true;
                    }
                } else if ((target.houses || 0) === 4) {
                    if (newBankHotels > 0 && newEstadoMoney >= cost) {
                        target.houses = 0; target.hotel = true;
                        newBankHotels--; newBankHouses += 4; newEstadoMoney -= cost;
                        logs.push(`🏨 Estado construye HOTEL en ${target.name}.`); built = true;
                    }
                }
            }
        }
    });
    return { tiles: newTiles, bankHouses: newBankHouses, bankHotels: newBankHotels, estadoMoney: newEstadoMoney, logs };
};
