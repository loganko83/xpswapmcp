import { ethers } from "ethers";

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
    };
    ethereum?: any;
  }
}

export interface ZigapProvider {
  isZigap: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: Function) => void;
  removeListener: (event: string, handler: Function) => void;
  selectedAddress?: string;
  chainId?: string;
  isConnected: () => boolean;
  enable: () => Promise<string[]>;
}

export class ZigapWalletService {
  private provider: ZigapProvider | null = null;

  // ZIGAP 지갑이 설치되어 있는지 확인
  async isZigapInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // ZIGAP 지갑 감지 로직
    return !!(window.zigap && window.zigap.isZigap);
  }

  // 모바일 환경 감지
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // ZIGAP 지갑 연결
  async connectZigap(): Promise<string> {
    console.log("🔗 Starting ZIGAP wallet connection...");

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

  // 모바일 ZIGAP 앱 처리
  private handleMobileZigap(): void {
    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent;
    
    // ZIGAP 앱 딥링크 생성 (가정)
    const zigapDeepLink = `zigap://dapp/${window.location.host}`;
    
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

  // ZIGAP 지갑 계정 가져오기
  async getZigapAccounts(): Promise<string[]> {
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

  // ZIGAP 지갑 잔액 조회
  async getZigapBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      const balance = await this.provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get ZIGAP balance:", error);
      return "0";
    }
  }

  // ZIGAP 지갑 체인 ID 조회
  async getZigapChainId(): Promise<number> {
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

  // ZIGAP 지갑에서 네트워크 전환
  async switchZigapNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // 네트워크가 추가되지 않은 경우
        throw new Error("ZIGAP 지갑에 해당 네트워크를 추가해주세요.");
      } else {
        throw new Error(`네트워크 전환 실패: ${error.message}`);
      }
    }
  }

  // ZIGAP 지갑 트랜잭션 전송
  async sendZigapTransaction(transaction: any): Promise<string> {
    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });
      
      return txHash;
    } catch (error: any) {
      console.error("ZIGAP transaction failed:", error);
      throw new Error(`트랜잭션 실패: ${error.message || error}`);
    }
  }

  // ZIGAP 지갑 이벤트 리스너 추가
  onZigapAccountsChanged(handler: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on("accountsChanged", handler);
    }
  }

  onZigapChainChanged(handler: (chainId: string) => void): void {
    if (this.provider) {
      this.provider.on("chainChanged", handler);
    }
  }

  // ZIGAP 지갑 이벤트 리스너 제거
  removeZigapListener(event: string, handler: Function): void {
    if (this.provider) {
      this.provider.removeListener(event, handler);
    }
  }

  // ZIGAP 지갑 연결 해제
  disconnectZigap(): void {
    if (this.provider) {
      // ZIGAP 지갑 연결 해제 로직
      this.provider = null;
      console.log("🔌 ZIGAP wallet disconnected");
    }
  }

  // ZIGAP 지갑 연결 상태 확인
  isZigapConnected(): boolean {
    return !!(this.provider && this.provider.isConnected && this.provider.isConnected());
  }

  // ZIGAP 토큰 추가 (watch asset)
  async addZigapToken(tokenAddress: string, symbol: string, decimals: number, image?: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      const wasAdded = await this.provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: symbol,
            decimals: decimals,
            image: image,
          },
        },
      });

      return wasAdded;
    } catch (error) {
      console.error("Failed to add ZIGAP token:", error);
      return false;
    }
  }

  // ZIGAP 지갑 서명
  async signZigapMessage(message: string, address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("ZIGAP 지갑이 연결되지 않았습니다.");
    }

    try {
      const signature = await this.provider.request({
        method: "personal_sign",
        params: [message, address],
      });

      return signature;
    } catch (error: any) {
      console.error("ZIGAP message signing failed:", error);
      throw new Error(`메시지 서명 실패: ${error.message || error}`);
    }
  }
}

// ZIGAP 서비스 인스턴스 생성
export const zigapWalletService = new ZigapWalletService();