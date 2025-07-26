import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, X } from "lucide-react";

interface PerpetualPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  margin: number;
  maintenanceMargin: number;
  marginRatio: number;
  fundingCost: number;
}

interface PositionManagerProps {
  positions: PerpetualPosition[];
  onClosePosition: (positionId: string) => void;
  onAddMargin: (positionId: string, amount: number) => void;
}

export function PositionManager({ positions, onClosePosition, onAddMargin }: PositionManagerProps) {
  const totalUnrealizedPnl = positions?.reduce((sum, pos) => sum + pos.unrealizedPnl, 0) || 0;
  const totalMargin = positions?.reduce((sum, pos) => sum + pos.margin, 0) || 0;
  const totalFundingCost = positions?.reduce((sum, pos) => sum + pos.fundingCost, 0) || 0;

  const getRiskLevel = (marginRatio: number) => {
    if (marginRatio <= 0.1) return { level: 'CRITICAL', color: 'bg-red-600' };
    if (marginRatio <= 0.2) return { level: 'HIGH', color: 'bg-orange-600' };
    if (marginRatio <= 0.5) return { level: 'MEDIUM', color: 'bg-yellow-600' };
    return { level: 'LOW', color: 'bg-green-600' };
  };

  if (!positions || positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Active Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active positions</p>
            <p className="text-sm">Open a position to start trading perpetual futures</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{positions.length}</p>
              <p className="text-sm text-gray-600">Active Positions</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalUnrealizedPnl.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Unrealized P&L</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">${totalMargin.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Margin</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${totalFundingCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${totalFundingCost.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Funding Cost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Mark Price</TableHead>
                  <TableHead>Liq. Price</TableHead>
                  <TableHead>Unrealized P&L</TableHead>
                  <TableHead>Margin Ratio</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const risk = getRiskLevel(position.marginRatio);
                  return (
                    <TableRow key={position.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={position.side === 'long' ? "default" : "destructive"}
                          className={position.side === 'long' ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {position.side === 'long' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {position.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${position.size.toLocaleString()}</TableCell>
                      <TableCell>{position.leverage}x</TableCell>
                      <TableCell>${position.entryPrice.toFixed(6)}</TableCell>
                      <TableCell>${position.markPrice.toFixed(6)}</TableCell>
                      <TableCell className="text-red-600">
                        ${position.liquidationPrice.toFixed(6)}
                      </TableCell>
                      <TableCell>
                        <div className={position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <div className="font-medium">
                            ${position.unrealizedPnl.toFixed(2)}
                          </div>
                          <div className="text-xs">
                            ({position.unrealizedPnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${risk.color}`}></div>
                          <span className="text-xs font-medium">
                            {(position.marginRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                        {position.marginRatio <= 0.2 && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Risk</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddMargin(position.id, position.margin * 0.5)}
                            className="text-xs"
                            disabled={position.marginRatio > 0.5}
                          >
                            Add Margin
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onClosePosition(position.id)}
                            className="text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Position Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positions.map((position) => {
          const risk = getRiskLevel(position.marginRatio);
          return (
            <Card key={`${position.id}-details`} className="border-l-4" style={{borderLeftColor: risk.color.includes('red') ? '#dc2626' : risk.color.includes('orange') ? '#ea580c' : risk.color.includes('yellow') ? '#ca8a04' : '#16a34a'}}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{position.symbol}</CardTitle>
                  <Badge 
                    variant={position.side === 'long' ? "default" : "destructive"}
                    className={position.side === 'long' ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {position.side === 'long' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {position.side.toUpperCase()} {position.leverage}x
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Position Size:</span>
                    <p className="font-medium">${position.size.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Entry Price:</span>
                    <p className="font-medium">${position.entryPrice.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mark Price:</span>
                    <p className="font-medium">${position.markPrice.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Liq. Price:</span>
                    <p className="font-medium text-red-600">${position.liquidationPrice.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Margin:</span>
                    <p className="font-medium">${position.margin.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Funding:</span>
                    <p className={`font-medium ${position.fundingCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${position.fundingCost.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Unrealized P&L:</span>
                    <div className={`text-right ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="font-bold">${position.unrealizedPnl.toFixed(2)}</p>
                      <p className="text-xs">({position.unrealizedPnlPercent.toFixed(2)}%)</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Risk Level:</span>
                    <Badge variant="outline" className={`${risk.color} text-white border-0`}>
                      {risk.level}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddMargin(position.id, position.margin * 0.5)}
                    className="flex-1"
                    disabled={position.marginRatio > 0.5}
                  >
                    Add Margin
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onClosePosition(position.id)}
                    className="flex-1"
                  >
                    Close Position
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
