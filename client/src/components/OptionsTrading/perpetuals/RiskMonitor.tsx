import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface RiskMetrics {
  totalExposure: number;
  portfolioVar: number;
  maxDrawdown: number;
  sharpeRatio: number;
  correlationRisk: number;
  liquidationRisk: number;
  fundingRisk: number;
  concentrationRisk: number;
}

interface MarketMetrics {
  volatilityIndex: number;
  fearGreedIndex: number;
  longShortRatio: number;
  fundingRates: Array<{
    symbol: string;
    rate: number;
    prediction: 'bullish' | 'bearish' | 'neutral';
  }>;
  marketSentiment: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
}

interface RiskMonitorProps {
  riskMetrics: RiskMetrics;
  marketMetrics: MarketMetrics;
  totalPortfolioValue: number;
}

export function RiskMonitor({ 
  riskMetrics, 
  marketMetrics, 
  totalPortfolioValue 
}: RiskMonitorProps) {
  const getRiskLevel = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value <= thresholds.low) return { level: 'LOW', color: 'bg-green-500', textColor: 'text-green-600' };
    if (value <= thresholds.medium) return { level: 'MEDIUM', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (value <= thresholds.high) return { level: 'HIGH', color: 'bg-orange-500', textColor: 'text-orange-600' };
    return { level: 'CRITICAL', color: 'bg-red-500', textColor: 'text-red-600' };
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'extreme_fear': return 'bg-red-600';
      case 'fear': return 'bg-orange-500';
      case 'neutral': return 'bg-gray-500';
      case 'greed': return 'bg-green-500';
      case 'extreme_greed': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const exposureRisk = getRiskLevel(riskMetrics.totalExposure / totalPortfolioValue, { low: 2, medium: 5, high: 10 });
  const varRisk = getRiskLevel(riskMetrics.portfolioVar, { low: 0.05, medium: 0.1, high: 0.2 });
  const correlationRisk = getRiskLevel(riskMetrics.correlationRisk, { low: 0.3, medium: 0.6, high: 0.8 });
  const liquidationRisk = getRiskLevel(riskMetrics.liquidationRisk, { low: 0.1, medium: 0.3, high: 0.5 });

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${exposureRisk.color} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{exposureRisk.level[0]}</span>
              </div>
              <p className="text-sm font-medium">Exposure Risk</p>
              <p className="text-xs text-gray-600">${riskMetrics.totalExposure.toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${varRisk.color} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{varRisk.level[0]}</span>
              </div>
              <p className="text-sm font-medium">Portfolio VaR</p>
              <p className="text-xs text-gray-600">{(riskMetrics.portfolioVar * 100).toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${correlationRisk.color} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{correlationRisk.level[0]}</span>
              </div>
              <p className="text-sm font-medium">Correlation Risk</p>
              <p className="text-xs text-gray-600">{(riskMetrics.correlationRisk * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full ${liquidationRisk.color} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{liquidationRisk.level[0]}</span>
              </div>
              <p className="text-sm font-medium">Liquidation Risk</p>
              <p className="text-xs text-gray-600">{(riskMetrics.liquidationRisk * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Maximum Drawdown</span>
                  <span className="text-sm text-red-600">{(riskMetrics.maxDrawdown * 100).toFixed(1)}%</span>
                </div>
                <Progress value={riskMetrics.maxDrawdown * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Concentration Risk</span>
                  <span className={`text-sm ${riskMetrics.concentrationRisk > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {(riskMetrics.concentrationRisk * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={riskMetrics.concentrationRisk * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Funding Risk</span>
                  <span className={`text-sm ${riskMetrics.fundingRisk > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                    {(riskMetrics.fundingRisk * 100).toFixed(2)}%
                  </span>
                </div>
                <Progress value={riskMetrics.fundingRisk * 100} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Portfolio Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sharpe Ratio:</span>
                    <span className={riskMetrics.sharpeRatio > 1 ? 'text-green-600' : 'text-orange-600'}>
                      {riskMetrics.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Exposure:</span>
                    <span>${riskMetrics.totalExposure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portfolio Value:</span>
                    <span>${totalPortfolioValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leverage Ratio:</span>
                    <span className={`${riskMetrics.totalExposure / totalPortfolioValue > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {(riskMetrics.totalExposure / totalPortfolioValue).toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Market Sentiment & Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${getSentimentColor(marketMetrics.marketSentiment)} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-xs">
                  {marketMetrics.fearGreedIndex}
                </span>
              </div>
              <p className="text-sm font-medium">Fear & Greed</p>
              <p className="text-xs text-gray-600 capitalize">
                {marketMetrics.marketSentiment.replace('_', ' ')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {marketMetrics.volatilityIndex.toFixed(0)}
                </span>
              </div>
              <p className="text-sm font-medium">Volatility Index</p>
              <p className="text-xs text-gray-600">
                {marketMetrics.volatilityIndex > 30 ? 'High' : marketMetrics.volatilityIndex > 20 ? 'Medium' : 'Low'}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${marketMetrics.longShortRatio > 1.5 ? 'bg-green-500' : marketMetrics.longShortRatio < 0.8 ? 'bg-red-500' : 'bg-gray-500'} mx-auto mb-2 flex items-center justify-center`}>
                {marketMetrics.longShortRatio > 1 ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
              <p className="text-sm font-medium">Long/Short Ratio</p>
              <p className="text-xs text-gray-600">{marketMetrics.longShortRatio.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Funding Rates */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Current Funding Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {marketMetrics.fundingRates.map((funding, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{funding.symbol}</p>
                    <p className={`text-xs ${funding.rate >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {(funding.rate * 100).toFixed(4)}%
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      funding.prediction === 'bullish' ? 'border-green-500 text-green-600' :
                      funding.prediction === 'bearish' ? 'border-red-500 text-red-600' :
                      'border-gray-500 text-gray-600'
                    }`}
                  >
                    {funding.prediction}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exposureRisk.level === 'CRITICAL' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-600 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  High Exposure Risk
                </div>
                <p className="text-sm text-red-700">
                  Your total exposure is {(riskMetrics.totalExposure / totalPortfolioValue).toFixed(1)}x your portfolio value. 
                  Consider reducing position sizes or closing some positions.
                </p>
              </div>
            )}
            
            {riskMetrics.liquidationRisk > 0.3 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-600 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Liquidation Risk Warning
                </div>
                <p className="text-sm text-orange-700">
                  Some positions are at risk of liquidation. Consider adding margin or reducing leverage.
                </p>
              </div>
            )}
            
            {marketMetrics.volatilityIndex > 40 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-600 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  High Market Volatility
                </div>
                <p className="text-sm text-yellow-700">
                  Market volatility is currently high ({marketMetrics.volatilityIndex.toFixed(0)}). 
                  Consider using tighter stop-losses and smaller position sizes.
                </p>
              </div>
            )}
            
            {riskMetrics.concentrationRisk > 0.6 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-600 font-medium mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  Portfolio Concentration
                </div>
                <p className="text-sm text-blue-700">
                  Your portfolio is heavily concentrated in few positions. Consider diversifying across different assets.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
