import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getApiUrl } from "../lib/apiUrl";

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
    queryKey: ["crypto-ticker"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("api/crypto-ticker"));
      if (!response.ok) throw new Error("Failed to fetch ticker data");
      const data = await response.json();
      return data;
    },
    refetchInterval: 15000, // 15초마다 업데이트 (더 빠른 실시간성)
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
    <div className="w-full bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 dark:from-slate-950/90 dark:via-slate-900/90 dark:to-slate-950/90 backdrop-blur-md border-b border-slate-700/50 overflow-hidden relative shadow-lg">
      <div 
        className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-scroll-ticker'}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTickers.map((ticker, index) => (
          <div
            key={`${ticker.id}-${index}`}
            className="flex items-center space-x-3 px-4 py-2 min-w-fit hover:bg-white/5 transition-colors duration-200 rounded-lg mx-1"
          >
            <div className="flex items-center space-x-2">
              <img 
                src={ticker.iconUrl} 
                alt={ticker.name}
                className="w-5 h-5 rounded-full shadow-sm"
                onError={(e) => {
                  // 이미지 로드 실패 시 대체 텍스트 표시
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'inline';
                }}
              />
              <span className="text-lg hidden">{ticker.symbol}</span>
              <span className="font-bold text-white/90 text-sm tracking-wide">{ticker.symbol}</span>
            </div>
            <span className="font-mono text-sm font-medium text-white/80">
              {formatPrice(ticker.price, ticker.symbol)}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                ticker.change24h >= 0
                  ? 'text-green-300 bg-green-500/20 border-green-500/30'
                  : 'text-red-300 bg-red-500/20 border-red-500/30'
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