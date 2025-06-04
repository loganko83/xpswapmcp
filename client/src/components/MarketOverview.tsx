import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketStats } from "@/types";

// Mock market stats
const mockStats: MarketStats = {
  totalValueLocked: "12400000",
  volume24h: "2800000",
  activePairs: 126,
  xpPrice: "0.0842",
  marketCap: "45200000",
  circulatingSupply: "537000000",
  high24h: "0.0865",
  low24h: "0.0798",
};

export function MarketOverview() {
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Market Cap
            </span>
            <span className="font-semibold">
              {formatCurrency(mockStats.marketCap)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Circulating Supply
            </span>
            <span className="font-semibold">
              {formatSupply(mockStats.circulatingSupply)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              24h High
            </span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {formatCurrency(mockStats.high24h, 4)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              24h Low
            </span>
            <Badge variant="outline" className="text-red-600 border-red-200">
              {formatCurrency(mockStats.low24h, 4)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
