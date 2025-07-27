# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XPSwap DEX is a comprehensive decentralized exchange built on the Xphere blockchain, featuring AMM trading, yield farming, cross-chain bridging, options/futures trading, flash loans, and comprehensive DeFi functionality. The project uses a full-stack TypeScript architecture with React frontend, Express backend, and Solidity smart contracts.

## Common Development Commands

### Development
```bash
# Start full development environment (recommended)
npm run dev:full              # Runs both client (5179) and server (5000)

# Individual services
npm run dev:client            # Frontend only
npm run dev:server            # Backend only
npm run dev                   # Backend only (alias)

# Production
npm run build                 # Build both client and server
npm run build:client          # Frontend build only
npm run build:server          # Backend build only
npm run start                 # Run production build
```

### Testing
```bash
# Core testing
npm test                      # Run all tests
npm run test:watch            # Watch mode for development
npm run test:coverage         # Generate coverage report

# Specific test suites
npm run test:security         # Security-focused tests
npm run test:api              # API endpoint tests
npm run test:components       # React component tests

# Type checking
npm run check                 # TypeScript compilation check
```

### Blockchain Development
```bash
# Smart contract compilation and testing
npm run hardhat:compile      # Compile all contracts
npm run hardhat:test         # Run contract tests
npm run hardhat:node         # Start local Hardhat network

# Database operations
npm run db:push              # Push schema changes to database
npm run db:generate          # Generate migration files

# Deployment
npm run deploy:contracts     # Deploy all contracts (generic)
npm run deploy:xphere        # Deploy to Xphere network
npm run deploy:localhost     # Deploy to local network
```

## Architecture Overview

### Stack Components
- **Frontend**: React 18 + TypeScript + Vite (port 5179)
- **Backend**: Express.js + TypeScript (port 5000)
- **Database**: SQLite (dev) / PostgreSQL (prod) with Drizzle ORM
- **Blockchain**: Hardhat + ethers.js + web3.js for Xphere network
- **Testing**: Vitest with jsdom environment
- **Build**: Vite (frontend) + ESBuild (backend)

### Key Architectural Patterns

#### Web3 Integration
The project uses both `ethers.js` and `web3.js` libraries:
- **ethers.js**: Primary Web3 interactions, contract calls, wallet connections
- **web3.js**: Secondary support for specific blockchain operations
- **Web3Context**: Centralized wallet state management
- **useWeb3 hook**: Wallet connection and transaction handling

#### API Architecture
Server uses modular route structure in `server/routes/`:
- **common.ts**: Health checks, basic data
- **trading.ts**: Swap operations, price feeds
- **defi.ts**: Liquidity pools, farming, staking
- **bridge.ts**: Cross-chain operations
- **security.ts**: MEV protection, risk analysis
- **advanced.ts**: Options, futures, flash loans

#### Smart Contract Structure
Production-ready contracts in `contracts/`:
- **XpSwapDEX.sol**: Core AMM functionality
- **XpSwapAdvancedAMM.sol**: Enhanced AMM with MEV protection
- **XpSwapGovernanceToken.sol**: XPS governance token
- **XpSwapFarmingRewards.sol**: Yield farming mechanics
- **Security contracts**: MEV, flash loan, and options security

### Data Flow
1. Frontend components use React Query for API state management
2. API calls routed through `/api/*` endpoints to Express server
3. Server handles business logic, database operations, and blockchain interactions
4. Real-time WebSocket connections for price updates
5. Li.Fi SDK integration for cross-chain bridging operations

## Environment Configuration

### Development Setup
```env
# Core settings
NODE_ENV=development
DATABASE_URL=./test.db

# Blockchain (required for contract deployment)
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_prefix
XPHERE_RPC_URL=https://en-bkk.x-phere.com
GAS_PRICE=20000000000
GAS_LIMIT=8000000

# Optional APIs
COINMARKETCAP_API_KEY=your_api_key
```

### Network Configuration
- **Xphere Network**: Chain ID 20250217
- **Local Development**: Proxy configuration in vite.config.ts routes `/api` to localhost:5000
- **Production Base Path**: `/xpswap/` for deployment

## Development Workflow

### Frontend Development
- Components organized by feature in `client/src/components/`
- Pages use file-based routing with wouter
- Shared UI components from shadcn/ui in `components/ui/`
- Custom hooks in `hooks/` for Web3, balances, and contract interactions
- Utility functions in `lib/` for Web3 services and contract interactions

### Backend Development
- Express server with TypeScript in `server/`
- Route handlers organized by feature area
- Middleware for security, validation, and enhanced logging
- Database schema in `shared/schema.ts` with Drizzle ORM
- Blockchain services for contract interaction and price feeds

### Smart Contract Development
- Solidity ^0.8.24 with OpenZeppelin imports
- Hardhat configuration for Xphere network deployment
- TypeChain integration for type-safe contract interactions
- Security-focused contracts with reentrancy guards and MEV protection

## Testing Strategy

### Test Organization
- **Unit tests**: Individual components and functions
- **Integration tests**: API endpoints and database operations
- **Security tests**: Vulnerability scanning and contract security
- **Component tests**: React component behavior with Testing Library

### Test Configuration
- **Vitest** with jsdom environment for React components
- **@testing-library/react** for component testing
- **Coverage reporting** with v8 provider
- **Setup file**: `tests/setup.ts` for test environment configuration

## Build and Deployment

### Build Process
1. **Frontend**: Vite bundles React app to `dist/public`
2. **Backend**: ESBuild bundles server to `dist/index.js`
3. **Contracts**: Hardhat compiles to `artifacts/` directory

### Deployment Sequence
1. Compile contracts: `npm run hardhat:compile`
2. Deploy contracts: `npm run deploy:xphere`
3. Update contract addresses in frontend configuration
4. Build application: `npm run build`
5. Deploy to server with base path `/xpswap/`

## Key Implementation Details

### Web3 Provider Management
- Multiple wallet support: MetaMask, ZIGAP Wallet
- Automatic network switching to Xphere
- Contract address management through configuration files
- Real-time balance and price updates

### Security Implementation
- Rate limiting on all API endpoints
- Input validation using Zod schemas
- CORS and Helmet middleware configuration
- Smart contract security with OpenZeppelin patterns

### Performance Optimizations
- API response caching with configurable TTL
- WebSocket connections for real-time data
- Lazy loading of components and routes
- Optimized bundle splitting with Vite

## Troubleshooting

### Common Issues
- **Port conflicts**: Ensure 5179 (frontend) and 5000 (backend) are available
- **Contract deployment**: Check private key format (no 0x prefix) and gas settings
- **API proxy**: Verify vite.config.ts proxy configuration for `/api` routes
- **TypeScript errors**: Run `npm run check` to identify compilation issues

### Development Environment
- Clear `node_modules` and reinstall if dependency issues occur
- Check environment variables are properly configured
- Verify Xphere network configuration in MetaMask
- Review hardhat.config.ts for correct network settings

## Documentation References

- **README.md**: Project overview and quick start guide
- **DEVELOPERS_GUIDE.md**: Comprehensive technical documentation
- **API_REFERENCE.md**: Complete API endpoint documentation
- **doc/SMART_CONTRACT_DEPLOYMENT.md**: Contract deployment procedures
- **SECURITY_AUDIT_REPORT_2025.md**: Security audit findings and fixes