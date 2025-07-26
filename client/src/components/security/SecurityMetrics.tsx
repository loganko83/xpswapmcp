import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SecurityMetric, TimeframeType } from "./SecurityTypes";

interface SecurityMetricsProps {
  metrics: SecurityMetric[];
  selectedTimeframe: TimeframeType;
  onTimeframeChange: (timeframe: TimeframeType) => void;
}

export function SecurityMetrics({ 
  metrics, 
  selectedTimeframe, 
  onTimeframeChange 
}: SecurityMetricsProps) {
  const timeframes: TimeframeType[] = ["1h", "24h", "7d", "30d"];

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Security Metrics
        </CardTitle>
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(timeframe)}
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
            <LineChart data={metrics}>
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
              <Line 
                type="monotone" 
                dataKey="failed_attempts" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Failed Attempts"
              />
              <Line 
                type="monotone" 
                dataKey="successful_defenses" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Successful Defenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
