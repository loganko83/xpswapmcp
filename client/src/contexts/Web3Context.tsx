import React, { createContext, useContext, ReactNode } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';

interface Web3ContextType {
  wallet: {
    isConnected: boolean;
    address: string | null;
    balance: string;
    chainId: number | null;
    walletType: 'metamask' | 'zigap' | null;
  };
  isConnecting: boolean;
  error: string | null;
  isXphereNetwork: boolean;
  isMobile: boolean;
  connectWallet: (walletType?: 'metamask' | 'zigap') => Promise<void>;
  disconnectWallet: () => void;
  switchToXphere: () => Promise<void>;
  clearError: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3Data = useWeb3();

  return (
    <Web3Context.Provider value={web3Data}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
}

// Re-export useWeb3 for backward compatibility
export { useWeb3 } from '@/hooks/useWeb3';
