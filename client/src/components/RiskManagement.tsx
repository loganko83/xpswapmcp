import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Target,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/useWeb3";

interface RiskMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: "safe" | "warning" | "danger";
  description: string;
  recommendation: string;
}

interface RiskAlert {
  id: string;
  type: "liquidation" | "impermanent_loss" | "volatility" | "concentration";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  timestamp: number;
}

export function RiskManagement() {
  const { wallet } = useWeb3();
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  // Fetch risk analysis data
  const { data: riskData, isLoading } = useQuery({
    queryKey: ["/api/risk/analysis", wallet.address, selectedTimeframe],
    enabled: !!wallet.address,
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch risk alerts
  const { data: alerts } = useQuery({
    queryKey: ["/api/risk/alerts", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Fetch portfolio risk metrics
  const { data: portfolioRisk } = useQuery({
    queryKey: ["/api/risk/portfolio", wallet.address],
    enabled: !!wallet.address,
  });

  // Fetch market risk data
  const { data: marketRisk } = useQuery({
    queryKey: ["/api/risk/market"],
    refetchInterval: 10000, // Update every 10 seconds
  });

  const getRiskColor = (status: string) => {
    switch (status) {
      case "safe": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "danger": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getRiskBadge = (status: string) => {
    switch (status) {
      case "safe": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "danger": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "low": return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "medium": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "high": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const calculateOverallRisk = () => {
    if (!riskData?.metrics) return 0;
    const totalRisk = riskData.metrics.reduce((sum: number, metric: RiskMetric) => sum + metric.value, 0);
    return Math.min(100, totalRisk / riskData.metrics.length);
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Connect your wallet to access risk management tools</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                <p className="text-2xl font-bold">{Math.round(calculateOverallRisk())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Health</p>
                <p className="text-2xl font-bold">{portfolioRisk?.healthScore || "85"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{alerts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Limit Usage</p>
                <p className="text-2xl font-bold">{portfolioRisk?.limitUsage || "42"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Risk Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert: RiskAlert) => (
                <Alert key={alert.id} className="border-l-4 border-l-yellow-500">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge className={getRiskBadge(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <AlertDescription className="mt-1">
                        {alert.description}
                      </AlertDescription>
                      <div className="mt-2 text-sm">
                        <p className="text-muted-foreground">
                          <strong>Impact:</strong> {alert.impact}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Risk Metrics</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Risk</TabsTrigger>
          <TabsTrigger value="market">Market Risk</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading risk metrics...</div>
            ) : (
              (riskData?.metrics || [
                {
                  id: "liquidation",
                  name: "Liquidation Risk",
                  value: 15,
                  threshold: 80,
                  status: "safe",
                  description: "Risk of position liquidation based on collateral ratio",
                  recommendation: "Maintain healthy collateral ratios above 150%"
                },
                {
                  id: "impermanent_loss",
                  name: "Impermanent Loss",
                  value: 23,
                  threshold: 50,
                  status: "safe",
                  description: "Potential loss from providing liquidity vs holding tokens",
                  recommendation: "Monitor price divergence between paired tokens"
                },
                {
                  id: "volatility",
                  name: "Portfolio Volatility",
                  value: 65,
                  threshold: 70,
                  status: "warning",
                  description: "Price volatility of your portfolio over time",
                  recommendation: "Consider diversifying into more stable assets"
                },
                {
                  id: "concentration",
                  name: "Concentration Risk",
                  value: 45,
                  threshold: 60,
                  status: "safe",
                  description: "Risk from over-concentration in single assets",
                  recommendation: "Diversify holdings across multiple tokens"
                }
              ]).map((metric: RiskMetric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      <Badge className={getRiskBadge(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Risk Level</span>
                          <span className="font-medium">{metric.value}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Safe Zone</span>
                          <span>Threshold: {metric.threshold}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium">{metric.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(portfolioRisk?.assetAllocation || [
                    { asset: "XP", allocation: 45, risk: "medium" },
                    { asset: "USDT", allocation: 25, risk: "low" },
                    { asset: "ETH", allocation: 20, risk: "medium" },
                    { asset: "BTC", allocation: 10, risk: "medium" }
                  ]).map((asset: any) => (
                    <div key={asset.asset} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{asset.asset}</span>
                        <Badge variant="outline" className={getRiskBadge(asset.risk)}>
                          {asset.risk}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{asset.allocation}%</span>
                        <Progress value={asset.allocation} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(portfolioRisk?.riskFactors || [
                    { factor: "Smart Contract Risk", level: "Low", impact: "Minor" },
                    { factor: "Liquidity Risk", level: "Medium", impact: "Moderate" },
                    { factor: "Market Risk", level: "High", impact: "Major" },
                    { factor: "Counterparty Risk", level: "Low", impact: "Minor" }
                  ]).map((factor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{factor.factor}</div>
                        <div className="text-sm text-muted-foreground">Impact: {factor.impact}</div>
                      </div>
                      <Badge className={getRiskBadge(factor.level.toLowerCase())}>
                        {factor.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current VIX</span>
                    <span className="text-2xl font-bold">{marketRisk?.vix || "24.5"}</span>
                  </div>
                  <Progress value={marketRisk?.vix || 24.5} className="h-2" />
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Stable market conditions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fear & Greed Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Index</span>
                    <span className="text-2xl font-bold">{marketRisk?.fearGreed || "67"}</span>
                  </div>
                  <Progress value={marketRisk?.fearGreed || 67} className="h-2" />
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Greed territory - exercise caution</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Risk Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(marketRisk?.indicators || [
                  { name: "Correlation Risk", value: 0.85, description: "High correlation between assets" },
                  { name: "Liquidity Risk", value: 0.23, description: "Low liquidity in some markets" },
                  { name: "Systemic Risk", value: 0.34, description: "Overall system stability" }
                ]).map((indicator: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{indicator.name}</span>
                      <span className="text-sm">{Math.round(indicator.value * 100)}%</span>
                    </div>
                    <Progress value={indicator.value * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Risk Tolerance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="conservative" name="risk-tolerance" className="mr-2" />
                      <label htmlFor="conservative">Conservative (Low Risk)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="moderate" name="risk-tolerance" className="mr-2" defaultChecked />
                      <label htmlFor="moderate">Moderate (Medium Risk)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="aggressive" name="risk-tolerance" className="mr-2" />
                      <label htmlFor="aggressive">Aggressive (High Risk)</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Alert Thresholds</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Liquidation Risk</span>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Portfolio Volatility</span>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Concentration Risk</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}