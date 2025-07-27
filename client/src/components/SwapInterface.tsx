import { useState, useEffect, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { TokenSelector } from "./TokenSelector";
import { WalletSelector } from "./WalletSelector";
import { SwapPanel } from "./Swap/SwapPanel";
import { SwapSettings } from "./Swap/SwapSettings";
import { SwapActions } from "./Swap/SwapActions";
import { SwapPriceInfo } from "./Swap/SwapPriceInfo";
import { Token, SwapQuote } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/apiUrl";
import { useToast } from "@/hooks/use-toast";

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface SwapInterfaceProps {
  onTokenChange?: (fromToken: Token | null, toToken: Token | null, fromAmount: string) => void;
}

export function SwapInterface({ onTokenChange }: SwapInterfaceProps = {}) {
  const { wallet, isXphereNetwork, switchToXphere, connectWallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
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
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  // Fetch real-time token prices
  const { data: tokenPrices, isLoading: pricesLoading } = useTokenPrices([
    fromToken.symbol, 
    toToken.symbol
  ]);

  // Token balance queries using the new hook
  const { balance: fromTokenBalanceData } = useTokenBalance(fromToken.symbol);
  const { balance: toTokenBalanceData } = useTokenBalance(toToken.symbol);

  // Format token balances
  const fromTokenBalance = wallet.isConnected ? parseFloat(fromTokenBalanceData || "0").toFixed(4) : "0.0000";
  const toTokenBalanceAmount = wallet.isConnected ? parseFloat(toTokenBalanceData || "0").toFixed(4) : "0.0000";

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

  // Swap quote mutation
  const swapQuoteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(getApiUrl('api/swap/quote'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount,
          slippage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get swap quote');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSwapQuote({
        inputAmount: data.inputAmount,
        outputAmount: data.outputAmount,
        priceImpact: data.priceImpact,
        minimumReceived: data.minimumReceived,
        route: data.route,
        gasEstimate: data.gasEstimate
      });
      setToAmount(data.outputAmount);
    },
    onError: (error) => {
      console.error('Quote error:', error);
      toast({
        title: "Error getting quote",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Execute swap mutation
  const executeSwapMutation = useMutation({
    mutationFn: async () => {
      if (!swapQuote) throw new Error('No quote available');
      
      const response = await fetch(getApiUrl('api/swap/execute'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount,
          slippage,
          userAddress: wallet.address,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute swap');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Swap successful!",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      
      setFromAmount("");
      setToAmount("");
      setSwapQuote(null);
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/blockchain/balance/${wallet.address}`] 
      });
    },
    onError: (error) => {
      console.error('Swap error:', error);
      toast({
        title: "Swap failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Get quote when amount changes
  const debouncedQuote = useCallback(
    debounce(() => {
      if (fromAmount && parseFloat(fromAmount) > 0 && wallet.isConnected && isXphereNetwork) {
        swapQuoteMutation.mutate();
      }
    }, 500),
    [fromAmount, fromToken.symbol, toToken.symbol, slippage, wallet.isConnected, isXphereNetwork]
  );

  useEffect(() => {
    debouncedQuote();
  }, [debouncedQuote]);

  // Utility functions
  const isCrossChainSwap = () => {
    const fromIsXphere = fromToken.chainId === 20250217;
    const toIsXphere = toToken.chainId === 20250217;
    const fromIsCrossChain = fromToken.chainId !== 20250217;
    const toIsCrossChain = toToken.chainId !== 20250217;
    
    return (fromIsXphere && toIsCrossChain) || (fromIsCrossChain && toIsXphere) || 
           (fromIsCrossChain && toIsCrossChain);
  };

  const handleTokenSelect = (token: Token) => {
    if (isFromSelectorOpen) {
      if (token.id === toToken.id) {
        setToToken(fromToken);
      }
      setFromToken(token);
      setIsFromSelectorOpen(false);
    } else if (isToSelectorOpen) {
      if (token.id === fromToken.id) {
        setFromToken(toToken);
      }
      setToToken(token);
      setIsToSelectorOpen(false);
    }
  };

  const handleSwapTokens = () => {
    const tempFromToken = fromToken;
    const tempFromAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempFromToken);
    setFromAmount(toAmount);
    setToAmount(tempFromAmount);
    setSwapQuote(null);
  };

  const handleMaxClick = () => {
    const balance = parseFloat(fromTokenBalance);
    if (balance > 0) {
      const maxAmount = Math.max(0, balance - 0.01).toString();
      setFromAmount(maxAmount);
    }
  };

  // Price calculations
  const fromTokenPrice = tokenPrices?.[fromToken.symbol]?.price || 0;
  const toTokenPrice = tokenPrices?.[toToken.symbol]?.price || 0;
  const fromAmountUSD = fromAmount ? (parseFloat(fromAmount) * fromTokenPrice).toFixed(2) : "0.00";
  const toAmountUSD = toAmount ? (parseFloat(toAmount) * toTokenPrice).toFixed(2) : "0.00";

  // Validation
  const isInsufficientBalance = fromAmount && 
    parseFloat(fromAmount) > parseFloat(fromTokenBalance);
  const requiresCrossChainBridge = isCrossChainSwap();

  return (
    <div className="space-y-6">
      {/* Main Swap Panel */}
      <SwapPanel
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromTokenBalance={fromTokenBalance}
        toTokenBalanceAmount={toTokenBalanceAmount}
        fromAmountUSD={fromAmountUSD}
        toAmountUSD={toAmountUSD}
        pricesLoading={pricesLoading}
        onFromAmountChange={setFromAmount}
        onToAmountChange={setToAmount}
        onSwapTokens={handleSwapTokens}
        onOpenFromSelector={() => setIsFromSelectorOpen(true)}
        onOpenToSelector={() => setIsToSelectorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onMaxClick={handleMaxClick}
        walletConnected={wallet.isConnected}
      />

      {/* Swap Actions */}
      <SwapActions
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        swapQuote={swapQuote}
        walletConnected={wallet.isConnected}
        isXphereNetwork={isXphereNetwork}
        requiresCrossChainBridge={requiresCrossChainBridge}
        isInsufficientBalance={isInsufficientBalance}
        isGettingQuote={swapQuoteMutation.isPending}
        isSwapping={executeSwapMutation.isPending}
        slippage={slippage}
        onConnectWallet={() => setIsWalletSelectorOpen(true)}
        onSwitchNetwork={switchToXphere}
        onExecuteSwap={() => executeSwapMutation.mutate()}
      />

      {/* Price Information */}
      <SwapPriceInfo
        fromToken={fromToken}
        toToken={toToken}
        fromTokenPrice={fromTokenPrice}
        toTokenPrice={toTokenPrice}
      />

      {/* Modals and Selectors */}
      <SwapSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        slippage={slippage}
        customSlippage={customSlippage}
        onSlippageChange={setSlippage}
        onCustomSlippageChange={setCustomSlippage}
      />

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

      <WalletSelector
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
    </div>
  );
}
