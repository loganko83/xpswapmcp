import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeframeType, MetricType } from "@/types/analytics";
import { useTokenPrices } from "@/hooks/useTokenPrices";

// 모듈화된 컴포넌트들 import
import { MetricsOverview } from "./analytics/MetricsOverview";
import { TokenAnalyticsTable } from "./analytics/TokenAnalyticsTable";
import { PairAnalyticsTable } from "./analytics/PairAnalyticsTable";
import { RiskInsights } from "./analytics/RiskInsights";

export function AdvancedAnalytics() {
  const [timeframe, setTimeframe] = useState<TimeframeType>('24h');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('volume');
  
  const { data: tokenPrices } = useTokenPrices(["XP", "BTC", "ETH", "USDT"]);

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive trading and liquidity analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(value: TimeframeType) => setTimeframe(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1H</SelectItem>
              <SelectItem value="24h">24H</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="pairs">Pairs</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricsOverview 
            timeframe={timeframe}
            selectedMetric={selectedMetric}
            onMetricChange={handleMetricChange}
          />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <TokenAnalyticsTable />
        </TabsContent>

        <TabsContent value="pairs" className="space-y-4">
          <PairAnalyticsTable />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <RiskInsights />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <RiskInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}
