import { ethers } from "ethers";
import { XPHERE_NETWORK } from "./constants";

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
      throw new Error("MetaMask is not installed");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this._provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this._provider.getSigner();

      return accounts[0];
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error}`);
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
}

export const web3Service = new Web3Service();
