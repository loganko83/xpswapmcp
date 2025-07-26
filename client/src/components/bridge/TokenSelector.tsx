import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTokenIcon } from "@/lib/tokenUtils";
import { BridgeToken, SupportedNetwork, MultiChainBalance } from "./types";

interface TokenSelectorProps {
  selectedToken: BridgeToken | null;
  fromNetwork: SupportedNetwork | null;
  multiChainBalances: MultiChainBalance[];
  walletAddress?: string;
  onTokenChange: (token: BridgeToken | null) => void;
}

export function TokenSelector({
  selectedToken,
  fromNetwork,
  multiChainBalances,
  walletAddress,
  onTokenChange
}: TokenSelectorProps) {
  const getAvailableTokens = (): BridgeToken[] => {
    if (!fromNetwork || !walletAddress) return [];
    
    // Find balances for the selected network
    const networkBalances = multiChainBalances.find((balance: MultiChainBalance) => 
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
      networkBalances.tokens.forEach((token) => {
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

  const availableTokens = getAvailableTokens();

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-300">Select Token</label>
      <Select 
        value={selectedToken?.symbol} 
        onValueChange={(value) => {
          const token = availableTokens.find((t: BridgeToken) => t.symbol === value);
          onTokenChange(token || null);
        }}
      >
        <SelectTrigger className="bg-black/20 border-white/10 text-white">
          <SelectValue placeholder="Select token" />
        </SelectTrigger>
        <SelectContent>
          {availableTokens.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p className="text-sm">No tokens with balance found</p>
              <p className="text-xs mt-1">Make sure you have tokens in your wallet on the selected network</p>
            </div>
          ) : (
            availableTokens.map((token: BridgeToken) => {
              // Find the actual balance for this token
              const networkBalances = multiChainBalances.find((balance: MultiChainBalance) => 
                balance.chainId === fromNetwork?.chainId
              );
              
              let tokenBalance = '0';
              if (networkBalances) {
                if (token.symbol === networkBalances.nativeSymbol) {
                  tokenBalance = networkBalances.nativeBalance || '0';
                } else {
                  const tokenInfo = networkBalances.tokens?.find((t) => t.symbol === token.symbol);
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
  );
}
