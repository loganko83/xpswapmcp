import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpDown, ArrowLeftRight, Clock, CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SupportedNetwork {
  id: number;
  name: string;
  chainId: number;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  bridgeFee: string;
  confirmations: number;
  estimatedTime: string;
  logo: string;
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
  fromNetwork: SupportedNetwork;
  toNetwork: SupportedNetwork;
  token: BridgeToken;
  amount: string;
  fromTxHash: string;
  toTxHash: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  timestamp: number;
  estimatedCompletion: number;
  currentConfirmations: number;
  requiredConfirmations: number;
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
        
        <div className="space-y-6">
          {/* Transaction Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={bridgeData.fromNetwork.logo} alt={bridgeData.fromNetwork.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium">{bridgeData.fromNetwork.name}</div>
                  <div className="text-sm text-muted-foreground">From</div>
                </div>
              </div>
              <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-3">
                <img src={bridgeData.toNetwork.logo} alt={bridgeData.toNetwork.name} className="w-8 h-8 rounded-full" />
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

  // Fetch supported networks and tokens
  const { data: networks = [] } = useQuery({
    queryKey: ["/api/bridge/networks"],
    queryFn: async () => {
      const response = await fetch("/api/bridge/networks");
      if (!response.ok) throw new Error("Failed to fetch networks");
      return response.json();
    }
  });

  const { data: bridgeTokens = [] } = useQuery({
    queryKey: ["/api/bridge/tokens"],
    queryFn: async () => {
      const response = await fetch("/api/bridge/tokens");
      if (!response.ok) throw new Error("Failed to fetch bridge tokens");
      return response.json();
    }
  });

  const { data: bridgeHistory = [] } = useQuery({
    queryKey: ["/api/bridge/history", wallet.address],
    queryFn: async () => {
      if (!wallet.address) return [];
      const response = await fetch(`/api/bridge/history/${wallet.address}`);
      if (!response.ok) throw new Error("Failed to fetch bridge history");
      return response.json();
    },
    enabled: !!wallet.address
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

  // Bridge estimation mutation
  const estimateBridgeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/bridge/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromNetwork: fromNetwork?.chainId,
          toNetwork: toNetwork?.chainId,
          token: selectedToken?.symbol,
          amount,
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) throw new Error("Failed to estimate bridge");
      return response.json();
    }
  });

  // Execute bridge mutation
  const executeBridgeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/bridge/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromNetwork: fromNetwork?.chainId,
          toNetwork: toNetwork?.chainId,
          token: selectedToken?.symbol,
          amount,
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) throw new Error("Failed to execute bridge");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bridge Transaction Initiated",
        description: `Your cross-chain transfer has been initiated. Transaction ID: ${data.transactionId}`,
      });
      setAmount("");
      setConfirmationOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/bridge/history"] });
    },
    onError: (error) => {
      toast({
        title: "Bridge Failed",
        description: "Failed to execute cross-chain bridge. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const handleMaxClick = () => {
    // In a real implementation, this would fetch the actual token balance
    setAmount("100.0");
  };

  const handleBridge = async () => {
    if (!amount || !selectedToken || !fromNetwork || !toNetwork) return;
    
    try {
      const estimation = await estimateBridgeMutation.mutateAsync();
      setConfirmationOpen(true);
    } catch (error) {
      console.error("Bridge estimation failed:", error);
    }
  };

  const getAvailableTokens = () => {
    if (!fromNetwork || !toNetwork) return [];
    return bridgeTokens.filter((token: BridgeToken) => 
      token.networks.includes(fromNetwork.chainId) && 
      token.networks.includes(toNetwork.chainId)
    );
  };

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
    };
    return icons[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  const getNetworkLogo = (chainId: number) => {
    const logos: { [key: number]: string } = {
      1: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      56: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
      137: "https://cryptologos.cc/logos/polygon-matic-logo.png",
      43114: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
      20250217: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png"
    };
    return logos[chainId] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const availableTokens = getAvailableTokens();

  return (
    <div className="space-y-6">
      {/* Bridge Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            Cross-Chain Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Selection */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* From Network */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From Network</label>
                <Select value={fromNetwork?.chainId.toString()} onValueChange={(value) => {
                  const network = networks.find((n: SupportedNetwork) => n.chainId.toString() === value);
                  setFromNetwork(network);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network: SupportedNetwork) => (
                      <SelectItem key={network.chainId} value={network.chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <img src={getNetworkLogo(network.chainId)} alt={network.name} className="w-5 h-5 rounded-full" />
                          {network.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  onClick={handleSwapNetworks}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* To Network */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To Network</label>
                <Select value={toNetwork?.chainId.toString()} onValueChange={(value) => {
                  const network = networks.find((n: SupportedNetwork) => n.chainId.toString() === value);
                  setToNetwork(network);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network: SupportedNetwork) => (
                      <SelectItem key={network.chainId} value={network.chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <img src={getNetworkLogo(network.chainId)} alt={network.name} className="w-5 h-5 rounded-full" />
                          {network.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Token</label>
            <Select value={selectedToken?.symbol} onValueChange={(value) => {
              const token = availableTokens.find((t: BridgeToken) => t.symbol === value);
              setSelectedToken(token);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select token to bridge" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token: BridgeToken) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <img src={getTokenIcon(token.symbol)} alt={token.symbol} className="w-5 h-5 rounded-full" />
                      <span>{token.symbol}</span>
                      <span className="text-muted-foreground">- {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          {selectedToken && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Amount</span>
                <span>Balance: 0.000 {selectedToken.symbol}</span>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex justify-between items-center">
                  <Input
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-0 text-xl font-semibold p-0 h-auto"
                    type="number"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleMaxClick}>
                      MAX
                    </Button>
                    <div className="flex items-center gap-2">
                      <img 
                        src={getTokenIcon(selectedToken.symbol)} 
                        alt={selectedToken.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-semibold">{selectedToken.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bridge Details */}
          {fromNetwork && toNetwork && selectedToken && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bridge Fee</span>
                <span>{fromNetwork.bridgeFee} {selectedToken.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Time</span>
                <span>{fromNetwork.estimatedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confirmations Required</span>
                <span>{fromNetwork.confirmations}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-2">
            {!wallet.isConnected ? (
              <Button className="w-full" onClick={connectWallet}>
                Connect Wallet
              </Button>
            ) : !amount || !selectedToken ? (
              <Button className="w-full" disabled>
                Enter Amount
              </Button>
            ) : estimateBridgeMutation.isPending ? (
              <Button className="w-full" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Estimating...
              </Button>
            ) : (
              <Button className="w-full" onClick={handleBridge}>
                Bridge {selectedToken.symbol}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bridge History */}
      {wallet.isConnected && bridgeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bridge History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bridgeHistory.map((tx: BridgeTransaction) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <div>
                        <div className="font-medium">
                          {tx.amount} {tx.token.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.fromNetwork.name} → {tx.toNetwork.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={
                      tx.status === 'completed' ? 'default' :
                      tx.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {tx.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bridge Confirmation Dialog */}
      {confirmationOpen && fromNetwork && toNetwork && selectedToken && (
        <BridgeConfirmation
          isOpen={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          bridgeData={{
            fromNetwork,
            toNetwork,
            token: selectedToken,
            amount,
            fee: fromNetwork.bridgeFee,
            estimatedTime: fromNetwork.estimatedTime
          }}
          onConfirm={() => executeBridgeMutation.mutate()}
        />
      )}
    </div>
  );
}