import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { getTokenIcon } from "@/lib/tokenUtils";
import { PoolCardProps } from "./LiquidityPoolTypes";

export function PoolCard({ pool, onAddLiquidity, onRemoveLiquidity }: PoolCardProps) {
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                <img 
                  src={getTokenIcon(pool.tokenA.symbol)} 
                  alt={pool.tokenA.symbol}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                <img 
                  src={getTokenIcon(pool.tokenB.symbol)} 
                  alt={pool.tokenB.symbol}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {pool.tokenA.symbol}/{pool.tokenB.symbol}
              </h3>
              <p className="text-sm text-muted-foreground">
                Fee: {pool.feeRate}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-8 text-right">
            <div>
              <p className="text-sm text-muted-foreground">TVL</p>
              <p className="font-semibold">{formatCurrency(pool.tvl)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">APR</p>
              <Badge variant="secondary" className="text-green-600">
                {pool.apr}%
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="font-semibold">{formatCurrency(pool.volume24h)}</p>
            </div>
            <div className="space-x-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onAddLiquidity(pool)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRemoveLiquidity(pool)}
              >
                <Minus className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Pool Details */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Reserve {pool.tokenA.symbol}</p>
            <p className="font-medium">{pool.reserveA}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reserve {pool.tokenB.symbol}</p>
            <p className="font-medium">{pool.reserveB}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Fees Earned</p>
            <p className="font-medium">{formatCurrency(pool.fees24h)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
