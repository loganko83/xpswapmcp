import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpDown, Settings, ChevronDown, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { TokenSelector } from "./TokenSelector";
import { Token, SwapQuote } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getTokenIcon } from "@/lib/tokenUtils";

interface SwapInterfaceProps {
  onTokenChange?: (fromToken: Token | null, toToken: Token | null, fromAmount: string) => void;
}

export function SwapInterface({ onTokenChange }: SwapInterfaceProps = {}) {
  const { wallet, isXphereNetwork, switchToXphere, connectWallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [fromToken, setFromToken] = useState<Token>({
    id: 1,
    ...DEFAULT_TOKENS[0],
    isActive: true,
  });
  const [toToken, setToToken] = useState<Token>({
    id: 2,
    ...DEFAULT_TOKENS[1],
    isActive: true,
  });
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [isFromSelectorOpen, setIsFromSelectorOpen] = useState(false);
  const [isToSelectorOpen, setIsToSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  // Fetch real-time token prices
  const { data: tokenPrices, isLoading: pricesLoading } = useTokenPrices([
    fromToken.symbol, 
    toToken.symbol
  ]);

  // Get token balance function using actual MetaMask balance for XP
  const getTokenBalance = (token: Token) => {
    // Only show balance if wallet is connected
    if (!wallet.isConnected || !wallet.address) {
      return "0";
    }
    
    if (token.symbol === "XP") {
      return wallet.balance || "0";
    }
    // For other tokens, return 0 until smart contract integration is complete
    return "0";
  };

  // Clear inputs when wallet disconnects
  useEffect(() => {
    if (!wallet.isConnected) {
      setFromAmount("");
      setToAmount("");
      setSwapQuote(null);
    }
  }, [wallet.isConnected]);

  // Notify parent component of token changes
  useEffect(() => {
    onTokenChange?.(fromToken, toToken, fromAmount);
  }, [fromToken.id, toToken.id, fromAmount]);

  // Calculate swap quote
  const swapQuoteMutation = useMutation({
    mutationFn: async ({ fromToken, toToken, amount }: { fromToken: string; toToken: string; amount: string }) => {
      const response = await fetch("/api/swap-quote", {
        method: "POST",
        body: JSON.stringify({ fromToken, toToken, amount }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error("Failed to get swap quote");
      }
      
      return response.json();
    },
    onSuccess: (data: SwapQuote) => {
      setSwapQuote(data);
      setToAmount(data.outputAmount);
    },
    onError: (error) => {
      console.error("Error getting swap quote:", error);
      toast({
        title: "Error",
        description: "Failed to get swap quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Execute swap
  const executeSwapMutation = useMutation({
    mutationFn: async () => {
      if (!wallet.isConnected || !wallet.address) {
        throw new Error("Wallet not connected");
      }

      return apiRequest("POST", "/api/execute-swap", {
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount,
        toAmount,
        userAddress: wallet.address,
        slippage
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Swap Executed",
        description: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      setFromAmount("");
      setToAmount("");
      setSwapQuote(null);
      queryClient.invalidateQueries({ queryKey: ["/api/token-balance"] });
    },
    onError: (error) => {
      console.error("Error executing swap:", error);
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update swap quote when amount changes
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
      const timeoutId = setTimeout(() => {
        swapQuoteMutation.mutate({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setToAmount("");
      setSwapQuote(null);
    }
  }, [fromAmount, fromToken.symbol, toToken.symbol]);

  const handleTokenSelect = (token: Token) => {
    if (isFromSelectorOpen) {
      if (token.symbol === toToken.symbol) {
        // Swap tokens if selecting the same token
        setToToken(fromToken);
      }
      setFromToken(token);
      setIsFromSelectorOpen(false);
    } else if (isToSelectorOpen) {
      if (token.symbol === fromToken.symbol) {
        // Swap tokens if selecting the same token
        setFromToken(toToken);
      }
      setToToken(token);
      setIsToSelectorOpen(false);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    const balance = getTokenBalance(fromToken);
    if (fromToken.symbol === "XP") {
      // Leave some XP for gas fees
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01).toFixed(6);
      setFromAmount(maxAmount);
    } else {
      setFromAmount(balance);
    }
  };

  // Define network tokens
  const XPHERE_TOKENS = ["XP", "USDT", "ETH"]; // Tokens available on Xphere network
  const CROSS_CHAIN_TOKENS = ["BNB"]; // Tokens requiring cross-chain bridge
  
  // Check if this is a cross-chain swap
  const isCrossChainSwap = () => {
    const fromIsXphere = XPHERE_TOKENS.includes(fromToken.symbol);
    const toIsXphere = XPHERE_TOKENS.includes(toToken.symbol);
    const fromIsCrossChain = CROSS_CHAIN_TOKENS.includes(fromToken.symbol);
    const toIsCrossChain = CROSS_CHAIN_TOKENS.includes(toToken.symbol);
    
    return (fromIsXphere && toIsCrossChain) || (fromIsCrossChain && toIsXphere) || 
           (fromIsCrossChain && toIsCrossChain);
  };

  // Get token prices
  const fromTokenPrice = tokenPrices?.[fromToken.symbol]?.price || 0;
  const toTokenPrice = tokenPrices?.[toToken.symbol]?.price || 0;
  
  // Calculate USD values
  const fromAmountUSD = fromAmount ? (parseFloat(fromAmount) * fromTokenPrice).toFixed(2) : "0.00";
  const toAmountUSD = toAmount ? (parseFloat(toAmount) * toTokenPrice).toFixed(2) : "0.00";

  const fromTokenBalance = getTokenBalance(fromToken);
  const toTokenBalance = getTokenBalance(toToken);
  const isInsufficientBalance = fromAmount && 
    parseFloat(fromAmount) > parseFloat(fromTokenBalance);
  
  const requiresCrossChainBridge = isCrossChainSwap();



  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Swap
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Swap Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Slippage Tolerance</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <Button
                        key={value}
                        variant={slippage === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSlippage(value);
                          setCustomSlippage("");
                        }}
                      >
                        {value}%
                      </Button>
                    ))}
                    <div className="relative">
                      <Input
                        placeholder="Custom"
                        value={customSlippage}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomSlippage(value);
                          if (value && !isNaN(parseFloat(value))) {
                            setSlippage(parseFloat(value));
                          }
                        }}
                        className="text-xs"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                      />
                      {customSlippage && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium">Transaction Details</label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Slippage:</span>
                      <span className="font-medium">{slippage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-medium">Xphere</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Fee:</span>
                      <span className="font-medium">~0.01 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>From</span>
            <span>
              Balance: {fromTokenBalance} {fromToken.symbol}
            </span>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex justify-between items-center">
              <Input
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 text-2xl font-semibold p-0 h-auto"
                type="number"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxClick}
                  className="text-xs"
                >
                  MAX
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-2"
                  onClick={() => setIsFromSelectorOpen(true)}
                >
                  <img 
                    src={getTokenIcon(fromToken.symbol, fromToken)} 
                    alt={fromToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              ${fromAmountUSD}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2"
            onClick={handleSwapTokens}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>To</span>
            <span>
              Balance: {toTokenBalance} {toToken.symbol}
            </span>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex justify-between items-center">
              <Input
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="border-0 text-2xl font-semibold p-0 h-auto"
              />
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2"
                onClick={() => setIsToSelectorOpen(true)}
              >
                <img 
                  src={getTokenIcon(toToken.symbol, toToken)} 
                  alt={toToken.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-semibold">{toToken.symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              ${toAmountUSD}
            </div>
          </div>
        </div>

        {/* Swap Quote Info */}
        {swapQuote && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Price Impact</span>
              <span className="text-green-600">{swapQuote.priceImpact}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Minimum Received</span>
              <span>{swapQuote.minimumReceived} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Gas Estimate</span>
              <span>{swapQuote.gasEstimate} XP</span>
            </div>
          </div>
        )}

        {/* Cross-chain Bridge Warning */}
        {requiresCrossChainBridge && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Cross-chain transfer required
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {fromToken.symbol} and {toToken.symbol} are on different networks. Use our Bridge feature for cross-chain transfers.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100 dark:text-yellow-200 dark:border-yellow-600 dark:hover:bg-yellow-900/40"
                  onClick={() => window.location.href = '/bridge'}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Go to Bridge
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <div className="space-y-2">
          {!wallet.isConnected ? (
            <Button 
              className="w-full" 
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          ) : !isXphereNetwork ? (
            <Button 
              className="w-full" 
              onClick={switchToXphere}
              variant="outline"
            >
              Switch to Xphere Network
            </Button>
          ) : requiresCrossChainBridge ? (
            <Button className="w-full" disabled>
              Use Bridge for Cross-chain Transfer
            </Button>
          ) : isInsufficientBalance ? (
            <Button className="w-full" disabled>
              Insufficient Balance
            </Button>
          ) : !fromAmount || parseFloat(fromAmount) === 0 ? (
            <Button className="w-full" disabled>
              Enter Amount
            </Button>
          ) : swapQuoteMutation.isPending ? (
            <Button className="w-full" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Quote...
            </Button>
          ) : executeSwapMutation.isPending ? (
            <Button className="w-full" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Swapping...
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => executeSwapMutation.mutate()}
              disabled={!swapQuote}
            >
              Swap {fromToken.symbol} for {toToken.symbol}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Token Selectors */}
      <TokenSelector
        isOpen={isFromSelectorOpen}
        onClose={() => setIsFromSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
        selectedToken={fromToken}
      />
      
      <TokenSelector
        isOpen={isToSelectorOpen}
        onClose={() => setIsToSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
        selectedToken={toToken}
      />
    </Card>
  );
}