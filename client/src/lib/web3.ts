import { ethers } from "ethers";
import { XPHERE_NETWORK, CONTRACT_ADDRESSES } from "./constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private _provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  get provider() {
    return this._provider;
  }

  get contractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  async isMetaMaskInstalled(): Promise<boolean> {
    return typeof window.ethereum !== "undefined";
  }

  async initializeProvider(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    
    this._provider = new ethers.BrowserProvider(window.ethereum);
    try {
      this.signer = await this._provider.getSigner();
    } catch (error) {
      console.warn("Could not get signer, user may not be connected:", error);
    }
  }

  async connectWallet(): Promise<string> {
    if (!await this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask extension.");
    }

    try {
      console.log("Requesting MetaMask connection...");
      
      // Request account access - this should trigger MetaMask popup
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("MetaMask accounts received:", accounts);

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }

      // Initialize provider and signer
      this._provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this._provider.getSigner();

      console.log("MetaMask connection successful:", accounts[0]);
      return accounts[0];
    } catch (error: any) {
      console.error("MetaMask connection error:", error);
      
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        throw new Error("Connection cancelled by user");
      } else if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check MetaMask.");
      } else {
        throw new Error(`Failed to connect wallet: ${error.message || error}`);
      }
    }
  }

  async addXphereNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${XPHERE_NETWORK.chainId.toString(16)}`,
            chainName: XPHERE_NETWORK.chainName,
            nativeCurrency: XPHERE_NETWORK.nativeCurrency,
            rpcUrls: XPHERE_NETWORK.rpcUrls,
            blockExplorerUrls: XPHERE_NETWORK.blockExplorerUrls,
          },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to add Xphere network: ${error}`);
    }
  }

  async switchToXphereNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${XPHERE_NETWORK.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await this.addXphereNetwork();
      } else {
        throw new Error(`Failed to switch to Xphere network: ${error}`);
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this._provider) {
      throw new Error("Provider not initialized");
    }

    const balance = await this._provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getChainId(): Promise<number> {
    if (!this._provider) {
      throw new Error("Provider not initialized");
    }

    const network = await this._provider.getNetwork();
    return Number(network.chainId);
  }

  async getGasPrice(): Promise<string> {
    if (!this._provider) {
      throw new Error("Provider not initialized");
    }

    const feeData = await this._provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || BigInt(0), "gwei");
  }

  async estimateGas(transaction: any): Promise<string> {
    if (!this._provider) {
      throw new Error("Provider not initialized");
    }

    const estimate = await this._provider.estimateGas(transaction);
    return estimate.toString();
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer not initialized");
    }

    const tx = await this.signer.sendTransaction(transaction);
    return tx.hash;
  }

  async waitForTransaction(hash: string): Promise<any> {
    if (!this._provider) {
      throw new Error("Provider not initialized");
    }

    return await this._provider.waitForTransaction(hash);
  }

  disconnect(): void {
    this._provider = null;
    this.signer = null;
  }

  // Add XPS token balance check
  async checkXPSBalance(address: string): Promise<string> {
    if (!this._provider || !address) return "0";
    
    try {
      // XPS token contract address from constants
      const xpsAddress = CONTRACT_ADDRESSES.XPSToken;
      
      if (!xpsAddress) {
        console.log('XPS contract address not found');
        return "0";
      }
      
      // ERC20 balanceOf ABI
      const erc20ABI = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      const xpsContract = new ethers.Contract(xpsAddress, erc20ABI, this._provider);
      
      // Check if contract is deployed
      const code = await this._provider.getCode(xpsAddress);
      if (code === '0x') {
        console.log('XPS contract not deployed');
        return "0";
      }
      
      // Get decimals (should be 18 for XPS)
      let decimals = 18;
      try {
        decimals = await xpsContract.decimals();
      } catch (error) {
        console.log('Using default decimals (18)');
      }
      
      const balance = await xpsContract.balanceOf(address);
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to check XPS balance:', error);
      return "0";
    }
  }

  // XPS Token purchase with XP
  async purchaseXPS(xpAmount: string, xpsAmount: string): Promise<boolean> {
    try {
      if (!this._provider || !this.signer) {
        throw new Error('Web3 not initialized');
      }

      // 판매자 주소 (XPS를 판매하는 주소)
      const sellerAddress = '0xf0C5d4889cb250956841c339b5F3798320303D5f';
      const xpWei = ethers.parseEther(xpAmount);

      console.log(`Purchasing ${xpsAmount} XPS for ${xpAmount} XP`);
      console.log(`Sending XP to seller: ${sellerAddress}`);

      // XP를 판매자에게 전송
      const tx = await this.signer.sendTransaction({
        to: sellerAddress,
        value: xpWei,
        gasLimit: 100000
      });

      console.log('XP payment transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('XP payment confirmed:', receipt.transactionHash);

      // 실제 운영에서는 판매자가 XPS 토큰을 구매자에게 전송해야 함
      // 현재는 구매 완료로 처리
      console.log(`XPS Purchase completed: ${xpAmount} XP -> ${xpsAmount} XPS`);

      return true;
    } catch (error) {
      console.error('XPS purchase failed:', error);
      throw error;
    }
  }

  // Get XPS price in XP
  async getXPSPriceInXP(): Promise<number> {
    try {
      // 현재는 고정 비율 사용 (1 XPS = 1 USD)
      const XPS_PRICE_USD = 1.0;
      const XP_PRICE_USD = 0.016637677219988174; // 실시간 가격
      
      return XPS_PRICE_USD / XP_PRICE_USD;
    } catch (error) {
      console.error('Error getting XPS price:', error);
      return 60.1; // 기본값
    }
  }
}

export const web3Service = new Web3Service();
