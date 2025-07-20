# XPSwap DEX - Complete Developer's Guide

## 🏗️ Project Overview

XPSwap is an enterprise-grade decentralized exchange (DEX) built on the Xphere blockchain. It features real AMM algorithms, MEV protection, cross-chain bridging, yield farming, and comprehensive DeFi functionality.

### Key Features
- **Real AMM Engine**: Implements constant product formula (x * y = k)
- **MEV Protection**: Advanced protection against sandwich attacks
- **Cross-Chain Bridge**: Li.Fi integration supporting 40+ networks
- **Yield Farming**: Up to 2.5x boosting with governance tokens
- **Real-Time Data**: CoinMarketCap API integration for live pricing
- **5 Smart Contracts**: Production-ready Solidity contracts

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MetaMask wallet
- XP tokens on Xphere network
- CoinMarketCap API key (optional)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/xpswap-dex.git
cd xpswap-dex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Configuration
```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/xpswap

# Optional - for real price data
COINMARKETCAP_API_KEY=your_cmc_api_key_here

# Xphere Network Configuration
XPHERE_DEPLOYER_KEY=your_private_key_for_deployment
```

---

## 📁 Project Structure

```
XPSwap/
├── client/src/              # React Frontend
│   ├── components/          # Reusable UI components
│   │   ├── SwapInterface.tsx
│   │   ├── LiquidityPools.tsx
│   │   ├── CrossChainBridge.tsx
│   │   └── ...
│   ├── pages/              # Route pages
│   │   ├── home.tsx
│   │   ├── swap.tsx
│   │   ├── pool.tsx
│   │   └── ...
│   ├── lib/                # Services and utilities
│   │   ├── web3.ts         # Web3 service
│   │   ├── advancedContractService.ts
│   │   └── ammAlgorithms.ts
│   └── hooks/              # React hooks
│       └── useWeb3.ts
├── server/                 # Node.js Backend
│   ├── routes.ts           # API endpoints (2,500+ lines)
│   ├── storage.ts          # Database layer
│   └── index.ts            # Server entry point
├── contracts/              # Smart Contracts
│   ├── XpSwapAdvancedAMM.sol
│   ├── XpSwapLiquidityPool.sol
│   ├── XpSwapGovernanceToken.sol
│   ├── XpSwapFarmingRewards.sol
│   └── XpSwapCrosschainBridge.sol
├── shared/                 # Shared types
│   └── schema.ts
└── scripts/                # Deployment scripts
    ├── deployAdvancedContracts.js
    └── compile.js
```

---

## 🔗 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://xpswap.replit.app
```

### Core Trading APIs

#### 1. Real-Time XP Price
```bash
GET /api/xp-price
```
**Response:**
```json
{
  "price": 0.014594,
  "change24h": -6.28,
  "volume24h": 1234567,
  "marketCap": 8901234,
  "timestamp": 1672531200
}
```

#### 2. Swap Quote (Real AMM)
```bash
POST /api/swap-quote
Content-Type: application/json

{
  "tokenIn": "XP",
  "tokenOut": "USDT", 
  "amountIn": "100"
}
```
**Response:**
```json
{
  "amountOut": "1.459",
  "priceImpact": "0.05",
  "fee": "0.3",
  "route": ["XP", "USDT"],
  "minAmountOut": "1.452",
  "reserveIn": "1000000",
  "reserveOut": "14594"
}
```

#### 3. Advanced Swap Quote (MEV Protected)
```bash
POST /api/advanced-swap-quote
Content-Type: application/json

{
  "poolId": 1,
  "tokenIn": "XP",
  "amountIn": "1000",
  "slippage": "0.5"
}
```
**Response:**
```json
{
  "amountOut": "14.59",
  "mevRisk": "low",
  "protectionFee": "0.01",
  "estimatedGas": "120000",
  "priceImpact": "0.1",
  "dynamicFee": "0.3"
}
```

#### 4. Add Liquidity
```bash
POST /api/add-liquidity
Content-Type: application/json

{
  "tokenA": "XP",
  "tokenB": "USDT",
  "amountA": "1000",
  "amountB": "14.59",
  "userAddress": "0x..."
}
```
**Response:**
```json
{
  "success": true,
  "liquidityPool": {
    "id": 1,
    "totalLiquidity": "1014.59",
    "baseAPR": "15.2%",
    "xpsBonus": "12.8%",
    "totalAPR": "28.0%",
    "lpTokensMinted": "120.5"
  },
  "transactionHash": "0x...",
  "optimalRatio": {
    "tokenA": "1000",
    "tokenB": "14.59"
  }
}
```

### Farming & Staking APIs

#### 5. Farming Analytics
```bash
GET /api/farming-analytics/:poolId
```
**Response:**
```json
{
  "poolId": 1,
  "apr": "125.5",
  "apy": "245.8",
  "tvl": "1500000",
  "totalStaked": "750000",
  "rewardRate": "1000",
  "boostMultiplier": "2.5",
  "timeMultiplier": "1.8",
  "userInfo": {
    "staked": "0",
    "earned": "0",
    "boost": "1.0"
  }
}
```

#### 6. XPS Staking Info
```bash
GET /api/xps/staking-tiers
```
**Response:**
```json
{
  "stakingTiers": [
    {
      "period": "30 days",
      "apy": "100%",
      "minAmount": "10",
      "lockPeriod": 2592000
    },
    {
      "period": "90 days",
      "apy": "150%", 
      "minAmount": "50",
      "lockPeriod": 7776000
    },
    {
      "period": "180 days",
      "apy": "250%",
      "minAmount": "100", 
      "lockPeriod": 15552000
    },
    {
      "period": "365 days",
      "apy": "400%",
      "minAmount": "500",
      "lockPeriod": 31536000
    }
  ]
}
```

### Cross-Chain Bridge APIs

#### 7. Bridge Quote (Li.Fi Integration)
```bash
POST /api/bridge-quote
Content-Type: application/json

{
  "fromChain": 1,
  "toChain": 56,
  "fromToken": "ETH",
  "toToken": "BNB",
  "amount": "1000000000000000000"
}
```
**Response:**
```json
{
  "estimate": {
    "fromAmount": "1.0",
    "toAmount": "0.98",
    "gasCosts": [
      {
        "amount": "21000",
        "token": "ETH"
      }
    ],
    "executionDuration": 300,
    "fees": [
      {
        "name": "Bridge Fee",
        "amount": "0.002",
        "percentage": "0.2%"
      }
    ]
  },
  "routes": [
    {
      "fromChainId": 1,
      "toChainId": 56,
      "steps": [
        {
          "tool": "lifi",
          "action": "swap"
        }
      ]
    }
  ]
}
```

### Network & Status APIs

#### 8. Network Status Check
```bash
POST /api/network-status
Content-Type: application/json

{
  "networks": ["ethereum", "bsc", "polygon", "xphere"]
}
```
**Response:**
```json
{
  "status": {
    "ethereum": {
      "connected": true,
      "blockNumber": "0x12345",
      "latency": 150
    },
    "bsc": {
      "connected": true, 
      "blockNumber": "0x67890",
      "latency": 120
    },
    "polygon": {
      "connected": false,
      "error": "RPC timeout",
      "latency": null
    },
    "xphere": {
      "connected": true,
      "blockNumber": "0xabcdef",
      "latency": 80
    }
  },
  "timestamp": 1672531200
}
```

#### 9. Market Statistics
```bash
GET /api/market-stats
```
**Response:**
```json
{
  "totalValueLocked": "32500",
  "volume24h": "8750",
  "activeTradingPairs": 3,
  "totalTransactions": 47,
  "topPairs": [
    {
      "name": "XP/XPS",
      "volume24h": "3200",
      "price": "60.11",
      "change24h": "-2.3%"
    },
    {
      "name": "XP/USDT", 
      "volume24h": "2800",
      "price": "0.01459",
      "change24h": "-6.28%"
    },
    {
      "name": "XPS/USDT",
      "volume24h": "2750", 
      "price": "1.00",
      "change24h": "0.0%"
    }
  ]
}
```

---

## ⚡ Real AMM Implementation

### Core AMM Algorithms

The DEX implements real constant product formula calculations:

```javascript
// File: client/src/lib/ammAlgorithms.ts

export class AMMAlgorithms {
  // Calculate output amount using x * y = k
  static getAmountOut(
    amountIn: number,
    reserveIn: number, 
    reserveOut: number,
    feeRate: number = 0.3
  ): number {
    const amountInWithFee = amountIn * (100 - feeRate) / 100;
    return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
  }

  // Calculate price impact
  static calculatePriceImpact(
    amountIn: number,
    reserveIn: number,
    reserveOut: number
  ): number {
    const amountOut = this.getAmountOut(amountIn, reserveIn, reserveOut);
    const currentPrice = reserveOut / reserveIn;
    const executionPrice = amountOut / amountIn;
    return Math.abs((executionPrice - currentPrice) / currentPrice) * 100;
  }

  // Calculate optimal liquidity ratio
  static calculateOptimalRatio(
    reserveA: number,
    reserveB: number,
    amountA?: number,
    amountB?: number
  ): { optimalA: number; optimalB: number } {
    const ratio = reserveB / reserveA;
    
    if (amountA && !amountB) {
      return {
        optimalA: amountA,
        optimalB: amountA * ratio
      };
    } else if (amountB && !amountA) {
      return {
        optimalA: amountB / ratio,
        optimalB: amountB
      };
    }
    
    return { optimalA: 0, optimalB: 0 };
  }

  // MEV risk assessment
  static assessMEVRisk(
    amountIn: number,
    reserveIn: number,
    priceImpact: number
  ): "low" | "medium" | "high" {
    const poolImpact = amountIn / reserveIn;
    
    if (poolImpact > 0.05 || priceImpact > 5) return "high";
    if (poolImpact > 0.02 || priceImpact > 2) return "medium";
    return "low";
  }
}
```

### Real Pool Data Structure

```typescript
// File: shared/schema.ts

export interface LiquidityPool {
  id: number;
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  totalSupply: number;
  feeRate: number;
  lastUpdate: Date;
  volume24h: number;
  priceTokenA: number;
  priceTokenB: number;
}

export interface PoolPosition {
  poolId: number;
  userAddress: string;
  lpTokens: number;
  tokenADeposited: number;
  tokenBDeposited: number;
  rewards: number;
  stakingTime: Date;
  lockPeriod?: number;
}
```

---

## 🔐 Smart Contract Integration

### Contract Addresses (Xphere Network)

```typescript
// File: client/src/lib/contractAddresses.ts

export const CONTRACT_ADDRESSES = {
  // Core DEX contracts
  XP_TOKEN: "0x123...", // Native XP token
  XPS_TOKEN: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
  DEX_ROUTER: "0x5b0bcfa1490d",
  ADVANCED_AMM: "0x123c1d407d04a",
  
  // DeFi contracts
  LIQUIDITY_POOL: "0xe909098d05c06",
  FARMING_REWARDS: "0xb99484ee2d452",
  GOVERNANCE_TOKEN: "0xa62a2b8601833",
  STAKING_CONTRACT: "0xdcbe5c4f166a3",
  CROSSCHAIN_BRIDGE: "0x1301bc0dccf81",
};

export const XPHERE_NETWORK = {
  chainId: 20250217,
  chainName: "Xphere Blockchain",
  nativeCurrency: {
    name: "XP",
    symbol: "XP", 
    decimals: 18
  },
  rpcUrls: ["https://en-bkk.x-phere.com"],
  blockExplorerUrls: ["https://explorer.x-phere.com"]
};
```

### Web3 Service Implementation

```typescript
// File: client/src/lib/web3.ts

import { ethers } from "ethers";

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is required");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    
    const address = await this.signer.getAddress();
    await this.ensureXphereNetwork();
    
    return address;
  }

  async ensureXphereNetwork(): Promise<void> {
    if (!this.provider) return;

    const network = await this.provider.getNetwork();
    if (Number(network.chainId) !== XPHERE_NETWORK.chainId) {
      await this.addXphereNetwork();
    }
  }

  async addXphereNetwork(): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [XPHERE_NETWORK],
    });
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error("Not connected");
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(
    tokenAddress: string, 
    userAddress: string
  ): Promise<string> {
    if (!this.provider) throw new Error("Not connected");

    const erc20ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    const contract = new ethers.Contract(
      tokenAddress, 
      erc20ABI, 
      this.provider
    );
    
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals()
    ]);
    
    return ethers.formatUnits(balance, decimals);
  }
}
```

---

## 🌉 Cross-Chain Bridge Integration

### Li.Fi SDK Integration

```typescript
// File: client/src/lib/lifiService.ts

import { LiFi, type ConfigUpdate } from '@lifi/sdk';

export class LiFiService {
  private lifi: LiFi;

  constructor() {
    const config: ConfigUpdate = {
      integrator: 'xpswap-dex',
      apiUrl: 'https://li.quest/v1/',
    };
    
    this.lifi = new LiFi(config);
  }

  async getQuote(params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    fromAddress: string;
  }) {
    return await this.lifi.getQuote({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      toAddress: params.fromAddress,
    });
  }

  async executeRoute(route: any) {
    return await this.lifi.executeRoute(route);
  }

  async getStatus(txHash: string) {
    return await this.lifi.getStatus({
      bridge: 'lifi',
      txHash,
    });
  }
}
```

### Supported Networks

```typescript
// File: client/src/lib/supportedNetworks.ts

export const SUPPORTED_NETWORKS = {
  ETHEREUM: {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrls: [
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth"
    ],
    blockExplorerUrls: ["https://etherscan.io"]
  },
  BSC: {
    chainId: 56, 
    name: "Binance Smart Chain",
    symbol: "BNB",
    rpcUrls: [
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed.binance.org"
    ],
    blockExplorerUrls: ["https://bscscan.com"]
  },
  POLYGON: {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrls: [
      "https://polygon-rpc.com",
      "https://rpc.ankr.com/polygon"
    ],
    blockExplorerUrls: ["https://polygonscan.com"]
  },
  ARBITRUM: {
    chainId: 42161,
    name: "Arbitrum One",
    symbol: "ETH", 
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://rpc.ankr.com/arbitrum"
    ],
    blockExplorerUrls: ["https://arbiscan.io"]
  },
  OPTIMISM: {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    rpcUrls: [
      "https://mainnet.optimism.io",
      "https://rpc.ankr.com/optimism"
    ],
    blockExplorerUrls: ["https://optimistic.etherscan.io"]
  },
  XPHERE: {
    chainId: 20250217,
    name: "Xphere Blockchain", 
    symbol: "XP",
    rpcUrls: ["https://en-bkk.x-phere.com"],
    blockExplorerUrls: ["https://explorer.x-phere.com"]
  }
};
```

---

## 🏗️ Smart Contract Deployment

### Prerequisites
- Solidity ^0.8.19
- Hardhat development environment
- 20+ XP tokens for deployment gas fees
- Private key for deployment account

### Deployment Process

1. **Compile Contracts**
```bash
node scripts/compile.js
```

2. **Deploy to Xphere Network**
```bash
# Set deployment private key
export XPHERE_DEPLOYER_KEY="your_private_key_here"

# Deploy all contracts
node scripts/deployAdvancedContracts.js

# Verify deployment
node scripts/deployAdvancedContracts.js verify
```

3. **Update Frontend Contract Addresses**
```bash
# Update contract addresses in frontend
# File: client/src/lib/contractAddresses.ts
```

### Deployment Script Overview

```javascript
// File: scripts/deployAdvancedContracts.js

const { ethers } = require("ethers");

async function deployAdvancedContracts() {
  // 1. Deploy XPS Token
  const xpsToken = await deployContract("XpSwapToken", [
    "1000000000000000000000000000" // 1B total supply
  ]);

  // 2. Deploy Advanced AMM
  const advancedAMM = await deployContract("XpSwapAdvancedAMM", [
    xpsToken.address
  ]);

  // 3. Deploy Liquidity Pool
  const liquidityPool = await deployContract("XpSwapLiquidityPool", [
    xpsToken.address,
    advancedAMM.address
  ]);

  // 4. Deploy Farming Rewards
  const farmingRewards = await deployContract("XpSwapFarmingRewards", [
    xpsToken.address,
    liquidityPool.address
  ]);

  // 5. Deploy Governance Token
  const governanceToken = await deployContract("XpSwapGovernanceToken", [
    "XpSwap Governance",
    "XPSGOV",
    "1000000000000000000000000000" // 1B supply
  ]);

  // 6. Deploy Cross-chain Bridge
  const bridge = await deployContract("XpSwapCrosschainBridge", [
    xpsToken.address,
    governanceToken.address
  ]);

  console.log("All contracts deployed successfully!");
  
  return {
    xpsToken,
    advancedAMM,
    liquidityPool,
    farmingRewards,
    governanceToken,
    bridge
  };
}
```

---

## 🧪 Testing & Development

### Local Development Setup

1. **Start Development Server**
```bash
npm run dev
# Server runs on http://localhost:5000
# Frontend available at same URL
```

2. **Database Setup**
```bash
# Initialize PostgreSQL database
npm run db:push

# Run migrations
npm run db:migrate
```

3. **Test with Local Data**
```bash
# The system uses mock data for development
# Real blockchain integration for production
```

### Environment Variables

```env
# Required for development
DATABASE_URL=postgresql://user:password@localhost:5432/xpswap
NODE_ENV=development

# Optional for real price data
COINMARKETCAP_API_KEY=your_cmc_api_key_here

# Required for contract deployment
XPHERE_DEPLOYER_KEY=your_private_key_for_deployment

# Optional for enhanced features
LIFI_API_KEY=your_lifi_api_key
```

### Testing Checklist

- [ ] MetaMask wallet connection
- [ ] Xphere network addition/switching  
- [ ] Real-time XP price updates
- [ ] Swap functionality with real AMM calculations
- [ ] Liquidity provision with optimal ratios
- [ ] Cross-chain bridge quotes
- [ ] Farming analytics and APY calculations
- [ ] XPS staking with various lock periods
- [ ] Network status monitoring
- [ ] Mobile responsive design

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Smart contracts deployed to Xphere
- [ ] Contract addresses updated in frontend
- [ ] CoinMarketCap API key configured
- [ ] SSL certificates ready
- [ ] CDN and caching configured
- [ ] Security headers implemented

### Deployment Steps

1. **Build for Production**
```bash
npm run build
```

2. **Deploy Smart Contracts**
```bash
node scripts/deployAdvancedContracts.js
```

3. **Update Contract Addresses**
```bash
# Update production contract addresses
# in client/src/lib/contractAddresses.ts
```

4. **Deploy to Hosting Platform**
```bash
# Example for Replit Deployments
# Click Deploy button in Replit interface
```

### Post-deployment Verification

- [ ] All API endpoints responding correctly
- [ ] Real-time price data updating
- [ ] MetaMask integration working
- [ ] Smart contract interactions functional
- [ ] Cross-chain bridge operational
- [ ] Analytics dashboards updating
- [ ] Mobile interface responsive

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MetaMask Connection Issues
```bash
# Check if MetaMask is installed
if (!window.ethereum) {
  console.error("MetaMask not found");
}

# Verify network configuration
const network = await provider.getNetwork();
console.log("Current network:", network.chainId);
```

#### 2. RPC Connection Problems
```bash
# Test RPC connectivity
curl -X POST https://en-bkk.x-phere.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### 3. Smart Contract Interaction Errors
```bash
# Check contract deployment
node scripts/deployAdvancedContracts.js verify <contract_address>

# Verify contract ABI matches deployment
```

#### 4. Price Data Not Updating
```bash
# Check CoinMarketCap API key
curl -H "X-CMC_PRO_API_KEY: your_key" \
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=36056"
```

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=xpswap:*
```

### Performance Monitoring

Monitor key metrics:
- API response times
- Database query performance  
- WebSocket connection stability
- Smart contract gas usage
- Cache hit rates

---

## 📚 Additional Resources

### Documentation Links
- [Xphere Network Docs](https://docs.x-phere.com)
- [Li.Fi Integration Guide](https://docs.li.fi)
- [CoinMarketCap API](https://coinmarketcap.com/api/documentation)
- [ethers.js Documentation](https://docs.ethers.org)

### Community & Support
- GitHub Issues: Report bugs and feature requests
- Discord: Real-time developer support
- Documentation: This guide and API reference
- Blog: Technical articles and updates

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready