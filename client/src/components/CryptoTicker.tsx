import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface TickerData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  iconUrl: string;
}

export function CryptoTicker() {
  const [isPaused, setIsPaused] = useState(false);

  const { data: tickerData, isLoading } = useQuery({
    queryKey: ["/api/crypto-ticker"],
    refetchInterval: 30000, // 30초마다 업데이트
  });

  if (isLoading || !tickerData) return null;

  const tickers: TickerData[] = tickerData.tickers || [];

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'XP') {
      return `$${price.toFixed(6)}`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // 티커 데이터를 두 번 복제하여 끊김 없는 스크롤 구현
  const duplicatedTickers = [...tickers, ...tickers];

  return (
    <div className="w-full bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm border-b border-border/50 overflow-hidden relative">
      <div 
        className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-scroll-ticker'}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTickers.map((ticker, index) => (
          <div
            key={`${ticker.id}-${index}`}
            className="flex items-center space-x-3 px-6 py-3 min-w-fit"
          >
            <img 
              src={ticker.iconUrl} 
              alt={ticker.name}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                // 이미지 로드 실패 시 대체 텍스트 표시
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'inline';
              }}
            />
            <span className="text-lg hidden">{ticker.symbol}</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground">{ticker.symbol}</span>
              <span className="text-sm text-muted-foreground">{ticker.name}</span>
            </div>
            <span className="font-mono text-sm font-medium text-foreground">
              {formatPrice(ticker.price, ticker.symbol)}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                ticker.change24h >= 0
                  ? 'text-green-600 bg-green-100/50 dark:text-green-400 dark:bg-green-900/30'
                  : 'text-red-600 bg-red-100/50 dark:text-red-400 dark:bg-red-900/30'
              }`}
            >
              {formatChange(ticker.change24h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}