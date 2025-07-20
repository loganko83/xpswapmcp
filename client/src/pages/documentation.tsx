import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Code, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";

const navigationItems = [
  { id: "overview", title: "Overview", icon: BookOpen },
  { id: "getting-started", title: "Getting Started", icon: Zap },
  { id: "developers-guide", title: "Developer's Guide", icon: Code },
  { id: "api-reference", title: "Complete API Reference", icon: Code },
  { id: "smart-contracts", title: "Smart Contracts", icon: Shield },
  { id: "multi-network", title: "Multi-Network Trading", icon: Globe },
  { id: "defi-features", title: "DeFi Features", icon: TrendingUp },
  { id: "integration", title: "Integration Guide", icon: Globe },
  { id: "community", title: "Community", icon: Users },
];

const smartContracts = [
  {
    name: "XpSwapToken (XPS)",
    address: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
    description: "Native XPS token with fee discount tiers and deflationary mechanisms",
    functions: ["transfer", "approve", "burn", "getFeeDiscountTier", "updateFeeDiscountTier"]
  },
  {
    name: "XpSwapDEX Main Router",
    address: "0x5b0bcfa1490d",
    description: "Main DEX router with real AMM algorithms (x * y = k)",
    functions: ["swapExactTokensForTokens", "addLiquidity", "removeLiquidity", "getAmountOut", "getAmountIn"]
  },
  {
    name: "XpSwapAdvancedAMM",
    address: "0x123c1d407d04a",
    description: "Advanced automated market maker with MEV protection system",
    functions: ["swapExactTokensForTokens", "addLiquidity", "removeLiquidity", "getAmountOut", "calculateMevRisk"]
  },
  {
    name: "XpSwapLiquidityPool",
    address: "0xe909098d05c06",
    description: "Time-locked liquidity and auto-compounding system",
    functions: ["stake", "unstake", "claimRewards", "compound", "getPoolInfo"]
  },
  {
    name: "XpSwapFarmingRewards",
    address: "0xb99484ee2d452",
    description: "Yield farming with governance token boosting",
    functions: ["stakeLPTokens", "claimRewards", "boostRewards", "getRewardRate", "getUserFarmInfo"]
  }
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && navigationItems.some(item => item.id === hash)) {
      setActiveSection(hash);
    }
    
    const handleNavigateToApi = () => {
      setActiveSection('api-reference');
    };
    
    window.addEventListener('navigate-to-api', handleNavigateToApi);
    
    return () => {
      window.removeEventListener('navigate-to-api', handleNavigateToApi);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = "json", id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">XpSwap DEX Documentation</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Enterprise-grade decentralized exchange built on Xphere blockchain
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">Real AMM Engine</Badge>
                <Badge variant="secondary">MEV Protection</Badge>
                <Badge variant="secondary">5 Smart Contracts</Badge>
                <Badge variant="secondary">Real-time Price Data</Badge>
                <Badge variant="secondary">Cross-chain Bridge</Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Core Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Real constant product formula (x * y = k) AMM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>MEV protection and sandwich attack prevention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Up to 2.5x yield boosting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Multi-network cross-chain bridge</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Xphere Blockchain (Chain ID: 20250217)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Solidity + OpenZeppelin libraries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>React + TypeScript + ethers.js</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>CoinMarketCap real-time API</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Architecture Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  id="architecture"
                  language="text"
                  code={`XpSwap DEX Architecture

┌─ Frontend (React + TypeScript)
│  ├─ Real-time price data (CoinMarketCap API)
│  ├─ MetaMask wallet integration
│  ├─ Advanced swap interface
│  └─ Analytics dashboard

├─ Backend (Node.js + Express)
│  ├─ Real AMM calculation engine
│  ├─ MEV protection algorithms
│  ├─ Farming analytics API
│  └─ PostgreSQL database

└─ Smart Contracts (Solidity)
   ├─ XpSwapAdvancedAMM.sol
   ├─ XpSwapLiquidityPool.sol
   ├─ XpSwapGovernanceToken.sol
   ├─ XpSwapFarmingRewards.sol
   └─ XpSwapCrosschainBridge.sol`}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "developers-guide":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Complete Developer's Guide</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Comprehensive guide for developers integrating with XpSwap DEX
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">Project Structure</Badge>
                <Badge variant="secondary">Smart Contract Deployment</Badge>
                <Badge variant="secondary">Frontend Integration</Badge>
                <Badge variant="secondary">Testing & Production</Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  External Documentation
                </CardTitle>
                <CardDescription>Access the complete developer documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Complete Developer's Guide</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        In-depth technical documentation covering project structure, deployment, and integration
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-4"
                      onClick={() => window.open('/DEVELOPERS_GUIDE.md', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Guide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Installation</h4>
                    <CodeBlock
                      id="quick-install"
                      language="bash"
                      code={`# Clone repository
git clone https://github.com/your-org/xpswap-dex.git
cd xpswap-dex

# Install dependencies
npm install

# Start development server
npm run dev`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Real AMM with x * y = k formula</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>26 comprehensive API endpoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Smart contract deployment scripts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Production-ready infrastructure</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "api-reference":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Complete API Reference</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Detailed documentation for all 26 XpSwap DEX API endpoints
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">26 Endpoints</Badge>
                <Badge variant="secondary">Real-time Data</Badge>
                <Badge variant="secondary">RESTful API</Badge>
                <Badge variant="secondary">JSON Responses</Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Complete API Documentation
                </CardTitle>
                <CardDescription>
                  Access the full API reference with detailed examples and response schemas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Complete API Reference</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Comprehensive documentation for all API endpoints with examples, error handling, and SDK integration
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-4"
                      onClick={() => window.open('/API_REFERENCE.md', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full API Docs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span><strong>Core Trading (4 endpoints)</strong> - Swap quotes, liquidity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span><strong>Market Data (4 endpoints)</strong> - Prices, pools, ticker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span><strong>DeFi Features (4 endpoints)</strong> - Farming, staking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span><strong>Cross-Chain (4 endpoints)</strong> - Bridge, networks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span><strong>Governance (4 endpoints)</strong> - XPS, airdrop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span><strong>Analytics (6 endpoints)</strong> - Portfolio, health</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Base Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Base URL</h4>
                    <code className="bg-muted px-2 py-1 rounded">
                      https://xpswap.replit.app
                    </code>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content-Type</h4>
                    <code className="bg-muted px-2 py-1 rounded">application/json</code>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rate Limiting</h4>
                    <p>100 requests per minute per IP</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Authentication</h4>
                    <p>No authentication required</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick API Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Get XP Price</h4>
                  <CodeBlock
                    id="xp-price"
                    language="bash"
                    code={`curl https://xpswap.replit.app/api/xp-price`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Get Swap Quote</h4>
                  <CodeBlock
                    id="swap-quote"
                    language="bash"
                    code={`curl -X POST https://xpswap.replit.app/api/swap-quote \\
  -H "Content-Type: application/json" \\
  -d '{"tokenIn":"XP","tokenOut":"USDT","amountIn":"100"}'`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "smart-contracts":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Smart Contracts</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Detailed information about XpSwap's deployed smart contracts on Xphere Network
              </p>
            </div>

            <div className="grid gap-6">
              {smartContracts.map((contract, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {contract.name}
                      </CardTitle>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contract Address</h4>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {contract.address}
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Functions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {contract.functions.map((func, i) => (
                          <code key={i} className="bg-muted px-2 py-1 rounded text-sm">
                            {func}()
                          </code>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "multi-network":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Multi-Network Trading</h1>
              <p className="text-xl text-muted-foreground mb-6">
                XpSwap supports seamless trading across multiple blockchain networks via Li.Fi integration
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Supported Networks
                  </CardTitle>
                  <CardDescription>
                    Trade assets across major blockchain networks with real-time RPC connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-semibold text-blue-900 dark:text-blue-100">Ethereum</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Chain ID: 1</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">RPC: eth.llamarpc.com</div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="font-semibold text-yellow-900 dark:text-yellow-100">Binance Smart Chain</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">Chain ID: 56</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">RPC: bsc-dataseed1.defibit.io</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-semibold text-purple-900 dark:text-purple-100">Polygon</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Chain ID: 137</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">RPC: polygon-rpc.com</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-semibold text-blue-900 dark:text-blue-100">Arbitrum</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Chain ID: 42161</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">RPC: arb1.arbitrum.io</div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="font-semibold text-red-900 dark:text-red-100">Optimism</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Chain ID: 10</div>
                      <div className="text-xs text-red-600 dark:text-red-400">RPC: mainnet.optimism.io</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-semibold text-green-900 dark:text-green-100">Xphere</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Chain ID: 20250217</div>
                      <div className="text-xs text-green-600 dark:text-green-400">RPC: en-bkk.x-phere.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">🌐 Real-time Network Status</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Live RPC connectivity monitoring</li>
                        <li>• Network health indicators</li>
                        <li>• Automatic failover to backup RPCs</li>
                        <li>• Visual network status dashboard</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">⚡ One-click Network Addition</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Auto-add networks to MetaMask</li>
                        <li>• Pre-configured RPC endpoints</li>
                        <li>• Automatic network switching</li>
                        <li>• Built-in network detection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">🔗 Cross-chain Bridge</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Li.Fi SDK integration</li>
                        <li>• 40+ blockchain support</li>
                        <li>• Real-time bridge quotes</li>
                        <li>• Multi-route optimization</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">💧 High Availability</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Multiple fallback RPC URLs</li>
                        <li>• Load balancing across providers</li>
                        <li>• 99.9% uptime guarantee</li>
                        <li>• Redundant infrastructure</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bridge Integration Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    id="bridge-example"
                    language="typescript"
                    code={`// Cross-chain bridge usage
const bridgeQuote = await fetch('/api/bridge-quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromChain: 1, // Ethereum
    toChain: 56,  // BSC
    fromToken: 'ETH',
    toToken: 'BNB',
    amount: '1000000000000000000' // 1 ETH
  })
});

const quote = await bridgeQuote.json();
console.log('Bridge estimate:', quote.estimate);`}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "defi-features":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">DeFi Features</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Comprehensive guide to XpSwap's advanced DeFi features
              </p>
            </div>

            <Tabs defaultValue="amm" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="amm">AMM Engine</TabsTrigger>
                <TabsTrigger value="farming">Yield Farming</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
                <TabsTrigger value="bridge">Cross-Chain</TabsTrigger>
              </TabsList>

              <TabsContent value="amm" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Real AMM Engine</CardTitle>
                    <CardDescription>Automated market maker based on constant product formula (x * y = k)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Core Formula</h4>
                      <CodeBlock
                        id="amm-formula"
                        language="javascript"
                        code={`// Constant product formula (x * y = k)
function getAmountOut(amountIn, reserveIn, reserveOut) {
  const amountInWithFee = amountIn * 997; // Apply 0.3% fee
  const numerator = amountInWithFee * reserveOut;
  const denominator = (reserveIn * 1000) + amountInWithFee;
  return numerator / denominator;
}

// Calculate price impact
function calculatePriceImpact(amountIn, reserveIn, reserveOut) {
  const amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
  const currentPrice = reserveOut / reserveIn;
  const executionPrice = amountOut / amountIn;
  return Math.abs((executionPrice - currentPrice) / currentPrice) * 100;
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">MEV Protection</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Sandwich attack detection and blocking</li>
                        <li>• Dynamic fee adjustment (volatility-based)</li>
                        <li>• Maximum slippage protection</li>
                        <li>• Timestamp-based verification</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="farming" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Yield Farming</CardTitle>
                    <CardDescription>Advanced farming system with up to 2.5x boosting capability</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Boosting System</h4>
                      <CodeBlock
                        id="boost-formula"
                        language="javascript"
                        code={`// Boost calculation formula
function calculateBoost(lpStaked, govTokenStaked, lockDuration) {
  const timeMultiplier = Math.min(lockDuration / 365, 1.0); // Max 1 year
  const govMultiplier = Math.min(govTokenStaked / lpStaked, 1.5); // Max 1.5x
  const baseBoost = 1.0;
  
  return baseBoost + (timeMultiplier * govMultiplier);
}

// Real APY calculation
function calculateAPY(baseReward, boost, totalStaked) {
  const boostedReward = baseReward * boost;
  return (boostedReward / totalStaked) * 365 * 100; // Annual rate
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Farming Strategies</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Basic Farming:</strong> Base rewards from LP token staking</li>
                        <li>• <strong>Governance Boosting:</strong> Up to 1.5x with XPS token staking</li>
                        <li>• <strong>Time Locking:</strong> Additional boosting from long-term locks</li>
                        <li>• <strong>Auto-compounding:</strong> Automatic reward reinvestment</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Governance System</CardTitle>
                    <CardDescription>Decentralized governance with XPS token voting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Voting Mechanism</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Time-weighted voting power</li>
                        <li>• Delegated voting support</li>
                        <li>• Proposal creation and execution</li>
                        <li>• Community treasury management</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">XPS Token Utility</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Fee discounts (up to 75% for Diamond tier)</li>
                        <li>• Yield farming boost multipliers</li>
                        <li>• Governance voting rights</li>
                        <li>• Exclusive feature access</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bridge" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cross-Chain Bridge</CardTitle>
                    <CardDescription>Multi-network asset transfer via Li.Fi integration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Supported Networks</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-sm">• Ethereum (ETH)</span>
                        <span className="text-sm">• Binance Smart Chain (BNB)</span>
                        <span className="text-sm">• Polygon (MATIC)</span>
                        <span className="text-sm">• Arbitrum (ETH)</span>
                        <span className="text-sm">• Optimism (ETH)</span>
                        <span className="text-sm">• Xphere (XP)</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bridge Features</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Real-time quotes and route optimization</li>
                        <li>• Automatic slippage protection</li>
                        <li>• Transaction status tracking</li>
                        <li>• Multi-step bridge operations</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "integration":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Integration Guide</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Complete guide for integrating XpSwap DEX into your application
              </p>
            </div>

            <Tabs defaultValue="sdk" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sdk">SDK Integration</TabsTrigger>
                <TabsTrigger value="api">API Integration</TabsTrigger>
                <TabsTrigger value="widgets">Widget Embedding</TabsTrigger>
              </TabsList>

              <TabsContent value="sdk" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript/TypeScript SDK</CardTitle>
                    <CardDescription>Complete SDK for integrating XpSwap features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Installation</h4>
                      <CodeBlock
                        id="sdk-install"
                        language="bash"
                        code={`npm install @xpswap/sdk ethers`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Basic Usage</h4>
                      <CodeBlock
                        id="sdk-usage"
                        language="typescript"
                        code={`import { XpSwapSDK } from '@xpswap/sdk';

// Initialize SDK
const sdk = new XpSwapSDK({
  apiUrl: 'https://xpswap.replit.app',
  network: 'xphere',
  provider: window.ethereum
});

// Get swap quote
const quote = await sdk.getSwapQuote({
  tokenIn: 'XP',
  tokenOut: 'USDT',
  amountIn: '100'
});

// Execute swap
const txHash = await sdk.executeSwap(quote, {
  slippage: 0.5,
  deadline: Math.floor(Date.now() / 1000) + 1200
});`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>REST API Integration</CardTitle>
                    <CardDescription>Direct API integration for custom implementations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Authentication</h4>
                      <p className="text-sm text-muted-foreground mb-2">No API key required for public endpoints</p>
                      <CodeBlock
                        id="api-auth"
                        language="typescript"
                        code={`const baseUrl = 'https://xpswap.replit.app';

// All requests use standard HTTP headers
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Rate Limiting</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 100 requests per minute per IP</li>
                        <li>• Burst allowance: 20 requests in 10 seconds</li>
                        <li>• Rate limit headers included in responses</li>
                        <li>• Automatic retry with exponential backoff recommended</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="widgets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Embeddable Widgets</CardTitle>
                    <CardDescription>Pre-built widgets for easy integration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Swap Widget</h4>
                      <CodeBlock
                        id="swap-widget"
                        language="html"
                        code={`<iframe 
  src="https://xpswap.replit.app/widget/swap"
  width="400" 
  height="600"
  frameborder="0">
</iframe>`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Price Widget</h4>
                      <CodeBlock
                        id="price-widget"
                        language="html"
                        code={`<iframe 
  src="https://xpswap.replit.app/widget/price?token=XP"
  width="300" 
  height="200"
  frameborder="0">
</iframe>`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "community":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Community & Support</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Join our growing community and get the support you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Channels
                  </CardTitle>
                  <CardDescription>Connect with other developers and users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                        <Code className="h-5 w-5 text-white dark:text-black" />
                      </div>
                      <div>
                        <div className="font-semibold">GitHub</div>
                        <div className="text-sm text-muted-foreground">Source code, issues, and contributions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Discord</div>
                        <div className="text-sm text-muted-foreground">Real-time chat and developer support</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Telegram</div>
                        <div className="text-sm text-muted-foreground">Community discussions and announcements</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Twitter</div>
                        <div className="text-sm text-muted-foreground">Latest news and updates</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Developer Resources
                  </CardTitle>
                  <CardDescription>Tools and resources for developers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span><strong>API Documentation</strong> - Complete API reference with examples</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span><strong>Smart Contract Source</strong> - Verified contract code on GitHub</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span><strong>SDK Documentation</strong> - TypeScript SDK with examples</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span><strong>Integration Guide</strong> - Step-by-step integration tutorials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span><strong>Bug Bounty Program</strong> - Responsible disclosure rewards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span><strong>Feature Requests</strong> - Community-driven development</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contributing to XpSwap</CardTitle>
                <CardDescription>Help us build the future of DeFi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Code className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-semibold mb-2">Code Contributions</h4>
                    <p className="text-sm text-muted-foreground">Submit pull requests for bug fixes and new features</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h4 className="font-semibold mb-2">Documentation</h4>
                    <p className="text-sm text-muted-foreground">Improve our documentation and tutorials</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <h4 className="font-semibold mb-2">Security Audits</h4>
                    <p className="text-sm text-muted-foreground">Help us identify and fix security vulnerabilities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">📚 Documentation First</h4>
                    <p className="text-sm text-muted-foreground">Check our comprehensive documentation before asking questions</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🐛 Bug Reports</h4>
                    <p className="text-sm text-muted-foreground">Use GitHub Issues for bug reports with detailed reproduction steps</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">💡 Feature Requests</h4>
                    <p className="text-sm text-muted-foreground">Submit feature requests via GitHub Discussions with use cases</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🚨 Security Issues</h4>
                    <p className="text-sm text-muted-foreground">Report security vulnerabilities privately to security@xpswap.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "getting-started":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Step-by-step guide to using XpSwap DEX
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>1. Connect Wallet</CardTitle>
                <CardDescription>Connect to Xphere network using MetaMask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Network Information</h4>
                  <CodeBlock
                    id="network-config"
                    language="json"
                    code={`{
  "chainId": "0x1350829",
  "chainName": "Xphere Blockchain",
  "nativeCurrency": {
    "name": "XP",
    "symbol": "XP",
    "decimals": 18
  },
  "rpcUrls": ["https://en-bkk.x-phere.com"],
  "blockExplorerUrls": ["https://explorer.x-phere.com"]
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "community":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Community & Support</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Join our community and get support
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>GitHub Repository</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Discord Community</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Telegram Group</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Twitter Updates</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Developer Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>API Documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Smart Contract Source</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Bug Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Feature Requests</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <nav className="space-y-1 p-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeSection === item.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setActiveSection(item.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.title}
                        </Button>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-8">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}