import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Target, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getApiUrl } from "@/lib/apiUrl";
export function RiskInsights() {
  // Risk metrics
  const { data: riskMetrics } = useQuery({
    queryKey: ["/api/analytics/risk"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/risk");
      if (!response.ok) throw new Error("Failed to fetch risk metrics");
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Liquidity Risk</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
                </div>
                <Progress value={25} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Strong liquidity across major pairs
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Volatility Risk</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium</Badge>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Moderate price volatility observed
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Smart Contract Risk</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
                </div>
                <Progress value={15} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Audited contracts with high security
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-700 dark:text-yellow-300">Risk Alert</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Increased volatility detected in XP/USDT pair. Consider adjusting position sizes.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Risk Metrics</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Value at Risk (95%)</span>
                  <span>$2,450</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Maximum Drawdown</span>
                  <span>-8.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sharpe Ratio</span>
                  <span>1.85</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-300">Opportunity</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    XP/ETH pair showing strong correlation with market sentiment. Consider yield farming opportunities.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-700 dark:text-green-300">Trend Analysis</div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Trading volume increased 45% this week. Strong bullish momentum detected.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+23.5%</div>
                <div className="text-xs text-muted-foreground">Protocol Growth</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">158.3%</div>
                <div className="text-xs text-muted-foreground">Avg APR</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">99.8%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">1,247</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
