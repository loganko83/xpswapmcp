// Options Trading Types
export type OptionType = 'CALL' | 'PUT';

export interface Option {
  id: string;
  underlying: string;
  strike: string;
  expiry: string;
  type: OptionType;
  premium: string;
  openInterest: string;
  available: string;
}

export interface OptionMarket extends Option {
  volume24h: string;
  iv: string; // Implied Volatility
}

export interface OptionPosition {
  id: string;
  wallet: string;
  optionId: string;
  underlying: string;
  strike: string;
  expiry: string;
  type: OptionType;
  amount: string;
  premium: string;
  currentValue: string;
  pnl: string;
  pnlPercentage: string;
}

export interface OptionTrade {
  success: boolean;
  txHash: string;
  trade: {
    optionId: string;
    amount: string;
    premium: string;
    totalCost: string;
    buyer: string;
    timestamp: string;
  };
}

// Futures Trading Types
export type OrderSide = 'LONG' | 'SHORT';

export interface PerpetualMarket {
  pair: string;
  markPrice: string;
  indexPrice: string;
  fundingRate: string;
  nextFundingTime: string;
  volume24h: string;
  openInterest: string;
  maxLeverage: number;
}

export interface FuturesPosition {
  id: string;
  wallet: string;
  pair: string;
  size: string;
  side: OrderSide;
  leverage: number;
  entryPrice: string;
  markPrice: string;
  liquidationPrice: string;
  margin: string;
  unrealizedPnl: string;
  fundingPaid: string;
  timestamp: string;
}

export interface FuturesTrade {
  success: boolean;
  txHash: string;
  position: FuturesPosition;
}

export interface FundingRate {
  pair: string;
  rate: string;
  nextFundingTime: string;
}

// Flash Loan Types
export interface FlashLoan {
  asset: string;
  available: string;
  utilized: string;
  fee: string;
  maxLoanAmount: string;
}

export interface FlashLoanRequest {
  asset: string;
  amount: string;
  targetContract: string;
  calldata: string;
}

export interface FlashLoanExecution {
  success: boolean;
  txHash: string;
  execution: {
    loanAmount: string;
    fee: string;
    totalRepayment: string;
    asset: string;
    targetContract: string;
    timestamp: string;
    gasUsed: string;
    profit: string;
  };
}

export interface ArbitrageOpportunity {
  fromAsset: string;
  toAsset: string;
  buyDex: string;
  sellDex: string;
  buyPrice: string;
  sellPrice: string;
  profitAmount: string;
  profitPercentage: string;
  flashLoanAmount: string;
  flashLoanFee: string;
  estimatedGas: string;
}
