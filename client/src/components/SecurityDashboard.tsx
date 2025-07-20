import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Target,
  Eye,
  Lock,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Layers,
  RefreshCw,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/useWeb3";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SecurityStatus {
  overall: "secure" | "warning" | "critical";
  score: number;
  lastUpdated: number;
  systems: {
    reentrancy: boolean;
    mev_protection: boolean;
    circuit_breaker: boolean;
    slippage_protection: boolean;
    flash_loan_protection: boolean;
    governance_security: boolean;
    oracle_security: boolean;
    pause_mechanism: boolean;
  };
}

interface SecurityAlert {
  id: string;
  type: "security" | "warning" | "info";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: number;
  source: string;
  resolved: boolean;
  action_required: boolean;
}

interface SecurityMetric {
  name: string;
  value: number;
  threshold: number;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  description: string;
}

interface ThreatIntelligence {
  total_threats_detected: number;
  blocked_attacks: number;
  success_rate: number;
  top_threats: Array<{
    type: string;
    count: number;
    last_seen: number;
  }>;
}

export function SecurityDashboard() {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [threatDetailOpen, setThreatDetailOpen] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  // Fetch security status
  const { data: securityStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/security/status"],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Fetch security alerts
  const { data: securityAlerts } = useQuery({
    queryKey: ["/api/security/alerts", selectedTimeframe],
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Fetch security metrics
  const { data: securityMetrics } = useQuery({
    queryKey: ["/api/security/metrics", selectedTimeframe],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch threat intelligence
  const { data: threatIntel } = useQuery({
    queryKey: ["/api/security/threats", selectedTimeframe],
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ["/api/security/audit", selectedTimeframe],
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "secure": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "secure": return "bg-green-100 text-green-800 border-green-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low": return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "high": return <XCircle className="w-4 h-4 text-orange-500" />;
      case "critical": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast({
          title: "Alert Resolved",
          description: "Security alert has been marked as resolved",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyPause = async () => {
    try {
      const response = await fetch("/api/security/emergency-pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: wallet.address }),
      });

      if (response.ok) {
        toast({
          title: "Emergency Pause Activated",
          description: "All trading operations have been paused",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate emergency pause",
        variant: "destructive",
      });
    }
  };

  if (statusLoading) {
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
          <h1 className="text-4xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-300">Real-time security monitoring and threat detection</p>
        </div>

        {/* Security Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${securityStatus?.overall === 'secure' ? 'bg-green-500/20' : securityStatus?.overall === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                  <Shield className={`w-6 h-6 ${getStatusColor(securityStatus?.overall || 'secure')}`} />
                </div>
                <div>
                  <div className="text-white font-medium">Security Status</div>
                  <Badge className={getStatusBadge(securityStatus?.overall || 'secure')}>
                    {securityStatus?.overall?.toUpperCase() || 'SECURE'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Security Score</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {securityStatus?.score || 0}/100
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Threats Blocked</div>
                  <div className="text-2xl font-bold text-green-400">
                    {threatIntel?.blocked_attacks || 0}
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
                  <div className="text-white font-medium">System Health</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {threatIntel?.success_rate || 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Systems Status */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Security Systems Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {securityStatus?.systems && Object.entries(securityStatus.systems).map(([system, active]) => (
                <div key={system} className="flex items-center gap-2">
                  {active ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white text-sm capitalize">
                    {system.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Alerts */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Security Alerts
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAlertsOpen(true)}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityAlerts?.slice(0, 5).map((alert: SecurityAlert) => (
                <div key={alert.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="text-white font-medium">{alert.title}</div>
                      <div className="text-gray-300 text-sm">{alert.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {alert.source}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {alert.action_required && !alert.resolved && (
                      <Button 
                        size="sm" 
                        onClick={() => handleResolveAlert(alert.id)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Threat Intelligence */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Threat Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {threatIntel?.top_threats?.map((threat, index) => (
                  <div 
                    key={threat.type} 
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5"
                    onClick={() => {
                      setSelectedThreat(threat);
                      setThreatDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-red-400 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{threat.type}</div>
                        <div className="text-gray-400 text-sm">
                          {threat.count} attempts detected
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(threat.last_seen).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Metrics Chart */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Security Metrics Trend
            </CardTitle>
            <div className="flex gap-2">
              {["1h", "24h", "7d", "30d"].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={selectedTimeframe === timeframe 
                    ? "bg-purple-500 hover:bg-purple-600" 
                    : "bg-transparent border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={securityMetrics}>
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
                  <Line 
                    type="monotone" 
                    dataKey="threats_blocked" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Threats Blocked"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="security_score" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Security Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="suspicious_activity" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Suspicious Activity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Controls */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Emergency Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                Emergency controls should only be used in critical security situations. 
                These actions will affect all users on the platform.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button 
                variant="destructive" 
                onClick={handleEmergencyPause}
                className="bg-red-600 hover:bg-red-700"
                disabled={!wallet.isConnected}
              >
                <Lock className="w-4 h-4 mr-2" />
                Emergency Pause
              </Button>
              
              <Button 
                variant="outline"
                className="bg-transparent border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                disabled={!wallet.isConnected}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Circuit Breakers
              </Button>
              
              <Button 
                variant="outline"
                className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/10"
                disabled={!wallet.isConnected}
              >
                <Settings className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts Dialog */}
      <Dialog open={alertsOpen} onOpenChange={setAlertsOpen}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">All Security Alerts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {securityAlerts?.map((alert: SecurityAlert) => (
              <div key={alert.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-medium">{alert.title}</div>
                      <Badge className={`text-xs ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </Badge>
                      {alert.resolved && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">{alert.description}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-gray-400 text-xs">
                        Source: {alert.source}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {alert.action_required && !alert.resolved && (
                    <Button 
                      size="sm" 
                      onClick={() => handleResolveAlert(alert.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Threat Detail Dialog */}
      <Dialog open={threatDetailOpen} onOpenChange={setThreatDetailOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Threat Analysis: {selectedThreat?.type}</DialogTitle>
          </DialogHeader>
          {selectedThreat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Total Attempts</div>
                  <div className="text-white text-xl font-bold">{selectedThreat.count}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Last Seen</div>
                  <div className="text-white text-xl font-bold">
                    {new Date(selectedThreat.last_seen).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-gray-400 text-sm">Threat Description</div>
                <div className="text-white">
                  {selectedThreat.type === "MEV_ATTACK" && "Maximal Extractable Value attacks detected. Front-running and sandwich attacks blocked."}
                  {selectedThreat.type === "FLASH_LOAN_EXPLOIT" && "Flash loan exploitation attempts detected. All attempts blocked by security mechanisms."}
                  {selectedThreat.type === "REENTRANCY_ATTEMPT" && "Reentrancy attack attempts detected. Protected by ReentrancyGuard."}
                  {selectedThreat.type === "PRICE_MANIPULATION" && "Price manipulation attempts detected. Circuit breakers activated."}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}