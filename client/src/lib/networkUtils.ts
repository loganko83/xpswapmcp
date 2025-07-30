import { SUPPORTED_NETWORKS } from './lifiService';
import { getApiUrl } from '../utils/config';

export interface NetworkConfig {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrls: string[];
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Add network to MetaMask
export async function addNetworkToMetaMask(networkKey: keyof typeof SUPPORTED_NETWORKS): Promise<boolean> {
  const network = SUPPORTED_NETWORKS[networkKey];
  
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${network.chainId.toString(16)}`,
        chainName: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: network.rpcUrls,
        blockExplorerUrls: [network.blockExplorer],
      }],
    });
    return true;
  } catch (error: any) {
    console.error(`Failed to add ${network.name} network:`, error);
    throw new Error(`Failed to add ${network.name} network: ${error.message}`);
  }
}

// Switch to network
export async function switchToNetwork(networkKey: keyof typeof SUPPORTED_NETWORKS): Promise<boolean> {
  const network = SUPPORTED_NETWORKS[networkKey];
  
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // First try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // If the network doesn't exist in MetaMask, add it first
    if (error.code === 4902) {
      try {
        await addNetworkToMetaMask(networkKey);
        return true;
      } catch (addError) {
        console.error(`Failed to add and switch to ${network.name}:`, addError);
        throw addError;
      }
    } else {
      console.error(`Failed to switch to ${network.name}:`, error);
      throw new Error(`Failed to switch to ${network.name}: ${error.message}`);
    }
  }
}

// Get network by chain ID
export function getNetworkByChainId(chainId: number): NetworkConfig | null {
  for (const [key, network] of Object.entries(SUPPORTED_NETWORKS)) {
    if (network.chainId === chainId) {
      return network as NetworkConfig;
    }
  }
  return null;
}

// Check if network is supported
export function isNetworkSupported(chainId: number): boolean {
  return getNetworkByChainId(chainId) !== null;
}

// Get network key by chain ID
export function getNetworkKey(chainId: number): keyof typeof SUPPORTED_NETWORKS | null {
  for (const [key, network] of Object.entries(SUPPORTED_NETWORKS)) {
    if (network.chainId === chainId) {
      return key as keyof typeof SUPPORTED_NETWORKS;
    }
  }
  return null;
}

// Test RPC connection
export async function testRpcConnection(rpcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });
    
    const data = await response.json();
    return !!(data.result && response.ok);
  } catch (error) {
    console.error(`RPC connection test failed for ${rpcUrl}:`, error);
    return false;
  }
}

// Get best working RPC for a network
export async function getBestRpcUrl(networkKey: keyof typeof SUPPORTED_NETWORKS): Promise<string> {
  const network = SUPPORTED_NETWORKS[networkKey];
  
  for (const rpcUrl of network.rpcUrls) {
    const isWorking = await testRpcConnection(rpcUrl);
    if (isWorking) {
      return rpcUrl;
    }
  }
  
  // Return first RPC as fallback
  return network.rpcUrls[0];
}

// Network status checker
export async function checkNetworkStatus(networkKey: keyof typeof SUPPORTED_NETWORKS): Promise<{
  isAvailable: boolean;
  latency: number;
  bestRpc: string;
}> {
  const network = SUPPORTED_NETWORKS[networkKey];
  let bestRpc = network.rpcUrls[0];
  let bestLatency = Infinity;
  let anyWorking = false;

  for (const rpcUrl of network.rpcUrls) {
    try {
      const startTime = Date.now();
      const isWorking = await testRpcConnection(rpcUrl);
      const latency = Date.now() - startTime;
      
      if (isWorking) {
        anyWorking = true;
        if (latency < bestLatency) {
          bestLatency = latency;
          bestRpc = rpcUrl;
        }
      }
    } catch (error) {
      console.warn(`RPC test failed for ${rpcUrl}:`, error);
    }
  }

  return {
    isAvailable: anyWorking,
    latency: bestLatency === Infinity ? -1 : bestLatency,
    bestRpc,
  };
}