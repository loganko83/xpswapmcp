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
    <div className="w-full bg-slate-900 dark:bg-slate-950 backdrop-blur-sm border-b border-slate-700 overflow-hidden relative shadow-lg">
      <div 
        className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-scroll-ticker'}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTickers.map((ticker, index) => (
          <div
            key={`${ticker.id}-${index}`}
            className="flex items-center space-x-2 px-3 py-1.5 min-w-fit"
          >
            <img 
              src={ticker.iconUrl} 
              alt={ticker.name}
              className="w-5 h-5 rounded-full"
              onError={(e) => {
                // 이미지 로드 실패 시 대체 텍스트 표시
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'inline';
              }}
            />
            <span className="text-lg hidden">{ticker.symbol}</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{ticker.symbol}</span>
            </div>
            <span className="font-mono text-sm font-medium text-white">
              {formatPrice(ticker.price, ticker.symbol)}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                ticker.change24h >= 0
                  ? 'text-green-400 bg-green-900/50'
                  : 'text-red-400 bg-red-900/50'
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