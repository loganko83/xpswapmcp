import Web3 from 'web3';

// 네트워크 설정
const NETWORKS = {
  xphere: {
    rpcUrl: process.env.XPHERE_RPC_URL || 'https://en-bkk.x-phere.com',
    chainId: 20250217,
    name: 'Xphere Network'
  },
  ethereum: {
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    chainId: 1,
    name: 'Ethereum Mainnet'
  },
  bsc: {
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: 56,
    name: 'Binance Smart Chain'
  }
};

// Web3 인스턴스들
const web3Instances: { [key: string]: Web3 } = {};

// Web3 인스턴스 초기화
function getWeb3Instance(network: string): Web3 {
  if (!web3Instances[network]) {
    const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }
    
    web3Instances[network] = new Web3(networkConfig.rpcUrl);
    console.log(`🌐 Initialized Web3 for ${networkConfig.name}`);
  }
  
  return web3Instances[network];
}

// ERC-20 토큰 컨트랙트 ABI (표준)
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

// 토큰 컨트랙트 주소들
const TOKEN_ADDRESSES = {
  xphere: {
    XP: '0x0000000000000000000000000000000000000000', // 네이티브 토큰
    XPS: '0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2', // XPS 토큰 주소
    USDT: '0x6485cc42b36b4c982d3f1b6ec42b92007fb0b596'
  },
  ethereum: {
    ETH: '0x0000000000000000000000000000000000000000', // 네이티브 토큰
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },
  bsc: {
    BNB: '0x0000000000000000000000000000000000000000', // 네이티브 토큰
    USDT: '0x55d398326f99059ff775485246999027b3197955',
    BUSD: '0xe9e7cea3dedca5984780bafc599bd69add087d56'
  }
};

/**
 * 실제 블록체인에서 토큰 밸런스를 가져옵니다
 */
export async function getTokenBalance(
  network: string, 
  walletAddress: string, 
  tokenSymbol: string
): Promise<{ balance: string; symbol: string; decimals: number; network: string }> {
  try {
    console.log(`🔍 Fetching ${tokenSymbol} balance for ${walletAddress} on ${network}`);
    
    const web3 = getWeb3Instance(network);
    const networkTokens = TOKEN_ADDRESSES[network as keyof typeof TOKEN_ADDRESSES];
    
    if (!networkTokens) {
      throw new Error(`Network ${network} not supported`);
    }

    const tokenAddress = networkTokens[tokenSymbol as keyof typeof networkTokens];
    
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found on ${network}`);
    }

    // 네이티브 토큰 (XP, ETH, BNB) 처리
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      const balance = await web3.eth.getBalance(walletAddress);
      const balanceInEther = web3.utils.fromWei(balance, 'ether');
      
      return {
        balance: balanceInEther,
        symbol: tokenSymbol,
        decimals: 18,
        network
      };
    }

    // ERC-20 토큰 처리
    const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    
    // 토큰 밸런스 조회
    const balance = await contract.methods.balanceOf(walletAddress).call();
    
    // 토큰 decimals 조회
    let decimals = 18; // 기본값
    try {
      decimals = await contract.methods.decimals().call();
    } catch (e) {
      console.warn(`Could not fetch decimals for ${tokenSymbol}, using default 18`);
    }

    // 토큰 심볼 검증
    let symbol = tokenSymbol;
    try {
      symbol = await contract.methods.symbol().call();
    } catch (e) {
      console.warn(`Could not fetch symbol for ${tokenAddress}, using ${tokenSymbol}`);
    }

    // 밸런스를 사람이 읽을 수 있는 형태로 변환
    const balanceFormatted = web3.utils.fromWei(balance.toString(), 'ether');
    
    console.log(`✅ ${tokenSymbol} balance: ${balanceFormatted}`);
    
    return {
      balance: balanceFormatted,
      symbol,
      decimals: Number(decimals),
      network
    };

  } catch (error) {
    console.error(`❌ Error fetching ${tokenSymbol} balance:`, error);
    throw new Error(`Failed to fetch ${tokenSymbol} balance: ${error.message}`);
  }
}

/**
 * 멀티체인 토큰 밸런스를 가져옵니다
 */
export async function getMultiChainBalance(
  walletAddress: string, 
  tokenSymbol: string
): Promise<Array<{ network: string; balance: string; symbol: string; decimals: number }>> {
  const results = [];
  
  // 각 네트워크에서 토큰 밸런스 조회
  for (const [network, tokens] of Object.entries(TOKEN_ADDRESSES)) {
    if (tokens[tokenSymbol as keyof typeof tokens]) {
      try {
        const balance = await getTokenBalance(network, walletAddress, tokenSymbol);
        results.push(balance);
      } catch (error) {
        console.warn(`Failed to fetch ${tokenSymbol} on ${network}:`, error.message);
        // 에러가 발생해도 다른 네트워크는 계속 시도
      }
    }
  }
  
  return results;
}

/**
 * 지갑의 모든 토큰 밸런스를 가져옵니다
 */
export async function getWalletBalances(
  network: string,
  walletAddress: string
): Promise<Array<{ symbol: string; balance: string; decimals: number; network: string }>> {
  const networkTokens = TOKEN_ADDRESSES[network as keyof typeof TOKEN_ADDRESSES];
  
  if (!networkTokens) {
    throw new Error(`Network ${network} not supported`);
  }

  const balances = [];
  
  for (const tokenSymbol of Object.keys(networkTokens)) {
    try {
      const balance = await getTokenBalance(network, walletAddress, tokenSymbol);
      balances.push(balance);
    } catch (error) {
      console.warn(`Failed to fetch ${tokenSymbol} balance:`, error.message);
      // 실패한 토큰은 0으로 표시
      balances.push({
        symbol: tokenSymbol,
        balance: '0',
        decimals: 18,
        network
      });
    }
  }
  
  return balances;
}

/**
 * 네트워크 연결 상태 확인
 */
export async function checkNetworkConnection(network: string): Promise<boolean> {
  try {
    const web3 = getWeb3Instance(network);
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`✅ ${network} network connected, latest block: ${blockNumber}`);
    return true;
  } catch (error) {
    console.error(`❌ ${network} network connection failed:`, error.message);
    return false;
  }
}

/**
 * 가스 가격 조회
 */
export async function getGasPrice(network: string): Promise<string> {
  try {
    const web3 = getWeb3Instance(network);
    const gasPrice = await web3.eth.getGasPrice();
    return web3.utils.fromWei(gasPrice, 'gwei');
  } catch (error) {
    console.error(`Failed to fetch gas price for ${network}:`, error);
    return '20'; // 기본값
  }
}

export default {
  getTokenBalance,
  getMultiChainBalance,
  getWalletBalances,
  checkNetworkConnection,
  getGasPrice
};