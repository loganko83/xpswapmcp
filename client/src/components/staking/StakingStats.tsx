import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { XPSService } from '@/lib/xpsService';

interface StakingStatsProps {
  xpsBalance: string;
  stakingInfo: any;
}

export function StakingStats({ xpsBalance, stakingInfo }: StakingStatsProps) {
  const getFeeDiscountTier = (balance: number) => {
    const totalBalance = balance + parseFloat(stakingInfo?.stakedAmount || '0');
    return XPSService.getFeeDiscountTier(totalBalance);
  };

  const tier = getFeeDiscountTier(parseFloat(xpsBalance));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          XPS Token Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Supply</p>
            <p className="text-lg font-semibold">1,000,000,000 XPS</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Burned</p>
            <p className="text-lg font-semibold text-red-500">0 XPS</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-lg font-semibold text-green-500">{parseFloat(xpsBalance).toLocaleString()} XPS</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Fee Discount</p>
            <Badge variant={tier.discount > 0 ? "default" : "secondary"}>
              {tier.tier} - {XPSService.formatFeeDiscount(tier.discount)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}