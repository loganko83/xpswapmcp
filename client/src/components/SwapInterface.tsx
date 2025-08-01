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
  const lastQuoteRequest = useRef<{ from: string; to: string; amount: string; } | null>(null);

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
  }, [fromToken.id, toToken.id, fromAmount, onTokenChange]);

  // Swap quote mutation with better error handling
  const swapQuoteMutation = useMutation({
    mutationFn: async ({ amount, from, to, currentSlippage }: {
      amount: string;
      from: string;
      to: string;
      currentSlippage: number;
    }) => {
      try {
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
      } catch (error) {
        console.error('❌ Network error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('📊 Setting quote data:', data);
      setSwapQuote({
        inputAmount: data.inputAmount || "0",
        outputAmount: data.outputAmount || "0", 
        priceImpact: data.priceImpact || 0,
        minimumReceived: data.minimumReceived || "0",
        route: data.route || [],
        gasEstimate: data.gasEstimate || "0"
      });
      setToAmount(data.outputAmount || "0");
    },
    onError: (error: Error) => {
      console.error('❌ Quote error:', error);
      setSwapQuote(null);
      setToAmount("0");
      
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

  // Improved fetch quote function
  const requestQuote = useCallback((amount: string, fromSymbol: string, toSymbol: string, currentSlippage: number) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Validate inputs
    if (!amount || amount === "0" || parseFloat(amount) <= 0) {
      setSwapQuote(null);
      setToAmount("0");
      return;
    }

    if (!fromSymbol || !toSymbol || fromSymbol === toSymbol) {
      setSwapQuote(null);
      setToAmount("0");
      return;
    }

    // Check if this is the same request as last time
    const isSameRequest = lastQuoteRequest.current && 
      lastQuoteRequest.current.from === fromSymbol &&
      lastQuoteRequest.current.to === toSymbol &&
      lastQuoteRequest.current.amount === amount;

    if (isSameRequest && !swapQuoteMutation.isError) {
      return; // Skip duplicate request
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      lastQuoteRequest.current = { from: fromSymbol, to: toSymbol, amount };
      swapQuoteMutation.mutate({
        amount,
        from: fromSymbol,
        to: toSymbol,
        currentSlippage
      });
    }, 500);
  }, [swapQuoteMutation]);

  // Handle amount change with better validation
  const handleFromAmountChange = useCallback((value: string) => {
    // Allow empty string
    if (value === "") {
      setFromAmount("");
      setToAmount("0");
      setSwapQuote(null);
      lastQuoteRequest.current = null;
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
    if (numericValue && parseFloat(numericValue) > 0 && fromToken && toToken && fromToken.symbol !== toToken.symbol) {
      requestQuote(numericValue, fromToken.symbol, toToken.symbol, slippage);
    } else {
      setToAmount("0");
      setSwapQuote(null);
    }
  }, [fromToken, toToken, slippage, requestQuote]);

  // Effect to handle slippage changes - only when there's a valid amount
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken && fromToken.symbol !== toToken.symbol) {
      // Force a new quote request when slippage changes
      lastQuoteRequest.current = null;
      requestQuote(fromAmount, fromToken.symbol, toToken.symbol, slippage);
    }
  }, [slippage]); // Removed dependencies to avoid circular updates

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
      lastQuoteRequest.current = null;
      
      // Fetch new quote if amount exists - no delay needed
      if (fromAmount && parseFloat(fromAmount) > 0) {
        requestQuote(fromAmount, token.symbol, toToken.symbol, slippage);
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
      lastQuoteRequest.current = null;
      
      // Fetch new quote if amount exists - no delay needed
      if (fromAmount && parseFloat(fromAmount) > 0) {
        requestQuote(fromAmount, fromToken.symbol, token.symbol, slippage);
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
    lastQuoteRequest.current = null;
    
    // Fetch new quote after swap - no delay needed
    if (toAmount && parseFloat(toAmount) > 0) {
      requestQuote(toAmount, toToken.symbol, tempFromToken.symbol, slippage);
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