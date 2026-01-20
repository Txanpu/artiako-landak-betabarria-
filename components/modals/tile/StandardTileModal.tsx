
import React from 'react';
import { GameState, TileData, Player } from '../../../types';
import { TransportTicket } from './views/TransportTicket';
import { UtilityBill } from './views/UtilityBill';
import { PropertyCard } from './views/PropertyCard';
import { CasinoEntradaView } from './views/special/CasinoEntradaView';

interface StandardTileModalProps {
    state: GameState;
    dispatch: React.Dispatch<any>;
    t: TileData;
    currentPlayer: Player;
}

export const StandardTileModal: React.FC<StandardTileModalProps> = (props) => {
    const { t } = props;
    const isTransport = ['rail', 'bus', 'ferry', 'air'].includes(t.subtype || '');
    const isUtility = t.subtype === 'utility';
    const isCasino = ['casino_bj', 'casino_roulette'].includes(t.subtype || '');

    if (isCasino) {
        return <CasinoEntradaView {...props} />;
    }

    if (isTransport) {
        return <TransportTicket {...props} />;
    }

    if (isUtility) {
        return <UtilityBill {...props} />;
    }

    return <PropertyCard {...props} />;
};
