import { useState, useEffect, useCallback } from "react";
import { WalletConnection } from "@/types";
import { web3Service } from "@/lib/web3";
import { XPHERE_NETWORK } from "@/lib/constants";

export function useWeb3() {
  const [wallet, setWallet] = useState<WalletConnection>({
    isConnected: false,
    address: null,
    balance: "0",
    chainId: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWalletInfo = useCallback(async (address: string) => {
    try {
      const balance = await web3Service.getBalance(address);
      const chainId = await web3Service.getChainId();
      
      setWallet({
        isConnected: true,
        address,
        balance,
        chainId,
      });
    } catch (err) {
      console.error("Failed to update wallet info:", err);
      setError("Failed to update wallet information");
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const address = await web3Service.connectWallet();
      await updateWalletInfo(address);
      
      // Try to switch to Xphere network
      try {
        await web3Service.switchToXphereNetwork();
      } catch (networkError) {
        console.warn("Failed to switch to Xphere network:", networkError);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletInfo]);

  const disconnectWallet = useCallback(() => {
    web3Service.disconnect();
    setWallet({
      isConnected: false,
      address: null,
      balance: "0",
      chainId: null,
    });
  }, []);

  const switchToXphere = useCallback(async () => {
    try {
      await web3Service.switchToXphereNetwork();
      if (wallet.address) {
        await updateWalletInfo(wallet.address);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [wallet.address, updateWalletInfo]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== wallet.address) {
          updateWalletInfo(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setWallet(prev => ({ ...prev, chainId: newChainId }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [wallet.address, updateWalletInfo, disconnectWallet]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          
          if (accounts.length > 0) {
            await updateWalletInfo(accounts[0]);
          }
        }
      } catch (err) {
        console.error("Failed to check existing connection:", err);
      }
    };

    checkConnection();
  }, [updateWalletInfo]);

  const isXphereNetwork = wallet.chainId === XPHERE_NETWORK.chainId;

  return {
    wallet,
    isConnecting,
    error,
    isXphereNetwork,
    connectWallet,
    disconnectWallet,
    switchToXphere,
    clearError: () => setError(null),
  };
}
