/**
 * Application constants
 */

// Token addresses (Xphere Network)
export const TOKEN_ADDRESSES = {
  XP: '0x0000000000000000000000000000000000000000', // Native token
  XPS: '0x1234567890123456789012345678901234567890', // To be deployed
  USDT: '0x2345678901234567890123456789012345678901',
  WETH: '0x3456789012345678901234567890123456789012',
  WBNB: '0x4567890123456789012345678901234567890123',
} as const;

// Network configuration
export const NETWORKS = {
  XPHERE: {
    chainId: 1117,
    name: 'Xphere Network',
    rpcUrl: 'https://en-bkk.x-phere.com',
    explorerUrl: 'https://explorer.x-phere.com',
    nativeCurrency: {
      name: 'XP',
      symbol: 'XP',
      decimals: 18
    }
  },
  ETHEREUM: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  BSC: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  }
} as const;

// API endpoints
export const API_ENDPOINTS = {
  COINMARKETCAP: 'https://pro-api.coinmarketcap.com/v1',
  COINGECKO: 'https://api.coingecko.com/api/v3',
  XPHERE_RPC: 'https://en-bkk.x-phere.com'
} as const;

// Trading constants
export const TRADING = {
  DEFAULT_SLIPPAGE: 0.005, // 0.5%
  MAX_SLIPPAGE: 0.5, // 50%
  FEE_RATE: 0.003, // 0.3%
  MIN_LIQUIDITY: '1000000000000000', // 0.001 token
  DEADLINE_BUFFER: 1200, // 20 minutes
} as const;

// Cache TTL (seconds)
export const CACHE_TTL = {
  PRICE: 60, // 1 minute
  MARKET_STATS: 300, // 5 minutes
  POOL_DATA: 60, // 1 minute
  USER_BALANCE: 30, // 30 seconds
  TRANSACTION: 3600, // 1 hour
} as const;

// Rate limits
export const RATE_LIMITS = {
  GLOBAL: { windowMs: 60000, max: 100 }, // 100 requests per minute
  TRADING: { windowMs: 60000, max: 30 }, // 30 trades per minute
  WALLET: { windowMs: 60000, max: 50 }, // 50 wallet operations per minute
} as const;

// Error codes
export const ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_LIQUIDITY: 'INSUFFICIENT_LIQUIDITY',
  SLIPPAGE_EXCEEDED: 'SLIPPAGE_EXCEEDED',
  DEADLINE_EXCEEDED: 'DEADLINE_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
} as const;

// Supported tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: 'XP',
    name: 'Xphere',
    address: TOKEN_ADDRESSES.XP,
    decimals: 18,
    logoURI: '/tokens/xp.png',
    chainId: NETWORKS.XPHERE.chainId
  },
  {
    symbol: 'XPS',
    name: 'XPSwap Token',
    address: TOKEN_ADDRESSES.XPS,
    decimals: 18,
    logoURI: '/tokens/xps.png',
    chainId: NETWORKS.XPHERE.chainId
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: TOKEN_ADDRESSES.USDT,
    decimals: 6,
    logoURI: '/tokens/usdt.png',
    chainId: NETWORKS.XPHERE.chainId
  }
] as const;
