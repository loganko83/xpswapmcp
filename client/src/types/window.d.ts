declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: Function) => void;
      removeListener?: (event: string, handler: Function) => void;
      removeAllListeners?: (event: string) => void;
      selectedAddress?: string;
      chainId?: string;
    };
    zigap?: {
      isZigap?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: Function) => void;
      removeListener?: (event: string, handler: Function) => void;
      selectedAddress?: string;
      chainId?: string;
      isConnected?: () => boolean;
      enable?: () => Promise<string[]>;
      getXPBalance?: () => Promise<string>;
      getXPSBalance?: () => Promise<string>;
      sendXP?: (to: string, amount: string) => Promise<string>;
      sendXPS?: (to: string, amount: string) => Promise<string>;
    };
  }
}

export {};
