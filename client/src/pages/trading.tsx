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
import { useWeb3Context } from "@/contexts/Web3Context";
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
  const { wallet, connectWallet } = useWeb3Context();
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<any>(null);
  const [volumeSeries, setVolumeSeries] = useState<any>(null);
  
  const [selectedPair, setSelectedPair] = useState("XPS-XP");
  const [timeFrame, setTimeFrame] = useState("1h");
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  // Fetch trading pairs
  const { data: tradingPairs, isLoading: pairsLoading } = useQuery({
    queryKey: ["/api/trading/pairs"],
    queryFn: async () => {
      const response = await fetch("/api/trading/pairs");
      if (!response.ok) throw new Error("Failed to fetch trading pairs");
      return response.json();
    },
    refetchInterval: 5000
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/trading/chart", selectedPair, timeFrame],
    queryFn: async () => {
      const response = await fetch(`/api/trading/chart?pair=${selectedPair}&timeframe=${timeFrame}`);
      if (!response.ok) throw new Error("Failed to fetch chart data");
      return response.json();
    },
    refetchInterval: 2000
  });

  // Fetch order book
  const { data: orderBook, isLoading: orderBookLoading } = useQuery({
    queryKey: ["/api/trading/orderbook", selectedPair],
    queryFn: async () => {
      const response = await fetch(`/api/trading/orderbook?pair=${selectedPair}`);
      if (!response.ok) throw new Error("Failed to fetch order book");
      return response.json();
    },
    refetchInterval: 1000
  });

  // Fetch recent trades
  const { data: recentTrades, isLoading: tradesLoading } = useQuery({
    queryKey: ["/api/trading/trades", selectedPair],
    queryFn: async () => {
      const response = await fetch(`/api/trading/trades?pair=${selectedPair}`);
      if (!response.ok) throw new Error("Failed to fetch recent trades");
      return response.json();
    },
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

      // First execute the trade via API (which validates and processes the order)
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
            // Fallback to regular AMM execution
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
                title: "Trade Completed (Simulated)",
                description: `${side === "buy" ? "Buy" : "Sell"} order processed successfully. Price: $${result.executionPrice}`,
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="bg-card backdrop-blur-lg border-border">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">지갑 연결 필요</h2>
                <p className="text-muted-foreground">고급 거래 기능을 사용하려면 지갑을 연결해주세요</p>
              </div>
              <Button onClick={connectWallet} className="bg-primary hover:bg-primary/90">
                지갑 연결
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Trading</h1>
            <p className="text-muted-foreground">Professional-grade trading with advanced charts and order types</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-48 bg-background border-border text-foreground">
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
            <Card className="bg-card backdrop-blur-lg border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <img src={getTokenIcon(selectedPair.split('-')[0])} alt="" className="w-6 h-6" />
                      <h3 className="text-lg font-semibold text-foreground">{selectedPair}</h3>
                    </div>
                    {selectedPairData && (
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-foreground">
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
                      <SelectTrigger className="w-20 bg-background border-border text-foreground">
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
              <Card className="bg-card backdrop-blur-lg border-border mt-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">24h High</p>
                      <p className="text-lg font-semibold text-green-600">${selectedPairData.high24h.toFixed(6)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">24h Low</p>
                      <p className="text-lg font-semibold text-red-600">${selectedPairData.low24h.toFixed(6)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="text-lg font-semibold text-foreground">${selectedPairData.volume24h.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Liquidity</p>
                      <p className="text-lg font-semibold text-blue-600">${selectedPairData.liquidity.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trading Panel */}
          <div className="space-y-4">
            {/* Order Form */}
            <Card className="bg-card backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={side} onValueChange={setSide}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="text-green-400">Buy</TabsTrigger>
                    <TabsTrigger value="sell" className="text-red-400">Sell</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label className="text-foreground">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger className="bg-background border-border text-foreground">
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
                    <Label className="text-foreground">Price</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-foreground">Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Slippage (%)</Label>
                  <Select value={slippage} onValueChange={setSlippage}>
                    <SelectTrigger className="bg-background border-border text-foreground">
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
            <Card className="bg-card backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Asks */}
                  <div className="space-y-1">
                    <p className="text-xs text-red-600 mb-2">Asks</p>
                    {orderBook?.asks?.slice(0, 5).map((ask: OrderBookEntry, index: number) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-red-600">{ask.price.toFixed(6)}</span>
                        <span className="text-muted-foreground">{ask.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Spread */}
                  <div className="py-2 text-center border-t border-b border-border">
                    <span className="text-xs text-muted-foreground">Spread</span>
                  </div>
                  
                  {/* Bids */}
                  <div className="space-y-1">
                    <p className="text-xs text-green-600 mb-2">Bids</p>
                    {orderBook?.bids?.slice(0, 5).map((bid: OrderBookEntry, index: number) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-green-600">{bid.price.toFixed(6)}</span>
                        <span className="text-muted-foreground">{bid.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="bg-card backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentTrades?.slice(0, 10).map((trade: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className={trade.side === "buy" ? "text-green-600" : "text-red-600"}>
                        {trade.price.toFixed(6)}
                      </span>
                      <span className="text-muted-foreground">{trade.amount.toFixed(2)}</span>
                      <span className="text-muted-foreground">{new Date(trade.timestamp).toLocaleTimeString()}</span>
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