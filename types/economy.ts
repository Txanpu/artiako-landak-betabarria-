
// === DEBT & FINANCE ===
export interface LoanShare {
    id: string;
    ownerId: number;
    bips: number; // Basis points (10000 = 100%)
}

export interface LoanPool {
    id: string;
    name: string;
    loanIds: string[];
    unitsTotal: number;
    holdings: Record<number, number>; // playerId -> units
    cash: number; 
}

export interface Loan {
  id: string;
  borrowerId: number;
  lenderId: number | 'E'; 
  principal: number;
  interestTotal: number;
  turnsTotal: number;
  turnsLeft: number;
  amountPerTurn: number;
  status: 'active' | 'defaulted' | 'paid';
  collateralTileIds?: number[]; 
  lastMarginTurn?: number;
  poolId?: string;
  shares?: LoanShare[];
}

export interface FinancialOption {
    id: string;
    type: 'call' | 'put';
    propertyId: number; 
    strikePrice: number; // Precio de ejecución
    premium: number;     // Precio pagado por el contrato
    writerId: number;    // El que tiene la OBLIGACIÓN (Call: vender, Put: comprar)
    holderId: number;    // El que tiene el DERECHO (Call: comprar, Put: vender)
    expiresTurn: number;
}

// === NEW: MONOPOLY SHARES ===
export interface MonopolyCompany {
    id: string;
    name: string;
    color: string;
    propertyIds: number[];
    totalShares: number; // Usually 100 or 1000
    shareholders: Record<number, number>; // playerId -> amount owned
    valuation: number; // Total value of assets at creation
}

// === MARKET & TRADE ===
export interface Listing {
    id: string;
    sellerId: number;
    assetType: 'loanShare' | 'poolUnit' | 'option' | 'companyShare'; // Added companyShare
    assetRefId: string; // Loan ID, Pool ID, Option ID, or Company ID
    subRefId?: string; // Share ID if applicable
    amount: number; // Units or Bips. For Option, usually 1.
    price: number;
}

export interface AuctionState {
  tileId: number; 
  items?: number[]; 
  currentBid: number;
  highestBidder: number | 'E' | null;
  activePlayers: number[];
  timer: number;
  isOpen: boolean;
  kind?: 'tile' | 'bundle' | 'loanShare' | 'poolUnit' | 'option' | 'companyShare'; 
  assetId?: string; // Listing ID
  units?: number;   
  sealed?: boolean;
  bids?: Record<string, number>; 
  stateMaxBid?: number; 
}

export interface TradeOffer {
    initiatorId: number;
    targetId: number;
    offeredMoney: number;
    offeredProps: number[]; 
    offeredFarlopa?: number; 
    offeredShares?: { companyId: string, count: number }[]; // NEW: Shares trading
    requestedMoney: number;
    requestedProps: number[]; 
    requestedFarlopa?: number; 
    isOpen: boolean;
}
