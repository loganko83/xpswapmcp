import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, AlertTriangle, ExternalLink, RefreshCw, Wallet } from "lucide-react";
import { Token } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";
import { getApiUrl } from "@/lib/apiUrl";
import { getTokenIcon, formatTokenAmount } from "@/lib/tokenUtils";
import { useQuery } from "@tanstack/react-query";
import { switchNetwork } from "@/lib/web3";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useWeb3Context } from "@/contexts/Web3Context";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: Token;
}

// Component to display token balance
function TokenBalanceDisplay({ symbol }: { symbol: string }) {
  const { wallet } = useWeb3Context();
  const { balance, isLoading, error } = useTokenBalance(symbol);

  if (!wallet.isConnected) {
    return (
      <div className="text-right">
        <div className="font-medium text-muted-foreground">--</div>
        <div className="text-sm text-muted-foreground">
          Balance
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-right">
        <div className="font-medium animate-pulse">...</div>
        <div className="text-sm text-muted-foreground">
          Balance
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-right">
        <div className="font-medium text-red-500">Error</div>
        <div className="text-sm text-muted-foreground">
          Balance
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="font-medium">{formatTokenAmount(balance)}</div>
      <div className="text-sm text-muted-foreground">
        Balance
      </div>
    </div>
  );
}

export function TokenSelector({
  isOpen,
  onClose,
  onSelectToken,
  selectedToken,
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteTokens] = useState<string[]>(["XP", "XPS", "XCR", "XEF", "ETH", "BTC", "USDT", "BNB", "USDC"]);
  const [showCrossChainWarning, setShowCrossChainWarning] = useState(false);
  const [activeTab, setActiveTab] = useState("xphere");
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  // Fetch tokens from different networks
  const { data: xphereTokensData, isLoading: xphereLoading, error: xphereError, refetch: refetchXphere } = useQuery({
    queryKey: ["xphere-tokens"],
    queryFn: async () => {
      console.log('🔥 Fetching Xphere tokens...');
      const response = await fetch(getApiUrl('api/xphere-tokens'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Xphere tokens data:', data);
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: ethereumTokensData, isLoading: ethereumLoading, error: ethereumError, refetch: refetchEthereum } = useQuery({
    queryKey: ["ethereum-tokens"],
    queryFn: async () => {
      console.log('🔥 Fetching Ethereum tokens...');
      const response = await fetch(getApiUrl('api/ethereum-tokens'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Ethereum tokens data:', data);
      return data;
    },
    refetchInterval: 60000,
    enabled: activeTab === "ethereum",
  });

  const { data: bscTokensData, isLoading: bscLoading, error: bscError, refetch: refetchBSC } = useQuery({
    queryKey: ["bsc-tokens"],
    queryFn: async () => {
      console.log('🔥 Fetching BSC tokens...');
      const response = await fetch(getApiUrl('api/bsc-tokens'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ BSC tokens data:', data);
      return data;
    },
    refetchInterval: 60000,
    enabled: activeTab === "bsc",
  });

  // Get current network tokens based on active tab
  const getCurrentNetworkTokens = () => {
    console.log('🔍 Getting tokens for tab:', activeTab);
    console.log('📊 Data states:', {
      xphere: { loading: xphereLoading, error: xphereError, dataLength: Array.isArray(xphereTokensData) ? xphereTokensData.length : 'Not array' },
      ethereum: { loading: ethereumLoading, error: ethereumError, dataLength: Array.isArray(ethereumTokensData) ? ethereumTokensData.length : 'Not array' },
      bsc: { loading: bscLoading, error: bscError, dataLength: Array.isArray(bscTokensData) ? bscTokensData.length : 'Not array' }
    });
    
    switch (activeTab) {
      case "ethereum":
        const ethTokens = Array.isArray(ethereumTokensData) ? ethereumTokensData : [];
        console.log('📍 Returning Ethereum tokens:', ethTokens);
        return ethTokens;
      case "bsc":
        const bscTokens = Array.isArray(bscTokensData) ? bscTokensData : [];
        console.log('📍 Returning BSC tokens:', bscTokens);
        return bscTokens;
      default:
        const xphereTokens = Array.isArray(xphereTokensData) ? xphereTokensData : [];
        console.log('📍 Returning Xphere tokens:', xphereTokens);
        return xphereTokens;
    }
  };

  const currentNetworkTokens = getCurrentNetworkTokens();
  const isLoading = xphereLoading || ethereumLoading || bscLoading;

  // Ensure currentNetworkTokens is always an array before filtering
  const filteredTokens = Array.isArray(currentNetworkTokens) ? currentNetworkTokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSelectToken = async (token: Token) => {
    const tokenNetwork = (token as any).network || "Xphere";
    
    // Check if network switching is needed
    if (tokenNetwork !== "Xphere") {
      try {
        const chainId = tokenNetwork === "Ethereum" ? "0x1" : tokenNetwork === "BSC" ? "0x38" : "0x1349489";
        await switchNetwork(chainId);
      } catch (error) {
        console.error("Failed to switch network:", error);
        setShowCrossChainWarning(true);
        return;
      }
    }
    
    onSelectToken(token);
    onClose();
    setSearchQuery("");
  };

  const handleNetworkSwitch = async (network: string) => {
    setActiveTab(network);
    
    // Auto-switch MetaMask network only if not already switching
    if (!switchingNetwork) {
      setSwitchingNetwork(true);
      try {
        let chainId = "0x134fe69"; // Xphere default
        if (network === "ethereum") chainId = "0x1";
        if (network === "bsc") chainId = "0x38";
        
        await switchNetwork(chainId);
      } catch (error) {
        console.error("Failed to switch network:", error);
      } finally {
        setSwitchingNetwork(false);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or paste address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchQuery === "" && (
              <div>
                <h4 className="text-sm font-medium mb-2">Popular tokens</h4>
                <div className="flex flex-wrap gap-2">
                  {currentNetworkTokens
                    .filter((token) => favoriteTokens.includes(token.symbol))
                    .map((token) => (
                      <Button
                        key={token.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectToken(token)}
                        className="h-auto p-2"
                        disabled={selectedToken?.id === token.id}
                      >
                        <img 
                          src={getTokenIcon(token.symbol)} 
                          alt={token.symbol}
                          className="w-4 h-4 mr-2 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.outerHTML = `<div class="w-4 h-4 mr-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">${token.symbol.slice(0, 1)}</div>`;
                          }}
                        />
                        {token.symbol}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={handleNetworkSwitch} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="xphere" className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  Xphere
                </TabsTrigger>
                <TabsTrigger value="ethereum" className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                  Ethereum
                </TabsTrigger>
                <TabsTrigger value="bsc" className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  BSC
                </TabsTrigger>
              </TabsList>

              <TabsContent value="xphere" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Xphere Network Tokens</h4>
                  <div className="flex items-center gap-2">
                    {xphereLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchXphere()}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {filteredTokens.map((token) => (
                      <Button
                        key={token.id}
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto"
                        onClick={() => handleSelectToken(token)}
                        disabled={selectedToken?.id === token.id}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                            <img 
                              src={getTokenIcon(token.symbol, token)} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">${token.symbol.slice(0, 2)}</div>`;
                                }
                              }}
                            />
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{token.symbol}</span>
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Xphere</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {token.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {favoriteTokens.includes(token.symbol) && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                          <TokenBalanceDisplay symbol={token.symbol} />
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="ethereum" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Ethereum Network Tokens</h4>
                  <div className="flex items-center gap-2">
                    {ethereumLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchEthereum()}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNetworkSwitch("ethereum")}
                      className="text-xs"
                      disabled={switchingNetwork}
                    >
                      <Wallet className="w-3 h-3 mr-1" />
                      {switchingNetwork ? "Switching..." : "Switch Network"}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {filteredTokens.map((token) => (
                      <Button
                        key={token.id}
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto"
                        onClick={() => handleSelectToken(token)}
                        disabled={selectedToken?.id === token.id}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                            <img 
                              src={(token as any).iconUrl || getTokenIcon(token.symbol, token)} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-xs font-bold">${token.symbol.slice(0, 2)}</div>`;
                                }
                              }}
                            />
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{token.symbol}</span>
                              <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Ethereum</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {token.name}
                            </div>
                            {(token as any).price && (
                              <div className="text-xs text-green-600">
                                ${(token as any).price.toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {favoriteTokens.includes(token.symbol) && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                          <TokenBalanceDisplay symbol={token.symbol} />
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bsc" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">BSC Network Tokens</h4>
                  <div className="flex items-center gap-2">
                    {bscLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchBSC()}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNetworkSwitch("bsc")}
                      className="text-xs"
                      disabled={switchingNetwork}
                    >
                      <Wallet className="w-3 h-3 mr-1" />
                      {switchingNetwork ? "Switching..." : "Switch Network"}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {filteredTokens.map((token) => (
                      <Button
                        key={token.id}
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto"
                        onClick={() => handleSelectToken(token)}
                        disabled={selectedToken?.id === token.id}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                            <img 
                              src={(token as any).iconUrl || getTokenIcon(token.symbol, token)} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-xs font-bold">${token.symbol.slice(0, 2)}</div>`;
                                }
                              }}
                            />
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{token.symbol}</span>
                              <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600">BSC</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {token.name}
                            </div>
                            {(token as any).price && (
                              <div className="text-xs text-green-600">
                                ${(token as any).price.toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {favoriteTokens.includes(token.symbol) && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                          <TokenBalanceDisplay symbol={token.symbol} />
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Cross-chain warning dialog */}
      <Dialog open={showCrossChainWarning} onOpenChange={setShowCrossChainWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Cross-chain Token Detected
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                This token is on a different blockchain network and cannot be directly swapped on Xphere. 
                You'll need to use the Bridge function to transfer assets between networks.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCrossChainWarning(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowCrossChainWarning(false);
                  onClose();
                  // Navigate to bridge page
                  window.location.href = '/bridge';
                }}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Bridge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}