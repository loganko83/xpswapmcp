import { DEFAULT_TOKENS } from "./constants";

export const getTokenIcon = (symbol: string, token?: any) => {
  // Use token's logoUrl if available
  if (token?.logoUrl) {
    return token.logoUrl;
  }
  
  // Check if token exists in DEFAULT_TOKENS and get its logoUrl
  const defaultToken = DEFAULT_TOKENS.find(t => t.symbol === symbol);
  if (defaultToken?.logoUrl) {
    return defaultToken.logoUrl;
  }
  
  // Fallback to symbol mapping
  const iconMap: { [key: string]: string } = {
    XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
    ml: "https://api.tamsa.io/public/images/mello-token-image.png",
    XCR: "https://api.tamsa.io/public/images/xcroll-token-image.png",
    XEF: "https://api.tamsa.io/public/images/xef-token-image.png",
    WARP: "https://api.tamsa.io/public/images/warp-xp.png",
    USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
    ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    DEV: "https://api.tamsa.io/public/images/default-token-image.svg",
    GCO: "https://api.tamsa.io/public/images/default-token-image.svg",
    WXPT: "https://api.tamsa.io/public/images/default-token-image.svg",
  };
  
  return iconMap[symbol] || "https://api.tamsa.io/public/images/default-token-image.svg";
};

export const formatTokenAmount = (amount: string | number, decimals: number = 6): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(3);
  if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
  return (num / 1000000000).toFixed(2) + 'B';
};