import { ethers } from "ethers";
import crypto from 'crypto';

// ZIGAP 지갑 관련 타입 정의
declare global {
  interface Window {
    zigap?: {
      isZigap?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: Function) => void;
      removeListener?: (event: string, handler: Function) => void;
      selectedAddress?: string;
      chainId?: string;
      isConnected?: () => boolean;
      enable?: () => Promise<string[]>;
      // ZIGAP 특화 메서드
      getXPBalance?: () => Promise<string>;
      getXPSBalance?: () => Promise<string>;
      sendXP?: (to: string, amount: string) => Promise<string>;
      sendXPS?: (to: string, amount: string) => Promise<string>;
    };
    ethereum?: any;
  }
}

// ZIGAP 네트워크 설정
export const ZIGAP_NETWORK = {
  chainId: '0x1350069', // 20250217 in hex
  chainName: 'Xphere Network',
  nativeCurrency: {
    name: 'XP',
    symbol: 'XP',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.xphere.io'], // Replace with actual RPC URL
  blockExplorerUrls: ['https://explorer.xphere.io'], // Replace with actual explorer URL
};

// ZIGAP 토큰 주소
export const ZIGAP_TOKENS = {
  XP: '0x0000000000000000000000000000000000000000', // Native token
  XPS: '0x1234567890123456789012345678901234567890', // Replace with actual XPS contract address
};

export interface ZigapProvider {
  isZigap: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: Function) => void;
  removeListener: (event: string, handler: Function) => void;
  selectedAddress?: string;
  chainId?: string;
  isConnected: () => boolean;
  enable: () => Promise<string[]>;
  // ZIGAP 특화 메서드
  getXPBalance?: () => Promise<string>;
  getXPSBalance?: () => Promise<string>;
  sendXP?: (to: string, amount: string) => Promise<string>;
  sendXPS?: (to: string, amount: string) => Promise<string>;
}

export class ZigapWalletService {
  private provider: ZigapProvider | null = null;
  private isTestMode: boolean = true; // 개발 중에는 테스트 모드 활성화

  // ZIGAP 지갑이 설치되어 있는지 확인
  async isZigapInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // 개발 모드에서는 시뮬레이션
    if (this.isTestMode) {
      console.log("🧪 ZIGAP wallet in test mode");
      return true;
    }
    
    // 실제 ZIGAP 지갑 감지
    return !!(window.zigap && window.zigap.isZigap);
  }

  // 모바일 환경 감지
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // ZIGAP 지갑 연결
  async connectZigap(): Promise<string> {
    console.log("🔗 Starting ZIGAP wallet connection...");

    // 테스트 모드에서는 시뮬레이션된 지갑 주소 반환
    if (this.isTestMode) {
      console.log("🧪 ZIGAP wallet test mode - returning simulated address");
      const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f89590";
      
      // 시뮬레이션된 이벤트 발생
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('zigap_connected', { 
          detail: { address: testAddress, chainId: ZIGAP_NETWORK.chainId } 
        }));
      }, 1000);
      
      return testAddress;
    }

    if (!await this.isZigapInstalled()) {
      if (this.isMobile()) {
        // 모바일에서 ZIGAP 앱으로 리다이렉트
        this.handleMobileZigap();
        throw new Error("ZIGAP 앱을 열고 있습니다. 잠시 후 다시 시도해주세요.");
      }
      throw new Error("ZIGAP 지갑이 설치되지 않았습니다. ZIGAP을 설치해주세요.");
    }

    try {
      this.provider = window.zigap as ZigapProvider;

      // 계정 연결 요청
      const accounts = await this.provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("ZIGAP 지갑에서 계정을 찾을 수 없습니다.");
      }

      // Xphere 네트워크로 전환
      await this.switchToXphereNetwork();

      console.log("✅ ZIGAP wallet connected successfully:", accounts[0]);
      return accounts[0];
    } catch (error: any) {
      console.error("❌ ZIGAP connection error:", error);
      
      if (error.code === 4001) {
        throw new Error("사용자가 ZIGAP 연결을 취소했습니다.");
      } else if (error.code === -32002) {
        throw new Error("ZIGAP 연결 요청이 이미 진행 중입니다.");
      } else {
        throw new Error(`ZIGAP 지갑 연결 실패: ${error.message || error}`);
      }
    }
  }

  // Xphere 네트워크로 전환
  private async switchToXphereNetwork(): Promise<void> {
    if (!this.provider || this.isTestMode) return;

    try {
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ZIGAP_NETWORK.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // 네트워크가 추가되지 않은 경우, 네트워크 추가
        try {
          await this.provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: ZIGAP_NETWORK.chainId,
              chainName: ZIGAP_NETWORK.chainName,
              nativeCurrency: ZIGAP_NETWORK.nativeCurrency,
              rpcUrls: ZIGAP_NETWORK.rpcUrls,
              blockExplorerUrls: ZIGAP_NETWORK.blockExplorerUrls,
            }],
          });
        } catch (addError) {
          console.error("Failed to add Xphere network:", addError);
          throw new Error("Xphere 네트워크 추가에 실패했습니다.");
        }
      } else {
        throw new Error(`네트워크 전환 실패: ${error.message}`);
      }
    }
  }

  // 모바일 ZIGAP 앱 처리
  private handleMobileZigap(): void {
    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent;
    
    // ZIGAP 앱 딥링크 생성
    const zigapDeepLink = `zigap://connect?url=${encodeURIComponent(currentUrl)}`;
    
    console.log("📱 Redirecting to ZIGAP mobile app...");
    
    // ZIGAP 앱으로 리다이렉트 시도
    window.location.href = zigapDeepLink;
    
    // 앱이 설치되지 않은 경우 앱스토어로 리다이렉트
    setTimeout(() => {
      if (document.hidden) return;
      
      if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        // iOS App Store 링크 (실제 링크로 교체 필요)
        window.location.href = 'https://apps.apple.com/app/zigap-wallet/id123456789';
      } else if (userAgent.includes('Android')) {
        // Google Play Store 링크 (실제 링크로 교체 필요)
        window.location.href = 'https://play.google.com/store/apps/details?id=io.zigap.wallet';
      }
    }, 3000);
  }

  // XP 잔액 조회 (ZIGAP 특화 메서드)
  async getXPBalance(address: string): Promise<string> {
    if (this.isTestMode) {
      return "1000.0"; // 테스트 잔액
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      // ZIGAP 특화 메서드가 있는 경우
      if (this.provider.getXPBalance) {
        return await this.provider.getXPBalance();
      }

      // 표준 메서드 사용
      const balance = await this.provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get XP balance:", error);
      return "0";
    }
  }

  // XPS 잔액 조회 (ZIGAP 특화 메서드)
  async getXPSBalance(address: string): Promise<string> {
    if (this.isTestMode) {
      return "500.0"; // 테스트 잔액
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      // ZIGAP 특화 메서드가 있는 경우
      if (this.provider.getXPSBalance) {
        return await this.provider.getXPSBalance();
      }

      // ERC20 토큰 잔액 조회
      const tokenContract = new ethers.Contract(
        ZIGAP_TOKENS.XPS,
        ['function balanceOf(address) view returns (uint256)'],
        new ethers.BrowserProvider(this.provider as any)
      );

      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error("Failed to get XPS balance:", error);
      return "0";
    }
  }

  // ZIGAP 지갑 계정 가져오기
  async getZigapAccounts(): Promise<string[]> {
    if (this.isTestMode) {
      return ["0x742d35Cc6634C0532925a3b844Bc9e7595f89590"];
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      return await this.provider.request({
        method: "eth_accounts",
      });
    } catch (error) {
      console.error("Failed to get ZIGAP accounts:", error);
      return [];
    }
  }

  // ZIGAP 지갑 체인 ID 조회
  async getZigapChainId(): Promise<number> {
    if (this.isTestMode) {
      return parseInt(ZIGAP_NETWORK.chainId, 16);
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      const chainId = await this.provider.request({
        method: "eth_chainId",
      });
      
      return parseInt(chainId, 16);
    } catch (error) {
      console.error("Failed to get ZIGAP chain ID:", error);
      return 0;
    }
  }

  // Xphere 네트워크로 전환
  async switchZigapNetwork(chainId: number): Promise<void> {
    if (this.isTestMode) {
      console.log(`🧪 Test mode: Switching to network ${chainId}`);
      return;
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      const chainIdHex = '0x' + chainId.toString(16);
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // 네트워크가 추가되지 않은 경우, 네트워크 추가
        try {
          await this.provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: '0x' + chainId.toString(16),
              chainName: ZIGAP_NETWORK.chainName,
              nativeCurrency: ZIGAP_NETWORK.nativeCurrency,
              rpcUrls: ZIGAP_NETWORK.rpcUrls,
              blockExplorerUrls: ZIGAP_NETWORK.blockExplorerUrls,
            }],
          });
        } catch (addError) {
          console.error("Failed to add Xphere network:", addError);
          throw new Error("Xphere 네트워크 추가에 실패했습니다.");
        }
      } else {
        throw new Error(`네트워크 전환 실패: ${error.message}`);
      }
    }
  }

  // XP 전송 (ZIGAP 특화 메서드)
  async sendXP(to: string, amount: string): Promise<string> {
    if (this.isTestMode) {
      console.log(`🧪 Test mode: Sending ${amount} XP to ${to}`);
      return `0x${crypto.randomBytes(32).toString("hex")}`; // 테스트 트랜잭션 해시
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      // ZIGAP 특화 메서드가 있는 경우
      if (this.provider.sendXP) {
        return await this.provider.sendXP(to, amount);
      }

      // 표준 트랜잭션 전송
      const accounts = await this.getZigapAccounts();
      const value = ethers.parseEther(amount);
      
      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: accounts[0],
          to: to,
          value: value.toString(16),
        }],
      });
      
      return txHash;
    } catch (error: any) {
      console.error("XP transfer failed:", error);
      throw new Error(`XP 전송 실패: ${error.message || error}`);
    }
  }

  // XPS 전송 (ZIGAP 특화 메서드)
  async sendXPS(to: string, amount: string): Promise<string> {
    if (this.isTestMode) {
      console.log(`🧪 Test mode: Sending ${amount} XPS to ${to}`);
      return `0x${crypto.randomBytes(32).toString("hex")}`; // 테스트 트랜잭션 해시
    }

    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      // ZIGAP 특화 메서드가 있는 경우
      if (this.provider.sendXPS) {
        return await this.provider.sendXPS(to, amount);
      }

      // ERC20 토큰 전송
      const signer = new ethers.BrowserProvider(this.provider as any).getSigner();
      const tokenContract = new ethers.Contract(
        ZIGAP_TOKENS.XPS,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        await signer
      );

      const tx = await tokenContract.transfer(to, ethers.parseUnits(amount, 18));
      return tx.hash;
    } catch (error: any) {
      console.error("XPS transfer failed:", error);
      throw new Error(`XPS 전송 실패: ${error.message || error}`);
    }
  }

  // ZIGAP 지갑 이벤트 리스너 추가
  onZigapAccountsChanged(handler: (accounts: string[]) => void): void {
    if (this.isTestMode) {
      // 테스트 모드에서는 이벤트 시뮬레이션
      window.addEventListener('zigap_accounts_changed', (event: any) => {
        handler(event.detail.accounts);
      });
      return;
    }

    if (this.provider) {
      this.provider.on("accountsChanged", handler);
    }
  }

  onZigapChainChanged(handler: (chainId: string) => void): void {
    if (this.isTestMode) {
      // 테스트 모드에서는 이벤트 시뮬레이션
      window.addEventListener('zigap_chain_changed', (event: any) => {
        handler(event.detail.chainId);
      });
      return;
    }

    if (this.provider) {
      this.provider.on("chainChanged", handler);
    }
  }

  // ZIGAP 지갑 이벤트 리스너 제거
  removeZigapListener(event: string, handler: Function): void {
    if (this.isTestMode) {
      // 테스트 모드에서는 이벤트 시뮬레이션 제거
      window.removeEventListener(`zigap_${event}`, handler as EventListener);
      return;
    }

    if (this.provider && this.provider.removeListener) {
      this.provider.removeListener(event, handler);
    }
  }

  // ZIGAP 지갑 연결 해제
  disconnectZigap(): void {
    if (this.provider) {
      this.provider = null;
      console.log("🔌 ZIGAP wallet disconnected");
    }
  }

  // ZIGAP 지갑 연결 상태 확인
  isZigapConnected(): boolean {
    if (this.isTestMode) {
      return true; // 테스트 모드에서는 항상 연결됨
    }
    return !!(this.provider && this.provider.isConnected && this.provider.isConnected());
  }

  // 테스트 모드 설정
  setTestMode(enabled: boolean): void {
    this.isTestMode = enabled;
    console.log(`🧪 ZIGAP wallet test mode: ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// ZIGAP 서비스 인스턴스 생성
export const zigapWalletService = new ZigapWalletService();