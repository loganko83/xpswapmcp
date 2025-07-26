import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Activity, BarChart3, Maximize2 } from "lucide-react";

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
  timestamp: number;
}

interface FuturesChartProps {
  selectedContract: string;
  contracts: Array<{
    symbol: string;
    markPrice: number;
    indexPrice: number;
    fundingRate: number;
    priceChangePercent24h: number;
  }>;
  onContractChange: (contract: string) => void;
}

export function FuturesChart({ 
  selectedContract, 
  contracts, 
  onContractChange 
}: FuturesChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>("1h");
  const [chartType, setChartType] = useState<"line" | "area">("area");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedContractData = contracts?.find(c => c.symbol === selectedContract);

  // Generate mock chart data
  useEffect(() => {
    if (!selectedContractData) return;

    const basePrice = selectedContractData.markPrice;
    const dataPoints: ChartDataPoint[] = [];
    const now = Date.now();
    const intervals = getIntervalsForTimeframe(timeframe);
    
    for (let i = intervals.count; i >= 0; i--) {
      const timestamp = now - (i * intervals.interval);
      const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const price = basePrice * (1 + priceVariation * (i / intervals.count));
      const volume = Math.random() * 100000 + 50000;

      dataPoints.push({
        time: formatTime(timestamp, timeframe),
        price: parseFloat(price.toFixed(6)),
        volume: Math.round(volume),
        timestamp
      });
    }

    setChartData(dataPoints);
  }, [selectedContract, timeframe, selectedContractData]);

  const getIntervalsForTimeframe = (tf: string) => {
    switch (tf) {
      case "5m": return { count: 96, interval: 5 * 60 * 1000 }; // 8 hours
      case "15m": return { count: 96, interval: 15 * 60 * 1000 }; // 24 hours
      case "1h": return { count: 168, interval: 60 * 60 * 1000 }; // 7 days
      case "4h": return { count: 168, interval: 4 * 60 * 60 * 1000 }; // 28 days
      case "1d": return { count: 90, interval: 24 * 60 * 60 * 1000 }; // 90 days
      default: return { count: 168, interval: 60 * 60 * 1000 };
    }
  };

  const formatTime = (timestamp: number, tf: string) => {
    const date = new Date(timestamp);
    switch (tf) {
      case "5m":
      case "15m":
      case "1h":
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      case "4h":
      case "1d":
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      default:
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
  };

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const previousPrice = chartData[chartData.length - 2]?.price || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Price: ${payload[0].value.toFixed(6)}
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-600">
              Volume: {payload[1].value.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'w-full'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Contract Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedContract} onValueChange={onContractChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contracts?.map(contract => (
                  <SelectItem key={contract.symbol} value={contract.symbol}>
                    {contract.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ${currentPrice.toFixed(6)}
              </span>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <Badge variant={isPositive ? "default" : "destructive"}>
                  {isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="rounded-r-none"
              >
                Line
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
                className="rounded-l-none"
              >
                Area
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-80'}`}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 0.001', 'dataMax + 0.001']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(6)}`}
                />
                <Tooltip content={customTooltip} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 0.001', 'dataMax + 0.001']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(6)}`}
                />
                <Tooltip content={customTooltip} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-600">24h High</div>
            <div className="font-semibold text-green-600">
              ${(currentPrice * 1.05).toFixed(6)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">24h Low</div>
            <div className="font-semibold text-red-600">
              ${(currentPrice * 0.95).toFixed(6)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">24h Volume</div>
            <div className="font-semibold">
              ${(selectedContractData?.markPrice || 0 * 50000).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Open Interest</div>
            <div className="font-semibold">
              ${(selectedContractData?.markPrice || 0 * 125000).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
