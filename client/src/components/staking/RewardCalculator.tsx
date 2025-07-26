import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { XPSService } from '@/lib/xpsService';

interface RewardCalculatorProps {
  xpsBalance: string;
  stakingInfo: any;
}

export function RewardCalculator({ xpsBalance, stakingInfo }: RewardCalculatorProps) {
  const feeDiscountTiers = [
    { tier: 'Basic', amount: 1000, discount: 10 },
    { tier: 'Bronze', amount: 5000, discount: 20 },
    { tier: 'Silver', amount: 10000, discount: 30 },
    { tier: 'Gold', amount: 50000, discount: 50 },
    { tier: 'Platinum', amount: 100000, discount: 75 }
  ];

  const userBalance = parseFloat(xpsBalance) + parseFloat(stakingInfo?.stakedAmount || '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Fee Discount Tiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feeDiscountTiers.map((tierData) => {
            const isCurrentTier = userBalance >= tierData.amount && 
              (tierData.tier === 'Platinum' || userBalance < ([5000, 10000, 50000, 100000][['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(tierData.tier)] || Infinity));
            
            return (
              <div key={tierData.tier} className={`flex items-center justify-between p-3 rounded-lg border ${isCurrentTier ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <Badge variant={isCurrentTier ? "default" : "secondary"}>
                    {tierData.tier}
                  </Badge>
                  <div>
                    <p className="font-medium">{tierData.amount.toLocaleString()} XPS</p>
                    <p className="text-sm text-muted-foreground">{tierData.discount}% fee discount</p>
                  </div>
                </div>
                {isCurrentTier && (
                  <Badge variant="default">Current</Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}