import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWeb3Context } from "@/contexts/Web3Context";
import { Zap, Code, DollarSign, Clock, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getApiUrl } from "@/lib/apiUrl";
interface FlashLoanPool {
  token: string;
  symbol: string;
  available: number;
  fee: number;
  maxAmount: number;
  utilizationRate: number;
}

interface FlashLoanTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  estimatedGas: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface FlashLoanTransaction {
  id: string;
  timestamp: string;
  amount: number;
  token: string;
  fee: number;
  gasUsed: number;
  status: 'success' | 'failed' | 'pending';
  strategy: string;
  profit: number;
}

export function FlashLoansInterface() {
  const { wallet } = useWeb3Context();
  const [activeTab, setActiveTab] = useState("execute");
  const [selectedToken, setSelectedToken] = useState("XP");
  const [loanAmount, setLoanAmount] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [estimatedGas, setEstimatedGas] = useState(0);

  // Fetch available pools
  const { data: pools } = useQuery({
    queryKey: ["/api/flashloans/pools"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/flashloans/pools"));
      if (!response.ok) throw new Error("Failed to fetch pools");
      return response.json();
    }
  });

  // Fetch loan templates
  const { data: templates } = useQuery({
    queryKey: ["/api/flashloans/templates"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/flashloans/templates"));
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    }
  });

  // Fetch user transactions
  const { data: transactions } = useQuery({
    queryKey: ["/api/flashloans/history", wallet?.address],
    queryFn: async () => {
      if (!wallet?.address) return [];
      const response = await fetch(getApiUrl(`/api/flashloans/history?address=${wallet.address}`));
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
    enabled: !!wallet?.address
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/flashloans/analytics"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/flashloans/analytics"));
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    }
  });

  const selectedPool = pools?.find((pool: FlashLoanPool) => pool.symbol === selectedToken);

  const calculateFee = () => {
    if (!selectedPool || !loanAmount) return 0;
    return parseFloat(loanAmount) * selectedPool.fee;
  };

  const handleExecuteFlashLoan = async () => {
    if (!wallet?.address || !loanAmount || !customCode) {
      alert("Please fill in all fields and connect your wallet");
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/flashloans/execute"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.address,
          token: selectedToken,
          amount: parseFloat(loanAmount),
          code: customCode,
          templateId: selectedTemplate
        })
      });

      if (!response.ok) throw new Error("Flash loan execution failed");
      
      const result = await response.json();
      alert(`Flash loan executed successfully! Transaction hash: ${result.txHash}`);
      
      // Reset form
      setLoanAmount("");
      setCustomCode("");
      setSelectedTemplate("");
    } catch (error) {
      console.error("Flash loan error:", error);
      alert("Flash loan execution failed. Please check your code and try again.");
    }
  };

  const loadTemplate = (template: FlashLoanTemplate) => {
    setSelectedTemplate(template.id);
    setCustomCode(template.code);
    setEstimatedGas(template.estimatedGas);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Flash Loans</h1>
        <p className="text-muted-foreground">
          Execute instant, uncollateralized loans for arbitrage and liquidations
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume (24h)</p>
                <p className="text-2xl font-bold">${analytics?.volume24h?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Loans</p>
                <p className="text-2xl font-bold">{analytics?.totalLoans?.toLocaleString() || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analytics?.successRate?.toFixed(1) || 0}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit</p>
                <p className="text-2xl font-bold">${analytics?.avgProfit?.toFixed(2) || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="execute">Execute Loan</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="execute" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flash Loan Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Configure Flash Loan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token</label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XP">XP Token</SelectItem>
                      <SelectItem value="XPS">XPS Token</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="ETH">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Loan Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                  {selectedPool && (
                    <p className="text-xs text-muted-foreground">
                      Available: {selectedPool.available.toLocaleString()} {selectedPool.symbol}
                    </p>
                  )}
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Loan Details</h4>
                  <div className="flex justify-between text-sm">
                    <span>Loan Amount:</span>
                    <span>{loanAmount || 0} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee ({selectedPool?.fee ? (selectedPool.fee * 100).toFixed(3) : 0}%):</span>
                    <span>{calculateFee().toFixed(6)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Repayment:</span>
                    <span>{(parseFloat(loanAmount || "0") + calculateFee()).toFixed(6)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated Gas:</span>
                    <span>{estimatedGas.toLocaleString()} gas</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Load Template (Optional)</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template: FlashLoanTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const template = templates?.find((t: FlashLoanTemplate) => t.id === selectedTemplate);
                      if (template) loadTemplate(template);
                    }}
                  >
                    Load Template Code
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Smart Contract Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Flash Loan Logic</label>
                  <Textarea
                    placeholder="Enter your flash loan logic here..."
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Write your arbitrage or liquidation logic. The flash loan will be executed atomically.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Ensure your code includes profit calculation and loan repayment logic
                  </span>
                </div>

                <Button 
                  onClick={handleExecuteFlashLoan} 
                  className="w-full"
                  disabled={!wallet?.isConnected || !customCode || !loanAmount}
                >
                  {!wallet?.isConnected ? "Connect Wallet" : "Execute Flash Loan"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template: FlashLoanTemplate) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={
                      template.difficulty === 'beginner' ? 'default' :
                      template.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                    }>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Category: {template.category}</span>
                    <span className="text-muted-foreground">Gas: {template.estimatedGas.toLocaleString()}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate(template)}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Flash Loan Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Token</th>
                      <th className="text-left p-2">Available</th>
                      <th className="text-left p-2">Fee</th>
                      <th className="text-left p-2">Max Amount</th>
                      <th className="text-left p-2">Utilization</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pools?.map((pool: FlashLoanPool) => (
                      <tr key={pool.symbol} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{pool.symbol}</td>
                        <td className="p-2">{pool.available.toLocaleString()}</td>
                        <td className="p-2">{(pool.fee * 100).toFixed(3)}%</td>
                        <td className="p-2">{pool.maxAmount.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${pool.utilizationRate * 100}%` }}
                              />
                            </div>
                            <span>{(pool.utilizationRate * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={pool.available > 0 ? 'default' : 'destructive'}>
                            {pool.available > 0 ? 'Active' : 'Depleted'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flash Loan History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No flash loan transactions found. Start trading to see your history here.
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions?.map((tx: FlashLoanTransaction) => (
                    <div key={tx.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">
                            {tx.amount.toLocaleString()} {tx.token} Flash Loan
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={
                          tx.status === 'success' ? 'default' :
                          tx.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {tx.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fee Paid</p>
                          <p className="font-medium">{tx.fee.toFixed(6)} {tx.token}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Gas Used</p>
                          <p className="font-medium">{tx.gasUsed.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Strategy</p>
                          <p className="font-medium">{tx.strategy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit</p>
                          <p className={`font-medium ${tx.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.profit >= 0 ? '+' : ''}${tx.profit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}