// Contract addresses on Xphere network
export const CONTRACT_ADDRESSES = {
  // XPS Token Contract
  XPSToken: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
  
  // DEX Core Contracts
  XpSwapDEX: "0x5b0bcfa1490d000000000000000000000000000",
  XpSwapLiquidityPool: "0xe909098d05c06000000000000000000000000000",
  XpSwapAdvancedAMM: "0x123c1d407d04a000000000000000000000000000",
  
  // Staking and Rewards
  XpSwapStaking: "0xdcbe5c4f166a3000000000000000000000000000",
  XpSwapFarmingRewards: "0xb99484ee2d452000000000000000000000000000",
  
  // Governance
  XpSwapGovernanceToken: "0xa62a2b8601833000000000000000000000000000",
  
  // Revenue Management
  XpSwapRevenueManager: "0xb3cde158e6838000000000000000000000000000",
  
  // Cross-chain Bridge
  XpSwapCrosschainBridge: "0x1301bc0dccf81000000000000000000000000000"
};

// Network Configuration
export const XPHERE_NETWORK = {
  chainId: 20250217,
  name: "Xphere Network",
  nativeCurrency: {
    name: "XP",
    symbol: "XP",
    decimals: 18
  },
  rpcUrls: ["https://en-bkk.x-phere.com"],
  blockExplorerUrls: ["https://explorer.x-phere.com"]
};

// XPS Token Info
export const XPS_TOKEN_INFO = {
  address: CONTRACT_ADDRESSES.XPSToken,
  symbol: "XPS",
  name: "XpSwap Token",
  decimals: 18,
  totalSupply: "1000000000", // 1B tokens
  priceUSD: 1.0 // 1 XPS = 1 USD
};

// Default tokens for the platform
export const DEFAULT_TOKENS = [
  {
    id: 1,
    symbol: "XP",
    name: "Xphere",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
    network: "xphere",
    iconUrl: "/attached_assets/image_1752382591627.png"
  },
  {
    id: 2,
    symbol: "XPS",
    name: "XpSwap Token",
    address: CONTRACT_ADDRESSES.XPSToken,
    decimals: 18,
    isNative: false,
    network: "xphere",
    iconUrl: "/attached_assets/image_1752382591627.png"
  },
  {
    id: 3,
    symbol: "BTC",
    name: "Bitcoin",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/1.png"
  },
  {
    id: 4,
    symbol: "ETH",
    name: "Ethereum",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/1027.png"
  },
  {
    id: 5,
    symbol: "USDT",
    name: "Tether",
    address: "0x",
    decimals: 6,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/825.png"
  },
  {
    id: 6,
    symbol: "BNB",
    name: "BNB",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "bsc",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/1839.png"
  },
  {
    id: 7,
    symbol: "USDC",
    name: "USD Coin",
    address: "0x",
    decimals: 6,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/3408.png"
  },
  {
    id: 8,
    symbol: "SOL",
    name: "Solana",
    address: "0x",
    decimals: 9,
    isNative: false,
    network: "solana",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/5426.png"
  },
  {
    id: 9,
    symbol: "DOGE",
    name: "Dogecoin",
    address: "0x",
    decimals: 8,
    isNative: false,
    network: "dogecoin",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/74.png"
  },
  {
    id: 10,
    symbol: "MATIC",
    name: "Polygon",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "polygon",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/3890.png"
  }
];