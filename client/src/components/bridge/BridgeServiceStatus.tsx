import { Card, CardContent } from "@/components/ui/card";

interface BridgeServiceStatusProps {
  isInitialized: boolean;
  error: string | null;
  supportedChainsCount: number;
}

export function BridgeServiceStatus({ 
  isInitialized, 
  error, 
  supportedChainsCount 
}: BridgeServiceStatusProps) {
  return (
    <div className="mt-6 max-w-md mx-auto">
      <Card className={`${
        isInitialized 
          ? 'border-green-500/30 bg-green-500/10' 
          : error 
            ? 'border-red-500/30 bg-red-500/10' 
            : 'border-yellow-500/30 bg-yellow-500/10'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isInitialized 
                ? 'bg-green-500' 
                : error 
                  ? 'bg-red-500' 
                  : 'bg-yellow-500 animate-pulse'
            }`} />
            <div className="text-left">
              <div className={`font-medium ${
                isInitialized 
                  ? 'text-green-300' 
                  : error 
                    ? 'text-red-300' 
                    : 'text-yellow-300'
              }`}>
                {isInitialized 
                  ? 'Li.Fi Bridge Service: Connected' 
                  : error 
                    ? 'Li.Fi Bridge Service: Disconnected' 
                    : 'Li.Fi Bridge Service: Connecting...'
                }
              </div>
              <div className="text-sm text-gray-400">
                {isInitialized 
                  ? `${supportedChainsCount} networks available` 
                  : error 
                    ? 'Bridge service unavailable' 
                    : 'Connecting to bridge aggregator...'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
