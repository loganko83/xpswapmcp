import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useWeb3Context } from "@/contexts/Web3Context";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  DollarSign, 
  Shield, 
  AlertCircle,
  Settings,
  BarChart3,
  Activity,
  ArrowUpDown,
  MousePointer,
  Calculator,
  TrendingUpDown,
  RefreshCw,
  Crosshair,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/apiUrl";

// HyperLiquid style interfaces
interface PerpetualContract {
  symbol: string;
  name: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  nextFundingTime: string;
  volume24h: number;
  openInterest: number;
  maxLeverage: number;
  minOrderSize: number;
  tickSize: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  basis: number; // Mark - Index spread
  isActive: boolean;
}

interface PerpetualPosition {
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
}

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
}

interface TradeHistory {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

interface RiskMetrics {
  totalMargin: number;
  freeMargin: number;
  marginRatio: number;
  liquidationRisk: 'low' | 'medium' | 'high' | 'critical';
  estimatedLiquidationTime?: string;
}

export function PerpetualFuturesInterface() {
  const { wallet } = useWeb3Context();
  const queryClient = useQueryClient();
  
  // State management - HyperLiquid style
  const [activeTab, setActiveTab] = useState("trade");
  const [selectedContract, setSelectedContract] = useState("XP-PERP");
  const [orderSide, setOrderSide] = useState<'long' | 'short'>('long');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'reduce_only'>('market');
  const [orderSize, setOrderSize] = useState("");
  const [leverage, setLeverage] = useState([10]);
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false); // Immediate or Cancel
  const [twapEnabled, setTwapEnabled] = useState(false);
  const [twapDuration, setTwapDuration] = useState(300); // 5 minutes default
  
  // Advanced order features
  const [brackets, setBrackets] = useState({
    enabled: false,
    takeProfit: "",
    stopLoss: "",
    trail: false,
    trailAmount: ""
  });
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrderBookPrecision, setSelectedOrderBookPrecision] = useState(2);
  const [priceInputMode, setPriceInputMode] = useState<'manual' | 'click'>('manual');

  // Data queries with real-time updates
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['perpetual-contracts'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/futures/contracts`);
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return response.json();
    },
    refetchInterval: autoRefresh ? 1000 : false,
    staleTime: 500
  });

  const { data: positions = [], isLoading: positionsLoading } = useQuery({
    queryKey: ['perpetual-positions', wallet?.address],
    queryFn: async () => {
      if (!wallet?.address) return [];
      const response = await fetch(`${getApiUrl()}/api/futures/positions/${wallet.address}`);
      if (!response.ok) throw new Error('Failed to fetch positions');
      return response.json();
    },
    enabled: !!wallet?.address,
    refetchInterval: autoRefresh ? 2000 : false
  });

  const { data: orderBook, isLoading: orderBookLoading } = useQuery({
    queryKey: ['perpetual-orderbook', selectedContract, selectedOrderBookPrecision],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/futures/orderbook/${selectedContract}?precision=${selectedOrderBookPrecision}`);
      if (!response.ok) throw new Error('Failed to fetch order book');
      return response.json();
    },
    refetchInterval: autoRefresh ? 500 : false,
    staleTime: 200
  });

  const { data: tradeHistory = [], isLoading: tradeHistoryLoading } = useQuery({
    queryKey: ['perpetual-trades', selectedContract],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/api/futures/trades/${selectedContract}`);
      if (!response.ok) throw new Error('Failed to fetch trade history');
      return response.json();
    },
    refetchInterval: autoRefresh ? 1000 : false
  });

  const { data: riskMetrics } = useQuery({
    queryKey: ['risk-metrics', wallet?.address],
    queryFn: async () => {
      if (!wallet?.address) return null;
      const response = await fetch(`${getApiUrl()}/api/futures/risk/${wallet.address}`);
      if (!response.ok) throw new Error('Failed to fetch risk metrics');
      return response.json();
    },
    enabled: !!wallet?.address,
    refetchInterval: autoRefresh ? 3000 : false
  });

  // Derived values
  const selectedContractData = contracts.find(c => c.symbol === selectedContract);
  const currentPosition = positions.find(p => p.symbol === selectedContract);
  
  const calculatedValues = useMemo(() => {
    if (!selectedContractData || !orderSize) return null;
    
    const size = parseFloat(orderSize);
    const price = orderType === 'market' ? selectedContractData.markPrice : parseFloat(limitPrice);
    const lev = leverage[0];
    
    if (!size || !price || !lev) return null;
    
    const notional = size * price;
    const margin = notional / lev;
    const fees = notional * 0.0005; // 0.05% taker fee
    
    return {
      notional,
      margin,
      fees,
      totalCost: margin + fees,
      liquidationPrice: orderSide === 'long' 
        ? price * (1 - 0.9 / lev)
        : price * (1 + 0.9 / lev)
    };
  }, [selectedContractData, orderSize, orderType, limitPrice, leverage, orderSide]);

  // Event handlers
  const handleOrderSizeChange = useCallback((value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setOrderSize(value);
    }
  }, []);

  const handleOrderBookPriceClick = useCallback((price: number) => {
    if (priceInputMode === 'click') {
      setLimitPrice(price.toFixed(selectedOrderBookPrecision));
      if (orderType === 'market') {
        setOrderType('limit');
      }
    }
  }, [priceInputMode, selectedOrderBookPrecision, orderType]);

  const handleQuickSizeClick = useCallback((percentage: number) => {
    if (!selectedContractData || !wallet) return;
    
    // Calculate size based on available balance and percentage
    const availableBalance = 1000; // Mock balance
    const maxSize = (availableBalance * leverage[0] * percentage / 100) / selectedContractData.markPrice;
    setOrderSize(maxSize.toFixed(4));
  }, [selectedContractData, wallet, leverage]);

  const handleSubmitOrder = useCallback(async () => {
    if (!wallet || !selectedContractData || !orderSize) return;
    
    try {
      const orderData = {
        symbol: selectedContract,
        side: orderSide,
        type: orderType,
        size: parseFloat(orderSize),
        leverage: leverage[0],
        price: orderType !== 'market' ? parseFloat(limitPrice) : undefined,
        stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
        reduceOnly,
        postOnly,
        ioc,
        twap: twapEnabled ? { duration: twapDuration } : undefined,
        brackets: brackets.enabled ? brackets : undefined
      };

      const response = await fetch(`${getApiUrl()}/api/futures/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Order failed');
      
      if (soundEnabled) {
        // Play success sound
        new Audio('/sounds/order-success.mp3').play().catch(() => {});
      }
      
      // Reset form
      setOrderSize("");
      setLimitPrice("");
      setStopPrice("");
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['perpetual-positions'] });
      
    } catch (error) {
      console.error('Order submission failed:', error);
      if (soundEnabled) {
        new Audio('/sounds/order-error.mp3').play().catch(() => {});
      }
    }
  }, [wallet, selectedContractData, orderSize, selectedContract, orderSide, orderType, leverage, limitPrice, stopPrice, reduceOnly, postOnly, ioc, twapEnabled, twapDuration, brackets, soundEnabled, queryClient]);

  if (!wallet) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Wallet Required</h3>
            <p className="text-muted-foreground">Connect your wallet to trade perpetual futures</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Risk Metrics */}
      {riskMetrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Margin</p>
                  <p className="text-lg font-bold">${riskMetrics.totalMargin.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Free Margin</p>
                  <p className="text-lg font-bold text-green-600">${riskMetrics.freeMargin.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Margin Ratio</p>
                  <Badge variant={
                    riskMetrics.liquidationRisk === 'critical' ? 'destructive' :
                    riskMetrics.liquidationRisk === 'high' ? 'destructive' :
                    riskMetrics.liquidationRisk === 'medium' ? 'secondary' : 'default'
                  }>
                    {(riskMetrics.marginRatio * 100).toFixed(2)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(autoRefresh && "text-green-600")}
                >
                  {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(soundEnabled && "text-blue-600")}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trade" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Trade</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Positions</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUpDown className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trading Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Crosshair className="w-5 h-5" />
                    <span>Place Order</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Switch
                      checked={priceInputMode === 'click'}
                      onCheckedChange={(checked) => setPriceInputMode(checked ? 'click' : 'manual')}
                    />
                    <span className="text-xs text-muted-foreground">Click to set price</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contract Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Contract</label>
                  <Select value={selectedContract} onValueChange={setSelectedContract}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.symbol} value={contract.symbol}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{contract.symbol}</span>
                            <span className={cn(
                              "text-sm ml-4",
                              contract.priceChangePercent24h >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {contract.priceChangePercent24h >= 0 ? "+" : ""}{contract.priceChangePercent24h.toFixed(2)}%
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Side Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Side</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={orderSide === 'long' ? 'default' : 'outline'}
                      onClick={() => setOrderSide('long')}
                      className={cn(
                        orderSide === 'long' && "bg-green-600 hover:bg-green-700 text-white"
                      )}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Long
                    </Button>
                    <Button
                      variant={orderSide === 'short' ? 'default' : 'outline'}
                      onClick={() => setOrderSide('short')}
                      className={cn(
                        orderSide === 'short' && "bg-red-600 hover:bg-red-700 text-white"
                      )}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Short
                    </Button>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Order Type</label>
                  <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop Market</SelectItem>
                      <SelectItem value="reduce_only">Reduce Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Input */}
                {orderType !== 'market' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {orderType === 'stop' ? 'Stop Price' : 'Limit Price'}
                    </label>
                    <Input
                      type="text"
                      value={orderType === 'stop' ? stopPrice : limitPrice}
                      onChange={(e) => orderType === 'stop' ? setStopPrice(e.target.value) : setLimitPrice(e.target.value)}
                      placeholder={`Price in ${selectedContractData?.symbol.split('-')[0] || 'USD'}`}
                    />
                  </div>
                )}

                {/* Size Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <Input
                    type="text"
                    value={orderSize}
                    onChange={(e) => handleOrderSizeChange(e.target.value)}
                    placeholder="Size"
                  />
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickSizeClick(pct)}
                        className="text-xs"
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Leverage */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Leverage: {leverage[0]}x
                  </label>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    max={selectedContractData?.maxLeverage || 100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reduce Only</span>
                      <Switch checked={reduceOnly} onCheckedChange={setReduceOnly} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Post Only</span>
                      <Switch checked={postOnly} onCheckedChange={setPostOnly} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">IOC (Immediate or Cancel)</span>
                      <Switch checked={ioc} onCheckedChange={setIoc} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">TWAP</span>
                      <Switch checked={twapEnabled} onCheckedChange={setTwapEnabled} />
                    </div>
                    {twapEnabled && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">TWAP Duration (seconds)</label>
                        <Input
                          type="number"
                          value={twapDuration}
                          onChange={(e) => setTwapDuration(parseInt(e.target.value))}
                          min={60}
                          max={3600}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                {calculatedValues && (
                  <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Notional Value:</span>
                      <span>${calculatedValues.notional.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Required Margin:</span>
                      <span>${calculatedValues.margin.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Estimated Fees:</span>
                      <span>${calculatedValues.fees.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Liquidation Price:</span>
                      <span className="text-red-600">${calculatedValues.liquidationPrice.toFixed(4)}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitOrder}
                  disabled={!orderSize || (orderType !== 'market' && !limitPrice)}
                  className={cn(
                    "w-full",
                    orderSide === 'long' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {orderSide === 'long' ? 'Buy' : 'Sell'} {selectedContract}
                </Button>
              </CardContent>
            </Card>

            {/* Order Book & Recent Trades */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Order Book & Trades</span>
                  </CardTitle>
                  <Select value={selectedOrderBookPrecision.toString()} onValueChange={(value) => setSelectedOrderBookPrecision(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">0.1</SelectItem>
                      <SelectItem value="2">0.01</SelectItem>
                      <SelectItem value="3">0.001</SelectItem>
                      <SelectItem value="4">0.0001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Book */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Order Book
                    </h4>
                    {orderBookLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : orderBook ? (
                      <div className="space-y-2">
                        {/* Asks (Sells) */}
                        <div className="space-y-1">
                          {orderBook.asks.slice().reverse().map((ask, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs p-1 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer rounded"
                              onClick={() => handleOrderBookPriceClick(ask.price)}
                            >
                              <span className="text-red-600 font-mono">{ask.price.toFixed(selectedOrderBookPrecision)}</span>
                              <span className="text-muted-foreground font-mono">{ask.size.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Spread */}
                        <div className="flex justify-center py-2 border-y border-muted">
                          <Badge variant="outline" className="text-xs">
                            Spread: ${orderBook.spread.toFixed(4)} ({orderBook.spreadPercent.toFixed(3)}%)
                          </Badge>
                        </div>
                        
                        {/* Bids (Buys) */}
                        <div className="space-y-1">
                          {orderBook.bids.map((bid, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs p-1 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer rounded"
                              onClick={() => handleOrderBookPriceClick(bid.price)}
                            >
                              <span className="text-green-600 font-mono">{bid.price.toFixed(selectedOrderBookPrecision)}</span>
                              <span className="text-muted-foreground font-mono">{bid.size.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Recent Trades */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Recent Trades
                    </h4>
                    {tradeHistoryLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : (
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {tradeHistory.map((trade, idx) => (
                          <div key={idx} className="flex justify-between text-xs p-1">
                            <span className={cn(
                              "font-mono",
                              trade.side === 'buy' ? "text-green-600" : "text-red-600"
                            )}>
                              {trade.price.toFixed(selectedOrderBookPrecision)}
                            </span>
                            <span className="text-muted-foreground font-mono">{trade.size.toFixed(2)}</span>
                            <span className="text-muted-foreground text-xs">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Open Positions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {positionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading positions...</div>
              ) : positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No open positions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                            {position.side.toUpperCase()}
                          </Badge>
                          <span className="font-semibold">{position.symbol}</span>
                          <span className="text-sm text-muted-foreground">
                            {position.leverage}x Leverage
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "font-semibold",
                            position.unrealizedPnl >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                          </div>
                          <div className={cn(
                            "text-sm",
                            position.unrealizedPnlPercent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ({position.unrealizedPnlPercent >= 0 ? '+' : ''}{position.unrealizedPnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">{position.size.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="font-medium">${position.entryPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mark Price</p>
                          <p className="font-medium">${position.markPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Liq. Price</p>
                          <p className="font-medium text-red-600">${position.liquidationPrice.toFixed(4)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Calculator className="w-4 h-4 mr-2" />
                          Edit TP/SL
                        </Button>
                        <Button variant="outline" size="sm">
                          <MousePointer className="w-4 h-4 mr-2" />
                          Market Close
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Open Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No open orders</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUpDown className="w-5 h-5" />
                <span>Trading Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUpDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}