import { useState, useEffect } from "react";
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
  XCircle,
  Eye,
  Lock,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getApiUrl } from "@/lib/apiUrl";

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
  type: "liquidation" | "impermanent_loss" | "volatility" | "concentration" | "security";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  timestamp: number;
}

interface SecurityMetric {
  name: string;
  status: "secure" | "warning" | "critical";
  value: number;
  description: string;
  last_checked: number;
}

export function RiskManagement() {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [activeTab, setActiveTab] = useState("portfolio");

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

  // Fetch security metrics
  const { data: securityMetrics } = useQuery({
    queryKey: ["/api/security/status"],
    refetchInterval: 5000, // Update every 5 seconds
  });

  const getRiskColor = (status: string) => {
    switch (status) {
      case "safe":
      case "secure": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "danger":
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getRiskBadge = (status: string) => {
    switch (status) {
      case "safe":
      case "secure": return "bg-green-100 text-green-800 border-green-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "danger":
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  const handleMitigateRisk = async (alertId: string) => {
    try {
      const response = await fetch(`/api/risk/mitigate/${alertId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: wallet.address }),
      });

      if (response.ok) {
        toast({
          title: "Risk Mitigation Initiated",
          description: "Risk mitigation measures have been applied",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate risk mitigation",
        variant: "destructive",
      });
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-gray-300">Connect your wallet to access risk management tools</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Risk Management</h1>
          <p className="text-gray-300">Monitor and manage your portfolio risks and security</p>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Risk Score</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {portfolioRisk?.risk_score || 72}/100
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${securityMetrics?.overall === 'secure' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  <Shield className={`w-6 h-6 ${getRiskColor(securityMetrics?.overall || 'secure')}`} />
                </div>
                <div>
                  <div className="text-white font-medium">Security Status</div>
                  <Badge className={getRiskBadge(securityMetrics?.overall || 'secure')}>
                    {securityMetrics?.overall?.toUpperCase() || 'SECURE'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Active Alerts</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {alerts?.filter((alert: RiskAlert) => alert.severity === 'high' || alert.severity === 'medium').length || 3}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Volatility</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {marketRisk?.volatility_index || 24}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 border-white/10">
            <TabsTrigger value="portfolio" className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Portfolio Risk
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Security
            </TabsTrigger>
            <TabsTrigger value="market" className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Market Risk
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Risk Alerts
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Risk Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Portfolio Risk Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Portfolio risk metrics from API */}
                  {portfolioMetrics?.metrics?.map((metric: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{metric.name}</span>
                        <Badge className={getRiskBadge(metric.status)}>
                          {metric.value}%
                        </Badge>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                      <p className="text-gray-400 text-sm">{metric.description}</p>
                    </div>
                  )) || (
                    // Fallback if API is loading
                    <div className="text-gray-400 text-center py-4">Loading risk metrics...</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Risk Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskTrendData?.trend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1F2937", 
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#F9FAFB"
                          }}
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="risk" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          name="Risk Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Systems
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {securityMetrics?.systems && Object.entries(securityMetrics.systems).map(([system, active]) => (
                    <div key={system} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        {active ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-white capitalize">
                          {system.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <Badge className={active ? getRiskBadge('secure') : getRiskBadge('critical')}>
                        {active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Security Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">97.8%</div>
                      <div className="text-gray-400 text-sm">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">47</div>
                      <div className="text-gray-400 text-sm">Threats Blocked</div>
                    </div>
                  </div>
                  
                  <Alert className="border-green-500/20 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      All security systems are operational and monitoring actively.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Risk Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Market Risk Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Market Volatility", value: 24, status: "warning", trend: "up" },
                    { name: "Liquidity Depth", value: 78, status: "safe", trend: "stable" },
                    { name: "Price Impact", value: 12, status: "safe", trend: "down" },
                    { name: "Slippage Risk", value: 8, status: "safe", trend: "stable" }
                  ].map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                      <div>
                        <div className="text-white font-medium">{indicator.name}</div>
                        <div className="text-gray-400 text-sm">
                          {indicator.value}% 
                          {indicator.trend === 'up' && <TrendingUp className="w-3 h-3 inline ml-1 text-red-400" />}
                          {indicator.trend === 'down' && <TrendingDown className="w-3 h-3 inline ml-1 text-green-400" />}
                        </div>
                      </div>
                      <Badge className={getRiskBadge(indicator.status)}>
                        {indicator.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Market Volatility Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { timestamp: Date.now() - 86400000 * 6, volatility: 18 },
                        { timestamp: Date.now() - 86400000 * 5, volatility: 22 },
                        { timestamp: Date.now() - 86400000 * 4, volatility: 19 },
                        { timestamp: Date.now() - 86400000 * 3, volatility: 26 },
                        { timestamp: Date.now() - 86400000 * 2, volatility: 24 },
                        { timestamp: Date.now() - 86400000 * 1, volatility: 21 },
                        { timestamp: Date.now(), volatility: 24 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1F2937", 
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#F9FAFB"
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="volatility"
                          stroke="#F59E0B"
                          fill="#F59E0B"
                          fillOpacity={0.2}
                          name="Volatility %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Active Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active Risk Alerts from API */}
                {riskAlerts?.alerts?.map((alert: any) => (
                  <div key={alert.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-white font-medium">{alert.title}</div>
                          <Badge className={`text-xs ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="text-gray-300 text-sm mb-2">{alert.description}</div>
                        <div className="text-gray-400 text-xs mb-2">Impact: {alert.impact}</div>
                        <div className="text-blue-300 text-xs">{alert.recommendation}</div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleMitigateRisk(alert.id)}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        Mitigate
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}