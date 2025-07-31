import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  AlertCircle,
  XCircle,
  Clock
} from "lucide-react";
import { SecurityAlert } from "./SecurityTypes";
import { useToast } from "@/hooks/use-toast";

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onResolveAlert: (alertId: string) => Promise<void>;
}

export function SecurityAlerts({ alerts, onResolveAlert }: SecurityAlertsProps) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const { toast } = useToast();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low": 
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "medium": 
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "high": 
        return <XCircle className="w-4 h-4 text-orange-500" />;
      case "critical": 
        return <XCircle className="w-4 h-4 text-red-500" />;
      default: 
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": 
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "medium": 
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": 
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical": 
        return "bg-red-100 text-red-800 border-red-200";
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await onResolveAlert(alertId);
      toast({
        title: "Alert Resolved",
        description: "Security alert has been successfully resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
          {Array.isArray(alerts) ? alerts.slice(0, 5).map((alert: SecurityAlert) => (
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
                    <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
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
          )) : null}
        </CardContent>
      </Card>

      {/* Security Alerts Modal */}
      <Dialog open={alertsOpen} onOpenChange={setAlertsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              All Security Alerts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {alerts?.map((alert: SecurityAlert) => (
              <div key={alert.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-white font-medium">{alert.title}</div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.resolved && (
                        <Badge className="bg-green-100 text-green-800">RESOLVED</Badge>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm mb-3">{alert.description}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {alert.source}
                      </Badge>
                      <span className="text-gray-400 text-xs">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {alert.affected_components && alert.affected_components.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Affected Components:</div>
                        <div className="flex flex-wrap gap-1">
                          {alert.affected_components.map((component, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {alert.resolution_steps && alert.resolution_steps.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Resolution Steps:</div>
                        <ul className="list-disc list-inside text-sm text-gray-300">
                          {alert.resolution_steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
    </>
  );
}