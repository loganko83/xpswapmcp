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
import { getTokenIcon } from "@/lib/tokenUtils";
import { useQuery } from "@tanstack/react-query";
import { switchNetwork } from "@/lib/web3";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: Token;
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

  // Fetch tokens from different networks
  const { data: xphereTokensData, isLoading: xphereLoading, refetch: refetchXphere } = useQuery({
    queryKey: ["/api/xphere-tokens"],
    refetchInterval: 30000,
  });

  const { data: ethereumTokensData, isLoading: ethereumLoading, refetch: refetchEthereum } = useQuery({
    queryKey: ["/api/ethereum-tokens"],
    refetchInterval: 60000,
    enabled: activeTab === "ethereum",
  });

  const { data: bscTokensData, isLoading: bscLoading, refetch: refetchBSC } = useQuery({
    queryKey: ["/api/bsc-tokens"],
    refetchInterval: 60000,
    enabled: activeTab === "bsc",
  });

  // Get current network tokens based on active tab
  const getCurrentNetworkTokens = () => {
    switch (activeTab) {
      case "ethereum":
        return ethereumTokensData || [];
      case "bsc":
        return bscTokensData || [];
      default:
        return xphereTokensData || [];
    }
  };

  const currentNetworkTokens = getCurrentNetworkTokens();
  const isLoading = xphereLoading || ethereumLoading || bscLoading;

  const filteredTokens = currentNetworkTokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    
    // Auto-switch MetaMask network
    try {
      let chainId = "0x1349489"; // Xphere default
      if (network === "ethereum") chainId = "0x1";
      if (network === "bsc") chainId = "0x38";
      
      await switchNetwork(chainId);
    } catch (error) {
      console.error("Failed to switch network:", error);
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
                          className="w-4 h-4 mr-2 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
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
                          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={getTokenIcon(token.symbol, token)} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
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
                          <div className="text-right">
                            <div className="font-medium">0.00</div>
                            <div className="text-sm text-muted-foreground">
                              Balance
                            </div>
                          </div>
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
                    >
                      <Wallet className="w-3 h-3 mr-1" />
                      Switch Network
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
                          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={(token as any).iconUrl || getTokenIcon(token.symbol, token)} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
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
                          <div className="text-right">
                            <div className="font-medium">0.00</div>
                            <div className="text-sm text-muted-foreground">
                              Balance
                            </div>
                          </div>
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
                    >
                      <Wallet className="w-3 h-3 mr-1" />
                      Switch Network
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
                          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={(token as any).iconUrl || getTokenIcon(token.symbol, token)} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
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
                          <div className="text-right">
                            <div className="font-medium">0.00</div>
                            <div className="text-sm text-muted-foreground">
                              Balance
                            </div>
                          </div>
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