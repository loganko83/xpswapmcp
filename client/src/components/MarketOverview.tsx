import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketStats } from "@/types";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useQuery } from "@tanstack/react-query";

export function MarketOverview() {
  const { data: tokenPrices } = useTokenPrices(["XP"]);
  
  const { data: marketStats } = useQuery({
    queryKey: ["/api/market-stats"],
    enabled: true,
  });

  const xpPrice = tokenPrices?.XP?.price || 0;
  const priceChange = tokenPrices?.XP?.change24h || 0;
  const formatCurrency = (amount: string, decimals = 2) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(decimals)}`;
  };

  const formatSupply = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)}M XP`;
    }
    return `${num.toLocaleString()} XP`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Hero Image */}
        <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-primary/80 to-primary/60">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">XpSwap</div>
              <div className="text-sm opacity-90">Powered by Xphere</div>
            </div>
          </div>
        </div>

        {/* XP Price Section with Icon */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/attached_assets/099de283d41a405f8fa1652d4c6c8ccc.png" 
              alt="Xphere" 
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-lg">XP Price</h3>
              <p className="text-sm text-muted-foreground">Xphere</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              ${xpPrice.toFixed(6)}
            </span>
            <Badge 
              variant="outline" 
              className={priceChange >= 0 ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
            >
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total Value Locked
            </span>
            <span className="font-semibold">
              {formatCurrency(marketStats?.totalValueLocked || "12400000")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              24h Volume
            </span>
            <span className="font-semibold">
              {formatCurrency(marketStats?.volume24h || "2800000")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Active Pairs
            </span>
            <span className="font-semibold">
              {marketStats?.activePairs || 126}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
