import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

  // Refs for debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingQuoteRef = useRef(false);

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
    mutationFn: async ({ amount, from, to, currentSlippage }: {
      amount: string;
      from: string;
      to: string;
      currentSlippage: number;
    }) => {
      console.log('🚀 Fetching swap quote...', { 
        from, 
        to, 
        amount,
        slippage: currentSlippage
      });
      
      const response = await fetch(getApiUrl('api/swap/quote'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          amount,
          slippage: currentSlippage,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Quote API error:', data);
        throw new Error(data.error || 'Failed to get swap quote');
      }
      
      console.log('✅ Quote received:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('📊 Setting quote data:', data);
      setSwapQuote({
        inputAmount: data.inputAmount,
        outputAmount: data.outputAmount,
        priceImpact: data.priceImpact,
        minimumReceived: data.minimumReceived,
        route: data.route,
        gasEstimate: data.gasEstimate
      });
      setToAmount(data.outputAmount);
      isLoadingQuoteRef.current = false;
    },
    onError: (error: Error) => {
      console.error('❌ Quote error:', error);
      setSwapQuote(null);
      setToAmount("");
      isLoadingQuoteRef.current = false;
      
      // Only show toast for actual errors, not for normal validation issues
      if (!error.message.includes('Invalid amount') && !error.message.includes('Same token')) {
        toast({
          title: "스왑 견적 오류",
          description: error.message || "다시 시도해주세요",
          variant: "destructive",
        });
      }
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
          from: fromToken.symbol,
          to: toToken.symbol,
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

  // Stable fetch quote function with proper validation
  const fetchQuote = useCallback(async (amount: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Validate inputs
    if (!amount || amount === "0" || parseFloat(amount) <= 0) {
      setSwapQuote(null);
      setToAmount("");
      return;
    }

    if (!fromToken || !toToken || fromToken.symbol === toToken.symbol) {
      setSwapQuote(null);
      setToAmount("");
      return;
    }

    // Check if we're already loading a quote
    if (isLoadingQuoteRef.current) {
      return;
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      isLoadingQuoteRef.current = true;
      swapQuoteMutation.mutate({
        amount,
        from: fromToken.symbol,
        to: toToken.symbol,
        currentSlippage: slippage
      });
    }, 500);
  }, [fromToken?.symbol, toToken?.symbol, slippage, swapQuoteMutation]);

  // Handle amount change with better validation
  const handleFromAmountChange = useCallback((value: string) => {
    // Allow empty string
    if (value === "") {
      setFromAmount("");
      setToAmount("");
      setSwapQuote(null);
      return;
    }

    // Validate numeric input
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 8
    if (parts[1] && parts[1].length > 8) {
      return;
    }

    setFromAmount(numericValue);
    
    // Fetch quote for valid amounts
    if (numericValue && parseFloat(numericValue) > 0) {
      fetchQuote(numericValue);
    } else {
      setToAmount("");
      setSwapQuote(null);
    }
  }, [fetchQuote]);

  // Effect to handle slippage changes
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken && fromToken.symbol !== toToken.symbol) {
      fetchQuote(fromAmount);
    }
  }, [slippage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
      
      // Clear quote and to amount when changing tokens
      setSwapQuote(null);
      setToAmount("");
      
      // Fetch new quote if amount exists
      if (fromAmount && parseFloat(fromAmount) > 0) {
        setTimeout(() => fetchQuote(fromAmount), 100);
      }
    } else if (isToSelectorOpen) {
      if (token.id === fromToken.id) {
        setFromToken(toToken);
      }
      setToToken(token);
      setIsToSelectorOpen(false);
      
      // Clear quote and to amount when changing tokens
      setSwapQuote(null);
      setToAmount("");
      
      // Fetch new quote if amount exists
      if (fromAmount && parseFloat(fromAmount) > 0) {
        setTimeout(() => fetchQuote(fromAmount), 100);
      }
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
    
    // Fetch new quote after swap
    if (toAmount && parseFloat(toAmount) > 0) {
      setTimeout(() => fetchQuote(toAmount), 100);
    }
  };

  const handleMaxClick = () => {
    const balance = parseFloat(fromTokenBalance);
    if (balance > 0) {
      const maxAmount = Math.max(0, balance - 0.01).toString();
      handleFromAmountChange(maxAmount);
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
        onFromAmountChange={handleFromAmountChange}
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
        isGettingQuote={swapQuoteMutation.isPending || isLoadingQuoteRef.current}
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
