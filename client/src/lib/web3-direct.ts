import { CONTRACT_ADDRESSES } from "./constants";

// ENS 없이 직접 Web3 호출을 위한 서비스
export class DirectWeb3Service {
  
  // 직접 스테이킹 함수 (ENS 완전 우회)
  async stakeXPSDirect(amount: string, lockPeriod: number): Promise<{success: boolean; transactionHash?: string; error?: string}> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not available');
      }

      // 계정 확인
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        throw new Error('지갑이 연결되지 않았습니다');
      }

      const userAddress = accounts[0];
      console.log(`Direct staking ${amount} XPS for ${lockPeriod} days`);

      // 토큰 양 변환 (18 decimals)
      const tokenAmount = (BigInt(parseFloat(amount) * 1e18)).toString(16);
      const lockPeriodHex = lockPeriod.toString(16);

      // XPS 토큰 컨트랙트 - approve 먼저 호출
      const xpsTokenAddress = CONTRACT_ADDRESSES.XPSToken;
      const stakingAddress = CONTRACT_ADDRESSES.XpSwapStaking;

      // 1. 토큰 승인 (approve)
      const approveData = '0x095ea7b3' + // approve(address,uint256)
                         stakingAddress.slice(2).padStart(64, '0') + // spender
                         tokenAmount.padStart(64, '0'); // amount

      const approveTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: xpsTokenAddress,
          data: approveData,
          gas: '0x15f90' // 90000
        }]
      });

      console.log('Approve transaction sent:', approveTx);

      // 승인 트랜잭션 대기
      await this.waitForTransaction(approveTx);

      // 2. 스테이킹 실행
      const stakeData = '0xa694fc3a' + // stake(uint256,uint256)
                       tokenAmount.padStart(64, '0') + // amount
                       lockPeriodHex.padStart(64, '0'); // lockPeriod

      const stakeTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: stakingAddress,
          data: stakeData,
          gas: '0x30d40' // 200000
        }]
      });

      console.log('Stake transaction sent:', stakeTx);

      return {
        success: true,
        transactionHash: stakeTx
      };

    } catch (error: any) {
      console.error('Direct staking failed:', error);
      return {
        success: false,
        error: error.message || "스테이킹 실행 중 오류가 발생했습니다"
      };
    }
  }

  // 트랜잭션 대기 함수
  private async waitForTransaction(txHash: string): Promise<void> {
    let attempts = 0;
    const maxAttempts = 60; // 60초 대기

    while (attempts < maxAttempts) {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });

        if (receipt && receipt.status) {
          return;
        }
      } catch (error) {
        // 계속 시도
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Transaction timeout');
  }

  // 스테이킹 정보 직접 조회
  async getStakingInfoDirect(address: string): Promise<{stakedAmount: string; lockPeriod: number; unlockTime: number; rewards: string} | null> {
    try {
      if (!window.ethereum) {
        return null;
      }

      const stakingAddress = CONTRACT_ADDRESSES.XpSwapStaking;
      
      // getStakeInfo(address) 함수 호출
      const callData = '0x7d49d875' + // getStakeInfo(address)
                      address.slice(2).padStart(64, '0'); // address

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: stakingAddress,
          data: callData
        }, 'latest']
      });

      if (result && result !== '0x') {
        // 결과 파싱 (4개의 uint256 값)
        const stakedAmount = BigInt('0x' + result.slice(2, 66));
        const lockPeriod = BigInt('0x' + result.slice(66, 130));
        const unlockTime = BigInt('0x' + result.slice(130, 194));
        const rewards = BigInt('0x' + result.slice(194, 258));

        return {
          stakedAmount: (Number(stakedAmount) / 1e18).toString(),
          lockPeriod: Number(lockPeriod),
          unlockTime: Number(unlockTime),
          rewards: (Number(rewards) / 1e18).toString()
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get staking info directly:', error);
      return null;
    }
  }

  // 보상 클레임 직접 실행
  async claimRewardsDirect(): Promise<{success: boolean; transactionHash?: string; error?: string}> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not available');
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        throw new Error('지갑이 연결되지 않았습니다');
      }

      const userAddress = accounts[0];
      const stakingAddress = CONTRACT_ADDRESSES.XpSwapStaking;

      // claimRewards() 함수 호출
      const claimData = '0xe6f1daf2'; // claimRewards()

      const claimTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: stakingAddress,
          data: claimData,
          gas: '0x30d40' // 200000
        }]
      });

      console.log('Claim transaction sent:', claimTx);

      return {
        success: true,
        transactionHash: claimTx
      };

    } catch (error: any) {
      console.error('Direct claim failed:', error);
      return {
        success: false,
        error: error.message || "보상 클레임 중 오류가 발생했습니다"
      };
    }
  }
}

export const directWeb3Service = new DirectWeb3Service();