import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TradingPair } from "@/types";
import { getTokenIcon } from "@/lib/tokenUtils";

// Mock trading pairs data
const mockPairs: TradingPair[] = [
  {
    id: 1,
    tokenA: {
      id: 1,
      symbol: "XP",
      name: "Xphere",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isActive: true,
    },
    tokenB: {
      id: 2,
      symbol: "USDT",
      name: "Tether USD",
      address: "0x1234567890123456789012345678901234567890",
      decimals: 6,
      isActive: true,
    },
    liquidityTokenA: "12500000",
    liquidityTokenB: "1052500",
    volume24h: "2100000",
    price: "0.0842",
    priceChange24h: "2.1",
    isActive: true,
  },
  {
    id: 2,
    tokenA: {
      id: 3,
      symbol: "ETH",
      name: "Ethereum",
      address: "0x2345678901234567890123456789012345678901",
      decimals: 18,
      isActive: true,
    },
    tokenB: {
      id: 1,
      symbol: "XP",
      name: "Xphere",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isActive: true,
    },
    liquidityTokenA: "456",
    liquidityTokenB: "8500000",
    volume24h: "890000",
    price: "18.64",
    priceChange24h: "-1.2",
    isActive: true,
  },
  {
    id: 3,
    tokenA: {
      id: 4,
      symbol: "BNB",
      name: "Binance Coin",
      address: "0x3456789012345678901234567890123456789012",
      decimals: 18,
      isActive: true,
    },
    tokenB: {
      id: 2,
      symbol: "USDT",
      name: "Tether USD",
      address: "0x1234567890123456789012345678901234567890",
      decimals: 6,
      isActive: true,
    },
    liquidityTokenA: "2020",
    liquidityTokenB: "654800",
    volume24h: "654000",
    price: "324.12",
    priceChange24h: "0.8",
    isActive: true,
  },
];

export function TopPairs() {


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
          {mockPairs.map((pair) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
