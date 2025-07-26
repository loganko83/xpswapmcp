import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { WalletSelector } from '../WalletSelector';

interface EmergencyActionsProps {
  userAddress: string;
  loading: boolean;
  isWalletSelectorOpen: boolean;
  setIsWalletSelectorOpen: (open: boolean) => void;
  onConnectWallet: () => Promise<void>;
}

export function EmergencyActions({ 
  userAddress, 
  loading, 
  isWalletSelectorOpen, 
  setIsWalletSelectorOpen, 
  onConnectWallet 
}: EmergencyActionsProps) {
  if (userAddress) {
    return null; // 지갑이 연결된 경우 이 컴포넌트는 표시하지 않음
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Connect your wallet to start staking XPS tokens
          </p>
          <Button onClick={() => setIsWalletSelectorOpen(true)} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </CardContent>
      </Card>

      <WalletSelector
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
    </>
  );
}