import React, { createContext, useContext, ReactNode } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { WalletConnection } from '@/types';

interface WalletContextType {
  wallet: WalletConnection;
  isConnecting: boolean;
  error: string | null;
  isXphereNetwork: boolean;
  isMobile: boolean;
  connectWallet: (walletType?: 'metamask' | 'zigap') => Promise<void>;
  disconnectWallet: () => void;
  switchToXphere: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const web3State = useWeb3();

  return (
    <WalletContext.Provider value={web3State}>
      {children}
    </WalletContext.Provider>
  );
};
