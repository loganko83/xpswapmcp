import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TradingPair } from "@/types";
import { getTokenIcon } from "@/lib/tokenUtils";
import { useQuery } from "@tanstack/react-query";

import { getApiUrl } from "@/lib/apiUrl";
export function TopPairs() {
  const { data: pairs = [] } = useQuery({
    queryKey: ['top-pairs'],
    queryFn: async () => {
      try {
        const response = await fetch(getApiUrl("/api/pools/pairs"));
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        return data.slice(0, 3); // Top 3 pairs
      } catch (error) {
        console.error('Failed to fetch top pairs:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });


  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num < 1) {
      return `$${num.toFixed(4)}`;
    }
    return `$${num.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pairs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pairs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No pairs available
            </div>
          ) : (
            pairs.map((pair: TradingPair) => (
            <div
              key={pair.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                    <img 
                      src={getTokenIcon(pair.tokenA.symbol)} 
                      alt={pair.tokenA.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                    <img 
                      src={getTokenIcon(pair.tokenB.symbol)} 
                      alt={pair.tokenB.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold">
                    {pair.tokenA.symbol}/{pair.tokenB.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatVolume(pair.volume24h)} Volume
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatPrice(pair.price)}</div>
                <div className="flex items-center space-x-1">
                  {parseFloat(pair.priceChange24h) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <Badge
                    variant="outline"
                    className={
                      parseFloat(pair.priceChange24h) >= 0
                        ? "text-green-600 border-green-200"
                        : "text-red-600 border-red-200"
                    }
                  >
                    {parseFloat(pair.priceChange24h) >= 0 ? "+" : ""}
                    {pair.priceChange24h}%
                  </Badge>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
