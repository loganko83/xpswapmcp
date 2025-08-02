import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortfolioPosition, PortfolioAsset } from "./PortfolioTypes";
import { API_BASE_URL } from "@/lib/apiUrl";

interface PortfolioPositionsProps {
  positions: PortfolioPosition[];
  assets: PortfolioAsset[];
  showPrivate: boolean;
  formatCurrency: (amount: number) => string;
  getChangeColor: (change: number) => string;
  getRiskColor: (risk: string) => string;
}

export function PortfolioPositions({
  positions,
  assets,
  showPrivate,
  formatCurrency,
  getChangeColor,
  getRiskColor
}: PortfolioPositionsProps) {
  
  // Portfolio action handlers
  const handleTradeAsset = (assetSymbol: string) => {
    // Navigate to swap page with pre-selected token
    window.location.href = `/swap?token=${assetSymbol}`;
  };

  const handleUnstakeAsset = (assetSymbol: string) => {
    // TODO: Implement unstaking logic
    console.log('Unstaking asset:', assetSymbol);
    alert(`Unstaking ${assetSymbol} functionality will be implemented soon`);
  };

  const handleAddLiquidity = (positionId: string) => {
    // Navigate to pool page
    window.location.href = `/pool?action=add&position=${positionId}`;
  };

  const handleRemoveLiquidity = (positionId: string) => {
    // Navigate to pool page  
    window.location.href = `/pool?action=remove&position=${positionId}`;
  };

  const handleClaimRewards = (positionId: string) => {
    // TODO: Implement reward claiming logic
    console.log('Claiming rewards for position:', positionId);
    alert('Reward claiming functionality will be implemented soon');
  };

  const handleUnstakePosition = async (positionId: string) => {
    try {
      console.log('Unstaking position:', positionId);
      // TODO: Get wallet address from context
      const walletAddress = '0x742d35Cc6634C0532925a3b8D02C2aF73a0b6C5C'; // Temporary
      
      const response = await fetch(`${API_BASE_URL}/staking/unstake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          walletAddress
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Position unstaked successfully!');
        // TODO: Refresh positions data
      } else {
        alert('Failed to unstake position: ' + result.error);
      }
    } catch (error) {
      console.error('Error unstaking position:', error);
      alert('Error unstaking position. Please try again.');
    }
  };

  const handleHarvest = (positionId: string) => {
    // Navigate to farm page
    window.location.href = `/farm?action=harvest&position=${positionId}`;
  };

  const handleHarvestFarm = async (positionId: string) => {
    try {
      console.log('Harvesting farm rewards:', positionId);
      // TODO: Get wallet address from context
      const walletAddress = '0x742d35Cc6634C0532925a3b8D02C2aF73a0b6C5C'; // Temporary
      
      const response = await fetch(`${API_BASE_URL}/farming/harvest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          walletAddress
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Successfully harvested ${result.rewards} rewards!`);
        // TODO: Refresh positions data
      } else {
        alert('Failed to harvest rewards: ' + result.error);
      }
    } catch (error) {
      console.error('Error harvesting rewards:', error);
      alert('Error harvesting rewards. Please try again.');
    }
  };

  const handleExitFarm = async (positionId: string) => {
    try {
      console.log('Exiting farm position:', positionId);
      // TODO: Get wallet address from context
      const walletAddress = '0x742d35Cc6634C0532925a3b8D02C2aF73a0b6C5C'; // Temporary
      
      const response = await fetch(`${API_BASE_URL}/farming/exit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          walletAddress
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Successfully exited farm position!');
        // TODO: Refresh positions data
      } else {
        alert('Failed to exit farm: ' + result.error);
      }
    } catch (error) {
      console.error('Error exiting farm:', error);
      alert('Error exiting farm. Please try again.');
    }
  };

  const handleViewDetails = (positionId: string) => {
    // TODO: Open position details modal
    console.log('Viewing position details:', positionId);
    alert('Position details modal will be implemented soon');
  };

  return (
    <div className="space-y-6">
      {/* Asset Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Asset</th>
                  <th className="text-right p-3">Balance</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">24h Change</th>
                  <th className="text-right p-3">Value</th>
                  <th className="text-right p-3">Allocation</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right p-3">
                      <div className="text-right">
                        <div className="font-medium">
                          {showPrivate ? parseFloat(asset.balance).toFixed(4) : '••••'}
                        </div>
                        {asset.staked && (
                          <div className="text-xs text-purple-600">
                            Staked: {showPrivate ? asset.staked : '••••'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right p-3">${asset.price.toFixed(4)}</td>
                    <td className={`text-right p-3 ${getChangeColor(asset.change24h)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </div>
                    </td>
                    <td className="text-right p-3">
                      <div className="text-right">
                        <div className="font-medium">
                          {showPrivate ? formatCurrency(asset.usdValue) : '••••••'}
                        </div>
                        {asset.rewards && (
                          <div className="text-xs text-green-600">
                            Rewards: {showPrivate ? asset.rewards : '••••'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right p-3">
                      <div className="text-right">
                        <div>{asset.allocation.toFixed(1)}%</div>
                        {asset.apy && (
                          <div className="text-xs text-green-600">
                            {asset.apy.toFixed(1)}% APY
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-right p-3">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTradeAsset(asset.symbol)}
                        >
                          Trade
                        </Button>
                        {asset.staked && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUnstakeAsset(asset.symbol)}
                          >
                            Unstake
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active positions found</p>
                <p className="text-sm">Start by adding liquidity or staking tokens</p>
              </div>
            ) : (
              positions.map((position, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getRiskColor(position.risk)}>
                        {position.type}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {position.pair || position.token}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{position.amount}</span>
                          <span>•</span>
                          <span className="capitalize">Risk: {position.risk}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {showPrivate ? formatCurrency(position.usdValue) : '••••••'}
                      </div>
                      {position.apy && (
                        <div className="text-sm text-green-600">
                          {position.apy.toFixed(2)}% APY
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {position.rewards && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pending Rewards</span>
                        <span className="font-medium text-green-600">
                          {showPrivate ? position.rewards : '••••'}
                        </span>
                      </div>
                    )}
                    
                    {position.duration && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{position.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Position Actions */}
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    {position.type === 'liquidity' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddLiquidity(position.id)}
                        >
                          Add Liquidity
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRemoveLiquidity(position.id)}
                        >
                          Remove Liquidity
                        </Button>
                      </>
                    )}
                    {position.type === 'staking' && (
                      <>
                        {position.rewards && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleClaimRewards(position.id)}
                          >
                            Claim Rewards
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUnstakePosition(position.id)}
                        >
                          Unstake
                        </Button>
                      </>
                    )}
                    {position.type === 'farming' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleHarvestFarm(position.id)}
                        >
                          Harvest
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExitFarm(position.id)}
                        >
                          Exit Farm
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(position.id)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Position Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold">{positions.length}</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rewards</p>
                <p className="text-2xl font-bold">
                  {positions.filter(p => p.rewards).length}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. APY</p>
                <p className="text-2xl font-bold">
                  {positions.length > 0 
                    ? (positions.reduce((sum, p) => sum + (p.apy || 0), 0) / positions.length).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
              <div className="text-purple-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
