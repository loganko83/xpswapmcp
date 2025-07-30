import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Activity, Zap, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TradingMetrics, VolumeData, TimeframeType, MetricType, formatNumber, formatCurrency, getChangeColor } from "@/types/analytics";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getApiUrl } from '../utils/config';

interface MetricsOverviewProps {
  timeframe: TimeframeType;
  selectedMetric: MetricType;
  onMetricChange: (metric: MetricType) => void;
}

export function MetricsOverview({ timeframe, selectedMetric, onMetricChange }: MetricsOverviewProps) {
  // Fetch trading metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/analytics/metrics", timeframe],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/metrics?timeframe=${timeframe}"));
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    }
  });

  // Fetch volume data for charts
  const { data: volumeData = [] } = useQuery({
    queryKey: ["/api/analytics/volume", timeframe],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/volume?timeframe=${timeframe}"));
      if (!response.ok) throw new Error("Failed to fetch volume data");
      return response.json();
    }
  });

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const pieChartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Volume</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalVolume || 0)}</div>
            <div className={`flex items-center gap-1 text-sm ${getChangeColor(parseFloat(metrics?.volumeChange || '0'))}`}>
              {getChangeIcon(parseFloat(metrics?.volumeChange || '0'))}
              {metrics?.volumeChange || '0'}% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Trades</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalTrades || 0)}</div>
            <div className="text-sm text-muted-foreground">
              {formatNumber(metrics?.trades24h || 0)} in 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Protocol Fees</span>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalFees || 0)}</div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(metrics?.fees24h || 0)} in 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Traders</span>
              <Users className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics?.uniqueTraders || 0)}</div>
            <div className="text-sm text-muted-foreground">
              {formatNumber(metrics?.activeTraders24h || 0)} active today
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Trading Volume</CardTitle>
            <Select value={selectedMetric} onValueChange={onMetricChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="trades">Trades</SelectItem>
                <SelectItem value="fees">Fees</SelectItem>
                <SelectItem value="liquidity">Liquidity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip 
                  formatter={(value: any) => [formatNumber(value), selectedMetric]}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Trade Size</span>
              <span className="font-medium">{formatCurrency(metrics?.averageTradeSize || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Volume/TVL Ratio</span>
              <span className="font-medium">2.45x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fee Revenue (24h)</span>
              <span className="font-medium">{formatCurrency(metrics?.fees24h || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Protocol Efficiency</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                98.7%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'XP/USDT', value: 35 },
                      { name: 'XP/ETH', value: 25 },
                      { name: 'BTC/USDT', value: 20 },
                      { name: 'ETH/USDT', value: 15 },
                      { name: 'Others', value: 5 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {pieChartColors.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
