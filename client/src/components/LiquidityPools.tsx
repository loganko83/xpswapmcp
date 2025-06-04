import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { LiquidityPool } from "@/types";

// Mock liquidity pools data
const mockPools: LiquidityPool[] = [
  {
    id: 1,
    pair: {
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
    totalLiquidity: "5200000",
    apr: "45.2",
    rewardTokens: ["XP"],
    isActive: true,
  },
  {
    id: 2,
    pair: {
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
    totalLiquidity: "3100000",
    apr: "32.8",
    rewardTokens: ["XP", "ETH"],
    isActive: true,
  },
];

export function LiquidityPools() {
  const getTokenIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    };
    return iconMap[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  const formatTVL = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Liquidity Pools</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          <ExternalLink className="w-4 h-4 mr-1" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {/* Hero Image */}
        <div className="relative h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-slate-900/70 to-transparent">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white">
            <div className="text-sm font-semibold">Total Liquidity</div>
            <div className="text-lg font-bold">
              {formatTVL(
                mockPools
                  .reduce((sum, pool) => sum + parseFloat(pool.totalLiquidity), 0)
                  .toString()
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {mockPools.map((pool) => (
            <div
              key={pool.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center -space-x-1">
                  <div className="w-6 h-6 rounded-full border border-background overflow-hidden">
                    <img 
                      src={getTokenIcon(pool.pair.tokenA.symbol)} 
                      alt={pool.pair.tokenA.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-background overflow-hidden">
                    <img 
                      src={getTokenIcon(pool.pair.tokenB.symbol)} 
                      alt={pool.pair.tokenB.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                <span className="font-medium">
                  {pool.pair.tokenA.symbol}-{pool.pair.tokenB.symbol}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  <Badge variant="secondary" className="text-green-600">
                    {pool.apr}% APR
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTVL(pool.totalLiquidity)} TVL
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
