import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown, ArrowLeftRight, Clock, CheckCircle, AlertCircle, ExternalLink, Loader2, Globe, Coins, Repeat, Zap } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTokenIcon } from "@/lib/tokenUtils";
import { crossChainService } from "@/lib/crossChainService";
import { lifiService } from "@/lib/lifiService";

interface SupportedNetwork {
  chainId: number;
  name: string;
  symbol: string;
  logo: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  isConnected: boolean;
}

interface BridgeToken {
  symbol: string;
  name: string;
  networks: number[];
  minAmount: string;
  maxAmount: string;
  decimals: number;
  logo: string;
}

interface BridgeTransaction {
  id: string;
  fromChainId: number;
  toChainId: number;
  fromToken: { symbol: string; name: string };
  toToken: { symbol: string; name: string };
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fromTxHash?: string;
  toTxHash?: string;
  timestamp: number;
  estimatedCompletion: number;
  currentStep?: string;
  steps?: { name: string; status: string; txHash?: string }[];
}

interface BridgeConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  bridgeData: {
    fromNetwork: SupportedNetwork;
    toNetwork: SupportedNetwork;
    token: BridgeToken;
    amount: string;
    fee: string;
    estimatedTime: string;
  };
  onConfirm: () => void;
}

function BridgeConfirmation({ isOpen, onClose, bridgeData, onConfirm }: BridgeConfirmationProps) {
  const { data: tokenPrices } = useTokenPrices([bridgeData.token.symbol]);
  const tokenPrice = tokenPrices?.[bridgeData.token.symbol]?.price || 0;
  const totalValue = (parseFloat(bridgeData.amount) * tokenPrice).toFixed(2);
  const feeValue = (parseFloat(bridgeData.fee) * tokenPrice).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Bridge Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Networks */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium">{bridgeData.fromNetwork.name}</div>
                <div className="text-sm text-muted-foreground">From</div>
              </div>
            </div>
            
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium">{bridgeData.toNetwork.name}</div>
                <div className="text-sm text-muted-foreground">To</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Amount</span>
              <div className="text-right">
                <div className="font-medium">{bridgeData.amount} {bridgeData.token.symbol}</div>
                <div className="text-sm text-muted-foreground">${totalValue}</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>Bridge Fee</span>
              <div className="text-right">
                <div className="font-medium">{bridgeData.fee} {bridgeData.token.symbol}</div>
                <div className="text-sm text-muted-foreground">${feeValue}</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>You'll Receive</span>
              <div className="text-right">
                <div className="font-medium">
                  {(parseFloat(bridgeData.amount) - parseFloat(bridgeData.fee)).toFixed(6)} {bridgeData.token.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${((parseFloat(bridgeData.amount) - parseFloat(bridgeData.fee)) * tokenPrice).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>Estimated Time</span>
              <div className="font-medium">{bridgeData.estimatedTime}</div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-orange-700 dark:text-orange-300">Important Notice</div>
                <div className="text-orange-600 dark:text-orange-400 mt-1">
                  Cross-chain transactions are irreversible. Please verify all details before proceeding.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onConfirm}>
              Confirm Bridge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CrossChainBridge() {
  const { wallet, isXphereNetwork, switchToXphere, connectWallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fromNetwork, setFromNetwork] = useState<SupportedNetwork | null>(null);
  const [toNetwork, setToNetwork] = useState<SupportedNetwork | null>(null);
  const [selectedToken, setSelectedToken] = useState<BridgeToken | null>(null);
  const [amount, setAmount] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [bridgeData, setBridgeData] = useState<any>(null);
  const [lifiInitialized, setLifiInitialized] = useState(false);
  const [lifiError, setLifiError] = useState<string | null>(null);

  // Initialize LI.FI service
  useEffect(() => {
    const initializeLiFi = async () => {
      try {
        console.log("Initializing LI.FI Bridge Service...");
        await lifiService.initialize();
        setLifiInitialized(true);
        console.log("LI.FI Bridge Service initialized successfully");
        
        // Log supported chains
        const supportedChains = lifiService.getSupportedChains();
        console.log("LI.FI supported chains:", supportedChains.length);
        
        toast({
          title: "Bridge Service Active",
          description: `LI.FI Bridge initialized with ${supportedChains.length} supported networks`,
          variant: "default",
        });
      } catch (error) {
        console.error("Failed to initialize LI.FI service:", error);
        setLifiError("Failed to initialize bridge service");
        toast({
          title: "Bridge Service Error",
          description: "Unable to initialize cross-chain bridge. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeLiFi();
  }, [toast]);

  // Fetch supported networks
  const { data: networks = [] } = useQuery({
    queryKey: ["/api/bridge/supported-chains"],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch bridge tokens
  const { data: bridgeTokens = [] } = useQuery({
    queryKey: ["/api/bridge/tokens"],
    queryFn: async () => {
      // Real bridge tokens for different networks
      return [
        {
          symbol: 'USDT',
          name: 'Tether USD',
          networks: [1, 56, 137, 42161, 10],
          minAmount: '1',
          maxAmount: '100000',
          decimals: 6,
          logo: '/api/placeholder/32/32'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          networks: [1, 56, 137, 42161, 10],
          minAmount: '1',
          maxAmount: '100000',
          decimals: 6,
          logo: '/api/placeholder/32/32'
        },
        {
          symbol: 'WETH',
          name: 'Wrapped Ethereum',
          networks: [1, 56, 137, 42161, 10],
          minAmount: '0.001',
          maxAmount: '1000',
          decimals: 18,
          logo: '/api/placeholder/32/32'
        },
        {
          symbol: 'XPS',
          name: 'XpSwap Token',
          networks: [20250217],
          minAmount: '1',
          maxAmount: '1000000',
          decimals: 18,
          logo: '/api/placeholder/32/32'
        }
      ];
    }
  });

  // Fetch multi-chain balances
  const { data: multiChainBalances = [] } = useQuery({
    queryKey: ["/api/multichain/balances", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch bridge history
  const { data: bridgeHistory = [] } = useQuery({
    queryKey: ["/api/bridge/history", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Set default networks
  useEffect(() => {
    if (networks.length > 0 && !fromNetwork) {
      const xphereNetwork = networks.find((n: SupportedNetwork) => n.chainId === 20250217);
      const ethereumNetwork = networks.find((n: SupportedNetwork) => n.chainId === 1);
      
      setFromNetwork(xphereNetwork || networks[0]);
      setToNetwork(ethereumNetwork || networks[1]);
    }
  }, [networks, fromNetwork]);

  // Bridge quote mutation
  const bridgeQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!fromNetwork || !toNetwork || !selectedToken || !amount || !wallet.address) {
        throw new Error('Missing required parameters');
      }

      const response = await fetch("/api/bridge/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromChainId: fromNetwork.chainId,
          toChainId: toNetwork.chainId,
          fromTokenAddress: '0x' + selectedToken.symbol.toLowerCase().padStart(40, '0'),
          toTokenAddress: '0x' + selectedToken.symbol.toLowerCase().padStart(40, '0'),
          amount: amount,
          userAddress: wallet.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get bridge quote');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setBridgeData({
        fromNetwork: fromNetwork!,
        toNetwork: toNetwork!,
        token: selectedToken!,
        amount: amount,
        fee: data.fees.total,
        estimatedTime: `${Math.ceil(data.estimatedTime / 60)} minutes`
      });
      setConfirmationOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Quote Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Bridge execution mutation
  const executeBridgeMutation = useMutation({
    mutationFn: async () => {
      if (!fromNetwork || !toNetwork || !selectedToken || !amount || !wallet.address) {
        throw new Error('Missing required parameters');
      }

      const response = await fetch("/api/bridge/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromChainId: fromNetwork.chainId,
          toChainId: toNetwork.chainId,
          fromTokenAddress: '0x' + selectedToken.symbol.toLowerCase().padStart(40, '0'),
          toTokenAddress: '0x' + selectedToken.symbol.toLowerCase().padStart(40, '0'),
          amount: amount,
          userAddress: wallet.address,
          slippage: 0.5
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute bridge');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bridge Initiated",
        description: `Bridge transaction started. ID: ${data.id}`,
        variant: "default"
      });
      setConfirmationOpen(false);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/history"] });
    },
    onError: (error) => {
      toast({
        title: "Bridge Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get bridge quote
  const getBridgeQuote = () => {
    if (!fromNetwork || !toNetwork || !selectedToken || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    bridgeQuoteMutation.mutate();
  };

  // Execute bridge
  const handleConfirmBridge = () => {
    executeBridgeMutation.mutate();
  };

  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const handleMaxClick = () => {
    if (!fromNetwork || !selectedToken) return;
    
    const networkBalances = multiChainBalances.find((balance: any) => 
      balance.chainId === fromNetwork.chainId
    );
    
    if (!networkBalances) return;
    
    let tokenBalance = '0';
    if (selectedToken.symbol === networkBalances.nativeSymbol) {
      tokenBalance = networkBalances.nativeBalance || '0';
    } else {
      const tokenInfo = networkBalances.tokens?.find((t: any) => t.symbol === selectedToken.symbol);
      tokenBalance = tokenInfo?.balance || '0';
    }
    
    setAmount(tokenBalance);
  };

  const getAvailableTokens = () => {
    if (!fromNetwork || !wallet.address) return [];
    
    // Find balances for the selected network
    const networkBalances = multiChainBalances.find((balance: any) => 
      balance.chainId === fromNetwork.chainId
    );
    
    if (!networkBalances) return [];
    
    // Create token list from actual wallet balances
    const availableTokens: BridgeToken[] = [];
    
    // Add native token (ETH, BNB, XP, etc.) if balance > 0
    if (networkBalances.nativeBalance && parseFloat(networkBalances.nativeBalance) > 0) {
      availableTokens.push({
        symbol: networkBalances.nativeSymbol || 'ETH',
        name: networkBalances.nativeSymbol || 'Ethereum',
        networks: [fromNetwork.chainId],
        minAmount: '0.001',
        maxAmount: '1000',
        decimals: 18,
        logo: '/api/placeholder/32/32'
      });
    }
    
    // Add ERC-20 tokens with positive balances
    if (networkBalances.tokens) {
      networkBalances.tokens.forEach((token: any) => {
        if (parseFloat(token.balance) > 0) {
          availableTokens.push({
            symbol: token.symbol,
            name: token.name || token.symbol,
            networks: [fromNetwork.chainId],
            minAmount: '0.001',
            maxAmount: '1000000',
            decimals: token.decimals || 18,
            logo: '/api/placeholder/32/32'
          });
        }
      });
    }
    
    return availableTokens;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-gray-300">Connect your wallet to access cross-chain bridge functionality</p>
              </div>
              <Button onClick={connectWallet} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cross-Chain Bridge</h1>
          <p className="text-gray-300">Transfer tokens seamlessly across different blockchain networks</p>
          
          {/* Li.Fi Service Status */}
          <div className="mt-6 max-w-md mx-auto">
            <Card className={`${lifiInitialized ? 'border-green-500/30 bg-green-500/10' : lifiError ? 'border-red-500/30 bg-red-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${lifiInitialized ? 'bg-green-500' : lifiError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${lifiInitialized ? 'text-green-300' : lifiError ? 'text-red-300' : 'text-yellow-300'}`}>
                      {lifiInitialized ? 'Li.Fi Bridge Service: Connected' : lifiError ? 'Li.Fi Bridge Service: Disconnected' : 'Li.Fi Bridge Service: Connecting...'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {lifiInitialized ? `${lifiService.getSupportedChains().length} networks available` : 
                       lifiError ? 'Bridge service unavailable' : 'Connecting to bridge aggregator...'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bridge Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5" />
                  Bridge Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Network Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">From Network</label>
                    <Select value={fromNetwork?.chainId.toString()} onValueChange={(value) => {
                      const network = networks.find((n: SupportedNetwork) => n.chainId.toString() === value);
                      setFromNetwork(network || null);
                    }}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {networks.map((network: SupportedNetwork) => (
                          <SelectItem key={network.chainId} value={network.chainId.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-blue-500" />
                              {network.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">To Network</label>
                    <Select value={toNetwork?.chainId.toString()} onValueChange={(value) => {
                      const network = networks.find((n: SupportedNetwork) => n.chainId.toString() === value);
                      setToNetwork(network || null);
                    }}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {networks.map((network: SupportedNetwork) => (
                          <SelectItem key={network.chainId} value={network.chainId.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-green-500" />
                              {network.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Swap Networks Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapNetworks}
                    className="bg-black/20 border-white/10 text-white hover:bg-white/10"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Token Selection */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Select Token</label>
                  <Select value={selectedToken?.symbol} onValueChange={(value) => {
                    const token = getAvailableTokens().find((t: BridgeToken) => t.symbol === value);
                    setSelectedToken(token || null);
                  }}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTokens().length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          <p className="text-sm">No tokens with balance found</p>
                          <p className="text-xs mt-1">Make sure you have tokens in your wallet on the selected network</p>
                        </div>
                      ) : (
                        getAvailableTokens().map((token: BridgeToken) => {
                          // Find the actual balance for this token
                          const networkBalances = multiChainBalances.find((balance: any) => 
                            balance.chainId === fromNetwork?.chainId
                          );
                          
                          let tokenBalance = '0';
                          if (networkBalances) {
                            if (token.symbol === networkBalances.nativeSymbol) {
                              tokenBalance = networkBalances.nativeBalance || '0';
                            } else {
                              const tokenInfo = networkBalances.tokens?.find((t: any) => t.symbol === token.symbol);
                              tokenBalance = tokenInfo?.balance || '0';
                            }
                          }
                          
                          return (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <img src={getTokenIcon(token.symbol)} alt={token.symbol} className="w-4 h-4" />
                                  {token.symbol} - {token.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {parseFloat(tokenBalance).toFixed(4)}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="bg-black/20 border-white/10 text-white pr-16"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMaxClick}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                {/* Bridge Button */}
                <Button
                  onClick={getBridgeQuote}
                  disabled={!fromNetwork || !toNetwork || !selectedToken || !amount || bridgeQuoteMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {bridgeQuoteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Get Bridge Quote
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Chain Balances */}
          <div>
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Multi-Chain Balances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {multiChainBalances.map((balance: any) => (
                  <div key={balance.chainId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-300">{balance.chainName}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/10 text-white">
                        {parseFloat(balance.nativeBalance).toFixed(4)}
                      </Badge>
                    </div>
                    {balance.tokens.map((token: any) => (
                      <div key={token.symbol} className="flex items-center justify-between pl-6">
                        <div className="flex items-center gap-2">
                          <img src={getTokenIcon(token.symbol)} alt={token.symbol} className="w-3 h-3" />
                          <span className="text-xs text-gray-400">{token.symbol}</span>
                        </div>
                        <span className="text-xs text-gray-400">{parseFloat(token.balance).toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bridge History */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Bridge History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bridgeHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No bridge transactions found
                </div>
              ) : (
                bridgeHistory.map((tx: BridgeTransaction) => (
                  <div key={tx.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="text-sm font-medium text-white">
                          {tx.fromToken.symbol} → {tx.toToken.symbol}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">{tx.amount} {tx.fromToken.symbol}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className={getStatusColor(tx.status)}>{tx.status.toUpperCase()}</span>
                      {tx.fromTxHash && (
                        <Button variant="ghost" size="sm" className="text-xs text-purple-400 hover:text-purple-300">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bridge Confirmation Dialog */}
      {bridgeData && (
        <BridgeConfirmation
          isOpen={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          bridgeData={bridgeData}
          onConfirm={handleConfirmBridge}
        />
      )}
    </div>
  );
}