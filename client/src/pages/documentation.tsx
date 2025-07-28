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
  CheckCircle,
  Target,
  Coins,
  Bolt,
  Repeat
} from "lucide-react";

import { getApiUrl } from "@/lib/apiUrl";
const navigationItems = [
  { id: "overview", title: "Overview", icon: BookOpen },
  { id: "getting-started", title: "Getting Started", icon: Zap },
  { id: "advanced-trading", title: "Advanced Trading", icon: Target },
  { id: "token-services", title: "Token Services", icon: Coins },
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

?å‚? Frontend (React + TypeScript)
?? ?ú‚? Real-time price data (CoinMarketCap API)
?? ?ú‚? MetaMask wallet integration
?? ?ú‚? Advanced swap interface
?? ?î‚? Analytics dashboard

?ú‚? Backend (Node.js + Express)
?? ?ú‚? Real AMM calculation engine
?? ?ú‚? MEV protection algorithms
?? ?ú‚? Farming analytics API
?? ?î‚? PostgreSQL database

?î‚? Smart Contracts (Solidity)
   ?ú‚? XpSwapAdvancedAMM.sol
   ?ú‚? XpSwapLiquidityPool.sol
   ?ú‚? XpSwapGovernanceToken.sol
   ?ú‚? XpSwapFarmingRewards.sol
   ?î‚? XpSwapCrosschainBridge.sol`}
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
                Comprehensive documentation for all XpSwap DEX API endpoints
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">30+ Endpoints</Badge>
                <Badge variant="secondary">Real-time Data</Badge>
                <Badge variant="secondary">RESTful API</Badge>
                <Badge variant="secondary">WebSocket Support</Badge>
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
                      https://trendy.storydot.kr/xpswap/api
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
                    code={`curl https://trendy.storydot.kr/xpswap/api/xp-price`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Get Swap Quote</h4>
                  <CodeBlock
                    id="swap-quote"
                    language="bash"
                    code={`curl -X POST https://trendy.storydot.kr/xpswap/api/swap-quote \\
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
                      <h4 className="font-semibold mb-3">?åê Real-time Network Status</h4>
                      <ul className="space-y-2 text-sm">
                        <li>??Live RPC connectivity monitoring</li>
                        <li>??Network health indicators</li>
                        <li>??Automatic failover to backup RPCs</li>
                        <li>??Visual network status dashboard</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">??One-click Network Addition</h4>
                      <ul className="space-y-2 text-sm">
                        <li>??Auto-add networks to MetaMask</li>
                        <li>??Pre-configured RPC endpoints</li>
                        <li>??Automatic network switching</li>
                        <li>??Built-in network detection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">?îó Cross-chain Bridge</h4>
                      <ul className="space-y-2 text-sm">
                        <li>??Li.Fi SDK integration</li>
                        <li>??40+ blockchain support</li>
                        <li>??Real-time bridge quotes</li>
                        <li>??Multi-route optimization</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">?íß High Availability</h4>
                      <ul className="space-y-2 text-sm">
                        <li>??Multiple fallback RPC URLs</li>
                        <li>??Load balancing across providers</li>
                        <li>??99.9% uptime guarantee</li>
                        <li>??Redundant infrastructure</li>
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
const bridgeQuote = await fetch(getApiUrl("/api/bridge-quote', {
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
                        <li>??Sandwich attack detection and blocking</li>
                        <li>??Dynamic fee adjustment (volatility-based)</li>
                        <li>??Maximum slippage protection</li>
                        <li>??Timestamp-based verification</li>
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
                        <li>??<strong>Basic Farming:</strong> Base rewards from LP token staking</li>
                        <li>??<strong>Governance Boosting:</strong> Up to 1.5x with XPS token staking</li>
                        <li>??<strong>Time Locking:</strong> Additional boosting from long-term locks</li>
                        <li>??<strong>Auto-compounding:</strong> Automatic reward reinvestment</li>
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
                        <li>??Time-weighted voting power</li>
                        <li>??Delegated voting support</li>
                        <li>??Proposal creation and execution</li>
                        <li>??Community treasury management</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">XPS Token Utility</h4>
                      <ul className="space-y-1 text-sm">
                        <li>??Fee discounts (up to 75% for Diamond tier)</li>
                        <li>??Yield farming boost multipliers</li>
                        <li>??Governance voting rights</li>
                        <li>??Exclusive feature access</li>
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
                        <span className="text-sm">??Ethereum (ETH)</span>
                        <span className="text-sm">??Binance Smart Chain (BNB)</span>
                        <span className="text-sm">??Polygon (MATIC)</span>
                        <span className="text-sm">??Arbitrum (ETH)</span>
                        <span className="text-sm">??Optimism (ETH)</span>
                        <span className="text-sm">??Xphere (XP)</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bridge Features</h4>
                      <ul className="space-y-1 text-sm">
                        <li>??Real-time quotes and route optimization</li>
                        <li>??Automatic slippage protection</li>
                        <li>??Transaction status tracking</li>
                        <li>??Multi-step bridge operations</li>
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
  apiUrl: 'https://trendy.storydot.kr/xpswap/api',
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
                        code={`const baseUrl = 'https://trendy.storydot.kr/xpswap/api';

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
                        <li>??100 requests per minute per IP</li>
                        <li>??Burst allowance: 20 requests in 10 seconds</li>
                        <li>??Rate limit headers included in responses</li>
                        <li>??Automatic retry with exponential backoff recommended</li>
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
  src="https://trendy.storydot.kr/xpswap/widget/swap"
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
  src="https://trendy.storydot.kr/xpswap/widget/price?token=XP"
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
                    <a href="https://github.com/xpswap" target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                          <Code className="h-5 w-5 text-white dark:text-black" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            GitHub
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <div className="text-sm text-muted-foreground">Source code, issues, and contributions</div>
                        </div>
                      </div>
                    </a>
                    
                    <a href="https://discord.gg/xpswap" target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            Discord
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <div className="text-sm text-muted-foreground">Real-time chat and developer support</div>
                        </div>
                      </div>
                    </a>
                    
                    <a href="https://t.me/xpswap_official" target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            Telegram
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <div className="text-sm text-muted-foreground">Community discussions and announcements</div>
                        </div>
                      </div>
                    </a>
                    
                    <a href="https://twitter.com/xpswap" target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            Twitter/X
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <div className="text-sm text-muted-foreground">Latest news and updates</div>
                        </div>
                      </div>
                    </a>
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
                    <h4 className="font-semibold mb-2">?ìö Documentation First</h4>
                    <p className="text-sm text-muted-foreground">Check our comprehensive documentation before asking questions</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">?êõ Bug Reports</h4>
                    <p className="text-sm text-muted-foreground">Use GitHub Issues for bug reports with detailed reproduction steps</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">?í° Feature Requests</h4>
                    <p className="text-sm text-muted-foreground">Submit feature requests via GitHub Discussions with use cases</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">?ö® Security Issues</h4>
                    <p className="text-sm text-muted-foreground">Report security vulnerabilities privately to security@xpswap.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "advanced-trading":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Advanced Trading Features</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Professional trading tools including Options, Futures, Flash Loans, and Atomic Swaps
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">Options Trading</Badge>
                <Badge variant="secondary">Futures Contracts</Badge>
                <Badge variant="secondary">Flash Loans</Badge>
                <Badge variant="secondary">Atomic Swaps</Badge>
                <Badge variant="secondary">MemeCoin Launchpad</Badge>
              </div>
            </div>

            <Tabs defaultValue="options" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="futures">Futures</TabsTrigger>
                <TabsTrigger value="flashloans">Flash Loans</TabsTrigger>
                <TabsTrigger value="atomic">Atomic Swaps</TabsTrigger>
                <TabsTrigger value="memecoins">MemeCoin</TabsTrigger>
              </TabsList>

              <TabsContent value="options" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Options Trading
                    </CardTitle>
                    <CardDescription>
                      Sophisticated options contracts with American and European style execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">?éØ Option Types</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??<strong>Call Options:</strong> Right to buy at strike price</li>
                          <li>??<strong>Put Options:</strong> Right to sell at strike price</li>
                          <li>??<strong>American Style:</strong> Exercise anytime before expiry</li>
                          <li>??<strong>European Style:</strong> Exercise only at expiry</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">??Key Features</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??Real-time Black-Scholes pricing</li>
                          <li>??Automated IV calculations</li>
                          <li>??Multi-collateral support</li>
                          <li>??Advanced Greeks display</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Options Pricing Formula</h4>
                      <CodeBlock
                        id="options-pricing"
                        language="javascript"
                        code={`// Black-Scholes Options Pricing Model
function calculateOptionPrice(S, K, T, r, sigma, optionType) {
  const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  const d2 = d1 - sigma*Math.sqrt(T);
  
  if (optionType === 'call') {
    return S * cumulativeNormal(d1) - K * Math.exp(-r*T) * cumulativeNormal(d2);
  } else {
    return K * Math.exp(-r*T) * cumulativeNormal(-d2) - S * cumulativeNormal(-d1);
  }
}

// Calculate Greeks for risk management
function calculateGreeks(S, K, T, r, sigma) {
  const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  const d2 = d1 - sigma*Math.sqrt(T);
  
  return {
    delta: cumulativeNormal(d1),
    gamma: normalDensity(d1) / (S * sigma * Math.sqrt(T)),
    theta: -(S * normalDensity(d1) * sigma) / (2 * Math.sqrt(T)) - 
           r * K * Math.exp(-r*T) * cumulativeNormal(d2),
    vega: S * normalDensity(d1) * Math.sqrt(T),
    rho: K * T * Math.exp(-r*T) * cumulativeNormal(d2)
  };
}`}
                      />
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                            Professional Trading Tools
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Advanced Greeks monitoring, volatility surface visualization, 
                            and risk management tools for professional options traders.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="futures" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Futures Contracts
                    </CardTitle>
                    <CardDescription>
                      Leveraged futures trading with up to 10x margin and advanced risk management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">?ìà Contract Types</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??<strong>Perpetual Futures:</strong> No expiry date</li>
                          <li>??<strong>Quarterly Futures:</strong> 3-month expiry</li>
                          <li>??<strong>Weekly Futures:</strong> Weekly settlements</li>
                          <li>??<strong>Inverse Futures:</strong> Settled in base currency</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">??Trading Features</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??Up to 10x leverage available</li>
                          <li>??Cross and isolated margin modes</li>
                          <li>??Advanced order types (OCO, Stop-Loss)</li>
                          <li>??Real-time funding rate updates</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Futures Pricing & Funding</h4>
                      <CodeBlock
                        id="futures-pricing"
                        language="javascript"
                        code={`// Futures Fair Value Calculation
function calculateFuturesFairValue(spotPrice, riskFreeRate, timeToExpiry, dividendYield = 0) {
  return spotPrice * Math.exp((riskFreeRate - dividendYield) * timeToExpiry);
}

// Perpetual Funding Rate Calculation
function calculateFundingRate(markPrice, indexPrice, premium, clampMin = -0.0075, clampMax = 0.0075) {
  const premiumIndex = (markPrice - indexPrice) / indexPrice;
  const interestRate = 0.0001; // 0.01% per 8 hours
  
  let fundingRate = Math.max(0, premiumIndex - clampMax) + 
                    Math.min(0, premiumIndex - clampMin) + 
                    interestRate;
                    
  return Math.max(clampMin, Math.min(clampMax, fundingRate));
}

// Position Value and PnL Calculation
function calculatePositionPnL(entryPrice, currentPrice, quantity, isLong) {
  const priceDiff = currentPrice - entryPrice;
  return isLong ? quantity * priceDiff : quantity * (-priceDiff);
}

// Liquidation Price Calculation
function calculateLiquidationPrice(entryPrice, leverage, marginRatio, isLong) {
  if (isLong) {
    return entryPrice * (1 - (1/leverage) + marginRatio);
  } else {
    return entryPrice * (1 + (1/leverage) - marginRatio);
  }
}`}
                      />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                            Risk Management
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Comprehensive risk controls including position limits, auto-deleveraging, 
                            and insurance fund protection for all futures positions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flashloans" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bolt className="h-5 w-5" />
                      Flash Loans
                    </CardTitle>
                    <CardDescription>
                      Uncollateralized loans executed within a single transaction block
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">??Use Cases</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??<strong>Arbitrage Trading:</strong> Cross-DEX price differences</li>
                          <li>??<strong>Debt Refinancing:</strong> Switch between protocols</li>
                          <li>??<strong>Liquidation Protection:</strong> Save positions from liquidation</li>
                          <li>??<strong>Collateral Swapping:</strong> Change collateral types</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">?îß Technical Features</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??Zero collateral required</li>
                          <li>??0.09% flash loan fee</li>
                          <li>??Multi-asset flash loans</li>
                          <li>??Atomic execution guarantee</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Flash Loan Implementation</h4>
                      <CodeBlock
                        id="flashloan-impl"
                        language="solidity"
                        code={`// Flash Loan Contract Interface
interface IXpSwapFlashLoan {
    function flashLoan(
        address receiverAddress,
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata modes,
        address onBehalfOf,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

// Flash Loan Receiver Implementation
contract FlashLoanArbitrageBot is IFlashLoanReceiver {
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // 1. Perform arbitrage logic here
        for (uint i = 0; i < assets.length; i++) {
            uint256 amountOwing = amounts[i] + premiums[i];
            
            // Execute arbitrage trade
            performArbitrage(assets[i], amounts[i]);
            
            // Approve repayment
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        
        return true;
    }
    
    function performArbitrage(address asset, uint256 amount) internal {
        // Buy low on DEX A
        uint256 received = swapOnDEXA(asset, amount);
        
        // Sell high on DEX B
        uint256 profit = swapOnDEXB(asset, received);
        
        require(profit > amount, "Arbitrage not profitable");
    }
}`}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">JavaScript Integration</h4>
                      <CodeBlock
                        id="flashloan-js"
                        language="javascript"
                        code={`// Flash Loan API Call
async function executeFlashLoan(assets, amounts, params) {
  const flashLoanData = {
    assets: assets,           // ['0x...', '0x...'] - Token addresses
    amounts: amounts,         // ['1000000000000000000', '500000000000000000']
    modes: [0, 0],           // 0 = no open debt, 1 = stable rate, 2 = variable rate
    onBehalfOf: userAddress,
    params: params,          // Encoded parameters for your strategy
    referralCode: 0
  };

  const tx = await flashLoanContract.flashLoan(
    flashLoanData.assets,
    flashLoanData.amounts,
    flashLoanData.modes,
    flashLoanData.onBehalfOf,
    flashLoanData.params,
    flashLoanData.referralCode
  );

  return await tx.wait();
}

// Example: Arbitrage Flash Loan
const arbitrageParams = ethers.utils.defaultAbiCoder.encode(
  ['address', 'address', 'uint256'],
  [dexAAddress, dexBAddress, expectedProfitThreshold]
);

await executeFlashLoan(
  ['0x...'], // USDT address
  ['1000000000000000000'], // 1000 USDT
  arbitrageParams
);`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="atomic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Repeat className="h-5 w-5" />
                      Atomic Swaps
                    </CardTitle>
                    <CardDescription>
                      Trustless cross-chain asset exchanges using Hash Time Locked Contracts (HTLC)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">?îó Supported Chains</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??<strong>Xphere ??Ethereum:</strong> XP ??ETH/USDT</li>
                          <li>??<strong>Xphere ??BSC:</strong> XP ??BNB/BUSD</li>
                          <li>??<strong>Xphere ??Polygon:</strong> XP ??MATIC/USDC</li>
                          <li>??<strong>Bitcoin Integration:</strong> XP ??BTC (via HTLC)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">?õ°Ô∏?Security Features</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??No counterparty risk</li>
                          <li>??Cryptographic proof of funds</li>
                          <li>??Automatic refund after timeout</li>
                          <li>??Multi-signature support</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">HTLC Smart Contract</h4>
                      <CodeBlock
                        id="atomic-swap"
                        language="solidity"
                        code={`// Hash Time Locked Contract (HTLC) for Atomic Swaps
contract XpSwapHTLC {
    struct AtomicSwap {
        bytes32 hashlock;
        uint256 timelock;
        address sender;
        address receiver;
        uint256 amount;
        address token;
        bool withdrawn;
        bool refunded;
        bytes32 preimage;
    }
    
    mapping(bytes32 => AtomicSwap) public swaps;
    
    event SwapCreated(
        bytes32 indexed swapId,
        address indexed sender,
        address indexed receiver,
        bytes32 hashlock,
        uint256 timelock,
        uint256 amount
    );
    
    function createSwap(
        bytes32 _swapId,
        bytes32 _hashlock,
        uint256 _timelock,
        address _receiver,
        address _token,
        uint256 _amount
    ) external payable {
        require(swaps[_swapId].sender == address(0), "Swap already exists");
        require(_timelock > block.timestamp, "Timelock must be in future");
        
        if (_token == address(0)) {
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }
        
        swaps[_swapId] = AtomicSwap({
            hashlock: _hashlock,
            timelock: _timelock,
            sender: msg.sender,
            receiver: _receiver,
            amount: _amount,
            token: _token,
            withdrawn: false,
            refunded: false,
            preimage: bytes32(0)
        });
        
        emit SwapCreated(_swapId, msg.sender, _receiver, _hashlock, _timelock, _amount);
    }
    
    function withdraw(bytes32 _swapId, bytes32 _preimage) external {
        AtomicSwap storage swap = swaps[_swapId];
        
        require(swap.receiver == msg.sender, "Only receiver can withdraw");
        require(swap.hashlock == sha256(abi.encodePacked(_preimage)), "Invalid preimage");
        require(!swap.withdrawn && !swap.refunded, "Already completed");
        require(block.timestamp < swap.timelock, "Timelock expired");
        
        swap.withdrawn = true;
        swap.preimage = _preimage;
        
        if (swap.token == address(0)) {
            payable(swap.receiver).transfer(swap.amount);
        } else {
            IERC20(swap.token).transfer(swap.receiver, swap.amount);
        }
    }
    
    function refund(bytes32 _swapId) external {
        AtomicSwap storage swap = swaps[_swapId];
        
        require(swap.sender == msg.sender, "Only sender can refund");
        require(block.timestamp >= swap.timelock, "Timelock not yet expired");
        require(!swap.withdrawn && !swap.refunded, "Already completed");
        
        swap.refunded = true;
        
        if (swap.token == address(0)) {
            payable(swap.sender).transfer(swap.amount);
        } else {
            IERC20(swap.token).transfer(swap.sender, swap.amount);
        }
    }
}`}
                      />
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Repeat className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100">
                            Cross-Chain DeFi Bridge
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Enable trustless asset transfers between different blockchains 
                            without relying on centralized exchanges or bridge operators.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="memecoins" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      MemeCoin Launchpad
                    </CardTitle>
                    <CardDescription>
                      Fair launch platform for community-driven meme tokens with anti-rug mechanisms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">?? Launch Features</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??<strong>Fair Launch:</strong> No pre-sales or allocations</li>
                          <li>??<strong>Bonding Curves:</strong> Automatic price discovery</li>
                          <li>??<strong>Rug Protection:</strong> Locked liquidity for 1 year</li>
                          <li>??<strong>Community Voting:</strong> Feature upgrades via governance</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">?õ°Ô∏?Safety Mechanisms</h4>
                        <ul className="space-y-2 text-sm">
                          <li>??Immutable smart contracts</li>
                          <li>??Automatic liquidity locks</li>
                          <li>??Maximum transaction limits</li>
                          <li>??Honeypot detection system</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Bonding Curve Implementation</h4>
                      <CodeBlock
                        id="bonding-curve"
                        language="solidity"
                        code={`// MemeCoin Bonding Curve Contract
contract MemeCoinLaunchpad {
    uint256 public constant CURVE_COEFFICIENT = 1e18;
    uint256 public constant GRADUATION_THRESHOLD = 69420 * 1e18; // 69,420 tokens
    
    struct TokenLaunch {
        address token;
        string name;
        string symbol;
        string imageUrl;
        string description;
        address creator;
        uint256 supply;
        uint256 sold;
        bool graduated;
        uint256 liquidityLocked;
    }
    
    mapping(address => TokenLaunch) public launches;
    
    // Bonding curve formula: price = (supply / 1000) ^ 2
    function getBuyPrice(address token, uint256 amount) public view returns (uint256) {
        TokenLaunch memory launch = launches[token];
        uint256 currentSupply = launch.sold;
        
        // Calculate integral of bonding curve
        uint256 startPrice = (currentSupply * currentSupply) / (CURVE_COEFFICIENT * 1000);
        uint256 endSupply = currentSupply + amount;
        uint256 endPrice = (endSupply * endSupply) / (CURVE_COEFFICIENT * 1000);
        
        return endPrice - startPrice;
    }
    
    function buyTokens(address token, uint256 amount) external payable {
        TokenLaunch storage launch = launches[token];
        require(!launch.graduated, "Token has graduated to DEX");
        
        uint256 cost = getBuyPrice(token, amount);
        require(msg.value >= cost, "Insufficient payment");
        
        // Check if graduation threshold reached
        if (launch.sold + amount >= GRADUATION_THRESHOLD) {
            graduateToken(token);
        }
        
        launch.sold += amount;
        IERC20(token).transfer(msg.sender, amount);
        
        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }
    
    function graduateToken(address token) internal {
        TokenLaunch storage launch = launches[token];
        
        // Create DEX pair with collected ETH
        address pair = IUniswapFactory(FACTORY).createPair(token, WETH);
        
        // Add initial liquidity (locked for 1 year)
        uint256 tokenAmount = IERC20(token).balanceOf(address(this));
        uint256 ethAmount = address(this).balance;
        
        IERC20(token).approve(ROUTER, tokenAmount);
        IUniswapRouter(ROUTER).addLiquidityETH{value: ethAmount}(
            token,
            tokenAmount,
            0,
            0,
            LOCK_CONTRACT, // LP tokens sent to time lock
            block.timestamp + 3600
        );
        
        launch.graduated = true;
        launch.liquidityLocked = block.timestamp + 365 days;
    }
    
    // Create new MemeCoin
    function createMemeCoin(
        string memory name,
        string memory symbol,
        string memory imageUrl,
        string memory description
    ) external returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, name, symbol));
        
        // Deploy new ERC-20 token
        address token = Clones.cloneDeterministic(MEME_TOKEN_TEMPLATE, salt);
        IMemeCoinToken(token).initialize(name, symbol, 1000000 * 1e18); // 1M supply
        
        launches[token] = TokenLaunch({
            token: token,
            name: name,
            symbol: symbol,
            imageUrl: imageUrl,
            description: description,
            creator: msg.sender,
            supply: 1000000 * 1e18,
            sold: 0,
            graduated: false,
            liquidityLocked: 0
        });
        
        return token;
    }
}`}
                      />
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Coins className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                            Community-Driven Launch
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Every token launched through our platform follows strict anti-rug measures 
                            and fair distribution mechanisms to protect community investors.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "token-services":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Token Services</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Comprehensive token management including XPS governance token and staking rewards
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">XPS Token</Badge>
                <Badge variant="secondary">Staking Rewards</Badge>
                <Badge variant="secondary">Fee Discounts</Badge>
                <Badge variant="secondary">Governance Rights</Badge>
              </div>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    XPS Governance Token
                  </CardTitle>
                  <CardDescription>
                    Native governance token with utility benefits and fee discount tiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-semibold text-blue-900 dark:text-blue-100">Bronze Tier</div>
                      <div className="text-2xl font-bold text-blue-600">25% Off</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Hold 1,000+ XPS</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-semibold text-purple-900 dark:text-purple-100">Gold Tier</div>
                      <div className="text-2xl font-bold text-purple-600">50% Off</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Hold 10,000+ XPS</div>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="font-semibold text-yellow-900 dark:text-yellow-100">Diamond Tier</div>
                      <div className="text-2xl font-bold text-yellow-600">75% Off</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">Hold 100,000+ XPS</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">XPS Staking Rewards</h4>
                    <CodeBlock
                      id="xps-staking"
                      language="javascript"
                      code={`// XPS Staking APY Calculation
function calculateStakingAPY(lockPeriod, amount) {
  const baseAPY = {
    90: 0.15,   // 15% for 90 days
    180: 0.25,  // 25% for 180 days 
    365: 0.40   // 40% for 1 year
  };
  
  const tierMultiplier = amount >= 100000 ? 1.5 : // Diamond tier
                        amount >= 10000 ? 1.3 :  // Gold tier
                        amount >= 1000 ? 1.1 : 1.0; // Bronze tier
  
  return baseAPY[lockPeriod] * tierMultiplier;
}

// Current XPS Price Calculation
const xpsPrice = 1.00; // Fixed at $1.00 USD
const totalSupply = 21000000; // 21M XPS total supply
const circulatingSupply = 15750000; // 75% circulating`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Buy XPS Token</CardTitle>
                  <CardDescription>Purchase XPS using XP tokens with instant settlement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Current XPS Price</h4>
                        <p className="text-2xl font-bold text-green-600">$1.00 USD</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Pay with XP tokens</p>
                      </div>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setActiveSection('xps-buy')}
                      >
                        Buy XPS
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Purchase Process</h4>
                      <ul className="space-y-1 text-sm">
                        <li>1. Connect your wallet</li>
                        <li>2. Enter XPS amount to purchase</li>
                        <li>3. Approve XP token spending</li>
                        <li>4. Complete transaction</li>
                        <li>5. XPS tokens instantly in wallet</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Benefits</h4>
                      <ul className="space-y-1 text-sm">
                        <li>??Instant settlement</li>
                        <li>??No price slippage</li>
                        <li>??Automatic fee discounts</li>
                        <li>??Staking rewards eligible</li>
                        <li>??Governance voting power</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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