import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpDown, 
  Network, 
  Zap, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Plus,
  CheckCircle
} from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { SUPPORTED_NETWORKS, lifiService, BridgeQuote } from "@/lib/lifiService";
import { switchToNetwork, addNetworkToMetaMask, getNetworkByChainId, checkNetworkStatus } from "@/lib/networkUtils";
import { useToast } from "@/hooks/use-toast";
import { Token } from "@/types";
import { getApiUrl } from '@/lib/config';

interface NetworkOption {
  chainId: number;
  name: string;
  symbol: string;
  logo: string;
  isConnected: boolean;
}

export function MultiNetworkSwapInterface() {
  const { wallet, switchToXphere } = useWeb3Context();
  const { toast } = useToast();
  const [selectedFromNetwork, setSelectedFromNetwork] = useState<number>(wallet.chainId || 20250217);
  const [selectedToNetwork, setSelectedToNetwork] = useState<number>(1); // Ethereum
  const [fromAmount, setFromAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [bridgeQuote, setBridgeQuote] = useState<BridgeQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<Record<string, boolean>>({});

  const networks: NetworkOption[] = [
    {
      chainId: 20250217,
      name: "Xphere",
      symbol: "XP",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
      isConnected: wallet.chainId === 20250217,
    },
    {
      chainId: 1,
      name: "Ethereum",
      symbol: "ETH",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      isConnected: wallet.chainId === 1,
    },
    {
      chainId: 56,
      name: "BNB Smart Chain",
      symbol: "BNB",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      isConnected: wallet.chainId === 56,
    },
    {
      chainId: 137,
      name: "Polygon",
      symbol: "MATIC",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
      isConnected: wallet.chainId === 137,
    },
    {
      chainId: 42161,
      name: "Arbitrum",
      symbol: "ETH",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
      isConnected: wallet.chainId === 42161,
    },
  ];

  const supportedTokens = ["ETH", "USDT", "USDC", "BNB", "MATIC"];

  useEffect(() => {
    const initializeService = async () => {
      try {
        await lifiService.initialize();
        
        // Test network connectivity for Ethereum and BSC
        const ethStatus = await testNetworkConnectivity(1);
        const bscStatus = await testNetworkConnectivity(56);
        const polygonStatus = await testNetworkConnectivity(137);
        
        setNetworkStatus({
          ethereum: ethStatus,
          bsc: bscStatus,
          polygon: polygonStatus,
        });
      } catch (error) {
        console.error("Failed to initialize multi-network service:", error);
      }
    };
    
    initializeService();
  }, []);

  // Test network connectivity
  const testNetworkConnectivity = async (chainId: number): Promise<boolean> => {
    const network = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
    if (!network || !network.rpcUrls || network.rpcUrls.length === 0) return false;

    try {
      const response = await fetch(network.rpcUrls[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      const data = await response.json();
      return !!(data.result && response.ok);
    } catch (error) {
      console.error(`Network connectivity test failed for chain ${chainId}:`, error);
      return false;
    }
  };

  // Add network to MetaMask
  const addNetworkToWallet = async (chainId: number) => {
    const network = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
    if (!network || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: network.name,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: [network.blockExplorer],
        }],
      });
    } catch (error) {
      console.error('Failed to add network:', error);
    }
  };

  useEffect(() => {
    if (wallet.chainId && wallet.chainId !== selectedFromNetwork) {
      setSelectedFromNetwork(wallet.chainId);
    }
  }, [wallet.chainId]);

  const handleGetQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (selectedFromNetwork === selectedToNetwork) {
      setError("Please select different networks for source and destination");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const quote = await lifiService.getBestRoute(
        selectedFromNetwork,
        selectedToNetwork,
        selectedToken,
        (parseFloat(fromAmount) * Math.pow(10, 18)).toString()
      );

      if (quote) {
        setBridgeQuote(quote);
      } else {
        setError("No bridge route found for this token pair");
      }
    } catch (err: any) {
      setError(err.message || "Failed to get bridge quote");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNetworkSwitch = async (chainId: number) => {
    if (!wallet.isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      if (chainId === 20250217) {
        await switchToXphere();
      } else {
        // Switch to other networks using MetaMask
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      }
    } catch (err: any) {
      setError(`Failed to switch network: ${err.message}`);
    }
  };

  const getNetworkById = (chainId: number) => {
    return networks.find(n => n.chainId === chainId);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Network className="w-5 h-5" />
          Multi-Network Trading
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Cross-Chain Enabled
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Trade assets across multiple blockchains with automatic bridging
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Network Status Indicator */}
        <div className="bg-white/60 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-green-800">Network Status</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    networkStatus[key.toLowerCase()] ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs font-medium">{network.name}</span>
                </div>
                {!networkStatus[key.toLowerCase()] && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addNetworkToWallet(network.chainId)}
                    className="text-xs p-1 h-6"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            🟢 Connected • ⚪ Disconnected • Click <Plus className="w-3 h-3 inline" /> to add network to MetaMask
          </p>
        </div>

        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="swap">Cross-Chain Swap</TabsTrigger>
            <TabsTrigger value="bridge">Bridge Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="space-y-4">
            {/* Network Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Network</label>
                <Select 
                  value={selectedFromNetwork.toString()} 
                  onValueChange={(value) => setSelectedFromNetwork(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img 
                          src={getNetworkById(selectedFromNetwork)?.logo} 
                          alt="" 
                          className="w-5 h-5 rounded-full"
                        />
                        {getNetworkById(selectedFromNetwork)?.name}
                        {getNetworkById(selectedFromNetwork)?.isConnected && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Connected
                          </Badge>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.chainId} value={network.chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <img src={network.logo} alt="" className="w-5 h-5 rounded-full" />
                          {network.name}
                          {network.isConnected && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Network</label>
                <Select 
                  value={selectedToNetwork.toString()} 
                  onValueChange={(value) => setSelectedToNetwork(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <img 
                          src={getNetworkById(selectedToNetwork)?.logo} 
                          alt="" 
                          className="w-5 h-5 rounded-full"
                        />
                        {getNetworkById(selectedToNetwork)?.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {networks.filter(n => n.chainId !== selectedFromNetwork).map((network) => (
                      <SelectItem key={network.chainId} value={network.chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <img src={network.logo} alt="" className="w-5 h-5 rounded-full" />
                          {network.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Token and Amount Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Token</label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedTokens.map((token) => (
                      <SelectItem key={token} value={token}>
                        {token}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleGetQuote}
              disabled={isLoading || !wallet.isConnected}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Getting Quote...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Get Cross-Chain Quote
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Quote Display */}
            {bridgeQuote && (
              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    Bridge Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">You Send:</span>
                      <div className="font-medium">
                        {parseFloat(bridgeQuote.fromAmount) / Math.pow(10, 18)} {selectedToken}
                      </div>
                      <div className="text-xs text-gray-500">
                        on {getNetworkById(bridgeQuote.fromChain)?.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">You Receive:</span>
                      <div className="font-medium">
                        {parseFloat(bridgeQuote.toAmount) / Math.pow(10, 18)} {selectedToken}
                      </div>
                      <div className="text-xs text-gray-500">
                        on {getNetworkById(bridgeQuote.toChain)?.name}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <div className="font-medium">{formatTime(bridgeQuote.estimatedTime)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Bridge Fee:</span>
                      <div className="font-medium">
                        {parseFloat(bridgeQuote.bridgeFee) / Math.pow(10, 18)} {selectedToken}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Provider:</span>
                      <div className="font-medium">{bridgeQuote.provider}</div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Execute Bridge Transaction
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bridge" className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Network className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <div className="space-y-2">
                  <p className="font-medium">Bridge Integration Status</p>
                  <p className="text-sm">
                    LI.FI Bridge SDK integrated - supports 40+ blockchains including:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {networks.map((network) => (
                      <Badge key={network.chainId} variant="outline" className="text-xs">
                        {network.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {networks.map((network) => (
                <Card key={network.chainId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={network.logo} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-medium">{network.name}</div>
                        <div className="text-sm text-gray-500">{network.symbol}</div>
                      </div>
                    </div>
                    {network.isConnected ? (
                      <Badge className="bg-green-100 text-green-700">Connected</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleNetworkSwitch(network.chainId)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}