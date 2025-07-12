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

// XpSwap Smart Contract Addresses (Deployed on Xphere Network)
export const CONTRACT_ADDRESSES = {
  XpSwapToken: "0x748031ccc6e1d",
  XpSwapDEX: "0x5b0bcfa1490d", 
  XpSwapLiquidityPool: "0xe909098d05c06",
  XpSwapAdvancedAMM: "0x123c1d407d04a",
  XpSwapStaking: "0xdcbe5c4f166a3",
  XpSwapFarmingRewards: "0xb99484ee2d452",
  XpSwapGovernanceToken: "0xa62a2b8601833",
  XpSwapRevenueManager: "0xb3cde158e6838",
  XpSwapCrosschainBridge: "0x1301bc0dccf81",
  // XPS Native Token (User Deployed)
  XPSToken: "0xf1ba1af6fae54c0f9d82c1d12aef0c57543f12e2"
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
  // XPS Native Token (Deployed)
  {
    symbol: "XPS",
    name: "XpSwap Token",
    address: "0xf1ba1af6fae54c0f9d82c1d12aef0c57543f12e2",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png", // Using XP logo temporarily
    network: "Xphere",
    chainId: 20250217,
    isUtility: true,
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
  // Ethereum Network Tokens
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
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
    network: "Ethereum",
    chainId: 1,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86a33E6441495DEa8e4f1dB6EA8A8DE0b0FE3",
    decimals: 6,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
    network: "Ethereum",
    chainId: 1,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
    network: "Ethereum",
    chainId: 1,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
    network: "Ethereum",
    chainId: 1,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
    network: "Ethereum",
    chainId: 1,
  },
  // BSC Network Tokens
  {
    symbol: "BNB",
    name: "Binance Coin",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    network: "BSC",
    chainId: 56,
  },
  {
    symbol: "BUSD",
    name: "Binance USD",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png",
    network: "BSC",
    chainId: 56,
  },
  {
    symbol: "CAKE",
    name: "PancakeSwap",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
    network: "BSC",
    chainId: 56,
  },
  {
    symbol: "WBNB",
    name: "Wrapped BNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    decimals: 18,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    network: "BSC",
    chainId: 56,
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    decimals: 8,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
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
