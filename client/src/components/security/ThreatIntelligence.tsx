import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Eye, 
  AlertTriangle,
  Shield,
  Activity,
  Clock,
  Layers
} from "lucide-react";
import { ThreatData } from "./SecurityTypes";

interface ThreatIntelligenceProps {
  threatData: ThreatData[];
}

export function ThreatIntelligence({ threatData }: ThreatIntelligenceProps) {
  const [threatsOpen, setThreatsOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800 border-red-200";
      case "mitigated": return "bg-green-100 text-green-800 border-green-200";
      case "investigating": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low": return <Shield className="w-4 h-4 text-blue-500" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "high": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Threat Intelligence
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setThreatsOpen(true)}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            View Details
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {threatData?.slice(0, 3).map((threat: ThreatData) => (
            <div key={threat.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                {getSeverityIcon(threat.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-white font-medium">{threat.type}</div>
                    <Badge className={getSeverityColor(threat.severity)}>
                      {threat.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(threat.status)}>
                      {threat.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-gray-300 text-sm mb-2">{threat.description}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {threat.source}
                    </Badge>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Threat Intelligence Modal */}
      <Dialog open={threatsOpen} onOpenChange={setThreatsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Threat Intelligence Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {threatData?.map((threat: ThreatData) => (
              <div key={threat.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(threat.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-white font-medium text-lg">{threat.type}</div>
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-gray-300 mb-3">{threat.description}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">
                        {threat.source}
                      </Badge>
                      <span className="text-gray-400 text-sm">
                        {new Date(threat.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {threat.affected_contracts && threat.affected_contracts.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          Affected Contracts:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {threat.affected_contracts.map((contract, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {contract}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {threat.mitigation_actions && threat.mitigation_actions.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          Mitigation Actions:
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-300">
                          {threat.mitigation_actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
