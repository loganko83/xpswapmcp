import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Plus, ExternalLink } from "lucide-react";
import { Transaction } from "@/types";
import { formatDistanceToNow } from "date-fns";

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 1,
    userAddress: "0x1234...5678",
    transactionHash: "0xabcd...efgh",
    type: "swap",
    tokenIn: "XP",
    tokenOut: "USDT",
    amountIn: "1000",
    amountOut: "84.2",
    status: "confirmed",
    gasUsed: "150000",
    gasPrice: "20",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    userAddress: "0x1234...5678",
    transactionHash: "0x1234...5678",
    type: "add_liquidity",
    tokenIn: "XP",
    tokenOut: "USDT",
    amountIn: "500",
    amountOut: "42.1",
    status: "confirmed",
    gasUsed: "250000",
    gasPrice: "22",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    userAddress: "0x1234...5678",
    transactionHash: "0x9876...5432",
    type: "swap",
    tokenIn: "ETH",
    tokenOut: "XP",
    amountIn: "0.5",
    amountOut: "740.2",
    status: "pending",
    gasUsed: "180000",
    gasPrice: "25",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

export function TransactionHistory() {
  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "swap":
        return <ArrowUpDown className="w-4 h-4" />;
      case "add_liquidity":
        return <Plus className="w-4 h-4" />;
      case "remove_liquidity":
        return <Plus className="w-4 h-4 rotate-45" />;
      default:
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const getTransactionTitle = (type: Transaction["type"]) => {
    switch (type) {
      case "swap":
        return "Swap";
      case "add_liquidity":
        return "Add Liquidity";
      case "remove_liquidity":
        return "Remove Liquidity";
      default:
        return "Transaction";
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      case "failed":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            mockTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {getTransactionTitle(tx.type)} {tx.tokenIn} → {tx.tokenOut}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-2">
                      <span>
                        {formatDistanceToNow(new Date(tx.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <Badge variant={getStatusVariant(tx.status)} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    -{parseFloat(tx.amountIn).toLocaleString()} {tx.tokenIn}
                  </div>
                  <div className="text-sm text-green-600">
                    +{parseFloat(tx.amountOut).toLocaleString()} {tx.tokenOut}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer ml-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
