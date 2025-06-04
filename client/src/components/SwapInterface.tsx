import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Settings, ChevronDown } from "lucide-react";
import { TokenSelector } from "./TokenSelector";
import { Token, SwapQuote } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";
import { useWeb3 } from "@/hooks/useWeb3";

export function SwapInterface() {
  const { wallet, isXphereNetwork, switchToXphere } = useWeb3();
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
  const [isSwapping, setIsSwapping] = useState(false);

  const openTokenSelector = (type: "from" | "to") => {
    setSelectorType(type);
    setIsTokenSelectorOpen(true);
  };

  const handleTokenSelect = (token: Token) => {
    if (selectorType === "from") {
      setFromToken(token);
    } else {
      setToToken(token);
    }
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const calculateQuote = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount("");
      setQuote(null);
      return;
    }

    // Mock price calculation
    const exchangeRate = fromToken.symbol === "XP" ? 0.0842 : 1 / 0.0842;
    const outputAmount = (parseFloat(amount) * exchangeRate).toFixed(6);
    setToAmount(outputAmount);

    // Mock quote
    setQuote({
      inputAmount: amount,
      outputAmount,
      priceImpact: "0.1",
      minimumReceived: (parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(6),
      route: [fromToken.symbol, toToken.symbol],
      gasEstimate: "0.02",
    });
  };

  useEffect(() => {
    if (fromAmount) {
      calculateQuote(fromAmount);
    }
  }, [fromAmount, fromToken, toToken, slippage]);

  const handleSwap = async () => {
    if (!wallet.isConnected) {
      return;
    }

    if (!isXphereNetwork) {
      try {
        await switchToXphere();
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    setIsSwapping(true);
    try {
      // Mock swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Swap completed");
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setIsSwapping(false);
    }
  };

  const getSwapButtonText = () => {
    if (!wallet.isConnected) return "Connect Wallet";
    if (!isXphereNetwork) return "Switch to Xphere Network";
    if (!fromAmount || parseFloat(fromAmount) <= 0) return "Enter Amount";
    if (isSwapping) return "Swapping...";
    return "Swap";
  };

  const isSwapDisabled = () => {
    return (
      isSwapping ||
      !fromAmount ||
      parseFloat(fromAmount) <= 0 ||
      (!wallet.isConnected && getSwapButtonText() !== "Connect Wallet")
    );
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Swap Tokens</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">From</span>
              <span className="text-muted-foreground">
                Balance: {wallet.isConnected ? "1,234.56" : "0.00"}
              </span>
            </div>
            <div className="relative bg-muted/50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-semibold p-0 focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  onClick={() => openTokenSelector("from")}
                  className="h-auto p-2 space-x-2"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔶</span>
                  </div>
                  <span className="font-semibold">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                ≈ ${fromAmount ? (parseFloat(fromAmount) * 0.0842).toFixed(2) : "0.00"}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapTokens}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white hover:text-white hover:scale-110 transition-all"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">To</span>
              <span className="text-muted-foreground">
                Balance: {wallet.isConnected ? "0.00" : "0.00"}
              </span>
            </div>
            <div className="relative bg-muted/50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="border-0 bg-transparent text-2xl font-semibold p-0 focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  onClick={() => openTokenSelector("to")}
                  className="h-auto p-2 space-x-2"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">💚</span>
                  </div>
                  <span className="font-semibold">{toToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                ≈ ${toAmount || "0.00"}
              </div>
            </div>
          </div>

          {/* Swap Details */}
          {quote && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-medium">
                  1 {fromToken.symbol} = {(parseFloat(quote.outputAmount) / parseFloat(quote.inputAmount)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <Badge variant="secondary" className="text-green-600">
                  {quote.priceImpact}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="font-medium">{slippage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <Badge variant="outline" className="text-green-600">
                  ~${quote.gasEstimate}
                </Badge>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={handleSwap}
            disabled={isSwapDisabled()}
          >
            {getSwapButtonText()}
          </Button>
        </CardContent>
      </Card>

      <TokenSelector
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
        selectedToken={selectorType === "from" ? fromToken : toToken}
      />
    </>
  );
}
