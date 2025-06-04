import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Settings, ChevronDown, Loader2 } from "lucide-react";
import { TokenSelector } from "./TokenSelector";
import { Token, SwapQuote } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTokenPrices, useTokenBalance } from "@/hooks/useTokenPrices";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function SwapInterface() {
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
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<"from" | "to">("from");
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  // Fetch real-time token prices
  const { data: tokenPrices, isLoading: pricesLoading } = useTokenPrices([
    fromToken.symbol, 
    toToken.symbol
  ]);

  // Fetch token balances - use wallet balance for XP, API for others
  const { data: fromBalance } = useTokenBalance(wallet.address, fromToken.symbol);
  const { data: toBalance } = useTokenBalance(wallet.address, toToken.symbol);
  
  // Use actual MetaMask balance for XP token
  const getTokenBalance = (token: Token) => {
    if (token.symbol === "XP") {
      return wallet.balance || "0";
    }
    if (token.symbol === fromToken.symbol) {
      return fromBalance?.balance || "0";
    }
    if (token.symbol === toToken.symbol) {
      return toBalance?.balance || "0";
    }
    return "0";
  };

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
      setQuote(data);
      setToAmount(data.outputAmount);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate swap quote",
        variant: "destructive",
      });
    }
  });

  // Get swap quote when amount or tokens change
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
      const timeoutId = setTimeout(() => {
        swapQuoteMutation.mutate({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount
        });
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setToAmount("");
      setQuote(null);
    }
  }, [fromAmount, fromToken.symbol, toToken.symbol]);

  const handleTokenSelect = (token: Token) => {
    if (selectorType === "from") {
      if (token.symbol === toToken.symbol) {
        // Swap tokens if selecting the same token
        setToToken(fromToken);
      }
      setFromToken(token);
    } else {
      if (token.symbol === fromToken.symbol) {
        // Swap tokens if selecting the same token
        setFromToken(toToken);
      }
      setToToken(token);
    }
    setIsTokenSelectorOpen(false);
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
    if (balance && parseFloat(balance) > 0) {
      setFromAmount(balance);
    }
  };

  const executeSwap = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
      return;
    }

    if (!isXphereNetwork) {
      await switchToXphere();
      return;
    }

    if (!quote || !fromAmount) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Swap Initiated",
      description: `Swapping ${fromAmount} ${fromToken.symbol} for ${quote.outputAmount} ${toToken.symbol}`,
    });

    // In a real implementation, this would interact with smart contracts
    // For now, we'll simulate the swap
    setTimeout(() => {
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${quote.outputAmount} ${toToken.symbol}`,
      });
      setFromAmount("");
      setToAmount("");
      setQuote(null);
      // Refetch balances
      queryClient.invalidateQueries({ queryKey: ["/api/token-balance"] });
    }, 2000);
  };

  const fromTokenPrice = tokenPrices?.[fromToken.symbol]?.price || 0;
  const toTokenPrice = tokenPrices?.[toToken.symbol]?.price || 0;
  const fromAmountUSD = fromAmount ? (parseFloat(fromAmount) * fromTokenPrice).toFixed(2) : "0.00";
  const toAmountUSD = toAmount ? (parseFloat(toAmount) * toTokenPrice).toFixed(2) : "0.00";

  const fromTokenBalance = getTokenBalance(fromToken);
  const toTokenBalance = getTokenBalance(toToken);
  const isInsufficientBalance = fromAmount && 
    parseFloat(fromAmount) > parseFloat(fromTokenBalance);

  // Token icon URLs from CoinMarketCap
  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/28447.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
    };
    return icons[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Swap
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
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
                  className="text-blue-500 hover:text-blue-600"
                >
                  MAX
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectorType("from");
                    setIsTokenSelectorOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <img
                    src={getTokenIcon(fromToken.symbol)}
                    alt={fromToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ${fromAmountUSD}
            </div>
          </div>
          {isInsufficientBalance && (
            <div className="text-sm text-red-500">
              Insufficient {fromToken.symbol} balance
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full p-2 border"
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
                onClick={() => {
                  setSelectorType("to");
                  setIsTokenSelectorOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <img
                  src={getTokenIcon(toToken.symbol)}
                  alt={toToken.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-semibold">{toToken.symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ${toAmountUSD}
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="space-y-2 text-sm">
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Impact</span>
              <span className={parseFloat(quote.priceImpact) > 5 ? "text-red-500" : ""}>
                {quote.priceImpact}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Received</span>
              <span>{quote.minimumReceived} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Fee</span>
              <span>{quote.gasEstimate} XP</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={executeSwap}
          disabled={
            !fromAmount || 
            !toAmount || 
            isInsufficientBalance || 
            swapQuoteMutation.isPending ||
            pricesLoading
          }
          className="w-full"
          size="lg"
        >
          {swapQuoteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {!wallet.isConnected
            ? "Connect Wallet"
            : !isXphereNetwork
            ? "Switch to Xphere Network"
            : isInsufficientBalance
            ? `Insufficient ${fromToken.symbol} Balance`
            : "Swap"}
        </Button>

        {/* Price Info */}
        {tokenPrices && !pricesLoading && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{fromToken.symbol} Price:</span>
              <span>${fromTokenPrice.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span>{toToken.symbol} Price:</span>
              <span>${toTokenPrice.toFixed(6)}</span>
            </div>
          </div>
        )}
      </CardContent>

      <TokenSelector
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
        selectedToken={selectorType === "from" ? fromToken : toToken}
      />
    </Card>
  );
}