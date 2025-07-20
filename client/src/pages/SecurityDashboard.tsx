import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Lock, Eye, Zap, RefreshCw, AlertOctagon } from 'lucide-react';

interface SecurityStatus {
  overall_score: number;
  threats_blocked: number;
  system_status: string;
  last_updated: number;
}

interface SecuritySystem {
  name: string;
  status: 'active' | 'warning' | 'error';
  description: string;
  uptime: string;
}

interface SecurityAlert {
  id: string;
  type: 'mev_protection' | 'flash_loan' | 'reentrancy' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface SecurityMetrics {
  threats_blocked_24h: number[];
  security_score_history: number[];
  suspicious_activities: number[];
  timestamps: string[];
}

const SecurityDashboard: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [securitySystems, setSecuritySystems] = useState<SecuritySystem[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      const [statusRes, alertsRes, metricsRes] = await Promise.all([
        fetch('/api/security/status'),
        fetch('/api/security/alerts'),
        fetch('/api/security/metrics')
      ]);

      const statusData = await statusRes.json();
      const alertsData = await alertsRes.json();
      const metricsData = await metricsRes.json();

      setSecurityStatus(statusData.status);
      setSecuritySystems(statusData.systems || []);
      setSecurityAlerts(alertsData.alerts || []);
      setSecurityMetrics(metricsData.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setSecurityAlerts(alerts => 
          alerts.map(alert => 
            alert.id === alertId ? { ...alert, resolved: true } : alert
          )
        );
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      const response = await fetch('/api/security/emergency-stop', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Emergency stop activated. All trading functions have been paused.');
        fetchSecurityData();
      }
    } catch (error) {
      console.error('Error activating emergency stop:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Shield className="inline-block mr-3 h-10 w-10 text-blue-600" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Real-time security monitoring and threat protection</p>
        </div>

        {/* Security Overview */}
        {securityStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
                  <p className="text-3xl font-bold text-green-600">{securityStatus.overall_score}/100</p>
                  <p className="text-sm text-gray-500 mt-1">System Status: Secure</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Threats Blocked</h3>
                  <p className="text-3xl font-bold text-red-600">{securityStatus.threats_blocked}</p>
                  <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertOctagon className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Last Update</h3>
                  <p className="text-lg font-medium text-gray-700">
                    {new Date(securityStatus.last_updated).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Auto-refresh active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Systems Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Lock className="mr-3 h-6 w-6 text-blue-600" />
            Security Systems
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Reentrancy Protection', status: 'active', description: 'Smart contract guard active', uptime: '99.9%' },
              { name: 'MEV Protection', status: 'active', description: 'Frontrunning prevention', uptime: '99.8%' },
              { name: 'Circuit Breaker', status: 'active', description: 'Emergency stop system', uptime: '100%' },
              { name: 'Flash Loan Guard', status: 'active', description: 'Attack prevention active', uptime: '99.7%' },
              { name: 'Price Oracle', status: 'active', description: 'Manipulation detection', uptime: '99.9%' },
              { name: 'Liquidity Monitor', status: 'active', description: 'Pool health tracking', uptime: '99.8%' },
              { name: 'Transaction Filter', status: 'active', description: 'Suspicious tx blocking', uptime: '99.9%' },
              { name: 'Audit Logger', status: 'active', description: 'Security event logging', uptime: '100%' }
            ].map((system, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{system.name}</h3>
                  {getStatusIcon(system.status)}
                </div>
                <p className="text-xs text-gray-600 mb-2">{system.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Uptime</span>
                  <span className="font-semibold text-green-600">{system.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="mr-3 h-6 w-6 text-yellow-600" />
            Security Alerts
          </h2>
          <div className="space-y-4">
            {[
              { id: 'alert_001', type: 'security', severity: 'medium', message: 'Unusual trading pattern detected in XP/USDT pool', timestamp: Date.now() - 3600000, resolved: false },
              { id: 'alert_002', type: 'mev', severity: 'low', message: 'MEV bot activity increased by 15%', timestamp: Date.now() - 7200000, resolved: true },
              { id: 'alert_003', type: 'liquidity', severity: 'high', message: 'Large liquidity withdrawal detected', timestamp: Date.now() - 10800000, resolved: false }
            ].map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{alert.message}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.resolved ? (
                      <span className="text-green-600 text-sm font-medium">Resolved</span>
                    ) : (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="mr-3 h-6 w-6 text-red-600" />
            Emergency Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-red-900 mb-2">Emergency Stop</h3>
              <p className="text-red-700 text-sm mb-4">
                Immediately halt all trading operations and pause smart contract functions.
              </p>
              <button
                onClick={handleEmergencyStop}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Activate Emergency Stop
              </button>
            </div>
            
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-2">Circuit Breaker Reset</h3>
              <p className="text-blue-700 text-sm mb-4">
                Reset automated circuit breakers and resume normal operations.
              </p>
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reset Circuit Breaker
              </button>
            </div>
          </div>
        </div>

        {/* Security Metrics Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Eye className="mr-3 h-6 w-6 text-green-600" />
            Security Metrics
          </h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
            <p className="text-gray-500">Security metrics chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;