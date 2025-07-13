import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Volume2, 
  DollarSign,
  BarChart3,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  Info
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createChart, ColorType } from 'lightweight-charts';
import { getTokenIcon } from "@/lib/tokenUtils";

interface TradingPair {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  liquidity: number;
  lastUpdated: number;
}

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface OrderBook {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
}

export default function TradingPage() {
  const { wallet, connectWallet } = useWeb3();
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<any>(null);
  const [volumeSeries, setVolumeSeries] = useState<any>(null);
  
  const [selectedPair, setSelectedPair] = useState("XP-USDT");
  const [timeFrame, setTimeFrame] = useState("1h");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  // Fetch trading pairs
  const { data: tradingPairs, isLoading: pairsLoading } = useQuery({
    queryKey: ["/api/trading/pairs"],
    refetchInterval: 5000
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/trading/chart", selectedPair, timeFrame],
    refetchInterval: 2000
  });

  // Fetch order book
  const { data: orderBook, isLoading: orderBookLoading } = useQuery({
    queryKey: ["/api/trading/orderbook", selectedPair],
    refetchInterval: 1000
  });

  // Fetch recent trades
  const { data: recentTrades, isLoading: tradesLoading } = useQuery({
    queryKey: ["/api/trading/trades", selectedPair],
    refetchInterval: 2000
  });

  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current && !chart) {
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#374151',
        },
        timeScale: {
          borderColor: '#374151',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = newChart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      });

      const volumeSeries = newChart.addHistogramSeries({
        color: '#6b7280',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      setChart(newChart);
      setCandlestickSeries(candlestickSeries);
      setVolumeSeries(volumeSeries);

      // Handle resize
      const handleResize = () => {
        newChart.applyOptions({
          width: chartContainerRef.current?.clientWidth || 800,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [chart]);

  // Update chart data
  useEffect(() => {
    if (candlestickSeries && volumeSeries && chartData) {
      const candleData = chartData.map((d: ChartData) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      const volumeData = chartData.map((d: ChartData) => ({
        time: d.time,
        value: d.volume,
        color: d.close > d.open ? '#10b981' : '#ef4444',
      }));

      candlestickSeries.setData(candleData);
      volumeSeries.setData(volumeData);
    }
  }, [chartData, candlestickSeries, volumeSeries]);

  const selectedPairData = tradingPairs?.find((p: TradingPair) => p.id === selectedPair);

  const handleTrade = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "지갑 연결 필요",
        description: "거래를 하려면 지갑을 연결해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || (orderType === "limit" && !price)) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/trading/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pair: selectedPair,
          side,
          type: orderType,
          amount: parseFloat(amount),
          price: orderType === "limit" ? parseFloat(price) : undefined,
          slippage: parseFloat(slippage),
          userAddress: wallet.address,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "거래 성공",
          description: `${side === "buy" ? "매수" : "매도"} 주문이 성공적으로 처리되었습니다.`,
        });
        setAmount("");
        setPrice("");
      } else {
        toast({
          title: "거래 실패",
          description: result.message || "거래 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "거래 실패",
        description: "거래 중 오류가 발생했습니다.",
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
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">지갑 연결 필요</h2>
                <p className="text-gray-300">고급 거래 기능을 사용하려면 지갑을 연결해주세요</p>
              </div>
              <Button onClick={connectWallet} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                지갑 연결
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Advanced Trading</h1>
            <p className="text-gray-300">Professional-grade trading with advanced charts and order types</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-48 bg-black/20 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tradingPairs?.map((pair: TradingPair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    <div className="flex items-center gap-2">
                      <img src={getTokenIcon(pair.symbol.split('-')[0])} alt="" className="w-4 h-4" />
                      {pair.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-3">
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <img src={getTokenIcon(selectedPair.split('-')[0])} alt="" className="w-6 h-6" />
                      <h3 className="text-lg font-semibold text-white">{selectedPair}</h3>
                    </div>
                    {selectedPairData && (
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-white">
                          ${selectedPairData.price.toFixed(6)}
                        </span>
                        <Badge variant={selectedPairData.change24h >= 0 ? "default" : "destructive"}>
                          {selectedPairData.change24h >= 0 ? "+" : ""}{selectedPairData.change24h.toFixed(2)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={timeFrame} onValueChange={setTimeFrame}>
                      <SelectTrigger className="w-20 bg-black/20 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1m</SelectItem>
                        <SelectItem value="5m">5m</SelectItem>
                        <SelectItem value="15m">15m</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="4h">4h</SelectItem>
                        <SelectItem value="1d">1d</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={chartContainerRef} className="w-full h-96" />
              </CardContent>
            </Card>

            {/* Market Stats */}
            {selectedPairData && (
              <Card className="bg-black/20 backdrop-blur-lg border-white/10 mt-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">24h High</p>
                      <p className="text-lg font-semibold text-green-400">${selectedPairData.high24h.toFixed(6)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">24h Low</p>
                      <p className="text-lg font-semibold text-red-400">${selectedPairData.low24h.toFixed(6)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">24h Volume</p>
                      <p className="text-lg font-semibold text-white">${selectedPairData.volume24h.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Liquidity</p>
                      <p className="text-lg font-semibold text-blue-400">${selectedPairData.liquidity.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trading Panel */}
          <div className="space-y-4">
            {/* Order Form */}
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={side} onValueChange={setSide}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="text-green-400">Buy</TabsTrigger>
                    <TabsTrigger value="sell" className="text-red-400">Sell</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label className="text-white">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType === "limit" && (
                  <div className="space-y-2">
                    <Label className="text-white">Price</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-black/20 border-white/10 text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-white">Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Slippage (%)</Label>
                  <Select value={slippage} onValueChange={setSlippage}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">0.1%</SelectItem>
                      <SelectItem value="0.5">0.5%</SelectItem>
                      <SelectItem value="1.0">1.0%</SelectItem>
                      <SelectItem value="3.0">3.0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleTrade}
                  className={`w-full ${
                    side === "buy" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {side === "buy" ? "Buy" : "Sell"} {selectedPair.split('-')[0]}
                </Button>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Asks */}
                  <div className="space-y-1">
                    <p className="text-xs text-red-400 mb-2">Asks</p>
                    {orderBook?.asks?.slice(0, 5).map((ask: OrderBookEntry, index: number) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-red-400">{ask.price.toFixed(6)}</span>
                        <span className="text-gray-400">{ask.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Spread */}
                  <div className="py-2 text-center border-t border-b border-gray-700">
                    <span className="text-xs text-gray-400">Spread</span>
                  </div>
                  
                  {/* Bids */}
                  <div className="space-y-1">
                    <p className="text-xs text-green-400 mb-2">Bids</p>
                    {orderBook?.bids?.slice(0, 5).map((bid: OrderBookEntry, index: number) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-green-400">{bid.price.toFixed(6)}</span>
                        <span className="text-gray-400">{bid.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentTrades?.slice(0, 10).map((trade: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className={trade.side === "buy" ? "text-green-400" : "text-red-400"}>
                        {trade.price.toFixed(6)}
                      </span>
                      <span className="text-gray-400">{trade.amount.toFixed(2)}</span>
                      <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}