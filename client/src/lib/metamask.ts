import { ethers } from 'ethers';

// Xphere Network Configuration
export const XPHERE_NETWORK = {
  chainId: '0x1350069', // 20250217 in hex
  chainName: 'Xphere Network',
  nativeCurrency: {
    name: 'XP',
    symbol: 'XP',
    decimals: 18,
  },
  rpcUrls: ['https://en-bkk.x-phere.com'], // Actual Xphere RPC URL
  blockExplorerUrls: ['https://explorer.x-phere.com'], // Actual Xphere Explorer URL
};

interface MetaMaskError {
  code: number;
  message: string;
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

// Check if mobile
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if inside MetaMask mobile browser
export const isMetaMaskMobile = (): boolean => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask && isMobile();
};

// Request account access
export const requestAccounts = async (): Promise<string[]> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts;
  } catch (error) {
    const metamaskError = error as MetaMaskError;
    if (metamaskError.code === 4001) {
      throw new Error('사용자가 연결 요청을 거부했습니다.');
    }
    throw error;
  }
};

// Check if MetaMask is currently connected
export const isMetaMaskConnected = async (): Promise<{ isConnected: boolean; accounts: string[] }> => {
  if (!isMetaMaskInstalled()) {
    return { isConnected: false, accounts: [] };
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return { 
      isConnected: accounts.length > 0, 
      accounts: accounts || [] 
    };
  } catch (error) {
    console.error('❌ Failed to check MetaMask connection:', error);
    return { isConnected: false, accounts: [] };
  }
};

// Get current chain ID
export const getCurrentChainId = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask가 설치되지 않았습니다.');
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return chainId;
};

// Switch to Xphere Network
export const switchToXphereNetwork = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask가 설치되지 않았습니다.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: XPHERE_NETWORK.chainId }],
    });
  } catch (error) {
    const metamaskError = error as MetaMaskError;
    
    // This error code indicates that the chain has not been added to MetaMask
    if (metamaskError.code === 4902) {
      await addXphereNetwork();
    } else {
      throw error;
    }
  }
};

// Add Xphere Network to MetaMask
export const addXphereNetwork = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask가 설치되지 않았습니다.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: XPHERE_NETWORK.chainId,
        chainName: XPHERE_NETWORK.chainName,
        nativeCurrency: XPHERE_NETWORK.nativeCurrency,
        rpcUrls: XPHERE_NETWORK.rpcUrls,
        blockExplorerUrls: XPHERE_NETWORK.blockExplorerUrls,
      }],
    });
  } catch (error) {
    const metamaskError = error as MetaMaskError;
    if (metamaskError.code === 4001) {
      throw new Error('사용자가 네트워크 추가를 거부했습니다.');
    }
    throw error;
  }
};

// Connect to MetaMask
export const connectMetaMask = async (): Promise<{ account: string; chainId: string }> => {
  console.log('🦊 Starting MetaMask connection...');
  
  // Mobile handling
  if (isMobile() && !isMetaMaskMobile()) {
    // If on mobile but not in MetaMask browser, redirect to MetaMask app
    const currentUrl = window.location.href;
    const deeplink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
    window.location.href = deeplink;
    throw new Error('MetaMask 앱으로 이동합니다. MetaMask 앱에서 다시 연결해주세요.');
  }
  
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.');
  }

  try {
    // Request accounts
    const accounts = await requestAccounts();
    if (accounts.length === 0) {
      throw new Error('MetaMask 계정을 찾을 수 없습니다.');
    }

    // Get current chain ID
    const chainId = await getCurrentChainId();
    console.log('🦊 Current chain ID:', chainId);

    // Don't automatically switch network on connect
    // Let user do it manually or through UI
    
    console.log('✅ MetaMask connected successfully!');
    return {
      account: accounts[0],
      chainId: chainId,
    };
  } catch (error) {
    console.error('❌ MetaMask connection failed:', error);
    throw error;
  }
};

// Get provider
export const getMetaMaskProvider = (): ethers.providers.Web3Provider | null => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  return new ethers.providers.Web3Provider(window.ethereum);
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.on('accountsChanged', callback);
};

// Listen for chain changes
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.on('chainChanged', callback);
};

// Remove listeners
export const removeMetaMaskListeners = (): void => {
  if (!isMetaMaskInstalled()) return;

  window.ethereum.removeAllListeners('accountsChanged');
  window.ethereum.removeAllListeners('chainChanged');
};
