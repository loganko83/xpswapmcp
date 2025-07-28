import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { LiquidityPool } from "@/types";
import { getTokenIcon } from "@/lib/tokenUtils";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/apiUrl";

export function LiquidityPools() {
  const { data: pools = [], isLoading } = useQuery({
    queryKey: ['liquidity-pools'],
    queryFn: async () => {
      try {
        const response = await fetch(getApiUrl('/api/pools'));
        if (!response.ok) {
          return [];
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch liquidity pools:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatTVL = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const totalLiquidity = pools.reduce((sum: number, pool: LiquidityPool) => 
    sum + parseFloat(pool.totalLiquidity || '0'), 0
  );

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
              {formatTVL(totalLiquidity.toString())}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading pools...
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No liquidity pools available
            </div>
          ) : (
            pools.map((pool: LiquidityPool) => (
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
                      {pool.apr || '0'}% APR
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTVL(pool.totalLiquidity || '0')} TVL
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
