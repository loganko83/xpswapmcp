import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from "lucide-react";
import { PortfolioMetrics, PortfolioAsset, PortfolioHistory, TimeframeType } from "./PortfolioTypes";

interface PortfolioOverviewProps {
  metrics: PortfolioMetrics | null;
  assets: PortfolioAsset[];
  history: PortfolioHistory[];
  timeframe: TimeframeType;
  showPrivate: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  getChangeColor: (change: number) => string;
  getChangeIcon: (change: number) => JSX.Element;
}

const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export function PortfolioOverview({
  metrics,
  assets,
  history,
  timeframe,
  showPrivate,
  formatCurrency,
  formatNumber,
  getChangeColor,
  getChangeIcon
}: PortfolioOverviewProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const portfolioData = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.allocation,
    color: pieColors[index % pieColors.length]
  }));

  return (
    <div className="space-y-6">
      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {showPrivate ? formatCurrency(metrics.totalValue) : '••••••'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <div className={`flex items-center mt-2 ${getChangeColor(metrics.totalChangePercent)}`}>
              {getChangeIcon(metrics.totalChangePercent)}
              <span className="ml-1 text-sm font-medium">
                {metrics.totalChangePercent >= 0 ? '+' : ''}{metrics.totalChangePercent.toFixed(2)}%
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({formatCurrency(metrics.totalChange24h)})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold">
                  {showPrivate ? formatCurrency(metrics.totalStaked) : '••••••'}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm font-medium text-green-600">
                {metrics.portfolioAPY.toFixed(1)}% APY
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold">
                  {showPrivate ? formatCurrency(metrics.totalRewards) : '••••••'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Claimable rewards
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{metrics.riskScore}/100</p>
                  <Badge variant={metrics.riskScore < 30 ? "default" : metrics.riskScore < 70 ? "secondary" : "destructive"}>
                    {metrics.riskScore < 30 ? "Low" : metrics.riskScore < 70 ? "Medium" : "High"}
                  </Badge>
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <Progress value={metrics.riskScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value ({timeframe})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => formatNumber(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Value"]}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalValue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Allocation"]} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {portfolioData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {entry.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diversification Score */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Diversification Score</span>
                <span className="text-sm font-bold">{metrics.diversificationScore}/100</span>
              </div>
              <Progress value={metrics.diversificationScore} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.diversificationScore >= 80 
                  ? "Excellent diversification" 
                  : metrics.diversificationScore >= 60 
                  ? "Good diversification" 
                  : "Consider diversifying more"}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Risk-Return Ratio</span>
                <span className="text-sm font-bold">
                  {(metrics.portfolioAPY / Math.max(metrics.riskScore, 1)).toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min((metrics.portfolioAPY / Math.max(metrics.riskScore, 1)) * 10, 100)} 
                className="mb-2" 
              />
              <p className="text-xs text-muted-foreground">
                Higher ratio indicates better risk-adjusted returns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
