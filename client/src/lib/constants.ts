import { NetworkConfig } from "@/types";

export const XPHERE_NETWORK: NetworkConfig = {
  chainId: 20250217,
  chainName: "Xphere Network",
  nativeCurrency: {
    name: "XP",
    symbol: "XP",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.x-phere.com"],
  blockExplorerUrls: ["https://explorer.x-phere.com"],
};

export const DEFAULT_TOKENS = [
  {
    symbol: "XP",
    name: "Xphere",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoUrl: "",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x1234567890123456789012345678901234567890",
    decimals: 6,
    logoUrl: "",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x2345678901234567890123456789012345678901",
    decimals: 18,
    logoUrl: "",
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    address: "0x3456789012345678901234567890123456789012",
    decimals: 18,
    logoUrl: "",
  },
];

export const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0];

export const DEFAULT_SLIPPAGE = 0.5;

export const GAS_LIMIT = {
  SWAP: 200000,
  ADD_LIQUIDITY: 300000,
  REMOVE_LIQUIDITY: 200000,
};

export const REFRESH_INTERVAL = 30000; // 30 seconds

export const API_ENDPOINTS = {
  TOKENS: "/api/tokens",
  PAIRS: "/api/pairs",
  TRANSACTIONS: "/api/transactions",
  POOLS: "/api/pools",
  STATS: "/api/stats",
  QUOTE: "/api/quote",
};
