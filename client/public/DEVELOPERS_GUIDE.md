# XpSwap DEX Developer's Guide

Version: 1.0.0  
Last Updated: January 2025

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Smart Contracts](#smart-contracts)
5. [Frontend Development](#frontend-development)
6. [Backend Development](#backend-development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Best Practices](#best-practices)

## Project Overview

XpSwap DEX is an enterprise-grade decentralized exchange built on the Xphere blockchain, offering advanced trading features including options, futures, flash loans, and cross-chain capabilities.

### Key Features
- Real AMM with x * y = k formula
- MEV protection system
- 5 core smart contracts
- Cross-chain bridge (Li.Fi integration)
- Advanced trading: Options, Futures, Flash Loans
- Real-time price data (CoinMarketCap API)

## Architecture

```
XpSwap DEX Architecture

├── Frontend (React + TypeScript)
│   ├── Components (50+ reusable components)
│   ├── Pages (11 main pages)
│   ├── Hooks (15+ custom hooks)
│   └── Services (API, blockchain, bridge)
│
├── Backend (Node.js + Express)
│   ├── API Routes (26 endpoints)
│   ├── AMM Engine
│   ├── Security Middleware
│   └── Database (SQLite)
│
└── Smart Contracts (Solidity)
    ├── XpSwapToken.sol
    ├── XpSwapDEX.sol
    ├── XpSwapLiquidityPool.sol
    ├── XpSwapFarmingRewards.sol
    └── XpSwapGovernance.sol
```

## Development Setup

### Prerequisites
- Node.js v18.20.0+
- npm v10.0.0+
- Git
- MetaMask wallet
- VS Code (recommended)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/xpswap/xpswap-dex.git
cd xpswap-dex
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create `.env` file:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=./test.db
COINMARKETCAP_API_KEY=your_api_key
BASE_PATH=/xpswap
```

4. **Start development server**
```bash
npm run dev
```

Access at: http://localhost:5000/xpswap/

## Smart Contracts

### Contract Addresses (Xphere Network)

| Contract | Address | Description |
|----------|---------|-------------|
| XpSwapToken | 0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2 | XPS governance token |
| XpSwapDEX | 0x5b0bcfa1490d | Main DEX router |
| XpSwapAdvancedAMM | 0x123c1d407d04a | MEV protection AMM |
| XpSwapLiquidityPool | 0xe909098d05c06 | Time-locked liquidity |
| XpSwapFarmingRewards | 0xb99484ee2d452 | Yield farming rewards |

### Deployment

1. **Compile contracts**
```bash
npx hardhat compile
```

2. **Deploy to testnet**
```bash
npx hardhat run scripts/deploy.js --network xphere-testnet
```

3. **Verify contracts**
```bash
npx hardhat verify --network xphere CONTRACT_ADDRESS
```

## Frontend Development

### Component Structure
```
src/
├── components/
│   ├── ui/          # Base UI components
│   ├── Layout.tsx   # Main layout
│   └── ...          # Feature components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── services/        # External services
└── lib/            # Utilities
```

### Key Technologies
- React 18.3
- TypeScript 5.2
- Tailwind CSS 3.4
- Framer Motion 11
- Radix UI
- React Query (TanStack)
- ethers.js 6.13

### State Management
```typescript
// Using React Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['tokenPrice', 'XP'],
  queryFn: () => fetchTokenPrice('XP'),
  staleTime: 10000 // 10 seconds
});

// Using Zustand for client state
const useWalletStore = create((set) => ({
  address: null,
  balance: 0,
  connect: async () => {
    // Wallet connection logic
  }
}));
```

## Backend Development

### API Structure
```
server/
├── routes/
│   ├── api.ts         # Main API routes
│   ├── blockchain.ts  # Blockchain interactions
│   ├── security.ts    # Security endpoints
│   └── bridge.ts      # Cross-chain bridge
├── middleware/
│   ├── auth.ts        # Authentication
│   ├── cors.ts        # CORS configuration
│   └── rateLimit.ts   # Rate limiting
└── index.ts          # Server entry point
```

### Database Schema
```sql
-- Pools table
CREATE TABLE pools (
  id INTEGER PRIMARY KEY,
  pair VARCHAR(50),
  token0 VARCHAR(42),
  token1 VARCHAR(42),
  reserve0 DECIMAL(36,18),
  reserve1 DECIMAL(36,18),
  tvl DECIMAL(36,18),
  volume24h DECIMAL(36,18),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  tx_hash VARCHAR(66) UNIQUE,
  type VARCHAR(20),
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  amount DECIMAL(36,18),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- SwapInterface.test.tsx
```

### Integration Tests
```bash
# Test smart contracts
npx hardhat test

# Test API endpoints
npm run test:api
```

### E2E Tests
```bash
# Using Playwright
npm run test:e2e
```

## Deployment

### Production Build
```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server

# Build all
npm run build
```

### Server Deployment

1. **Prepare server**
```bash
# SSH to server
ssh user@server

# Install dependencies
sudo apt update
sudo apt install nodejs npm nginx
```

2. **Deploy with PM2**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 config
pm2 save
pm2 startup
```

3. **Nginx configuration**
```nginx
location /xpswap/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Best Practices

### Security
- Always validate user inputs
- Use parameterized queries
- Implement rate limiting
- Enable CORS properly
- Use HTTPS in production
- Regular security audits

### Performance
- Lazy load components
- Optimize bundle size
- Use CDN for static assets
- Enable gzip compression
- Implement caching strategies
- Monitor with PM2

### Code Quality
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write comprehensive tests
- Document complex logic
- Regular code reviews
- Keep dependencies updated

## Support & Resources

- **Documentation**: https://trendy.storydot.kr/xpswap/documentation
- **GitHub**: https://github.com/xpswap
- **Discord**: https://discord.gg/xpswap
- **Email**: support@xpswap.com

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting pull requests.

## License

XpSwap DEX is licensed under the MIT License. See [LICENSE](LICENSE) for details.
