import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDownUp, 
  Zap, 
  TrendingUp, 
  Clock, 
  Shield,
  ExternalLink,
  Info,
  RefreshCw
} from "lucide-react";
import { Token } from "@/types";
import { dexAggregator, AggregatedQuote, EXTERNAL_DEXES } from "@/lib/aggregator";
import { useWeb3Context } from "@/contexts/Web3Context";

interface AggregatorSwapInterfaceProps {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
}

export function AggregatorSwapInterface({ 
  fromToken, 
  toToken, 
  fromAmount 
}: AggregatorSwapInterfaceProps) {
  const { wallet } = useWeb3Context();
  const [aggregatedQuote, setAggregatedQuote] = useState<AggregatedQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const supportedNetworks = dexAggregator.getSupportedNetworks();
  const isNetworkSupported = wallet.chainId ? supportedNetworks.includes(wallet.chainId) : false;

  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0 && isNetworkSupported) {
      fetchAggregatedQuote();
    }
  }, [fromToken, toToken, fromAmount, wallet.chainId, isNetworkSupported]);

  const fetchAggregatedQuote = async () => {
    if (!fromToken || !toToken || !wallet.chainId) return;

    setIsLoading(true);
    setError(null);

    try {
      const quote = await dexAggregator.getAggregatedQuote(
        fromToken.address,
        toToken.address,
        fromAmount,
        wallet.chainId
      );
      setAggregatedQuote(quote);
      setSelectedQuote(quote.bestQuote.dex);
    } catch (err: any) {
      setError(err.message);
      setAggregatedQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum";
      case 56: return "BSC";
      case 137: return "Polygon";
      case 20250217: return "Xphere";
      default: return `Chain ${chainId}`;
    }
  };

  const formatCurrency = (amount: string, symbol: string) => {
    const num = parseFloat(amount);
    if (num < 0.001) return `< 0.001 ${symbol}`;
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
  };

  if (!isNetworkSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <div className="space-y-2">
                <p>External DEX aggregation is available on:</p>
                <div className="flex flex-wrap gap-2">
                  {supportedNetworks.map(chainId => (
                    <Badge key={chainId} variant="outline" className="text-orange-600 border-orange-300">
                      {getNetworkName(chainId)}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm">Switch to a supported network to access external liquidity.</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Zap className="w-5 h-5" />
          DEX Aggregator
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Best Price Guaranteed
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure your swap above to see aggregated quotes from multiple DEXes.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Quote Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Best Rate
                </div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Finding best price...</span>
                  </div>
                ) : aggregatedQuote ? (
                  <div>
                    <div className="font-semibold text-lg">
                      {formatCurrency(aggregatedQuote.bestQuote.amountOut, toToken.symbol)}
                    </div>
                    <div className="text-sm text-green-600">
                      via {aggregatedQuote.bestQuote.dex}
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-sm text-red-600">{error}</div>
                ) : null}
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Shield className="w-4 h-4" />
                  Savings
                </div>
                {aggregatedQuote && (
                  <div>
                    <div className="font-semibold text-lg text-green-600">
                      {aggregatedQuote.savings}
                    </div>
                    <div className="text-sm text-gray-500">
                      vs 2nd best
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  Execution Time
                </div>
                {aggregatedQuote && (
                  <div>
                    <div className="font-semibold text-lg">
                      {aggregatedQuote.executionTime}ms
                    </div>
                    <div className="text-sm text-gray-500">
                      Quote time
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Quotes */}
            {aggregatedQuote && (
              <Tabs value={selectedQuote || aggregatedQuote.bestQuote.dex} onValueChange={setSelectedQuote}>
                <TabsList className="grid w-full grid-cols-3">
                  {aggregatedQuote.allQuotes.slice(0, 3).map((quote) => (
                    <TabsTrigger key={quote.dex} value={quote.dex} className="text-xs">
                      {quote.dex}
                      {quote.dex === aggregatedQuote.bestQuote.dex && (
                        <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-700">
                          Best
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {aggregatedQuote.allQuotes.slice(0, 3).map((quote) => (
                  <TabsContent key={quote.dex} value={quote.dex} className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{quote.dex}</h4>
                          <p className="text-sm text-gray-600">
                            Network: {getNetworkName(
                              EXTERNAL_DEXES.find(dex => dex.name === quote.dex)?.chainId || 1
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatCurrency(quote.amountOut, toToken.symbol)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Output Amount
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price Impact:</span>
                          <span className={`ml-2 font-medium ${
                            quote.priceImpact > 3 ? 'text-red-600' : 
                            quote.priceImpact > 1 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {quote.priceImpact.toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Est. Gas:</span>
                          <span className="ml-2 font-medium">{parseInt(quote.gas).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <span className="ml-2 font-medium">{quote.confidence.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Route:</span>
                          <span className="ml-2 font-medium">Direct</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4" 
                        variant={quote.dex === aggregatedQuote.bestQuote.dex ? "default" : "outline"}
                        disabled={!wallet.isConnected}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Swap via {quote.dex}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}

            {/* Network Info */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <div className="space-y-1">
                  <p className="font-medium">Cross-chain Aggregation Active</p>
                  <p className="text-sm">
                    Quotes from {EXTERNAL_DEXES.filter(dex => 
                      dex.chainId === wallet.chainId && dex.enabled
                    ).length} external DEXes on {getNetworkName(wallet.chainId || 1)}
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Refresh Button */}
            <Button 
              variant="outline" 
              onClick={fetchAggregatedQuote}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Updating Quotes...' : 'Refresh Quotes'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}