import { useState, useEffect, useCallback } from "react";
import { WalletConnection } from "@/types";
import { web3Service } from "@/lib/web3";
import { zigapWalletService } from "@/lib/zigapWallet";
import { XPHERE_NETWORK } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { 
  connectMetaMask, 
  isMetaMaskInstalled, 
  onAccountsChanged, 
  onChainChanged, 
  removeMetaMaskListeners,
  getCurrentChainId
} from '@/lib/metamask';

export function useWeb3() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletConnection>({
    isConnected: false,
    address: null,
    balance: "0",
    chainId: null,
    walletType: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if mobile device
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  const updateWalletInfo = useCallback(async (address: string, walletType: 'metamask' | 'zigap') => {
    try {
      let balance = "0";
      let chainId = null;

      if (walletType === 'metamask') {
        // Initialize provider first if not already done
        if (!web3Service.provider && window.ethereum) {
          await web3Service.initializeProvider();
        }
        balance = await web3Service.getBalance(address);
        chainId = await web3Service.getChainId();
      } else if (walletType === 'zigap') {
        balance = await zigapWalletService.getXPBalance(address);
        chainId = await zigapWalletService.getZigapChainId();
      }
      
      setWallet({
        isConnected: true,
        address,
        balance,
        chainId,
        walletType,
      });
      
      // Store connection info for restoration
      localStorage.setItem('xpswap_wallet_connection', JSON.stringify({
        walletType,
        address,
        timestamp: Date.now()
      }));
      
      console.log(`✅ ${walletType} wallet info updated:`, { 
        address: address.substring(0, 6) + "...", 
        balance, 
        chainId,
        walletType 
      });
    } catch (err) {
      console.error("❌ Failed to update wallet info:", err);
      setError("Failed to update wallet information");
    }
  }, []);

  const connectWallet = useCallback(async (walletType: 'metamask' | 'zigap' = 'metamask') => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log(`🔗 Starting ${walletType} wallet connection...`);
      
      let address = "";
      
      if (walletType === 'metamask') {
        // Check if MetaMask is installed
        if (!isMetaMaskInstalled()) {
          if (isMobile()) {
            // 모바일에서 MetaMask 앱으로 이동
            window.open('https://metamask.app.link/dapp/' + window.location.host + window.location.pathname);
            throw new Error("MetaMask 앱으로 이동합니다. MetaMask 앱에서 다시 연결해주세요.");
          } else {
            // 데스크톱에서 MetaMask 설치 페이지로 이동
            window.open('https://metamask.io/download/', '_blank');
            throw new Error("MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.");
          }
        }
        
        // Use the new metamask.ts connection function
        const result = await connectMetaMask();
        address = result.account;
        
        // Listen for MetaMask events
        onAccountsChanged((accounts: string[]) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else if (accounts[0] !== wallet.address) {
            updateWalletInfo(accounts[0], 'metamask');
          }
        });
        
        onChainChanged((chainId: string) => {
          window.location.reload(); // Recommended by MetaMask
        });
        
      } else if (walletType === 'zigap') {
        address = await zigapWalletService.connectZigap();
      }
      
      if (!address) {
        throw new Error("지갑 주소를 가져올 수 없습니다.");
      }

      console.log(`✅ ${walletType} wallet connected successfully`);
      
      // Update wallet info smoothly
      await updateWalletInfo(address, walletType);
      
      // Show success toast
      toast({
        title: "🎉 연결 성공",
        description: `${walletType === 'metamask' ? 'MetaMask' : 'ZIGAP'} 지갑이 성공적으로 연결되었습니다!`,
        variant: "default",
      });
      
      // Try to switch to Xphere network with delay for better UX (MetaMask only)
      if (walletType === 'metamask') {
        setTimeout(async () => {
          try {
            await web3Service.switchToXphereNetwork();
            if (address) {
              await updateWalletInfo(address, walletType);
              
              toast({
                title: "🌐 네트워크 전환",
                description: "Xphere 네트워크로 전환되었습니다.",
                variant: "default",
              });
            }
          } catch (networkError) {
            console.warn("⚠️ Failed to switch to Xphere network:", networkError);
            toast({
              title: "ℹ️ 네트워크 안내",
              description: "수동으로 Xphere 네트워크로 전환해주세요.",
              variant: "default",
            });
          }
        }, 1000);
      }
      
    } catch (err: any) {
      console.error(`❌ ${walletType} wallet connection failed:`, err);
      setError(err.message);
      
      // Show error toast with better messaging
      let errorMessage = "지갑 연결에 실패했습니다.";
      
      if (err.code === 4001) {
        errorMessage = "사용자가 연결을 취소했습니다.";
      } else if (err.code === -32002) {
        errorMessage = "이미 연결 요청이 진행 중입니다. 지갑을 확인해주세요.";
      } else if (err.message.includes("User rejected")) {
        errorMessage = "연결 요청이 거부되었습니다.";
      } else if (err.message.includes("MetaMask") || err.message.includes("ZIGAP")) {
        errorMessage = err.message;
      }
      
      toast({
        title: "❌ 연결 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletInfo, toast, isMobile]);

  const disconnectWallet = useCallback(() => {
    console.log("🔌 Disconnecting wallet...");
    
    // Clear stored connection
    localStorage.removeItem('xpswap_wallet_connection');
    
    // Smooth transition
    setWallet(prev => ({ ...prev, isConnected: false }));
    
    setTimeout(() => {
      if (wallet.walletType === 'metamask') {
        // Remove MetaMask event listeners
        removeMetaMaskListeners();
        web3Service.disconnect();
      } else if (wallet.walletType === 'zigap') {
        zigapWalletService.disconnectZigap();
      }
      
      setWallet({
        isConnected: false,
        address: null,
        balance: "0",
        chainId: null,
        walletType: null,
      });
      setError(null);
      
      console.log("✅ Wallet disconnected successfully");
    }, 300);
  }, [wallet.walletType]);

  const switchToXphere = useCallback(async () => {
    setError(null);
    
    try {
      console.log("🌐 Switching to Xphere network...");
      
      if (wallet.walletType === 'metamask') {
        await web3Service.switchToXphereNetwork();
      } else if (wallet.walletType === 'zigap') {
        await zigapWalletService.switchZigapNetwork(XPHERE_NETWORK.chainId);
      }
      
      if (wallet.address && wallet.walletType) {
        await updateWalletInfo(wallet.address, wallet.walletType);
      }
      
      toast({
        title: "✅ 네트워크 전환 완료",
        description: "Xphere 네트워크로 성공적으로 전환되었습니다.",
        variant: "default",
      });
      
      console.log("✅ Network switched to Xphere successfully");
    } catch (err: any) {
      console.error("❌ Network switch failed:", err);
      setError(err.message);
      
      let errorMessage = "네트워크 전환에 실패했습니다.";
      
      if (err.code === 4001) {
        errorMessage = "사용자가 네트워크 전환을 취소했습니다.";
      } else if (err.code === 4902) {
        errorMessage = "Xphere 네트워크를 추가하는 중 오류가 발생했습니다.";
      }
      
      toast({
        title: "❌ 네트워크 전환 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [wallet.address, wallet.walletType, updateWalletInfo, toast]);

  // Enhanced event listeners for both MetaMask and ZIGAP
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("🔄 Wallet accounts changed:", accounts);
      
      if (accounts.length === 0) {
        // User disconnected from wallet
        console.log("🔌 User disconnected from wallet");
        disconnectWallet();
        
        toast({
          title: "🔌 연결 해제됨",
          description: "지갑에서 연결이 해제되었습니다.",
          variant: "default",
        });
      } else if (accounts[0] !== wallet.address && wallet.walletType) {
        // User switched accounts
        console.log("🔄 User switched accounts");
        updateWalletInfo(accounts[0], wallet.walletType);
        
        toast({
          title: "🔄 계정 변경됨",
          description: "지갑 계정이 변경되었습니다.",
          variant: "default",
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      console.log("🌐 Network changed:", newChainId);
      
      setWallet(prev => ({ ...prev, chainId: newChainId }));
      
      // Refresh wallet info after network change
      if (wallet.address && wallet.walletType) {
        updateWalletInfo(wallet.address, wallet.walletType);
      }
      
      // Show network change notification
      const networkName = newChainId === XPHERE_NETWORK.chainId ? "Xphere" : `Chain ${newChainId}`;
      toast({
        title: "🌐 네트워크 변경됨",
        description: `${networkName} 네트워크로 변경되었습니다.`,
        variant: "default",
      });
    };

    // MetaMask event listeners
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // ZIGAP event listeners
    if (zigapWalletService.isZigapConnected()) {
      zigapWalletService.onZigapAccountsChanged(handleAccountsChanged);
      zigapWalletService.onZigapChainChanged(handleChainChanged);
    }

    return () => {
      // Cleanup MetaMask event listeners
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
      
      // Cleanup ZIGAP event listeners
      zigapWalletService.removeZigapListener("accountsChanged", handleAccountsChanged);
      zigapWalletService.removeZigapListener("chainChanged", handleChainChanged);
    };
  }, [wallet.address, wallet.walletType, wallet.isConnected, updateWalletInfo, disconnectWallet, toast]);

  // Check if already connected on mount - DISABLED automatic connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // DISABLED: Do not automatically connect wallet on page load
        // User must manually click connect wallet button
        console.log("📌 Auto-connect disabled. User must connect wallet manually.");
        
        // Just check if previous connection exists but don't connect
        const previousConnection = localStorage.getItem('xpswap_wallet_connection');
        if (previousConnection) {
          const { walletType, address } = JSON.parse(previousConnection);
          console.log("📌 Previous wallet connection found but not auto-connecting:", { 
            walletType, 
            address: address.substring(0, 6) + "..." 
          });
        }
        
        return; // Exit without connecting
        
      } catch (err) {
        console.error("❌ Failed to check existing connection:", err);
        localStorage.removeItem('xpswap_wallet_connection');
      }
    };

    checkConnection();
  }, [updateWalletInfo]);

  // Auto-clear errors after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  const isXphereNetwork = wallet.chainId === XPHERE_NETWORK.chainId;

  return {
    wallet,
    isConnecting,
    error,
    isXphereNetwork,
    isMobile: isMobile(),
    connectWallet,
    disconnectWallet,
    switchToXphere,
    clearError: () => setError(null),
  };
}