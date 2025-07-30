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
  Info,
  Settings,
  Maximize,
  MoreHorizontal,
  Bookmark,
  Eye,
  EyeOff,
  Grid3X3,
  LineChart,
  CandlestickChart
} from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createChart, ColorType, LineStyle, PriceScaleMode } from 'lightweight-charts';
import { getTokenIcon } from "@/lib/tokenUtils";
import { getApiUrl } from "@/lib/apiUrl";

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

interface MarketTrade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export default function TradingPage() {
  const { wallet, connectWallet } = useWeb3Context();
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<any>(null);
  const [volumeSeries, setVolumeSeries] = useState<any>(null);
  
  const [selectedPair, setSelectedPair] = useState("XPS-XP");
  const [timeFrame, setTimeFrame] = useState("1h");
  const [chartType, setChartType] = useState("candlestick"); // candlestick, line, area
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [leverage, setLeverage] = useState("1");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  // Layout states
  const [isChartMaximized, setIsChartMaximized] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("orderbook");

  // Fetch trading pairs
  const { data: tradingPairs, isLoading: pairsLoading } = useQuery({
    queryKey: ["/api/trading/pairs"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/trading/pairs"));
      if (!response.ok) throw new Error("Failed to fetch trading pairs");
      return response.json();
    },
    refetchInterval: 5000
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/trading/chart", selectedPair, timeFrame],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/trading/chart?pair=${selectedPair}&timeframe=${timeFrame}`));
      if (!response.ok) throw new Error("Failed to fetch chart data");
      return response.json();
    },
    refetchInterval: 2000
  });

  // Fetch order book
  const { data: orderBook, isLoading: orderBookLoading } = useQuery({
    queryKey: ["/api/trading/orderbook", selectedPair],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/trading/orderbook?pair=${selectedPair}`));
      if (!response.ok) throw new Error("Failed to fetch order book");
      return response.json();
    },
    refetchInterval: 1000
  });

  // Fetch recent trades
  const { data: recentTrades, isLoading: tradesLoading } = useQuery({
    queryKey: ["/api/trading/trades", selectedPair],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/trading/trades?pair=${selectedPair}`));
      if (!response.ok) throw new Error("Failed to fetch recent trades");
      return response.json();
    },
    refetchInterval: 2000
  });

  // Initialize chart with Hyperliquid-style theme
  useEffect(() => {
    if (chartContainerRef.current && !chart) {
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: isChartMaximized ? 600 : 450,
        layout: {
          background: { type: ColorType.Solid, color: '#0a0a0a' },
          textColor: '#e4e4e7',
          fontSize: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        grid: {
          vertLines: { 
            color: '#262626',
            style: LineStyle.Dotted,
            visible: true,
          },
          horzLines: { 
            color: '#262626',
            style: LineStyle.Dotted,
            visible: true,
          },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#71717a',
            width: 1,
            style: LineStyle.Dashed,
          },
          horzLine: {
            color: '#71717a',
            width: 1,
            style: LineStyle.Dashed,
          },
        },
        rightPriceScale: {
          borderColor: '#262626',
          mode: PriceScaleMode.Normal,
          entireTextOnly: false,
          visible: true,
          borderVisible: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
        },
        timeScale: {
          borderColor: '#262626',
          timeVisible: true,
          secondsVisible: false,
          borderVisible: false,
          rightOffset: 5,
        },
        watermark: {
          visible: true,
          fontSize: 48,
          horzAlign: 'center',
          vertAlign: 'center',
          color: 'rgba(255, 255, 255, 0.03)',
          text: 'XPSwap',
        },
      });

      // Add candlestick series with Hyperliquid colors
      const candlestickSeries = newChart.addCandlestickSeries({
        upColor: '#00d4aa',
        downColor: '#ff6b6b',
        borderDownColor: '#ff6b6b',
        borderUpColor: '#00d4aa',
        wickDownColor: '#ff6b6b',
        wickUpColor: '#00d4aa',
        priceScaleId: 'right',
      });

      // Add volume series
      const volumeSeries = newChart.addHistogramSeries({
        color: '#71717a',
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
          height: isChartMaximized ? 600 : 450,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [chart, isChartMaximized]);

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
        color: d.close > d.open ? 'rgba(0, 212, 170, 0.6)' : 'rgba(255, 107, 107, 0.6)',
      }));

      candlestickSeries.setData(candleData);
      volumeSeries.setData(volumeData);
    }
  }, [chartData, candlestickSeries, volumeSeries]);

  const selectedPairData = tradingPairs?.find((p: TradingPair) => p.id === selectedPair);

  const handleTrade = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to place trades.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || (orderType === "limit" && !price)) {
      toast({
        title: "Input Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      toast({
        title: "Processing Trade",
        description: "Your trade is being processed on the blockchain...",
      });

      // Execute the trade via API
      const response = await fetch(getApiUrl("/api/trading/execute"), {
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
          leverage: parseFloat(leverage),
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          userAddress: wallet.address,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // For limit orders, use the Web3 service to place the order on-chain
        if (orderType === "limit") {
          try {
            const { web3Service } = await import("@/lib/web3");
            const limitOrderResult = await web3Service.placeLimitOrder(
              selectedPair,
              side as 'buy' | 'sell',
              amount,
              price
            );

            if (limitOrderResult.success) {
              toast({
                title: "Limit Order Placed",
                description: `Your ${side} limit order has been placed on-chain. Order ID: ${limitOrderResult.orderId?.slice(0, 8)}...`,
              });
            } else {
              throw new Error(limitOrderResult.error);
            }
          } catch (web3Error: any) {
            console.warn("Limit order placement failed, using AMM execution:", web3Error);
          }
        }

        // For market orders or if limit order needs immediate execution
        if (orderType === "market" || true) {
          const [tokenIn, tokenOut] = selectedPair.split('-');
          const tokenInAddress = tokenIn;
          const tokenOutAddress = tokenOut;
          const amountIn = side === "buy" ? (parseFloat(amount) * result.executionPrice).toString() : amount;
          
          try {
            const { web3Service } = await import("@/lib/web3");
            const swapResult = await web3Service.executeSwap(
              tokenInAddress,
              tokenOutAddress,
              amountIn,
              parseFloat(slippage) / 100
            );

            if (swapResult.success) {
              toast({
                title: "Trade Executed Successfully",
                description: `${side === "buy" ? "Buy" : "Sell"} order executed. TX: ${swapResult.transactionHash?.slice(0, 10)}...`,
              });
            } else {
              toast({
                title: "Trade Failed",
                description: `Failed to execute trade on blockchain. Please try again.`,
                variant: "destructive",
              });
            }
          } catch (web3Error: any) {
            console.warn("Web3 execution failed, using API result:", web3Error);
            toast({
              title: "Trade Completed",
              description: `${side === "buy" ? "Buy" : "Sell"} order processed. Execution price: $${result.executionPrice}`,
            });
          }
        }

        // Clear form
        setAmount("");
        setPrice("");
        setStopLoss("");
        setTakeProfit("");
        
        // Refresh data
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } else {
        toast({
          title: "Trade Failed",
          description: result.message || "An error occurred during trading.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Trading error:", error);
      toast({
        title: "Trade Failed",
        description: "An error occurred while processing your trade.",
        variant: "destructive",
      });
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="bg-zinc-900 backdrop-blur-lg border-zinc-800">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Wallet Connection Required</h2>
                <p className="text-zinc-400">Connect your wallet to access professional trading features</p>
              </div>
              <Button onClick={connectWallet} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Hyperliquid style */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-white">Advanced Trading</h1>
              <div className="flex items-center gap-4">
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {tradingPairs?.map((pair: TradingPair) => (
                      <SelectItem key={pair.id} value={pair.id} className="text-white hover:bg-zinc-700">
                        <div className="flex items-center gap-2">
                          <img src={getTokenIcon(pair.symbol.split('-')[0])} alt="" className="w-4 h-4" />
                          {pair.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPairData && (
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-mono text-white">
                      ${selectedPairData.price.toFixed(6)}
                    </span>
                    <Badge 
                      variant={selectedPairData.change24h >= 0 ? "default" : "destructive"}
                      className={selectedPairData.change24h >= 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}
                    >
                      {selectedPairData.change24h >= 0 ? "+" : ""}{selectedPairData.change24h.toFixed(2)}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChartMaximized(!isChartMaximized)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Maximize className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="max-w-7xl mx-auto p-4">
        <div className={`grid gap-4 ${isChartMaximized ? 'grid-cols-1' : 'grid-cols-4'}`}>
          {/* Chart Section */}
          <div className={isChartMaximized ? 'col-span-1' : 'col-span-3'}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <img src={getTokenIcon(selectedPair.split('-')[0])} alt="" className="w-5 h-5" />
                      <span className="font-mono text-sm text-zinc-400">{selectedPair}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Chart Type Selector */}
                    <div className="flex items-center bg-zinc-800 rounded-md p-1">
                      <Button
                        variant={chartType === "candlestick" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setChartType("candlestick")}
                        className="h-7 px-2"
                      >
                        <CandlestickChart className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={chartType === "line" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setChartType("line")}
                        className="h-7 px-2"
                      >
                        <LineChart className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Timeframe Selector */}
                    <div className="flex items-center bg-zinc-800 rounded-md p-1">
                      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                        <Button
                          key={tf}
                          variant={timeFrame === tf ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTimeFrame(tf)}
                          className="h-7 px-2 text-xs"
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={chartContainerRef} className="w-full" />
              </CardContent>
            </Card>

            {/* Market Stats - Hyperliquid style */}
            {selectedPairData && !isChartMaximized && (
              <Card className="bg-zinc-900 border-zinc-800 mt-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">24h High</p>
                      <p className="text-sm font-mono text-emerald-400">${selectedPairData.high24h.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">24h Low</p>
                      <p className="text-sm font-mono text-red-400">${selectedPairData.low24h.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">24h Volume</p>
                      <p className="text-sm font-mono text-white">${selectedPairData.volume24h.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Liquidity</p>
                      <p className="text-sm font-mono text-blue-400">${selectedPairData.liquidity.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel */}
          {!isChartMaximized && (
            <div className="space-y-4">
              {/* Trading Panel */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white">Place Order</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Buy/Sell Tabs */}
                  <Tabs value={side} onValueChange={setSide}>
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                      <TabsTrigger value="buy" className="text-emerald-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        Buy
                      </TabsTrigger>
                      <TabsTrigger value="sell" className="text-red-400 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                        Sell
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Order Type */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Order Type</Label>
                    </div>
                    <Tabs value={orderType} onValueChange={setOrderType}>
                      <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                        <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
                        <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Leverage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Leverage</Label>
                      <span className="text-xs text-white">{leverage}x</span>
                    </div>
                    <Select value={leverage} onValueChange={setLeverage}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="5">5x</SelectItem>
                        <SelectItem value="10">10x</SelectItem>
                        <SelectItem value="20">20x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price (for limit orders) */}
                  {orderType === "limit" && (
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-400">Price</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Size</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                    />
                    <div className="flex gap-1">
                      {["25%", "50%", "75%", "Max"].map((pct) => (
                        <Button
                          key={pct}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        >
                          {pct}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Stop Loss</Label>
                    <Input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="Optional"
                      className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Take Profit</Label>
                    <Input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="Optional"
                      className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                    />
                  </div>

                  {/* Slippage */}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-400">Slippage</Label>
                    <Select value={slippage} onValueChange={setSlippage}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="0.1">0.1%</SelectItem>
                        <SelectItem value="0.5">0.5%</SelectItem>
                        <SelectItem value="1.0">1.0%</SelectItem>
                        <SelectItem value="3.0">3.0%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trade Button */}
                  <Button 
                    onClick={handleTrade}
                    className={`w-full h-10 font-medium ${
                      side === "buy" 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {side === "buy" ? "Buy" : "Sell"} {selectedPair.split('-')[0]}
                  </Button>
                </CardContent>
              </Card>

              {/* Right Panel Tabs */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 border-b border-zinc-800">
                  <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                      <TabsTrigger value="orderbook" className="text-xs">Book</TabsTrigger>
                      <TabsTrigger value="trades" className="text-xs">Trades</TabsTrigger>
                      <TabsTrigger value="positions" className="text-xs">Positions</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-3">
                  {rightPanelTab === "orderbook" && (
                    <div className="space-y-2">
                      {/* Order Book Header */}
                      <div className="flex justify-between text-xs text-zinc-500 mb-2">
                        <span>Price</span>
                        <span>Size</span>
                        <span>Total</span>
                      </div>
                      
                      {/* Asks */}
                      <div className="space-y-1">
                        {orderBook?.asks?.slice(0, 8).reverse().map((ask: OrderBookEntry, index: number) => (
                          <div key={index} className="flex justify-between text-xs hover:bg-zinc-800 px-1 py-0.5 rounded">
                            <span className="text-red-400 font-mono">{ask.price.toFixed(6)}</span>
                            <span className="text-zinc-300 font-mono">{ask.amount.toFixed(2)}</span>
                            <span className="text-zinc-500 font-mono">{ask.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Spread */}
                      <div className="py-2 text-center border-t border-b border-zinc-800">
                        <span className="text-xs text-zinc-500 font-mono">
                          {orderBook?.asks?.[0] && orderBook?.bids?.[0] 
                            ? `${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(6)} (${((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price * 100).toFixed(2)}%)`
                            : 'Spread'
                          }
                        </span>
                      </div>
                      
                      {/* Bids */}
                      <div className="space-y-1">
                        {orderBook?.bids?.slice(0, 8).map((bid: OrderBookEntry, index: number) => (
                          <div key={index} className="flex justify-between text-xs hover:bg-zinc-800 px-1 py-0.5 rounded">
                            <span className="text-emerald-400 font-mono">{bid.price.toFixed(6)}</span>
                            <span className="text-zinc-300 font-mono">{bid.amount.toFixed(2)}</span>
                            <span className="text-zinc-500 font-mono">{bid.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rightPanelTab === "trades" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-500 mb-2">
                        <span>Price</span>
                        <span>Size</span>
                        <span>Time</span>
                      </div>
                      {recentTrades?.slice(0, 20).map((trade: MarketTrade, index: number) => (
                        <div key={index} className="flex justify-between text-xs hover:bg-zinc-800 px-1 py-0.5 rounded">
                          <span className={`font-mono ${trade.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                            {trade.price.toFixed(6)}
                          </span>
                          <span className="text-zinc-300 font-mono">{trade.amount.toFixed(2)}</span>
                          <span className="text-zinc-500 text-xs">
                            {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {rightPanelTab === "positions" && (
                    <div className="text-center py-8">
                      <p className="text-xs text-zinc-500">No open positions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}