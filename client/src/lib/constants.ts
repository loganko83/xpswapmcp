// Contract addresses on Xphere network
export const CONTRACT_ADDRESSES = {
  // XPS Token Contract
  XPSToken: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
  
  // DEX Core Contracts
  XpSwapDEX: "0x5b0bcfa1490d",
  XpSwapLiquidityPool: "0xe909098d05c06",
  XpSwapAdvancedAMM: "0x123c1d407d04a",
  
  // Staking and Rewards
  XpSwapStaking: "0xdcbe5c4f166a3",
  XpSwapFarmingRewards: "0xb99484ee2d452",
  
  // Governance
  XpSwapGovernanceToken: "0xa62a2b8601833",
  
  // Revenue Management
  XpSwapRevenueManager: "0xb3cde158e6838",
  
  // Cross-chain Bridge
  XpSwapCrosschainBridge: "0x1301bc0dccf81"
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