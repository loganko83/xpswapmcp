import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Calendar } from 'lucide-react';

interface StakingHistoryProps {
  stakingAnalytics: any;
  analyticsLoading: boolean;
  userAddress: string;
}

export function StakingHistory({ stakingAnalytics, analyticsLoading, userAddress }: StakingHistoryProps) {
  if (analyticsLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!stakingAnalytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No staking analytics available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Staking Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Staked</span>
              <span className="font-semibold">{stakingAnalytics.totalStaked.toLocaleString()} XPS</span>
            </div>
            <div className="flex justify-between">
              <span>Active Stakings</span>
              <span className="font-semibold">{stakingAnalytics.activeStakings}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Rewards</span>
              <span className="font-semibold text-green-500">
                {stakingAnalytics.totalRewards.toLocaleString()} XPS
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average APY</span>
              <span className="font-semibold text-blue-500">{stakingAnalytics.averageAPY.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Active Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stakingAnalytics.summary.activePeriods.length > 0 ? (
            <div className="space-y-3">
              {stakingAnalytics.summary.activePeriods.map((period, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{period.amount.toLocaleString()} XPS</p>
                    <p className="text-sm text-muted-foreground">{period.lockPeriod}d @ {period.apy}% APY</p>
                  </div>
                  <Badge variant="outline">
                    {period.estimatedRewards.toLocaleString()} XPS
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active staking positions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}