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
import { Search, Star, AlertTriangle, ExternalLink } from "lucide-react";
import { Token } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";
import { getTokenIcon } from "@/lib/tokenUtils";

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
  const [favoriteTokens] = useState<string[]>(["XP", "USDT", "ETH"]);
  const [showCrossChainWarning, setShowCrossChainWarning] = useState(false);

  // Convert DEFAULT_TOKENS to Token type
  const tokens: Token[] = DEFAULT_TOKENS.map((token, index) => ({
    id: index + 1,
    ...token,
    isActive: true,
  }));

  // Separate tokens by network
  const xphereTokens = tokens.filter(token => (token as any).network === "Xphere");
  const crossChainTokens = tokens.filter(token => (token as any).network !== "Xphere");

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectToken = (token: Token) => {
    // Check if this is a cross-chain token selection
    const isCrossChain = (token as any).network !== "Xphere";
    
    if (isCrossChain) {
      setShowCrossChainWarning(true);
      return;
    }
    
    onSelectToken(token);
    onClose();
    setSearchQuery("");
  };



  const getNetworkBadge = (network: string) => {
    if (network === "Xphere") {
      return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Xphere</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Cross-chain</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select a Token</DialogTitle>
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
                  {tokens
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

            <div className="space-y-4">
              {/* Xphere Network Tokens */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Xphere Network
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Native</Badge>
                </h4>
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {xphereTokens.filter(token =>
                      searchQuery === "" || 
                      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      token.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((token) => (
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
                              {getNetworkBadge((token as any).network)}
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
              </div>

              {/* Cross-chain Tokens */}
              {crossChainTokens.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Other Networks
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Cross-chain</Badge>
                  </h4>
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {crossChainTokens.filter(token =>
                        searchQuery === "" || 
                        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        token.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((token) => (
                        <Button
                          key={token.id}
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto opacity-75"
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
                                {getNetworkBadge((token as any).network)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {token.name}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="w-4 h-4 text-orange-500" />
                            <div className="text-right">
                              <div className="font-medium text-sm">Bridge Required</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
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
                  window.location.href = '/bridge';
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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