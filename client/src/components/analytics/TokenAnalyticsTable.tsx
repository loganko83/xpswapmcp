import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TokenAnalytics, formatNumber, formatCurrency, getChangeColor } from "@/types/analytics";

import { getApiUrl } from "@/lib/apiUrl";
export function TokenAnalyticsTable() {
  // Fetch token analytics
  const { data: tokenAnalytics = [] } = useQuery({
    queryKey: ["/api/analytics/tokens"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/tokens"));
      if (!response.ok) throw new Error("Failed to fetch token analytics");
      return response.json();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Token</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">24h Change</th>
                <th className="text-right p-3">Volume (24h)</th>
                <th className="text-right p-3">Market Cap</th>
                <th className="text-right p-3">Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {tokenAnalytics.map((token: TokenAnalytics, index: number) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right p-3">${token.price.toFixed(4)}</td>
                  <td className={`text-right p-3 ${getChangeColor(token.priceChange24h)}`}>
                    {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </td>
                  <td className="text-right p-3">{formatCurrency(token.volume24h)}</td>
                  <td className="text-right p-3">{formatCurrency(token.marketCap)}</td>
                  <td className="text-right p-3">{formatCurrency(token.liquidityUSD)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
