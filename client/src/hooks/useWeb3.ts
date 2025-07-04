import { useState, useEffect, useCallback } from "react";
import { WalletConnection } from "@/types";
import { web3Service } from "@/lib/web3";
import { XPHERE_NETWORK } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export function useWeb3() {
  const { toast } = useToast();
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
      // Initialize provider first if not already done
      if (!web3Service.provider && window.ethereum) {
        await web3Service.initializeProvider();
      }
      
      const balance = await web3Service.getBalance(address);
      const chainId = await web3Service.getChainId();
      
      setWallet({
        isConnected: true,
        address,
        balance,
        chainId,
      });
      
      console.log("Wallet info updated successfully:", { address, balance, chainId });
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
      
      // Smoothly update wallet info
      await updateWalletInfo(address);
      
      // Show success toast
      toast({
        title: "지갑 연결 성공",
        description: `메타마스크가 성공적으로 연결되었습니다.`,
        variant: "default",
      });
      
      // Try to switch to Xphere network with delay for better UX
      setTimeout(async () => {
        try {
          await web3Service.switchToXphereNetwork();
          if (address) {
            await updateWalletInfo(address);
          }
        } catch (networkError) {
          console.warn("Failed to switch to Xphere network:", networkError);
        }
      }, 500);
      
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to connect wallet:", err);
      
      // Show error toast
      toast({
        title: "지갑 연결 실패",
        description: "메타마스크 연결에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletInfo, toast]);

  const disconnectWallet = useCallback(() => {
    // Add a brief delay for smoother transition
    setWallet(prev => ({ ...prev, isConnected: false }));
    
    // Show disconnect toast
    toast({
      title: "지갑 연결 해제",
      description: "메타마스크 연결이 해제되었습니다.",
      variant: "default",
    });
    
    setTimeout(() => {
      web3Service.disconnect();
      setWallet({
        isConnected: false,
        address: null,
        balance: "0",
        chainId: null,
      });
      setError(null);
    }, 300);
  }, [toast]);

  const switchToXphere = useCallback(async () => {
    try {
      await web3Service.switchToXphereNetwork();
      if (wallet.address) {
        await updateWalletInfo(wallet.address);
      }
      
      // Show network switch success toast
      toast({
        title: "네트워크 전환 완료",
        description: "Xphere 네트워크로 성공적으로 전환되었습니다.",
        variant: "default",
      });
    } catch (err: any) {
      setError(err.message);
      
      // Show network switch error toast
      toast({
        title: "네트워크 전환 실패",
        description: "Xphere 네트워크 전환에 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [wallet.address, updateWalletInfo, toast]);

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
