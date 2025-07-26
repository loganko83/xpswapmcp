import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Target,
  Activity, 
  CheckCircle,
  AlertCircle,
  XCircle 
} from "lucide-react";
import { SecurityStatus } from "./SecurityTypes";

interface SecurityOverviewProps {
  securityStatus: SecurityStatus | null;
  threatsBlocked: number;
  systemsOnline: number;
}

export function SecurityOverview({ 
  securityStatus, 
  threatsBlocked, 
  systemsOnline 
}: SecurityOverviewProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Security Status */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              securityStatus?.overall === 'secure' ? 'bg-green-500/20' : 
              securityStatus?.overall === 'warning' ? 'bg-yellow-500/20' : 
              'bg-red-500/20'
            }`}>
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

      {/* Security Score */}
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
          <Progress 
            value={securityStatus?.score || 0} 
            className="mt-3 h-2" 
          />
        </CardContent>
      </Card>

      {/* Threats Blocked */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-white font-medium">Threats Blocked</div>
              <div className="text-2xl font-bold text-green-400">
                {threatsBlocked.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Systems Online */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-medium">Systems Online</div>
              <div className="text-2xl font-bold text-purple-400">
                {systemsOnline}/8
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
