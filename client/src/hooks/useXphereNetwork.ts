import { useState, useEffect } from "react";
import { web3Service } from "@/lib/web3";
import { XPHERE_NETWORK } from "@/lib/constants";

export function useXphereNetwork() {
  const [isXphereNetwork, setIsXphereNetwork] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const chainId = await web3Service.getChainId();
          setIsXphereNetwork(chainId === XPHERE_NETWORK.chainId);
        }
      } catch (error) {
        console.error("Failed to check network:", error);
        setIsXphereNetwork(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkNetwork();

    // Listen for network changes
    if (typeof window.ethereum !== "undefined") {
      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setIsXphereNetwork(newChainId === XPHERE_NETWORK.chainId);
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const switchToXphere = async () => {
    try {
      await web3Service.switchToXphereNetwork();
      setIsXphereNetwork(true);
    } catch (error) {
      console.error("Failed to switch to Xphere network:", error);
      throw error;
    }
  };

  const addXphereNetwork = async () => {
    try {
      await web3Service.addXphereNetwork();
    } catch (error) {
      console.error("Failed to add Xphere network:", error);
      throw error;
    }
  };

  return {
    isXphereNetwork,
    isChecking,
    switchToXphere,
    addXphereNetwork,
  };
}
