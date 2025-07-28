import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Repeat, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { NetworkSelector } from "./NetworkSelector";
import { TokenSelector } from "./TokenSelector";
import { SupportedNetwork, BridgeToken, MultiChainBalance, BridgeData } from "./types";

import { getApiUrl } from "@/lib/apiUrl";
interface BridgeFormProps {
  networks: SupportedNetwork[];
  multiChainBalances: MultiChainBalance[];
  walletAddress?: string;
  onBridgeQuote: (data: BridgeData) => void;
}

export function BridgeForm({ 
  networks, 
  multiChainBalances, 
  walletAddress,
  onBridgeQuote 
}: BridgeFormProps) {
  const { toast } = useToast();
  const [fromNetwork, setFromNetwork] = useState<SupportedNetwork | null>(null);
  const [toNetwork, setToNetwork] = useState<SupportedNetwork | null>(null);
  const [selectedToken, setSelectedToken] = useState<BridgeToken | null>(null);
  const [amount, setAmount] = useState("");

  // Set default networks when networks are loaded
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
      if (!fromNetwork || !toNetwork || !selectedToken || !amount || !walletAddress) {
        throw new Error('Missing required parameters');
      }

      const response = await fetch(getApiUrl("/api/bridge/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromChainId: fromNetwork.chainId,
          toChainId: toNetwork.chainId,
          fromTokenAddress: '0x' + selectedToken.symbol.toLowerCase().padStart(40, '0'),
          toTokenAddress: '0x' + selectedToken.symbol.toLowerCase().padStart(40, '0'),
          amount: amount,
          userAddress: walletAddress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get bridge quote');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const bridgeData: BridgeData = {
        fromNetwork: fromNetwork!,
        toNetwork: toNetwork!,
        token: selectedToken!,
        amount: amount,
        fee: data.fees.total,
        estimatedTime: `${Math.ceil(data.estimatedTime / 60)} minutes`
      };
      onBridgeQuote(bridgeData);
    },
    onError: (error) => {
      toast({
        title: "Quote Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const handleMaxClick = () => {
    if (!fromNetwork || !selectedToken) return;
    
    const networkBalances = multiChainBalances.find((balance: MultiChainBalance) => 
      balance.chainId === fromNetwork.chainId
    );
    
    if (!networkBalances) return;
    
    let tokenBalance = '0';
    if (selectedToken.symbol === networkBalances.nativeSymbol) {
      tokenBalance = networkBalances.nativeBalance || '0';
    } else {
      const tokenInfo = networkBalances.tokens?.find((t) => t.symbol === selectedToken.symbol);
      tokenBalance = tokenInfo?.balance || '0';
    }
    
    setAmount(tokenBalance);
  };

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

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          Bridge Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <NetworkSelector
          networks={networks}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
          onFromNetworkChange={setFromNetwork}
          onToNetworkChange={setToNetwork}
          onSwapNetworks={handleSwapNetworks}
        />

        <TokenSelector
          selectedToken={selectedToken}
          fromNetwork={fromNetwork}
          multiChainBalances={multiChainBalances}
          walletAddress={walletAddress}
          onTokenChange={setSelectedToken}
        />

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
  );
}
