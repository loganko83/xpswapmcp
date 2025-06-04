import { ethers } from "ethers";
import { XPHERE_NETWORK } from "./constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async isMetaMaskInstalled(): Promise<boolean> {
    return typeof window.ethereum !== "undefined";
  }

  async connectWallet(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

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
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async getGasPrice(): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const gasPrice = await this.provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, "gwei");
  }

  async estimateGas(transaction: any): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const estimate = await this.provider.estimateGas(transaction);
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
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    return await this.provider.waitForTransaction(hash);
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }
}

export const web3Service = new Web3Service();
