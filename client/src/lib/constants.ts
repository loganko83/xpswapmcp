// Contract addresses on Xphere network
export const CONTRACT_ADDRESSES = {
  XpSwapToken: '0x17E0Cd7AaC2f1096F753649D605e45dA39DE7F68',
  XpSwapDEX: '0x1f20c338bF5004a081f7B1335D73f4BC03948CE7',
  XPSwapFlashLoanSecurity: '0x02195Fa532845B9d743B180f15dF5580964B1aB9',
  XPSwapMEVProtection: '0x5fcF495bec38b587ab3eAdf6a928f399f69288FF',
  XPSwapOptionsSecurity: '0x40Ba1d3B27cF6471169eC0b5F04B5bAa86FBE9a5',
  MultiSigWallet: '0x43Ca4Da324d9794a63b05B643A6fB7fC08BC660F',
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
    network: "Xphere",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png"
  },
  {
    id: 2,
    symbol: "XPS",
    name: "XpSwap Token",
    address: "0xf1ba1af6fae54c0f9d82c1d12aef0c57543f12e2",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://rebel-orangutan-6f0.notion.site/image/attachment%3Aea1e41e5-28b3-486e-bc20-978f86c7e213%3Alogo_xps3.png?table=block&id=22fa68fd-c4b9-80a2-93a5-edbcfa276af7&spaceId=5cba68fd-c4b9-81bc-873e-0003fe11fd03&width=860&userId=&cache=v2"
  },
  {
    id: 3,
    symbol: "XCR",
    name: "XCROLL",
    address: "0x0C6bd4C7581cCc3205eC69BEaB6e6E89A27D45aE",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/xcroll-token-image.png"
  },
  {
    id: 4,
    symbol: "XEF",
    name: "XEF",
    address: "0x80252c2d06bbd85699c555fc3633d5b8ee67c9ad",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/xef-token-image.png"
  },
  {
    id: 5,
    symbol: "ml",
    name: "Mello",
    address: "0x889E7CA318d7653630E3e874597D2f35EE7ACc84",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/mello-token-image.png"
  },
  {
    id: 6,
    symbol: "WARP",
    name: "WARP",
    address: "0x6c14e0bfed4720b06d12902368034394a98252e7",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/warp-xp.png"
  },
  {
    id: 7,
    symbol: "JTK",
    name: "JoyToken",
    address: "0xbe6f5ec8c881fbae2a1a2038ef5e29b875aa90a6",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/default-token-image.svg"
  },
  {
    id: 8,
    symbol: "WXP",
    name: "Wrapped XP",
    address: "0x56d743a0da63a585006e39688a096ece2a0e1244",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/default-token-image.svg"
  },
  {
    id: 9,
    symbol: "USDT",
    name: "USDT",
    address: "0x6485cc42b36b4c982d3f1b6ec42b92007fb0b596",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/default-token-image.svg"
  },
  {
    id: 10,
    symbol: "xDOG",
    name: "Xphere Dog",
    address: "0x3c9048e0a49c9bf31ffa6678e2d2931d5590b5e4",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/default-token-image.svg"
  },
  {
    id: 11,
    symbol: "MEME",
    name: "XP MEME",
    address: "0x47A932878A2E3979E7B54F9e9a831e3700463336",
    decimals: 18,
    isNative: false,
    network: "Xphere",
    iconUrl: "https://api.tamsa.io/public/images/default-token-image.svg"
  },
  // Cross-chain tokens
  {
    id: 12,
    symbol: "BTC",
    name: "Bitcoin",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/1.png"
  },
  {
    id: 13,
    symbol: "ETH",
    name: "Ethereum",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/1027.png"
  },
  {
    id: 14,
    symbol: "BNB",
    name: "BNB",
    address: "0x",
    decimals: 18,
    isNative: false,
    network: "bsc",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/1839.png"
  },
  {
    id: 15,
    symbol: "USDC",
    name: "USD Coin",
    address: "0x",
    decimals: 6,
    isNative: false,
    network: "ethereum",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/3408.png"
  },
  {
    id: 16,
    symbol: "SOL",
    name: "Solana",
    address: "0x",
    decimals: 9,
    isNative: false,
    network: "solana",
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/32x32/5426.png"
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