import { Layout } from '@/components/Layout';
import { XPSStakingInterface } from '@/components/XPSStakingInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Shield, Zap } from 'lucide-react';

export default function XPSStakingPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">XPS Staking</h1>
            <Badge variant="default">Native Token</Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Stake XPS tokens to earn rewards and unlock premium trading features with fee discounts
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Earn Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stake XPS tokens to earn up to 400% APY based on your lock period. 
                Longer locks provide higher multipliers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                Fee Discounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get up to 75% discount on trading fees based on your total XPS holdings 
                (wallet + staked balance).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-purple-500" />
                Deflationary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                40% of protocol revenue is used to buy back and burn XPS tokens, 
                creating deflationary pressure.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* XPS Staking Interface */}
        <XPSStakingInterface />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Staking Mechanics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold">Lock Period Multipliers:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 30 days: 1.0x (100% APY)</li>
                  <li>• 90 days: 1.5x (150% APY)</li>
                  <li>• 180 days: 2.5x (250% APY)</li>
                  <li>• 365 days: 4.0x (400% APY)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Emergency Withdrawal:</h4>
                <p className="text-sm text-muted-foreground">
                  You can withdraw staked tokens anytime but with a 25% penalty.
                  Penalty tokens are burned, contributing to deflation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee Discount Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">Tier Requirements:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Basic: 1,000 XPS (10% discount)</li>
                    <li>• Bronze: 5,000 XPS (20% discount)</li>
                    <li>• Silver: 10,000 XPS (30% discount)</li>
                    <li>• Gold: 50,000 XPS (50% discount)</li>
                    <li>• Platinum: 100,000 XPS (75% discount)</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Balance calculation includes both wallet and staked tokens.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}