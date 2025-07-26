import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Globe } from "lucide-react";
import { SupportedNetwork } from "./types";

interface NetworkSelectorProps {
  networks: SupportedNetwork[];
  fromNetwork: SupportedNetwork | null;
  toNetwork: SupportedNetwork | null;
  onFromNetworkChange: (network: SupportedNetwork | null) => void;
  onToNetworkChange: (network: SupportedNetwork | null) => void;
  onSwapNetworks: () => void;
}

export function NetworkSelector({
  networks,
  fromNetwork,
  toNetwork,
  onFromNetworkChange,
  onToNetworkChange,
  onSwapNetworks
}: NetworkSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Network Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">From Network</label>
          <Select 
            value={fromNetwork?.chainId.toString()} 
            onValueChange={(value) => {
              const network = networks.find((n: SupportedNetwork) => n.chainId.toString() === value);
              onFromNetworkChange(network || null);
            }}
          >
            <SelectTrigger className="bg-black/20 border-white/10 text-white">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network: SupportedNetwork) => (
                <SelectItem key={network.chainId} value={network.chainId.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    {network.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">To Network</label>
          <Select 
            value={toNetwork?.chainId.toString()} 
            onValueChange={(value) => {
              const network = networks.find((n: SupportedNetwork) => n.chainId.toString() === value);
              onToNetworkChange(network || null);
            }}
          >
            <SelectTrigger className="bg-black/20 border-white/10 text-white">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network: SupportedNetwork) => (
                <SelectItem key={network.chainId} value={network.chainId.toString()}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    {network.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Swap Networks Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onSwapNetworks}
          className="bg-black/20 border-white/10 text-white hover:bg-white/10"
        >
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
