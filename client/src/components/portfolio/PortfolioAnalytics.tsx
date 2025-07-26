import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Target, TrendingUp, AlertCircle, TrendingDown, Activity } from "lucide-react";
import { PortfolioMetrics, PortfolioAsset, PortfolioHistory, TimeframeType } from "./PortfolioTypes";

interface PortfolioAnalyticsProps {
  metrics: PortfolioMetrics | null;
  assets: PortfolioAsset[];
  history: PortfolioHistory[];
  timeframe: TimeframeType;
  showPrivate: boolean;
  formatCurrency: (amount: number) => string;
  getChangeColor: (change: number) => string;
}

export function PortfolioAnalytics({
  metrics,
  assets,
  history,
  timeframe,
  showPrivate,
  formatCurrency,
  getChangeColor
}: PortfolioAnalyticsProps) {
  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (!assets.length) return null;
    
    const bestAsset = assets.reduce((best, asset) => 
      asset.change24h > best.change24h ? asset : best, assets[0]);
    const worstAsset = assets.reduce((worst, asset) => 
      asset.change24h < worst.change24h ? asset : worst, assets[0]);
    
    const totalReturn = metrics?.totalChangePercent || 0;
    const sharpeRatio = totalReturn / Math.max(metrics?.riskScore || 1, 1) * 100;
    const valueAtRisk = (metrics?.totalValue || 0) * 0.05; // 5% VaR estimate
    
    return {
      bestAsset,
      worstAsset,
      sharpeRatio,
      valueAtRisk,
      maxDrawdown: -8.5 // Simulated value
    };
  };

  const performanceMetrics = calculatePerformanceMetrics();
  
  // Generate portfolio insights
  const generateInsights = () => {
    const insights = [];
    
    if (metrics) {
      // Optimization opportunity
      if (metrics.diversificationScore < 70) {
        insights.push({
          type: 'warning',
          icon: Target,
          title: 'Diversification Opportunity',
          message: 'Consider rebalancing to improve diversification score and reduce concentration risk.',
          color: 'yellow'
        });
      }
      
      // Performance alert
      if (metrics.totalChangePercent > 10) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: 'Strong Performance',
          message: `Your portfolio is outperforming expectations with ${metrics.totalChangePercent.toFixed(1)}% growth.`,
          color: 'green'
        });
      }
      
      // Risk warning
      if (metrics.riskScore > 75) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'High Risk Alert',
          message: 'Portfolio risk is elevated. Consider rebalancing to safer assets for better stability.',
          color: 'red'
        });
      }
      
      // APY optimization
      if (metrics.portfolioAPY < 15) {
        insights.push({
          type: 'info',
          icon: Activity,
          title: 'Yield Optimization',
          message: 'Explore higher-yield staking opportunities to maximize your returns.',
          color: 'blue'
        });
      }
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Return ({timeframe})</span>
              <span className={`font-medium ${getChangeColor(metrics?.totalChangePercent || 0)}`}>
                {metrics?.totalChangePercent?.toFixed(2) || '0.00'}%
              </span>
            </div>
            
            {performanceMetrics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Performing Asset</span>
                  <span className="font-medium text-green-600">
                    {performanceMetrics.bestAsset.symbol} (+{performanceMetrics.bestAsset.change24h.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Worst Performing Asset</span>
                  <span className="font-medium text-red-600">
                    {performanceMetrics.worstAsset.symbol} ({performanceMetrics.worstAsset.change24h.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <span className="font-medium">{performanceMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Portfolio Risk</span>
                <span className="text-sm">{metrics?.riskScore || 0}/100</span>
              </div>
              <Progress value={metrics?.riskScore || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {(metrics?.riskScore || 0) < 30 ? 'Conservative' : 
                 (metrics?.riskScore || 0) < 70 ? 'Moderate' : 'Aggressive'} risk profile
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Diversification</span>
                <span className="text-sm">{metrics?.diversificationScore || 0}/100</span>
              </div>
              <Progress value={metrics?.diversificationScore || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {(metrics?.diversificationScore || 0) >= 80 ? 'Excellent' :
                 (metrics?.diversificationScore || 0) >= 60 ? 'Good' : 'Needs improvement'} diversification
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value at Risk (95%)</span>
                <span>{showPrivate ? formatCurrency(performanceMetrics?.valueAtRisk || 0) : '••••'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Maximum Drawdown</span>
                <span className="text-red-600">{performanceMetrics?.maxDrawdown || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History ({timeframe})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)}%`, 'Change']}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="change" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Asset Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Performance Comparison (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)}%`, '24h Change']}
                />
                <Bar 
                  dataKey="change24h" 
                  fill={(entry: any) => entry.change24h >= 0 ? '#10b981' : '#ef4444'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p>Your portfolio looks well-balanced!</p>
              <p className="text-sm">No immediate recommendations at this time.</p>
            </div>
          ) : (
            insights.map((insight, index) => {
              const colorClasses = {
                blue: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
                green: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
                yellow: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
                red: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              };
              
              const IconComponent = insight.icon;
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${colorClasses[insight.color as keyof typeof colorClasses]}`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm mt-1 opacity-90">
                        {insight.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics ? (metrics.portfolioAPY / Math.max(metrics.riskScore, 1) * 100).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-muted-foreground">Risk-Adjusted Return</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {assets.length > 0 ? (assets.reduce((sum, asset) => sum + asset.change24h, 0) / assets.length).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-muted-foreground">Average Asset Performance</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {assets.length}
            </div>
            <div className="text-sm text-muted-foreground">Assets in Portfolio</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
