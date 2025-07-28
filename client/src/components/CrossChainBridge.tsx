import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { lifiService } from "@/lib/lifiService";
import { WalletSelector } from "./WalletSelector";
import {
  BridgeConfirmation,
  BridgeForm,
  MultiChainBalances,
  BridgeHistory,
  BridgeServiceStatus,
  BridgeData,
  SupportedNetwork,
  MultiChainBalance,
  BridgeTransaction
} from "./bridge";

import { getApiUrl } from "@/lib/apiUrl";
export function CrossChainBridge() {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [bridgeData, setBridgeData] = useState<BridgeData | null>(null);
  const [lifiInitialized, setLifiInitialized] = useState(false);
  const [lifiError, setLifiError] = useState<string | null>(null);
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);

  // Initialize LI.FI service
  useEffect(() => {
    const initializeLiFi = async () => {
      try {
        console.log("Initializing LI.FI Bridge Service...");
        await lifiService.initialize();
        setLifiInitialized(true);
        console.log("LI.FI Bridge Service initialized successfully");
        
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
  const { data: networks = [] } = useQuery<SupportedNetwork[]>({
    queryKey: ["/api/bridge/supported-chains"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      // Mock network data for now
      return [
        {
          chainId: 20250217,
          name: "Xphere Chain",
          symbol: "XP",
          logo: "/api/placeholder/32/32",
          rpcUrl: "https://xphere-rpc.com",
          blockExplorer: "https://explorer.xphere.io",
          nativeCurrency: { name: "XP", symbol: "XP", decimals: 18 },
          isConnected: true
        },
        {
          chainId: 1,
          name: "Ethereum",
          symbol: "ETH",
          logo: "/api/placeholder/32/32",
          rpcUrl: "https://mainnet.infura.io",
          blockExplorer: "https://etherscan.io",
          nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
          isConnected: false
        },
        {
          chainId: 56,
          name: "BNB Smart Chain",
          symbol: "BNB",
          logo: "/api/placeholder/32/32",
          rpcUrl: "https://bsc-dataseed.binance.org",
          blockExplorer: "https://bscscan.com",
          nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
          isConnected: false
        }
      ];
    }
  });

  // Fetch multi-chain balances
  const { data: multiChainBalances = [] } = useQuery<MultiChainBalance[]>({
    queryKey: ["/api/multichain/balances", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 10000, // Refresh every 10 seconds
    queryFn: async () => {
      // Mock balance data for now
      return [
        {
          chainId: 20250217,
          chainName: "Xphere Chain",
          nativeSymbol: "XP",
          nativeBalance: "1000.5",
          tokens: [
            { symbol: "XPS", name: "XpSwap Token", balance: "5000.0", decimals: 18 },
            { symbol: "USDT", name: "Tether USD", balance: "100.0", decimals: 6 }
          ]
        }
      ];
    }
  });

  // Fetch bridge history
  const { data: bridgeHistory = [] } = useQuery<BridgeTransaction[]>({
    queryKey: ["/api/bridge/history", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 5000, // Refresh every 5 seconds
    queryFn: async () => {
      // Mock history data for now
      return [];
    }
  });

  // Bridge execution mutation
  const executeBridgeMutation = useMutation({
    mutationFn: async () => {
      if (!bridgeData || !wallet.address) {
        throw new Error('Missing required parameters');
      }

      const response = await fetch(getApiUrl("/api/bridge/execute"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromChainId: bridgeData.fromNetwork.chainId,
          toChainId: bridgeData.toNetwork.chainId,
          fromTokenAddress: '0x' + bridgeData.token.symbol.toLowerCase().padStart(40, '0'),
          toTokenAddress: '0x' + bridgeData.token.symbol.toLowerCase().padStart(40, '0'),
          amount: bridgeData.amount,
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
      setBridgeData(null);
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

  const handleBridgeQuote = (data: BridgeData) => {
    setBridgeData(data);
    setConfirmationOpen(true);
  };

  const handleConfirmBridge = () => {
    executeBridgeMutation.mutate();
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
              <Button 
                onClick={() => setIsWalletSelectorOpen(true)} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
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
          
          <BridgeServiceStatus
            isInitialized={lifiInitialized}
            error={lifiError}
            supportedChainsCount={lifiService.getSupportedChains().length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bridge Interface */}
          <div className="lg:col-span-2">
            <BridgeForm
              networks={networks}
              multiChainBalances={multiChainBalances}
              walletAddress={wallet.address}
              onBridgeQuote={handleBridgeQuote}
            />
          </div>

          {/* Multi-Chain Balances */}
          <div>
            <MultiChainBalances balances={multiChainBalances} />
          </div>
        </div>

        {/* Bridge History */}
        <BridgeHistory transactions={bridgeHistory} />
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

      {/* Wallet Selector */}
      <WalletSelector
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
    </div>
  );
}
