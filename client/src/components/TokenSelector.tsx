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
import { Search, Star } from "lucide-react";
import { Token } from "@/types";
import { DEFAULT_TOKENS } from "@/lib/constants";

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

  // Convert DEFAULT_TOKENS to Token type
  const tokens: Token[] = DEFAULT_TOKENS.map((token, index) => ({
    id: index + 1,
    ...token,
    isActive: true,
  }));

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    onClose();
    setSearchQuery("");
  };

  const getTokenIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      XP: "🔶",
      USDT: "💚",
      ETH: "💎",
      BNB: "🟡",
    };
    return iconMap[symbol] || "⚪";
  };

  return (
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
                      <span className="mr-2">{getTokenIcon(token.symbol)}</span>
                      {token.symbol}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Token list</h4>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {filteredTokens.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No tokens found
                  </div>
                ) : (
                  filteredTokens.map((token) => (
                    <Button
                      key={token.id}
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                      onClick={() => handleSelectToken(token)}
                      disabled={selectedToken?.id === token.id}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                          <span className="text-lg">
                            {getTokenIcon(token.symbol)}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{token.symbol}</div>
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
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
