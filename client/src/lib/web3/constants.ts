export const XPHERE_NETWORK = {
  chainId: 20250217,
  chainName: "Xphere Mainnet",
  nativeCurrency: {
    name: "Xphere",
    symbol: "XP",
    decimals: 18,
  },
  rpcUrls: ["https://en-bkk.x-phere.com"],
  blockExplorerUrls: ["https://explorer.x-phere.com"],
};

export const CONTRACT_ADDRESSES = {
  // XPSwap Core Contracts
  XpSwapDEX: "0x77E1f56d1cB5dD0D3FF9BFf9A48E3f7fd93e9920",
  XpSwapFactory: "0x23E4BD7f7C8cB8F07f3421235a3aD9F2e1FE4A09",
  XpSwapRouter: "0x01AB3E6dAF94Cf2fF04B6f3e8F37952F87E5b123",
  
  // Token Contracts
  XPSToken: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
  XPToken: "0x0000000000000000000000000000000000000000", // Native token
  
  // DeFi Contracts
  XpSwapStaking: "0xA29Ce31f0E7e7Cf4C8C7d4b8f2c3b15c97E4F30B",
  XpSwapLiquidityPool: "0xB45e7dE3fd8AB89f0C76D5F4C5b7a8e2fc9A0F12",
  XpSwapYieldFarming: "0xC78E9aF3Db5AC8D0e7E3C8d9A0b1c2F3a4D5E6F7",
  XpSwapGovernance: "0xD91F2B3C4E5a6F7b8c9D0e1A2B3C4D5E6F7A8B9C",
  
  // Advanced DeFi Contracts
  XpSwapOptions: "0xE12A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A",
  XpSwapFutures: "0xF23B4C5D6E7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C",
  XpSwapFlashLoan: "0xA34C5D6E7F8B9A0C1D2E3F4B5C6D7E8A9B0C1D2E",
  
  // Security Contracts
  XpSwapSecurity: "0xB45D6E7F8A9B0C1D2E3A4B5C6E7F8A9B0C1D2E3F",
  XPSwapMEVProtection: "0xC56E7F8B9A0C1D2E3F4C5D6E7A8B9C0D1E2F3A4B",
  XPSwapFlashLoanSecurity: "0xD67F8A9B0C1E2F3B4C5D6F7E8A9B0C1D2E3F4A5C",
};

export const TOKEN_MAP: Record<string, string> = {
  'XP': '0x0000000000000000000000000000000000000000', // Native token
  'XPS': CONTRACT_ADDRESSES.XPSToken,
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'USDC': '0xA0b86a33E6441b2c6A0Ad6F2c91AE2a6b2B1A041',
};

export const SELLER_ADDRESS = '0xf0C5d4889cb250956841c339b5F3798320303D5f';

export const MOBILE_USER_AGENTS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
