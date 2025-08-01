import{r as w,a8 as D,Z as f,v as S,z as v,a4 as g,H as j,P as y,y as N,U as P,j as e,aA as X,a0 as I,E as h,o as n,h as B,i as q}from"./react-vendor-whffYpp3.js";import{C as s,d as i,e as t,c as a,B as p,o as l,f as r}from"./index-BkmNh__t.js";import{T as k,a as C,b as o,c as m}from"./tabs-bZ5-BZyw.js";import{S as O}from"./scroll-area-DGTAAPel.js";import"./vendor-C9R_Cz-L.js";import"./utils-BkLtITBR.js";import"./router-Chclg4Zx.js";import"./ui-DDPZ4K8P.js";import"./web3-DuRBVa1D.js";const R=[{id:"overview",title:"Overview",icon:D},{id:"getting-started",title:"Getting Started",icon:f},{id:"advanced-trading",title:"Advanced Trading",icon:S},{id:"token-services",title:"Token Services",icon:v},{id:"developers-guide",title:"Developer's Guide",icon:g},{id:"api-reference",title:"Complete API Reference",icon:g},{id:"smart-contracts",title:"Smart Contracts",icon:j},{id:"multi-network",title:"Multi-Network Trading",icon:y},{id:"defi-features",title:"DeFi Features",icon:N},{id:"integration",title:"Integration Guide",icon:y},{id:"community",title:"Community",icon:P}],_=[{name:"XpSwapToken (XPS)",address:"0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",description:"Native XPS token with fee discount tiers and deflationary mechanisms",functions:["transfer","approve","burn","getFeeDiscountTier","updateFeeDiscountTier"]},{name:"XpSwapDEX Main Router",address:"0x5b0bcfa1490d",description:"Main DEX router with real AMM algorithms (x * y = k)",functions:["swapExactTokensForTokens","addLiquidity","removeLiquidity","getAmountOut","getAmountIn"]},{name:"XpSwapAdvancedAMM",address:"0x123c1d407d04a",description:"Advanced automated market maker with MEV protection system",functions:["swapExactTokensForTokens","addLiquidity","removeLiquidity","getAmountOut","calculateMevRisk"]},{name:"XpSwapLiquidityPool",address:"0xe909098d05c06",description:"Time-locked liquidity and auto-compounding system",functions:["stake","unstake","claimRewards","compound","getPoolInfo"]},{name:"XpSwapFarmingRewards",address:"0xb99484ee2d452",description:"Yield farming with governance token boosting",functions:["stakeLPTokens","claimRewards","boostRewards","getRewardRate","getUserFarmInfo"]}];function J(){const[T,b]=w.useState("overview"),[E,A]=w.useState(null);w.useEffect(()=>{const d=window.location.hash.replace("#","");d&&R.some(u=>u.id===d)&&b(d);const x=()=>{b("api-reference")};return window.addEventListener("navigate-to-api",x),()=>{window.removeEventListener("navigate-to-api",x)}},[]);const M=(d,x)=>{navigator.clipboard.writeText(d),A(x),setTimeout(()=>A(null),2e3)},c=({code:d,language:x="json",id:u})=>e.jsxs("div",{className:"relative",children:[e.jsx("pre",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm",children:e.jsx("code",{className:`language-${x}`,children:d})}),e.jsx(p,{variant:"ghost",size:"sm",className:"absolute top-2 right-2 h-8 w-8 p-0",onClick:()=>M(d,u),children:E===u?e.jsx(B,{className:"h-4 w-4 text-green-500"}):e.jsx(q,{className:"h-4 w-4"})})]}),F=()=>{switch(T){case"overview":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"XpSwap DEX Documentation"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Enterprise-grade decentralized exchange built on Xphere blockchain"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-8",children:[e.jsx(r,{variant:"secondary",children:"Real AMM Engine"}),e.jsx(r,{variant:"secondary",children:"MEV Protection"}),e.jsx(r,{variant:"secondary",children:"5 Smart Contracts"}),e.jsx(r,{variant:"secondary",children:"Real-time Price Data"}),e.jsx(r,{variant:"secondary",children:"Cross-chain Bridge"})]})]}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs(s,{children:[e.jsx(i,{children:e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(f,{className:"h-5 w-5"}),"Core Features"]})}),e.jsxs(a,{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Real constant product formula (x * y = k) AMM"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"MEV protection and sandwich attack prevention"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Up to 2.5x yield boosting"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Multi-network cross-chain bridge"})]})]})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(j,{className:"h-5 w-5"}),"Tech Stack"]})}),e.jsxs(a,{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Xphere Blockchain (Chain ID: 20250217)"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Solidity + OpenZeppelin libraries"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"React + TypeScript + ethers.js"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"CoinMarketCap real-time API"})]})]})]})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{children:"Architecture Overview"})}),e.jsx(a,{children:e.jsx(c,{id:"architecture",language:"text",code:`XpSwap DEX Architecture

?��? Frontend (React + TypeScript)
?? ?��? Real-time price data (CoinMarketCap API)
?? ?��? MetaMask wallet integration
?? ?��? Advanced swap interface
?? ?��? Analytics dashboard

?��? Backend (Node.js + Express)
?? ?��? Real AMM calculation engine
?? ?��? MEV protection algorithms
?? ?��? Farming analytics API
?? ?��? PostgreSQL database

?��? Smart Contracts (Solidity)
   ?��? XpSwapAdvancedAMM.sol
   ?��? XpSwapLiquidityPool.sol
   ?��? XpSwapGovernanceToken.sol
   ?��? XpSwapFarmingRewards.sol
   ?��? XpSwapCrosschainBridge.sol`})})]})]});case"developers-guide":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Complete Developer's Guide"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Comprehensive guide for developers integrating with XpSwap DEX"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-8",children:[e.jsx(r,{variant:"secondary",children:"Project Structure"}),e.jsx(r,{variant:"secondary",children:"Smart Contract Deployment"}),e.jsx(r,{variant:"secondary",children:"Frontend Integration"}),e.jsx(r,{variant:"secondary",children:"Testing & Production"})]})]}),e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(h,{className:"h-5 w-5"}),"External Documentation"]}),e.jsx(l,{children:"Access the complete developer documentation"})]}),e.jsx(a,{className:"space-y-4",children:e.jsx("div",{className:"p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-blue-900 dark:text-blue-100",children:"Complete Developer's Guide"}),e.jsx("p",{className:"text-sm text-blue-700 dark:text-blue-300",children:"In-depth technical documentation covering project structure, deployment, and integration"})]}),e.jsxs(p,{variant:"outline",className:"ml-4",onClick:()=>window.open("/DEVELOPERS_GUIDE.md","_blank"),children:[e.jsx(h,{className:"h-4 w-4 mr-2"}),"View Guide"]})]})})})]}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs(s,{children:[e.jsx(i,{children:e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(g,{className:"h-5 w-5"}),"Quick Start"]})}),e.jsx(a,{className:"space-y-3",children:e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-semibold",children:"Installation"}),e.jsx(c,{id:"quick-install",language:"bash",code:`# Clone repository
git clone https://github.com/your-org/xpswap-dex.git
cd xpswap-dex

# Install dependencies
npm install

# Start development server
npm run dev`})]})})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(f,{className:"h-5 w-5"}),"Key Features"]})}),e.jsxs(a,{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Real AMM with x * y = k formula"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"26 comprehensive API endpoints"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Smart contract deployment scripts"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsx("span",{children:"Production-ready infrastructure"})]})]})]})]})]});case"api-reference":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Complete API Reference"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Comprehensive documentation for all XpSwap DEX API endpoints"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-8",children:[e.jsx(r,{variant:"secondary",children:"30+ Endpoints"}),e.jsx(r,{variant:"secondary",children:"Real-time Data"}),e.jsx(r,{variant:"secondary",children:"RESTful API"}),e.jsx(r,{variant:"secondary",children:"WebSocket Support"})]})]}),e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(h,{className:"h-5 w-5"}),"Complete API Documentation"]}),e.jsx(l,{children:"Access the full API reference with detailed examples and response schemas"})]}),e.jsx(a,{className:"space-y-4",children:e.jsx("div",{className:"p-4 bg-green-50 dark:bg-green-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-green-900 dark:text-green-100",children:"Complete API Reference"}),e.jsx("p",{className:"text-sm text-green-700 dark:text-green-300",children:"Comprehensive documentation for all API endpoints with examples, error handling, and SDK integration"})]}),e.jsxs(p,{variant:"outline",className:"ml-4",onClick:()=>window.open("/API_REFERENCE.md","_blank"),children:[e.jsx(h,{className:"h-4 w-4 mr-2"}),"View Full API Docs"]})]})})})]}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{children:"API Categories"})}),e.jsxs(a,{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Core Trading (4 endpoints)"})," - Swap quotes, liquidity"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Market Data (4 endpoints)"})," - Prices, pools, ticker"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"DeFi Features (4 endpoints)"})," - Farming, staking"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Cross-Chain (4 endpoints)"})," - Bridge, networks"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Governance (4 endpoints)"})," - XPS, airdrop"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Analytics (6 endpoints)"})," - Portfolio, health"]})]})]})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{children:"Base Information"})}),e.jsxs(a,{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Base URL"}),e.jsx("code",{className:"bg-muted px-2 py-1 rounded",children:"https://trendy.storydot.kr/xpswap/api"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Content-Type"}),e.jsx("code",{className:"bg-muted px-2 py-1 rounded",children:"application/json"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Rate Limiting"}),e.jsx("p",{children:"100 requests per minute per IP"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Authentication"}),e.jsx("p",{children:"No authentication required"})]})]})]})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{children:"Quick API Examples"})}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Get XP Price"}),e.jsx(c,{id:"xp-price",language:"bash",code:"curl https://trendy.storydot.kr/xpswap/api/xp-price"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Get Swap Quote"}),e.jsx(c,{id:"swap-quote",language:"bash",code:`curl -X POST https://trendy.storydot.kr/xpswap/api/swap-quote \\
  -H "Content-Type: application/json" \\
  -d '{"tokenIn":"XP","tokenOut":"USDT","amountIn":"100"}'`})]})]})]})]});case"smart-contracts":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Smart Contracts"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Detailed information about XpSwap's deployed smart contracts on Xphere Network"})]}),e.jsx("div",{className:"grid gap-6",children:_.map((d,x)=>e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(j,{className:"h-5 w-5"}),d.name]}),e.jsx(r,{variant:"outline",children:"Verified"})]}),e.jsx(l,{children:d.description})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Contract Address"}),e.jsx("code",{className:"bg-muted px-2 py-1 rounded text-sm",children:d.address})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Key Functions"}),e.jsx("div",{className:"grid grid-cols-2 gap-2",children:d.functions.map((u,L)=>e.jsxs("code",{className:"bg-muted px-2 py-1 rounded text-sm",children:[u,"()"]},L))})]})]})]},x))})]});case"multi-network":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Multi-Network Trading"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"XpSwap supports seamless trading across multiple blockchain networks via Li.Fi integration"})]}),e.jsxs("div",{className:"grid gap-6",children:[e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(y,{className:"h-5 w-5"}),"Supported Networks"]}),e.jsx(l,{children:"Trade assets across major blockchain networks with real-time RPC connectivity"})]}),e.jsx(a,{children:e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-blue-900 dark:text-blue-100",children:"Ethereum"}),e.jsx("div",{className:"text-sm text-blue-700 dark:text-blue-300",children:"Chain ID: 1"}),e.jsx("div",{className:"text-xs text-blue-600 dark:text-blue-400",children:"RPC: eth.llamarpc.com"})]}),e.jsxs("div",{className:"p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-yellow-900 dark:text-yellow-100",children:"Binance Smart Chain"}),e.jsx("div",{className:"text-sm text-yellow-700 dark:text-yellow-300",children:"Chain ID: 56"}),e.jsx("div",{className:"text-xs text-yellow-600 dark:text-yellow-400",children:"RPC: bsc-dataseed1.defibit.io"})]}),e.jsxs("div",{className:"p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-purple-900 dark:text-purple-100",children:"Polygon"}),e.jsx("div",{className:"text-sm text-purple-700 dark:text-purple-300",children:"Chain ID: 137"}),e.jsx("div",{className:"text-xs text-purple-600 dark:text-purple-400",children:"RPC: polygon-rpc.com"})]}),e.jsxs("div",{className:"p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-blue-900 dark:text-blue-100",children:"Arbitrum"}),e.jsx("div",{className:"text-sm text-blue-700 dark:text-blue-300",children:"Chain ID: 42161"}),e.jsx("div",{className:"text-xs text-blue-600 dark:text-blue-400",children:"RPC: arb1.arbitrum.io"})]}),e.jsxs("div",{className:"p-3 bg-red-50 dark:bg-red-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-red-900 dark:text-red-100",children:"Optimism"}),e.jsx("div",{className:"text-sm text-red-700 dark:text-red-300",children:"Chain ID: 10"}),e.jsx("div",{className:"text-xs text-red-600 dark:text-red-400",children:"RPC: mainnet.optimism.io"})]}),e.jsxs("div",{className:"p-3 bg-green-50 dark:bg-green-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-green-900 dark:text-green-100",children:"Xphere"}),e.jsx("div",{className:"text-sm text-green-700 dark:text-green-300",children:"Chain ID: 20250217"}),e.jsx("div",{className:"text-xs text-green-600 dark:text-green-400",children:"RPC: en-bkk.x-phere.com"})]})]})})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(f,{className:"h-5 w-5"}),"Key Features"]})}),e.jsx(a,{children:e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� Real-time Network Status"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Live RPC connectivity monitoring"}),e.jsx("li",{children:"??Network health indicators"}),e.jsx("li",{children:"??Automatic failover to backup RPCs"}),e.jsx("li",{children:"??Visual network status dashboard"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"??One-click Network Addition"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Auto-add networks to MetaMask"}),e.jsx("li",{children:"??Pre-configured RPC endpoints"}),e.jsx("li",{children:"??Automatic network switching"}),e.jsx("li",{children:"??Built-in network detection"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� Cross-chain Bridge"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Li.Fi SDK integration"}),e.jsx("li",{children:"??40+ blockchain support"}),e.jsx("li",{children:"??Real-time bridge quotes"}),e.jsx("li",{children:"??Multi-route optimization"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� High Availability"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Multiple fallback RPC URLs"}),e.jsx("li",{children:"??Load balancing across providers"}),e.jsx("li",{children:"??99.9% uptime guarantee"}),e.jsx("li",{children:"??Redundant infrastructure"})]})]})]})})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{children:"Bridge Integration Example"})}),e.jsx(a,{children:e.jsx(c,{id:"bridge-example",language:"typescript",code:`// Cross-chain bridge usage
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
console.log('Bridge estimate:', quote.estimate);`})})]})]})]});case"defi-features":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"DeFi Features"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Comprehensive guide to XpSwap's advanced DeFi features"})]}),e.jsxs(k,{defaultValue:"amm",className:"w-full",children:[e.jsxs(C,{className:"grid w-full grid-cols-4",children:[e.jsx(o,{value:"amm",children:"AMM Engine"}),e.jsx(o,{value:"farming",children:"Yield Farming"}),e.jsx(o,{value:"governance",children:"Governance"}),e.jsx(o,{value:"bridge",children:"Cross-Chain"})]}),e.jsx(m,{value:"amm",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Real AMM Engine"}),e.jsx(l,{children:"Automated market maker based on constant product formula (x * y = k)"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Core Formula"}),e.jsx(c,{id:"amm-formula",language:"javascript",code:`// Constant product formula (x * y = k)
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
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"MEV Protection"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"??Sandwich attack detection and blocking"}),e.jsx("li",{children:"??Dynamic fee adjustment (volatility-based)"}),e.jsx("li",{children:"??Maximum slippage protection"}),e.jsx("li",{children:"??Timestamp-based verification"})]})]})]})]})}),e.jsx(m,{value:"farming",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Yield Farming"}),e.jsx(l,{children:"Advanced farming system with up to 2.5x boosting capability"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Boosting System"}),e.jsx(c,{id:"boost-formula",language:"javascript",code:`// Boost calculation formula
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
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Farming Strategies"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsxs("li",{children:["??",e.jsx("strong",{children:"Basic Farming:"})," Base rewards from LP token staking"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Governance Boosting:"})," Up to 1.5x with XPS token staking"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Time Locking:"})," Additional boosting from long-term locks"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Auto-compounding:"})," Automatic reward reinvestment"]})]})]})]})]})}),e.jsx(m,{value:"governance",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Governance System"}),e.jsx(l,{children:"Decentralized governance with XPS token voting"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Voting Mechanism"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"??Time-weighted voting power"}),e.jsx("li",{children:"??Delegated voting support"}),e.jsx("li",{children:"??Proposal creation and execution"}),e.jsx("li",{children:"??Community treasury management"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"XPS Token Utility"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"??Fee discounts (up to 75% for Diamond tier)"}),e.jsx("li",{children:"??Yield farming boost multipliers"}),e.jsx("li",{children:"??Governance voting rights"}),e.jsx("li",{children:"??Exclusive feature access"})]})]})]})]})}),e.jsx(m,{value:"bridge",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Cross-Chain Bridge"}),e.jsx(l,{children:"Multi-network asset transfer via Li.Fi integration"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Supported Networks"}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsx("span",{className:"text-sm",children:"??Ethereum (ETH)"}),e.jsx("span",{className:"text-sm",children:"??Binance Smart Chain (BNB)"}),e.jsx("span",{className:"text-sm",children:"??Polygon (MATIC)"}),e.jsx("span",{className:"text-sm",children:"??Arbitrum (ETH)"}),e.jsx("span",{className:"text-sm",children:"??Optimism (ETH)"}),e.jsx("span",{className:"text-sm",children:"??Xphere (XP)"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Bridge Features"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"??Real-time quotes and route optimization"}),e.jsx("li",{children:"??Automatic slippage protection"}),e.jsx("li",{children:"??Transaction status tracking"}),e.jsx("li",{children:"??Multi-step bridge operations"})]})]})]})]})})]})]});case"integration":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Integration Guide"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Complete guide for integrating XpSwap DEX into your application"})]}),e.jsxs(k,{defaultValue:"sdk",className:"w-full",children:[e.jsxs(C,{className:"grid w-full grid-cols-3",children:[e.jsx(o,{value:"sdk",children:"SDK Integration"}),e.jsx(o,{value:"api",children:"API Integration"}),e.jsx(o,{value:"widgets",children:"Widget Embedding"})]}),e.jsx(m,{value:"sdk",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"JavaScript/TypeScript SDK"}),e.jsx(l,{children:"Complete SDK for integrating XpSwap features"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Installation"}),e.jsx(c,{id:"sdk-install",language:"bash",code:"npm install @xpswap/sdk ethers"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Basic Usage"}),e.jsx(c,{id:"sdk-usage",language:"typescript",code:`import { XpSwapSDK } from '@xpswap/sdk';

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
});`})]})]})]})}),e.jsx(m,{value:"api",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"REST API Integration"}),e.jsx(l,{children:"Direct API integration for custom implementations"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Authentication"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-2",children:"No API key required for public endpoints"}),e.jsx(c,{id:"api-auth",language:"typescript",code:`const baseUrl = 'https://trendy.storydot.kr/xpswap/api';

// All requests use standard HTTP headers
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Rate Limiting"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"??100 requests per minute per IP"}),e.jsx("li",{children:"??Burst allowance: 20 requests in 10 seconds"}),e.jsx("li",{children:"??Rate limit headers included in responses"}),e.jsx("li",{children:"??Automatic retry with exponential backoff recommended"})]})]})]})]})}),e.jsx(m,{value:"widgets",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Embeddable Widgets"}),e.jsx(l,{children:"Pre-built widgets for easy integration"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Swap Widget"}),e.jsx(c,{id:"swap-widget",language:"html",code:`<iframe 
  src="https://trendy.storydot.kr/xpswap/widget/swap"
  width="400" 
  height="600"
  frameborder="0">
</iframe>`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Price Widget"}),e.jsx(c,{id:"price-widget",language:"html",code:`<iframe 
  src="https://trendy.storydot.kr/xpswap/widget/price?token=XP"
  width="300" 
  height="200"
  frameborder="0">
</iframe>`})]})]})]})})]})]});case"community":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Community & Support"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Join our growing community and get the support you need"})]}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(P,{className:"h-5 w-5"}),"Community Channels"]}),e.jsx(l,{children:"Connect with other developers and users"})]}),e.jsx(a,{className:"space-y-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsx("a",{href:"https://github.com/xpswap",target:"_blank",rel:"noopener noreferrer",className:"block",children:e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors cursor-pointer",children:[e.jsx("div",{className:"w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center",children:e.jsx(g,{className:"h-5 w-5 text-white dark:text-black"})}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"font-semibold flex items-center gap-2",children:["GitHub",e.jsx(h,{className:"h-3 w-3"})]}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Source code, issues, and contributions"})]})]})}),e.jsx("a",{href:"https://discord.gg/xpswap",target:"_blank",rel:"noopener noreferrer",className:"block",children:e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer",children:[e.jsx("div",{className:"w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center",children:e.jsx(P,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"font-semibold flex items-center gap-2",children:["Discord",e.jsx(h,{className:"h-3 w-3"})]}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Real-time chat and developer support"})]})]})}),e.jsx("a",{href:"https://t.me/xpswap_official",target:"_blank",rel:"noopener noreferrer",className:"block",children:e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors cursor-pointer",children:[e.jsx("div",{className:"w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center",children:e.jsx(y,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"font-semibold flex items-center gap-2",children:["Telegram",e.jsx(h,{className:"h-3 w-3"})]}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Community discussions and announcements"})]})]})}),e.jsx("a",{href:"https://twitter.com/xpswap",target:"_blank",rel:"noopener noreferrer",className:"block",children:e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer",children:[e.jsx("div",{className:"w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center",children:e.jsx(N,{className:"h-5 w-5 text-white"})}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"font-semibold flex items-center gap-2",children:["Twitter/X",e.jsx(h,{className:"h-3 w-3"})]}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Latest news and updates"})]})]})})]})})]}),e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(j,{className:"h-5 w-5"}),"Developer Resources"]}),e.jsx(l,{children:"Tools and resources for developers"})]}),e.jsx(a,{className:"space-y-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"API Documentation"})," - Complete API reference with examples"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Smart Contract Source"})," - Verified contract code on GitHub"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"SDK Documentation"})," - TypeScript SDK with examples"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Integration Guide"})," - Step-by-step integration tutorials"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Bug Bounty Program"})," - Responsible disclosure rewards"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(n,{className:"h-4 w-4"}),e.jsxs("span",{children:[e.jsx("strong",{children:"Feature Requests"})," - Community-driven development"]})]})]})})]})]}),e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Contributing to XpSwap"}),e.jsx(l,{children:"Help us build the future of DeFi"})]}),e.jsx(a,{className:"space-y-4",children:e.jsxs("div",{className:"grid md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"text-center p-4 border rounded-lg",children:[e.jsx(g,{className:"h-8 w-8 mx-auto mb-2 text-blue-500"}),e.jsx("h4",{className:"font-semibold mb-2",children:"Code Contributions"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Submit pull requests for bug fixes and new features"})]}),e.jsxs("div",{className:"text-center p-4 border rounded-lg",children:[e.jsx(D,{className:"h-8 w-8 mx-auto mb-2 text-green-500"}),e.jsx("h4",{className:"font-semibold mb-2",children:"Documentation"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Improve our documentation and tutorials"})]}),e.jsxs("div",{className:"text-center p-4 border rounded-lg",children:[e.jsx(j,{className:"h-8 w-8 mx-auto mb-2 text-red-500"}),e.jsx("h4",{className:"font-semibold mb-2",children:"Security Audits"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Help us identify and fix security vulnerabilities"})]})]})})]}),e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{children:"Getting Help"})}),e.jsx(a,{children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"?�� Documentation First"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Check our comprehensive documentation before asking questions"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"?�� Bug Reports"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Use GitHub Issues for bug reports with detailed reproduction steps"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"?�� Feature Requests"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Submit feature requests via GitHub Discussions with use cases"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"?�� Security Issues"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Report security vulnerabilities privately to security@xpswap.com"})]})]})})]})]});case"advanced-trading":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Advanced Trading Features"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Professional trading tools including Options, Futures, Flash Loans, and Atomic Swaps"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-8",children:[e.jsx(r,{variant:"secondary",children:"Options Trading"}),e.jsx(r,{variant:"secondary",children:"Futures Contracts"}),e.jsx(r,{variant:"secondary",children:"Flash Loans"}),e.jsx(r,{variant:"secondary",children:"Atomic Swaps"}),e.jsx(r,{variant:"secondary",children:"MemeCoin Launchpad"})]})]}),e.jsxs(k,{defaultValue:"options",className:"w-full",children:[e.jsxs(C,{className:"grid w-full grid-cols-5",children:[e.jsx(o,{value:"options",children:"Options"}),e.jsx(o,{value:"futures",children:"Futures"}),e.jsx(o,{value:"flashloans",children:"Flash Loans"}),e.jsx(o,{value:"atomic",children:"Atomic Swaps"}),e.jsx(o,{value:"memecoins",children:"MemeCoin"})]}),e.jsx(m,{value:"options",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(S,{className:"h-5 w-5"}),"Options Trading"]}),e.jsx(l,{children:"Sophisticated options contracts with American and European style execution"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� Option Types"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsxs("li",{children:["??",e.jsx("strong",{children:"Call Options:"})," Right to buy at strike price"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Put Options:"})," Right to sell at strike price"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"American Style:"})," Exercise anytime before expiry"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"European Style:"})," Exercise only at expiry"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"??Key Features"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Real-time Black-Scholes pricing"}),e.jsx("li",{children:"??Automated IV calculations"}),e.jsx("li",{children:"??Multi-collateral support"}),e.jsx("li",{children:"??Advanced Greeks display"})]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Options Pricing Formula"}),e.jsx(c,{id:"options-pricing",language:"javascript",code:`// Black-Scholes Options Pricing Model
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
}`})]}),e.jsx("div",{className:"p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(S,{className:"h-5 w-5 text-amber-600 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-amber-900 dark:text-amber-100",children:"Professional Trading Tools"}),e.jsx("p",{className:"text-sm text-amber-700 dark:text-amber-300 mt-1",children:"Advanced Greeks monitoring, volatility surface visualization, and risk management tools for professional options traders."})]})]})})]})]})}),e.jsx(m,{value:"futures",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(N,{className:"h-5 w-5"}),"Futures Contracts"]}),e.jsx(l,{children:"Leveraged futures trading with up to 10x margin and advanced risk management"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� Contract Types"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsxs("li",{children:["??",e.jsx("strong",{children:"Perpetual Futures:"})," No expiry date"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Quarterly Futures:"})," 3-month expiry"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Weekly Futures:"})," Weekly settlements"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Inverse Futures:"})," Settled in base currency"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"??Trading Features"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Up to 10x leverage available"}),e.jsx("li",{children:"??Cross and isolated margin modes"}),e.jsx("li",{children:"??Advanced order types (OCO, Stop-Loss)"}),e.jsx("li",{children:"??Real-time funding rate updates"})]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Futures Pricing & Funding"}),e.jsx(c,{id:"futures-pricing",language:"javascript",code:`// Futures Fair Value Calculation
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
}`})]}),e.jsx("div",{className:"p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(N,{className:"h-5 w-5 text-blue-600 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-blue-900 dark:text-blue-100",children:"Risk Management"}),e.jsx("p",{className:"text-sm text-blue-700 dark:text-blue-300 mt-1",children:"Comprehensive risk controls including position limits, auto-deleveraging, and insurance fund protection for all futures positions."})]})]})})]})]})}),e.jsx(m,{value:"flashloans",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(X,{className:"h-5 w-5"}),"Flash Loans"]}),e.jsx(l,{children:"Uncollateralized loans executed within a single transaction block"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"??Use Cases"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsxs("li",{children:["??",e.jsx("strong",{children:"Arbitrage Trading:"})," Cross-DEX price differences"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Debt Refinancing:"})," Switch between protocols"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Liquidation Protection:"})," Save positions from liquidation"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Collateral Swapping:"})," Change collateral types"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� Technical Features"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Zero collateral required"}),e.jsx("li",{children:"??0.09% flash loan fee"}),e.jsx("li",{children:"??Multi-asset flash loans"}),e.jsx("li",{children:"??Atomic execution guarantee"})]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Flash Loan Implementation"}),e.jsx(c,{id:"flashloan-impl",language:"solidity",code:`// Flash Loan Contract Interface
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
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"JavaScript Integration"}),e.jsx(c,{id:"flashloan-js",language:"javascript",code:`// Flash Loan API Call
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
);`})]})]})]})}),e.jsx(m,{value:"atomic",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(I,{className:"h-5 w-5"}),"Atomic Swaps"]}),e.jsx(l,{children:"Trustless cross-chain asset exchanges using Hash Time Locked Contracts (HTLC)"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?�� Supported Chains"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsxs("li",{children:["??",e.jsx("strong",{children:"Xphere ??Ethereum:"})," XP ??ETH/USDT"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Xphere ??BSC:"})," XP ??BNB/BUSD"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Xphere ??Polygon:"})," XP ??MATIC/USDC"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Bitcoin Integration:"})," XP ??BTC (via HTLC)"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?���?Security Features"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??No counterparty risk"}),e.jsx("li",{children:"??Cryptographic proof of funds"}),e.jsx("li",{children:"??Automatic refund after timeout"}),e.jsx("li",{children:"??Multi-signature support"})]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"HTLC Smart Contract"}),e.jsx(c,{id:"atomic-swap",language:"solidity",code:`// Hash Time Locked Contract (HTLC) for Atomic Swaps
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
}`})]}),e.jsx("div",{className:"p-4 bg-green-50 dark:bg-green-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(I,{className:"h-5 w-5 text-green-600 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-green-900 dark:text-green-100",children:"Cross-Chain DeFi Bridge"}),e.jsx("p",{className:"text-sm text-green-700 dark:text-green-300 mt-1",children:"Enable trustless asset transfers between different blockchains without relying on centralized exchanges or bridge operators."})]})]})})]})]})}),e.jsx(m,{value:"memecoins",className:"space-y-6",children:e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(v,{className:"h-5 w-5"}),"MemeCoin Launchpad"]}),e.jsx(l,{children:"Fair launch platform for community-driven meme tokens with anti-rug mechanisms"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?? Launch Features"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsxs("li",{children:["??",e.jsx("strong",{children:"Fair Launch:"})," No pre-sales or allocations"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Bonding Curves:"})," Automatic price discovery"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Rug Protection:"})," Locked liquidity for 1 year"]}),e.jsxs("li",{children:["??",e.jsx("strong",{children:"Community Voting:"})," Feature upgrades via governance"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-3",children:"?���?Safety Mechanisms"}),e.jsxs("ul",{className:"space-y-2 text-sm",children:[e.jsx("li",{children:"??Immutable smart contracts"}),e.jsx("li",{children:"??Automatic liquidity locks"}),e.jsx("li",{children:"??Maximum transaction limits"}),e.jsx("li",{children:"??Honeypot detection system"})]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Bonding Curve Implementation"}),e.jsx(c,{id:"bonding-curve",language:"solidity",code:`// MemeCoin Bonding Curve Contract
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
}`})]}),e.jsx("div",{className:"p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(v,{className:"h-5 w-5 text-purple-600 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-purple-900 dark:text-purple-100",children:"Community-Driven Launch"}),e.jsx("p",{className:"text-sm text-purple-700 dark:text-purple-300 mt-1",children:"Every token launched through our platform follows strict anti-rug measures and fair distribution mechanisms to protect community investors."})]})]})})]})]})})]})]});case"token-services":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Token Services"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Comprehensive token management including XPS governance token and staking rewards"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-8",children:[e.jsx(r,{variant:"secondary",children:"XPS Token"}),e.jsx(r,{variant:"secondary",children:"Staking Rewards"}),e.jsx(r,{variant:"secondary",children:"Fee Discounts"}),e.jsx(r,{variant:"secondary",children:"Governance Rights"})]})]}),e.jsxs("div",{className:"grid gap-6",children:[e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsxs(t,{className:"flex items-center gap-2",children:[e.jsx(v,{className:"h-5 w-5"}),"XPS Governance Token"]}),e.jsx(l,{children:"Native governance token with utility benefits and fee discount tiers"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsxs("div",{className:"grid md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-blue-900 dark:text-blue-100",children:"Bronze Tier"}),e.jsx("div",{className:"text-2xl font-bold text-blue-600",children:"25% Off"}),e.jsx("div",{className:"text-sm text-blue-700 dark:text-blue-300",children:"Hold 1,000+ XPS"})]}),e.jsxs("div",{className:"p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-purple-900 dark:text-purple-100",children:"Gold Tier"}),e.jsx("div",{className:"text-2xl font-bold text-purple-600",children:"50% Off"}),e.jsx("div",{className:"text-sm text-purple-700 dark:text-purple-300",children:"Hold 10,000+ XPS"})]}),e.jsxs("div",{className:"p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-yellow-900 dark:text-yellow-100",children:"Diamond Tier"}),e.jsx("div",{className:"text-2xl font-bold text-yellow-600",children:"75% Off"}),e.jsx("div",{className:"text-sm text-yellow-700 dark:text-yellow-300",children:"Hold 100,000+ XPS"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"XPS Staking Rewards"}),e.jsx(c,{id:"xps-staking",language:"javascript",code:`// XPS Staking APY Calculation
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
const circulatingSupply = 15750000; // 75% circulating`})]})]})]}),e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"Buy XPS Token"}),e.jsx(l,{children:"Purchase XPS using XP tokens with instant settlement"})]}),e.jsxs(a,{className:"space-y-4",children:[e.jsx("div",{className:"p-4 bg-green-50 dark:bg-green-900/20 rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-green-900 dark:text-green-100",children:"Current XPS Price"}),e.jsx("p",{className:"text-2xl font-bold text-green-600",children:"$1.00 USD"}),e.jsx("p",{className:"text-sm text-green-700 dark:text-green-300",children:"Pay with XP tokens"})]}),e.jsx(p,{className:"bg-green-600 hover:bg-green-700",onClick:()=>b("xps-buy"),children:"Buy XPS"})]})}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Purchase Process"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"1. Connect your wallet"}),e.jsx("li",{children:"2. Enter XPS amount to purchase"}),e.jsx("li",{children:"3. Approve XP token spending"}),e.jsx("li",{children:"4. Complete transaction"}),e.jsx("li",{children:"5. XPS tokens instantly in wallet"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Benefits"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsx("li",{children:"??Instant settlement"}),e.jsx("li",{children:"??No price slippage"}),e.jsx("li",{children:"??Automatic fee discounts"}),e.jsx("li",{children:"??Staking rewards eligible"}),e.jsx("li",{children:"??Governance voting power"})]})]})]})]})]})]})]});case"getting-started":return e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"Getting Started"}),e.jsx("p",{className:"text-xl text-muted-foreground mb-6",children:"Step-by-step guide to using XpSwap DEX"})]}),e.jsxs(s,{children:[e.jsxs(i,{children:[e.jsx(t,{children:"1. Connect Wallet"}),e.jsx(l,{children:"Connect to Xphere network using MetaMask"})]}),e.jsx(a,{className:"space-y-4",children:e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:"font-semibold",children:"Network Information"}),e.jsx(c,{id:"network-config",language:"json",code:`{
  "chainId": "0x1350829",
  "chainName": "Xphere Blockchain",
  "nativeCurrency": {
    "name": "XP",
    "symbol": "XP",
    "decimals": 18
  },
  "rpcUrls": ["https://en-bkk.x-phere.com"],
  "blockExplorerUrls": ["https://explorer.x-phere.com"]
}`})]})})]})]});default:return null}};return e.jsx("div",{className:"container mx-auto px-4 py-8",children:e.jsxs("div",{className:"flex gap-8",children:[e.jsx("div",{className:"w-64 flex-shrink-0",children:e.jsx("div",{className:"sticky top-8",children:e.jsxs(s,{children:[e.jsx(i,{children:e.jsx(t,{className:"text-lg",children:"Documentation"})}),e.jsx(a,{className:"p-0",children:e.jsx(O,{className:"h-[600px]",children:e.jsx("nav",{className:"space-y-1 p-4",children:R.map(d=>{const x=d.icon;return e.jsxs(p,{variant:T===d.id?"secondary":"ghost",className:"w-full justify-start",onClick:()=>b(d.id),children:[e.jsx(x,{className:"h-4 w-4 mr-2"}),d.title]},d.id)})})})})]})})}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx(s,{children:e.jsx(a,{className:"p-8",children:F()})})})]})})}export{J as default};
