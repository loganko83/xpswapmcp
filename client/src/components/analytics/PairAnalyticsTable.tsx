import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PairAnalytics, formatNumber, formatCurrency, getChangeColor } from "@/types/analytics";

import { getApiUrl } from "@/lib/apiUrl";
export function PairAnalyticsTable() {
  // Fetch pair analytics
  const { data: pairAnalytics = [] } = useQuery({
    queryKey: ["/api/analytics/pairs"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/pairs"));
      if (!response.ok) throw new Error("Failed to fetch pair analytics");
      return response.json();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Pairs Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Pair</th>
                <th className="text-right p-3">Volume (24h)</th>
                <th className="text-right p-3">Volume Change</th>
                <th className="text-right p-3">Liquidity</th>
                <th className="text-right p-3">APR</th>
                <th className="text-right p-3">Trades</th>
              </tr>
            </thead>
            <tbody>
              {pairAnalytics.map((pair: PairAnalytics, index: number) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium">{pair.tokenA}/{pair.tokenB}</div>
                  </td>
                  <td className="text-right p-3">{formatCurrency(pair.volume24h)}</td>
                  <td className={`text-right p-3 ${getChangeColor(pair.volumeChange)}`}>
                    {pair.volumeChange > 0 ? '+' : ''}{pair.volumeChange.toFixed(2)}%
                  </td>
                  <td className="text-right p-3">{formatCurrency(pair.liquidity)}</td>
                  <td className="text-right p-3 text-green-600">{pair.apr.toFixed(2)}%</td>
                  <td className="text-right p-3">{formatNumber(pair.trades24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
