import { useEffect, useState } from 'react';
import { useWeb3Context } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { ethers } from 'ethers';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

// Token addresses on Xphere network - 실제 컨트랙트 주소
const TOKEN_ADDRESSES: Record<string, string> = {
  'XP': 'native', // Native token
  'XPS': '0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2', // XPS 실제 컨트랙트 주소
  'XCR': '0x0C6bd4C7581cCc3205eC69BEaB6e6E89A27D45aE', // XCROLL 실제 컨트랙트 주소
  'XEF': '0x80252c2d06bbd85699c555fc3633d5b8ee67c9ad', // XEF 실제 컨트랙트 주소
  'ml': '0x889E7CA318d7653630E3e874597D2f35EE7ACc84', // Mello 실제 컨트랙트 주소
  'USDT': '0x2345678901234567890123456789012345678901', // Mock USDT contract address
  'ETH': '0x3456789012345678901234567890123456789012', // Mock ETH contract address
  'BNB': '0x4567890123456789012345678901234567890123', // Mock BNB contract address
};

export function useTokenBalance(tokenSymbol: string) {
  const { wallet, isXphereNetwork } = useWeb3Context();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.isConnected || !wallet.address) {
        setBalance('0');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 실제 블록체인 데이터를 가져옴 (개발 환경에서도)
        // Mock 데이터는 완전히 제거하고 실제 연결만 사용
        if (!isXphereNetwork) {
          // Xphere 네트워크가 아닌 경우 경고 표시
          console.warn('Not connected to Xphere network. Please switch network.');
          setError('Please switch to Xphere network');
          setBalance('0');
          return;
        }

        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
        
        if (!tokenAddress) {
          throw new Error(`Unknown token: ${tokenSymbol}`);
        }

        let balance: string;

        if (tokenAddress === 'native' || tokenSymbol === 'XP') {
          // Get native XP balance
          balance = await web3Service.getBalance(wallet.address);
        } else {
          // Get ERC20 token balance
          const provider = web3Service.getProvider();
          if (!provider) {
            throw new Error('No provider available');
          }

          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const rawBalance = await contract.balanceOf(wallet.address);
          const decimals = await contract.decimals();
          
          // Format balance with proper decimals
          balance = ethers.formatUnits(rawBalance, decimals);
        }

        setBalance(balance);
      } catch (err) {
        console.error(`Failed to fetch ${tokenSymbol} balance:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Poll for balance updates every 5 seconds
    const interval = setInterval(fetchBalance, 5000);

    return () => clearInterval(interval);
  }, [wallet.isConnected, wallet.address, tokenSymbol, isXphereNetwork]);

  return { balance, isLoading, error };
}