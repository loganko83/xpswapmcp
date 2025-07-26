import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { BridgeTransaction } from "./types";

interface BridgeHistoryProps {
  transactions: BridgeTransaction[];
}

export function BridgeHistory({ transactions }: BridgeHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Bridge History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No bridge transactions found
            </div>
          ) : (
            transactions.map((tx: BridgeTransaction) => (
              <div key={tx.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span className="text-sm font-medium text-white">
                      {tx.fromToken.symbol} → {tx.toToken.symbol}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{tx.amount} {tx.fromToken.symbol}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className={getStatusColor(tx.status)}>{tx.status.toUpperCase()}</span>
                  {tx.fromTxHash && (
                    <Button variant="ghost" size="sm" className="text-xs text-purple-400 hover:text-purple-300">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
