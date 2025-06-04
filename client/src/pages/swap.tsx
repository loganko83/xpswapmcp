import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Menu, Wallet, Activity } from "lucide-react";
import { SwapInterface } from "@/components/SwapInterface";
import { TransactionHistory } from "@/components/TransactionHistory";
import { TopPairs } from "@/components/TopPairs";
import { MarketOverview } from "@/components/MarketOverview";
import { LiquidityPools } from "@/components/LiquidityPools";
import { WalletConnect } from "@/components/WalletConnect";
import { useTheme } from "@/components/ThemeProvider";
import { useWeb3 } from "@/hooks/useWeb3";

export default function SwapPage() {
  const { theme, setTheme } = useTheme();
  const { wallet, connectWallet, disconnectWallet } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleWalletClick = () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Mock market stats
  const marketStats = {
    tvl: "$12.4M",
    tvlChange: "+12.3%",
    volume: "$2.8M",
    volumeChange: "-5.2%",
    pairs: "126",
    pairsChange: "+8",
    xpPrice: "$0.0842",
    xpChange: "+2.1%",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  XpSwap
                </span>
              </div>

              <nav className="hidden md:flex space-x-6">
                <a
                  href="/"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Swap
                </a>
                <a
                  href="/pool"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Pool
                </a>
                <a
                  href="/farm"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Farm
                </a>
                <a
                  href="/analytics"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Analytics
                </a>
              </nav>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Network Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Xphere</span>
              </div>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Wallet Connection */}
              <Button
                onClick={handleWalletClick}
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:scale-105 transition-all"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {wallet.isConnected
                  ? formatAddress(wallet.address!)
                  : "Connect Wallet"}
              </Button>

              {/* Mobile Menu */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Value Locked
                </span>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{marketStats.tvl}</div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {marketStats.tvlChange}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  24h Volume
                </span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{marketStats.volume}</div>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {marketStats.volumeChange}
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Active Pairs
                </span>
                <Activity className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{marketStats.pairs}</div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {marketStats.pairsChange} New
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  XP Price
                </span>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{marketStats.xpPrice}</div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {marketStats.xpChange}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Swap Interface and Transaction History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-center">
              <SwapInterface />
            </div>
            <TransactionHistory />
          </div>

          {/* Right Column - Market Data */}
          <div className="space-y-8">
            <TopPairs />
            <MarketOverview />
            <LiquidityPools />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  XpSwap
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The leading decentralized exchange on Xphere blockchain,
                providing secure and efficient token swapping.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Swap
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Liquidity
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Farming
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    SDK
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Bug Bounty
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 XpSwap. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      <WalletConnect
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
