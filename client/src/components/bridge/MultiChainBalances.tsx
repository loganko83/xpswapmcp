import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { getTokenIcon } from "@/lib/tokenUtils";
import { MultiChainBalance } from "./types";

interface MultiChainBalancesProps {
  balances: MultiChainBalance[];
}

export function MultiChainBalances({ balances }: MultiChainBalancesProps) {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Multi-Chain Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">No balances found</p>
            <p className="text-xs mt-1">Connect your wallet to view balances</p>
          </div>
        ) : (
          balances.map((balance: MultiChainBalance) => (
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
              {balance.tokens && balance.tokens.length > 0 && balance.tokens.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2">
                    <img src={getTokenIcon(token.symbol)} alt={token.symbol} className="w-3 h-3" />
                    <span className="text-xs text-gray-400">{token.symbol}</span>
                  </div>
                  <span className="text-xs text-gray-400">{parseFloat(token.balance).toFixed(4)}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
