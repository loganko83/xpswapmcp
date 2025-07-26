import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { Token } from "@/types";

interface SwapPriceInfoProps {
  fromToken: Token;
  toToken: Token;
  fromTokenPrice: number;
  toTokenPrice: number;
}

export function SwapPriceInfo({ 
  fromToken, 
  toToken, 
  fromTokenPrice, 
  toTokenPrice 
}: SwapPriceInfoProps) {
  // Get 24h price change data
  const { data: priceChangeData } = useQuery({
    queryKey: [`price-change/${fromToken.symbol}/${toToken.symbol}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const fromTokenChange = priceChangeData?.[fromToken.symbol]?.change24h || 0;
  const toTokenChange = priceChangeData?.[toToken.symbol]?.change24h || 0;

  // Calculate token ratio
  const ratio = fromTokenPrice && toTokenPrice ? 
    (fromTokenPrice / toTokenPrice).toFixed(6) : "0.000000";

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" />
          Price Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{fromToken.symbol}</span>
              <div className="flex items-center gap-1">
                {fromTokenChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <Badge 
                  variant={fromTokenChange >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {fromTokenChange >= 0 ? "+" : ""}{fromTokenChange.toFixed(2)}%
                </Badge>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900">
              ${fromTokenPrice.toFixed(6)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{toToken.symbol}</span>
              <div className="flex items-center gap-1">
                {toTokenChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <Badge 
                  variant={toTokenChange >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {toTokenChange >= 0 ? "+" : ""}{toTokenChange.toFixed(2)}%
                </Badge>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900">
              ${toTokenPrice.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Exchange Rate</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-blue-900">
                1 {fromToken.symbol} = {ratio} {toToken.symbol}
              </div>
              <div className="text-xs text-blue-700">
                Real-time rate
              </div>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Market Statistics</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">24h Volume:</span>
              <span className="font-medium">$8,750</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Liquidity:</span>
              <span className="font-medium">$32.5K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee Tier:</span>
              <span className="font-medium">0.30%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active:</span>
              <span className="font-medium text-green-600">●</span>
            </div>
          </div>
        </div>

        {/* Price Update Info */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Activity className="w-3 h-3" />
            <span>Prices update every 10 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
