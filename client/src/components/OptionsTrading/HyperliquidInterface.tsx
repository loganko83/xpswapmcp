import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useWeb3Context } from "@/contexts/Web3Context";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  DollarSign, 
  Shield, 
  AlertCircle, 
  Activity,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Maximize2,
  Minimize2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/apiUrl";

interface HyperliquidContract {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  nextFundingTime: string;
  volume24h: number;
  openInterest: number;
  maxLeverage: number;
  minOrderSize: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  lastPrice: number;
  askPrice: number;
  bidPrice: number;
  oraclePrice: number;
  impactBidPrice: number;
  impactAskPrice: number;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

interface HyperliquidPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  margin: number;
  maintenanceMargin: number;
  marginRatio: number;
  fundingCost: number;
  timestamp: string;
  isolated: boolean;
  autoAdd: boolean;
}

interface TradeHistory {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timestamp: string;
  fee: number;
}

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function HyperliquidInterface() {
  const { wallet } = useWeb3Context();
  const [activeTab, setActiveTab] = useState("trade");
  const [selectedContract, setSelectedContract] = useState("XP-PERP");
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderSize, setOrderSize] = useState("");
  const [leverage, setLeverage] = useState([10]);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('limit');
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [isReduceOnly, setIsReduceOnly] = useState(false);
  const [marginMode, setMarginMode] = useState<'cross' | 'isolated'>('cross');
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [showChart, setShowChart] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch contracts data
  const { data: contracts, refetch: refetchContracts } = useQuery({
    queryKey: ["/api/hyperliquid/contracts"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/hyperliquid/contracts"));
      if (!response.ok) throw new Error("Failed to fetch contracts");
      return response.json();
    },
    refetchInterval: 1000, // Update every second like Hyperliquid
  });

  // Fetch order book
  const { data: orderBook } = useQuery({
    queryKey: ["/api/hyperliquid/orderbook", selectedContract],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/hyperliquid/orderbook/${selectedContract}`));
      if (!response.ok) throw new Error("Failed to fetch order book");
      return response.json();
    },
    refetchInterval: 500, // Very fast updates
  });

  // Fetch positions
  const { data: positions } = useQuery({
    queryKey: ["/api/hyperliquid/positions", wallet?.address],
    queryFn: async () => {
      if (!wallet?.address) return [];
      const response = await fetch(getApiUrl(`/api/hyperliquid/positions?address=${wallet.address}`));
      if (!response.ok) throw new Error("Failed to fetch positions");
      return response.json();
    },
    enabled: !!wallet?.address,
    refetchInterval: 2000,
  });

  // Fetch trade history
  const { data: tradeHistory } = useQuery({
    queryKey: ["/api/hyperliquid/trades", selectedContract],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/hyperliquid/trades/${selectedContract}`));
      if (!response.ok) throw new Error("Failed to fetch trades");
      return response.json();
    },
    refetchInterval: 1000,
  });

  // Fetch chart data
  const { data: chartData } = useQuery({
    queryKey: ["/api/hyperliquid/chart", selectedContract],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/hyperliquid/chart/${selectedContract}?interval=1m&limit=100`));
      if (!response.ok) throw new Error("Failed to fetch chart data");
      return response.json();
    },
    refetchInterval: 5000,
  });

  const selectedContractData = contracts?.find((c: HyperliquidContract) => c.symbol === selectedContract);

  // Auto-fill limit price based on order book
  useEffect(() => {
    if (selectedContractData && !limitPrice) {
      if (orderSide === 'buy') {
        setLimitPrice(selectedContractData.bidPrice.toString());
      } else {
        setLimitPrice(selectedContractData.askPrice.toString());
      }
    }
  }, [selectedContract, orderSide, selectedContractData]);

  const calculateLiquidationPrice = () => {
    if (!selectedContractData || !orderSize) return 0;
    
    const size = parseFloat(orderSize);
    const lev = leverage[0];
    const price = parseFloat(limitPrice) || selectedContractData.markPrice;
    const maintenanceMarginRate = 0.005; // 0.5%
    
    if (orderSide === 'buy') {
      return price * (1 - (1/lev) + maintenanceMarginRate);
    } else {
      return price * (1 + (1/lev) - maintenanceMarginRate);
    }
  };

  const calculateRequiredMargin = () => {
    if (!selectedContractData || !orderSize) return 0;
    const size = parseFloat(orderSize);
    const price = parseFloat(limitPrice) || selectedContractData.markPrice;
    return (size * price) / leverage[0];
  };

  const calculateFees = () => {
    if (!selectedContractData || !orderSize) return 0;
    const size = parseFloat(orderSize);
    const price = parseFloat(limitPrice) || selectedContractData.markPrice;
    const feeRate = orderType === 'market' ? 0.0005 : -0.00025; // Maker rebate, taker fee
    return Math.abs(size * price * feeRate);
  };

  const handleQuickSize = (percentage: number) => {
    if (!wallet?.balance || !selectedContractData) return;
    
    const maxSize = (wallet.balance * leverage[0] * percentage) / 100;
    const price = parseFloat(limitPrice) || selectedContractData.markPrice;
    setOrderSize((maxSize / price).toFixed(4));
  };

  const handleTrade = async () => {
    if (!wallet?.address || !orderSize) {
      alert("Please fill in all fields and connect your wallet");
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/hyperliquid/order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.address,
          symbol: selectedContract,
          side: orderSide,
          size: parseFloat(orderSize),
          leverage: leverage[0],
          orderType,
          limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
          stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
          reduceOnly: isReduceOnly,
          marginMode,
        })
      });

      if (!response.ok) throw new Error("Order failed");
      
      const result = await response.json();
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
      
      // Reset form
      setOrderSize("");
      setStopPrice("");
    } catch (error) {
      console.error("Trading error:", error);
      alert("Order failed. Please try again.");
    }
  };

  const OrderBookComponent = () => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Order Book</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOrderBook(!showOrderBook)}
            >
              {showOrderBook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {showOrderBook && (
        <CardContent className="p-0">
          <div className="h-96 overflow-hidden">
            {/* Asks */}
            <div className="h-48 overflow-y-auto">
              {orderBook?.asks?.slice(0, 15).reverse().map((ask: OrderBookEntry, index: number) => (
                <div
                  key={`ask-${index}`}
                  className="flex justify-between px-3 py-1 text-xs hover:bg-red-500/10 cursor-pointer"
                  onClick={() => setLimitPrice(ask.price.toString())}
                >
                  <span className="text-red-500">{ask.price.toFixed(4)}</span>
                  <span className="text-muted-foreground">{ask.size.toFixed(2)}</span>
                  <span className="text-muted-foreground">{ask.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {/* Spread */}
            <div className="border-y bg-muted/30 px-3 py-2 text-center">
              <div className="text-xs text-muted-foreground">
                Spread: ${((orderBook?.asks?.[0]?.price || 0) - (orderBook?.bids?.[0]?.price || 0)).toFixed(4)}
              </div>
              <div className="text-lg font-bold">
                ${selectedContractData?.markPrice.toFixed(4)}
              </div>
            </div>

            {/* Bids */}
            <div className="h-48 overflow-y-auto">
              {orderBook?.bids?.slice(0, 15).map((bid: OrderBookEntry, index: number) => (
                <div
                  key={`bid-${index}`}
                  className="flex justify-between px-3 py-1 text-xs hover:bg-green-500/10 cursor-pointer"
                  onClick={() => setLimitPrice(bid.price.toString())}
                >
                  <span className="text-green-500">{bid.price.toFixed(4)}</span>
                  <span className="text-muted-foreground">{bid.size.toFixed(2)}</span>
                  <span className="text-muted-foreground">{bid.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const ChartComponent = () => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{selectedContract} Chart</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className={`bg-black rounded-lg flex items-center justify-center text-green-400 font-mono ${isFullScreen ? 'h-96' : 'h-64'}`}>
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <div>Advanced TradingView Chart</div>
            <div className="text-xs text-muted-foreground mt-2">
              Price: ${selectedContractData?.markPrice.toFixed(4)}
            </div>
            <div className="text-xs">
              24h: <span className={selectedContractData?.priceChangePercent24h && selectedContractData.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                {selectedContractData?.priceChangePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TradeHistoryComponent = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-48 overflow-y-auto">
          <div className="flex justify-between px-3 py-2 text-xs font-medium border-b">
            <span>Price</span>
            <span>Size</span>
            <span>Time</span>
          </div>
          {tradeHistory?.slice(0, 20).map((trade: TradeHistory, index: number) => (
            <div
              key={trade.id}
              className="flex justify-between px-3 py-1 text-xs hover:bg-muted/50"
            >
              <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                {trade.price.toFixed(4)}
              </span>
              <span className="text-muted-foreground">{trade.size.toFixed(2)}</span>
              <span className="text-muted-foreground">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">HyperSwap</h1>
          <Select value={selectedContract} onValueChange={setSelectedContract}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contracts?.map((contract: HyperliquidContract) => (
                <SelectItem key={contract.symbol} value={contract.symbol}>
                  {contract.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedContractData && (
            <div className="flex items-center gap-4 text-sm">
              <span className="font-mono font-bold text-lg">
                ${selectedContractData.markPrice.toFixed(4)}
              </span>
              <Badge variant={selectedContractData.priceChangePercent24h >= 0 ? 'default' : 'destructive'}>
                {selectedContractData.priceChangePercent24h >= 0 ? '+' : ''}
                {selectedContractData.priceChangePercent24h.toFixed(2)}%
              </Badge>
              <span className="text-muted-foreground">
                Vol: ${selectedContractData.volume24h.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                OI: ${selectedContractData.openInterest.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          {wallet?.isConnected ? (
            <Badge variant="outline" className="bg-green-50">
              {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </Badge>
          ) : (
            <Button size="sm">Connect Wallet</Button>
          )}
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chart */}
        <div className="flex-1 p-4">
          <ChartComponent />
        </div>

        {/* Center Panel - Order Book & Trade History */}
        <div className="w-80 p-4 border-x space-y-4">
          <OrderBookComponent />
          <TradeHistoryComponent />
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 p-4 space-y-4">
          {/* Order Form */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Place Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Buy/Sell Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={orderSide === 'buy' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOrderSide('buy')}
                  className={orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Buy / Long
                </Button>
                <Button
                  variant={orderSide === 'sell' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOrderSide('sell')}
                  className={orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Sell / Short
                </Button>
              </div>

              {/* Order Type */}
              <Select value={orderType} onValueChange={(value: 'market' | 'limit' | 'stop') => setOrderType(value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Input */}
              {orderType !== 'market' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">Price</label>
                  <Input
                    type="number"
                    placeholder="0.0000"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="h-8 font-mono"
                  />
                </div>
              )}

              {/* Size Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Size</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={orderSize}
                  onChange={(e) => setOrderSize(e.target.value)}
                  className="h-8 font-mono"
                />
                
                {/* Quick Size Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSize(pct)}
                      className="h-6 text-xs"
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Leverage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium">Leverage</label>
                  <span className="text-xs">{leverage[0]}x</span>
                </div>
                <Slider
                  value={leverage}
                  onValueChange={setLeverage}
                  max={selectedContractData?.maxLeverage || 100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Advanced Options */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Reduce Only</span>
                  <Button
                    variant={isReduceOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsReduceOnly(!isReduceOnly)}
                    className="h-6 text-xs"
                  >
                    {isReduceOnly ? "ON" : "OFF"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Margin Mode</span>
                  <Select value={marginMode} onValueChange={(value: 'cross' | 'isolated') => setMarginMode(value)}>
                    <SelectTrigger className="h-6 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cross">Cross</SelectItem>
                      <SelectItem value="isolated">Isolated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Required Margin:</span>
                  <span className="font-mono">${calculateRequiredMargin().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Liq. Price:</span>
                  <span className="font-mono text-red-500">${calculateLiquidationPrice().toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Fee:</span>
                  <span className="font-mono">${calculateFees().toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleTrade}
                className={`w-full h-10 font-semibold ${
                  orderSide === 'buy' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={!wallet?.isConnected || !orderSize}
              >
                {!wallet?.isConnected 
                  ? "Connect Wallet" 
                  : `${orderSide === 'buy' ? 'Buy / Long' : 'Sell / Short'} ${selectedContract}`
                }
              </Button>
            </CardContent>
          </Card>

          {/* Positions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Positions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                {positions?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-xs">
                    No positions
                  </p>
                ) : (
                  positions?.map((position: HyperliquidPosition) => (
                    <div key={position.id} className="border-b p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{position.symbol}</span>
                          <Badge 
                            variant={position.side === 'long' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {position.side} {position.leverage}x
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono text-sm ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                          </div>
                          <div className={`font-mono text-xs ${position.unrealizedPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({position.unrealizedPnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Size: </span>
                          <span className="font-mono">${position.size.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entry: </span>
                          <span className="font-mono">${position.entryPrice.toFixed(4)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-6 text-xs"
                        onClick={() => {
                          setOrderSide(position.side === 'long' ? 'sell' : 'buy');
                          setOrderSize(position.size.toString());
                          setIsReduceOnly(true);
                        }}
                      >
                        Close Position
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}