import { NetworkConfig } from "@/types";

export const XPHERE_NETWORK: NetworkConfig = {
  chainId: 20250217,
  chainName: "XPHERE 2.0",
  nativeCurrency: {
    name: "XP",
    symbol: "XP",
    decimals: 18,
  },
  rpcUrls: ["https://en-bkk.x-phere.com"],
  blockExplorerUrls: ["https://xp.tamsa.io/main"],
};

export const DEFAULT_TOKENS = [
  // Native XP Token
  {
    symbol: "XP",
    name: "Xphere",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
    network: "Xphere",
    chainId: 20250217,
  },
  // Real Xphere Network Tokens from Explorer
  {
    symbol: "ml",
    name: "Mello",
    address: "0x889E7CA318d7653630E3e874597D2f35EE7ACc84",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/mello-token-image.png",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "XCR",
    name: "XCROLL",
    address: "0x0C6bd4C7581cCc3205eC69BEaB6e6E89A27D45aE",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/xcroll-token-image.png",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "XEF",
    name: "X Engagement Fuel",
    address: "0x80252c2d06bbd85699c555fc3633d5b8ee67c9ad",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/xef-token-image.png",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "WARP",
    name: "WARP",
    address: "0x6c14e0bfed4720b06d12902368034394a98252e7",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/warp-xp.png",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x26096A8ea01a2BaaeF4090b75b00f7Fd3BE348Fb",
    decimals: 6,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "DEV",
    name: "DevGarden",
    address: "0x0A593c8ec0Fbcba36f35f9D95bebe4999d62B5e0",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/default-token-image.svg",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "GCO",
    name: "Galactic Coin",
    address: "0x46c34368f6124e573c29a922273fac7c024429ec",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/default-token-image.svg",
    network: "Xphere",
    chainId: 20250217,
  },
  {
    symbol: "WXPT",
    name: "Wrapped XPT",
    address: "0xf7c8a0248EC185Fe724BBa33219a57945A0914fB",
    decimals: 6,
    logoUrl: "https://api.tamsa.io/public/images/default-token-image.svg",
    network: "Xphere",
    chainId: 20250217,
  },
  // Cross-chain tokens for bridge functionality
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    network: "Ethereum",
    chainId: 1,
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    network: "BSC",
    chainId: 56,
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
