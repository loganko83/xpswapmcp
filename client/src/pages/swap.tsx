import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { SwapInterface } from "@/components/SwapInterface";
import { TransactionHistory } from "@/components/TransactionHistory";
import { TopPairs } from "@/components/TopPairs";
import { MarketOverview } from "@/components/MarketOverview";
import { LiquidityPools } from "@/components/LiquidityPools";

export default function SwapPage() {
  // Mock market stats
  const marketStats = {
    tvl: "$12.4M",
    tvlChange: "+12.3%",
    volume: "$2.8M",
    volumeChange: "-5.2%",
    pairs: "126",
    pairsChange: "+8",
    xpPrice: "$0.0842",
    xpChange: "+2.1%",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Total Value Locked
              </span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{marketStats.tvl}</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {marketStats.tvlChange}
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                24h Volume
              </span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{marketStats.volume}</div>
            <Badge variant="outline" className="text-red-600 border-red-200">
              {marketStats.volumeChange}
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Active Pairs
              </span>
              <Activity className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{marketStats.pairs}</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {marketStats.pairsChange} New
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                XP Price
              </span>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{marketStats.xpPrice}</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {marketStats.xpChange}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Swap Interface and Transaction History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-center">
            <SwapInterface />
          </div>
          <TransactionHistory />
        </div>

        {/* Right Column - Market Data */}
        <div className="space-y-8">
          <TopPairs />
          <MarketOverview />
          <LiquidityPools />
        </div>
      </div>
    </div>
  );
}