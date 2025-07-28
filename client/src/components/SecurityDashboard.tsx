import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useToast } from "@/hooks/use-toast";

import { getApiUrl } from "@/lib/apiUrl";
// 모듈?�된 컴포?�트??import
import { SecurityOverview } from "./security/SecurityOverview";
import { SecurityAlerts } from "./security/SecurityAlerts";
import { SecurityMetrics } from "./security/SecurityMetrics";
import { ThreatIntelligence } from "./security/ThreatIntelligence";

// ?�??import
import { 
  SecurityStatus, 
  SecurityAlert, 
  SecurityMetric, 
  ThreatData, 
  TimeframeType 
} from "./security/SecurityTypes";

export function SecurityDashboard() {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>("24h");

  // Fetch security status
  const { data: securityStatus } = useQuery<SecurityStatus>({
    queryKey: ["/api/security/status"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/security/status"));
      if (!response.ok) throw new Error("Failed to fetch security status");
      return response.json();
    },
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Fetch security alerts
  const { data: securityAlerts } = useQuery<SecurityAlert[]>({
    queryKey: ["/api/security/alerts"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/security/alerts"));
      if (!response.ok) throw new Error("Failed to fetch security alerts");
      return response.json();
    },
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Fetch security metrics
  const { data: securityMetrics } = useQuery<SecurityMetric[]>({
    queryKey: ["/api/security/metrics", selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/security/metrics?timeframe=${selectedTimeframe}`));
      if (!response.ok) throw new Error("Failed to fetch security metrics");
      return response.json();
    },
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch threat intelligence
  const { data: threatIntel } = useQuery<ThreatData[]>({
    queryKey: ["/api/security/threats", selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/security/threats?timeframe=${selectedTimeframe}`));
      if (!response.ok) throw new Error("Failed to fetch threat intelligence");
      return response.json();
    },
    refetchInterval: 15000, // Update every 15 seconds
  });

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/security/alerts/${alertId}/resolve`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      // Trigger refetch of alerts
      window.location.reload();
    } catch (error) {
      console.error("Error resolving alert:", error);
      throw error;
    }
  };

  // Calculate derived values
  const threatsBlocked = securityMetrics?.reduce((sum, metric) => sum + metric.threats_blocked, 0) || 0;
  const systemsOnline = securityStatus?.systems ? 
    Object.values(securityStatus.systems).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-300">Real-time security monitoring and threat detection</p>
        </div>

        {/* Security Status Overview */}
        <SecurityOverview 
          securityStatus={securityStatus}
          threatsBlocked={threatsBlocked}
          systemsOnline={systemsOnline}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Alerts */}
          <SecurityAlerts 
            alerts={securityAlerts || []}
            onResolveAlert={handleResolveAlert}
          />

          {/* Threat Intelligence */}
          <ThreatIntelligence 
            threatData={threatIntel || []}
          />
        </div>

        {/* Security Metrics Chart */}
        <SecurityMetrics 
          metrics={securityMetrics || []}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />
      </div>
    </div>
  );
}

export default SecurityDashboard;
